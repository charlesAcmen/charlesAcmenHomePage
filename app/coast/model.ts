import * as THREE from 'three';
import { addDecoBuilding } from './architecture';
import { createBeachDetails, createBirds, createPalm, createStreet, createWater } from './environment';
import { createBreakwaterHotel } from './iconic-hotels';
import { box, disposeScene } from './scene-kit';
import { createStudio } from './studio';
import { createTraffic } from './traffic';

export function buildCoast() {
  const root = new THREE.Group();
  const animatedPalms: THREE.Group[] = [];

  box(root, [120, 0.15, 9.5], [0, 0, 5.7]);
  box(root, [120, 0.12, 17], [0, -0.02, 20.7]);
  createWater(root);
  createStreet(root);
  createBeachDetails(root);

  const buildings: Array<[number, number, number, number]> = [
    [-49, 9.5, 7.8, 2], [-38.5, 9.2, 6.4, 0], [-28.2, 9.4, 8.8, 1], [-16.3, 10.4, 7.1, 2],
    [28.2, 9.4, 6.8, 1], [38.5, 9.2, 9.2, 2], [49, 9.5, 7.4, 0],
  ];
  buildings.forEach((item) => addDecoBuilding(root, ...item));
  createBreakwaterHotel(root, 16.3);

  const studio = createStudio(root);
  const traffic = createTraffic(root);
  const palms: Array<[number, number, number, number]> = [
    [-43, 13.5, 7.2, 0.4], [-31, 15, 8.3, -0.45], [-18.5, 12.5, 7.5, 0.34], [-11.8, 14.7, 8.8, -0.5],
    [11.8, 14, 8.4, 0.42], [19, 13.1, 7.4, -0.38], [31, 15.5, 8.8, 0.55], [43, 13.8, 7.8, -0.4],
  ];
  palms.forEach((item) => createPalm(root, ...item, animatedPalms));
  createBirds(root);

  return {
    root,
    audioAnchors: traffic.audioAnchors,
    updatePointer(camera: THREE.Camera, pointer: THREE.Vector2, interactionEnabled: boolean) {
      return studio.socialWall.updatePointer(camera, pointer, interactionEnabled);
    },
    activateHovered() {
      studio.socialWall.activateHovered();
    },
    animate(time: number, delta: number, progress: number) {
      animatedPalms.forEach((palm, index) => {
        palm.rotation.z = Math.sin(time * 0.55 + index * 0.8) * 0.012 * (1 - progress * 0.55);
      });
      traffic.animate(progress);
      studio.socialWall.animate(delta);
    },
    dispose() {
      disposeScene(root);
    },
  };
}
