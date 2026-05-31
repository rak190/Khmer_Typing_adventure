import { DEFAULT_AVATAR_ID, PROFILE_AVATARS, type AvatarCategory, type AvatarShapeType, type ProfileRarity } from './avatars';

export type ProfileAvatarConfig = {
  id: string;
  name: string;
  category: AvatarCategory;
  defaultUnlocked: boolean;
  unlockRequirement: string;
  rarity: ProfileRarity;
  avatarStyle: AvatarShapeType;
};

export const PROFILE_AVATAR_OPTIONS: ProfileAvatarConfig[] = PROFILE_AVATARS.map((avatar) => ({
  id: avatar.id,
  name: avatar.name,
  category: avatar.category,
  defaultUnlocked: avatar.ownedByDefault,
  unlockRequirement: avatar.unlockRequirement,
  rarity: avatar.rarity,
  avatarStyle: avatar.shapeType,
}));

export { DEFAULT_AVATAR_ID, PROFILE_AVATARS };
