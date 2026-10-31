import { useFrame } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { MovementInput } from '../hooks/usePlayerControls';
import { clampCharacterPosition, isPositionNearGate } from '../systems/gameplayState';
import type { GameMode, GateStatus, Position3D } from '../types';

type CharacterProps = {
  positionRef: MutableRefObject<Position3D>;
  movement: MovementInput;
  mode: GameMode;
  gateStatus: GateStatus;
  isModalOpen?: boolean;
  onNearGateChange: (isNear: boolean) => void;
};

const MOVE_SPEED = 5.8;

export default function Character({
  positionRef,
  movement,
  mode,
  gateStatus,
  isModalOpen = false,
  onNearGateChange,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const targetRotationRef = useRef<number>(0);
  const currentRotationRef = useRef<number>(0);
  const walkCycleRef = useRef<number>(0);
  const lastNearGateRef = useRef<boolean | null>(null);

  useFrame((_, delta) => {
    const canMove = (mode === 'exploration' || mode === 'completed') && !isModalOpen;

    let moveX = 0;
    let moveZ = 0;

    if (canMove) {
      if (movement.forward) moveZ += 1;
      if (movement.backward) moveZ -= 1;
      if (movement.left) moveX -= 1;
      if (movement.right) moveX += 1;
    }

    const isMoving = moveX !== 0 || moveZ !== 0;
    let [curX, , curZ] = positionRef.current;
    const curY = positionRef.current[1];

    if (isMoving) {
      const length = Math.hypot(moveX, moveZ);
      const dirX = moveX / length;
      const dirZ = moveZ / length;

      const dt = Math.min(delta, 0.1);
      curX += dirX * MOVE_SPEED * dt;
      curZ += dirZ * MOVE_SPEED * dt;

      targetRotationRef.current = Math.atan2(dirX, dirZ);
      walkCycleRef.current += dt * 10;
    } else {
      walkCycleRef.current = 0;
    }

    // Always enforce courtyard & gate collision bounds (even if gate closes on retry)
    const [clampedX, clampedZ] = clampCharacterPosition(curX, curZ, gateStatus);
    positionRef.current[0] = clampedX;
    positionRef.current[1] = curY;
    positionRef.current[2] = clampedZ;

    // Smoothly rotate character toward movement heading
    const angleDiff = Math.atan2(
      Math.sin(targetRotationRef.current - currentRotationRef.current),
      Math.cos(targetRotationRef.current - currentRotationRef.current),
    );
    currentRotationRef.current += angleDiff * Math.min(1, delta * 12);

    if (groupRef.current) {
      groupRef.current.position.set(clampedX, curY, clampedZ);
      groupRef.current.rotation.y = currentRotationRef.current;
    }

    // Procedural walk animation
    const swing = isMoving ? Math.sin(walkCycleRef.current) * 0.55 : 0;
    const bodyBob = isMoving ? Math.abs(Math.sin(walkCycleRef.current * 2)) * 0.05 : 0;

    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8;
    if (bodyRef.current) bodyRef.current.position.y = bodyBob;

    // Only notify React when proximity milestone boolean actually changes
    const nearGate = isPositionNearGate(clampedX, clampedZ);
    if (lastNearGateRef.current !== nearGate) {
      lastNearGateRef.current = nearGate;
      onNearGateChange(nearGate);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -6]}>
      {/* Root body group with vertical bobbing */}
      <group ref={bodyRef}>
        {/* Torso - Traditional royal sapphire/indigo tunic with gold accents */}
        <mesh position={[0, 1.15, 0]}>
          <capsuleGeometry args={[0.32, 0.45, 6, 12]} />
          <meshStandardMaterial color="#1E3A8A" roughness={0.7} />
        </mesh>

        {/* Golden Sash across chest (Khmer traditional sbai accent) */}
        <mesh position={[0.02, 1.2, 0.08]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.12, 0.55, 0.28]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Traditional Belt / Sampot Waist */}
        <mesh position={[0, 0.88, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.12, 16]} />
          <meshStandardMaterial color="#D97706" roughness={0.5} />
        </mesh>

        {/* Head */}
        <group position={[0, 1.72, 0]}>
          {/* Face */}
          <mesh>
            <sphereGeometry args={[0.26, 16, 16]} />
            <meshStandardMaterial color="#DEB887" roughness={0.8} />
          </mesh>

          {/* Golden Headband / Krama headband */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.08, 16]} />
            <meshStandardMaterial color="#FBBF24" roughness={0.4} />
          </mesh>

          {/* Hair top-knot */}
          <mesh position={[0, 0.28, -0.04]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#1F2937" roughness={0.9} />
          </mesh>

          {/* Stylized Eyes */}
          <mesh position={[-0.09, 0.02, 0.23]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0.09, 0.02, 0.23]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>

        {/* Explorer Scroll Backpack */}
        <group position={[0, 1.2, -0.32]}>
          {/* Leather bag */}
          <mesh>
            <boxGeometry args={[0.38, 0.42, 0.2]} />
            <meshStandardMaterial color="#78350F" roughness={0.9} />
          </mesh>
          {/* Rolled Ancient Palm-leaf Manuscript (Sastra) */}
          <mesh position={[0, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.52, 12]} />
            <meshStandardMaterial color="#FEF3C7" roughness={0.6} />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.42, 1.35, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.7} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.52, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#DEB887" />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.42, 1.35, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.7} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.52, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#DEB887" />
          </mesh>
        </group>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.18, 0.82, 0]}>
        <mesh position={[0, -0.36, 0]}>
          <capsuleGeometry args={[0.11, 0.44, 4, 8]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} />
        </mesh>
        {/* Foot / Sandal */}
        <mesh position={[0, -0.66, 0.06]}>
          <boxGeometry args={[0.13, 0.09, 0.22]} />
          <meshStandardMaterial color="#451A03" />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.18, 0.82, 0]}>
        <mesh position={[0, -0.36, 0]}>
          <capsuleGeometry args={[0.11, 0.44, 4, 8]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} />
        </mesh>
        {/* Foot / Sandal */}
        <mesh position={[0, -0.66, 0.06]}>
          <boxGeometry args={[0.13, 0.09, 0.22]} />
          <meshStandardMaterial color="#451A03" />
        </mesh>
      </group>
    </group>
  );
}
