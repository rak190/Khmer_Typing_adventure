import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { calculateLevelFromXP, calculateRewards } from '../src/lib/rewardPolicy';
import { getLessonSpeedTargetCpm } from '../src/lib/typingMetrics';
import { createHash } from 'node:crypto';
import { predecessorIds, resolveLessonIdentity, validateLessonAttempt, type LessonAttempt } from '../src/lib/completionContract';
import { SHOP_ITEMS } from '../src/data/shopItems';

// Fail closed until a separately reviewed production rollout enables a live backend.
const isEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FUNCTIONS_EMULATOR);
const projectId = process.env.GCLOUD_PROJECT || 'demo-khmer-typing';
const isStaging = process.env.FIREBASE_STAGE === 'staging' || projectId.includes('staging');

if (!isEmulator && !isStaging) {
  throw new Error('Production rollout requires reviewed deployment; execution halted for safety');
}

initializeApp(isEmulator ? { projectId: 'demo-khmer-typing' } : undefined);
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
    // Targeted reads: Avoid querying the entire students collection on every attempt
    const [saved, summary, best, balance] = await Promise.all([
      tx.get(claim),
      tx.get(student),
      tx.get(map),
      tx.get(user),
    ]);

    if (saved.exists) {
      if (saved.data()!.hash !== hash) throw new Error('Attempt ID reused with different content');
      return saved.data()!.result;
    }

    const p = summary.data() ?? {};
    const completed = new Set<string>(p.completedLessons ?? []);
    const completedRoutes = new Set<string>();
    for (const id of completed) {
      try {
        completedRoutes.add(resolveLessonIdentity(id).id);
      } catch {
        /* Preserve unknown historical IDs. */
      }
    }

    // Check predecessor unlocking without scanning the whole collection
    if (identity.worldId) {
      const preds = predecessorIds(identity.id);
      if (preds.length > 0) {
        const immediatePredecessor = preds[preds.length - 1];
        if (!completedRoutes.has(immediatePredecessor)) {
          // Check if immediate predecessor is completed in lessonProgress doc
          const predDoc = await tx.get(db.doc(`students/${uid}/lessonProgress/${immediatePredecessor}`));
          if (!predDoc.exists || (!predDoc.data()?.passed && !predDoc.data()?.completed)) {
            throw new Error('Lesson locked');
          }
          completedRoutes.add(immediatePredecessor);
        }
      }
    }

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const b = balance.data() ?? {};
    if (b.lastAttemptAt && now.getTime() - b.lastAttemptAt < 3000) {
      throw new Error('Please wait before submitting another attempt');
    }

    const m = attempt.metrics;
    const first = m.passed && !completedRoutes.has(identity.id) && !completed.has(identity.id);
    const daily = b.rewardDate === date ? b.rewardCount ?? 0 : 0;
    const policy = calculateRewards({
      mode: identity.levelId === 'boss' ? 'boss' : 'lesson',
      accuracy: m.accuracy,
      CPM: m.cpm,
      targetCPM: getLessonSpeedTargetCpm(identity.lesson, identity.worldId),
      mistakes: m.mistakes,
      stars: m.stars,
      passed: m.passed,
      score: m.score,
      previousBestScore: first ? undefined : oldScore(best.data()),
      currentStreak: p.currentStreak ?? 0,
      lessonId: identity.legacyId,
    });

    const eligible = first || daily < 5;
    const reward = {
      XP: eligible ? Math.min(policy.xpEarned, 500) : 0,
      coins: eligible ? Math.min(policy.coinsEarned, 500) : 0,
      gems: first ? Math.min(policy.gemsEarned, 5) : 0,
    };

    if (m.passed) {
      completed.add(identity.id);
      if (identity.worldId) completed.add(identity.legacyId);
    }

    const gap = p.lastPracticeDate ? (Date.parse(date) - Date.parse(p.lastPracticeDate)) / 86400000 : 1;
    const streak = m.passed ? (gap === 0 ? p.currentStreak ?? 0 : gap === 1 ? (p.currentStreak ?? 0) + 1 : 1) : p.currentStreak ?? 0;

    const achievements = [
      { id: 'first-steps', eligible: m.passed, coins: 50, gems: 0 },
      { id: 'accuracy-monk-economy', eligible: m.accuracy >= 95, coins: 0, gems: 1 },
      { id: 'no-mistake-warrior-economy', eligible: m.accuracy === 100 && m.mistakes === 0, coins: 100, gems: 0 },
      { id: 'streak-starter', eligible: streak >= 3, coins: 100, gems: 0 },
    ].filter(a => a.eligible);

    const achievementReads = await Promise.all(achievements.map(a => tx.get(db.doc(`users/${uid}/achievements/${a.id}`))));
    const newlyUnlocked = achievements.filter((_, i) => achievementReads[i].data()?.rewardClaimed !== true);
    for (const achievement of newlyUnlocked) {
      reward.coins += achievement.coins;
      reward.gems += achievement.gems;
    }

    const weakKeyHistory = { ...(p.weakKeyHistory ?? {}) };
    for (const key of attempt.weakKeys ?? []) {
      const value = key.value.normalize('NFC');
      const prior = weakKeyHistory[value] ?? {};
      weakKeyHistory[value] = {
        value,
        category: key.category,
        mistakes: (prior.mistakes ?? 0) + key.mistakes,
        backspaces: (prior.backspaces ?? 0) + key.backspaces,
      };
    }

    const result = { status: 'saved' as const, attemptId: attempt.attemptId, reward, firstClear: first };
    const old = best.data() ?? {};

    for (const achievement of newlyUnlocked) {
      tx.set(db.doc(`users/${uid}/achievements/${achievement.id}`), {
        achievementId: achievement.id,
        unlocked: true,
        progress: 1,
        rewardClaimed: true,
        unlockedAt: now.toISOString(),
      }, { merge: true });
    }

    tx.set(db.doc(`users/${uid}/dailyQuests/${date}`), {
      date,
      quests: {
        completeLesson: { id: 'complete-lesson', progress: FieldValue.increment(m.passed ? 1 : 0), total: 1, reward: { coins: 60, XP: 40 } },
        accuracyTarget: { id: 'accuracy-target', progress: FieldValue.increment(m.accuracy >= 95 ? 1 : 0), total: 1, reward: { coins: 80, gems: 1 } },
        threeStars: { id: 'earn-3-stars', progress: FieldValue.increment(m.stars >= 3 ? 1 : 0), total: 1, reward: { coins: 70, XP: 45 } },
      },
    }, { merge: true });

    tx.set(map, {
      ...old,
      worldId: identity.worldId,
      lessonId: identity.levelId,
      passed: old.passed === true || m.passed,
      completed: old.completed === true || m.passed,
      score: Math.max(old.score ?? 0, m.score),
      accuracy: Math.max(old.accuracy ?? 0, m.accuracy),
      cpm: Math.max(old.cpm ?? 0, m.cpm),
      stars: Math.max(old.stars ?? 0, m.stars),
      xpEarned: Math.max(old.xpEarned ?? 0, reward.XP),
      coinsEarned: Math.max(old.coinsEarned ?? 0, reward.coins),
    });

    // Bound summary.lessonResults to most recent 30 items to prevent document growth from exceeding 1MB
    const newSummaryResult = {
      lessonId: identity.legacyId,
      lessonTitle: identity.lesson.labelEn,
      worldId: identity.worldId,
      skillFocus: identity.lesson.objective,
      targetText: '',
      minimumAccuracy: identity.lesson.minimumAccuracy ?? 90,
      targetCPM: getLessonSpeedTargetCpm(identity.lesson, identity.worldId),
      difficulty: 'beginner',
      accuracy: m.accuracy,
      CPM: m.cpm,
      WPM: 0,
      mistakes: m.mistakes,
      backspaces: m.backspaces,
      weakKeys: [],
      stars: m.stars,
      XP: reward.XP,
      coinsEarned: reward.coins,
      score: m.score,
      passed: m.passed,
      completedAt: now.toISOString(),
    };
    const boundedLessonResults = [...(p.lessonResults ?? []), newSummaryResult].slice(-30);

    tx.set(student, {
      weakKeyHistory,
      completedLessons: [...completed],
      totalXP: (p.totalXP ?? 0) + reward.XP,
      currentLevel: calculateLevelFromXP((p.totalXP ?? 0) + reward.XP),
      lessonResults: boundedLessonResults,
      currentStreak: streak,
      longestStreak: Math.max(p.longestStreak ?? 0, streak),
      ...(m.passed ? { lastPracticeDate: date } : {}),
    }, { merge: true });

    tx.set(user, {
      typingXP: (b.typingXP ?? 0) + reward.XP,
      coins: (b.coins ?? 0) + reward.coins,
      gems: (b.gems ?? 0) + reward.gems,
      level: calculateLevelFromXP((b.typingXP ?? 0) + reward.XP),
      streak,
      longestStreak: Math.max(b.longestStreak ?? 0, streak),
      lastPracticeDate: date,
      rewardDate: date,
      rewardCount: daily + 1,
      lastAttemptAt: now.getTime(),
    }, { merge: true });

    tx.set(db.doc(`users/${uid}/lessonResults/${attempt.attemptId}`), {
      ...attempt,
      evidenceSource: 'client-reported',
      fingerPlacementVerified: false,
      receivedAt: now.toISOString(),
      reward,
    });

    tx.set(db.doc(`users/${uid}/economyEvents/attempt-${attempt.attemptId}`), {
      type: 'lessonReward',
      amount: reward.XP + reward.coins + reward.gems,
      currency: 'mixed',
      source: identity.id,
      metadata: reward,
      createdAt: now.toISOString(),
    });

    tx.set(claim, { hash, result, createdAt: now.toISOString() });
    return result;
  });
}

