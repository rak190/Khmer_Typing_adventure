import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type StatPillProps = {
  icon: ReactNode;
  label?: string;
  value: string | number;
  tone?: 'blue' | 'green' | 'gold' | 'red' | 'purple' | 'dark';
  className?: string;
};

const tones = {
  blue: 'from-[#1E8CF4] to-[#085EC3] text-white',
  green: 'from-[#42D96A] to-primary text-white',
  gold: 'from-[#FFE067] to-[#FFA612] text-[#563300]',
  red: 'from-[#FF767B] to-coral text-white',
  purple: 'from-[#9D75FF] to-purple text-white',
  dark: 'from-[#16405F] to-[#071C33] text-white',
};

export default function StatPill({ icon, label, value, tone = 'blue', className }: StatPillProps) {
  return (
    <div className={cn('inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/25 bg-gradient-to-b px-4 py-2 font-black shadow-lg', tones[tone], className)}>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">{icon}</span>
      <span className="leading-tight">
        {label && <span className="block text-xs opacity-85">{label}</span>}
        <span className="text-lg">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      </span>
    </div>
  );
}
