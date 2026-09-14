import * as THREE from 'three';
import wavesUrl from '../../assets/audio/waves-source.mp3?url';
import carEngineLowUrl from '../../assets/audio/car-engine-low.wav?url';
import carEngineMidUrl from '../../assets/audio/car-engine-mid.wav?url';
import carEngineHighUrl from '../../assets/audio/car-engine-high.wav?url';

type Track = {
  media: HTMLAudioElement;
  sound: THREE.Audio | THREE.PositionalAudio;
};

type EngineTrack = Track & {
  media: HTMLAudioElement;
  sound: THREE.PositionalAudio;
  baseRate: number;
  volumeScale: number;
  currentRate: number;
  currentVolume: number;
};

const engineUrls = [carEngineLowUrl, carEngineMidUrl, carEngineHighUrl];

function createHornBuffer(context: AudioContext) {
  const duration = 0.48;
  const sampleCount = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const samples = buffer.getChannelData(0);

  for (let index = 0; index < sampleCount; index++) {
    const time = index / context.sampleRate;
    const attack = Math.min(1, time / 0.025);
    const release = Math.min(1, (duration - time) / 0.11);
    const envelope = attack * release;
    const wobble = Math.sin(time * Math.PI * 2 * 5) * 2.2;
    const dualTone = Math.sin(time * Math.PI * 2 * (349 + wobble))
      + Math.sin(time * Math.PI * 2 * (440 + wobble)) * 0.72;
    samples[index] = Math.tanh(dualTone * 1.35) * envelope * 0.48;
  }
  return buffer;
}

function createStreamingMedia(url: string) {
  const media = document.createElement('audio');
  media.crossOrigin = 'anonymous';
  media.loop = true;
  media.preload = 'metadata';
  media.src = url;
  media.setAttribute('playsinline', '');
  return media;
}

export function createCoastAudio(camera: THREE.Camera, carAnchors: THREE.Object3D[]) {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const tracks: Track[] = [];
  const engineTracks: EngineTrack[] = [];
  const wavesMedia = createStreamingMedia(wavesUrl);
  const waves = new THREE.Audio(listener);
  waves.setMediaElementSource(wavesMedia);
  waves.setVolume(0.22);
  camera.add(waves);
  tracks.push({ media: wavesMedia, sound: waves });

  const hornBuffer = createHornBuffer(listener.context);
  const horns = carAnchors.map((anchor) => {
    const horn = new THREE.PositionalAudio(listener);
    horn.setBuffer(hornBuffer);
    horn.setDistanceModel('inverse');
    horn.setRefDistance(9);
    horn.setRolloffFactor(0.75);
    horn.setVolume(0.78);
    anchor.add(horn);
    return horn;
  });

  carAnchors.forEach((anchor, index) => {
    const media = createStreamingMedia(engineUrls[index % engineUrls.length]);
    const baseRate = [0.92, 1, 1.08, 0.96, 1.04, 1.12][index] ?? 1;
    media.playbackRate = baseRate * 0.84;
    media.preservesPitch = false;
    media.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(media.duration) && media.duration > 0) {
        media.currentTime = index < engineUrls.length ? 0 : media.duration * 0.47;
      }
    }, { once: true });

    const engine = new THREE.PositionalAudio(listener);
    engine.setMediaElementSource(media);
    engine.setDistanceModel('inverse');
    engine.setRefDistance(8.5);
    engine.setRolloffFactor(0.8);
    engine.setVolume(0.008);
    anchor.add(engine);
    tracks.push({ media, sound: engine });
    engineTracks.push({
      media,
      sound: engine,
      baseRate,
      volumeScale: 1 + (index % 3) * 0.08,
      currentRate: media.playbackRate,
      currentVolume: 0.008,
    });
  });

  let enabled = true;
  let pageVisible = !document.hidden;
  let revision = 0;
  let lastWaveVolume = 0.22;
  let lastProgress = 0;
  let movementAmount = 0;

  const pauseAll = () => tracks.forEach(({ media }) => media.pause());
  const syncPlayback = async () => {
    const request = ++revision;
    if (!enabled || !pageVisible) {
      pauseAll();
      return enabled;
    }

    try {
      const resumePromise = listener.context.state === 'suspended'
        ? listener.context.resume()
        : Promise.resolve();
      const playPromises = tracks.map(({ media }) => media.play());
      const results = await Promise.allSettled([resumePromise, ...playPromises]);
      if (request !== revision || !enabled || !pageVisible) {
        pauseAll();
        return enabled;
      }
      if (!results.slice(1).some((result) => result.status === 'fulfilled')) pauseAll();
    } catch {
      pauseAll();
    }
    return enabled;
  };
  const retryPlayback = () => (
    tracks.some(({ media }) => media.paused) ? syncPlayback() : Promise.resolve(enabled)
  );

  void syncPlayback();

  return {
    async setEnabled(nextEnabled: boolean) {
      enabled = nextEnabled;
      return syncPlayback();
    },
    setPageVisible(visible: boolean) {
      pageVisible = visible;
      void syncPlayback();
    },
    retryPlayback() {
      return retryPlayback();
    },
    async honk(carIndex: number) {
      if (!enabled || !pageVisible) return;
      await retryPlayback();
      const horn = horns[carIndex];
      if (!horn || listener.context.state !== 'running') return;
      if (horn.isPlaying) horn.stop();
      horn.play();
    },
    update(progress: number, delta: number) {
      const volume = THREE.MathUtils.lerp(0.22, 0.095, progress);
      if (Math.abs(volume - lastWaveVolume) > 0.001) {
        lastWaveVolume = volume;
        waves.setVolume(volume);
      }

      const progressSpeed = Math.abs(progress - lastProgress) / Math.max(delta, 1 / 120);
      lastProgress = progress;
      const targetMovement = THREE.MathUtils.clamp(progressSpeed * 3.4, 0, 1);
      movementAmount = THREE.MathUtils.damp(movementAmount, targetMovement, 7, delta);
      for (let index = 0; index < engineTracks.length; index++) {
        const track = engineTracks[index];
        const nextVolume = (0.008 + movementAmount * 0.13) * track.volumeScale;
        if (Math.abs(nextVolume - track.currentVolume) > 0.001) {
          track.currentVolume = nextVolume;
          track.sound.setVolume(nextVolume);
        }
        const nextRate = track.baseRate * THREE.MathUtils.lerp(0.84, 1.08, movementAmount);
        if (Math.abs(nextRate - track.currentRate) > 0.002) {
          track.currentRate = nextRate;
          track.media.playbackRate = nextRate;
        }
      }
    },
    dispose() {
      enabled = false;
      revision += 1;
      pauseAll();
      tracks.forEach(({ media, sound }) => {
        sound.disconnect();
        sound.removeFromParent();
        media.removeAttribute('src');
        media.load();
      });
      horns.forEach((horn) => {
        if (horn.isPlaying) horn.stop();
        horn.disconnect();
        horn.removeFromParent();
      });
      listener.removeFromParent();
    },
  };
}
