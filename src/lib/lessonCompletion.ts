import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { app, auth } from './firebase';
import { validateLessonAttempt, type LessonAttempt } from './completionContract';

export type SaveResult = { status: 'saved'; attemptId: string; reward: { XP: number; coins: number; gems: number }; firstClear: boolean };
const functions = app ? getFunctions(app, 'us-central1') : undefined;
if (functions && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') connectFunctionsEmulator(functions, '127.0.0.1', 5001);

/** Retain failed records, scoped to the original account. Retry never changes identity. */
export async function submitLessonAttempt(attempt: LessonAttempt): Promise<SaveResult> {
  validateLessonAttempt(attempt);
  const uid = auth?.currentUser?.uid;
  if (!uid || !functions) throw new Error('Local demonstration only — no server save');
  const key = `khmer-pending:${uid}:${attempt.attemptId}`;
  const prefix = `khmer-pending:${uid}:`;
  const pending = Object.keys(localStorage).filter(k => k.startsWith(prefix));
  if (!pending.includes(key) && pending.length >= 20) throw new Error('Pending save limit reached. Retry earlier saves first.');
  localStorage.setItem(key, JSON.stringify(attempt));
  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS !== 'true') throw new Error('Secure backend rollout pending review; online rewards disabled');
  const response = await httpsCallable<LessonAttempt, SaveResult>(functions, 'submitLessonAttempt')(attempt);
  if (auth?.currentUser?.uid !== uid) throw new Error('Account changed; result belongs to the previous account');
  localStorage.removeItem(key);
  return response.data;
}

export async function retryPendingAttempts() {
  const uid = auth?.currentUser?.uid;
  if (!uid) return;
  for (const key of Object.keys(localStorage).filter(k => k.startsWith(`khmer-pending:${uid}:`)).slice(0,20)) {
    if (auth?.currentUser?.uid !== uid) return;
    await submitLessonAttempt(JSON.parse(localStorage.getItem(key)!));
  }
}
