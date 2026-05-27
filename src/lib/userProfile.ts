import type { AppSession } from './firebase';
import type { StudentProgress } from './studentProgress';

export const USER_PROFILE_STORAGE_KEY = 'khmer-typing-user-profile';
export const USER_PROFILE_EVENT = 'khmer-user-profile-change';

export type UserProfile = {
  displayName: string;
  avatar: string;
};

export const avatarChoices = ['ក', 'ខ', 'គ', '🌟', '🏆', '💎'];

const defaultProfile: UserProfile = {
  displayName: 'អ្នកលេង',
  avatar: avatarChoices[0],
};

function getStorage(): Storage | null {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

function emitProfileChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(USER_PROFILE_EVENT));
}

export function loadUserProfile(): UserProfile {
  const storage = getStorage();
  if (!storage) return defaultProfile;

  try {
    const saved = storage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!saved) return defaultProfile;
    const parsed = JSON.parse(saved) as Partial<UserProfile>;
    return {
      displayName: typeof parsed.displayName === 'string' && parsed.displayName.trim() ? parsed.displayName.trim() : defaultProfile.displayName,
      avatar: typeof parsed.avatar === 'string' && parsed.avatar.trim() ? parsed.avatar.trim() : defaultProfile.avatar,
    };
  } catch {
    return defaultProfile;
  }
}

export function saveUserProfile(profile: UserProfile) {
  const nextProfile = {
    displayName: profile.displayName.trim() || defaultProfile.displayName,
    avatar: profile.avatar.trim() || defaultProfile.avatar,
  };
  getStorage()?.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
  emitProfileChange();
  return nextProfile;
}

export function getSessionDisplayName(session: AppSession | null, progress?: StudentProgress) {
  const saved = loadUserProfile();
  const firebaseName = session?.user?.displayName?.trim();
  const emailName = session?.user?.email?.split('@')[0]?.trim();

  if (progress?.studentName) return progress.studentName;
  if (firebaseName) return firebaseName;
  if (emailName) return emailName;
  if (session?.mode === 'demo' || session?.user?.isAnonymous) return 'អ្នកលេង Guest';
  return saved.displayName;
}

export function getSessionAvatar(session: AppSession | null) {
  if (session?.user?.photoURL) return { kind: 'image' as const, value: session.user.photoURL };
  return { kind: 'text' as const, value: loadUserProfile().avatar };
}
