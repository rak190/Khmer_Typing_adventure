import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type GameStatCardProps = {
  icon?: ReactNode;
  value: string | number;
  label: string;
  tone?: 'green' | 'blue' | 'gold' | 'purple' | 'red';
  className?: string;
};

const tones = {
  green: 'text-primary',
  blue: 'text-adventure',
  gold: 'text-gold',
  purple: 'text-purple',
  red: 'text-coral',
};

export default function GameStatCard({ icon, value, label, tone = 'blue', className }: GameStatCardProps) {
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl border border-adventure/15 bg-white/75 p-4 shadow-inner', className)}>
      {icon && <div className={cn('grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm', tones[tone])}>{icon}</div>}
      <div>
        <div className="text-3xl font-black text-adventure">{value}</div>
        <div className="font-bold text-slate-600">{label}</div>
      </div>
    </div>
  );
}