export async function handlePurchaseShopItem(uid: string, data: { itemId: string }) {
  if (!data || typeof data.itemId !== 'string') {
    throw new Error('Invalid item ID');
  }
  const itemConfig = SHOP_ITEMS.find(item => item.id === data.itemId);
  if (!itemConfig || itemConfig.comingSoon) {
    throw new Error('Item not available for purchase');
  }
  const cost = itemConfig.price;
  const currency = itemConfig.currency;
  const isConsumable = itemConfig.type === 'powerup' || itemConfig.type === 'heart';

  const userRef = db.doc(`users/${uid}`);
  const itemRef = db.doc(`users/${uid}/inventory/${data.itemId}`);
  const now = new Date();

  return db.runTransaction(async tx => {
    const [userSnap, itemSnap] = await Promise.all([tx.get(userRef), tx.get(itemRef)]);
    const userData = userSnap.data() ?? {};
    const currentBalance = userData[currency] ?? 0;

    if (currentBalance < cost) {
      throw new Error(currency === 'coins' ? 'Not enough coins.' : 'Not enough gems.');
    }

    const itemData = itemSnap.data() ?? {};
    if (!isConsumable && itemData.owned === true) {
      throw new Error('Already owned.');
    }

    const nextBalance = Math.max(0, currentBalance - cost);
    const currentQuantity = itemData.quantity ?? 0;
    const nextQuantity = isConsumable ? currentQuantity + 1 : currentQuantity;

    let nextHearts = userData.hearts;
    if (data.itemId === 'extra-heart') {
      const maxHearts = userData.maxHearts ?? 5;
      nextHearts = Math.min(maxHearts, (userData.hearts ?? maxHearts) + 1);
    }

    tx.set(userRef, {
      [currency]: nextBalance,
      ...(nextHearts !== undefined ? { hearts: nextHearts } : {}),
      updatedAt: now.toISOString(),
    }, { merge: true });

    const updatedItem = {
      itemId: data.itemId,
      quantity: nextQuantity,
      owned: true,
      updatedAt: now.toISOString(),
    };
    tx.set(itemRef, updatedItem, { merge: true });

    tx.set(db.doc(`users/${uid}/economyEvents/purchase-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`), {
      type: 'purchase',
      amount: -cost,
      currency,
      source: data.itemId,
      metadata: { itemId: data.itemId, cost },
      createdAt: now.toISOString(),
    });

    return {
      success: true,
      economy: {
        ...userData,
        [currency]: nextBalance,
        ...(nextHearts !== undefined ? { hearts: nextHearts } : {}),
      },
      inventoryItem: updatedItem,
    };
  });
}

