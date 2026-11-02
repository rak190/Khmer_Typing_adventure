import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { GameMode, Position3D } from '../types';

type Projectile = {
  id: number;
  startX: number;
  startY: number;
  startZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  progress: number; // 0 to 1
  speed: number;
  color: string;
};

type Sparkle = {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number; // 1 to 0
  color: string;
};

type SpellProjectileSystemProps = {
  mode: GameMode;
  playerPositionRef: MutableRefObject<Position3D>;
  altarPosition: Position3D;
  completedCount: number;
  incorrectCount: number;
  streak: number;
};

let nextId = 1;

export default function SpellProjectileSystem({
  mode,
  playerPositionRef,
  altarPosition,
  completedCount,
  incorrectCount,
  streak,
}: SpellProjectileSystemProps) {
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const prevCompletedRef = useRef(completedCount);
  const prevIncorrectRef = useRef(incorrectCount);

  // Trigger projectile on correct keystroke
  useEffect(() => {
    if (completedCount > prevCompletedRef.current && mode === 'typing') {
      const [px, py, pz] = playerPositionRef.current;
      const [ax, ay, az] = altarPosition;

      // Color shifts based on streak
      const color =
        streak >= 15 ? '#C084FC' : streak >= 8 ? '#38BDF8' : '#FBBF24';

      const newProj: Projectile = {
        id: nextId++,
        startX: px,
        startY: py + 1.1,
        startZ: pz + 0.3,
        targetX: ax,
        targetY: ay + 0.9,
        targetZ: az,
        progress: 0,
        speed: 4.8, // ~0.21s flight time
        color,
      };

      setProjectiles((prev) => [...prev.slice(-6), newProj]);
    }
    prevCompletedRef.current = completedCount;
  }, [altarPosition, completedCount, mode, playerPositionRef, streak]);

  // Trigger sparkles on impact
  const triggerImpact = (x: number, y: number, z: number, color: string) => {
    const newSparkles: Sparkle[] = Array.from({ length: 8 }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const speed = 1.2 + Math.random() * 1.5;
      return {
        id: nextId++,
        x,
        y,
        z,
        vx: Math.cos(theta) * Math.cos(phi) * speed,
        vy: Math.sin(phi) * speed + 0.8,
        vz: Math.sin(theta) * Math.cos(phi) * speed,
        life: 1.0,
        color,
      };
    });
    setSparkles((prev) => [...prev.slice(-16), ...newSparkles]);
  };

  // Trigger mistake dispersion puff
  useEffect(() => {
    if (incorrectCount > prevIncorrectRef.current && mode === 'typing') {
      const [px, py, pz] = playerPositionRef.current;
      const mistakeSparkles: Sparkle[] = Array.from({ length: 6 }, () => ({
        id: nextId++,
        x: px + (Math.random() - 0.5) * 0.4,
        y: py + 1.1,
        z: pz + 0.3,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 0.5,
        vz: (Math.random() - 0.5) * 0.8,
        life: 0.8,
        color: '#EF4444',
      }));
      setSparkles((prev) => [...prev.slice(-16), ...mistakeSparkles]);
    }
    prevIncorrectRef.current = incorrectCount;
  }, [incorrectCount, mode, playerPositionRef]);

  // Frame update for projectile motion and particle physics
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // Update projectiles
    if (projectiles.length > 0) {
      setProjectiles((prev) => {
        const remaining: Projectile[] = [];
        for (const p of prev) {
          const nextProg = p.progress + p.speed * dt;
          if (nextProg >= 1.0) {
            triggerImpact(p.targetX, p.targetY, p.targetZ, p.color);
          } else {
            remaining.push({ ...p, progress: nextProg });
          }
        }
        return remaining;
      });
    }

    // Update sparkles
    if (sparkles.length > 0) {
      setSparkles((prev) => {
        return prev
          .map((sp) => ({
            ...sp,
            x: sp.x + sp.vx * dt,
            y: sp.y + sp.vy * dt - 2.5 * dt * dt,
            z: sp.z + sp.vz * dt,
            life: sp.life - dt * 2.8,
          }))
          .filter((sp) => sp.life > 0);
      });
    }
  });

  return (
    <group>
      {/* 3D Flying Projectiles (Arcing bezier paths) */}
      {projectiles.map((p) => {
        const t = p.progress;
        const curX = (1 - t) * p.startX + t * p.targetX;
        const curZ = (1 - t) * p.startZ + t * p.targetZ;
        const curY = (1 - t) * p.startY + t * p.targetY + Math.sin(t * Math.PI) * 0.5;

        return (
          <group key={`proj-${p.id}`} position={[curX, curY, curZ]}>
            <mesh>
              <sphereGeometry args={[0.085, 12, 12]} />
              <meshBasicMaterial color={p.color} />
            </mesh>
            <pointLight color={p.color} intensity={1.5} distance={1.8} />
          </group>
        );
      })}

      {/* Sparkle burst particles */}
      {sparkles.map((sp) => (
        <mesh key={`sp-${sp.id}`} position={[sp.x, sp.y, sp.z]}>
          <sphereGeometry args={[0.035 * sp.life, 6, 6]} />
          <meshBasicMaterial color={sp.color} transparent opacity={sp.life} />
        </mesh>
      ))}
    </group>
  );
}
