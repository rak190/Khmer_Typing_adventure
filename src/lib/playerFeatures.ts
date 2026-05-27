import { resources } from '../data/mockData';
import { getStructuredLessons } from '../data/typingProgression';
import { countKhmerCharacters } from './khmerText';
import {
  badgeDefinitions,
  createEmptyStudentProgress,
  type StudentBadge,
  type StudentProgress,
} from './studentProgress';

export const APP_SETTINGS_STORAGE_KEY = 'khmer-typing-settings';
export const TREASURE_CLAIMS_STORAGE_KEY = 'khmer-typing-treasure-claims';
export const DAILY_QUESTS_STORAGE_KEY = 'khmer-typing-daily-quests';
export const ACHIEVEMENTS_STORAGE_KEY = 'khmer-typing-achievements';
export const PLAYER_FEATURES_EVENT = 'khmer-player-features-change';

export type AppSettings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  keyboardHintsEnabled: boolean;
  handHintsEnabled: boolean;
};

export type RewardAmount = {
  coins?: number;
  gems?: number;
  XP?: number;
  stars?: number;
};

export type TreasureReward = {
  id: string;
  title: string;
  description: string;
  requirement: string;
  status: 'locked' | 'claimable' | 'claimed';
  reward: RewardAmount;
  progress: number;
  total: number;
};

export type DailyQuest = {
  id: string;
  title: string;
  description: string;
  requirement: string;
  status: 'locked' | 'claimable' | 'claimed';
  progress: number;
  total: number;
  reward: RewardAmount;
};

export type AchievementProgress = StudentBadge & {
  progress: number;
  total: number;
  status: 'locked' | 'unlocked';
};

type TreasureClaimState = {
  claimedRewardIds: string[];
};

type DailyQuestState = {
  date: string;
  claimedQuestIds: string[];
};

type AchievementSnapshot = {
  savedAt: string;
  achievements: AchievementProgress[];
};

const defaultSettings: AppSettings = {
  soundEnabled: true,
  musicEnabled: true,
  keyboardHintsEnabled: true,
  handHintsEnabled: true,
};

function getStorage(): Storage | null {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

function emitPlayerFeaturesChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PLAYER_FEATURES_EVENT));
}

function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const saved = storage.getItem(key);
    return saved ? { ...fallback, ...(JSON.parse(saved) as Partial<T>) } : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(key, JSON.stringify(value));
}

export function loadAppSettings(): AppSettings {
  const saved = readJson<AppSettings>(APP_SETTINGS_STORAGE_KEY, defaultSettings);
  return {
    soundEnabled: saved.soundEnabled !== false,
    musicEnabled: saved.musicEnabled !== false,
    keyboardHintsEnabled: saved.keyboardHintsEnabled !== false,
    handHintsEnabled: saved.handHintsEnabled !== false,
  };
}

