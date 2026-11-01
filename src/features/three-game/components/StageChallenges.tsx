import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../hooks/useGltfAsset';
import {
  getPhysicalBarrierStatuses,
  getStageBarrierIndex,
  getStagePositionZ,
} from '../systems/gameplayState';
import type { GateStatus } from '../types';

type StageBarrierProps = {
  stageIndex: number;
  status: GateStatus;
  isActiveStage: boolean;
  isLocked: boolean;
  streak?: number;
  completedCount?: number;
  incorrectCount?: number;
  onOpeningFinished?: () => void;
  lessonId?: number;
  stageId?: string;
};

function StageLotusAltar({
  position,
  isLocked,
  status,
  accentColor,
  runeRef,
}: {
  position: [number, number, number];
  isLocked: boolean;
  status: GateStatus;
  accentColor: string;
  runeRef: React.RefObject<THREE.MeshStandardMaterial | null>;
}) {
  const glb = useGltfClone('/models/props/khmer_lotus_altar.glb');
  const cloned = useMemo(() => (glb ? glb.clone(true) : null), [glb]);
  const crystalRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (crystalRef.current) {
      crystalRef.current.rotation.y = t * 1.5;
      crystalRef.current.position.y = 1.68 + Math.sin(t * 2.6) * 0.07;
    }
    if (auraRef.current) {
      auraRef.current.rotation.z = -t * 0.65;
    }
  });

  const displayColor = isLocked ? '#64748B' : status === 'open' ? '#10B981' : accentColor;

  return (
    <group position={position}>
      {/* Ground Proximity Ring */}
      <mesh ref={auraRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.22, 1.44, 32]} />
        <meshBasicMaterial color={displayColor} transparent opacity={isLocked ? 0.25 : 0.55} />
      </mesh>

      {cloned ? (
        <primitive object={cloned} />
      ) : (
        <group>
          <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.15, 1.35, 0.32, 16]} />
            <meshStandardMaterial color="#614B35" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.82, 0.98, 0.42, 16]} />
            <meshStandardMaterial color="#7D6145" roughness={0.86} />
          </mesh>
          <mesh position={[0, 0.88, 0]} castShadow>
            <boxGeometry args={[1.2, 0.2, 0.95]} />
            <meshStandardMaterial color="#9E7D5B" roughness={0.82} />
          </mesh>
        </group>
      )}

      {/* Glowing Inscription Tablet */}
      <mesh position={[0, 1.18, 0]} rotation={[-0.32, 0, 0]}>
        <boxGeometry args={[0.88, 0.07, 0.56]} />
        <meshStandardMaterial
          ref={runeRef}
          color={displayColor}
          emissive={displayColor}
          emissiveIntensity={isLocked ? 0.15 : 0.75}
          roughness={0.22}
        />
      </mesh>

      {/* Floating Rotating Rune Crystal */}
      <mesh ref={crystalRef} position={[0, 1.68, 0]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color={displayColor}
          emissive={displayColor}
          emissiveIntensity={isLocked ? 0.2 : 1.25}
          roughness={0.15}
          metalness={0.25}
        />
      </mesh>
    </group>
  );
}

/**
 * Guardian Singha Lion Statue (សត្វតោថ្មអង្គរ)
 * Seated rearing posture guarding the cruciform terrace entrance
 */
export function SinghaGuardianLion({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Stepped Pedestal Base */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.24, 0.88]} />
        <meshStandardMaterial color="#614B35" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.12, 0.74]} />
        <meshStandardMaterial color="#7D6145" roughness={0.88} />
      </mesh>

      {/* Rearing Hindquarters & Haunches */}
      <mesh position={[0, 0.54, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.44, 0.42, 0.44]} />
        <meshStandardMaterial color="#8F714A" roughness={0.86} />
      </mesh>

      {/* Upright Broad Muscular Chest */}
      <mesh position={[0, 0.82, 0.08]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.58, 8]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.84} />
      </mesh>

      {/* Forelegs Standing Upright */}
      <mesh position={[-0.14, 0.56, 0.18]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.52, 6]} />
        <meshStandardMaterial color="#8F714A" roughness={0.86} />
      </mesh>
      <mesh position={[0.14, 0.56, 0.18]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.52, 6]} />
        <meshStandardMaterial color="#8F714A" roughness={0.86} />
      </mesh>

      {/* Flared Mane Collar Fringe */}
      <mesh position={[0, 1.08, 0.04]} rotation={[0.2, 0, 0]} castShadow>
        <coneGeometry args={[0.3, 0.36, 8]} />
        <meshStandardMaterial color="#A4855E" roughness={0.82} />
      </mesh>

      {/* Proud Lion Head with Open Roaring Jaws */}
      <mesh position={[0, 1.24, 0.12]} castShadow>
        <boxGeometry args={[0.26, 0.26, 0.28]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.8} />
      </mesh>
      {/* Snout & Open Jaws */}
      <mesh position={[0, 1.18, 0.28]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.12, 0.18]} />
        <meshStandardMaterial color="#7D6145" roughness={0.88} />
      </mesh>
      {/* Amber Glowing Eyes */}
      <mesh position={[-0.1, 1.28, 0.25]}>
        <sphereGeometry args={[0.032, 6, 6]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0.1, 1.28, 0.25]}>
        <sphereGeometry args={[0.032, 6, 6]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Royal Crown / Crest Finial */}
      <mesh position={[0, 1.44, 0.08]} castShadow>
        <coneGeometry args={[0.08, 0.18, 6]} />
        <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Upright Curled Tail */}
      <mesh position={[0, 0.72, -0.32]} rotation={[-0.35, 0, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.54, 6]} />
        <meshStandardMaterial color="#8F714A" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.98, -0.38]} castShadow>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Celestial Devata Wall Niche (ចម្លាក់ទេវតាលើជញ្ជាំង)
 */
function DevataWallNiche({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Recessed Niche Cavity */}
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 1.55, 0.18]} />
        <meshStandardMaterial color="#4A3420" roughness={0.94} />
      </mesh>
      {/* Decorative Arched Frame Trim */}
      <mesh position={[0, 2.22, 0.04]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.12, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.84} />
      </mesh>

      {/* High-Relief Devata Figure (ទេវតាចម្លាក់ថ្ម) */}
      {/* Tiered Crown (Mokot) */}
      <mesh position={[0, 2.12, 0.08]} castShadow>
        <coneGeometry args={[0.07, 0.22, 6]} />
        <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Serene Head */}
      <mesh position={[0, 1.94, 0.08]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#CDB082" roughness={0.8} />
      </mesh>
      {/* Slender Torso & Royal Cross-Sash (Sangvar) */}
      <mesh position={[0, 1.68, 0.08]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.32, 8]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>
      {/* Pleated Sampot Skirt */}
      <mesh position={[0, 1.25, 0.08]} castShadow>
        <cylinderGeometry args={[0.11, 0.16, 0.58, 8]} />
        <meshStandardMaterial color="#BA9966" roughness={0.82} />
      </mesh>
      {/* Sacred Pink Lotus Blossom in Hand */}
      <mesh position={[0, 1.76, 0.15]} castShadow>
        <coneGeometry args={[0.045, 0.09, 6]} />
        <meshStandardMaterial color="#F472B6" roughness={0.42} />
      </mesh>
    </group>
  );
}

/**
 * Authentic Khmer Bas-Relief Wall Register (ចម្លាក់លើផ្ទៃជញ្ជាំងប្រាសាទ)
 * Multi-tiered ashlar courses with Kbach Changva Por lozenges, golden rosettes,
 * running floral vine friezes (Kbach Phni Tes), dentil courses, and lotus plinths.
 */
