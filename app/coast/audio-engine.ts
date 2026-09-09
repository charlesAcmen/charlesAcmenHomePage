import * as THREE from 'three';
import wavesUrl from '../../assets/audio/waves-source.mp3?url';
import carEngineLowUrl from '../../assets/audio/car-engine-low.wav?url';
import carEngineMidUrl from '../../assets/audio/car-engine-mid.wav?url';
import carEngineHighUrl from '../../assets/audio/car-engine-high.wav?url';

type Track = {
  media: HTMLAudioElement;
  sound: THREE.Audio | THREE.PositionalAudio;
};

const engineUrls = [carEngineLowUrl, carEngineMidUrl, carEngineHighUrl];

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
  const wavesMedia = createStreamingMedia(wavesUrl);
  const waves = new THREE.Audio(listener);
  waves.setMediaElementSource(wavesMedia);
  waves.setVolume(0.22);
  camera.add(waves);
  tracks.push({ media: wavesMedia, sound: waves });

  carAnchors.forEach((anchor, index) => {
    const media = createStreamingMedia(engineUrls[index % engineUrls.length]);
    media.playbackRate = [0.92, 1, 1.08, 0.96, 1.04, 1.12][index] ?? 1;
    media.preservesPitch = false;
    media.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(media.duration) && media.duration > 0) {
        media.currentTime = index < engineUrls.length ? 0 : media.duration * 0.47;
      }
    }, { once: true });

    const engine = new THREE.PositionalAudio(listener);
    engine.setMediaElementSource(media);
    engine.setDistanceModel('inverse');
    engine.setRefDistance(4.8);
    engine.setRolloffFactor(1.35);
    engine.setVolume(0.115 + (index % 3) * 0.012);
    anchor.add(engine);
    tracks.push({ media, sound: engine });
  });

  let enabled = false;
  let pageVisible = !document.hidden;
  let revision = 0;
  let lastWaveVolume = 0.22;

  const pauseAll = () => tracks.forEach(({ media }) => media.pause());
  const syncPlayback = async () => {
    const request = ++revision;
    if (!enabled || !pageVisible) {
      pauseAll();
      return enabled;
    }

    try {
      if (listener.context.state === 'suspended') await listener.context.resume();
      if (request !== revision || !enabled || !pageVisible) return enabled;
      const results = await Promise.allSettled(tracks.map(({ media }) => media.play()));
      if (request !== revision || !enabled || !pageVisible) {
        pauseAll();
        return enabled;
      }
      if (!results.some((result) => result.status === 'fulfilled')) {
        enabled = false;
        pauseAll();
      }
    } catch {
      enabled = false;
      pauseAll();
    }
    return enabled;
  };

  return {
    async setEnabled(nextEnabled: boolean) {
      enabled = nextEnabled;
      return syncPlayback();
    },
    setPageVisible(visible: boolean) {
      pageVisible = visible;
      void syncPlayback();
    },
    update(progress: number) {
      const volume = THREE.MathUtils.lerp(0.22, 0.095, progress);
      if (Math.abs(volume - lastWaveVolume) > 0.001) {
        lastWaveVolume = volume;
        waves.setVolume(volume);
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
      listener.removeFromParent();
    },
  };
}
