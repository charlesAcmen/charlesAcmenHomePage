import * as THREE from 'three';

export type ViewportProfile = {
  cameraFov: number;
  pixelRatio: number;
  touchCapable: boolean;
};

export function getViewportProfile(width: number, height: number): ViewportProfile {
  const aspect = width / Math.max(height, 1);
  const touchCapable = navigator.maxTouchPoints > 0 || window.matchMedia('(any-pointer: coarse)').matches;
  const portraitAmount = THREE.MathUtils.clamp((1.12 - aspect) / 0.56, 0, 1);
  const cameraFov = THREE.MathUtils.lerp(touchCapable ? 41 : 38, 60, portraitAmount);
  const pixelRatioLimit = touchCapable
    ? (Math.min(width, height) <= 520 ? 1.35 : 1.5)
    : 1.75;

  return {
    cameraFov,
    pixelRatio: Math.min(window.devicePixelRatio, pixelRatioLimit),
    touchCapable,
  };
}
