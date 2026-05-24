import assert from 'node:assert/strict';
import { createServer } from 'vite';

class MemoryStorage {
  store = new Map();

  getItem(key) {
    return this.store.get(key) ?? null;
  }

  setItem(key, value) {
    this.store.set(key, value);
  }

  removeItem(key) {
    this.store.delete(key);
  }
}

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true },
});

try {
  const progressApi = await server.ssrLoadModule('/src/lib/studentProgress.ts');
  const progression = await server.ssrLoadModule('/src/data/typingProgression.ts');
  const storage = new MemoryStorage();

  assert.equal(progressApi.calculateLessonXP({
    passed: true,
    baseXP: 100,
    stars: 3,
    accuracy: 100,
    cpm: 50,
    targetCPM: 40,
    mistakes: 0,
    score: 9000,
    previousBestScore: 8000,
  }), 280);

  assert.equal(progressApi.updatePracticeStreak(progressApi.createEmptyStudentProgress(), '2026-05-20T10:00:00.000Z').currentStreak, 1);
  const streakProgress = progressApi.updatePracticeStreak({
    ...progressApi.createEmptyStudentProgress(),
    currentStreak: 1,
    longestStreak: 1,
    lastPracticeDate: '2026-05-20',
  }, '2026-05-21T10:00:00.000Z');
  assert.equal(streakProgress.currentStreak, 2);
  assert.equal(streakProgress.longestStreak, 2);

  const lessons = progression.getStructuredLessons();
  assert.equal(progression.isStructuredLessonUnlocked([], lessons[0]), true);
  assert.equal(progression.isStructuredLessonUnlocked([], lessons[1]), false);
  assert.equal(progression.isStructuredLessonUnlocked(['w1-home-runes'], lessons[1]), true);

  const weakPracticeText = progressApi.generateWeakKeyPracticeText([
    { value: 'ញ', mistakes: 7, backspaces: 0, category: 'character' },
    { value: '្រ', mistakes: 5, backspaces: 0, category: 'coeng' },
    { value: 'ើ', mistakes: 4, backspaces: 1, category: 'vowel' },
  ]);
  assert.ok(weakPracticeText.includes('ញា'));
  assert.ok(weakPracticeText.includes('ក្រ'));
  assert.ok(weakPracticeText.includes('កើ'));

  const firstResult = {
    lessonId: 'w1-home-runes',
    lessonTitle: 'Home Row Runes',
    worldId: 1,
    skillFocus: 'Home keys',
    targetText: 'ក គ',
    minimumAccuracy: 90,
    targetCPM: 28,
    difficulty: 'beginner',
    badgeGroup: 'home',
    accuracy: 100,
    CPM: 34,
    WPM: 4,
    mistakes: 0,
    backspaces: 0,
    weakKeys: [],
    stars: 3,
    XP: 120,
    score: 9000,
    passed: true,
    completedAt: '2026-05-20T10:00:00.000Z',
  };
  const saved = progressApi.saveStudentLessonResult(firstResult, storage);
  assert.equal(saved.progress.totalXP, 120);
  assert.equal(saved.progress.completedLessons.includes('w1-home-runes'), true);
  assert.equal(progressApi.loadStudentProgress(storage).lessonResults.length, 1);

  const noMistakeBadge = saved.progress.badges.find((badge) => badge.badgeId === 'no-mistake-warrior');
  assert.equal(noMistakeBadge?.unlocked, true);

  const weakResult = {
    ...firstResult,
    lessonId: 'weak-key-practice',
    lessonTitle: 'Weak-Key Practice',
    passed: false,
    XP: 10,
    weakKeys: [{ value: 'ញ', mistakes: 3, backspaces: 1, category: 'character' }],
    completedAt: '2026-05-20T11:00:00.000Z',
  };
  const savedWeak = progressApi.saveStudentLessonResult(weakResult, storage);
  assert.equal(savedWeak.progress.weakKeyHistory['ញ'].mistakes, 3);
  assert.equal(savedWeak.progress.completedLessons.includes('weak-key-practice'), false);
} finally {
  await server.close();
}

console.log('gamification core tests passed');
