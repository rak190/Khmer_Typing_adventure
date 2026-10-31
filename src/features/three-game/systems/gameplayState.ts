import { lessonCurriculum, type CurriculumLevel } from '../../../data/lessonCurriculum';
import { calculateRewards } from '../../../lib/economy';
import { countKhmerCharacters, countKhmerWords, khmerTextEquals } from '../../../lib/khmerText';
import { buildLessonTypingPlan, type LessonTypingPlan, type TypingUnit } from '../../../lib/lessonTypingPlan';
import {
  calculateTypingMetrics,
  getLessonMinimumAccuracy,
  getLessonSpeedTargetCpm,
  type TypingMetricResult,
} from '../../../lib/typingMetrics';
import type { GateStatus, MovementInput, PrototypeReward, TypingSessionState } from '../types';

export const GATE_POSITION_Z = 6;
export const GATE_ALTAR_OFFSET_Z = -2.4;
export const GATE_INTERACTION_RADIUS = 3.6;
export const GATE_COLLISION_Z = 5.6;

export const COURTYARD_MIN_X = -13.0;
export const COURTYARD_MAX_X = 13.0;
export const COURTYARD_MIN_Z = -14.0;
export const COURTYARD_MAX_Z = 16.0;

export const EMPTY_MOVEMENT: MovementInput = Object.freeze({
  forward: false,
  backward: false,
  left: false,
  right: false,
});

const MOVEMENT_KEY_CODES = new Set([
  'KeyW',
  'ArrowUp',
  'KeyS',
  'ArrowDown',
  'KeyA',
  'ArrowLeft',
  'KeyD',
  'ArrowRight',
]);

export function isMovementKeyCode(code: string): boolean {
  return MOVEMENT_KEY_CODES.has(code);
}

export function getPrototypeDefaultLesson(): {
  lesson: CurriculumLevel;
  worldId: number;
  minimumAccuracy: number;
  speedTargetCpm: number;
} {
  const world = lessonCurriculum[0];
  const lesson = world.levels[0];
  const minimumAccuracy = getLessonMinimumAccuracy(lesson, world.id);
  const speedTargetCpm = getLessonSpeedTargetCpm(lesson, world.id);
  return { lesson, worldId: world.id, minimumAccuracy, speedTargetCpm };
}

export function createPrototypeTypingPlan(sliceLength = 12): LessonTypingPlan {
  const { lesson, worldId } = getPrototypeDefaultLesson();
  const fullPlan = buildLessonTypingPlan(lesson, worldId);
  const units = fullPlan.units.slice(0, Math.max(1, sliceLength));
  const targetText = units.map((u) => u.value).join('');
  return { targetText, units };
}

export function isPositionNearGate(x: number, z: number): boolean {
  const altarZ = GATE_POSITION_Z + GATE_ALTAR_OFFSET_Z;
  const distance = Math.hypot(x - 0, z - altarZ);
  return distance <= GATE_INTERACTION_RADIUS;
}

export function clampCharacterPosition(
  x: number,
  z: number,
  gateStatus: GateStatus,
): [number, number] {
  const clampedX = Math.max(COURTYARD_MIN_X, Math.min(COURTYARD_MAX_X, x));
  const maxAllowedZ = gateStatus === 'open' ? COURTYARD_MAX_Z : GATE_COLLISION_Z;
  const clampedZ = Math.max(COURTYARD_MIN_Z, Math.min(maxAllowedZ, z));
  return [clampedX, clampedZ];
}

export function computePrototypeMetrics(
  units: TypingUnit[],
  completedCount: number,
  incorrectCount: number,
  backspaceCount: number,
  bestStreak: number,
  elapsedMs: number,
  lesson: CurriculumLevel,
  worldId: number,
): TypingMetricResult {
  const typedUnits = units.slice(0, completedCount);
  const typedText = typedUnits.map((u) => u.value).join('');
  const speedTargetCpm = getLessonSpeedTargetCpm(lesson, worldId);
  const minimumAccuracy = getLessonMinimumAccuracy(lesson, worldId);

  return calculateTypingMetrics({
    completed: units.length > 0 && completedCount >= units.length,
    totalRequiredInputs: units.length,
    acceptedCorrectInputs: completedCount,
    incorrectInputs: incorrectCount,
    backspaceCount,
    elapsedMs: Math.max(1000, elapsedMs),
    correctKhmerCharacters: countKhmerCharacters(typedText),
    correctWords: countKhmerWords(typedText),
    bestStreak,
    speedTargetCpm,
    minimumAccuracy,
  });
}

