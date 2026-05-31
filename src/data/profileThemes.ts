import jungleThemeArt from '../assets/profile/theme-jungle.jpg';
import sunsetThemeArt from '../assets/profile/theme-sunset.jpg';
import nightSkyThemeArt from '../assets/profile/theme-night-sky.jpg';
import mysticRuinsThemeArt from '../assets/profile/theme-mystic-ruins.jpg';
import iceRealmThemeArt from '../assets/profile/theme-ice-realm.jpg';

export type ProfileThemeConfig = {
  id: string;
  name: string;
  artwork: string;
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
    defaultUnlocked: true,
    unlockRequirement: 'Unlocked by default.',
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
    defaultUnlocked: true,
    unlockRequirement: 'Unlocked by default.',
  },
  {
    id: 'flame_keep',
    name: 'Mystic Ruins',
    artwork: mysticRuinsThemeArt,
    colors: {
      sky: '#071F2C',
      horizon: '#0D605D',
      ground: '#153D34',
      accent: '#45D6B9',
      glow: '#BDF7DE',
    },
    defaultUnlocked: true,
    unlockRequirement: 'Unlocked by default.',
  },
  {
    id: 'jade_palace',
    name: 'Jade Palace',
    artwork: mysticRuinsThemeArt,
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
    unlockRequirement: 'Pass your first Boss Battle.',
  },
];

export const DEFAULT_THEME_ID = 'angkor_night';

export function getProfileTheme(themeId?: string) {
  return PROFILE_THEMES.find((theme) => theme.id === themeId) ?? PROFILE_THEMES[0];
}
