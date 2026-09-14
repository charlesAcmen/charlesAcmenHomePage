import * as THREE from 'three';

export type ViewportProfile = {
  cameraFov: number;
  pixelRatio: number;
  roomCameraRetreat: number;
  touchCapable: boolean;
};

export function getViewportProfile(width: number, height: number): ViewportProfile {
  const aspect = width / Math.max(height, 1);
  const touchCapable = navigator.maxTouchPoints > 0 || window.matchMedia('(any-pointer: coarse)').matches;
  const portraitAmount = 1 - THREE.MathUtils.smoothstep(aspect, 0.48, 1.08);
  const cameraFov = THREE.MathUtils.lerp(touchCapable ? 42 : 38, 72, portraitAmount);
  const roomCameraRetreat = THREE.MathUtils.lerp(0, 3.2, portraitAmount);
  const pixelRatioLimit = touchCapable
    ? (Math.min(width, height) <= 520 ? 1.35 : 1.5)
    : 1.75;

  return {
    cameraFov,
    pixelRatio: Math.min(window.devicePixelRatio, pixelRatioLimit),
    roomCameraRetreat,
    touchCapable,
  };
}
