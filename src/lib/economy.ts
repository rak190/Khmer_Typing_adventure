import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  type Transaction,
} from 'firebase/firestore';
import { auth, db, getDemoSession, type AppSession } from './firebase';
import { countKhmerCharacters } from './khmerText';
import type { RewardAmount } from './playerFeatures';
import type { StudentLessonResult } from './studentProgress';

export const ECONOMY_CACHE_KEY = 'khmer-typing-economy-cache';
export const INVENTORY_CACHE_KEY = 'khmer-typing-inventory-cache';
export const REWARD_CLAIMS_CACHE_KEY = 'khmer-typing-reward-claims-cache';
export const DAILY_CLAIMS_CACHE_KEY = 'khmer-typing-daily-claims-cache';
export const ECONOMY_EVENT = 'khmer-economy-change';

const HEART_REFILL_MS = 30 * 60 * 1000;
const DEFAULT_MAX_HEARTS = 5;

export type EconomyCurrency = 'coins' | 'gems' | 'typingXP' | 'hearts';

export type EconomyState = {
  coins: number;
  gems: number;
  hearts: number;
  maxHearts: number;
  typingXP: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastPracticeDate?: string;
  lastHeartRefillAt?: string;
};

export type EconomyInventoryItem = {
  itemId: string;
  quantity: number;
  owned: boolean;
  updatedAt?: string;
};

export type ShopItem = {
  itemId: string;
  title: string;
  description: string;
  cost: number;
  currency: 'coins' | 'gems';
  consumable: boolean;
  effect: 'retry-token' | 'hint-scroll' | 'slow-time' | 'accuracy-shield' | 'streak-freeze' | 'cosmetic';
};

export type RewardCalculationInput = {
  mode: 'lesson' | 'boss' | 'challenge';
  accuracy: number;
  CPM: number;
  targetCPM: number;
  mistakes: number;
  stars: number;
  passed: boolean;
  score: number;
  previousBestScore?: number;
  currentStreak: number;
  worldId?: number | string;
  lessonId?: string;
};

export type CalculatedRewards = {
  coinsEarned: number;
  xpEarned: number;
  gemsEarned: number;
  heartChange: number;
  rewardReasons: string[];
};

export const shopItems: ShopItem[] = [
  {
    itemId: 'retry-token',
    title: 'សំបុត្រសាកម្តងទៀត',
    description: 'សាក Boss ម្តងដោយមិនចំណាយបេះដូង។',
    cost: 100,
    currency: 'coins',
    consumable: true,
    effect: 'retry-token',
  },
  {
    itemId: 'hint-scroll',
    title: 'ក្រដាសជំនួយ',
    description: 'រក្សាទុកសម្រាប់ជំនួយគ្រាប់ចុច/ម្រាមដៃខ្លាំងជាងមុន។',
    cost: 50,
    currency: 'coins',
    consumable: true,
    effect: 'hint-scroll',
  },
  {
    itemId: 'slow-time',
    title: 'បន្ថយពេល Boss',
    description: 'Power-up សម្រាប់បន្ថែមពេល Boss នៅពេលភ្ជាប់ពេញលេញ។',
    cost: 120,
    currency: 'coins',
    consumable: true,
    effect: 'slow-time',
  },
  {
    itemId: 'accuracy-shield',
    title: 'ខែលភាពត្រឹមត្រូវ',
    description: 'Power-up សម្រាប់ការពារកំហុសដំបូង នៅពេលភ្ជាប់ពេញលេញ។',
    cost: 150,
    currency: 'coins',
    consumable: true,
    effect: 'accuracy-shield',
  },
  {
    itemId: 'streak-freeze',
    title: 'ការពារ Streak',
    description: 'ការពារ streak ប្រសិនបើខកខានហាត់មួយថ្ងៃ។',
    cost: 200,
    currency: 'coins',
    consumable: true,
    effect: 'streak-freeze',
  },
  {
    itemId: 'keyboard-skin',
    title: 'ស្បែកក្តារចុច',
    description: 'គ្រឿងតុបតែងក្តារចុច សម្គាល់ថាបានទិញ។',
    cost: 300,
    currency: 'coins',
    consumable: false,
    effect: 'cosmetic',
  },
  {
    itemId: 'avatar-costume',
    title: 'សម្លៀកបំពាក់រូបគណនី',
    description: 'គ្រឿងតុបតែងរូបគណនី សម្គាល់ថាបានទិញ។',
    cost: 500,
    currency: 'coins',
    consumable: false,
    effect: 'cosmetic',
  },
];

const defaultEconomy: EconomyState = {
  coins: 0,
  gems: 0,
  hearts: DEFAULT_MAX_HEARTS,
  maxHearts: DEFAULT_MAX_HEARTS,
  typingXP: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  lastHeartRefillAt: new Date().toISOString(),
};

function getStorage(): Storage | null {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

function emitEconomyChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(ECONOMY_EVENT));
}

function cleanNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return undefined;
}