export async function handlePrepareBossAttempt(uid: string, data?: { attemptId?: string }) {
  const userRef = db.doc(`users/${uid}`);
  const retryRef = db.doc(`users/${uid}/inventory/retry-token`);
  const attemptRef = data?.attemptId ? db.doc(`users/${uid}/bossAttempts/${data.attemptId}`) : null;
  const now = new Date();

  return db.runTransaction(async tx => {
    const [userSnap, retrySnap, attemptSnap] = await Promise.all([
      tx.get(userRef),
      tx.get(retryRef),
      attemptRef ? tx.get(attemptRef) : Promise.resolve(null),
    ]);

    if (attemptSnap?.exists) {
      return {
        usedRetryToken: attemptSnap.data()?.usedRetryToken === true,
        economy: userSnap.data() ?? {},
      };
    }

    const userData = userSnap.data() ?? {};
    const retryData = retrySnap.data() ?? {};
    const retryQuantity = retryData.quantity ?? 0;
    const hasRetryToken = retryQuantity > 0;

    const maxHearts = userData.maxHearts ?? 5;
    let currentHearts = userData.hearts ?? maxHearts;
    const lastRefill = userData.lastHeartRefillAt ? Date.parse(userData.lastHeartRefillAt) : now.getTime();
    const elapsedMs = now.getTime() - lastRefill;
    const HEART_REFILL_MS = 30 * 60 * 1000;
    if (currentHearts < maxHearts && elapsedMs >= HEART_REFILL_MS) {
      const recovered = Math.floor(elapsedMs / HEART_REFILL_MS);
      currentHearts = Math.min(maxHearts, currentHearts + recovered);
    }

    if (!hasRetryToken && currentHearts <= 0) {
      throw new Error('Not enough hearts.');
    }

    const nextHearts = hasRetryToken ? currentHearts : currentHearts - 1;
    tx.set(userRef, {
      hearts: nextHearts,
      lastHeartRefillAt: currentHearts < maxHearts ? now.toISOString() : (userData.lastHeartRefillAt ?? now.toISOString()),
      updatedAt: now.toISOString(),
    }, { merge: true });

    if (hasRetryToken) {
      tx.set(retryRef, {
        itemId: 'retry-token',
        quantity: retryQuantity - 1,
        owned: retryQuantity - 1 > 0,
        updatedAt: now.toISOString(),
      }, { merge: true });
    }

    if (attemptRef) {
      tx.set(attemptRef, {
        attemptId: data?.attemptId,
        usedRetryToken: hasRetryToken,
        spentHeart: !hasRetryToken,
        createdAt: now.toISOString(),
      });
    }

    tx.set(db.doc(`users/${uid}/economyEvents/boss-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`), {
      type: hasRetryToken ? 'consume' : 'spend',
      amount: -1,
      currency: hasRetryToken ? 'retry-token' : 'hearts',
      source: 'boss-attempt',
      metadata: { attemptId: data?.attemptId },
      createdAt: now.toISOString(),
    });

    return {
      usedRetryToken: hasRetryToken,
      economy: {
        ...userData,
        hearts: nextHearts,
      },
    };
  });
}

