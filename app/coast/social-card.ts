import * as THREE from 'three';
import type { CardImage, SocialCardConfig } from './social-card-data';
import { makeTextSprite } from './scene-kit';

export const CARD_SIZE = 2.35;

const cardVertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uPress;
  uniform vec2 uCorner;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    vec2 normalizedPosition = position.xy / ${CARD_SIZE.toFixed(2)} + 0.5;
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

  void main() {
    vec2 imageUv = vUv;
    bool outside = false;
    if (uAspect > 1.0) {
      float imageHeight = 1.0 / uAspect;
      float inset = (1.0 - imageHeight) * 0.5;
      outside = vUv.y < inset || vUv.y > 1.0 - inset;
      imageUv.y = (vUv.y - inset) / imageHeight;
    } else if (uAspect < 1.0) {
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
  targets: THREE.Mesh[];
  setHovered: (intersection: THREE.Intersection<THREE.Object3D> | null) => void;
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
) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: createTexture(image) },
      uAspect: { value: image.aspect },
      uPress: press,
      uCorner: corner,
    },
    vertexShader: cardVertexShader,
    fragmentShader: cardFragmentShader,
    transparent: true,
    depthWrite: true,
  });
  const face = new THREE.Mesh(geometry, material);
  face.renderOrder = 6;
  return face;
}

export function createSocialCard(
  parent: THREE.Object3D,
  config: SocialCardConfig,
  positionX: number,
  positionZ: number,
  geometry: THREE.PlaneGeometry,
): SocialCardController {
  const root = new THREE.Group();
  root.position.set(positionX, 3.5, positionZ);
  parent.add(root);

  const press = { value: 0 };
  const corner = { value: new THREE.Vector2(-1, 1) };
  const frontBody = new THREE.Group();
  const frontFace = createCardFace(config.front, geometry, press, corner);
  frontBody.add(frontFace);
  root.add(frontBody);

  const backBody = new THREE.Group();
  const backFace = config.back ? createCardFace(config.back, geometry, press, corner) : null;
  if (backFace) {
    backBody.position.set(0, 0.06, -0.07);
    backBody.add(backFace);
    root.add(backBody);
  }

  const label = makeTextSprite(config.label);
  label.position.set(0, -1.53, 0.02);
  label.scale.set(2.12, 0.34, 1);
  root.add(label);

  const targets = backFace ? [frontFace, backFace] : [frontFace];
  let hovered = false;
  let revealed = false;
  let revealProgress = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;

  return {
    id: config.id,
    targets,
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
    animate(delta) {
      revealProgress = THREE.MathUtils.damp(revealProgress, revealed ? 1 : 0, 8, delta);
      press.value = THREE.MathUtils.damp(press.value, hovered ? 1 : 0, 10, delta);

      const extractionLift = Math.sin(revealProgress * Math.PI) * 0.3;
      frontBody.position.y = -revealProgress * 0.05;
      frontBody.position.z = -revealProgress * 0.1;
      backBody.position.y = 0.06 * (1 - revealProgress) + extractionLift;
      backBody.position.z = -0.07 + revealProgress * 0.23;
      backBody.rotation.z = Math.sin(revealProgress * Math.PI) * -0.035;

      const frontIsActive = revealProgress < 0.5;
      frontBody.rotation.x = THREE.MathUtils.damp(frontBody.rotation.x, frontIsActive ? targetRotationX : 0, 9, delta);
      frontBody.rotation.y = THREE.MathUtils.damp(frontBody.rotation.y, frontIsActive ? targetRotationY : 0, 9, delta);
      backBody.rotation.x = THREE.MathUtils.damp(backBody.rotation.x, frontIsActive ? 0 : targetRotationX, 9, delta);
      backBody.rotation.y = THREE.MathUtils.damp(backBody.rotation.y, frontIsActive ? 0 : targetRotationY, 9, delta);
    },
    activate() {
      if (!hovered) return;
      if (config.back) {
        revealed = !revealed;
        return;
      }
      if (config.href) window.open(config.href, '_blank', 'noopener,noreferrer');
    },
  };
}
