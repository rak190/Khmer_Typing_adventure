import { CuboidCollider, RigidBody } from '@react-three/rapier';
import MovingPlatform from '../physics/MovingPlatform';

type RegionGoldenLibraryProps = {
  playerPosition: [number, number, number];
  onEnterLesson: (levelId: number | 'boss') => void;
  unlockedLevelId: number | 'boss';
};

export default function RegionGoldenLibrary({
  playerPosition,
  onEnterLesson,
  unlockedLevelId,
}: RegionGoldenLibraryProps) {
  const [px, , pz] = playerPosition;

  // Station positions through the grand library (X: 60 to 220, Z: 20 to 70)
  const stations = [
    { levelId: 1, nameKh: 'សាលតម្កល់គម្ពីរ (Library Vestibule)', pos: [75, 0, 25] as const },
    { levelId: 2, nameKh: 'សាលាសាស្ត្រាស្លឹករឹត (Manuscript Hall)', pos: [92, 0, 32] as const },
    { levelId: 3, nameKh: 'ថែវគម្ពីរជើង (Subscripts Chamber)', pos: [112, 0, 40] as const },
    { levelId: 4, nameKh: 'បណ្ណាល័យបាលី (Pali Script Vault)', pos: [132, 0, 45] as const },
    { levelId: 5, nameKh: 'សាលប្រាជ្ញាបុរាណ (Sages Hall)', pos: [152, 0, 50] as const },
    { levelId: 6, nameKh: 'ប៉មគម្ពីរមាស (Golden Script Tower)', pos: [170, 0, 55] as const },
    { levelId: 7, nameKh: 'វិហារអក្សរចារឹក (Inscription Sanctuary)', pos: [188, 0, 60] as const },
    { levelId: 8, nameKh: 'សាលាចំណេះដឹង (Hall of Knowledge)', pos: [202, 0, 62] as const },
    { levelId: 'boss' as const, nameKh: 'ស្វាបណ្ឌិត / ស្ហ្វ៊ីង (Scholar Sphinx Boss)', pos: [220, 0, 65] as const },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Grand Library Polished Sandstone Foundation */}
      <RigidBody type="fixed" colliders={false} position={[145, -0.4, 45]}>
        <CuboidCollider args={[85, 0.4, 30]} />
        <mesh receiveShadow>
          <boxGeometry args={[170, 0.8, 60]} />
          <meshStandardMaterial color="#856441" roughness={0.75} />
        </mesh>
      </RigidBody>

      {/* Fluted Sandstone Columns and Floating Manuscript Shelves */}
      {[85, 105, 125, 145, 165, 185, 205].map((x) =>
        [20, 60].map((z) => (
          <group key={`lib-col-${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 3.0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.6, 0.7, 6.0, 10]} />
              <meshStandardMaterial color="#9F7E4F" roughness={0.8} />
            </mesh>
            {/* Manuscript Scroll Case */}
            <mesh position={[0, 6.2, 0]}>
              <boxGeometry args={[2.2, 0.6, 1.2]} />
              <meshStandardMaterial color="#D97706" roughness={0.6} />
            </mesh>
          </group>
        )),
      )}

      {/* Moving Manuscript Platform over Central Reflecting Basin */}
      <MovingPlatform
        initialPosition={[122, 0, 40]}
        axis="z"
        amplitude={3.5}
        speed={1.0}
        theme="sandstone"
        size={[3.8, 0.6, 3.8]}
      />

      {/* Lesson Stations */}
      {stations.map(({ levelId, pos }) => {
        const dist = Math.hypot(px - pos[0], pz - pos[2]);
        const isNear = dist < 3.8;
        const isUnlocked =
          levelId === 1 ||
          (typeof unlockedLevelId === 'number' && typeof levelId === 'number' && levelId <= unlockedLevelId) ||
          unlockedLevelId === 'boss';
        return (
          <group key={`w4-st-${levelId}`} position={pos}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.1, 1.4, 1.0, 8]} />
              <meshStandardMaterial color={isUnlocked ? '#785A3C' : '#333333'} roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <octahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={isNear && isUnlocked ? 2.5 : 1.0} />
            </mesh>
            {isNear && (
              <mesh position={[0, 2.4, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => onEnterLesson(levelId)}>
                <ringGeometry args={[1.4, 1.7, 24]} />
                <meshBasicMaterial color="#38BDF8" />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Scholar Sphinx Boss Hall (X: 220, Z: 65, 30m x 30m) */}
      <RigidBody type="fixed" colliders={false} position={[220, -0.4, 65]}>
        <CuboidCollider args={[15, 0.4, 15]} />
        <mesh receiveShadow>
          <boxGeometry args={[30, 0.8, 30]} />
          <meshStandardMaterial color="#6B5238" roughness={0.8} />
        </mesh>
      </RigidBody>
    </group>
  );
}
