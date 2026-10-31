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
  onNearGateChange: (isNear: boolean) => void;
  onGateOpeningFinished: () => void;
};

export default function AncientGateScene({
  mode,
  playerPositionRef,
  gateState,
  movement,
  isModalOpen = false,
  onNearGateChange,
  onGateOpeningFinished,
}: AncientGateSceneProps) {
  return (
    <>
      {/* Third Person Camera with smooth tracking */}
      <ThirdPersonCamera targetPositionRef={playerPositionRef} mode={mode} />

      {/* Cambodian Courtyard Environment & Lighting */}
      <Environment />

      {/* Playable Hero Character */}
      <Character
        positionRef={playerPositionRef}
        movement={movement}
        mode={mode}
        gateStatus={gateState.status}
        isModalOpen={isModalOpen}
        onNearGateChange={onNearGateChange}
      />

      {/* Ancient Angkor Stone Gate */}
      <AncientStoneGate
        gateState={gateState}
        onOpeningFinished={onGateOpeningFinished}
      />
    </>
  );
}
