import type { AdventureNodeId } from '../../../data/adventureWorlds';
import {
  lessonCurriculum,
  type CurriculumLevel,
  type CurriculumStage,
} from '../../../data/lessonCurriculum';
import {
  foundationCurriculumWorld,
  foundationHomeRowLesson,
} from '../../../data/touchTypingFoundations';

import { calculateRewards } from '../../../lib/economy';
import { countKhmerCharacters, countKhmerWords, khmerTextEquals } from '../../../lib/khmerText';
import {
  buildLessonTypingPlan,
  buildStageTypingPlan,
  type LessonTypingPlan,
  type TypingUnit,
} from '../../../lib/lessonTypingPlan';
import {
  calculateTypingMetrics,
  getLessonMinimumAccuracy,
  getLessonSpeedTargetCpm,
  type TypingMetricResult,
} from '../../../lib/typingMetrics';
import type {
  GateStatus,
  MovementInput,
  PrototypeReward,
  StageProgressState,
  ThreeLessonCompletionPayload,
  ThreeLessonConfig,
  ThreeLessonPersistenceAdapter,
  TypingSessionState,
} from '../types';

export const GATE_POSITION_Z = 6;
export const GATE_ALTAR_OFFSET_Z = -2.4;
export const GATE_INTERACTION_RADIUS = 3.6;
export const GATE_COLLISION_Z = 5.6;

export const STAGE_BASE_Z = 6;
export const STAGE_SPACING_Z = 10;
export const MULTI_STAGE_MAX_Z = 30.0;

export const COURTYARD_MIN_X = -13.0;
export const COURTYARD_MAX_X = 13.0;
export const COURTYARD_MIN_Z = -14.0;
export const COURTYARD_MAX_Z = 16.0;

