import * as THREE from 'three';
import { CARD_SIZE, createSocialCard, type SocialCardController } from './social-card';
import { socialCards } from './social-card-data';

export function createSocialWall(parent: THREE.Object3D) {
  const geometry = new THREE.PlaneGeometry(CARD_SIZE, CARD_SIZE, 12, 12);
  const spacing = 2.7;
  const startX = -((socialCards.length - 1) * spacing) / 2;
  const cards = socialCards.map((config, index) => createSocialCard(parent, config, startX + index * spacing, geometry));
  const targets = cards.flatMap((card) => card.targets);
  const raycaster = new THREE.Raycaster();
  const targetMap = new Map<string, SocialCardController>();
  cards.forEach((card) => card.targets.forEach((target) => targetMap.set(target.uuid, card)));
  let hoveredCard: SocialCardController | null = null;

  const clearHover = () => {
    hoveredCard = null;
    cards.forEach((card) => card.setHovered(null));
  };

  return {
    updatePointer(camera: THREE.Camera, pointer: THREE.Vector2, interactionEnabled: boolean) {
      if (!interactionEnabled) {
        clearHover();
        return false;
      }
      camera.updateMatrixWorld();
      targets.forEach((target) => target.updateWorldMatrix(true, false));
      raycaster.setFromCamera(pointer, camera);
      const intersection = raycaster.intersectObjects(targets, false)[0] ?? null;
      const nextHovered = intersection ? targetMap.get(intersection.object.uuid) ?? null : null;
      cards.forEach((card) => card.setHovered(card === nextHovered ? intersection : null));
      hoveredCard = nextHovered;
      return Boolean(hoveredCard);
    },
    activateHovered() {
      hoveredCard?.activate();
    },
    animate(delta: number) {
      cards.forEach((card) => card.animate(delta));
    },
  };
}
