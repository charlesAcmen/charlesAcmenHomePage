import * as THREE from 'three';
import {
  box,
  coralMaterial,
  cyanMaterial,
  makeTextSprite,
  pinkMaterial,
  violetMaterial,
} from './scene-kit';
import { createProjectWall } from './project-wall';
import { createSocialWall } from './social-wall';
import { createStudioDisplay, DISPLAY_CENTER_Z, DISPLAY_OPENING_WIDTH } from './studio-display';

export function createStudio(parent: THREE.Object3D) {
  const studio = new THREE.Group();
  parent.add(studio);
  const width = 21;
  const height = 10.4;
  const depth = 20.5;
  const frontZ = 0.05;
  const backZ = frontZ - depth;
  const centerZ = (frontZ + backZ) / 2;

  box(studio, [width, 0.28, depth], [0, 0.14, centerZ]);
  box(studio, [width, 0.32, depth], [0, height, centerZ]);
  box(studio, [0.34, height, depth], [-width / 2, height / 2, centerZ]);
  const openingNearZ = DISPLAY_CENTER_Z + DISPLAY_OPENING_WIDTH / 2;
  const openingFarZ = DISPLAY_CENTER_Z - DISPLAY_OPENING_WIDTH / 2;
  box(studio, [0.34, height, frontZ - openingNearZ], [width / 2, height / 2, (frontZ + openingNearZ) / 2]);
  box(studio, [0.34, height, openingFarZ - backZ], [width / 2, height / 2, (openingFarZ + backZ) / 2]);
  box(studio, [width, height, 0.28], [0, height / 2, backZ], violetMaterial);
  box(studio, [width - 0.6, 0.12, depth - 0.4], [0, 0.36, centerZ], coralMaterial);
  box(studio, [0.1, height - 0.7, depth - 0.5], [-10.22, height / 2, centerZ], pinkMaterial);
  box(studio, [0.1, height - 0.7, depth - 0.5], [10.22, height / 2, centerZ], cyanMaterial);

  box(studio, [0.28, height - 0.65, 0.55], [-10.25, height / 2, 0.18]);
  box(studio, [0.28, height - 0.65, 0.55], [10.25, height / 2, 0.18]);
  box(studio, [width, 0.28, 0.6], [0, height - 0.13, 0.18]);

  const sign = makeTextSprite('ACMEN', 'CHARLES');
  sign.position.set(0, 8.55, 0.58);
  sign.scale.set(5.2, 1.58, 1);
  studio.add(sign);

  return {
    root: studio,
    socialWall: createSocialWall(studio, backZ + 0.5, 5.6),
    projectWall: createProjectWall(studio),
    display: createStudioDisplay(studio),
  };
}
