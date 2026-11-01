import { httpsCallable } from 'firebase/functions';
import { auth, functions } from './firebase';
import { validateLessonAttempt, type LessonAttempt } from './completionContract';

export type SaveResult = {
  status: 'saved';
  attemptId: string;
  reward: { XP: number; coins: number; gems: number };
  firstClear: boolean;
};

export function isOnlineSaveAllowed(): boolean {
  return (
    import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' ||
    (import.meta.env.VITE_FIREBASE_STAGE === 'staging' && Boolean(functions))
  );
}

export function isStudentOnlineSaveAvailable(): boolean {
  const user = auth?.currentUser;
  if (!user || user.isAnonymous) return false;
  return isOnlineSaveAllowed();
}

/** Retain failed records, scoped to the original account. Retry never changes identity. */
export async function submitLessonAttempt(attempt: LessonAttempt): Promise<SaveResult> {
  validateLessonAttempt(attempt);
  const uid = auth?.currentUser?.uid;
  if (!uid || !functions) throw new Error('Local demonstration only — no server save');
  if (auth?.currentUser?.isAnonymous) throw new Error('A student account is required for online saves');
  if (!isOnlineSaveAllowed()) throw new Error('Secure backend rollout pending review; online rewards disabled');

  const key = `khmer-pending:${uid}:${attempt.attemptId}`;
  const prefix = `khmer-pending:${uid}:`;
  const pending = Object.keys(localStorage).filter(k => k.startsWith(prefix));
  if (!pending.includes(key) && pending.length >= 20) throw new Error('Pending save limit reached. Retry earlier saves first.');
  localStorage.setItem(key, JSON.stringify(attempt));

  try {
    const response = await httpsCallable<LessonAttempt, SaveResult>(functions, 'submitLessonAttempt')(attempt);
    if (auth?.currentUser?.uid !== uid) throw new Error('Account changed; result belongs to the previous account');
    localStorage.removeItem(key);
    return response.data;
  } catch (error) {
    if (auth?.currentUser?.uid !== uid) {
      localStorage.removeItem(key);
    }
    throw error;
  }
}

export async function retryPendingAttempts(): Promise<{ succeeded: number; failed: number }> {
  const uid = auth?.currentUser?.uid;
  if (!uid || !isStudentOnlineSaveAvailable()) return { succeeded: 0, failed: 0 };
  let succeeded = 0;
  let failed = 0;
  for (const key of Object.keys(localStorage).filter(k => k.startsWith(`khmer-pending:${uid}:`)).slice(0, 20)) {
    if (auth?.currentUser?.uid !== uid) break;
    try {
      await submitLessonAttempt(JSON.parse(localStorage.getItem(key)!));
      succeeded += 1;
    } catch {
      failed += 1;
    }
  }
  return { succeeded, failed };
}
