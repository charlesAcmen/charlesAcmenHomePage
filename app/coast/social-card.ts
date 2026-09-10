import * as THREE from 'three';
import type { CardImage, SocialCardConfig } from './social-card-data';
import { makeTextSprite } from './scene-kit';

export const CARD_SIZE = 2.35;

const cardVertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uPress;
  uniform vec2 uCorner;
  uniform vec2 uSize;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    vec2 normalizedPosition = position.xy / uSize + 0.5;
    vec2 pressedCorner = mix(1.0 - normalizedPosition, normalizedPosition, step(vec2(0.0), uCorner));
    float pressed = pow(pressedCorner.x * pressedCorner.y, 2.15);
    float lifted = pow((1.0 - pressedCorner.x) * (1.0 - pressedCorner.y), 1.7);
    float cushion = sin(pressedCorner.x * 3.14159) * sin(pressedCorner.y * 3.14159) * 0.025;
    transformed.z += (-pressed * 0.17 + lifted * 0.12 + cushion) * uPress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const cardFragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uAspect;
  uniform float uShowFullImage;

  void main() {
    vec2 imageUv = vUv;
    bool outside = false;
    if (uShowFullImage < 0.5 && uAspect > 1.0) {
      float imageHeight = 1.0 / uAspect;
      float inset = (1.0 - imageHeight) * 0.5;
      outside = vUv.y < inset || vUv.y > 1.0 - inset;
      imageUv.y = (vUv.y - inset) / imageHeight;
    } else if (uShowFullImage < 0.5 && uAspect < 1.0) {
      float imageWidth = uAspect;
      float inset = (1.0 - imageWidth) * 0.5;
      outside = vUv.x < inset || vUv.x > 1.0 - inset;
      imageUv.x = (vUv.x - inset) / imageWidth;
    }
    vec4 color = outside ? vec4(1.0) : texture2D(uMap, imageUv);
    if (color.a < 0.02) discard;
    gl_FragColor = color;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

type SharedUniform<T> = { value: T };

export type SocialCardController = {
  id: string;
  targets: THREE.Object3D[];
  linkTargets: THREE.Object3D[];
  labelHref?: string;
  setHovered: (intersection: THREE.Intersection<THREE.Object3D> | null) => void;
  setFocused: (focused: boolean) => void;
  animate: (delta: number) => void;
  activate: () => void;
};

function createTexture(image: CardImage) {
  const texture = new THREE.TextureLoader().load(image.url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

function createCardFace(
  image: CardImage,
  geometry: THREE.PlaneGeometry,
  press: SharedUniform<number>,
  corner: SharedUniform<THREE.Vector2>,
  cardSize: [number, number],
  showFullImage: boolean,
) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: createTexture(image) },
      uAspect: { value: image.aspect },
      uShowFullImage: { value: showFullImage ? 1 : 0 },
      uPress: press,
      uCorner: corner,
      uSize: { value: new THREE.Vector2(...cardSize) },
    },
    vertexShader: cardVertexShader,
    fragmentShader: cardFragmentShader,
    transparent: true,
    depthWrite: true,
  });
  const face = new THREE.Mesh(geometry, material);
  face.renderOrder = 6;
  return { face, material };
}

