import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../../hooks/useGltfAsset';
import type { GameMode, GateStatus } from '../../types';
import { gameAudio } from '../../../../lib/audio/gameAudio';

interface JungleCrossroadsExperienceProps {
  activeStageIndex: number;
  stageStatuses: GateStatus[];
  streak?: number;
  completedCount?: number;
  totalStageUnits?: number;
  mode?: GameMode;
  isUnlocked?: boolean;
}

/**
 * Level 4: Jungle Crossroads (ផ្លូវបំបែកព្រៃស្រោង)
 * Branching jungle paths where G and H index reaches unlock western grove and central shrine.
 */
export default function JungleCrossroadsExperience({
  activeStageIndex,
  stageStatuses,
  streak = 0,
  completedCount = 0,
  totalStageUnits = 12,
  mode,
  isUnlocked = false,
}: JungleCrossroadsExperienceProps) {
  const lotusGlb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const altar1 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar2 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar3 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);

  const junctionRuneRef = useRef<THREE.Group>(null);
  const shrineGateRef = useRef<THREE.Group>(null);
  const lastCompletedRef = useRef(completedCount);
  const hitPulseTimerRef = useRef(0);
  const hasTriggeredGateAudioRef = useRef(false);

  const stage1Passed = (stageStatuses[0] === 'opening' || stageStatuses[0] === 'open') || isUnlocked;
  const stage2Passed = (stageStatuses[1] === 'opening' || stageStatuses[1] === 'open') || isUnlocked;
  const stage3Passed = (stageStatuses[2] === 'opening' || stageStatuses[2] === 'open') || isUnlocked;

  const stageProgressRatio = Math.min(1, Math.max(0, completedCount / Math.max(1, totalStageUnits)));

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Detect keystroke hits (Feedback A)
    if (completedCount > lastCompletedRef.current) {
      hitPulseTimerRef.current = 0.45;
      lastCompletedRef.current = completedCount;
    }
    if (hitPulseTimerRef.current > 0) {
      hitPulseTimerRef.current = Math.max(0, hitPulseTimerRef.current - delta);
    }

    if (junctionRuneRef.current) {
      const streakBonus = Math.min(streak * 0.05, 0.6);
      const pulseScale = 1.0 + (hitPulseTimerRef.current > 0 ? (hitPulseTimerRef.current / 0.45) * 0.12 : 0);
      const rotSpeed = mode === 'typing' ? 0.8 + stageProgressRatio * 1.2 + streakBonus : 0.4;
      junctionRuneRef.current.rotation.y = t * rotSpeed;
      junctionRuneRef.current.scale.setScalar(pulseScale);
    }
    if (shrineGateRef.current) {
      const targetY = stage3Passed ? -3.5 : 0;
      shrineGateRef.current.position.y = THREE.MathUtils.lerp(shrineGateRef.current.position.y, targetY, delta * 2.5);
      if (stage3Passed && !hasTriggeredGateAudioRef.current) {
        hasTriggeredGateAudioRef.current = true;
        gameAudio.playMechanismActivation();
      }
    }
  });

  return (
    <group name="JungleCrossroadsExperience">
      {/* 1. Crossroads Junction Platform (Z = -2 to +2) */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[4.2, 4.5, 0.15, 20]} />
        <meshStandardMaterial color="#854D0E" roughness={0.88} />
      </mesh>

      {/* Rotating Junction Compass Runes */}
      <group position={[0, 0.14, 0]} ref={junctionRuneRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 2.0, 16]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 2. Left Branch: West Grove Trail (G / ង Reach) */}
      <mesh position={[-2.2, 0.02, 5.0]} rotation={[0, -0.32, 0]} receiveShadow>
        <boxGeometry args={[2.4, 0.12, 9.0]} />
        <meshStandardMaterial
          color={stage1Passed ? '#065F46' : '#78350F'}
          emissive={stage1Passed ? '#047857' : '#000000'}
          emissiveIntensity={stage1Passed ? 0.35 : 0}
          roughness={0.85}
        />
      </mesh>

      {/* West Trail Lanterns & Rune Marker */}
      <mesh position={[-3.8, 1.0, 4.5]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, 1.8, 8]} />
        <meshStandardMaterial color="#78350F" roughness={0.9} />
      </mesh>
      <pointLight color="#10B981" intensity={stage1Passed ? 2.0 : 0.4} distance={6} position={[-3.8, 2.0, 4.5]} />

      {/* Connecting Crossroads Transversal Trail (West to East Junction) */}
      <mesh position={[0, 0.015, 9.5]} rotation={[0, 0.5, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.1, 7.5]} />
        <meshStandardMaterial
          color={stage1Passed ? '#5C4D3C' : '#45382B'}
          roughness={0.88}
        />
      </mesh>

      {/* 3. Right Branch: East Shrine Trail (H reach) */}
      <mesh position={[2.2, 0.02, 13.5]} rotation={[0, 0.28, 0]} receiveShadow>
        <boxGeometry args={[2.4, 0.12, 10.0]} />
        <meshStandardMaterial
          color={stage2Passed ? '#1E3A8A' : '#78350F'}
          emissive={stage2Passed ? '#1D4ED8' : '#000000'}
          emissiveIntensity={stage2Passed ? 0.35 : 0}
          roughness={0.85}
        />
      </mesh>

      {/* East Trail Lanterns */}
      <mesh position={[4.2, 1.0, 14.0]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, 1.8, 8]} />
        <meshStandardMaterial color="#78350F" roughness={0.9} />
      </mesh>
      <pointLight color="#38BDF8" intensity={stage2Passed ? 2.5 : 0.4} distance={7} position={[4.2, 2.0, 14.0]} />

      {/* 4. Altars (Stations 0, 1, 2) */}
      {altar1 && (
        <group position={[0, 0, -0.5]} scale={1.1}>
          <primitive object={altar1} />
          <pointLight color="#F59E0B" intensity={activeStageIndex === 0 ? 2.5 : 1.2} distance={6} position={[0, 1.2, 0]} />
        </group>
      )}

      {altar2 && (
        <group position={[-3.5, 0, 9.0]} scale={1.1}>
          <primitive object={altar2} />
          <pointLight color="#10B981" intensity={stage1Passed ? 2.2 : activeStageIndex === 1 ? 2.0 : 0.8} distance={6} position={[0, 1.2, 0]} />
        </group>
      )}

      {altar3 && (
        <group position={[3.5, 0, 18.0]} scale={1.2}>
          <primitive object={altar3} />
          <pointLight color="#38BDF8" intensity={stage2Passed ? 3.0 : activeStageIndex === 2 ? 2.2 : 1.0} distance={7} position={[0, 1.4, 0]} />
        </group>
      )}

      {/* 5. Central Jungle Shrine Portal (Z = 21.0) */}
      <group position={[3.5, 0, 21.0]} ref={shrineGateRef}>
        <mesh position={[-2.2, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 5.0, 0.8]} />
          <meshStandardMaterial color="#78350F" roughness={0.9} />
        </mesh>
        <mesh position={[2.2, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 5.0, 0.8]} />
          <meshStandardMaterial color="#78350F" roughness={0.9} />
        </mesh>
        <mesh position={[0, 4.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 0.9, 1.0]} />
          <meshStandardMaterial color="#92400E" roughness={0.88} />
        </mesh>
        {/* Runic Barrier Center */}
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[3.6, 4.0, 0.4]} />
          <meshStandardMaterial
            color={stage3Passed ? '#047857' : '#854D0E'}
            emissive={stage3Passed ? '#10B981' : '#B45309'}
            emissiveIntensity={stage3Passed ? 1.5 : 0.3}
            roughness={0.65}
          />
        </mesh>
      </group>
    </group>
  );
}
