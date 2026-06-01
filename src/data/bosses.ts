import templeJungleBoss from '../assets/bosses/boss-temple-jungle.png';
import riverRuinsBoss from '../assets/bosses/boss-river-ruins.png';
import skyPagodaBoss from '../assets/bosses/boss-sky-pagoda.png';
import goldenLibraryBoss from '../assets/bosses/boss-golden-library.png';
import shadowVolcanoBoss from '../assets/bosses/boss-shadow-volcano.png';
import royalAngkorBoss from '../assets/bosses/boss-royal-angkor.png';

export type WorldBossArt = {
  worldId: number;
  name: string;
  image: string;
  accent: string;
  glow: string;
  platform: string;
};

export const worldBosses: Record<number, WorldBossArt> = {
  1: {
    worldId: 1,
    name: 'Temple Stone Guardian',
    image: templeJungleBoss,
    accent: 'rgba(128, 235, 105, 0.52)',
    glow: 'rgba(128, 235, 105, 0.46)',
    platform: 'rgba(52, 112, 54, 0.58)',
  },
  2: {
    worldId: 2,
    name: 'River Naga Sentinel',
    image: riverRuinsBoss,
    accent: 'rgba(70, 224, 255, 0.56)',
    glow: 'rgba(52, 211, 255, 0.46)',
    platform: 'rgba(18, 108, 124, 0.6)',
  },
  3: {
    worldId: 3,
    name: 'Sky Garuda Warden',
    image: skyPagodaBoss,
    accent: 'rgba(160, 136, 255, 0.56)',
    glow: 'rgba(142, 117, 255, 0.44)',
    platform: 'rgba(73, 58, 128, 0.6)',
  },
  4: {
    worldId: 4,
    name: 'Golden Library Golem',
    image: goldenLibraryBoss,
    accent: 'rgba(255, 210, 92, 0.58)',
    glow: 'rgba(255, 205, 80, 0.44)',
    platform: 'rgba(142, 95, 38, 0.58)',
  },
  5: {
    worldId: 5,
    name: 'Shadow Volcano Demon',
    image: shadowVolcanoBoss,
    accent: 'rgba(255, 92, 58, 0.62)',
    glow: 'rgba(255, 88, 42, 0.5)',
    platform: 'rgba(118, 28, 22, 0.64)',
  },
  6: {
    worldId: 6,
    name: 'Royal Angkor Titan',
    image: royalAngkorBoss,
    accent: 'rgba(255, 212, 86, 0.6)',
    glow: 'rgba(255, 196, 70, 0.48)',
    platform: 'rgba(121, 80, 29, 0.62)',
  },
};

export function getWorldBossArt(worldId: number) {
  return worldBosses[worldId] ?? worldBosses[1];
}