function normalizeEconomy(value: Partial<EconomyState> = {}): EconomyState {
  const typingXP = Math.max(0, cleanNumber(value.typingXP, defaultEconomy.typingXP));
  return {
    coins: Math.max(0, cleanNumber(value.coins, defaultEconomy.coins)),
    gems: Math.max(0, cleanNumber(value.gems, defaultEconomy.gems)),
    hearts: Math.max(0, cleanNumber(value.hearts, defaultEconomy.hearts)),
    maxHearts: Math.max(1, cleanNumber(value.maxHearts, DEFAULT_MAX_HEARTS)),
    typingXP,
    level: Math.max(1, cleanNumber(value.level, calculateLevelFromXP(typingXP))),
    streak: Math.max(0, cleanNumber(value.streak, 0)),
    longestStreak: Math.max(0, cleanNumber(value.longestStreak, 0)),
    lastPracticeDate: typeof value.lastPracticeDate === 'string' ? value.lastPracticeDate : undefined,
    lastHeartRefillAt: timestampToIso(value.lastHeartRefillAt) ?? defaultEconomy.lastHeartRefillAt,
  };
}

function cacheKey(userId?: string) {
  return `${ECONOMY_CACHE_KEY}:${userId ?? 'current'}`;
}

function inventoryCacheKey(userId?: string) {
  return `${INVENTORY_CACHE_KEY}:${userId ?? 'current'}`;
}

function dailyClaimsCacheKey(userId?: string) {
  return `${DAILY_CLAIMS_CACHE_KEY}:${userId ?? 'current'}`;
}

function rewardClaimsCacheKey(userId?: string) {
  return `${REWARD_CLAIMS_CACHE_KEY}:${userId ?? 'current'}`;
}

export function getActiveEconomyUserId(session?: AppSession | null) {
  return session?.userId ?? auth?.currentUser?.uid ?? getDemoSession()?.userId;
}

export function loadCachedEconomy(userId = getActiveEconomyUserId()): EconomyState {
  const storage = getStorage();
  if (!storage) return defaultEconomy;

  try {
    const saved = storage.getItem(cacheKey(userId));
    return saved ? normalizeEconomy(JSON.parse(saved) as Partial<EconomyState>) : defaultEconomy;
  } catch {
    return defaultEconomy;
  }
}

function saveCachedEconomy(economy: EconomyState, userId = getActiveEconomyUserId()) {
  getStorage()?.setItem(cacheKey(userId), JSON.stringify(economy));
  emitEconomyChange();
}

export function loadCachedInventory(userId = getActiveEconomyUserId()): EconomyInventoryItem[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const saved = storage.getItem(inventoryCacheKey(userId));
    if (!saved) return [];
    const parsed = JSON.parse(saved) as Partial<EconomyInventoryItem>[];
    return Array.isArray(parsed)
      ? parsed.flatMap((item) => item.itemId ? [{
          itemId: item.itemId,
          quantity: Math.max(0, cleanNumber(item.quantity, 0)),
          owned: item.owned === true,
          updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
        }] : [])
      : [];
  } catch {
    return [];
  }
}

function saveCachedInventory(items: EconomyInventoryItem[], userId = getActiveEconomyUserId()) {
  getStorage()?.setItem(inventoryCacheKey(userId), JSON.stringify(items));
  emitEconomyChange();
}

function readCachedSet(key: string) {
  try {
    const saved = getStorage()?.getItem(key);
    const parsed = saved ? JSON.parse(saved) as unknown : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
  } catch {
    return new Set<string>();
  }
}

function writeCachedSet(key: string, values: Set<string>) {
  getStorage()?.setItem(key, JSON.stringify(Array.from(values)));
  emitEconomyChange();
}

function userDoc(userId: string) {
  if (!db) return null;
  return doc(db, 'users', userId);
}

function inventoryDoc(userId: string, itemId: string) {
  if (!db) return null;
  return doc(db, 'users', userId, 'inventory', itemId);
}

function economyEventDoc(userId: string) {
  if (!db) return null;
  return doc(collection(db, 'users', userId, 'economyEvents'));
}

function lessonResultDoc(userId: string, resultId: string) {
  if (!db) return null;
  return doc(db, 'users', userId, 'lessonResults', resultId);
}

function rewardClaimDoc(userId: string, claimId: string) {
  if (!db) return null;
  return doc(db, 'users', userId, 'rewardClaims', claimId);
}

function dailyQuestDoc(userId: string, date: string) {
  if (!db) return null;
  return doc(db, 'users', userId, 'dailyQuests', date);
}

function achievementDoc(userId: string, achievementId: string) {
  if (!db) return null;
  return doc(db, 'users', userId, 'achievements', achievementId);
}

function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function differenceInDays(previousDate: string, currentDate: string) {
  const previous = Date.parse(`${previousDate}T00:00:00.000Z`);
  const current = Date.parse(`${currentDate}T00:00:00.000Z`);
  if (!Number.isFinite(previous) || !Number.isFinite(current)) return 0;
  return Math.round((current - previous) / 86400000);
}

