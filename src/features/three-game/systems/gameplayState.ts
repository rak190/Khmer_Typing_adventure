import { lessonCurriculum, type CurriculumLevel } from '../../../data/lessonCurriculum';
import { calculateRewards } from '../../../lib/economy';
import { countKhmerCharacters, countKhmerWords } from '../../../lib/khmerText';
import { buildLessonTypingPlan, type LessonTypingPlan, type TypingUnit } from '../../../lib/lessonTypingPlan';
import {
  calculateTypingMetrics,
  getLessonMinimumAccuracy,
  getLessonSpeedTargetCpm,
  type TypingMetricResult,
} from '../../../lib/typingMetrics';
import type { PrototypeReward } from '../types';

export const GATE_POSITION_Z = 6;
export const GATE_INTERACTION_RADIUS = 3.6;
export const GATE_COLLISION_Z = 5.6;

export function getPrototypeDefaultLesson(): { lesson: CurriculumLevel; worldId: number } {
  const world = lessonCurriculum[0];
  const lesson = world.levels[0];
  return { lesson, worldId: world.id };
}

export function createPrototypeTypingPlan(sliceLength = 16): LessonTypingPlan {
  const { lesson, worldId } = getPrototypeDefaultLesson();
  const fullPlan = buildLessonTypingPlan(lesson, worldId);
  // Take a focused slice for quick, responsive, and testable 3D prototype challenges
  const units = fullPlan.units.slice(0, Math.max(10, sliceLength));
  const targetText = units.map((u) => u.value).join('');
  return { targetText, units };
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
    completed: completedCount >= units.length,
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
 * Calculates in-memory reward without persisting or modifying live Firebase or student data.
 */
export function calculatePrototypeMemoryReward(
  metrics: TypingMetricResult,
  speedTargetCpm: number,
  worldId: number,
  lessonId: string | number,
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
    previousBestScore: 0,
    currentStreak: 1,
    worldId,
    lessonId: String(lessonId),
  });

  return {
    xpEarned: calculated.xpEarned,
    coinsEarned: calculated.coinsEarned,
    stars: metrics.stars,
    passed: metrics.passed,
    score: metrics.finalScore,
    accuracy: metrics.accuracy,
    cpm: metrics.cpm,
  };
}
