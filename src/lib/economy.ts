import { calculateLevelFromXP } from './rewardPolicy';
export { calculateLevelFromXP, calculateRewards, getStreakBonus } from './rewardPolicy';
export type { RewardCalculationInput, CalculatedRewards } from './rewardPolicy';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, getDemoSession, type AppSession } from './firebase';
import type { RewardAmount } from './playerFeatures';
import type { StudentLessonResult } from './studentProgress';
import { SHOP_ITEMS, type ShopItemEffect } from '../data/shopItems';

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
  effect: ShopItemEffect;
};

export const shopItems: ShopItem[] = SHOP_ITEMS
  .filter((item) => !item.comingSoon)
  .map((item) => ({
    itemId: item.id,
    title: `${item.khmerName} / ${item.name}`,
    description: item.description,
    cost: item.price,
    currency: item.currency,
    consumable: item.type === 'powerup' || item.type === 'heart',
    effect: item.effect,
  }));

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

export function isOnlineBackendAvailable(userId?: string): boolean {
  const allowOnline =
    import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' ||
    (import.meta.env.VITE_FIREBASE_STAGE === 'staging' && Boolean(functions));
  return Boolean(
    allowOnline &&
    functions &&
    auth?.currentUser?.uid &&
    (!userId || auth.currentUser.uid === userId)
  );
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

export function loadCachedRewardClaimIds(rewardType: string, userId = getActiveEconomyUserId()) {
  return Array.from(readCachedSet(rewardClaimsCacheKey(userId)))
    .filter((key) => key.startsWith(`${rewardType}:`))
    .map((key) => key.slice(rewardType.length + 1));
}

function addCachedRewardClaim(userId: string, rewardType: string, claimId: string) {
  const claims = readCachedSet(rewardClaimsCacheKey(userId));
  claims.add(`${rewardType}:${claimId}`);
  writeCachedSet(rewardClaimsCacheKey(userId), claims);
}

export function loadCachedDailyQuestClaimIds(date = toDateKey(), userId = getActiveEconomyUserId()) {
  return Array.from(readCachedSet(dailyClaimsCacheKey(userId)))
    .filter((key) => key.startsWith(`${date}:`))
    .map((key) => key.slice(date.length + 1));
}

function addCachedDailyQuestClaim(userId: string, date: string, questId: string) {
  const claims = readCachedSet(dailyClaimsCacheKey(userId));
  claims.add(`${date}:${questId}`);
  writeCachedSet(dailyClaimsCacheKey(userId), claims);
}

function userDoc(userId: string) {
  if (!db) return null;
  return doc(db, 'users', userId);
}











function dailyQuestDoc(userId: string, date: string) {
  if (!db) return null;
  return doc(db, 'users', userId, 'dailyQuests', date);
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
  void displayName;
  const ref = userDoc(userId);
  const cached = loadCachedEconomy(userId);
  if (!ref) return cached;

  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return cached;

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
  }, (error) => {
    console.error('Unable to sync user economy from Firebase.', error);
    saveCachedEconomy(loadCachedEconomy(userId), userId);
  });
}

export async function getHeartState(userId = getActiveEconomyUserId()) {
  if (!userId) return loadCachedEconomy();
  await refillHeartsIfNeeded(userId);
  return loadCachedEconomy(userId);
}

export async function refillHeartsIfNeeded(userId = getActiveEconomyUserId()) {
  if (!userId) return loadCachedEconomy();

  if (isOnlineBackendAvailable(userId)) {
    try {
      const callable = httpsCallable<void, { success: boolean; hearts: number; maxHearts: number }>(functions!, 'refillHearts');
      const response = await callable();
      if (response.data?.hearts !== undefined) {
        const cached = loadCachedEconomy(userId);
        const next = { ...cached, hearts: response.data.hearts, maxHearts: response.data.maxHearts ?? cached.maxHearts };
        saveCachedEconomy(next, userId);
        return next;
      }
    } catch (err) {
      console.warn('Backend refill hearts check failed:', err);
    }
  }

  const now = new Date();
  return applyLocalEconomy((state) => applyHeartRefill(state, now), userId);
}

export async function canStartBoss(userId = getActiveEconomyUserId()) {
  const state = await getHeartState(userId);
  return state.hearts > 0;
}

