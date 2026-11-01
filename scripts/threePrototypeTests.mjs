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
  assert.equal(lessonConfig.lesson.labelKh, 'ព្យញ្ជនៈដំបូង');
  assert.equal(lessonConfig.lesson.labelEn, 'First Consonants');
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
  assert.equal(access('world=1&level=2', completedFirstLesson).status, 'unsupported');
  assert.equal(access('world=1&level=1', completedFirstLesson).status, 'ready');
  assert.equal(access('world=1&level=3', completedFirstLesson).status, 'locked');
  for (const world of curriculum.lessonCurriculum) {
    for (const lesson of world.levels) {
      assert.equal(availability.isThreeLessonSupported(world.id, lesson.id), world.id === 1 && lesson.id === 1);
    }
  }
  assert.equal(availability.isThreeLessonSupported(99, 1), false);
  assert.equal(availability.isThreeLessonSupported(1, 99), false);
  for (const [worldId, lessonId] of [[99, 1], [1, 99], [0, 1], [1, '1'], [NaN, 1]]) {
    assert.throws(() => gameplayState.resolveThreeLessonConfig(worldId, lessonId), RangeError);
  }

  // 7.2 Stage 1 typing items and 90% accuracy requirement
  assert.equal(
    gameplayState.getStageMinimumAccuracy(stage1, lessonConfig.lesson, lessonConfig.worldId),
    90,
    'Stage 1 accuracy requirement must be 90%',
  );
  assert.deepEqual(stage1.items, ['ក', 'ខ', 'គ', 'ឃ', 'ង', 'ច', 'ឆ', 'ជ', 'ឈ', 'ញ']);
  const stage1Plan = gameplayState.createStageTypingPlan(stage1, lessonConfig.lesson.focusKeys);
  assert.equal(stage1Plan.targetText, 'កខគឃងចឆជឈញ');
  assert.equal(stage1Plan.units.length, 10, 'Stage 1 plan must have 10 typing units');

  const stage1PassMetrics = gameplayState.computeStageMetrics(
    stage1Plan.units,
    10,
    1, // 9/10 = 90%
    0,
    9,
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
    10,
    2, // 8/10 = 80%
    0,
    8,
    15000,
    stage1,
    lessonConfig.lesson,
    lessonConfig.worldId,
  );
  assert.equal(stage1FailMetrics.accuracy, 80);
  assert.equal(stage1FailMetrics.passed, false, '80% accuracy must fail Stage 1');
  assert.equal(gameplayState.shouldUnlockStage(stage1FailMetrics), false);

  // 7.3 Stage 2 typing items and 90% accuracy requirement
  assert.equal(
    gameplayState.getStageMinimumAccuracy(stage2, lessonConfig.lesson, lessonConfig.worldId),
    90,
    'Stage 2 accuracy requirement must be 90%',
  );
  assert.deepEqual(stage2.items, ['កខ', 'គឃ', 'ចឆ', 'ជឈ', 'ងញ', 'ខក', 'ឆច', 'ឃគ']);
  const stage2Plan = gameplayState.createStageTypingPlan(stage2, lessonConfig.lesson.focusKeys);
  assert.equal(stage2Plan.targetText, 'កខគឃចឆជឈងញខកឆចឃគ');
  assert.equal(stage2Plan.units.length, 16, 'Stage 2 plan must have 16 typing units (8 pairs)');

  const stage2PassMetrics = gameplayState.computeStageMetrics(
    stage2Plan.units,
    16,
    1, // 15/16 = 94%
    0,
    15,
    22000,
    stage2,
    lessonConfig.lesson,
    lessonConfig.worldId,
  );
  assert.equal(stage2PassMetrics.accuracy, 94);
  assert.equal(stage2PassMetrics.passed, true, '94% accuracy must pass Stage 2 (90% threshold)');
  assert.equal(gameplayState.shouldUnlockStage(stage2PassMetrics), true);

  // 7.4 Stage 3 typing items and 92% accuracy requirement
  assert.equal(
    gameplayState.getStageMinimumAccuracy(stage3, lessonConfig.lesson, lessonConfig.worldId),
    92,
    'Stage 3 accuracy requirement must be 92%',
  );
  assert.deepEqual(stage3.items, ['កង', 'ចង', 'ជង', 'ខង', 'គង', 'ចក', 'កច', 'ជក']);
  const stage3Plan = gameplayState.createStageTypingPlan(stage3, lessonConfig.lesson.focusKeys);
  assert.equal(stage3Plan.targetText, 'កងចងជងខងគងចកកចជក');
  assert.equal(stage3Plan.units.length, 16, 'Stage 3 plan must have 16 typing units (8 words)');

  // 90% accuracy (e.g. 2 mistakes on 16 units -> 14/16 = 88%) or 91% must FAIL Stage 3 (92% required)
  const stage3FailAt88 = gameplayState.computeStageMetrics(
    stage3Plan.units,
    16,
    2, // 14/16 = 88%
    0,
    12,
    20000,
    stage3,
    lessonConfig.lesson,
    lessonConfig.worldId,
  );
  assert.equal(stage3FailAt88.accuracy, 88);
  assert.equal(stage3FailAt88.passed, false, '88% accuracy must fail Stage 3 (requires 92%)');
  assert.equal(gameplayState.shouldUnlockStage(stage3FailAt88), false);

  const stage3PassAt94 = gameplayState.computeStageMetrics(
    stage3Plan.units,
    16,
    1, // 15/16 = 94% >= 92%
    0,
    15,
    20000,
    stage3,
    lessonConfig.lesson,
    lessonConfig.worldId,
  );
  assert.equal(stage3PassAt94.accuracy, 94);
  assert.equal(stage3PassAt94.passed, true, '94% accuracy must pass Stage 3 (requires 92%)');
  assert.equal(gameplayState.shouldUnlockStage(stage3PassAt94), true);

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
    completedCount: 10,
    incorrectCount: 1,
    bestStreak: 9,
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
    completedCount: 16,
    incorrectCount: 1,
    bestStreak: 15,
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
    completedCount: 16,
    incorrectCount: 2,
    bestStreak: 12,
    finished: true,
  };
  stageStates = gameplayState.recordStageAttemptResult(
    stageStates,
    2,
    stage3FailAt88,
    s3FailSession,
    stage3Plan.units,
    20000,
    'closed',
  );
  assert.equal(stageStates[2].passed, false, 'Stage 3 must remain unpassed after 88% attempt');
  assert.equal(stageStates[2].status, 'closed', 'Stage 3 barrier must remain closed after failed attempt');
  assert.equal(stageStates[2].attempts, 1);
  assert.equal(gameplayState.areAllStagesCompleted(stageStates), false);
  assert.equal(gameplayState.canAccessStage(2, 2, stageStates), true, 'Failed Stage 3 can be retried immediately');

  // Retry Stage 3 and pass (94% >= 92%)
  const s3PassSession = {
    ...gameplayState.createTypingSessionState(4),
    completedCount: 16,
    incorrectCount: 1,
    bestStreak: 15,
    finished: true,
  };
  stageStates = gameplayState.recordStageAttemptResult(
    stageStates,
    2,
    stage3PassAt94,
    s3PassSession,
    stage3Plan.units,
    20000,
    'open',
  );
  assert.equal(stageStates[2].passed, true);
  assert.equal(stageStates[2].status, 'open');
  assert.equal(stageStates[2].attempts, 2);
  assert.equal(gameplayState.areAllStagesCompleted(stageStates), true, 'All 3 stages are now completed');

  // 7.7 Shifted characters across World 1 Lesson 1 stages have opposite-hand Shift guidance
  const shiftedUnitsInLesson = [
    ...stage1Plan.units,
    ...stage2Plan.units,
    ...stage3Plan.units,
  ].filter((u) => u.modifier === 'shift');
  assert.ok(shiftedUnitsInLesson.length > 0, 'World 1 Lesson 1 contains shifted consonants (គ, ឃ, ឈ, ញ)');
  for (const unit of shiftedUnitsInLesson) {
    const shiftCode = fingerGuidanceMod.getRequiredShiftKeyCode(unit.key, true);
    const expectedShift = unit.key.hand === 'right' ? 'ShiftLeft' : 'ShiftRight';
    assert.equal(
      shiftCode,
      expectedShift,
      `Shifted consonant ${unit.value} on ${unit.key.code} (${unit.key.hand} hand) must require ${expectedShift}`,
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
    10 + 16 + 16,
    'Total required inputs across Stages 1, 2, and 3 must equal 42',
  );
  assert.equal(
    finalLessonMetrics.acceptedCorrectInputs,
    10 + 16 + 16,
    'Accepted correct inputs across Stages 1, 2, and 3 must equal 42',
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

} finally {
  await server.close();
}

console.log('3D prototype core tests passed');
