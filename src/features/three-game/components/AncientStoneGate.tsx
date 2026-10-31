import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GATE_POSITION_Z } from '../systems/gameplayState';
import type { GateState } from '../types';

type AncientStoneGateProps = {
  gateState: GateState;
  streak?: number;
  completedCount?: number;
  incorrectCount?: number;
  onOpeningFinished?: () => void;
};

// Deterministic static positions for rising streak sparkles (pure outside component)
const STREAK_SPARKLE_OFFSETS: [number, number, number][] = [
  [-0.25, 0, -0.15],
  [0.22, 0, -0.12],
  [-0.18, 0, 0.16],
  [0.26, 0, 0.14],
  [0.0, 0, -0.22],
  [0.05, 0, 0.20],
];

export default function AncientStoneGate({
  gateState,
  streak = 0,
  completedCount = 0,
  incorrectCount = 0,
  onOpeningFinished,
}: AncientStoneGateProps) {
  const leftDoorPivotRef = useRef<THREE.Group>(null);
  const rightDoorPivotRef = useRef<THREE.Group>(null);
  const gateFrameRef = useRef<THREE.Group>(null);
  const runeGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const rippleRingRef = useRef<THREE.Mesh>(null);
  const rippleMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const portalLightRef = useRef<THREE.PointLight>(null);
  const portalGlowRef = useRef<THREE.MeshBasicMaterial>(null);
  const flameLightLeftRef = useRef<THREE.PointLight>(null);
  const flameLightRightRef = useRef<THREE.PointLight>(null);
  const leftFlameCoreRef = useRef<THREE.Mesh>(null);
  const rightFlameCoreRef = useRef<THREE.Mesh>(null);
  const sparklesGroupRef = useRef<THREE.Group>(null);

  const currentOpenProgress = useRef(gateState.openProgress);
  const finishedCallbackCalled = useRef(false);

  // Keystroke reaction tracking synchronized with Three.js clock
  const currentTimeRef = useRef(0);
  const prevCompletedRef = useRef(completedCount);
  const prevIncorrectRef = useRef(incorrectCount);
  const correctFlashTime = useRef(-10);
  const incorrectFlashTime = useRef(-10);

  useEffect(() => {
    if (completedCount > prevCompletedRef.current) {
      correctFlashTime.current = currentTimeRef.current;
      prevCompletedRef.current = completedCount;
    }
  }, [completedCount]);

  useEffect(() => {
    if (incorrectCount > prevIncorrectRef.current) {
      incorrectFlashTime.current = currentTimeRef.current;
      prevIncorrectRef.current = incorrectCount;
    }
  }, [incorrectCount]);

  // Common materials
  const sandstoneDark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#6E553B', roughness: 0.92 }),
    [],
  );
  const sandstoneMedium = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#876949', roughness: 0.88 }),
    [],
  );
  const sandstoneLight = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#A88764', roughness: 0.84 }),
    [],
  );
  const agedBronze = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#D97706',
        metalness: 0.65,
        roughness: 0.35,
      }),
    [],
  );
  const darkTeakWood = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#3E2E20', roughness: 0.85 }),
    [],
  );

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    currentTimeRef.current = time;

    // 1. Typing Feedback: Reaction to correct & incorrect keystrokes
    const timeSinceCorrect = time - correctFlashTime.current;
    const timeSinceIncorrect = time - incorrectFlashTime.current;

    let baseRuneEmissive = 0.55 + Math.sin(time * 3) * 0.25;
    let runeColor = '#F59E0B'; // default warm amber

    if (timeSinceCorrect >= 0 && timeSinceCorrect < 0.45) {
      // Radiant golden-cyan flash for correct keystroke
      const correctFactor = 1 - timeSinceCorrect / 0.45;
      baseRuneEmissive += correctFactor * 1.5;
      runeColor = streak >= 5 ? '#38BDF8' : '#FBBF24';

      // Expanding magical ripple ring
      if (rippleRingRef.current && rippleMaterialRef.current) {
        const ringScale = 0.3 + (1 - correctFactor) * 1.4;
        rippleRingRef.current.scale.set(ringScale, ringScale, ringScale);
        rippleRingRef.current.visible = true;
        rippleMaterialRef.current.opacity = correctFactor * 0.75;
      }
    } else if (rippleRingRef.current) {
      rippleRingRef.current.visible = false;
    }

    if (timeSinceIncorrect >= 0 && timeSinceIncorrect < 0.35) {
      // Subtle warm-crimson shimmer for incorrect key
      const incorrectFactor = 1 - timeSinceIncorrect / 0.35;
      baseRuneEmissive += incorrectFactor * 0.8;
      runeColor = '#EF4444';
    }

    if (runeGlowRef.current) {
      runeGlowRef.current.emissiveIntensity = baseRuneEmissive;
      runeGlowRef.current.color.set(runeColor);
      runeGlowRef.current.emissive.set(runeColor);
    }

    // Floating streak sparkles when combo >= 3
    if (sparklesGroupRef.current) {
      const showSparkles = streak >= 3;
      sparklesGroupRef.current.visible = showSparkles;
      if (showSparkles) {
        sparklesGroupRef.current.children.forEach((child, i) => {
          const speed = 0.6 + i * 0.15;
          const cycle = (time * speed + i * 0.3) % 1.2;
          child.position.y = 0.95 + cycle * 0.8;
          const scale = Math.sin((cycle / 1.2) * Math.PI) * (0.04 + (streak > 5 ? 0.02 : 0));
          child.scale.set(scale, scale, scale);
        });
      }
    }

    // 2. Animated Braziers: Organic dual-layer flame pulsation
    const flameFlickerA = Math.sin(time * 8 + 0.5) * 0.2 + Math.cos(time * 13) * 0.15;
    const flameFlickerB = Math.sin(time * 9 + 2.1) * 0.2 + Math.cos(time * 11) * 0.15;

    if (flameLightLeftRef.current) {
      flameLightLeftRef.current.intensity = 1.6 + flameFlickerA;
    }
    if (flameLightRightRef.current) {
      flameLightRightRef.current.intensity = 1.6 + flameFlickerB;
    }
    if (leftFlameCoreRef.current) {
      const s = 1.0 + flameFlickerA * 0.2;
      leftFlameCoreRef.current.scale.set(s, 1 + flameFlickerA * 0.35, s);
    }
    if (rightFlameCoreRef.current) {
      const s = 1.0 + flameFlickerB * 0.2;
      rightFlameCoreRef.current.scale.set(s, 1 + flameFlickerB * 0.35, s);
    }

    // 3. Gate Opening Animation: Stone tremor -> cubic swing -> sanctuary illumination
    if (gateState.status === 'opening' || gateState.status === 'open') {
      const target = 1.0;
      const speed = 0.6; // Opens smoothly over ~2.4 seconds
      currentOpenProgress.current = Math.min(target, currentOpenProgress.current + delta * speed);

      const t = currentOpenProgress.current;
      const ease = 1 - Math.pow(1 - t, 3);

      // Initial unsealing vibration (first 0.35 seconds)
      if (t < 0.15 && gateFrameRef.current) {
        const shake = Math.sin(time * 50) * 0.012 * (1 - t / 0.15);
        gateFrameRef.current.position.x = shake;
      } else if (gateFrameRef.current) {
        gateFrameRef.current.position.x = 0;
      }

      // Door leaf swing
      const maxAngle = Math.PI * 0.47; // ~85 degrees
      if (leftDoorPivotRef.current) {
        leftDoorPivotRef.current.rotation.y = ease * maxAngle;
      }
      if (rightDoorPivotRef.current) {
        rightDoorPivotRef.current.rotation.y = -ease * maxAngle;
      }

      // Sanctuary light & portal glow flooding forward
      if (portalLightRef.current) {
        portalLightRef.current.intensity = ease * 3.2;
      }
      if (portalGlowRef.current) {
        portalGlowRef.current.opacity = ease * 0.85;
      }

      if (currentOpenProgress.current >= 1.0 && !finishedCallbackCalled.current) {
        finishedCallbackCalled.current = true;
        onOpeningFinished?.();
      }
    } else {
      // Closed state
      currentOpenProgress.current = 0;
      finishedCallbackCalled.current = false;
      if (leftDoorPivotRef.current) leftDoorPivotRef.current.rotation.y = 0;
      if (rightDoorPivotRef.current) rightDoorPivotRef.current.rotation.y = 0;
      if (gateFrameRef.current) gateFrameRef.current.position.x = 0;
      if (portalLightRef.current) portalLightRef.current.intensity = 0;
      if (portalGlowRef.current) portalGlowRef.current.opacity = 0;
    }
  });

  return (
    <group position={[0, 0, GATE_POSITION_Z]}>
      {/* ===== INNER SANCTUARY LIGHT PORTAL ===== */}
      <group position={[0, 2.3, 0.4]}>
        {/* Soft glowing portal gateway backdrop */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.2, 4.2]} />
          <meshBasicMaterial
            ref={portalGlowRef}
            color="#FEF08A"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Warm golden light pouring forward through open portal */}
        <pointLight
          ref={portalLightRef}
          position={[0, 0, 0.8]}
          color="#FDE68A"
          intensity={0}
          distance={14}
          decay={2}
        />
      </group>

      {/* ===== GOPURA PORTAL FRAME ===== */}
      <group ref={gateFrameRef}>
        {/* Stone Threshold Step */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[4.8, 0.24, 1.4]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[3.8, 0.12, 1.1]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>

        {/* Left Angkor Pillar */}
        <group position={[-2.25, 0, 0]}>
          {/* Stepped Plinth Base */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.3, 0.9, 1.3]} />
            <primitive object={sandstoneDark} attach="material" />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[1.1, 0.2, 1.1]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>
          {/* Fluted Main Shaft */}
          <mesh position={[0, 2.7, 0]}>
            <boxGeometry args={[0.95, 3.4, 0.95]} />
            <primitive object={sandstoneMedium} attach="material" />
          </mesh>
          {/* Carved Angkorian Relief Band */}
          <mesh position={[0, 2.7, 0]}>
            <boxGeometry args={[1.08, 0.35, 1.08]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>
          {/* Carved Lotus Capital (ក្បាច់ក្បាលសសរ) */}
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[1.2, 0.3, 1.2]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>
          <mesh position={[0, 4.75, 0]}>
            <boxGeometry args={[1.4, 0.25, 1.4]} />
            <primitive object={sandstoneDark} attach="material" />
          </mesh>
        </group>

        {/* Right Angkor Pillar */}
        <group position={[2.25, 0, 0]}>
          {/* Stepped Plinth Base */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.3, 0.9, 1.3]} />
            <primitive object={sandstoneDark} attach="material" />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[1.1, 0.2, 1.1]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>
          {/* Fluted Main Shaft */}
          <mesh position={[0, 2.7, 0]}>
            <boxGeometry args={[0.95, 3.4, 0.95]} />
            <primitive object={sandstoneMedium} attach="material" />
          </mesh>
          {/* Carved Angkorian Relief Band */}
          <mesh position={[0, 2.7, 0]}>
            <boxGeometry args={[1.08, 0.35, 1.08]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>
          {/* Carved Lotus Capital (ក្បាច់ក្បាលសសរ) */}
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[1.2, 0.3, 1.2]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>
          <mesh position={[0, 4.75, 0]}>
            <boxGeometry args={[1.4, 0.25, 1.4]} />
            <primitive object={sandstoneDark} attach="material" />
          </mesh>
        </group>

        {/* ===== GOPURA LINTEL & TIERED PEDIMENT (កំពូលខ្លោងទ្វារ) ===== */}
        <group position={[0, 4.95, 0]}>
          {/* Main Carved Sandstone Architrave / Lintel (ផ្តែរ) */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[6.0, 0.75, 1.2]} />
            <primitive object={sandstoneDark} attach="material" />
          </mesh>
          {/* Detailed Front Relief Panel */}
          <mesh position={[0, 0.35, 0.62]}>
            <boxGeometry args={[5.2, 0.55, 0.08]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>
          {/* Central Guardian Mask / Medallion on Lintel */}
          <mesh position={[0, 0.35, 0.68]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.35, 0.35, 0.08]} />
            <primitive object={agedBronze} attach="material" />
          </mesh>

          {/* Stepped Pediment Tier 1 */}
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[4.6, 0.55, 1.0]} />
            <primitive object={sandstoneMedium} attach="material" />
          </mesh>
          {/* Antefix Corner Acroteria (សន្លឹកជ្វា) */}
          <mesh position={[-2.2, 1.1, 0.35]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>
          <mesh position={[2.2, 1.1, 0.35]} rotation={[0, 0, -0.4]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>

          {/* Stepped Pediment Tier 2 */}
          <mesh position={[0, 1.45, 0]}>
            <boxGeometry args={[3.4, 0.48, 0.85]} />
            <primitive object={sandstoneDark} attach="material" />
          </mesh>
          {/* Stepped Pediment Tier 3 */}
          <mesh position={[0, 1.85, 0]}>
            <boxGeometry args={[2.2, 0.38, 0.7]} />
            <primitive object={sandstoneLight} attach="material" />
          </mesh>

          {/* Sacred Crown Kalasa Spire Finial (កលស / កំពូលត្រីស៊ូល) */}
          <mesh position={[0, 2.3, 0]}>
            <cylinderGeometry args={[0.25, 0.5, 0.6, 8]} />
            <primitive object={agedBronze} attach="material" />
          </mesh>
          <mesh position={[0, 2.75, 0]}>
            <coneGeometry args={[0.3, 0.8, 8]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      </group>

      {/* ===== MONUMENTAL ANGKORIAN DOORS ===== */}
      {/* Left Door Leaf (Hinged at x = -1.75) */}
      <group position={[-1.75, 0, 0]} ref={leftDoorPivotRef}>
        {/* Main Timber-and-Sandstone Door Panel */}
        <mesh position={[0.85, 2.3, 0]}>
          <boxGeometry args={[1.72, 4.15, 0.28]} />
          <primitive object={darkTeakWood} attach="material" />
        </mesh>
        {/* Carved Door Frame Border */}
        <mesh position={[0.85, 2.3, 0.08]}>
          <boxGeometry args={[1.6, 3.95, 0.16]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        <mesh position={[0.85, 2.3, 0.14]}>
          <boxGeometry args={[1.35, 3.65, 0.06]} />
          <primitive object={darkTeakWood} attach="material" />
        </mesh>

        {/* Bronze Reinforcing Strap Hinges */}
        <mesh position={[0.8, 3.4, 0.18]}>
          <boxGeometry args={[1.5, 0.12, 0.05]} />
          <primitive object={agedBronze} attach="material" />
        </mesh>
        <mesh position={[0.8, 2.3, 0.18]}>
          <boxGeometry args={[1.5, 0.12, 0.05]} />
          <primitive object={agedBronze} attach="material" />
        </mesh>
        <mesh position={[0.8, 1.2, 0.18]}>
          <boxGeometry args={[1.5, 0.12, 0.05]} />
          <primitive object={agedBronze} attach="material" />
        </mesh>

        {/* Bronze Door Bosses (ចង្កូម / Clous de porte) */}
        {[
          [0.35, 3.4],
          [1.3, 3.4],
          [0.35, 2.3],
          [1.3, 2.3],
          [0.35, 1.2],
          [1.3, 1.2],
        ].map(([bx, by], idx) => (
          <mesh key={idx} position={[bx, by, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.09, 0.05, 8]} />
            <primitive object={agedBronze} attach="material" />
          </mesh>
        ))}

        {/* Ceremonial Door Ring Pull (ក្រវិលទ្វារ) */}
        <group position={[1.45, 2.15, 0.21]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 10]} />
            <primitive object={agedBronze} attach="material" />
          </mesh>
          <mesh position={[0, -0.12, 0.06]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.1, 0.025, 8, 16]} />
            <primitive object={agedBronze} attach="material" />
          </mesh>
        </group>
      </group>

      {/* Right Door Leaf (Hinged at x = 1.75) */}
      <group position={[1.75, 0, 0]} ref={rightDoorPivotRef}>
        {/* Main Timber-and-Sandstone Door Panel */}
        <mesh position={[-0.85, 2.3, 0]}>
          <boxGeometry args={[1.72, 4.15, 0.28]} />
          <primitive object={darkTeakWood} attach="material" />
        </mesh>
        {/* Carved Door Frame Border */}
        <mesh position={[-0.85, 2.3, 0.08]}>
          <boxGeometry args={[1.6, 3.95, 0.16]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        <mesh position={[-0.85, 2.3, 0.14]}>
          <boxGeometry args={[1.35, 3.65, 0.06]} />
          <primitive object={darkTeakWood} attach="material" />
        </mesh>

        {/* Bronze Reinforcing Strap Hinges */}
        <mesh position={[-0.8, 3.4, 0.18]}>
          <boxGeometry args={[1.5, 0.12, 0.05]} />
          <primitive object={agedBronze} attach="material" />
        </mesh>
        <mesh position={[-0.8, 2.3, 0.18]}>
          <boxGeometry args={[1.5, 0.12, 0.05]} />
          <primitive object={agedBronze} attach="material" />
        </mesh>
        <mesh position={[-0.8, 1.2, 0.18]}>
          <boxGeometry args={[1.5, 0.12, 0.05]} />
          <primitive object={agedBronze} attach="material" />
        </mesh>

        {/* Bronze Door Bosses (ចង្កូម / Clous de porte) */}
        {[
          [-0.35, 3.4],
          [-1.3, 3.4],
          [-0.35, 2.3],
          [-1.3, 2.3],
          [-0.35, 1.2],
          [-1.3, 1.2],
        ].map(([bx, by], idx) => (
          <mesh key={idx} position={[bx, by, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.09, 0.05, 8]} />
            <primitive object={agedBronze} attach="material" />
          </mesh>
        ))}

        {/* Ceremonial Door Ring Pull (ក្រវិលទ្វារ) */}
        <group position={[-1.45, 2.15, 0.21]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 10]} />
            <primitive object={agedBronze} attach="material" />
          </mesh>
          <mesh position={[0, -0.12, 0.06]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.1, 0.025, 8, 16]} />
            <primitive object={agedBronze} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ===== INTERACTION ALTAR / KHMER RUNE PEDESTAL (z = -2.4) ===== */}
      <group position={[0, 0, -2.4]}>
        {/* Tiered Sandstone Pedestal */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[1.25, 1.45, 0.3, 16]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[1.05, 1.2, 0.18, 16]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.85, 1.0, 0.35, 16]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>

        {/* Inscription Tablet Bevel Slab */}
        <mesh position={[0, 0.82, 0]}>
          <boxGeometry args={[1.15, 0.16, 0.95]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
        <mesh position={[0, 0.89, 0]}>
          <boxGeometry args={[1.0, 0.06, 0.8]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>

        {/* Glowing Ancient Rune Stone (Reacts dynamically to typing!) */}
        <mesh position={[0, 0.93, 0]}>
          <boxGeometry args={[0.86, 0.04, 0.66]} />
          <meshStandardMaterial
            ref={runeGlowRef}
            color="#F59E0B"
            emissive="#D97706"
            emissiveIntensity={0.65}
            roughness={0.25}
          />
        </mesh>

        {/* Ancient Inscribed Glyph Grooves on Altar */}
        <mesh position={[0, 0.955, 0]}>
          <boxGeometry args={[0.7, 0.015, 0.5]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>

        {/* Magical Keystroke Expanding Ripple Ring */}
        <mesh
          ref={rippleRingRef}
          position={[0, 0.96, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.15, 0.3, 24]} />
          <meshBasicMaterial
            ref={rippleMaterialRef}
            color="#38BDF8"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Floating Streak Sparkles (visible when streak >= 3) */}
        <group ref={sparklesGroupRef} visible={false}>
          {STREAK_SPARKLE_OFFSETS.map(([sx, sy, sz], idx) => (
            <mesh key={idx} position={[sx, sy + 0.95, sz]}>
              <octahedronGeometry args={[0.04, 0]} />
              <meshBasicMaterial color="#FDE047" />
            </mesh>
          ))}
        </group>
      </group>

      {/* ===== CEREMONIAL STONE BRAZIERS (ឆ្នាំងភ្លើងបូជា) ===== */}
      {/* Left Brazier */}
      <group position={[-3.6, 0, -1.2]}>
        {/* Stepped Pedestal */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.9, 0.4, 0.9]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
        {/* Fluted Column */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.26, 0.36, 0.8, 12]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Lotus Ring */}
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.42, 0.28, 0.15, 12]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        {/* Bronze Fire Bowl */}
        <mesh position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.55, 0.3, 0.3, 12]} />
          <primitive object={agedBronze} attach="material" />
        </mesh>
        {/* Outer Flame Petals */}
        <mesh position={[0, 1.62, 0]}>
          <coneGeometry args={[0.28, 0.55, 8]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        {/* Inner White-Hot Flame Core */}
        <mesh ref={leftFlameCoreRef} position={[0, 1.58, 0]}>
          <coneGeometry args={[0.16, 0.4, 8]} />
          <meshBasicMaterial color="#FFFBEB" />
        </mesh>
        {/* Dynamic Point Light */}
        <pointLight
          ref={flameLightLeftRef}
          position={[0, 1.75, 0]}
          color="#FFA500"
          distance={9}
          decay={2}
          intensity={1.6}
        />
      </group>

      {/* Right Brazier */}
      <group position={[3.6, 0, -1.2]}>
        {/* Stepped Pedestal */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.9, 0.4, 0.9]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
        {/* Fluted Column */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.26, 0.36, 0.8, 12]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Lotus Ring */}
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.42, 0.28, 0.15, 12]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        {/* Bronze Fire Bowl */}
        <mesh position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.55, 0.3, 0.3, 12]} />
          <primitive object={agedBronze} attach="material" />
        </mesh>
        {/* Outer Flame Petals */}
        <mesh position={[0, 1.62, 0]}>
          <coneGeometry args={[0.28, 0.55, 8]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        {/* Inner White-Hot Flame Core */}
        <mesh ref={rightFlameCoreRef} position={[0, 1.58, 0]}>
          <coneGeometry args={[0.16, 0.4, 8]} />
          <meshBasicMaterial color="#FFFBEB" />
        </mesh>
        {/* Dynamic Point Light */}
        <pointLight
          ref={flameLightRightRef}
          position={[0, 1.75, 0]}
          color="#FFA500"
          distance={9}
          decay={2}
          intensity={1.6}
        />
      </group>

      {/* ===== GUARDIAN LIONS (សិង្ហ / Simha) FLANKING PEDESTAL APPROACH ===== */}
      {/* Left Lion */}
      <group position={[-2.8, 0, -3.2]}>
        {/* Stepped Plinth */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.85, 0.4, 0.95]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.72, 0.15, 0.8]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        {/* Sitting Lion Body */}
        <mesh position={[0, 0.8, -0.05]}>
          <boxGeometry args={[0.48, 0.65, 0.65]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Proud Muscular Chest */}
        <mesh position={[0, 0.85, 0.22]}>
          <sphereGeometry args={[0.26, 8, 8]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        {/* Stylized Mane Collar (ក្បាច់រោម) */}
        <mesh position={[0, 1.15, 0.08]}>
          <cylinderGeometry args={[0.34, 0.42, 0.25, 10]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
        {/* Crowned Guardian Head */}
        <mesh position={[0, 1.36, 0.12]}>
          <sphereGeometry args={[0.24, 10, 10]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Lion Snout / Jaws */}
        <mesh position={[0, 1.3, 0.3]}>
          <boxGeometry args={[0.2, 0.18, 0.2]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
      </group>

      {/* Right Lion */}
      <group position={[2.8, 0, -3.2]}>
        {/* Stepped Plinth */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.85, 0.4, 0.95]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.72, 0.15, 0.8]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        {/* Sitting Lion Body */}
        <mesh position={[0, 0.8, -0.05]}>
          <boxGeometry args={[0.48, 0.65, 0.65]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Proud Muscular Chest */}
        <mesh position={[0, 0.85, 0.22]}>
          <sphereGeometry args={[0.26, 8, 8]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        {/* Stylized Mane Collar (ក្បាច់រោម) */}
        <mesh position={[0, 1.15, 0.08]}>
          <cylinderGeometry args={[0.34, 0.42, 0.25, 10]} />
          <primitive object={sandstoneDark} attach="material" />
        </mesh>
        {/* Crowned Guardian Head */}
        <mesh position={[0, 1.36, 0.12]}>
          <sphereGeometry args={[0.24, 10, 10]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        {/* Lion Snout / Jaws */}
        <mesh position={[0, 1.3, 0.3]}>
          <boxGeometry args={[0.2, 0.18, 0.2]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
