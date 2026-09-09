import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { box, cyanMaterial, nightMaterial, pinkMaterial, violetMaterial } from './scene-kit';

const VIDEO_ID = 'EiQEBYDox_k';
const PLAYER_WIDTH = 640;
const PLAYER_HEIGHT = 360;

function createPlayerUrl() {
  const origin = encodeURIComponent(window.location.origin);
  return `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&playsinline=1&enablejsapi=1&origin=${origin}`;
}

export function createStudioDisplay(parent: THREE.Object3D) {
  box(parent, [0.32, 1.08, 0.9], [10.28, 3.45, -7.3], violetMaterial);
  box(parent, [1.5, 0.18, 0.18], [9.68, 3.45, -7.3], nightMaterial);

  const display = new THREE.Group();
  display.position.set(8.92, 3.45, -7.3);
  display.rotation.y = -1.12;
  parent.add(display);

  const screenWidth = 6.2;
  const screenHeight = screenWidth * (PLAYER_HEIGHT / PLAYER_WIDTH);
  const frameWidth = screenWidth + 0.58;
  const frameHeight = screenHeight + 0.58;

  box(display, [frameWidth, frameHeight, 0.18], [0, 0, -0.04], nightMaterial);
  box(display, [frameWidth + 0.16, 0.14, 0.24], [0, frameHeight / 2, 0.04], cyanMaterial);
  box(display, [frameWidth + 0.16, 0.14, 0.24], [0, -frameHeight / 2, 0.04], pinkMaterial);
  box(display, [0.14, frameHeight, 0.24], [-frameWidth / 2, 0, 0.04], violetMaterial);
  box(display, [0.14, frameHeight, 0.24], [frameWidth / 2, 0, 0.04], violetMaterial);
  box(display, [1.2, 0.38, 0.52], [0, -frameHeight / 2 - 0.28, -0.24], violetMaterial);

  const screen = document.createElement('div');
  screen.className = 'studio-video-screen';
  screen.style.width = `${PLAYER_WIDTH}px`;
  screen.style.height = `${PLAYER_HEIGHT}px`;

  const player = document.createElement('iframe');
  player.title = 'Grand Theft Auto VI: Official Cover Art Reveal';
  player.loading = 'lazy';
  player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  player.allowFullscreen = true;
  player.tabIndex = -1;
  screen.appendChild(player);

  const screenObject = new CSS3DObject(screen);
  screenObject.position.z = 0.075;
  screenObject.scale.setScalar(screenWidth / PLAYER_WIDTH);
  screenObject.visible = false;
  display.add(screenObject);

  let playerLoaded = false;
  let interactive = false;

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
      }
    },
    dispose() {
      player.src = 'about:blank';
      screenObject.removeFromParent();
      screen.remove();
    },
  };
}
