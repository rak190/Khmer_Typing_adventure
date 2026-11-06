import { setTimeout as delay } from 'node:timers/promises';

const emulators = [
  { name: 'Auth', url: 'http://127.0.0.1:9099/' },
  { name: 'Firestore', url: 'http://127.0.0.1:8080/' },
  { name: 'Functions', url: 'http://127.0.0.1:5001/' },
];
const deadline = Date.now() + 60_000;
const ready = new Set();

console.log('Waiting for Firebase emulator HTTP endpoints to become reachable...');
while (ready.size < emulators.length && Date.now() < deadline) {
  await Promise.all(emulators.filter(({ name }) => !ready.has(name)).map(async ({ name, url }) => {
    try {
      // Any HTTP response (including 404) confirms the emulator's HTTP server is up.
      await fetch(url, { signal: AbortSignal.timeout(2000) });
      ready.add(name);
      console.log(`✓ ${name} emulator is reachable`);
    } catch {
      // The emulator may still be starting; retry until the shared deadline.
    }
  }));
  if (ready.size < emulators.length) await delay(1000);
}

const missing = emulators.filter(({ name }) => !ready.has(name)).map(({ name }) => name);
if (missing.length) {
  throw new Error(`Firebase emulator readiness timeout; unreachable: ${missing.join(', ')}`);
}
