import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../../hooks/useGltfAsset';
import type { GateStatus } from '../../types';

interface FingerSanctuaryExperienceProps {
  activeStageIndex: number;
  stageStatuses: GateStatus[];
  streak?: number;
  completedCount?: number;
  isUnlocked?: boolean;
}

/**
 * Level 1: Ancient Finger Sanctuary (វិហារម្រាមបុរាណ)
 * Four monumental stelas representing F, D, S, A surrounding an ancient central sundial mechanism.
 */
export default function FingerSanctuaryExperience({
  activeStageIndex,
  stageStatuses,
  streak = 0,
  completedCount = 0,
  isUnlocked = false,
}: FingerSanctuaryExperienceProps) {
  const lotusGlb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const altar1 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar2 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);
  const altar3 = useMemo(() => (lotusGlb ? lotusGlb.clone(true) : null), [lotusGlb]);

  const sundialRingRef = useRef<THREE.Group>(null);
  const exitWallRef = useRef<THREE.Group>(null);

  const stage1Passed = stageStatuses[0] === 'open' || isUnlocked;
  const stage2Passed = stageStatuses[1] === 'open' || isUnlocked;
  const stage3Passed = stageStatuses[2] === 'open' || isUnlocked;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (sundialRingRef.current) {
      sundialRingRef.current.rotation.y = t * (stage2Passed ? 0.6 : 0.15) + (activeStageIndex === 2 ? streak * 0.04 : 0);
    }
    if (exitWallRef.current) {
      // Lower exit barrier smoothly into floor when all stages pass
      const targetY = stage3Passed ? -3.8 : 0;
      exitWallRef.current.position.y = THREE.MathUtils.lerp(exitWallRef.current.position.y, targetY, delta * 2.0);
    }
  });

  const stelas = useMemo(() => [
    { key: 'KeyF', label: 'F (ថ)', x: 4.8, z: -0.5, color: '#F59E0B', active: activeStageIndex === 0, awakened: stage1Passed },
    { key: 'KeyD', label: 'D (ដ)', x: 3.2, z: 3.8, color: '#F59E0B', active: activeStageIndex === 0, awakened: stage1Passed },
    { key: 'KeyS', label: 'S (ស)', x: -3.2, z: 3.8, color: '#38BDF8', active: activeStageIndex === 1, awakened: stage2Passed },
    { key: 'KeyA', label: 'A (ា)', x: -4.8, z: -0.5, color: '#38BDF8', active: activeStageIndex === 1, awakened: stage2Passed },
  ], [activeStageIndex, stage1Passed, stage2Passed]);

  return (
    <group position={[0, 0, 0]}>
      {/* ===== 1. SANCTUARY QUADRANGLE PERIMETER & BASALT COLUMNS ===== */}
      {stelas.map((stela, i) => {
        const glowIntensity = stela.awakened ? 1.8 : stela.active ? 0.9 + Math.min(streak * 0.08, 0.7) : 0.2;
        return (
          <group key={`stela-${stela.key}`} position={[stela.x, 0, stela.z]}>
            {/* Monumental Stone Plinth */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.2, 0.8, 1.2]} />
              <meshStandardMaterial color="#45382B" roughness={0.88} />
            </mesh>
            {/* Carved Rune Pillar */}
            <mesh position={[0, 2.4, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.52, 3.2, 8]} />
              <meshStandardMaterial color="#5C4D3C" roughness={0.82} />
            </mesh>
            {/* Glowing Key Inscription Cartouche */}
            <mesh position={[0, 2.6, 0.44]}>
              <planeGeometry args={[0.65, 0.9]} />
              <meshStandardMaterial
                color="#0F172A"
                emissive={stela.color}
                emissiveIntensity={glowIntensity}
                roughness={0.2}
              />
            </mesh>
            {/* Floating Crown Crystal */}
            <mesh position={[0, 4.3 + Math.sin(i * 1.5) * 0.1, 0]}>
              <octahedronGeometry args={[0.32]} />
              <meshStandardMaterial
                color={stela.awakened ? '#34D399' : stela.color}
                emissive={stela.awakened ? '#10B981' : stela.color}
                emissiveIntensity={glowIntensity}
              />
            </mesh>
            {/* Light aura */}
            {(stela.awakened || stela.active) && (
              <pointLight position={[0, 3.0, 0.5]} color={stela.color} distance={4.5} intensity={stela.awakened ? 1.5 : 0.8} />
            )}
          </group>
        );
      })}

      {/* ===== 2. LUMINOUS FLOOR CONDUITS ===== */}
      {stage1Passed && (
        /* East Conduit connecting F and D */
        <mesh position={[4.0, 0.04, 1.65]} rotation={[-Math.PI / 2, 0, Math.atan2(4.3, -1.6)]}>
          <planeGeometry args={[0.4, 4.5]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.65} />
        </mesh>
      )}

      {stage2Passed && (
        <>
          {/* West Conduit connecting S and A */}
          <mesh position={[-4.0, 0.04, 1.65]} rotation={[-Math.PI / 2, 0, -Math.atan2(4.3, -1.6)]}>
            <planeGeometry args={[0.4, 4.5]} />
            <meshBasicMaterial color="#38BDF8" transparent opacity={0.65} />
          </mesh>
          {/* Central convergence conduits */}
          <mesh position={[2.0, 0.04, 3.2]} rotation={[-Math.PI / 2, 0, -Math.PI / 6]}>
            <planeGeometry args={[0.3, 3.8]} />
            <meshBasicMaterial color="#10B981" transparent opacity={0.6} />
          </mesh>
          <mesh position={[-2.0, 0.04, 3.2]} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
            <planeGeometry args={[0.3, 3.8]} />
            <meshBasicMaterial color="#10B981" transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {/* ===== 3. THREE PURPOSEFUL LEARNING STATIONS ===== */}
      {/* Station 1: East Altar [3.2, 0, -1.0] */}
      <group position={[3.2, 0, -1.0]}>
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

      {/* Station 2: West Altar [-3.2, 0, -1.0] */}
      <group position={[-3.2, 0, -1.0]}>
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

      {/* Station 3: Central Ancient Sundial Mechanism [0, 0, 4.5] */}
      <group position={[0, 0, 4.5]}>
        {altar3 ? (
          <primitive object={altar3} />
        ) : (
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[1.1, 1.3, 1.2, 16]} />
            <meshStandardMaterial color="#5C4D3C" />
          </mesh>
        )}
        {/* Rotating Concentric Astrological Astrolabe Rings */}
        <group ref={sundialRingRef} position={[0, 1.8, 0]}>
          <mesh>
            <torusGeometry args={[1.35, 0.06, 12, 32]} />
            <meshStandardMaterial color="#FBBF24" emissive="#D97706" emissiveIntensity={stage3Passed ? 1.6 : 0.8} />
          </mesh>
          <mesh rotation={[0.4, 0, 0]}>
            <torusGeometry args={[0.95, 0.05, 12, 28]} />
            <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={stage3Passed ? 1.5 : 0.6} />
          </mesh>
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[1.4, 1.7, 32]} />
          <meshBasicMaterial color="#10B981" transparent opacity={activeStageIndex === 2 ? 0.8 : 0.3} />
        </mesh>
      </group>

      {/* ===== 4. DYNAMIC ENVIRONMENTAL TRANSFORMATION (EXIT BARRIER) ===== */}
      <group ref={exitWallRef} position={[0, 0, 8.5]}>
        {/* Stepped Carved Sanctuary Wall with Bas-Relief Apsara Panels */}
        <mesh position={[-3.5, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 4.4, 0.9]} />
          <meshStandardMaterial color="#4A3B2C" roughness={0.88} />
        </mesh>
        <mesh position={[3.5, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 4.4, 0.9]} />
          <meshStandardMaterial color="#4A3B2C" roughness={0.88} />
        </mesh>
        {/* Central Descending Sun Gate Portal */}
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 4.0, 0.6]} />
          <meshStandardMaterial
            color={stage3Passed ? '#047857' : '#78350F'}
            emissive={stage3Passed ? '#10B981' : '#92400E'}
            emissiveIntensity={stage3Passed ? 1.4 : 0.3 + (completedCount % 4) * 0.1}
            roughness={0.65}
          />
        </mesh>
      </group>
    </group>
  );
}
