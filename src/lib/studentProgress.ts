import type { CurriculumLevel } from '../data/lessonCurriculum';
import {
  getNextStructuredLesson,
  getStructuredLessons,
  type StructuredTypingLesson,
} from '../data/typingProgression';
import { normalizeKhmerText } from './khmerText';

export const STUDENT_PROGRESS_STORAGE_KEY = 'khmer-typing-student-progress';
export const STUDENT_PROGRESS_EVENT = 'khmer-student-progress-change';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type WeakKeyCategory = 'character' | 'vowel' | 'coeng' | 'mark' | 'key';

export type WeakKeySummary = {
  value: string;
  mistakes: number;
  backspaces: number;
  keyCode?: string;
  category: WeakKeyCategory;
};

export type WeakKeyStatRecord = Record<string, WeakKeySummary>;

export type StudentBadge = {
  badgeId: string;
  badgeName: string;
  description: string;
  requirement: string;
  unlocked: boolean;
  unlockedAt?: string;
};

export type StudentLessonResult = {
  studentName?: string;
  lessonId: string;
  lessonTitle: string;
  worldId: number | string;
  skillFocus: string;
  targetText: string;
  minimumAccuracy: number;
  targetCPM: number;
  difficulty: string;
  badgeGroup?: StructuredTypingLesson['badgeGroup'];
  accuracy: number;
  CPM: number;
  WPM: number;
  mistakes: number;
  backspaces: number;
  weakKeys: WeakKeySummary[];
  stars: number;
  XP: number;
  score: number;
  passed: boolean;
  completedAt: string;
};

export type StudentProgress = {
  studentName?: string;
  totalXP: number;
  currentLevel: number;
  currentWorld: string;
  completedLessons: string[];
  lessonResults: StudentLessonResult[];
  weakKeyHistory: Record<string, WeakKeySummary>;
  badges: StudentBadge[];
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string;
};

export const badgeDefinitions: Omit<StudentBadge, 'unlocked' | 'unlockedAt'>[] = [
  {
    badgeId: 'accuracy-monk',
    badgeName: 'Accuracy Monk',
    description: '95%+ accuracy in five passed lessons.',
    requirement: 'Pass 5 lessons with at least 95% accuracy.',
  },
  {
    badgeId: 'speed-runner',
    badgeName: 'Speed Runner',
    description: 'Reach the target CPM in three lessons.',
    requirement: 'Hit target CPM in 3 passed lessons.',
  },
  {
    badgeId: 'no-mistake-warrior',
    badgeName: 'No Mistake Warrior',
    description: 'Finish a lesson with no mistakes.',
    requirement: 'Pass 1 lesson with 100% accuracy and 0 mistakes.',
  },
  {
    badgeId: 'khmer-vowel-master',
    badgeName: 'Khmer Vowel Master',
    description: 'Complete the vowel path.',
    requirement: 'Pass all vowel lessons.',
  },
  {
    badgeId: 'subscript-hero',
    badgeName: 'Subscript Hero',
    description: 'Master coeng and subscript combinations.',
    requirement: 'Pass the subscript boss.',
  },
  {
    badgeId: 'consistent-learner',
    badgeName: 'Consistent Learner',
    description: 'Practice across several days.',
    requirement: 'Reach a 3-day streak.',
  },
  {
    badgeId: 'final-boss-victor',
    badgeName: 'Final Boss Victor',
    description: 'Pass the final mixed paragraph challenge.',
    requirement: 'Pass the Angkor Final Boss.',
  },
];

export function createEmptyStudentProgress(): StudentProgress {
  return {
    totalXP: 0,
    currentLevel: 1,
    currentWorld: 'Home Key Temple',
    completedLessons: [],
    lessonResults: [],
    weakKeyHistory: {},
    badges: badgeDefinitions.map((badge) => ({ ...badge, unlocked: false })),
    currentStreak: 0,
    longestStreak: 0,
  };
}

function getStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeBadge(value: Partial<StudentBadge>): StudentBadge | null {
  const definition = badgeDefinitions.find((badge) => badge.badgeId === value.badgeId);
  if (!definition) return null;
  return {
    ...definition,
    unlocked: value.unlocked === true,
    unlockedAt: typeof value.unlockedAt === 'string' ? value.unlockedAt : undefined,
  };
}

