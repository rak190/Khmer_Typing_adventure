import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../../hooks/useGltfAsset';
import type { GameMode, GateStatus } from '../../types';
import { gameAudio } from '../../../../lib/audio/gameAudio';

interface LotusGardenExperienceProps {
  activeStageIndex: number;
  stageStatuses: GateStatus[];
  streak?: number;
  completedCount?: number;
  totalStageUnits?: number;
  mode?: GameMode;
  isUnlocked?: boolean;
}

/**
 * Level 2: Enchanted Lotus Garden (សួនផ្កាឈូកទិព្វ)
 * Shallow reflective water courtyard with sacred blooming lotus platforms (J, K, L, ;).
 */
export default function LotusGardenExperience({
  activeStageIndex,
  stageStatuses,
  streak = 0,
  completedCount = 0,
  totalStageUnits = 12,
  mode,
  isUnlocked = false,
}: LotusGardenExperienceProps) {
  const lotusGlb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const altar1 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar2 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar3 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);

  const poolWaterRef = useRef<THREE.Mesh>(null);
  const petalsRef = useRef<THREE.Group>(null);
  const exitPortalRef = useRef<THREE.Group>(null);
  const lastCompletedRef = useRef(completedCount);
  const hitPulseTimerRef = useRef(0);
  const hasTriggeredExitAudioRef = useRef(false);

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

    if (poolWaterRef.current) {
      const mat = poolWaterRef.current.material as THREE.MeshStandardMaterial;
      if (mat.roughness !== undefined) {
        mat.roughness = 0.15 + Math.sin(t * 1.5) * 0.05;
      }
    }
    if (petalsRef.current) {
      const pulse = hitPulseTimerRef.current > 0 ? (hitPulseTimerRef.current / 0.4) * 0.15 : 0;
      petalsRef.current.children.forEach((child, idx) => {
        child.position.y = Math.sin(t * 2.0 + idx) * 0.04;
        // Blooming flower petal (children[1]) and water aura ring (children[2]) pulse on keystrokes
        if (child.children[1]) {
          child.children[1].scale.setScalar(1.0 + pulse);
        }
        if (child.children[2]) {
          child.children[2].scale.setScalar(1.0 + pulse * 0.6);
        }
      });
    }
    if (exitPortalRef.current) {
      const targetScale = stage3Passed ? 1.0 : 0.001;
      exitPortalRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 3.0);
      if (stage3Passed && !hasTriggeredExitAudioRef.current) {
        hasTriggeredExitAudioRef.current = true;
        gameAudio.playMechanismActivation();
      }
    }
  });

  // Calculate pad emergence heights (Feedback B & C)
  const pad01Rise = stage1Passed ? 1.0 : activeStageIndex === 0 ? Math.min(1, stageProgressRatio * 1.2) : 0.2;
  const pad23Rise = stage2Passed ? 1.0 : activeStageIndex === 1 ? Math.min(1, stageProgressRatio * 1.2) : stage1Passed ? 0.4 : 0.1;
  const streakBonus = Math.min(streak * 0.05, 0.4);

  const lotusPads = useMemo(
    () => [
      { key: 'J (់)', pos: [-1.4, -0.3 + pad01Rise * 0.38, 1.8], color: '#F59E0B', active: stage1Passed || (activeStageIndex === 0 && mode === 'typing'), scale: 0.5 + pad01Rise * 0.5 },
      { key: 'K (ក)', pos: [1.4, -0.3 + pad01Rise * 0.38, 3.2], color: '#38BDF8', active: stage1Passed || (activeStageIndex === 0 && mode === 'typing'), scale: 0.5 + pad01Rise * 0.5 },
      { key: 'L (ល)', pos: [-1.4, -0.3 + pad23Rise * 0.38, 8.5], color: '#10B981', active: stage2Passed || (activeStageIndex === 1 && mode === 'typing'), scale: 0.5 + pad23Rise * 0.5 },
      { key: '; (ើ)', pos: [1.4, -0.3 + pad23Rise * 0.38, 10.2], color: '#EC4899', active: stage2Passed || (activeStageIndex === 1 && mode === 'typing'), scale: 0.5 + pad23Rise * 0.5 },
    ],
    [activeStageIndex, mode, pad01Rise, pad23Rise, stage1Passed, stage2Passed],
  );

  return (
    <group name="LotusGardenExperience">
      {/* 1. Reflective Water Pool Basin */}
      <mesh position={[0, -0.05, 6.0]} receiveShadow ref={poolWaterRef}>
        <boxGeometry args={[11.0, 0.12, 22.0]} />
        <meshStandardMaterial
          color="#064E3B"
          emissive="#047857"
          emissiveIntensity={0.25 + (stage2Passed ? 0.2 : 0)}
          roughness={0.12}
          metalness={0.85}
        />
      </mesh>

      {/* Decorative Stone Basin Curbs */}
      <mesh position={[-5.8, 0.2, 6.0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.4, 22.4]} />
        <meshStandardMaterial color="#854D0E" roughness={0.88} />
      </mesh>
      <mesh position={[5.8, 0.2, 6.0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.4, 22.4]} />
        <meshStandardMaterial color="#854D0E" roughness={0.88} />
      </mesh>

      {/* 2. Floating Giant Lotus Flower Stepping Pads */}
      <group ref={petalsRef}>
        {lotusPads.map((pad, idx) => (
          <group key={idx} position={pad.pos as [number, number, number]} scale={pad.scale}>
            {/* Lily Pad Base */}
            <mesh position={[0, 0.02, 0]} receiveShadow>
              <cylinderGeometry args={[0.95, 1.05, 0.08, 16]} />
              <meshStandardMaterial color={pad.active ? '#15803D' : '#14532D'} roughness={0.75} />
            </mesh>
            {/* Blooming Flower Petals */}
            <mesh position={[0, 0.16, 0]} castShadow>
              <coneGeometry args={[0.55, 0.35, 8]} />
              <meshStandardMaterial
                color={pad.color}
                emissive={pad.color}
                emissiveIntensity={pad.active ? 1.2 + streakBonus : 0.25}
                roughness={0.5}
              />
            </mesh>
            {/* Ambient Water Glow Ring */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.98, 1.3, 16]} />
              <meshBasicMaterial
                color={pad.color}
                transparent
                opacity={pad.active ? 0.7 : 0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. Three Sacred Lotus Altars with Solid Stone Island Plinths (Stations 0, 1, 2) */}
      {/* Station 0: Shore Landing Plinth & Altar */}
      <mesh position={[0, 0.08, -1.5]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.25, 16]} />
        <meshStandardMaterial color="#6B543E" roughness={0.85} />
      </mesh>
      {altar1 && (
        <group position={[0, 0.15, -1.5]} scale={1.1}>
          <primitive object={altar1} />
          {/* Station 0 Lotus Aura */}
          <pointLight color="#F59E0B" intensity={1.8} distance={6} position={[0, 1.2, 0]} />
        </group>
      )}

      {/* Stepping Stone Pedestals across pond */}
      <mesh position={[0, 0.04, 2.5]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.3, 0.15, 12]} />
        <meshStandardMaterial color="#5C4D3C" roughness={0.88} />
      </mesh>

      {/* Station 1: Mid-Pond Lotus Island Plinth & Altar */}
      <mesh position={[0, 0.08, 5.5]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.7, 0.25, 16]} />
        <meshStandardMaterial color="#6B543E" roughness={0.85} />
      </mesh>
      {altar2 && (
        <group position={[0, 0.15, 5.5]} scale={1.1}>
          <primitive object={altar2} />
          {/* Station 1 Lotus Aura */}
          <pointLight color="#38BDF8" intensity={stage1Passed ? 2.2 : 0.8} distance={7} position={[0, 1.2, 0]} />
        </group>
      )}

      {/* Stepping Stone Pedestals to far shore */}
      <mesh position={[0, 0.04, 9.2]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.3, 0.15, 12]} />
        <meshStandardMaterial color="#5C4D3C" roughness={0.88} />
      </mesh>

      {/* Station 2: Far Shore Portal Plinth & Altar */}
      <mesh position={[0, 0.08, 12.0]} receiveShadow>
        <cylinderGeometry args={[2.6, 2.9, 0.25, 16]} />
        <meshStandardMaterial color="#6B543E" roughness={0.85} />
      </mesh>
      {altar3 && (
        <group position={[0, 0.15, 12.0]} scale={1.2}>
          <primitive object={altar3} />
          {/* Station 2 Sanctuary Portal Aura */}
          <pointLight color="#10B981" intensity={stage2Passed ? 3.0 : 1.0} distance={8} position={[0, 1.4, 0]} />
        </group>
      )}

      {/* 4. Garden Sanctuary Portal Exit */}
      <group position={[0, 0, 14.5]} ref={exitPortalRef}>
        <mesh position={[0, 2.5, 0]}>
          <torusGeometry args={[2.2, 0.25, 12, 24]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={stage3Passed ? 1.5 : 0.3}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
          <circleGeometry args={[2.0, 24]} />
          <meshBasicMaterial color="#34D399" transparent opacity={stage3Passed ? 0.65 : 0.15} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
