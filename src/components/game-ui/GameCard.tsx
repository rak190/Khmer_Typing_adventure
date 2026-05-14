import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type GameCardProps = {
  children: ReactNode;
  header?: ReactNode;
  tone?: 'white' | 'cream' | 'blue' | 'purple';
  className?: string;
};

const tones = {
  white: 'border-[#CDE3F7] bg-white/90',
  cream: 'border-[#E4C482] bg-gradient-to-b from-[#FFF9E8] to-[#FFFDF7]',
  blue: 'border-[#7FC7FF] bg-gradient-to-b from-[#E9F8FF] to-white',
  purple: 'border-[#C5AEFF] bg-gradient-to-b from-[#F4EEFF] to-white',
};

export default function GameCard({ children, header, tone = 'white', className }: GameCardProps) {
  return (
    <section className={cn('overflow-hidden rounded-3xl border-2 p-5 shadow-[0_16px_34px_rgba(18,82,142,.18)] backdrop-blur', tones[tone], className)}>
      {header && <div className="mb-4 font-black text-[#17325A]">{header}</div>}
      {children}
    </section>
  );
}
