import { createServer } from 'vite';
import { chromium } from 'playwright';
import path from 'node:path';

const PORT = 5195;

console.log('--- Capturing In-Game Screenshot of Upgraded Hero ---');
const server = await createServer({
  server: { host: '127.0.0.1', port: PORT },
  logLevel: 'error',
});
await server.listen();

const serverBase = server.config.base || '/';
const normalizedBase = serverBase.endsWith('/') ? serverBase : `${serverBase}/`;
const address = server.httpServer?.address();
const resolvedPort = (typeof address === 'object' && address?.port) || PORT;
const BASE_URL = `http://127.0.0.1:${resolvedPort}${normalizedBase}`;

const launchOptions = {
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
};
if (process.platform === 'win32') {
  launchOptions.channel = 'chrome';
}

const browser = await chromium.launch(launchOptions);

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  const targetUrl = `${BASE_URL}three-game?world=1&level=1`;
  console.log(`Navigating to ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'load', timeout: 35000 });

  await page.waitForSelector('canvas', { timeout: 20000 });
  // Wait 3.5s for character model to clone and pose in scene
  await page.waitForTimeout(3500);

  const outPath = path.resolve('docs/3d/upgraded/in_game_hero.png');
  await page.screenshot({ path: outPath });
  console.log(`✅ Saved in-game screenshot to ${outPath}`);
} finally {
  await browser.close();
  await server.close();
}
