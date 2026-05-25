import { Plus } from 'lucide-react';
import { cn } from '../../lib/cn';
import GameIcon, { type GameIconName } from './GameIcon';

type GameHudCounterProps = {
  type: 'coins' | 'gems' | 'hearts' | 'xp' | 'score' | 'streak';
  value: string | number;
  label?: string;
  showPlus?: boolean;
  onAdd?: () => void;
  className?: string;
};

const iconMap: Record<GameHudCounterProps['type'], GameIconName> = {
  coins: 'coin',
  gems: 'gem',
  hearts: 'heart',
  xp: 'star',
  score: 'medal',
  streak: 'flame',
};

export default function GameHudCounter({ type, value, label, showPlus = false, onAdd, className }: GameHudCounterProps) {
  return (
    <div className={cn('relative inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-white/35 bg-gradient-to-b from-[#17456A] to-[#08223C] px-3 py-2 font-black text-white shadow-[inset_0_-4px_0_rgba(0,0,0,.22),0_8px_14px_rgba(0,0,0,.2)] before:pointer-events-none before:absolute before:inset-x-3 before:top-1 before:h-1/3 before:rounded-full before:bg-white/12 before:content-[""]', className)}>
      <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full bg-white/18">
        <GameIcon name={iconMap[type]} size={24} />
      </span>
      <span className="relative z-10 leading-tight">
        {label && <span className="block text-[10px] uppercase text-white/70">{label}</span>}
        <span className="text-lg">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      </span>
      {showPlus && (
        <button
          type="button"
          className="pointer-events-auto relative z-10 grid h-7 w-7 cursor-pointer place-items-center rounded-full border-2 border-white/70 bg-gradient-to-b from-[#A9FF62] to-[#22A54A] shadow-button disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onAdd}
          disabled={!onAdd}
          aria-label={`Add ${type}`}
          title={onAdd ? undefined : 'Coming soon'}
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  );
}
