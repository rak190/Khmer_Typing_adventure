import { httpsCallable } from 'firebase/functions';
import { auth, functions } from './firebase';
import { validateLessonAttempt, type LessonAttempt } from './completionContract';
import { calculateRewards } from './rewardPolicy';
import { getLessonSpeedTargetCpm } from './typingMetrics';

export type SaveResult = {
  status: 'saved';
  attemptId: string;
  reward: { XP: number; coins: number; gems: number };
  firstClear: boolean;
};

export function isOnlineBackendAvailable(userId?: string): boolean {
  const allowOnline =
    import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' ||
    Boolean(import.meta.env.VITE_FIREBASE_STAGE === 'staging' || import.meta.env.VITE_FIREBASE_PROJECT_ID);
  return Boolean(
    allowOnline &&
    functions &&
    auth?.currentUser?.uid &&
    (!userId || auth.currentUser.uid === userId)
  );
}

export function isStudentOnlineSaveAvailable(): boolean {
  return Boolean(auth?.currentUser && isOnlineBackendAvailable());
}

/**
 * Submits a validated lesson attempt to the trusted Cloud Functions v2 backend.
 * Replays and retries are idempotent on the server.
 * Retains failed or offline records in localStorage for seamless automatic retry when reconnected.
 */
export async function submitLessonAttempt(attempt: LessonAttempt): Promise<SaveResult> {
  const identity = validateLessonAttempt(attempt);
  const uid = auth?.currentUser?.uid;

  // Local demo / unauthenticated fallback
  if (!uid || !functions || !isOnlineBackendAvailable()) {
    const targetCPM = getLessonSpeedTargetCpm(identity.lesson, identity.worldId);
    const policy = calculateRewards({
      mode: identity.levelId === 'boss' ? 'boss' : 'lesson',
      accuracy: attempt.metrics.accuracy,
      CPM: attempt.metrics.cpm,
      targetCPM,
      mistakes: attempt.metrics.mistakes,
      stars: attempt.metrics.stars,
      passed: attempt.metrics.passed,
      score: attempt.metrics.score,
      currentStreak: 0,
      lessonId: identity.legacyId,
    });

    return {
      status: 'saved',
      attemptId: attempt.attemptId,
      reward: {
        XP: Math.min(policy.xpEarned, 500),
        coins: Math.min(policy.coinsEarned, 500),
        gems: attempt.metrics.passed ? Math.min(policy.gemsEarned, 5) : 0,
      },
      firstClear: attempt.metrics.passed,
    };
  }

  const key = `khmer-pending:${uid}:${attempt.attemptId}`;
  const prefix = `khmer-pending:${uid}:`;
  const pending = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
  if (!pending.includes(key) && pending.length >= 20) {
    throw new Error('Pending save limit reached. Retry earlier saves first.');
  }

  // Record pending attempt locally before sending network request
  localStorage.setItem(key, JSON.stringify(attempt));

  try {
    const callable = httpsCallable<LessonAttempt, SaveResult>(functions, 'submitLessonAttempt');
    const response = await callable(attempt);

    // Verify account did not switch while call was in flight
    if (auth?.currentUser?.uid !== uid) {
      throw new Error('Account changed; result belongs to previous account');
    }

    // Success: remove from pending queue
    localStorage.removeItem(key);
    return response.data;
  } catch (error) {
    // If account changed, discard previous account's pending save
    if (auth?.currentUser?.uid !== uid) {
      localStorage.removeItem(key);
    }
    throw error;
  }
}

/**
 * Retries all pending offline attempts for the currently authenticated student.
 */
export async function retryPendingAttempts(): Promise<{ succeeded: number; failed: number }> {
  const uid = auth?.currentUser?.uid;
  if (!uid || !isStudentOnlineSaveAvailable()) return { succeeded: 0, failed: 0 };

  const prefix = `khmer-pending:${uid}:`;
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix)).slice(0, 20);

  let succeeded = 0;
  let failed = 0;

  for (const key of keys) {
    if (auth?.currentUser?.uid !== uid) break;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const attempt = JSON.parse(raw) as LessonAttempt;
      await submitLessonAttempt(attempt);
      succeeded += 1;
    } catch {
      failed += 1;
    }
  }

  return { succeeded, failed };
}

// Automatically retry pending attempts when network connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void retryPendingAttempts();
  });
}
