import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { inkMaterial, whiteMaterial } from './scene-kit';

type CarState = {
  root: THREE.Group;
  body: THREE.Mesh;
  origin: number;
  direction: 1 | -1;
  baseScale: number;
  hoverAmount: number;
};

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
  const hitTargets: THREE.Mesh[] = [];
  const targetMap = new Map<string, number>();
  const raycaster = new THREE.Raycaster();
  let hoveredIndex = -1;
  const layout: Array<[number, number, 1 | -1]> = [
    [-43, 3.75, 1], [-8, 3.75, 1], [30, 3.75, 1],
    [-31, 8.05, -1], [7, 8.05, -1], [43, 8.05, -1],
  ];

  layout.forEach(([x, z, direction], index) => {
    const root = new THREE.Group();
    root.position.set(x, 0.02, z);
    const baseScale = index % 3 === 0 ? 0.88 : 1;
    root.scale.setScalar(baseScale);
    if (direction < 0) root.rotation.y = Math.PI;
    const body = new THREE.Mesh(geometry, whiteMaterial);
    body.userData.carIndex = index;
    root.add(body);
    const outline = new THREE.LineSegments(edges, inkMaterial);
    outline.renderOrder = 4;
    root.add(outline);
    parent.add(root);
    cars.push({ root, body, origin: x, direction, baseScale, hoverAmount: 0 });
    hitTargets.push(body);
    targetMap.set(body.uuid, index);
  });

  return {
    audioAnchors: cars.map((car) => car.root),
    updatePointer(camera: THREE.Camera, pointer: THREE.Vector2, interactionEnabled: boolean) {
      if (!interactionEnabled) {
        hoveredIndex = -1;
        return false;
      }
      camera.updateMatrixWorld();
      hitTargets.forEach((target) => target.updateWorldMatrix(true, false));
      raycaster.setFromCamera(pointer, camera);
      const intersection = raycaster.intersectObjects(hitTargets, false)[0];
      hoveredIndex = intersection ? targetMap.get(intersection.object.uuid) ?? -1 : -1;
      return hoveredIndex >= 0;
    },
    activateHovered() {
      return hoveredIndex >= 0 ? hoveredIndex : null;
    },
    animate(progress: number, delta: number) {
      cars.forEach((car, index) => {
        const distance = progress * (82 + (index % 3) * 9);
        car.root.position.x = wrap(car.origin + car.direction * distance, -57, 57);
        car.hoverAmount = THREE.MathUtils.damp(car.hoverAmount, index === hoveredIndex ? 1 : 0, 12, delta);
        const scale = car.baseScale * (1 + car.hoverAmount * 0.09);
        car.root.scale.setScalar(scale);
        car.root.position.y = 0.02 + car.hoverAmount * 0.08;
      });
    },
  };
}