function normalizeWeakKey(value: Partial<WeakKeySummary>): WeakKeySummary | null {
  if (typeof value.value !== 'string' || !value.value) return null;
  return {
    value: normalizeKhmerText(value.value),
    mistakes: Math.max(0, Number(value.mistakes) || 0),
    backspaces: Math.max(0, Number(value.backspaces) || 0),
    keyCode: typeof value.keyCode === 'string' ? value.keyCode : undefined,
    category: value.category ?? classifyWeakKey(value.value),
  };
}

function normalizeLessonResult(value: Partial<StudentLessonResult>): StudentLessonResult | null {
  if (typeof value.lessonId !== 'string' || typeof value.lessonTitle !== 'string') return null;
  return {
    studentName: typeof value.studentName === 'string' ? value.studentName : undefined,
    lessonId: value.lessonId,
    lessonTitle: value.lessonTitle,
    worldId: typeof value.worldId === 'number' || typeof value.worldId === 'string' ? value.worldId : 0,
    skillFocus: typeof value.skillFocus === 'string' ? value.skillFocus : '',
    targetText: typeof value.targetText === 'string' ? value.targetText : '',
    minimumAccuracy: Number(value.minimumAccuracy) || 0,
    targetCPM: Number(value.targetCPM) || 0,
    difficulty: typeof value.difficulty === 'string' ? value.difficulty : 'beginner',
    badgeGroup: value.badgeGroup,
    accuracy: Number(value.accuracy) || 0,
    CPM: Number(value.CPM) || 0,
    WPM: Number(value.WPM) || 0,
    mistakes: Number(value.mistakes) || 0,
    backspaces: Number(value.backspaces) || 0,
    weakKeys: Array.isArray(value.weakKeys) ? value.weakKeys.flatMap((weakKey) => normalizeWeakKey(weakKey) ?? []) : [],
    stars: Number(value.stars) || 0,
    XP: Number(value.XP) || 0,
    score: Number(value.score) || 0,
    passed: value.passed === true,
    completedAt: typeof value.completedAt === 'string' ? value.completedAt : new Date().toISOString(),
  };
}

export function loadStudentProgress(storage?: StorageLike): StudentProgress {
  const resolvedStorage = getStorage(storage);
  if (!resolvedStorage) return createEmptyStudentProgress();

  try {
    const saved = resolvedStorage.getItem(STUDENT_PROGRESS_STORAGE_KEY);
    if (!saved) return createEmptyStudentProgress();
    const parsed = JSON.parse(saved) as Partial<StudentProgress>;
    const progress = createEmptyStudentProgress();
    const badgesById = new Map(progress.badges.map((badge) => [badge.badgeId, badge]));

    return {
      studentName: typeof parsed.studentName === 'string' ? parsed.studentName : undefined,
      totalXP: Number(parsed.totalXP) || 0,
      currentLevel: Number(parsed.currentLevel) || 1,
      currentWorld: typeof parsed.currentWorld === 'string' ? parsed.currentWorld : progress.currentWorld,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons.filter((item): item is string => typeof item === 'string') : [],
      lessonResults: Array.isArray(parsed.lessonResults) ? parsed.lessonResults.flatMap((result) => normalizeLessonResult(result) ?? []) : [],
      weakKeyHistory: Object.fromEntries(
        Object.values(parsed.weakKeyHistory ?? {})
          .flatMap((weakKey) => normalizeWeakKey(weakKey) ?? [])
          .map((weakKey) => [weakKey.value, weakKey]),
      ),
      badges: [
        ...progress.badges.map((badge) => {
          const savedBadge = Array.isArray(parsed.badges) ? parsed.badges.flatMap((item) => normalizeBadge(item) ?? []).find((item) => item.badgeId === badge.badgeId) : null;
          badgesById.set(badge.badgeId, savedBadge ?? badge);
          return savedBadge ?? badge;
        }),
      ],
      currentStreak: Number(parsed.currentStreak) || 0,
      longestStreak: Number(parsed.longestStreak) || 0,
      lastPracticeDate: typeof parsed.lastPracticeDate === 'string' ? parsed.lastPracticeDate : undefined,
    };
  } catch {
    return createEmptyStudentProgress();
  }
}

export function saveStudentProgress(progress: StudentProgress, storage?: StorageLike) {
  const resolvedStorage = getStorage(storage);
  if (!resolvedStorage) return progress;
  resolvedStorage.setItem(STUDENT_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(STUDENT_PROGRESS_EVENT));
  return progress;
}

