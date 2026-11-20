import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function AuthCourtyardScene() {
  const groupRef = useRef<THREE.Group>(null);
  const firefliesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.08;
    }
    if (firefliesRef.current) {
      firefliesRef.current.rotation.y = t * 0.05;
    }
  });

  const fireflyPositions = new Float32Array(90);
  for (let i = 0; i < 30; i++) {
    fireflyPositions[i * 3] = (Math.sin(i * 1.7) * 12);
    fireflyPositions[i * 3 + 1] = 1 + Math.cos(i * 2.3) * 3;
    fireflyPositions[i * 3 + 2] = (Math.sin(i * 3.1) * 12);
  }

  return (
    <group ref={groupRef}>
      {/* Warm Golden-Hour Lighting */}
      <ambientLight intensity={0.65} color="#FEF3C7" />
      <directionalLight
        position={[12, 18, -10]}
        intensity={1.8}
        color="#FDE68A"
        castShadow
      />
      <hemisphereLight groundColor="#78350F" color="#38BDF8" intensity={0.4} />

      {/* Courtyard Flagstone Platform */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <cylinderGeometry args={[16, 18, 0.8, 16]} />
        <meshStandardMaterial color="#B08D57" roughness={0.9} />
      </mesh>

      {/* Ancient Temple Gopura Gateway Silhouette in Background */}
      <group position={[0, 0, 10]}>
        <mesh position={[-3.5, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 7, 1.6]} />
          <meshStandardMaterial color="#6E583B" roughness={0.85} />
        </mesh>
        <mesh position={[3.5, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 7, 1.6]} />
          <meshStandardMaterial color="#6E583B" roughness={0.85} />
        </mesh>
        <mesh position={[0, 6.5, 0]} castShadow>
          <boxGeometry args={[9, 1.4, 2]} />
          <meshStandardMaterial color="#8B6D4A" roughness={0.8} />
        </mesh>
        <mesh position={[0, 8.2, 0]} castShadow>
          <coneGeometry args={[3.2, 2.4, 4]} />
          <meshStandardMaterial color="#D97706" roughness={0.6} />
        </mesh>
      </group>

      {/* Guardian Lions (Simha) */}
      {[-4, 4].map((x) => (
        <group key={`lion-${x}`} position={[x, 0, 4]}>
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 2.0, 1.2]} />
            <meshStandardMaterial color="#785A3C" roughness={0.88} />
          </mesh>
          <pointLight color="#F59E0B" intensity={1.2} distance={5} position={[0, 2.4, 0]} />
        </group>
      ))}

      {/* Glowing Spirit Fireflies */}
      <points ref={firefliesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[fireflyPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#FDE047" size={0.25} transparent opacity={0.85} />
      </points>
    </group>
  );
}
