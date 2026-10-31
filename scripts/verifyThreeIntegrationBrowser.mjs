import assert from 'node:assert/strict';
/* global window, history, dispatchEvent, PopStateEvent */

// Run with an existing Playwright page against a development server with Firebase disabled.
// No student account or production service is used. Also callable through Playwright MCP.
export async function verifyThreeIntegration(page, baseURL, { artifactDirectory } = {}) {
  const base = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  const checks = [];
  const errors = [];
  const firebaseRequests = [];
  await page.bringToFront();
  await page.unrouteAll({ behavior: 'wait' });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(/https:\/\/(?:(?:firestore|identitytoolkit|securetoken)\.googleapis\.com|[^/]*firebaseio\.com|[^/]*firebaseapp\.com)\//u, (route) => {
    firebaseRequests.push(route.request().url());
    return route.abort();
  });
  const navigate = async (path) => {
    await page.evaluate((url) => {
      history.pushState({}, '', url);
      dispatchEvent(new PopStateEvent('popstate'));
    }, `${base}${path}`);
  };
  const debug = () => page.evaluate(() => window.__threeGetLessonDebug());
  const unavailable = async (query, reason) => {
    await navigate(`three-game?${query}`);
    await page.locator(`[data-testid="three-lesson-unavailable"][data-reason="${reason}"]`).waitFor();
    assert.equal(await page.locator('canvas').count(), 0);
  };
  await page.goto(`${base}three-game?world=1&level=1`);
  assert.equal(await page.evaluate(async (url) => (await import(`${url}src/lib/firebase.ts`)).firebaseEnabled, base), false,
    'Browser QA requires Firebase to be disabled');
  await page.getByRole('button', { name: /Guest/u }).click();
  const clearLessonFixture = () => page.evaluate(async (url) => {
    const { mockLessonProgress } = await import(`${url}src/data/mockData.tsx`);
    mockLessonProgress.splice(0);
    localStorage.removeItem('khmer-lesson-progress-records');
    dispatchEvent(new Event('khmer-lesson-progress-change'));
  }, base);
  await clearLessonFixture();
  await navigate('map');
  await page.getByTestId('map-play-3d').waitFor();
  await page.getByTestId('map-play-2d').click();
  await page.waitForURL(/\/lesson\?world=1&level=1$/u);
  await page.getByTestId('typing-target-card').waitFor();
  // Exercise original 2D input without completing or saving a result.
  const firstKey = await page.evaluate(async (url) => {
    const curriculum = await import(`${url}src/data/lessonCurriculum.ts`);
    const plans = await import(`${url}src/lib/lessonTypingPlan.ts`);
    const target = plans.buildLessonTypingPlan(curriculum.getCurriculumLevel(1, 1), 1).units[0];
    return `${target.modifier === 'shift' ? 'Shift+' : ''}${target.key.code}`;
  }, base);
  await page.keyboard.press(firstKey);
  assert.match(await page.getByTestId('typing-target-card').innerText(), /1 \/ \d+/u);
  await page.goBack();
  await page.getByTestId('map-play-3d').waitFor();
  if (artifactDirectory) await page.screenshot({ path: `${artifactDirectory}/task5-map.png` });
  checks.push('Map Play 2D and browser Back');
  await page.getByRole('button', { name: 'Level 2 locked', exact: true }).click({ force: true });
  assert.equal(await page.getByTestId('map-play-3d').count(), 0);
  await page.keyboard.press('Escape');
  await page.getByTestId('map-play-2d').click({ force: true });
  assert.match(page.url(), /\/map$/u);
  // Close the lock message, then use direct routes for locked/invalid cases.
  await unavailable('world=1&level=2', 'locked');
  await unavailable('world=2&level=1', 'locked');
  await unavailable('world=1&level=boss', 'locked');
  for (const query of ['world=1&level=2', 'world=2&level=1']) {
    await navigate(`lesson?${query}`);
    await page.getByTestId('two-d-lesson-locked').waitFor();
    assert.equal(await page.getByTestId('typing-target-card').count(), 0);
  }
  for (const query of ['', 'world=99&level=1', 'world=1&level=99', 'world=1&level=bad', 'world=1', 'world=1&level=1&level=2']) {
    await unavailable(query, 'invalid');
  }
  checks.push('Locked map/direct routes; invalid, missing and duplicate parameters');
  // Seed only the isolated browser's local cache to inspect an unlocked 2D-only lesson.
  await page.evaluate(() => {
    localStorage.setItem('khmer-lesson-progress-records', JSON.stringify([{
      worldId: 1, lessonId: 1, passed: true, score: 100, accuracy: 100, wpm: 10,
      stars: 3, xpEarned: 80, coinsEarned: 10, bestStreak: 10,
    }]));
    dispatchEvent(new Event('khmer-lesson-progress-change'));
  });
  await unavailable('world=1&level=2', 'unsupported');
  await page.getByRole('link', { name: /Play 2D/u }).click();
  await page.waitForURL(/\/lesson\?world=1&level=2$/u);
  await navigate('map');
  await page.getByRole('button', { name: 'Level 2', exact: true }).waitFor();
  assert.equal(await page.getByTestId('map-play-3d').count(), 0);
  await page.getByTestId('map-play-2d').click();
  await page.waitForURL(/\/lesson\?world=1&level=2$/u);
  checks.push('Unlocked unsupported lesson uses 2D from map and fallback');
  await clearLessonFixture();
  await navigate('map');
  await page.getByTestId('map-play-3d').click();
  await page.getByTestId('three-prototype-page').waitFor();
  assert.match(page.url(), /\/three-game\?world=1&level=1$/u);
  assert.equal(await page.locator('canvas').count(), 1);
  assert.equal(await page.getByTestId('three-webgl-fallback').count(), 0);
  checks.push('Map Play 3D preserves lesson parameters and renders WebGL');
  const savedBefore = await page.evaluate(() => ({
    lessons: localStorage.getItem('khmer-lesson-progress-records'),
    student: localStorage.getItem('khmer-typing-student-progress'),
  }));
  // Camera-relative horizontal controls, then held-key clearing when typing starts.
  const beforeMove = await page.evaluate(() => [...window.__threeGetPlayerPos()]);
  await page.keyboard.down('KeyA');
  await page.waitForFunction((x) => window.__threeGetPlayerPos()[0] > x, beforeMove[0]);
  await page.keyboard.up('KeyA');
  const afterLeft = await page.evaluate(() => [...window.__threeGetPlayerPos()]);
  assert.ok(afterLeft[0] > beforeMove[0], 'A moves left in camera space');
  await page.keyboard.down('KeyD');
  await page.waitForFunction((x) => window.__threeGetPlayerPos()[0] < x, afterLeft[0]);
  await page.keyboard.up('KeyD');
  const afterRight = await page.evaluate(() => [...window.__threeGetPlayerPos()]);
  assert.ok(afterRight[0] < afterLeft[0], 'D moves right in camera space');
  const completeLesson = async () => {
    for (let stage = 1; stage <= 3; stage += 1) {
      await page.getByTestId('three-unlock-gate-btn').click();
      await page.getByTestId('three-typing-overlay').waitFor();
      const progressBeforeTab = await page.getByTestId('three-typing-progress').innerText();
      await page.keyboard.press('Tab');
      assert.equal(await page.getByTestId('three-typing-progress').innerText(), progressBeforeTab);
      const position = await page.evaluate(() => [...window.__threeGetPlayerPos()]);
      await page.keyboard.press('ArrowLeft');
      assert.deepEqual(await page.evaluate(() => [...window.__threeGetPlayerPos()]), position);
      for (let count = 0; await page.getByTestId('three-typing-overlay').count(); count += 1) {
        assert.ok(count < 60, 'Typing must advance and terminate');
        const key = page.locator('button[data-is-target="true"]');
        const code = await key.getAttribute('data-key-code');
        const shift = await page.locator('[data-is-shift-target="true"]').count();
        if (shift) {
          const before = await page.getByTestId('three-typing-mistakes').innerText();
          await page.keyboard.press('Shift');
          assert.equal(await page.getByTestId('three-typing-mistakes').innerText(), before);
        }
        await page.keyboard.press(`${shift ? 'Shift+' : ''}${code}`);
      }
      await page.getByTestId('three-victory-modal').waitFor();
      assert.equal(await page.getByTestId('three-victory-modal').getAttribute('data-passed'), 'true');
      if (stage < 3) await page.getByTestId('three-walk-through-btn').click();
    }
    assert.equal(await page.getByTestId('three-victory-modal').getAttribute('data-final-lesson-complete'), 'true');
    assert.equal(await page.getByTestId('three-modal-accuracy').innerText(), '100%');
    assert.equal(await page.getByTestId('three-modal-stage-breakdown').locator('[data-testid^="three-modal-stage-row"]').count(), 3);
    await page.getByTestId('three-temporary-results-notice').waitFor();
  };
  await completeLesson();
  if (artifactDirectory) await page.screenshot({ path: `${artifactDirectory}/task5-summary.png` });
  const firstCompletion = await debug();
  assert.equal(firstCompletion.rewardTotals.claimedCount, 1);
  assert.ok(firstCompletion.rewardTotals.totalXp > 0);
  await page.getByTestId('three-practice-again-btn').click();
  assert.equal((await debug()).activeStageIndex, 0);
  await completeLesson();
  assert.deepEqual((await debug()).rewardTotals, firstCompletion.rewardTotals);
  assert.equal(await page.getByTestId('three-modal-xp').innerText(), '+0 XP');
  await page.getByTestId('three-modal-duplicate-reward-notice').waitFor();
  assert.deepEqual(await page.evaluate(() => ({
    lessons: localStorage.getItem('khmer-lesson-progress-records'),
    student: localStorage.getItem('khmer-typing-student-progress'),
  })), savedBefore);
  checks.push('All three stages, Shift guidance, movement lock, summary, replay, duplicate rewards, no progress writes');
  await page.getByTestId('three-summary-return-map').click();
  await page.getByRole('button', { name: 'Level 2 locked', exact: true }).waitFor();
  await page.goBack();
  await page.getByTestId('three-prototype-page').waitFor();
  assert.equal((await debug()).rewardTotals.claimedCount, 0);
  assert.equal((await debug()).activeStageIndex, 0);
  await navigate('three-game?world=1&level=99');
  await page.getByTestId('three-lesson-unavailable').waitFor();
  await navigate('three-game?world=1&level=1');
  await page.getByTestId('three-prototype-page').waitFor();
  assert.equal((await debug()).rewardTotals.claimedCount, 0);
  assert.ok((await debug()).stageStates.every((stage) => !stage.passed));
  checks.push('Return to map keeps Lesson 2 locked; Back and parameter changes create a fresh session');
  await page.getByTestId('three-unlock-gate-btn').click();
  await page.keyboard.press('KeyA');
  await page.keyboard.press('KeyA');
  for (let count = 0; await page.getByTestId('three-typing-overlay').count(); count += 1) {
    assert.ok(count < 20, 'Failed attempt must finish');
    await page.locator('button[data-is-target="true"]').click();
  }
  await page.getByTestId('three-victory-modal').waitFor();
  assert.equal(await page.getByTestId('three-victory-modal').getAttribute('data-passed'), 'false');
  assert.equal((await debug()).rewardTotals.claimedCount, 0);
  await page.getByTestId('three-retry-btn').click();
  await page.getByTestId('three-typing-restart').click();
  assert.match(await page.getByTestId('three-typing-progress').innerText(), /0 \/ 10/u);
  await page.getByTestId('three-typing-cancel').click();
  assert.ok((await debug()).stageStates.every((stage) => !stage.passed));
  checks.push('Failed accuracy attempt, retry, restart and cancel keep progress/rewards safe');
  await page.locator('canvas').evaluate((canvas) => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await page.getByTestId('three-webgl-fallback').waitFor();
  await page.getByTestId('three-fallback-lesson-btn').click();
  await page.waitForURL(/\/lesson\?world=1&level=1$/u);
  checks.push('WebGL context-loss fallback preserves the selected 2D lesson');
  await page.goto(`${base}3d-prototype?world=1&level=1`);
  await page.getByTestId('three-prototype-page').waitFor();
  await page.reload();
  await page.getByTestId('three-prototype-page').waitFor();
  assert.equal((await debug()).rewardTotals.claimedCount, 0);
  checks.push('Development direct URL and refresh');
  assert.deepEqual(errors, []);
  assert.deepEqual(firebaseRequests, []);
  return { checks, pageErrors: errors, firebaseRequests };
}