function WallBasReliefRegister({
  width,
  height,
  depth,
  position,
}: {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
}) {
  const lozengeCount = Math.max(2, Math.floor(width / 0.52));
  const lozenges = useMemo(() => {
    const arr = [];
    const step = width / (lozengeCount + 1);
    for (let i = 1; i <= lozengeCount; i += 1) {
      arr.push(-width / 2 + i * step);
    }
    return arr;
  }, [width, lozengeCount]);

  const sides = [{ rotY: Math.PI }, { rotY: 0 }];

  return (
    <group position={position}>
      {/* Main Ashlar Sandstone Wall Block */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#7D6145" roughness={0.88} />
      </mesh>

      {/* Authentic Bas-Relief Carvings on both front (-Z) and rear (+Z) faces */}
      {sides.map(({ rotY }, sIdx) => (
        <group key={`side-${sIdx}`} rotation={[0, rotY, 0]}>
          {/* Recessed Frieze Panel Field (ផ្ទៃចម្លាក់ក្បាច់) */}
          <mesh position={[0, 0, depth / 2 + 0.015]} receiveShadow>
            <boxGeometry args={[width * 0.94, height * 0.76, 0.03]} />
            <meshStandardMaterial color="#8F714A" roughness={0.86} />
          </mesh>

          {/* Running Floral Vine Frieze Band (ក្បាច់ភ្ញីទេស Kbach Phni Tes) */}
          <mesh position={[0, height * 0.24, depth / 2 + 0.025]} castShadow>
            <boxGeometry args={[width * 0.92, 0.12, 0.02]} />
            <meshStandardMaterial color="#B08D5B" roughness={0.8} />
          </mesh>

          {/* Interlocking Diamond Lozenges (ក្បាច់ចង្វាយពោធិ Kbach Changva Por) */}
          {lozenges.map((lx, idx) => (
            <group key={`lozenge-${sIdx}-${idx}`} position={[lx, -0.05, depth / 2 + 0.035]}>
              <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
                <boxGeometry args={[0.18, 0.18, 0.03]} />
                <meshStandardMaterial color="#CDB082" roughness={0.76} />
              </mesh>
              {/* Inner Diamond Petal Relief */}
              <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.012]}>
                <boxGeometry args={[0.11, 0.11, 0.02]} />
                <meshStandardMaterial color="#DFC090" roughness={0.72} />
              </mesh>
              {/* Central Lotus Rosette Medallion (ផ្កាចន្ទន៍) */}
              <mesh position={[0, 0, 0.025]}>
                <sphereGeometry args={[0.038, 6, 6]} />
                <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
              </mesh>
            </group>
          ))}

          {/* Lower Running Lotus Bud Register */}
          <mesh position={[0, -height * 0.26, depth / 2 + 0.025]} castShadow>
            <boxGeometry args={[width * 0.92, 0.10, 0.02]} />
            <meshStandardMaterial color="#A4855E" roughness={0.84} />
          </mesh>

          {/* Fluted Vertical Edge Pilasters (សសរផ្អោបគែមជញ្ជាំង) */}
          {[-width / 2 + 0.12, width / 2 - 0.12].map((px, pIdx) => (
            <group key={`edge-pilaster-${pIdx}`} position={[px, 0, depth / 2 + 0.03]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.08, 0.09, height * 0.88, 8]} />
                <meshStandardMaterial color="#BA9966" roughness={0.82} />
              </mesh>
              {/* Capital & Base */}
              <mesh position={[0, height * 0.44, 0]} castShadow>
                <boxGeometry args={[0.22, 0.10, 0.18]} />
                <meshStandardMaterial color="#CDB082" roughness={0.78} />
              </mesh>
              <mesh position={[0, -height * 0.44, 0]} castShadow>
                <boxGeometry args={[0.22, 0.10, 0.18]} />
                <meshStandardMaterial color="#7D6145" roughness={0.88} />
              </mesh>
            </group>
          ))}

          {/* Upper Dentil Course Molding (ធ្មេញកណ្តុរ Dhmenh Kandoe) */}
          <mesh position={[0, height / 2 - 0.04, depth / 2 + 0.025]} castShadow>
            <boxGeometry args={[width, 0.08, 0.05]} />
            <meshStandardMaterial color="#CDB082" roughness={0.78} />
          </mesh>
          {/* Base Cyma Plinth Molding (ក្បាច់ឈូក Kbach Chhuk) */}
          <mesh position={[0, -height / 2 + 0.04, depth / 2 + 0.025]} castShadow>
            <boxGeometry args={[width, 0.09, 0.05]} />
            <meshStandardMaterial color="#614B35" roughness={0.92} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Monumental Angkorian Corbelled Prasat Lotus Spire (កំពូលផ្កាឈូកប្រាសាទ)
 * 3-tier stepped corbelled prasat with cardinal pediments, ribbed lotus bud crown, and golden finial
 */
function PrasatLotusSpire({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Base Architrave Plinth */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.44, 2.4]} />
        <meshStandardMaterial color="#8F714A" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.50, 0]} castShadow>
        <boxGeometry args={[3.0, 0.14, 2.6]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.84} />
      </mesh>

      {/* Tier 1 with Stepped Cruciform Bays & Cardinal Antefixes */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[2.4, 0.76, 2.0]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.82} />
      </mesh>
      <mesh position={[0, 1.40, 0]} castShadow>
        <boxGeometry args={[2.58, 0.14, 2.18]} />
        <meshStandardMaterial color="#DFC090" roughness={0.76} />
      </mesh>
      {/* 4 Cardinal Triangular Antefixes */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
        <group key={`spire-t1-${idx}`} rotation={[0, ang, 0]}>
          <mesh position={[0, 1.05, 1.12]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.55, 0.65, 4]} />
            <meshStandardMaterial color="#CDB082" roughness={0.76} />
          </mesh>
        </group>
      ))}

      {/* Tier 2 */}
      <mesh position={[0, 1.82, 0]} castShadow>
        <boxGeometry args={[1.9, 0.70, 1.6]} />
        <meshStandardMaterial color="#B59668" roughness={0.82} />
      </mesh>
      <mesh position={[0, 2.22, 0]} castShadow>
        <boxGeometry args={[2.05, 0.12, 1.75]} />
        <meshStandardMaterial color="#DFC090" roughness={0.76} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
        <group key={`spire-t2-${idx}`} rotation={[0, ang, 0]}>
          <mesh position={[0, 1.88, 0.9]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.42, 0.55, 4]} />
            <meshStandardMaterial color="#C8A978" roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* Tier 3 */}
      <mesh position={[0, 2.58, 0]} castShadow>
        <boxGeometry args={[1.45, 0.60, 1.25]} />
        <meshStandardMaterial color="#C0A170" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.92, 0]} castShadow>
        <boxGeometry args={[1.58, 0.10, 1.38]} />
        <meshStandardMaterial color="#D6B785" roughness={0.76} />
      </mesh>

      {/* Lotus Neck Collar (កញ្ចឹងឈូក) */}
      <mesh position={[0, 3.18, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.78, 0.42, 12]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.44, 0]} castShadow>
        <cylinderGeometry args={[0.82, 0.60, 0.18, 12]} />
        <meshStandardMaterial color="#D6B785" roughness={0.74} />
      </mesh>

      {/* Ribbed Lotus Bud Crown (ផ្កាឈូកក្រពុំ) */}
      <mesh position={[0, 4.02, 0]} castShadow>
        <cylinderGeometry args={[0.92, 0.70, 0.98, 12]} />
        <meshStandardMaterial color="#D4B584" roughness={0.75} />
      </mesh>
      <mesh position={[0, 4.95, 0]} castShadow>
        <coneGeometry args={[0.86, 1.35, 12]} />
        <meshStandardMaterial color="#DFC090" roughness={0.72} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
        <group key={`spire-rib-${idx}`} rotation={[0, ang, 0]}>
          <mesh position={[0, 4.45, 0.72]} rotation={[0.18, 0, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.09, 1.25, 6]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.45} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Golden Kalasha Finial Spire */}
      <mesh position={[0, 5.75, 0]} castShadow>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.8} />
      </mesh>
      <mesh position={[0, 6.08, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.18, 0.38, 8]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.75} />
      </mesh>
      {/* Royal Chatra Ring */}
      <mesh position={[0, 6.32, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 12]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[0, 6.72, 0]}>
        <cylinderGeometry args={[0.025, 0.09, 0.85, 8]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[0, 7.22, 0]}>
        <sphereGeometry args={[0.10, 10, 10]} />
        <meshStandardMaterial
          color="#FEF08A"
          emissive="#F59E0B"
          emissiveIntensity={0.85}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