export async function handleConsumeInventoryItem(uid: string, data: { itemId: string }) {
  if (!data || typeof data.itemId !== 'string') throw new Error('Invalid item ID');
  const itemRef = db.doc(`users/${uid}/inventory/${data.itemId}`);
  const now = new Date();

  return db.runTransaction(async tx => {
    const snap = await tx.get(itemRef);
    if (!snap.exists) throw new Error('Item not found in inventory');
    const itemData = snap.data() ?? {};
    const quantity = itemData.quantity ?? 0;
    if (quantity <= 0) throw new Error('No items remaining to consume');

    const nextQuantity = quantity - 1;
    tx.set(itemRef, {
      quantity: nextQuantity,
      owned: nextQuantity > 0 || itemData.owned === true,
      updatedAt: now.toISOString(),
    }, { merge: true });

    tx.set(db.doc(`users/${uid}/economyEvents/consume-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`), {
      type: 'consume',
      amount: -1,
      currency: data.itemId,
      source: 'inventory-use',
      createdAt: now.toISOString(),
    });

    return { success: true, itemId: data.itemId, quantity: nextQuantity };
  });
}

const QUEST_REWARDS: Record<string, { coins: number; XP: number; gems?: number }> = {
  'complete-lesson': { coins: 60, XP: 40 },
  'type-khmer-characters': { coins: 50, XP: 35 },
  'accuracy-target': { coins: 80, XP: 0, gems: 1 },
  'attempt-boss': { coins: 90, XP: 50, gems: 2 },
  'earn-3-stars': { coins: 70, XP: 45 },
};

