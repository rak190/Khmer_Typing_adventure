import { CuboidCollider, RigidBody } from '@react-three/rapier';
import MovingPlatform from '../physics/MovingPlatform';

type RegionSkyPagodaProps = {
  playerPosition: [number, number, number];
  onEnterLesson: (levelId: number | 'boss') => void;
  unlockedLevelId: number | 'boss';
};

export default function RegionSkyPagoda({
  playerPosition,
  onEnterLesson,
  unlockedLevelId,
}: RegionSkyPagodaProps) {
  const [px, , pz] = playerPosition;

  // Station positions ascending into the sky (Z: 100 to 240, Y: 12 to 36)
  const stations = [
    { levelId: 1, nameKh: 'ជណ្តើរពពក (Cloud Staircase)', pos: [0, 12, 110] as const },
    { levelId: 2, nameKh: 'វេទិកាខ្យល់ (Wind Pavilion)', pos: [0, 15, 125] as const },
    { levelId: 3, nameKh: 'ស្ពានឥន្ទធនូ (Rainbow Pier)', pos: [0, 18, 142] as const },
    { levelId: 4, nameKh: 'ប្រាសាទអណ្តែត (Floating Pagoda)', pos: [0, 21, 158] as const },
    { levelId: 5, nameKh: 'កោះមេឃមាស (Golden Sky Islet)', pos: [0, 24, 175] as const },
    { levelId: 6, nameKh: 'សសរខ្យល់កួច (Vortex Pillar)', pos: [0, 27, 192] as const },
    { levelId: 7, nameKh: 'ព្រះពន្លាពពក (Celestial Hall)', pos: [0, 30, 208] as const },
    { levelId: 8, nameKh: 'កំពូលប្រាសាទមាស (Golden Spire Ascent)', pos: [0, 33, 222] as const },
    { levelId: 'boss' as const, nameKh: 'ស្តេចគ្រុឌមេឃ (Storm Garuda Boss)', pos: [0, 36, 240] as const },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Sky Platforms ascending in altitude */}
      {stations.map(({ pos }, i) => (
        <RigidBody key={`sky-plat-${i}`} type="fixed" colliders={false} position={[pos[0], pos[1] - 0.4, pos[2]]}>
          <CuboidCollider args={[4, 0.4, 4]} />
          <mesh receiveShadow>
            <cylinderGeometry args={[4, 4.8, 0.8, 8]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.7} metalness={0.1} />
          </mesh>
          {/* Golden Pagoda Spire Trim */}
          <mesh position={[0, -1.8, 0]}>
            <coneGeometry args={[2.5, 3.2, 8]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.4} metalness={0.6} />
          </mesh>
        </RigidBody>
      ))}

      {/* Moving Sky Lift Platforms bridging the ascents */}
      <MovingPlatform
        initialPosition={[0, 13.5, 118]}
        axis="y"
        amplitude={1.8}
        speed={1.0}
        theme="cloud"
        size={[3.2, 0.5, 3.2]}
      />
      <MovingPlatform
        initialPosition={[0, 19.5, 150]}
        axis="x"
        amplitude={3.0}
        speed={1.2}
        theme="cloud"
        size={[3.2, 0.5, 3.2]}
      />
      <MovingPlatform
        initialPosition={[0, 25.5, 184]}
        axis="y"
        amplitude={2.0}
        speed={0.9}
        theme="cloud"
        size={[3.2, 0.5, 3.2]}
      />

      {/* Station Altar Runes */}
      {stations.map(({ levelId, pos }) => {
        const dist = Math.hypot(px - pos[0], pz - pos[2]);
        const isNear = dist < 3.8;
        const isUnlocked =
          levelId === 1 ||
          (typeof unlockedLevelId === 'number' && typeof levelId === 'number' && levelId <= unlockedLevelId) ||
          unlockedLevelId === 'boss';
        return (
          <group key={`w3-st-${levelId}`} position={pos}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.0, 1.3, 1.0, 8]} />
              <meshStandardMaterial color={isUnlocked ? '#FCD34D' : '#555555'} roughness={0.5} metalness={0.4} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <octahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={isNear && isUnlocked ? 2.5 : 1.0} />
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

      {/* Storm Garuda Boss Summit Spire (Y: 36, Z: 240, 28m diameter) */}
      <RigidBody type="fixed" colliders={false} position={[0, 35.6, 240]}>
        <CuboidCollider args={[14, 0.4, 14]} />
        <mesh receiveShadow>
          <cylinderGeometry args={[14, 16, 0.8, 16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
        </mesh>
      </RigidBody>
    </group>
  );
}
