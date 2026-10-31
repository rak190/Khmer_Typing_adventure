import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true },
});

try {
  const gameplayState = await server.ssrLoadModule('/src/features/three-game/systems/gameplayState.ts');

  // Test 1: Typing plan creation
  const plan = gameplayState.createPrototypeTypingPlan(12);
  assert.equal(plan.units.length, 12, 'Plan should contain requested slice length');
  assert.ok(plan.targetText.length > 0, 'Target text should not be empty');
  assert.ok(plan.units[0].value, 'Each unit should have a Khmer value');
  assert.ok(plan.units[0].key, 'Each unit should map to a keyboard key');

  // Test 2: Compute prototype metrics
  const defaultLesson = gameplayState.getPrototypeDefaultLesson();
  const metrics = gameplayState.computePrototypeMetrics(
    plan.units,
    12, // completedCount
    1,  // incorrectCount
    0,  // backspaceCount
    11, // bestStreak
    30000, // 30 seconds
    defaultLesson.lesson,
    defaultLesson.worldId,
  );

  assert.ok(metrics.accuracy > 85, 'Accuracy should be high with 1 mistake out of 12');
  assert.ok(metrics.cpm > 0, 'CPM should be calculated');
  assert.ok(typeof metrics.passed === 'boolean', 'Passed flag should be a boolean');

  // Test 3: Calculate prototype memory reward
  const reward = gameplayState.calculatePrototypeMemoryReward(
    metrics,
    metrics.cpm,
    defaultLesson.worldId,
    defaultLesson.lesson.id,
  );

  assert.ok(reward.xpEarned >= 0, 'XP earned should be positive or zero');
  assert.ok(reward.coinsEarned >= 0, 'Coins earned should be positive or zero');
  assert.ok(reward.stars >= 1, 'Passed challenge should award at least 1 star');

  // Test 4: Gate interaction constants
  assert.ok(gameplayState.GATE_POSITION_Z > 0, 'Gate position Z should be positive');
  assert.ok(gameplayState.GATE_INTERACTION_RADIUS > 2, 'Interaction radius should be accessible');
  assert.ok(gameplayState.GATE_COLLISION_Z < gameplayState.GATE_POSITION_Z, 'Collision barrier must be before gate center');
} finally {
  await server.close();
}

console.log('3D prototype core tests passed');