export async function handleClaimDailyQuestReward(uid: string, data: { questId: string; date?: string }) {
  if (!data || typeof data.questId !== 'string') throw new Error('Invalid quest ID');
  const now = new Date();
  const date = data.date || now.toISOString().slice(0, 10);
  const questReward = QUEST_REWARDS[data.questId];
  if (!questReward) throw new Error('Unknown quest ID');

  const questDocRef = db.doc(`users/${uid}/dailyQuests/${date}`);
  const userRef = db.doc(`users/${uid}`);

  return db.runTransaction(async tx => {
    const [questSnap, userSnap] = await Promise.all([tx.get(questDocRef), tx.get(userRef)]);
    if (!questSnap.exists) throw new Error('No quests recorded for this date');
    const questData = questSnap.data() ?? {};
    const claimedRewards: string[] = Array.isArray(questData.claimedRewards) ? questData.claimedRewards : [];
    if (claimedRewards.includes(data.questId)) throw new Error('Already claimed.');

    const quests = questData.quests ?? {};
    const targetQuest = quests[data.questId] || quests[data.questId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())];
    if (targetQuest && targetQuest.progress < targetQuest.total) {
      throw new Error('Quest requirements not yet completed');
    }

    const userData = userSnap.data() ?? {};
    const nextCoins = (userData.coins ?? 0) + questReward.coins;
    const nextGems = (userData.gems ?? 0) + (questReward.gems ?? 0);
    const nextXP = (userData.typingXP ?? 0) + questReward.XP;
    const nextLevel = calculateLevelFromXP(nextXP);

    tx.set(userRef, {
      coins: nextCoins,
      gems: nextGems,
      typingXP: nextXP,
      level: nextLevel,
      updatedAt: now.toISOString(),
    }, { merge: true });

    tx.set(questDocRef, {
      claimedRewards: [...claimedRewards, data.questId],
      updatedAt: now.toISOString(),
    }, { merge: true });

    tx.set(db.doc(`users/${uid}/economyEvents/quest-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`), {
      type: 'claim',
      amount: questReward.coins + (questReward.gems ?? 0) + questReward.XP,
      currency: 'mixed',
      source: data.questId,
      metadata: questReward,
      createdAt: now.toISOString(),
    });

    return {
      success: true,
      reward: questReward,
      economy: {
        ...userData,
        coins: nextCoins,
        gems: nextGems,
        typingXP: nextXP,
        level: nextLevel,
      },
    };
  });
}

const KNOWN_ACHIEVEMENTS: Record<string, { coins?: number; gems?: number; XP?: number }> = {
  'first-steps': { coins: 50 },
  'accuracy-monk-economy': { gems: 1 },
  'no-mistake-warrior-economy': { coins: 100 },
  'streak-starter': { coins: 100 },
  'boss-challenger': { XP: 30 },
  'boss-victor': { gems: 2 },
};

