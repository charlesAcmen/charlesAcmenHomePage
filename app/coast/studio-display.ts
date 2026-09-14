import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { box, cyanMaterial, nightMaterial, pinkMaterial, violetMaterial } from './scene-kit';

const VIDEO_ID = 'EiQEBYDox_k';
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const PLAYER_ORIGIN = 'https://www.youtube.com';
const PLAYER_WIDTH = 640;
const PLAYER_HEIGHT = 360;
export const DISPLAY_CENTER_Z = -10.35;
export const DISPLAY_OPENING_WIDTH = 7.3;

function createPlayerUrl() {
  const origin = encodeURIComponent(window.location.origin);
  return `${PLAYER_ORIGIN}/embed/${VIDEO_ID}?rel=0&playsinline=1&enablejsapi=1&origin=${origin}`;
}

export function createStudioDisplay(parent: THREE.Object3D) {
  const display = new THREE.Group();
  display.position.set(10.2, 5.65, DISPLAY_CENTER_Z);
  display.rotation.y = -Math.PI / 2;
  parent.add(display);

  const screenWidth = 6.35;
  const screenHeight = screenWidth * (PLAYER_HEIGHT / PLAYER_WIDTH);
  const frameWidth = screenWidth + 0.58;
  const frameHeight = screenHeight + 0.58;

  box(display, [frameWidth, frameHeight, 0.22], [0, 0, -0.04], nightMaterial);
  box(display, [frameWidth + 0.16, 0.14, 0.24], [0, frameHeight / 2, 0.04], cyanMaterial);
  box(display, [frameWidth + 0.16, 0.14, 0.24], [0, -frameHeight / 2, 0.04], pinkMaterial);
  box(display, [0.14, frameHeight, 0.24], [-frameWidth / 2, 0, 0.04], violetMaterial);
  box(display, [0.14, frameHeight, 0.24], [frameWidth / 2, 0, 0.04], violetMaterial);
  box(display, [1.2, 0.32, 0.18], [0, -frameHeight / 2 - 0.18, 0.03], violetMaterial);

  const screen = document.createElement('div');
  screen.className = 'studio-video-screen';
  screen.style.width = `${PLAYER_WIDTH}px`;
  screen.style.height = `${PLAYER_HEIGHT}px`;

  const player = document.createElement('iframe');
  player.title = 'Grand Theft Auto VI: Official Cover Art Reveal';
  player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  player.allowFullscreen = true;
  player.tabIndex = -1;
  screen.appendChild(player);

  const openOnYouTube = document.createElement('a');
  openOnYouTube.className = 'studio-video-link';
  openOnYouTube.href = VIDEO_URL;
  openOnYouTube.target = '_blank';
  openOnYouTube.rel = 'noreferrer';
  openOnYouTube.textContent = 'OPEN ON YOUTUBE ↗';
  openOnYouTube.setAttribute('aria-label', '在 YouTube 打开视频');
  openOnYouTube.tabIndex = -1;
  screen.appendChild(openOnYouTube);

  const screenObject = new CSS3DObject(screen);
  screen.style.pointerEvents = 'none';
  screenObject.position.z = 0.095;
  screenObject.scale.setScalar(screenWidth / PLAYER_WIDTH);
  screenObject.visible = false;
  display.add(screenObject);

  const interactionTarget = new THREE.Mesh(
    new THREE.PlaneGeometry(screenWidth, screenHeight),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  interactionTarget.position.z = 0.105;
  display.add(interactionTarget);

  let playerLoaded = false;
  let interactive = false;
  let hovered = false;
  const raycaster = new THREE.Raycaster();

  return {
    update(progress: number) {
      const visibility = THREE.MathUtils.smoothstep(progress, 0.42, 0.72);
      screenObject.visible = visibility > 0.001;
      screen.style.opacity = visibility.toFixed(3);

      if (!playerLoaded && progress > 0.56) {
        playerLoaded = true;
        player.src = createPlayerUrl();
      }

      const nextInteractive = progress > 0.8;
      if (nextInteractive !== interactive) {
        interactive = nextInteractive;
        screen.style.pointerEvents = interactive ? 'auto' : 'none';
        player.tabIndex = interactive ? 0 : -1;
        openOnYouTube.tabIndex = interactive ? 0 : -1;
      }
    },
    updatePointer(camera: THREE.Camera, pointer: THREE.Vector2, interactionEnabled: boolean) {
      hovered = false;
      if (!interactionEnabled) return false;
      camera.updateMatrixWorld();
      interactionTarget.updateWorldMatrix(true, false);
      raycaster.setFromCamera(pointer, camera);
      hovered = Boolean(raycaster.intersectObject(interactionTarget, false)[0]);
      return hovered;
    },
    activateHovered() {
      if (!hovered || !playerLoaded) return false;
      player.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
        PLAYER_ORIGIN,
      );
      return true;
    },
    dispose() {
      player.src = 'about:blank';
      screenObject.removeFromParent();
      screen.remove();
    },
  };
}
