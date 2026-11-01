import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { auth, db } from './firebase';
import { validateLessonAttempt, type LessonAttempt } from './completionContract';
import { calculateRewards } from './rewardPolicy';
import { getLessonSpeedTargetCpm } from './typingMetrics';

export type SaveResult = {
  status: 'saved';
  attemptId: string;
  reward: { XP: number; coins: number; gems: number };
  firstClear: boolean;
};

export function isOnlineSaveAllowed(): boolean {
  return Boolean(
    db && (
      import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' ||
      import.meta.env.VITE_FIREBASE_STAGE === 'staging' ||
      Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID)
    )
  );
}

export function isStudentOnlineSaveAvailable(): boolean {
  return Boolean(auth?.currentUser && isOnlineSaveAllowed());
}

/**
 * Saves lesson attempt directly to Cloud Firestore under the authenticated student's path.
 * Retains failed records locally for offline retry with the exact same attemptId.
 */
export async function submitLessonAttempt(attempt: LessonAttempt): Promise<SaveResult> {
  const identity = validateLessonAttempt(attempt);
  const uid = auth?.currentUser?.uid;
  if (!uid || !db) throw new Error('Local demonstration only — no server save');
  if (!isOnlineSaveAllowed()) throw new Error('Cloud storage disabled in this environment');

  const key = `khmer-pending:${uid}:${attempt.attemptId}`;
  const prefix = `khmer-pending:${uid}:`;
  const pending = Object.keys(localStorage).filter(k => k.startsWith(prefix));
  if (!pending.includes(key) && pending.length >= 20) throw new Error('Pending save limit reached. Retry earlier saves first.');
  localStorage.setItem(key, JSON.stringify(attempt));

  try {
    // 1. Check idempotency: If this attemptId was already saved, return the existing reward
    const claimRef = doc(db, 'users', uid, 'rewardClaims', `attempt-${attempt.attemptId}`);
    const existingClaim = await getDoc(claimRef);
    if (existingClaim.exists()) {
      localStorage.removeItem(key);
      const data = existingClaim.data() as { result: SaveResult };
      return data.result;
    }

    // 2. Check if this is the student's first clear of this lesson
    const lessonDocRef = doc(db, 'students', uid, 'lessonProgress', identity.id);
    const existingProgress = await getDoc(lessonDocRef);
    const firstClear = attempt.metrics.passed && (!existingProgress.exists() || !existingProgress.data()?.passed);

    // 3. Calculate rewards based on performance policy
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

    const reward = {
      XP: Math.min(policy.xpEarned, 500),
      coins: Math.min(policy.coinsEarned, 500),
      gems: firstClear ? Math.min(policy.gemsEarned, 5) : 0,
    };

    const saveResult: SaveResult = {
      status: 'saved',
      attemptId: attempt.attemptId,
      reward,
      firstClear,
    };

    // 4. Save lesson progress document in Firestore
    await setDoc(lessonDocRef, {
      worldId: identity.worldId,
      lessonId: identity.levelId,
      score: attempt.metrics.score,
      accuracy: attempt.metrics.accuracy,
      cpm: attempt.metrics.cpm,
      wpm: Math.round(attempt.metrics.cpm / 5),
      stars: attempt.metrics.stars,
      xpEarned: reward.XP,
      coinsEarned: reward.coins,
      passed: attempt.metrics.passed,
      completed: true,
      timeSeconds: attempt.metrics.elapsedSeconds,
      mistakes: attempt.metrics.mistakes,
      backspaces: attempt.metrics.backspaces,
      stages: attempt.stages,
      updatedAt: attempt.completedAt,
    }, { merge: true });

    // 5. Record the claim record for idempotency
    await setDoc(claimRef, {
      attemptId: attempt.attemptId,
      lessonId: identity.id,
      result: saveResult,
      createdAt: attempt.completedAt,
    });

    // 6. Update student summary (completed lessons and streak)
    if (attempt.metrics.passed) {
      const summaryRef = doc(db, 'students', uid, 'progress', 'summary');
      try {
        await updateDoc(summaryRef, {
          completedLessons: arrayUnion(identity.id, identity.legacyId),
          lastPracticeDate: attempt.completedAt.slice(0, 10),
        });
      } catch {
        await setDoc(summaryRef, {
          completedLessons: [identity.id, identity.legacyId],
          lastPracticeDate: attempt.completedAt.slice(0, 10),
          currentStreak: 1,
        }, { merge: true });
      }
    }

    // 7. Update user balance (typingXP and totalCoins)
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, {
        typingXP: increment(reward.XP),
        totalCoins: increment(reward.coins),
        lastAttemptAt: Date.now(),
      });
    } catch {
      await setDoc(userRef, {
        typingXP: reward.XP,
        totalCoins: reward.coins,
        lastAttemptAt: Date.now(),
      }, { merge: true });
    }

    localStorage.removeItem(key);
    return saveResult;
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