/**
 * Turned Sandstone Baluster Window (បង្អួចជើងទៀន)
 */
function TurnedBalusterWindow({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Window Embrasures & Sill */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.78, 1.25, 0.28]} />
        <meshStandardMaterial color="#4A3420" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.64, 0.04]} castShadow>
        <boxGeometry args={[0.88, 0.12, 0.36]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.64, 0.04]} castShadow>
        <boxGeometry args={[0.88, 0.12, 0.36]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.86} />
      </mesh>

      {/* Three Turned Sandstone Balusters (បង្អួចជើងទៀន) */}
      {[-0.22, 0, 0.22].map((bx, bIdx) => (
        <group key={`baluster-${bIdx}`} position={[bx, 0, 0.04]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.045, 1.05, 8]} />
            <meshStandardMaterial color="#B08D5B" roughness={0.82} />
          </mesh>
          {/* Upper Turned Bead Ring */}
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.072, 0.072, 0.08, 8]} />
            <meshStandardMaterial color="#DFC090" roughness={0.76} />
          </mesh>
          {/* Middle Turned Bead Ring */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.12, 8]} />
            <meshStandardMaterial color="#D97706" roughness={0.65} />
          </mesh>
          {/* Lower Turned Bead Ring */}
          <mesh position={[0, -0.26, 0]}>
            <cylinderGeometry args={[0.072, 0.072, 0.08, 8]} />
            <meshStandardMaterial color="#DFC090" roughness={0.76} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Armed Temple Dvarapala Guardian Sentinel (អ្នកយាមទ្វារប្រាសាទ)
 */
function DvarapalaGuardianSentinel({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Octagonal Stepped Lotus Pedestal */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.56, 0.3, 8]} />
        <meshStandardMaterial color="#614B35" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.33, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.46, 0.12, 8]} />
        <meshStandardMaterial color="#8F714A" roughness={0.86} />
      </mesh>

      {/* Muscular Armored Legs */}
      <mesh position={[-0.14, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.68, 8]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.84} />
      </mesh>
      <mesh position={[0.14, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.68, 8]} />
        <meshStandardMaterial color="#9C7E54" roughness={0.84} />
      </mesh>

      {/* Royal Sampot Skirt & Belt Drape */}
      <mesh position={[0, 1.08, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.25, 0.38, 8]} />
        <meshStandardMaterial color="#B08D5B" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.94, 0.18]} castShadow>
        <boxGeometry args={[0.16, 0.32, 0.06]} />
        <meshStandardMaterial color="#D97706" roughness={0.65} />
      </mesh>

      {/* Muscular Torso with Crossed Sangvar Sashes */}
      <mesh position={[0, 1.44, 0]} castShadow>
        <cylinderGeometry args={[0.21, 0.19, 0.46, 8]} />
        <meshStandardMaterial color="#CDB082" roughness={0.8} />
      </mesh>
      {/* Gold Armlets and Torque Necklace */}
      <mesh position={[0, 1.62, 0.02]} castShadow>
        <torusGeometry args={[0.16, 0.035, 6, 12]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.35} metalness={0.6} />
      </mesh>

      {/* Heroic Fierce Guardian Head & Mustache */}
      <mesh position={[0, 1.84, 0.02]} castShadow>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#BFA06C" roughness={0.78} />
      </mesh>
      {/* Tiered Royal Mokot Crown */}
      <mesh position={[0, 2.12, 0.02]} castShadow>
        <coneGeometry args={[0.11, 0.36, 6]} />
        <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Heavy Guardian Mace (Gada / ដំបងពេជ្រ) resting vertically */}
      <group position={[0.26, 0.95, 0.2]}>
        {/* Mace Shaft */}
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.45, 8]} />
          <meshStandardMaterial color="#4A3420" roughness={0.75} metalness={0.4} />
        </mesh>
        {/* Mace Fluted Head */}
        <mesh position={[0, 0.62, 0]} castShadow>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#D97706" roughness={0.35} metalness={0.65} />
        </mesh>
        <mesh position={[0, 0.8, 0]} castShadow>
          <coneGeometry args={[0.07, 0.18, 6]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Organic Banyan Strangler Fig Root Cluster (ឫសឈើប្រាសាទតាព្រហ្ម/អង្គរវត្ត)
 */
function AncientBanyanRoots({
  position,
}: {
  position: [number, number, number];
}) {
  const rootColor = '#5C4430';
  return (
    <group position={position}>
      {/* Over-arch Cascading Main Root Trunk */}
      <mesh position={[0, 4.8, 0.58]} rotation={[0, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 2.8, 8]} />
        <meshStandardMaterial color={rootColor} roughness={0.92} />
      </mesh>
      {/* Left Pier Root Tendril descending into pavement */}
      <mesh position={[-1.9, 2.8, 0.52]} rotation={[0.12, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 3.4, 8]} />
        <meshStandardMaterial color={rootColor} roughness={0.92} />
      </mesh>
      <mesh position={[-1.75, 1.1, 0.56]} rotation={[-0.08, 0, 0.12]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 2.2, 8]} />
        <meshStandardMaterial color={rootColor} roughness={0.92} />
      </mesh>

      {/* Right Pier Root Tendril descending into pavement */}
      <mesh position={[1.9, 2.8, 0.52]} rotation={[0.12, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 3.4, 8]} />
        <meshStandardMaterial color={rootColor} roughness={0.92} />
      </mesh>
      <mesh position={[1.75, 1.1, 0.56]} rotation={[-0.08, 0, -0.12]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 2.2, 8]} />
        <meshStandardMaterial color={rootColor} roughness={0.92} />
      </mesh>

      {/* Crevice Foliage Clumps */}
      <mesh position={[-1.85, 4.4, 0.62]} castShadow>
        <sphereGeometry args={[0.26, 6, 6]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.85} />
      </mesh>
      <mesh position={[1.85, 4.4, 0.62]} castShadow>
        <sphereGeometry args={[0.26, 6, 6]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.85} />
      </mesh>
    </group>
  );
}

/**
 * Stage 2 Lesson 2: Careful Pairs (គូប្រយ័ត្ន)
 * Twin ceremonial stone lanterns that ignite in unison as confusing consonant pairs are typed accurately
 */
