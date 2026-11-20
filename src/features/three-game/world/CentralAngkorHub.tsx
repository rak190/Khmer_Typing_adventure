import { useFrame } from '@react-three/fiber';
import { useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

type CentralAngkorHubProps = {
  onOpenService: (service: 'sanctuary' | 'map' | 'observatory' | 'market' | 'wardrobe' | 'settings') => void;
  playerPosition?: [number, number, number];
  playerPositionRef?: MutableRefObject<[number, number, number]>;
};

export default function CentralAngkorHub({ onOpenService, playerPosition, playerPositionRef }: CentralAngkorHubProps) {
  const [activeNearbyService, setActiveNearbyService] = useState<string | null>(null);
  const activeNearbyRef = useRef<string | null>(null);

  useFrame(() => {
    const pos = playerPositionRef ? playerPositionRef.current : (playerPosition ?? [0, 0, 0]);
    const px = pos[0];
    const pz = pos[2];

    let nearest: string | null = null;
    if (Math.hypot(px - 0, pz - 18) < 4.5) nearest = 'sanctuary';
    else if (Math.hypot(px - (-22), pz - 18) < 4.5) nearest = 'map';
    else if (Math.hypot(px - 22, pz - 18) < 4.5) nearest = 'observatory';
    else if (Math.hypot(px - (-22), pz - (-18)) < 4.5) nearest = 'market';
    else if (Math.hypot(px - 22, pz - (-18)) < 4.5) nearest = 'wardrobe';
    else if (Math.hypot(px - 0, pz - (-22)) < 4.5) nearest = 'settings';

    if (nearest !== activeNearbyRef.current) {
      activeNearbyRef.current = nearest;
      setActiveNearbyService(nearest);
    }
  });

  const isNearSanctuary = activeNearbyService === 'sanctuary';
  const isNearMap = activeNearbyService === 'map';
  const isNearObservatory = activeNearbyService === 'observatory';
  const isNearMarket = activeNearbyService === 'market';
  const isNearWardrobe = activeNearbyService === 'wardrobe';
  const isNearSettings = activeNearbyService === 'settings';

  return (
    <group>
      {/* Central Plaza Sandstone Platform (90m x 90m) */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.4, 0]}>
        <CuboidCollider args={[45, 0.4, 45]} />
        <mesh receiveShadow>
          <boxGeometry args={[90, 0.8, 90]} />
          <meshStandardMaterial color="#B08D57" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Decorative Outer Border Moat Wall */}
      <mesh position={[0, 0.2, 45]} castShadow receiveShadow>
        <boxGeometry args={[92, 0.8, 1.6]} />
        <meshStandardMaterial color="#6E583B" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.2, -45]} castShadow receiveShadow>
        <boxGeometry args={[92, 0.8, 1.6]} />
        <meshStandardMaterial color="#6E583B" roughness={0.88} />
      </mesh>
      <mesh position={[45, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.8, 92]} />
        <meshStandardMaterial color="#6E583B" roughness={0.88} />
      </mesh>
      <mesh position={[-45, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.8, 92]} />
        <meshStandardMaterial color="#6E583B" roughness={0.88} />
      </mesh>

      {/* Central Sun Disc Paver Pattern */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[2.5, 7.5, 32]} />
        <meshStandardMaterial color="#D4A76A" roughness={0.82} />
      </mesh>

      {/* ============================================================== */}
      {/* 1. LEARNING SANCTUARY (North: Foundation & Master Lessons)      */}
      {/* ============================================================== */}
      <group position={[0, 0, 18]}>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.2, 3.8, 4.4, 8]} />
          <meshStandardMaterial color="#8B6D4A" roughness={0.85} />
        </mesh>
        <mesh position={[0, 5.0, 0]} castShadow>
          <coneGeometry args={[3.6, 2.0, 8]} />
          <meshStandardMaterial color="#D97706" roughness={0.7} />
        </mesh>
        {/* Floating Golden Glyph */}
        <mesh position={[0, 3.2, 3.8]}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#FCD34D" emissive="#F59E0B" emissiveIntensity={1.5} />
        </mesh>
        {isNearSanctuary && (
          <InteractivePrompt
            label="Learning Sanctuary · វិហារអក្ខរក្រម"
            actionLabel="Enter Lessons / Foundation"
            onClick={() => onOpenService('sanctuary')}
          />
        )}
      </group>

      {/* ============================================================== */}
      {/* 2. CARTOGRAPHER SHRINE (North-West: World Map & Fast Travel)    */}
      {/* ============================================================== */}
      <group position={[-22, 0, 18]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 3.6, 5]} />
          <meshStandardMaterial color="#735A3D" roughness={0.88} />
        </mesh>
        <mesh position={[0, 4.2, 0]} castShadow>
          <coneGeometry args={[3.2, 1.8, 4]} />
          <meshStandardMaterial color="#0284C7" roughness={0.65} />
        </mesh>
        {isNearMap && (
          <InteractivePrompt
            label="Cartographer Shrine · ផែនទីពិភពលោក"
            actionLabel="Open World Map & Travel"
            onClick={() => onOpenService('map')}
          />
        )}
      </group>

      {/* ============================================================== */}
      {/* 3. SCHOLAR OBSERVATORY (North-East: Stats & Achievements)       */}
      {/* ============================================================== */}
      <group position={[22, 0, 18]}>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.8, 3.2, 4.4, 12]} />
          <meshStandardMaterial color="#6B5238" roughness={0.85} />
        </mesh>
        <mesh position={[0, 5.1, 0]} castShadow>
          <sphereGeometry args={[2.5, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#7C3AED" roughness={0.5} />
        </mesh>
        {isNearObservatory && (
          <InteractivePrompt
            label="Scholar Observatory · ហោរាសាស្រ្ត"
            actionLabel="View Progress & Weak Keys"
            onClick={() => onOpenService('observatory')}
          />
        )}
      </group>

      {/* ============================================================== */}
      {/* 4. MARKET DISTRICT (South-West: Bazaar & Shop)                  */}
      {/* ============================================================== */}
      <group position={[-22, 0, -18]}>
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 3.2, 5]} />
          <meshStandardMaterial color="#856441" roughness={0.9} />
        </mesh>
        {/* Striped Canopy */}
        <mesh position={[0, 3.6, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[4.2, 1.4, 4]} />
          <meshStandardMaterial color="#EA580C" roughness={0.7} />
        </mesh>
        {isNearMarket && (
          <InteractivePrompt
            label="Market District · ផ្សារបុរាណ"
            actionLabel="Browse Shop & Inventory"
            onClick={() => onOpenService('market')}
          />
        )}
      </group>

      {/* ============================================================== */}
      {/* 5. WARDROBE PAVILION (South-East: Cosmetics & Profile)         */}
      {/* ============================================================== */}
      <group position={[22, 0, -18]}>
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.0, 3.4, 4.0, 8]} />
          <meshStandardMaterial color="#7A5D3E" roughness={0.85} />
        </mesh>
        <mesh position={[0, 4.6, 0]} castShadow>
          <coneGeometry args={[3.4, 1.8, 8]} />
          <meshStandardMaterial color="#EC4899" roughness={0.65} />
        </mesh>
        {isNearWardrobe && (
          <InteractivePrompt
            label="Wardrobe Pavilion · ភូសន្តរាភរណ៍"
            actionLabel="Customize Avatar & Outfits"
            onClick={() => onOpenService('wardrobe')}
          />
        )}
      </group>

      {/* ============================================================== */}
      {/* 6. SETTINGS SHRINE (South: Audio, Graphics, Accessibility)     */}
      {/* ============================================================== */}
      <group position={[0, 0, -22]}>
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.4, 2.8, 2.8, 10]} />
          <meshStandardMaterial color="#6B5238" roughness={0.88} />
        </mesh>
        {/* Stone Gear Finial */}
        <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.28, 8, 16]} />
          <meshStandardMaterial color="#D97706" roughness={0.6} />
        </mesh>
        {isNearSettings && (
          <InteractivePrompt
            label="Settings Shrine · ការកំណត់"
            actionLabel="Adjust Graphics & Audio"
            onClick={() => onOpenService('settings')}
          />
        )}
      </group>

      {/* ============================================================== */}
      {/* PHYSICAL EXITS / CAUSEWAYS CONNECTING TO ALL 6 REGIONS          */}
      {/* ============================================================== */}
      {/* South Causeway -> World 1: Temple Jungle (Z: -45 to -70) */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.4, -57.5]}>
        <CuboidCollider args={[4, 0.4, 12.5]} />
        <mesh receiveShadow>
          <boxGeometry args={[8, 0.8, 25]} />
          <meshStandardMaterial color="#9F7E4F" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* West Causeway -> World 2: River Ruins (X: -45 to -70) */}
      <RigidBody type="fixed" colliders={false} position={[-57.5, -0.4, 20]}>
        <CuboidCollider args={[12.5, 0.4, 4]} />
        <mesh receiveShadow>
          <boxGeometry args={[25, 0.8, 8]} />
          <meshStandardMaterial color="#9F7E4F" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* North Causeway -> World 3: Sky Pagoda (Z: 45 to 70) */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.4, 57.5]}>
        <CuboidCollider args={[4, 0.4, 12.5]} />
        <mesh receiveShadow>
          <boxGeometry args={[8, 0.8, 25]} />
          <meshStandardMaterial color="#9F7E4F" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* East Causeway -> World 4: Golden Library (X: 45 to 70) */}
      <RigidBody type="fixed" colliders={false} position={[57.5, -0.4, 20]}>
        <CuboidCollider args={[12.5, 0.4, 4]} />
        <mesh receiveShadow>
          <boxGeometry args={[25, 0.8, 8]} />
          <meshStandardMaterial color="#9F7E4F" roughness={0.9} />
        </mesh>
      </RigidBody>
    </group>
  );
}

function InteractivePrompt({
  onClick,
}: {
  label: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <group position={[0, 4.2, 0]}>
      {/* Floating 3D Beacon Ring with Click Interaction */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={onClick}>
        <ringGeometry args={[1.4, 1.6, 24]} />
        <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
