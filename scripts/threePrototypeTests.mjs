import assert from 'node:assert/strict';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true },
  ssr: { external: ['react', 'react-dom', 'react-router-dom', 'lucide-react'] },
});

try {
  const gameplayState = await server.ssrLoadModule('/src/features/three-game/systems/gameplayState.ts');
  const khmerText = await server.ssrLoadModule('/src/lib/khmerText.ts');
  const keyboardMap = await server.ssrLoadModule('/src/data/keyboardMap.ts');
  const typingPlanMod = await server.ssrLoadModule('/src/lib/lessonTypingPlan.ts');
  const fingerGuidanceMod = await server.ssrLoadModule('/src/lib/fingerGuidance.ts');
  const THREE = await server.ssrLoadModule('three');

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
    { forward: false, backward: false, left: false, right: false, sprint: false },
    'Entering typing mode must immediately clear held movement keys',
  );

  // Pressing WASD/Arrows during typing must not move character
  assert.equal(controlStore.handleKeyDown('KeyD'), false);
  assert.equal(controlStore.handleKeyDown('ArrowUp'), false);
  assert.deepEqual(
    controlStore.getSnapshot(),
    { forward: false, backward: false, left: false, right: false, sprint: false },
    'Movement keys pressed during typing must be ignored',
  );

  // Returning to exploration/completed mode must NOT resume previously held W key
  controlStore.setCanMove(true);
  assert.deepEqual(
    controlStore.getSnapshot(),
    { forward: false, backward: false, left: false, right: false, sprint: false },
    'Previously held keys must remain cleared after returning to exploration',
  );

  // Sprint key (Shift) handling
  controlStore.handleKeyDown('ShiftLeft');
  assert.equal(controlStore.getSnapshot().sprint, true, 'Holding ShiftLeft activates sprint');
  controlStore.handleKeyUp('ShiftLeft');
  assert.equal(controlStore.getSnapshot().sprint, false, 'Releasing ShiftLeft deactivates sprint');

  // 4.1 Movement direction mapping, camera projection, diagonal normalization, and rotation
  // Camera stands at negative Z looking along +Z toward the gate.
  // In this camera frame:
  // - world +X projects to negative NDC X (screen-left)
  // - world -X projects to positive NDC X (screen-right)
  const cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 100);
  cam.position.set(0, 2.6, -5.6);
  cam.lookAt(0, 1.35, 1.6);
  cam.updateMatrixWorld();

  const posLeftWorld = new THREE.Vector3(2, 1.5, 0).project(cam);
  const posRightWorld = new THREE.Vector3(-2, 1.5, 0).project(cam);
  assert.ok(
    posLeftWorld.x < 0,
    `World +X must project to screen-left (negative NDC X), got ${posLeftWorld.x}`,
  );
  assert.ok(
    posRightWorld.x > 0,
    `World -X must project to screen-right (positive NDC X), got ${posRightWorld.x}`,
  );

  // A / ArrowLeft -> moves screen-left (world +X)
  const leftMove = gameplayState.computeMovementDelta({ forward: false, backward: false, left: true, right: false }, true);
  assert.equal(leftMove.isMoving, true);
  assert.ok(leftMove.dirX > 0, 'Left movement must have positive dirX (world +X = screen-left)');
  assert.equal(leftMove.dirZ, 0);
  assert.ok(
    Math.abs(leftMove.targetRotation - Math.PI / 2) < 1e-6,
    'Character must face screen-left (PI/2 rad)',
  );

  // D / ArrowRight -> moves screen-right (world -X)
  const rightMove = gameplayState.computeMovementDelta({ forward: false, backward: false, left: false, right: true }, true);
  assert.equal(rightMove.isMoving, true);
  assert.ok(rightMove.dirX < 0, 'Right movement must have negative dirX (world -X = screen-right)');
  assert.equal(rightMove.dirZ, 0);
  assert.ok(
    Math.abs(rightMove.targetRotation - (-Math.PI / 2)) < 1e-6,
    'Character must face screen-right (-PI/2 rad)',
  );

  // W / ArrowUp -> moves forward (world +Z toward gate)
  const forwardMove = gameplayState.computeMovementDelta({ forward: true, backward: false, left: false, right: false }, true);
  assert.equal(forwardMove.isMoving, true);
  assert.equal(forwardMove.dirX, 0);
  assert.ok(forwardMove.dirZ > 0, 'Forward movement must have positive dirZ (+Z = toward gate)');
  assert.equal(forwardMove.targetRotation, 0, 'Character must face forward (0 rad)');

  // S / ArrowDown -> moves backward (world -Z away from gate)
  const backwardMove = gameplayState.computeMovementDelta({ forward: false, backward: true, left: false, right: false }, true);
  assert.equal(backwardMove.isMoving, true);
  assert.equal(backwardMove.dirX, 0);
  assert.ok(backwardMove.dirZ < 0, 'Backward movement must have negative dirZ (-Z = away from gate)');
  assert.ok(
    Math.abs(Math.abs(backwardMove.targetRotation) - Math.PI) < 1e-6,
    'Character must face backward (PI rad)',
  );

  // Diagonal normalization
  const diagForwardLeft = gameplayState.computeMovementDelta({ forward: true, backward: false, left: true, right: false }, true);
  assert.equal(diagForwardLeft.isMoving, true);
  const diagLength = Math.hypot(diagForwardLeft.dirX, diagForwardLeft.dirZ);
  assert.ok(Math.abs(diagLength - 1.0) < 1e-6, `Diagonal speed must be normalized to 1.0, got ${diagLength}`);
  assert.ok(
    Math.abs(diagForwardLeft.targetRotation - Math.PI / 4) < 1e-6,
    'Forward-left diagonal must face PI/4 rad',
  );

  const diagForwardRight = gameplayState.computeMovementDelta({ forward: true, backward: false, left: false, right: true }, true);
  assert.ok(Math.abs(Math.hypot(diagForwardRight.dirX, diagForwardRight.dirZ) - 1.0) < 1e-6);

  // Movement disabled during typing (canMove = false)
  const disabledMove = gameplayState.computeMovementDelta({ forward: true, backward: false, left: true, right: false }, false);
  assert.equal(disabledMove.isMoving, false);
  assert.equal(disabledMove.dirX, 0);
  assert.equal(disabledMove.dirZ, 0);

  // 4.2 Keyboard guidance: Opposite-hand Shift highlighting & modifier key handling
  const keyK = keyboardMap.findKhmerKeyByCode('KeyK');
  assert.ok(keyK);
  assert.equal(keyK.hand, 'right', 'KeyK is operated by the right hand');

  // Shift + K (គ) -> KeyK is right hand, so opposite-hand Shift is ShiftLeft
  const shiftKRequired = fingerGuidanceMod.getRequiredShiftKeyCode(keyK, true);
  assert.equal(shiftKRequired, 'ShiftLeft', 'Shift + KeyK must highlight ShiftLeft (opposite hand)');

  // KeyK without Shift (ក) -> no Shift highlight
  const baseKRequired = fingerGuidanceMod.getRequiredShiftKeyCode(keyK, false);
  assert.equal(baseKRequired, null, 'Non-shift KeyK must not highlight any Shift key');

  // Shift + A (ាំ) -> KeyA is left hand, so opposite-hand Shift is ShiftRight
  const keyA = keyboardMap.findKhmerKeyByCode('KeyA');
  assert.ok(keyA);
  assert.equal(keyA.hand, 'left', 'KeyA is operated by the left hand');
  const shiftARequired = fingerGuidanceMod.getRequiredShiftKeyCode(keyA, true);
  assert.equal(shiftARequired, 'ShiftRight', 'Shift + KeyA must highlight ShiftRight (opposite hand)');

  // Shift + D (ឌ) -> KeyD is left hand, so opposite-hand Shift is ShiftRight
  const keyD = keyboardMap.findKhmerKeyByCode('KeyD');
  assert.ok(keyD);
  assert.equal(keyD.hand, 'left', 'KeyD is operated by the left hand');
  const shiftDRequired = fingerGuidanceMod.getRequiredShiftKeyCode(keyD, true);
  assert.equal(shiftDRequired, 'ShiftRight', 'Shift + KeyD must highlight ShiftRight (opposite hand)');

  // Shift-only keydown must return null (not count as input or mistake)
  const shiftLeftOnly = keyboardMap.getKhmerKeyboardInput({
    code: 'ShiftLeft',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
  });
  assert.equal(shiftLeftOnly, null, 'Pressing ShiftLeft alone must produce null (not typed input)');

  const shiftRightOnly = keyboardMap.getKhmerKeyboardInput({
    code: 'ShiftRight',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
  });
  assert.equal(shiftRightOnly, null, 'Pressing ShiftRight alone must produce null (not typed input)');

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

  // =========================================================================
  // 7. TASK 4: MULTI-STAGE 3D LESSON SYSTEM (World 1, Lesson 1)
  // =========================================================================

  // 7.1 Loading World 1, Lesson 1 curriculum stages
  const lessonConfig = gameplayState.resolveThreeLessonConfig(1, 1);
  assert.equal(lessonConfig.worldId, 1);
  assert.equal(lessonConfig.lesson.id, 1);
  assert.equal(lessonConfig.lesson.labelKh, 'ជួរកណ្តាលដៃឆ្វេង');
  assert.equal(lessonConfig.lesson.labelEn, 'Left-Hand Home Row');
  assert.equal(lessonConfig.stages.length, 3, 'World 1 Lesson 1 must have 3 stages');

  const [stage1, stage2, stage3] = lessonConfig.stages;
  assert.equal(stage1.id, 'w1-l1-s1');
  assert.equal(stage1.titleKh, 'ទ្វារអក្សរ');
  assert.equal(stage1.titleEn, 'Glyph Gate');
  assert.equal(stage1.kind, 'warmup');

  assert.equal(stage2.id, 'w1-l1-s2');
  assert.equal(stage2.titleKh, 'ថ្មភ្លោះ');
  assert.equal(stage2.titleEn, 'Twin Stones');
  assert.equal(stage2.kind, 'pattern');

  assert.equal(stage3.id, 'w1-l1-s3');
  assert.equal(stage3.titleKh, 'ផ្លូវព្រៃ');
  assert.equal(stage3.titleEn, 'Jungle Path');
  assert.equal(stage3.kind, 'word');

  // Also verify reusable config resolution for another lesson (e.g. World 1 Lesson 2)
  const lesson2Config = gameplayState.resolveThreeLessonConfig(1, 2);
  assert.equal(lesson2Config.lesson.id, 2);
  assert.equal(lesson2Config.stages.length, 3);

  // Task 5: data resolution must never imply public availability or bypass map locks.
  const availability = await server.ssrLoadModule('/src/data/threeLessonAvailability.ts');
  const adventure = await server.ssrLoadModule('/src/data/adventureWorlds.ts');
  const curriculum = await server.ssrLoadModule('/src/data/lessonCurriculum.ts');
  const freshWorlds = adventure.buildAdventureWorlds([]);
  const access = (query, worlds = freshWorlds) => availability.getThreeLessonAccess(new URLSearchParams(query), worlds);
  assert.equal(access('world=1&level=1').status, 'ready');
  assert.equal(access('world=1&level=2').status, 'locked');
  assert.equal(access('world=2&level=1').status, 'locked');
  assert.equal(access('world=1&level=boss').status, 'locked');
  for (const query of [
    '', 'world=1', 'level=1', 'world=&level=1', 'world=1&level=',
    'world=abc&level=1', 'world=0&level=1', 'world=-1&level=1',
    'world=1.5&level=1', 'world=1&level=1.5', 'world=1e0&level=1',
    'world=01&level=1', 'world=99&level=1', 'world=1&level=99',
    'world=1&level=NaN', 'world=1&world=2&level=1', 'world=1&level=1&level=2',
  ]) assert.equal(access(query).status, 'invalid', query);
  const completedFirstLesson = adventure.buildAdventureWorlds([{
    worldId: 1, lessonId: 1, score: 100, accuracy: 100, wpm: 10,
    stars: 3, xpEarned: 80, coinsEarned: 10, bestStreak: 10, passed: true,
  }]);
  assert.equal(access('world=1&level=2', completedFirstLesson).status, 'ready');
  assert.equal(access('world=1&level=1', completedFirstLesson).status, 'ready');
  assert.equal(access('world=1&level=3', completedFirstLesson).status, 'locked');

  // Progressive unlocking through lessons 3, 4, 5
  const completedThroughL2 = adventure.buildAdventureWorlds([
    { worldId: 1, lessonId: 1, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 80, coinsEarned: 10, bestStreak: 10, passed: true },
    { worldId: 1, lessonId: 2, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 85, coinsEarned: 10, bestStreak: 10, passed: true },
  ]);
  assert.equal(access('world=1&level=3', completedThroughL2).status, 'ready');
  assert.equal(access('world=1&level=4', completedThroughL2).status, 'locked');

  const completedThroughL3 = adventure.buildAdventureWorlds([
    { worldId: 1, lessonId: 1, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 80, coinsEarned: 10, bestStreak: 10, passed: true },
    { worldId: 1, lessonId: 2, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 85, coinsEarned: 10, bestStreak: 10, passed: true },
    { worldId: 1, lessonId: 3, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 90, coinsEarned: 10, bestStreak: 10, passed: true },
  ]);
  assert.equal(access('world=1&level=4', completedThroughL3).status, 'ready');
  assert.equal(access('world=1&level=5', completedThroughL3).status, 'locked');

  const completedThroughL4 = adventure.buildAdventureWorlds([
    { worldId: 1, lessonId: 1, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 80, coinsEarned: 10, bestStreak: 10, passed: true },
    { worldId: 1, lessonId: 2, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 85, coinsEarned: 10, bestStreak: 10, passed: true },
    { worldId: 1, lessonId: 3, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 90, coinsEarned: 10, bestStreak: 10, passed: true },
    { worldId: 1, lessonId: 4, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 95, coinsEarned: 10, bestStreak: 10, passed: true },
  ]);
  assert.equal(access('world=1&level=5', completedThroughL4).status, 'ready');

  const completedThroughL5 = adventure.buildAdventureWorlds([
    { worldId: 1, lessonId: 1, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 80, coinsEarned: 10, bestStreak: 10, passed: true },
    { worldId: 1, lessonId: 2, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 85, coinsEarned: 10, bestStreak: 10, passed: true },
    { worldId: 1, lessonId: 3, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 90, coinsEarned: 10, bestStreak: 10, passed: true },
    { worldId: 1, lessonId: 4, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 95, coinsEarned: 10, bestStreak: 10, passed: true },
    { worldId: 1, lessonId: 5, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 100, coinsEarned: 10, bestStreak: 10, passed: true },
  ]);
  assert.equal(access('world=1&level=6', completedThroughL5).status, 'ready');
  assert.equal(access('world=1&level=7', completedThroughL5).status, 'locked');

  const completedThroughL6 = adventure.buildAdventureWorlds([
    ...[1, 2, 3, 4, 5, 6].map(id => ({ worldId: 1, lessonId: id, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 100, coinsEarned: 10, bestStreak: 10, passed: true })),
  ]);
  assert.equal(access('world=1&level=7', completedThroughL6).status, 'ready');
  assert.equal(access('world=1&level=8', completedThroughL6).status, 'locked');

  const completedThroughL7 = adventure.buildAdventureWorlds([
    ...[1, 2, 3, 4, 5, 6, 7].map(id => ({ worldId: 1, lessonId: id, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 100, coinsEarned: 10, bestStreak: 10, passed: true })),
  ]);
  assert.equal(access('world=1&level=8', completedThroughL7).status, 'ready');
  assert.equal(access('world=1&level=boss', completedThroughL7).status, 'locked');

  const completedThroughL8 = adventure.buildAdventureWorlds([
    ...[1, 2, 3, 4, 5, 6, 7, 8].map(id => ({ worldId: 1, lessonId: id, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 100, coinsEarned: 10, bestStreak: 10, passed: true })),
  ]);
  assert.equal(access('world=1&level=boss', completedThroughL8).status, 'ready');

  const completedWorld1 = adventure.buildAdventureWorlds([
    ...[1, 2, 3, 4, 5, 6, 7, 8].map(id => ({ worldId: 1, lessonId: id, score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 100, coinsEarned: 10, bestStreak: 10, passed: true })),
    { worldId: 1, lessonId: 'boss', score: 100, accuracy: 100, wpm: 10, stars: 3, xpEarned: 200, coinsEarned: 30, bestStreak: 10, passed: true },
  ]);
  // World 2 Lesson 1 is unlocked in 2D, but unsupported in 3D
  assert.equal(access('world=2&level=1', completedWorld1).status, 'unsupported');

  for (const world of curriculum.lessonCurriculum) {
    for (const lesson of world.levels) {
      assert.equal(
        availability.isThreeLessonSupported(world.id, lesson.id),
        world.id === 1 && [1, 2, 3, 4, 5, 6, 7, 8, 'boss'].includes(lesson.id)
      );
    }
  }
  assert.equal(availability.isThreeLessonSupported(99, 1), false);
  assert.equal(availability.isThreeLessonSupported(1, 99), false);
  for (const [worldId, lessonId] of [[99, 1], [1, 99], [0, 1], [1, '1'], [NaN, 1]]) {
    assert.throws(() => gameplayState.resolveThreeLessonConfig(worldId, lessonId), RangeError);
  }

  // 7.2 Stage 1 typing items and 90% accuracy requirement (Left Home Row F & D)
  assert.equal(
    gameplayState.getStageMinimumAccuracy(stage1, lessonConfig.lesson, lessonConfig.worldId),
    90,
    'Stage 1 accuracy requirement must be 90%',
  );
  assert.ok(stage1.items.length > 0);
  const stage1Plan = gameplayState.createStageTypingPlan(stage1, lessonConfig.lesson.focusKeys);
  assert.equal(stage1Plan.units.length, 30, 'Stage 1 plan must have 30 typing units');

  const stage1PassMetrics = gameplayState.computeStageMetrics(
    stage1Plan.units,
    30,
    3, // 27/30 = 90%
    0,
    27,
    15000,
    stage1,
    lessonConfig.lesson,
    lessonConfig.worldId,
  );
  assert.equal(stage1PassMetrics.accuracy, 90);
  assert.equal(stage1PassMetrics.passed, true, '90% accuracy must pass Stage 1');
  assert.equal(gameplayState.shouldUnlockStage(stage1PassMetrics), true);

  const stage1FailMetrics = gameplayState.computeStageMetrics(
    stage1Plan.units,
    30,
    5, // 25/30 = 83% < 90%
    0,
    25,
    15000,
    stage1,
    lessonConfig.lesson,
    lessonConfig.worldId,
  );
  assert.ok(stage1FailMetrics.accuracy < 90);
  assert.equal(stage1FailMetrics.passed, false, '83% accuracy must fail Stage 1');
  assert.equal(gameplayState.shouldUnlockStage(stage1FailMetrics), false);

  // 7.3 Stage 2 typing items and 90% accuracy requirement (Left Home Row S & A)
  assert.equal(
    gameplayState.getStageMinimumAccuracy(stage2, lessonConfig.lesson, lessonConfig.worldId),
    90,
    'Stage 2 accuracy requirement must be 90%',
  );
  assert.ok(stage2.items.length > 0);
  const stage2Plan = gameplayState.createStageTypingPlan(stage2, lessonConfig.lesson.focusKeys);
  assert.equal(stage2Plan.units.length, 22, 'Stage 2 plan must have 22 typing units');

  const stage2PassMetrics = gameplayState.computeStageMetrics(
    stage2Plan.units,
    22,
    1, // 21/22 = 95% >= 90%
    0,
    21,
    22000,
    stage2,
    lessonConfig.lesson,
    lessonConfig.worldId,
  );
  assert.ok(stage2PassMetrics.accuracy >= 90);
  assert.equal(stage2PassMetrics.passed, true, '95% accuracy must pass Stage 2 (90% threshold)');
  assert.equal(gameplayState.shouldUnlockStage(stage2PassMetrics), true);

  // 7.4 Stage 3 typing items and 92% accuracy requirement (Left Home Flow)
  assert.equal(
    gameplayState.getStageMinimumAccuracy(stage3, lessonConfig.lesson, lessonConfig.worldId),
    92,
    'Stage 3 accuracy requirement must be 92%',
  );
  assert.ok(stage3.items.length > 0);
  const stage3Plan = gameplayState.createStageTypingPlan(stage3, lessonConfig.lesson.focusKeys);
  assert.equal(stage3Plan.units.length, 23, 'Stage 3 plan must have 23 typing units');

  const stage3FailAt87 = gameplayState.computeStageMetrics(
    stage3Plan.units,
    23,
    3, // 20/23 = 87% < 92%
    0,
    20,
    20000,
    stage3,
    lessonConfig.lesson,
    lessonConfig.worldId,
  );
  assert.ok(stage3FailAt87.accuracy < 92);
  assert.equal(stage3FailAt87.passed, false, '87% accuracy must fail Stage 3 (requires 92%)');
  assert.equal(gameplayState.shouldUnlockStage(stage3FailAt87), false);

  const stage3PassAt96 = gameplayState.computeStageMetrics(
    stage3Plan.units,
    23,
    1, // 22/23 = 96% >= 92%
    0,
    22,
    20000,
    stage3,
    lessonConfig.lesson,
    lessonConfig.worldId,
  );
  assert.ok(stage3PassAt96.accuracy >= 92);
  assert.equal(stage3PassAt96.passed, true, '96% accuracy must pass Stage 3 (requires 92%)');
  assert.equal(gameplayState.shouldUnlockStage(stage3PassAt96), true);

  // 7.5 Stage locking, unlocking order, and multi-stage collision barriers (no skipping ahead)
  let stageStates = gameplayState.createInitialStageProgressStates(lessonConfig.stages);
  assert.equal(stageStates.length, 3);
  assert.equal(gameplayState.canAccessStage(0, 0, stageStates), true, 'Stage 1 is accessible initially');
  assert.equal(gameplayState.canAccessStage(1, 0, stageStates), false, 'Stage 2 cannot be accessed while on Stage 1');
  assert.equal(gameplayState.canAccessStage(1, 1, stageStates), false, 'Stage 2 cannot be skipped to before Stage 1 is open');
  assert.equal(gameplayState.canAccessStage(2, 2, stageStates), false, 'Stage 3 cannot be skipped to before Stages 1 & 2 are open');

  // Verify multi-stage spatial barriers
  const [, clampedAtStage1] = gameplayState.clampMultiStageCharacterPosition(0, 25, ['closed', 'closed', 'closed']);
  assert.equal(clampedAtStage1, gameplayState.getStageCollisionZ(0), 'Closed Stage 1 blocks movement at z = 5.6');

  const [, clampedAtStage2] = gameplayState.clampMultiStageCharacterPosition(0, 25, ['open', 'closed', 'closed']);
  assert.equal(clampedAtStage2, gameplayState.getStageCollisionZ(1), 'Open Stage 1 + Closed Stage 2 blocks movement at z = 15.6');

  const [, clampedAtStage3] = gameplayState.clampMultiStageCharacterPosition(0, 29, ['open', 'open', 'closed']);
  assert.equal(clampedAtStage3, gameplayState.getStageCollisionZ(2), 'Open Stages 1 & 2 + Closed Stage 3 blocks movement at z = 25.6');

  const [, clampedAllOpen] = gameplayState.clampMultiStageCharacterPosition(0, 29, ['open', 'open', 'open']);
  assert.equal(clampedAllOpen, 29, 'All 3 stages open allows walking into the Golden Lotus Sanctuary (z = 29)');

  // 7.6 Stage progression & failed stage retry behavior
  // Pass Stage 1
  const s1Session = {
    ...gameplayState.createTypingSessionState(1),
    completedCount: 30,
    incorrectCount: 1,
    bestStreak: 25,
    finished: true,
  };
  stageStates = gameplayState.recordStageAttemptResult(
    stageStates,
    0,
    stage1PassMetrics,
    s1Session,
    stage1Plan.units,
    15000,
    'open',
  );
  assert.equal(stageStates[0].passed, true);
  assert.equal(stageStates[0].status, 'open');
  assert.equal(gameplayState.canAccessStage(1, 1, stageStates), true, 'Stage 2 unlocks after Stage 1 is open');
  assert.equal(gameplayState.canAccessStage(2, 2, stageStates), false, 'Stage 3 remains locked until Stage 2 is open');

  // Pass Stage 2
  const s2Session = {
    ...gameplayState.createTypingSessionState(2),
    completedCount: 22,
    incorrectCount: 1,
    bestStreak: 20,
    finished: true,
  };
  stageStates = gameplayState.recordStageAttemptResult(
    stageStates,
    1,
    stage2PassMetrics,
    s2Session,
    stage2Plan.units,
    22000,
    'open',
  );
  assert.equal(stageStates[1].passed, true);
  assert.equal(stageStates[1].status, 'open');
  assert.equal(gameplayState.canAccessStage(2, 2, stageStates), true, 'Stage 3 unlocks after Stage 2 is open');

  // Fail Stage 3 first (88% < 92%) -> Stage 3 stays closed and can be retried
  const s3FailSession = {
    ...gameplayState.createTypingSessionState(3),
    completedCount: 23,
    incorrectCount: 3,
    bestStreak: 12,
    finished: true,
  };
  stageStates = gameplayState.recordStageAttemptResult(
    stageStates,
    2,
    stage3FailAt87,
    s3FailSession,
    stage3Plan.units,
    20000,
    'closed',
  );
  assert.equal(stageStates[2].passed, false, 'Stage 3 must remain unpassed after 87% attempt');
  assert.equal(stageStates[2].status, 'closed', 'Stage 3 barrier must remain closed after failed attempt');
  assert.equal(stageStates[2].attempts, 1);
  assert.equal(gameplayState.areAllStagesCompleted(stageStates), false);
  assert.equal(gameplayState.canAccessStage(2, 2, stageStates), true, 'Failed Stage 3 can be retried immediately');

  // Retry Stage 3 and pass (96% >= 92%)
  const s3PassSession = {
    ...gameplayState.createTypingSessionState(4),
    completedCount: 23,
    incorrectCount: 1,
    bestStreak: 15,
    finished: true,
  };
  stageStates = gameplayState.recordStageAttemptResult(
    stageStates,
    2,
    stage3PassAt96,
    s3PassSession,
    stage3Plan.units,
    20000,
    'open',
  );
  assert.equal(stageStates[2].passed, true);
  assert.equal(stageStates[2].status, 'open');
  assert.equal(stageStates[2].attempts, 2);
  assert.equal(gameplayState.areAllStagesCompleted(stageStates), true, 'All 3 stages are now completed');

  // 7.7 Shifted characters in curriculum have opposite-hand Shift guidance
  const shiftLesson = gameplayState.resolveThreeLessonConfig(2, 1);
  const shiftedUnitsInLesson = shiftLesson.stages.flatMap(
    (s) => gameplayState.createStageTypingPlan(s, shiftLesson.lesson.focusKeys).units
  ).filter((u) => u.modifier === 'shift');
  assert.ok(shiftedUnitsInLesson.length > 0, 'World 2 Lesson 1 contains shifted characters');
  for (const unit of shiftedUnitsInLesson) {
    const shiftCode = fingerGuidanceMod.getRequiredShiftKeyCode(unit.key, true);
    const expectedShift = unit.key.hand === 'right' ? 'ShiftLeft' : 'ShiftRight';
    assert.equal(
      shiftCode,
      expectedShift,
      `Shifted character ${unit.value} on ${unit.key.code} (${unit.key.hand} hand) must require ${expectedShift}`,
    );
  }

  // 7.8 Final lesson score calculation across all 3 stages
  const finalLessonMetrics = gameplayState.computeFinalLessonMetrics(
    stageStates,
    lessonConfig.lesson,
    lessonConfig.worldId,
  );
  assert.equal(finalLessonMetrics.passed, true, 'Final lesson metrics must pass when all 3 stages pass');
  assert.equal(
    finalLessonMetrics.totalRequiredInputs,
    30 + 22 + 23,
    'Total required inputs across Stages 1, 2, and 3 must equal 75',
  );
  assert.equal(
    finalLessonMetrics.acceptedCorrectInputs,
    30 + 22 + 23,
    'Accepted correct inputs across Stages 1, 2, and 3 must equal 75',
  );

  assert.ok(finalLessonMetrics.accuracy >= 90, `Final accuracy should be >= 90%, got ${finalLessonMetrics.accuracy}`);
  assert.ok(finalLessonMetrics.finalScore > 0, 'Final lesson score must be positive');

  // 7.9 Duplicate reward prevention on lesson replay & in-memory persistence adapter
  const lessonLedger = gameplayState.createPrototypeRewardLedger();
  const persistence = gameplayState.createInMemoryLessonPersistenceAdapter();

  const firstLessonClaim = lessonLedger.claimLessonReward(
    lessonConfig.worldId,
    lessonConfig.lesson.id,
    finalLessonMetrics,
    lessonConfig.lessonSpeedTargetCpm,
    4,
  );
  assert.equal(firstLessonClaim.duplicate, false, 'First lesson completion must grant reward');
  assert.ok(firstLessonClaim.reward.xpEarned > 0);
  assert.ok(firstLessonClaim.reward.coinsEarned > 0);

  persistence.recordLessonCompletion({
    worldId: lessonConfig.worldId,
    lessonId: lessonConfig.lesson.id,
    lessonCompletionIndex: 1,
    stageStates,
    finalMetrics: finalLessonMetrics,
    reward: firstLessonClaim.reward,
    completedAt: Date.now(),
  });
  assert.equal(persistence.getCompletions().length, 1);

  const totalsAfterLesson1 = lessonLedger.getTotals();
  assert.equal(lessonLedger.hasClaimedLesson(lessonConfig.worldId, lessonConfig.lesson.id), true);

  // Replay the same lesson (new attemptId = 7, same worldId & lessonId) -> must NOT grant duplicate reward
  const replayLessonClaim = lessonLedger.claimLessonReward(
    lessonConfig.worldId,
    lessonConfig.lesson.id,
    finalLessonMetrics,
    lessonConfig.lessonSpeedTargetCpm,
    7,
  );
  assert.equal(replayLessonClaim.duplicate, true, 'Replaying completed lesson must flag duplicate = true');
  assert.deepEqual(
    lessonLedger.getTotals(),
    totalsAfterLesson1,
    'Replaying completed lesson must NOT increase total session XP or coins',
  );

  // =========================================================================
  // 8. MASTER TASK 5.5: 5-STAGE FOUNDATION LESSON & KEY PRACTICE TRACKING
  // =========================================================================
  const foundations = await server.ssrLoadModule('/src/data/touchTypingFoundations.ts');

  // 8.1 Access resolution for ?foundation=1
  const foundationAccess = access('foundation=1');
  assert.equal(foundationAccess.status, 'ready');
  assert.equal(foundationAccess.isFoundation, true);

  // 8.2 Resolve Foundation Lesson 5-stage configuration
  const foundationConfig = gameplayState.resolveFoundationLessonConfig();
  assert.equal(foundationConfig.isFoundationLesson, true);
  assert.equal(foundationConfig.stages.length, 5, 'Foundation lesson must have 5 stages');
  assert.deepEqual(
    foundationConfig.stages.map((s) => s.id),
    ['f1-s1', 'f1-s2', 'f1-s3', 'f1-s4', 'f1-s5'],
  );
  assert.deepEqual(
    foundationConfig.stages.map((s) => s.practiceMode),
    ['hand-position', 'physical-key', 'physical-key', 'physical-key', 'unicode-output'],
  );
  assert.deepEqual(
    foundationConfig.stages.map((s) => s.accuracyGoal),
    [85, 88, 88, 90, 90],
  );
  assert.equal(foundationConfig.stages[0].untimed, true, 'Stage 1 hand-position warmup must be untimed');
  assert.ok((foundationConfig.stages[0].postureInstructionsKh?.length ?? 0) >= 4, 'Stage 1 must include Khmer posture instructions');

  // 8.3 Verify 5-stage to 3-physical-barrier mapping
  assert.equal(gameplayState.getStageBarrierIndex(0, 5), 0);
  assert.equal(gameplayState.getStageBarrierIndex(1, 5), 0);
  assert.equal(gameplayState.getStageBarrierIndex(2, 5), 1);
  assert.equal(gameplayState.getStageBarrierIndex(3, 5), 1);
  assert.equal(gameplayState.getStageBarrierIndex(4, 5), 2);

  assert.equal(gameplayState.doesStageUnlockPhysicalBarrier(0, 5), false, 'Stage 1 does not open barrier 0 until Stage 2 also passes');
  assert.equal(gameplayState.doesStageUnlockPhysicalBarrier(1, 5), true, 'Stage 2 opens barrier 0');
  assert.equal(gameplayState.doesStageUnlockPhysicalBarrier(2, 5), false, 'Stage 3 does not open barrier 1 until Stage 4 also passes');
  assert.equal(gameplayState.doesStageUnlockPhysicalBarrier(3, 5), true, 'Stage 4 opens barrier 1');
  assert.equal(gameplayState.doesStageUnlockPhysicalBarrier(4, 5), true, 'Stage 5 opens barrier 2');

  // 8.4 Simulate completing all 5 stages of the Foundation Lesson (Mode A & Mode B)
  let fStageStates = gameplayState.createInitialStageProgressStates(foundationConfig.stages);
  assert.deepEqual(
    gameplayState.getPhysicalBarrierStatuses(fStageStates.map((s) => s.status)),
    ['closed', 'closed', 'closed'],
  );

  for (let sIdx = 0; sIdx < foundationConfig.stages.length; sIdx += 1) {
    const fStage = foundationConfig.stages[sIdx];
    const fPlan = gameplayState.createStageTypingPlan(fStage, foundationConfig.lesson.focusKeys);
    assert.ok(fPlan.units.length > 0, `Foundation Stage ${sIdx + 1} must have typing units`);

    let fSession = gameplayState.createTypingSessionState(100 + sIdx);

    // Verify wrong physical key is rejected in Mode A stages
    if (fStage.practiceMode === 'physical-key' || fStage.practiceMode === 'hand-position') {
      const wrongKeyCode = fPlan.units[0].key.code === 'KeyA' ? 'KeyL' : 'KeyA';
      const wrongStep = gameplayState.applyTypedInput(
        fSession,
        fPlan.units,
        'WRONG',
        1000,
        wrongKeyCode,
      );
      assert.equal(wrongStep.matched, false, 'Wrong physical key code must not match in Mode A');
      // Reset session for clean pass
      fSession = gameplayState.createTypingSessionState(200 + sIdx);
    }

    for (let uIdx = 0; uIdx < fPlan.units.length; uIdx += 1) {
      const unit = fPlan.units[uIdx];
      const step = gameplayState.applyTypedInput(
        fSession,
        fPlan.units,
        unit.value,
        1000 + uIdx * 250,
        unit.key.code,
      );
      assert.equal(step.matched, true, `Stage ${sIdx + 1} unit ${uIdx} (${unit.key.code}) must match`);
      fSession = step.nextState;
    }

    assert.equal(fSession.finished, true, `Foundation Stage ${sIdx + 1} must finish after all units`);
    const fMetrics = gameplayState.computeStageMetrics(
      fPlan.units,
      fSession.completedCount,
      fSession.incorrectCount,
      fSession.backspaceCount,
      fSession.bestStreak,
      5000,
      fStage,
      foundationConfig.lesson,
      foundationConfig.worldId,
    );
    assert.equal(fMetrics.passed, true, `Foundation Stage ${sIdx + 1} must pass with 100% accuracy`);

    fStageStates = gameplayState.recordStageAttemptResult(
      fStageStates,
      sIdx,
      fMetrics,
      fSession,
      fPlan.units,
      5000,
      'open',
    );
  }

  assert.equal(gameplayState.areAllStagesCompleted(fStageStates), true, 'All 5 foundation stages must complete');
  assert.deepEqual(
    gameplayState.getPhysicalBarrierStatuses(fStageStates.map((s) => s.status)),
    ['open', 'open', 'open'],
    'All 3 physical barriers must open after completing all 5 foundation stages',
  );

  // 8.5 Verify per-key practice tracker (physical vs virtual-assisted inputs, strong/weak keys)
  const tracker = foundations.createKeyPracticeTracker();
  tracker.recordKeyAttempt('KeyF', 'KeyF', true, 'physical');
  tracker.recordKeyAttempt('KeyF', 'KeyF', true, 'physical');
  tracker.recordKeyAttempt('KeyJ', 'KeyJ', true, 'physical');
  tracker.recordKeyAttempt('KeyG', 'KeyF', false, 'physical');
  tracker.recordKeyAttempt('KeyG', 'KeyG', true, 'virtual'); // virtual click does not count toward physicalCorrectCount

  const summary = tracker.getSummary();
  assert.equal(summary.totalAttempts, 5);
  assert.equal(summary.physicalCorrectCount, 3);
  assert.equal(summary.virtualAssistedCount, 1);
  assert.ok(summary.strongKeys.some((k) => k.code === 'KeyF' && k.accuracy === 100));
  assert.ok(summary.weakKeys.some((k) => k.code === 'KeyG' && k.accuracy === 50));
  assert.ok(summary.feedbackKh.includes('G'), 'Feedback must highlight weak key G');
  assert.ok(summary.nextLessonGuidanceKh.includes('មេរៀនទី ១'), 'Next lesson guidance must direct to World 1 Lesson 1');

  // 8.6 Verify UI rendering of 2D/3D Keyboard, Hand Diagrams, Posture Overlay, and Victory Summary
  const KhmerKeyboardMod = await server.ssrLoadModule('/src/components/lesson/KhmerKeyboard.tsx');
  const TypingHandsMod = await server.ssrLoadModule('/src/components/lesson/TypingHands.tsx');
  const TypingOverlayMod = await server.ssrLoadModule('/src/features/three-game/components/TypingOverlay.tsx');
  const VictoryModalMod = await server.ssrLoadModule('/src/features/three-game/components/VictoryModal.tsx');

  // 2D KhmerKeyboard + TypingHands: verify tactile bumps on F/J and single opposite-hand Shift highlight
  const kbMarkupShiftK = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KhmerKeyboardMod.default, {
      activeCode: 'KeyK',
      shiftRequired: true,
      activeHand: 'right',
      activeFinger: 'right-middle',
      hintLabel: '',
      keyLabel: 'គ',
      onKeyPress: () => {},
    }),
  );
  assert.ok(kbMarkupShiftK.includes('data-key-code="KeyF"') && kbMarkupShiftK.includes('data-tactile-bump="true"'));
  assert.ok(kbMarkupShiftK.includes('data-key-code="ShiftLeft" data-key-action="shift" data-is-shift-target="true"'));
  assert.ok(!kbMarkupShiftK.includes('data-key-code="ShiftRight" data-key-action="shift" data-is-shift-target="true"'));

  const handsMarkup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TypingHandsMod.default, {
      guidance: fingerGuidanceMod.getFingerGuidance(keyboardMap.findKhmerKeyByCode('KeyG'), false),
    }),
  );
  assert.ok(handsMarkup.includes('data-testid="typing-hand-hints"'));
  assert.ok(handsMarkup.includes('data-home-key="KeyF"'), '2D TypingHands must expose home-row anchor KeyF for KeyG');

  // 3D TypingOverlay on Stage 1 (hand-position posture warmup) & Stage 3 (reach-and-return)
  const fStage1 = foundationConfig.stages[0];
  const fStage1Plan = gameplayState.createStageTypingPlan(fStage1, foundationConfig.lesson.focusKeys);
  const overlayStage1Markup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TypingOverlayMod.default, {
      targetUnits: fStage1Plan.units,
      metrics: passingMetrics,
      minimumAccuracy: 85,
      speedTargetCpm: 20,
      completedCount: 0,
      streak: 0,
      stage: fStage1,
      stageIndex: 0,
      totalStages: 5,
      isFoundationLesson: true,
      onCompleteHandPositionStage: () => {},
      onCharInput: () => true,
      onBackspace: () => {},
      onRetry: () => {},
      onClose: () => {},
    }),
  );
  assert.ok(overlayStage1Markup.includes('ទីតាំងដៃលើជួរកណ្តាល'), 'Stage 1 overlay must display Khmer hand-position title');
  assert.ok(overlayStage1Markup.includes('អង្គុយឲ្យត្រង់ខ្លួន'), 'Stage 1 overlay must display Khmer sitting posture guidance');
  assert.ok(overlayStage1Markup.includes('យល់ហើយ • បន្តទៅដំណាក់កាលទី 2'), 'Stage 1 overlay must display ready/continue button');

  const fStage3 = foundationConfig.stages[2];
  const fStage3Plan = gameplayState.createStageTypingPlan(fStage3, foundationConfig.lesson.focusKeys);
  const overlayStage3Markup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TypingOverlayMod.default, {
      targetUnits: fStage3Plan.units,
      metrics: passingMetrics,
      minimumAccuracy: 88,
      speedTargetCpm: 20,
      completedCount: 1, // Unit index 1 in Stage 3 is KeyG (reach from F to G)
      streak: 1,
      stage: fStage3,
      stageIndex: 2,
      totalStages: 5,
      isFoundationLesson: true,
      onCharInput: () => true,
      onBackspace: () => {},
      onRetry: () => {},
      onClose: () => {},
    }),
  );
  assert.ok(
    overlayStage3Markup.includes('ពី F ទៅ G រួចត្រឡប់មកទីតាំងដើម F វិញ'),
    'Stage 3 overlay must display Khmer reach-and-return instruction for KeyG',
  );

  // 3D VictoryModal with foundationSummary
  const victoryMarkup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(VictoryModalMod.default, {
        passed: true,
        minimumAccuracy: 90,
        reward: firstLessonClaim.reward,
        stageSummary: {
          stageIndex: 4,
          stageId: 'f1-s5',
          titleKh: 'បេសកកម្មទ្វារប្រាសាទ',
          titleEn: 'Mini Adventure Challenge',
          passed: true,
          minimumAccuracy: 90,
          metrics: passingMetrics,
          isFinalStage: true,
          foundationPracticeSummary: summary,
        },
        stages: foundationConfig.stages,
        stageStates: fStageStates,
        finalLessonMetrics,
        onWalkThrough: () => {},
        onRetry: () => {},
      }),
    ),
  );
  assert.ok(victoryMarkup.includes('មេរៀនទី ១'), 'VictoryModal must display next lesson guidance to World 1 Lesson 1');
  assert.ok(victoryMarkup.includes('data-testid="three-foundation-practice-summary"'), 'VictoryModal must render foundation practice summary');
  assert.ok(victoryMarkup.includes('F (ថ)'), 'VictoryModal must display practiced key F (ថ)');
  assert.ok(victoryMarkup.includes('G (ង)'), 'VictoryModal must display practiced key G (ង)');

  // 8.7 ExplorationHud: verify compact bottom-center quest bar and non-obstructing center layout
  const ExplorationHudMod = await server.ssrLoadModule('/src/features/three-game/components/ExplorationHud.tsx');
  const demoStages = lessonConfig.stages;
  const demoInitialStageStates = gameplayState.createInitialStageProgressStates(demoStages);

  const hudExploringMarkup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      {},
      React.createElement(ExplorationHudMod.default, {
        isNearGate: false,
        gateStatus: 'closed',
        lessonTitleKh: 'ព្យញ្ជនៈដំបូង',
        lessonTitleEn: 'First Consonants',
        stages: demoStages,
        stageStates: demoInitialStageStates,
        activeStageIndex: 0,
        activeStageMinimumAccuracy: 90,
        allStagesCompleted: false,
        onStartTyping: () => {},
      }),
    ),
  );
  assert.ok(hudExploringMarkup.includes('data-testid="three-exploration-hud"'), 'Must render ExplorationHud container');
  assert.ok(hudExploringMarkup.includes('data-testid="three-back-to-map"'), 'Must render back to 2D Map button');
  assert.ok(hudExploringMarkup.includes('data-testid="three-lesson-badge"'), 'Must render lesson badge');
  assert.ok(hudExploringMarkup.includes('data-testid="three-stage-stepper"'), 'Must render multi-stage stepper');
  assert.ok(hudExploringMarkup.includes('data-testid="three-unlock-gate-btn"'), 'Must render accessible start stage button');
  assert.ok(hudExploringMarkup.includes('data-testid="three-movement-hints"'), 'Must render movement hints widget');
  assert.ok(hudExploringMarkup.includes('[W / ↑]'), 'Must render movement keys in bottom quest bar');
  assert.ok(hudExploringMarkup.includes('E'), 'Must render E key hint in start button');

  // Verify ExplorationHud when near gate
  const hudNearGateMarkup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      {},
      React.createElement(ExplorationHudMod.default, {
        isNearGate: true,
        gateStatus: 'closed',
        lessonTitleKh: 'ព្យញ្ជនៈដំបូង',
        lessonTitleEn: 'First Consonants',
        stages: demoStages,
        stageStates: demoInitialStageStates,
        activeStageIndex: 0,
        activeStageMinimumAccuracy: 90,
        allStagesCompleted: false,
        onStartTyping: () => {},
      }),
    ),
  );
  assert.ok(hudNearGateMarkup.includes('data-testid="three-unlock-gate-btn"'), 'Must render unlock button when near gate');
  assert.ok(hudNearGateMarkup.includes('ចាប់ផ្តើម'), 'Must render Khmer start text');

  // Verify ExplorationHud when gate is open
  const hudOpenMarkup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      {},
      React.createElement(ExplorationHudMod.default, {
        isNearGate: false,
        gateStatus: 'open',
        lessonTitleKh: 'ព្យញ្ជនៈដំបូង',
        lessonTitleEn: 'First Consonants',
        stages: demoStages,
        stageStates: demoInitialStageStates.map((s) => ({ ...s, status: 'open', passed: true })),
        activeStageIndex: 0,
        activeStageMinimumAccuracy: 90,
        allStagesCompleted: true,
        onStartTyping: () => {},
      }),
    ),
  );
  assert.ok(hudOpenMarkup.includes('data-testid="three-gate-open-banner"'), 'Must render gate open celebration banner');
  assert.ok(hudOpenMarkup.includes('ដើរឆ្លងកាត់ទ្វារបុរាណ'), 'Must instruct player to walk through the ancient gate');

  // 17. Verify 3D Character Rigged Assets & Relative Kinematic Math
  const fs = await import('node:fs');
  const path = await import('node:path');
  const modelPath = path.resolve('public/models/characters/Khmer_Student_Hero_Rigged.glb');
  assert.ok(fs.existsSync(modelPath), 'Khmer_Student_Hero_Rigged.glb must exist in public/models/characters');
  const runtimeModelPath = path.resolve('public/models/characters/khmer_student_hero.glb');
  assert.ok(fs.existsSync(runtimeModelPath), 'khmer_student_hero.glb must exist in public/models/characters');

  // Verify relative delta rotation logic preserves rest orientation when delta is 0
  const restQuat = new THREE.Quaternion(1, 0, 0, 0); // Inverted leg pitch (PI radians)
  const deltaEuler = new THREE.Euler(0, 0, 0, 'XYZ');
  const deltaQuat = new THREE.Quaternion().setFromEuler(deltaEuler);
  const resultQuat = restQuat.clone().multiply(deltaQuat);
  assert.equal(resultQuat.x, 1, 'Zero delta rotation must leave rest quaternion unchanged');
  assert.equal(resultQuat.w, 0, 'Zero delta rotation must leave rest quaternion unchanged');

  // Verify forward leg swing applies delta without collapsing 180-degree rest pitch
  const swingEuler = new THREE.Euler(0.5, 0, 0, 'XYZ');
  const swingDelta = new THREE.Quaternion().setFromEuler(swingEuler);
  const swungQuat = restQuat.clone().multiply(swingDelta);
  assert.ok(Math.abs(swungQuat.x) > 0.9, 'Forward swing must modulate rest pitch naturally');

  // 18. MASTER TASK 7A: Comprehensive World 1 Lesson 2 (ជួរកណ្តាលដៃស្តាំ) Verification
  const l2Config = gameplayState.resolveThreeLessonConfig(1, 2);
  assert.equal(l2Config.worldId, 1);
  assert.equal(l2Config.lesson.id, 2);
  assert.equal(l2Config.lesson.labelKh, 'ជួរកណ្តាលដៃស្តាំ');
  assert.equal(l2Config.lesson.labelEn, 'Right-Hand Home Row');
  assert.equal(l2Config.stages.length, 3);
  assert.equal(l2Config.isFoundationLesson, false);

  const [l2s1, l2s2, l2s3] = l2Config.stages;
  // Stage 1: ស្ពានដំបូង (First Bridge)
  assert.equal(l2s1.id, 'w1-l2-s1');
  assert.equal(l2s1.titleKh, 'ស្ពានដំបូង');
  assert.equal(l2s1.titleEn, 'First Bridge');
  assert.equal(gameplayState.getStageMinimumAccuracy(l2s1, l2Config.lesson, l2Config.worldId), 90);
  const l2s1Val = typingPlanMod.validateStageTypingPlan(l2s1);
  assert.equal(l2s1Val.valid, true, 'Stage 1 must have valid typing plan');
  assert.equal(l2s1Val.unsupportedInputs.length, 0, 'Stage 1 must have 0 unsupported inputs');
  const l2s1Plan = gameplayState.createStageTypingPlan(l2s1);
  assert.equal(l2s1Plan.units.length, 47);

  // Stage 2: គូប្រយ័ត្ន (Careful Pairs)
  assert.equal(l2s2.id, 'w1-l2-s2');
  assert.equal(l2s2.titleKh, 'គូប្រយ័ត្ន');
  assert.equal(l2s2.titleEn, 'Careful Pairs');
  assert.equal(gameplayState.getStageMinimumAccuracy(l2s2, l2Config.lesson, l2Config.worldId), 92);
  const l2s2Val = typingPlanMod.validateStageTypingPlan(l2s2);
  assert.equal(l2s2Val.valid, true, 'Stage 2 must have valid typing plan');
  assert.equal(l2s2Val.unsupportedInputs.length, 0, 'Stage 2 must have 0 unsupported inputs');
  const l2s2Plan = gameplayState.createStageTypingPlan(l2s2);
  assert.equal(l2s2Plan.units.length, 50);

  // Stage 3: ជណ្តើរភ្នំ (Hill Steps)
  assert.equal(l2s3.id, 'w1-l2-s3');
  assert.equal(l2s3.titleKh, 'ជណ្តើរភ្នំ');
  assert.equal(l2s3.titleEn, 'Hill Steps');
  assert.equal(gameplayState.getStageMinimumAccuracy(l2s3, l2Config.lesson, l2Config.worldId), 92);
  const l2s3Val = typingPlanMod.validateStageTypingPlan(l2s3);
  assert.equal(l2s3Val.valid, true, 'Stage 3 must have valid typing plan');
  assert.equal(l2s3Val.unsupportedInputs.length, 0, 'Stage 3 must have 0 unsupported inputs');
  const l2s3Plan = gameplayState.createStageTypingPlan(l2s3);
  assert.equal(l2s3Plan.units.length, 56);

  // Verify passing and failing accuracy per stage requirements
  // Stage 1 (90% threshold)
  const l2s1Pass = gameplayState.computeStageMetrics(l2s1Plan.units, 47, 4, 0, 40, 20000, l2s1, l2Config.lesson, l2Config.worldId);
  assert.ok(l2s1Pass.accuracy >= 90);
  assert.equal(gameplayState.shouldUnlockStage(l2s1Pass), true);
  const l2s1Fail = gameplayState.computeStageMetrics(l2s1Plan.units, 47, 10, 0, 30, 20000, l2s1, l2Config.lesson, l2Config.worldId);
  assert.ok(l2s1Fail.accuracy < 90);
  assert.equal(gameplayState.shouldUnlockStage(l2s1Fail), false);

  // Stage 2 (92% threshold)
  const l2s2Pass = gameplayState.computeStageMetrics(l2s2Plan.units, 50, 3, 0, 45, 20000, l2s2, l2Config.lesson, l2Config.worldId);
  assert.ok(l2s2Pass.accuracy >= 92);
  assert.equal(gameplayState.shouldUnlockStage(l2s2Pass), true);
  const l2s2Fail = gameplayState.computeStageMetrics(l2s2Plan.units, 50, 8, 0, 35, 20000, l2s2, l2Config.lesson, l2Config.worldId);
  assert.ok(l2s2Fail.accuracy < 92);
  assert.equal(gameplayState.shouldUnlockStage(l2s2Fail), false);

  // Stage 3 (92% threshold)
  const l2s3Pass = gameplayState.computeStageMetrics(l2s3Plan.units, 56, 3, 0, 50, 20000, l2s3, l2Config.lesson, l2Config.worldId);
  assert.ok(l2s3Pass.accuracy >= 92);
  assert.equal(gameplayState.shouldUnlockStage(l2s3Pass), true);
  const l2s3Fail = gameplayState.computeStageMetrics(l2s3Plan.units, 56, 10, 0, 40, 20000, l2s3, l2Config.lesson, l2Config.worldId);
  assert.ok(l2s3Fail.accuracy < 92);
  assert.equal(gameplayState.shouldUnlockStage(l2s3Fail), false);

  // Traversal boundary clamping for Lesson 2 (3 stages at Z = 6, 16, 26)
  const initialL2States = gameplayState.createInitialStageProgressStates(l2Config.stages);
  assert.equal(initialL2States.length, 3);
  assert.equal(gameplayState.canAccessStage(0, 0, initialL2States), true);
  assert.equal(gameplayState.canAccessStage(1, 1, initialL2States), false);
  assert.equal(gameplayState.canAccessStage(2, 2, initialL2States), false);

  // Barrier 0 (Gate 1 at Z=6, collision at Z=5.6)
  const clampedBeforeGate1 = gameplayState.clampMultiStageCharacterPosition(0, 7.0, initialL2States.map((s) => s.status));
  assert.ok(clampedBeforeGate1[1] <= 5.6, 'Cannot cross Gate 1 when closed');

  // After Stage 1 cleared
  const afterS1States = initialL2States.map((s, idx) => idx === 0 ? { ...s, status: 'open', passed: true } : s);
  assert.equal(gameplayState.canAccessStage(1, 1, afterS1States), true);
  const clampedBeforeGate2 = gameplayState.clampMultiStageCharacterPosition(0, 17.0, afterS1States.map((s) => s.status));
  assert.ok(clampedBeforeGate2[1] <= 15.6, 'Cannot cross Gate 2 when closed');

  // After Stage 2 cleared
  const afterS2States = afterS1States.map((s, idx) => idx === 1 ? { ...s, status: 'open', passed: true } : s);
  assert.equal(gameplayState.canAccessStage(2, 2, afterS2States), true);
  const clampedBeforeGate3 = gameplayState.clampMultiStageCharacterPosition(0, 27.0, afterS2States.map((s) => s.status));
  assert.ok(clampedBeforeGate3[1] <= 25.6, 'Cannot cross Gate 3 when closed');

  // After all 3 stages cleared
  const afterAllCleared = afterS2States.map((s, idx) => idx === 2 ? { ...s, status: 'open', passed: true } : s);
  assert.equal(gameplayState.areAllStagesCompleted(afterAllCleared), true);
  const clampedFinal = gameplayState.clampMultiStageCharacterPosition(0, 29.5, afterAllCleared.map((s) => s.status));
  assert.equal(clampedFinal[1], 29.5, 'Can reach inner forecourt once all stages are open');

  // 19. MASTER TASK 7B: Comprehensive World 1 Lesson 3 (ការសម្របសម្រួលដៃទាំងពីរ) Verification
  const l3Config = gameplayState.resolveThreeLessonConfig(1, 3);
  assert.equal(l3Config.worldId, 1);
  assert.equal(l3Config.lesson.id, 3);
  assert.equal(l3Config.stages.length, 3);
  assert.equal(l3Config.isFoundationLesson, false);

  const [l3s1, l3s2, l3s3] = l3Config.stages;
  // Stage 1: ឆ្លាស់ដៃជួរកណ្តាល (w1-l3-s1)
  assert.equal(l3s1.id, 'w1-l3-s1');
  assert.equal(gameplayState.getStageMinimumAccuracy(l3s1, l3Config.lesson, l3Config.worldId), 90);
  const l3s1Plan = gameplayState.createStageTypingPlan(l3s1);
  assert.equal(l3s1Plan.units.length, 24);
  const l3s1Val = typingPlanMod.validateStageTypingPlan(l3s1);
  assert.equal(l3s1Val.valid, true);
  assert.equal(l3s1Val.unsupportedInputs.length, 0);

  // Stage 2: គូគ្រាប់ចុចជួរកណ្តាល (w1-l3-s2)
  assert.equal(l3s2.id, 'w1-l3-s2');
  assert.equal(gameplayState.getStageMinimumAccuracy(l3s2, l3Config.lesson, l3Config.worldId), 92);
  const l3s2Plan = gameplayState.createStageTypingPlan(l3s2);
  assert.equal(l3s2Plan.units.length, 23);
  const l3s2Val = typingPlanMod.validateStageTypingPlan(l3s2);
  assert.equal(l3s2Val.valid, true);
  assert.equal(l3s2Val.unsupportedInputs.length, 0);

  // Stage 3: ពាក្យដំបូងជួរកណ្តាល (w1-l3-s3)
  assert.equal(l3s3.id, 'w1-l3-s3');
  assert.equal(gameplayState.getStageMinimumAccuracy(l3s3, l3Config.lesson, l3Config.worldId), 92);
  const l3s3Plan = gameplayState.createStageTypingPlan(l3s3);
  assert.equal(l3s3Plan.units.length, 25);
  const l3s3Val = typingPlanMod.validateStageTypingPlan(l3s3);
  assert.equal(l3s3Val.valid, true);
  assert.equal(l3s3Val.unsupportedInputs.length, 0);

  // Pass & fail metrics for Lesson 3
  const l3s1Pass = gameplayState.computeStageMetrics(l3s1Plan.units, 24, 2, 0, 22, 18000, l3s1, l3Config.lesson, 1);
  assert.ok(l3s1Pass.accuracy >= 90);
  assert.equal(gameplayState.shouldUnlockStage(l3s1Pass), true);
  const l3s1Fail = gameplayState.computeStageMetrics(l3s1Plan.units, 24, 5, 0, 18, 18000, l3s1, l3Config.lesson, 1);
  assert.ok(l3s1Fail.accuracy < 90);
  assert.equal(gameplayState.shouldUnlockStage(l3s1Fail), false);

  // Lesson 3 multi-stage progression and final metrics
  let l3States = gameplayState.createInitialStageProgressStates(l3Config.stages);
  const l3Sess1 = { ...gameplayState.createTypingSessionState(1), completedCount: 24, incorrectCount: 1, bestStreak: 20, finished: true };
  l3States = gameplayState.recordStageAttemptResult(l3States, 0, l3s1Pass, l3Sess1, l3s1Plan.units, 18000, 'open');

  const l3s2Pass = gameplayState.computeStageMetrics(l3s2Plan.units, 23, 1, 0, 22, 19000, l3s2, l3Config.lesson, 1);
  const l3Sess2 = { ...gameplayState.createTypingSessionState(2), completedCount: 23, incorrectCount: 1, bestStreak: 20, finished: true };
  l3States = gameplayState.recordStageAttemptResult(l3States, 1, l3s2Pass, l3Sess2, l3s2Plan.units, 19000, 'open');

  const l3s3Pass = gameplayState.computeStageMetrics(l3s3Plan.units, 25, 1, 0, 24, 20000, l3s3, l3Config.lesson, 1);
  const l3Sess3 = { ...gameplayState.createTypingSessionState(3), completedCount: 25, incorrectCount: 1, bestStreak: 22, finished: true };
  l3States = gameplayState.recordStageAttemptResult(l3States, 2, l3s3Pass, l3Sess3, l3s3Plan.units, 20000, 'open');

  assert.equal(gameplayState.areAllStagesCompleted(l3States), true);
  const l3FinalMetrics = gameplayState.computeFinalLessonMetrics(l3States, l3Config.lesson, 1);
  assert.equal(l3FinalMetrics.passed, true);
  assert.equal(l3FinalMetrics.totalRequiredInputs, 24 + 23 + 25);
  assert.ok(l3FinalMetrics.accuracy >= 92);

  // 20. MASTER TASK 7B: Comprehensive World 1 Lesson 4 (ការឈោងម្រាមចង្អុល G និង H) Verification
  const l4Config = gameplayState.resolveThreeLessonConfig(1, 4);
  assert.equal(l4Config.worldId, 1);
  assert.equal(l4Config.lesson.id, 4);
  assert.equal(l4Config.stages.length, 3);
  assert.equal(l4Config.isFoundationLesson, false);

  const [l4s1, l4s2, l4s3] = l4Config.stages;
  // Stage 1: ការឈោងម្រាមចង្អុល (w1-l4-s1)
  assert.equal(l4s1.id, 'w1-l4-s1');
  assert.equal(gameplayState.getStageMinimumAccuracy(l4s1, l4Config.lesson, l4Config.worldId), 90);
  const l4s1Plan = gameplayState.createStageTypingPlan(l4s1);
  assert.equal(l4s1Plan.units.length, 34);
  const l4s1Val = typingPlanMod.validateStageTypingPlan(l4s1);
  assert.equal(l4s1Val.valid, true);
  assert.equal(l4s1Val.unsupportedInputs.length, 0);

  // Stage 2: ព្យាង្គផ្សំម្រាមចង្អុល (w1-l4-s2)
  assert.equal(l4s2.id, 'w1-l4-s2');
  assert.equal(gameplayState.getStageMinimumAccuracy(l4s2, l4Config.lesson, l4Config.worldId), 92);
  const l4s2Plan = gameplayState.createStageTypingPlan(l4s2);
  assert.equal(l4s2Plan.units.length, 26);
  const l4s2Val = typingPlanMod.validateStageTypingPlan(l4s2);
  assert.equal(l4s2Val.valid, true);
  assert.equal(l4s2Val.unsupportedInputs.length, 0);

  // Stage 3: ចង្វាក់ម្រាមចង្អុលទាំងពីរ (w1-l4-s3)
  assert.equal(l4s3.id, 'w1-l4-s3');
  assert.equal(gameplayState.getStageMinimumAccuracy(l4s3, l4Config.lesson, l4Config.worldId), 92);
  const l4s3Plan = gameplayState.createStageTypingPlan(l4s3);
  assert.equal(l4s3Plan.units.length, 22);
  const l4s3Val = typingPlanMod.validateStageTypingPlan(l4s3);
  assert.equal(l4s3Val.valid, true);
  assert.equal(l4s3Val.unsupportedInputs.length, 0);

  // Pass & fail metrics for Lesson 4
  const l4s1Pass = gameplayState.computeStageMetrics(l4s1Plan.units, 34, 3, 0, 31, 20000, l4s1, l4Config.lesson, 1);
  assert.ok(l4s1Pass.accuracy >= 90);
  assert.equal(gameplayState.shouldUnlockStage(l4s1Pass), true);
  const l4s1Fail = gameplayState.computeStageMetrics(l4s1Plan.units, 34, 6, 0, 27, 20000, l4s1, l4Config.lesson, 1);
  assert.ok(l4s1Fail.accuracy < 90);
  assert.equal(gameplayState.shouldUnlockStage(l4s1Fail), false);

  // Lesson 4 multi-stage progression and final metrics
  let l4States = gameplayState.createInitialStageProgressStates(l4Config.stages);
  const l4Sess1 = { ...gameplayState.createTypingSessionState(1), completedCount: 34, incorrectCount: 1, bestStreak: 30, finished: true };
  l4States = gameplayState.recordStageAttemptResult(l4States, 0, l4s1Pass, l4Sess1, l4s1Plan.units, 20000, 'open');

  const l4s2Pass = gameplayState.computeStageMetrics(l4s2Plan.units, 26, 1, 0, 25, 21000, l4s2, l4Config.lesson, 1);
  const l4Sess2 = { ...gameplayState.createTypingSessionState(2), completedCount: 26, incorrectCount: 1, bestStreak: 22, finished: true };
  l4States = gameplayState.recordStageAttemptResult(l4States, 1, l4s2Pass, l4Sess2, l4s2Plan.units, 21000, 'open');

  const l4s3Pass = gameplayState.computeStageMetrics(l4s3Plan.units, 22, 1, 0, 21, 25000, l4s3, l4Config.lesson, 1);
  const l4Sess3 = { ...gameplayState.createTypingSessionState(3), completedCount: 22, incorrectCount: 1, bestStreak: 20, finished: true };
  l4States = gameplayState.recordStageAttemptResult(l4States, 2, l4s3Pass, l4Sess3, l4s3Plan.units, 25000, 'open');

  assert.equal(gameplayState.areAllStagesCompleted(l4States), true);
  const l4FinalMetrics = gameplayState.computeFinalLessonMetrics(l4States, l4Config.lesson, 1);
  assert.equal(l4FinalMetrics.passed, true);
  assert.equal(l4FinalMetrics.totalRequiredInputs, 34 + 26 + 22);
  assert.ok(l4FinalMetrics.accuracy >= 92);

  // 21. MASTER TASK 7B: Comprehensive World 1 Lesson 5 (ជួរលើដៃឆ្វេង Q W E R T) Verification
  const l5Config = gameplayState.resolveThreeLessonConfig(1, 5);
  assert.equal(l5Config.worldId, 1);
  assert.equal(l5Config.lesson.id, 5);
  assert.equal(l5Config.stages.length, 3);
  assert.equal(l5Config.isFoundationLesson, false);

  const [l5s1, l5s2, l5s3] = l5Config.stages;
  // Stage 1: ឈោងជួរលើដៃឆ្វេង (w1-l5-s1)
  assert.equal(l5s1.id, 'w1-l5-s1');
  assert.equal(gameplayState.getStageMinimumAccuracy(l5s1, l5Config.lesson, l5Config.worldId), 90);
  const l5s1Plan = gameplayState.createStageTypingPlan(l5s1);
  assert.equal(l5s1Plan.units.length, 33);
  const l5s1Val = typingPlanMod.validateStageTypingPlan(l5s1);
  assert.equal(l5s1Val.valid, true);
  assert.equal(l5s1Val.unsupportedInputs.length, 0);

  // Stage 2: ព្យាង្គ និងស្រៈជួរលើ (w1-l5-s2)
  assert.equal(l5s2.id, 'w1-l5-s2');
  assert.equal(gameplayState.getStageMinimumAccuracy(l5s2, l5Config.lesson, l5Config.worldId), 92);
  const l5s2Plan = gameplayState.createStageTypingPlan(l5s2);
  assert.equal(l5s2Plan.units.length, 26);
  const l5s2Val = typingPlanMod.validateStageTypingPlan(l5s2);
  assert.equal(l5s2Val.valid, true);
  assert.equal(l5s2Val.unsupportedInputs.length, 0);

  // Stage 3: ពាក្យជួរលើដៃឆ្វេង (w1-l5-s3)
  assert.equal(l5s3.id, 'w1-l5-s3');
  assert.equal(gameplayState.getStageMinimumAccuracy(l5s3, l5Config.lesson, l5Config.worldId), 92);
  const l5s3Plan = gameplayState.createStageTypingPlan(l5s3);
  assert.equal(l5s3Plan.units.length, 26);
  const l5s3Val = typingPlanMod.validateStageTypingPlan(l5s3);
  assert.equal(l5s3Val.valid, true);
  assert.equal(l5s3Val.unsupportedInputs.length, 0);

  // Pass & fail metrics for Lesson 5
  const l5s1Pass = gameplayState.computeStageMetrics(l5s1Plan.units, 33, 3, 0, 30, 20000, l5s1, l5Config.lesson, 1);
  assert.ok(l5s1Pass.accuracy >= 90);
  assert.equal(gameplayState.shouldUnlockStage(l5s1Pass), true);
  const l5s1Fail = gameplayState.computeStageMetrics(l5s1Plan.units, 33, 6, 0, 26, 20000, l5s1, l5Config.lesson, 1);
  assert.ok(l5s1Fail.accuracy < 90);
  assert.equal(gameplayState.shouldUnlockStage(l5s1Fail), false);

  // Lesson 5 multi-stage progression and final metrics
  let l5States = gameplayState.createInitialStageProgressStates(l5Config.stages);
  const l5Sess1 = { ...gameplayState.createTypingSessionState(1), completedCount: 33, incorrectCount: 1, bestStreak: 28, finished: true };
  l5States = gameplayState.recordStageAttemptResult(l5States, 0, l5s1Pass, l5Sess1, l5s1Plan.units, 20000, 'open');

  const l5s2Pass = gameplayState.computeStageMetrics(l5s2Plan.units, 26, 1, 0, 25, 21000, l5s2, l5Config.lesson, 1);
  const l5Sess2 = { ...gameplayState.createTypingSessionState(2), completedCount: 26, incorrectCount: 1, bestStreak: 24, finished: true };
  l5States = gameplayState.recordStageAttemptResult(l5States, 1, l5s2Pass, l5Sess2, l5s2Plan.units, 21000, 'open');

  const l5s3Pass = gameplayState.computeStageMetrics(l5s3Plan.units, 26, 1, 0, 25, 24000, l5s3, l5Config.lesson, 1);
  const l5Sess3 = { ...gameplayState.createTypingSessionState(3), completedCount: 26, incorrectCount: 1, bestStreak: 24, finished: true };
  l5States = gameplayState.recordStageAttemptResult(l5States, 2, l5s3Pass, l5Sess3, l5s3Plan.units, 24000, 'open');

  assert.equal(gameplayState.areAllStagesCompleted(l5States), true);
  const l5FinalMetrics = gameplayState.computeFinalLessonMetrics(l5States, l5Config.lesson, 1);
  assert.equal(l5FinalMetrics.passed, true);
  assert.equal(l5FinalMetrics.totalRequiredInputs, 33 + 26 + 26);
  assert.ok(l5FinalMetrics.accuracy >= 92);

  // =========================================================================
  // 22. Lesson 6: Right-Hand Upper Row (w1-l6) 3D Stages & Challenge Verification
  // =========================================================================
  const l6Config = gameplayState.resolveThreeLessonConfig(1, 6);
  assert.equal(l6Config.worldId, 1);
  assert.equal(l6Config.lesson.id, 6);
  assert.equal(l6Config.stages.length, 3);
  const [l6s1, l6s2, l6s3] = l6Config.stages;

  // Stage 1: w1-l6-s1
  assert.equal(l6s1.id, 'w1-l6-s1');
  assert.equal(gameplayState.getStageMinimumAccuracy(l6s1, l6Config.lesson, l6Config.worldId), 90);
  const l6s1Plan = gameplayState.createStageTypingPlan(l6s1);
  assert.equal(l6s1Plan.units.length, 32);
  const l6s1Val = typingPlanMod.validateStageTypingPlan(l6s1);
  assert.equal(l6s1Val.valid, true);

  // Stage 2: w1-l6-s2
  assert.equal(l6s2.id, 'w1-l6-s2');
  assert.equal(gameplayState.getStageMinimumAccuracy(l6s2, l6Config.lesson, l6Config.worldId), 92);
  const l6s2Plan = gameplayState.createStageTypingPlan(l6s2);
  assert.equal(l6s2Plan.units.length, 25);
  const l6s2Val = typingPlanMod.validateStageTypingPlan(l6s2);
  assert.equal(l6s2Val.valid, true);

  // Stage 3: w1-l6-s3
  assert.equal(l6s3.id, 'w1-l6-s3');
  assert.equal(gameplayState.getStageMinimumAccuracy(l6s3, l6Config.lesson, l6Config.worldId), 92);
  const l6s3Plan = gameplayState.createStageTypingPlan(l6s3);
  assert.equal(l6s3Plan.units.length, 28);
  const l6s3Val = typingPlanMod.validateStageTypingPlan(l6s3);
  assert.equal(l6s3Val.valid, true);

  // L6 Stage metrics & Progression
  const l6s1Pass = gameplayState.computeStageMetrics(l6s1Plan.units, 32, 2, 0, 30, 20000, l6s1, l6Config.lesson, 1);
  assert.ok(l6s1Pass.accuracy >= 90);
  assert.equal(gameplayState.shouldUnlockStage(l6s1Pass), true);
  const l6s1Fail = gameplayState.computeStageMetrics(l6s1Plan.units, 32, 6, 0, 26, 20000, l6s1, l6Config.lesson, 1);
  assert.ok(l6s1Fail.accuracy < 90);
  assert.equal(gameplayState.shouldUnlockStage(l6s1Fail), false);

  let l6States = gameplayState.createInitialStageProgressStates(l6Config.stages);
  const l6Sess1 = { ...gameplayState.createTypingSessionState(1), completedCount: 32, incorrectCount: 1, bestStreak: 30, finished: true };
  l6States = gameplayState.recordStageAttemptResult(l6States, 0, l6s1Pass, l6Sess1, l6s1Plan.units, 20000, 'open');

  const l6s2Pass = gameplayState.computeStageMetrics(l6s2Plan.units, 25, 1, 0, 24, 21000, l6s2, l6Config.lesson, 1);
  const l6Sess2 = { ...gameplayState.createTypingSessionState(2), completedCount: 25, incorrectCount: 1, bestStreak: 24, finished: true };
  l6States = gameplayState.recordStageAttemptResult(l6States, 1, l6s2Pass, l6Sess2, l6s2Plan.units, 21000, 'open');

  const l6s3Pass = gameplayState.computeStageMetrics(l6s3Plan.units, 28, 1, 0, 27, 24000, l6s3, l6Config.lesson, 1);
  const l6Sess3 = { ...gameplayState.createTypingSessionState(3), completedCount: 28, incorrectCount: 1, bestStreak: 27, finished: true };
  l6States = gameplayState.recordStageAttemptResult(l6States, 2, l6s3Pass, l6Sess3, l6s3Plan.units, 24000, 'open');

  assert.equal(gameplayState.areAllStagesCompleted(l6States), true);
  const l6FinalMetrics = gameplayState.computeFinalLessonMetrics(l6States, l6Config.lesson, 1);
  assert.equal(l6FinalMetrics.passed, true);
  assert.equal(l6FinalMetrics.totalRequiredInputs, 32 + 25 + 28);
  assert.ok(l6FinalMetrics.accuracy >= 92);

  // =========================================================================
  // 23. Lesson 7: Left-Hand Lower Row (w1-l7) 3D Stages & Challenge Verification
  // =========================================================================
  const l7Config = gameplayState.resolveThreeLessonConfig(1, 7);
  assert.equal(l7Config.worldId, 1);
  assert.equal(l7Config.lesson.id, 7);
  assert.equal(l7Config.stages.length, 3);
  const [l7s1, l7s2, l7s3] = l7Config.stages;

  // Stage 1: w1-l7-s1
  assert.equal(l7s1.id, 'w1-l7-s1');
  assert.equal(gameplayState.getStageMinimumAccuracy(l7s1, l7Config.lesson, l7Config.worldId), 90);
  const l7s1Plan = gameplayState.createStageTypingPlan(l7s1);
  assert.equal(l7s1Plan.units.length, 33);
  const l7s1Val = typingPlanMod.validateStageTypingPlan(l7s1);
  assert.equal(l7s1Val.valid, true);

  // Stage 2: w1-l7-s2
  assert.equal(l7s2.id, 'w1-l7-s2');
  assert.equal(gameplayState.getStageMinimumAccuracy(l7s2, l7Config.lesson, l7Config.worldId), 92);
  const l7s2Plan = gameplayState.createStageTypingPlan(l7s2);
  assert.equal(l7s2Plan.units.length, 25);
  const l7s2Val = typingPlanMod.validateStageTypingPlan(l7s2);
  assert.equal(l7s2Val.valid, true);

  // Stage 3: w1-l7-s3
  assert.equal(l7s3.id, 'w1-l7-s3');
  assert.equal(gameplayState.getStageMinimumAccuracy(l7s3, l7Config.lesson, l7Config.worldId), 92);
  const l7s3Plan = gameplayState.createStageTypingPlan(l7s3);
  assert.equal(l7s3Plan.units.length, 25);
  const l7s3Val = typingPlanMod.validateStageTypingPlan(l7s3);
  assert.equal(l7s3Val.valid, true);

  // L7 Stage metrics & Progression
  const l7s1Pass = gameplayState.computeStageMetrics(l7s1Plan.units, 33, 2, 0, 31, 20000, l7s1, l7Config.lesson, 1);
  assert.ok(l7s1Pass.accuracy >= 90);
  assert.equal(gameplayState.shouldUnlockStage(l7s1Pass), true);
  const l7s1Fail = gameplayState.computeStageMetrics(l7s1Plan.units, 33, 6, 0, 27, 20000, l7s1, l7Config.lesson, 1);
  assert.ok(l7s1Fail.accuracy < 90);
  assert.equal(gameplayState.shouldUnlockStage(l7s1Fail), false);

  let l7States = gameplayState.createInitialStageProgressStates(l7Config.stages);
  const l7Sess1 = { ...gameplayState.createTypingSessionState(1), completedCount: 33, incorrectCount: 1, bestStreak: 31, finished: true };
  l7States = gameplayState.recordStageAttemptResult(l7States, 0, l7s1Pass, l7Sess1, l7s1Plan.units, 20000, 'open');

  const l7s2Pass = gameplayState.computeStageMetrics(l7s2Plan.units, 25, 1, 0, 24, 21000, l7s2, l7Config.lesson, 1);
  const l7Sess2 = { ...gameplayState.createTypingSessionState(2), completedCount: 25, incorrectCount: 1, bestStreak: 24, finished: true };
  l7States = gameplayState.recordStageAttemptResult(l7States, 1, l7s2Pass, l7Sess2, l7s2Plan.units, 21000, 'open');

  const l7s3Pass = gameplayState.computeStageMetrics(l7s3Plan.units, 25, 1, 0, 24, 24000, l7s3, l7Config.lesson, 1);
  const l7Sess3 = { ...gameplayState.createTypingSessionState(3), completedCount: 25, incorrectCount: 1, bestStreak: 24, finished: true };
  l7States = gameplayState.recordStageAttemptResult(l7States, 2, l7s3Pass, l7Sess3, l7s3Plan.units, 24000, 'open');

  assert.equal(gameplayState.areAllStagesCompleted(l7States), true);
  const l7FinalMetrics = gameplayState.computeFinalLessonMetrics(l7States, l7Config.lesson, 1);
  assert.equal(l7FinalMetrics.passed, true);
  assert.equal(l7FinalMetrics.totalRequiredInputs, 33 + 25 + 25);
  assert.ok(l7FinalMetrics.accuracy >= 92);

  // =========================================================================
  // 24. Lesson 8: Right-Hand Lower Row (w1-l8) 3D Stages & Challenge Verification
  // =========================================================================
  const l8Config = gameplayState.resolveThreeLessonConfig(1, 8);
  assert.equal(l8Config.worldId, 1);
  assert.equal(l8Config.lesson.id, 8);
  assert.equal(l8Config.stages.length, 3);
  const [l8s1, l8s2, l8s3] = l8Config.stages;

  // Stage 1: w1-l8-s1
  assert.equal(l8s1.id, 'w1-l8-s1');
  assert.equal(gameplayState.getStageMinimumAccuracy(l8s1, l8Config.lesson, l8Config.worldId), 90);
  const l8s1Plan = gameplayState.createStageTypingPlan(l8s1);
  assert.equal(l8s1Plan.units.length, 31);
  const l8s1Val = typingPlanMod.validateStageTypingPlan(l8s1);
  assert.equal(l8s1Val.valid, true);

  // Stage 2: w1-l8-s2
  assert.equal(l8s2.id, 'w1-l8-s2');
  assert.equal(gameplayState.getStageMinimumAccuracy(l8s2, l8Config.lesson, l8Config.worldId), 92);
  const l8s2Plan = gameplayState.createStageTypingPlan(l8s2);
  assert.equal(l8s2Plan.units.length, 27);
  const l8s2Val = typingPlanMod.validateStageTypingPlan(l8s2);
  assert.equal(l8s2Val.valid, true);

  // Stage 3: w1-l8-s3
  assert.equal(l8s3.id, 'w1-l8-s3');
  assert.equal(gameplayState.getStageMinimumAccuracy(l8s3, l8Config.lesson, l8Config.worldId), 92);
  const l8s3Plan = gameplayState.createStageTypingPlan(l8s3);
  assert.equal(l8s3Plan.units.length, 85);
  const l8s3Val = typingPlanMod.validateStageTypingPlan(l8s3);
  assert.equal(l8s3Val.valid, true);

  // L8 Stage metrics & Progression
  const l8s1Pass = gameplayState.computeStageMetrics(l8s1Plan.units, 31, 2, 0, 29, 20000, l8s1, l8Config.lesson, 1);
  assert.ok(l8s1Pass.accuracy >= 90);
  assert.equal(gameplayState.shouldUnlockStage(l8s1Pass), true);

  let l8States = gameplayState.createInitialStageProgressStates(l8Config.stages);
  const l8Sess1 = { ...gameplayState.createTypingSessionState(1), completedCount: 31, incorrectCount: 1, bestStreak: 29, finished: true };
  l8States = gameplayState.recordStageAttemptResult(l8States, 0, l8s1Pass, l8Sess1, l8s1Plan.units, 20000, 'open');

  const l8s2Pass = gameplayState.computeStageMetrics(l8s2Plan.units, 27, 1, 0, 26, 21000, l8s2, l8Config.lesson, 1);
  const l8Sess2 = { ...gameplayState.createTypingSessionState(2), completedCount: 27, incorrectCount: 1, bestStreak: 26, finished: true };
  l8States = gameplayState.recordStageAttemptResult(l8States, 1, l8s2Pass, l8Sess2, l8s2Plan.units, 21000, 'open');

  const l8s3Pass = gameplayState.computeStageMetrics(l8s3Plan.units, 85, 2, 0, 80, 50000, l8s3, l8Config.lesson, 1);
  const l8Sess3 = { ...gameplayState.createTypingSessionState(3), completedCount: 85, incorrectCount: 2, bestStreak: 80, finished: true };
  l8States = gameplayState.recordStageAttemptResult(l8States, 2, l8s3Pass, l8Sess3, l8s3Plan.units, 50000, 'open');

  assert.equal(gameplayState.areAllStagesCompleted(l8States), true);
  const l8FinalMetrics = gameplayState.computeFinalLessonMetrics(l8States, l8Config.lesson, 1);
  assert.equal(l8FinalMetrics.passed, true);
  assert.equal(l8FinalMetrics.totalRequiredInputs, 31 + 27 + 85);
  assert.ok(l8FinalMetrics.accuracy >= 92);

  // =========================================================================
  // 25. World 1 Boss: Temple Guardian (w1-boss) 3D Waves & Battle Verification
  // =========================================================================
  const bossConfig = gameplayState.resolveThreeLessonConfig(1, 'boss');
  assert.equal(bossConfig.worldId, 1);
  assert.equal(bossConfig.lesson.id, 'boss');
  assert.equal(bossConfig.stages.length, 3);
  const [bossWave1, bossWave2, bossWave3] = bossConfig.stages;

  // Wave 1: w1-boss-s1 (kind: boss)
  assert.equal(bossWave1.id, 'w1-boss-s1');
  assert.equal(bossWave1.kind, 'boss');
  assert.equal(gameplayState.getStageMinimumAccuracy(bossWave1, bossConfig.lesson, bossConfig.worldId), 90);
  const bossW1Plan = gameplayState.createStageTypingPlan(bossWave1);
  assert.equal(bossW1Plan.units.length, 33);
  const bossW1Val = typingPlanMod.validateStageTypingPlan(bossWave1);
  assert.equal(bossW1Val.valid, true);

  // Wave 2: w1-boss-s2 (kind: boss)
  assert.equal(bossWave2.id, 'w1-boss-s2');
  assert.equal(bossWave2.kind, 'boss');
  assert.equal(gameplayState.getStageMinimumAccuracy(bossWave2, bossConfig.lesson, bossConfig.worldId), 92);
  const bossW2Plan = gameplayState.createStageTypingPlan(bossWave2);
  assert.equal(bossW2Plan.units.length, 36);
  const bossW2Val = typingPlanMod.validateStageTypingPlan(bossWave2);
  assert.equal(bossW2Val.valid, true);

  // Wave 3: w1-boss-s3 (kind: boss)
  assert.equal(bossWave3.id, 'w1-boss-s3');
  assert.equal(bossWave3.kind, 'boss');
  assert.equal(gameplayState.getStageMinimumAccuracy(bossWave3, bossConfig.lesson, bossConfig.worldId), 92);
  const bossW3Plan = gameplayState.createStageTypingPlan(bossWave3);
  assert.equal(bossW3Plan.units.length, 82);
  const bossW3Val = typingPlanMod.validateStageTypingPlan(bossWave3);
  assert.equal(bossW3Val.valid, true);

  // Boss 3-Wave Battle Progression & Shattering Shield Mechanics
  const bossW1Pass = gameplayState.computeStageMetrics(bossW1Plan.units, 33, 2, 0, 31, 22000, bossWave1, bossConfig.lesson, 1);
  assert.ok(bossW1Pass.accuracy >= 90);
  assert.equal(gameplayState.shouldUnlockStage(bossW1Pass), true);
  const bossW1Fail = gameplayState.computeStageMetrics(bossW1Plan.units, 33, 6, 0, 26, 22000, bossWave1, bossConfig.lesson, 1);
  assert.ok(bossW1Fail.accuracy < 90);
  assert.equal(gameplayState.shouldUnlockStage(bossW1Fail), false);

  let bossStates = gameplayState.createInitialStageProgressStates(bossConfig.stages);
  const bossSess1 = { ...gameplayState.createTypingSessionState(1), completedCount: 33, incorrectCount: 1, bestStreak: 31, finished: true };
  bossStates = gameplayState.recordStageAttemptResult(bossStates, 0, bossW1Pass, bossSess1, bossW1Plan.units, 22000, 'open');

  const bossW2Pass = gameplayState.computeStageMetrics(bossW2Plan.units, 36, 1, 0, 35, 25000, bossWave2, bossConfig.lesson, 1);
  const bossSess2 = { ...gameplayState.createTypingSessionState(2), completedCount: 36, incorrectCount: 1, bestStreak: 35, finished: true };
  bossStates = gameplayState.recordStageAttemptResult(bossStates, 1, bossW2Pass, bossSess2, bossW2Plan.units, 25000, 'open');

  const bossW3Pass = gameplayState.computeStageMetrics(bossW3Plan.units, 82, 2, 0, 80, 55000, bossWave3, bossConfig.lesson, 1);
  const bossSess3 = { ...gameplayState.createTypingSessionState(3), completedCount: 82, incorrectCount: 2, bestStreak: 80, finished: true };
  bossStates = gameplayState.recordStageAttemptResult(bossStates, 2, bossW3Pass, bossSess3, bossW3Plan.units, 55000, 'open');

  assert.equal(gameplayState.areAllStagesCompleted(bossStates), true);
  const bossFinalMetrics = gameplayState.computeFinalLessonMetrics(bossStates, bossConfig.lesson, 1);
  assert.equal(bossFinalMetrics.passed, true);
  assert.equal(bossFinalMetrics.totalRequiredInputs, 33 + 36 + 82);
  assert.ok(bossFinalMetrics.accuracy >= 92);

  // =========================================================================
  // TASK 7C.0: GAMEPLAY VARIETY & PILOT EXPERIENCES (LEVELS 1, 3, 5)
  // =========================================================================
  const expConfigMod = await server.ssrLoadModule('/src/features/three-game/config/lessonExperienceConfig.ts');
  const hudMod = await server.ssrLoadModule('/src/features/three-game/components/ExplorationHud.tsx');
  const ExplorationHud = hudMod.default;

  // 1. Experience support detection across all World 1 lessons
  for (let i = 1; i <= 8; i++) {
    assert.equal(expConfigMod.isCustomExperienceSupported(i), true, `Level ${i} must have custom experience support`);
  }
  assert.equal(expConfigMod.isCustomExperienceSupported('boss'), true, 'Boss must have custom experience support');
  assert.equal(expConfigMod.isCustomExperienceSupported(99), false, 'Non-existent level 99 must not have custom experience');

  // Pilot experiences subset check
  assert.equal(expConfigMod.isPilotExperience(1), true);
  assert.equal(expConfigMod.isPilotExperience(3), true);
  assert.equal(expConfigMod.isPilotExperience(5), true);

  // 2. Level 1: Ancient Finger Sanctuary configuration
  const expL1 = expConfigMod.getLessonExperienceConfig(1);
  assert.equal(expL1.experienceType, 'finger-sanctuary');
  assert.equal(expL1.stations.length, 3);
  assert.deepEqual(expL1.initialPlayerPosition, [0, 0, -4.5]);
  assert.deepEqual(expL1.stations[0].position, [3.2, 0, -1.0]);
  assert.deepEqual(expL1.stations[1].position, [-3.2, 0, -1.0]);
  assert.deepEqual(expL1.stations[2].position, [0, 0, 4.5]);
  assert.equal(expL1.stations[0].transformationType, 'awaken-stela');
  assert.equal(expL1.stations[2].transformationType, 'open-mechanism');

  // 3. Level 3: Angkor Twin Bridges configuration
  const expL3 = expConfigMod.getLessonExperienceConfig(3);
  assert.equal(expL3.experienceType, 'twin-bridges');
  assert.equal(expL3.stations.length, 3);
  assert.deepEqual(expL3.initialPlayerPosition, [0, 0, -5.5]);
  assert.deepEqual(expL3.stations[0].position, [0, 0, 0.0]);
  assert.deepEqual(expL3.stations[1].position, [0, 0, 10.5]);
  assert.deepEqual(expL3.stations[2].position, [0, 0, 20.0]);
  assert.equal(expL3.stations[0].transformationType, 'extend-bridge');
  assert.equal(expL3.stations[2].transformationType, 'reveal-sanctuary');

  // 4. Level 5: Climbing Temple Tower configuration (Vertical elevation)
  const expL5 = expConfigMod.getLessonExperienceConfig(5);
  assert.equal(expL5.experienceType, 'tower-climb');
  assert.equal(expL5.stations.length, 3);
  assert.deepEqual(expL5.initialPlayerPosition, [0, 0, -5.0]);
  assert.deepEqual(expL5.stations[0].position, [0, 0, -1.0]); // Ground (Y=0)
  assert.deepEqual(expL5.stations[1].position, [0, 2.2, 9.5]); // Terrace 1 (Y=2.2)
  assert.deepEqual(expL5.stations[2].position, [0, 4.4, 20.0]); // High Overlook (Y=4.4)
  assert.equal(expL5.stations[0].transformationType, 'raise-stairs');
  assert.equal(expL5.stations[2].transformationType, 'reveal-sanctuary');

  // 5. Verify remaining experience identities (Level 2, 4, 6, 7, 8, Boss)
  assert.equal(expConfigMod.getLessonExperienceConfig(2).experienceType, 'lotus-garden');
  assert.equal(expConfigMod.getLessonExperienceConfig(4).experienceType, 'crossroads');
  assert.equal(expConfigMod.getLessonExperienceConfig(6).experienceType, 'sky-platforms');
  assert.equal(expConfigMod.getLessonExperienceConfig(7).experienceType, 'crystal-cave');
  assert.equal(expConfigMod.getLessonExperienceConfig(8).experienceType, 'river-crossing');
  assert.equal(expConfigMod.getLessonExperienceConfig('boss').experienceType, 'boss-encounter');

  // 6. Exploration HUD SSR Integration for Lessons
  const l1Curriculum = gameplayState.resolveThreeLessonConfig(1, 1);
  const hudL1ExploringHtml = ReactDOMServer.renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ExplorationHud, {
        isNearGate: false,
        gateStatus: 'closed',
        lessonTitleKh: l1Curriculum.lesson.labelKh,
        lessonTitleEn: l1Curriculum.lesson.labelEn,
        stages: l1Curriculum.stages,
        stageStates: gameplayState.createInitialStageProgressStates(l1Curriculum.stages),
        activeStageIndex: 0,
        lessonId: 1,
        onStartTyping: () => {},
      }),
    ),
  );
  assert.ok(hudL1ExploringHtml.includes('ដើរទៅអាសនៈខាងកើត'), 'HUD must show East Altar mission prompt in Khmer');
  assert.ok(hudL1ExploringHtml.includes('Walk to the East Altar'), 'HUD must show East Altar mission prompt in English');

  const hudL1NearHtml = ReactDOMServer.renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ExplorationHud, {
        isNearGate: true,
        gateStatus: 'closed',
        lessonTitleKh: l1Curriculum.lesson.labelKh,
        lessonTitleEn: l1Curriculum.lesson.labelEn,
        stages: l1Curriculum.stages,
        stageStates: gameplayState.createInitialStageProgressStates(l1Curriculum.stages),
        activeStageIndex: 0,
        lessonId: 1,
        onStartTyping: () => {},
      }),
    ),
  );
  assert.ok(hudL1NearHtml.includes('អាសនៈខាងកើត'), 'HUD near station must display station title');

  const l2Curriculum = gameplayState.resolveThreeLessonConfig(1, 2);
  const hudL2ExploringHtml = ReactDOMServer.renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ExplorationHud, {
        isNearGate: false,
        gateStatus: 'closed',
        lessonTitleKh: l2Curriculum.lesson.labelKh,
        lessonTitleEn: l2Curriculum.lesson.labelEn,
        stages: l2Curriculum.stages,
        stageStates: gameplayState.createInitialStageProgressStates(l2Curriculum.stages),
        activeStageIndex: 0,
        lessonId: 2,
        onStartTyping: () => {},
      }),
    ),
  );
  assert.ok(hudL2ExploringHtml.includes('ដើរទៅមាត់ស្រះ'), 'HUD L2 must show Lotus Pond mission prompt');

  const l4Curriculum = gameplayState.resolveThreeLessonConfig(1, 4);
  const hudL4ExploringHtml = ReactDOMServer.renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ExplorationHud, {
        isNearGate: false,
        gateStatus: 'closed',
        lessonTitleKh: l4Curriculum.lesson.labelKh,
        lessonTitleEn: l4Curriculum.lesson.labelEn,
        stages: l4Curriculum.stages,
        stageStates: gameplayState.createInitialStageProgressStates(l4Curriculum.stages),
        activeStageIndex: 0,
        lessonId: 4,
        onStartTyping: () => {},
      }),
    ),
  );
  assert.ok(hudL4ExploringHtml.includes('ប្រសព្វផ្លូវព្រៃ'), 'HUD L4 must show Crossroads junction mission prompt');

  const l5Curriculum = gameplayState.resolveThreeLessonConfig(1, 5);
  const hudL5ExploringHtml = ReactDOMServer.renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ExplorationHud, {
        isNearGate: false,
        gateStatus: 'closed',
        lessonTitleKh: l5Curriculum.lesson.labelKh,
        lessonTitleEn: l5Curriculum.lesson.labelEn,
        stages: l5Curriculum.stages,
        stageStates: gameplayState.createInitialStageProgressStates(l5Curriculum.stages),
        activeStageIndex: 0,
        lessonId: 5,
        onStartTyping: () => {},
      }),
    ),
  );
  assert.ok(hudL5ExploringHtml.includes('ដើរទៅជើងជណ្តើរប្រាសាទ'), 'HUD L5 must show staircase mission prompt');
  assert.ok(hudL5ExploringHtml.includes('raise the first flight of stone steps'), 'HUD L5 must show staircase mission in English');

  // =========================================================================
  // TASK 8B: WORLD 1 QUALITY POLISH, THEMING, COLLISION, AND FEEDBACK TESTS
  // =========================================================================
  const lessonExpMod = await server.ssrLoadModule('/src/features/three-game/config/lessonExperienceConfig.ts');
  const gameAudioMod = await server.ssrLoadModule('/src/lib/audio/gameAudio.ts');
  const VictoryModal = (await server.ssrLoadModule('/src/features/three-game/components/VictoryModal.tsx')).default;

  // 1. Procedural Audio Methods Verification
  assert.equal(typeof gameAudioMod.gameAudio.playMechanismActivation, 'function', 'playMechanismActivation must be a function');
  assert.equal(typeof gameAudioMod.gameAudio.playShieldShatter, 'function', 'playShieldShatter must be a function');
  assert.equal(typeof gameAudioMod.gameAudio.playBossAwaken, 'function', 'playBossAwaken must be a function');
  assert.doesNotThrow(() => gameAudioMod.gameAudio.playMechanismActivation(), 'playMechanismActivation must execute safely without throwing');
  assert.doesNotThrow(() => gameAudioMod.gameAudio.playShieldShatter(), 'playShieldShatter must execute safely without throwing');
  assert.doesNotThrow(() => gameAudioMod.gameAudio.playBossAwaken(), 'playBossAwaken must execute safely without throwing');

  // 2. All 8 Lessons + Boss Experience Configurations & Pedagogical Content
  const experienceKeys = [1, 2, 3, 4, 5, 6, 7, 8, 'boss'];
  for (const expKey of experienceKeys) {
    const config = lessonExpMod.getLessonExperienceConfig(expKey);
    assert.ok(config, `Experience config for ${expKey} must exist`);
    assert.ok(config.introMissionKh?.length > 0, `Config ${expKey} must have introMissionKh`);
    assert.ok(config.introMissionEn?.length > 0, `Config ${expKey} must have introMissionEn`);
    assert.ok(config.educationalSkillKh?.length > 0, `Config ${expKey} must have educationalSkillKh`);
    assert.ok(config.educationalSkillEn?.length > 0, `Config ${expKey} must have educationalSkillEn`);
    assert.ok(config.cameraPreset, `Config ${expKey} must have a tailored cameraPreset`);
    assert.ok(config.environmentTheme, `Config ${expKey} must have an environmentTheme`);
  }

  // 3. Environmental Theme Specifics (Causeway suppression & Cavern dome)
  assert.equal(lessonExpMod.getLessonExperienceConfig(2).environmentTheme?.hideCauseway, true, 'Lotus Garden must hide causeway to prevent water clipping');
  assert.equal(lessonExpMod.getLessonExperienceConfig(3).environmentTheme?.hideCauseway, true, 'Twin Bridges must hide causeway to prevent chasm clipping');
  assert.equal(lessonExpMod.getLessonExperienceConfig(5).environmentTheme?.hideCauseway, true, 'Tower Climb must hide causeway for stepped terraces');
  assert.equal(lessonExpMod.getLessonExperienceConfig(6).environmentTheme?.hideCauseway, true, 'Sky Platforms must hide causeway for floating stones');
  assert.equal(lessonExpMod.getLessonExperienceConfig(7).environmentTheme?.hideCauseway, true, 'Crystal Cave must hide causeway');
  assert.equal(lessonExpMod.getLessonExperienceConfig(7).environmentTheme?.isCavern, true, 'Crystal Cave must enable subterranean cavern mode');
  assert.equal(lessonExpMod.getLessonExperienceConfig(8).environmentTheme?.hideCauseway, true, 'Sacred River must hide causeway for river channel');

  // 4. Geometry-Accurate Collision & Walkable Area Clamping Tests
  // Level 1: Finger Sanctuary
  const [l1X, l1ZLocked] = gameplayState.clampLessonCharacterPosition(12, 8, 1, ['closed', 'closed', 'closed']);
  assert.equal(l1X, 7.0, 'Level 1 X must clamp to courtyard perimeter [-7, 7]');
  assert.equal(l1ZLocked, 2.5, 'Level 1 Z must clamp before stage 1 altar when closed');
  const [, l1ZOpening] = gameplayState.clampLessonCharacterPosition(0, 6.0, 1, ['opening', 'closed', 'closed']);
  assert.equal(l1ZOpening, 2.5, 'Level 1 route stays locked while the opening animation runs');
  for (const [level, lockedZ] of [[2, 2.5], [3, 0.5], [4, 3.0], [5, 4.2], [6, 2.5], [7, 3.5], [8, 1.5]]) {
    const [, openingZ] = gameplayState.clampLessonCharacterPosition(0, 30, level, ['opening', 'closed', 'closed']);
    assert.equal(openingZ, lockedZ, `Level ${level} must not allow traversal before stage 1 is open`);
  }
  for (let level = 1; level <= 8; level++) {
    const config = expConfigMod.getLessonExperienceConfig(level);
    for (const station of config.stations) {
      const statuses = config.stations.map((_, index) => index < station.stageIndex ? 'open' : 'closed');
      const [reachableX, reachableZ] = gameplayState.clampLessonCharacterPosition(
        station.position[0], station.position[2], level, statuses,
      );
      const distance = Math.hypot(reachableX - station.position[0], reachableZ - station.position[2]);
      assert.ok(distance <= (station.interactionRadius ?? 3.5),
        `Level ${level} stage ${station.stageIndex + 1} station must be interactable after earlier stages open (distance ${distance})`);
    }
  }
  const [, l1ZOpen] = gameplayState.clampLessonCharacterPosition(0, 9.5, 1, ['open', 'open', 'open']);
  assert.equal(l1ZOpen, 9.5, 'Level 1 Z can pass through exit when stage 3 passed');

  // Level 2: Lotus Garden (No walking on open water!)
  const [l2XWater, l2ZWater] = gameplayState.clampLessonCharacterPosition(4.5, 5.0, 2, ['open', 'closed', 'closed']);
  assert.equal(l2XWater, 2.5, 'Level 2 must clamp X to stepping corridor [-2.5, 2.5]');
  assert.equal(l2ZWater, 5.0, 'Level 2 Z stays within allowed bounds');
  const [, l2ZLocked] = gameplayState.clampLessonCharacterPosition(0, 6.0, 2, ['closed', 'closed', 'closed']);
  assert.equal(l2ZLocked, 2.5, 'Level 2 cannot advance past stage 0 altar when closed');

  // Level 3: Twin Bridges (Mid-Chasm Pier Platform at [0, 0, 10.5])
  const [l3XChasm, l3ZChasm] = gameplayState.clampLessonCharacterPosition(0, 5.0, 3, ['open', 'closed', 'closed']);
  assert.equal(l3XChasm, 0, 'Level 3 must not teleport sideways onto a causeway');
  assert.equal(l3ZChasm, 0.5, 'Level 3 must stop at the chasm edge until a causeway is chosen');
  const [, l3ZLane] = gameplayState.clampLessonCharacterPosition(-2.8, 5.0, 3, ['open', 'closed', 'closed']);
  assert.equal(l3ZLane, 5.0, 'Level 3 side causeway must be traversable after stage 1');
  // When Stage 0 is open, Mid-Chasm Pier platform (Z = 10.5) is accessible at X = 0
  const [l3XPier] = gameplayState.clampLessonCharacterPosition(0, 10.5, 3, ['open', 'closed', 'closed']);
  assert.equal(l3XPier, 0, 'Level 3 allows standing at Station 1 on the Mid-Chasm Pier platform');
  // When Stage 1 is open, cantilever arch crossing is connected
  const [l3XArch] = gameplayState.clampLessonCharacterPosition(0, 10.5, 3, ['open', 'open', 'closed']);
  assert.equal(l3XArch, 0, 'Level 3 allows crossing between bridges when cantilever arches are connected');

  // Level 5: Temple Tower Climb (Narrow stairs, Station 2 at Z = 20.0)
  const [l5XStairs] = gameplayState.clampLessonCharacterPosition(4.0, 5.5, 5, ['open', 'closed', 'closed']);
  assert.equal(l5XStairs, 2.5, 'Level 5 staircase risers must constrain X to flight width [-2.5, 2.5]');
  const [, l5ZStation2] = gameplayState.clampLessonCharacterPosition(0, 20.0, 5, ['open', 'open', 'closed']);
  assert.equal(l5ZStation2, 20.0, 'Level 5 Station 2 at Z = 20.0 must be reachable when Stage 1 is open');

  // Level 6: Sky Platforms (Station 2 at Z = 20.0)
  const [, l6ZStation2] = gameplayState.clampLessonCharacterPosition(0, 20.0, 6, ['open', 'open', 'closed']);
  assert.equal(l6ZStation2, 20.0, 'Level 6 Station 2 at Z = 20.0 must be reachable when Stage 1 is open');

  // Level 8: Sacred River (Continuous Dragon Barge crossing across channel)
  const [l8XClosed, l8ZClosed] = gameplayState.clampLessonCharacterPosition(0, 4.0, 8, ['closed', 'closed', 'closed']);
  assert.equal(l8XClosed, 0, 'Level 8 X stays centered without sudden sideways teleportation');
  assert.equal(l8ZClosed, 1.5, 'Level 8 Z clamps before water until Stage 0 opens');
  const [l8XStation1, l8ZStation1] = gameplayState.clampLessonCharacterPosition(0, 9.5, 8, ['open', 'closed', 'closed']);
  assert.equal(l8XStation1, 0, 'Level 8 Station 1 is accessible along the central barge bridge corridor');
  assert.equal(l8ZStation1, 9.5, 'Level 8 Station 1 at Z = 9.5 is reachable when Stage 0 is open');
  const [l8XStation2, l8ZStation2] = gameplayState.clampLessonCharacterPosition(0, 19.5, 8, ['open', 'open', 'closed']);
  assert.equal(l8XStation2, 0, 'Level 8 Station 2 is accessible along the second barge crossing');
  assert.equal(l8ZStation2, 19.5, 'Level 8 Station 2 at Z = 19.5 is reachable when Stage 1 is open');

  // Boss: Arena bounding box
  const [bossX, bossZ] = gameplayState.clampLessonCharacterPosition(15, 35, 'boss', []);
  assert.equal(bossX, 8.0, 'Boss arena X must clamp to 8.0');
  assert.equal(bossZ, 31.0, 'Boss arena Z must clamp to 31.0');

  // 5. Victory Modal Pedagogical Skill Integration
  const victoryModalHtml = ReactDOMServer.renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(VictoryModal, {
        passed: true,
        minimumAccuracy: 90,
        reward: {
          expGained: 150,
          gemsGained: 25,
          accuracy: 94,
          cpm: 45,
          stars: 3,
          score: 850,
        },
        stages: l1Curriculum.stages,
        stageStates: gameplayState.createInitialStageProgressStates(l1Curriculum.stages),
        lessonId: 1,
        onWalkThrough: () => {},
        onRetry: () => {},
      }),
    ),
  );
  assert.ok(victoryModalHtml.includes('ជំនាញដែលបានរៀន'), 'VictoryModal must show pedagogical skill banner header');
  assert.ok(victoryModalHtml.includes('ពង្រឹងម្រាមដៃគោលខាងឆ្វេង'), 'VictoryModal must render authentic educationalSkillKh');
  assert.ok(victoryModalHtml.includes('Left home-row key fluency'), 'VictoryModal must render educationalSkillEn');
  const cleanVictoryHtml = victoryModalHtml.replace(/<!--.*?-->/g, '');
  assert.ok(cleanVictoryHtml.includes('94%'), 'VictoryModal must display accuracy');
  assert.ok(cleanVictoryHtml.includes('45'), 'VictoryModal must display CPM');

  // 6. Lesson Intro Briefing Modal SSR Integration
  const LessonIntroModal = (await server.ssrLoadModule('/src/features/three-game/components/LessonIntroModal.tsx')).default;
  const introModalHtml = ReactDOMServer.renderToString(
    React.createElement(LessonIntroModal, {
      isOpen: true,
      onStart: () => {},
      lessonId: 1,
      lessonTitleKh: l1Curriculum.titleKh,
      lessonTitleEn: l1Curriculum.title,
      stages: l1Curriculum.stages,
    }),
  );
  assert.ok(introModalHtml.includes('គោលបំណងបេសកកម្ម'), 'LessonIntroModal must display Mission Objective header');
  assert.ok(introModalHtml.includes('បេសកកម្ម៖ ដាស់សិលាម្រាមដៃឆ្វេងទាំង ៤'), 'LessonIntroModal must render introMissionKh');
  assert.ok(introModalHtml.includes('ចាប់ផ្តើមបេសកកម្ម'), 'LessonIntroModal must render Start Mission action button');

} finally {
  await server.close();
}

console.log('3D prototype core tests passed');
