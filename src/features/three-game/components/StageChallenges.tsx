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

function TwinStonesChallenge({
  stageIndex,
  status,
  isActiveStage,
  isLocked,
  streak = 0,
  completedCount = 0,
  incorrectCount = 0,
  onOpeningFinished,
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
      {/* Flanking Stepped Sanctuary Obelisks */}
      <mesh position={[-3.3, 1.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 3.8, 1.15]} />
        <primitive object={sandstoneDark} attach="material" />
      </mesh>
      <mesh position={[-3.3, 4.1, 0]} castShadow>
        <coneGeometry args={[0.85, 0.9, 4]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>
      <mesh position={[3.3, 1.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 3.8, 1.15]} />
        <primitive object={sandstoneDark} attach="material" />
      </mesh>
      <mesh position={[3.3, 4.1, 0]} castShadow>
        <coneGeometry args={[0.85, 0.9, 4]} />
        <primitive object={sandstoneLight} attach="material" />
      </mesh>

      {/* Left Sliding Twin Monolith */}
      <group ref={leftMonolithRef} position={[-0.95, 0, 0]}>
        <mesh position={[0, 1.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.82, 3.5, 0.85]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        <mesh position={[0, 3.85, 0]} castShadow>
          <coneGeometry args={[1.15, 0.75, 4]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        <mesh position={[0.15, 1.95, -0.44]}>
          <boxGeometry args={[0.32, 2.2, 0.04]} />
          <meshStandardMaterial
            ref={leftRuneStripRef}
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Right Sliding Twin Monolith */}
      <group ref={rightMonolithRef} position={[0.95, 0, 0]}>
        <mesh position={[0, 1.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.82, 3.5, 0.85]} />
          <primitive object={sandstoneMedium} attach="material" />
        </mesh>
        <mesh position={[0, 3.85, 0]} castShadow>
          <coneGeometry args={[1.15, 0.75, 4]} />
          <primitive object={sandstoneLight} attach="material" />
        </mesh>
        <mesh position={[-0.15, 1.95, -0.44]}>
          <boxGeometry args={[0.32, 2.2, 0.04]} />
          <meshStandardMaterial
            ref={rightRuneStripRef}
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
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
    </group>
  );
}

function JunglePathChallenge({
  stageIndex,
  status,
  isActiveStage,
  isLocked,
  streak = 0,
  completedCount = 0,
  incorrectCount = 0,
  onOpeningFinished,
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

  const mossyStone = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#4E5E42', roughness: 0.92 }),
    [],
  );
  const ancientRootWood = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#4A3728', roughness: 0.9 }),
    [],
  );
  const emeraldFoliage = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2E7D32', roughness: 0.82 }),
    [],
  );
  const goldenTrim = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#D97706', metalness: 0.55, roughness: 0.35 }),
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
        portalLightRef.current.intensity = ease * 2.8;
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
      <pointLight
        ref={portalLightRef}
        position={[0, 2.4, 0.8]}
        color="#FDE68A"
        intensity={0}
        distance={14}
        decay={2}
      />

      {/* Mossy Sanctuary Arch Pillars */}
      <mesh position={[-2.25, 2.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 4.6, 1.15]} />
        <primitive object={mossyStone} attach="material" />
      </mesh>
      <mesh position={[2.25, 2.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 4.6, 1.15]} />
        <primitive object={mossyStone} attach="material" />
      </mesh>

      {/* Ta Prohm Banyan Root Tendrils Embracing Arch */}
      <mesh position={[-2.1, 3.6, -0.35]} rotation={[0, 0, -0.32]} castShadow>
        <cylinderGeometry args={[0.14, 0.26, 2.8, 8]} />
        <primitive object={ancientRootWood} attach="material" />
      </mesh>
      <mesh position={[2.1, 3.6, -0.35]} rotation={[0, 0, 0.32]} castShadow>
        <cylinderGeometry args={[0.14, 0.26, 2.8, 8]} />
        <primitive object={ancientRootWood} attach="material" />
      </mesh>

      {/* Jungle Canopy Crown Lintel */}
      <mesh position={[0, 4.85, 0]} castShadow>
        <boxGeometry args={[5.8, 0.75, 1.25]} />
        <primitive object={mossyStone} attach="material" />
      </mesh>
      <mesh position={[0, 5.45, 0]} castShadow>
        <boxGeometry args={[4.4, 0.6, 1.1]} />
        <primitive object={emeraldFoliage} attach="material" />
      </mesh>
      <mesh position={[0, 6.05, 0]} castShadow>
        <coneGeometry args={[0.5, 0.95, 8]} />
        <primitive object={goldenTrim} attach="material" />
      </mesh>

      {/* Left Jungle Arch Door Leaf */}
      <group ref={leftGateRef} position={[-1.7, 0, 0]}>
        <mesh position={[0.82, 2.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.66, 4.0, 0.26]} />
          <primitive object={ancientRootWood} attach="material" />
        </mesh>
        <mesh position={[0.82, 2.15, -0.15]}>
          <boxGeometry args={[1.28, 3.3, 0.06]} />
          <primitive object={mossyStone} attach="material" />
        </mesh>
        <mesh position={[1.38, 2.15, -0.2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 10]} />
          <primitive object={goldenTrim} attach="material" />
        </mesh>
      </group>

      {/* Right Jungle Arch Door Leaf */}
      <group ref={rightGateRef} position={[1.7, 0, 0]}>
        <mesh position={[-0.82, 2.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.66, 4.0, 0.26]} />
          <primitive object={ancientRootWood} attach="material" />
        </mesh>
        <mesh position={[-0.82, 2.15, -0.15]}>
          <boxGeometry args={[1.28, 3.3, 0.06]} />
          <primitive object={mossyStone} attach="material" />
        </mesh>
        <mesh position={[-1.38, 2.15, -0.2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 10]} />
          <primitive object={goldenTrim} attach="material" />
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
};

export default function StageChallenges({
  stageStatuses,
  activeStageIndex,
  streak = 0,
  completedCount = 0,
  incorrectCount = 0,
  onStageOpeningFinished,
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
        />
      )}
    </group>
  );
}
