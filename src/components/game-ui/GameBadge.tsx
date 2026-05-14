import { Lock } from 'lucide-react';
import { cn } from '../../lib/cn';
import GameIcon, { type GameIconName } from './GameIcon';

type GameBadgeProps = {
  variant?: 'newbie' | 'rising-star' | 'skilled' | 'expert' | 'master' | 'legend' | 'boss-slayer';
  label?: string;
  locked?: boolean;
  earned?: boolean;
  compact?: boolean;
  className?: string;
};

const styles = {
  newbie: ['from-[#9AF06B] to-[#25A653]', 'medal'],
  'rising-star': ['from-[#99E9FF] to-[#1E78E6]', 'star'],
  skilled: ['from-[#FFE76F] to-[#F09517]', 'shield'],
  expert: ['from-[#C8A6FF] to-[#6B43D8]', 'zap'],
  master: ['from-[#FFE36A] to-[#D47A10]', 'medal'],
  legend: ['from-[#FF9DA2] to-[#D8323E]', 'sparkles'],
  'boss-slayer': ['from-[#B8BCC7] to-[#59616D]', 'swords'],
} satisfies Record<string, [string, GameIconName]>;

export default function GameBadge({ variant = 'newbie', label, locked = false, earned = true, compact = false, className }: GameBadgeProps) {
  const [gradient, icon] = styles[variant];
  const displayLabel = label ?? variant.replace('-', ' ');

  return (
    <div className={cn('inline-flex flex-col items-center gap-2 text-center', locked || !earned ? 'grayscale' : '', className)}>
      <div className={cn('relative grid place-items-center rounded-full border-[4px] border-[#F7E0A2] bg-gradient-to-b shadow-[inset_0_-7px_0_rgba(0,0,0,.18),0_12px_20px_rgba(0,0,0,.2)] before:absolute before:inset-x-3 before:top-2 before:h-1/3 before:rounded-full before:bg-white/35 before:content-[""]', gradient, compact ? 'h-14 w-14' : 'h-20 w-20')}>
        <GameIcon name={icon} size={compact ? 28 : 42} className="relative z-10 text-white drop-shadow" />
        {locked && (
          <span className="absolute inset-0 z-20 grid place-items-center rounded-full bg-black/35 text-white">
            <Lock size={compact ? 20 : 28} />
          </span>
        )}
      </div>
      <div className={cn('font-black capitalize text-[#17325A]', compact ? 'text-xs' : 'text-sm')}>{displayLabel}</div>
    </div>
  );
}
