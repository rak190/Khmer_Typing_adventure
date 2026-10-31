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
  const khmerText = await server.ssrLoadModule('/src/lib/khmerText.ts');
  const keyboardMap = await server.ssrLoadModule('/src/data/keyboardMap.ts');
  const typingPlanMod = await server.ssrLoadModule('/src/lib/lessonTypingPlan.ts');

  // 1. Default curriculum lesson & minimum accuracy target (90%, not 75% or 70%)
  const defaultLesson = gameplayState.getPrototypeDefaultLesson();
  assert.equal(defaultLesson.minimumAccuracy, 90, 'World 1 Lesson 1 minimum accuracy must be 90%');
  assert.equal(defaultLesson.speedTargetCpm, 28, 'World 1 Lesson 1 speed target CPM must be 28');

  const plan = gameplayState.createPrototypeTypingPlan(12);
  assert.equal(plan.units.length, 12, 'Plan should contain requested slice length');
  assert.ok(plan.targetText.length > 0, 'Target text should not be empty');

  // 2. Passing and failing accuracy & gate unlocking conditions (no 70% bypass)
  const passingMetrics = gameplayState.computePrototypeMetrics(
    plan.units,
    12, // completedCount
    1,  // 1 mistake -> 11/12 = 92% accuracy
    0,
    11,
    20000,
    defaultLesson.lesson,
    defaultLesson.worldId,
  );
  assert.equal(passingMetrics.accuracy, 92);
  assert.equal(passingMetrics.passed, true, '92% accuracy should pass 90% threshold');
  assert.equal(gameplayState.shouldUnlockGate(passingMetrics), true, 'Gate should unlock when passed');

  const failing75Metrics = gameplayState.computePrototypeMetrics(
    plan.units,
    12, // completedCount
    3,  // 3 mistakes -> 9/12 = 75% accuracy
    0,
    9,
    20000,
    defaultLesson.lesson,
    defaultLesson.worldId,
  );
  assert.equal(failing75Metrics.accuracy, 75);
  assert.equal(failing75Metrics.passed, false, '75% accuracy must fail 90% curriculum threshold');
  assert.equal(
    gameplayState.shouldUnlockGate(failing75Metrics),
    false,
    'Gate must NOT unlock at 75% accuracy (70% bypass removed)',
  );

  const incompleteMetrics = gameplayState.computePrototypeMetrics(
    plan.units,
    6, // only half completed
    0,
    0,
    6,
    10000,
    defaultLesson.lesson,
    defaultLesson.worldId,
  );
  assert.equal(incompleteMetrics.passed, false, 'Incomplete session must not pass');
  assert.equal(gameplayState.shouldUnlockGate(incompleteMetrics), false, 'Gate must not unlock when incomplete');

  // 3. Khmer Unicode handling, dependent vowels, coeng, combining marks, Shift, AltGr, Backspace
  const complexCluster = 'ស្ត្រីខ្មែរ';
  assert.equal(
    khmerText.khmerTextEquals(complexCluster, complexCluster.normalize('NFD')),
    true,
    'NFC/NFD Khmer cluster equivalence must hold',
  );

  // Verify keyboard input mapping for base, Shift, AltGr, and Space
  const baseK = keyboardMap.getKhmerKeyboardInput({
    code: 'KeyK',
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
  });
  assert.equal(baseK?.value, 'ក', 'Base KeyK should produce ក');

  const shiftK = keyboardMap.getKhmerKeyboardInput({
    code: 'KeyK',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
  });
  assert.equal(shiftK?.value, 'គ', 'Shift+KeyK should produce គ');

  const shiftA = keyboardMap.getKhmerKeyboardInput({
    code: 'KeyA',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
  });
  assert.equal(shiftA?.value, 'ាំ', 'Shift+KeyA should produce multi-codepoint dependent vowel+nikahit ាំ');

  const coengJ = keyboardMap.getKhmerKeyboardInput({
    code: 'KeyJ',
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
  });
  assert.equal(coengJ?.value, '្', 'Base KeyJ should produce coeng ្');

  const altGrE = keyboardMap.getKhmerKeyboardInput({
    code: 'KeyE',
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    getModifierState: (mod) => mod === 'AltGraph',
  });
  assert.equal(altGrE?.value, 'ឯ', 'AltGr+KeyE should produce independent vowel ឯ');

  const ctrlAltR = keyboardMap.getKhmerKeyboardInput({
    code: 'KeyR',
    shiftKey: false,
    ctrlKey: true,
    altKey: true,
  });
  assert.equal(ctrlAltR?.value, 'ឫ', 'Ctrl+Alt+KeyR (AltGr) should produce ឫ');

  // Verify typing session state progression, mistakes, and Backspace
  let session = gameplayState.createTypingSessionState(1);
  assert.equal(session.startedAt, null);

  // Wrong input on first unit
  const wrongStep = gameplayState.applyTypedInput(session, plan.units, 'ខុស', 1000);
  assert.equal(wrongStep.matched, false);
  assert.equal(wrongStep.justFinished, false);
  assert.equal(wrongStep.nextState.completedCount, 0);
  assert.equal(wrongStep.nextState.incorrectCount, 1);
  assert.equal(wrongStep.nextState.startedAt, 1000, 'Timer starts on first keystroke');
  session = wrongStep.nextState;

  // Correct input on first unit
  const firstUnitValue = plan.units[0].value;
  const rightStep = gameplayState.applyTypedInput(session, plan.units, firstUnitValue, 1200);
  assert.equal(rightStep.matched, true);
  assert.equal(rightStep.nextState.completedCount, 1);
  assert.equal(rightStep.nextState.streak, 1);
  session = rightStep.nextState;

  // Backspace
  session = gameplayState.applyBackspaceInput(session);
  assert.equal(session.completedCount, 0, 'Backspace should decrement completedCount');
  assert.equal(session.backspaceCount, 1, 'Backspace should increment backspaceCount');
  assert.equal(session.streak, 0, 'Backspace should reset current streak');

  // Complete all units
  for (let i = 0; i < plan.units.length; i += 1) {
    const step = gameplayState.applyTypedInput(session, plan.units, plan.units[i].value, 2000 + i * 200);
    assert.equal(step.matched, true);
    session = step.nextState;
    if (i === plan.units.length - 1) {
      assert.equal(step.justFinished, true, 'Final unit should set justFinished');
    }
  }
  assert.equal(session.finished, true);
  assert.equal(typingPlanMod.getTypedText(plan.units, session.completedCount), plan.targetText);

  // Extra input after finish is ignored
  const afterFinish = gameplayState.applyTypedInput(session, plan.units, plan.units[0].value, 9000);
  assert.equal(afterFinish.justFinished, false);
  assert.equal(afterFinish.nextState.completedCount, plan.units.length);

  // 4. Movement restrictions during typing & clearing held keys across mode transitions
  const controlStore = gameplayState.createPlayerControlStore(true);
  assert.equal(controlStore.handleKeyDown('KeyW'), true);
  assert.equal(controlStore.getSnapshot().forward, true, 'Holding W moves forward in exploration');

  // Transition to typing mode while W is still held down
  controlStore.setCanMove(false);
  assert.deepEqual(
    controlStore.getSnapshot(),
    { forward: false, backward: false, left: false, right: false },
    'Entering typing mode must immediately clear held movement keys',
  );

  // Pressing WASD/Arrows during typing must not move character
  assert.equal(controlStore.handleKeyDown('KeyD'), false);
  assert.equal(controlStore.handleKeyDown('ArrowUp'), false);
  assert.deepEqual(
    controlStore.getSnapshot(),
    { forward: false, backward: false, left: false, right: false },
    'Movement keys pressed during typing must be ignored',
  );

  // Returning to exploration/completed mode must NOT resume previously held W key
  controlStore.setCanMove(true);
  assert.deepEqual(
    controlStore.getSnapshot(),
    { forward: false, backward: false, left: false, right: false },
    'Previously held keys must remain cleared after returning to exploration',
  );

  // 5. Gate collision bounds and retry/restart session reset
  const [closedX, closedZ] = gameplayState.clampCharacterPosition(0, 10, 'closed');
  assert.equal(closedX, 0);
  assert.equal(closedZ, gameplayState.GATE_COLLISION_Z, 'Closed gate must block movement past GATE_COLLISION_Z');

  const [, openZ] = gameplayState.clampCharacterPosition(0, 10, 'open');
  assert.equal(openZ, 10, 'Open gate must allow walking through into sanctuary (z = 10)');

  const restartedSession = gameplayState.createTypingSessionState(2);
  assert.equal(restartedSession.attemptId, 2);
  assert.equal(restartedSession.completedCount, 0);
  assert.equal(restartedSession.incorrectCount, 0);
  assert.equal(restartedSession.finished, false);

  // 6. Duplicate reward prevention & in-memory reward ledger
  const ledger = gameplayState.createPrototypeRewardLedger();
  const firstClaim = ledger.claimAttemptReward(
    1,
    passingMetrics,
    defaultLesson.speedTargetCpm,
    defaultLesson.worldId,
    defaultLesson.lesson.id,
  );
  assert.equal(firstClaim.duplicate, false, 'First claim for attempt 1 should succeed');
  assert.ok(firstClaim.reward.xpEarned > 0);
  assert.ok(firstClaim.reward.coinsEarned > 0);

  const totalsAfterFirst = ledger.getTotals();
  assert.equal(totalsAfterFirst.claimedCount, 1);
  assert.equal(totalsAfterFirst.totalXp, firstClaim.reward.xpEarned);

  // Duplicate claim for same attemptId must be blocked
  const duplicateClaim = ledger.claimAttemptReward(
    1,
    passingMetrics,
    defaultLesson.speedTargetCpm,
    defaultLesson.worldId,
    defaultLesson.lesson.id,
  );
  assert.equal(duplicateClaim.duplicate, true, 'Duplicate claim for attempt 1 must be flagged');
  assert.deepEqual(
    ledger.getTotals(),
    totalsAfterFirst,
    'Duplicate claim must not increase total XP, coins, or claimed count',
  );

  // Retry with new attemptId (attempt 2) can claim its own reward
  const retryClaim = ledger.claimAttemptReward(
    2,
    passingMetrics,
    defaultLesson.speedTargetCpm,
    defaultLesson.worldId,
    defaultLesson.lesson.id,
  );
  assert.equal(retryClaim.duplicate, false, 'New attemptId 2 on retry should be claimable');
  assert.equal(ledger.getTotals().claimedCount, 2);
  assert.equal(
    ledger.getTotals().totalXp,
    firstClaim.reward.xpEarned + retryClaim.reward.xpEarned,
  );
} finally {
  await server.close();
}

console.log('3D prototype core tests passed');