export async function handleClaimAchievementReward(uid: string, data: { achievementId: string }) {
  if (!data || typeof data.achievementId !== 'string') throw new Error('Invalid achievement ID');
  const achRef = db.doc(`users/${uid}/achievements/${data.achievementId}`);
  const userRef = db.doc(`users/${uid}`);
  const now = new Date();

  return db.runTransaction(async tx => {
    const [achSnap, userSnap] = await Promise.all([tx.get(achRef), tx.get(userRef)]);
    if (!achSnap.exists) throw new Error('Achievement not found');
    const achData = achSnap.data() ?? {};
    if (!achData.unlocked) throw new Error('Achievement not unlocked');
    if (achData.rewardClaimed) throw new Error('Already claimed.');

    const reward = KNOWN_ACHIEVEMENTS[data.achievementId] ?? { coins: 50 };
    const userData = userSnap.data() ?? {};
    const nextCoins = (userData.coins ?? 0) + (reward.coins ?? 0);
    const nextGems = (userData.gems ?? 0) + (reward.gems ?? 0);
    const nextXP = (userData.typingXP ?? 0) + (reward.XP ?? 0);
    const nextLevel = calculateLevelFromXP(nextXP);

    tx.set(userRef, {
      coins: nextCoins,
      gems: nextGems,
      typingXP: nextXP,
      level: nextLevel,
      updatedAt: now.toISOString(),
    }, { merge: true });

    tx.set(achRef, {
      rewardClaimed: true,
      claimedAt: now.toISOString(),
    }, { merge: true });

    tx.set(db.doc(`users/${uid}/economyEvents/ach-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`), {
      type: 'claim',
      amount: (reward.coins ?? 0) + (reward.gems ?? 0) + (reward.XP ?? 0),
      currency: 'mixed',
      source: data.achievementId,
      metadata: reward,
      createdAt: now.toISOString(),
    });

    return {
      success: true,
      achievementId: data.achievementId,
      reward,
      economy: {
        ...userData,
        coins: nextCoins,
        gems: nextGems,
        typingXP: nextXP,
        level: nextLevel,
      },
    };
  });
}

export async function handleUpdateUserProfile(
  uid: string,
  data: {
    displayName?: string;
    equippedAvatarId?: string;
    equippedSkinId?: string;
    equippedThemeId?: string;
    equippedTitleId?: string;
    equippedFrameId?: string;
  },
) {
  if (!data || typeof data !== 'object') throw new Error('Invalid profile data');
  const now = new Date();
  const safeUpdates: Record<string, string> = {
    updatedAt: now.toISOString(),
  };

  if (typeof data.displayName === 'string') {
    const cleanName = data.displayName.trim().replace(/\s+/g, ' ');
    if (cleanName.length < 1 || cleanName.length > 40) throw new Error('Display name must be 1-40 characters');
    safeUpdates.displayName = cleanName;
  }
  for (const field of ['equippedAvatarId', 'equippedSkinId', 'equippedThemeId', 'equippedTitleId', 'equippedFrameId'] as const) {
    if (typeof data[field] === 'string') {
      const val = data[field]!.trim();
      if (/^[a-zA-Z0-9_-]{1,50}$/.test(val)) {
        safeUpdates[field] = val;
      }
    }
  }

  const userRef = db.doc(`users/${uid}`);
  await userRef.set(safeUpdates, { merge: true });

  if (safeUpdates.displayName) {
    await db.doc(`users/${uid}/profile/private`).set({
      lastNameChangeAt: now.toISOString(),
    }, { merge: true });
  }

  return { success: true, profile: safeUpdates };
}

