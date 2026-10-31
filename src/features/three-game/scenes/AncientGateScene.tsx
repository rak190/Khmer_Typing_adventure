import type { MutableRefObject } from 'react';
import AncientStoneGate from '../components/AncientStoneGate';
import Character from '../components/Character';
import Environment from '../components/Environment';
import ThirdPersonCamera from '../components/ThirdPersonCamera';
import type { MovementInput } from '../hooks/usePlayerControls';
import type { GameMode, GateState, Position3D } from '../types';

type AncientGateSceneProps = {
  mode: GameMode;
  playerPositionRef: MutableRefObject<Position3D>;
  gateState: GateState;
  movement: MovementInput;
  isModalOpen?: boolean;
  streak?: number;
  completedCount?: number;
  incorrectCount?: number;
  onNearGateChange: (isNear: boolean) => void;
  onGateOpeningFinished: () => void;
};

export default function AncientGateScene({
  mode,
  playerPositionRef,
  gateState,
  movement,
  isModalOpen = false,
  streak = 0,
  completedCount = 0,
  incorrectCount = 0,
  onNearGateChange,
  onGateOpeningFinished,
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
        isModalOpen={isModalOpen}
        onNearGateChange={onNearGateChange}
      />

      {/* Ancient Angkor Stone Gate with Dynamic Typing Feedback */}
      <AncientStoneGate
        gateState={gateState}
        streak={streak}
        completedCount={completedCount}
        incorrectCount={incorrectCount}
        onOpeningFinished={onGateOpeningFinished}
      />
    </>
  );
}
