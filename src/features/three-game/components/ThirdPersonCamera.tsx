import { useFrame, useThree } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { GameMode, Position3D } from '../types';

type ThirdPersonCameraProps = {
  targetPositionRef: MutableRefObject<Position3D>;
  mode: GameMode;
};

export default function ThirdPersonCamera({ targetPositionRef, mode }: ThirdPersonCameraProps) {
  const { camera } = useThree();

  const currentCamPos = useRef(new THREE.Vector3(0, 2.8, -11.5));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, -6));
  const desiredCamPos = useRef(new THREE.Vector3());
  const desiredLookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const [tx, ty, tz] = targetPositionRef.current;

    let offsetBack = -5.8;
    let offsetUp = 2.9;
    let lookUp = 1.2;

    if (mode === 'typing') {
      offsetBack = -4.5;
      offsetUp = 2.4;
      lookUp = 1.35;
    } else if (mode === 'opening') {
      offsetBack = -6.2;
      offsetUp = 3.4;
      lookUp = 2.5;
    }

    desiredCamPos.current.set(tx, ty + offsetUp, tz + offsetBack);
    desiredLookAt.current.set(tx, ty + lookUp, tz + 1.5);

    const damping = mode === 'typing' || mode === 'opening' ? 4 : 5.5;
    currentCamPos.current.lerp(desiredCamPos.current, dt * damping);
    currentLookAt.current.lerp(desiredLookAt.current, dt * damping);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