export async function handleRefillHearts(uid: string) {
  const userRef = db.doc(`users/${uid}`);
  const now = new Date();

  return db.runTransaction(async tx => {
    const userSnap = await tx.get(userRef);
    const userData = userSnap.data() ?? {};
    const maxHearts = userData.maxHearts ?? 5;
    const currentHearts = userData.hearts ?? maxHearts;

    if (currentHearts >= maxHearts) {
      return { success: true, hearts: currentHearts, maxHearts };
    }

    const lastRefill = userData.lastHeartRefillAt ? Date.parse(userData.lastHeartRefillAt) : now.getTime();
    const elapsedMs = now.getTime() - lastRefill;
    const HEART_REFILL_MS = 30 * 60 * 1000;
    const recovered = Math.floor(elapsedMs / HEART_REFILL_MS);

    if (recovered <= 0) {
      return { success: true, hearts: currentHearts, maxHearts };
    }

    const nextHearts = Math.min(maxHearts, currentHearts + recovered);
    tx.set(userRef, {
      hearts: nextHearts,
      lastHeartRefillAt: nextHearts >= maxHearts ? now.toISOString() : new Date(lastRefill + recovered * HEART_REFILL_MS).toISOString(),
      updatedAt: now.toISOString(),
    }, { merge: true });

    return { success: true, hearts: nextHearts, maxHearts };
  });
}

// -----------------------------------------------------------------------------
// Cloud Functions v2 Callables
// -----------------------------------------------------------------------------

function requireAuthenticatedStudent(request: { auth?: { uid: string; token: { firebase?: { sign_in_provider?: string } } } }) {
  if (!request.auth || request.auth.token.firebase?.sign_in_provider === 'anonymous') {
    throw new HttpsError('unauthenticated', 'A student account is required');
  }
  return request.auth.uid;
}

export const submitLessonAttempt = onCall({ region: 'us-central1', maxInstances: 2 }, async request => {
  const uid = requireAuthenticatedStudent(request);
  try { return await commitAttempt(uid, request.data); }
  catch (error) { throw new HttpsError('failed-precondition', error instanceof Error ? error.message : 'Save failed'); }
});

export const purchaseShopItem = onCall({ region: 'us-central1', maxInstances: 2 }, async request => {
  const uid = requireAuthenticatedStudent(request);
  try { return await handlePurchaseShopItem(uid, request.data); }
  catch (error) { throw new HttpsError('failed-precondition', error instanceof Error ? error.message : 'Purchase failed'); }
});

export const prepareBossAttempt = onCall({ region: 'us-central1', maxInstances: 2 }, async request => {
  const uid = requireAuthenticatedStudent(request);
  try { return await handlePrepareBossAttempt(uid, request.data); }
  catch (error) { throw new HttpsError('failed-precondition', error instanceof Error ? error.message : 'Boss preparation failed'); }
});

export const consumeInventoryItem = onCall({ region: 'us-central1', maxInstances: 2 }, async request => {
  const uid = requireAuthenticatedStudent(request);
  try { return await handleConsumeInventoryItem(uid, request.data); }
  catch (error) { throw new HttpsError('failed-precondition', error instanceof Error ? error.message : 'Consumption failed'); }
});

export const claimDailyQuestReward = onCall({ region: 'us-central1', maxInstances: 2 }, async request => {
  const uid = requireAuthenticatedStudent(request);
  try { return await handleClaimDailyQuestReward(uid, request.data); }
  catch (error) { throw new HttpsError('failed-precondition', error instanceof Error ? error.message : 'Quest claim failed'); }
});

export const claimAchievementReward = onCall({ region: 'us-central1', maxInstances: 2 }, async request => {
  const uid = requireAuthenticatedStudent(request);
  try { return await handleClaimAchievementReward(uid, request.data); }
  catch (error) { throw new HttpsError('failed-precondition', error instanceof Error ? error.message : 'Achievement claim failed'); }
});

export const updateUserProfile = onCall({ region: 'us-central1', maxInstances: 2 }, async request => {
  const uid = requireAuthenticatedStudent(request);
  try { return await handleUpdateUserProfile(uid, request.data); }
  catch (error) { throw new HttpsError('failed-precondition', error instanceof Error ? error.message : 'Profile update failed'); }
});

export const refillHearts = onCall({ region: 'us-central1', maxInstances: 2 }, async request => {
  const uid = requireAuthenticatedStudent(request);
  try { return await handleRefillHearts(uid); }
  catch (error) { throw new HttpsError('failed-precondition', error instanceof Error ? error.message : 'Heart refill failed'); }
});
