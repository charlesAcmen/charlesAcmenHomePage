import * as THREE from 'three';
import { buildCoast } from './model';

type ProgressListener = (progress: number) => void;

export function createCoastExperience(container: HTMLDivElement, onProgress: ProgressListener) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfffefd);
  scene.fog = new THREE.Fog(0xfffefd, 62, 130);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 190);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0xfffefd, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const world = buildCoast();
  scene.add(world.root);
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 11.3, 88),
    new THREE.Vector3(0, 9.4, 66),
    new THREE.Vector3(0, 7.3, 43),
    new THREE.Vector3(0, 5.7, 25),
    new THREE.Vector3(0, 4.6, 13),
  ]);
  const cameraTarget = new THREE.Vector3(0, 3.1, -3.7);
  const lookAt = new THREE.Vector3();
  const pointer = new THREE.Vector2();
  let targetProgress = 0;
  let currentProgress = 0;
  let lastReported = -1;
  let rafId = 0;
  let pointerStartY = 0;
  let pointerStartProgress = 0;
  let dragging = false;
  let pointerInside = false;
  let pointerDirty = true;
  let lastFrameTime = 0;
  let running = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));

  const publishProgress = () => {
    const rounded = Math.round(currentProgress * 100) / 100;
    if (rounded !== lastReported) { lastReported = rounded; onProgress(rounded); document.documentElement.style.setProperty('--journey', rounded.toString()); }
  };
  const resize = () => {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  };
  const onWheel = (event: WheelEvent) => {
    const target = event.target;
    if (target instanceof Element && target.closest('.site-index.is-open, .journey-control')) return;
    event.preventDefault();
    targetProgress = clamp(targetProgress + event.deltaY * 0.00048);
  };
  const onPointerMove = (event: PointerEvent) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 + 1;
    pointerInside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    pointerDirty = true;
    if (dragging) targetProgress = clamp(pointerStartProgress + (pointerStartY - event.clientY) / Math.max(window.innerHeight * 0.75, 1));
  };
  const onPointerLeave = () => {
    pointerInside = false;
    pointerDirty = true;
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') return;
    dragging = true; pointerStartY = event.clientY; pointerStartProgress = targetProgress;
    renderer.domElement.setPointerCapture(event.pointerId);
  };
  const onPointerUp = (event: PointerEvent) => {
    dragging = false;
    if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') targetProgress = clamp(targetProgress + 0.08);
    if (event.key === 'ArrowUp' || event.key === 'PageUp') targetProgress = clamp(targetProgress - 0.08);
    if (event.key === 'Home') targetProgress = 0;
    if (event.key === 'End') targetProgress = 1;
  };
  const onClick = () => world.activateHovered();
  const onVisibilityChange = () => {
    running = !document.hidden;
    if (running && rafId === 0) {
      lastFrameTime = performance.now();
      rafId = requestAnimationFrame(animate);
    }
  };
  const animate = (time: number) => {
    if (!running) { rafId = 0; return; }
    const delta = Math.min((time - lastFrameTime) / 1000 || 1 / 60, 1 / 30);
    lastFrameTime = time;
    const previousProgress = currentProgress;
    currentProgress = reducedMotion ? targetProgress : THREE.MathUtils.damp(currentProgress, targetProgress, 4.4, delta);
    cameraPath.getPointAt(currentProgress, camera.position);
    lookAt.copy(cameraTarget);
    camera.lookAt(lookAt);
    const cameraMoved = Math.abs(currentProgress - previousProgress) > 0.00001;
    if (pointerDirty || cameraMoved) {
      const hoveringCard = world.updatePointer(camera, pointer, pointerInside && currentProgress > 0.68);
      renderer.domElement.style.cursor = hoveringCard ? 'pointer' : dragging ? 'grabbing' : 'grab';
      pointerDirty = false;
    }
    world.animate(time * 0.001, delta, currentProgress);
    renderer.render(scene, camera);
    publishProgress();
    rafId = requestAnimationFrame(animate);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibilityChange);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerUp);
  renderer.domElement.addEventListener('pointerleave', onPointerLeave);
  renderer.domElement.addEventListener('click', onClick);
  resize();
  lastFrameTime = performance.now();
  rafId = requestAnimationFrame(animate);

  return {
    setProgress(value: number) { targetProgress = clamp(value); if (reducedMotion) currentProgress = targetProgress; },
    dispose() {
      cancelAnimationFrame(rafId); observer.disconnect();
      window.removeEventListener('wheel', onWheel); window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown); renderer.domElement.removeEventListener('pointerup', onPointerUp); renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave); renderer.domElement.removeEventListener('click', onClick);
      document.documentElement.style.removeProperty('--journey');
      world.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
