import { CuboidCollider, RigidBody } from '@react-three/rapier';
import MovingPlatform from '../physics/MovingPlatform';

type RegionShadowVolcanoProps = {
  playerPosition: [number, number, number];
  onEnterLesson: (levelId: number | 'boss') => void;
  unlockedLevelId: number | 'boss';
};

export default function RegionShadowVolcano({
  playerPosition,
  onEnterLesson,
  unlockedLevelId,
}: RegionShadowVolcanoProps) {
  const [px, , pz] = playerPosition;

  // Station positions across the volcanic caldera (X: -60 to -150, Z: -260 to -390)
  const stations = [
    { levelId: 1, nameKh: 'ខ្លោងទ្វារថ្មភ្នំភ្លើង (Basalt Gate)', pos: [-65, 0, -265] as const },
    { levelId: 2, nameKh: 'ស្ពានកម្អែលភ្នំភ្លើង (Magma Bridge)', pos: [-78, 0, -280] as const },
    { levelId: 3, nameKh: 'រណ្ដៅភ្លើងស្រមោល (Shadow Pit)', pos: [-90, 0, -298] as const },
    { levelId: 4, nameKh: 'វេទិកាថ្មខ្មៅ (Obsidian Platform)', pos: [-102, 0, -315] as const },
    { levelId: 5, nameKh: 'សសរថ្មបាសាល់ (Basalt Spire)', pos: [-114, 0, -332] as const },
    { levelId: 6, nameKh: 'ផ្លូវផេះក្តៅ (Ash Trail)', pos: [-125, 0, -348] as const },
    { levelId: 7, nameKh: 'មាត់រណ្ដៅភ្លើង (Caldera Rim)', pos: [-136, 0, -365] as const },
    { levelId: 8, nameKh: 'ច្រកភ្នំភ្លើង (Volcanic Gorge)', pos: [-145, 0, -378] as const },
    { levelId: 'boss' as const, nameKh: 'មារបិសាចស្រមោល (Shadow Mara Boss)', pos: [-155, 0, -395] as const },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Magma Basin Floor (Y: -1.5) with glowing lava emissive shader */}
      <mesh position={[-110, -1.2, -330]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 160]} />
        <meshStandardMaterial color="#DC2626" emissive="#EA580C" emissiveIntensity={1.8} roughness={0.3} />
      </mesh>

      {/* Obsidian Stepping Pillars */}
      {stations.map(({ pos }, i) => (
        <RigidBody key={`volc-pillar-${i}`} type="fixed" colliders={false} position={[pos[0], -0.4, pos[2]]}>
          <CuboidCollider args={[4, 0.4, 4]} />
          <mesh receiveShadow>
            <cylinderGeometry args={[4, 4.6, 0.8, 6]} />
            <meshStandardMaterial color="#1E1B2E" roughness={0.7} />
          </mesh>
        </RigidBody>
      ))}

      {/* Moving Obsidian Platform over the Molten Gap */}
      <MovingPlatform
        initialPosition={[-84, 0, -289]}
        axis="x"
        amplitude={3.5}
        speed={1.1}
        theme="obsidian"
        size={[3.6, 0.6, 3.6]}
      />
      <MovingPlatform
        initialPosition={[-120, 0, -340]}
        axis="z"
        amplitude={3.5}
        speed={1.0}
        theme="obsidian"
        size={[3.6, 0.6, 3.6]}
      />

      {/* Station Altar Runes with Crimson Aura */}
      {stations.map(({ levelId, pos }) => {
        const dist = Math.hypot(px - pos[0], pz - pos[2]);
        const isNear = dist < 3.8;
        const isUnlocked =
          levelId === 1 ||
          (typeof unlockedLevelId === 'number' && typeof levelId === 'number' && levelId <= unlockedLevelId) ||
          unlockedLevelId === 'boss';
        return (
          <group key={`w5-st-${levelId}`} position={pos}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.0, 1.3, 1.0, 6]} />
              <meshStandardMaterial color={isUnlocked ? '#2E1065' : '#1c1917'} roughness={0.6} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <octahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial color="#EF4444" emissive="#B91C1C" emissiveIntensity={isNear && isUnlocked ? 2.8 : 1.0} />
            </mesh>
            {isNear && (
              <mesh position={[0, 2.4, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => onEnterLesson(levelId)}>
                <ringGeometry args={[1.4, 1.7, 24]} />
                <meshBasicMaterial color="#EF4444" />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Shadow Demon Mara Boss Arena (X: -155, Z: -395, 30m x 30m basalt dais) */}
      <RigidBody type="fixed" colliders={false} position={[-155, -0.4, -395]}>
        <CuboidCollider args={[15, 0.4, 15]} />
        <mesh receiveShadow>
          <cylinderGeometry args={[15, 17, 0.8, 12]} />
          <meshStandardMaterial color="#0F0F1A" roughness={0.8} />
        </mesh>
      </RigidBody>
    </group>
  );
}
