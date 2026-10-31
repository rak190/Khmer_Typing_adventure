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
  const currentLookAt = useRef(new THREE.Vector3(0, 1.4, -6));
  const desiredCamPos = useRef(new THREE.Vector3());
  const desiredLookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    // Clamp delta to prevent huge jumps when switching tabs
    const dt = Math.min(delta, 0.05);
    const [tx, ty, tz] = targetPositionRef.current;

    let offsetBack = -5.6;
    let offsetUp = 2.6;
    let lookUp = 1.35;
    let lookAheadZ = 1.6;
    let damping = 5.0;

    if (mode === 'typing') {
      // Intimate, focused framing on student character and glowing altar pedestal
      offsetBack = -4.2;
      offsetUp = 2.2;
      lookUp = 1.35;
      lookAheadZ = 1.0;
      damping = 4.2;
    } else if (mode === 'opening') {
      // Cinematic majestic sweep: pull back and tilt up toward the towering pediment
      offsetBack = -7.0;
      offsetUp = 3.8;
      lookUp = 3.2;
      lookAheadZ = 2.8;
      damping = 2.8;
    } else if (mode === 'completed') {
      // Triumphant framing looking toward the open gateway bathed in sunlight
      offsetBack = -5.4;
      offsetUp = 2.8;
      lookUp = 2.2;
      lookAheadZ = 2.0;
      damping = 3.8;
    }

    desiredCamPos.current.set(tx * 0.75, ty + offsetUp, tz + offsetBack);
    desiredLookAt.current.set(tx * 0.4, ty + lookUp, tz + lookAheadZ);

    // Frame-rate independent exponential smoothing
    const blend = 1 - Math.exp(-damping * dt);
    currentCamPos.current.lerp(desiredCamPos.current, blend);
    currentLookAt.current.lerp(desiredLookAt.current, blend);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
