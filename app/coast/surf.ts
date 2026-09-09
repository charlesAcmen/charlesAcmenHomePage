import * as THREE from 'three';
import { box, faintInkMaterial } from './scene-kit';

type SurfBand = {
  root: THREE.Group;
  material: THREE.LineBasicMaterial;
};

function smoothstep(edge0: number, edge1: number, value: number) {
  const normalized = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}

function createWaveSegment(x: number, seed: number, material: THREE.Material) {
  const points = Array.from({ length: 13 }, (_, index) => {
    const step = index / 12;
    return new THREE.Vector3(
      x + step * 14.5,
      Math.sin(step * Math.PI * 2.4 + seed) * 0.035,
      Math.sin(step * Math.PI * 3.2 + seed * 0.7) * 0.2,
    );
  });
  const wave = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
  wave.renderOrder = 4;
  return wave;
}

export function createSurf(parent: THREE.Object3D) {
  box(parent, [120, 0.12, 78], [0, -0.04, 63.5]);

  for (let row = 0; row < 12; row++) {
    const z = 48 + row * 4.5;
    for (let segment = 0; segment < 6; segment++) {
      const x = -52 + segment * 18 + (row % 2) * 4;
      const wave = createWaveSegment(x, row + segment * 0.34, faintInkMaterial);
      wave.position.z = z;
      parent.add(wave);
    }
  }

  const bands: SurfBand[] = Array.from({ length: 5 }, (_, bandIndex) => {
    const root = new THREE.Group();
    const material = new THREE.LineBasicMaterial({
      color: 0x181818,
      transparent: true,
      opacity: 0,
    });
    for (let segment = 0; segment < 7; segment++) {
      root.add(createWaveSegment(-58 + segment * 17.5, bandIndex + segment * 0.31, material));
    }
    parent.add(root);
    return { root, material };
  });

  const animate = (progress: number) => {
    bands.forEach(({ root, material }, index) => {
      const phase = (progress * 3.2 + index / bands.length) % 1;
      const approach = smoothstep(0, 1, phase);
      const breaking = smoothstep(0.58, 0.9, phase);
      const crest = Math.sin(breaking * Math.PI);
      const fadeIn = smoothstep(0, 0.12, phase);
      const fadeOut = 1 - smoothstep(0.8, 1, phase);

      root.position.set(0, 0.07 + crest * 0.68, THREE.MathUtils.lerp(48, 29.35, approach));
      root.rotation.x = -crest * 0.19;
      root.scale.x = 0.96 + breaking * 0.08;
      material.opacity = (0.24 + crest * 0.58) * fadeIn * fadeOut;
    });
  };

  animate(0);
  return { animate };
}
