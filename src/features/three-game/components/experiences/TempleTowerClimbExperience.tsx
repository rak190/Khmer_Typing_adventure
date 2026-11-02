import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../../hooks/useGltfAsset';
import type { GateStatus } from '../../types';

interface TempleTowerClimbExperienceProps {
  activeStageIndex: number;
  stageStatuses: GateStatus[];
  streak?: number;
  completedCount?: number;
  isUnlocked?: boolean;
}

/**
 * Level 5: Climbing Temple Tower (ការឡើងប្រាសាទកំពូល)
 * Vertical stepped terraces rising toward the high Angkorian Bakan sanctuary summit.
 */
export default function TempleTowerClimbExperience({
  activeStageIndex,
  stageStatuses,
  isUnlocked = false,
}: TempleTowerClimbExperienceProps) {
  const lotusGlb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const altar1 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar2 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar3 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);

  const stairs1Ref = useRef<THREE.Group>(null);
  const stairs2Ref = useRef<THREE.Group>(null);
  const crownSanctuaryRef = useRef<THREE.Group>(null);

  const stage1Passed = stageStatuses[0] === 'open' || isUnlocked;
  const stage2Passed = stageStatuses[1] === 'open' || isUnlocked;
  const stage3Passed = stageStatuses[2] === 'open' || isUnlocked;

  useFrame((_, delta) => {
    // Raise first monumental flight of steps
    if (stairs1Ref.current) {
      const targetY = stage1Passed ? 0 : -2.8;
      stairs1Ref.current.position.y = THREE.MathUtils.lerp(stairs1Ref.current.position.y, targetY, delta * 2.5);
    }
    // Raise second monumental flight of steps
    if (stairs2Ref.current) {
      const targetY = stage2Passed ? 0 : -3.2;
      stairs2Ref.current.position.y = THREE.MathUtils.lerp(stairs2Ref.current.position.y, targetY, delta * 2.5);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ===== 1. TIER 1: BASE COURTYARD (Y = 0m, Z = -5m to +4m) ===== */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[14.0, 0.4, 12.0]} />
        <meshStandardMaterial color="#4A3B2C" roughness={0.9} />
      </mesh>

      {/* Flight of Steps 1 (from Y = 0 to Y = 2.2m, Z = 4m to 7m) */}
      <group ref={stairs1Ref} position={[0, stage1Passed ? 0 : -2.8, 5.5]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={`stair-1-${i}`} position={[0, (i + 1) * 0.3, i * 0.5 - 1.5]} castShadow receiveShadow>
            <boxGeometry args={[5.0, 0.32, 0.55]} />
            <meshStandardMaterial color="#5C4D3C" roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* ===== 2. TIER 2: FIRST ELEVATED TERRACE (Y = 2.2m, Z = 7m to 15m) ===== */}
      <mesh position={[0, 1.0, 11.0]} receiveShadow>
        <boxGeometry args={[12.0, 2.4, 8.0]} />
        <meshStandardMaterial color="#5C4D3C" roughness={0.88} />
      </mesh>
      {/* Terrace 1 Sandstone Balustrades */}
      <mesh position={[-5.8, 2.5, 11.0]}>
        <boxGeometry args={[0.4, 0.6, 7.8]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>
      <mesh position={[5.8, 2.5, 11.0]}>
        <boxGeometry args={[0.4, 0.6, 7.8]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>

      {/* Flight of Steps 2 (from Y = 2.2m to Y = 4.4m, Z = 15m to 18m) */}
      <group ref={stairs2Ref} position={[0, stage2Passed ? 0 : -3.2, 16.5]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={`stair-2-${i}`} position={[0, 2.2 + (i + 1) * 0.3, i * 0.5 - 1.5]} castShadow receiveShadow>
            <boxGeometry args={[4.2, 0.32, 0.55]} />
            <meshStandardMaterial color="#4A3B2C" roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* ===== 3. TIER 3: HIGH SUMMIT OVERLOOK (Y = 4.4m, Z = 18m to 26m) ===== */}
      <mesh position={[0, 2.1, 22.0]} receiveShadow>
        <boxGeometry args={[10.0, 4.6, 8.0]} />
        <meshStandardMaterial color="#4A3B2C" roughness={0.88} />
      </mesh>

      {/* Monumental Crown Temple Colonnade (Towering Prangs) */}
      <group ref={crownSanctuaryRef} position={[0, 4.4, 24.5]}>
        {/* Central Prang Spire */}
        <mesh position={[0, 4.0, 0]} castShadow>
          <coneGeometry args={[1.8, 8.0, 8]} />
          <meshStandardMaterial
            color="#6B543E"
            emissive={stage3Passed ? '#F59E0B' : '#000000'}
            emissiveIntensity={stage3Passed ? 1.2 : 0}
            roughness={0.7}
          />
        </mesh>
        {/* Flanking Corner Spires */}
        {[-3.2, 3.2].map((sx, idx) => (
          <mesh key={`spire-${idx}`} position={[sx, 2.8, -1.0]} castShadow>
            <coneGeometry args={[1.1, 5.5, 6]} />
            <meshStandardMaterial
              color="#5C4D3C"
              emissive={stage3Passed ? '#38BDF8' : '#000000'}
              emissiveIntensity={stage3Passed ? 1.0 : 0}
              roughness={0.75}
            />
          </mesh>
        ))}
        {/* High Aura Light */}
        {stage3Passed && (
          <pointLight position={[0, 5.0, 0]} color="#FBBF24" distance={12.0} intensity={2.2} />
        )}
      </group>

      {/* ===== 4. THREE VERTICAL LEARNING STATIONS ===== */}
      {/* Station 0: Base Altar [0, 0, -1.0] */}
      <group position={[0, 0, -1.0]}>
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
          <meshBasicMaterial color="#F59E0B" transparent opacity={activeStageIndex === 0 ? 0.75 : 0.3} />
        </mesh>
      </group>

      {/* Station 1: Terrace 1 Altar [0, 2.2, 9.5] */}
      <group position={[0, 2.2, 9.5]}>
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
          <meshBasicMaterial color="#38BDF8" transparent opacity={activeStageIndex === 1 ? 0.75 : 0.3} />
        </mesh>
      </group>

      {/* Station 2: High Summit Altar [0, 4.4, 20.0] */}
      <group position={[0, 4.4, 20.0]}>
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
