import * as THREE from 'three';
import { addOutlined, box, cylinder, line, whiteMaterial, windowFrame } from './scene-kit';

export function createPalm(
  parent: THREE.Object3D,
  x: number,
  z: number,
  height: number,
  lean: number,
  animated: THREE.Group[],
) {
  const palm = new THREE.Group();
  palm.position.set(x, 0, z);
  parent.add(palm);
  const trunkPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(lean * 0.24, height * 0.34, 0.08),
    new THREE.Vector3(lean * 0.72, height * 0.7, -0.05),
    new THREE.Vector3(lean, height, 0),
  ]);
  addOutlined(palm, new THREE.TubeGeometry(trunkPath, 12, 0.2, 7, false), whiteMaterial, 18);
  for (let ring = 1; ring < 7; ring++) {
    const point = trunkPath.getPoint(ring / 7);
    const circle = new THREE.EllipseCurve(0, 0, 0.18, 0.18, 0, Math.PI * 2)
      .getPoints(14)
      .map((point2d) => new THREE.Vector3(point2d.x + point.x, point.y, point2d.y + point.z));
    line(palm, circle, true);
  }
  const crown = new THREE.Group();
  crown.position.set(lean, height, 0);
  palm.add(crown);
  for (let leaf = 0; leaf < 9; leaf++) {
    const angle = (leaf / 9) * Math.PI * 2 + 0.16;
    const length = 2.5 + (leaf % 3) * 0.32;
    const frond = addOutlined(crown, createLeafGeometry(length, 0.48, leaf % 2 === 0 ? 0.75 : 0.46), whiteMaterial, 20);
    frond.rotation.y = angle;
    frond.rotation.z = (leaf % 2 === 0 ? -1 : 1) * 0.06;
    const spinePoints = Array.from({ length: 9 }, (_, index) => {
      const t = index / 8;
      return new THREE.Vector3(
        Math.cos(angle) * length * t,
        0.28 * Math.sin(t * Math.PI) - (leaf % 2 ? 0.48 : 0.7) * t * t,
        Math.sin(angle) * length * t,
      );
    });
    line(crown, spinePoints, true);
  }
  animated.push(crown);
}

function createLeafGeometry(length: number, halfWidth: number, drop: number) {
  const positions: number[] = [];
  const indices: number[] = [];
  const segments = 8;
  for (let index = 0; index <= segments; index++) {
    const t = index / segments;
    const x = length * t;
    const y = 0.28 * Math.sin(t * Math.PI) - drop * t * t;
    const width = Math.sin(t * Math.PI) * halfWidth;
    positions.push(x, y, -width, x, y, width);
    if (index < segments) {
      const base = index * 2;
      indices.push(base, base + 2, base + 1, base + 2, base + 3, base + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createBeachDetails(parent: THREE.Object3D) {
  const hut = new THREE.Group();
  hut.position.set(-22, 0, 21);
  parent.add(hut);
  box(hut, [5, 0.32, 3.7], [0, 2, 0]);
  box(hut, [4.4, 2.25, 3.25], [0, 3.1, 0]);
  box(hut, [5.2, 0.24, 4.1], [0, 4.34, 0]);
  for (const x of [-1.85, 1.85]) {
    for (const z of [-1.35, 1.35]) cylinder(hut, [0.1, 0.12], 2, [x, 1, z], 8);
  }
  windowFrame(hut, 0, 3.2, 1.64, 2.35, 0.95);
  line(hut, [
    new THREE.Vector3(-2.7, 0.04, 2.3),
    new THREE.Vector3(-2.1, 2, 1.42),
    new THREE.Vector3(-1.45, 0.04, 2.3),
  ]);

  const umbrellas: Array<[number, number, number]> = [
    [-12, 24, 1.35], [12, 20, 1.6], [22, 26, 1.3], [-33, 29, 1.4],
  ];
  umbrellas.forEach(([x, z, radius], index) => {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    parent.add(group);
    cylinder(group, [0.05, 0.06], 2.35, [0, 1.18, 0], 8);
    const shade = addOutlined(group, new THREE.ConeGeometry(radius, 0.7, 12, 1, true), whiteMaterial, 10);
    shade.position.y = 2.55;
    if (index < 3) {
      const chair = new THREE.Group();
      chair.position.set(radius * 0.75, 0, 0.5);
      chair.rotation.y = -0.4;
      group.add(chair);
      line(chair, [
        new THREE.Vector3(-0.5, 0, 0),
        new THREE.Vector3(-0.32, 0.9, 0),
        new THREE.Vector3(0.46, 0.78, 0),
        new THREE.Vector3(0.5, 0, 0),
      ]);
      for (let stripe = 0; stripe < 4; stripe++) {
        line(chair, [
          new THREE.Vector3(-0.28 + stripe * 0.18, 0.2, 0),
          new THREE.Vector3(-0.2 + stripe * 0.18, 0.8, 0),
        ], true);
      }
    }
  });
}

export function createWater(parent: THREE.Object3D) {
  box(parent, [120, 0.12, 78], [0, -0.04, 63.5]);
  for (let row = 0; row < 18; row++) {
    const z = 31 + row * 3.4;
    for (let segment = 0; segment < 6; segment++) {
      const x0 = -52 + segment * 18 + (row % 2) * 4;
      const points = Array.from({ length: 11 }, (_, index) => (
        new THREE.Vector3(x0 + index * 1.45, 0.05, z + Math.sin(index * 1.1 + row) * 0.22)
      ));
      line(parent, points, true);
    }
  }
}

export function createStreet(parent: THREE.Object3D) {
  line(parent, [new THREE.Vector3(-58, 0.13, 3.1), new THREE.Vector3(58, 0.13, 3.1)], true);
  line(parent, [new THREE.Vector3(-58, 0.13, 9.25), new THREE.Vector3(58, 0.13, 9.25)], true);
  for (let x = -54; x < 55; x += 5.4) {
    line(parent, [new THREE.Vector3(x, 0.13, 6.15), new THREE.Vector3(x + 2.8, 0.13, 6.15)], true);
  }
  for (let x = -45; x < 46; x += 11) {
    const lamp = new THREE.Group();
    lamp.position.set(x, 0, 11);
    parent.add(lamp);
    cylinder(lamp, [0.07, 0.1], 3.9, [0, 1.95, 0], 8);
    const arm = line(lamp, [
      new THREE.Vector3(0, 3.82, 0),
      new THREE.Vector3(0.75, 4.08, 0),
      new THREE.Vector3(1.05, 3.9, 0),
    ]);
    arm.rotation.z = 0.03;
  }
}

export function createBirds(parent: THREE.Object3D) {
  for (let bird = 0; bird < 7; bird++) {
    const bx = -28 + bird * 9;
    const by = 16 + (bird % 3) * 2.4;
    line(parent, [
      new THREE.Vector3(bx - 0.5, by, -8 - bird),
      new THREE.Vector3(bx, by + 0.25, -8 - bird),
      new THREE.Vector3(bx + 0.5, by, -8 - bird),
    ], true);
  }
}