/**
 * Gate unlocking strictly depends on the curriculum pass threshold (no 70% accuracy bypass).
 */
export function shouldUnlockGate(metrics: TypingMetricResult): boolean {
  return Boolean(metrics.passed);
}

export function createTypingSessionState(attemptId = 1): TypingSessionState {
  return {
    attemptId,
    completedCount: 0,
    incorrectCount: 0,
    backspaceCount: 0,
    streak: 0,
    bestStreak: 0,
    startedAt: null,
    endedAt: null,
    finished: false,
  };
}

export function applyTypedInput(
  state: TypingSessionState,
  units: TypingUnit[],
  typedValue: string,
  now: number,
): { nextState: TypingSessionState; matched: boolean; justFinished: boolean } {
  if (state.finished || state.completedCount >= units.length) {
    return { nextState: state, matched: false, justFinished: false };
  }

  const activeTarget = units[state.completedCount];
  if (!activeTarget) {
    return { nextState: state, matched: false, justFinished: false };
  }

  const startedAt = state.startedAt ?? now;

  if (khmerTextEquals(typedValue, activeTarget.value)) {
    const completedCount = state.completedCount + 1;
    const streak = state.streak + 1;
    const bestStreak = Math.max(state.bestStreak, streak);
    const finished = completedCount >= units.length;

    return {
      nextState: {
        ...state,
        startedAt,
        completedCount,
        streak,
        bestStreak,
        finished,
        endedAt: finished ? now : state.endedAt,
      },
      matched: true,
      justFinished: finished,
    };
  }

  return {
    nextState: {
      ...state,
      startedAt,
      incorrectCount: state.incorrectCount + 1,
      streak: 0,
    },
    matched: false,
    justFinished: false,
  };
}

export function applyBackspaceInput(state: TypingSessionState): TypingSessionState {
  if (state.finished) return state;
  return {
    ...state,
    completedCount: Math.max(0, state.completedCount - 1),
    backspaceCount: state.backspaceCount + 1,
    streak: 0,
  };
}

/**
 * Calculates in-memory reward without persisting or modifying live Firebase or student data.
 */
export function calculatePrototypeMemoryReward(
  metrics: TypingMetricResult,
  speedTargetCpm: number,
  worldId: number,
  lessonId: string | number,
  attemptId = 1,
  previousBestScore = 0,
  totalSessionXpBefore = 0,
  totalSessionCoinsBefore = 0,
): PrototypeReward {
  const calculated = calculateRewards({
    mode: 'lesson',
    accuracy: metrics.accuracy,
    CPM: metrics.cpm,
    targetCPM: speedTargetCpm,
    mistakes: metrics.errorCount,
    stars: metrics.stars,
    passed: metrics.passed,
    score: metrics.finalScore,
    previousBestScore,
    currentStreak: 1,
    worldId,
    lessonId: String(lessonId),
  });

  return {
    attemptId,
    xpEarned: calculated.xpEarned,
    coinsEarned: calculated.coinsEarned,
    stars: metrics.stars,
    passed: metrics.passed,
    score: metrics.finalScore,
    accuracy: metrics.accuracy,
    cpm: metrics.cpm,
    totalSessionXp: totalSessionXpBefore + calculated.xpEarned,
    totalSessionCoins: totalSessionCoinsBefore + calculated.coinsEarned,
  };
}

