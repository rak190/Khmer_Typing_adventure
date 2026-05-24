import type { CurriculumLevel } from '../data/lessonCurriculum';

export type LessonResultStatus = 'passed' | 'needs-practice';

export type TypingMetricInput = {
  completed: boolean;
  totalRequiredInputs: number;
  acceptedCorrectInputs: number;
  incorrectInputs: number;
  backspaceCount: number;
  elapsedMs: number;
  correctKhmerCharacters: number;
  correctWords: number;
  bestStreak: number;
  speedTargetCpm: number;
  minimumAccuracy: number;
};

export type TypingMetricResult = {
  accuracy: number;
  totalRequiredInputs: number;
  correctInputs: number;
  acceptedCorrectInputs: number;
  incorrectInputs: number;
  totalTypedInputs: number;
  errorCount: number;
  backspaceCount: number;
  elapsedSeconds: number;
  cpm: number;
  wpm: number;
  consistency: number;
  finalScore: number;
  stars: number;
  passed: boolean;
  status: LessonResultStatus;
};

const MIN_ELAPSED_MS = 1000;

function elapsedMinutes(elapsedMs: number) {
  return Math.max(MIN_ELAPSED_MS, elapsedMs) / 60000;
}

export function calculateAccuracy(correctInputs: number, totalRequiredInputs: number) {
  if (totalRequiredInputs <= 0) return 0;
  return Math.max(0, Math.min(100, (correctInputs / totalRequiredInputs) * 100));
}

export function calculateCpm(correctKhmerCharacters: number, elapsedMs: number) {
  return Math.round(correctKhmerCharacters / elapsedMinutes(elapsedMs));
}

export function calculateWpm(correctWords: number, elapsedMs: number) {
  return Math.round(correctWords / elapsedMinutes(elapsedMs));
}

export function calculateConsistency(totalRequiredInputs: number, incorrectInputs: number, backspaceCount: number, bestStreak: number) {
  if (totalRequiredInputs <= 0) return 0;
  const errorPressure = Math.max(0, 1 - (incorrectInputs + backspaceCount * 0.35) / totalRequiredInputs);
  const streakPressure = Math.min(1, bestStreak / totalRequiredInputs);
  return Math.round((errorPressure * 0.7 + streakPressure * 0.3) * 100);
}

export function calculateFinalScore(accuracy: number, cpm: number, consistency: number, speedTargetCpm: number) {
  const accuracyScore = Math.max(0, Math.min(1, accuracy / 100));
  const speedScore = speedTargetCpm > 0 ? Math.max(0, Math.min(1, cpm / speedTargetCpm)) : 0;
  const consistencyScore = Math.max(0, Math.min(1, consistency / 100));
  return Math.round(10000 * (accuracyScore * 0.65 + speedScore * 0.25 + consistencyScore * 0.1));
}

export function calculateStars(completed: boolean, accuracy: number, cpm: number, speedTargetCpm: number) {
  if (!completed) return 0;
  if (accuracy >= 95 && accuracy >= 85 && cpm >= speedTargetCpm) return 3;
  if (accuracy >= 90) return 2;
  return 1;
}

export function calculateLessonPassed(completed: boolean, accuracy: number, minimumAccuracy: number) {
  return completed && accuracy >= minimumAccuracy;
}

export function getLessonMinimumAccuracy(lesson: CurriculumLevel, worldId: number) {
  if (lesson.minimumAccuracy) return lesson.minimumAccuracy;
  if (lesson.id === 'boss') return 95;
  if (worldId <= 2) return 90;
  if (worldId <= 4) return 93;
  return 95;
}

export function getLessonSpeedTargetCpm(lesson: CurriculumLevel, worldId: number) {
  if (lesson.speedTargetCpm) return lesson.speedTargetCpm;
  if (lesson.id === 'boss') return 80;
  const numericId = typeof lesson.id === 'number' ? lesson.id : 8;
  if (worldId <= 1) return 26 + numericId * 2;
  if (worldId <= 3) return 42 + numericId * 2;
  if (worldId <= 5) return 56 + numericId * 2;
  return 70 + numericId * 2;
}

export function calculateTypingMetrics(input: TypingMetricInput): TypingMetricResult {
  const correctInputs = Math.max(0, Math.min(input.totalRequiredInputs, input.acceptedCorrectInputs - input.incorrectInputs));
  const accuracy = Math.round(calculateAccuracy(correctInputs, input.totalRequiredInputs));
  const cpm = calculateCpm(input.correctKhmerCharacters, input.elapsedMs);
  const wpm = calculateWpm(input.correctWords, input.elapsedMs);
  const consistency = calculateConsistency(input.totalRequiredInputs, input.incorrectInputs, input.backspaceCount, input.bestStreak);
  const finalScore = calculateFinalScore(accuracy, cpm, consistency, input.speedTargetCpm);
  const stars = calculateStars(input.completed, accuracy, cpm, input.speedTargetCpm);
  const passed = calculateLessonPassed(input.completed, accuracy, input.minimumAccuracy);

  return {
    accuracy,
    totalRequiredInputs: input.totalRequiredInputs,
    correctInputs,
    acceptedCorrectInputs: input.acceptedCorrectInputs,
    incorrectInputs: input.incorrectInputs,
    totalTypedInputs: input.acceptedCorrectInputs + input.incorrectInputs,
    errorCount: input.incorrectInputs,
    backspaceCount: input.backspaceCount,
    elapsedSeconds: Math.round(Math.max(0, input.elapsedMs) / 1000),
    cpm,
    wpm,
    consistency,
    finalScore,
    stars,
    passed,
    status: passed ? 'passed' : 'needs-practice',
  };
}

export function formatElapsedTime(elapsedSeconds: number) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getLessonFeedbackMessage(result: Pick<TypingMetricResult, 'accuracy' | 'cpm' | 'passed'>, speedTargetCpm: number) {
  if (result.passed && result.accuracy >= 95 && result.cpm >= speedTargetCpm) {
    return 'Excellent work. You reached the target accuracy and speed.';
  }

  if (result.accuracy >= 90 && result.cpm < speedTargetCpm) {
    return 'Your accuracy is good, but your speed is still low. Replay this lesson and try to reach the target CPM.';
  }

  if (result.cpm >= speedTargetCpm && result.accuracy < 90) {
    return 'You typed quickly, but your accuracy needs improvement. Slow down and focus on correct Khmer characters.';
  }

  return 'Replay this lesson and focus on careful, correct Khmer typing before adding speed.';
}
