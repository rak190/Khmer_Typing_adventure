import { useMemo } from 'react';

// Low-poly Cambodian Sugar Palm (Borassus flabellifer)
function SugarPalm({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const frondCount = 10;
  const fronds = useMemo(() => {
    return Array.from({ length: frondCount }).map((_, index) => {
      const angle = (index / frondCount) * Math.PI * 2;
      const tilt = 0.45 + (index % 2) * 0.15;
      return { angle, tilt };
    });
  }, []);

  return (
    <group position={position} scale={scale}>
      {/* Tall slender trunk with ringed segments */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.22, 0.35, 6.4, 8]} />
        <meshStandardMaterial color="#4E3629" roughness={0.95} />
      </mesh>
      {/* Crown base */}
      <mesh position={[0, 6.4, 0]}>
        <sphereGeometry args={[0.42, 8, 8]} />
        <meshStandardMaterial color="#3D2817" roughness={0.9} />
      </mesh>
      {/* Palm Fronds radiating in a sphere-crown */}
      {fronds.map(({ angle, tilt }, idx) => (
        <group key={idx} position={[0, 6.5, 0]} rotation={[0, angle, 0]}>
          <group rotation={[tilt, 0, 0]}>
            <mesh position={[0, 0.4, 1.2]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.75, 0.04, 2.2]} />
              <meshStandardMaterial color="#2E7D32" roughness={0.8} />
            </mesh>
          </group>
        </group>
      ))}
      {/* Clusters of palm fruits */}
      <mesh position={[0, 6.1, 0.25]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="#1B5E20" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Distant Angkor Prasat Tower Silhouette
function DistantPrasat({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Main Base */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4.2, 5.0, 4.2]} />
        <meshStandardMaterial color="#534234" roughness={0.95} />
      </mesh>
      {/* Stepped Tiers */}
      <mesh position={[0, 6.0, 0]}>
        <boxGeometry args={[3.4, 2.2, 3.4]} />
        <meshStandardMaterial color="#4A3B2E" roughness={0.95} />
      </mesh>
      <mesh position={[0, 7.8, 0]}>
        <boxGeometry args={[2.5, 1.8, 2.5]} />
        <meshStandardMaterial color="#443529" roughness={0.95} />
      </mesh>
      <mesh position={[0, 9.3, 0]}>
        <boxGeometry args={[1.7, 1.5, 1.7]} />
        <meshStandardMaterial color="#3D2F24" roughness={0.95} />
      </mesh>
      {/* Lotus Spire / Finial */}
      <mesh position={[0, 10.8, 0]}>
        <coneGeometry args={[0.85, 2.0, 8]} />
        <meshStandardMaterial color="#33271E" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function Environment() {
  return (
    <group>
      {/* ===== LIGHTING (Balanced for Low-Power Integrated GPUs) ===== */}
      <ambientLight color="#D4E8F8" intensity={0.65} />
      <hemisphereLight args={['#C5E1F5', '#7A6242', 0.55]} />
      <directionalLight
        position={[14, 24, -12]}
        color="#FFF6E0"
        intensity={1.25}
      />

      {/* ===== COURTYARD GROUND ===== */}
      {/* Outer Lush Grass Terrain */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#3B6E3D" roughness={0.95} />
      </mesh>

      {/* Main Temple Courtyard (Sandstone Flagstones) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 34]} />
        <meshStandardMaterial color="#8C6F4B" roughness={0.9} />
      </mesh>

      {/* Royal Processional Stone Pathway (leading towards the gate) */}
      <mesh position={[0, 0.04, -1]}>
        <boxGeometry args={[4.4, 0.05, 26]} />
        <meshStandardMaterial color="#AB8C64" roughness={0.85} />
      </mesh>

      {/* Paved Edging Trim */}
      <mesh position={[-2.3, 0.06, -1]}>
        <boxGeometry args={[0.3, 0.09, 26]} />
        <meshStandardMaterial color="#6E5437" roughness={0.9} />
      </mesh>
      <mesh position={[2.3, 0.06, -1]}>
        <boxGeometry args={[0.3, 0.09, 26]} />
        <meshStandardMaterial color="#6E5437" roughness={0.9} />
      </mesh>

      {/* ===== PERIMETER STONE BOUNDARY WALLS & CORNER COLUMNS ===== */}
      {/* Left Wall */}
      <mesh position={[-14.2, 0.6, 0]}>
        <boxGeometry args={[0.8, 1.2, 34]} />
        <meshStandardMaterial color="#735639" roughness={0.92} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[14.2, 0.6, 0]}>
        <boxGeometry args={[0.8, 1.2, 34]} />
        <meshStandardMaterial color="#735639" roughness={0.92} />
      </mesh>
      {/* South Wall (behind starting position) */}
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
      <mesh position={[-14.2, 1.1, 16.2]}>
        <boxGeometry args={[1.6, 2.2, 1.6]} />
        <meshStandardMaterial color="#856847" roughness={0.9} />
      </mesh>
      <mesh position={[14.2, 1.1, 16.2]}>
        <boxGeometry args={[1.6, 2.2, 1.6]} />
        <meshStandardMaterial color="#856847" roughness={0.9} />
      </mesh>

      {/* ===== INNER SANCTUARY (Visible Behind the Gate Z > 6) ===== */}
      <group position={[0, 0, 11]}>
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
        <mesh position={[0, 2.05, 0]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial
            color="#FBBF24"
            emissive="#F59E0B"
            emissiveIntensity={0.85}
            metalness={0.2}
            roughness={0.2}
          />
        </mesh>
        {/* Gentle Sanctuary Glow Light */}
        <pointLight position={[0, 2.5, 0]} color="#FBBF24" intensity={1.5} distance={10} />
      </group>

      {/* ===== SUGAR PALMS AROUND PERIMETER ===== */}
      <SugarPalm position={[-11, 0, -10]} scale={0.95} />
      <SugarPalm position={[-11.5, 0, -2]} scale={1.05} />
      <SugarPalm position={[-10.8, 0, 8]} scale={1.0} />
      <SugarPalm position={[11, 0, -11]} scale={1.0} />
      <SugarPalm position={[11.8, 0, -3]} scale={0.9} />
      <SugarPalm position={[10.5, 0, 7]} scale={1.08} />

      {/* ===== DISTANT ANGKOR PRASAT SILHOUETTES ===== */}
      {/* Central Grand Tower beyond the sanctuary */}
      <DistantPrasat position={[0, 0, 28]} scale={1.8} />
      {/* Flanking Towers */}
      <DistantPrasat position={[-16, 0, 32]} scale={1.4} />
      <DistantPrasat position={[16, 0, 32]} scale={1.4} />
    </group>
  );
}
