import { CuboidCollider, RigidBody } from '@react-three/rapier';
import MovingPlatform from '../physics/MovingPlatform';

type RegionRiverRuinsProps = {
  playerPosition: [number, number, number];
  onEnterLesson: (levelId: number | 'boss') => void;
  unlockedLevelId: number | 'boss';
};

export default function RegionRiverRuins({
  playerPosition,
  onEnterLesson,
  unlockedLevelId,
}: RegionRiverRuinsProps) {
  const [px, , pz] = playerPosition;

  // Station positions along the river ruins (X: -60 to -215, Z: 20 to 70)
  const stations = [
    { levelId: 1, nameKh: 'កំពង់ផែបុរាណ (River Port)', pos: [-75, 0, 25] as const },
    { levelId: 2, nameKh: 'កោះផ្កាឈូកទឹក (Water Lily Islet)', pos: [-92, 0, 32] as const },
    { levelId: 3, nameKh: 'ទំនប់ទឹកបុរាណ (Ancient Sluice Dam)', pos: [-112, 0, 40] as const },
    { levelId: 4, nameKh: 'ស្ពានថ្មលិចទឹក (Sunken Bridge)', pos: [-132, 0, 45] as const },
    { levelId: 5, nameKh: 'កោះខ្សាច់មាស (Golden Sandbank)', pos: [-152, 0, 50] as const },
    { levelId: 6, nameKh: 'ទ្វារទឹកនាគ (Naga Aqueduct)', pos: [-170, 0, 55] as const },
    { levelId: 7, nameKh: 'ទឹកជ្រោះពិសិដ្ឋ (Sacred Cascade)', pos: [-188, 0, 60] as const },
    { levelId: 8, nameKh: 'អាងទឹកធំ (Grand Reservoir)', pos: [-202, 0, 62] as const },
    { levelId: 'boss' as const, nameKh: 'នាគរាជទន្លេ (River Serpent Boss)', pos: [-220, 0, 65] as const },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Ancient River Bed Basin with Deep Water Shader plane (Y: -1.5) */}
      <mesh position={[-140, -1.2, 45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 80]} />
        <meshStandardMaterial color="#0284C7" roughness={0.15} metalness={0.1} transparent opacity={0.88} />
      </mesh>

      {/* Traversal Stone Piers and Stepping Islets */}
      {stations.map(({ pos }, i) => (
        <RigidBody key={`pier-${i}`} type="fixed" colliders={false} position={[pos[0], -0.4, pos[2]]}>
          <CuboidCollider args={[4, 0.4, 4]} />
          <mesh receiveShadow>
            <cylinderGeometry args={[4, 4.5, 0.8, 10]} />
            <meshStandardMaterial color="#5C6B73" roughness={0.85} />
          </mesh>
        </RigidBody>
      ))}

      {/* Drifting Floating Lotus Lilypad Platforms between Piers */}
      <MovingPlatform
        initialPosition={[-83, 0, 28]}
        axis="z"
        amplitude={3.0}
        speed={0.9}
        theme="lotus"
        size={[3.4, 0.5, 3.4]}
      />
      <MovingPlatform
        initialPosition={[-122, 0, 42]}
        axis="x"
        amplitude={3.5}
        speed={1.1}
        theme="lotus"
        size={[3.4, 0.5, 3.4]}
      />
      <MovingPlatform
        initialPosition={[-161, 0, 52]}
        axis="z"
        amplitude={3.0}
        speed={0.8}
        theme="lotus"
        size={[3.4, 0.5, 3.4]}
      />

      {/* Sluice Water Gates & Stone Aqueducts */}
      <mesh position={[-112, 3, 40]} castShadow>
        <boxGeometry args={[1.5, 6, 12]} />
        <meshStandardMaterial color="#4A5568" roughness={0.9} />
      </mesh>

      {/* Lesson Station Altar Runes */}
      {stations.map(({ levelId, pos }) => {
        const dist = Math.hypot(px - pos[0], pz - pos[2]);
        const isNear = dist < 3.8;
        const isUnlocked =
          levelId === 1 ||
          (typeof unlockedLevelId === 'number' && typeof levelId === 'number' && levelId <= unlockedLevelId) ||
          unlockedLevelId === 'boss';
        return (
          <group key={`w2-st-${levelId}`} position={pos}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.1, 1.4, 1.0, 8]} />
              <meshStandardMaterial color={isUnlocked ? '#475569' : '#333333'} roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <octahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={isNear && isUnlocked ? 2.5 : 1.0} />
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

      {/* River Serpent Boss Arena (X: -220, Z: 65, 30m x 30m stone ring surrounded by water) */}
      <RigidBody type="fixed" colliders={false} position={[-220, -0.4, 65]}>
        <CuboidCollider args={[14, 0.4, 14]} />
        <mesh receiveShadow>
          <cylinderGeometry args={[14, 15, 0.8, 20]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>
      </RigidBody>
    </group>
  );
}
