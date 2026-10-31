import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { calculateLevelFromXP, calculateRewards } from '../src/lib/rewardPolicy';
import { getLessonSpeedTargetCpm } from '../src/lib/typingMetrics';
import { createHash } from 'node:crypto';
import { predecessorIds, resolveLessonIdentity, validateLessonAttempt, type LessonAttempt } from '../src/lib/completionContract';

// Fail closed until a separately reviewed production rollout enables a backend.
if (!process.env.FIRESTORE_EMULATOR_HOST || process.env.GCLOUD_PROJECT !== 'demo-khmer-typing') throw new Error('Demo emulators required');
initializeApp({ projectId: 'demo-khmer-typing' });
const db = getFirestore();
function oldScore(data: { score?: number } | undefined) { return data?.score ?? 1; }

export async function commitAttempt(uid: string, attempt: LessonAttempt) {
  const identity = validateLessonAttempt(attempt);
  const hash = createHash('sha256').update(JSON.stringify(attempt)).digest('hex');
  const student = db.doc(`students/${uid}/progress/summary`);
  const map = db.doc(`students/${uid}/lessonProgress/${identity.id}`);
  const claim = db.doc(`users/${uid}/rewardClaims/attempt-${attempt.attemptId}`);
  const user = db.doc(`users/${uid}`);
  return db.runTransaction(async tx => {
    const [saved, summary, best, balance, maps] = await Promise.all([tx.get(claim), tx.get(student), tx.get(map), tx.get(user), tx.get(db.collection(`students/${uid}/lessonProgress`))]);
    if (saved.exists) {
      if (saved.data()!.hash !== hash) throw new Error('Attempt ID reused with different content');
      return saved.data()!.result;
    }
    const p = summary.data() ?? {};
    const completed = new Set<string>(p.completedLessons ?? []);
    const completedRoutes = new Set(maps.docs.filter(d => d.data().passed || d.data().completed).map(d => d.id));
    for (const id of completed) { try { completedRoutes.add(resolveLessonIdentity(id).id); } catch { /* Preserve unknown historical IDs. */ } }
    if (identity.worldId && predecessorIds(identity.id).some(id => !completedRoutes.has(id))) throw new Error('Lesson locked');
    const now = new Date();
    const date = now.toISOString().slice(0,10);
    const b = balance.data() ?? {};
    if (b.lastAttemptAt && now.getTime() - b.lastAttemptAt < 3000) throw new Error('Please wait before submitting another attempt');
    const m = attempt.metrics;
    const first = m.passed && !completedRoutes.has(identity.id) && !completed.has(identity.id);
    // Reuse existing rewards, with bounded daily replay eligibility.
    const daily = b.rewardDate === date ? b.rewardCount ?? 0 : 0;
    const policy = calculateRewards({ mode:identity.levelId === 'boss' ? 'boss' : 'lesson', accuracy:m.accuracy, CPM:m.cpm, targetCPM:getLessonSpeedTargetCpm(identity.lesson,identity.worldId), mistakes:m.mistakes, stars:m.stars, passed:m.passed, score:m.score, previousBestScore:first ? undefined : oldScore(best.data()), currentStreak:p.currentStreak ?? 0, lessonId:identity.legacyId });
    const eligible = first || daily < 5;
    const reward = { XP:eligible ? Math.min(policy.xpEarned,500) : 0, coins:eligible ? Math.min(policy.coinsEarned,500) : 0, gems:first ? Math.min(policy.gemsEarned,5) : 0 };
    if (m.passed) { completed.add(identity.id); if (identity.worldId) completed.add(identity.legacyId); }
    const gap = p.lastPracticeDate ? (Date.parse(date) - Date.parse(p.lastPracticeDate)) / 86400000 : 1;
    const streak = m.passed ? (gap === 0 ? p.currentStreak ?? 0 : gap === 1 ? (p.currentStreak ?? 0) + 1 : 1) : p.currentStreak ?? 0;
    const achievements = [
      { id:'first-steps', eligible:m.passed, coins:50, gems:0 },
      { id:'accuracy-monk-economy', eligible:m.accuracy >= 95, coins:0, gems:1 },
      { id:'no-mistake-warrior-economy', eligible:m.accuracy === 100 && m.mistakes === 0, coins:100, gems:0 },
      { id:'streak-starter', eligible:streak >= 3, coins:100, gems:0 },
    ].filter(a => a.eligible);
    const achievementReads = await Promise.all(achievements.map(a => tx.get(db.doc(`users/${uid}/achievements/${a.id}`))));
    const newlyUnlocked = achievements.filter((_,i) => achievementReads[i].data()?.rewardClaimed !== true);
    for (const achievement of newlyUnlocked) {
      reward.coins += achievement.coins;
      reward.gems += achievement.gems;
    }
    const weakKeyHistory = { ...(p.weakKeyHistory ?? {}) };
    for (const key of attempt.weakKeys ?? []) {
      const value = key.value.normalize('NFC');
      const prior = weakKeyHistory[value] ?? {};
      weakKeyHistory[value] = { value, category:key.category, mistakes:(prior.mistakes ?? 0)+key.mistakes, backspaces:(prior.backspaces ?? 0)+key.backspaces };
    }
    const result = { status: 'saved', attemptId: attempt.attemptId, reward, firstClear: first };
    const old = best.data() ?? {};
    for (const achievement of newlyUnlocked) tx.set(db.doc(`users/${uid}/achievements/${achievement.id}`), { achievementId:achievement.id, unlocked:true, progress:1, rewardClaimed:true, unlockedAt:now.toISOString() }, { merge:true });
    tx.set(db.doc(`users/${uid}/dailyQuests/${date}`), { date, quests: {
      completeLesson:{ id:'complete-lesson', progress:FieldValue.increment(m.passed ? 1 : 0), total:1, reward:{ coins:60, XP:40 } },
      accuracyTarget:{ id:'accuracy-target', progress:FieldValue.increment(m.accuracy >= 95 ? 1 : 0), total:1, reward:{ coins:80, gems:1 } },
      threeStars:{ id:'earn-3-stars', progress:FieldValue.increment(m.stars >= 3 ? 1 : 0), total:1, reward:{ coins:70, XP:45 } },
    } }, { merge:true });
    tx.set(map, { ...old, worldId: identity.worldId, lessonId: identity.levelId, passed: old.passed === true || m.passed, completed: old.completed === true || m.passed, score: Math.max(old.score ?? 0,m.score), accuracy: Math.max(old.accuracy ?? 0,m.accuracy), cpm: Math.max(old.cpm ?? 0,m.cpm), stars: Math.max(old.stars ?? 0,m.stars), xpEarned: Math.max(old.xpEarned ?? 0,reward.XP), coinsEarned: Math.max(old.coinsEarned ?? 0,reward.coins) });
    tx.set(student, { weakKeyHistory, completedLessons: [...completed], totalXP: (p.totalXP ?? 0) + reward.XP, currentLevel:calculateLevelFromXP((p.totalXP ?? 0)+reward.XP), lessonResults:[...(p.lessonResults ?? []), { lessonId:identity.legacyId, lessonTitle:identity.lesson.labelEn, worldId:identity.worldId, skillFocus:identity.lesson.objective, targetText:'', minimumAccuracy:identity.lesson.minimumAccuracy ?? 90, targetCPM:getLessonSpeedTargetCpm(identity.lesson,identity.worldId), difficulty:'beginner', accuracy:m.accuracy, CPM:m.cpm, WPM:0, mistakes:m.mistakes, backspaces:m.backspaces, weakKeys:[], stars:m.stars, XP:reward.XP, coinsEarned:reward.coins, score:m.score, passed:m.passed, completedAt:now.toISOString() }], currentStreak: streak, longestStreak: Math.max(p.longestStreak ?? 0, streak), ...(m.passed ? { lastPracticeDate:date } : {}) }, { merge:true });
    tx.set(user, { typingXP:(b.typingXP ?? 0)+reward.XP, coins:(b.coins ?? 0)+reward.coins, gems:(b.gems ?? 0)+reward.gems, level:calculateLevelFromXP((b.typingXP ?? 0)+reward.XP), streak, longestStreak:Math.max(b.longestStreak ?? 0,streak), lastPracticeDate:date, rewardDate:date, rewardCount:daily+1, lastAttemptAt:now.getTime() }, { merge:true });
    tx.set(db.doc(`users/${uid}/lessonResults/${attempt.attemptId}`), { ...attempt, evidenceSource:'client-reported', fingerPlacementVerified:false, receivedAt:now.toISOString(), reward });
    tx.set(db.doc(`users/${uid}/economyEvents/attempt-${attempt.attemptId}`), { type:'lessonReward', amount:reward.XP+reward.coins+reward.gems, currency:'mixed', source:identity.id, metadata:reward, createdAt:now.toISOString() });
    tx.set(claim, { hash, result, createdAt:now.toISOString() });
    return result;
  });
}

export const submitLessonAttempt = onCall({ region:'us-central1', maxInstances:2 }, async request => {
  if (!request.auth || request.auth.token.firebase?.sign_in_provider === 'anonymous') throw new HttpsError('unauthenticated','A student account is required');
  try { return await commitAttempt(request.auth.uid, request.data); }
  catch (error) { throw new HttpsError('failed-precondition', error instanceof Error ? error.message : 'Save failed'); }
});
