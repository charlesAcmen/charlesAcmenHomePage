import * as THREE from 'three';
import { box, windowFrame } from './scene-kit';

export function addDecoBuilding(parent: THREE.Object3D, x: number, width: number, height: number, style: number) {
  const root = new THREE.Group();
  root.position.x = x;
  parent.add(root);
  box(root, [width, height, 6], [0, height / 2, -3.25]);
  box(root, [width + 0.3, 0.26, 6.25], [0, 0.13, -3.15]);

  if (style === 0) {
    box(root, [width * 0.36, 1.25, 0.35], [0, height + 0.62, -0.08]);
    box(root, [width + 0.42, 0.25, 0.58], [0, height * 0.73, 0.08]);
    for (const wx of [-0.28, 0, 0.28]) box(root, [0.1, height * 0.54, 0.28], [wx * width, height * 0.66, 0.08]);
  } else if (style === 1) {
    box(root, [width + 0.6, 0.2, 1.15], [0, height * 0.57, 0.34]);
    box(root, [width * 0.16, 1.2, 0.36], [0, height + 0.6, -0.06]);
    for (const wx of [-0.3, 0.3]) box(root, [0.18, height * 0.52, 0.38], [wx * width, height * 0.7, 0.07]);
  } else {
    const tower = box(root, [width * 0.27, height + 1.3, 0.45], [-width * 0.23, (height + 1.3) / 2, 0.12]);
    tower.rotation.z = -0.018;
    for (let level = 1; level < Math.floor(height / 2.1); level++) box(root, [width + 0.5, 0.18, 0.72], [0, level * 2.05, 0.2]);
  }

  const levels = Math.max(2, Math.floor(height / 2));
  for (let level = 0; level < levels; level++) {
    const wy = 1.15 + level * 1.78;
    if (wy > height - 0.6) continue;
    const columns = width > 9 ? 3 : 2;
    for (let column = 0; column < columns; column++) {
      const wx = ((column + 0.5) / columns - 0.5) * width * 0.76;
      windowFrame(root, wx, wy, 0.012, width * 0.18, 0.82);
    }
  }
  box(root, [width * 0.76, 0.28, 1.05], [0, 1.98, 0.35]);
}
