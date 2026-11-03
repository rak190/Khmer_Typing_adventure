import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const rootDir = process.cwd();
const localConfig = path.join(rootDir, '.local', 'config');
if (!fs.existsSync(localConfig)) {
  fs.mkdirSync(localConfig, { recursive: true });
}

const env = { ...process.env };
env.XDG_CONFIG_HOME = localConfig;
env.FIREBASE_EMULATORS_PATH = path.join(rootDir, '.local', 'firebase-emulators');

// On Windows, if java is not in PATH, use the local bundled JRE if present
if (process.platform === 'win32') {
  const localJavaDir = path.join(rootDir, '.local', 'java', 'runtime', 'jdk-21.0.13+9-jre', 'bin');
  if (fs.existsSync(localJavaDir)) {
    env.PATH = `${localJavaDir};${env.PATH || ''}`;
  }
}

console.log('Building Cloud Functions before starting Firebase emulators...');
const buildProc = spawn('node', ['scripts/buildFunctions.mjs'], { stdio: 'inherit', env });

buildProc.on('close', (code) => {
  if (code !== 0) {
    console.error(`Functions build failed with code ${code}`);
    process.exit(code ?? 1);
  }

  console.log('Starting Firebase emulators and running integration tests...');
  const testScript = process.argv[2] || 'scripts/firebaseIntegrationTests.mjs';
  const command = `npx firebase emulators:exec --project demo-khmer-typing --only auth,firestore,functions "node ${testScript}"`;
  const emuProc = spawn(command, { stdio: 'inherit', env, shell: true });

  emuProc.on('close', (emuCode) => {
    process.exit(emuCode ?? 0);
  });
});
