import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { DEFAULT_AVATAR_ID, DEFAULT_FRAME_ID } from '../data/avatars';
import { DEFAULT_TITLE_ID } from '../data/playerTitles';
import { DEFAULT_SKIN_ID } from '../data/profileSkins';
import { DEFAULT_THEME_ID, PROFILE_THEMES, resolveProfileThemeId } from '../data/profileThemes';
import { db } from '../lib/firebase';
import { getActiveEconomyUserId, loadCachedInventory, type EconomyInventoryItem } from '../lib/economy';
import { USER_PROFILE_EVENT, USER_PROFILE_STORAGE_KEY } from '../lib/userProfile';

export const GAME_PROFILE_CACHE_KEY = 'khmer-typing-game-profile';

export type GameProfile = {
  displayName: string;
  equippedAvatarId: string;
  equippedSkinId: string;
  equippedThemeId: string;
  equippedTitleId: string;
  equippedFrameId: string;
  typingXP: number;
  level: number;
  unlockedAvatars: string[];
  unlockedTitles: string[];
  unlockedFrames: string[];
  unlockedThemes: string[];
  updatedAt?: string;
};

const defaultGameProfile: GameProfile = {
  displayName: 'Guest',
  equippedAvatarId: DEFAULT_AVATAR_ID,
  equippedSkinId: DEFAULT_SKIN_ID,
  equippedThemeId: DEFAULT_THEME_ID,
  equippedTitleId: DEFAULT_TITLE_ID,
  equippedFrameId: DEFAULT_FRAME_ID,
  typingXP: 0,
  level: 1,
  unlockedAvatars: [DEFAULT_AVATAR_ID],
  unlockedTitles: [DEFAULT_TITLE_ID],
  unlockedFrames: [DEFAULT_FRAME_ID],
  unlockedThemes: PROFILE_THEMES.filter((theme) => theme.defaultUnlocked).map((theme) => theme.id),
};

function getStorage(): Storage | null {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

function emitProfileChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(USER_PROFILE_EVENT));
}

function cacheKey(uid = getActiveEconomyUserId()) {
  return `${GAME_PROFILE_CACHE_KEY}:${uid ?? 'current'}`;
}

function cleanString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function cleanStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.trim()).map((item) => item.trim())))
    : fallback;
}

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return undefined;
}

export function normalizeGameProfile(value: Partial<GameProfile> = {}): GameProfile {
  const profile = {
    displayName: cleanString(value.displayName, defaultGameProfile.displayName),
    equippedAvatarId: cleanString(value.equippedAvatarId, defaultGameProfile.equippedAvatarId),
    equippedSkinId: cleanString(value.equippedSkinId, defaultGameProfile.equippedSkinId),
    equippedThemeId: resolveProfileThemeId(cleanString(value.equippedThemeId, defaultGameProfile.equippedThemeId)),
    equippedTitleId: cleanString(value.equippedTitleId, defaultGameProfile.equippedTitleId),
    equippedFrameId: cleanString(value.equippedFrameId, defaultGameProfile.equippedFrameId),
    typingXP: Math.max(0, Number(value.typingXP) || defaultGameProfile.typingXP),
    level: Math.max(1, Number(value.level) || defaultGameProfile.level),
    unlockedAvatars: cleanStringArray(value.unlockedAvatars, defaultGameProfile.unlockedAvatars),
    unlockedTitles: cleanStringArray(value.unlockedTitles, defaultGameProfile.unlockedTitles),
    unlockedFrames: cleanStringArray(value.unlockedFrames, defaultGameProfile.unlockedFrames),
    unlockedThemes: cleanStringArray(value.unlockedThemes, defaultGameProfile.unlockedThemes),
    updatedAt: timestampToIso(value.updatedAt),
  };

  return {
    ...profile,
    unlockedAvatars: Array.from(new Set([...defaultGameProfile.unlockedAvatars, ...profile.unlockedAvatars])),
    unlockedTitles: Array.from(new Set([...defaultGameProfile.unlockedTitles, ...profile.unlockedTitles])),
    unlockedFrames: Array.from(new Set([...defaultGameProfile.unlockedFrames, ...profile.unlockedFrames])),
    unlockedThemes: Array.from(new Set([...defaultGameProfile.unlockedThemes, ...profile.unlockedThemes])),
  };
}

export function loadCachedGameProfile(uid = getActiveEconomyUserId()) {
  const storage = getStorage();
  if (!storage) return defaultGameProfile;

  try {
    const saved = storage.getItem(cacheKey(uid));
    return saved ? normalizeGameProfile(JSON.parse(saved) as Partial<GameProfile>) : defaultGameProfile;
  } catch {
    return defaultGameProfile;
  }
}

