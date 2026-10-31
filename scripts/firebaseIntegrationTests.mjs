import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { build } from 'esbuild';

await build({ entryPoints:['src/lib/completionContract.ts'], bundle:true, platform:'node', format:'esm', outfile:'.local/tests/emulator-contract.mjs' });
const { resolveLessonIdentity } = await import('../.local/tests/emulator-contract.mjs');

const projectId = 'demo-khmer-typing';
if (process.env.GCLOUD_PROJECT !== projectId || !process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Demo emulator process required');
const env = await initializeTestEnvironment({ projectId, firestore:{ host:'127.0.0.1', port:8080, rules:await readFile('firestore.rules','utf8') } });
try {
  const a = env.authenticatedContext('student-a').firestore();
  const b = env.authenticatedContext('student-b').firestore();
  const guest = env.unauthenticatedContext().firestore();
  for (const path of ['students/student-a/progress/summary','students/student-a/lessonProgress/1:1','users/student-a','users/student-a/rewardClaims/forged','users/student-a/inventory/item','users/student-a/nested/x/deep/y']) {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(),path), { test:true }));
    await assertSucceeds(getDoc(doc(a,path)));
    await assertFails(getDoc(doc(b,path)));
    await assertFails(getDoc(doc(guest,path)));
    await assertFails(setDoc(doc(a,path),{ coins:999999 }));
    await assertFails(setDoc(doc(b,path),{ coins:999999 }));
  }
  const app = initializeApp({ projectId, apiKey:'demo-key' }, 'integration');
  const auth = getAuth(app);
  connectAuthEmulator(auth,'http://127.0.0.1:9099',{ disableWarnings:true });
  const user = await createUserWithEmailAndPassword(auth,`synthetic-${Date.now()}@example.test`,'synthetic-password');
  const functions = getFunctions(app);
  connectFunctionsEmulator(functions,'127.0.0.1',5001);
  const submit = httpsCallable(functions,'submitLessonAttempt');
  const attempt = { attemptId:'integration-attempt-0001', lessonId:'1:1', version:'khmer-first-5.5-v1', mode:'2d', category:'unicode-output', completedAt:new Date().toISOString(), metrics:{ accuracy:95, cpm:30, score:9000, stars:2, mistakes:1, backspaces:0, elapsedSeconds:60, passed:true }, stages:[] };
  const results = await Promise.all([submit(attempt),submit(attempt)]);
  assert.deepEqual(results[0].data,results[1].data);
  assert.equal(results[0].data.reward.XP,80);
  assert.equal(results[0].data.reward.coins,80, '30 lesson coins plus one first-steps achievement');
  assert.equal(results[0].data.reward.gems,1, 'accuracy achievement claimed once');
  await assert.rejects(submit({ ...attempt, metrics:{ ...attempt.metrics, score:10000 } }));
  await assert.rejects(submit({ ...attempt, attemptId:'integration-forgery-01', coins:9999 }));
  await env.withSecurityRulesDisabled(async ctx => {
    const balance = await getDoc(doc(ctx.firestore(),`users/${user.user.uid}`));
    assert.equal(balance.data().typingXP,80);
  });
  await new Promise(resolve => setTimeout(resolve,3100));
  const replay = await submit({ ...attempt, mode:'3d', attemptId:'integration-replay-0001', metrics:{ ...attempt.metrics, score:8000 }, stages:resolveLessonIdentity('1:1').lesson.stages.map(s => ({ id:s.id, accuracy:95, completed:true })) });
  assert.equal(replay.data.firstClear,false);
  assert.equal(replay.data.reward.gems,0, 'cross-mode replay cannot claim accuracy achievement again');
  const studentDb = env.authenticatedContext(user.user.uid).firestore();
  assert.equal((await getDoc(doc(studentDb,`students/${user.user.uid}/lessonProgress/1:1`))).data().score,9000);
  await assert.rejects(submit({ ...attempt, attemptId:'integration-locked-0001', lessonId:'1:3' }));
  await new Promise(resolve => setTimeout(resolve,3100));
  const foundation = await submit({ ...attempt, attemptId:'integration-foundation-01', lessonId:'foundation-home-row', mode:'foundation', category:'mixed', stages:resolveLessonIdentity('foundation-home-row').lesson.stages.map(s => ({ id:s.id, accuracy:100, completed:true })) });
  assert.equal(foundation.data.firstClear,true);
  assert.equal((await getDoc(doc(studentDb,`students/${user.user.uid}/lessonProgress/1:1`))).data().score,9000);
  assert.equal((await getDoc(doc(studentDb,`students/${user.user.uid}/lessonProgress/foundation-home-row`))).data().passed,true);
  console.log('Emulator rules, authenticated callable and concurrent idempotency passed');
} finally { await env.cleanup(); }
