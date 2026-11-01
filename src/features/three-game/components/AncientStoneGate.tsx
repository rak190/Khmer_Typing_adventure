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

/**
 * Monumental Angkor Wat Corbelled Lotus Prasat Tower (កំពូលផ្កាឈូកអង្គរវត្ត)
 * Features 5 diminishing corbelled sandstone tiers with horizontal moldings,
 * cardinal antefixes (ហោជាងទិសទាំង៤), deeply ribbed lotus-bud crown (ផ្កាឈូកក្រពុំ),
 * and radiant golden kalasha pot finial.
 */
function AngkorPrasatTower({
  position = [0, 0, 0],
  scale = 1,
  showAntefixes = true,
}: {
  position?: [number, number, number];
  scale?: number;
  showAntefixes?: boolean;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Base Architrave Plinth */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.7, 3.8]} />
        <meshStandardMaterial color="#8F714A" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.1, 0.22, 4.0]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.84} />
      </mesh>

      {/* 2. Tier 1 (Lowest & Widest Corbelled Tier) */}
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 1.15, 3.3]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[4.5, 0.22, 3.55]} />
        <meshStandardMaterial color="#DFC090" roughness={0.78} />
      </mesh>
      {showAntefixes && (
        <group position={[0, 1.55, 0]}>
          <mesh position={[0, 0, 1.75]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.9, 0.85, 4]} />
            <meshStandardMaterial color="#CDB082" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0, -1.75]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.9, 0.85, 4]} />
            <meshStandardMaterial color="#CDB082" roughness={0.75} />
          </mesh>
          <mesh position={[-2.2, 0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.8, 0.85, 4]} />
            <meshStandardMaterial color="#CDB082" roughness={0.75} />
          </mesh>
          <mesh position={[2.2, 0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.8, 0.85, 4]} />
            <meshStandardMaterial color="#CDB082" roughness={0.75} />
          </mesh>
        </group>
      )}

      {/* 3. Tier 2 (Diminishing Corbelled Tier) */}
      <mesh position={[0, 2.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 1.05, 2.8]} />
        <meshStandardMaterial color="#B59668" roughness={0.82} />
      </mesh>
      <mesh position={[0, 3.35, 0]} castShadow>
        <boxGeometry args={[3.85, 0.2, 3.0]} />
        <meshStandardMaterial color="#DFC090" roughness={0.78} />
      </mesh>
      {showAntefixes && (
        <group position={[0, 2.85, 0]}>
          <mesh position={[0, 0, 1.48]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.75, 0.75, 4]} />
            <meshStandardMaterial color="#C8A978" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0, -1.48]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.75, 0.75, 4]} />
            <meshStandardMaterial color="#C8A978" roughness={0.75} />
          </mesh>
          <mesh position={[-1.88, 0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.68, 0.75, 4]} />
            <meshStandardMaterial color="#C8A978" roughness={0.75} />
          </mesh>
          <mesh position={[1.88, 0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.68, 0.75, 4]} />
            <meshStandardMaterial color="#C8A978" roughness={0.75} />
          </mesh>
        </group>
      )}

      {/* 4. Tier 3 */}
      <mesh position={[0, 3.95, 0]} castShadow>
        <boxGeometry args={[3.0, 0.95, 2.35]} />
        <meshStandardMaterial color="#C0A170" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.48, 0]} castShadow>
        <boxGeometry args={[3.25, 0.18, 2.5]} />
        <meshStandardMaterial color="#D6B785" roughness={0.76} />
      </mesh>

      {/* 5. Tier 4 */}
      <mesh position={[0, 5.05, 0]} castShadow>
        <boxGeometry args={[2.4, 0.85, 1.9]} />
        <meshStandardMaterial color="#C8A978" roughness={0.78} />
      </mesh>
      <mesh position={[0, 5.52, 0]} castShadow>
        <boxGeometry args={[2.6, 0.16, 2.05]} />
        <meshStandardMaterial color="#DFC090" roughness={0.74} />
      </mesh>

      {/* 6. Tier 5 (Top Stepped Tier) */}
      <mesh position={[0, 6.05, 0]} castShadow>
        <boxGeometry args={[1.85, 0.75, 1.5]} />
        <meshStandardMaterial color="#D0B180" roughness={0.76} />
      </mesh>
      <mesh position={[0, 6.46, 0]} castShadow>
        <boxGeometry args={[2.02, 0.14, 1.62]} />
        <meshStandardMaterial color="#E8CE9D" roughness={0.72} />
      </mesh>

      {/* 7. Lotus Neck & Petal Collars (កញ្ចឹងឈូក) */}
      <mesh position={[0, 6.8, 0]} castShadow>
        <cylinderGeometry args={[0.82, 0.98, 0.5, 12]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.8} />
      </mesh>
      <mesh position={[0, 7.15, 0]} castShadow>
        <cylinderGeometry args={[1.05, 0.78, 0.32, 12]} />
        <meshStandardMaterial color="#D6B785" roughness={0.74} />
      </mesh>

      {/* 8. Corbelled Ribbed Lotus Bud Crown (ផ្កាឈូកក្រពុំ) */}
      <mesh position={[0, 7.9, 0]} castShadow>
        <cylinderGeometry args={[1.18, 0.88, 1.25, 12]} />
        <meshStandardMaterial color="#D4B584" roughness={0.75} />
      </mesh>
      <mesh position={[0, 9.15, 0]} castShadow>
        <coneGeometry args={[1.08, 1.85, 12]} />
        <meshStandardMaterial color="#DFC090" roughness={0.72} />
      </mesh>
      {[
        0,
        Math.PI / 4,
        Math.PI / 2,
        (3 * Math.PI) / 4,
        Math.PI,
        (5 * Math.PI) / 4,
        (3 * Math.PI) / 2,
        (7 * Math.PI) / 4,
      ].map((rad, idx) => (
        <group key={`rib-${idx}`} rotation={[0, rad, 0]}>
          <mesh position={[0, 8.4, 0.92]} rotation={[0.18, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.12, 1.7, 6]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.55} metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* 9. Golden Kalasha Finial Spire (កលសាសិល្បៈខ្មែរ) */}
      <mesh position={[0, 10.25, 0]} castShadow>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.28} metalness={0.75} />
      </mesh>
      <mesh position={[0, 10.65, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 0.45, 8]} />
        <meshStandardMaterial color="#D97706" roughness={0.32} metalness={0.7} />
      </mesh>
      <mesh position={[0, 11.45, 0]}>
        <cylinderGeometry args={[0.03, 0.14, 1.45, 8]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[0, 12.25, 0]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial
          color="#FEF08A"
          emissive="#F59E0B"
          emissiveIntensity={0.85}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

/**
 * Carved Angkorian Devata / Apsara High-Relief Wall Niche (ចម្លាក់ទេវតាលើជញ្ជាំងថ្ម)
 * Features an arched sandstone shrine gable (ហោជាងប្រាសាទតូច), stepped lotus pedestal,
 * and high-relief silhouette of the celestial guardian maiden holding sacred lotus buds.
 */
function AngkorDevataNiche({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Arched Shrine Recessed Wall Niche Cavity */}
      <mesh position={[0, 0, -0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.78, 2.05, 0.12]} />
        <meshStandardMaterial color="#6B5237" roughness={0.92} />
      </mesh>

      {/* Sculpted Arched Shrine Gable / Phimean Crest */}
      <mesh position={[0, 1.18, 0.02]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.55, 0.68, 4]} />
        <meshStandardMaterial color="#CDB082" roughness={0.78} />
      </mesh>
      {/* Flame Scrolls at Eaves */}
      <mesh position={[-0.45, 0.94, 0.02]} rotation={[0, 0, 0.5]} castShadow>
        <coneGeometry args={[0.07, 0.28, 6]} />
        <meshStandardMaterial color="#D99B38" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.45, 0.94, 0.02]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[0.07, 0.28, 6]} />
        <meshStandardMaterial color="#D99B38" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Stepped Lotus Pedestal (Peedam) underfoot */}
      <mesh position={[0, -0.9, 0.04]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.25, 0.14, 10]} />
        <meshStandardMaterial color="#DFC090" roughness={0.76} />
      </mesh>
      <mesh position={[0, -0.99, 0.03]} castShadow>
        <boxGeometry args={[0.68, 0.08, 0.24]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.88} />
      </mesh>

      {/* Devata Celestial Maiden Silhouette (High-Relief Sandstone Sculpture) */}
      {/* Tripartite Diadem / Crown (Mokot) */}
      <mesh position={[0, 0.76, 0.06]} castShadow>
        <coneGeometry args={[0.11, 0.32, 6]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Head & Ear Pendants */}
      <mesh position={[0, 0.56, 0.05]} castShadow>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#D6B785" roughness={0.8} />
      </mesh>
      {/* Ornate Torso & Bejeweled Necklace (Sangvar) */}
      <mesh position={[0, 0.28, 0.05]} castShadow>
        <cylinderGeometry args={[0.11, 0.14, 0.38, 8]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>
      {/* Graceful Arms holding Sacred Lotus Bloom */}
      <mesh position={[-0.18, 0.25, 0.08]} rotation={[0.2, 0, -0.35]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.32, 6]} />
        <meshStandardMaterial color="#C8A978" roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 0.25, 0.08]} rotation={[0.2, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.32, 6]} />
        <meshStandardMaterial color="#C8A978" roughness={0.8} />
      </mesh>
      {/* Handheld Sacred Lotus Bud */}
      <mesh position={[0, 0.42, 0.12]} castShadow>
        <coneGeometry args={[0.055, 0.12, 6]} />
        <meshStandardMaterial color="#F472B6" roughness={0.45} />
      </mesh>
      {/* Pleated Sampot Skirt with Flared Fishtail Sashes */}
      <mesh position={[0, -0.28, 0.05]} castShadow>
        <cylinderGeometry args={[0.15, 0.24, 0.76, 8]} />
        <meshStandardMaterial color="#BA9966" roughness={0.82} />
      </mesh>
      {/* Central Pleat Sash (ក្បាច់ជាយសំពត់) */}
      <mesh position={[0, -0.32, 0.12]} castShadow>
        <boxGeometry args={[0.08, 0.68, 0.04]} />
        <meshStandardMaterial color="#D97706" roughness={0.5} metalness={0.35} />
      </mesh>
    </group>
  );
}

