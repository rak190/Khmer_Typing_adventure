import { useFrame } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { MovementInput } from '../hooks/usePlayerControls';
import {
  clampCharacterPosition,
  clampMultiStageCharacterPosition,
  computeMovementDelta,
  isPositionNearStage,
} from '../systems/gameplayState';
import type { GameMode, GateStatus, Position3D } from '../types';

type CharacterProps = {
  positionRef: MutableRefObject<Position3D>;
  movement: MovementInput;
  mode: GameMode;
  gateStatus: GateStatus;
  stageStatuses?: GateStatus[];
  activeStageIndex?: number;
  isModalOpen?: boolean;
  onNearGateChange: (isNear: boolean) => void;
};

const MOVE_SPEED = 5.8;

export default function Character({
  positionRef,
  movement,
  mode,
  gateStatus,
  stageStatuses,
  activeStageIndex = 0,
  isModalOpen = false,
  onNearGateChange,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const targetRotationRef = useRef<number>(0);
  const currentRotationRef = useRef<number>(0);
  const walkCycleRef = useRef<number>(0);
  const moveBlendRef = useRef<number>(0); // 0 = fully idle, 1 = fully walking
  const lastNearGateRef = useRef<boolean | null>(null);
  const lastStageIndexRef = useRef<number>(activeStageIndex);


  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const canMove = (mode === 'exploration' || mode === 'completed') && !isModalOpen;
    const { dirX, dirZ, isMoving, targetRotation } = computeMovementDelta(movement, canMove);

    let [curX, , curZ] = positionRef.current;
    const curY = positionRef.current[1];

    // Smoothly blend movement weight (idle <-> walking)
    const targetBlend = isMoving ? 1.0 : 0.0;
    moveBlendRef.current = THREE.MathUtils.lerp(moveBlendRef.current, targetBlend, Math.min(1, delta * 12));

    if (isMoving) {
      const dt = Math.min(delta, 0.1);
      curX += dirX * MOVE_SPEED * dt;
      curZ += dirZ * MOVE_SPEED * dt;

      targetRotationRef.current = targetRotation;
      walkCycleRef.current += dt * 11;
    }

    // Always enforce courtyard & multi-stage barrier collision bounds
    const [clampedX, clampedZ] =
      stageStatuses && stageStatuses.length > 0
        ? clampMultiStageCharacterPosition(curX, curZ, stageStatuses)
        : clampCharacterPosition(curX, curZ, gateStatus);
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

    // ===== ORGANIC IDLE & WALKING ANIMATION BLENDING =====
    const mb = moveBlendRef.current;
    const idleTime = time * 2.2;

    // Breathing & idle motions
    const idleBreath = Math.sin(idleTime) * 0.025;
    const idleBob = Math.sin(idleTime * 0.9) * 0.018;
    const idleArm = Math.sin(idleTime + 0.4) * 0.05;
    const idleHead = Math.sin(time * 1.1) * 0.035;

    // Walking stride & energetic arm swing
    const walkSwing = Math.sin(walkCycleRef.current) * 0.62;
    const walkBob = Math.abs(Math.sin(walkCycleRef.current * 2)) * 0.06;

    // Blended results
    const legSwing = walkSwing * mb;
    const armSwingLeft = (-walkSwing * 0.85) * mb + idleArm * (1 - mb);
    const armSwingRight = (walkSwing * 0.85) * mb - idleArm * (1 - mb);
    const bodyVertical = walkBob * mb + idleBob * (1 - mb);
    const torsoLean = 0.08 * mb; // Forward athletic lean when running

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = legSwing;
      leftLegRef.current.rotation.z = 0.02;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = -legSwing;
      rightLegRef.current.rotation.z = -0.02;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = armSwingLeft;
      leftArmRef.current.rotation.z = 0.12 + Math.abs(legSwing) * 0.08;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = armSwingRight;
      rightArmRef.current.rotation.z = -0.12 - Math.abs(legSwing) * 0.08;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = bodyVertical;
      bodyRef.current.rotation.x = torsoLean;
    }
    if (chestRef.current) {
      const breathScale = 1.0 + idleBreath * (1 - mb);
      chestRef.current.scale.set(breathScale, 1.0, breathScale);
    }
    if (headRef.current) {
      headRef.current.rotation.y = idleHead * (1 - mb);
      headRef.current.rotation.x = -torsoLean * 0.4;
    }

    // Notify React only when proximity milestone or active stage changes
    if (lastStageIndexRef.current !== activeStageIndex) {
      lastStageIndexRef.current = activeStageIndex;
      lastNearGateRef.current = null;
    }
    const nearGate = isPositionNearStage(clampedX, clampedZ, activeStageIndex, stageStatuses?.length ?? 3);
    if (lastNearGateRef.current !== nearGate) {
      lastNearGateRef.current = nearGate;
      onNearGateChange(nearGate);
    }
  });


  return (
    <group ref={groupRef} position={[0, 0, -6]}>
      {/* Root body group with vertical bobbing and forward lean */}
      <group ref={bodyRef}>
        {/* Chest & Torso Group with subtle breathing expansion */}
        <group ref={chestRef}>
          {/* Main Tunic - Royal Sapphire Indigo Silk */}
          <mesh position={[0, 1.15, 0]}>
            <capsuleGeometry args={[0.31, 0.46, 6, 12]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.65} />
          </mesh>

          {/* Traditional Crossed Royal Sash (សង្វារ) */}
          <group position={[0, 1.18, 0.02]}>
            {/* Left-to-right sash */}
            <mesh position={[0, 0, 0.08]} rotation={[0, 0, 0.52]}>
              <boxGeometry args={[0.09, 0.62, 0.28]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.35} metalness={0.35} />
            </mesh>
            {/* Right-to-left sash */}
            <mesh position={[0, 0, 0.08]} rotation={[0, 0, -0.52]}>
              <boxGeometry args={[0.09, 0.62, 0.28]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.35} metalness={0.35} />
            </mesh>
            {/* Center Royal Brooch Medallion with Emerald Gem */}
            <mesh position={[0, 0.03, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.05, 12]} />
              <meshStandardMaterial color="#FBBF24" metalness={0.6} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.03, 0.27]}>
              <octahedronGeometry args={[0.045, 0]} />
              <meshStandardMaterial color="#10B981" emissive="#059669" emissiveIntensity={0.6} roughness={0.1} />
            </mesh>
          </group>

          {/* Winged Shoulder Epaulets (ពានាហា) */}
          <mesh position={[-0.34, 1.42, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.16, 0.06, 0.22]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0.34, 1.42, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.16, 0.06, 0.22]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>

        {/* Traditional Pleated Chong Kben Wrap (សំពត់ចងក្បិន) */}
        <group position={[0, 0.88, 0]}>
          {/* Main Waist Wrap */}
          <mesh>
            <cylinderGeometry args={[0.33, 0.35, 0.24, 16]} />
            <meshStandardMaterial color="#B45309" roughness={0.7} />
          </mesh>
          {/* Golden Brocade Belt with Ruby Clasp */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.04, 0.36]}>
            <boxGeometry args={[0.12, 0.1, 0.04]} />
            <meshStandardMaterial color="#DC2626" metalness={0.3} roughness={0.2} />
          </mesh>
          {/* Front Pleated Kben Fold (ចងក្បិន) */}
          <mesh position={[0, -0.12, 0.22]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.16, 0.32, 0.1]} />
            <meshStandardMaterial color="#D97706" roughness={0.75} />
          </mesh>
        </group>

        {/* Head with Stylized Features & Lotus Top-Knot */}
        <group ref={headRef} position={[0, 1.72, 0]}>
          {/* Face */}
          <mesh>
            <sphereGeometry args={[0.26, 16, 16]} />
            <meshStandardMaterial color="#DEB887" roughness={0.78} />
          </mesh>

          {/* Golden Royal Headband (មាលា) */}
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.07, 16]} />
            <meshStandardMaterial color="#FBBF24" roughness={0.35} metalness={0.4} />
          </mesh>
          {/* Forehead Diadem Crest */}
          <mesh position={[0, 0.14, 0.25]}>
            <coneGeometry args={[0.05, 0.1, 6]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.5} />
          </mesh>

          {/* Traditional Top-Knot with Golden Lotus Crest */}
          <mesh position={[0, 0.28, -0.03]}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial color="#1F2937" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.4, -0.03]}>
            <coneGeometry args={[0.07, 0.16, 8]} />
            <meshStandardMaterial color="#FBBF24" roughness={0.3} metalness={0.5} />
          </mesh>

          {/* Stylized Friendly Eyes */}
          <mesh position={[-0.09, 0.02, 0.23]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0.09, 0.02, 0.23]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          {/* Eye Catchlights (Anime/hero sparkle) */}
          <mesh position={[-0.08, 0.035, 0.25]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.1, 0.035, 0.25]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Explorer Leather Backpack with Sastra Palm-Leaf Manuscript */}
        <group position={[0, 1.2, -0.32]}>
          {/* Saddle Leather Satchel */}
          <mesh>
            <boxGeometry args={[0.38, 0.42, 0.2]} />
            <meshStandardMaterial color="#6B3410" roughness={0.88} />
          </mesh>
          {/* Flap & Brass Buckle */}
          <mesh position={[0, 0.08, -0.11]}>
            <boxGeometry args={[0.32, 0.22, 0.04]} />
            <meshStandardMaterial color="#502409" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.04, -0.13]}>
            <boxGeometry args={[0.08, 0.06, 0.03]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Rolled Ancient Palm-Leaf Manuscript (សាស្ត្រាស្លឹករឹត) with Scarlet Ribbon */}
          <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.075, 0.075, 0.52, 12]} />
            <meshStandardMaterial color="#FEF3C7" roughness={0.55} />
          </mesh>
          <mesh position={[0.08, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.082, 0.082, 0.04, 12]} />
            <meshStandardMaterial color="#DC2626" roughness={0.5} />
          </mesh>
          <mesh position={[-0.08, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.082, 0.082, 0.04, 12]} />
            <meshStandardMaterial color="#DC2626" roughness={0.5} />
          </mesh>
        </group>

        {/* Left Arm with Golden Wrist Bangles */}
        <group ref={leftArmRef} position={[-0.42, 1.35, 0]}>
          <mesh position={[0, -0.26, 0]}>
            <capsuleGeometry args={[0.09, 0.36, 4, 8]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.65} />
          </mesh>
          {/* Golden Wrist Bangle (កងដៃ) */}
          <mesh position={[0, -0.44, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.05, 12]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.52, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#DEB887" />
          </mesh>
        </group>

        {/* Right Arm with Golden Wrist Bangles */}
        <group ref={rightArmRef} position={[0.42, 1.35, 0]}>
          <mesh position={[0, -0.26, 0]}>
            <capsuleGeometry args={[0.09, 0.36, 4, 8]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.65} />
          </mesh>
          {/* Golden Wrist Bangle (កងដៃ) */}
          <mesh position={[0, -0.44, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.05, 12]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.52, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#DEB887" />
          </mesh>
        </group>
      </group>

      {/* Left Leg with Golden Ankle Cuffs */}
      <group ref={leftLegRef} position={[-0.18, 0.82, 0]}>
        <mesh position={[0, -0.34, 0]}>
          <capsuleGeometry args={[0.11, 0.44, 4, 8]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} />
        </mesh>
        {/* Golden Ankle Cuff (កងជើង) */}
        <mesh position={[0, -0.56, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.04, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Foot / Traditional Sandal */}
        <mesh position={[0, -0.66, 0.06]}>
          <boxGeometry args={[0.13, 0.09, 0.22]} />
          <meshStandardMaterial color="#3B1C0B" />
        </mesh>
      </group>

      {/* Right Leg with Golden Ankle Cuffs */}
      <group ref={rightLegRef} position={[0.18, 0.82, 0]}>
        <mesh position={[0, -0.34, 0]}>
          <capsuleGeometry args={[0.11, 0.44, 4, 8]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} />
        </mesh>
        {/* Golden Ankle Cuff (កងជើង) */}
        <mesh position={[0, -0.56, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.04, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Foot / Traditional Sandal */}
        <mesh position={[0, -0.66, 0.06]}>
          <boxGeometry args={[0.13, 0.09, 0.22]} />
          <meshStandardMaterial color="#3B1C0B" />
        </mesh>
      </group>
    </group>
  );
}
