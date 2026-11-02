import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../../hooks/useGltfAsset';
import type { GateStatus } from '../../types';

interface LotusGardenExperienceProps {
  activeStageIndex: number;
  stageStatuses: GateStatus[];
  streak?: number;
  isUnlocked?: boolean;
}

/**
 * Level 2: Enchanted Lotus Garden (សួនផ្កាឈូកទិព្វ)
 * Shallow reflective water courtyard with sacred blooming lotus platforms (J, K, L, ;).
 */
export default function LotusGardenExperience({
  stageStatuses,
  isUnlocked = false,
}: LotusGardenExperienceProps) {
  const lotusGlb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const altar1 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar2 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar3 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);

  const poolWaterRef = useRef<THREE.Mesh>(null);
  const petalsRef = useRef<THREE.Group>(null);
  const exitPortalRef = useRef<THREE.Group>(null);

  const stage1Passed = stageStatuses[0] === 'open' || isUnlocked;
  const stage2Passed = stageStatuses[1] === 'open' || isUnlocked;
  const stage3Passed = stageStatuses[2] === 'open' || isUnlocked;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (poolWaterRef.current) {
      const mat = poolWaterRef.current.material as THREE.MeshStandardMaterial;
      if (mat.roughness !== undefined) {
        mat.roughness = 0.15 + Math.sin(t * 1.5) * 0.05;
      }
    }
    if (petalsRef.current) {
      petalsRef.current.children.forEach((child, idx) => {
        child.position.y = Math.sin(t * 2.0 + idx) * 0.08;
      });
    }
    if (exitPortalRef.current) {
      const targetScale = stage3Passed ? 1.0 : 0.001;
      exitPortalRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 3.0);
    }
  });

  const lotusPads = useMemo(
    () => [
      { key: 'J (់)', pos: [-1.4, 0.05, 1.8], color: '#F59E0B', active: stage1Passed },
      { key: 'K (ក)', pos: [1.4, 0.05, 3.2], color: '#38BDF8', active: stage1Passed },
      { key: 'L (ល)', pos: [-1.4, 0.05, 8.5], color: '#10B981', active: stage2Passed },
      { key: '; (ើ)', pos: [1.4, 0.05, 10.2], color: '#EC4899', active: stage2Passed },
    ],
    [stage1Passed, stage2Passed],
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
          <group key={idx} position={pad.pos as [number, number, number]}>
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
                emissiveIntensity={pad.active ? 1.2 : 0.25}
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

      {/* 3. Three Sacred Lotus Altars (Stations 0, 1, 2) */}
      {altar1 && (
        <group position={[0, 0, -1.5]} scale={1.1}>
          <primitive object={altar1} />
          {/* Station 0 Lotus Aura */}
          <pointLight color="#F59E0B" intensity={1.8} distance={6} position={[0, 1.2, 0]} />
        </group>
      )}

      {altar2 && (
        <group position={[0, 0, 5.5]} scale={1.1}>
          <primitive object={altar2} />
          {/* Station 1 Lotus Aura */}
          <pointLight color="#38BDF8" intensity={stage1Passed ? 2.2 : 0.8} distance={7} position={[0, 1.2, 0]} />
        </group>
      )}

      {altar3 && (
        <group position={[0, 0, 12.0]} scale={1.2}>
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
