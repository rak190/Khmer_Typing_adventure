import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../hooks/useGltfAsset';
import { SinghaGuardianLion } from './StageChallenges';

const FLAGSTONE_TINTS = ['#D4B27C', '#C29C64', '#DEBF8E', '#B2884E', '#CCA46E', '#E4C99A'];

function GlbPropInstance({
  url,
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}) {
  const cloned = useGltfClone(url);
  const instance = useMemo(() => (cloned ? cloned.clone(true) : null), [cloned]);
  if (!instance) return null;
  const scaleVec: [number, number, number] = Array.isArray(scale) ? scale : [scale, scale, scale];
  return (
    <group position={position} rotation={rotation} scale={scaleVec}>
      <primitive object={instance} />
    </group>
  );
}

/**
 * Stylized Tropical Cloud Cluster
 */
function StylizedCloud({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2.5, 14, 10]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.88} />
      </mesh>
      <mesh position={[-2.2, -0.3, 0.2]}>
        <sphereGeometry args={[1.75, 12, 8]} />
        <meshBasicMaterial color="#F8FAFC" transparent opacity={0.85} />
      </mesh>
      <mesh position={[2.3, -0.25, -0.1]}>
        <sphereGeometry args={[1.9, 12, 8]} />
        <meshBasicMaterial color="#FFFBEB" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.6, 0.95, -0.2]}>
        <sphereGeometry args={[1.65, 12, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Cambodian Sugar Palm (ដើមត្នោត / Borassus flabellifer)
 * Iconic national tree of Cambodia with rounded crown, dried frond skirt, and palm fruits.
 */
function SugarPalmTree({
  position,
  scale = 1,
  lean = 0.06,
}: {
  position: [number, number, number];
  scale?: number;
  lean?: number;
}) {
  const frondAngles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];

  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0, 0, lean]}>
      {/* Lower Flared Trunk Foot */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.42, 0.9, 10]} />
        <meshStandardMaterial color="#4A301A" roughness={0.92} />
      </mesh>
      {/* Main Ringed Slender Trunk */}
      <mesh position={[0.02, 2.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.20, 0.26, 2.4, 10]} />
        <meshStandardMaterial color="#5C3B20" roughness={0.9} />
      </mesh>
      {/* Upper Curved Trunk */}
      <mesh position={[0.08, 3.8, 0]} rotation={[0, 0, -lean * 0.7]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.20, 1.8, 10]} />
        <meshStandardMaterial color="#6B4527" roughness={0.88} />
      </mesh>

      {/* Skirt of Dried Brown Fronds under Crown */}
      <mesh position={[0.12, 4.45, 0]}>
        <coneGeometry args={[0.55, 0.65, 8]} />
        <meshStandardMaterial color="#785338" roughness={0.94} />
      </mesh>

      {/* Hanging Clusters of Palm Fruits (ផ្លែត្នោត) */}
      {[-0.2, 0.15].map((fx, idx) => (
        <group key={`fruit-${idx}`} position={[0.12 + fx, 4.35, 0.15]}>
          <mesh>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshStandardMaterial color="#2E1C0C" roughness={0.6} />
          </mesh>
          <mesh position={[0.08, -0.08, 0]}>
            <sphereGeometry args={[0.10, 6, 6]} />
            <meshStandardMaterial color="#1C1008" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Crown Core */}
      <mesh position={[0.12, 4.7, 0]}>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshStandardMaterial color="#2D4A1A" roughness={0.85} />
      </mesh>

      {/* Radiating Fan-Shaped Sugar Palm Fronds */}
      {frondAngles.map((angle, idx) => (
        <group key={idx} position={[0.12, 4.75, 0]} rotation={[0.48, angle, 0]}>
          <mesh position={[0, 0, 1.1]} rotation={[0.22, 0, 0]} castShadow>
            <boxGeometry args={[0.58, 0.05, 2.1]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#1E5E20' : '#2E7D32'} roughness={0.72} />
          </mesh>
          <mesh position={[0, -0.22, 2.05]} rotation={[0.55, 0, 0]}>
            <coneGeometry args={[0.32, 0.95, 6]} />
            <meshStandardMaterial color="#388E3C" roughness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Multi-Petaled Cambodian Pink Lotus (*Nelumbo nucifera* / ផ្កាឈូក)
 */
function SacredLotusBloom({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Floating Emerald Lily Pad */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.025, 16]} />
        <meshStandardMaterial color="#227028" roughness={0.65} />
      </mesh>
      {/* Outer Broad White-Pink Petals */}
      <mesh position={[0, 0.09, 0]}>
        <coneGeometry args={[0.26, 0.18, 10]} />
        <meshStandardMaterial color="#F472B6" roughness={0.42} />
      </mesh>
      {/* Inner Magenta Petals */}
      <mesh position={[0, 0.14, 0]} rotation={[0, Math.PI / 10, 0]}>
        <coneGeometry args={[0.18, 0.16, 10]} />
        <meshStandardMaterial color="#E11D48" roughness={0.38} />
      </mesh>
      {/* Golden Pistil & Anther Seedpod */}
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.07, 0.05, 0.06, 8]} />
        <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/**
 * Projecting Cardinal Antefix on each AngkorLotusTower corbelled tier
 */
function LotusTowerCardinalAntefix({
  angle,
  dist,
  width,
  height,
}: {
  angle: number;
  dist: number;
  width: number;
  height: number;
}) {
  return (
    <group rotation={[0, angle, 0]}>
      <group position={[0, 0, dist]}>
        {/* Triangular Gable Pediment */}
        <mesh position={[0, height * 0.44, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[width * 0.5, height * 0.85, 4]} />
          <meshStandardMaterial color="#CDB082" roughness={0.76} />
        </mesh>
        {/* Miniature Lintel */}
        <mesh position={[0, height * 0.12, 0.06]} castShadow>
          <boxGeometry args={[width * 0.75, height * 0.22, 0.12]} />
          <meshStandardMaterial color="#9C7E54" roughness={0.84} />
        </mesh>
        {/* Flame Antefix Crest */}
        <mesh position={[0, height * 0.9, 0.03]} castShadow>
          <coneGeometry args={[width * 0.14, height * 0.35, 6]} />
          <meshStandardMaterial color="#D99B38" roughness={0.4} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Authentic Angkorian Stepped Lotus Prasat Tower (កំពូលផ្កាឈូកអង្គរវត្ត)
 * Features 5 diminishing corbelled sandstone tiers with stepped cruciform re-entrant profiles,
 * projecting cardinal antefixes (ហោជាងទិស), dentil friezes, deeply ribbed lotus-bud dome (ផ្កាឈូកក្រពុំ),
 * and radiant golden Kalasha pot finial with royal Chatra rings.
 */
function AngkorLotusTower({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Stepped Plinth with Re-Entrant Angles & Lotus Carving */}
      <mesh position={[0, 1.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.6, 2.4, 4.6]} />
        <meshStandardMaterial color="#8C7050" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[5.2, 2.35, 3.2]} />
        <meshStandardMaterial color="#8C7050" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[3.2, 2.35, 5.2]} />
        <meshStandardMaterial color="#8C7050" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.48, 0]} castShadow>
        <boxGeometry args={[4.9, 0.22, 4.9]} />
        <meshStandardMaterial color="#BA9B6A" roughness={0.82} />
      </mesh>
      <mesh position={[0, 2.62, 0]} castShadow>
        <boxGeometry args={[5.1, 0.12, 5.1]} />
        <meshStandardMaterial color="#CDB082" roughness={0.78} />
      </mesh>

      {/* 2. Sanctuary Body with Projecting Cardinal Porticos & Carved Pilasters */}
      <mesh position={[0, 4.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.9, 3.8]} />
        <meshStandardMaterial color="#A4855E" roughness={0.86} />
      </mesh>
      {/* Stepped Portico Projections */}
      <mesh position={[0, 4.1, 0]} castShadow>
        <boxGeometry args={[4.25, 2.85, 2.6]} />
        <meshStandardMaterial color="#A4855E" roughness={0.86} />
      </mesh>
      <mesh position={[0, 4.1, 0]} castShadow>
        <boxGeometry args={[2.6, 2.85, 4.25]} />
        <meshStandardMaterial color="#A4855E" roughness={0.86} />
      </mesh>

      {/* Front Entrance Porch with Corbelled Pediment */}
      <mesh position={[0, 3.2, 2.25]} castShadow>
        <boxGeometry args={[1.7, 2.3, 0.7]} />
        <meshStandardMaterial color="#785E3E" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.5, 2.3]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.1, 1.1, 4]} />
        <meshStandardMaterial color="#CDB082" roughness={0.78} />
      </mesh>

      {/* 3. Five Diminishing Stepped Corbelled Tower Roof Levels with Cardinal Antefixes */}
      {/* Tier 1 */}
      <mesh position={[0, 5.75, 0]} castShadow>
        <boxGeometry args={[3.5, 0.52, 3.5]} />
        <meshStandardMaterial color="#B59668" roughness={0.82} />
      </mesh>
      <mesh position={[0, 6.05, 0]} castShadow>
        <boxGeometry args={[3.7, 0.12, 3.7]} />
        <meshStandardMaterial color="#DFC090" roughness={0.76} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
        <LotusTowerCardinalAntefix
          key={`lt-t1-${idx}`}
          angle={ang}
          dist={1.82}
          width={1.1}
          height={0.85}
        />
      ))}

      {/* Tier 2 */}
      <mesh position={[0, 6.45, 0]} castShadow>
        <boxGeometry args={[3.0, 0.48, 3.0]} />
        <meshStandardMaterial color="#C2A272" roughness={0.8} />
      </mesh>
      <mesh position={[0, 6.72, 0]} castShadow>
        <boxGeometry args={[3.18, 0.10, 3.18]} />
        <meshStandardMaterial color="#DFC090" roughness={0.76} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
        <LotusTowerCardinalAntefix
          key={`lt-t2-${idx}`}
          angle={ang}
          dist={1.55}
          width={0.92}
          height={0.75}
        />
      ))}

      {/* Tier 3 */}
      <mesh position={[0, 7.15, 0]} castShadow>
        <boxGeometry args={[2.5, 0.45, 2.5]} />
        <meshStandardMaterial color="#C8A978" roughness={0.78} />
      </mesh>
      <mesh position={[0, 7.4, 0]} castShadow>
        <boxGeometry args={[2.65, 0.09, 2.65]} />
        <meshStandardMaterial color="#D6B785" roughness={0.76} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
        <LotusTowerCardinalAntefix
          key={`lt-t3-${idx}`}
          angle={ang}
          dist={1.28}
          width={0.76}
          height={0.65}
        />
      ))}

      {/* Tier 4 */}
      <mesh position={[0, 7.8, 0]} castShadow>
        <boxGeometry args={[2.0, 0.42, 2.0]} />
        <meshStandardMaterial color="#D0B180" roughness={0.76} />
      </mesh>
      <mesh position={[0, 8.04, 0]} castShadow>
        <boxGeometry args={[2.12, 0.08, 2.12]} />
        <meshStandardMaterial color="#DFC090" roughness={0.74} />
      </mesh>

      {/* Tier 5 */}
      <mesh position={[0, 8.42, 0]} castShadow>
        <boxGeometry args={[1.52, 0.38, 1.52]} />
        <meshStandardMaterial color="#D6B785" roughness={0.74} />
      </mesh>

      {/* 4. Lotus Neck & Flared Petal Collar (កញ្ចឹងឈូក) */}
      <mesh position={[0, 8.85, 0]} castShadow>
        <cylinderGeometry args={[0.74, 0.88, 0.45, 16]} />
        <meshStandardMaterial color="#BA9966" roughness={0.8} />
      </mesh>
      <mesh position={[0, 9.12, 0]} castShadow>
        <cylinderGeometry args={[0.98, 0.72, 0.22, 16]} />
        <meshStandardMaterial color="#D6B785" roughness={0.74} />
      </mesh>

      {/* 5. Corbelled Ribbed Lotus Bud Dome (ផ្កាឈូកក្រពុំ) with 8 Fluted Ribs */}
      <mesh position={[0, 9.75, 0]} castShadow>
        <cylinderGeometry args={[1.08, 0.82, 1.15, 16]} />
        <meshStandardMaterial color="#DFC090" roughness={0.74} />
      </mesh>
      <mesh position={[0, 10.88, 0]} castShadow>
        <coneGeometry args={[1.02, 1.65, 16]} />
        <meshStandardMaterial color="#E8CE9D" roughness={0.72} />
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
      ].map((angle, idx) => (
        <group key={`drib-${idx}`} rotation={[0, angle, 0]}>
          <mesh position={[0, 10.3, 0.84]} rotation={[0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.11, 1.55, 6]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.45} metalness={0.35} />
          </mesh>
        </group>
      ))}

      {/* 6. Radiant Golden Kalasha Finial Spire with Royal Chatra Rings */}
      <mesh position={[0, 11.88, 0]} castShadow>
        <sphereGeometry args={[0.26, 12, 10]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.8} />
      </mesh>
      <mesh position={[0, 12.25, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.2, 0.38, 8]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.75} />
      </mesh>
      {/* 2 Chatra Umbrella Rings */}
      <mesh position={[0, 12.52, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 12]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[0, 12.72, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.05, 12]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[0, 13.15, 0]}>
        <cylinderGeometry args={[0.03, 0.1, 0.95, 8]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[0, 13.75, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.85} />
      </mesh>
    </group>
  );
}