/**
 * Armed Angkorian Dvarapala Temple Sentinel (ទ្វារបាល / Guardian Warrior)
 * Standing stone warrior sentinels flanking the gopura entrance,
 * holding massive carved stone clubs (Gada) to protect the sanctuary.
 */
function DvarapalaSentinel({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* 1. Stepped Sandstone Plinth */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.74, 0.3, 0.74]} />
        <meshStandardMaterial color="#8F714A" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.12, 10]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.86} />
      </mesh>

      {/* 2. Warrior Feet planted firmly in guardian stance */}
      <mesh position={[-0.14, 0.44, 0.05]} castShadow>
        <boxGeometry args={[0.12, 0.1, 0.22]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>
      <mesh position={[0.14, 0.44, 0.05]} castShadow>
        <boxGeometry args={[0.12, 0.1, 0.22]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>

      {/* 3. Muscular Lower Legs & Calves */}
      <mesh position={[-0.14, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.09, 0.48, 8]} />
        <meshStandardMaterial color="#CDB082" roughness={0.8} />
      </mesh>
      <mesh position={[0.14, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.09, 0.48, 8]} />
        <meshStandardMaterial color="#CDB082" roughness={0.8} />
      </mesh>

      {/* 4. Pleated Sampot Dhoti Kben & Golden Belt */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.22, 0.46, 10]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.34, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.08, 10]} />
        <meshStandardMaterial color="#D97706" roughness={0.45} metalness={0.4} />
      </mesh>
      {/* Central Hanging Fishtail Sash (ជាយសំពត់) */}
      <mesh position={[0, 0.98, 0.16]} castShadow>
        <boxGeometry args={[0.1, 0.42, 0.04]} />
        <meshStandardMaterial color="#D97706" roughness={0.5} metalness={0.35} />
      </mesh>

      {/* 5. Powerful Torso & Crossed Sangvar Pectoral Baldric Bands */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <boxGeometry args={[0.42, 0.52, 0.24]} />
        <meshStandardMaterial color="#CDB082" roughness={0.8} />
      </mesh>
      {/* Crossed Golden Sangvar Bands */}
      <mesh position={[0, 1.62, 0.13]} rotation={[0, 0, 0.65]}>
        <boxGeometry args={[0.06, 0.58, 0.02]} />
        <meshStandardMaterial color="#D97706" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.62, 0.13]} rotation={[0, 0, -0.65]}>
        <boxGeometry args={[0.06, 0.58, 0.02]} />
        <meshStandardMaterial color="#D97706" metalness={0.5} roughness={0.35} />
      </mesh>
      {/* Central Chest Medallion */}
      <mesh position={[0, 1.62, 0.14]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.5} />
      </mesh>

      {/* 6. Shoulders & Muscular Arms Grasping Central Club */}
      <mesh position={[-0.24, 1.68, 0.02]} rotation={[0.3, 0, -0.35]} castShadow>
        <cylinderGeometry args={[0.07, 0.065, 0.38, 8]} />
        <meshStandardMaterial color="#CDB082" roughness={0.8} />
      </mesh>
      <mesh position={[0.24, 1.68, 0.02]} rotation={[0.3, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.07, 0.065, 0.38, 8]} />
        <meshStandardMaterial color="#CDB082" roughness={0.8} />
      </mesh>
      {/* Hands clasping the Gada club pommel */}
      <mesh position={[-0.05, 1.45, 0.26]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.8} />
      </mesh>
      <mesh position={[0.05, 1.45, 0.26]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.8} />
      </mesh>

      {/* 7. Massive Stone Guardian Club (Gada / ដំបងថ្ម) */}
      <group position={[0, 0, 0.26]}>
        {/* Pointed Pommel Finial */}
        <mesh position={[0, 1.58, 0]} castShadow>
          <coneGeometry args={[0.07, 0.16, 8]} />
          <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Upper Handle Shaft */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.5, 8]} />
          <meshStandardMaterial color="#8F714A" roughness={0.88} />
        </mesh>
        {/* Fluted Ribbed Striking Head */}
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.55, 8]} />
          <meshStandardMaterial color="#A4855E" roughness={0.84} />
        </mesh>
        {/* Base Spike planted into plinth */}
        <mesh position={[0, 0.45, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.09, 0.14, 8]} />
          <meshStandardMaterial color="#6B5237" roughness={0.92} />
        </mesh>
      </group>

      {/* 8. Warrior Head, Fierce Expression & Royal Diadem (Mokot) */}
      <mesh position={[0, 2.05, 0.02]} castShadow>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color="#CDB082" roughness={0.8} />
      </mesh>
      {/* Bulging Guardian Eyes */}
      <mesh position={[-0.07, 2.08, 0.15]}>
        <sphereGeometry args={[0.032, 6, 6]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0.07, 2.08, 0.15]}>
        <sphereGeometry args={[0.032, 6, 6]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Fierce Mustache / Guardian Brow */}
      <mesh position={[0, 2.02, 0.16]}>
        <boxGeometry args={[0.16, 0.035, 0.03]} />
        <meshStandardMaterial color="#6B5237" roughness={0.9} />
      </mesh>
      {/* Tiered Royal Diadem Spire */}
      <mesh position={[0, 2.24, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.17, 0.16, 8]} />
        <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.42, 0]} castShadow>
        <coneGeometry args={[0.1, 0.28, 8]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.35} metalness={0.55} />
      </mesh>
    </group>
  );
}