function applyHeartRefill(state: EconomyState, now = new Date()) {
  const lastRefill = Date.parse(state.lastHeartRefillAt ?? now.toISOString());
  if (!Number.isFinite(lastRefill) || state.hearts >= state.maxHearts) {
    return {
      ...state,
      hearts: Math.min(state.hearts, state.maxHearts),
      lastHeartRefillAt: state.lastHeartRefillAt ?? now.toISOString(),
    };
  }

  const refillCount = Math.floor((now.getTime() - lastRefill) / HEART_REFILL_MS);
  if (refillCount <= 0) return state;

  const nextHearts = Math.min(state.maxHearts, state.hearts + refillCount);
  return {
    ...state,
    hearts: nextHearts,
    lastHeartRefillAt: nextHearts >= state.maxHearts
      ? now.toISOString()
      : new Date(lastRefill + refillCount * HEART_REFILL_MS).toISOString(),
  };
}

function applyLocalEconomy(updater: (economy: EconomyState) => EconomyState, userId = getActiveEconomyUserId()) {
  const next = updater(loadCachedEconomy(userId));
  saveCachedEconomy(next, userId);
  return next;
}

export async function ensureUserEconomy(userId: string, displayName?: string) {
  const ref = userDoc(userId);
  const cached = loadCachedEconomy(userId);
  if (!ref) return cached;

  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    const initial = normalizeEconomy(cached);
    await setDoc(ref, {
      displayName: displayName ?? null,
      ...initial,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    saveCachedEconomy(initial, userId);
    return initial;
  }

  const economy = normalizeEconomy(snapshot.data() as Partial<EconomyState>);
  saveCachedEconomy(economy, userId);
  return economy;
}

export function subscribeUserEconomy(userId: string) {
  const ref = userDoc(userId);
  if (!ref) {
    saveCachedEconomy(loadCachedEconomy(userId), userId);
    return () => undefined;
  }

  return onSnapshot(ref, (snapshot) => {
    const economy = snapshot.exists() ? normalizeEconomy(snapshot.data() as Partial<EconomyState>) : defaultEconomy;
    saveCachedEconomy(economy, userId);
  });
}

export async function getHeartState(userId = getActiveEconomyUserId()) {
  if (!userId) return loadCachedEconomy();
  await refillHeartsIfNeeded(userId);
  return loadCachedEconomy(userId);
}

export async function refillHeartsIfNeeded(userId = getActiveEconomyUserId()) {
  if (!userId) return loadCachedEconomy();
  const ref = userDoc(userId);
  const now = new Date();

  if (!ref) {
    return applyLocalEconomy((state) => applyHeartRefill(state, now), userId);
  }

  return runTransaction(db!, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = normalizeEconomy(snapshot.exists() ? snapshot.data() as Partial<EconomyState> : defaultEconomy);
    const next = applyHeartRefill(current, now);
    transaction.set(ref, {
      ...next,
      lastHeartRefillAt: next.lastHeartRefillAt,
      updatedAt: serverTimestamp(),
      createdAt: snapshot.exists() ? snapshot.data().createdAt ?? serverTimestamp() : serverTimestamp(),
    }, { merge: true });
    saveCachedEconomy(next, userId);
    return next;
  });
}

export async function canStartBoss(userId = getActiveEconomyUserId()) {
  const state = await getHeartState(userId);
  return state.hearts > 0;
}

export async function spendHeartForBoss(userId = getActiveEconomyUserId()) {
  if (!userId) throw new Error('Not enough hearts.');
  const ref = userDoc(userId);
  const now = new Date();

  if (!ref) {
    const state = applyHeartRefill(loadCachedEconomy(userId), now);
    if (state.hearts <= 0) throw new Error('Not enough hearts.');
    return applyLocalEconomy((current) => ({ ...current, hearts: Math.max(0, applyHeartRefill(current, now).hearts - 1) }), userId);
  }

  return runTransaction(db!, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = applyHeartRefill(normalizeEconomy(snapshot.exists() ? snapshot.data() as Partial<EconomyState> : defaultEconomy), now);
    if (current.hearts <= 0) throw new Error('Not enough hearts.');
    const next = { ...current, hearts: current.hearts - 1 };
    transaction.set(ref, { ...next, updatedAt: serverTimestamp() }, { merge: true });
    const eventRef = economyEventDoc(userId);
    if (eventRef) {
      transaction.set(eventRef, {
        type: 'spend',
        amount: -1,
        currency: 'hearts',
        source: 'boss-attempt',
        metadata: {},
        createdAt: serverTimestamp(),
      });
    }
    saveCachedEconomy(next, userId);
    return next;
  });
}

export function calculateLevelFromXP(totalXP: number) {
  const xp = Math.max(0, totalXP);
  const thresholds = [0, 100, 250, 450, 700];
  for (let index = thresholds.length - 1; index >= 0; index -= 1) {
    if (xp >= thresholds[index]) {
      if (index < thresholds.length - 1) return index + 1;
      break;
    }
  }

  let level = 5;
  let requirement = 700;
  let step = 350;
  while (xp >= requirement + step) {
    requirement += step;
    step = Math.round(step * 1.18);
    level += 1;
  }
  return level;
}

export function getStreakBonus(streak: number) {
  if (streak >= 14) return 0.15;
  if (streak >= 7) return 0.10;
  if (streak >= 3) return 0.05;
  return 0;
}

