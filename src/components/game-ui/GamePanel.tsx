import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type GamePanelProps = {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  headerTone?: 'blue' | 'purple' | 'green' | 'gold' | 'red';
  className?: string;
  bodyClassName?: string;
};

const headerTones = {
  blue: 'from-[#43B5FF] to-[#1268D8]',
  purple: 'from-[#A987FF] to-[#653BD5]',
  green: 'from-[#7CEB70] to-[#1EA64F]',
  gold: 'from-[#FFE36A] to-[#EF9416] text-[#603300]',
  red: 'from-[#FF8A8E] to-[#D8313C]',
};

export default function GamePanel({ children, title, subtitle, headerTone = 'purple', className, bodyClassName }: GamePanelProps) {
  return (
    <section className={cn('overflow-hidden rounded-[28px] border-[3px] border-[#D5B16D] bg-[#FFF9E8] shadow-[inset_0_-6px_0_rgba(116,69,28,.12),0_18px_34px_rgba(25,72,118,.22)]', className)}>
      {(title || subtitle) && (
        <header className={cn('bg-gradient-to-b px-5 py-4 text-center font-black text-white shadow-button', headerTones[headerTone])}>
          {title && <div className="khmer-display text-2xl leading-tight">{title}</div>}
          {subtitle && <div className="text-lg">{subtitle}</div>}
        </header>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
