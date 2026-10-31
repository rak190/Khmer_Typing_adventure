import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { GameMode, Position3D } from '../types';

type ThirdPersonCameraProps = {
  targetPosition: Position3D;
  mode: GameMode;
};

export default function ThirdPersonCamera({ targetPosition, mode }: ThirdPersonCameraProps) {
  const { camera } = useThree();

  const currentCamPos = useRef(new THREE.Vector3(targetPosition[0], targetPosition[1] + 2.8, targetPosition[2] - 5.5));
  const currentLookAt = useRef(new THREE.Vector3(targetPosition[0], targetPosition[1] + 1.2, targetPosition[2]));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const [tx, ty, tz] = targetPosition;

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
      lookUp = 2.5; // Look up higher towards the grand gate archway opening
    }

    const desiredCamPos = new THREE.Vector3(tx, ty + offsetUp, tz + offsetBack);
    const desiredLookAt = new THREE.Vector3(tx, ty + lookUp, tz + 1.5);

    // Smooth lerp
    const damping = mode === 'typing' || mode === 'opening' ? 4 : 5.5;
    currentCamPos.current.lerp(desiredCamPos, dt * damping);
    currentLookAt.current.lerp(desiredLookAt, dt * damping);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
