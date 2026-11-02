import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../../hooks/useGltfAsset';
import type { GateStatus } from '../../types';

interface TwinBridgesExperienceProps {
  activeStageIndex: number;
  stageStatuses: GateStatus[];
  streak?: number;
  completedCount?: number;
  isUnlocked?: boolean;
}

/**
 * Level 3: Angkor Twin Bridges (ស្ពានភ្លោះអង្គរ)
 * Two parallel causeways across a chasm that extend and join through bilateral hand coordination.
 */
export default function TwinBridgesExperience({
  activeStageIndex,
  stageStatuses,
  streak = 0,
  isUnlocked = false,
}: TwinBridgesExperienceProps) {
  const lotusGlb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const altar1 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar2 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar3 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);

  const leftArchRef = useRef<THREE.Group>(null);
  const rightArchRef = useRef<THREE.Group>(null);
  const keystoneRef = useRef<THREE.Mesh>(null);

  const stage1Passed = stageStatuses[0] === 'open' || isUnlocked;
  const stage2Passed = stageStatuses[1] === 'open' || isUnlocked;
  const stage3Passed = stageStatuses[2] === 'open' || isUnlocked;

  useFrame((_, delta) => {
    // Stage 2: Cantilever arches extend toward each other
    if (leftArchRef.current && rightArchRef.current) {
      const targetLeftX = stage2Passed ? -1.0 : -2.6;
      const targetRightX = stage2Passed ? 1.0 : 2.6;
      leftArchRef.current.position.x = THREE.MathUtils.lerp(leftArchRef.current.position.x, targetLeftX, delta * 2.5);
      rightArchRef.current.position.x = THREE.MathUtils.lerp(rightArchRef.current.position.x, targetRightX, delta * 2.5);
    }
    // Stage 3: Keystone descends from the heavens to lock both bridges
    if (keystoneRef.current) {
      const targetY = stage3Passed ? 0.35 : 4.5;
      keystoneRef.current.position.y = THREE.MathUtils.lerp(keystoneRef.current.position.y, targetY, delta * 2.5);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ===== 1. MYSTICAL CHASM & MIST DISCS ===== */}
      <mesh position={[0, -2.5, 10.0]} receiveShadow>
        <boxGeometry args={[4.2, 5.0, 32.0]} />
        <meshStandardMaterial color="#0F172A" roughness={0.95} />
      </mesh>
      {/* Ambient Chasm Bottom Glow */}
      <mesh position={[0, -0.2, 10.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 30.0]} />
        <meshBasicMaterial color="#0284C7" transparent opacity={0.35} />
      </mesh>

      {/* ===== 2. TWIN PARALLEL CAUSEWAYS ===== */}
      {/* Left Causeway (West - Left Hand Keys F, D, S, A) */}
      <group position={[-2.8, 0, 10.0]}>
        <mesh receiveShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[1.8, 0.5, 30.0]} />
          <meshStandardMaterial color="#5C4D3C" roughness={0.85} />
        </mesh>
        {/* Balustrade Runes */}
        {[-8, -2, 4, 10].map((pz, idx) => (
          <mesh key={`l-rune-${idx}`} position={[-0.85, 0.8, pz]}>
            <boxGeometry args={[0.15, 0.8, 0.4]} />
            <meshStandardMaterial
              color="#1E293B"
              emissive="#38BDF8"
              emissiveIntensity={stage1Passed ? 1.4 : activeStageIndex === 0 ? 0.8 + Math.min(streak * 0.05, 0.5) : 0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Right Causeway (East - Right Hand Keys J, K, L, ;) */}
      <group position={[2.8, 0, 10.0]}>
        <mesh receiveShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[1.8, 0.5, 30.0]} />
          <meshStandardMaterial color="#5C4D3C" roughness={0.85} />
        </mesh>
        {/* Balustrade Runes */}
        {[-8, -2, 4, 10].map((pz, idx) => (
          <mesh key={`r-rune-${idx}`} position={[0.85, 0.8, pz]}>
            <boxGeometry args={[0.15, 0.8, 0.4]} />
            <meshStandardMaterial
              color="#1E293B"
              emissive="#F59E0B"
              emissiveIntensity={stage1Passed ? 1.4 : activeStageIndex === 0 ? 0.8 + Math.min(streak * 0.05, 0.5) : 0.2}
            />
          </mesh>
        ))}
      </group>

      {/* ===== 3. DYNAMIC JOINING ARCHES & KEYSTONE ===== */}
      {/* Left Cantilever Arch Span */}
      <group ref={leftArchRef} position={[-2.6, 0.2, 10.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.45, 4.5]} />
          <meshStandardMaterial color="#4A3B2C" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Cantilever Arch Span */}
      <group ref={rightArchRef} position={[2.6, 0.2, 10.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.45, 4.5]} />
          <meshStandardMaterial color="#4A3B2C" roughness={0.8} />
        </mesh>
      </group>

      {/* Central Royal Keystone */}
      <mesh ref={keystoneRef} position={[0, 4.5, 10.5]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.5, 4.6]} />
        <meshStandardMaterial
          color={stage3Passed ? '#047857' : '#92400E'}
          emissive={stage3Passed ? '#10B981' : '#F59E0B'}
          emissiveIntensity={stage3Passed ? 1.5 : 0.6}
        />
      </mesh>

      {/* ===== 4. THREE LEARNING STATIONS ALONG THE CROSSING ===== */}
      {/* Station 0: Bridgehead Altar [0, 0, 0.0] */}
      <group position={[0, 0, 0.0]}>
        {altar1 ? (
          <primitive object={altar1} />
        ) : (
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.8, 1.0, 1.2, 12]} />
            <meshStandardMaterial color="#6B543E" />
          </mesh>
        )}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[1.2, 1.45, 32]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={activeStageIndex === 0 ? 0.75 : 0.3} />
        </mesh>
      </group>

      {/* Station 1: Mid-Chasm Pier Altar [0, 0, 10.5] */}
      <group position={[0, 0, 10.5]}>
        {altar2 ? (
          <primitive object={altar2} />
        ) : (
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.8, 1.0, 1.2, 12]} />
            <meshStandardMaterial color="#6B543E" />
          </mesh>
        )}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[1.2, 1.45, 32]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={activeStageIndex === 1 ? 0.75 : 0.3} />
        </mesh>
      </group>

      {/* Station 2: Grand Keystone Altar [0, 0, 20.0] */}
      <group position={[0, 0, 20.0]}>
        {altar3 ? (
          <primitive object={altar3} />
        ) : (
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.8, 1.0, 1.2, 12]} />
            <meshStandardMaterial color="#6B543E" />
          </mesh>
        )}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[1.3, 1.6, 32]} />
          <meshBasicMaterial color="#10B981" transparent opacity={activeStageIndex === 2 ? 0.8 : 0.3} />
        </mesh>
      </group>
    </group>
  );
}
