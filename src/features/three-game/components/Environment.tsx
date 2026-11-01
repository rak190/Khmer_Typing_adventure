import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../hooks/useGltfAsset';

const FLAGSTONE_TINTS = ['#D9B882', '#C6A06A', '#E2C694', '#B58D56', '#CFA972'];

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
        <sphereGeometry args={[2.4, 12, 10]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.88} />
      </mesh>
      <mesh position={[-2.1, -0.3, 0.2]}>
        <sphereGeometry args={[1.7, 10, 8]} />
        <meshBasicMaterial color="#F8FAFC" transparent opacity={0.85} />
      </mesh>
      <mesh position={[2.2, -0.25, -0.1]}>
        <sphereGeometry args={[1.85, 10, 8]} />
        <meshBasicMaterial color="#FFFBEB" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.6, 0.9, -0.2]}>
        <sphereGeometry args={[1.6, 10, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Cambodian Sugar Palm (ដើមត្នោត) — complements the GLB palms
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
  const frondAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];

  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0, 0, lean]}>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.34, 2.2, 8]} />
        <meshStandardMaterial color="#5C3A21" roughness={0.92} />
      </mesh>
      <mesh position={[0.05, 3.0, 0]} rotation={[0, 0, -lean * 0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.22, 2.0, 8]} />
        <meshStandardMaterial color="#684226" roughness={0.9} />
      </mesh>
      <mesh position={[0.08, 4.1, 0]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#3F2714" roughness={0.88} />
      </mesh>
      {frondAngles.map((angle, idx) => (
        <group key={idx} position={[0.08, 4.2, 0]} rotation={[0.42, angle, 0]}>
          <mesh position={[0, 0, 0.95]} rotation={[0.25, 0, 0]} castShadow>
            <boxGeometry args={[0.52, 0.07, 1.9]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#2E7D32' : '#388E3C'} roughness={0.75} />
          </mesh>
          <mesh position={[0, -0.18, 1.85]} rotation={[0.55, 0, 0]}>
            <coneGeometry args={[0.28, 0.85, 5]} />
            <meshStandardMaterial color="#43A047" roughness={0.78} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Sacred Lotus Flower & Pad floating on the reflecting pool
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
      {/* Green Lily Pad */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.025, 14]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.72} />
      </mesh>
      {/* Outer Pink Lotus Petals */}
      <mesh position={[0, 0.08, 0]}>
        <coneGeometry args={[0.22, 0.16, 8]} />
        <meshStandardMaterial color="#F472B6" roughness={0.45} />
      </mesh>
      {/* Inner Rose Petals */}
      <mesh position={[0, 0.13, 0]} rotation={[0, Math.PI / 8, 0]}>
        <coneGeometry args={[0.14, 0.15, 8]} />
        <meshStandardMaterial color="#FB7185" roughness={0.4} />
      </mesh>
      {/* Golden Seed Pod Center */}
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={0.45} />
      </mesh>
    </group>
  );
}

/**
 * Angkorian Stepped Lotus Tower (Prasat Prang)
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
      <mesh position={[0, 1.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 2.4, 4.4]} />
        <meshStandardMaterial color="#8C7355" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4.6, 0.25, 4.6]} />
        <meshStandardMaterial color="#B89968" roughness={0.82} />
      </mesh>
      <mesh position={[0, 4.0, 0]} castShadow>
        <boxGeometry args={[3.4, 2.8, 3.4]} />
        <meshStandardMaterial color="#9E825E" roughness={0.88} />
      </mesh>
      <mesh position={[0, 6.2, 0]} castShadow>
        <cylinderGeometry args={[1.3, 2.0, 2.0, 8]} />
        <meshStandardMaterial color="#A88B65" roughness={0.85} />
      </mesh>
      <mesh position={[0, 7.9, 0]} castShadow>
        <cylinderGeometry args={[0.7, 1.3, 1.6, 8]} />
        <meshStandardMaterial color="#B89968" roughness={0.82} />
      </mesh>
      <mesh position={[0, 9.3, 0]} castShadow>
        <coneGeometry args={[0.72, 1.5, 8]} />
        <meshStandardMaterial color="#C8A978" roughness={0.78} />
      </mesh>
      <mesh position={[0, 10.5, 0]}>
        <cylinderGeometry args={[0.05, 0.18, 1.2, 8]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.65} roughness={0.28} />
      </mesh>
    </group>
  );
}

export default function Environment() {
  const waterLeftRef = useRef<THREE.MeshStandardMaterial>(null);
  const waterRightRef = useRef<THREE.MeshStandardMaterial>(null);
  const cloudGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const shimmer = 0.18 + Math.sin(t * 1.8) * 0.04;
    if (waterLeftRef.current) waterLeftRef.current.emissiveIntensity = shimmer;
    if (waterRightRef.current) waterRightRef.current.emissiveIntensity = shimmer;
    if (cloudGroupRef.current) {
      cloudGroupRef.current.position.x = Math.sin(t * 0.05) * 2.5;
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
      <fog attach="fog" args={['#BAE6FD', 38, 108]} />

      {/* Upper Cerulean Sky Dome */}
      <mesh position={[0, 0, 10]} scale={[-1, 1, 1]}>
        <sphereGeometry args={[125, 24, 16]} />
        <meshBasicMaterial color="#38BDF8" side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Warm Golden Horizon Glow Band */}
      <mesh position={[0, 6, 68]}>
        <planeGeometry args={[220, 38]} />
        <meshBasicMaterial color="#FDE68A" transparent opacity={0.52} depthWrite={false} />
      </mesh>
      {/* Glowing Golden Morning Sun behind the Angkor Sanctuary */}
      <mesh position={[18, 28, 76]}>
        <circleGeometry args={[7.5, 24]} />
        <meshBasicMaterial color="#FEF08A" depthWrite={false} />
      </mesh>
      <mesh position={[18, 28, 75.5]}>
        <circleGeometry args={[12.5, 24]} />
        <meshBasicMaterial color="#FDE047" transparent opacity={0.28} depthWrite={false} />
      </mesh>

      {/* Fluffy Stylized Clouds */}
      <group ref={cloudGroupRef}>
        <StylizedCloud position={[-22, 24, 52]} scale={1.4} />
        <StylizedCloud position={[24, 26, 56]} scale={1.5} />
        <StylizedCloud position={[-6, 29, 64]} scale={1.25} />
        <StylizedCloud position={[-34, 21, 32]} scale={1.1} />
        <StylizedCloud position={[34, 22, 36]} scale={1.15} />
      </group>

      {/* ===== 2. WARM TROPICAL SUNLIGHT & BOUNCE LIGHTING ===== */}
      <ambientLight intensity={0.42} color="#FFF7ED" />
      <hemisphereLight args={['#E0F2FE', '#9A6B3B', 0.92]} />
      <directionalLight
        castShadow
        position={[14, 24, -12]}
        intensity={1.65}
        color="#FFFBEB"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={36}
        shadow-camera-bottom={-16}
      />
      {/* Front Dawn Key Light — illuminates character face & diadem when turning */}
      <directionalLight position={[-8, 14, 18]} intensity={0.82} color="#FEF3C7" />
      <pointLight position={[0, 4.2, 4.8]} intensity={1.25} distance={14} color="#F59E0B" />
      <pointLight position={[0, 5.5, 28]} intensity={1.35} distance={22} color="#FBBF24" />

      {/* ===== 3. LUSH TROPICAL JUNGLE TERRAIN & COURTYARD BASE ===== */}
      {/* Outer Emerald Jungle Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 12]} receiveShadow>
        <planeGeometry args={[140, 120]} />
        <meshStandardMaterial color="#3F6212" roughness={0.94} />
      </mesh>

      {/* Laterite Temple Terrace Foundation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 10]} receiveShadow>
        <planeGeometry args={[28, 48]} />
        <meshStandardMaterial color="#4D7C0F" roughness={0.9} />
      </mesh>

      {/* ===== 4. TURQUOISE LOTUS REFLECTING POOLS / MOATS (Matching 2D Art) ===== */}
      {[-8.4, 8.4].map((poolX, idx) => (
        <group key={`lotus-pool-${idx}`} position={[poolX, 0, 9]}>
          {/* Carved Sandstone Pool Coping Frame */}
          <mesh position={[0, 0.04, 0]} receiveShadow>
            <boxGeometry args={[6.4, 0.14, 34]} />
            <meshStandardMaterial color="#B59264" roughness={0.86} />
          </mesh>
          {/* Shimmering Turquoise Water Surface */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} receiveShadow>
            <planeGeometry args={[5.6, 33.2]} />
            <meshStandardMaterial
              ref={idx === 0 ? waterLeftRef : waterRightRef}
              color="#06B6D4"
              emissive="#0891B2"
              emissiveIntensity={0.18}
              roughness={0.18}
              metalness={0.12}
            />
          </mesh>
        </group>
      ))}

      {/* CC0 Quaternius Lilypads & Sacred Lotus Blooms floating on both reflecting pools */}
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
          <SacredLotusBloom position={[lx + 0.35, ly, lz + 0.25]} scale={lscale * 0.88} />
        </group>
      ))}

      {/* ===== 5. GOLDEN SANDSTONE CAUSEWAY & WEATHERED FLAGSTONES ===== */}
      <mesh position={[0, 0.02, 9]} receiveShadow>
        <boxGeometry args={[7.2, 0.08, 39]} />
        <meshStandardMaterial color="#C8A26A" roughness={0.86} />
      </mesh>
      {/* Carved Laterite Causeway Curbs */}
      <mesh position={[-3.85, 0.12, 9]} receiveShadow castShadow>
        <boxGeometry args={[0.52, 0.24, 39]} />
        <meshStandardMaterial color="#9C7A4C" roughness={0.88} />
      </mesh>
      <mesh position={[3.85, 0.12, 9]} receiveShadow castShadow>
        <boxGeometry args={[0.52, 0.24, 39]} />
        <meshStandardMaterial color="#9C7A4C" roughness={0.88} />
      </mesh>

      {/* Individual Golden-Ochre Flagstone Slabs with Emerald Grass Joints */}
      {flagstones.map((stone) => (
        <mesh key={stone.key} position={[stone.x, 0.075, stone.z]} receiveShadow>
          <boxGeometry args={[1.76, 0.05, 1.76]} />
          <meshStandardMaterial color={stone.tint} roughness={0.84} />
        </mesh>
      ))}

      {/* Carved Sandstone Naga Balustrade Posts along Causeway */}
      {[-7, -2, 3, 10, 20].map((zPos) =>
        [-4.5, 4.5].map((xPos) => (
          <group key={`post-${xPos}-${zPos}`} position={[xPos, 0, zPos]}>
            <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.62, 0.7, 0.62]} />
              <meshStandardMaterial color="#A8895C" roughness={0.88} />
            </mesh>
            <mesh position={[0, 0.82, 0]} castShadow>
              <coneGeometry args={[0.38, 0.36, 4]} />
              <meshStandardMaterial color="#D97706" roughness={0.5} metalness={0.3} />
            </mesh>
          </group>
        ))
      )}

      {/* ===== 6. CC0 PALM TREES, MOSSY ROCKS, TROPICAL BUSHES & FLOWERS ===== */}
      {/* Tall CC0 Quaternius Palm Trees framing the temple causeway */}
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

      {/* Complementary Sugar Palms for deep jungle silhouette */}
      <SugarPalmTree position={[-14.5, 0, 0]} scale={1.15} lean={0.07} />
      <SugarPalmTree position={[14.5, 0, 0]} scale={1.15} lean={-0.07} />
      <SugarPalmTree position={[-15.0, 0, 10]} scale={1.22} lean={0.05} />
      <SugarPalmTree position={[15.0, 0, 10]} scale={1.22} lean={-0.05} />
      <SugarPalmTree position={[-14.2, 0, 20]} scale={1.18} lean={0.06} />
      <SugarPalmTree position={[14.2, 0, 20]} scale={1.18} lean={-0.06} />

      {/* CC0 Quaternius Mossy Rocks along causeway & pool banks */}
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

      {/* CC0 Quaternius Tropical Bushes & Flowers bordering the pathway */}
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

      {/* ===== 7. DISTANT ANGKOR PRASAT SANCTUARY COMPLEX (Z = 36) ===== */}
      <group position={[0, 0, 36]}>
        <mesh position={[0, 0.8, 0]} receiveShadow>
          <boxGeometry args={[28, 1.6, 6]} />
          <meshStandardMaterial color="#8A7050" roughness={0.92} />
        </mesh>
        <AngkorLotusTower position={[0, 1.4, 0]} scale={1.35} />
        <AngkorLotusTower position={[-6.8, 1.2, 0.5]} scale={0.95} />
        <AngkorLotusTower position={[6.8, 1.2, 0.5]} scale={0.95} />
        <AngkorLotusTower position={[-12.2, 1.0, 1.0]} scale={0.72} />
        <AngkorLotusTower position={[12.2, 1.0, 1.0]} scale={0.72} />
      </group>
    </group>
  );
}
