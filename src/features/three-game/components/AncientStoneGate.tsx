import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GATE_POSITION_Z } from '../systems/gameplayState';
import type { GateState } from '../types';

type AncientStoneGateProps = {
  gateState: GateState;
  onOpeningFinished?: () => void;
};

export default function AncientStoneGate({ gateState, onOpeningFinished }: AncientStoneGateProps) {
  const leftDoorPivotRef = useRef<THREE.Group>(null);
  const rightDoorPivotRef = useRef<THREE.Group>(null);
  const runeGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const flameLightLeftRef = useRef<THREE.PointLight>(null);
  const flameLightRightRef = useRef<THREE.PointLight>(null);

  const currentOpenProgress = useRef(gateState.openProgress);
  const finishedCallbackCalled = useRef(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Pulse the ancient inscription rune glow
    if (runeGlowRef.current) {
      const pulse = 0.55 + Math.sin(time * 3) * 0.35;
      runeGlowRef.current.emissiveIntensity = pulse;
    }

    // Flame flicker
    if (flameLightLeftRef.current) {
      flameLightLeftRef.current.intensity = 1.4 + Math.sin(time * 8 + 1) * 0.3;
    }
    if (flameLightRightRef.current) {
      flameLightRightRef.current.intensity = 1.4 + Math.sin(time * 7 + 3) * 0.3;
    }

    // Gate opening animation
    if (gateState.status === 'opening' || gateState.status === 'open') {
      const target = 1.0;
      const speed = 0.65; // Opens smoothly over ~2-2.5 seconds
      currentOpenProgress.current = Math.min(target, currentOpenProgress.current + delta * speed);

      // Smooth cubic ease-out
      const t = currentOpenProgress.current;
      const ease = 1 - Math.pow(1 - t, 3);

      const maxAngle = Math.PI * 0.46; // ~83 degrees swing
      if (leftDoorPivotRef.current) {
        leftDoorPivotRef.current.rotation.y = ease * maxAngle;
      }
      if (rightDoorPivotRef.current) {
        rightDoorPivotRef.current.rotation.y = -ease * maxAngle;
      }

      if (currentOpenProgress.current >= 1.0 && !finishedCallbackCalled.current) {
        finishedCallbackCalled.current = true;
        onOpeningFinished?.();
      }
    } else {
      // Closed
      currentOpenProgress.current = 0;
      finishedCallbackCalled.current = false;
      if (leftDoorPivotRef.current) leftDoorPivotRef.current.rotation.y = 0;
      if (rightDoorPivotRef.current) rightDoorPivotRef.current.rotation.y = 0;
    }
  });

  return (
    <group position={[0, 0, GATE_POSITION_Z]}>
      {/* ===== PORTAL PILLARS ===== */}
      {/* Left Pillar (Angkor Sandstone) */}
      <group position={[-2.2, 0, 0]}>
        {/* Base */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.2, 0.8, 1.2]} />
          <meshStandardMaterial color="#856847" roughness={0.9} />
        </mesh>
        {/* Main Shaft */}
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[0.9, 3.6, 0.9]} />
          <meshStandardMaterial color="#947451" roughness={0.88} />
        </mesh>
        {/* Carved Band Ring */}
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[1.02, 0.25, 1.02]} />
          <meshStandardMaterial color="#B08F68" roughness={0.85} />
        </mesh>
        {/* Capital */}
        <mesh position={[0, 4.65, 0]}>
          <boxGeometry args={[1.3, 0.5, 1.3]} />
          <meshStandardMaterial color="#856847" roughness={0.9} />
        </mesh>
      </group>

      {/* Right Pillar */}
      <group position={[2.2, 0, 0]}>
        {/* Base */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.2, 0.8, 1.2]} />
          <meshStandardMaterial color="#856847" roughness={0.9} />
        </mesh>
        {/* Main Shaft */}
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[0.9, 3.6, 0.9]} />
          <meshStandardMaterial color="#947451" roughness={0.88} />
        </mesh>
        {/* Carved Band Ring */}
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[1.02, 0.25, 1.02]} />
          <meshStandardMaterial color="#B08F68" roughness={0.85} />
        </mesh>
        {/* Capital */}
        <mesh position={[0, 4.65, 0]}>
          <boxGeometry args={[1.3, 0.5, 1.3]} />
          <meshStandardMaterial color="#856847" roughness={0.9} />
        </mesh>
      </group>

      {/* ===== LINTEL & STEPPED PEDIMENT (Gopura Style) ===== */}
      <group position={[0, 4.9, 0]}>
        {/* Main Architrave / Lintel */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[5.8, 0.7, 1.1]} />
          <meshStandardMaterial color="#856847" roughness={0.9} />
        </mesh>

        {/* Decorative Carved Frieze */}
        <mesh position={[0, 0.35, 0.57]}>
          <boxGeometry args={[4.8, 0.45, 0.08]} />
          <meshStandardMaterial color="#B08F68" roughness={0.8} />
        </mesh>

        {/* Tier 1 Pediment */}
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[4.4, 0.5, 0.9]} />
          <meshStandardMaterial color="#947451" roughness={0.88} />
        </mesh>

        {/* Tier 2 Pediment */}
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[3.2, 0.4, 0.75]} />
          <meshStandardMaterial color="#856847" roughness={0.9} />
        </mesh>

        {/* Central Crown Finial (Angkor Kalasa crest) */}
        <mesh position={[0, 1.85, 0]}>
          <coneGeometry args={[0.55, 0.8, 8]} />
          <meshStandardMaterial color="#C59B27" roughness={0.6} metalness={0.25} />
        </mesh>
      </group>

      {/* ===== HEAVY STONE DOORS ===== */}
      {/* Left Door Wing (Pivot at x = -1.75) */}
      <group position={[-1.75, 0, 0]} ref={leftDoorPivotRef}>
        <mesh position={[0.85, 2.2, 0]}>
          <boxGeometry args={[1.7, 4.0, 0.28]} />
          <meshStandardMaterial color="#5C4835" roughness={0.92} />
        </mesh>
        {/* Ancient Metal / Gold Bosses on door */}
        <mesh position={[1.4, 2.2, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 8]} />
          <meshStandardMaterial color="#D97706" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0.5, 3.2, 0.16]}>
          <boxGeometry args={[0.6, 0.08, 0.04]} />
          <meshStandardMaterial color="#D97706" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0.5, 1.2, 0.16]}>
          <boxGeometry args={[0.6, 0.08, 0.04]} />
          <meshStandardMaterial color="#D97706" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

      {/* Right Door Wing (Pivot at x = 1.75) */}
      <group position={[1.75, 0, 0]} ref={rightDoorPivotRef}>
        <mesh position={[-0.85, 2.2, 0]}>
          <boxGeometry args={[1.7, 4.0, 0.28]} />
          <meshStandardMaterial color="#5C4835" roughness={0.92} />
        </mesh>
        {/* Ancient Metal / Gold Bosses on door */}
        <mesh position={[-1.4, 2.2, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 8]} />
          <meshStandardMaterial color="#D97706" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[-0.5, 3.2, 0.16]}>
          <boxGeometry args={[0.6, 0.08, 0.04]} />
          <meshStandardMaterial color="#D97706" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[-0.5, 1.2, 0.16]}>
          <boxGeometry args={[0.6, 0.08, 0.04]} />
          <meshStandardMaterial color="#D97706" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

      {/* ===== INTERACTION ALTAR / RUNE PEDESTAL (In front of gate at z = -2.4) ===== */}
      <group position={[0, 0, -2.4]}>
        {/* Stepped Pedestal Base */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[1.2, 1.35, 0.3, 16]} />
          <meshStandardMaterial color="#785938" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.85, 1.0, 0.45, 16]} />
          <meshStandardMaterial color="#8F6C46" roughness={0.85} />
        </mesh>
        {/* Inscription Tablet Top */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.1, 0.18, 0.9]} />
          <meshStandardMaterial color="#6B5033" roughness={0.8} />
        </mesh>
        {/* Glowing Ancient Rune Inscription (Pulsing amber magic) */}
        <mesh position={[0, 0.91, 0]}>
          <boxGeometry args={[0.85, 0.04, 0.65]} />
          <meshStandardMaterial
            ref={runeGlowRef}
            color="#F59E0B"
            emissive="#D97706"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* ===== STONE BRAZIERS WITH FLICKERING FLAMES ===== */}
      {/* Left Brazier */}
      <group position={[-3.6, 0, -1.2]}>
        {/* Stone stand */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.3, 0.45, 1.2, 12]} />
          <meshStandardMaterial color="#6B5033" roughness={0.9} />
        </mesh>
        {/* Bowl */}
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.5, 0.25, 0.3, 12]} />
          <meshStandardMaterial color="#4A3B2C" roughness={0.8} />
        </mesh>
        {/* Flame core */}
        <mesh position={[0, 1.48, 0]}>
          <coneGeometry args={[0.22, 0.45, 8]} />
          <meshBasicMaterial color="#FFB020" />
        </mesh>
        {/* Point light */}
        <pointLight
          ref={flameLightLeftRef}
          position={[0, 1.6, 0]}
          color="#FFA500"
          distance={8}
          decay={2}
          intensity={1.4}
        />
      </group>

      {/* Right Brazier */}
      <group position={[3.6, 0, -1.2]}>
        {/* Stone stand */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.3, 0.45, 1.2, 12]} />
          <meshStandardMaterial color="#6B5033" roughness={0.9} />
        </mesh>
        {/* Bowl */}
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.5, 0.25, 0.3, 12]} />
          <meshStandardMaterial color="#4A3B2C" roughness={0.8} />
        </mesh>
        {/* Flame core */}
        <mesh position={[0, 1.48, 0]}>
          <coneGeometry args={[0.22, 0.45, 8]} />
          <meshBasicMaterial color="#FFB020" />
        </mesh>
        {/* Point light */}
        <pointLight
          ref={flameLightRightRef}
          position={[0, 1.6, 0]}
          color="#FFA500"
          distance={8}
          decay={2}
          intensity={1.4}
        />
      </group>

      {/* ===== GUARDIAN LION STATUES (Simha) FLANKING PATHWAY ===== */}
      <group position={[-2.8, 0, -3.2]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.7, 0.5, 0.8]} />
          <meshStandardMaterial color="#856847" />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.45, 0.55, 0.55]} />
          <meshStandardMaterial color="#947451" />
        </mesh>
        <mesh position={[0, 1.1, 0.1]}>
          <sphereGeometry args={[0.26, 10, 10]} />
          <meshStandardMaterial color="#856847" />
        </mesh>
      </group>

      <group position={[2.8, 0, -3.2]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.7, 0.5, 0.8]} />
          <meshStandardMaterial color="#856847" />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.45, 0.55, 0.55]} />
          <meshStandardMaterial color="#947451" />
        </mesh>
        <mesh position={[0, 1.1, 0.1]}>
          <sphereGeometry args={[0.26, 10, 10]} />
          <meshStandardMaterial color="#856847" />
        </mesh>
      </group>
    </group>
  );
}