/**
 * Seven-Headed Khmer Naga Balustrade Terminal (ក្បាលនាគរាជ ៧ក្បាល)
 * The hallmark entrance balustrade of Angkor Wat with 7 rearing crowned cobra heads
 * spreading outward in a magnificent fan, guarding the sacred causeway.
 */
function SevenHeadedNagaTerminal({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const heads = [
    { angle: 0, height: 1.62, headScale: 1.0, forward: 0.14 },
    { angle: -0.22, height: 1.50, headScale: 0.88, forward: 0.10 },
    { angle: 0.22, height: 1.50, headScale: 0.88, forward: 0.10 },
    { angle: -0.44, height: 1.32, headScale: 0.76, forward: 0.04 },
    { angle: 0.44, height: 1.32, headScale: 0.76, forward: 0.04 },
    { angle: -0.64, height: 1.10, headScale: 0.64, forward: -0.04 },
    { angle: 0.64, height: 1.10, headScale: 0.64, forward: -0.04 },
  ];

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Stepped Sandstone Pedestal Plinth */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.32, 1.45]} />
        <meshStandardMaterial color="#8F714A" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.40, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.20, 1.25]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.54, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.96, 0.12, 1.08]} />
        <meshStandardMaterial color="#CDB082" roughness={0.82} />
      </mesh>

      {/* Undulating Serpentine Neck Rearing Upward */}
      <mesh position={[0, 0.88, 0.16]} rotation={[0.38, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.44, 0.88, 10]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>
      {/* Serpentine Ventral Scale Plates */}
      <mesh position={[0, 0.88, 0.34]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[0.28, 0.82, 0.06]} />
        <meshStandardMaterial color="#DFC090" roughness={0.76} />
      </mesh>

      {/* Fan-Shaped Flared Hood Backing Membrane */}
      <mesh position={[0, 1.44, -0.02]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[1.52, 1.05, 0.15]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.88} />
      </mesh>
      {/* Arched Crest Molding */}
      <mesh position={[0, 1.98, -0.04]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.78, 0.78, 0.14, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.84} />
      </mesh>

      {/* Seven Crowned Serpent Heads */}
      {heads.map((h, idx) => (
        <group
          key={`naga-head-${idx}`}
          position={[Math.sin(h.angle) * 0.62, h.height, h.forward]}
          rotation={[0.14, h.angle * 0.75, -h.angle * 0.35]}
          scale={[h.headScale, h.headScale, h.headScale]}
        >
          {/* Head Snout & Upper Jaw */}
          <mesh castShadow>
            <boxGeometry args={[0.20, 0.24, 0.36]} />
            <meshStandardMaterial color="#CDB082" roughness={0.78} />
          </mesh>
          {/* Bulging Eyes */}
          <mesh position={[-0.11, 0.05, 0.07]}>
            <sphereGeometry args={[0.048, 8, 8]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0.11, 0.05, 0.07]}>
            <sphereGeometry args={[0.048, 8, 8]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Open Jaws & Fangs */}
          <mesh position={[0, -0.13, 0.09]} rotation={[-0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.16, 0.08, 0.28]} />
            <meshStandardMaterial color="#A4855E" roughness={0.82} />
          </mesh>
          {/* Multi-Tiered Royal Crown (Mokot) Finial */}
          <mesh position={[0, 0.24, -0.02]} castShadow>
            <coneGeometry args={[0.10, 0.28, 6]} />
            <meshStandardMaterial color="#D97706" roughness={0.45} metalness={0.45} />
          </mesh>
          <mesh position={[0, 0.39, -0.02]}>
            <sphereGeometry args={[0.038, 6, 6]} />
            <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Classical Angkorian Temple Library (ហោត្រៃ / Palm-Leaf Manuscript Library)
 * Symmetrical sandstone library buildings situated on raised cruciform terraces
 * flanking the inner causeway, featuring corbelled barrel-vault roofs,
 * porch colonnades, turned window balusters, and flame antefixes.
 */
function AngkorLibrary({
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
      {/* 1. Raised Cruciform Sandstone Plinth with Stepped Cyma Moldings */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.5, 7.8]} />
        <meshStandardMaterial color="#7D6345" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 0.22, 8.1]} />
        <meshStandardMaterial color="#947754" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.24, 7.4]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.0, 0.18, 7.6]} />
        <meshStandardMaterial color="#CDB082" roughness={0.82} />
      </mesh>

      {/* 2. Main Sanctuary Hall (Ashlar Sandstone Walls) */}
      <mesh position={[0, 2.4, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.7, 5.4]} />
        <meshStandardMaterial color="#A4855E" roughness={0.86} />
      </mesh>

      {/* Narrative Ashlar Seams & Carved Dado Registers */}
      <mesh position={[0, 1.45, 0.4]}>
        <boxGeometry args={[3.88, 0.08, 5.48]} />
        <meshStandardMaterial color="#6B5237" roughness={0.94} />
      </mesh>
      <mesh position={[0, 2.45, 0.4]}>
        <boxGeometry args={[3.88, 0.06, 5.48]} />
        <meshStandardMaterial color="#6B5237" roughness={0.94} />
      </mesh>
      <mesh position={[0, 3.45, 0.4]}>
        <boxGeometry args={[3.88, 0.08, 5.48]} />
        <meshStandardMaterial color="#6B5237" roughness={0.94} />
      </mesh>

      {/* 3. Front Porch (Mukha-mandapa) Facing Causeway */}
      {/* 4 Carved Porch Pillars */}
      {[-1.4, 1.4].map((px, pIdx) => (
        <group key={`lib-pillar-${pIdx}`} position={[px, 1.05, -2.7]}>
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.3, 0.42]} />
            <meshStandardMaterial color="#8F714A" roughness={0.88} />
          </mesh>
          <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.32, 2.2, 0.32]} />
            <meshStandardMaterial color="#BFA06C" roughness={0.82} />
          </mesh>
          <mesh position={[0, 2.45, 0]} castShadow>
            <boxGeometry args={[0.44, 0.22, 0.44]} />
            <meshStandardMaterial color="#DFC090" roughness={0.76} />
          </mesh>
        </group>
      ))}

      {/* Porch Pediment (ហោជាងមុខ) */}
      <group position={[0, 3.85, -2.6]}>
        <mesh rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.8, 1.4, 4]} />
          <meshStandardMaterial color="#CDB082" roughness={0.78} />
        </mesh>
        <mesh position={[0, -0.1, 0.12]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.35, 1.05, 4]} />
          <meshStandardMaterial color="#DFBE8D" roughness={0.74} />
        </mesh>
        {/* Upward Makara Horn Eaves */}
        <mesh position={[-1.6, -0.45, 0.04]} rotation={[0, 0, 0.45]} castShadow>
          <coneGeometry args={[0.16, 0.6, 6]} />
          <meshStandardMaterial color="#D99B38" roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh position={[1.6, -0.45, 0.04]} rotation={[0, 0, -0.45]} castShadow>
          <coneGeometry args={[0.16, 0.6, 6]} />
          <meshStandardMaterial color="#D99B38" roughness={0.45} metalness={0.4} />
        </mesh>
      </group>

      {/* 4. Turned Sandstone Baluster Windows (បង្អួចចម្រឹងថ្ម) on Hall Flanks */}
      {[-1.95, 1.95].map((wx, wIdx) =>
        [-0.8, 1.6].map((wz, zIdx) => (
          <group key={`lib-win-${wIdx}-${zIdx}`} position={[wx, 2.2, wz]}>
            <mesh castShadow>
              <boxGeometry args={[0.18, 1.5, 1.1]} />
              <meshStandardMaterial color="#6B5237" roughness={0.92} />
            </mesh>
            {/* Baluster shafts */}
            {[-0.32, 0, 0.32].map((bz, bIdx) => (
              <mesh key={`b-${bIdx}`} position={[0, 0, bz]} castShadow>
                <cylinderGeometry args={[0.038, 0.038, 1.35, 8]} />
                <meshStandardMaterial color="#DFC090" roughness={0.76} />
              </mesh>
            ))}
          </group>
        ))
      )}

      {/* 5. Stepped Corbelled Barrel-Vault Roof (ដំបូលក្ដោងប្រាសាទ) */}
      <mesh position={[0, 4.05, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.5, 5.8]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.84} />
      </mesh>
      <mesh position={[0, 4.55, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.5, 5.2]} />
        <meshStandardMaterial color="#C2A272" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.0, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.45, 4.6]} />
        <meshStandardMaterial color="#CDB082" roughness={0.78} />
      </mesh>
      <mesh position={[0, 5.35, 0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.7, 1.2, 4.2, 10]} />
        <meshStandardMaterial color="#DFC090" roughness={0.74} />
      </mesh>

      {/* Roof Ridge Flame Finials (ក្បាច់ក្បាលដំបូល) */}
      {[-1.5, -0.75, 0, 0.75, 1.5].map((rz, rIdx) => (
        <mesh key={`rf-${rIdx}`} position={[0, 5.85, 0.4 + rz]} castShadow>
          <coneGeometry args={[0.12, 0.42, 6]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.35} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Stone Incense / Lantern Pillar (ចង្កៀងថ្ម / ជើងទៀនថ្ម)
 * Stands along the royal causeway providing ceremonial warmth and spiritual ambiance.
 */
function StoneLanternPillar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.44, 0.48]} />
        <meshStandardMaterial color="#8F714A" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.85, 8]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>
      {/* Pierced Lantern Chamber */}
      <mesh position={[0, 1.42, 0]} castShadow>
        <boxGeometry args={[0.36, 0.38, 0.36]} />
        <meshStandardMaterial color="#6B5237" roughness={0.92} />
      </mesh>
      {/* Golden Glowing Sacred Flame inside */}
      <mesh position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={1.4} />
      </mesh>
      {/* Mini Tiered Roof Finial */}
      <mesh position={[0, 1.72, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.26, 0.28, 4]} />
        <meshStandardMaterial color="#D97706" roughness={0.45} metalness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Monumental Courtyard Enclosure Gallery (កំពែងថែវប្រាសាទខាងក្នុង)
 * Continuous 22m covered sandstone gallery enclosing the inner courtyard,
 * featuring 4-tier ashlar courses, deeply detailed bas-relief registers (ចម្លាក់លើផ្ទៃជញ្ជាំង),
 * fluted colonnades, turned window balusters, celestial Devata niches, and corbelled roofs.
 */