export function createSocialCard(
  parent: THREE.Object3D,
  config: SocialCardConfig,
  positionX: number,
  positionZ: number,
  geometry: THREE.PlaneGeometry,
  positionY = 3.5,
  rotationY = 0,
  cardSize: [number, number] = [CARD_SIZE, CARD_SIZE],
): SocialCardController {
  const root = new THREE.Group();
  root.position.set(positionX, positionY, positionZ);
  root.rotation.y = rotationY;
  parent.add(root);

  const press = { value: 0 };
  const corner = { value: new THREE.Vector2(-1, 1) };
  const cardBody = new THREE.Group();
  root.add(cardBody);
  const frontBody = new THREE.Group();
  const frontFace = createCardFace(config.front, geometry, press, corner, cardSize, Boolean(config.showFullImage));
  frontBody.add(frontFace.face);
  cardBody.add(frontBody);

  const backBody = new THREE.Group();
  const backFace = config.back ? createCardFace(config.back, geometry, press, corner, cardSize, Boolean(config.showFullImage)) : null;
  if (backFace) {
    backBody.position.set(0, 0.06, -0.07);
    backBody.add(backFace.face);
    cardBody.add(backBody);
  }

  const label = makeTextSprite(
    config.label,
    undefined,
    config.showFullImage ? { titleColor: '#21113d', shadowColor: '#fffefd', strokeColor: '#fffefd' } : undefined,
  );
  label.position.set(0, -cardSize[1] / 2 - (config.showFullImage ? 0.44 : 0.35), 0.04);
  label.scale.set(config.showFullImage ? 2.5 : 2.12, config.showFullImage ? 0.56 : 0.34, 1);
  label.renderOrder = 8;
  cardBody.add(label);

  const targets = backFace ? [frontFace.face, backFace.face] : [frontFace.face];
  const linkTargets = config.labelHref ? [label] : [];
  const galleryTextures = config.cycleImages?.length
    ? [frontFace.material.uniforms.uMap.value as THREE.Texture, ...config.cycleImages.map(createTexture)]
    : [];
  root.userData.galleryTextures = galleryTextures;
  let hovered = false;
  let revealed = false;
  let revealProgress = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let focused = false;
  let focusProgress = 0;
  let galleryIndex = 0;
  let nextGalleryIndex = 0;
  let galleryProgress = 0;
  let galleryCycling = false;
  let galleryTextureSwapped = false;

  return {
    id: config.id,
    targets,
    linkTargets,
    labelHref: config.labelHref,
    setHovered(intersection) {
      hovered = Boolean(intersection);
      if (!intersection) {
        targetRotationX = 0;
        targetRotationY = 0;
        return;
      }
      const target = intersection.object;
      const localPoint = target.worldToLocal(intersection.point.clone());
      const cornerX = localPoint.x >= 0 ? 1 : -1;
      const cornerY = localPoint.y >= 0 ? 1 : -1;
      corner.value.set(cornerX, cornerY);
      targetRotationX = -cornerY * 0.055;
      targetRotationY = cornerX * 0.065;
    },
    setFocused(nextFocused) {
      if (config.focusOnActivate) focused = nextFocused;
    },
    animate(delta) {
      revealProgress = THREE.MathUtils.damp(revealProgress, revealed ? 1 : 0, 8, delta);
      press.value = THREE.MathUtils.damp(press.value, hovered ? 1 : 0, 10, delta);
      focusProgress = THREE.MathUtils.damp(focusProgress, focused ? 1 : 0, 9, delta);
      cardBody.position.z = focusProgress * 0.72;

      if (galleryCycling) {
        galleryProgress = Math.min(galleryProgress + delta * 3.2, 1);
        if (!galleryTextureSwapped && galleryProgress >= 0.5) {
          galleryIndex = nextGalleryIndex;
          frontFace.material.uniforms.uMap.value = galleryTextures[galleryIndex];
          galleryTextureSwapped = true;
        }
        if (galleryProgress >= 1) galleryCycling = false;
      }

      const extractionLift = Math.sin(revealProgress * Math.PI) * 0.3;
      frontBody.position.y = -revealProgress * 0.05;
      frontBody.position.z = -revealProgress * 0.1;
      backBody.position.y = 0.06 * (1 - revealProgress) + extractionLift;
      backBody.position.z = -0.07 + revealProgress * 0.23;
      backBody.rotation.z = Math.sin(revealProgress * Math.PI) * -0.035;

      const frontIsActive = revealProgress < 0.5;
      frontBody.rotation.x = THREE.MathUtils.damp(frontBody.rotation.x, frontIsActive ? targetRotationX : 0, 9, delta);
      const galleryTurn = galleryCycling ? Math.sin(galleryProgress * Math.PI) * Math.PI * 0.5 : 0;
      frontBody.rotation.y = THREE.MathUtils.damp(frontBody.rotation.y, (frontIsActive ? targetRotationY : 0) + galleryTurn, 11, delta);
      backBody.rotation.x = THREE.MathUtils.damp(backBody.rotation.x, frontIsActive ? 0 : targetRotationX, 9, delta);
      backBody.rotation.y = THREE.MathUtils.damp(backBody.rotation.y, frontIsActive ? 0 : targetRotationY, 9, delta);
    },
    activate() {
      if (!hovered) return;
      if (galleryTextures.length > 1) {
        if (!galleryCycling) {
          nextGalleryIndex = (galleryIndex + 1) % galleryTextures.length;
          galleryProgress = 0;
          galleryTextureSwapped = false;
          galleryCycling = true;
        }
        return;
      }
      if (config.focusOnActivate) {
        focused = !focused;
        return;
      }
      if (config.back) {
        revealed = !revealed;
        return;
      }
      if (config.href) window.open(config.href, '_blank', 'noopener,noreferrer');
    },
  };
}
