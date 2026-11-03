import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../../hooks/useGltfAsset';
import type { GameMode, GateStatus } from '../../types';
import { gameAudio } from '../../../../lib/audio/gameAudio';

interface SacredRiverExperienceProps {
  activeStageIndex: number;
  stageStatuses: GateStatus[];
  streak?: number;
  completedCount?: number;
  totalStageUnits?: number;
  mode?: GameMode;
  isUnlocked?: boolean;
}

/**
 * Level 8: Sacred River Crossing (ការឆ្លងកាត់ស្ទឹងស័ក្តិសិទ្ធិ)
 * Sacred water channel where typing advances a ceremonial dragon barge toward the Temple Guardian.
 */
export default function SacredRiverExperience({
  activeStageIndex,
  stageStatuses,
  streak = 0,
  completedCount = 0,
  totalStageUnits = 12,
  mode,
  isUnlocked = false,
}: SacredRiverExperienceProps) {
  const lotusGlb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const altar1 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar2 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar3 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);

  const bargeRef = useRef<THREE.Group>(null);
  const riverRef = useRef<THREE.Mesh>(null);
  const guardianGateRef = useRef<THREE.Group>(null);
  const lastCompletedRef = useRef(completedCount);
  const hitPulseTimerRef = useRef(0);
  const hasTriggeredGateAudioRef = useRef(false);

  const stage1Passed = stageStatuses[0] === 'open' || isUnlocked;
  const stage2Passed = stageStatuses[1] === 'open' || isUnlocked;
  const stage3Passed = stageStatuses[2] === 'open' || isUnlocked;

  const stageProgressRatio = Math.min(1, Math.max(0, completedCount / Math.max(1, totalStageUnits)));

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Detect keystroke hits (Feedback A)
    if (completedCount > lastCompletedRef.current) {
      hitPulseTimerRef.current = 0.4;
      lastCompletedRef.current = completedCount;
    }
    if (hitPulseTimerRef.current > 0) {
      hitPulseTimerRef.current = Math.max(0, hitPulseTimerRef.current - delta);
    }

    if (bargeRef.current) {
      const pulseScale = 1.0 + (hitPulseTimerRef.current > 0 ? (hitPulseTimerRef.current / 0.4) * 0.04 : 0);
      bargeRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      // Gentle water bobbing and rocking
      bargeRef.current.position.y = Math.sin(t * 1.5) * 0.08;
      bargeRef.current.rotation.z = Math.sin(t * 1.2) * 0.02;

      // Feedback B: Barge sails forward with typing progress across the river
      let targetZ = 4.125;
      if (stage2Passed) {
        targetZ = 14.5;
      } else if (stage1Passed) {
        targetZ = 14.5;
      } else if (activeStageIndex === 1 && mode === 'typing') {
        targetZ = 4.125 + stageProgressRatio * (14.5 - 4.125);
      } else {
        targetZ = 4.125;
      }
      bargeRef.current.position.z = THREE.MathUtils.lerp(bargeRef.current.position.z, targetZ, delta * 3.0);
    }
    if (riverRef.current) {
      const mat = riverRef.current.material as THREE.MeshStandardMaterial;
      if (mat.roughness !== undefined) {
        mat.roughness = 0.18 + Math.sin(t * 2.0) * 0.04;
      }
    }
    if (guardianGateRef.current) {
      const targetY = stage3Passed ? -4.5 : 0;
      guardianGateRef.current.position.y = THREE.MathUtils.lerp(guardianGateRef.current.position.y, targetY, delta * 2.0);
      if (stage3Passed && !hasTriggeredGateAudioRef.current) {
        hasTriggeredGateAudioRef.current = true;
        gameAudio.playMechanismActivation();
      }
    }
  });

  const streakBonus = Math.min(streak * 0.05, 0.4);

  return (
    <group name="SacredRiverExperience">
      {/* 1. Reflective Sacred Baray Water Channel */}
      <mesh position={[0, -0.15, 9.5]} receiveShadow ref={riverRef}>
        <boxGeometry args={[14.0, 0.2, 32.0]} />
        <meshStandardMaterial
          color="#0F766E"
          emissive="#115E59"
          emissiveIntensity={0.25}
          roughness={0.16}
          metalness={0.8}
        />
      </mesh>

      {/* 2. Moored Ceremonial Dragon Barge (Centered along the river channel at X = 0) */}
      <group position={[0, 0, 4.125]} ref={bargeRef}>
        {/* Wooden Hull */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.5, 7.6]} />
          <meshStandardMaterial color="#78350F" roughness={0.78} />
        </mesh>
        {/* Walkable Teak Deck Planks */}
        <mesh position={[0, 0.42, 0]} receiveShadow>
          <boxGeometry args={[2.7, 0.05, 7.2]} />
          <meshStandardMaterial color="#92400E" roughness={0.72} />
        </mesh>
        {/* Carved Dragon/Naga Prow facing downstream toward Guardian Shore */}
        <mesh position={[0, 0.85, 3.8]} castShadow>
          <coneGeometry args={[0.55, 1.3, 8]} />
          <meshStandardMaterial
            color="#F59E0B"
            emissive="#D97706"
            emissiveIntensity={0.5 + streakBonus}
            roughness={0.55}
          />
        </mesh>
        {/* Stern Carved Dragon Tail */}
        <mesh position={[0, 0.7, -3.8]} castShadow>
          <coneGeometry args={[0.45, 1.1, 8]} />
          <meshStandardMaterial color="#D97706" roughness={0.65} />
        </mesh>
        {/* Elevated Ceremonial Canopy (Head clearance for adventurer) */}
        <mesh position={[0, 2.3, 0]} castShadow>
          <boxGeometry args={[3.4, 0.15, 4.6]} />
          <meshStandardMaterial color="#DC2626" roughness={0.7} />
        </mesh>
        {/* Canopy Support Pillars */}
        {[-1.4, 1.4].map((px) =>
          [-1.8, 1.8].map((pz) => (
            <mesh key={`canopy-pillar-${px}-${pz}`} position={[px, 1.25, pz]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 2.1, 8]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.4} />
            </mesh>
          ))
        )}
      </group>

      {/* 3. Three Stone Crossing Piers (Stations 0, 1, 2) */}
      {/* Pier 0 */}
      <mesh position={[0, 0, -1.0]} receiveShadow>
        <boxGeometry args={[4.2, 0.25, 4.5]} />
        <meshStandardMaterial color="#854D0E" roughness={0.88} />
      </mesh>
      {altar1 && (
        <group position={[0, 0, -1.0]} scale={1.1}>
          <primitive object={altar1} />
          <pointLight color="#F59E0B" intensity={1.8} distance={6} position={[0, 1.2, 0]} />
        </group>
      )}

      {/* Pier 1 (Mid Island Pier) */}
      <mesh position={[0, 0, 9.5]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.8, 0.25, 16]} />
        <meshStandardMaterial color="#854D0E" roughness={0.88} />
      </mesh>
      {altar2 && (
        <group position={[0, 0, 9.5]} scale={1.1}>
          <primitive object={altar2} />
          <pointLight color="#38BDF8" intensity={stage1Passed ? 2.5 : 0.8} distance={7} position={[0, 1.2, 0]} />
        </group>
      )}

      {/* Pier 2 (Guardian Shore Landing) */}
      <mesh position={[0, 0, 19.5]} receiveShadow>
        <boxGeometry args={[5.0, 0.25, 5.0]} />
        <meshStandardMaterial color="#854D0E" roughness={0.88} />
      </mesh>
      {altar3 && (
        <group position={[0, 0, 19.5]} scale={1.2}>
          <primitive object={altar3} />
          <pointLight color="#10B981" intensity={stage2Passed ? 3.2 : 1.0} distance={8} position={[0, 1.4, 0]} />
        </group>
      )}

      {/* 4. Guardian Shore Gateway (Z = 23.5) */}
      <group position={[0, 0, 23.5]} ref={guardianGateRef}>
        <mesh position={[-2.8, 2.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 5.6, 1.0]} />
          <meshStandardMaterial color="#78350F" roughness={0.9} />
        </mesh>
        <mesh position={[2.8, 2.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 5.6, 1.0]} />
          <meshStandardMaterial color="#78350F" roughness={0.9} />
        </mesh>
        <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.2, 1.0, 1.2]} />
          <meshStandardMaterial color="#92400E" roughness={0.88} />
        </mesh>
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[4.6, 4.6, 0.4]} />
          <meshStandardMaterial
            color={stage3Passed ? '#047857' : '#92400E'}
            emissive={stage3Passed ? '#10B981' : '#F59E0B'}
            emissiveIntensity={stage3Passed ? 1.6 : 0.35}
            roughness={0.6}
          />
        </mesh>
      </group>
    </group>
  );
}
