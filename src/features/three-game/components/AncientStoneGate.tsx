import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../hooks/useGltfAsset';
import type { GateState } from '../types';

const GATE_OPEN_SPEED = 0.65;

type AncientStoneGateProps = {
  gateState: GateState;
  streak?: number;
  completedCount?: number;
  incorrectCount?: number;
  onOpeningFinished: () => void;
};

/**
 * Khmer Simha Guardian Lion (តោថ្មយាមទ្វារប្រាសាទ) — loads Blender-crafted GLB with procedural fallback
 */
function SimhaGuardianStatue({ position }: { position: [number, number, number] }) {
  const glb = useGltfClone('/models/props/khmer_simha_guardian.glb');
  const cloned = useMemo(() => (glb ? glb.clone(true) : null), [glb]);

  if (cloned) {
    return (
      <group position={position} rotation={[0, Math.PI, 0]}>
        <primitive object={cloned} />
      </group>
    );
  }

  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.5, 1.4]} />
        <meshStandardMaterial color="#B59B72" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.92, 0.14, 1.2]} />
        <meshStandardMaterial color="#9C8259" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.05, -0.05]} rotation={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.34, 0.85, 10]} />
        <meshStandardMaterial color="#C8AD82" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.56, -0.18]} castShadow>
        <sphereGeometry args={[0.32, 10, 10]} />
        <meshStandardMaterial color="#A88D63" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.88, -0.15]}>
        <coneGeometry args={[0.2, 0.35, 6]} />
        <meshStandardMaterial color="#D97706" roughness={0.45} metalness={0.35} />
      </mesh>
    </group>
  );
}

/**
 * Sacred Lotus Pedestal Learning Altar (អាសនៈសិលាចារឹក) — loads Blender-crafted GLB + glowing rune crystal
 */
function LotusAltar({
  position,
  isUnlocked,
  runeRef,
  crystalRef,
  auraRef,
}: {
  position: [number, number, number];
  isUnlocked: boolean;
  runeRef: React.RefObject<THREE.MeshStandardMaterial | null>;
  crystalRef: React.RefObject<THREE.Mesh | null>;
  auraRef: React.RefObject<THREE.Mesh | null>;
}) {
  const glb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const cloned = useMemo(() => (glb ? glb.clone(true) : null), [glb]);

  return (
    <group position={position}>
      {/* Interactive Proximity Aura Ring on Ground */}
      <mesh ref={auraRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.25, 1.48, 32]} />
        <meshBasicMaterial
          color={isUnlocked ? '#10B981' : '#38BDF8'}
          transparent
          opacity={0.58}
        />
      </mesh>

      {cloned ? (
        <primitive object={cloned} />
      ) : (
        <group>
          <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
            <boxGeometry args={[1.9, 0.24, 1.5]} />
            <meshStandardMaterial color="#78716C" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.34, 0]} receiveShadow castShadow>
            <boxGeometry args={[1.5, 0.2, 1.15]} />
            <meshStandardMaterial color="#A8A29E" roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.68, 0]} castShadow>
            <boxGeometry args={[1.1, 0.52, 0.85]} />
            <meshStandardMaterial color="#78716C" roughness={0.82} />
          </mesh>
          <mesh position={[0, 1.0, 0]} castShadow>
            <boxGeometry args={[1.4, 0.14, 1.05]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.35} metalness={0.5} />
          </mesh>
        </group>
      )}

      {/* Glowing Khmer Inscription Tablet on Altar */}
      <mesh position={[0, 1.18, 0]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.92, 0.08, 0.56]} />
        <meshStandardMaterial
          ref={runeRef}
          color={isUnlocked ? '#10B981' : '#38BDF8'}
          emissive={isUnlocked ? '#059669' : '#0284C7'}
          emissiveIntensity={0.85}
          roughness={0.22}
        />
      </mesh>

      {/* Floating Rotating Sacred Rune Crystal above the Altar */}
      <mesh ref={crystalRef} position={[0, 1.72, 0]} castShadow>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={isUnlocked ? '#34D399' : '#38BDF8'}
          emissive={isUnlocked ? '#10B981' : '#0284C7'}
          emissiveIntensity={1.35}
          roughness={0.12}
          metalness={0.25}
        />
      </mesh>
    </group>
  );
}