export function resetStudentProgress(storage?: StorageLike) {
  const resolvedStorage = getStorage(storage);
  if (!resolvedStorage) return;
  resolvedStorage.removeItem(STUDENT_PROGRESS_STORAGE_KEY);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(STUDENT_PROGRESS_EVENT));
}

export function calculateStudentLevel(totalXP: number) {
  return Math.max(1, Math.floor(Math.max(0, totalXP) / 500) + 1);
}

export function getPracticeDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function differenceInDays(previousDate: string, currentDate: string) {
  const previous = Date.parse(`${previousDate}T00:00:00.000Z`);
  const current = Date.parse(`${currentDate}T00:00:00.000Z`);
  if (!Number.isFinite(previous) || !Number.isFinite(current)) return 0;
  return Math.round((current - previous) / 86400000);
}

export function updatePracticeStreak(progress: StudentProgress, completedAt = new Date().toISOString()): StudentProgress {
  const practiceDate = getPracticeDate(new Date(completedAt));
  if (progress.lastPracticeDate === practiceDate) return progress;

  const dayGap = progress.lastPracticeDate ? differenceInDays(progress.lastPracticeDate, practiceDate) : 1;
  const currentStreak = dayGap === 1 ? progress.currentStreak + 1 : 1;

  return {
    ...progress,
    currentStreak,
    longestStreak: Math.max(progress.longestStreak, currentStreak),
    lastPracticeDate: practiceDate,
  };
}

export function calculateLessonXP(input: {
  passed: boolean;
  baseXP: number;
  stars: number;
  accuracy: number;
  cpm: number;
  targetCPM: number;
  mistakes: number;
  score: number;
  previousBestScore?: number;
}) {
  if (!input.passed) return Math.max(10, Math.round(input.baseXP * 0.2));

  let xp = input.baseXP;
  if (input.stars >= 2) xp += Math.round(input.baseXP * 0.25);
  if (input.stars >= 3) xp += Math.round(input.baseXP * 0.45);
  if (input.accuracy === 100 && input.mistakes === 0) xp += 50;
  if (input.cpm >= input.targetCPM) xp += 35;
  if (typeof input.previousBestScore === 'number' && input.score > input.previousBestScore) xp += 25;
  return xp;
}

export function getBestScoreForLesson(progress: StudentProgress, lessonId: string) {
  return progress.lessonResults
    .filter((result) => result.lessonId === lessonId)
    .reduce((best, result) => Math.max(best, result.score), 0);
}

export function classifyWeakKey(value: string): WeakKeyCategory {
  const normalized = normalizeKhmerText(value);
  if (normalized.includes('\u17d2')) return 'coeng';
  if (/[\u17b6-\u17c5]/u.test(normalized)) return 'vowel';
  if (/[\u17c6-\u17d1\u17dd]/u.test(normalized)) return 'mark';
  return 'character';
}

export function summarizeWeakKeyStats(stats: WeakKeyStatRecord, limit = 5): WeakKeySummary[] {
  return Object.values(stats)
    .filter((item) => item.mistakes > 0 || item.backspaces > 0)
    .map((item) => ({ ...item, value: normalizeKhmerText(item.value), category: item.category ?? classifyWeakKey(item.value) }))
    .sort((left, right) => (right.mistakes + right.backspaces * 0.5) - (left.mistakes + left.backspaces * 0.5))
    .slice(0, limit);
}

function mergeWeakKeyHistory(current: Record<string, WeakKeySummary>, weakKeys: WeakKeySummary[]) {
  const next = { ...current };

  weakKeys.forEach((weakKey) => {
    const value = normalizeKhmerText(weakKey.value);
    const existing = next[value];
    next[value] = {
      value,
      mistakes: (existing?.mistakes ?? 0) + weakKey.mistakes,
      backspaces: (existing?.backspaces ?? 0) + weakKey.backspaces,
      keyCode: weakKey.keyCode ?? existing?.keyCode,
      category: weakKey.category ?? existing?.category ?? classifyWeakKey(value),
    };
  });

  return next;
}

function passedResults(progress: StudentProgress) {
  return progress.lessonResults.filter((result) => result.passed);
}

