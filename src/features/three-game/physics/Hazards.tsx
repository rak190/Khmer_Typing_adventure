import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Position3D } from '../types';

export type HazardZone = {
  id: string;
  name: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
};

export const WORLD_HAZARD_ZONES: HazardZone[] = [
  // River Ruins deep waters (falling into the torrent)
  {
    id: 'hazard-w2-river',
    name: 'River Ruins Torrent',
    bounds: {
      minX: -230,
      maxX: -50,
      minY: -10,
      maxY: -1.2,
      minZ: -20,
      maxZ: 120,
    },
  },
  // Sky Pagoda chasm fall
  {
    id: 'hazard-w3-chasm',
    name: 'Sky Pagoda Void',
    bounds: {
      minX: -60,
      maxX: 60,
      minY: -10,
      maxY: 8.0,
      minZ: 90,
      maxZ: 250,
    },
  },
  // Shadow Volcano magma lake
  {
    id: 'hazard-w5-magma',
    name: 'Shadow Volcano Magma',
    bounds: {
      minX: -170,
      maxX: -30,
      minY: -10,
      maxY: -1.0,
      minZ: -400,
      maxZ: -240,
    },
  },
];

type HazardsProps = {
  playerPosition?: Position3D;
  playerPositionRef?: React.MutableRefObject<Position3D>;
  onHazardTrigger: () => void;
};

export default function Hazards({ playerPosition, playerPositionRef, onHazardTrigger }: HazardsProps) {
  const lastTriggerTime = useRef<number>(0);

  useFrame((state) => {
    const [px, py, pz] = playerPositionRef ? playerPositionRef.current : (playerPosition ?? [0, 0, 0]);
    const now = state.clock.elapsedTime;

    // Cooldown prevents repeat triggers during rewinding
    if (now - lastTriggerTime.current < 1.5) return;

    // 1. Universal void fall hazard (falling below world threshold)
    if (py < -7.0) {
      lastTriggerTime.current = now;
      onHazardTrigger();
      return;
    }

    // 2. Regional environmental hazard volumes
    for (const zone of WORLD_HAZARD_ZONES) {
      const b = zone.bounds;
      if (
        px >= b.minX &&
        px <= b.maxX &&
        py >= b.minY &&
        py <= b.maxY &&
        pz >= b.minZ &&
        pz <= b.maxZ
      ) {
        lastTriggerTime.current = now;
        onHazardTrigger();
        return;
      }
    }
  });

  return null;
}
