import type { KhmerKeyboardKey, KeyboardModifier } from '../../data/keyboardMap';
import type { FingerId } from '../../lib/fingerGuidance';

export type GameMode = 'exploration' | 'typing' | 'opening' | 'completed';

export type Position3D = [number, number, number];

export type MovementInput = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

export type CharacterState = {
  position: Position3D;
  rotationY: number;
  isMoving: boolean;
  speed: number;
};

export type GateStatus = 'closed' | 'opening' | 'open';

export type GateState = {
  status: GateStatus;
  openProgress: number; // 0 (closed) to 1 (fully open)
};

export type FeedbackState = {
  code: string;
  state: 'correct' | 'wrong';
  message: string;
} | null;

export type FingerGuidanceState = {
  activeHand: 'left' | 'right' | 'thumb';
  activeFinger: FingerId;
  label: string;
  shiftRequired: boolean;
};

export type ActiveTargetInfo = {
  value: string;
  key: KhmerKeyboardKey;
  modifier: KeyboardModifier;
  hint: string;
};

export type TypingSessionState = {
  attemptId: number;
  completedCount: number;
  incorrectCount: number;
  backspaceCount: number;
  streak: number;
  bestStreak: number;
  startedAt: number | null;
  endedAt: number | null;
  finished: boolean;
};

export type PrototypeReward = {
  attemptId: number;
  xpEarned: number;
  coinsEarned: number;
  stars: number;
  passed: boolean;
  score: number;
  accuracy: number;
  cpm: number;
  totalSessionXp: number;
  totalSessionCoins: number;
};