export const EMPTY_MOVEMENT: MovementInput = Object.freeze({
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
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
  'ShiftLeft',
  'ShiftRight',
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

/**
 * Resolves the 5-stage Touch-Typing Foundation lesson configuration for 3D practice.
 */
export function resolveFoundationLessonConfig(): ThreeLessonConfig {
  const lessonMinimumAccuracy = getLessonMinimumAccuracy(foundationHomeRowLesson, 1);
  const lessonSpeedTargetCpm = getLessonSpeedTargetCpm(foundationHomeRowLesson, 1);

  return {
    worldId: foundationCurriculumWorld.id,
    worldNameKh: foundationCurriculumWorld.titleKh,
    worldNameEn: foundationCurriculumWorld.title,
    lesson: foundationHomeRowLesson,
    stages: foundationHomeRowLesson.stages,
    lessonMinimumAccuracy,
    lessonSpeedTargetCpm,
    isFoundationLesson: true,
  };
}

/**
 * Resolves any curriculum world and lesson into a reusable 3D lesson configuration.
 * Rejects unknown IDs. Route availability is checked separately before rendering.
 */
export function resolveThreeLessonConfig(
  worldId = 1,
  levelId: AdventureNodeId = 1,
): ThreeLessonConfig {
  const world = lessonCurriculum.find((w) => w.id === worldId);
  const lesson = world?.levels.find((l) => l.id === levelId);
  if (!world || !lesson) throw new RangeError('Unknown 3D curriculum world or lesson.');
  const lessonMinimumAccuracy = getLessonMinimumAccuracy(lesson, world.id);
  const lessonSpeedTargetCpm = getLessonSpeedTargetCpm(lesson, world.id);

  return {
    worldId: world.id,
    worldNameKh: world.titleKh,
    worldNameEn: world.title,
    lesson,
    stages: lesson.stages,
    lessonMinimumAccuracy,
    lessonSpeedTargetCpm,
    isFoundationLesson: false,
  };
}

export function getStageMinimumAccuracy(
  stage: CurriculumStage,
  lesson: CurriculumLevel,
  worldId: number,
): number {
  const stageGoal = Number(stage.accuracyGoal);
  if (Number.isFinite(stageGoal) && stageGoal > 0) {
    return Math.max(1, Math.min(100, Math.round(stageGoal)));
  }
  return getLessonMinimumAccuracy(lesson, worldId);
}

export function createStageTypingPlan(
  stage: CurriculumStage,
  fallbackItems?: string[],
): LessonTypingPlan {
  return buildStageTypingPlan(stage, fallbackItems);
}

export function createPrototypeTypingPlan(sliceLength = 12): LessonTypingPlan {
  const { lesson, worldId } = getPrototypeDefaultLesson();
  const fullPlan = buildLessonTypingPlan(lesson, worldId);
  const units = fullPlan.units.slice(0, Math.max(1, sliceLength));
  const targetText = units.map((u) => u.value).join('');
  return { targetText, units };
}

/**
 * Maps a stage index to one of the 3 physical temple barriers along the causeway (0, 1, 2).
 * - For standard 3-stage lessons: stage 0 -> barrier 0, stage 1 -> barrier 1, stage 2 -> barrier 2.
 * - For 5-stage Foundation lessons: stages 0..1 -> barrier 0, stages 2..3 -> barrier 1, stage 4 -> barrier 2.
 */
export function getStageBarrierIndex(stageIndex: number, totalStages = 3): number {
  const clamped = Math.max(0, stageIndex);
  if (totalStages === 5) {
    if (clamped <= 1) return 0;
    if (clamped <= 3) return 1;
    return 2;
  }
  return Math.min(2, clamped);
}

export function doesStageUnlockPhysicalBarrier(stageIndex: number, totalStages = 3): boolean {
  if (totalStages === 5) {
    return stageIndex === 1 || stageIndex === 3 || stageIndex === 4;
  }
  return true;
}

export function getPhysicalBarrierStatuses(stageStatuses: GateStatus[]): GateStatus[] {
  if (stageStatuses.length === 5) {
    return [
      stageStatuses[1] ?? 'closed',
      stageStatuses[3] ?? 'closed',
      stageStatuses[4] ?? 'closed',
    ];
  }
  return stageStatuses;
}

export function getStagePositionZ(stageIndex: number, totalStages = 3): number {
  const barrierIndex = getStageBarrierIndex(stageIndex, totalStages);
  return STAGE_BASE_Z + barrierIndex * STAGE_SPACING_Z;
}

export function getStageAltarPositionZ(stageIndex: number, totalStages = 3): number {
  return getStagePositionZ(stageIndex, totalStages) + GATE_ALTAR_OFFSET_Z;
}

export function getStageCollisionZ(stageIndex: number, totalStages = 3): number {
  return getStagePositionZ(stageIndex, totalStages) - 0.4;
}

export function isPositionNearStage(
  x: number,
  z: number,
  stageIndex: number,
  totalStages = 3,
): boolean {
  const altarZ = getStageAltarPositionZ(stageIndex, totalStages);
  const distance = Math.hypot(x - 0, z - altarZ);
  return distance <= GATE_INTERACTION_RADIUS;
}

export function isPositionNearGate(x: number, z: number): boolean {
  return isPositionNearStage(x, z, 0, 3);
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

export function clampMultiStageCharacterPosition(
  x: number,
  z: number,
  stageStatuses: GateStatus[],
): [number, number] {
  const clampedX = Math.max(COURTYARD_MIN_X, Math.min(COURTYARD_MAX_X, x));
  const barrierStatuses = getPhysicalBarrierStatuses(stageStatuses);
  const firstClosedIndex = barrierStatuses.findIndex((status) => status !== 'open');
  const maxAllowedZ =
    firstClosedIndex === -1 ? MULTI_STAGE_MAX_Z : getStageCollisionZ(firstClosedIndex, 3);
  const clampedZ = Math.max(COURTYARD_MIN_Z, Math.min(maxAllowedZ, z));
  return [clampedX, clampedZ];
}

/**
 * World 1 geometry-accurate character boundary clamping.
 * Prevents walking on water in Lesson 2 & 8, floating over chasm in Lesson 3,
 * falling off sky platforms in Lesson 6, and enforces locked stage progression.
 */
export function clampLessonCharacterPosition(
  x: number,
  z: number,
  lessonId?: AdventureNodeId,
  stageStatuses: GateStatus[] = [],
): [number, number] {
  if (lessonId === 'boss') {
    return [
      Math.max(-8.0, Math.min(8.0, x)),
      Math.max(18.0, Math.min(31.0, z)),
    ];
  }

  // A passing result starts the visual reveal. Traversal waits until that reveal
  // finishes and the existing stage controller commits the 'open' status.
  const s0Open = stageStatuses[0] === 'open';
  const s1Open = stageStatuses[1] === 'open';
  const s2Open = stageStatuses[2] === 'open';

  if (lessonId === 1) {
    const maxZ = s2Open ? 10.0 : s0Open ? 6.5 : 2.5;
    return [
      Math.max(-7.0, Math.min(7.0, x)),
      Math.max(-6.5, Math.min(maxZ, z)),
    ];
  }

  if (lessonId === 2) {
    // Lotus Garden: water pool with stepping lotus pads & solid plinths
    let maxZ = 2.5;
    if (s0Open) maxZ = 8.5;
    if (s1Open) maxZ = 14.0;
    if (s2Open) maxZ = 16.5;

    const clampedZ = Math.max(-6.0, Math.min(maxZ, z));
    // When on water area (Z > 0), constrain strictly to lotus stepping corridor
    const clampedX = clampedZ > 0
      ? Math.max(-2.5, Math.min(2.5, x))
      : Math.max(-3.5, Math.min(3.5, x));
    return [clampedX, clampedZ];
  }

  if (lessonId === 3) {
    // Twin Bridges: Left Causeway [-3.8, -1.8], Right Causeway [1.8, 3.8],
    // and Mid-Chasm Pier Platform at [0, 0, 10.5] (Z in [8.5, 12.5], X in [-2.6, 2.6])
    let maxZ = 3.0;
    if (s0Open) maxZ = 12.5;
    if (s1Open) maxZ = 21.5; // Stage 3 altar is at Z = 20.
    if (s2Open) maxZ = 22.5;

    let clampedZ = Math.max(-6.5, Math.min(maxZ, z));
    const clampedX = Math.max(-4.2, Math.min(4.2, x));

    // Over the chasm (Z > 0.5 and Z < 18.5)
    if (clampedZ > 0.5 && clampedZ < 18.5) {
      const isOnMidChasmPier = s0Open && clampedZ >= 8.5 && clampedZ <= 12.5;
      const isArchCrossing = s1Open && clampedZ >= 7.5 && clampedZ <= 13.5;
      const isKeystoneBridged = s2Open;
      if (!isOnMidChasmPier && !isArchCrossing && !isKeystoneBridged) {
        // Keep the player at the last safe edge until they steer onto a causeway.
        // Snapping X onto a side bridge caused a jarring sideways teleport.
        if (clampedX > -1.8 && clampedX < 1.8) {
          clampedZ = clampedZ < 8.5 ? 0.5 : clampedZ < 13.5 ? 12.5 : 13.5;
        }
      }
    }
    return [clampedX, clampedZ];
  }

  if (lessonId === 4) {
    // Jungle Crossroads: West grove trail & East shrine trail
    let maxZ = 3.0;
    if (s0Open) maxZ = 12.5;
    if (s1Open) maxZ = 21.0;
    if (s2Open) maxZ = 24.5;

    const clampedZ = Math.max(-6.5, Math.min(maxZ, z));
    let clampedX = Math.max(-5.5, Math.min(5.5, x));
    if (clampedZ > 3.0 && clampedZ <= 12.0 && !s1Open) {
      // West branch exploration
      clampedX = Math.max(-5.5, Math.min(1.0, clampedX));
    }
    return [clampedX, clampedZ];
  }

  if (lessonId === 5) {
    // Temple Tower Climb: stairs and elevated terraces (Station 2 at Z = 20.0)
    let maxZ = 4.2;
    if (s0Open) maxZ = 14.5;
    if (s1Open) maxZ = 22.0; // Reachable to Crown Terrace Altar at Z = 20.0
    if (s2Open) maxZ = 25.5;

    const clampedZ = Math.max(-6.5, Math.min(maxZ, z));
    // Flights of stairs are narrower than terraces
    let clampedX = Math.max(-5.5, Math.min(5.5, x));
    if ((clampedZ > 4.0 && clampedZ < 7.0) || (clampedZ > 14.5 && clampedZ < 18.0)) {
      clampedX = Math.max(-2.5, Math.min(2.5, clampedX));
    }
    return [clampedX, clampedZ];
  }

  if (lessonId === 6) {
    // Sky Platforms: floating stone platforms corridor (Station 2 at Z = 20.0)
    let maxZ = 2.5;
    if (s0Open) maxZ = 11.5;
    if (s1Open) maxZ = 21.5; // Reachable to Overlook Sanctuary Altar at Z = 20.0
    if (s2Open) maxZ = 24.5;

    const clampedZ = Math.max(-6.0, Math.min(maxZ, z));
    const clampedX = clampedZ > 1.0 && clampedZ < 19.0
      ? Math.max(-2.2, Math.min(2.2, x))
      : Math.max(-3.0, Math.min(3.0, x));
    return [clampedX, clampedZ];
  }

  if (lessonId === 7) {
    // Crystal Cave: basalt subterranean hall
    let maxZ = 3.5;
    if (s0Open) maxZ = 13.5;
    if (s1Open) maxZ = 21.0;
    if (s2Open) maxZ = 25.0;

    return [
      Math.max(-3.8, Math.min(3.8, x)),
      Math.max(-6.0, Math.min(maxZ, z)),
    ];
  }

  if (lessonId === 8) {
    // Sacred River: Pier 0 -> Dragon Barge Bridge -> Mid Island Pier 1 -> Dragon Barge Bridge -> Pier 2
    let maxZ = 1.5;
    if (s0Open) maxZ = 11.5;
    if (s1Open) maxZ = 21.0;
    if (s2Open) maxZ = 25.5;

    const clampedZ = Math.max(-6.0, Math.min(maxZ, z));
    // Continuous central traversable corridor across piers and moored dragon barge deck
    const clampedX = Math.max(-2.5, Math.min(2.5, x));
    return [clampedX, clampedZ];
  }

  // Fallback for default multi-stage scene
  if (stageStatuses.length > 0) {
    return clampMultiStageCharacterPosition(x, z, stageStatuses);
  }
  return clampCharacterPosition(x, z, stageStatuses[0] ?? 'closed');
}

/**
 * Computes world movement delta and target facing rotation from player input.
 * In this 3D camera coordinate space (camera at negative Z looking toward positive Z):
 * - movement.forward moves toward +Z (gate direction, rotation = 0)
 * - movement.backward moves toward -Z (camera direction, rotation = PI)
 * - movement.left moves toward +X (screen-left, rotation = PI/2)
 * - movement.right moves toward -X (screen-right, rotation = -PI/2)
 * Diagonals are normalized so speed remains constant.
 */
export function computeMovementDelta(
  movement: MovementInput,
  canMove: boolean,
): {
  moveX: number;
  moveZ: number;
  dirX: number;
  dirZ: number;
  isMoving: boolean;
  targetRotation: number;
} {
  if (!canMove) {
    return { moveX: 0, moveZ: 0, dirX: 0, dirZ: 0, isMoving: false, targetRotation: 0 };
  }

  let moveX = 0;
  let moveZ = 0;

  if (movement.forward) moveZ += 1;
  if (movement.backward) moveZ -= 1;
  if (movement.left) moveX += 1; // Screen-left
  if (movement.right) moveX -= 1; // Screen-right

  const isMoving = moveX !== 0 || moveZ !== 0;
  if (!isMoving) {
    return { moveX: 0, moveZ: 0, dirX: 0, dirZ: 0, isMoving: false, targetRotation: 0 };
  }

  const length = Math.hypot(moveX, moveZ);
  const dirX = moveX / length;
  const dirZ = moveZ / length;
  const targetRotation = Math.atan2(dirX, dirZ);

  return { moveX, moveZ, dirX, dirZ, isMoving, targetRotation };
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
 * Computes typing metrics for a specific curriculum stage using that stage's accuracyGoal.
 * For example, World 1 Lesson 1 Stage 1 & 2 require 90% accuracy, while Stage 3 requires 92% accuracy.
 */
export function computeStageMetrics(
  units: TypingUnit[],
  completedCount: number,
  incorrectCount: number,
  backspaceCount: number,
  bestStreak: number,
  elapsedMs: number,
  stage: CurriculumStage,
  lesson: CurriculumLevel,
  worldId: number,
): TypingMetricResult {
  const typedUnits = units.slice(0, completedCount);
  const typedText = typedUnits.map((u) => u.value).join('');
  const speedTargetCpm = getLessonSpeedTargetCpm(lesson, worldId);
  const minimumAccuracy = getStageMinimumAccuracy(stage, lesson, worldId);

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

/**
 * Stage barrier unlocking strictly depends on the stage's curriculum accuracyGoal.
 */
export function shouldUnlockStage(metrics: TypingMetricResult): boolean {
  return Boolean(metrics.passed);
}

export function createInitialStageProgressStates(
  stages: CurriculumStage[],
): StageProgressState[] {
  return stages.map((stage, index) => ({
    stageId: stage.id,
    stageIndex: index,
    status: 'closed',
    attempts: 0,
    passed: false,
    bestAccuracy: 0,
    bestCpm: 0,
    bestScore: 0,
    bestStars: 0,
    lastMetrics: null,
    completedCount: 0,
    incorrectCount: 0,
    backspaceCount: 0,
    bestStreak: 0,
    elapsedMs: 0,
    totalUnits: 0,
    typedText: '',
  }));
}

/**
 * Verifies whether a stage challenge can be started:
 * - Must be within valid range and match the active stage index (no skipping ahead).
 * - All earlier stages must be passed and unlocked ('open').
 * - Target stage must currently be 'closed'.
 */
export function canAccessStage(
  stageIndex: number,
  currentStageIndex: number,
  stageStates: StageProgressState[],
): boolean {
  if (stageIndex < 0 || stageIndex >= stageStates.length) return false;
  if (stageIndex !== currentStageIndex) return false;
  for (let i = 0; i < stageIndex; i += 1) {
    const prev = stageStates[i];
    if (!prev || !prev.passed || prev.status !== 'open') {
      return false;
    }
  }
  const target = stageStates[stageIndex];
  return Boolean(target && target.status === 'closed');
}

export function recordStageAttemptResult(
  stageStates: StageProgressState[],
  stageIndex: number,
  metrics: TypingMetricResult,
  session: TypingSessionState,
  units: TypingUnit[],
  elapsedMs: number,
  nextStatus?: GateStatus,
): StageProgressState[] {
  const typedText = units
    .slice(0, session.completedCount)
    .map((u) => u.value)
    .join('');

  return stageStates.map((stage, index) => {
    if (index !== stageIndex) return stage;
    const passedNow = Boolean(metrics.passed);
    const shouldUpdateRunStats = passedNow || !stage.passed;

    return {
      ...stage,
      status: nextStatus ?? (passedNow ? 'opening' : 'closed'),
      attempts: stage.attempts + 1,
      passed: stage.passed || passedNow,
      bestAccuracy: Math.max(stage.bestAccuracy, metrics.accuracy),
      bestCpm: Math.max(stage.bestCpm, metrics.cpm),
      bestScore: Math.max(stage.bestScore, metrics.finalScore),
      bestStars: Math.max(stage.bestStars, metrics.stars),
      lastMetrics: metrics,
      completedCount: shouldUpdateRunStats ? session.completedCount : stage.completedCount,
      incorrectCount: shouldUpdateRunStats ? session.incorrectCount : stage.incorrectCount,
      backspaceCount: shouldUpdateRunStats ? session.backspaceCount : stage.backspaceCount,
      bestStreak: shouldUpdateRunStats
        ? Math.max(stage.bestStreak, session.bestStreak)
        : stage.bestStreak,
      elapsedMs: shouldUpdateRunStats ? Math.max(1000, elapsedMs) : stage.elapsedMs,
      totalUnits: shouldUpdateRunStats ? units.length : stage.totalUnits,
      typedText: shouldUpdateRunStats ? typedText : stage.typedText,
    };
  });
}

export function setStageGateStatus(
  stageStates: StageProgressState[],
  stageIndex: number,
  status: GateStatus,
): StageProgressState[] {
  return stageStates.map((stage, index) =>
    index === stageIndex ? { ...stage, status } : stage,
  );
}

export function areAllStagesCompleted(stageStates: StageProgressState[]): boolean {
  return (
    stageStates.length > 0 &&
    stageStates.every((stage) => stage.passed && stage.status === 'open')
  );
}

export function computeFinalLessonMetrics(
  stageStates: StageProgressState[],
  lesson: CurriculumLevel,
  worldId: number,
): TypingMetricResult {
  const allPassed = stageStates.length > 0 && stageStates.every((s) => s.passed);
  const totalRequiredInputs = stageStates.reduce((sum, s) => sum + s.totalUnits, 0);
  const acceptedCorrectInputs = stageStates.reduce((sum, s) => sum + s.completedCount, 0);
  const incorrectInputs = stageStates.reduce((sum, s) => sum + s.incorrectCount, 0);
  const backspaceCount = stageStates.reduce((sum, s) => sum + s.backspaceCount, 0);
  const elapsedMs = Math.max(
    1000,
    stageStates.reduce((sum, s) => sum + Math.max(0, s.elapsedMs), 0),
  );
  const combinedChars = stageStates.map((s) => s.typedText).join('');
  const combinedWordsText = stageStates.map((s) => s.typedText).filter(Boolean).join(' ');
  const bestStreak = stageStates.reduce((max, s) => Math.max(max, s.bestStreak), 0);
  const speedTargetCpm = getLessonSpeedTargetCpm(lesson, worldId);
  const minimumAccuracy = getLessonMinimumAccuracy(lesson, worldId);

  return calculateTypingMetrics({
    completed: allPassed && totalRequiredInputs > 0 && acceptedCorrectInputs >= totalRequiredInputs,
    totalRequiredInputs,
    acceptedCorrectInputs,
    incorrectInputs,
    backspaceCount,
    elapsedMs,
    correctKhmerCharacters: countKhmerCharacters(combinedChars),
    correctWords: countKhmerWords(combinedWordsText),
    bestStreak,
    speedTargetCpm,
    minimumAccuracy,
  });
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
  typedCode?: string,
): { nextState: TypingSessionState; matched: boolean; justFinished: boolean } {
  if (state.finished || state.completedCount >= units.length) {
    return { nextState: state, matched: false, justFinished: false };
  }

  const activeTarget = units[state.completedCount];
  if (!activeTarget) {
    return { nextState: state, matched: false, justFinished: false };
  }

  const startedAt = state.startedAt ?? now;

  const isPhysicalMode =
    activeTarget.practiceMode === 'physical-key' ||
    activeTarget.practiceMode === 'hand-position';

  const isMatch = isPhysicalMode
    ? typedCode !== undefined
      ? typedCode === activeTarget.key.code
      : typedValue === activeTarget.key.code ||
        khmerTextEquals(typedValue, activeTarget.value) ||
        khmerTextEquals(typedValue, activeTarget.key.khmer)
    : khmerTextEquals(typedValue, activeTarget.value);

  if (isMatch) {
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
  claimLessonReward: (
    worldId: number,
    lessonId: string | number,
    metrics: TypingMetricResult,
    speedTargetCpm: number,
    attemptId?: number,
  ) => { reward: PrototypeReward; duplicate: boolean };
  hasClaimed: (attemptId: number) => boolean;
  hasClaimedLesson: (worldId: number, lessonId: string | number) => boolean;
  getTotals: () => { totalXp: number; totalCoins: number; bestScore: number; claimedCount: number };
};

/**
 * In-memory reward ledger that guarantees idempotency per attemptId and per completed lesson,
 * preventing duplicate rewards on replay while never touching Firebase or localStorage.
 */
export function createPrototypeRewardLedger(): PrototypeRewardLedger {
  const claimedRewards = new Map<number, PrototypeReward>();
  const claimedLessonRewards = new Map<string, PrototypeReward>();
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
    claimLessonReward(worldId, lessonId, metrics, speedTargetCpm, attemptId = 1) {
      const lessonKey = `${worldId}:${lessonId}`;
      const existingLesson = claimedLessonRewards.get(lessonKey);
      if (existingLesson) {
        return { reward: existingLesson, duplicate: true };
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
      if (metrics.passed) {
        claimedLessonRewards.set(lessonKey, reward);
        bestScore = Math.max(bestScore, metrics.finalScore);
      }
      totalXp = reward.totalSessionXp;
      totalCoins = reward.totalSessionCoins;

      return { reward, duplicate: false };
    },
    hasClaimed(attemptId) {
      return claimedRewards.has(attemptId);
    },
    hasClaimedLesson(worldId, lessonId) {
      return claimedLessonRewards.has(`${worldId}:${lessonId}`);
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

/**
 * Clean in-memory persistence adapter that records stage and lesson completions for future
 * teacher dashboard or Firebase wiring without mutating production data or localStorage.
 */
export function createInMemoryLessonPersistenceAdapter(): ThreeLessonPersistenceAdapter {
  const stageLog: Array<{
    worldId: number;
    lessonId: AdventureNodeId | string;
    stageState: StageProgressState;
  }> = [];
  const completions: ThreeLessonCompletionPayload[] = [];

  return {
    recordStageCompletion(worldId, lessonId, stageState) {
      stageLog.push({ worldId, lessonId, stageState: { ...stageState } });
    },
    recordLessonCompletion(payload) {
      completions.push({
        ...payload,
        stageStates: payload.stageStates.map((s) => ({ ...s })),
      });
    },
    getCompletions() {
      return completions.slice();
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
    a.right === b.right && a.sprint === b.sprint
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
          sprint: heldKeys.has('ShiftLeft') || heldKeys.has('ShiftRight'),
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
