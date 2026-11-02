import { useMemo, type MutableRefObject } from 'react';
import AncientStoneGate from '../components/AncientStoneGate';
import Character from '../components/Character';
import Environment from '../components/Environment';
import InWorldWaypoint from '../components/InWorldWaypoint';
import SpellProjectileSystem from '../components/SpellProjectileSystem';
import World1SceneryAddon from '../components/World1SceneryAddon';
import type { AdventureNodeId } from '../../../data/adventureWorlds';
import StageChallenges from '../components/StageChallenges';
import TempleGuardianBoss from '../components/TempleGuardianBoss';
import ThirdPersonCamera from '../components/ThirdPersonCamera';
import FingerSanctuaryExperience from '../components/experiences/FingerSanctuaryExperience';
import LotusGardenExperience from '../components/experiences/LotusGardenExperience';
import TwinBridgesExperience from '../components/experiences/TwinBridgesExperience';
import JungleCrossroadsExperience from '../components/experiences/JungleCrossroadsExperience';
import TempleTowerClimbExperience from '../components/experiences/TempleTowerClimbExperience';
import SkyPlatformsExperience from '../components/experiences/SkyPlatformsExperience';
import CrystalCaveExperience from '../components/experiences/CrystalCaveExperience';
import SacredRiverExperience from '../components/experiences/SacredRiverExperience';
import { getLessonExperienceConfig, isCustomExperienceSupported } from '../config/lessonExperienceConfig';
import type { MovementInput } from '../hooks/usePlayerControls';
import { getStageAltarPositionZ, getStageBarrierIndex } from '../systems/gameplayState';
import type { GameMode, GateState, GateStatus, Position3D } from '../types';

type AncientGateSceneProps = {
  mode: GameMode;
  playerPositionRef: MutableRefObject<Position3D>;
  gateState: GateState;
  stageStatuses?: GateStatus[];
  activeStageIndex?: number;
  movement: MovementInput;
  isModalOpen?: boolean;
  streak?: number;
  completedCount?: number;
  incorrectCount?: number;
  onNearGateChange: (isNear: boolean) => void;
  onGateOpeningFinished: () => void;
  onStageOpeningFinished?: (stageIndex: number) => void;
  onInteract?: () => void;
  lessonId?: AdventureNodeId;
  stageId?: string;
  totalStageUnits?: number;
};