export default function AncientStoneGate({
  gateState,
  streak = 0,
  completedCount = 0,
  incorrectCount = 0,
  onOpeningFinished,
}: AncientStoneGateProps) {
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const runeGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const altarRuneRef = useRef<THREE.MeshStandardMaterial>(null);
  const altarCrystalRef = useRef<THREE.Mesh>(null);
  const altarAuraRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef<number>(gateState.openProgress);

  const prevCompletedRef = useRef<number>(completedCount);
  const prevIncorrectRef = useRef<number>(incorrectCount);
  const hitPulseRef = useRef<number>(0);
  const errorFlashRef = useRef<number>(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (completedCount > prevCompletedRef.current) {
      hitPulseRef.current = 1.0;
    }
    prevCompletedRef.current = completedCount;

    if (incorrectCount > prevIncorrectRef.current) {
      errorFlashRef.current = 1.0;
    }
    prevIncorrectRef.current = incorrectCount;

    hitPulseRef.current = Math.max(0, hitPulseRef.current - delta * 3.2);
    errorFlashRef.current = Math.max(0, errorFlashRef.current - delta * 3.8);

    if (gateState.status === 'closed') {
      progressRef.current = 0;
    } else if (gateState.status === 'opening') {
      progressRef.current = Math.min(1, progressRef.current + delta * GATE_OPEN_SPEED);
      if (progressRef.current >= 1) {
        onOpeningFinished();
      }
    } else {
      progressRef.current = 1;
    }

    const slideOffset = progressRef.current * 2.3;
    if (leftDoorRef.current) {
      leftDoorRef.current.position.x = -1.1 - slideOffset;
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.x = 1.1 + slideOffset;
    }

    const streakBoost = Math.min(streak * 0.12, 1.2);
    const pulse =
      0.55 + Math.sin(time * 3) * 0.25 + progressRef.current * 0.9 + streakBoost + hitPulseRef.current * 1.4;

    if (runeGlowRef.current) {
      runeGlowRef.current.emissiveIntensity = pulse;
      if (errorFlashRef.current > 0.15) {
        runeGlowRef.current.color.set('#EF4444');
        runeGlowRef.current.emissive.set('#DC2626');
      } else if (gateState.status !== 'closed') {
        runeGlowRef.current.color.set('#34D399');
        runeGlowRef.current.emissive.set('#10B981');
      } else {
        runeGlowRef.current.color.set('#FCD34D');
        runeGlowRef.current.emissive.set('#F59E0B');
      }
    }

    if (altarRuneRef.current) {
      altarRuneRef.current.emissiveIntensity = pulse * 0.95;
      if (errorFlashRef.current > 0.15) {
        altarRuneRef.current.color.set('#EF4444');
        altarRuneRef.current.emissive.set('#DC2626');
      } else if (gateState.status !== 'closed') {
        altarRuneRef.current.color.set('#10B981');
        altarRuneRef.current.emissive.set('#059669');
      } else {
        altarRuneRef.current.color.set('#38BDF8');
        altarRuneRef.current.emissive.set('#0284C7');
      }
    }

    if (altarCrystalRef.current) {
      altarCrystalRef.current.rotation.y = time * 1.6;
      altarCrystalRef.current.position.y = 1.72 + Math.sin(time * 2.8) * 0.08 + hitPulseRef.current * 0.12;
    }

    if (altarAuraRef.current) {
      altarAuraRef.current.rotation.z = -time * 0.7;
      const auraScale = 1.0 + Math.sin(time * 3.2) * 0.05 + hitPulseRef.current * 0.12;
      altarAuraRef.current.scale.set(auraScale, auraScale, 1);
    }
  });

  const isUnlocked = gateState.status !== 'closed';
  const activeRunes = Math.min(6, Math.floor(completedCount / 2));

  return (
    <group position={[0, 0, 6]}>
      {/* ===== OUTER KHMER SANDSTONE GOPURA GATE ARCHWAY ===== */}
      <group position={[-3.2, 0, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.7, 2.2]} />
          <meshStandardMaterial color="#8A7050" roughness={0.9} />
        </mesh>
        <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 4.2, 1.8]} />
          <meshStandardMaterial color="#A88B63" roughness={0.86} />
        </mesh>
        <mesh position={[0, 2.6, 0.92]}>
          <boxGeometry args={[0.9, 3.4, 0.08]} />
          <meshStandardMaterial color="#C8A978" roughness={0.78} />
        </mesh>
        <mesh position={[0, 4.85, 0]} castShadow>
          <boxGeometry args={[2.0, 0.4, 2.1]} />
          <meshStandardMaterial color="#C2A272" roughness={0.82} />
        </mesh>
      </group>

      <group position={[3.2, 0, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.7, 2.2]} />
          <meshStandardMaterial color="#8A7050" roughness={0.9} />
        </mesh>
        <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 4.2, 1.8]} />
          <meshStandardMaterial color="#A88B63" roughness={0.86} />
        </mesh>
        <mesh position={[0, 2.6, 0.92]}>
          <boxGeometry args={[0.9, 3.4, 0.08]} />
          <meshStandardMaterial color="#C8A978" roughness={0.78} />
        </mesh>
        <mesh position={[0, 4.85, 0]} castShadow>
          <boxGeometry args={[2.0, 0.4, 2.1]} />
          <meshStandardMaterial color="#C2A272" roughness={0.82} />
        </mesh>
      </group>

      {/* ===== STEPPED ANGKORIAN GOPURA ROOF & TRIANGULAR PEDIMENT ===== */}
      <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.2, 0.85, 2.4]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.86} />
      </mesh>
      {/* Triangular Carved Front Pediment (ហោជាងប្រាសាទ) */}
      <mesh position={[0, 6.2, 0.85]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.2, 1.8, 4]} />
        <meshStandardMaterial color="#C8A978" roughness={0.78} />
      </mesh>
      <mesh position={[0, 5.95, 0]} castShadow>
        <boxGeometry args={[6.8, 0.7, 1.9]} />
        <meshStandardMaterial color="#B59668" roughness={0.82} />
      </mesh>
      <mesh position={[0, 6.6, 0]} castShadow>
        <boxGeometry args={[4.6, 0.65, 1.5]} />
        <meshStandardMaterial color="#C8A978" roughness={0.78} />
      </mesh>
      <mesh position={[0, 7.35, 0]} castShadow>
        <coneGeometry args={[1.1, 1.2, 8]} />
        <meshStandardMaterial color="#D6B785" roughness={0.75} />
      </mesh>
      <mesh position={[0, 8.2, 0]}>
        <cylinderGeometry args={[0.04, 0.16, 0.9, 8]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Glowing Central Lintels & Progressive Khmer Rune Stones */}
      <mesh position={[0, 5.2, -1.23]}>
        <boxGeometry args={[5.4, 0.28, 0.08]} />
        <meshStandardMaterial
          ref={runeGlowRef}
          color={isUnlocked ? '#34D399' : '#FCD34D'}
          emissive={isUnlocked ? '#10B981' : '#F59E0B'}
          emissiveIntensity={0.8}
        />
      </mesh>

      {[-2.0, -1.2, -0.4, 0.4, 1.2, 2.0].map((rx, idx) => {
        const lit = isUnlocked || idx < activeRunes;
        return (
          <mesh key={rx} position={[rx, 5.95, -0.98]}>
            <boxGeometry args={[0.38, 0.38, 0.08]} />
            <meshStandardMaterial
              color={lit ? '#34D399' : '#92400E'}
              emissive={lit ? '#10B981' : '#78350F'}
              emissiveIntensity={lit ? 1.2 : 0.2}
            />
          </mesh>
        );
      })}

      {/* ===== SLIDING CARVED STONE DOORS ===== */}
      <group ref={leftDoorRef} position={[-1.1, 0, 0]}>
        <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.15, 4.5, 0.72]} />
          <meshStandardMaterial color="#7C6346" roughness={0.9} />
        </mesh>
        <mesh position={[0, 2.3, -0.38]}>
          <boxGeometry args={[1.55, 3.6, 0.08]} />
          <meshStandardMaterial color="#A8895E" roughness={0.82} />
        </mesh>
        <mesh position={[0.55, 2.3, -0.44]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.045, 8, 16]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.7} roughness={0.28} />
        </mesh>
      </group>

      <group ref={rightDoorRef} position={[1.1, 0, 0]}>
        <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.15, 4.5, 0.72]} />
          <meshStandardMaterial color="#7C6346" roughness={0.9} />
        </mesh>
        <mesh position={[0, 2.3, -0.38]}>
          <boxGeometry args={[1.55, 3.6, 0.08]} />
          <meshStandardMaterial color="#A8895E" roughness={0.82} />
        </mesh>
        <mesh position={[-0.55, 2.3, -0.44]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.045, 8, 16]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.7} roughness={0.28} />
        </mesh>
      </group>

      {/* ===== FLANKING SIMHA GUARDIAN LIONS & SACRED LOTUS ALTAR ===== */}
      <SimhaGuardianStatue position={[-3.3, 0, -2.3]} />
      <SimhaGuardianStatue position={[3.3, 0, -2.3]} />

      <LotusAltar
        position={[0, 0, -2.0]}
        isUnlocked={isUnlocked}
        runeRef={altarRuneRef}
        crystalRef={altarCrystalRef}
        auraRef={altarAuraRef}
      />
    </group>
  );
}