function hasPassedGroup(progress: StudentProgress, group: StructuredTypingLesson['badgeGroup']) {
  const required = getStructuredLessons().filter((lessonItem) => lessonItem.badgeGroup === group);
  return required.length > 0 && required.every((lessonItem) => progress.completedLessons.includes(lessonItem.lessonId));
}

export function evaluateBadges(progress: StudentProgress, now = new Date().toISOString()) {
  const passed = passedResults(progress);
  const unlocked = new Set(progress.badges.filter((badge) => badge.unlocked).map((badge) => badge.badgeId));
  const shouldUnlock = new Set<string>();

  if (passed.filter((result) => result.accuracy >= 95).length >= 5) shouldUnlock.add('accuracy-monk');
  if (passed.filter((result) => result.CPM >= result.targetCPM).length >= 3) shouldUnlock.add('speed-runner');
  if (passed.some((result) => result.accuracy === 100 && result.mistakes === 0)) shouldUnlock.add('no-mistake-warrior');
  if (hasPassedGroup(progress, 'vowel')) shouldUnlock.add('khmer-vowel-master');
  if (progress.completedLessons.includes('w5-boss-coeng')) shouldUnlock.add('subscript-hero');
  if (progress.currentStreak >= 3) shouldUnlock.add('consistent-learner');
  if (progress.completedLessons.includes('w10-final-boss')) shouldUnlock.add('final-boss-victor');

  const badges = badgeDefinitions.map((definition) => {
    const saved = progress.badges.find((badge) => badge.badgeId === definition.badgeId);
    const justUnlocked = shouldUnlock.has(definition.badgeId) && !unlocked.has(definition.badgeId);
    return {
      ...definition,
      unlocked: saved?.unlocked === true || shouldUnlock.has(definition.badgeId),
      unlockedAt: saved?.unlockedAt ?? (justUnlocked ? now : undefined),
    };
  });

  const newBadges = badges.filter((badge) => badge.unlocked && !unlocked.has(badge.badgeId));
  return { badges, newBadges };
}

export function saveStudentLessonResult(result: StudentLessonResult, storage?: StorageLike) {
  const current = loadStudentProgress(storage);
  const completedLessons = result.passed && !current.completedLessons.includes(result.lessonId)
    ? [...current.completedLessons, result.lessonId]
    : current.completedLessons;
  const withResult: StudentProgress = {
    ...current,
    studentName: result.studentName ?? current.studentName,
    totalXP: current.totalXP + result.XP,
    completedLessons,
    lessonResults: [...current.lessonResults, result],
    weakKeyHistory: mergeWeakKeyHistory(current.weakKeyHistory, result.weakKeys),
  };
  const withStreak = result.passed ? updatePracticeStreak(withResult, result.completedAt) : withResult;
  const nextStructuredLesson = getNextStructuredLesson(withStreak.completedLessons);
  const { badges, newBadges } = evaluateBadges(withStreak, result.completedAt);
  const nextProgress: StudentProgress = {
    ...withStreak,
    badges,
    currentLevel: calculateStudentLevel(withStreak.totalXP),
    currentWorld: nextStructuredLesson?.worldTitle ?? withStreak.currentWorld,
  };

  saveStudentProgress(nextProgress, storage);
  return { progress: nextProgress, newBadges };
}

export function getStudentDashboardStats(progress: StudentProgress) {
  const results = progress.lessonResults;
  const passed = passedResults(progress);
  const totalLessons = getStructuredLessons().length;
  const average = (values: number[]) => values.length > 0 ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : 0;
  const best = (values: number[]) => values.length > 0 ? Math.max(...values) : 0;
  const nextLesson = getNextStructuredLesson(progress.completedLessons);

  return {
    totalLessons,
    totalLessonsCompleted: progress.completedLessons.length,
    currentWorld: nextLesson?.worldTitle ?? 'Adventure Complete',
    currentLessonTitle: nextLesson?.lessonTitle ?? 'Final Boss Complete',
    currentLevel: progress.currentLevel,
    totalXP: progress.totalXP,
    currentStreak: progress.currentStreak,
    longestStreak: progress.longestStreak,
    averageAccuracy: average(results.map((result) => result.accuracy)),
    averageCPM: average(results.map((result) => result.CPM)),
    bestCPM: best(results.map((result) => result.CPM)),
    bestAccuracy: best(results.map((result) => result.accuracy)),
    weakCharacters: summarizeWeakKeyStats(progress.weakKeyHistory, 6),
    badgesEarned: progress.badges.filter((badge) => badge.unlocked),
    recentLessonHistory: [...results].sort((left, right) => right.completedAt.localeCompare(left.completedAt)).slice(0, 6),
    passedLessonCount: passed.length,
  };
}

