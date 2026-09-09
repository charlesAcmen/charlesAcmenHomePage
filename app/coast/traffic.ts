import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { inkMaterial, whiteMaterial } from './scene-kit';

type CarState = { root: THREE.Group; origin: number; direction: 1 | -1 };

function translated(geometry: THREE.BufferGeometry, x: number, y: number, z: number, rotationX = 0) {
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(rotationX, 0, 0));
  matrix.compose(new THREE.Vector3(x, y, z), rotation, new THREE.Vector3(1, 1, 1));
  geometry.applyMatrix4(matrix);
  return geometry;
}

function createCarGeometry() {
  const pieces: THREE.BufferGeometry[] = [
    translated(new THREE.BoxGeometry(3.35, 0.48, 1.42), 0, 0.54, 0),
    translated(new THREE.BoxGeometry(2.12, 0.38, 1.25), -0.2, 0.96, 0),
    translated(new THREE.BoxGeometry(0.14, 0.65, 1.2), 0.42, 1.28, 0),
  ];
  for (const x of [-1.03, 1.03]) {
    for (const z of [-0.72, 0.72]) {
      pieces.push(translated(new THREE.CylinderGeometry(0.33, 0.33, 0.17, 10), x, 0.34, z, Math.PI / 2));
    }
  }
  const merged = mergeGeometries(pieces, false);
  pieces.forEach((piece) => piece.dispose());
  if (!merged) throw new Error('Unable to assemble coast traffic geometry.');
  return merged;
}

function wrap(value: number, min: number, max: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

export function createTraffic(parent: THREE.Object3D) {
  const geometry = createCarGeometry();
  const edges = new THREE.EdgesGeometry(geometry, 20);
  const cars: CarState[] = [];
  const layout: Array<[number, number, 1 | -1]> = [
    [-43, 3.75, 1], [-8, 3.75, 1], [30, 3.75, 1],
    [-31, 8.05, -1], [7, 8.05, -1], [43, 8.05, -1],
  ];

  layout.forEach(([x, z, direction], index) => {
    const root = new THREE.Group();
    root.position.set(x, 0.02, z);
    root.scale.setScalar(index % 3 === 0 ? 0.88 : 1);
    if (direction < 0) root.rotation.y = Math.PI;
    root.add(new THREE.Mesh(geometry, whiteMaterial));
    const outline = new THREE.LineSegments(edges, inkMaterial);
    outline.renderOrder = 4;
    root.add(outline);
    parent.add(root);
    cars.push({ root, origin: x, direction });
  });

  return {
    audioAnchors: cars.map((car) => car.root),
    animate(progress: number) {
      cars.forEach((car, index) => {
        const distance = progress * (82 + (index % 3) * 9);
        car.root.position.x = wrap(car.origin + car.direction * distance, -57, 57);
      });
    },
  };
}
