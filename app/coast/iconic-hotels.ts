import * as THREE from 'three';
import { box, cylinder, line, windowFrame } from './scene-kit';

function makeBreakwaterSign() {
  const canvas = document.createElement('canvas');
  canvas.width = 280;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#181818';
    context.font = '800 76px Arial';
    context.textAlign = 'center';
    'BREAKWATER'.split('').forEach((character, index) => {
      context.fillText(character, canvas.width / 2, 88 + index * 91);
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true }));
  sprite.userData.texture = texture;
  return sprite;
}

export function createBreakwaterHotel(parent: THREE.Object3D, x: number) {
  const hotel = new THREE.Group();
  hotel.position.x = x;
  parent.add(hotel);

  const width = 10.4;
  const height = 7.1;
  box(hotel, [width, height, 6], [0, height / 2, -3.25]);
  box(hotel, [width + 0.35, 0.24, 6.2], [0, 0.12, -3.2]);

  // The central fin and long eyebrows are the facade's most legible Art Deco gestures.
  box(hotel, [1.75, 9.05, 0.48], [0, 4.52, -0.02]);
  box(hotel, [2.18, 0.3, 0.68], [0, 8.98, 0.02]);
  for (const y of [2.35, 4.12, 5.89]) {
    box(hotel, [3.95, 0.16, 0.72], [-3.04, y, 0.22]);
    box(hotel, [3.95, 0.16, 0.72], [3.04, y, 0.22]);
  }

  for (const y of [2.9, 4.67, 6.44]) {
    for (const windowX of [-4.15, -2.85, 2.85, 4.15]) {
      windowFrame(hotel, windowX, y, -0.235, 0.82, 0.72);
    }
  }

  // A shallow full-width porch with slim posts keeps the street-facing base open.
  box(hotel, [width + 0.18, 0.2, 1.45], [0, 1.28, 0.4]);
  for (const postX of [-4.45, -2.35, 2.35, 4.45]) {
    cylinder(hotel, [0.09, 0.11], 1.28, [postX, 0.64, 0.95], 10);
  }
  windowFrame(hotel, 0, 0.68, 0.255, 1.08, 1.18);

  box(hotel, [width + 0.25, 0.2, 0.55], [0, height - 0.08, -0.04]);
  line(hotel, [new THREE.Vector3(-5.05, 7.52, -0.1), new THREE.Vector3(5.05, 7.52, -0.1)], true);
  for (let rail = -5; rail <= 5; rail += 1.25) {
    line(hotel, [new THREE.Vector3(rail, 7.08, -0.1), new THREE.Vector3(rail, 7.55, -0.1)], true);
  }

  const sign = makeBreakwaterSign();
  sign.position.set(0, 5.05, 0.56);
  sign.scale.set(1.05, 4.45, 1);
  hotel.add(sign);
  return hotel;
}
