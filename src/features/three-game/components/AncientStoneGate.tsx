import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../hooks/useGltfAsset';
import type { GateState, Position3D } from '../types';

const GATE_OPEN_SPEED = 0.65;

type AncientStoneGateProps = {
  gateState: GateState;
  streak?: number;
  completedCount?: number;
  incorrectCount?: number;
  onOpeningFinished: () => void;
  playerPositionRef?: MutableRefObject<Position3D>;
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
 * Sacred Lotus Pedestal Learning Altar (អាសនៈសិលាចារឹក)
 * Features dynamic proximity sensing, typing energy ripples, and stage completion beam.
 */
function LotusAltar({
  position,
  isUnlocked,
  proximityRef,
  hitPulseRef,
  isOpening,
  runeRef,
  crystalRef,
  auraRef,
}: {
  position: [number, number, number];
  isUnlocked: boolean;
  proximityRef: MutableRefObject<number>;
  hitPulseRef: MutableRefObject<number>;
  isOpening: boolean;
  runeRef: React.RefObject<THREE.MeshStandardMaterial | null>;
  crystalRef: React.RefObject<THREE.Mesh | null>;
  auraRef: React.RefObject<THREE.Mesh | null>;
}) {
  const glb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const cloned = useMemo(() => (glb ? glb.clone(true) : null), [glb]);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const auraMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const innerHaloMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const hitPulse = hitPulseRef.current;
    const proximity = proximityRef.current;

    if (auraMatRef.current) {
      const baseAuraColor = isUnlocked ? '#10B981' : proximity > 0.3 ? '#F59E0B' : '#38BDF8';
      auraMatRef.current.color.set(baseAuraColor);
      auraMatRef.current.opacity = Math.min(0.95, 0.45 + proximity * 0.4 + hitPulse * 0.3);
    }

    if (innerHaloMatRef.current) {
      innerHaloMatRef.current.opacity = 0.3 + proximity * 0.45;
    }

    if (shockwaveRef.current) {
      if (hitPulse > 0.05) {
        shockwaveRef.current.visible = true;
        const s = 1.0 + (1.0 - hitPulse) * 1.8;
        shockwaveRef.current.scale.set(s, s, 1);
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = hitPulse * 0.75;
      } else {
        shockwaveRef.current.visible = false;
      }
    }

    if (beamRef.current) {
      if (isOpening) {
        beamRef.current.visible = true;
        const mat = beamRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.min(0.65, mat.opacity + delta * 1.5);
      } else {
        beamRef.current.visible = false;
      }
    }
  });

  return (
    <group position={position}>
      {/* Interactive Proximity Aura Ring on Ground */}
      <mesh ref={auraRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.25, 1.48, 36]} />
        <meshBasicMaterial
          ref={auraMatRef}
          color={isUnlocked ? '#10B981' : '#38BDF8'}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Concentric Inner Lotus Rune Halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <ringGeometry args={[0.7, 0.95, 24]} />
        <meshBasicMaterial
          ref={innerHaloMatRef}
          color={isUnlocked ? '#34D399' : '#FCD34D'}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Keystroke Energy Shockwave */}
      <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} visible={false}>
        <ringGeometry args={[1.1, 1.35, 32]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.6} />
      </mesh>

      {/* Upward Celestial Light Column on Unlock / Opening */}
      <mesh ref={beamRef} position={[0, 6.0, 0]} visible={false}>
        <cylinderGeometry args={[0.35, 0.85, 12, 16, 1, true]} />
        <meshBasicMaterial color="#34D399" transparent opacity={0.0} side={THREE.DoubleSide} />
      </mesh>

      {cloned ? (
        <primitive object={cloned} />
      ) : (
        <group>
          {/* Ornate Layered Sandstone Pedestal */}
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

/**
 * Carved Angkor Temple Gate Door with Balusters & Bronze Pull Rings
 */
function CarvedGateDoor({
  doorRef,
  isLeft,
}: {
  doorRef: React.RefObject<THREE.Group | null>;
  isLeft: boolean;
}) {
  const balusterPositions = [-0.62, -0.41, -0.20, 0.0, 0.20, 0.41, 0.62];

  return (
    <group ref={doorRef} position={[isLeft ? -1.1 : 1.1, 0, 0]}>
      {/* Heavy Sandstone / Ironwood Main Door Slab */}
      <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.15, 4.5, 0.68]} />
        <meshStandardMaterial color="#6B4F35" roughness={0.88} />
      </mesh>

      {/* Recessed Inner Panel Face */}
      <mesh position={[0, 2.3, -0.36]} receiveShadow>
        <boxGeometry args={[1.75, 3.8, 0.08]} />
        <meshStandardMaterial color="#4A3420" roughness={0.92} />
      </mesh>

      {/* Traditional Khmer Turned Wood / Bronze Balusters (បង្អួចចម្រឹង) */}
      {balusterPositions.map((bx, idx) => (
        <mesh key={idx} position={[bx, 2.3, -0.41]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 3.4, 8]} />
          <meshStandardMaterial color="#A16207" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* Center Ornate Carved Rosette Flower Boss */}
      <mesh position={[isLeft ? 0.55 : -0.55, 2.3, -0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.06, 12]} />
        <meshStandardMaterial color="#D97706" metalness={0.65} roughness={0.32} />
      </mesh>

      {/* Heavy Cast-Bronze Lion / Naga Pull Ring */}
      <mesh
        position={[isLeft ? 0.55 : -0.55, 2.18, -0.47]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <torusGeometry args={[0.20, 0.042, 10, 20]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.78} roughness={0.25} />
      </mesh>

      {/* Decorative Bronze Studs / Rivets along Perimeter */}
      {[-1.5, -0.5, 0.5, 1.5].map((ry, sIdx) =>
        [-0.88, 0.88].map((rx, cIdx) => (
          <mesh key={`stud-${sIdx}-${cIdx}`} position={[rx, 2.3 + ry, -0.37]}>
            <sphereGeometry args={[0.042, 8, 8]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.7} roughness={0.3} />
          </mesh>
        ))
      )}
    </group>
  );
}

/**
 * Architectural Khmer Temple Column with Tiered Lotus Capital & Base
 */
function GopuraColumn({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      {/* Plinth Base Blocks */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.44, 2.4]} />
        <meshStandardMaterial color="#7D6345" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.24, 2.1]} />
        <meshStandardMaterial color="#947754" roughness={0.88} />
      </mesh>

      {/* Main Fluted Pillar Shaft */}
      <mesh position={[0, 2.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 4.0, 1.8]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.84} />
      </mesh>

      {/* Decorative Front Molding Facet */}
      <mesh position={[0, 2.65, 0.94]}>
        <boxGeometry args={[1.1, 3.5, 0.1]} />
        <meshStandardMaterial color="#D6B57E" roughness={0.76} />
      </mesh>

      {/* Tiered Lotus Capital (ក្បាច់ផ្កាឈូក) */}
      <mesh position={[0, 4.75, 0]} castShadow>
        <boxGeometry args={[2.1, 0.22, 2.2]} />
        <meshStandardMaterial color="#CDB082" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.96, 0]} castShadow>
        <boxGeometry args={[2.35, 0.20, 2.45]} />
        <meshStandardMaterial color="#DFC090" roughness={0.76} />
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
  playerPositionRef,
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
  const proximityRef = useRef<number>(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Check distance between student and altar at world Z = 4 (local Z = -2 relative to gate Z=6)
    if (playerPositionRef?.current) {
      const [px, , pz] = playerPositionRef.current;
      const dist = Math.hypot(px - 0, pz - 4.0);
      proximityRef.current = THREE.MathUtils.clamp((3.6 - dist) / 2.2, 0, 1);
    }

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
      altarCrystalRef.current.position.y = 1.72 + Math.sin(time * 2.8) * 0.08 + hitPulseRef.current * 0.14;
    }

    if (altarAuraRef.current) {
      altarAuraRef.current.rotation.z = -time * 0.7;
      const auraScale = 1.0 + Math.sin(time * 3.2) * 0.05 + hitPulseRef.current * 0.18 + proximityRef.current * 0.22;
      altarAuraRef.current.scale.set(auraScale, auraScale, 1);
    }
  });

  const isUnlocked = gateState.status !== 'closed';
  const isOpening = gateState.status === 'opening';
  const activeRunes = Math.min(6, Math.floor(completedCount / 2));

  return (
    <group position={[0, 0, 6]}>
      {/* ===== 1. OUTER KHMER SANDSTONE GOPURA COLUMNS ===== */}
      <GopuraColumn x={-3.2} />
      <GopuraColumn x={3.2} />

      {/* ===== 2. STEPPED ANGKORIAN GOPURA ROOF & CORBELLED PEDIMENT ===== */}
      {/* Heavy Main Architrave Beam */}
      <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.4, 0.55, 2.5]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.86} />
      </mesh>
      {/* Stepped Frieze Molding */}
      <mesh position={[0, 5.58, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.6, 0.28, 2.25]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>

      {/* Triangular Carved Front Pediment (ហោជាងប្រាសាទ) with Flamboyant Makara Crest */}
      <group position={[0, 6.35, 0.88]}>
        {/* Main Triangular Gable */}
        <mesh rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[2.35, 1.9, 4]} />
          <meshStandardMaterial color="#CDB082" roughness={0.76} />
        </mesh>
        {/* Raised Inner Tympanum Relief */}
        <mesh position={[0, -0.15, 0.14]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.85, 1.45, 4]} />
          <meshStandardMaterial color="#DFBE8D" roughness={0.72} />
        </mesh>
        {/* Carved Upward Makara Horn Eaves (ចុងហោជាង) */}
        <mesh position={[-2.2, -0.65, 0.05]} rotation={[0, 0, 0.45]} castShadow>
          <coneGeometry args={[0.22, 0.8, 6]} />
          <meshStandardMaterial color="#D99B38" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[2.2, -0.65, 0.05]} rotation={[0, 0, -0.45]} castShadow>
          <coneGeometry args={[0.22, 0.8, 6]} />
          <meshStandardMaterial color="#D99B38" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>

      {/* Stepped Superstructure Tiers */}
      <mesh position={[0, 6.05, 0]} castShadow>
        <boxGeometry args={[7.2, 0.75, 2.0]} />
        <meshStandardMaterial color="#B59668" roughness={0.82} />
      </mesh>
      <mesh position={[0, 6.75, 0]} castShadow>
        <boxGeometry args={[4.8, 0.70, 1.6]} />
        <meshStandardMaterial color="#C8A978" roughness={0.78} />
      </mesh>

      {/* Flanking Acroteria Mini-Spires on Cornice Shoulders */}
      {[-3.6, 3.6].map((ax, aIdx) => (
        <group key={`acroteria-${aIdx}`} position={[ax, 5.95, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.42, 0.75, 8]} />
            <meshStandardMaterial color="#BA9966" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.58, 0]} castShadow>
            <coneGeometry args={[0.28, 0.65, 8]} />
            <meshStandardMaterial color="#D99B38" roughness={0.5} metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Central Lotus Bud Spire (កំពូលប្រាសាទ) & Golden Kalasha Finial */}
      <mesh position={[0, 7.55, 0]} castShadow>
        <cylinderGeometry args={[0.7, 1.15, 0.95, 8]} />
        <meshStandardMaterial color="#C8A978" roughness={0.78} />
      </mesh>
      <mesh position={[0, 8.25, 0]} castShadow>
        <coneGeometry args={[0.75, 1.35, 8]} />
        <meshStandardMaterial color="#D6B785" roughness={0.74} />
      </mesh>
      <mesh position={[0, 9.15, 0]}>
        <cylinderGeometry args={[0.04, 0.18, 1.05, 8]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.22} />
      </mesh>
      <mesh position={[0, 9.75, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={0.6} />
      </mesh>

      {/* ===== 3. GLOWING CENTRAL LINTEL & PROGRESSIVE KHMER RUNES ===== */}
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
          <mesh key={rx} position={[rx, 6.05, -0.98]}>
            <boxGeometry args={[0.38, 0.38, 0.08]} />
            <meshStandardMaterial
              color={lit ? '#34D399' : '#92400E'}
              emissive={lit ? '#10B981' : '#78350F'}
              emissiveIntensity={lit ? 1.2 : 0.2}
            />
          </mesh>
        );
      })}

      {/* ===== 4. SLIDING CARVED TEMPLE SANCTUARY DOORS ===== */}
      <CarvedGateDoor doorRef={leftDoorRef} isLeft={true} />
      <CarvedGateDoor doorRef={rightDoorRef} isLeft={false} />

      {/* ===== 5. SIMHA GUARDIAN LIONS & SACRED LEARNING ALTAR ===== */}
      <SimhaGuardianStatue position={[-3.3, 0, -2.3]} />
      <SimhaGuardianStatue position={[3.3, 0, -2.3]} />

      <LotusAltar
        position={[0, 0, -2.0]}
        isUnlocked={isUnlocked}
        proximityRef={proximityRef}
        hitPulseRef={hitPulseRef}
        isOpening={isOpening}
        runeRef={altarRuneRef}
        crystalRef={altarCrystalRef}
        auraRef={altarAuraRef}
      />
    </group>
  );
}
