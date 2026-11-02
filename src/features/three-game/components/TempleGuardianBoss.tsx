import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { useGltfClone } from '../hooks/useGltfAsset';
import type { GateStatus, Position3D } from '../types';

export type BossVisualState =
  | 'dormant'
  | 'awakening'
  | 'ready'
  | 'active'
  | 'hit'
  | 'mistake'
  | 'defeated'
  | 'celebrating';

type TempleGuardianBossProps = {
  activeWaveIndex: number;
  waveStatus: GateStatus;
  isTypingMode: boolean;
  completedCount: number;
  streak: number;
  incorrectCount: number;
  isDefeated: boolean;
  onNearBossChange?: (isNear: boolean) => void;
  playerPositionRef: MutableRefObject<Position3D>;
  bossPosition?: [number, number, number];
};

export default function TempleGuardianBoss({
  activeWaveIndex,
  waveStatus,
  isTypingMode,
  completedCount,
  streak,
  incorrectCount,
  isDefeated,
  onNearBossChange,
  playerPositionRef,
  bossPosition = [0, 0, 32.5],
}: TempleGuardianBossProps) {
  const glb = useGltfClone('/models/props/khmer_simha_guardian.glb');
  const guardianModel = useMemo(() => (glb ? glb.clone(true) : null), [glb]);

  const rootGroupRef = useRef<THREE.Group>(null);
  const guardianMeshGroupRef = useRef<THREE.Group>(null);
  const shieldRingsGroupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const auraRingRef = useRef<THREE.Mesh>(null);
  const altarBrazierLeftRef = useRef<THREE.PointLight>(null);
  const altarBrazierRightRef = useRef<THREE.PointLight>(null);

  // Dynamic reaction tracking
  const lastCompletedRef = useRef(completedCount);
  const lastIncorrectRef = useRef(incorrectCount);
  const hitPulseTimerRef = useRef(0);
  const mistakeTimerRef = useRef(0);
  const awakenProgressRef = useRef(0);
  const [isNear, setIsNear] = useState(false);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const playerZ = playerPositionRef.current[2];
    const playerX = playerPositionRef.current[0];
    const distToBoss = Math.hypot(bossPosition[0] - playerX, bossPosition[2] - playerZ);

    // Near boss check
    const near = distToBoss <= 10.5;
    if (near !== isNear) {
      setIsNear(near);
      onNearBossChange?.(near);
    }

    // Determine current visual state
    let currentState: BossVisualState = 'dormant';
    if (isDefeated || waveStatus === 'open') {
      currentState = 'defeated';
    } else if (hitPulseTimerRef.current > 0) {
      currentState = 'hit';
    } else if (mistakeTimerRef.current > 0) {
      currentState = 'mistake';
    } else if (isTypingMode) {
      currentState = 'active';
    } else if (near) {
      currentState = awakenProgressRef.current >= 1 ? 'ready' : 'awakening';
    }

    // Update awakening transition
    if (near && !isDefeated) {
      awakenProgressRef.current = Math.min(1, awakenProgressRef.current + delta * 1.8);
    } else if (!near && !isTypingMode && !isDefeated) {
      awakenProgressRef.current = Math.max(0, awakenProgressRef.current - delta * 0.8);
    }

    // Detect hit pulses
    if (completedCount > lastCompletedRef.current) {
      hitPulseTimerRef.current = 0.45;
      lastCompletedRef.current = completedCount;
    }
    if (incorrectCount > lastIncorrectRef.current) {
      mistakeTimerRef.current = 0.55;
      lastIncorrectRef.current = incorrectCount;
    }
    if (hitPulseTimerRef.current > 0) {
      hitPulseTimerRef.current = Math.max(0, hitPulseTimerRef.current - delta);
    }
    if (mistakeTimerRef.current > 0) {
      mistakeTimerRef.current = Math.max(0, mistakeTimerRef.current - delta);
    }

    // Boss Guardian Animation Behaviors
    if (guardianMeshGroupRef.current) {
      if (currentState === 'defeated') {
        // Reverent bow of respect and dissipation
        guardianMeshGroupRef.current.position.y = THREE.MathUtils.lerp(
          guardianMeshGroupRef.current.position.y,
          0.4,
          delta * 2.0,
        );
        guardianMeshGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          guardianMeshGroupRef.current.rotation.x,
          0.32,
          delta * 2.0,
        );
      } else if (currentState === 'hit') {
        // Flinch backward with stone recoil
        guardianMeshGroupRef.current.position.z = THREE.MathUtils.lerp(
          guardianMeshGroupRef.current.position.z,
          0.35,
          delta * 14.0,
        );
        guardianMeshGroupRef.current.position.y = 1.0 + Math.sin(t * 30.0) * 0.08;
      } else if (currentState === 'mistake') {
        // Stone deflection shudder
        guardianMeshGroupRef.current.position.x = (Math.random() - 0.5) * 0.12;
      } else if (currentState === 'active') {
        // Breathing stone idle with subtle breathing and hovering
        guardianMeshGroupRef.current.position.y = 1.0 + Math.sin(t * 2.5) * 0.06;
        guardianMeshGroupRef.current.position.z = THREE.MathUtils.lerp(
          guardianMeshGroupRef.current.position.z,
          0,
          delta * 4.0,
        );
        guardianMeshGroupRef.current.position.x = 0;
        guardianMeshGroupRef.current.rotation.x = Math.sin(t * 1.5) * 0.03;
      } else if (currentState === 'awakening' || currentState === 'ready') {
        guardianMeshGroupRef.current.position.y = 1.0 + Math.sin(t * 1.8) * 0.04;
        guardianMeshGroupRef.current.position.z = 0;
        guardianMeshGroupRef.current.position.x = 0;
      } else {
        // Dormant stone rest
        guardianMeshGroupRef.current.position.y = 0.95;
        guardianMeshGroupRef.current.position.z = 0;
        guardianMeshGroupRef.current.position.x = 0;
        guardianMeshGroupRef.current.rotation.x = 0;
      }
    }

    // Shield Rings Animation
    if (shieldRingsGroupRef.current) {
      if (currentState === 'defeated') {
        shieldRingsGroupRef.current.scale.setScalar(
          THREE.MathUtils.lerp(shieldRingsGroupRef.current.scale.x, 0, delta * 3.0),
        );
      } else {
        shieldRingsGroupRef.current.scale.setScalar(
          THREE.MathUtils.lerp(
            shieldRingsGroupRef.current.scale.x,
            awakenProgressRef.current > 0.3 ? 1.0 : 0.0,
            delta * 3.0,
          ),
        );
        shieldRingsGroupRef.current.rotation.y = t * 0.85;
        shieldRingsGroupRef.current.rotation.z = Math.sin(t * 0.5) * 0.15;
      }
    }

    // Glowing Eyes
    const eyeIntensity =
      currentState === 'defeated'
        ? 0.15
        : currentState === 'active'
        ? 0.95 + Math.sin(t * 6.0) * 0.25
        : currentState === 'hit'
        ? 1.5
        : awakenProgressRef.current * 0.85;

    if (eyeLeftRef.current && eyeRightRef.current) {
      const eyeMatL = eyeLeftRef.current.material as THREE.MeshBasicMaterial;
      const eyeMatR = eyeRightRef.current.material as THREE.MeshBasicMaterial;
      const eyeColor =
        currentState === 'hit'
          ? '#F59E0B'
          : currentState === 'defeated'
          ? '#10B981'
          : currentState === 'active'
          ? '#06B6D4'
          : '#38BDF8';
      eyeMatL.color.set(eyeColor);
      eyeMatR.color.set(eyeColor);
      eyeMatL.opacity = eyeIntensity;
      eyeMatR.opacity = eyeIntensity;
    }

    // Altar Braziers flicker
    if (altarBrazierLeftRef.current && altarBrazierRightRef.current) {
      const flicker = 1.0 + Math.sin(t * 12.0) * 0.2 + (streak > 5 ? 0.4 : 0);
      altarBrazierLeftRef.current.intensity = flicker * (awakenProgressRef.current * 2.5);
      altarBrazierRightRef.current.intensity = flicker * (awakenProgressRef.current * 2.5);
    }

    // Ground Aura
    if (auraRingRef.current) {
      auraRingRef.current.rotation.z = -t * 0.5;
    }
  });

  return (
    <group ref={rootGroupRef} position={bossPosition}>
      {/* 1. Grand Khmer Lotus Altar Pediment at Z = 32.5 */}
      <group position={[0, 0, 0]}>
        {/* Tiered Sandstone Base */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.2, 3.6, 0.5, 24]} />
          <meshStandardMaterial color="#4A3F35" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.7, 3.0, 0.35, 24]} />
          <meshStandardMaterial color="#6B5B4D" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.3, 2.5, 0.3, 24]} />
          <meshStandardMaterial color="#8A7765" roughness={0.82} />
        </mesh>

        {/* Carved Lotus Petal Rim around Altar */}
        {Array.from({ length: 16 }).map((_, idx) => {
          const angle = (idx / 16) * Math.PI * 2;
          const radius = 2.45;
          return (
            <mesh
              key={`altar-petal-${idx}`}
              position={[Math.cos(angle) * radius, 1.05, Math.sin(angle) * radius]}
              rotation={[0.3, -angle + Math.PI / 2, 0]}
            >
              <coneGeometry args={[0.22, 0.4, 4]} />
              <meshStandardMaterial color="#D97706" roughness={0.5} metalness={0.3} />
            </mesh>
          );
        })}

        {/* Sacred Altar Floor Inscription Disc */}
        <mesh position={[0, 1.11, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.2, 32]} />
          <meshStandardMaterial color="#292524" roughness={0.75} />
        </mesh>

        {/* Rotating Ground Aura Ring */}
        <mesh ref={auraRingRef} position={[0, 1.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.7, 2.15, 32]} />
          <meshBasicMaterial
            color={isDefeated ? '#10B981' : activeWaveIndex === 2 ? '#EF4444' : '#06B6D4'}
            transparent
            opacity={0.65}
          />
        </mesh>
      </group>

      {/* 2. Flanking Sacred Fire Braziers */}
      <group position={[-3.4, 0, 0]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.45, 1.6, 12]} />
          <meshStandardMaterial color="#4A3F35" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.65, 0.3, 0.35, 12]} />
          <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
        </mesh>
        <pointLight
          ref={altarBrazierLeftRef}
          position={[0, 2.1, 0]}
          color="#38BDF8"
          intensity={2.0}
          distance={10}
        />
      </group>
      <group position={[3.4, 0, 0]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.45, 1.6, 12]} />
          <meshStandardMaterial color="#4A3F35" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.65, 0.3, 0.35, 12]} />
          <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.5} />
        </mesh>
        <pointLight
          ref={altarBrazierRightRef}
          position={[0, 2.1, 0]}
          color="#38BDF8"
          intensity={2.0}
          distance={10}
        />
      </group>

      {/* 3. Colossal Animated Stone Guardian Lion */}
      <group ref={guardianMeshGroupRef} position={[0, 1.12, 0]} scale={[2.3, 2.3, 2.3]}>
        {guardianModel ? (
          <primitive object={guardianModel} />
        ) : (
          /* Procedural Khmer Stone Guardian Fallback */
          <group>
            {/* Body Mass */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.1, 0.65, 1.4]} />
              <meshStandardMaterial color="#5C4D3C" roughness={0.86} />
            </mesh>
            <mesh position={[0, 1.1, -0.1]} rotation={[-0.2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 0.9, 10]} />
              <meshStandardMaterial color="#6B5B4D" roughness={0.82} />
            </mesh>
            <mesh position={[0, 1.65, -0.22]} castShadow>
              <sphereGeometry args={[0.36, 12, 12]} />
              <meshStandardMaterial color="#7D6B58" roughness={0.8} />
            </mesh>
          </group>
        )}

        {/* Glowing Eyes */}
        <mesh ref={eyeLeftRef} position={[-0.14, 1.72, 0.32]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.9} />
        </mesh>
        <mesh ref={eyeRightRef} position={[0.14, 1.72, 0.32]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* 4. Concentric Protective Rune Shield Rings */}
      <group ref={shieldRingsGroupRef} position={[0, 2.6, 0]}>
        {/* Wave 1 Shield Barrier (Outer Ring) */}
        {activeWaveIndex <= 0 && !isDefeated && (
          <group>
            <mesh>
              <torusGeometry args={[3.2, 0.06, 12, 48]} />
              <meshStandardMaterial
                color="#06B6D4"
                emissive="#0891B2"
                emissiveIntensity={1.2}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            {/* Floating Shield Seal Glyphs */}
            {Array.from({ length: 6 }).map((_, i) => {
              const ang = (i / 6) * Math.PI * 2;
              return (
                <mesh key={`shield-seal-w1-${i}`} position={[Math.cos(ang) * 3.2, Math.sin(ang) * 3.2, 0]}>
                  <octahedronGeometry args={[0.18]} />
                  <meshBasicMaterial color="#38BDF8" />
                </mesh>
              );
            })}
          </group>
        )}

        {/* Wave 2 Shield Barrier (Middle Ring) */}
        {activeWaveIndex <= 1 && !isDefeated && (
          <group rotation={[Math.PI / 4, 0, 0]}>
            <mesh>
              <torusGeometry args={[2.5, 0.05, 12, 48]} />
              <meshStandardMaterial
                color="#F59E0B"
                emissive="#D97706"
                emissiveIntensity={1.2}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            {Array.from({ length: 4 }).map((_, i) => {
              const ang = (i / 4) * Math.PI * 2;
              return (
                <mesh key={`shield-seal-w2-${i}`} position={[Math.cos(ang) * 2.5, Math.sin(ang) * 2.5, 0]}>
                  <octahedronGeometry args={[0.15]} />
                  <meshBasicMaterial color="#FBBF24" />
                </mesh>
              );
            })}
          </group>
        )}

        {/* Wave 3 Shield Barrier (Inner Core Ring) */}
        {!isDefeated && (
          <group rotation={[-Math.PI / 4, 0, 0]}>
            <mesh>
              <torusGeometry args={[1.8, 0.05, 12, 48]} />
              <meshStandardMaterial
                color="#EF4444"
                emissive="#DC2626"
                emissiveIntensity={1.4}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            {Array.from({ length: 3 }).map((_, i) => {
              const ang = (i / 3) * Math.PI * 2;
              return (
                <mesh key={`shield-seal-w3-${i}`} position={[Math.cos(ang) * 1.8, Math.sin(ang) * 1.8, 0]}>
                  <octahedronGeometry args={[0.14]} />
                  <meshBasicMaterial color="#F87171" />
                </mesh>
              );
            })}
          </group>
        )}
      </group>

      {/* 5. Defeated / Victory Celebration Ascending Pillar of Light */}
      {isDefeated && (
        <group position={[0, 1.2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.8, 1.4, 18, 24, 1, true]} />
            <meshBasicMaterial color="#FBBF24" transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
          <pointLight color="#FBBF24" intensity={4.5} distance={16} />
        </group>
      )}
    </group>
  );
}
