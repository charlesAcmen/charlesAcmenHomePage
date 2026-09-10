import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { createCoastAudio } from './audio-engine';
import { buildCoast } from './model';
import { createTouchControls } from './touch-controls';
import { getViewportProfile } from './viewport-profile';

type ProgressListener = (progress: number) => void;
type LookModeListener = (locked: boolean) => void;

export function createCoastExperience(container: HTMLDivElement, onProgress: ProgressListener, onLookModeChange: LookModeListener) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfffefd);
  scene.fog = new THREE.Fog(0xfffefd, 62, 130);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 190);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0xfffefd, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);
  const cssRenderer = new CSS3DRenderer();
  cssRenderer.domElement.className = 'coast-css3d';
  container.appendChild(cssRenderer.domElement);

  const world = buildCoast();
  scene.add(world.root);
  const audio = createCoastAudio(camera, world.audioAnchors);
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 11.3, 88),
    new THREE.Vector3(0, 9.4, 66),
    new THREE.Vector3(0, 7.3, 43),
    new THREE.Vector3(0, 5.7, 25),
    new THREE.Vector3(0, 5.95, -9.6),
  ]);
  const cameraTarget = new THREE.Vector3(0, 5.65, -19.6);
  const lookAt = new THREE.Vector3();
  const lookRotation = new THREE.Euler(0, 0, 0, 'YXZ');
  const pointer = new THREE.Vector2();
  const touchPickOffsets: ReadonlyArray<readonly [number, number]> = [
    [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1],
    [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7],
  ];
  let targetProgress = 0;
  let currentProgress = 0;
  let lastReported = -1;
  let rafId = 0;
  let pointerInside = false;
  let pointerDirty = true;
  let lastFrameTime = 0;
  let running = true;
  let pointerLocked = false;
  let preserveLook = false;
  let lookYaw = 0;
  let lookPitch = 0;
  let appliedPixelRatio = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const wrapYaw = (value: number) => THREE.MathUtils.euclideanModulo(value + Math.PI, Math.PI * 2) - Math.PI;

  const publishProgress = () => {
    const rounded = Math.round(currentProgress * 100) / 100;
    if (rounded !== lastReported) { lastReported = rounded; onProgress(rounded); document.documentElement.style.setProperty('--journey', rounded.toString()); }
  };
  const resize = () => {
    const { clientWidth, clientHeight } = container;
    const viewport = getViewportProfile(clientWidth, clientHeight);
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.fov = viewport.cameraFov;
    camera.updateProjectionMatrix();
    if (Math.abs(viewport.pixelRatio - appliedPixelRatio) > 0.01) {
      appliedPixelRatio = viewport.pixelRatio;
      renderer.setPixelRatio(appliedPixelRatio);
    }
    renderer.setSize(clientWidth, clientHeight, false);
    cssRenderer.setSize(clientWidth, clientHeight);
    container.dataset.input = viewport.touchCapable ? 'touch' : 'pointer';
  };
  const setPointerFromClient = (clientX: number, clientY: number) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1;
    pointer.y = -((clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 + 1;
    return bounds;
  };
  const onWheel = (event: WheelEvent) => {
    const target = event.target;
    if (target instanceof Element && target.closest('.site-index.is-open, .journey-control')) return;
    event.preventDefault();
    void audio.retryPlayback();
    targetProgress = clamp(targetProgress + event.deltaY * 0.00048);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') return;
    if (pointerLocked) {
      lookYaw -= event.movementX * 0.0025;
      lookPitch = THREE.MathUtils.clamp(lookPitch - event.movementY * 0.0018, -0.72, 0.72);
      pointerDirty = true;
      return;
    }
    const bounds = setPointerFromClient(event.clientX, event.clientY);
    pointerInside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    pointerDirty = true;
  };
  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') return;
    pointerInside = false;
    pointerDirty = true;
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') return;
    void audio.retryPlayback();
    const isVideoTarget = event.target instanceof Element && Boolean(event.target.closest('.studio-video-screen'));
    if (currentProgress > 0.9 && !isVideoTarget && !world.hasHoveredCard() && !pointerLocked) container.requestPointerLock();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    void audio.retryPlayback();
    if (event.key === 'ArrowDown' || event.key === 'PageDown') targetProgress = clamp(targetProgress + 0.08);
    if (event.key === 'ArrowUp' || event.key === 'PageUp') targetProgress = clamp(targetProgress - 0.08);
    if (event.key === 'Home') targetProgress = 0;
    if (event.key === 'End') targetProgress = 1;
  };
  const onClick = (event: MouseEvent) => {
    if (touchControls.shouldSuppressClick()) return;
    if (event.target instanceof Element && event.target.closest('.studio-video-screen')) return;
    const carIndex = world.activateHovered();
    if (carIndex !== null) void audio.honk(carIndex);
  };
  const onPointerLockChange = () => {
    pointerLocked = document.pointerLockElement === container;
    preserveLook = !pointerLocked;
    if (pointerLocked) {
      pointer.set(0, 0);
      pointerInside = true;
    }
    onLookModeChange(pointerLocked);
    pointerDirty = true;
  };
  const onVisibilityChange = () => {
    running = !document.hidden;
    audio.setPageVisible(running);
    if (running && rafId === 0) {
      lastFrameTime = performance.now();
      rafId = requestAnimationFrame(animate);
    }
  };
  const activateAtTouchPoint = (clientX: number, clientY: number) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    const radius = THREE.MathUtils.clamp(Math.min(bounds.width, bounds.height) * 0.026, 15, 24);
    let activated = false;

    for (const [offsetX, offsetY] of touchPickOffsets) {
      const sampleX = clientX + offsetX * radius;
      const sampleY = clientY + offsetY * radius;
      if (sampleX < bounds.left || sampleX > bounds.right || sampleY < bounds.top || sampleY > bounds.bottom) continue;
      setPointerFromClient(sampleX, sampleY);
      if (!world.updatePointer(camera, pointer, true, currentProgress)) continue;
      const carIndex = world.activateHovered();
      if (carIndex !== null) void audio.honk(carIndex);
      activated = true;
      break;
    }

    if (!activated) world.updatePointer(camera, pointer, false, currentProgress);
    pointerInside = false;
    pointerDirty = true;
  };
  const touchControls = createTouchControls({
    element: container,
    getProgress: () => targetProgress,
    setProgress: (progress) => { targetProgress = clamp(progress); },
    addLookDelta: (deltaX, deltaY) => {
      preserveLook = true;
      lookYaw = wrapYaw(lookYaw - deltaX * 0.0034);
      lookPitch = THREE.MathUtils.clamp(lookPitch - deltaY * 0.0028, -0.72, 0.72);
      pointerInside = false;
      pointerDirty = true;
    },
    activateAt: activateAtTouchPoint,
    onInteraction: () => { void audio.retryPlayback(); },
    shouldIgnoreTarget: (target) => target instanceof Element && Boolean(target.closest('.studio-video-screen')),
  });
  const animate = (time: number) => {
    if (!running) { rafId = 0; return; }
    const delta = Math.min((time - lastFrameTime) / 1000 || 1 / 60, 1 / 30);
    lastFrameTime = time;
    const previousProgress = currentProgress;
    currentProgress = reducedMotion ? targetProgress : THREE.MathUtils.damp(currentProgress, targetProgress, 4.4, delta);
    cameraPath.getPointAt(currentProgress, camera.position);
    lookAt.copy(cameraTarget);
    camera.lookAt(lookAt);
    const roomLook = THREE.MathUtils.smoothstep(currentProgress, 0.76, 0.9);
    if (roomLook > 0.001) {
      if (!pointerLocked && !preserveLook) {
        lookYaw = -pointer.x * 1.38;
        lookPitch = pointer.y * 0.5;
      }
      lookRotation.setFromQuaternion(camera.quaternion, 'YXZ');
      lookRotation.y += lookYaw * roomLook;
      lookRotation.x += lookPitch * roomLook;
      camera.quaternion.setFromEuler(lookRotation);
    }
    const cameraMoved = Math.abs(currentProgress - previousProgress) > 0.00001;
    if (pointerDirty || cameraMoved) {
      const hoveringInteractive = world.updatePointer(camera, pointer, pointerInside, currentProgress);
      container.style.cursor = hoveringInteractive ? 'pointer' : 'grab';
      pointerDirty = false;
    }
    world.animate(time * 0.001, delta, currentProgress);
    audio.update(currentProgress);
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
    publishProgress();
    rafId = requestAnimationFrame(animate);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibilityChange);
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointerleave', onPointerLeave);
  container.addEventListener('click', onClick);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  resize();
  lastFrameTime = performance.now();
  rafId = requestAnimationFrame(animate);

  return {
    setProgress(value: number) {
      targetProgress = clamp(value);
      if (value < 0.76) {
        preserveLook = false;
        lookYaw = 0;
        lookPitch = 0;
      }
      if (reducedMotion) currentProgress = targetProgress;
    },
    setSoundEnabled(enabled: boolean) { return audio.setEnabled(enabled); },
    dispose() {
      cancelAnimationFrame(rafId); observer.disconnect();
      window.removeEventListener('wheel', onWheel); window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointerleave', onPointerLeave); container.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      if (document.pointerLockElement === container) document.exitPointerLock();
      onLookModeChange(false);
      document.documentElement.style.removeProperty('--journey');
      touchControls.dispose(); audio.dispose(); world.dispose(); renderer.dispose(); renderer.domElement.remove(); cssRenderer.domElement.remove();
    },
  };
}