/**
 * Classical Angkorian Entrance Portal Jambs, Pilasters & Carved Lintel
 * (សសរផ្អោប និងផ្តែរប្រាសាទអង្គរវត្ត)
 */
function AngkorDoorPilastersAndLintel() {
  return (
    <group position={[0, 0, 0]}>
      {/* Left Carved Door Pilaster (Sarsor Ph-ob) */}
      <group position={[-1.25, 0, -0.42]}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.32, 0.44, 0.28]} />
          <meshStandardMaterial color="#8F714A" roughness={0.88} />
        </mesh>
        <mesh position={[0, 2.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 4.0, 0.22]} />
          <meshStandardMaterial color="#BFA06C" roughness={0.82} />
        </mesh>
        <mesh position={[0, 2.45, -0.12]}>
          <boxGeometry args={[0.14, 3.8, 0.04]} />
          <meshStandardMaterial color="#DFC090" roughness={0.76} />
        </mesh>
        {/* Ancient Khmer Inscription Stele (សិលាចារឹកខ្មែរ) on doorpost */}
        <mesh position={[0, 2.45, -0.14]}>
          <boxGeometry args={[0.16, 3.2, 0.02]} />
          <meshStandardMaterial color="#8F714A" roughness={0.88} />
        </mesh>
        {[-1.2, -0.6, 0, 0.6, 1.2].map((sy, sIdx) => (
          <mesh key={`stele-line-l-${sIdx}`} position={[0, 2.45 + sy, -0.155]}>
            <boxGeometry args={[0.12, 0.025, 0.01]} />
            <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 4.55, 0]} castShadow>
          <boxGeometry args={[0.34, 0.2, 0.3]} />
          <meshStandardMaterial color="#DFC090" roughness={0.76} />
        </mesh>
      </group>

      {/* Right Carved Door Pilaster (Sarsor Ph-ob) */}
      <group position={[1.25, 0, -0.42]}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.32, 0.44, 0.28]} />
          <meshStandardMaterial color="#8F714A" roughness={0.88} />
        </mesh>
        <mesh position={[0, 2.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 4.0, 0.22]} />
          <meshStandardMaterial color="#BFA06C" roughness={0.82} />
        </mesh>
        <mesh position={[0, 2.45, -0.12]}>
          <boxGeometry args={[0.14, 3.8, 0.04]} />
          <meshStandardMaterial color="#DFC090" roughness={0.76} />
        </mesh>
        {/* Ancient Khmer Inscription Stele (សិលាចារឹកខ្មែរ) on doorpost */}
        <mesh position={[0, 2.45, -0.14]}>
          <boxGeometry args={[0.16, 3.2, 0.02]} />
          <meshStandardMaterial color="#8F714A" roughness={0.88} />
        </mesh>
        {[-1.2, -0.6, 0, 0.6, 1.2].map((sy, sIdx) => (
          <mesh key={`stele-line-r-${sIdx}`} position={[0, 2.45 + sy, -0.155]}>
            <boxGeometry args={[0.12, 0.025, 0.01]} />
            <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 4.55, 0]} castShadow>
          <boxGeometry args={[0.34, 0.2, 0.3]} />
          <meshStandardMaterial color="#DFC090" roughness={0.76} />
        </mesh>
      </group>

      {/* Classical Sculpted Sandstone Lintel with Fierce Kala / Rahu Mask (ផ្តែរប្រាសាទចម្លាក់ក្បាលរាហូ) */}
      <group position={[0, 4.75, -0.42]}>
        {/* Main Architrave Beam */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.95, 0.52, 0.36]} />
          <meshStandardMaterial color="#A4855E" roughness={0.85} />
        </mesh>
        {/* Upper Molded Cornice Lip */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[3.08, 0.10, 0.40]} />
          <meshStandardMaterial color="#CDB082" roughness={0.8} />
        </mesh>

        {/* Central Sculpted Kala / Rahu Mask (ក្បាលរាហូ) */}
        <group position={[0, -0.02, -0.19]}>
          {/* Broad Monster Forehead with Crest */}
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.24, 0.12]} />
            <meshStandardMaterial color="#CDB082" roughness={0.76} />
          </mesh>
          {/* Monster Crest Horns */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <coneGeometry args={[0.09, 0.18, 6]} />
            <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Bulging Round Monster Eyes */}
          <mesh position={[-0.12, 0.04, 0.06]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.65} />
          </mesh>
          <mesh position={[0.12, 0.04, 0.06]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.65} />
          </mesh>
          {/* Lion Snout / Wide Nose */}
          <mesh position={[0, -0.02, 0.08]}>
            <boxGeometry args={[0.14, 0.08, 0.08]} />
            <meshStandardMaterial color="#B08D5B" roughness={0.82} />
          </mesh>
          {/* Gaping Mouth with Curved Upper Fangs grasping garland loop */}
          <mesh position={[0, -0.12, 0.06]}>
            <boxGeometry args={[0.34, 0.12, 0.08]} />
            <meshStandardMaterial color="#7D6345" roughness={0.9} />
          </mesh>
          {/* Fangs */}
          <mesh position={[-0.11, -0.15, 0.08]} rotation={[Math.PI, 0, 0.2]}>
            <coneGeometry args={[0.025, 0.08, 4]} />
            <meshStandardMaterial color="#FFFBEB" roughness={0.4} />
          </mesh>
          <mesh position={[0.11, -0.15, 0.08]} rotation={[Math.PI, 0, -0.2]}>
            <coneGeometry args={[0.025, 0.08, 4]} />
            <meshStandardMaterial color="#FFFBEB" roughness={0.4} />
          </mesh>

          {/* Sprawling Kala Arms holding the Garland Swags */}
          <mesh position={[-0.26, -0.06, 0.03]} rotation={[0, 0, 0.4]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.24, 6]} />
            <meshStandardMaterial color="#BFA06C" roughness={0.8} />
          </mesh>
          <mesh position={[0.26, -0.06, 0.03]} rotation={[0, 0, -0.4]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.24, 6]} />
            <meshStandardMaterial color="#BFA06C" roughness={0.8} />
          </mesh>
        </group>

        {/* Cascading Floral Garlands (Kbach Changva Por) billowing outward */}
        {[-0.82, 0.82].map((gx, gIdx) => (
          <group key={`kala-garland-${gIdx}`} position={[gx, -0.05, -0.18]}>
            <mesh castShadow>
              <boxGeometry args={[0.98, 0.20, 0.05]} />
              <meshStandardMaterial color="#DFC090" roughness={0.74} />
            </mesh>
            {/* Medallion Boss along the garland swag */}
            <mesh position={[gIdx === 0 ? -0.2 : 0.2, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.04, 8]} />
              <meshStandardMaterial color="#D97706" metalness={0.5} roughness={0.35} />
            </mesh>
          </group>
        ))}

        {/* Pendant Lotus Tassels hanging under lintel */}
        {[-1.1, -0.55, 0, 0.55, 1.1].map((px, pIdx) => (
          <mesh key={`tassel-${pIdx}`} position={[px, -0.32, -0.14]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.04, 0.14, 6]} />
            <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * Inner Courtyard Facade of the West Gopura (មុខគោបុរៈខាងក្នុងបែរទៅទិសខាងកើត)
 * Beautifully details the inside face of the gate with fluted pilasters,
 * sculpted Kala lintel, celestial Devatas, guardian sentinels, and pediment facing +Z.
 */
function AngkorInnerGopuraFacade() {
  return (
    <group position={[0, 0, 0.65]} rotation={[0, Math.PI, 0]}>
      {/* Inner Portal Frame, Pilasters & Sculpted Lintel */}
      <AngkorDoorPilastersAndLintel />
      {/* Inner Celestial Devata Niches */}
      <AngkorDevataNiche position={[-2.45, 2.45, 0.05]} />
      <AngkorDevataNiche position={[2.45, 2.45, 0.05]} />
      {/* Flanking Inner Sandstone Gopura Columns */}
      <GopuraColumn x={-3.2} />
      <GopuraColumn x={3.2} />

      {/* Triangular Rear Pediment facing inner courtyard with Makara Horn Crests */}
      <group position={[0, 6.35, 0.15]}>
        <mesh rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[2.35, 1.9, 4]} />
          <meshStandardMaterial color="#CDB082" roughness={0.76} />
        </mesh>
        <mesh position={[0, -0.15, 0.14]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.85, 1.45, 4]} />
          <meshStandardMaterial color="#DFBE8D" roughness={0.72} />
        </mesh>
        <mesh position={[-2.2, -0.65, 0.05]} rotation={[0, 0, 0.45]} castShadow>
          <coneGeometry args={[0.22, 0.8, 6]} />
          <meshStandardMaterial color="#D99B38" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[2.2, -0.65, 0.05]} rotation={[0, 0, -0.45]} castShadow>
          <coneGeometry args={[0.22, 0.8, 6]} />
          <meshStandardMaterial color="#D97706" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Symmetrical Colonnaded Temple Gallery Wing (ថែវប្រាសាទសងខាង)
 * Features stepped cyma lotus plinths, 4-tier ashlar sandstone walls with carved
 * narrative bas-relief friezes, celestial Devata shrines, fluted columns,
 * turned window balusters, and terminal corner pavilions.
 */
function AngkorGalleryWing({
  isLeft,
  startX = 3.2,
  endX = 15.5,
}: {
  isLeft: boolean;
  startX?: number;
  endX?: number;
}) {
  const dir = isLeft ? -1 : 1;
  const length = endX - startX;
  const midX = dir * (startX + length / 2);
  const pavilionX = dir * endX;

  const pillarXOffsets = [
    startX + 1.2,
    startX + 3.4,
    startX + 5.6,
    startX + 7.8,
    startX + 10.0,
  ].map((x) => dir * x);

  const windowBayCenters = [
    startX + 2.3,
    startX + 4.5,
    startX + 6.7,
    startX + 8.9,
  ].map((x) => dir * x);

  const balusterOffsets = [-0.34, -0.17, 0, 0.17, 0.34];

  const ridgePositions: number[] = [];
  for (let x = startX + 0.6; x <= endX - 0.6; x += 0.8) {
    ridgePositions.push(dir * x);
  }

  const dentilPositions: number[] = [];
  for (let x = startX + 0.3; x <= endX - 0.3; x += 0.35) {
    dentilPositions.push(dir * x);
  }

  const rosettePositions: number[] = [];
  for (let x = startX + 0.8; x <= endX - 0.8; x += 1.4) {
    rosettePositions.push(dir * x);
  }

  const ashlarSeamPositions: number[] = [];
  for (let x = startX + 1.1; x <= endX - 0.5; x += 2.2) {
    ashlarSeamPositions.push(dir * x);
  }

  return (
    <group>
      {/* 1. Classical Khmer Stepped Cyma Lotus Plinth (ជើងទម្រថែវអង្គរវត្ត) */}
      <mesh position={[midX, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.32, 2.6]} />
        <meshStandardMaterial color="#7D6345" roughness={0.92} />
      </mesh>
      <mesh position={[midX, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.20, 2.76]} />
        <meshStandardMaterial color="#947754" roughness={0.88} />
      </mesh>
      <mesh position={[midX, 0.60, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.16, 2.52]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.86} />
      </mesh>
      <mesh position={[midX, 0.79, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.22, 2.86]} />
        <meshStandardMaterial color="#CDB082" roughness={0.82} />
      </mesh>

      {/* 2. Articulated Ashlar Sandstone Back Wall with Carved Bas-Relief Friezes (ចម្លាក់រាក់ថែវ) */}
      <mesh position={[midX, 1.35, 0.85]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.9, 0.42]} />
        <meshStandardMaterial color="#8F714A" roughness={0.88} />
      </mesh>
      <mesh position={[midX, 1.82, 0.84]}>
        <boxGeometry args={[length, 0.04, 0.44]} />
        <meshStandardMaterial color="#5C452D" roughness={0.95} />
      </mesh>

      <mesh position={[midX, 2.42, 0.85]} castShadow receiveShadow>
        <boxGeometry args={[length, 1.16, 0.46]} />
        <meshStandardMaterial color="#A88B60" roughness={0.84} />
      </mesh>
      <mesh position={[midX, 2.42, 0.61]}>
        <boxGeometry args={[length, 0.36, 0.04]} />
        <meshStandardMaterial color="#D6B57E" roughness={0.76} />
      </mesh>
      <mesh position={[midX, 3.02, 0.84]}>
        <boxGeometry args={[length, 0.04, 0.44]} />
        <meshStandardMaterial color="#5C452D" roughness={0.95} />
      </mesh>

      <mesh position={[midX, 3.52, 0.85]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.96, 0.42]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.88} />
      </mesh>
      <mesh position={[midX, 4.02, 0.84]}>
        <boxGeometry args={[length, 0.04, 0.44]} />
        <meshStandardMaterial color="#5C452D" roughness={0.95} />
      </mesh>

      <mesh position={[midX, 4.44, 0.85]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.80, 0.45]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>

      {/* Vertical Interlocking Ashlar Masonry Joints */}
      {ashlarSeamPositions.map((ax, aIdx) => (
        <mesh key={`ashlar-seam-${aIdx}`} position={[ax, 2.85, 0.84]}>
          <boxGeometry args={[0.04, 3.7, 0.45]} />
          <meshStandardMaterial color="#5C452D" roughness={0.95} />
        </mesh>
      ))}

      {/* Devata High-Relief Niches placed on the back wall between window bays */}
      {windowBayCenters.map((wx, bIdx) => (
        <AngkorDevataNiche
          key={`wall-devata-${bIdx}`}
          position={[wx, 2.45, 0.61]}
          scale={0.92}
        />
      ))}

      {/* 3. Colonnade of Fluted Sandstone Columns (Front Open Colonnade) */}
      {pillarXOffsets.map((px, idx) => (
        <group key={`col-${idx}`} position={[px, 0, -0.7]}>
          <mesh position={[0, 0.98, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.58, 0.22, 0.58]} />
            <meshStandardMaterial color="#B08D5B" roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.7, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 3.3, 0.42]} />
            <meshStandardMaterial color="#BFA06C" roughness={0.82} />
          </mesh>
          <mesh position={[0, 2.7, -0.22]}>
            <boxGeometry args={[0.26, 3.1, 0.05]} />
            <meshStandardMaterial color="#D6B57E" roughness={0.76} />
          </mesh>
          <mesh position={[0, 2.7, 0.22]}>
            <boxGeometry args={[0.26, 3.1, 0.05]} />
            <meshStandardMaterial color="#D6B57E" roughness={0.76} />
          </mesh>
          <mesh position={[0, 4.45, 0]} castShadow>
            <boxGeometry args={[0.56, 0.18, 0.56]} />
            <meshStandardMaterial color="#DFC090" roughness={0.75} />
          </mesh>
          <mesh position={[0, 4.6, 0]} castShadow>
            <boxGeometry args={[0.66, 0.14, 0.66]} />
            <meshStandardMaterial color="#E8CE9D" roughness={0.72} />
          </mesh>
        </group>
      ))}

      {/* 4. Carved Window Bays with Turned Sandstone Balusters (បង្អួចចម្រឹងថ្ម) */}
      {windowBayCenters.map((wx, bIdx) => (
        <group key={`window-${bIdx}`} position={[wx, 0, 0]}>
          <mesh position={[0, 1.15, 0]} castShadow>
            <boxGeometry args={[1.5, 0.22, 0.9]} />
            <meshStandardMaterial color="#A4855E" roughness={0.84} />
          </mesh>
          <mesh position={[0, 3.95, 0]} castShadow>
            <boxGeometry args={[1.5, 0.26, 0.9]} />
            <meshStandardMaterial color="#BFA06C" roughness={0.8} />
          </mesh>
          {balusterOffsets.map((bx, balIdx) => (
            <group key={`baluster-${balIdx}`} position={[bx, 2.55, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.048, 0.048, 2.45, 8]} />
                <meshStandardMaterial color="#CDB082" roughness={0.72} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.075, 8, 8]} />
                <meshStandardMaterial color="#D97706" roughness={0.5} metalness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 5. Continuous Entablature Beam with Dentils (ធ្មេញកណ្តុរ) & Rosette Bosses */}
      <mesh position={[midX, 4.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.5, 2.6]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.86} />
      </mesh>
      {dentilPositions.map((dx, dIdx) => (
        <mesh key={`dentil-${dIdx}`} position={[dx, 4.62, -1.25]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.14]} />
          <meshStandardMaterial color="#DFC090" roughness={0.76} />
        </mesh>
      ))}
      {rosettePositions.map((rx, rIdx) => (
        <mesh key={`ent-rosette-${rIdx}`} position={[rx, 4.85, -1.32]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 8]} />
          <meshStandardMaterial color="#D97706" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[midX, 5.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.24, 2.8]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>

      {/* 6. Stepped Corbelled Barrel-Vault Roof (ដំបូលកោងថែវ) */}
      <mesh position={[midX, 5.5, 0]} castShadow>
        <boxGeometry args={[length, 0.42, 2.2]} />
        <meshStandardMaterial color="#B59668" roughness={0.82} />
      </mesh>
      <mesh position={[midX, 5.85, 0]} castShadow>
        <boxGeometry args={[length, 0.35, 1.7]} />
        <meshStandardMaterial color="#C8A978" roughness={0.78} />
      </mesh>
      <mesh position={[midX, 6.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, length, 12]} />
        <meshStandardMaterial color="#BA9966" roughness={0.8} />
      </mesh>

      {/* 7. Decorative Ridge Crest Finials (ក្បាច់ខ្នងដំបូល) */}
      {ridgePositions.map((rx, rIdx) => (
        <mesh key={`ridge-${rIdx}`} position={[rx, 6.78, 0]} castShadow>
          <coneGeometry args={[0.12, 0.32, 6]} />
          <meshStandardMaterial color="#D97706" roughness={0.45} metalness={0.4} />
        </mesh>
      ))}

      {/* 8. Terminal Corner Pavilion (ពន្លាជ្រុង) with Ashlar Facade & Blind Windows */}
      <group position={[pavilionX, 0, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.9, 3.2]} />
          <meshStandardMaterial color="#7D6345" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.98, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.45, 0.22, 3.45]} />
          <meshStandardMaterial color="#947754" roughness={0.88} />
        </mesh>
        <mesh position={[0, 2.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.7, 3.6, 2.7]} />
          <meshStandardMaterial color="#A4855E" roughness={0.84} />
        </mesh>
        {/* Blind Window on Outer Lateral Face */}
        <group position={[dir * 1.36, 2.85, 0]} rotation={[0, (dir * Math.PI) / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 2.2, 0.08]} />
            <meshStandardMaterial color="#6B5237" roughness={0.9} />
          </mesh>
          {[-0.32, -0.16, 0, 0.16, 0.32].map((bx, idx) => (
            <mesh key={`blind-bal-${idx}`} position={[bx, 0, 0.04]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 2.0, 6]} />
              <meshStandardMaterial color="#CDB082" roughness={0.75} />
            </mesh>
          ))}
        </group>
        {/* Corner Pavilion Columns */}
        {[-1.25, 1.25].map((cx, cIdx) =>
          [-1.25, 1.25].map((cz, zIdx) => (
            <mesh key={`pcol-${cIdx}-${zIdx}`} position={[cx, 2.85, cz]} castShadow>
              <boxGeometry args={[0.38, 3.6, 0.38]} />
              <meshStandardMaterial color="#DFC090" roughness={0.76} />
            </mesh>
          ))
        )}
        <mesh position={[0, 4.8, 0]} castShadow>
          <boxGeometry args={[3.3, 0.45, 3.3]} />
          <meshStandardMaterial color="#BFA06C" roughness={0.8} />
        </mesh>
        <AngkorPrasatTower position={[0, 5.0, 0]} scale={0.58} showAntefixes={false} />
      </group>
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
      {/* ===== 1. SYMMETRICAL COLONNADED ANGKOR GALLERY WINGS (ថែវប្រាសាទសងខាង) ===== */}
      <AngkorGalleryWing startX={3.2} endX={15.5} isLeft={true} />
      <AngkorGalleryWing startX={3.2} endX={15.5} isLeft={false} />

      {/* ===== 2. FLANKING ENTRANCE DEVATA HIGH-RELIEF NICHES (ចម្លាក់ទេវតាអមទ្វារ) ===== */}
      <AngkorDevataNiche position={[-2.25, 2.45, -0.45]} />
      <AngkorDevataNiche position={[2.25, 2.45, -0.45]} />

      {/* ===== 2B. ARMED DVARAPALA TEMPLE SENTINELS (ទ្វារបាលកាន់ដំបងយាមទ្វារ) ===== */}
      <DvarapalaSentinel position={[-1.82, 0, -0.65]} scale={1.02} />
      <DvarapalaSentinel position={[1.82, 0, -0.65]} scale={1.02} />

      {/* ===== 3. CARVED DOOR PILASTERS & SCULPTED LINTEL (សសរផ្អោប និងផ្តែរទ្វារ) ===== */}
      <AngkorDoorPilastersAndLintel />

      {/* ===== 3B. INNER COURTYARD GOPURA FACADE (មុខគោបុរៈខាងក្នុងបែរទៅទិសខាងកើត) ===== */}
      <AngkorInnerGopuraFacade />

      {/* ===== 4. OUTER KHMER SANDSTONE GOPURA COLUMNS ===== */}
      <GopuraColumn x={-3.2} />
      <GopuraColumn x={3.2} />

      {/* ===== 3. STEPPED ANGKORIAN GOPURA ROOF & CORBELLED PEDIMENT ===== */}
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

      {/* ===== 4. MONUMENTAL CENTRAL LOTUS PRASAT SPIRE (កំពូលផ្កាឈូកកណ្ដាល) ===== */}
      <AngkorPrasatTower position={[0, 5.6, 0]} scale={1.22} showAntefixes={true} />

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
