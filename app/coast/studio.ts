import * as THREE from 'three';
import {
  box,
  coralMaterial,
  cyanMaterial,
  makeTextSprite,
  pinkMaterial,
  violetMaterial,
} from './scene-kit';
import { createSocialWall } from './social-wall';

export function createStudio(parent: THREE.Object3D) {
  const studio = new THREE.Group();
  parent.add(studio);
  const width = 21;
  const height = 6.7;
  const depth = 7.5;

  box(studio, [width, 0.28, depth], [0, 0.14, -3.7]);
  box(studio, [width, 0.32, depth], [0, height, -3.7]);
  box(studio, [0.34, height, depth], [-width / 2, height / 2, -3.7]);
  box(studio, [0.34, height, depth], [width / 2, height / 2, -3.7]);
  box(studio, [width, height, 0.28], [0, height / 2, -7.45], violetMaterial);
  box(studio, [width - 0.6, 0.12, depth - 0.4], [0, 0.36, -3.72], coralMaterial);
  box(studio, [0.1, height - 0.7, depth - 0.5], [-10.22, height / 2, -3.65], pinkMaterial);
  box(studio, [0.1, height - 0.7, depth - 0.5], [10.22, height / 2, -3.65], cyanMaterial);

  box(studio, [0.28, height - 0.65, 0.55], [-10.25, height / 2, 0.18]);
  box(studio, [0.28, height - 0.65, 0.55], [10.25, height / 2, 0.18]);
  box(studio, [width, 0.28, 0.6], [0, height - 0.13, 0.18]);

  const sign = makeTextSprite('ACMEN', 'CHARLES');
  sign.position.set(0, 5.47, 0.58);
  sign.scale.set(5.2, 1.58, 1);
  studio.add(sign);

  return { root: studio, socialWall: createSocialWall(studio) };
}
