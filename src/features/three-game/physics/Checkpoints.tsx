import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { discoverCheckpoint, discoverFastTravel, isCheckpointDiscovered } from '../../../lib/explorationRecord';
import type { Position3D } from '../types';

export type CheckpointDefinition = {
  id: string;
  nameKh: string;
  nameEn: string;
  regionId: string;
  position: Position3D;
  isFastTravelNode: boolean;
};

export const WORLD_CHECKPOINTS: CheckpointDefinition[] = [
  // Central Angkor Hub
  {
    id: 'hub-center',
    nameKh: 'ទីលានកណ្តាលអង្គរ (Angkor Plaza)',
    nameEn: 'Central Angkor Plaza',
    regionId: 'angkor-hub',
    position: [0, 0, 0],
    isFastTravelNode: true,
  },
  {
    id: 'hub-sanctuary',
    nameKh: 'វិហារអក្ខរក្រម (Learning Sanctuary)',
    nameEn: 'Learning Sanctuary',
    regionId: 'angkor-hub',
    position: [0, 0, 15],
    isFastTravelNode: true,
  },
  {
    id: 'hub-market',
    nameKh: 'ផ្សារបុរាណ (Market District)',
    nameEn: 'Ancient Market District',
    regionId: 'angkor-hub',
    position: [-22, 0, -12],
    isFastTravelNode: true,
  },
  {
    id: 'hub-wardrobe',
    nameKh: 'ពន្លាភូសន្តរាភរណ៍ (Wardrobe Pavilion)',
    nameEn: 'Wardrobe Pavilion',
    regionId: 'angkor-hub',
    position: [22, 0, -12],
    isFastTravelNode: true,
  },
  {
    id: 'hub-observatory',
    nameKh: 'ហោរាសាស្រ្តវិទ្យា (Scholar Observatory)',
    nameEn: 'Scholar Observatory',
    regionId: 'angkor-hub',
    position: [22, 0, 22],
    isFastTravelNode: true,
  },

  // World 1: Temple Jungle
  {
    id: 'w1-entrance',
    nameKh: 'ខ្លោងទ្វារព្រៃប្រាសាទ (Temple Jungle Gate)',
    nameEn: 'Temple Jungle Entrance',
    regionId: 'world-1',
    position: [0, 0, -60],
    isFastTravelNode: true,
  },
  {
    id: 'w1-crossroads',
    nameKh: 'ផ្លូវបំបែកព្រៃជ្រៅ (Jungle Crossroads)',
    nameEn: 'Jungle Crossroads',
    regionId: 'world-1',
    position: [0, 0, -130],
    isFastTravelNode: true,
  },
  {
    id: 'w1-boss-arena',
    nameKh: 'ទីលានសិង្ហនាគ (Temple Guardian Altar)',
    nameEn: 'Temple Guardian Altar',
    regionId: 'world-1',
    position: [0, 0, -210],
    isFastTravelNode: true,
  },

  // World 2: River Ruins
  {
    id: 'w2-docks',
    nameKh: 'កំពង់ទន្លេបុរាណ (Ancient River Docks)',
    nameEn: 'Ancient River Docks',
    regionId: 'world-2',
    position: [-60, 0, 20],
    isFastTravelNode: true,
  },
  {
    id: 'w2-sluice',
    nameKh: 'ទ្វារទឹកថ្មបុរាណ (Ancient Sluice Gate)',
    nameEn: 'Ancient Sluice Gate',
    regionId: 'world-2',
    position: [-130, 0, 50],
    isFastTravelNode: true,
  },
  {
    id: 'w2-boss-basin',
    nameKh: 'អាងនាគរាជទន្លេ (River Serpent Basin)',
    nameEn: 'River Serpent Basin',
    regionId: 'world-2',
    position: [-200, 0, 60],
    isFastTravelNode: true,
  },

  // World 3: Sky Pagoda
  {
    id: 'w3-stairway',
    nameKh: 'ជណ្តើរពពកមេឃ (Cloud Stairway)',
    nameEn: 'Cloud Stairway',
    regionId: 'world-3',
    position: [0, 15, 110],
    isFastTravelNode: true,
  },
  {
    id: 'w3-cloud-walk',
    nameKh: 'ផ្លូវស្ពានខ្យល់ (Wind Bridge)',
    nameEn: 'Wind Bridge',
    regionId: 'world-3',
    position: [0, 25, 170],
    isFastTravelNode: true,
  },
  {
    id: 'w3-summit-spire',
    nameKh: 'កំពូលប្រាសាទមេឃ (Sky Pagoda Summit)',
    nameEn: 'Sky Pagoda Summit',
    regionId: 'world-3',
    position: [0, 35, 230],
    isFastTravelNode: true,
  },

  // World 4: Golden Library
  {
    id: 'w4-atrium',
    nameKh: 'សាលតម្កល់គម្ពីរ (Library Atrium)',
    nameEn: 'Library Atrium',
    regionId: 'world-4',
    position: [60, 0, 20],
    isFastTravelNode: true,
  },
  {
    id: 'w4-manuscript-hall',
    nameKh: 'សាលាសាស្ត្រាស្លឹករឹត (Manuscript Hall)',
    nameEn: 'Manuscript Hall',
    regionId: 'world-4',
    position: [130, 0, 50],
    isFastTravelNode: true,
  },
  {
    id: 'w4-sanctum-boss',
    nameKh: 'បណ្ណាល័យកំពូល (Scholar Sphinx Sanctum)',
    nameEn: 'Scholar Sphinx Sanctum',
    regionId: 'world-4',
    position: [200, 0, 60],
    isFastTravelNode: true,
  },

  // World 5: Shadow Volcano
  {
    id: 'w5-obsidian-gate',
    nameKh: 'ខ្លោងទ្វារថ្មភ្នំភ្លើង (Obsidian Gate)',
    nameEn: 'Obsidian Gate',
    regionId: 'world-5',
    position: [-70, 0, -260],
    isFastTravelNode: true,
  },
  {
    id: 'w5-caldera',
    nameKh: 'មាត់រណ្ដៅភ្នំភ្លើង (Magma Caldera)',
    nameEn: 'Magma Caldera',
    regionId: 'world-5',
    position: [-110, 0, -320],
    isFastTravelNode: true,
  },
  {
    id: 'w5-boss-crater',
    nameKh: 'រណ្ដៅស្តេចស្រមោល (Shadow Mara Crater)',
    nameEn: 'Shadow Mara Crater',
    regionId: 'world-5',
    position: [-140, 0, -380],
    isFastTravelNode: true,
  },

  // World 6: Royal Angkor
  {
    id: 'w6-causeway-kings',
    nameKh: 'ស្ពានកែវរាជធានី (Causeway of Kings)',
    nameEn: 'Causeway of Kings',
    regionId: 'world-6',
    position: [60, 0, -260],
    isFastTravelNode: true,
  },
  {
    id: 'w6-royal-terrace',
    nameKh: 'ព្រលានព្រះរាជា (Terrace of Kings)',
    nameEn: 'Terrace of Kings',
    regionId: 'world-6',
    position: [110, 0, -320],
    isFastTravelNode: true,
  },
  {
    id: 'w6-boss-throne',
    nameKh: 'កំពូលប្រាសាទបាយ័ន (Royal Sovereign Spire)',
    nameEn: 'Royal Sovereign Spire',
    regionId: 'world-6',
    position: [150, 0, -400],
    isFastTravelNode: true,
  },
];