export default function AncientGateScene({
  mode,
  playerPositionRef,
  gateState,
  stageStatuses = [gateState.status],
  activeStageIndex = 0,
  movement,
  isModalOpen = false,
  streak = 0,
  completedCount = 0,
  incorrectCount = 0,
  onNearGateChange,
  onGateOpeningFinished,
  onStageOpeningFinished,
  onInteract,
  lessonId,
  stageId,
  totalStageUnits,
}: AncientGateSceneProps) {
  const activeBarrierIndex = getStageBarrierIndex(activeStageIndex, stageStatuses.length);
  const firstBarrierUnlockStageIndex = stageStatuses.length === 5 ? 1 : 0;

  const isCustomExp = isCustomExperienceSupported(lessonId);
  const expConfig = isCustomExp && lessonId ? getLessonExperienceConfig(lessonId) : null;
  const currentStation = expConfig?.stations?.[activeStageIndex];

  const activeAltarPosition = useMemo<Position3D>(() => {
    if (lessonId === 'boss') return [0, 0, 27.5];
    if (currentStation) return [...currentStation.position];
    return [0, 0, getStageAltarPositionZ(activeStageIndex, stageStatuses.length)];
  }, [activeStageIndex, currentStation, lessonId, stageStatuses.length]);

  const activeStationTitleKh = useMemo(() => {
    if (lessonId === 'boss') return 'អាសនៈអ្នកការពារប្រាសាទ';
    if (currentStation) return currentStation.stationTitleKh;
    return `អាសនៈទី ${activeStageIndex + 1}`;
  }, [activeStageIndex, currentStation, lessonId]);

  
  return (
    <>
      {/* Third Person Camera with smooth tracking, sprint dynamics & cinematic sweeps */}
      <ThirdPersonCamera
        targetPositionRef={playerPositionRef}
        mode={mode}
        isSprinting={movement.sprint}
      />

      {/* Cambodian Courtyard Environment & Warm Golden Lighting */}
      <Environment />

      {/* World 1 Scenic Dressing Add-on (LITE) */}
      <World1SceneryAddon quality="lite" />

      {/* Playable Hero Character with Cambodian Regalia, Sprint Locomotion & Spell Poses */}
      <Character
        positionRef={playerPositionRef}
        movement={movement}
        mode={mode}
        gateStatus={gateState.status}
        stageStatuses={stageStatuses}
        activeStageIndex={activeStageIndex}
        isModalOpen={isModalOpen}
        completedCount={completedCount}
        incorrectCount={incorrectCount}
        onNearGateChange={onNearGateChange}
        lessonId={lessonId}
      />

      {/* 3D In-World Dynamic Waypoint & Beacon */}
      <InWorldWaypoint
        activeStageIndex={activeStageIndex}
        playerPositionRef={playerPositionRef}
        targetPosition={activeAltarPosition}
        stationTitleKh={activeStationTitleKh}
        onInteract={() => onInteract?.()}
        mode={mode}
      />

      {/* 3D Spell Projectiles & Combat Popups */}
      <SpellProjectileSystem
        mode={mode}
        playerPositionRef={playerPositionRef}
        altarPosition={activeAltarPosition}
        completedCount={completedCount}
        incorrectCount={incorrectCount}
        streak={streak}
      />

      {/* World 1 Dedicated Variety Experiences (Lessons 1 to 8) */}
      {lessonId === 1 && (
        <FingerSanctuaryExperience
          activeStageIndex={activeStageIndex}
          stageStatuses={stageStatuses}
          streak={streak}
          completedCount={completedCount}
        />
      )}

      {lessonId === 2 && (
        <LotusGardenExperience
          activeStageIndex={activeStageIndex}
          stageStatuses={stageStatuses}
          streak={streak}
        />
      )}

      {lessonId === 3 && (
        <TwinBridgesExperience
          activeStageIndex={activeStageIndex}
          stageStatuses={stageStatuses}
          streak={streak}
        />
      )}

      {lessonId === 4 && (
        <JungleCrossroadsExperience
          activeStageIndex={activeStageIndex}
          stageStatuses={stageStatuses}
          streak={streak}
        />
      )}

      {lessonId === 5 && (
        <TempleTowerClimbExperience
          activeStageIndex={activeStageIndex}
          stageStatuses={stageStatuses}
        />
      )}

      {lessonId === 6 && (
        <SkyPlatformsExperience
          activeStageIndex={activeStageIndex}
          stageStatuses={stageStatuses}
          streak={streak}
        />
      )}

      {lessonId === 7 && (
        <CrystalCaveExperience
          activeStageIndex={activeStageIndex}
          stageStatuses={stageStatuses}
          streak={streak}
        />
      )}

      {lessonId === 8 && (
        <SacredRiverExperience
          activeStageIndex={activeStageIndex}
          stageStatuses={stageStatuses}
          streak={streak}
        />
      )}

      {/* World 1 Boss: Temple Guardian */}
      {lessonId === 'boss' && (
        <TempleGuardianBoss
          activeWaveIndex={activeStageIndex}
          waveStatus={gateState.status}
          isTypingMode={mode === 'typing'}
          completedCount={completedCount}
          streak={streak}
          incorrectCount={incorrectCount}
          isDefeated={mode === 'completed'}
          onNearBossChange={onNearGateChange}
          playerPositionRef={playerPositionRef}
        />
      )}

      {/* Legacy Fallback if ever needed */}
      {!isCustomExperienceSupported(lessonId) && lessonId !== 'boss' && (
        <>
          <AncientStoneGate
            gateState={gateState}
            playerPositionRef={playerPositionRef}
            streak={activeBarrierIndex === 0 ? streak : 0}
            completedCount={activeBarrierIndex === 0 ? completedCount : 0}
            incorrectCount={activeBarrierIndex === 0 ? incorrectCount : 0}
            onOpeningFinished={() => {
              onGateOpeningFinished();
              onStageOpeningFinished?.(firstBarrierUnlockStageIndex);
            }}
            lessonId={lessonId}
            stageId={stageId}
            totalStageUnits={totalStageUnits}
          />
          <StageChallenges
            stageStatuses={stageStatuses}
            activeStageIndex={activeStageIndex}
            streak={streak}
            completedCount={completedCount}
            incorrectCount={incorrectCount}
            onStageOpeningFinished={onStageOpeningFinished}
            lessonId={lessonId}
            stageId={stageId}
          />
        </>
      )}
    </>
  );
}
