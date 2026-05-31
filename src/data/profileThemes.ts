export type ProfileThemeConfig = {
  id: string;
  name: string;
  colors: {
    sky: string;
    horizon: string;
    ground: string;
    accent: string;
    glow: string;
  };
  defaultUnlocked: boolean;
  unlockRequirement: string;
};

export const PROFILE_THEMES: ProfileThemeConfig[] = [
  {
    id: 'angkor_night',
    name: 'Angkor Night',
    colors: {
      sky: '#09182C',
      horizon: '#183E56',
      ground: '#223719',
      accent: '#F4C85D',
      glow: '#74D7F3',
    },
    defaultUnlocked: true,
    unlockRequirement: 'Unlocked by default.',
  },
  {
    id: 'forest_realm',
    name: 'Forest Realm',
    colors: {
      sky: '#0D2A24',
      horizon: '#1B6A4B',
      ground: '#14371F',
      accent: '#87E05B',
      glow: '#D9FF9C',
    },
    defaultUnlocked: true,
    unlockRequirement: 'Unlocked by default.',
  },
  {
    id: 'crystal_cave',
    name: 'Crystal Cave',
    colors: {
      sky: '#122045',
      horizon: '#3356A6',
      ground: '#1D2A55',
      accent: '#9BE7FF',
      glow: '#D8F7FF',
    },
    defaultUnlocked: true,
    unlockRequirement: 'Unlocked by default.',
  },
  {
    id: 'flame_keep',
    name: 'Flame Keep',
    colors: {
      sky: '#2B1110',
      horizon: '#7B2D16',
      ground: '#3B1D0E',
      accent: '#FFB048',
      glow: '#FFE38C',
    },
    defaultUnlocked: true,
    unlockRequirement: 'Unlocked by default.',
  },
  {
    id: 'jade_palace',
    name: 'Jade Palace',
    colors: {
      sky: '#082A2B',
      horizon: '#0F8A78',
      ground: '#154B3B',
      accent: '#A7F06E',
      glow: '#D7FFBE',
    },
    defaultUnlocked: false,
    unlockRequirement: 'Reach a 7-day streak.',
  },
  {
    id: 'storm_citadel',
    name: 'Storm Citadel',
    colors: {
      sky: '#141C34',
      horizon: '#45547D',
      ground: '#1C263F',
      accent: '#D9C36A',
      glow: '#9FD5FF',
    },
    defaultUnlocked: false,
    unlockRequirement: 'Pass your first Boss Battle.',
  },
];

export const DEFAULT_THEME_ID = 'angkor_night';

export function getProfileTheme(themeId?: string) {
  return PROFILE_THEMES.find((theme) => theme.id === themeId) ?? PROFILE_THEMES[0];
}
