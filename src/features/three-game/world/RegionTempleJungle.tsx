import { CuboidCollider, RigidBody } from '@react-three/rapier';
import MovingPlatform from '../physics/MovingPlatform';

type RegionTempleJungleProps = {
  playerPosition: [number, number, number];
  onEnterLesson: (levelId: number | 'boss') => void;
  unlockedLevelId: number | 'boss';
};

export default function RegionTempleJungle({
  playerPosition,
  onEnterLesson,
  unlockedLevelId,
}: RegionTempleJungleProps) {
  const [px, , pz] = playerPosition;

  // Station positions along the jungle traversal path (Z: -60 to -220)
  const stations = [
    { levelId: 1, nameKh: 'ទ្វារអក្សរ (Consonants I)', pos: [0, 0, -75] as const },
    { levelId: 2, nameKh: 'សួនផ្កាឈូក (Consonants II)', pos: [0, 0, -92] as const },
    { levelId: 3, nameKh: 'ស្ពានភ្លោះ (Consonants Speed)', pos: [0, 0, -112] as const },
    { levelId: 4, nameKh: 'ផ្លូវបំបែកព្រៃ (Consonants Review)', pos: [0, 0, -132] as const },
    { levelId: 5, nameKh: 'កំពូលប៉មប្រាសាទ (Inherent Vowels)', pos: [0, 0, -152] as const },
    { levelId: 6, nameKh: 'វេទិកាមេឃ (Consonants & Words)', pos: [0, 0, -170] as const },
    { levelId: 7, nameKh: 'រូងភ្នំគ្រីស្តាល់ (Dependent Vowels)', pos: [0, 0, -188] as const },
    { levelId: 8, nameKh: 'ទន្លេពិសិដ្ឋ (Vowel Expansion)', pos: [0, 0, -204] as const },
    { levelId: 'boss' as const, nameKh: 'សិង្ហនាគបិសាច (Temple Guardian Boss)', pos: [0, 0, -225] as const },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Main Jungle Traversal Causeway (Z: -60 to -240, Width 14m) */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.4, -145]}>
        <CuboidCollider args={[7, 0.4, 85]} />
        <mesh receiveShadow>
          <boxGeometry args={[14, 0.8, 170]} />
          <meshStandardMaterial color="#3D5A38" roughness={0.92} />
        </mesh>
      </RigidBody>

      {/* Jungle Ruins Columns & Sugar Palm Grove Accents */}
      {[-8, 8].map((x) =>
        [-80, -100, -120, -140, -160, -180, -200].map((z) => (
          <group key={`col-${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.4, 0.5, 4.4, 8]} />
              <meshStandardMaterial color="#5C4D3C" roughness={0.9} />
            </mesh>
            <mesh position={[0, 4.6, 0]}>
              <boxGeometry args={[1.1, 0.4, 1.1]} />
              <meshStandardMaterial color="#6E5D4A" roughness={0.88} />
            </mesh>
          </group>
        )),
      )}

      {/* Chasm Gap with Moving Platform between Lesson 3 and Lesson 4 (Z: -118 to -126) */}
      <MovingPlatform
        initialPosition={[0, 0, -122]}
        axis="x"
        amplitude={3.5}
        speed={1.0}
        theme="sandstone"
        size={[3.6, 0.6, 4]}
      />

      {/* Station Pedestals */}
      {stations.map(({ levelId, pos }) => {
        const dist = Math.hypot(px - pos[0], pz - pos[2]);
        const isNear = dist < 3.8;
        const isUnlocked =
          levelId === 1 ||
          (typeof unlockedLevelId === 'number' && typeof levelId === 'number' && levelId <= unlockedLevelId) ||
          unlockedLevelId === 'boss';

        return (
          <group key={`w1-st-${levelId}`} position={pos}>
            {/* Altar Pedestal */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.2, 1.5, 1.0, 8]} />
              <meshStandardMaterial color={isUnlocked ? '#6E583B' : '#333333'} roughness={0.85} />
            </mesh>
            {/* Lotus Basin Top */}
            <mesh position={[0, 1.05, 0]}>
              <cylinderGeometry args={[0.9, 0.6, 0.2, 12]} />
              <meshStandardMaterial color="#8B6D4A" roughness={0.8} />
            </mesh>
            {/* Floating Khmer Letter Rune */}
            <mesh position={[0, 1.6, 0]}>
              <octahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial
                color={isUnlocked ? '#F59E0B' : '#666666'}
                emissive={isUnlocked ? '#D97706' : '#222222'}
                emissiveIntensity={isNear ? 2.5 : 1.0}
              />
            </mesh>

            {isNear && (
              <group position={[0, 2.5, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={() => onEnterLesson(levelId)}>
                  <ringGeometry args={[1.4, 1.7, 24]} />
                  <meshBasicMaterial color="#38BDF8" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* Boss Arena (Z: -215 to -245, Width 30m x 30m) */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.4, -230]}>
        <CuboidCollider args={[15, 0.4, 15]} />
        <mesh receiveShadow>
          <boxGeometry args={[30, 0.8, 30]} />
          <meshStandardMaterial color="#4A3B2C" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Guardian Simha Statues guarding the Boss Arena */}
      {[-10, 10].map((x) => (
        <group key={`simha-boss-${x}`} position={[x, 0, -220]}>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 3.0, 1.8]} />
            <meshStandardMaterial color="#8B6D4A" roughness={0.85} />
          </mesh>
          <pointLight color="#F59E0B" intensity={1.5} distance={8} position={[0, 3.2, 0]} />
        </group>
      ))}
    </group>
  );
}