export function saveAppSettings(settings: AppSettings) {
  writeJson(APP_SETTINGS_STORAGE_KEY, settings);
  emitPlayerFeaturesChange();
  return settings;
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function loadTreasureClaimState(): TreasureClaimState {
  const state = readJson<TreasureClaimState>(TREASURE_CLAIMS_STORAGE_KEY, { claimedRewardIds: [] });
  return {
    claimedRewardIds: Array.isArray(state.claimedRewardIds)
      ? state.claimedRewardIds.filter((item): item is string => typeof item === 'string')
      : [],
  };
}

export function claimTreasureReward(rewardId: string) {
  const state = loadTreasureClaimState();
  if (!state.claimedRewardIds.includes(rewardId)) {
    state.claimedRewardIds.push(rewardId);
    writeJson(TREASURE_CLAIMS_STORAGE_KEY, state);
    emitPlayerFeaturesChange();
  }
  return state;
}

function loadDailyQuestState(date = todayKey()): DailyQuestState {
  const state = readJson<DailyQuestState>(DAILY_QUESTS_STORAGE_KEY, { date, claimedQuestIds: [] });
  if (state.date !== date) return { date, claimedQuestIds: [] };
  return {
    date,
    claimedQuestIds: Array.isArray(state.claimedQuestIds)
      ? state.claimedQuestIds.filter((item): item is string => typeof item === 'string')
      : [],
  };
}

export function claimDailyQuest(questId: string, date = todayKey()) {
  const state = loadDailyQuestState(date);
  if (!state.claimedQuestIds.includes(questId)) {
    state.claimedQuestIds.push(questId);
    writeJson(DAILY_QUESTS_STORAGE_KEY, state);
    emitPlayerFeaturesChange();
  }
  return state;
}

function clampProgress(progress: number, total: number) {
  return Math.max(0, Math.min(total, progress));
}

function rewardStatus(id: string, unlocked: boolean, claimedIds: string[]): TreasureReward['status'] {
  if (claimedIds.includes(id)) return 'claimed';
  return unlocked ? 'claimable' : 'locked';
}

function passedResults(progress: StudentProgress) {
  return progress.lessonResults.filter((result) => result.passed);
}

export function buildTreasureRewards(progress: StudentProgress): TreasureReward[] {
  const claimedIds = loadTreasureClaimState().claimedRewardIds;
  const passed = passedResults(progress);
  const bestAccuracy = progress.lessonResults.reduce((best, result) => Math.max(best, result.accuracy), 0);
  const totalStars = progress.lessonResults.reduce((total, result) => total + result.stars, 0);
  const bossPasses = passed.filter((result) => result.difficulty === 'boss' || result.lessonId.includes('boss')).length;

  const definitions = [
    {
      id: 'first-lesson-cache',
      title: 'ប្រអប់មេរៀនដំបូង',
      description: 'ប្រអប់រង្វាន់សម្រាប់ការបញ្ចប់មេរៀនវាយអក្សរខ្មែរមួយ។',
      requirement: 'បញ្ចប់មេរៀនណាមួយ។',
      progress: progress.completedLessons.length,
      total: 1,
      reward: { coins: 100, XP: 50, stars: 1 },
    },
    {
      id: 'accuracy-vault',
      title: 'ឃ្លាំងភាពត្រឹមត្រូវ',
      description: 'រង្វាន់សម្រាប់ការវាយអក្សរខ្មែរ Unicode ឲ្យបានប្រុងប្រយ័ត្ន។',
      requirement: 'ឈានដល់ភាពត្រឹមត្រូវ 95% ក្នុងលទ្ធផលណាមួយ។',
      progress: bestAccuracy,
      total: 95,
      reward: { coins: 160, gems: 2, XP: 80 },
    },
    {
      id: 'star-cache',
      title: 'ប្រអប់ផ្កាយ',
      description: 'រង្វាន់សម្រាប់ការប្រមូលផ្កាយពីមេរៀន និង Boss។',
      requirement: 'ប្រមូលផ្កាយសរុប 9។',
      progress: totalStars,
      total: 9,
      reward: { coins: 220, gems: 3, stars: 2 },
    },
    {
      id: 'boss-relic',
      title: 'វត្ថុបុរាណ Boss',
      description: 'រង្វាន់ដែលបើកបានពេលឈ្នះការប្រយុទ្ធ Boss។',
      requirement: 'ឆ្លងមេរៀន Boss ណាមួយ។',
      progress: bossPasses,
      total: 1,
      reward: { coins: 300, gems: 5, XP: 150 },
    },
    {
      id: 'streak-treasure',
      title: 'រង្វាន់ហាត់ជាប់ៗគ្នា',
      description: 'រង្វាន់សម្រាប់ការត្រឡប់មកហាត់រៀងរាល់ថ្ងៃ។',
      requirement: 'ឈានដល់ streak 3 ថ្ងៃ។',
      progress: progress.currentStreak,
      total: 3,
      reward: { coins: 180, gems: 2, XP: 90 },
    },
  ];

  return definitions.map((item) => {
    const unlocked = item.progress >= item.total;
    return {
      ...item,
      progress: clampProgress(item.progress, item.total),
      status: rewardStatus(item.id, unlocked, claimedIds),
    };
  });
}

export function getClaimedRewardTotals(progress: StudentProgress): Required<RewardAmount> {
  return buildTreasureRewards(progress)
    .filter((reward) => reward.status === 'claimed')
    .reduce(
      (total, reward) => ({
        coins: total.coins + (reward.reward.coins ?? 0),
        gems: total.gems + (reward.reward.gems ?? 0),
        XP: total.XP + (reward.reward.XP ?? 0),
        stars: total.stars + (reward.reward.stars ?? 0),
      }),
      { coins: 0, gems: 0, XP: 0, stars: 0 },
    );
}

export function buildDailyQuests(progress: StudentProgress, date = todayKey()): DailyQuest[] {
  const state = loadDailyQuestState(date);
  const todaysResults = progress.lessonResults.filter((result) => result.completedAt.startsWith(date));
  const todaysPassed = todaysResults.filter((result) => result.passed);
  const typedCharacters = todaysResults.reduce((total, result) => total + countKhmerCharacters(result.targetText), 0);
  const bossAttempts = todaysResults.filter((result) => result.difficulty === 'boss' || result.lessonId.includes('boss')).length;
  const highAccuracy = todaysResults.some((result) => result.accuracy >= 95) ? 1 : 0;

  const definitions = [
    {
      id: 'complete-lesson',
      title: 'បញ្ចប់មេរៀន 1',
      description: 'បញ្ចប់ និងឆ្លងមេរៀនមួយនៅថ្ងៃនេះ។',
      requirement: 'ឆ្លងមេរៀនមួយនៅថ្ងៃនេះ។',
      progress: todaysPassed.length,
      total: 1,
      reward: { coins: 60, XP: 40 },
    },
    {
      id: 'type-khmer-characters',
      title: 'វាយតួអក្សរខ្មែរ',
      description: 'បង្កើតចង្វាក់ដោយហាត់វាយអក្សរខ្មែរពិតៗ។',
      requirement: 'វាយតួអក្សរខ្មែរ 40 នៅថ្ងៃនេះ។',
      progress: typedCharacters,
      total: 40,
      reward: { coins: 50, XP: 35 },
    },
    {
      id: 'accuracy-target',
      title: 'ឈានដល់គោលដៅត្រឹមត្រូវ',
      description: 'ភាពត្រឹមត្រូវជាទម្លាប់ល្អបំផុតសម្រាប់អ្នកចាប់ផ្តើម។',
      requirement: 'ឈានដល់ភាពត្រឹមត្រូវ 95% ក្នុងលទ្ធផលមួយថ្ងៃនេះ។',
      progress: highAccuracy,
      total: 1,
      reward: { coins: 80, gems: 1 },
    },
    {
      id: 'attempt-boss',
      title: 'សាកល្បង Boss',
      description: 'សាកល្បងការប្រយុទ្ធ Boss បន្ទាប់ពីហាត់គ្រប់គ្រាន់។',
      requirement: 'សាកល្បង Boss mode ណាមួយនៅថ្ងៃនេះ។',
      progress: bossAttempts,
      total: 1,
      reward: { coins: 90, gems: 2, XP: 50 },
    },
  ];

  return definitions.map((item) => {
    const completed = item.progress >= item.total;
    const claimed = state.claimedQuestIds.includes(item.id);
    return {
      ...item,
      progress: clampProgress(item.progress, item.total),
      status: claimed ? 'claimed' : completed ? 'claimable' : 'locked',
    };
  });
}

function countCompletedGroup(progress: StudentProgress, group: NonNullable<ReturnType<typeof getStructuredLessons>[number]['badgeGroup']>) {
  const lessons = getStructuredLessons().filter((lesson) => lesson.badgeGroup === group);
  return {
    progress: lessons.filter((lesson) => progress.completedLessons.includes(lesson.lessonId)).length,
    total: lessons.length,
  };
}

export function buildAchievementProgress(progress: StudentProgress): AchievementProgress[] {
  const savedBadges = progress.badges.length > 0 ? progress.badges : createEmptyStudentProgress().badges;
  const passed = passedResults(progress);
  const progressByBadgeId: Record<string, { progress: number; total: number }> = {
    'accuracy-monk': { progress: passed.filter((result) => result.accuracy >= 95).length, total: 5 },
    'speed-runner': { progress: passed.filter((result) => result.CPM >= result.targetCPM).length, total: 3 },
    'no-mistake-warrior': { progress: passed.some((result) => result.accuracy === 100 && result.mistakes === 0) ? 1 : 0, total: 1 },
    'khmer-vowel-master': countCompletedGroup(progress, 'vowel'),
    'subscript-hero': { progress: progress.completedLessons.includes('w5-boss-coeng') ? 1 : 0, total: 1 },
    'consistent-learner': { progress: progress.currentStreak, total: 3 },
    'final-boss-victor': { progress: progress.completedLessons.includes('w10-final-boss') ? 1 : 0, total: 1 },
  };

  return badgeDefinitions.map((definition) => {
    const saved = savedBadges.find((badge) => badge.badgeId === definition.badgeId);
    const badgeProgress = progressByBadgeId[definition.badgeId] ?? { progress: 0, total: 1 };
    const unlocked = saved?.unlocked === true || badgeProgress.progress >= badgeProgress.total;

    return {
      ...definition,
      unlocked,
      unlockedAt: saved?.unlockedAt,
      progress: clampProgress(badgeProgress.progress, badgeProgress.total),
      total: badgeProgress.total,
      status: unlocked ? 'unlocked' : 'locked',
    };
  });
}

export function saveAchievementSnapshot(progress: StudentProgress) {
  const snapshot: AchievementSnapshot = {
    savedAt: new Date().toISOString(),
    achievements: buildAchievementProgress(progress),
  };
  writeJson(ACHIEVEMENTS_STORAGE_KEY, snapshot);
  return snapshot;
}

export function resetFeatureProgressState() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(TREASURE_CLAIMS_STORAGE_KEY);
  storage.removeItem(DAILY_QUESTS_STORAGE_KEY);
  storage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
  emitPlayerFeaturesChange();
}

export function getWalletSummary(progress: StudentProgress) {
  const claimed = getClaimedRewardTotals(progress);
  const earnedStars = progress.lessonResults.reduce((total, result) => total + result.stars, 0);

  return {
    coins: resources.coins + claimed.coins,
    gems: resources.gems + claimed.gems,
    XP: progress.totalXP + claimed.XP,
    stars: earnedStars + claimed.stars,
  };
}