function CarefulPairsTwinLanterns({
  completedCount = 0,
  streak = 0,
  incorrectCount = 0,
  isActiveStage = false,
  isUnlocked = false,
}: {
  completedCount?: number;
  streak?: number;
  incorrectCount?: number;
  isActiveStage?: boolean;
  isUnlocked?: boolean;
}) {
  const completedPairs = Math.floor(completedCount / 2);
  const prevIncorrectRef = useRef(incorrectCount);
  const errorFlashRef = useRef(0);
  const leftFlameRef = useRef<THREE.MeshStandardMaterial>(null);
  const rightFlameRef = useRef<THREE.MeshStandardMaterial>(null);
  const leftLightRef = useRef<THREE.PointLight>(null);
  const rightLightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (isActiveStage && incorrectCount > prevIncorrectRef.current) {
      errorFlashRef.current = 1.0;
    }
    prevIncorrectRef.current = incorrectCount;

    if (errorFlashRef.current > 0) {
      errorFlashRef.current = Math.max(0, errorFlashRef.current - delta * 3.5);
    }

    const flameIntensity = isUnlocked
      ? 2.2 + Math.sin(time * 4) * 0.3
      : errorFlashRef.current > 0.1
      ? 0.4
      : 0.8 + Math.min(streak * 0.15, 1.2) + Math.min(completedPairs * 0.12, 1.0) + Math.sin(time * 3.5) * 0.15;

    const flameColor = isUnlocked
      ? '#38BDF8'
      : errorFlashRef.current > 0.1
      ? '#EF4444'
      : streak >= 3
      ? '#FBBF24'
      : '#F59E0B';

    if (leftFlameRef.current) {
      leftFlameRef.current.color.set(flameColor);
      leftFlameRef.current.emissive.set(flameColor);
      leftFlameRef.current.emissiveIntensity = flameIntensity;
    }
    if (rightFlameRef.current) {
      rightFlameRef.current.color.set(flameColor);
      rightFlameRef.current.emissive.set(flameColor);
      rightFlameRef.current.emissiveIntensity = flameIntensity;
    }
    if (leftLightRef.current) {
      leftLightRef.current.color.set(flameColor);
      leftLightRef.current.intensity = flameIntensity * 1.5;
    }
    if (rightLightRef.current) {
      rightLightRef.current.color.set(flameColor);
      rightLightRef.current.intensity = flameIntensity * 1.5;
    }
  });

  return (
    <group position={[0, 0, -1.2]}>
      {[-1.65, 1.65].map((lx, idx) => (
        <group key={`pair-lantern-${idx}`} position={[lx, 0.22, 0]}>
          {/* Stepped Octagonal Plinth */}
          <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.38, 0.46, 0.32, 8]} />
            <meshStandardMaterial color="#6B5037" roughness={0.88} />
          </mesh>
          <mesh position={[0, 0.36, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.38, 0.14, 8]} />
            <meshStandardMaterial color="#8A6A48" roughness={0.84} />
          </mesh>

          {/* Fluted Lantern Shaft with 8 Paired Niches */}
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 1.05, 8]} />
            <meshStandardMaterial color="#A48259" roughness={0.82} />
          </mesh>

          {/* 8 Running Paired Tier Rings */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((pIdx) => {
            const isPairLit = isUnlocked || pIdx < completedPairs;
            return (
              <mesh key={`ring-${pIdx}`} position={[0, 0.52 + pIdx * 0.11, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.04, 8]} />
                <meshStandardMaterial
                  color={isPairLit ? '#38BDF8' : '#5C442F'}
                  emissive={isPairLit ? '#0284C7' : '#000000'}
                  emissiveIntensity={isPairLit ? 1.4 : 0}
                  roughness={0.3}
                />
              </mesh>
            );
          })}

          {/* Ceremonial Fire Bowl / Brazier */}
          <mesh position={[0, 1.58, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.2, 0.24, 8]} />
            <meshStandardMaterial color="#B58F5C" roughness={0.78} />
          </mesh>

          {/* Sacred Flame Core */}
          <mesh position={[0, 1.76, 0]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial
              ref={idx === 0 ? leftFlameRef : rightFlameRef}
              color="#F59E0B"
              emissive="#F59E0B"
              emissiveIntensity={1.0}
              roughness={0.15}
            />
          </mesh>

          {/* Golden Flame Crown Spike */}
          <mesh position={[0, 1.94, 0]}>
            <coneGeometry args={[0.08, 0.22, 6]} />
            <meshStandardMaterial
              color="#F59E0B"
              emissive="#F59E0B"
              emissiveIntensity={0.8}
            />
          </mesh>

          <pointLight
            ref={idx === 0 ? leftLightRef : rightLightRef}
            position={[0, 1.82, 0]}
            color="#F59E0B"
            intensity={1.5}
            distance={5.5}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Barrier 2: Cruciform Inner Terrace Gopura (គោបុរៈថ្នាក់កណ្តាល រាងកាកបាទ) at Z = 16
 * Elevated terrace, guardian Singha lions, bas-relief gallery wings and sliding carved monoliths
 */
function TwinStonesChallenge({
  stageIndex,
  status,
  isActiveStage,
  isLocked,
  streak = 0,
  completedCount = 0,
  incorrectCount = 0,
  onOpeningFinished,
  lessonId,
  stageId,
}: StageBarrierProps) {
  const leftMonolithRef = useRef<THREE.Group>(null);
  const rightMonolithRef = useRef<THREE.Group>(null);
  const runeGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const leftRuneStripRef = useRef<THREE.MeshStandardMaterial>(null);
  const rightRuneStripRef = useRef<THREE.MeshStandardMaterial>(null);

  const openProgressRef = useRef(status === 'open' ? 1 : 0);
  const finishedCalledRef = useRef(status === 'open');
  const currentTimeRef = useRef(0);
  const prevCompletedRef = useRef(completedCount);
  const prevIncorrectRef = useRef(incorrectCount);
  const correctFlashTime = useRef(-10);
  const incorrectFlashTime = useRef(-10);

  useEffect(() => {
    if (isActiveStage && completedCount > prevCompletedRef.current) {
      correctFlashTime.current = currentTimeRef.current;
      prevCompletedRef.current = completedCount;
    }
  }, [completedCount, isActiveStage]);

  useEffect(() => {
    if (isActiveStage && incorrectCount > prevIncorrectRef.current) {
      incorrectFlashTime.current = currentTimeRef.current;
      prevIncorrectRef.current = incorrectCount;
    }
  }, [incorrectCount, isActiveStage]);

  const sandstoneDark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#614B35', roughness: 0.92 }),
    [],
  );
  const sandstoneMedium = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7D6145', roughness: 0.88 }),
    [],
  );
  const sandstoneLight = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#9E7D5B', roughness: 0.84 }),
    [],
  );

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    currentTimeRef.current = time;

    const timeSinceCorrect = time - correctFlashTime.current;
    const timeSinceIncorrect = time - incorrectFlashTime.current;

    let emissiveIntensity = isLocked ? 0.15 : 0.6 + Math.sin(time * 3.2) * 0.2;
    let runeColor = isLocked ? '#64748B' : '#38BDF8';

    if (isActiveStage && timeSinceCorrect >= 0 && timeSinceCorrect < 0.4) {
      const factor = 1 - timeSinceCorrect / 0.4;
      emissiveIntensity += factor * 1.4;
      runeColor = streak >= 4 ? '#FDE047' : '#38BDF8';
    }
    if (isActiveStage && timeSinceIncorrect >= 0 && timeSinceIncorrect < 0.35) {
      const factor = 1 - timeSinceIncorrect / 0.35;
      emissiveIntensity += factor * 0.8;
      runeColor = '#EF4444';
    }

    if (runeGlowRef.current) {
      runeGlowRef.current.emissiveIntensity = emissiveIntensity;
      runeGlowRef.current.color.set(runeColor);
      runeGlowRef.current.emissive.set(runeColor);
    }
    if (leftRuneStripRef.current && rightRuneStripRef.current) {
      leftRuneStripRef.current.emissiveIntensity = emissiveIntensity;
      rightRuneStripRef.current.emissiveIntensity = emissiveIntensity;
      leftRuneStripRef.current.color.set(runeColor);
      rightRuneStripRef.current.color.set(runeColor);
      leftRuneStripRef.current.emissive.set(runeColor);
      rightRuneStripRef.current.emissive.set(runeColor);
    }

    if (status === 'opening' || status === 'open') {
      const speed = 0.7;
      openProgressRef.current = Math.min(1, openProgressRef.current + delta * speed);
      const t = openProgressRef.current;
      const ease = 1 - Math.pow(1 - t, 3);
      const slideOffset = ease * 1.75;
      const tremor = t < 0.2 ? Math.sin(time * 45) * 0.015 * (1 - t / 0.2) : 0;

      if (leftMonolithRef.current) {
        leftMonolithRef.current.position.x = -0.95 - slideOffset + tremor;
      }
      if (rightMonolithRef.current) {
        rightMonolithRef.current.position.x = 0.95 + slideOffset - tremor;
      }

      if (openProgressRef.current >= 1 && !finishedCalledRef.current) {
        finishedCalledRef.current = true;
        onOpeningFinished?.();
      }
    } else {
      openProgressRef.current = 0;
      finishedCalledRef.current = false;
      if (leftMonolithRef.current) leftMonolithRef.current.position.x = -0.95;
      if (rightMonolithRef.current) rightMonolithRef.current.position.x = 0.95;
    }
  });

  const stageZ = getStagePositionZ(stageIndex);

  return (
    <group position={[0, 0, stageZ]}>
      {/* ===== 1. ELEVATED CRUCIFORM TERRACE PLINTH (ថ្នាក់កាកបាទ) ===== */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[9.4, 0.12, 5.4]} />
        <primitive object={sandstoneDark} attach="material" />
      </mesh>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <boxGeometry args={[8.8, 0.14, 4.8]} />
        <primitive object={sandstoneMedium} attach="material" />
      </mesh>
      {/* Stepped Causeway Curb Extension */}
      <mesh position={[0, 0.22, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.08, 4.2]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>

      {/* Guardian Singha Lions flanking the Terrace Approach */}
      <SinghaGuardianLion position={[-2.45, 0.22, -1.8]} rotation={[0, 0.15, 0]} scale={0.92} />
      <SinghaGuardianLion position={[2.45, 0.22, -1.8]} rotation={[0, -0.15, 0]} scale={0.92} />

      {/* ===== 2. FLANKING GALLERY WALLS WITH DEEP BAS-RELIEFS (ចម្លាក់លើផ្ទៃជញ្ជាំង) ===== */}
      {/* Left (North) Gallery Wing */}
      <group position={[-4.5, 0, 0]}>
        <WallBasReliefRegister
          width={4.2}
          height={3.6}
          depth={0.92}
          position={[0, 2.0, 0]}
        />
        {/* Recessed Devata Niche */}
        <DevataWallNiche position={[0.7, 0.25, -0.46]} rotation={[0, Math.PI, 0]} />
        {/* Turned Sandstone Baluster Window */}
        <TurnedBalusterWindow position={[-0.95, 2.05, 0]} />

        {/* Gallery Roof Cornice & Ridge */}
        <mesh position={[0, 3.95, 0]} castShadow>
          <boxGeometry args={[4.4, 0.35, 1.15]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        <mesh position={[0, 4.25, 0]} castShadow>
          <boxGeometry args={[3.8, 0.28, 0.95]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Ridge Flame Finials */}
        {[-1.4, 0, 1.4].map((fx, fIdx) => (
          <mesh key={`wing-l-finial-${fIdx}`} position={[fx, 4.52, 0]} castShadow>
            <coneGeometry args={[0.09, 0.32, 6]} />
            <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Right (South) Gallery Wing */}
      <group position={[4.5, 0, 0]}>
        <WallBasReliefRegister
          width={4.2}
          height={3.6}
          depth={0.92}
          position={[0, 2.0, 0]}
        />
        {/* Recessed Devata Niche */}
        <DevataWallNiche position={[-0.7, 0.25, -0.46]} rotation={[0, Math.PI, 0]} />
        {/* Turned Sandstone Baluster Window */}
        <TurnedBalusterWindow position={[0.95, 2.05, 0]} />

        {/* Gallery Roof Cornice & Ridge */}
        <mesh position={[0, 3.95, 0]} castShadow>
          <boxGeometry args={[4.4, 0.35, 1.15]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        <mesh position={[0, 4.25, 0]} castShadow>
          <boxGeometry args={[3.8, 0.28, 0.95]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Ridge Flame Finials */}
        {[-1.4, 0, 1.4].map((fx, fIdx) => (
          <mesh key={`wing-r-finial-${fIdx}`} position={[fx, 4.52, 0]} castShadow>
            <coneGeometry args={[0.09, 0.32, 6]} />
            <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ===== 3. MONUMENTAL PORTAL PIERS & SCULPTED KALA LINTEL ===== */}
      {/* Left Portal Pier */}
      <mesh position={[-2.05, 2.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.92, 4.1, 1.1]} />
        <primitive object={sandstoneDark} attach="material" />
      </mesh>
      {/* Left Fluted Pilaster Molding */}
      <mesh position={[-1.75, 2.15, -0.48]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 3.9, 8]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>

      {/* Right Portal Pier */}
      <mesh position={[2.05, 2.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.92, 4.1, 1.1]} />
        <primitive object={sandstoneDark} attach="material" />
      </mesh>
      {/* Right Fluted Pilaster Molding */}
      <mesh position={[1.75, 2.15, -0.48]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 3.9, 8]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>

      {/* Spanning Architrave Beam */}
      <mesh position={[0, 4.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.44, 1.2]} />
        <primitive object={sandstoneMedium} attach="material" />
      </mesh>
      {/* Carved Sandstone Kala / Rahu Lintel */}
      <mesh position={[0, 4.28, -0.58]} castShadow>
        <boxGeometry args={[3.8, 0.48, 0.16]} />
        <meshStandardMaterial color="#CDB082" roughness={0.78} />
      </mesh>
      {/* Kala Monster Mask Medallion */}
      <mesh position={[0, 4.32, -0.68]} castShadow>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#D97706" roughness={0.45} metalness={0.4} />
      </mesh>
      {/* Undulating Makara Garlands */}
      <mesh position={[-0.85, 4.22, -0.65]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[1.3, 0.12, 0.08]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>
      <mesh position={[0.85, 4.22, -0.65]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[1.3, 0.12, 0.08]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>

      {/* Tiered Corbelled Triangular Pediment (ហោជាងបីថ្នាក់) */}
      <mesh position={[0, 4.76, 0]} castShadow>
        <boxGeometry args={[3.6, 0.52, 1.15]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>
      <mesh position={[0, 5.20, 0]} castShadow>
        <boxGeometry args={[2.6, 0.42, 1.0]} />
        <primitive object={sandstoneMedium} attach="material" />
      </mesh>

      {/* Monumental Angkorian Prasat Lotus Spire atop Cruciform Gopura */}
      <PrasatLotusSpire position={[0, 5.35, 0]} scale={0.78} />

      {/* ===== 4. SLIDING CARVED TEMPLE MONOLITHS (LEFT & RIGHT) ===== */}
      {/* Left Sliding Monolith Gate */}
      <group ref={leftMonolithRef} position={[-0.95, 0, 0]}>
        {/* Main Monolith Body with Layered Beveled Frame */}
        <mesh position={[0, 2.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.86, 3.8, 0.68]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Raised Outer Molding Border */}
        <mesh position={[0, 2.05, -0.34]} receiveShadow>
          <boxGeometry args={[1.72, 3.6, 0.06]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        {/* Recessed Carved Glyph Inscription Channel */}
        <mesh position={[0, 2.05, -0.38]}>
          <boxGeometry args={[1.35, 3.2, 0.04]} />
          <meshStandardMaterial color="#4A3420" roughness={0.92} />
        </mesh>
        {/* Ancient Bas-Relief Rosette Accents */}
        {[1.2, 2.0, 2.8].map((ry, rIdx) => (
          <mesh key={`l-rosette-${rIdx}`} position={[0.42, ry, -0.41]}>
            <sphereGeometry args={[0.065, 6, 6]} />
            <meshStandardMaterial color="#D97706" roughness={0.45} metalness={0.4} />
          </mesh>
        ))}
        {/* Central Luminous Rune Strip */}
        <mesh position={[0.12, 2.05, -0.42]}>
          <boxGeometry args={[0.26, 2.6, 0.05]} />
          <meshStandardMaterial
            ref={leftRuneStripRef}
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={0.65}
            roughness={0.25}
          />
        </mesh>
        {/* Monolith Stepped Crown */}
        <mesh position={[0, 4.05, 0]} castShadow>
          <boxGeometry args={[1.92, 0.22, 0.74]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        <mesh position={[0, 4.28, 0]} castShadow>
          <coneGeometry args={[0.65, 0.38, 4]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
      </group>

      {/* Right Sliding Monolith Gate */}
      <group ref={rightMonolithRef} position={[0.95, 0, 0]}>
        {/* Main Monolith Body with Layered Beveled Frame */}
        <mesh position={[0, 2.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.86, 3.8, 0.68]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Raised Outer Molding Border */}
        <mesh position={[0, 2.05, -0.34]} receiveShadow>
          <boxGeometry args={[1.72, 3.6, 0.06]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        {/* Recessed Carved Glyph Inscription Channel */}
        <mesh position={[0, 2.05, -0.38]}>
          <boxGeometry args={[1.35, 3.2, 0.04]} />
          <meshStandardMaterial color="#4A3420" roughness={0.92} />
        </mesh>
        {/* Ancient Bas-Relief Rosette Accents */}
        {[1.2, 2.0, 2.8].map((ry, rIdx) => (
          <mesh key={`r-rosette-${rIdx}`} position={[-0.42, ry, -0.41]}>
            <sphereGeometry args={[0.065, 6, 6]} />
            <meshStandardMaterial color="#D97706" roughness={0.45} metalness={0.4} />
          </mesh>
        ))}
        {/* Central Luminous Rune Strip */}
        <mesh position={[-0.12, 2.05, -0.42]}>
          <boxGeometry args={[0.26, 2.6, 0.05]} />
          <meshStandardMaterial
            ref={rightRuneStripRef}
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={0.65}
            roughness={0.25}
          />
        </mesh>
        {/* Monolith Stepped Crown */}
        <mesh position={[0, 4.05, 0]} castShadow>
          <boxGeometry args={[1.92, 0.22, 0.74]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        <mesh position={[0, 4.28, 0]} castShadow>
          <coneGeometry args={[0.65, 0.38, 4]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
      </group>

      {/* Stage 2 Interaction Lotus Altar (z = -2.4 relative -> z = 13.6 world) */}
      <StageLotusAltar
        position={[0, 0, -2.4]}
        isLocked={isLocked}
        status={status}
        accentColor="#38BDF8"
        runeRef={runeGlowRef}
      />

      {/* Stage 2 Lesson 2: Careful Pairs (គូប្រយ័ត្ន) Twin Lanterns */}
      {(stageId === 'w1-l2-s2' || (lessonId === 2 && (!stageId || stageId === 'w1-l2-s2'))) && (
        <CarefulPairsTwinLanterns
          completedCount={completedCount}
          streak={streak}
          incorrectCount={incorrectCount}
          isActiveStage={isActiveStage}
          isUnlocked={status === 'open' || status === 'opening'}
        />
      )}
    </group>
  );
}

const W1_L2_WORD_THRESHOLDS = [2, 4, 6, 8, 10, 12, 15, 19] as const;

/**
 * Stage 3 Lesson 2: Hill Steps (ជើងភ្នំ)
 * 8 ascending sacred sandstone steps with golden lotus carvings that rise towards the final Bakan sanctuary
 */
function HillStepsStaircase({
  completedCount = 0,
  streak = 0,
  isUnlocked = false,
}: {
  completedCount?: number;
  streak?: number;
  isUnlocked?: boolean;
}) {
  const sandstoneDark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#684E34', roughness: 0.92 }), []);
  const sandstoneLit = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9E7D5B', roughness: 0.82 }), []);

  return (
    <group position={[0, 0, 0.6]}>
      {W1_L2_WORD_THRESHOLDS.map((thresh, idx) => {
        const isStepActive = isUnlocked || completedCount >= thresh;
        const isNextStep = !isUnlocked && completedCount < thresh && (idx === 0 || completedCount >= W1_L2_WORD_THRESHOLDS[idx - 1]);
        const zPos = -0.8 + idx * 0.36;
        const riserHeight = 0.08 + idx * 0.06;
        const elevation = isStepActive ? riserHeight : isNextStep ? riserHeight * 0.6 : 0.04;

        return (
          <group key={`hill-step-${idx}`} position={[0, elevation, zPos]}>
            {/* Sandstone Step Tread */}
            <mesh receiveShadow castShadow>
              <boxGeometry args={[3.4, 0.12, 0.34]} />
              <primitive object={isStepActive ? sandstoneLit : sandstoneDark} attach="material" />
            </mesh>

            {/* Inlaid Lotus Petal Frieze / Golden Step Inscription */}
            <mesh position={[0, 0.065, 0]}>
              <boxGeometry args={[2.8, 0.02, 0.18]} />
              <meshStandardMaterial
                color={isStepActive ? '#FBBF24' : isNextStep ? '#F59E0B' : '#523C27'}
                emissive={isStepActive ? '#D97706' : isNextStep ? '#B45309' : '#000000'}
                emissiveIntensity={isStepActive ? 1.5 + Math.min(streak * 0.12, 0.8) : isNextStep ? 0.7 : 0}
                roughness={0.25}
              />
            </mesh>

            {/* Lateral Step Guard Curb Blocks with Lotus Flame Finials */}
            {[-1.6, 1.6].map((cx, cIdx) => (
              <group key={`curb-${cIdx}`} position={[cx, 0.08, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.2, 0.16, 0.34]} />
                  <meshStandardMaterial color="#8F6E47" roughness={0.85} />
                </mesh>
                {isStepActive && (
                  <mesh position={[0, 0.14, 0]}>
                    <coneGeometry args={[0.06, 0.14, 6]} />
                    <meshStandardMaterial
                      color="#FBBF24"
                      emissive="#D97706"
                      emissiveIntensity={1.0}
                    />
                  </mesh>
                )}
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}

/**
 * Barrier 3: Inner Bakan Sanctuary Gateway (ក្លោងទ្វាររួចបាកាណ) at Z = 26
 * The climactic portal to the uppermost sanctum of Angkor Wat with tiered pediments,
 * soaring lotus tower spire, armed Dvarapala sentinels, Ta Prohm banyan roots,
 * and deeply detailed bas-relief gallery walls.
 */
function JunglePathChallenge({
  stageIndex,
  status,
  isActiveStage,
  isLocked,
  streak = 0,
  completedCount = 0,
  incorrectCount = 0,
  onOpeningFinished,
  lessonId,
  stageId,
}: StageBarrierProps) {
  const leftGateRef = useRef<THREE.Group>(null);
  const rightGateRef = useRef<THREE.Group>(null);
  const runeGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const portalLightRef = useRef<THREE.PointLight>(null);

  const openProgressRef = useRef(status === 'open' ? 1 : 0);
  const finishedCalledRef = useRef(status === 'open');
  const currentTimeRef = useRef(0);
  const prevCompletedRef = useRef(completedCount);
  const prevIncorrectRef = useRef(incorrectCount);
  const correctFlashTime = useRef(-10);
  const incorrectFlashTime = useRef(-10);

  useEffect(() => {
    if (isActiveStage && completedCount > prevCompletedRef.current) {
      correctFlashTime.current = currentTimeRef.current;
      prevCompletedRef.current = completedCount;
    }
  }, [completedCount, isActiveStage]);

  useEffect(() => {
    if (isActiveStage && incorrectCount > prevIncorrectRef.current) {
      incorrectFlashTime.current = currentTimeRef.current;
      prevIncorrectRef.current = incorrectCount;
    }
  }, [incorrectCount, isActiveStage]);

  const sandstoneDark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#614B35', roughness: 0.92 }),
    [],
  );
  const sandstoneMedium = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7D6145', roughness: 0.88 }),
    [],
  );
  const sandstoneLight = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#9E7D5B', roughness: 0.84 }),
    [],
  );
  const ancientTeakWood = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#4A3420', roughness: 0.78 }),
    [],
  );
  const bronzeTrim = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#D97706', metalness: 0.6, roughness: 0.35 }),
    [],
  );

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    currentTimeRef.current = time;

    const timeSinceCorrect = time - correctFlashTime.current;
    const timeSinceIncorrect = time - incorrectFlashTime.current;

    let emissiveIntensity = isLocked ? 0.15 : 0.65 + Math.sin(time * 3.0) * 0.22;
    let runeColor = isLocked ? '#64748B' : '#34D399';

    if (isActiveStage && timeSinceCorrect >= 0 && timeSinceCorrect < 0.4) {
      const factor = 1 - timeSinceCorrect / 0.4;
      emissiveIntensity += factor * 1.5;
      runeColor = streak >= 4 ? '#FBBF24' : '#34D399';
    }
    if (isActiveStage && timeSinceIncorrect >= 0 && timeSinceIncorrect < 0.35) {
      const factor = 1 - timeSinceIncorrect / 0.35;
      emissiveIntensity += factor * 0.8;
      runeColor = '#EF4444';
    }

    if (runeGlowRef.current) {
      runeGlowRef.current.emissiveIntensity = emissiveIntensity;
      runeGlowRef.current.color.set(runeColor);
      runeGlowRef.current.emissive.set(runeColor);
    }

    if (status === 'opening' || status === 'open') {
      const speed = 0.65;
      openProgressRef.current = Math.min(1, openProgressRef.current + delta * speed);
      const t = openProgressRef.current;
      const ease = 1 - Math.pow(1 - t, 3);
      const maxAngle = Math.PI * 0.48;

      if (leftGateRef.current) {
        leftGateRef.current.rotation.y = ease * maxAngle;
      }
      if (rightGateRef.current) {
        rightGateRef.current.rotation.y = -ease * maxAngle;
      }
      if (portalLightRef.current) {
        portalLightRef.current.intensity = ease * 3.2;
      }

      if (openProgressRef.current >= 1 && !finishedCalledRef.current) {
        finishedCalledRef.current = true;
        onOpeningFinished?.();
      }
    } else {
      openProgressRef.current = 0;
      finishedCalledRef.current = false;
      if (leftGateRef.current) leftGateRef.current.rotation.y = 0;
      if (rightGateRef.current) rightGateRef.current.rotation.y = 0;
      if (portalLightRef.current) portalLightRef.current.intensity = 0;
    }
  });

  const stageZ = getStagePositionZ(stageIndex);

  return (
    <group position={[0, 0, stageZ]}>
      {/* Mystical Bakan Inner Sanctum Portal Light */}
      <pointLight
        ref={portalLightRef}
        position={[0, 2.8, 1.2]}
        color="#FEF08A"
        intensity={0}
        distance={16}
        decay={2}
      />

      {/* ===== 1. ELEVATED BAKAN TERRACE PLINTH ===== */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[10.2, 0.16, 5.6]} />
        <primitive object={sandstoneDark} attach="material" />
      </mesh>
      <mesh position={[0, 0.22, 0]} receiveShadow>
        <boxGeometry args={[9.4, 0.16, 4.8]} />
        <primitive object={sandstoneMedium} attach="material" />
      </mesh>

      {/* ===== 2. HEROIC DVARAPALA SENTINELS GUARDING ENTRANCE ===== */}
      <DvarapalaGuardianSentinel position={[-2.35, 0.22, -0.75]} rotation={[0, 0.25, 0]} />
      <DvarapalaGuardianSentinel position={[2.35, 0.22, -0.75]} rotation={[0, -0.25, 0]} />

      {/* ===== 3. FLANKING BAS-RELIEF GALLERY WALLS ===== */}
      {/* Left Gallery Wing */}
      <group position={[-4.7, 0, 0]}>
        <WallBasReliefRegister
          width={4.4}
          height={4.2}
          depth={0.96}
          position={[0, 2.3, 0]}
        />
        {/* Turned Sandstone Baluster Window */}
        <DevataWallNiche position={[0.85, 0.45, -0.48]} rotation={[0, Math.PI, 0]} />
        <TurnedBalusterWindow position={[-0.85, 2.3, 0]} />

        {/* Gallery Roof Cornice & Ridge */}
        <mesh position={[0, 4.45, 0]} castShadow>
          <boxGeometry args={[4.6, 0.38, 1.2]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        <mesh position={[0, 4.8, 0]} castShadow>
          <boxGeometry args={[4.0, 0.32, 1.0]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Ridge Flame Finials */}
        {[-1.5, 0, 1.5].map((fx, fIdx) => (
          <mesh key={`bakan-w-l-${fIdx}`} position={[fx, 5.12, 0]} castShadow>
            <coneGeometry args={[0.1, 0.35, 6]} />
            <primitive object={bronzeTrim} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Right Gallery Wing */}
      <group position={[4.7, 0, 0]}>
        <WallBasReliefRegister
          width={4.4}
          height={4.2}
          depth={0.96}
          position={[0, 2.3, 0]}
        />
        {/* Turned Sandstone Baluster Window */}
        <DevataWallNiche position={[-0.85, 0.45, -0.48]} rotation={[0, Math.PI, 0]} />
        <TurnedBalusterWindow position={[0.85, 2.3, 0]} />

        {/* Gallery Roof Cornice & Ridge */}
        <mesh position={[0, 4.45, 0]} castShadow>
          <boxGeometry args={[4.6, 0.38, 1.2]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        <mesh position={[0, 4.8, 0]} castShadow>
          <boxGeometry args={[4.0, 0.32, 1.0]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Ridge Flame Finials */}
        {[-1.5, 0, 1.5].map((fx, fIdx) => (
          <mesh key={`bakan-w-r-${fIdx}`} position={[fx, 5.12, 0]} castShadow>
            <coneGeometry args={[0.1, 0.35, 6]} />
            <primitive object={bronzeTrim} attach="material" />
          </mesh>
        ))}
      </group>

      {/* ===== 4. MONUMENTAL PORTAL PIERS & SCULPTED KALA ARCHITRAVE ===== */}
      {/* Left Portal Pier */}
      <mesh position={[-1.95, 2.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.96, 4.6, 1.15]} />
        <primitive object={sandstoneDark} attach="material" />
      </mesh>
      {/* Left Column Shaft Fluting */}
      <mesh position={[-1.62, 2.45, -0.52]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, 4.4, 8]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>

      {/* Right Portal Pier */}
      <mesh position={[1.95, 2.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.96, 4.6, 1.15]} />
        <primitive object={sandstoneDark} attach="material" />
      </mesh>
      {/* Right Column Shaft Fluting */}
      <mesh position={[1.62, 2.45, -0.52]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, 4.4, 8]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>

      {/* Spanning Architrave & Carved Kala Lintel */}
      <mesh position={[0, 4.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.9, 0.52, 1.25]} />
        <primitive object={sandstoneMedium} attach="material" />
      </mesh>
      {/* Sculpted Kala Lintel Relief */}
      <mesh position={[0, 4.85, -0.62]} castShadow>
        <boxGeometry args={[3.8, 0.52, 0.16]} />
        <meshStandardMaterial color="#CDB082" roughness={0.76} />
      </mesh>
      {/* Kala Guardian Face */}
      <mesh position={[0, 4.9, -0.72]} castShadow>
        <sphereGeometry args={[0.24, 8, 8]} />
        <primitive object={bronzeTrim} attach="material" />
      </mesh>

      {/* Multi-Tiered Bakan Corbelled Pediment (ហោជាងបីថ្នាក់រួចបាកាណ) */}
      <mesh position={[0, 5.4, 0]} castShadow>
        <boxGeometry args={[3.8, 0.58, 1.2]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>
      <mesh position={[0, 5.92, 0]} castShadow>
        <boxGeometry args={[2.8, 0.48, 1.05]} />
        <primitive object={sandstoneMedium} attach="material" />
      </mesh>

      {/* Towering Central Miniature Prasat Lotus Finial (កំពូលផ្កាឈូកបាកាណ) */}
      <PrasatLotusSpire position={[0, 6.1, 0]} scale={0.92} />

      {/* Ancient Ta Prohm Banyan Roots Embracing Archway */}
      <AncientBanyanRoots position={[0, 0, 0]} />

      {/* ===== 5. CARVED ANCIENT TEMPLE DOUBLE DOORS ===== */}
      {/* Left Double Door Leaf */}
      <group ref={leftGateRef} position={[-1.7, 0, 0]}>
        <mesh position={[0.82, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.66, 4.3, 0.22]} />
          <primitive object={ancientTeakWood} attach="material" />
        </mesh>
        {/* Recessed Carved Panel Field */}
        <mesh position={[0.82, 2.3, -0.12]}>
          <boxGeometry args={[1.32, 3.7, 0.05]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Embossed Bronze Lotus Studs (ផ្កាចន្ទន៍សំរឹទ្ធ) */}
        {[1.2, 2.3, 3.4].map((sy, sIdx) => (
          <mesh key={`l-stud-${sIdx}`} position={[0.82, sy, -0.16]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <primitive object={bronzeTrim} attach="material" />
          </mesh>
        ))}
        {/* Bronze Ring Handle */}
        <mesh position={[1.42, 2.3, -0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.1, 0.022, 6, 12]} />
          <primitive object={bronzeTrim} attach="material" />
        </mesh>
      </group>

      {/* Right Double Door Leaf */}
      <group ref={rightGateRef} position={[1.7, 0, 0]}>
        <mesh position={[-0.82, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.66, 4.3, 0.22]} />
          <primitive object={ancientTeakWood} attach="material" />
        </mesh>
        {/* Recessed Carved Panel Field */}
        <mesh position={[-0.82, 2.3, -0.12]}>
          <boxGeometry args={[1.32, 3.7, 0.05]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Embossed Bronze Lotus Studs (ផ្កាចន្ទន៍សំរឹទ្ធ) */}
        {[1.2, 2.3, 3.4].map((sy, sIdx) => (
          <mesh key={`r-stud-${sIdx}`} position={[-0.82, sy, -0.16]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <primitive object={bronzeTrim} attach="material" />
          </mesh>
        ))}
        {/* Bronze Ring Handle */}
        <mesh position={[-1.42, 2.3, -0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.1, 0.022, 6, 12]} />
          <primitive object={bronzeTrim} attach="material" />
        </mesh>
      </group>

      {/* Stage 3 Interaction Lotus Altar (z = -2.4 relative -> z = 23.6 world) */}
      <StageLotusAltar
        position={[0, 0, -2.4]}
        isLocked={isLocked}
        status={status}
        accentColor="#34D399"
        runeRef={runeGlowRef}
      />

      {/* Stage 3 Lesson 2: Hill Steps (ជើងភ្នំ) Ascending Stairway */}
      {(stageId === 'w1-l2-s3' || (lessonId === 2 && (!stageId || stageId === 'w1-l2-s3'))) && (
        <HillStepsStaircase
          completedCount={completedCount}
          streak={streak}
          isUnlocked={status === 'open' || status === 'opening'}
        />
      )}
    </group>
  );
}

/**
 * Inner Bakan Sanctuary Forecourt Dressing (ទីធ្លាបាកាណខាងក្នុង)
 * Elevated ceremonial terrace for Stages 4 & 5 leading directly to the 5-Tower Sanctuary Complex
 */
function InnerBakanSanctuaryForecourt() {
  const sandstoneDark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#614B35', roughness: 0.92 }),
    [],
  );
  const sandstoneMedium = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7D6145', roughness: 0.88 }),
    [],
  );
  const sandstoneLight = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#9E7D5B', roughness: 0.84 }),
    [],
  );

  return (
    <group position={[0, 0, 29.5]}>
      {/* 1. Grand Axial Flagstone Walkway connecting Stage 3 to Stages 4 & 5 */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[5.2, 0.16, 6.2]} />
        <primitive object={sandstoneDark} attach="material" />
      </mesh>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.08, 5.8]} />
        <primitive object={sandstoneMedium} attach="material" />
      </mesh>

      {/* 2. Guardian Singha Lions at the Sanctum Approach Steps */}
      <SinghaGuardianLion position={[-2.4, 0.18, -1.8]} rotation={[0, 0.35, 0]} scale={0.95} />
      <SinghaGuardianLion position={[2.4, 0.18, -1.8]} rotation={[0, -0.35, 0]} scale={0.95} />

      {/* 3. Ceremonial Stone Incense Braziers with Glowing Amber Embers */}
      {[-2.2, 2.2].map((bx, idx) => (
        <group key={`brazier-${idx}`} position={[bx, 0.18, 1.2]}>
          <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.32, 0.42, 0.44, 8]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.44, 0.26, 0.18, 8]} />
            <meshStandardMaterial color="#BFA06C" roughness={0.78} />
          </mesh>
          {/* Glowing Embers */}
          <mesh position={[0, 0.56, 0]}>
            <sphereGeometry args={[0.16, 6, 6]} />
            <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={1.2} />
          </mesh>
          <pointLight position={[0, 0.65, 0]} color="#F59E0B" intensity={1.2} distance={4} />
        </group>
      ))}

      {/* 4. Royal Khmer Victory Banners (ទង់ជ័យខ្មែរ Tung Chey) framing the Meru Vista */}
      {[-2.5, 2.5].map((tx, tIdx) => (
        <group key={`tung-${tIdx}`} position={[tx, 0.18, 2.2]}>
          {/* Flagstaff Pole */}
          <mesh position={[0, 2.4, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.045, 4.8, 8]} />
            <meshStandardMaterial color="#A16207" metalness={0.4} roughness={0.6} />
          </mesh>
          {/* Golden Spearhead Finial */}
          <mesh position={[0, 4.95, 0]} castShadow>
            <coneGeometry args={[0.08, 0.32, 6]} />
            <meshStandardMaterial color="#FBBF24" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Flowing Silk Banner Ribbon */}
          <mesh
            position={[tIdx === 0 ? -0.28 : 0.28, 3.8, 0]}
            rotation={[0, 0, tIdx === 0 ? 0.08 : -0.08]}
            castShadow
          >
            <boxGeometry args={[0.48, 1.8, 0.03]} />
            <meshStandardMaterial color="#D97706" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

type StageChallengesProps = {
  stageStatuses: GateStatus[];
  activeStageIndex: number;
  streak?: number;
  completedCount?: number;
  incorrectCount?: number;
  onStageOpeningFinished?: (stageIndex: number) => void;
  lessonId?: number;
  stageId?: string;
};

export default function StageChallenges({
  stageStatuses,
  activeStageIndex,
  streak = 0,
  completedCount = 0,
  incorrectCount = 0,
  onStageOpeningFinished,
  lessonId,
  stageId,
}: StageChallengesProps) {
  const barrierStatuses = getPhysicalBarrierStatuses(stageStatuses);
  const activeBarrierIndex = getStageBarrierIndex(activeStageIndex, stageStatuses.length);
  const stage2Status = barrierStatuses[1] ?? 'closed';
  const stage3Status = barrierStatuses[2] ?? 'closed';
  const stage1Open = barrierStatuses[0] === 'open';
  const stage2Open = barrierStatuses[1] === 'open';
  const barrier2StageIdx = stageStatuses.length === 5 ? 3 : 1;
  const barrier3StageIdx = stageStatuses.length === 5 ? 4 : 2;

  return (
    <group>
      {barrierStatuses.length > 1 && (
        <TwinStonesChallenge
          stageIndex={1}
          status={stage2Status}
          isActiveStage={activeBarrierIndex === 1}
          isLocked={!stage1Open}
          streak={activeBarrierIndex === 1 ? streak : 0}
          completedCount={activeBarrierIndex === 1 ? completedCount : 0}
          incorrectCount={activeBarrierIndex === 1 ? incorrectCount : 0}
          onOpeningFinished={() => onStageOpeningFinished?.(barrier2StageIdx)}
          lessonId={lessonId}
          stageId={stageId}
        />
      )}

      {barrierStatuses.length > 2 && (
        <JunglePathChallenge
          stageIndex={2}
          status={stage3Status}
          isActiveStage={activeBarrierIndex === 2}
          isLocked={!stage2Open}
          streak={activeBarrierIndex === 2 ? streak : 0}
          completedCount={activeBarrierIndex === 2 ? completedCount : 0}
          incorrectCount={activeBarrierIndex === 2 ? incorrectCount : 0}
          onOpeningFinished={() => onStageOpeningFinished?.(barrier3StageIdx)}
          lessonId={lessonId}
          stageId={stageId}
        />
      )}

      {/* Ceremonial Forecourt Terrace for Stages 4 & 5 Vista */}
      <InnerBakanSanctuaryForecourt />
    </group>
  );
}
