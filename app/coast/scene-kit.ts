import * as THREE from 'three';

export const INK = 0x181818;
export const PAPER = 0xfffefd;

export const whiteMaterial = new THREE.MeshBasicMaterial({
  color: PAPER,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
export const inkMaterial = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.84 });
export const faintInkMaterial = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.38 });
export const pinkMaterial = new THREE.MeshBasicMaterial({ color: 0xff3f93 });
export const coralMaterial = new THREE.MeshBasicMaterial({ color: 0xff715b });
export const cyanMaterial = new THREE.MeshBasicMaterial({ color: 0x3bd7d0 });
export const violetMaterial = new THREE.MeshBasicMaterial({ color: 0x6b39b5 });
export const yellowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd766 });
export const nightMaterial = new THREE.MeshBasicMaterial({ color: 0x21113d });

const sharedMaterials: THREE.Material[] = [
  whiteMaterial,
  inkMaterial,
  faintInkMaterial,
  pinkMaterial,
  coralMaterial,
  cyanMaterial,
  violetMaterial,
  yellowMaterial,
  nightMaterial,
];

export function addOutlined(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material = whiteMaterial,
  threshold = 22,
) {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, material));
  if (material === whiteMaterial) {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, threshold), inkMaterial);
    edges.renderOrder = 3;
    group.add(edges);
  }
  parent.add(group);
  return group;
}

export function box(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material = whiteMaterial,
) {
  const item = addOutlined(parent, new THREE.BoxGeometry(...size), material);
  item.position.set(...position);
  return item;
}

export function cylinder(
  parent: THREE.Object3D,
  radii: [number, number],
  height: number,
  position: [number, number, number],
  sides = 12,
  material: THREE.Material = whiteMaterial,
) {
  const item = addOutlined(parent, new THREE.CylinderGeometry(radii[0], radii[1], height, sides), material);
  item.position.set(...position);
  return item;
}

export function line(parent: THREE.Object3D, points: THREE.Vector3[], faint = false) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const item = new THREE.Line(geometry, faint ? faintInkMaterial : inkMaterial);
  item.renderOrder = 4;
  parent.add(item);
  return item;
}

export function windowFrame(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
) {
  const inset = new THREE.Mesh(new THREE.PlaneGeometry(width, height), whiteMaterial);
  inset.position.set(x, y, z - 0.018);
  parent.add(inset);
  line(parent, [
    new THREE.Vector3(x - width / 2, y - height / 2, z),
    new THREE.Vector3(x + width / 2, y - height / 2, z),
    new THREE.Vector3(x + width / 2, y + height / 2, z),
    new THREE.Vector3(x - width / 2, y + height / 2, z),
    new THREE.Vector3(x - width / 2, y - height / 2, z),
  ]);
  line(parent, [new THREE.Vector3(x, y - height / 2, z), new THREE.Vector3(x, y + height / 2, z)], true);
}

export function makeTextSprite(title: string, subtitle?: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = subtitle ? 320 : 160;
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.textAlign = 'center';
    context.shadowColor = '#ff3f93';
    context.shadowBlur = subtitle ? 22 : 10;
    context.fillStyle = '#ff3f93';
    context.font = subtitle ? 'italic 900 152px Arial' : '700 62px Arial';
    context.fillText(title, 512, subtitle ? 174 : 98);
    if (subtitle) {
      context.shadowBlur = 0;
      context.fillStyle = '#25123f';
      context.font = '700 41px Arial';
      context.letterSpacing = '16px';
      context.fillText(subtitle, 520, 250);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true });
  const sprite = new THREE.Sprite(material);
  sprite.userData.texture = texture;
  sprite.userData.material = material;
  return sprite;
}

export function disposeScene(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineSegments) {
      geometries.add(object.geometry);
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      objectMaterials.forEach((material) => {
        materials.add(material);
        if (material instanceof THREE.ShaderMaterial) {
          Object.values(material.uniforms).forEach((uniform) => {
            if (uniform.value instanceof THREE.Texture) textures.add(uniform.value);
          });
        }
      });
    }
    if (object instanceof THREE.Sprite) {
      materials.add(object.material);
      if (object.material.map) textures.add(object.material.map);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  textures.forEach((texture) => texture.dispose());
  sharedMaterials.forEach((material) => materials.add(material));
  materials.forEach((material) => material.dispose());
}
