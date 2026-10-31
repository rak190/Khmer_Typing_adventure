import type { MutableRefObject } from 'react';
import AncientStoneGate from '../components/AncientStoneGate';
import Character from '../components/Character';
import Environment from '../components/Environment';
import StageChallenges from '../components/StageChallenges';
import ThirdPersonCamera from '../components/ThirdPersonCamera';
import type { MovementInput } from '../hooks/usePlayerControls';
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
        onNearGateChange={onNearGateChange}
      />

      {/* Stage 1: Ancient Angkor Stone Gate (ទ្វារអក្សរ / Glyph Gate at Z = 6) */}
      <AncientStoneGate
        gateState={gateState}
        streak={activeStageIndex === 0 ? streak : 0}
        completedCount={activeStageIndex === 0 ? completedCount : 0}
        incorrectCount={activeStageIndex === 0 ? incorrectCount : 0}
        onOpeningFinished={() => {
          onGateOpeningFinished();
          onStageOpeningFinished?.(0);
        }}
      />

      {/* Stage 2 (ថ្មភ្លោះ / Twin Stones at Z = 16) & Stage 3 (ផ្លូវព្រៃ / Jungle Path at Z = 26) */}
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
