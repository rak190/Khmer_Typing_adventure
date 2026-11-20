import { useFrame } from '@react-three/fiber';
import { useRef, useState, type MutableRefObject } from 'react';
import { getActiveGraphicsProfile } from '../config/graphicsQuality';
import CentralAngkorHub from './CentralAngkorHub';
import RegionTempleJungle from './RegionTempleJungle';
import RegionRiverRuins from './RegionRiverRuins';
import RegionSkyPagoda from './RegionSkyPagoda';
import RegionGoldenLibrary from './RegionGoldenLibrary';
import RegionShadowVolcano from './RegionShadowVolcano';
import RegionRoyalAngkor from './RegionRoyalAngkor';

type WorldStreamingManagerProps = {
  playerPosition?: [number, number, number];
  playerPositionRef?: MutableRefObject<[number, number, number]>;
  onOpenService: (service: 'sanctuary' | 'map' | 'observatory' | 'market' | 'wardrobe' | 'settings') => void;
  onEnterLesson: (worldId: number, levelId: number | 'boss') => void;
  unlockedLevels: Record<number, number | 'boss'>;
};

const REGION_CENTERS: Record<string, [number, number, number]> = {
  'angkor-hub': [0, 0, 0],
  'world-1': [0, 0, -145],
  'world-2': [-140, 0, 45],
  'world-3': [0, 24, 175],
  'world-4': [145, 0, 45],
  'world-5': [-110, 0, -330],
  'world-6': [110, 0, -335],
};

export function getPlayerActiveRegion(position: [number, number, number]): string {
  const [px, , pz] = position;
  let closestRegion = 'angkor-hub';
  let minDistance = Infinity;

  for (const [regionId, center] of Object.entries(REGION_CENTERS)) {
    const dist = Math.hypot(px - center[0], pz - center[2]);
    if (dist < minDistance) {
      minDistance = dist;
      closestRegion = regionId;
    }
  }

  return closestRegion;
}

export default function WorldStreamingManager({
  playerPosition,
  playerPositionRef,
  onOpenService,
  onEnterLesson,
  unlockedLevels,
}: WorldStreamingManagerProps) {
  const profile = getActiveGraphicsProfile();
  const maxStreamingDistance = profile.maxDrawDistance;

  const [visibleRegions, setVisibleRegions] = useState<Record<string, boolean>>(() => ({
    'angkor-hub': true,
    'world-1': true,
    'world-2': true,
    'world-3': true,
    'world-4': true,
    'world-5': true,
    'world-6': true,
  }));
  const lastCheckTime = useRef(0);

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (now - lastCheckTime.current < 0.3) return;
    lastCheckTime.current = now;

    const pos = playerPositionRef ? playerPositionRef.current : (playerPosition ?? [0, 0, 0]);
    const px = pos[0];
    const pz = pos[2];

    const nextVisible: Record<string, boolean> = {};
    for (const [regionId, center] of Object.entries(REGION_CENTERS)) {
      const dist = Math.hypot(px - center[0], pz - center[2]);
      nextVisible[regionId] = dist <= maxStreamingDistance;
    }

    // Always keep Angkor Hub loaded if player is near origin
    if (Math.hypot(px, pz) < 120) {
      nextVisible['angkor-hub'] = true;
    }

    setVisibleRegions((prev) => {
      let changed = false;
      for (const key of Object.keys(nextVisible)) {
        if (prev[key] !== nextVisible[key]) {
          changed = true;
          break;
        }
      }
      return changed ? nextVisible : prev;
    });
  });

  const resolvedPos = playerPosition ?? [0, 0, 0];

  return (
    <group>
      {/* Central Angkor Hub */}
      {visibleRegions['angkor-hub'] && (
        <CentralAngkorHub
          playerPosition={resolvedPos}
          playerPositionRef={playerPositionRef}
          onOpenService={onOpenService}
        />
      )}

      {/* World 1: Temple Jungle */}
      {visibleRegions['world-1'] && (
        <RegionTempleJungle
          playerPosition={resolvedPos}
          onEnterLesson={(levelId) => onEnterLesson(1, levelId)}
          unlockedLevelId={unlockedLevels[1] ?? 1}
        />
      )}

      {/* World 2: River Ruins */}
      {visibleRegions['world-2'] && (
        <RegionRiverRuins
          playerPosition={resolvedPos}
          onEnterLesson={(levelId) => onEnterLesson(2, levelId)}
          unlockedLevelId={unlockedLevels[2] ?? 1}
        />
      )}

      {/* World 3: Sky Pagoda */}
      {visibleRegions['world-3'] && (
        <RegionSkyPagoda
          playerPosition={resolvedPos}
          onEnterLesson={(levelId) => onEnterLesson(3, levelId)}
          unlockedLevelId={unlockedLevels[3] ?? 1}
        />
      )}

      {/* World 4: Golden Library */}
      {visibleRegions['world-4'] && (
        <RegionGoldenLibrary
          playerPosition={resolvedPos}
          onEnterLesson={(levelId) => onEnterLesson(4, levelId)}
          unlockedLevelId={unlockedLevels[4] ?? 1}
        />
      )}

      {/* World 5: Shadow Volcano */}
      {visibleRegions['world-5'] && (
        <RegionShadowVolcano
          playerPosition={resolvedPos}
          onEnterLesson={(levelId) => onEnterLesson(5, levelId)}
          unlockedLevelId={unlockedLevels[5] ?? 1}
        />
      )}

      {/* World 6: Royal Angkor */}
      {visibleRegions['world-6'] && (
        <RegionRoyalAngkor
          playerPosition={resolvedPos}
          onEnterLesson={(levelId) => onEnterLesson(6, levelId)}
          unlockedLevelId={unlockedLevels[6] ?? 1}
        />
      )}
    </group>
  );
}
