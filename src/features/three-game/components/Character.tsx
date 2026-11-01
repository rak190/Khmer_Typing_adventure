import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../hooks/useGltfAsset';
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
  completedCount?: number;
  incorrectCount?: number;
  onNearGateChange: (isNear: boolean) => void;
};

const MOVE_SPEED = 5.8;

interface HeroGlbParts {
  waist: THREE.Object3D;
  chest: THREE.Object3D;
  cape: THREE.Object3D;
  head: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
}

export default function Character({
  positionRef,
  movement,
  mode,
  gateStatus,
  stageStatuses,
  activeStageIndex = 0,
  isModalOpen = false,
  completedCount = 0,
  incorrectCount = 0,
  onNearGateChange,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const capeRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const auraRingRef = useRef<THREE.Mesh>(null);

  const targetRotationRef = useRef<number>(0);
  const currentRotationRef = useRef<number>(0);
  const walkCycleRef = useRef<number>(0);
  const moveBlendRef = useRef<number>(0);
  const lastNearGateRef = useRef<boolean | null>(null);
  const lastStageIndexRef = useRef<number>(activeStageIndex);

  const prevCompletedRef = useRef<number>(completedCount);
  const prevIncorrectRef = useRef<number>(incorrectCount);
  const successPulseRef = useRef<number>(0);
  const mistakeShakeRef = useRef<number>(0);

  const glbScene = useGltfClone('/models/characters/khmer_student_hero.glb');

  const glbParts = useMemo<HeroGlbParts | null>(() => {
    if (!glbScene) return null;
    const waist = glbScene.getObjectByName('HeroWaistMesh');
    const chest = glbScene.getObjectByName('HeroChestMesh');
    const cape = glbScene.getObjectByName('HeroCapeMesh');
    const head = glbScene.getObjectByName('HeroHeadMesh');
    const leftArm = glbScene.getObjectByName('HeroLeftArmMesh');
    const rightArm = glbScene.getObjectByName('HeroRightArmMesh');
    const leftLeg = glbScene.getObjectByName('HeroLeftLegMesh');
    const rightLeg = glbScene.getObjectByName('HeroRightLegMesh');
    if (!waist || !chest || !cape || !head || !leftArm || !rightArm || !leftLeg || !rightLeg) {
      return null;
    }
    return {
      waist: waist.clone(true),
      chest: chest.clone(true),
      cape: cape.clone(true),
      head: head.clone(true),
      leftArm: leftArm.clone(true),
      rightArm: rightArm.clone(true),
      leftLeg: leftLeg.clone(true),
      rightLeg: rightLeg.clone(true),
    };
  }, [glbScene]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);
    const canMove = (mode === 'exploration' || mode === 'completed') && !isModalOpen;
    const { dirX, dirZ, isMoving, targetRotation } = computeMovementDelta(movement, canMove);

    if (completedCount > prevCompletedRef.current) {
      successPulseRef.current = 1.0;
    }
    prevCompletedRef.current = completedCount;

    if (incorrectCount > prevIncorrectRef.current) {
      mistakeShakeRef.current = 1.0;
    }
    prevIncorrectRef.current = incorrectCount;

    successPulseRef.current = Math.max(0, successPulseRef.current - dt * 4.2);
    mistakeShakeRef.current = Math.max(0, mistakeShakeRef.current - dt * 3.8);

    let [curX, , curZ] = positionRef.current;
    const curY = positionRef.current[1];

    const targetBlend = isMoving ? 1.0 : 0.0;
    moveBlendRef.current = THREE.MathUtils.lerp(moveBlendRef.current, targetBlend, Math.min(1, dt * 12));

    if (isMoving) {
      curX += dirX * MOVE_SPEED * dt;
      curZ += dirZ * MOVE_SPEED * dt;
      targetRotationRef.current = targetRotation;
      walkCycleRef.current += dt * 11.5;
    } else if (mode === 'typing' || mode === 'opening') {
      // Face toward the temple gate/altar (+Z) during typing or gate opening
      targetRotationRef.current = 0;
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
    currentRotationRef.current += angleDiff * Math.min(1, dt * 12);
    const turnBank = isMoving ? THREE.MathUtils.clamp(-angleDiff * 0.16, -0.14, 0.14) : 0;

    if (groupRef.current) {
      groupRef.current.position.set(clampedX, curY, clampedZ);
      groupRef.current.rotation.y = currentRotationRef.current;
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

    if (auraRingRef.current) {
      auraRingRef.current.rotation.z = time * 0.9;
      const ringScale = nearGate || mode === 'typing' ? 1.08 + Math.sin(time * 4) * 0.06 : 0.92;
      auraRingRef.current.scale.set(ringScale, ringScale, 1);
    }

    // 1. STAGE / GATE COMPLETION CELEBRATION ANIMATION (when opening or standing celebrating)
    if (mode === 'opening' || (mode === 'completed' && !isMoving)) {
      const cheerBounce = Math.abs(Math.sin(time * 6.5)) * 0.13;
      const cheerWave = Math.sin(time * 9.0);

      if (bodyRef.current) {
        bodyRef.current.position.y = cheerBounce;
        bodyRef.current.rotation.x = -0.04;
        bodyRef.current.rotation.z = Math.sin(time * 4.5) * 0.04;
      }
      if (chestRef.current) {
        chestRef.current.scale.set(1.03, 1.04, 1.03);
        chestRef.current.rotation.y = Math.sin(time * 4.5) * 0.08;
      }
      if (capeRef.current) {
        capeRef.current.rotation.x = 0.22 + cheerBounce * 1.4;
      }
      if (headRef.current) {
        headRef.current.position.y = 1.72 + cheerBounce * 0.3;
        headRef.current.rotation.x = -0.08 + Math.sin(time * 6.5) * 0.05;
        headRef.current.rotation.y = Math.sin(time * 3.2) * 0.10;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -2.35 + cheerWave * 0.18;
        leftArmRef.current.rotation.z = 0.28;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -2.35 - cheerWave * 0.18;
        rightArmRef.current.rotation.z = -0.28;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -cheerBounce * 0.9;
      if (rightLegRef.current) rightLegRef.current.rotation.x = cheerBounce * 0.6;
      return;
    }

    // 2. ALTAR / TYPING INTERACTION & MISTAKE REACTION ANIMATION
    if (mode === 'typing') {
      const focusBreath = Math.sin(time * 3.2) * 0.018;
      const nod = successPulseRef.current * Math.sin(successPulseRef.current * Math.PI) * 0.18;
      const shake = mistakeShakeRef.current * Math.sin(time * 36) * 0.22;

      if (bodyRef.current) {
        bodyRef.current.position.y = focusBreath + successPulseRef.current * 0.03;
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.05, dt * 8);
        bodyRef.current.rotation.z = shake * 0.25;
      }
      if (chestRef.current) {
        const s = 1 + Math.sin(time * 3.2) * 0.015;
        chestRef.current.scale.set(s, s, s);
        chestRef.current.rotation.y = shake * 0.4;
      }
      if (capeRef.current) {
        capeRef.current.rotation.x = 0.08 + Math.sin(time * 2.4) * 0.04;
      }
      if (headRef.current) {
        headRef.current.position.y = 1.72 + focusBreath * 0.5;
        headRef.current.rotation.x = 0.08 + nod;
        headRef.current.rotation.y = shake;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.68 - nod * 0.9 + Math.sin(time * 5) * 0.04;
        leftArmRef.current.rotation.z = -0.14;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.68 - nod * 0.9 + Math.cos(time * 5) * 0.04;
        rightArmRef.current.rotation.z = 0.14;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      return;
    }

    // 3. ORGANIC IDLE & WALKING ANIMATION BLENDING
    const mb = moveBlendRef.current;
    const idleTime = time * 2.3;

    const idleBreath = Math.sin(idleTime) * 0.022;
    const idleBob = Math.sin(idleTime * 0.9) * 0.018;
    const idleArm = Math.sin(idleTime + 0.4) * 0.045;
    const idleHead = Math.sin(time * 1.1) * 0.05;

    const walkSwing = Math.sin(walkCycleRef.current) * 0.65;
    const walkBob = Math.abs(Math.sin(walkCycleRef.current * 2)) * 0.065;

    const legSwing = walkSwing * mb;
    const armSwingLeft = -walkSwing * 0.88 * mb + idleArm * (1 - mb);
    const armSwingRight = walkSwing * 0.88 * mb - idleArm * (1 - mb);
    const bodyVertical = walkBob * mb + idleBob * (1 - mb);
    const torsoLean = 0.085 * mb;

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = legSwing;
      leftLegRef.current.rotation.z = 0.015;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = -legSwing;
      rightLegRef.current.rotation.z = -0.015;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = armSwingLeft;
      leftArmRef.current.rotation.z = 0.08 + Math.abs(legSwing) * 0.08;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = armSwingRight;
      rightArmRef.current.rotation.z = -0.08 - Math.abs(legSwing) * 0.08;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = bodyVertical;
      bodyRef.current.rotation.x = torsoLean;
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(
        bodyRef.current.rotation.z,
        turnBank + walkSwing * 0.025 * mb,
        dt * 10
      );
    }
    if (chestRef.current) {
      const breathScale = 1.0 + idleBreath * (1 - mb);
      chestRef.current.scale.set(breathScale, 1.0, breathScale);
      chestRef.current.rotation.y = -walkSwing * 0.07 * mb + Math.sin(time * 1.1) * 0.025 * (1 - mb);
    }
    if (capeRef.current) {
      capeRef.current.rotation.x =
        (0.28 + Math.abs(walkSwing) * 0.22) * mb + (0.06 + Math.sin(time * 1.8) * 0.04) * (1 - mb);
    }
    if (headRef.current) {
      headRef.current.position.y = 1.72 + bodyVertical * 0.35;
      headRef.current.rotation.y = idleHead * (1 - mb) + walkSwing * 0.035 * mb;
      headRef.current.rotation.x = -torsoLean * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -6]}>
      {/* Soft Ground Contact Shadow & Explorer Aura Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[0.52, 24]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.32} />
      </mesh>
      <mesh ref={auraRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 0]}>
        <ringGeometry args={[0.46, 0.56, 28]} />
        <meshBasicMaterial
          color={mode === 'typing' ? '#38BDF8' : '#FBBF24'}
          transparent
          opacity={mode === 'typing' ? 0.65 : 0.32}
        />
      </mesh>

      {/* Animated Torso & Head Group */}
      <group ref={bodyRef}>
        {/* Waist Belt & Pleated Chong Kben (pivot Y = 0.88) */}
        <group position={[0, 0.88, 0]}>
          {glbParts ? (
            <primitive object={glbParts.waist} />
          ) : (
            <group position={[0, -0.09, 0]}>
              <mesh castShadow receiveShadow position={[0, 0.79, 0]}>
                <cylinderGeometry args={[0.24, 0.27, 0.34, 16]} />
                <meshStandardMaterial color="#9A4212" roughness={0.68} />
              </mesh>
              <mesh castShadow position={[0, 0.91, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.08, 16]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.28} metalness={0.65} />
              </mesh>
            </group>
          )}
        </group>

        {/* Chest, Teal Tunic, Golden Sangvar, Pauldrons & Satchel */}
        <group ref={chestRef} position={[0, 1.15, 0]}>
          {glbParts ? (
            <primitive object={glbParts.chest} />
          ) : (
            <group>
              <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.21, 0.26, 0.5, 16]} />
                <meshStandardMaterial color="#0F766E" roughness={0.58} />
              </mesh>
              <mesh castShadow position={[0, 0.09, 0.22]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.12, 0.12, 0.05]} />
                <meshStandardMaterial
                  color="#38BDF8"
                  emissive="#0284C7"
                  emissiveIntensity={1.2}
                  roughness={0.15}
                />
              </mesh>
            </group>
          )}

          {/* Flowing Adventurer Capelet */}
          <group ref={capeRef} position={[0, 0.29, -0.12]}>
            {glbParts ? (
              <primitive object={glbParts.cape} />
            ) : (
              <mesh castShadow position={[0, -0.26, -0.06]} rotation={[0.18, 0, 0]}>
                <boxGeometry args={[0.48, 0.58, 0.04]} />
                <meshStandardMaterial color="#0B534E" roughness={0.62} />
              </mesh>
            )}
          </group>
        </group>

        {/* Expressive Head, Spiky Hair & Sapphire Diamond Diadem */}
        <group ref={headRef} position={[0, 1.62, 0]}>
          {glbParts ? (
            <primitive object={glbParts.head} />
          ) : (
            <group>
              <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
                <sphereGeometry args={[0.26, 18, 16]} />
                <meshStandardMaterial color="#E2A373" roughness={0.62} />
              </mesh>
              <mesh castShadow position={[0, 0.12, -0.03]}>
                <sphereGeometry args={[0.27, 16, 14]} />
                <meshStandardMaterial color="#1D130E" roughness={0.52} />
              </mesh>
              <mesh castShadow position={[0, 0.135, 0.265]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.12, 0.14, 0.045]} />
                <meshStandardMaterial
                  color="#38BDF8"
                  emissive="#0284C7"
                  emissiveIntensity={1.2}
                  roughness={0.15}
                />
              </mesh>
            </group>
          )}
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.22, 1.34, 0]}>
          {glbParts ? (
            <primitive object={glbParts.leftArm} />
          ) : (
            <mesh castShadow position={[0, -0.24, 0]}>
              <cylinderGeometry args={[0.075, 0.085, 0.42, 12]} />
              <meshStandardMaterial color="#E2A373" roughness={0.62} />
            </mesh>
          )}
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.22, 1.34, 0]}>
          {glbParts ? (
            <primitive object={glbParts.rightArm} />
          ) : (
            <mesh castShadow position={[0, -0.24, 0]}>
              <cylinderGeometry args={[0.075, 0.085, 0.42, 12]} />
              <meshStandardMaterial color="#E2A373" roughness={0.62} />
            </mesh>
          )}
        </group>

        {/* Left Leg (articulated with pelvis) */}
        <group ref={leftLegRef} position={[-0.14, 0.78, 0]}>
          {glbParts ? (
            <primitive object={glbParts.leftLeg} />
          ) : (
            <mesh castShadow position={[0, -0.32, 0]}>
              <cylinderGeometry args={[0.085, 0.1, 0.56, 12]} />
              <meshStandardMaterial color="#9A4212" roughness={0.68} />
            </mesh>
          )}
        </group>

        {/* Right Leg (articulated with pelvis) */}
        <group ref={rightLegRef} position={[0.14, 0.78, 0]}>
          {glbParts ? (
            <primitive object={glbParts.rightLeg} />
          ) : (
            <mesh castShadow position={[0, -0.32, 0]}>
              <cylinderGeometry args={[0.085, 0.1, 0.56, 12]} />
              <meshStandardMaterial color="#9A4212" roughness={0.68} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}
