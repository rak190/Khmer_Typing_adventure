import logo from './logo/khmer-typing-logo.png';
import lizardMascot from './characters/lizard-mascot.png';
import elephantGuide from './characters/elephant-guide.png';
import stoneGuardian from './characters/stone-guardian.png';
import gem from './icons/gem.png';
import heart from './icons/heart.png';
import medal from './icons/medal.png';
import chest from './icons/chest.png';
import lock from './icons/lock.png';
import coin from './icons/coin.png';
import star from './icons/star.png';
import homeBackground from './backgrounds/home-background.png';
import worldMapBackground from './backgrounds/world-map-background.png';
import lessonBackground from './backgrounds/lesson-background.png';
import battleBackground from './backgrounds/battle-background.png';

export const imageAssets = {
  // PNGs are intentionally limited to complex art and detailed icons.
  // Do not put Khmer text, buttons, badges, panels, or page screenshots here.
  logo,
  lizardMascot,
  elephantGuide,
  stoneGuardian,
  gem,
  heart,
  medal,
  chest,
  lock,
  coin,
  star,
  backgrounds: {
    home: homeBackground,
    worldMap: worldMapBackground,
    lesson: lessonBackground,
    battle: battleBackground,
  },
} as const;

export type ImageAssetKey = keyof typeof imageAssets;

export const characterImages = {
  lizard: imageAssets.lizardMascot,
  elephant: imageAssets.elephantGuide,
  guardian: imageAssets.stoneGuardian,
} as const;

export const hudIconImages = {
  coins: imageAssets.coin,
  gems: imageAssets.gem,
  hearts: imageAssets.heart,
  star: imageAssets.star,
  lock: imageAssets.lock,
  chest: imageAssets.chest,
  medal: imageAssets.medal,
} as const;

export const backgroundImages = imageAssets.backgrounds;
