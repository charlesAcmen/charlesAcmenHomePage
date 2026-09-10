import * as THREE from 'three';
import { CARD_SIZE, createSocialCard, type SocialCardController } from './social-card';
import { projectCards } from './project-card-data';

export function createProjectWall(parent: THREE.Object3D) {
  const positions: Array<[number, number]> = [
    [-5.2, 6.7], [-14.45, 7.0],
    [-5.2, 2.7], [-14.45, 2.7],
  ];
  const cards = projectCards.map((config, index) => {
    const [positionZ, positionY] = positions[index];
    const cardHeight = config.showFullImage ? CARD_SIZE / config.front.aspect : CARD_SIZE;
    const geometry = new THREE.PlaneGeometry(CARD_SIZE, cardHeight, 12, 12);
    return createSocialCard(parent, config, -9.88, positionZ, geometry, positionY, Math.PI / 2, [CARD_SIZE, cardHeight]);
  });
  const targets = cards.flatMap((card) => [...card.targets, ...card.linkTargets]);
  const raycaster = new THREE.Raycaster();
  const targetMap = new Map<string, { card: SocialCardController; opensLink: boolean }>();
  cards.forEach((card) => {
    card.targets.forEach((target) => targetMap.set(target.uuid, { card, opensLink: false }));
    card.linkTargets.forEach((target) => targetMap.set(target.uuid, { card, opensLink: true }));
  });
  let hoveredCard: SocialCardController | null = null;
  let hoveredLink: string | undefined;

  const clearHover = () => {
    hoveredCard = null;
    cards.forEach((card) => card.setHovered(null));
  };

  return {
    updatePointer(camera: THREE.Camera, pointer: THREE.Vector2, interactionEnabled: boolean) {
      if (!interactionEnabled) {
        clearHover();
        hoveredLink = undefined;
        return false;
      }
      camera.updateMatrixWorld();
      targets.forEach((target) => target.updateWorldMatrix(true, false));
      raycaster.setFromCamera(pointer, camera);
      const intersection = raycaster.intersectObjects(targets, false)[0] ?? null;
      const hit = intersection ? targetMap.get(intersection.object.uuid) : undefined;
      const nextHovered = hit?.card ?? null;
      cards.forEach((card) => card.setHovered(card === nextHovered ? intersection : null));
      hoveredCard = nextHovered;
      hoveredLink = hit?.opensLink ? hit.card.labelHref : undefined;
      return Boolean(hoveredCard);
    },
    activateHovered() {
      if (!hoveredCard) return false;
      if (hoveredLink) {
        window.open(hoveredLink, '_blank', 'noopener,noreferrer');
        return true;
      }
      hoveredCard.activate();
      return true;
    },
    animate(delta: number) {
      cards.forEach((card) => card.animate(delta));
    },
  };
}