export function calculateRewards(input: RewardCalculationInput): CalculatedRewards {
  const rewardReasons: string[] = [];
  const improvedBest = typeof input.previousBestScore === 'number' && input.score > input.previousBestScore;
  const firstRecordedClear = input.previousBestScore === undefined || input.previousBestScore <= 0;
  const streakBonus = getStreakBonus(input.currentStreak);

  if (input.accuracy < 70) {
    rewardReasons.push('XP តិចសម្រាប់ការចូលរួម ព្រោះ accuracy ក្រោម 70%។');
    return {
      coinsEarned: input.passed ? 5 : 0,
      xpEarned: 5,
      gemsEarned: 0,
      heartChange: 0,
      rewardReasons,
    };
  }

  let coinsEarned = 0;
  let xpEarned = 0;
  let gemsEarned = 0;

  if (input.passed) {
    if (input.mode === 'boss') {
      coinsEarned += 100;
      xpEarned += 100;
      rewardReasons.push('+100 កាក់ និង +100 XP សម្រាប់ឆ្លង Boss។');
      if (input.worldId === 1 && firstRecordedClear) {
        gemsEarned += 2;
        rewardReasons.push('+2 ពេជ្រ សម្រាប់ឆ្លង Boss ពិភព 1។');
      }
      if (input.lessonId === 'w10-final-boss' && firstRecordedClear) {
        gemsEarned += 5;
        rewardReasons.push('+5 ពេជ្រ សម្រាប់ Final Boss។');
      }
    } else {
      coinsEarned += 20;
      xpEarned += 30;
      rewardReasons.push('+20 កាក់ និង +30 XP សម្រាប់ឆ្លងមេរៀន។');
    }
  } else {
    xpEarned += 5;
    rewardReasons.push('+5 XP សម្រាប់ការហាត់។');
  }

  if (input.stars >= 2) {
    coinsEarned += 10;
    rewardReasons.push('+10 កាក់ bonus សម្រាប់ 2 ផ្កាយ។');
  }
  if (input.stars >= 3) {
    coinsEarned += 25;
    rewardReasons.push('+25 កាក់ bonus សម្រាប់ 3 ផ្កាយ។');
  }
  if (input.accuracy >= 90) {
    xpEarned += 10;
    rewardReasons.push('+10 XP សម្រាប់ accuracy 90%+។');
  }
  if (input.accuracy >= 95) {
    xpEarned += 25;
    rewardReasons.push('+25 XP សម្រាប់ accuracy 95%+។');
  }
  if (input.accuracy === 100) {
    coinsEarned += 50;
    rewardReasons.push('+50 កាក់ សម្រាប់ accuracy 100%។');
  }
  if (input.CPM >= input.targetCPM) {
    xpEarned += 15;
    rewardReasons.push('+15 XP សម្រាប់ឈានដល់គោលដៅ CPM។');
  }
  if (input.mistakes === 0) {
    xpEarned += 30;
    rewardReasons.push('+30 XP សម្រាប់គ្មានកំហុស។');
  }
  if (improvedBest) {
    coinsEarned += 20;
    xpEarned += 10;
    rewardReasons.push('+20 កាក់ និង +10 XP សម្រាប់បំបែកពិន្ទុល្អបំផុត។');
  }
  if (streakBonus > 0) {
    const bonusXP = Math.round(xpEarned * streakBonus);
    xpEarned += bonusXP;
    rewardReasons.push(`+${bonusXP} XP bonus ពី streak។`);
  }

  return { coinsEarned, xpEarned, gemsEarned, heartChange: 0, rewardReasons };
}

function updateStreakFields(current: EconomyState, date = toDateKey()) {
  if (current.lastPracticeDate === date) return current;

  const gap = current.lastPracticeDate ? differenceInDays(current.lastPracticeDate, date) : 1;
  const nextStreak = gap === 1 ? current.streak + 1 : 1;

  return {
    ...current,
    streak: nextStreak,
    longestStreak: Math.max(current.longestStreak, nextStreak),
    lastPracticeDate: date,
  };
}