function saveCachedGameProfile(profile: GameProfile, uid = getActiveEconomyUserId()) {
  const normalized = normalizeGameProfile(profile);
  const storage = getStorage();
  storage?.setItem(cacheKey(uid), JSON.stringify(normalized));
  storage?.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify({
    displayName: normalized.displayName,
    avatar: normalized.equippedAvatarId,
    skin: normalized.equippedSkinId,
    theme: normalized.equippedThemeId,
  }));
  emitProfileChange();
  return normalized;
}

function userRef(uid: string) {
  return db ? doc(db, 'users', uid) : null;
}

function privateProfileRef(uid: string) {
  return db ? doc(db, 'users', uid, 'profile', 'private') : null;
}

export async function getUserProfile(uid = getActiveEconomyUserId()) {
  if (!uid) return loadCachedGameProfile(uid);
  const ref = userRef(uid);
  if (!ref) return loadCachedGameProfile(uid);

  const snapshot = await getDoc(ref);
  const profile = normalizeGameProfile(snapshot.exists() ? snapshot.data() as Partial<GameProfile> : {});
  saveCachedGameProfile(profile, uid);
  return profile;
}

async function updateProfileFields(uid: string | undefined, fields: Partial<GameProfile>, privateFields?: Record<string, unknown>) {
  const userId = uid ?? getActiveEconomyUserId();
  const current = loadCachedGameProfile(userId);
  const next = saveCachedGameProfile({ ...current, ...fields, updatedAt: new Date().toISOString() }, userId);

  if (!userId) return next;
  const ref = userRef(userId);
  if (!ref) return next;

  await setDoc(ref, { ...fields, updatedAt: serverTimestamp() }, { merge: true });
  if (privateFields) {
    const privateRef = privateProfileRef(userId);
    if (privateRef) await setDoc(privateRef, privateFields, { merge: true });
  }
  return next;
}

export async function updateDisplayName(uid: string | undefined, name: string) {
  const displayName = name.trim().replace(/\s+/g, ' ');
  return updateProfileFields(uid, { displayName }, {
    lastNameChangeAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

export function saveProfile(uid: string | undefined, profile: Pick<GameProfile, 'displayName' | 'equippedAvatarId' | 'equippedSkinId' | 'equippedThemeId' | 'equippedTitleId'>) {
  return updateProfileFields(uid, {
    displayName: profile.displayName.trim().replace(/\s+/g, ' '),
    equippedAvatarId: profile.equippedAvatarId,
    equippedSkinId: profile.equippedSkinId,
    equippedThemeId: profile.equippedThemeId,
    equippedTitleId: profile.equippedTitleId,
  });
}

export function updateEquippedAvatar(uid: string | undefined, avatarId: string) {
  return updateProfileFields(uid, { equippedAvatarId: avatarId });
}

export function updateEquippedSkin(uid: string | undefined, skinId: string) {
  return updateProfileFields(uid, { equippedSkinId: skinId });
}

export function updateEquippedTheme(uid: string | undefined, themeId: string) {
  return updateProfileFields(uid, { equippedThemeId: themeId });
}

export function updateEquippedTitle(uid: string | undefined, titleId: string) {
  return updateProfileFields(uid, { equippedTitleId: titleId });
}

export function updateEquippedFrame(uid: string | undefined, frameId: string) {
  return updateProfileFields(uid, { equippedFrameId: frameId });
}

export async function getUnlockedAvatars(uid = getActiveEconomyUserId()) {
  const profile = await getUserProfile(uid);
  return profile.unlockedAvatars;
}

export async function getUnlockedTitles(uid = getActiveEconomyUserId()) {
  const profile = await getUserProfile(uid);
  return profile.unlockedTitles;
}

export async function getOwnedCosmetics(uid = getActiveEconomyUserId()): Promise<EconomyInventoryItem[]> {
  if (!uid) return loadCachedInventory(uid);
  if (!db) return loadCachedInventory(uid);

  const snapshot = await getDocs(collection(db, 'users', uid, 'inventory'));
  const inventory = snapshot.docs.map((item) => {
    const data = item.data() as Partial<EconomyInventoryItem>;
    return {
      itemId: data.itemId ?? item.id,
      quantity: Math.max(0, Number(data.quantity) || 0),
      owned: data.owned === true,
      updatedAt: timestampToIso(data.updatedAt),
    };
  });
  return inventory;
}

export function getDefaultGameProfile() {
  return defaultGameProfile;
}
