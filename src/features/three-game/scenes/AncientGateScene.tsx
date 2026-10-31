import type { MutableRefObject } from 'react';
import AncientStoneGate from '../components/AncientStoneGate';
import Character from '../components/Character';
import Environment from '../components/Environment';
import StageChallenges from '../components/StageChallenges';
import ThirdPersonCamera from '../components/ThirdPersonCamera';
import type { MovementInput } from '../hooks/usePlayerControls';
import { getStageBarrierIndex } from '../systems/gameplayState';
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
}: AncientGateSceneProps) {
  const activeBarrierIndex = getStageBarrierIndex(activeStageIndex, stageStatuses.length);
  const firstBarrierUnlockStageIndex = stageStatuses.length === 5 ? 1 : 0;

  return (
    <>
      {/* Third Person Camera with smooth tracking & cinematic sweeps */}
      <ThirdPersonCamera targetPositionRef={playerPositionRef} mode={mode} />

      {/* Cambodian Courtyard Environment & Warm Golden Lighting */}
      <Environment />

      {/* Playable Hero Character with Cambodian Regalia & Organic Blending */}
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
      />

      {/* Barrier 1: Ancient Angkor Stone Gate (ទ្វារអក្សរ / Glyph Gate at Z = 6) */}
      <AncientStoneGate
        gateState={gateState}
        streak={activeBarrierIndex === 0 ? streak : 0}
        completedCount={activeBarrierIndex === 0 ? completedCount : 0}
        incorrectCount={activeBarrierIndex === 0 ? incorrectCount : 0}
        onOpeningFinished={() => {
          onGateOpeningFinished();
          onStageOpeningFinished?.(firstBarrierUnlockStageIndex);
        }}
      />

      {/* Barrier 2 (ថ្មភ្លោះ / Twin Stones at Z = 16) & Barrier 3 (ផ្លូវព្រៃ / Jungle Path at Z = 26) */}
      <StageChallenges
        stageStatuses={stageStatuses}
        activeStageIndex={activeStageIndex}
        streak={streak}
        completedCount={completedCount}
        incorrectCount={incorrectCount}
        onStageOpeningFinished={onStageOpeningFinished}
      />
    </>
  );
}