async function consumeInventoryInTransaction(
  transaction: Transaction,
  userId: string,
  itemId: string,
) {
  const itemRef = inventoryDoc(userId, itemId);
  if (!itemRef) return false;
  const snapshot = await transaction.get(itemRef);
  const quantity = snapshot.exists() ? cleanNumber(snapshot.data().quantity, 0) : 0;
  if (quantity <= 0) return false;
  transaction.set(itemRef, {
    itemId,
    quantity: quantity - 1,
    owned: quantity - 1 > 0 || snapshot.data().owned === true,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return true;
}

export async function updateStreakAfterPractice(userId = getActiveEconomyUserId()) {
  if (!userId) return loadCachedEconomy();
  const ref = userDoc(userId);
  const date = toDateKey();

  if (!ref) {
    return applyLocalEconomy((current) => updateStreakFields(current, date), userId);
  }

  return runTransaction(db!, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = normalizeEconomy(snapshot.exists() ? snapshot.data() as Partial<EconomyState> : defaultEconomy);
    let next = updateStreakFields(current, date);
    const gap = current.lastPracticeDate ? differenceInDays(current.lastPracticeDate, date) : 1;
    if (gap === 2 && current.lastPracticeDate && await consumeInventoryInTransaction(transaction, userId, 'streak-freeze')) {
      next = { ...current, streak: current.streak + 1, longestStreak: Math.max(current.longestStreak, current.streak + 1), lastPracticeDate: date };
    }
    transaction.set(ref, { ...next, level: calculateLevelFromXP(next.typingXP), updatedAt: serverTimestamp() }, { merge: true });
    saveCachedEconomy(next, userId);
    return next;
  });
}

export async function consumeStreakFreezeIfNeeded(userId = getActiveEconomyUserId()) {
  if (!userId) return false;
  return consumeInventoryItem(userId, 'streak-freeze');
}

export async function awardCoins(userId: string, amount: number, source: string) {
  return updateCurrency(userId, 'coins', Math.max(0, amount), source);
}

export async function spendCoins(userId: string, amount: number, source: string) {
  if (amount <= 0) return loadCachedEconomy(userId);
  const ref = userDoc(userId);
  if (!ref) {
    const current = loadCachedEconomy(userId);
    if (current.coins < amount) throw new Error('Not enough coins.');
    return applyLocalEconomy((state) => ({ ...state, coins: state.coins - amount }), userId);
  }

  return runTransaction(db!, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = normalizeEconomy(snapshot.exists() ? snapshot.data() as Partial<EconomyState> : defaultEconomy);
    if (current.coins < amount) throw new Error('Not enough coins.');
    const next = { ...current, coins: current.coins - amount };
    transaction.set(ref, { coins: next.coins, updatedAt: serverTimestamp() }, { merge: true });
    const eventRef = economyEventDoc(userId);
    if (eventRef) {
      transaction.set(eventRef, {
        type: 'spend',
        amount: -amount,
        currency: 'coins',
        source,
        metadata: {},
        createdAt: serverTimestamp(),
      });
    }
    saveCachedEconomy(next, userId);
    return next;
  });
}

export async function awardTypingXP(userId: string, amount: number, source: string) {
  return updateCurrency(userId, 'typingXP', Math.max(0, amount), source);
}

export async function updateLevelAfterXP(userId = getActiveEconomyUserId()) {
  if (!userId) return loadCachedEconomy();
  const ref = userDoc(userId);
  if (!ref) {
    return applyLocalEconomy((state) => ({ ...state, level: calculateLevelFromXP(state.typingXP) }), userId);
  }

  return runTransaction(db!, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = normalizeEconomy(snapshot.exists() ? snapshot.data() as Partial<EconomyState> : defaultEconomy);
    const next = { ...current, level: calculateLevelFromXP(current.typingXP) };
    transaction.set(ref, { level: next.level, updatedAt: serverTimestamp() }, { merge: true });
    saveCachedEconomy(next, userId);
    return next;
  });
}

async function updateCurrency(userId: string, currency: 'coins' | 'gems' | 'typingXP', amount: number, source: string) {
  const ref = userDoc(userId);
  if (!ref) {
    return applyLocalEconomy((state) => {
      const nextTypingXP = currency === 'typingXP' ? state.typingXP + amount : state.typingXP;
      return {
        ...state,
        [currency]: state[currency] + amount,
        typingXP: nextTypingXP,
        level: calculateLevelFromXP(nextTypingXP),
      };
    }, userId);
  }

  return runTransaction(db!, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = normalizeEconomy(snapshot.exists() ? snapshot.data() as Partial<EconomyState> : defaultEconomy);
    const nextTypingXP = currency === 'typingXP' ? current.typingXP + amount : current.typingXP;
    const next = {
      ...current,
      [currency]: current[currency] + amount,
      typingXP: nextTypingXP,
      level: calculateLevelFromXP(nextTypingXP),
    };
    transaction.set(ref, { [currency]: next[currency], typingXP: next.typingXP, level: next.level, updatedAt: serverTimestamp() }, { merge: true });
    const eventRef = economyEventDoc(userId);
    if (eventRef) {
      transaction.set(eventRef, {
        type: 'award',
        amount,
        currency,
        source,
        metadata: {},
        createdAt: serverTimestamp(),
      });
    }
    saveCachedEconomy(next, userId);
    return next;
  });
}

