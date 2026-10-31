import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// Low-poly Cambodian Sugar Palm (ដើមត្នោត - Borassus flabellifer)
function SugarPalm({ position, scale = 1, rotationY = 0 }: { position: [number, number, number]; scale?: number; rotationY?: number }) {
  const frondCount = 12;
  const fronds = useMemo(() => {
    return Array.from({ length: frondCount }).map((_, index) => {
      const angle = (index / frondCount) * Math.PI * 2;
      const tilt = 0.42 + (index % 3) * 0.12;
      const length = 2.2 + (index % 2) * 0.4;
      return { angle, tilt, length };
    });
  }, []);

  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Slender trunk with authentic ringed segments */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.22, 0.38, 6.4, 8]} />
        <meshStandardMaterial color="#4A3425" roughness={0.92} />
      </mesh>
      {/* Decorative trunk rings */}
      {[1.2, 2.4, 3.6, 4.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.27 - y * 0.015, 0.29 - y * 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#382518" roughness={0.95} />
        </mesh>
      ))}

      {/* Crown base */}
      <mesh position={[0, 6.4, 0]}>
        <sphereGeometry args={[0.45, 8, 8]} />
        <meshStandardMaterial color="#322013" roughness={0.9} />
      </mesh>

      {/* Radiating Fan Fronds */}
      {fronds.map(({ angle, tilt, length }, idx) => (
        <group key={idx} position={[0, 6.5, 0]} rotation={[0, angle, 0]}>
          <group rotation={[tilt, 0, 0]}>
            {/* Frond stem */}
            <mesh position={[0, 0.2, length * 0.45]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.08, 0.06, length]} />
              <meshStandardMaterial color="#2E6930" roughness={0.8} />
            </mesh>
            {/* Fan leaf blade */}
            <mesh position={[0, 0.35, length * 0.65]} rotation={[0.22, 0, 0]}>
              <boxGeometry args={[0.85, 0.03, length * 0.65]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#388E3C' : '#2E7D32'} roughness={0.75} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Clusters of dark palm fruits */}
      <group position={[0, 6.1, 0]}>
        <mesh position={[0.2, -0.1, 0.15]}>
          <sphereGeometry args={[0.18, 6, 6]} />
          <meshStandardMaterial color="#1B4D20" roughness={0.85} />
        </mesh>
        <mesh position={[-0.18, -0.12, 0.18]}>
          <sphereGeometry args={[0.17, 6, 6]} />
          <meshStandardMaterial color="#1B4D20" roughness={0.85} />
        </mesh>
        <mesh position={[0.05, -0.15, -0.22]}>
          <sphereGeometry args={[0.19, 6, 6]} />
          <meshStandardMaterial color="#143D18" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

// Iconic Angkor Seven-Headed Naga Balustrade Head
function NagaBalustradeHead({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Stone Pedestal */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#7D6244" roughness={0.9} />
      </mesh>
      {/* Stepped Plinth */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.55, 0.15, 0.55]} />
        <meshStandardMaterial color="#8F714F" roughness={0.85} />
      </mesh>

      {/* Fan of 7 Naga Serpent Hoods */}
      <group position={[0, 1.25, 0.05]}>
        {/* Central Crown Hood */}
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.14, 0.65, 6]} />
          <meshStandardMaterial color="#A48259" roughness={0.8} />
        </mesh>
        {/* Flanking Hoods (Left 3, Right 3) */}
        {[-0.26, -0.18, -0.1, 0.1, 0.18, 0.26].map((xOffset, idx) => {
          const height = 0.52 - Math.abs(xOffset) * 0.55;
          const tilt = xOffset * 0.6;
          return (
            <mesh key={idx} position={[xOffset, 0.15, -0.02]} rotation={[0, 0, -tilt]}>
              <coneGeometry args={[0.1, height, 6]} />
              <meshStandardMaterial color="#947451" roughness={0.82} />
            </mesh>
          );
        })}
        {/* Lower Hood Crest Shield */}
        <mesh position={[0, -0.05, 0.08]}>
          <boxGeometry args={[0.58, 0.35, 0.14]} />
          <meshStandardMaterial color="#8A6B48" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

// Traditional Ceremonial Temple Streamer Flag (ទង់ក្រពើ)
function TempleFlag({ position, color, height = 5 }: { position: [number, number, number]; color: string; height?: number }) {
  const flagRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (flagRef.current) {
      const time = state.clock.getElapsedTime();
      // Gentle waving motion in the tropical breeze
      flagRef.current.rotation.y = Math.sin(time * 2 + position[0]) * 0.15;
      flagRef.current.rotation.z = Math.cos(time * 2.5 + position[2]) * 0.08;
    }
  });

  return (
    <group position={position}>
      {/* Bamboo Pole */}
      <mesh position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[0.04, 0.06, height, 8]} />
        <meshStandardMaterial color="#C2A649" roughness={0.7} />
      </mesh>
      {/* Gold Spear Finial */}
      <mesh position={[0, height + 0.15, 0]}>
        <coneGeometry args={[0.09, 0.3, 8]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Floating Pennant Streamer */}
      <group ref={flagRef} position={[0, height - 0.2, 0]}>
        <mesh position={[0.45, -0.8, 0]}>
          <boxGeometry args={[0.85, 1.6, 0.02]} />
          <meshStandardMaterial color={color} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Golden Fringe / Border */}
        <mesh position={[0.45, -1.65, 0]}>
          <boxGeometry args={[0.85, 0.1, 0.03]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// Ornate Stone Lotus Basin (អាងផ្កាឈូក)
function LotusBasin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Carved Basin Base */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.75, 0.9, 0.5, 16]} />
        <meshStandardMaterial color="#7D6244" roughness={0.9} />
      </mesh>
      {/* Basin Rim */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.85, 0.72, 0.12, 16]} />
        <meshStandardMaterial color="#8F714F" roughness={0.85} />
      </mesh>
      {/* Water Surface */}
      <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshStandardMaterial color="#1E3A5F" roughness={0.15} metalness={0.4} />
      </mesh>
      {/* Green Lily Pads */}
      <mesh position={[0.2, 0.53, 0.15]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <circleGeometry args={[0.22, 12]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.8} />
      </mesh>
      <mesh position={[-0.25, 0.53, -0.1]} rotation={[-Math.PI / 2, 0, -0.6]}>
        <circleGeometry args={[0.25, 12]} />
        <meshStandardMaterial color="#388E3C" roughness={0.8} />
      </mesh>
      {/* Blooming Pink/Gold Lotus Blossom */}
      <group position={[0, 0.56, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <coneGeometry args={[0.14, 0.22, 8]} />
          <meshStandardMaterial color="#F472B6" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 8]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// Distant Angkor Prasat Tower Silhouette
function DistantPrasat({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Tiered Base */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4.2, 5.0, 4.2]} />
        <meshStandardMaterial color="#4A382B" roughness={0.95} />
      </mesh>
      {/* Stepped Tiers */}
      <mesh position={[0, 6.0, 0]}>
        <boxGeometry args={[3.4, 2.2, 3.4]} />
        <meshStandardMaterial color="#413125" roughness={0.95} />
      </mesh>
      <mesh position={[0, 7.8, 0]}>
        <boxGeometry args={[2.5, 1.8, 2.5]} />
        <meshStandardMaterial color="#38291F" roughness={0.95} />
      </mesh>
      <mesh position={[0, 9.3, 0]}>
        <boxGeometry args={[1.7, 1.5, 1.7]} />
        <meshStandardMaterial color="#2F221A" roughness={0.95} />
      </mesh>
      {/* Lotus Kalasa Spire */}
      <mesh position={[0, 10.8, 0]}>
        <coneGeometry args={[0.85, 2.0, 8]} />
        <meshStandardMaterial color="#261B14" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Precomputed deterministic positions and phases for floating ambient motes
const MOTE_COUNT = 36;
const STATIC_MOTE_POSITIONS = new Float32Array(MOTE_COUNT * 3);
const STATIC_MOTE_PHASES = new Float32Array(MOTE_COUNT);

for (let i = 0; i < MOTE_COUNT; i += 1) {
  // Deterministic spread across courtyard without calling Math.random during render
  const pseudoX = Math.sin(i * 1.7 + 0.3);
  const pseudoY = (Math.sin(i * 2.3 + 1.1) + 1) * 0.5;
  const pseudoZ = Math.cos(i * 1.9 + 0.7);
  STATIC_MOTE_POSITIONS[i * 3 + 0] = pseudoX * 11;
  STATIC_MOTE_POSITIONS[i * 3 + 1] = 0.8 + pseudoY * 3.2;
  STATIC_MOTE_POSITIONS[i * 3 + 2] = -12 + (pseudoZ + 1) * 10;
  STATIC_MOTE_PHASES[i] = ((i * 1.618) % 1) * Math.PI * 2;
}

// Floating Ancient Temple Motes / Ambient Fireflies
function FloatingTempleMotes() {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    if (!posAttr) return;

    const time = state.clock.getElapsedTime();
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < MOTE_COUNT; i += 1) {
      const idx = i * 3;
      const phase = STATIC_MOTE_PHASES[i];
      // Gentle horizontal and vertical floating drift around original position
      array[idx + 1] = STATIC_MOTE_POSITIONS[idx + 1] + Math.sin(time * 1.5 + phase) * 0.25;
      array[idx + 0] = STATIC_MOTE_POSITIONS[idx + 0] + Math.cos(time * 0.8 + phase) * 0.15;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(STATIC_MOTE_POSITIONS), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#FDE047"
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Environment() {
  const sanctuaryCrystalRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sanctuaryCrystalRef.current) {
      const time = state.clock.getElapsedTime();
      sanctuaryCrystalRef.current.rotation.y = time * 0.6;
      sanctuaryCrystalRef.current.position.y = 2.05 + Math.sin(time * 1.8) * 0.08;
    }
  });

  return (
    <group>
      {/* ===== ENHANCED TROPICAL GOLDEN-HOUR LIGHTING ===== */}
      <ambientLight color="#D6E8FA" intensity={0.6} />
      <hemisphereLight args={['#BFDBFE', '#785A3C', 0.55]} />
      <directionalLight
        position={[14, 24, -12]}
        color="#FFF4DC"
        intensity={1.35}
      />
      {/* Subtle Warm Rim Light for Character & Architecture */}
      <directionalLight
        position={[-12, 10, 16]}
        color="#FDE68A"
        intensity={0.4}
      />

      {/* ===== ATMOSPHERIC DUST MOTES / FIREFLIES ===== */}
      <FloatingTempleMotes />

      {/* ===== COURTYARD GROUND ===== */}
      {/* Outer Lush Grass Terrain */}
      <mesh position={[0, -0.05, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[84, 96]} />
        <meshStandardMaterial color="#2D5A27" roughness={0.95} />
      </mesh>

      {/* Main Temple Courtyard (Sandstone Flagstones extending across all 3 stages) */}
      <mesh position={[0, 0.02, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 54]} />
        <meshStandardMaterial color="#8C6F4B" roughness={0.9} />
      </mesh>

      {/* Royal Processional Stone Pathway (leading through Stages 1, 2, and 3) */}
      <mesh position={[0, 0.05, 8]}>
        <boxGeometry args={[4.4, 0.06, 44]} />
        <meshStandardMaterial color="#A88960" roughness={0.82} />
      </mesh>

      {/* Pathway Stepping Blocks (relief pavers along the full multi-stage causeway) */}
      {[-10, -7, -4, -1, 2, 5, 8, 11, 14, 17, 20, 23, 26, 28.5].map((zPos, idx) => (
        <mesh key={idx} position={[0, 0.09, zPos]}>
          <boxGeometry args={[3.8, 0.02, 2.2]} />
          <meshStandardMaterial color={idx % 2 === 0 ? '#B5966D' : '#9E7E55'} roughness={0.8} />
        </mesh>
      ))}

      {/* Paved Edging Trim with Lotus Molding */}
      <mesh position={[-2.3, 0.08, 8]}>
        <boxGeometry args={[0.3, 0.12, 44]} />
        <meshStandardMaterial color="#6E5437" roughness={0.88} />
      </mesh>
      <mesh position={[2.3, 0.08, 8]}>
        <boxGeometry args={[0.3, 0.12, 44]} />
        <meshStandardMaterial color="#6E5437" roughness={0.88} />
      </mesh>


      {/* ===== NAGA BALUSTRADES (Angkor Serpent Causeway Guard) ===== */}
      {/* Left Naga Head at walkway start */}
      <NagaBalustradeHead position={[-2.5, 0, -11]} rotationY={0} />
      {/* Right Naga Head at walkway start */}
      <NagaBalustradeHead position={[2.5, 0, -11]} rotationY={0} />

      {/* Naga Serpent Rail Body segments */}
      <mesh position={[-2.5, 0.45, -5.5]}>
        <boxGeometry args={[0.26, 0.35, 10.5]} />
        <meshStandardMaterial color="#7D6244" roughness={0.88} />
      </mesh>
      <mesh position={[2.5, 0.45, -5.5]}>
        <boxGeometry args={[0.26, 0.35, 10.5]} />
        <meshStandardMaterial color="#7D6244" roughness={0.88} />
      </mesh>

      {/* ===== LOTUS FLOWER WATER BASINS ===== */}
      <LotusBasin position={[-4.2, 0, -7]} />
      <LotusBasin position={[4.2, 0, -7]} />

      {/* ===== CEREMONIAL TEMPLE PENNANT STREAMERS (ទង់ក្រពើ) ===== */}
      <TempleFlag position={[-6.2, 0, -11]} color="#F59E0B" height={5.2} />
      <TempleFlag position={[6.2, 0, -11]} color="#DC2626" height={5.2} />
      <TempleFlag position={[-6.2, 0, -1]} color="#2563EB" height={5.0} />
      <TempleFlag position={[6.2, 0, -1]} color="#F59E0B" height={5.0} />

      {/* ===== PERIMETER STONE BOUNDARY WALLS & CORNER COLUMNS ===== */}
      {/* Left Wall */}
      <mesh position={[-14.2, 0.6, 10]}>
        <boxGeometry args={[0.8, 1.2, 54]} />
        <meshStandardMaterial color="#735639" roughness={0.92} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[14.2, 0.6, 10]}>
        <boxGeometry args={[0.8, 1.2, 54]} />
        <meshStandardMaterial color="#735639" roughness={0.92} />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, 0.6, -16.2]}>
        <boxGeometry args={[29, 1.2, 0.8]} />
        <meshStandardMaterial color="#735639" roughness={0.92} />
      </mesh>

      {/* Corner Towers */}
      <mesh position={[-14.2, 1.1, -16.2]}>
        <boxGeometry args={[1.6, 2.2, 1.6]} />
        <meshStandardMaterial color="#856847" roughness={0.9} />
      </mesh>
      <mesh position={[14.2, 1.1, -16.2]}>
        <boxGeometry args={[1.6, 2.2, 1.6]} />
        <meshStandardMaterial color="#856847" roughness={0.9} />
      </mesh>
      <mesh position={[-14.2, 1.1, 36.2]}>
        <boxGeometry args={[1.6, 2.2, 1.6]} />
        <meshStandardMaterial color="#856847" roughness={0.9} />
      </mesh>
      <mesh position={[14.2, 1.1, 36.2]}>
        <boxGeometry args={[1.6, 2.2, 1.6]} />
        <meshStandardMaterial color="#856847" roughness={0.9} />
      </mesh>

      {/* ===== INNER SANCTUARY (Visible Behind Stage 3 Gate Z > 26) ===== */}
      <group position={[0, 0, 31]}>
        {/* Raised Sanctuary Terrace Base */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[8.0, 0.6, 7.0]} />
          <meshStandardMaterial color="#947451" roughness={0.88} />
        </mesh>
        {/* Tier 2 Terrace */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[5.5, 0.5, 5.0]} />
          <meshStandardMaterial color="#A3825D" roughness={0.85} />
        </mesh>
        {/* Golden Lotus Pedestal */}
        <mesh position={[0, 1.35, 0]}>
          <cylinderGeometry args={[1.1, 1.3, 0.6, 16]} />
          <meshStandardMaterial color="#D97706" metalness={0.4} roughness={0.4} />
        </mesh>
        {/* Sacred Glowing Relic Crystal */}
        <mesh ref={sanctuaryCrystalRef} position={[0, 2.05, 0]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial
            color="#FBBF24"
            emissive="#F59E0B"
            emissiveIntensity={0.95}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
        {/* Gentle Sanctuary Glow Light */}
        <pointLight position={[0, 2.5, 0]} color="#FBBF24" intensity={1.6} distance={10} />
      </group>

      {/* ===== SUGAR PALMS AROUND PERIMETER ===== */}
      <SugarPalm position={[-11, 0, -10]} scale={0.95} rotationY={0.3} />
      <SugarPalm position={[-11.5, 0, -2]} scale={1.05} rotationY={1.1} />
      <SugarPalm position={[-10.8, 0, 8]} scale={1.0} rotationY={2.4} />
      <SugarPalm position={[-11.2, 0, 19]} scale={0.98} rotationY={0.6} />
      <SugarPalm position={[-10.6, 0, 29]} scale={1.04} rotationY={1.8} />
      <SugarPalm position={[11, 0, -11]} scale={1.0} rotationY={0.8} />
      <SugarPalm position={[11.8, 0, -3]} scale={0.9} rotationY={1.9} />
      <SugarPalm position={[10.5, 0, 7]} scale={1.08} rotationY={3.0} />
      <SugarPalm position={[11.3, 0, 18]} scale={0.96} rotationY={1.4} />
      <SugarPalm position={[10.7, 0, 28]} scale={1.02} rotationY={2.5} />

      {/* ===== DISTANT ANGKOR PRASAT SILHOUETTES ===== */}
      <DistantPrasat position={[0, 0, 48]} scale={1.8} />
      <DistantPrasat position={[-16, 0, 52]} scale={1.4} />
      <DistantPrasat position={[16, 0, 52]} scale={1.4} />

    </group>
  );
}
