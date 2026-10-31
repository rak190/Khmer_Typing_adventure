import AncientStoneGate from '../components/AncientStoneGate';
import Character from '../components/Character';
import Environment from '../components/Environment';
import ThirdPersonCamera from '../components/ThirdPersonCamera';
import type { MovementInput } from '../hooks/usePlayerControls';
import type { GameMode, GateState, Position3D } from '../types';

type AncientGateSceneProps = {
  mode: GameMode;
  playerPosition: Position3D;
  gateState: GateState;
  movement: MovementInput;
  onPositionChange: (newPos: Position3D) => void;
  onGateOpeningFinished: () => void;
};

export default function AncientGateScene({
  mode,
  playerPosition,
  gateState,
  movement,
  onPositionChange,
  onGateOpeningFinished,
}: AncientGateSceneProps) {
  return (
    <>
      {/* Third Person Camera with smooth tracking */}
      <ThirdPersonCamera targetPosition={playerPosition} mode={mode} />

      {/* Cambodian Courtyard Environment & Lighting */}
      <Environment />

      {/* Playable Hero Character */}
      <Character
        position={playerPosition}
        movement={movement}
        mode={mode}
        gateStatus={gateState.status}
        onPositionChange={onPositionChange}
      />

      {/* Ancient Angkor Stone Gate */}
      <AncientStoneGate
        gateState={gateState}
        onOpeningFinished={onGateOpeningFinished}
      />
    </>
  );
}
