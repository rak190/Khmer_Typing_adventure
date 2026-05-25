import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true },
});

try {
  const metrics = await server.ssrLoadModule('/src/lib/typingMetrics.ts');
  const khmerText = await server.ssrLoadModule('/src/lib/khmerText.ts');
  const typingPlan = await server.ssrLoadModule('/src/lib/lessonTypingPlan.ts');
  const fingerGuidance = await server.ssrLoadModule('/src/lib/fingerGuidance.ts');
  const keyboardMap = await server.ssrLoadModule('/src/data/keyboardMap.ts');

  assert.equal(metrics.calculateAccuracy(9, 10), 90);
  assert.equal(metrics.calculateCpm(60, 60000), 60);
  assert.equal(metrics.calculateWpm(12, 60000), 12);
  assert.equal(metrics.calculateStars(true, 96, 40, 40), 3);
  assert.equal(metrics.calculateStars(true, 84, 80, 40), 1);
  assert.equal(metrics.calculateLessonPassed(true, 92, 90), true);
  assert.equal(metrics.calculateLessonPassed(true, 88, 90), false);

  const result = metrics.calculateTypingMetrics({
    completed: true,
    totalRequiredInputs: 10,
    acceptedCorrectInputs: 10,
    incorrectInputs: 1,
    backspaceCount: 2,
    elapsedMs: 60000,
    correctKhmerCharacters: 30,
    correctWords: 6,
    bestStreak: 7,
    speedTargetCpm: 25,
    minimumAccuracy: 90,
  });

  assert.equal(result.accuracy, 90);
  assert.equal(result.cpm, 30);
  assert.equal(result.wpm, 6);
  assert.equal(result.stars, 2);
  assert.equal(result.passed, true);

  const ka = '\u1780\u17b6';
  const kma = '\u1780\u17d2\u1798';
  assert.equal(khmerText.khmerTextEquals(ka, ka.normalize('NFD')), true);
  assert.equal(khmerText.splitKhmerGraphemes(ka).length, 1);
  assert.ok(khmerText.splitKhmerGraphemes(kma).length <= 2);

  const shiftLesson = {
    id: 1,
    labelKh: '',
    labelEn: 'Shift test',
    category: '',
    objective: '',
    focusKeys: ['\u1788'],
    unicodeRule: '',
    successCriteria: '',
    stages: [
      {
        id: 'shift',
        kind: 'warmup',
        titleKh: '',
        titleEn: '',
        mission: '',
        skill: '',
        mechanic: '',
        targetCount: 1,
        accuracyGoal: 90,
        items: ['\u1788'],
      },
    ],
  };
  const plan = typingPlan.buildLessonTypingPlan(shiftLesson, 1);
  assert.equal(plan.units[0].key.code, 'KeyQ');
  assert.equal(plan.units[0].modifier, 'shift');

  const leftGuidance = fingerGuidance.getFingerGuidance(keyboardMap.findKhmerKeyByCode('KeyD'), false);
  assert.equal(leftGuidance.activeFinger, 'left-middle');
  assert.deepEqual(leftGuidance.highlights, [{ hand: 'left', finger: 'middle', role: 'target' }]);

  const rightGuidance = fingerGuidance.getFingerGuidance(keyboardMap.findKhmerKeyByCode('KeyK'), false);
  assert.equal(rightGuidance.activeFinger, 'right-middle');
  assert.deepEqual(rightGuidance.highlights, [{ hand: 'right', finger: 'middle', role: 'target' }]);

  const spaceGuidance = fingerGuidance.getFingerGuidance(keyboardMap.findKhmerKeyByCode('Space'), false);
  assert.equal(spaceGuidance.label, 'Use thumb');
  assert.deepEqual(spaceGuidance.highlights, [{ hand: 'right', finger: 'thumb', role: 'target' }]);

  const shiftGuidance = fingerGuidance.getFingerGuidance(plan.units[0].key, true);
  assert.equal(shiftGuidance.shiftRequired, true);
  assert.deepEqual(shiftGuidance.highlights, [
    { hand: 'right', finger: 'pinky', role: 'shift' },
    { hand: 'left', finger: 'pinky', role: 'target' },
  ]);
} finally {
  await server.close();
}

console.log('typing core tests passed');