export function getStructuredLessonStatus(progress: StudentProgress, lessonItem: StructuredTypingLesson) {
  if (progress.completedLessons.includes(lessonItem.lessonId)) return 'completed';
  if (isStructuredLessonUnlocked(progress.completedLessons, lessonItem)) return 'unlocked';
  return 'locked';
}

export function getProgressRecommendation(progress: StudentProgress, latestResult?: StudentLessonResult) {
  const weakKeys = summarizeWeakKeyStats(progress.weakKeyHistory, 3);

  if (latestResult && latestResult.weakKeys.length >= 2) return 'Practice weak keys before moving to the next lesson.';
  if (latestResult && latestResult.accuracy >= 95 && latestResult.CPM < latestResult.targetCPM) return 'Your accuracy is high. Try the speed challenge after one replay.';
  if (latestResult && latestResult.weakKeys.some((weakKey) => weakKey.category === 'coeng')) return 'You made mistakes with coeng combinations. Replay the subscript lesson.';
  if (latestResult && latestResult.passed && latestResult.stars >= 2) return 'You are ready for the next unlocked lesson or boss challenge.';
  if (weakKeys.length > 0) return 'Practice weak keys before moving to the next lesson.';
  return 'Start with the current unlocked lesson and protect accuracy before speed.';
}

function meaningfulPracticePieces(weakKey: WeakKeySummary) {
  const value = normalizeKhmerText(weakKey.value);
  if (weakKey.category === 'coeng' || value.includes('\u17d2')) return ['ក្រ', 'ត្រ', 'ស្រ', 'ប្រម', 'ខ្មែរ'];
  if (weakKey.category === 'vowel' || weakKey.category === 'mark') return [`ក${value}`, `ត${value}`, `ប${value}`, `ម${value}`];
  if (value === ' ') return ['កូន រៀន', 'សាលា ខ្មែរ'];
  return [`${value}ា`, `${value}ិ`, `${value}េ`, `${value}ូ`];
}

export function generateWeakKeyPracticeText(weakKeys: WeakKeySummary[], maxItems = 18) {
  const keys = weakKeys.length > 0
    ? weakKeys
    : [
        { value: 'ញ', mistakes: 1, backspaces: 0, category: 'character' as const },
        { value: '្រ', mistakes: 1, backspaces: 0, category: 'coeng' as const },
        { value: 'ើ', mistakes: 1, backspaces: 0, category: 'vowel' as const },
      ];
  const pieces = keys.flatMap((weakKey) => meaningfulPracticePieces(weakKey));
  return pieces.slice(0, maxItems).join(' ');
}

export function buildWeakKeyPracticeLesson(progress: StudentProgress): CurriculumLevel {
  const weakKeys = summarizeWeakKeyStats(progress.weakKeyHistory, 4);
  const practiceText = generateWeakKeyPracticeText(weakKeys);

  return {
    id: 1,
    labelKh: 'ហាត់ចំណុចខ្សោយ',
    labelEn: 'Weak-Key Practice',
    category: 'Adaptive Practice',
    objective: 'Practice the Khmer keys and combinations that caused the most mistakes.',
    focusKeys: weakKeys.length > 0 ? weakKeys.map((weakKey) => weakKey.value) : ['ញ', '្រ', 'ើ'],
    unicodeRule: 'Adaptive practice repeats weak Khmer characters, vowels, and coeng combinations in safe typing order.',
    successCriteria: 'Pass this practice with at least 90% accuracy before returning to harder lessons.',
    minimumAccuracy: 90,
    speedTargetCpm: 32,
    stages: [
      {
        id: 'weak-key-practice',
        kind: 'pattern',
        titleKh: 'ហាត់ចំណុចខ្សោយ',
        titleEn: 'Weak-Key Drill',
        mission: 'Repeat weak keys in short Khmer combinations.',
        skill: 'Adaptive weak-key recovery.',
        mechanic: 'Generated from local mistake history.',
        targetCount: practiceText.split(/\s+/u).length,
        accuracyGoal: 90,
        items: [practiceText],
      },
    ],
  };
}