type CheckpointPedestalProps = {
  checkpoint: CheckpointDefinition;
  playerPosition?: [number, number, number];
  playerPositionRef?: React.MutableRefObject<[number, number, number]>;
  onActivate: (checkpoint: CheckpointDefinition) => void;
};

function CheckpointPedestal({ checkpoint, playerPosition, playerPositionRef, onActivate }: CheckpointPedestalProps) {
  const runeRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const activatedRef = useRef(isCheckpointDiscovered(checkpoint.id));

  useFrame((state, delta) => {
    if (runeRef.current) {
      runeRef.current.rotation.y += delta * 1.2;
      runeRef.current.position.y = 1.35 + Math.sin(state.clock.elapsedTime * 2.2) * 0.12;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.8;
    }

    const pos = playerPositionRef ? playerPositionRef.current : (playerPosition ?? [0, 0, 0]);
    const dist = Math.hypot(
      pos[0] - checkpoint.position[0],
      pos[2] - checkpoint.position[2],
    );

    if (dist < 4.0 && !activatedRef.current) {
      activatedRef.current = true;
      void discoverCheckpoint(checkpoint.id, checkpoint.regionId);
      if (checkpoint.isFastTravelNode) {
        void discoverFastTravel(checkpoint.id, checkpoint.regionId);
      }
      onActivate(checkpoint);
    }
  });

  const isActivated = isCheckpointDiscovered(checkpoint.id);
  const glowColor = isActivated ? '#38BDF8' : '#F59E0B';
  const runeColor = isActivated ? '#0284C7' : '#D97706';

  return (
    <group position={checkpoint.position}>
      {/* Stone Pedestal Base */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.45, 0.5, 8]} />
        <meshStandardMaterial color="#5C4D3C" roughness={0.88} />
      </mesh>
      {/* Stepped Tier */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.15, 0.35, 8]} />
        <meshStandardMaterial color="#6E5D4A" roughness={0.85} />
      </mesh>

      {/* Ancient Glowing Rune Ring */}
      <mesh ref={ringRef} position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 24]} />
        <meshBasicMaterial color={glowColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Rotating Angkorian Rune Monolith */}
      <group ref={runeRef} position={[0, 1.35, 0]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color={runeColor}
            emissive={glowColor}
            emissiveIntensity={isActivated ? 1.8 : 0.6}
            roughness={0.2}
          />
        </mesh>
        {/* Subtle Light Column */}
        {isActivated && (
          <pointLight color="#38BDF8" intensity={2.5} distance={7} />
        )}
      </group>
    </group>
  );
}

type CheckpointsProps = {
  playerPosition?: [number, number, number];
  playerPositionRef?: React.MutableRefObject<[number, number, number]>;
  onCheckpointTrigger: (checkpoint: CheckpointDefinition) => void;
};

export default function Checkpoints({ playerPosition, playerPositionRef, onCheckpointTrigger }: CheckpointsProps) {
  return (
    <group>
      {WORLD_CHECKPOINTS.map((cp) => (
        <CheckpointPedestal
          key={cp.id}
          checkpoint={cp}
          playerPosition={playerPosition}
          playerPositionRef={playerPositionRef}
          onActivate={onCheckpointTrigger}
        />
      ))}
    </group>
  );
}
