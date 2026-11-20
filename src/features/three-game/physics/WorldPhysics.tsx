import { Physics } from '@react-three/rapier';
import { type ReactNode } from 'react';

type WorldPhysicsProps = {
  children: ReactNode;
  debug?: boolean;
};

export default function WorldPhysics({ children, debug = false }: WorldPhysicsProps) {
  return (
    <Physics gravity={[0, -20, 0]} colliders={false} debug={debug}>
      {children}
    </Physics>
  );
}
