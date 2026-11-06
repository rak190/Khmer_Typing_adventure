import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../../hooks/useGltfAsset';
import type { GameMode, GateStatus } from '../../types';
import { gameAudio } from '../../../../lib/audio/gameAudio';

interface CrystalCaveExperienceProps {
  activeStageIndex: number;
  stageStatuses: GateStatus[];
  streak?: number;
  completedCount?: number;
  totalStageUnits?: number;
  mode?: GameMode;
  isUnlocked?: boolean;
}

/**
 * Level 7: Crystal Cave (រូងថ្មគ្រីស្តាល់)
 * Subterranean shaded shrine illuminated by radiant crystal clusters (Z, X, C, V).
 */
export default function CrystalCaveExperience({
  activeStageIndex,
  stageStatuses,
  streak = 0,
  completedCount = 0,
  totalStageUnits = 12,
  mode,
  isUnlocked = false,
}: CrystalCaveExperienceProps) {
  const lotusGlb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const altar1 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar2 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar3 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);

  const crystalsGroupRef = useRef<THREE.Group>(null);
  const caveDoorRef = useRef<THREE.Group>(null);
  const lastCompletedRef = useRef(completedCount);
  const hitPulseTimerRef = useRef(0);
  const hasTriggeredDoorAudioRef = useRef(false);

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

    if (crystalsGroupRef.current) {
      // Feedback B: Shimmer and sparkles intensify with typing progress and streak
      const shimmerRate = mode === 'typing' ? 5.0 + stageProgressRatio * 3.0 : 3.0;
      const pulseAdd = hitPulseTimerRef.current > 0 ? (hitPulseTimerRef.current / 0.45) * 0.9 : 0;
      const streakBonus = Math.min(streak * 0.05, 0.6);
      crystalsGroupRef.current.children.forEach((crystal, idx) => {
        const mesh = crystal as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.5 + Math.sin(t * shimmerRate + idx) * 0.3 + pulseAdd + streakBonus;
        }
      });
    }
    if (caveDoorRef.current) {
      const targetY = stage3Passed ? -4.0 : 0;
      caveDoorRef.current.position.y = THREE.MathUtils.lerp(caveDoorRef.current.position.y, targetY, delta * 2.0);
      if (stage3Passed && !hasTriggeredDoorAudioRef.current) {
        hasTriggeredDoorAudioRef.current = true;
        gameAudio.playMechanismActivation();
      }
    }
  });

  const crystals = useMemo(
    () => [
      { pos: [-3.2, 0.8, 2.0], color: '#6366F1', scale: 1.2, active: stage1Passed || (activeStageIndex === 0 && mode === 'typing') },
      { pos: [3.2, 0.9, 4.0], color: '#8B5CF6', scale: 1.4, active: stage1Passed || (activeStageIndex === 0 && mode === 'typing') },
      { pos: [-3.4, 0.9, 12.0], color: '#EC4899', scale: 1.3, active: stage2Passed || (activeStageIndex === 1 && mode === 'typing') },
      { pos: [3.4, 1.0, 14.5], color: '#10B981', scale: 1.5, active: stage2Passed || (activeStageIndex === 1 && mode === 'typing') },
    ],
    [activeStageIndex, mode, stage1Passed, stage2Passed],
  );

  return (
    <group name="CrystalCaveExperience">
      {/* 1. Dark Basalt Cavern Floor */}
      <mesh position={[0, 0, 9.5]} receiveShadow>
        <boxGeometry args={[8.0, 0.2, 28.0]} />
        <meshStandardMaterial color="#1E293B" roughness={0.92} />
      </mesh>

      {/* Cavern Arch Supports */}
      <mesh position={[-3.8, 2.5, 6.0]} castShadow>
        <boxGeometry args={[0.8, 5.0, 0.8]} />
        <meshStandardMaterial color="#0F172A" roughness={0.95} />
      </mesh>
      <mesh position={[3.8, 2.5, 6.0]} castShadow>
        <boxGeometry args={[0.8, 5.0, 0.8]} />
        <meshStandardMaterial color="#0F172A" roughness={0.95} />
      </mesh>
      <mesh position={[-3.8, 2.5, 16.0]} castShadow>
        <boxGeometry args={[0.8, 5.0, 0.8]} />
        <meshStandardMaterial color="#0F172A" roughness={0.95} />
      </mesh>
      <mesh position={[3.8, 2.5, 16.0]} castShadow>
        <boxGeometry args={[0.8, 5.0, 0.8]} />
        <meshStandardMaterial color="#0F172A" roughness={0.95} />
      </mesh>

      {/* 2. Giant Glowing Crystal Clusters */}
      <group ref={crystalsGroupRef}>
        {crystals.map((c, idx) => (
          <mesh
            key={idx}
            position={c.pos as [number, number, number]}
            scale={[c.scale, c.scale * 1.6, c.scale]}
            castShadow
          >
            <octahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial
              color={c.color}
              emissive={c.color}
              emissiveIntensity={c.active ? 1.5 : 0.3}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* 3. Altars (Stations 0, 1, 2) */}
      {altar1 && (
        <group position={[0, 0, -1.0]} scale={1.1}>
          <primitive object={altar1} />
          <pointLight color="#6366F1" intensity={2.0} distance={7} position={[0, 1.2, 0]} />
        </group>
      )}

      {altar2 && (
        <group position={[0, 0, 9.5]} scale={1.1}>
          <primitive object={altar2} />
          <pointLight color="#EC4899" intensity={stage1Passed ? 2.5 : 0.8} distance={7} position={[0, 1.2, 0]} />
        </group>
      )}

      {altar3 && (
        <group position={[0, 0, 19.5]} scale={1.2}>
          <primitive object={altar3} />
          <pointLight color="#10B981" intensity={stage2Passed ? 3.2 : 1.0} distance={8} position={[0, 1.4, 0]} />
        </group>
      )}

      {/* 4. Giant Cavern Monolith Exit Door (Z = 22.5) */}
      <group position={[0, 0, 22.5]} ref={caveDoorRef}>
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 5.0, 1.0]} />
          <meshStandardMaterial color="#0F172A" roughness={0.9} />
        </mesh>
        {/* Crystal Inlay Heart */}
        <mesh position={[0, 2.5, 0.55]}>
          <octahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={stage3Passed ? 1.8 : 0.4}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}
