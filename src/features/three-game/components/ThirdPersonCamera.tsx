import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { GameMode, Position3D } from '../types';

export type CameraPreset = {
  offsetBack: number;
  offsetUp: number;
  lookUp: number;
  lookAheadZ: number;
  damping?: number;
};

type ThirdPersonCameraProps = {
  targetPositionRef: MutableRefObject<Position3D>;
  mode: GameMode;
  isSprinting?: boolean;
  cameraPreset?: CameraPreset;
};

export default function ThirdPersonCamera({
  targetPositionRef,
  mode,
  isSprinting = false,
  cameraPreset,
}: ThirdPersonCameraProps) {
  const { camera } = useThree();

  const currentCamPos = useRef(new THREE.Vector3(0, 2.8, -11.5));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.4, -6));
  const desiredCamPos = useRef(new THREE.Vector3());
  const desiredLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const win = window as unknown as { __threeSnapCamera?: () => void };
    win.__threeSnapCamera = () => {
      const [tx, ty, tz] = targetPositionRef.current;
      currentCamPos.current.set(tx * 0.75, ty + 2.25, tz - 6.2);
      currentLookAt.current.set(tx * 0.4, ty + 2.05, tz + 2.2);
      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
    };
    return () => {
      delete win.__threeSnapCamera;
    };
  }, [camera, targetPositionRef]);

  useFrame((_, delta) => {
    // Clamp delta to prevent huge jumps when switching tabs
    const dt = Math.min(delta, 0.05);
    const [tx, ty, tz] = targetPositionRef.current;

    let offsetBack = cameraPreset?.offsetBack ?? -6.2;
    let offsetUp = cameraPreset?.offsetUp ?? 2.25;
    let offsetX = 0;
    let lookUp = cameraPreset?.lookUp ?? 2.05;
    let lookAheadZ = cameraPreset?.lookAheadZ ?? 2.2;
    let damping = cameraPreset?.damping ?? 5.0;

    if (mode === 'typing') {
      // Action-RPG over-the-shoulder framing: hero visible on left, glowing altar on right
      offsetBack = (cameraPreset?.offsetBack ?? -6.2) * 0.65;
      offsetUp = (cameraPreset?.offsetUp ?? 2.25) * 0.9;
      offsetX = -0.75;
      lookUp = (cameraPreset?.lookUp ?? 2.05) * 0.95;
      lookAheadZ = (cameraPreset?.lookAheadZ ?? 2.2) * 0.8;
      damping = 4.6;
    } else if (mode === 'opening') {
      // Cinematic majestic sweep: pull back and tilt up toward the towering transformation
      offsetBack = (cameraPreset?.offsetBack ?? -6.2) * 1.15;
      offsetUp = (cameraPreset?.offsetUp ?? 2.25) * 1.7;
      lookUp = (cameraPreset?.lookUp ?? 2.05) * 1.55;
      lookAheadZ = (cameraPreset?.lookAheadZ ?? 2.2) * 1.35;
      damping = 2.8;
    } else if (mode === 'completed') {
      // Triumphant framing looking toward the open gateway bathed in sunlight
      offsetBack = -5.4;
      offsetUp = 2.8;
      lookUp = 2.2;
      lookAheadZ = 2.0;
      damping = 3.8;
    } else if (tz > 27.0) {
      // Inside Inner Sanctum looking toward the majestic 5-Tower Bakan Pyramid
      offsetBack = -3.2;
      offsetUp = 2.4;
      lookUp = 3.8;
      lookAheadZ = 6.0;
    }

    if (isSprinting && mode === 'exploration') {
      // Dynamic sprint pull-back
      offsetBack -= 0.85;
      damping = 4.2;
    }

    desiredCamPos.current.set(tx * 0.75 + offsetX, ty + offsetUp, tz + offsetBack);
    desiredLookAt.current.set(tx * 0.4 + offsetX * 0.4, ty + lookUp, tz + lookAheadZ);

    // Frame-rate independent exponential smoothing
    const blend = 1 - Math.exp(-damping * dt);
    currentCamPos.current.lerp(desiredCamPos.current, blend);
    currentLookAt.current.lerp(desiredLookAt.current, blend);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