function CourtyardEnclosureGallery({ isLeft }: { isLeft: boolean }) {
  const wallX = isLeft ? -13.8 : 13.8;
  const innerDir = isLeft ? 1 : -1;
  const centerZ = 17;
  const lengthZ = 22;

  const pillarOffsetsZ = [-9.5, -6.8, -4.1, -1.4, 1.4, 4.1, 6.8, 9.5];
  const windowBayOffsetsZ = [-7.5, -3.7, 0, 3.7, 7.5];
  const devataOffsetsZ = [-5.6, -1.8, 1.8, 5.6];
  const balusterOffsets = [-0.32, -0.16, 0, 0.16, 0.32];
  const ashlarSeamsZ = [-8.8, -6.6, -4.4, -2.2, 0, 2.2, 4.4, 6.6, 8.8];

  return (
    <group position={[wallX, 0, centerZ]}>
      {/* 1. Stepped Cyma Lotus Plinth along 22m length */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.32, lengthZ]} />
        <meshStandardMaterial color="#7D6345" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.95, 0.20, lengthZ + 0.3]} />
        <meshStandardMaterial color="#947754" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.60, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 0.16, lengthZ + 0.1]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.79, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.22, lengthZ + 0.4]} />
        <meshStandardMaterial color="#CDB082" roughness={0.82} />
      </mesh>

      {/* 2. Main Outer Ashlar Sandstone Wall */}
      <mesh position={[-innerDir * 1.05, 2.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 3.6, lengthZ]} />
        <meshStandardMaterial color="#8F714A" roughness={0.88} />
      </mesh>

      {/* Continuous Horizontal Masonry Joint Shadow Seams */}
      <mesh position={[-innerDir * 1.05, 1.8, 0]}>
        <boxGeometry args={[0.46, 0.04, lengthZ]} />
        <meshStandardMaterial color="#5C452D" roughness={0.95} />
      </mesh>
      <mesh position={[-innerDir * 1.05, 2.9, 0]}>
        <boxGeometry args={[0.46, 0.04, lengthZ]} />
        <meshStandardMaterial color="#5C452D" roughness={0.95} />
      </mesh>
      <mesh position={[-innerDir * 1.05, 3.9, 0]}>
        <boxGeometry args={[0.46, 0.04, lengthZ]} />
        <meshStandardMaterial color="#5C452D" roughness={0.95} />
      </mesh>

      {/* Vertical Interlocking Ashlar Seams */}
      {ashlarSeamsZ.map((sz, sIdx) => (
        <mesh key={`ashlar-${sIdx}`} position={[-innerDir * 1.05, 2.7, sz]}>
          <boxGeometry args={[0.47, 3.55, 0.04]} />
          <meshStandardMaterial color="#5C452D" roughness={0.95} />
        </mesh>
      ))}

      {/* 3. Deeply Detailed Bas-Relief Wall Surface (ចម្លាក់រាក់លើផ្ទៃជញ្ជាំងប្រាសាទ) */}
      {/* Continuous Bas-Relief Register Facing Inner Courtyard */}
      <mesh position={[-innerDir * 0.82, 2.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 0.48, lengthZ]} />
        <meshStandardMaterial color="#D6B57E" roughness={0.76} />
      </mesh>
      {/* Decorative Diamond Lozenge Chains (Kbach Changva Por) and Rosette Bosses */}
      {pillarOffsetsZ.map((pz, idx) => (
        <group key={`relief-panel-${idx}`} position={[-innerDir * 0.77, 2.35, pz]}>
          <mesh rotation={[0, innerDir > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 10]} />
            <meshStandardMaterial color="#D97706" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.65]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.14, 0.14, 0.03]} />
            <meshStandardMaterial color="#DFC090" roughness={0.74} />
          </mesh>
          <mesh position={[0, 0, -0.65]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.14, 0.14, 0.03]} />
            <meshStandardMaterial color="#DFC090" roughness={0.74} />
          </mesh>
        </group>
      ))}

      {/* 4. Colonnade of Fluted Sandstone Columns Facing Courtyard */}
      {pillarOffsetsZ.map((pz, idx) => (
        <group key={`col-p-${idx}`} position={[innerDir * 1.05, 0, pz]}>
          <mesh position={[0, 0.98, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.48, 0.22, 0.48]} />
            <meshStandardMaterial color="#B08D5B" roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.65, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.38, 3.15, 0.38]} />
            <meshStandardMaterial color="#BFA06C" roughness={0.82} />
          </mesh>
          {/* Fluted Molding Trims */}
          <mesh position={[innerDir * 0.2, 2.65, 0]}>
            <boxGeometry args={[0.04, 2.95, 0.24]} />
            <meshStandardMaterial color="#D6B57E" roughness={0.76} />
          </mesh>
          <mesh position={[0, 4.35, 0]} castShadow>
            <boxGeometry args={[0.52, 0.2, 0.52]} />
            <meshStandardMaterial color="#DFC090" roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* 5. Turned Sandstone Baluster Window Bays */}
      {windowBayOffsetsZ.map((wz, bIdx) => (
        <group key={`win-bay-${bIdx}`} position={[-innerDir * 1.05, 0, wz]}>
          <mesh position={[0, 1.25, 0]} castShadow>
            <boxGeometry args={[0.55, 0.22, 1.4]} />
            <meshStandardMaterial color="#A4855E" roughness={0.84} />
          </mesh>
          <mesh position={[0, 3.85, 0]} castShadow>
            <boxGeometry args={[0.55, 0.24, 1.4]} />
            <meshStandardMaterial color="#BFA06C" roughness={0.8} />
          </mesh>
          {balusterOffsets.map((bz, balIdx) => (
            <mesh key={`b-${balIdx}`} position={[0, 2.55, bz]} castShadow>
              <cylinderGeometry args={[0.046, 0.046, 2.3, 8]} />
              <meshStandardMaterial color="#CDB082" roughness={0.74} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 6. Celestial Devata High-Relief Niches along Wall */}
      {devataOffsetsZ.map((dz, dIdx) => (
        <group
          key={`enc-devata-${dIdx}`}
          position={[-innerDir * 0.82, 2.35, dz]}
          rotation={[0, innerDir > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          {/* Niche Cavity */}
          <mesh position={[0, 0, -0.04]} castShadow receiveShadow>
            <boxGeometry args={[0.68, 1.8, 0.1]} />
            <meshStandardMaterial color="#6B5237" roughness={0.92} />
          </mesh>
          {/* Pointed Gable Frame */}
          <mesh position={[0, 1.02, 0.02]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.48, 0.58, 4]} />
            <meshStandardMaterial color="#CDB082" roughness={0.78} />
          </mesh>
          {/* Lotus Pedestal */}
          <mesh position={[0, -0.8, 0.03]} castShadow>
            <cylinderGeometry args={[0.26, 0.22, 0.12, 8]} />
            <meshStandardMaterial color="#DFC090" roughness={0.76} />
          </mesh>
          {/* Celestial Maiden High-Relief Figure */}
          <mesh position={[0, 0.65, 0.05]} castShadow>
            <coneGeometry args={[0.09, 0.28, 6]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.48, 0.04]} castShadow>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshStandardMaterial color="#D6B785" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, 0.04]} castShadow>
            <cylinderGeometry args={[0.09, 0.12, 0.34, 8]} />
            <meshStandardMaterial color="#BFA06C" roughness={0.82} />
          </mesh>
          <mesh position={[0, -0.25, 0.04]} castShadow>
            <cylinderGeometry args={[0.13, 0.2, 0.68, 8]} />
            <meshStandardMaterial color="#BA9966" roughness={0.82} />
          </mesh>
          {/* Pink Lotus Flower in hand */}
          <mesh position={[0, 0.35, 0.1]} castShadow>
            <coneGeometry args={[0.05, 0.1, 6]} />
            <meshStandardMaterial color="#F472B6" roughness={0.45} />
          </mesh>
        </group>
      ))}

      {/* 7. Gallery Roof Architrave, Cornice Dentils & Corbelled Barrel-Vault */}
      <mesh position={[0, 4.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.45, lengthZ + 0.4]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.86} />
      </mesh>
      {/* Stepped Barrel-Vault Roof Tiers */}
      <mesh position={[0, 5.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.4, lengthZ + 0.3]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.84} />
      </mesh>
      <mesh position={[0, 5.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.35, lengthZ + 0.2]} />
        <meshStandardMaterial color="#C2A272" roughness={0.8} />
      </mesh>
      {/* Barrel-Vault Ridge Cylinder */}
      <mesh position={[0, 5.65, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.85, lengthZ, 10]} />
        <meshStandardMaterial color="#DFC090" roughness={0.74} />
      </mesh>

      {/* Ridge Flame Finials along length */}
      {pillarOffsetsZ.map((rz, rIdx) => (
        <mesh key={`rf-enc-${rIdx}`} position={[0, 6.15, rz]} castShadow>
          <coneGeometry args={[0.11, 0.38, 6]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.35} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export default function Environment() {
  const waterLeftRef = useRef<THREE.MeshStandardMaterial>(null);
  const waterRightRef = useRef<THREE.MeshStandardMaterial>(null);
  const cloudGroupRef = useRef<THREE.Group>(null);
  const lotusGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const shimmer = 0.22 + Math.sin(t * 2.1) * 0.06;
    if (waterLeftRef.current) waterLeftRef.current.emissiveIntensity = shimmer;
    if (waterRightRef.current) waterRightRef.current.emissiveIntensity = shimmer;

    if (cloudGroupRef.current) {
      cloudGroupRef.current.position.x = Math.sin(t * 0.04) * 3.2;
    }

    if (lotusGroupRef.current) {
      lotusGroupRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(t * 1.8 + i * 0.7) * 0.012;
      });
    }
  });

  const flagstones = [];
  for (let row = 0; row < 19; row += 1) {
    const z = -9.5 + row * 2.0;
    for (let col = -1; col <= 1; col += 1) {
      const x = col * 1.95 + (row % 2 === 0 ? 0.12 : -0.12);
      const tint = FLAGSTONE_TINTS[(row * 3 + col + 3) % FLAGSTONE_TINTS.length];
      flagstones.push({ key: `${row}-${col}`, x, z, tint });
    }
  }

  return (
    <group>
      {/* ===== 1. SUNLIT CAMBODIAN SKY DOME & HORIZON ATMOSPHERE ===== */}
      <color attach="background" args={['#38BDF8']} />
      <fog attach="fog" args={['#BAE6FD', 42, 115]} />

      {/* Upper Cerulean Sky Dome */}
      <mesh position={[0, 0, 10]} scale={[-1, 1, 1]}>
        <sphereGeometry args={[130, 24, 16]} />
        <meshBasicMaterial color="#38BDF8" side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Warm Golden Horizon Glow Band */}
      <mesh position={[0, 7, 72]}>
        <planeGeometry args={[240, 42]} />
        <meshBasicMaterial color="#FDE68A" transparent opacity={0.48} depthWrite={false} />
      </mesh>
      {/* Glowing Golden Morning Sun behind the Angkor Sanctuary */}
      <mesh position={[18, 28, 76]}>
        <circleGeometry args={[7.8, 24]} />
        <meshBasicMaterial color="#FEF08A" depthWrite={false} />
      </mesh>
      <mesh position={[18, 28, 75.5]}>
        <circleGeometry args={[13.5, 24]} />
        <meshBasicMaterial color="#FDE047" transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {/* Drifting Stylized Tropical Clouds */}
      <group ref={cloudGroupRef}>
        <StylizedCloud position={[-22, 25, 52]} scale={1.45} />
        <StylizedCloud position={[24, 27, 56]} scale={1.55} />
        <StylizedCloud position={[-6, 30, 64]} scale={1.3} />
        <StylizedCloud position={[-36, 22, 32]} scale={1.15} />
        <StylizedCloud position={[36, 23, 36]} scale={1.2} />
      </group>

      {/* ===== 2. WARM TROPICAL SUNLIGHT & BOUNCE LIGHTING ===== */}
      <ambientLight intensity={0.48} color="#FFFBF5" />
      <hemisphereLight args={['#E0F2FE', '#A87D4D', 0.95]} />
      <directionalLight
        castShadow
        position={[15, 26, -12]}
        intensity={1.75}
        color="#FFF8E7"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={72}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={38}
        shadow-camera-bottom={-16}
      />
      {/* Front Key Light — illuminates character face & diadem when facing camera */}
      <directionalLight position={[-8, 14, 18]} intensity={0.88} color="#FEF3C7" />
      <pointLight position={[0, 4.2, 4.8]} intensity={1.3} distance={15} color="#F59E0B" />
      <pointLight position={[0, 5.5, 28]} intensity={1.4} distance={22} color="#FBBF24" />

      {/* ===== 3. LUSH TROPICAL JUNGLE TERRAIN & COURTYARD BASE ===== */}
      {/* Outer Emerald Jungle Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 12]} receiveShadow>
        <planeGeometry args={[140, 120]} />
        <meshStandardMaterial color="#365314" roughness={0.92} />
      </mesh>

      {/* Terracotta / Laterite Temple Terrace Foundation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 10]} receiveShadow>
        <planeGeometry args={[28, 48]} />
        <meshStandardMaterial color="#4D7C0F" roughness={0.88} />
      </mesh>

      {/* ===== 4. TURQUOISE LOTUS REFLECTING POOLS / SACRED CANAL ===== */}
      {[-8.4, 8.4].map((poolX, idx) => (
        <group key={`lotus-pool-${idx}`} position={[poolX, 0, 9]}>
          {/* Submerged Laterite Basin Bed */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]} receiveShadow>
            <planeGeometry args={[5.6, 33.2]} />
            <meshStandardMaterial color="#1E3A42" roughness={0.95} />
          </mesh>
          {/* Stepped Laterite Canal Revetments (ច្រាំងកសិន្ធុថ្មបាយក្រៀម) */}
          <mesh position={[idx === 0 ? 2.5 : -2.5, -0.05, 0]} receiveShadow>
            <boxGeometry args={[0.6, 0.22, 33.6]} />
            <meshStandardMaterial color="#785536" roughness={0.92} />
          </mesh>
          <mesh position={[idx === 0 ? 2.2 : -2.2, 0.05, 0]} receiveShadow>
            <boxGeometry args={[0.55, 0.18, 33.8]} />
            <meshStandardMaterial color="#946E45" roughness={0.88} />
          </mesh>
          {/* Carved Sandstone Pool Coping Border */}
          <mesh position={[0, 0.04, 0]} receiveShadow>
            <boxGeometry args={[6.4, 0.14, 34]} />
            <meshStandardMaterial color="#B08D5E" roughness={0.86} />
          </mesh>
          {/* Translucent Shimmering Turquoise Water Surface */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} receiveShadow>
            <planeGeometry args={[5.6, 33.2]} />
            <meshStandardMaterial
              ref={idx === 0 ? waterLeftRef : waterRightRef}
              color="#06B6D4"
              emissive="#0891B2"
              emissiveIntensity={0.22}
              roughness={0.12}
              metalness={0.18}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* Floating Sacred Lotus Blooms & Lilypads with gentle undulating bobbing */}
      <group ref={lotusGroupRef}>
        {[
          [-7.2, 0.13, -3.5, 0.9, 0.4],
          [-9.1, 0.13, 0.8, 1.1, 1.8],
          [-7.6, 0.13, 5.2, 0.95, 2.7],
          [-8.8, 0.13, 11.4, 1.05, 0.9],
          [-7.4, 0.13, 17.5, 0.9, 2.1],
          [7.2, 0.13, -2.8, 1.0, 1.2],
          [9.0, 0.13, 1.6, 0.95, 2.9],
          [7.5, 0.13, 6.4, 1.1, 0.5],
          [8.7, 0.13, 12.2, 0.9, 1.7],
          [7.4, 0.13, 18.0, 1.05, 2.4],
        ].map(([lx, ly, lz, lscale, lrot], idx) => (
          <group key={`lily-${idx}`}>
            <GlbPropInstance
              url="/models/props/lotus_lilypad.glb"
              position={[lx, ly, lz]}
              rotation={[0, lrot, 0]}
              scale={lscale}
            />
            <SacredLotusBloom position={[lx + 0.35, ly, lz + 0.25]} scale={lscale * 0.9} />
          </group>
        ))}
      </group>

      {/* ===== 5. GOLDEN SANDSTONE CAUSEWAY & WEATHERED FLAGSTONES ===== */}
      <mesh position={[0, 0.02, 9]} receiveShadow>
        <boxGeometry args={[7.2, 0.08, 39]} />
        <meshStandardMaterial color="#C8A26A" roughness={0.86} />
      </mesh>

      {/* Carved Sandstone Balustrade Handrail Beams along Causeway */}
      <mesh position={[-3.85, 0.32, 9]} receiveShadow castShadow>
        <boxGeometry args={[0.38, 0.22, 39]} />
        <meshStandardMaterial color="#B08D5E" roughness={0.82} />
      </mesh>
      <mesh position={[3.85, 0.32, 9]} receiveShadow castShadow>
        <boxGeometry args={[0.38, 0.22, 39]} />
        <meshStandardMaterial color="#B08D5E" roughness={0.82} />
      </mesh>
      {/* Lower Curb Base */}
      <mesh position={[-3.85, 0.10, 9]} receiveShadow castShadow>
        <boxGeometry args={[0.54, 0.20, 39]} />
        <meshStandardMaterial color="#8F6E45" roughness={0.9} />
      </mesh>
      <mesh position={[3.85, 0.10, 9]} receiveShadow castShadow>
        <boxGeometry args={[0.54, 0.20, 39]} />
        <meshStandardMaterial color="#8F6E45" roughness={0.9} />
      </mesh>

      {/* Individual Weathered Sandstone Flagstone Slabs */}
      {flagstones.map((stone) => (
        <group key={stone.key} position={[stone.x, 0.075, stone.z]}>
          <mesh receiveShadow>
            <boxGeometry args={[1.78, 0.05, 1.78]} />
            <meshStandardMaterial color={stone.tint} roughness={0.82} />
          </mesh>
        </group>
      ))}

      {/* Carved Angkor Naga Balustrade Posts with Tiered Lotus Bud Finials */}
      {[-8.5, -4, 1, 6, 12, 19, 26].map((zPos) =>
        [-3.85, 3.85].map((xPos) => (
          <group key={`balustrade-post-${xPos}-${zPos}`} position={[xPos, 0, zPos]}>
            {/* Post Base Plinth */}
            <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.56, 0.48, 0.56]} />
              <meshStandardMaterial color="#9C7B4F" roughness={0.88} />
            </mesh>
            {/* Pillar Shaft */}
            <mesh position={[0, 0.52, 0]} castShadow>
              <boxGeometry args={[0.42, 0.32, 0.42]} />
              <meshStandardMaterial color="#BFA06C" roughness={0.84} />
            </mesh>
            {/* Carved Tiered Lotus Bud Finial (ក្បាលនាគ / ក្បាច់ឈូក) */}
            <mesh position={[0, 0.76, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.26, 0.18, 8]} />
              <meshStandardMaterial color="#D6B57E" roughness={0.78} />
            </mesh>
            <mesh position={[0, 0.94, 0]} castShadow>
              <coneGeometry args={[0.22, 0.32, 8]} />
              <meshStandardMaterial color="#D97706" roughness={0.52} metalness={0.35} />
            </mesh>
          </group>
        ))
      )}

      {/* ===== 5B. MONUMENTAL SEVEN-HEADED NAGA BALUSTRADE TERMINALS (ក្បាលនាគ ៧) ===== */}
      {/* Front Entrance Causeway Terminals (Facing approaching explorer from -Z) */}
      <SevenHeadedNagaTerminal position={[-3.85, 0, -9.8]} rotation={[0, 0, 0]} scale={1.05} />
      <SevenHeadedNagaTerminal position={[3.85, 0, -9.8]} rotation={[0, 0, 0]} scale={1.05} />
      {/* Rear Causeway Terminals (Facing inner sanctum approach) */}
      <SevenHeadedNagaTerminal position={[-3.85, 0, 28.5]} rotation={[0, Math.PI, 0]} scale={0.95} />
      <SevenHeadedNagaTerminal position={[3.85, 0, 28.5]} rotation={[0, Math.PI, 0]} scale={0.95} />

      {/* Ceremonial Stone Lantern / Incense Pillars along Causeway */}
      {[
        [-3.85, 0, -6.5],
        [3.85, 0, -6.5],
        [-3.85, 0, -1.5],
        [3.85, 0, -1.5],
        [-3.85, 0, 9.5],
        [3.85, 0, 9.5],
        [-3.85, 0, 15.5],
        [3.85, 0, 15.5],
        [-3.85, 0, 22.5],
        [3.85, 0, 22.5],
      ].map(([lx, ly, lz], idx) => (
        <StoneLanternPillar key={`lantern-pillar-${idx}`} position={[lx, ly, lz]} />
      ))}

      {/* ===== 5C. SYMMETRICAL ANGKORIAN TEMPLE LIBRARIES (ហោត្រៃសងខាងផ្លូវដើរ) ===== */}
      {/* North Library (Left of inner causeway, facing south toward walkway) */}
      <AngkorLibrary position={[-11.2, 0, 15.0]} rotation={[0, Math.PI / 2, 0]} scale={0.94} />
      {/* South Library (Right of inner causeway, facing north toward walkway) */}
      <AngkorLibrary position={[11.2, 0, 15.0]} rotation={[0, -Math.PI / 2, 0]} scale={0.94} />

      {/* ===== 5D. MONUMENTAL INNER COURTYARD ENCLOSURE GALLERIES (កំពែងថែវប្រាសាទខាងក្នុង) ===== */}
      {/* Left (North) Covered Gallery with Deep Bas-Reliefs (ចម្លាក់លើផ្ទៃជញ្ជាំង) & Devata Niches */}
      <CourtyardEnclosureGallery isLeft={true} />
      {/* Right (South) Covered Gallery with Deep Bas-Reliefs (ចម្លាក់លើផ្ទៃជញ្ជាំង) & Devata Niches */}
      <CourtyardEnclosureGallery isLeft={false} />

      {/* ===== 6. TALL PALM TREES, MOSSY ROCKS & TROPICAL VEGETATION ===== */}
      {/* Tall Quaternius Palm Trees framing the causeway */}
      {[
        [-11.8, 0, -4.5, 1.05, 0.4],
        [11.8, 0, -4.5, 1.05, -0.5],
        [-12.4, 0, 4.2, 1.15, 1.1],
        [12.4, 0, 4.2, 1.15, -1.2],
        [-12.2, 0, 14.0, 1.1, 2.0],
        [12.2, 0, 14.0, 1.1, -2.1],
        [-11.6, 0, 23.5, 1.2, 0.8],
        [11.6, 0, 23.5, 1.2, -0.8],
      ].map(([px, py, pz, pscale, prot], idx) => (
        <GlbPropInstance
          key={`glb-palm-${idx}`}
          url="/models/props/palm_tree_tall.glb"
          position={[px, py, pz]}
          rotation={[0, prot, 0]}
          scale={pscale}
        />
      ))}

      {/* Iconic Cambodian Sugar Palms (ដើមត្នោត) */}
      <SugarPalmTree position={[-14.5, 0, 0]} scale={1.2} lean={0.07} />
      <SugarPalmTree position={[14.5, 0, 0]} scale={1.2} lean={-0.07} />
      <SugarPalmTree position={[-15.0, 0, 10]} scale={1.26} lean={0.05} />
      <SugarPalmTree position={[15.0, 0, 10]} scale={1.26} lean={-0.05} />
      <SugarPalmTree position={[-14.2, 0, 20]} scale={1.22} lean={0.06} />
      <SugarPalmTree position={[14.2, 0, 20]} scale={1.22} lean={-0.06} />

      {/* Mossy Riverbank Rocks */}
      {[
        [-5.1, 0, -5.2, 0.85, 0.3],
        [5.1, 0, -5.2, 0.85, 1.9],
        [-5.2, 0, 1.2, 0.95, 1.1],
        [5.2, 0, 1.2, 0.95, 2.6],
        [-5.3, 0, 8.4, 1.0, 0.7],
        [5.3, 0, 8.4, 1.0, 2.2],
        [-5.2, 0, 18.2, 0.9, 1.5],
        [5.2, 0, 18.2, 0.9, 0.4],
      ].map(([rx, ry, rz, rscale, rrot], idx) => (
        <GlbPropInstance
          key={`glb-rock-${idx}`}
          url="/models/props/rock_moss.glb"
          position={[rx, ry, rz]}
          rotation={[0, rrot, 0]}
          scale={rscale}
        />
      ))}

      {/* Tropical Flowering Bushes along Pathway Perimeter */}
      {[
        [-4.6, 0, -8.2, 0.9, 0.2],
        [4.6, 0, -8.2, 0.9, 1.4],
        [-4.7, 0, -0.4, 1.0, 0.8],
        [4.7, 0, -0.4, 1.0, 2.1],
        [-4.8, 0, 6.8, 0.95, 1.7],
        [4.8, 0, 6.8, 0.95, 0.5],
        [-4.7, 0, 13.8, 1.0, 2.5],
        [4.7, 0, 13.8, 1.0, 1.1],
        [-4.8, 0, 22.4, 1.05, 0.9],
        [4.8, 0, 22.4, 1.05, 2.0],
      ].map(([bx, by, bz, bscale, brot], idx) => (
        <group key={`glb-bush-${idx}`}>
          <GlbPropInstance
            url="/models/props/tropical_bush.glb"
            position={[bx, by, bz]}
            rotation={[0, brot, 0]}
            scale={bscale}
          />
          <GlbPropInstance
            url="/models/props/tropical_flowers.glb"
            position={[bx * 0.92, by, bz + 0.55]}
            rotation={[0, brot + 0.8, 0]}
            scale={1.1}
          />
        </group>
      ))}

      {/* ===== 7. DISTANT ANGKOR WAT 5-TOWER SANCTUARY COMPLEX (Z = 58) ===== */}
      <group position={[0, 0, 58]}>
        {/* Tier 1 Bakan Pyramid Terrace (48m x 20m x 3m) */}
        <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[48, 3.0, 20]} />
          <meshStandardMaterial color="#7D6345" roughness={0.92} />
        </mesh>
        <mesh position={[0, 3.0, 0]} receiveShadow castShadow>
          <boxGeometry args={[49.2, 0.28, 20.6]} />
          <meshStandardMaterial color="#947754" roughness={0.88} />
        </mesh>
        {/* Tier 1 Carved Bas-Relief Frieze Band (ចម្លាក់លើផ្ទៃខឿនថ្នាក់ទី១) */}
        <mesh position={[0, 1.6, -10.05]} receiveShadow>
          <boxGeometry args={[47.4, 1.4, 0.08]} />
          <meshStandardMaterial color="#8F714A" roughness={0.86} />
        </mesh>
        {/* Running Rosette Medallions along Tier 1 Wall */}
        {[-21, -17.5, -14, -10.5, -7, 7, 10.5, 14, 17.5, 21].map((rx, idx) => (
          <group key={`t1-rosette-${idx}`} position={[rx, 1.6, -10.11]}>
            <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
              <boxGeometry args={[0.55, 0.55, 0.06]} />
              <meshStandardMaterial color="#CDB082" roughness={0.78} />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <sphereGeometry args={[0.12, 6, 6]} />
              <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Tier 1 Grand Axial Stone Staircase & Guardian Lions */}
        <mesh position={[0, 1.5, -11.0]} rotation={[-0.48, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[5.2, 0.35, 4.4]} />
          <meshStandardMaterial color="#8F714A" roughness={0.88} />
        </mesh>
        {/* Staircase Balustrades */}
        <mesh position={[-2.7, 1.6, -11.0]} rotation={[-0.48, 0, 0]} castShadow>
          <boxGeometry args={[0.32, 0.65, 4.4]} />
          <meshStandardMaterial color="#B08D5B" roughness={0.84} />
        </mesh>
        <mesh position={[2.7, 1.6, -11.0]} rotation={[-0.48, 0, 0]} castShadow>
          <boxGeometry args={[0.32, 0.65, 4.4]} />
          <meshStandardMaterial color="#B08D5B" roughness={0.84} />
        </mesh>
        {/* Guardian Singha Lions at Foot of Grand Staircase */}
        <SinghaGuardianLion position={[-3.2, 0, -12.4]} rotation={[0, 0.25, 0]} scale={1.15} />
        <SinghaGuardianLion position={[3.2, 0, -12.4]} rotation={[0, -0.25, 0]} scale={1.15} />

        {/* Tier 2 Bakan Platform (38m x 16m x 2.6m) */}
        <mesh position={[0, 4.3, 0]} receiveShadow castShadow>
          <boxGeometry args={[38, 2.6, 16]} />
          <meshStandardMaterial color="#8F714A" roughness={0.9} />
        </mesh>
        <mesh position={[0, 5.6, 0]} receiveShadow castShadow>
          <boxGeometry args={[39.2, 0.25, 16.6]} />
          <meshStandardMaterial color="#B08D5B" roughness={0.86} />
        </mesh>
        {/* Tier 2 Carved Bas-Relief Register */}
        <mesh position={[0, 4.3, -8.05]} receiveShadow>
          <boxGeometry args={[37.4, 1.2, 0.08]} />
          <meshStandardMaterial color="#A4855E" roughness={0.84} />
        </mesh>
        {[-16, -12.5, -9, -5.5, 5.5, 9, 12.5, 16].map((rx, idx) => (
          <group key={`t2-rosette-${idx}`} position={[rx, 4.3, -8.11]}>
            <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
              <boxGeometry args={[0.48, 0.48, 0.05]} />
              <meshStandardMaterial color="#DFC090" roughness={0.76} />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Tier 2 Axial Staircase to Tier 3 */}
        <mesh position={[0, 4.3, -8.8]} rotation={[-0.45, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[4.4, 0.32, 3.8]} />
          <meshStandardMaterial color="#9C7E54" roughness={0.86} />
        </mesh>
        <SinghaGuardianLion position={[-2.6, 3.0, -9.8]} rotation={[0, 0.2, 0]} scale={0.95} />
        <SinghaGuardianLion position={[2.6, 3.0, -9.8]} rotation={[0, -0.2, 0]} scale={0.95} />

        {/* Tier 3 Upper Sanctum Terrace (28m x 12m x 2.2m) */}
        <mesh position={[0, 6.7, 0]} receiveShadow castShadow>
          <boxGeometry args={[28, 2.2, 12]} />
          <meshStandardMaterial color="#A4855E" roughness={0.86} />
        </mesh>
        <mesh position={[0, 7.8, 0]} receiveShadow castShadow>
          <boxGeometry args={[29.0, 0.22, 12.5]} />
          <meshStandardMaterial color="#CDB082" roughness={0.82} />
        </mesh>
        {/* Tier 3 Stepped Base Molding */}
        <mesh position={[0, 7.95, 0]} castShadow>
          <boxGeometry args={[29.5, 0.14, 12.8]} />
          <meshStandardMaterial color="#DFC090" roughness={0.78} />
        </mesh>

        {/* Connecting Covered Galleries with Barrel Roofs & Turned Balusters */}
        {/* North and South Cross Galleries */}
        {[-5.0, 5.0].map((gx, idx) => (
          <group key={`link-gallery-${idx}`} position={[gx, 7.8, 0]}>
            {/* Gallery Colonnade Base */}
            <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
              <boxGeometry args={[9.6, 0.3, 3.2]} />
              <meshStandardMaterial color="#8F714A" roughness={0.88} />
            </mesh>
            {/* Gallery Wall with Balusters */}
            <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
              <boxGeometry args={[9.2, 1.8, 2.8]} />
              <meshStandardMaterial color="#B08D5B" roughness={0.84} />
            </mesh>
            {/* Barrel Vault Roof */}
            <mesh position={[0, 2.25, 0]} castShadow>
              <boxGeometry args={[9.6, 0.5, 3.4]} />
              <meshStandardMaterial color="#CDB082" roughness={0.78} />
            </mesh>
            <mesh position={[0, 2.6, 0]} castShadow>
              <boxGeometry args={[9.0, 0.25, 2.6]} />
              <meshStandardMaterial color="#DFC090" roughness={0.75} />
            </mesh>
          </group>
        ))}

        {/* Central Lotus Prasat Tower (Sanctum Sanctorum) - Reaches Y = 22m */}
        <AngkorLotusTower position={[0, 7.8, 0]} scale={2.45} />

        {/* Flanking Quincunx Towers */}
        {/* Front-Left Tower */}
        <AngkorLotusTower position={[-8.8, 6.8, -3.5]} scale={1.55} />
        {/* Front-Right Tower */}
        <AngkorLotusTower position={[8.8, 6.8, -3.5]} scale={1.55} />
        {/* Rear-Left Tower */}
        <AngkorLotusTower position={[-12.2, 7.2, 3.5]} scale={1.65} />
        {/* Rear-Right Tower */}
        <AngkorLotusTower position={[12.2, 7.2, 3.5]} scale={1.65} />
      </group>
    </group>
  );
}
