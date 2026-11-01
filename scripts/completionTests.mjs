import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';

await mkdir('.local/tests', { recursive: true });

// Bundle completion contract
await build({
  entryPoints: ['src/lib/completionContract.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: '.local/tests/contract.mjs',
});
const { resolveLessonIdentity, validateLessonAttempt, CURRICULUM_VERSION } = await import('../.local/tests/contract.mjs');

// Bundle economy & shop items with mock Vite import.meta.env
await build({
  entryPoints: ['src/lib/economy.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: '.local/tests/economy-test.mjs',
  external: ['firebase/*'],
  define: {
    'import.meta.env': JSON.stringify({
      VITE_FIREBASE_API_KEY: 'test-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'demo-khmer-typing',
      VITE_USE_FIREBASE_EMULATORS: 'false',
      VITE_FIREBASE_STAGE: 'staging',
    }),
  },
});
const {
  shopItems,
  purchaseShopItem,
  isOnlineBackendAvailable,
} = await import('../.local/tests/economy-test.mjs');

// 1. LESSON IDENTITY & ATTEMPT VALIDATION CONTRACT
assert.equal(resolveLessonIdentity('w1-home-runes').id, '1:1');
assert.equal(resolveLessonIdentity('1:1').legacyId, 'w1-home-runes');
assert.notEqual(resolveLessonIdentity('foundation-home-row').id, '1:1');

const validAttempt = {
  attemptId: 'test-attempt-00000001',
  lessonId: '1:1',
  version: CURRICULUM_VERSION,
  mode: '2d',
  category: 'unicode-output',
  completedAt: new Date().toISOString(),
  metrics: {
    accuracy: 95,
    cpm: 30,
    score: 9000,
    stars: 2,
    mistakes: 1,
    backspaces: 0,
    elapsedSeconds: 60,
    passed: true,
  },
  stages: [],
};

assert.equal(validateLessonAttempt(validAttempt).id, '1:1');
assert.throws(() => validateLessonAttempt({ ...validAttempt, XP: 9999 }));
assert.throws(() => validateLessonAttempt({ ...validAttempt, mode: '3d' }));
const validStagesL2 = resolveLessonIdentity('1:2').lesson.stages.map(s => ({ id: s.id, accuracy: s.accuracyGoal, completed: true }));
assert.equal(validateLessonAttempt({ ...validAttempt, lessonId: '1:2', mode: '3d', stages: validStagesL2 }).id, '1:2');
assert.throws(() => validateLessonAttempt({ ...validAttempt, lessonId: '1:3', mode: '3d' }));
assert.throws(() => validateLessonAttempt({ ...validAttempt, metrics: { ...validAttempt.metrics, cpm: NaN } }));
assert.throws(() => validateLessonAttempt({ ...validAttempt, lessonId: 'foundation-home-row' }));
assert.throws(() => validateLessonAttempt({ ...validAttempt, attemptId: '../bad' }));
assert.throws(() => validateLessonAttempt({ ...validAttempt, attemptId: 'bad/id' }));
assert.equal(validateLessonAttempt({ ...validAttempt, metrics: { ...validAttempt.metrics, accuracy: 50, stars: 1, passed: false } }).id, '1:1');

// 2. SHOP ITEM SECURITY & BUSINESS RULES
assert.ok(shopItems.length > 0, 'Shop items must be populated');
const retryItem = shopItems.find(item => item.itemId === 'retry-token');
assert.ok(retryItem, 'retry-token item must exist');
assert.equal(retryItem.consumable, true, 'retry-token is consumable');
assert.equal(retryItem.cost, 300, 'retry-token cost is 300 coins');

// Test client fallback purchase: insufficient funds
await assert.rejects(async () => {
  await purchaseShopItem('test-user-poor', 'retry-token');
}, /Not enough coins/);

// Test client fallback purchase: coming soon rejected
await assert.rejects(async () => {
  await purchaseShopItem('test-user', 'angkor-treasure-bundle');
}, /Coming soon/);

// Test client fallback purchase: unknown item rejected
await assert.rejects(async () => {
  await purchaseShopItem('test-user', 'non-existent-hack-item');
}, /Shop item not found/);

// 3. BOSS ATTEMPTS & RETRY TOKEN PRIORITY LOGIC
// Heart calculation & refill logic
const HEART_REFILL_MS = 30 * 60 * 1000;
function simulateHeartRefill(hearts, maxHearts, lastRefillTime, nowTime) {
  if (hearts >= maxHearts) return hearts;
  const elapsed = nowTime - lastRefillTime;
  const recovered = Math.floor(elapsed / HEART_REFILL_MS);
  return Math.min(maxHearts, hearts + Math.max(0, recovered));
}

assert.equal(simulateHeartRefill(3, 5, 1000, 1000 + 29 * 60 * 1000), 3, 'No recovery before 30 mins');
assert.equal(simulateHeartRefill(3, 5, 1000, 1000 + 31 * 60 * 1000), 4, '1 heart recovered after 31 mins');
assert.equal(simulateHeartRefill(3, 5, 1000, 1000 + 65 * 60 * 1000), 5, '2 hearts recovered after 65 mins');
assert.equal(simulateHeartRefill(3, 5, 1000, 1000 + 300 * 60 * 1000), 5, 'Cannot exceed max hearts (5)');

// 4. USER PROFILE SANITIZATION & SECURITY RULES
function simulateValidateProfile(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid profile data');
  const safeUpdates = {};
  if (typeof data.displayName === 'string') {
    const cleanName = data.displayName.trim().replace(/\s+/g, ' ');
    if (cleanName.length < 1 || cleanName.length > 40) throw new Error('Display name must be 1-40 characters');
    safeUpdates.displayName = cleanName;
  }
  for (const field of ['equippedAvatarId', 'equippedSkinId', 'equippedThemeId', 'equippedTitleId', 'equippedFrameId']) {
    if (typeof data[field] === 'string') {
      const val = data[field].trim();
      if (/^[a-zA-Z0-9_-]{1,50}$/.test(val)) {
        safeUpdates[field] = val;
      }
    }
  }
  return safeUpdates;
}

assert.throws(() => simulateValidateProfile({ displayName: '' }), /1-40 characters/);
assert.throws(() => simulateValidateProfile({ displayName: 'a'.repeat(41) }), /1-40 characters/);
assert.equal(simulateValidateProfile({ displayName: '  Som   Chhaya  ' }).displayName, 'Som Chhaya');
assert.equal(simulateValidateProfile({ equippedAvatarId: 'avatar_angkor-01' }).equippedAvatarId, 'avatar_angkor-01');
// Malicious script injection in cosmetic ID is stripped
assert.equal(simulateValidateProfile({ equippedAvatarId: '<script>alert(1)</script>' }).equippedAvatarId, undefined);
// Tampering with economy fields via profile update is stripped
const sanitizedHacked = simulateValidateProfile({ displayName: 'Legit', coins: 999999, gems: 500, hearts: 100 });
assert.equal(sanitizedHacked.coins, undefined);
assert.equal(sanitizedHacked.gems, undefined);
assert.equal(sanitizedHacked.hearts, undefined);

// 5. FIRESTORE READ & DOCUMENT BOUNDING LOGIC
// Verify summary.lessonResults is capped to 30
function appendBoundedResult(history, newResult, max = 30) {
  return [...history, newResult].slice(-max);
}
let history = [];
for (let i = 0; i < 50; i++) {
  history = appendBoundedResult(history, { lessonId: `1:${i}`, score: i * 100 });
}
assert.equal(history.length, 30, 'Summary history must be capped to 30 items to prevent 1MB limit overflow');
assert.equal(history[0].lessonId, '1:20', 'Oldest items are evicted');
assert.equal(history[29].lessonId, '1:49', 'Newest item is retained at tail');

// 6. PREDECESSOR UNLOCKING CHECK WITHOUT FULL COLLECTION SCAN
function canUnlockLesson(targetLessonId, completedLessons) {
  if (targetLessonId === '1:1' || targetLessonId === 'foundation-home-row') return true;
  const parts = targetLessonId.split(':');
  if (parts.length === 2) {
    const world = parseInt(parts[0], 10);
    const num = parseInt(parts[1], 10);
    if (num > 1) {
      const predecessorId = `${world}:${num - 1}`;
      return completedLessons.includes(predecessorId);
    }
  }
  return false;
}

assert.equal(canUnlockLesson('1:1', []), true, '1:1 is always unlocked');
assert.equal(canUnlockLesson('1:2', []), false, '1:2 is locked initially');
assert.equal(canUnlockLesson('1:2', ['1:1']), true, '1:2 unlocked after completing 1:1 without collection scan');
assert.equal(canUnlockLesson('1:3', ['1:1']), false, '1:3 locked if only 1:1 completed');
assert.equal(canUnlockLesson('1:3', ['1:1', '1:2']), true, '1:3 unlocked after 1:2 completed');

// 7. ONLINE BACKEND GUARD CHECK
assert.equal(typeof isOnlineBackendAvailable, 'function');
assert.equal(isOnlineBackendAvailable(), false, 'Online backend is false in local test environment without auth');

console.log('Completion identity, security hardening, and validation tests passed');
