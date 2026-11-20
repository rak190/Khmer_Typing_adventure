import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';
import Character from '../components/Character';
import type { MovementInput } from '../types';
import type { AdventureNodeId } from '../../../data/adventureWorlds';
import type { GameMode, GateStatus, Position3D } from '../types';
import { gameAudio } from '../../../lib/audio/gameAudio';

export type KinematicPlayerProps = {
  positionRef: MutableRefObject<Position3D>;
  movement: MovementInput;
  mode: GameMode;
  gateStatus: GateStatus;
  stageStatuses?: GateStatus[];
  activeStageIndex?: number;
  isModalOpen?: boolean;
  completedCount?: number;
  incorrectCount?: number;
  onNearGateChange: (isNear: boolean) => void;
  lessonId?: AdventureNodeId;
  skinStyleId?: string;
  avatarId?: string;
  respawnPosition?: [number, number, number];
  onHazardReset?: () => void;
};

const GRAVITY = -22.0;
const JUMP_VELOCITY = 8.8;
const MAX_FALL_SPEED = -28.0;

export default function KinematicPlayer({
  positionRef,
  movement,
  mode,
  gateStatus,
  stageStatuses,
  activeStageIndex = 0,
  isModalOpen = false,
  completedCount = 0,
  incorrectCount = 0,
  onNearGateChange,
  lessonId,
  skinStyleId,
  avatarId,
  respawnPosition = [0, 0, -8],
  onHazardReset,
}: KinematicPlayerProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const verticalVelocityRef = useRef<number>(0);
  const isGroundedRef = useRef<boolean>(true);
  const coyoteTimerRef = useRef<number>(0);
  const jumpBufferRef = useRef<number>(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const canMove = (mode === 'exploration' || mode === 'completed') && !isModalOpen;

    // 1. Jump buffer & input detection
    if (canMove && movement.jump) {
      jumpBufferRef.current = 0.14;
    } else if (jumpBufferRef.current > 0) {
      jumpBufferRef.current -= dt;
    }

    // 2. Jumping execution with coyote time allowance
    const canJump = isGroundedRef.current || coyoteTimerRef.current > 0;
    if (canMove && jumpBufferRef.current > 0 && canJump) {
      verticalVelocityRef.current = JUMP_VELOCITY;
      isGroundedRef.current = false;
      coyoteTimerRef.current = 0;
      jumpBufferRef.current = 0;
      gameAudio.playFootstep(true);
    }

    // 3. Vertical physics & gravity integration
    if (!isGroundedRef.current) {
      verticalVelocityRef.current += GRAVITY * dt;
      if (verticalVelocityRef.current < MAX_FALL_SPEED) {
        verticalVelocityRef.current = MAX_FALL_SPEED;
      }
      positionRef.current[1] += verticalVelocityRef.current * dt;
      if (coyoteTimerRef.current > 0) {
        coyoteTimerRef.current -= dt;
      }
    }

    // 4. Ground floor boundary detection
    // Base courtyard / floor elevation sits at Y=0 (or higher on elevated terraces)
    const baseGroundY = 0;
    if (positionRef.current[1] <= baseGroundY && verticalVelocityRef.current <= 0) {
      positionRef.current[1] = baseGroundY;
      verticalVelocityRef.current = 0;
      isGroundedRef.current = true;
      coyoteTimerRef.current = 0.12;
    } else if (positionRef.current[1] > baseGroundY + 0.05) {
      isGroundedRef.current = false;
    }

    // 5. Hazard & Void Fall Recovery: restore player safely with zero heart or progress loss
    if (positionRef.current[1] < -12.0) {
      positionRef.current[0] = respawnPosition[0];
      positionRef.current[1] = Math.max(0, respawnPosition[1]);
      positionRef.current[2] = respawnPosition[2];
      verticalVelocityRef.current = 0;
      isGroundedRef.current = true;
      gameAudio.playMechanismActivation();
      onHazardReset?.();
    }

    // 6. Kinematic body translation synchronization
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation(
        {
          x: positionRef.current[0],
          y: positionRef.current[1],
          z: positionRef.current[2],
        },
        true,
      );
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      colliders={false}
      position={[0, 0, 0]}
    >
      <CapsuleCollider args={[0.65, 0.35]} position={[0, 0.9, 0]} />
      <Character
        positionRef={positionRef}
        movement={movement}
        mode={mode}
        gateStatus={gateStatus}
        stageStatuses={stageStatuses}
        activeStageIndex={activeStageIndex}
        isModalOpen={isModalOpen}
        completedCount={completedCount}
        incorrectCount={incorrectCount}
        onNearGateChange={onNearGateChange}
        lessonId={lessonId}
        skinStyleId={skinStyleId}
        avatarId={avatarId}
      />
    </RigidBody>
  );
}
