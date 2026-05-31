import { DEFAULT_TITLE_ID, PLAYER_TITLES } from './playerTitles';

export type ProfileTitleConfig = {
  id: string;
  name: string;
  khmerName?: string;
  defaultUnlocked: boolean;
  unlockRequirement: string;
};

export const PROFILE_TITLES: ProfileTitleConfig[] = PLAYER_TITLES.map((title) => ({
  id: title.id,
  name: title.name,
  khmerName: title.khmerName,
  defaultUnlocked: title.ownedByDefault,
  unlockRequirement: title.unlockRequirement,
}));

export { DEFAULT_TITLE_ID, PLAYER_TITLES };