export async function spendHeartForBoss(userId = getActiveEconomyUserId()): Promise<EconomyState> {
  if (!userId) throw new Error('Not enough hearts.');
  if (isOnlineBackendAvailable(userId)) {
    const result = await prepareBossAttempt(userId);
    return result.economy;
  }
  const now = new Date();
  const state = applyHeartRefill(loadCachedEconomy(userId), now);
  if (state.hearts <= 0) throw new Error('Not enough hearts.');
  return applyLocalEconomy((current) => ({ ...current, hearts: Math.max(0, applyHeartRefill(current, now).hearts - 1) }), userId);
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



export async function updateStreakAfterPractice(userId = getActiveEconomyUserId()) {
  if (!userId) return loadCachedEconomy();
  const date = toDateKey();
  return applyLocalEconomy((current) => updateStreakFields(current, date), userId);
}

export async function consumeStreakFreezeIfNeeded(userId = getActiveEconomyUserId()) {
  if (!userId) return false;
  return consumeInventoryItem(userId, 'streak-freeze');
}

export async function awardCoins(userId: string, amount: number, source: string) {
  return updateCurrency(userId, 'coins', Math.max(0, amount), source);
}

export async function spendCoins(userId: string, amount: number, source: string) {
  void source;
  if (amount <= 0) return loadCachedEconomy(userId);
  const current = loadCachedEconomy(userId);
  if (current.coins < amount) throw new Error('Not enough coins.');
  return applyLocalEconomy((state) => ({ ...state, coins: state.coins - amount }), userId);
}

export async function awardTypingXP(userId: string, amount: number, source: string) {
  return updateCurrency(userId, 'typingXP', Math.max(0, amount), source);
}

export async function updateLevelAfterXP(userId = getActiveEconomyUserId()) {
  if (!userId) return loadCachedEconomy();
  return applyLocalEconomy((state) => ({ ...state, level: calculateLevelFromXP(state.typingXP) }), userId);
}

async function updateCurrency(userId: string, currency: 'coins' | 'gems' | 'typingXP', amount: number, source: string) {
  void source;
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

type PurchaseShopItemOptions = {
  priceOverride?: number;
  source?: string;
};

function purchaseCost(item: ShopItem, options?: PurchaseShopItemOptions) {
  const cost = options?.priceOverride ?? item.cost;
  return Math.max(0, Math.floor(cleanNumber(cost, item.cost)));
}

function notEnoughCurrencyMessage(currency: ShopItem['currency']) {
  return currency === 'coins' ? 'Not enough coins.' : 'Not enough gems.';
}

export async function purchaseShopItem(userId: string, itemId: string, options?: PurchaseShopItemOptions) {
  const sourceItem = SHOP_ITEMS.find((shopItem) => shopItem.id === itemId);
  if (sourceItem?.comingSoon) throw new Error('Coming soon.');
  const item = shopItems.find((shopItem) => shopItem.itemId === itemId);
  if (!item) throw new Error('Shop item not found.');
  const cost = purchaseCost(item, options);

  if (isOnlineBackendAvailable(userId)) {
    const callable = httpsCallable<{ itemId: string }, {
      success: boolean;
      economy: Partial<EconomyState>;
      inventoryItem: EconomyInventoryItem;
    }>(functions!, 'purchaseShopItem');
    const response = await callable({ itemId });
    const nextEconomy = normalizeEconomy(response.data.economy);
    saveCachedEconomy(nextEconomy, userId);
    const currentInventory = loadCachedInventory(userId);
    const updated = response.data.inventoryItem;
    const nextInventory = currentInventory.some((entry) => entry.itemId === itemId)
      ? currentInventory.map((entry) => entry.itemId === itemId ? updated : entry)
      : [...currentInventory, updated];
    saveCachedInventory(nextInventory, userId);
    return { economy: nextEconomy, inventory: nextInventory };
  }

  const current = loadCachedEconomy(userId);
  if (current[item.currency] < cost) throw new Error(notEnoughCurrencyMessage(item.currency));
  const inventory = loadCachedInventory(userId);
  const existing = inventory.find((entry) => entry.itemId === itemId);
  if (!item.consumable && existing?.owned === true) throw new Error('Already owned.');
  applyLocalEconomy((state) => ({ ...state, [item.currency]: Math.max(0, state[item.currency] - cost) }), userId);
  const nextInventory = existing
    ? inventory.map((entry) => entry.itemId === itemId ? { ...entry, quantity: item.consumable ? entry.quantity + 1 : entry.quantity, owned: true, updatedAt: new Date().toISOString() } : entry)
    : [...inventory, { itemId, quantity: item.consumable ? 1 : 0, owned: true, updatedAt: new Date().toISOString() }];
  saveCachedInventory(nextInventory, userId);
  return { economy: loadCachedEconomy(userId), inventory: nextInventory };
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

async function refreshRewardClaimCache(userId: string) {
  if (!db) return Array.from(readCachedSet(rewardClaimsCacheKey(userId)));
  const snapshot = await getDocs(collection(db, 'users', userId, 'rewardClaims'));
  const claims = new Set(snapshot.docs.map((item) => item.id));
  writeCachedSet(rewardClaimsCacheKey(userId), claims);
  return Array.from(claims);
}

async function refreshDailyQuestClaimCache(userId: string, date = toDateKey()) {
  const ref = dailyQuestDoc(userId, date);
  if (!ref) return loadCachedDailyQuestClaimIds(date, userId);
  const snapshot = await getDoc(ref);
  const data = snapshot.exists() ? snapshot.data() as { claimedRewards?: unknown } : {};
  const claimedRewards = Array.isArray(data.claimedRewards)
    ? data.claimedRewards.filter((item): item is string => typeof item === 'string')
    : [];
  const claims = readCachedSet(dailyClaimsCacheKey(userId));
  Array.from(claims).forEach((key) => {
    if (key.startsWith(`${date}:`)) claims.delete(key);
  });
  claimedRewards.forEach((questId) => claims.add(`${date}:${questId}`));
  writeCachedSet(dailyClaimsCacheKey(userId), claims);
  return claimedRewards;
}

export async function getInventory(userId = getActiveEconomyUserId()) {
  if (!userId) return [];
  if (!db) return loadCachedInventory(userId);
  return refreshInventoryCache(userId);
}

export async function getRewardClaimIds(rewardType: string, userId = getActiveEconomyUserId()) {
  if (!userId) return [];
  await refreshRewardClaimCache(userId);
  return loadCachedRewardClaimIds(rewardType, userId);
}

export async function getDailyQuestClaimIds(date = toDateKey(), userId = getActiveEconomyUserId()) {
  if (!userId) return [];
  await refreshDailyQuestClaimCache(userId, date);
  return loadCachedDailyQuestClaimIds(date, userId);
}

export async function consumeInventoryItem(userId: string, itemId: string) {
  if (isOnlineBackendAvailable(userId)) {
    try {
      const callable = httpsCallable<{ itemId: string }, { success: boolean; itemId: string; quantity: number }>(functions!, 'consumeInventoryItem');
      const response = await callable({ itemId });
      const inventory = loadCachedInventory(userId);
      const nextInventory = inventory.map((item) =>
        item.itemId === itemId ? { ...item, quantity: response.data.quantity, owned: response.data.quantity > 0 } : item
      );
      saveCachedInventory(nextInventory, userId);
      return true;
    } catch (err) {
      console.warn('Backend consume inventory item failed:', err);
      return false;
    }
  }

  const inventory = loadCachedInventory(userId);
  const existing = inventory.find((item) => item.itemId === itemId);
  if (!existing || existing.quantity <= 0) return false;
  saveCachedInventory(inventory.map((item) => item.itemId === itemId ? { ...item, quantity: item.quantity - 1 } : item), userId);
  return true;
}

export async function claimEconomyReward(userId: string, claimId: string, reward: RewardAmount, rewardType: string) {
  if (rewardType === 'achievement' && isOnlineBackendAvailable(userId)) {
    const callable = httpsCallable<{ achievementId: string }, { success: boolean; reward: RewardAmount; economy: Partial<EconomyState> }>(functions!, 'claimAchievementReward');
    const response = await callable({ achievementId: claimId });
    const nextEconomy = normalizeEconomy(response.data.economy);
    saveCachedEconomy(nextEconomy, userId);
    addCachedRewardClaim(userId, rewardType, claimId);
    return nextEconomy;
  }

  const claimKey = `${rewardType}:${claimId}`;
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

export async function claimDailyQuestReward(userId: string, questId: string, reward: RewardAmount, date = toDateKey()) {
  if (isOnlineBackendAvailable(userId)) {
    const callable = httpsCallable<{ questId: string; date?: string }, { success: boolean; reward: RewardAmount; economy: Partial<EconomyState> }>(functions!, 'claimDailyQuestReward');
    const response = await callable({ questId, date });
    const nextEconomy = normalizeEconomy(response.data.economy);
    saveCachedEconomy(nextEconomy, userId);
    addCachedDailyQuestClaim(userId, date, questId);
    return nextEconomy;
  }

  const claims = readCachedSet(dailyClaimsCacheKey(userId));
  const key = `${date}:${questId}`;
  if (claims.has(key)) throw new Error('Already claimed.');
  claims.add(key);
  writeCachedSet(dailyClaimsCacheKey(userId), claims);
  return claimEconomyReward(userId, key, reward, 'dailyQuest');
}


function resultDocId(result: StudentLessonResult) {
  return `${result.lessonId}-${Date.parse(result.completedAt) || Date.now()}`.replace(/[^\w-]/g, '-');
}







export async function saveCompletedResultToEconomy(result: StudentLessonResult, userId = getActiveEconomyUserId()) {
  if (!userId) return loadCachedEconomy();
  const docId = resultDocId(result);
  const date = toDateKey(new Date(result.completedAt));

  const claims = readCachedSet(rewardClaimsCacheKey(userId));
  const resultClaimKey = `result:${docId}`;
  if (claims.has(resultClaimKey)) return loadCachedEconomy(userId);
  claims.add(resultClaimKey);
  writeCachedSet(rewardClaimsCacheKey(userId), claims);

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

export async function prepareBossAttempt(userId = getActiveEconomyUserId(), attemptId?: string): Promise<{ usedRetryToken: boolean; economy: EconomyState }> {
  if (!userId) throw new Error('Not enough hearts.');

  if (isOnlineBackendAvailable(userId)) {
    const callable = httpsCallable<{ attemptId?: string }, {
      usedRetryToken: boolean;
      economy: Partial<EconomyState>;
    }>(functions!, 'prepareBossAttempt');
    const response = await callable({ attemptId });
    const nextEconomy = normalizeEconomy(response.data.economy);
    saveCachedEconomy(nextEconomy, userId);
    if (response.data.usedRetryToken) {
      const inventory = loadCachedInventory(userId);
      const retryItem = inventory.find((item) => item.itemId === 'retry-token');
      const retryQty = Math.max(0, (retryItem?.quantity ?? 1) - 1);
      const nextInventory = inventory.map((item) =>
        item.itemId === 'retry-token' ? { ...item, quantity: retryQty, owned: retryQty > 0 } : item
      );
      saveCachedInventory(nextInventory, userId);
    }
    return { usedRetryToken: response.data.usedRetryToken, economy: nextEconomy };
  }

  const attemptKey = attemptId ? `boss-attempt:${attemptId}` : undefined;
  const attemptRetryKey = attemptId ? `boss-attempt-retry:${attemptId}` : undefined;
  if (attemptKey) {
    const claims = readCachedSet(rewardClaimsCacheKey(userId));
    if (claims.has(attemptKey)) return { usedRetryToken: attemptRetryKey ? claims.has(attemptRetryKey) : false, economy: loadCachedEconomy(userId) };
  }

  const usedRetryToken = await consumeInventoryItem(userId, 'retry-token');
  if (usedRetryToken) {
    if (attemptKey) {
      const claims = readCachedSet(rewardClaimsCacheKey(userId));
      claims.add(attemptKey);
      if (attemptRetryKey) claims.add(attemptRetryKey);
      writeCachedSet(rewardClaimsCacheKey(userId), claims);
    }
    return { usedRetryToken: true, economy: loadCachedEconomy(userId) };
  }
  const economy = await spendHeartForBoss(userId);
  if (attemptKey) {
    const claims = readCachedSet(rewardClaimsCacheKey(userId));
    claims.add(attemptKey);
    writeCachedSet(rewardClaimsCacheKey(userId), claims);
  }
  return { usedRetryToken: false, economy };
}

export function getInventoryQuantity(inventory: EconomyInventoryItem[], itemId: string) {
  return inventory.find((item) => item.itemId === itemId)?.quantity ?? 0;
}
