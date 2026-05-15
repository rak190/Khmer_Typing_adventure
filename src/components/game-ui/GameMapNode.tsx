import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { cn } from '../../lib/cn';
import GameIcon from './GameIcon';

type GameMapNodeProps = {
  level: number | string;
  state?: 'completed' | 'current' | 'locked';
  color?: 'green' | 'gold' | 'purple' | 'blue' | 'gray' | 'red';
  stars?: number;
  label?: string;
  subtitle?: string;
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

export default function GameMapNode({ level, state = 'completed', color = 'green', stars = 0, label, subtitle, selected, className, style, onClick }: GameMapNodeProps) {
  const locked = state === 'locked';

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
      }}
      className={cn('pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer text-center drop-shadow-[0_12px_13px_rgba(0,29,48,.35)]', className)}
      style={style}
      aria-label={`Level ${level}${locked ? ' locked' : ''}`}
    >
      <motion.div
        animate={selected && !locked ? { scale: [1, 1.04, 1], filter: ['brightness(1)', 'brightness(1.12)', 'brightness(1)'] } : undefined}
        transition={selected && !locked ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
        whileHover={!locked ? { y: -6, scale: 1.06 } : undefined}
        whileTap={!locked ? { y: 2, scale: 0.96 } : undefined}
      >
        <div
          className={cn(
            'relative grid h-[86px] w-[86px] place-items-center rounded-full border-[6px] bg-gradient-to-b text-[34px] font-black text-white shadow-[inset_0_-10px_0_rgba(0,0,0,.22),inset_0_4px_0_rgba(255,255,255,.34),0_12px_16px_rgba(0,36,58,.34)] before:absolute before:left-[16%] before:top-[8%] before:h-[35%] before:w-[60%] before:rounded-full before:bg-white/48 before:blur-[1px] before:content-[""] after:absolute after:inset-[8px] after:rounded-full after:border after:border-white/25 after:content-[""]',
            colors[locked ? 'gray' : color],
            state === 'current' || selected ? 'ring-[5px] ring-white ring-offset-[6px] ring-offset-[#FFE16B] shadow-[0_0_0_10px_rgba(255,230,89,.28),0_0_28px_rgba(167,101,255,.58),inset_0_-10px_0_rgba(0,0,0,.22),0_16px_24px_rgba(0,36,58,.42)]' : '',
          )}
        >
          {locked ? <GameIcon name="lock" size={34} className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,.35)]" /> : <span className="relative z-10 drop-shadow-[0_3px_2px_rgba(0,0,0,.3)]">{level}</span>}
        </div>
        {state !== 'locked' && (
          <div className="mx-auto mt-1 flex w-fit justify-center gap-0.5 rounded-full border border-white/85 bg-[#FFF7D6] px-1.5 py-0.5 shadow-[0_4px_6px_rgba(0,31,50,.2)]">
            {[1, 2, 3].map((star) => (
              <GameIcon key={star} name="star" size={16} className={star > stars ? 'grayscale opacity-35' : ''} />
            ))}
          </div>
        )}
        {(label || subtitle) && (
          <div className="mx-auto mt-1 w-fit rounded-[12px] border border-white/35 bg-[#2C1B10]/82 px-2.5 py-1 text-white shadow-[0_4px_7px_rgba(0,0,0,.3)]">
            {label && <div className="khmer-body text-[12px] font-black leading-tight">{label}</div>}
            {subtitle && <div className="text-[10px] font-black leading-tight text-white/88">{subtitle}</div>}
          </div>
        )}
      </motion.div>
    </button>
  );
}
