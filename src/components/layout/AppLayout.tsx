import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-sky">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
