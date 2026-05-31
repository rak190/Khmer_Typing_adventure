import type { ReactNode } from 'react';
import GameSidebar from './GameSidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-sky">
      <GameSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