export async function purchaseShopItem(userId: string, itemId: string) {
  const item = shopItems.find((shopItem) => shopItem.itemId === itemId);
  if (!item) throw new Error('Shop item not found.');
  if (item.currency !== 'coins') throw new Error('Only coin purchases are active.');

  const userRef = userDoc(userId);
  const itemRef = inventoryDoc(userId, itemId);
  if (!userRef || !itemRef) {
    const current = loadCachedEconomy(userId);
    if (current.coins < item.cost) throw new Error('Not enough coins.');
    applyLocalEconomy((state) => ({ ...state, coins: state.coins - item.cost }), userId);
    const inventory = loadCachedInventory(userId);
    const existing = inventory.find((entry) => entry.itemId === itemId);
    const nextInventory = existing
      ? inventory.map((entry) => entry.itemId === itemId ? { ...entry, quantity: item.consumable ? entry.quantity + 1 : entry.quantity, owned: true, updatedAt: new Date().toISOString() } : entry)
      : [...inventory, { itemId, quantity: item.consumable ? 1 : 0, owned: true, updatedAt: new Date().toISOString() }];
    saveCachedInventory(nextInventory, userId);
    return { economy: loadCachedEconomy(userId), inventory: nextInventory };
  }

  const result = await runTransaction(db!, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    const current = normalizeEconomy(userSnapshot.exists() ? userSnapshot.data() as Partial<EconomyState> : defaultEconomy);
    if (current.coins < item.cost) throw new Error('Not enough coins.');

    const inventorySnapshot = await transaction.get(itemRef);
    const currentQuantity = inventorySnapshot.exists() ? cleanNumber(inventorySnapshot.data().quantity, 0) : 0;
    const nextQuantity = item.consumable ? currentQuantity + 1 : currentQuantity;
    const nextEconomy = { ...current, coins: current.coins - item.cost };

    transaction.set(userRef, { coins: nextEconomy.coins, updatedAt: serverTimestamp() }, { merge: true });
    transaction.set(itemRef, {
      itemId,
      quantity: nextQuantity,
      owned: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    const eventRef = economyEventDoc(userId);
    if (eventRef) {
      transaction.set(eventRef, {
        type: 'purchase',
        amount: -item.cost,
        currency: 'coins',
        source: itemId,
        metadata: { itemId },
        createdAt: serverTimestamp(),
      });
    }
    return {
      economy: nextEconomy,
      inventoryItem: {
        itemId,
        quantity: nextQuantity,
        owned: true,
        updatedAt: new Date().toISOString(),
      } satisfies EconomyInventoryItem,
    };
  });

  saveCachedEconomy(result.economy, userId);
  const currentInventory = loadCachedInventory(userId);
  const nextInventory = currentInventory.some((entry) => entry.itemId === itemId)
    ? currentInventory.map((entry) => entry.itemId === itemId ? result.inventoryItem : entry)
    : [...currentInventory, result.inventoryItem];
  saveCachedInventory(nextInventory, userId);
  return { economy: result.economy, inventory: nextInventory };
}

async function refreshInventoryCache(userId: string) {
  if (!db) return loadCachedInventory(userId);
  const snapshot = await getDocs(collection(db, 'users', userId, 'inventory'));
  const inventory = snapshot.docs.map((item) => {
    const data = item.data() as Partial<EconomyInventoryItem>;
    return {
      itemId: data.itemId ?? item.id,
      quantity: Math.max(0, cleanNumber(data.quantity, 0)),
      owned: data.owned === true,
      updatedAt: timestampToIso(data.updatedAt),
    };
  });
  saveCachedInventory(inventory, userId);
  return inventory;
}

export async function getInventory(userId = getActiveEconomyUserId()) {
  if (!userId) return [];
  if (!db) return loadCachedInventory(userId);
  return refreshInventoryCache(userId);
}

export async function consumeInventoryItem(userId: string, itemId: string) {
  const itemRef = inventoryDoc(userId, itemId);
  if (!itemRef) {
    const inventory = loadCachedInventory(userId);
    const existing = inventory.find((item) => item.itemId === itemId);
    if (!existing || existing.quantity <= 0) return false;
    saveCachedInventory(inventory.map((item) => item.itemId === itemId ? { ...item, quantity: item.quantity - 1 } : item), userId);
    return true;
  }

  return runTransaction(db!, async (transaction) => consumeInventoryInTransaction(transaction, userId, itemId));
}

export async function claimEconomyReward(userId: string, claimId: string, reward: RewardAmount, rewardType: string) {
  const claimKey = `${rewardType}:${claimId}`;
  const claimRef = rewardClaimDoc(userId, claimKey);
  const userRef = userDoc(userId);

  if (!claimRef || !userRef) {
    const claims = readCachedSet(rewardClaimsCacheKey(userId));
    if (claims.has(claimKey)) throw new Error('Already claimed.');
    claims.add(claimKey);
    writeCachedSet(rewardClaimsCacheKey(userId), claims);
    applyLocalEconomy((state) => {
      const typingXP = state.typingXP + (reward.XP ?? 0);
      return {
        ...state,
        coins: state.coins + (reward.coins ?? 0),
        gems: state.gems + (reward.gems ?? 0),
        typingXP,
        level: calculateLevelFromXP(typingXP),
      };
    }, userId);
    return loadCachedEconomy(userId);
  }

  return runTransaction(db!, async (transaction) => {
    const claimSnapshot = await transaction.get(claimRef);
    if (claimSnapshot.exists()) throw new Error('Already claimed.');
    const userSnapshot = await transaction.get(userRef);
    const current = normalizeEconomy(userSnapshot.exists() ? userSnapshot.data() as Partial<EconomyState> : defaultEconomy);
    const typingXP = current.typingXP + (reward.XP ?? 0);
    const next = {
      ...current,
      coins: current.coins + (reward.coins ?? 0),
      gems: current.gems + (reward.gems ?? 0),
      typingXP,
      level: calculateLevelFromXP(typingXP),
    };

    transaction.set(userRef, { ...next, updatedAt: serverTimestamp() }, { merge: true });
    transaction.set(claimRef, { rewardId: claimId, rewardType, claimedAt: serverTimestamp() });
    const eventRef = economyEventDoc(userId);
    if (eventRef) {
      transaction.set(eventRef, {
        type: 'claim',
        amount: (reward.coins ?? 0) + (reward.gems ?? 0) + (reward.XP ?? 0),
        currency: 'mixed',
        source: claimId,
        metadata: { rewardType, reward },
        createdAt: serverTimestamp(),
      });
    }
    saveCachedEconomy(next, userId);
    return next;
  });
}

export async function claimDailyQuestReward(userId: string, questId: string, reward: RewardAmount, date = toDateKey()) {
  const ref = dailyQuestDoc(userId, date);
  const userRef = userDoc(userId);
  if (!ref || !userRef) {
    const claims = readCachedSet(dailyClaimsCacheKey(userId));
    const key = `${date}:${questId}`;
    if (claims.has(key)) throw new Error('Already claimed.');
    claims.add(key);
    writeCachedSet(dailyClaimsCacheKey(userId), claims);
    return claimEconomyReward(userId, key, reward, 'dailyQuest');
  }

  return runTransaction(db!, async (transaction) => {
    const questSnapshot = await transaction.get(ref);
    const data = questSnapshot.exists() ? questSnapshot.data() as { claimedRewards?: string[] } : {};
    const claimedRewards = Array.isArray(data.claimedRewards) ? data.claimedRewards.filter((item): item is string => typeof item === 'string') : [];
    if (claimedRewards.includes(questId)) throw new Error('Already claimed.');

    const userSnapshot = await transaction.get(userRef);
    const current = normalizeEconomy(userSnapshot.exists() ? userSnapshot.data() as Partial<EconomyState> : defaultEconomy);
    const typingXP = current.typingXP + (reward.XP ?? 0);
    const next = {
      ...current,
      coins: current.coins + (reward.coins ?? 0),
      gems: current.gems + (reward.gems ?? 0),
      typingXP,
      level: calculateLevelFromXP(typingXP),
    };

    transaction.set(userRef, { ...next, updatedAt: serverTimestamp() }, { merge: true });
    transaction.set(ref, {
      date,
      claimedRewards: [...claimedRewards, questId],
      updatedAt: serverTimestamp(),
    }, { merge: true });
    const eventRef = economyEventDoc(userId);
    if (eventRef) {
      transaction.set(eventRef, {
        type: 'claim',
        amount: (reward.coins ?? 0) + (reward.gems ?? 0) + (reward.XP ?? 0),
        currency: 'mixed',
        source: questId,
        metadata: { reward },
        createdAt: serverTimestamp(),
      });
    }
    saveCachedEconomy(next, userId);
    return next;
  });
}

function resultMode(result: StudentLessonResult): 'lesson' | 'boss' | 'challenge' {
  if (result.difficulty === 'boss' || result.lessonId.includes('boss')) return 'boss';
  return 'lesson';
}

function resultDocId(result: StudentLessonResult) {
  return `${result.lessonId}-${Date.parse(result.completedAt) || Date.now()}`.replace(/[^\w-]/g, '-');
}

function dailyQuestProgressForResult(result: StudentLessonResult) {
  const isBoss = resultMode(result) === 'boss';
  const typedCharacters = countKhmerCharacters(result.targetText);

  return {
    completeLesson: {
      id: 'complete-lesson',
      progress: increment(!isBoss && result.passed ? 1 : 0),
      total: 1,
      reward: { coins: 60, XP: 40 },
    },
    typeKhmerCharacters: {
      id: 'type-khmer-characters',
      progress: increment(typedCharacters),
      total: 40,
      reward: { coins: 50, XP: 35 },
    },
    accuracyTarget: {
      id: 'accuracy-target',
      progress: increment(result.accuracy >= 95 ? 1 : 0),
      total: 1,
      reward: { coins: 80, gems: 1 },
    },
    attemptBoss: {
      id: 'attempt-boss',
      progress: increment(isBoss ? 1 : 0),
      total: 1,
      reward: { coins: 90, gems: 2, XP: 50 },
    },
    threeStars: {
      id: 'earn-3-stars',
      progress: increment(result.stars >= 3 ? 1 : 0),
      total: 1,
      reward: { coins: 70, XP: 45 },
    },
  };
}

function achievementRewardForResult(result: StudentLessonResult) {
  const rewards: Array<{ achievementId: string; progress: number; reward: RewardAmount }> = [];
  if (result.passed) rewards.push({ achievementId: 'first-steps', progress: 1, reward: { coins: 50 } });
  if (result.accuracy >= 95) rewards.push({ achievementId: 'accuracy-monk-economy', progress: 1, reward: { gems: 1 } });
  if (result.accuracy === 100 && result.mistakes === 0) rewards.push({ achievementId: 'no-mistake-warrior-economy', progress: 1, reward: { coins: 100 } });
  if (result.difficulty === 'boss' || result.lessonId.includes('boss')) rewards.push({ achievementId: 'boss-challenger', progress: 1, reward: { XP: 30 } });
  if ((result.difficulty === 'boss' || result.lessonId.includes('boss')) && result.passed) rewards.push({ achievementId: 'boss-victor', progress: 1, reward: { gems: 2 } });
  return rewards;
}

async function unlockAchievementsForResult(
  transaction: Transaction,
  userId: string,
  result: StudentLessonResult,
  current: EconomyState,
) {
  let next = current;
  const achievements = achievementRewardForResult(result);
  const achievementEntries = [];

  for (const achievement of achievements) {
    const ref = achievementDoc(userId, achievement.achievementId);
    if (!ref) continue;
    const snapshot = await transaction.get(ref);
    achievementEntries.push({ achievement, ref, snapshot });
  }

  const streakRef = next.streak >= 3 ? achievementDoc(userId, 'streak-starter') : null;
  const streakSnapshot = streakRef ? await transaction.get(streakRef) : null;

  for (const { achievement, ref, snapshot } of achievementEntries) {
    if (snapshot.exists() && snapshot.data().rewardClaimed === true) continue;

    const typingXP = next.typingXP + (achievement.reward.XP ?? 0);
    next = {
      ...next,
      coins: next.coins + (achievement.reward.coins ?? 0),
      gems: next.gems + (achievement.reward.gems ?? 0),
      typingXP,
      level: calculateLevelFromXP(typingXP),
    };
    transaction.set(ref, {
      achievementId: achievement.achievementId,
      unlocked: true,
      progress: achievement.progress,
      rewardClaimed: true,
      unlockedAt: serverTimestamp(),
    }, { merge: true });
  }
  if (streakRef && (!streakSnapshot?.exists() || streakSnapshot.data().rewardClaimed !== true)) {
    next = { ...next, coins: next.coins + 100 };
    transaction.set(streakRef, {
      achievementId: 'streak-starter',
      unlocked: true,
      progress: next.streak,
      rewardClaimed: true,
      unlockedAt: serverTimestamp(),
    }, { merge: true });
  }
  return next;
}

export async function saveCompletedResultToEconomy(result: StudentLessonResult, userId = getActiveEconomyUserId()) {
  if (!userId) return loadCachedEconomy();
  const userRef = userDoc(userId);
  const docId = resultDocId(result);
  const resultRef = lessonResultDoc(userId, docId);
  const date = toDateKey(new Date(result.completedAt));

  if (!userRef || !resultRef) {
    return applyLocalEconomy((state) => {
      const afterStreak = updateStreakFields(state, date);
      const typingXP = afterStreak.typingXP + result.XP;
      return {
        ...afterStreak,
        coins: afterStreak.coins + (result.coinsEarned ?? 0),
        gems: afterStreak.gems + (result.gemsEarned ?? 0),
        typingXP,
        level: calculateLevelFromXP(typingXP),
      };
    }, userId);
  }

  return runTransaction(db!, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    const current = normalizeEconomy(userSnapshot.exists() ? userSnapshot.data() as Partial<EconomyState> : defaultEconomy);
    let next = updateStreakFields(current, date);
    const gap = current.lastPracticeDate ? differenceInDays(current.lastPracticeDate, date) : 1;
    if (gap === 2 && current.lastPracticeDate && await consumeInventoryInTransaction(transaction, userId, 'streak-freeze')) {
      const streak = current.streak + 1;
      next = { ...current, streak, longestStreak: Math.max(current.longestStreak, streak), lastPracticeDate: date };
    }
    const typingXP = next.typingXP + result.XP;
    next = {
      ...next,
      coins: next.coins + (result.coinsEarned ?? 0),
      gems: next.gems + (result.gemsEarned ?? 0),
      typingXP,
      level: calculateLevelFromXP(typingXP),
    };
    next = await unlockAchievementsForResult(transaction, userId, result, next);

    transaction.set(userRef, { ...next, updatedAt: serverTimestamp() }, { merge: true });
    transaction.set(resultRef, {
      lessonId: result.lessonId,
      mode: resultMode(result),
      worldId: result.worldId,
      skillFocus: result.skillFocus,
      accuracy: result.accuracy,
      cpm: result.CPM,
      wpm: result.WPM,
      mistakes: result.mistakes,
      backspaces: result.backspaces,
      stars: result.stars,
      passed: result.passed,
      xpEarned: result.XP,
      coinsEarned: result.coinsEarned ?? 0,
      gemsEarned: result.gemsEarned ?? 0,
      rewardReasons: result.rewardReasons ?? [],
      completedAt: result.completedAt,
      createdAt: serverTimestamp(),
    });
    const dailyRef = dailyQuestDoc(userId, date);
    if (dailyRef) {
      transaction.set(dailyRef, {
        date,
        quests: dailyQuestProgressForResult(result),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    const eventRef = economyEventDoc(userId);
    if (eventRef) {
      transaction.set(eventRef, {
        type: 'lessonReward',
        amount: (result.coinsEarned ?? 0) + result.XP + (result.gemsEarned ?? 0),
        currency: 'mixed',
        source: result.lessonId,
        metadata: { coins: result.coinsEarned ?? 0, XP: result.XP, gems: result.gemsEarned ?? 0 },
        createdAt: serverTimestamp(),
      });
    }
    saveCachedEconomy(next, userId);
    return next;
  });
}

export async function prepareBossAttempt(userId = getActiveEconomyUserId()) {
  if (!userId) throw new Error('Not enough hearts.');
  const usedRetryToken = await consumeInventoryItem(userId, 'retry-token');
  if (usedRetryToken) return { usedRetryToken: true, economy: loadCachedEconomy(userId) };
  const economy = await spendHeartForBoss(userId);
  return { usedRetryToken: false, economy };
}

export function getInventoryQuantity(inventory: EconomyInventoryItem[], itemId: string) {
  return inventory.find((item) => item.itemId === itemId)?.quantity ?? 0;
}
