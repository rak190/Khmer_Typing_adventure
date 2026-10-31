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
  assert.equal(shiftGuidance.requiredShiftCode, 'ShiftRight');
  assert.deepEqual(shiftGuidance.highlights, [
    { hand: 'right', finger: 'pinky', role: 'shift' },
    { hand: 'left', finger: 'pinky', role: 'target' },
  ]);

  // =========================================================================
  // Master Task 5.5: Home-Row Touch-Typing, Reach-and-Return, and Curriculum Validation
  // =========================================================================
  const presentation = await server.ssrLoadModule('/src/lib/typingTargetPresentation.ts');
  const physicalPresentation = typingPlan.splitPhysicalKeyItemIntoUnits('KeyF KeyJ KeyK');
  assert.equal(physicalPresentation.units.length, 3);
  assert.deepEqual(
    physicalPresentation.units.map((unit) => presentation.getKhmerTypingUnitPresentation(unit).khmer),
    ['ថ', '◌្', 'ក'],
    'Beginner physical drills must lead with Khmer glyphs, using a dotted circle for coeng',
  );
  assert.deepEqual(
    physicalPresentation.units.map((unit) => presentation.getKhmerTypingUnitPresentation(unit).keyLabel),
    ['F', 'J', 'K'],
    'Physical keys remain visible as secondary cues',
  );
  assert.equal(physicalPresentation.units[1].key.code, 'KeyJ', 'Presentation must never alter input key codes');
  const foundations = await server.ssrLoadModule('/src/data/touchTypingFoundations.ts');
  const curriculum = await server.ssrLoadModule('/src/data/lessonCurriculum.ts');

  // 1. Verify all 8 physical home-row rest keys, fingers, hands, tactile bumps, and combining mark flags
  assert.deepEqual(keyboardMap.LEFT_HOME_ROW_KEY_CODES, ['KeyA', 'KeyS', 'KeyD', 'KeyF']);
  assert.deepEqual(keyboardMap.RIGHT_HOME_ROW_KEY_CODES, ['KeyJ', 'KeyK', 'KeyL', 'Semicolon']);
  assert.deepEqual(keyboardMap.TACTILE_BUMP_KEY_CODES, ['KeyF', 'KeyJ']);

  const expectedHomeRowSpecs = [
    { code: 'KeyA', latin: 'A', khmer: 'ា', hand: 'left', finger: 'pinky', bump: false, combining: true },
    { code: 'KeyS', latin: 'S', khmer: 'ស', hand: 'left', finger: 'ring', bump: false, combining: false },
    { code: 'KeyD', latin: 'D', khmer: 'ដ', hand: 'left', finger: 'middle', bump: false, combining: false },
    { code: 'KeyF', latin: 'F', khmer: 'ថ', hand: 'left', finger: 'index', bump: true, combining: false },
    { code: 'KeyJ', latin: 'J', khmer: '្', hand: 'right', finger: 'index', bump: true, combining: true },
    { code: 'KeyK', latin: 'K', khmer: 'ក', hand: 'right', finger: 'middle', bump: false, combining: false },
    { code: 'KeyL', latin: 'L', khmer: 'ល', hand: 'right', finger: 'ring', bump: false, combining: false },
    { code: 'Semicolon', latin: ';', khmer: 'ើ', hand: 'right', finger: 'pinky', bump: false, combining: true },
  ];

  for (const spec of expectedHomeRowSpecs) {
    const keyDef = keyboardMap.findKhmerKeyByCode(spec.code);
    assert.ok(keyDef, `Home-row key ${spec.code} must exist in keyboardMap`);
    assert.equal(keyDef.latin, spec.latin);
    assert.equal(keyDef.khmer, spec.khmer);
    assert.equal(keyDef.hand, spec.hand);
    assert.equal(keyDef.finger, spec.finger);
    assert.equal(keyboardMap.isHomeRowRestKeyCode(spec.code), true);
    assert.equal(keyboardMap.hasTactileBump(spec.code), spec.bump);
    assert.equal(keyboardMap.getFingerHomeKeyCode(spec.hand, spec.finger), spec.code);
    assert.equal(keyboardMap.isStandaloneCombiningMarkOutput(spec.khmer), spec.combining);

    const g = fingerGuidance.getFingerGuidance(keyDef, false);
    assert.equal(g.isOnHomePosition, true, `${spec.code} must be recognized as home-row rest position`);
    assert.equal(g.reachDirection, 'home');
    assert.equal(g.homeKeyCode, spec.code);
    assert.ok(g.labelKh.length > 0, 'Khmer finger label must be present');
    assert.ok(g.reachInstructionKh.length > 0, 'Khmer reach instruction must be present');
  }

  // 2. Verify reach-and-return guidance for non-home keys (inner reach, upper row, lower row)
  const keyG = keyboardMap.findKhmerKeyByCode('KeyG');
  const gGuidance = fingerGuidance.getFingerGuidance(keyG, false);
  assert.equal(gGuidance.isOnHomePosition, false);
  assert.equal(gGuidance.homeKeyCode, 'KeyF');
  assert.equal(gGuidance.homeKeyLatin, 'F');
  assert.equal(gGuidance.reachDirection, 'inner-home');
  assert.ok(gGuidance.reachInstructionKh.includes('ពី F ទៅ G រួចត្រឡប់មកទីតាំងដើម F វិញ'), 'KeyG reach instruction must direct return to F');

  const keyH = keyboardMap.findKhmerKeyByCode('KeyH');
  const hGuidance = fingerGuidance.getFingerGuidance(keyH, false);
  assert.equal(hGuidance.isOnHomePosition, false);
  assert.equal(hGuidance.homeKeyCode, 'KeyJ');
  assert.equal(hGuidance.reachDirection, 'inner-home');
  assert.ok(hGuidance.reachInstructionKh.includes('ពី J ទៅ H រួចត្រឡប់មកទីតាំងដើម J វិញ'), 'KeyH reach instruction must direct return to J');

  const keyR = keyboardMap.findKhmerKeyByCode('KeyR');
  const rGuidance = fingerGuidance.getFingerGuidance(keyR, false);
  assert.equal(rGuidance.homeKeyCode, 'KeyF');
  assert.equal(rGuidance.reachDirection, 'up');

  const keyN = keyboardMap.findKhmerKeyByCode('KeyN');
  const nGuidance = fingerGuidance.getFingerGuidance(keyN, false);
  assert.equal(nGuidance.homeKeyCode, 'KeyJ');
  assert.equal(nGuidance.reachDirection, 'down');

  // AltGr modifier guidance
  const keyE = keyboardMap.findKhmerKeyByCode('KeyE');
  const altGrGuidance = fingerGuidance.getFingerGuidance(keyE, false, true);
  assert.equal(altGrGuidance.requiredModifierCode, 'AltRight');
  assert.equal(fingerGuidance.getRequiredAltGrKeyCode(keyE, true), 'AltRight');

  // 3. Mode A (physical-key) & Mode B (unicode-output) curriculum validation
  const validPhysicalItem = typingPlan.validateCurriculumItem('KeyF', 'physical-key');
  assert.equal(validPhysicalItem.valid, true);
  assert.equal(validPhysicalItem.unitCount, 1);
  assert.equal(validPhysicalItem.practiceMode, 'physical-key');

  const splitPhysical = typingPlan.splitPhysicalKeyItemIntoUnits('KeyF', 0);
  assert.equal(splitPhysical.units.length, 1);
  assert.equal(splitPhysical.units[0].practiceMode, 'physical-key');
  assert.equal(splitPhysical.units[0].key.code, 'KeyF');

  const invalidPhysicalItem = typingPlan.validateCurriculumItem('InvalidKey99', 'physical-key');
  assert.equal(invalidPhysicalItem.valid, false);
  assert.equal(invalidPhysicalItem.unsupportedInputs[0].reason, 'unknown-physical-key-code');

  const disabledPhysicalItem = typingPlan.validateCurriculumItem('Tab', 'physical-key');
  assert.equal(disabledPhysicalItem.valid, false);
  assert.equal(disabledPhysicalItem.unsupportedInputs[0].reason, 'disabled-physical-key');

  const validUnicodeItem = typingPlan.validateCurriculumItem('ស្ត្រីខ្មែរ', 'unicode-output');
  assert.equal(validUnicodeItem.valid, true);
  assert.equal(validUnicodeItem.unsupportedInputs.length, 0);

  const unmappedUnicodeItem = typingPlan.validateCurriculumItem('កៈ+A', 'unicode-output');
  assert.equal(unmappedUnicodeItem.valid, false);
  assert.equal(unmappedUnicodeItem.unsupportedInputs.length, 3, 'Unmapped characters ៈ, +, and A must be flagged');
  assert.throws(
    () => typingPlan.splitItemIntoUnitsWithValidation('កៈ', 0, { strict: true }),
    /Unmapped curriculum character/,
    'Strict mode must throw when an unmapped character is encountered',
  );

  // 4. Verify Foundation Lesson and World 1 Lessons 1-7 have 100% valid mappings,
  // and auditAllCurriculumMappings explicitly detects unmapped characters in later lessons
  const foundationReport = typingPlan.validateLessonCurriculumMappings(foundations.foundationHomeRowLesson);
  assert.equal(foundationReport.valid, true, 'Foundation Home-Row lesson must have 0 unsupported inputs');
  assert.equal(foundationReport.unsupportedInputs.length, 0);
  assert.ok(foundationReport.unitCount > 0);

  const world1 = curriculum.lessonCurriculum.find((w) => w.id === 1);
  assert.ok(world1);
  for (const lesson of world1.levels.filter((l) => typeof l.id === 'number' && l.id <= 7)) {
    const report = typingPlan.validateLessonCurriculumMappings(lesson);
    assert.equal(
      report.valid,
      true,
      `World 1 Lesson ${lesson.id} (${lesson.labelEn}) must have 100% valid keyboard mappings`,
    );
  }

  const fullAudit = typingPlan.auditAllCurriculumMappings(curriculum.lessonCurriculum);
  assert.ok(fullAudit.totalLessons > 0);
  assert.ok(fullAudit.fullyMappedLessonCount >= 7);
  assert.ok(
    fullAudit.lessonsWithUnsupportedInputs.some((entry) => entry.worldId === 1 && entry.lessonId === 8),
    'Audit must explicitly flag unmapped character in World 1 Lesson 8 instead of silently ignoring it',
  );
} finally {
  await server.close();
}

console.log('typing core tests passed');