export type PrototypeRewardLedger = {
  claimAttemptReward: (
    attemptId: number,
    metrics: TypingMetricResult,
    speedTargetCpm: number,
    worldId: number,
    lessonId: string | number,
  ) => { reward: PrototypeReward; duplicate: boolean };
  hasClaimed: (attemptId: number) => boolean;
  getTotals: () => { totalXp: number; totalCoins: number; bestScore: number; claimedCount: number };
};

/**
 * In-memory reward ledger that guarantees idempotency per attemptId and never touches Firebase/localStorage.
 */
export function createPrototypeRewardLedger(): PrototypeRewardLedger {
  const claimedRewards = new Map<number, PrototypeReward>();
  let totalXp = 0;
  let totalCoins = 0;
  let bestScore = 0;

  return {
    claimAttemptReward(attemptId, metrics, speedTargetCpm, worldId, lessonId) {
      const existing = claimedRewards.get(attemptId);
      if (existing) {
        return { reward: existing, duplicate: true };
      }

      const reward = calculatePrototypeMemoryReward(
        metrics,
        speedTargetCpm,
        worldId,
        lessonId,
        attemptId,
        bestScore,
        totalXp,
        totalCoins,
      );

      claimedRewards.set(attemptId, reward);
      totalXp = reward.totalSessionXp;
      totalCoins = reward.totalSessionCoins;
      if (metrics.passed) {
        bestScore = Math.max(bestScore, metrics.finalScore);
      }

      return { reward, duplicate: false };
    },
    hasClaimed(attemptId) {
      return claimedRewards.has(attemptId);
    },
    getTotals() {
      return {
        totalXp,
        totalCoins,
        bestScore,
        claimedCount: claimedRewards.size,
      };
    },
  };
}

export type PlayerControlStore = {
  getSnapshot: () => MovementInput;
  subscribe: (listener: () => void) => () => void;
  setCanMove: (canMove: boolean) => void;
  getCanMove: () => boolean;
  handleKeyDown: (code: string) => boolean;
  handleKeyUp: (code: string) => void;
  clearKeys: () => void;
};

function movementEquals(a: MovementInput, b: MovementInput): boolean {
  return (
    a.forward === b.forward &&
    a.backward === b.backward &&
    a.left === b.left &&
    a.right === b.right
  );
}

/**
 * Pure external store managing exploration movement keys and mode-transition key clearing.
 */
export function createPlayerControlStore(initialCanMove = true): PlayerControlStore {
  const heldKeys = new Set<string>();
  const listeners = new Set<() => void>();
  let canMove = initialCanMove;
  let snapshot: MovementInput = EMPTY_MOVEMENT;

  function recomputeSnapshot() {
    const nextSnapshot: MovementInput = !canMove
      ? EMPTY_MOVEMENT
      : {
          forward: heldKeys.has('KeyW') || heldKeys.has('ArrowUp'),
          backward: heldKeys.has('KeyS') || heldKeys.has('ArrowDown'),
          left: heldKeys.has('KeyA') || heldKeys.has('ArrowLeft'),
          right: heldKeys.has('KeyD') || heldKeys.has('ArrowRight'),
        };

    if (!movementEquals(snapshot, nextSnapshot)) {
      snapshot = nextSnapshot;
      for (const listener of listeners) {
        listener();
      }
    }
  }

  return {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setCanMove(nextCanMove) {
      if (canMove === nextCanMove) return;
      canMove = nextCanMove;
      // Always clear held keys on any mode transition so keys never stick across modes
      heldKeys.clear();
      recomputeSnapshot();
    },
    getCanMove() {
      return canMove;
    },
    handleKeyDown(code) {
      if (!canMove || !isMovementKeyCode(code)) return false;
      heldKeys.add(code);
      recomputeSnapshot();
      return true;
    },
    handleKeyUp(code) {
      if (!isMovementKeyCode(code)) return;
      heldKeys.delete(code);
      recomputeSnapshot();
    },
    clearKeys() {
      if (heldKeys.size === 0 && movementEquals(snapshot, EMPTY_MOVEMENT)) return;
      heldKeys.clear();
      recomputeSnapshot();
    },
  };
}
