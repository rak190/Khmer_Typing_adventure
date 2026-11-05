/* global window, requestAnimationFrame */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const port = 5189;
const base = `http://127.0.0.1:${port}/rak190/Khmer_Typing_adventure/three-game?world=1&level=`;
const evidence = 'docs/3d/task8b-evidence';
await mkdir(evidence, { recursive: true });
const server = await createServer({ server: { host: '127.0.0.1', port }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === 'win32' ? { channel: 'chrome' } : {}),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => {
    const progress = Array.from({ length: 8 }, (_, index) => ({
      worldId: 1, lessonId: index + 1, score: 100, accuracy: 100, wpm: 20,
      stars: 3, xpEarned: 100, coinsEarned: 10, bestStreak: 10, passed: true,
    }));
    localStorage.setItem('khmer-lesson-progress-records:demo', JSON.stringify(progress));
    localStorage.setItem('khmer-typing-settings', JSON.stringify({ soundEnabled: false, musicEnabled: false, keyboardHintsEnabled: true, handHintsEnabled: true }));
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const debug = () => page.evaluate(() => window.__threeGetLessonDebug?.());
  const position = () => page.evaluate(() => window.__threeGetPlayerPos?.());
  const setPosition = (x, y, z) => page.evaluate(([a, b, c]) => window.__threeSetPlayerPos?.(a, b, c), [x, y, z]);
  const screenshots = new Set([1, 3, 5, 8, 'boss']);
  const typeToEnd = async (level, stage) => {
    let presses = 0;
    while ((await debug()).mode === 'typing') {
      const state = await debug();
      assert.ok(state.nextKey, `${level}/${stage}: missing next key`);
      const key = state.nextKey.modifier === 'shift'
        ? `Shift+${state.nextKey.code}`
        : state.nextKey.modifier === 'altgr'
          ? `Control+Alt+${state.nextKey.code}`
          : state.nextKey.code;
      await page.keyboard.press(key);
      await page.waitForFunction(previous => window.__threeGetLessonDebug?.().completedCount > previous || window.__threeGetLessonDebug?.().mode !== 'typing', state.completedCount, { timeout: 5000 });
      assert.ok(++presses < 250, `${level}/${stage}: typing loop did not finish`);
    }
    await page.waitForSelector('[data-testid="three-victory-modal"]', { timeout: 10000 });
  };

  const requestedLevels = process.argv.slice(2).map(value => value === 'boss' ? 'boss' : Number(value));
  for (const level of requestedLevels.length ? requestedLevels : [1, 2, 3, 4, 5, 6, 7, 8, 'boss']) {
    await page.goto(base + level, { timeout: 45000 });
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForFunction(() => Boolean(window.__threeGetLessonDebug), { timeout: 30000 });
    await page.locator('[data-testid="three-intro-start-btn"]').click();
    if (screenshots.has(level)) {
      await page.screenshot({ path: `${evidence}/level-${level}-before.png` });
    }
    const first = await debug();
    assert.equal(first.stageStates.length, 3, `${level}: three stages`);
    const browserFps = await page.evaluate(() => new Promise(resolve => {
      let frames = 0;
      const start = performance.now();
      const tick = () => {
        frames += 1;
        const elapsed = performance.now() - start;
        if (elapsed < 1200) requestAnimationFrame(tick);
        else resolve(Math.round((frames * 1000 / elapsed) * 10) / 10);
      };
      requestAnimationFrame(tick);
    }));
    console.log(`FPS ${level}: ${browserFps} (headless Chrome software WebGL, 1280x720)`);
    const renderStats = await page.evaluate(() => window.__threeRenderStats?.());
    console.log(`RENDER ${level}: ${JSON.stringify(renderStats ?? null)}`);

    // A direct position injection is clamped by the real character controller.
    // The next station must remain beyond the current stage's locked boundary.
    if (level !== 'boss') {
      await setPosition(0, 0, 100);
      await page.waitForFunction(() => (window.__threeGetPlayerPos?.()[2] ?? 100) < 8, null, { timeout: 15000 });
      const locked = await position();
      assert.ok(locked[2] < 8, `${level}: locked route was bypassed at z=${locked[2]}`);
    }

    for (let stage = 0; stage < 3; stage++) {
      const stations = {
        1: [[3.2, 0, -1], [-3.2, 0, -1], [0, 0, 4.5]],
        2: [[0, 0, -1.5], [0, 0, 5.5], [0, 0, 12]],
        3: [[0, 0, 0], [0, 0, 10.5], [0, 0, 20]],
        4: [[0, 0, -0.5], [-3.5, 0, 9], [3.5, 0, 18]],
        5: [[0, 0, -1], [0, 2.2, 9.5], [0, 4.4, 20]],
        6: [[0, 0, -1], [0, 0, 10], [0, 0, 20]],
        7: [[0, 0, -1], [0, 0, 9.5], [0, 0, 19.5]],
        8: [[0, 0, -1], [0, 0, 9.5], [0, 0, 19.5]],
        boss: [[0, 0, 24], [0, 0, 24], [0, 0, 24]],
      }[level];
      const [sx, sy, sz] = stations[stage];
      await setPosition(sx, sy, sz - 1);
      await page.waitForFunction(() => window.__threeGetLessonDebug?.().isNearGate === true, null, { timeout: 10000 });
      await page.keyboard.press('KeyE');
      if (!await page.locator('[data-testid="three-typing-overlay"]').isVisible()) {
        console.log(`E missed on ${level}/${stage}; near=${(await debug()).isNearGate}, pos=${JSON.stringify(await position())}; trying visible Start button`);
        await page.locator('[data-testid="three-unlock-gate-btn"]').click();
      }
      await page.waitForSelector('[data-testid="three-typing-overlay"]', { timeout: 10000 });

      if (stage === 0) {
        const beforeWrong = await debug();
        const wrong = beforeWrong.nextKey.code === 'KeyQ' ? 'KeyA' : 'KeyQ';
        await page.keyboard.press(wrong);
        assert.equal((await debug()).completedCount, 0, `${level}: wrong key advanced progress`);
        // Cancel and restart to verify that the attempt resets.
        await page.keyboard.press('Escape');
        await page.waitForSelector('[data-testid="three-typing-overlay"]', { state: 'detached' });
        await page.locator('[data-testid="three-unlock-gate-btn"]').click();
        await page.waitForSelector('[data-testid="three-typing-overlay"]');
        assert.equal((await debug()).completedCount, 0, `${level}: cancel did not reset progress`);
        for (let wrongCount = 0; wrongCount < 12; wrongCount++) await page.keyboard.press(wrong);
        assert.equal((await debug()).completedCount, 0, `${level}: wrong-key run advanced progress`);
        await typeToEnd(level, stage);
        const failed = await debug();
        assert.equal(failed.stageStates[stage].passed, false, `${level}: inaccurate attempt passed`);
        assert.equal(failed.stageStates[stage].status, 'closed', `${level}: failed route opened`);
        await page.locator('[data-testid="three-retry-btn"]').click();
        await page.waitForSelector('[data-testid="three-typing-overlay"]');
      }

      await typeToEnd(level, stage);
      const passed = await debug();
      assert.equal(passed.stageStates[stage].status, 'open', `${level}/${stage}: stage did not open`);
      assert.equal(passed.stageStates[stage].passed, true, `${level}/${stage}: stage did not pass`);
      await page.locator('[data-testid="three-walk-through-btn"]').click();
      if (stage < 2) {
        assert.equal((await debug()).activeStageIndex, stage + 1, `${level}: next stage unavailable`);
        const remained = await position();
        if (level !== 'boss') {
          assert.ok(Math.hypot(remained[0] - sx, remained[2] - sz) < 4, `${level}: Continue skipped the opened route`);
          await page.keyboard.down('KeyW');
          await page.waitForTimeout(500);
          await page.keyboard.up('KeyW');
          const walked = await position();
          assert.ok(walked[2] > remained[2] + 0.2, `${level}: player cannot walk into opened route`);
        }
      }
    }
    if (screenshots.has(level)) {
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${evidence}/level-${level}-after.png` });
    }
    const finished = await debug();
    assert.ok(finished.stageStates.every(s => s.passed && s.status === 'open'), `${level}: incomplete victory`);
    assert.equal(finished.completionsCount, 1, `${level}: duplicated completion`);
    await page.locator('[data-testid="three-replay-lesson-btn"]').first().click();
    const replay = await debug();
    assert.ok(replay.stageStates.every(s => !s.passed && s.status === 'closed'), `${level}: replay did not reset stages`);
    console.log(`PASS ${level}: stages 1–3, wrong key, cancel, victory, replay`);
  }
  assert.deepEqual(errors.filter(error => !error.includes('WebGL')), [], 'unexpected browser page errors');

  // Compare the optional low setting on the same route and software renderer.
  await page.goto(`${base}1&quality=low`, { timeout: 45000 });
  await page.waitForSelector('canvas', { timeout: 30000 });
  await page.waitForFunction(() => Boolean(window.__threeRenderStats?.()), null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  console.log(`RENDER 1 low: ${JSON.stringify(await page.evaluate(() => window.__threeRenderStats?.()))}`);
} finally {
  await browser.close();
  await server.close();
}
