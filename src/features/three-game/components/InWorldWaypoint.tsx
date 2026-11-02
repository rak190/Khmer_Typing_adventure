import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { GameMode, Position3D } from '../types';

type InWorldWaypointProps = {
  activeStageIndex: number;
  playerPositionRef: MutableRefObject<Position3D>;
  targetPosition: Position3D;
  stationTitleKh: string;
  onInteract?: () => void;
  mode: GameMode;
};

export default function InWorldWaypoint({
  playerPositionRef,
  targetPosition,
  mode,
}: InWorldWaypointProps) {
  const beaconGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const diamondRef = useRef<THREE.Mesh>(null);
  const [isNear, setIsNear] = useState<boolean>(false);

  // Visible during exploration mode
  const isVisible = mode === 'exploration';

  useFrame(({ clock }) => {
    if (!isVisible) return;
    const time = clock.getElapsedTime();

    // Gentle floating bob & rotation
    if (diamondRef.current) {
      diamondRef.current.rotation.y = time * 1.8;
      diamondRef.current.position.y = 2.4 + Math.sin(time * 3.0) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -time * 1.4;
      const s = 1.0 + Math.sin(time * 4.0) * 0.08;
      ringRef.current.scale.set(s, s, s);
    }

    // Distance calculation to player inside useFrame
    const [px, , pz] = playerPositionRef.current;
    const [tx, , tz] = targetPosition;
    const dx = px - tx;
    const dz = pz - tz;
    const dist = Math.hypot(dx, dz);
    const near = dist <= 3.6;
    if (near !== isNear) {
      setIsNear(near);
    }
  });

  // Calculate ground rune trail points between player approach and target
  const runeTrailPoints = useMemo(() => {
    const points: Array<[number, number, number]> = [];
    const [tx, ty, tz] = targetPosition;
    for (let i = 1; i <= 4; i++) {
      points.push([tx, ty + 0.03, tz - i * 1.2]);
    }
    return points;
  }, [targetPosition]);

  return (
    <group position={targetPosition} visible={isVisible}>
      {/* 3D Floating Diamond / Lotus Beacon */}
      <group ref={beaconGroupRef}>
        {/* Outer glowing pulsing energy ring */}
        <mesh ref={ringRef} position={[0, 2.4, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <ringGeometry args={[0.35, 0.44, 20]} />
          <meshBasicMaterial
            color={isNear ? '#F59E0B' : '#38BDF8'}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Central rotating ancient gem / diamond */}
        <mesh ref={diamondRef} position={[0, 2.4, 0]} castShadow>
          <octahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial
            color={isNear ? '#FCD34D' : '#67E8F9'}
            emissive={isNear ? '#D97706' : '#0284C7'}
            emissiveIntensity={isNear ? 1.2 : 0.8}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Vertical beacon pillar beam */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.02, 0.06, 2.4, 12]} />
          <meshBasicMaterial
            color={isNear ? '#F59E0B' : '#38BDF8'}
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Warm glow light */}
        <pointLight
          color={isNear ? '#F59E0B' : '#38BDF8'}
          intensity={isNear ? 2.0 : 1.2}
          distance={3.5}
        />
      </group>

      {/* Ground Guiding Runes along the approach */}
      {runeTrailPoints.map((pt, idx) => (
        <mesh key={`rune-${idx}`} position={pt} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 16]} />
          <meshBasicMaterial
            color={isNear ? '#F59E0B' : '#0284C7'}
            transparent
            opacity={0.35 - idx * 0.06}
          />
        </mesh>
      ))}
    </group>
  );
}
