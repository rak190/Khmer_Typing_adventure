import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../../hooks/useGltfAsset';
import type { GateStatus } from '../../types';

interface SkyPlatformsExperienceProps {
  activeStageIndex: number;
  stageStatuses: GateStatus[];
  streak?: number;
  isUnlocked?: boolean;
}

/**
 * Level 6: Sky Platforms (វេទិកាវេហាស៍)
 * Floating stone platforms suspended among clouds activated by right-hand upper keys (Y, U, I, O, P).
 */
export default function SkyPlatformsExperience({
  stageStatuses,
  isUnlocked = false,
}: SkyPlatformsExperienceProps) {
  const lotusGlb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const altar1 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar2 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar3 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);

  const floatGroupRef = useRef<THREE.Group>(null);
  const skyGateRef = useRef<THREE.Group>(null);

  const stage1Passed = stageStatuses[0] === 'open' || isUnlocked;
  const stage2Passed = stageStatuses[1] === 'open' || isUnlocked;
  const stage3Passed = stageStatuses[2] === 'open' || isUnlocked;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (floatGroupRef.current) {
      floatGroupRef.current.children.forEach((child, idx) => {
        child.position.y = Math.sin(t * 1.8 + idx * 0.8) * 0.12;
      });
    }
    if (skyGateRef.current) {
      const targetY = stage3Passed ? -3.5 : 0;
      skyGateRef.current.position.y = THREE.MathUtils.lerp(skyGateRef.current.position.y, targetY, delta * 2.5);
    }
  });

  const platforms = useMemo(
    () => [
      { key: 'Y (ប)', pos: [-1.2, 0.05, 3.5], active: stage1Passed },
      { key: 'U (ហ)', pos: [1.2, 0.05, 6.0], active: stage1Passed },
      { key: 'I (គ)', pos: [-1.2, 0.05, 13.5], active: stage2Passed },
      { key: 'O (ស)', pos: [1.2, 0.05, 16.0], active: stage2Passed },
      { key: 'P (ភ)', pos: [0, 0.05, 18.0], active: stage2Passed },
    ],
    [stage1Passed, stage2Passed],
  );

  return (
    <group name="SkyPlatformsExperience">
      {/* 1. Base Causeway Platform */}
      <mesh position={[0, 0, -1.0]} receiveShadow>
        <boxGeometry args={[4.5, 0.2, 5.0]} />
        <meshStandardMaterial color="#854D0E" roughness={0.88} />
      </mesh>

      {/* 2. Floating Stepping Platforms in Midair */}
      <group ref={floatGroupRef}>
        {platforms.map((p, idx) => (
          <group key={idx} position={p.pos as [number, number, number]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[1.3, 1.45, 0.3, 16]} />
              <meshStandardMaterial
                color={p.active ? '#1E40AF' : '#64748B'}
                emissive={p.active ? '#38BDF8' : '#1E293B'}
                emissiveIntensity={p.active ? 0.9 : 0.2}
                roughness={0.7}
              />
            </mesh>
            {/* Celestial Runic Ring Underneath */}
            <mesh position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.1, 1.4, 16]} />
              <meshBasicMaterial color="#38BDF8" transparent opacity={p.active ? 0.8 : 0.25} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. Mid Terrace Platform (Z = 10.0) */}
      <mesh position={[0, 0, 10.0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.6, 0.25, 20]} />
        <meshStandardMaterial color="#854D0E" roughness={0.88} />
      </mesh>

      {/* 4. Altars (Stations 0, 1, 2) */}
      {altar1 && (
        <group position={[0, 0, -1.0]} scale={1.1}>
          <primitive object={altar1} />
          <pointLight color="#38BDF8" intensity={1.8} distance={6} position={[0, 1.2, 0]} />
        </group>
      )}

      {altar2 && (
        <group position={[0, 0, 10.0]} scale={1.1}>
          <primitive object={altar2} />
          <pointLight color="#F59E0B" intensity={stage1Passed ? 2.5 : 0.8} distance={7} position={[0, 1.2, 0]} />
        </group>
      )}

      {altar3 && (
        <group position={[0, 0, 20.0]} scale={1.2}>
          <primitive object={altar3} />
          <pointLight color="#10B981" intensity={stage2Passed ? 3.0 : 1.0} distance={8} position={[0, 1.4, 0]} />
        </group>
      )}

      {/* 5. Celestial Overlook Portal Barrier (Z = 23.0) */}
      <group position={[0, 0, 23.0]} ref={skyGateRef}>
        <mesh position={[-2.5, 2.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.45, 5.0, 12]} />
          <meshStandardMaterial color="#78350F" roughness={0.88} />
        </mesh>
        <mesh position={[2.5, 2.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.45, 5.0, 12]} />
          <meshStandardMaterial color="#78350F" roughness={0.88} />
        </mesh>
        {/* Floating Sun Disc */}
        <mesh position={[0, 2.5, 0]}>
          <torusGeometry args={[2.0, 0.2, 12, 24]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#38BDF8"
            emissiveIntensity={stage3Passed ? 1.6 : 0.3}
            roughness={0.4}
          />
        </mesh>
      </group>
    </group>
  );
}
