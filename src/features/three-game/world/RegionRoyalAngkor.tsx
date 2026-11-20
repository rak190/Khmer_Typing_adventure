import { CuboidCollider, RigidBody } from '@react-three/rapier';
import MovingPlatform from '../physics/MovingPlatform';

type RegionRoyalAngkorProps = {
  playerPosition: [number, number, number];
  onEnterLesson: (levelId: number | 'boss') => void;
  unlockedLevelId: number | 'boss';
};

export default function RegionRoyalAngkor({
  playerPosition,
  onEnterLesson,
  unlockedLevelId,
}: RegionRoyalAngkorProps) {
  const [px, , pz] = playerPosition;

  // Station positions along the Royal Causeway and Prasat Towers (X: 60 to 160, Z: -260 to -410)
  const stations = [
    { levelId: 1, nameKh: 'ស្ពានកែវរាជធានី (Causeway of Kings)', pos: [65, 0, -265] as const },
    { levelId: 2, nameKh: 'ព្រលានដំរី (Terrace of the Elephants)', pos: [78, 0, -280] as const },
    { levelId: 3, nameKh: 'ព្រះលានស្ដេចគម្លង់ (Terrace of the Leper King)', pos: [90, 0, -298] as const },
    { levelId: 4, nameKh: 'ស្រះស្រង់រាជវាំង (Royal Reflection Pool)', pos: [102, 0, -315] as const },
    { levelId: 5, nameKh: 'ថែវចម្លាក់បាយ័ន (Bayon Bas-Relief Gallery)', pos: [114, 0, -332] as const },
    { levelId: 6, nameKh: 'កំពូលប្រាសាទមុខបួន (Four-Faced Towers)', pos: [126, 0, -350] as const },
    { levelId: 7, nameKh: 'សាលរាជកវី (Royal Poets Chamber)', pos: [138, 0, -368] as const },
    { levelId: 8, nameKh: 'ព្រះរាជបណ្ណាល័យ (Royal Grand Library)', pos: [148, 0, -384] as const },
    { levelId: 'boss' as const, nameKh: 'នាគរាជអធិរាជ (Royal Sovereign Dragon Boss)', pos: [160, 0, -405] as const },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Royal Imperial Sandstone Causeway (140m long, 16m wide) */}
      <RigidBody type="fixed" colliders={false} position={[110, -0.4, -335]}>
        <CuboidCollider args={[10, 0.4, 75]} />
        <mesh receiveShadow>
          <boxGeometry args={[20, 0.8, 150]} />
          <meshStandardMaterial color="#A17B4F" roughness={0.78} />
        </mesh>
      </RigidBody>

      {/* Royal Angkorian Prasat Spire Towers lining the sacred causeway */}
      {[50, 70, 90, 110, 130, 150].map((z) => (
        <group key={`prasat-${z}`}>
          {/* West Side Spire */}
          <group position={[98, 0, -z]}>
            <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.5, 2.2, 8.0, 8]} />
              <meshStandardMaterial color="#8B6D4A" roughness={0.8} />
            </mesh>
            <mesh position={[0, 9.0, 0]} castShadow>
              <coneGeometry args={[2.0, 4.0, 8]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.4} metalness={0.7} />
            </mesh>
          </group>
          {/* East Side Spire */}
          <group position={[122, 0, -z]}>
            <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.5, 2.2, 8.0, 8]} />
              <meshStandardMaterial color="#8B6D4A" roughness={0.8} />
            </mesh>
            <mesh position={[0, 9.0, 0]} castShadow>
              <coneGeometry args={[2.0, 4.0, 8]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.4} metalness={0.7} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Royal Moving Platform bridging the Reflection Pool */}
      <MovingPlatform
        initialPosition={[102, 0, -315]}
        axis="x"
        amplitude={3.5}
        speed={1.0}
        theme="sandstone"
        size={[3.8, 0.6, 3.8]}
      />

      {/* Station Altar Runes with Radiant Golden Hue */}
      {stations.map(({ levelId, pos }) => {
        const dist = Math.hypot(px - pos[0], pz - pos[2]);
        const isNear = dist < 3.8;
        const isUnlocked =
          levelId === 1 ||
          (typeof unlockedLevelId === 'number' && typeof levelId === 'number' && levelId <= unlockedLevelId) ||
          unlockedLevelId === 'boss';
        return (
          <group key={`w6-st-${levelId}`} position={pos}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.2, 1.5, 1.0, 8]} />
              <meshStandardMaterial color={isUnlocked ? '#9F7E4F' : '#333333'} roughness={0.7} metalness={0.2} />
            </mesh>
            <mesh position={[0, 1.6, 0]}>
              <octahedronGeometry args={[0.38, 0]} />
              <meshStandardMaterial color="#FCD34D" emissive="#F59E0B" emissiveIntensity={isNear && isUnlocked ? 2.8 : 1.2} />
            </mesh>
            {isNear && (
              <mesh position={[0, 2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => onEnterLesson(levelId)}>
                <ringGeometry args={[1.5, 1.8, 24]} />
                <meshBasicMaterial color="#F59E0B" />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Royal Sovereign Dragon Grand Spire Dais (X: 160, Z: -405, 36m x 36m) */}
      <RigidBody type="fixed" colliders={false} position={[160, -0.4, -405]}>
        <CuboidCollider args={[18, 0.4, 18]} />
        <mesh receiveShadow>
          <boxGeometry args={[36, 0.8, 36]} />
          <meshStandardMaterial color="#785A3C" roughness={0.75} />
        </mesh>
      </RigidBody>
    </group>
  );
}
