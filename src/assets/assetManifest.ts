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
import bossBattleBackground from './backgrounds/boss-battle-background.png';
import leftHandTyping from './hands/left-hand-typing.png';
import rightHandTyping from './hands/right-hand-typing.png';
import world1 from './map/world-1.png';
import world2 from './map/world-2.png';
import world3 from './map/world-3.png';
import world4 from './map/world-4.png';
import world5 from './map/world-5.png';
import world6 from './map/world-6.png';
import angkorFlat from './map/angkor-flat.png';

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
    bossBattle: bossBattleBackground,
  },
  hands: {
    leftTyping: leftHandTyping,
    rightTyping: rightHandTyping,
  },
  map: {
    world1,
    world2,
    world3,
    world4,
    world5,
    world6,
    angkorFlat,
  },
} as const;

export const assets = {
  hands: {
    leftTyping: leftHandTyping,
    rightTyping: rightHandTyping,
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
export const handImages = imageAssets.hands;
export const mapImages = imageAssets.map;
