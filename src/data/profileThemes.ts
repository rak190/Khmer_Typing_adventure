import jungleThemeArt from '../assets/profile/theme-jungle.jpg';
import sunsetThemeArt from '../assets/profile/theme-sunset.jpg';
import nightSkyThemeArt from '../assets/profile/theme-night-sky.jpg';
import mysticRuinsThemeArt from '../assets/profile/theme-mystic-ruins.jpg';
import iceRealmThemeArt from '../assets/profile/theme-ice-realm.jpg';

export type ProfileThemeConfig = {
  id: string;
  name: string;
  artwork: string;
  legacyIds?: string[];
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
    name: 'Jungle',
    artwork: jungleThemeArt,
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
    name: 'Sunset',
    artwork: sunsetThemeArt,
    colors: {
      sky: '#2E1726',
      horizon: '#B55833',
      ground: '#3E2516',
      accent: '#FFB85A',
      glow: '#FFD08C',
    },
    defaultUnlocked: false,
    unlockRequirement: 'Unlock after completing 5 lessons.',
  },
  {
    id: 'crystal_cave',
    name: 'Night Sky',
    artwork: nightSkyThemeArt,
    colors: {
      sky: '#122045',
      horizon: '#3356A6',
      ground: '#1D2A55',
      accent: '#9BE7FF',
      glow: '#D8F7FF',
    },
    defaultUnlocked: false,
    unlockRequirement: 'Unlock after a 3-day streak.',
  },
  {
    id: 'mystic_ruins',
    name: 'Mystic Ruins',
    legacyIds: ['flame_keep'],
    artwork: mysticRuinsThemeArt,
    colors: {
      sky: '#071F2C',
      horizon: '#0D605D',
      ground: '#153D34',
      accent: '#45D6B9',
      glow: '#BDF7DE',
    },
    defaultUnlocked: false,
    unlockRequirement: 'Unlock after passing your first Boss Battle.',
  },
  {
    id: 'storm_citadel',
    name: 'Ice Realm',
    artwork: iceRealmThemeArt,
    colors: {
      sky: '#141C34',
      horizon: '#45547D',
      ground: '#1C263F',
      accent: '#D9C36A',
      glow: '#9FD5FF',
    },
    defaultUnlocked: false,
    unlockRequirement: 'Unlock at Level 15.',
  },
  {
    id: 'flame_keep_boss3',
    name: 'Flame Keep',
    artwork: sunsetThemeArt,
    colors: {
      sky: '#271011',
      horizon: '#8F2F1C',
      ground: '#341713',
      accent: '#FF8B3D',
      glow: '#FFD05C',
    },
    defaultUnlocked: false,
    unlockRequirement: 'Unlock after defeating 3 bosses.',
  },
  {
    id: 'golden_temple',
    name: 'Golden Temple',
    artwork: jungleThemeArt,
    colors: {
      sky: '#20150A',
      horizon: '#8A621B',
      ground: '#2B210E',
      accent: '#FFD76A',
      glow: '#FFF2A6',
    },
    defaultUnlocked: false,
    unlockRequirement: 'Unlock after 100% accuracy in any boss.',
  },
];

export const DEFAULT_THEME_ID = 'angkor_night';

export function getProfileTheme(themeId?: string) {
  return PROFILE_THEMES.find((theme) => theme.id === themeId || theme.legacyIds?.includes(themeId ?? '')) ?? PROFILE_THEMES[0];
}

export function resolveProfileThemeId(themeId?: string) {
  return getProfileTheme(themeId).id;
}
