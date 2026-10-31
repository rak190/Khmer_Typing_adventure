import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GATE_COLLISION_Z } from '../systems/gameplayState';
import type { GameMode, GateStatus, Position3D } from '../types';
import type { MovementInput } from '../hooks/usePlayerControls';

type CharacterProps = {
  position: Position3D;
  movement: MovementInput;
  mode: GameMode;
  gateStatus: GateStatus;
  onPositionChange: (newPos: Position3D) => void;
};

const MOVE_SPEED = 5.8;
const MIN_X = -13.0;
const MAX_X = 13.0;
const MIN_Z = -14.0;
const MAX_Z = 16.0;

export default function Character({
  position,
  movement,
  mode,
  gateStatus,
  onPositionChange,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const posRef = useRef<THREE.Vector3>(new THREE.Vector3(...position));
  const targetRotationRef = useRef<number>(0);
  const currentRotationRef = useRef<number>(0);
  const walkCycleRef = useRef<number>(0);

  useFrame((_, delta) => {
    // Only allow movement during exploration or completed mode
    const canMove = mode === 'exploration' || mode === 'completed';

    let moveX = 0;
    let moveZ = 0;

    if (canMove) {
      if (movement.forward) moveZ += 1; // forward is positive Z (towards the gate)
      if (movement.backward) moveZ -= 1;
      if (movement.left) moveX -= 1;
      if (movement.right) moveX += 1;
    }

    const isMoving = moveX !== 0 || moveZ !== 0;

    if (isMoving) {
      // Normalize vector
      const length = Math.hypot(moveX, moveZ);
      const dirX = moveX / length;
      const dirZ = moveZ / length;

      // Update position
      const dt = Math.min(delta, 0.1);
      posRef.current.x += dirX * MOVE_SPEED * dt;
      posRef.current.z += dirZ * MOVE_SPEED * dt;

      // Enforce bounds
      posRef.current.x = Math.max(MIN_X, Math.min(MAX_X, posRef.current.x));

      // Gate collision check
      const maxAllowedZ = gateStatus === 'open' ? MAX_Z : GATE_COLLISION_Z;
      posRef.current.z = Math.max(MIN_Z, Math.min(maxAllowedZ, posRef.current.z));

      // Target rotation facing movement direction
      targetRotationRef.current = Math.atan2(dirX, dirZ);

      // Advance walk cycle
      walkCycleRef.current += dt * 10;
    } else {
      // Return walk cycle smoothly to neutral
      walkCycleRef.current = 0;
    }

    // Smoothly rotate character toward movement heading
    const angleDiff = Math.atan2(
      Math.sin(targetRotationRef.current - currentRotationRef.current),
      Math.cos(targetRotationRef.current - currentRotationRef.current)
    );
    currentRotationRef.current += angleDiff * Math.min(1, delta * 12);

    if (groupRef.current) {
      groupRef.current.position.copy(posRef.current);
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

    // Report position change to parent
    onPositionChange([posRef.current.x, posRef.current.y, posRef.current.z]);
  });

  return (
    <group ref={groupRef} position={position}>
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
