import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { cn } from '../../lib/cn';
import GameIcon from './GameIcon';

type GameMapNodeProps = {
  level: number;
  state?: 'completed' | 'current' | 'locked';
  color?: 'green' | 'gold' | 'purple' | 'blue' | 'gray' | 'red';
  stars?: number;
  label?: string;
  selected?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

const colors = {
  green: 'from-[#C8FF65] via-[#63D84E] to-[#2B9D42] border-[#257B28]',
  gold: 'from-[#FFF27D] via-[#FFC444] to-[#EE8412] border-[#AF6400]',
  purple: 'from-[#D9B4FF] via-[#9F72FF] to-[#6940DC] border-[#5430BA]',
  blue: 'from-[#8EEAFF] via-[#41B7FF] to-[#1E78E6] border-[#0963B5]',
  red: 'from-[#FF9AA2] via-[#FF686F] to-[#D93245] border-[#AB2532]',
  gray: 'from-[#D7DCE2] via-[#9BA3AE] to-[#606875] border-[#59616C]',
};

export default function GameMapNode({ level, state = 'completed', color = 'green', stars = 0, label, selected, className, style, onClick }: GameMapNodeProps) {
  const locked = state === 'locked';

  return (
    <motion.button
      type="button"
      whileHover={!locked ? { y: -5, scale: 1.05 } : undefined}
      whileTap={!locked ? { scale: 0.97 } : undefined}
      onClick={() => {
        if (!locked) onClick?.();
      }}
      className={cn('pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 text-center', locked ? 'cursor-default' : 'cursor-pointer', className)}
      style={style}
      aria-label={`Level ${level}${locked ? ' locked' : ''}`}
    >
      <div
        className={cn(
          'relative grid h-20 w-20 place-items-center rounded-full border-[5px] bg-gradient-to-b text-3xl font-black text-white shadow-button before:absolute before:left-[16%] before:top-[10%] before:h-[34%] before:w-[58%] before:rounded-full before:bg-white/38 before:content-[""]',
          colors[locked ? 'gray' : color],
          state === 'current' || selected ? 'ring-4 ring-white ring-offset-4 ring-offset-[#FFE16B] shadow-glow' : '',
        )}
      >
        {locked ? <GameIcon name="lock" size={30} className="relative z-10" /> : <span className="relative z-10">{level}</span>}
      </div>
      {!locked && (
        <div className="mt-1 flex justify-center gap-0.5 rounded-full bg-white/85 px-1.5 py-0.5 shadow">
          {[1, 2, 3].map((star) => (
            <GameIcon key={star} name="star" size={16} className={star > stars ? 'grayscale opacity-35' : ''} />
          ))}
        </div>
      )}
      {label && <div className="khmer-body mt-0.5 rounded-full bg-[#3F2515]/65 px-2 text-xs font-black text-white drop-shadow">{label}</div>}
    </motion.button>
  );
}
