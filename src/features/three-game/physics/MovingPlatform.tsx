import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import * as THREE from 'three';
import type { Position3D } from '../types';

type MovingPlatformProps = {
  initialPosition: Position3D;
  axis?: 'x' | 'y' | 'z';
  amplitude?: number;
  speed?: number;
  size?: [number, number, number];
  theme?: 'sandstone' | 'lotus' | 'cloud' | 'obsidian';
};

const THEME_COLORS = {
  sandstone: { base: '#785A3C', top: '#A07C55' },
  lotus: { base: '#15803D', top: '#4ADE80' },
  cloud: { base: '#CBD5E1', top: '#F8FAFC' },
  obsidian: { base: '#1E1B2E', top: '#4C1D95' },
};

export default function MovingPlatform({
  initialPosition,
  axis = 'x',
  amplitude = 5,
  speed = 1.2,
  size = [3.2, 0.6, 3.2],
  theme = 'sandstone',
}: MovingPlatformProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [baseX, baseY, baseZ] = initialPosition;
  const currentPosRef = useRef(new THREE.Vector3(baseX, baseY, baseZ));

  useFrame((state) => {
    if (!rigidBodyRef.current) return;
    const t = state.clock.elapsedTime * speed;
    const offset = Math.sin(t) * amplitude;

    let x = baseX;
    let y = baseY;
    let z = baseZ;

    if (axis === 'x') x += offset;
    else if (axis === 'y') y += offset;
    else if (axis === 'z') z += offset;

    currentPosRef.current.set(x, y, z);
    rigidBodyRef.current.setNextKinematicTranslation(currentPosRef.current);
  });

  const colors = THEME_COLORS[theme];
  const [width, height, depth] = size;

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicPosition" position={initialPosition} colliders={false}>
      <CuboidCollider args={[width / 2, height / 2, depth / 2]} />
      <group>
        {/* Main Platform Body */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={colors.base} roughness={0.85} />
        </mesh>
        {/* Decorative Top Paver */}
        <mesh position={[0, height / 2 + 0.02, 0]} receiveShadow>
          <boxGeometry args={[width * 0.94, 0.05, depth * 0.94]} />
          <meshStandardMaterial color={colors.top} roughness={0.7} />
        </mesh>
      </group>
    </RigidBody>
  );
}
