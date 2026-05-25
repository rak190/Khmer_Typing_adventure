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
  green: 'from-[#D8FF75] via-[#59C948] to-[#1C6D31] border-[#7F551F]',
  gold: 'from-[#FFF07A] via-[#E9A72E] to-[#9A5419] border-[#7F551F]',
  purple: 'from-[#D4ACFF] via-[#8A58E6] to-[#4D2A9C] border-[#7F551F]',
  blue: 'from-[#8FEAFF] via-[#2F9BB8] to-[#22527A] border-[#7F551F]',
  red: 'from-[#FF9A8B] via-[#DF4B3C] to-[#8B241E] border-[#7F551F]',
  gray: 'from-[#C9C1AE] via-[#77776F] to-[#3F3D36] border-[#6C614E]',
};

export default function GameMapNode({ level, state = 'completed', color = 'green', stars = 0, label, subtitle, selected, className, style, onClick }: GameMapNodeProps) {
  const locked = state === 'locked';

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
      }}
      className={cn(
        'pointer-events-auto absolute w-[170px] -translate-x-1/2 -translate-y-1/2 text-center drop-shadow-[0_12px_13px_rgba(0,29,48,.35)]',
        locked ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
      style={style}
      aria-label={`Level ${level}${locked ? ' locked' : ''}`}
      aria-disabled={locked}
    >
      <motion.div
        animate={selected && !locked ? { scale: [1, 1.04, 1], filter: ['brightness(1)', 'brightness(1.12)', 'brightness(1)'] } : undefined}
        transition={selected && !locked ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
        whileHover={!locked ? { y: -6, scale: 1.06 } : undefined}
        whileTap={!locked ? { y: 2, scale: 0.96 } : undefined}
      >
        <div className="origin-center [transform:scaleX(calc(var(--game-scale-y,1)/var(--game-scale-x,1)))]">
        <div className="mx-auto w-[150px]">
        <div className="mx-auto grid w-[96px] place-items-center">
        <div
          className={cn(
            'relative grid h-[96px] w-[96px] place-items-center rounded-full border-[7px] bg-gradient-to-b text-[38px] font-black text-white shadow-[inset_0_5px_0_rgba(255,244,187,.35),inset_0_-14px_0_rgba(55,28,8,.34),0_7px_0_rgba(102,66,28,.62),0_17px_20px_rgba(0,36,58,.4)] before:absolute before:left-[16%] before:top-[8%] before:h-[35%] before:w-[60%] before:rounded-full before:bg-white/48 before:blur-[1px] before:content-[""] after:absolute after:inset-[9px] after:rounded-full after:border after:border-[#FFF0A3]/35 after:content-[""]',
            colors[locked ? 'gray' : color],
            state === 'current' || selected ? 'ring-[5px] ring-white ring-offset-[6px] ring-offset-[#FFE16B] shadow-[0_0_0_10px_rgba(255,230,89,.28),0_0_28px_rgba(167,101,255,.58),inset_0_-10px_0_rgba(0,0,0,.22),0_16px_24px_rgba(0,36,58,.42)]' : '',
          )}
        >
          {locked ? <GameIcon name="lock" size={38} className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,.35)]" /> : <span className="relative z-10 drop-shadow-[0_3px_2px_rgba(0,0,0,.3)]">{level}</span>}
        </div>
        </div>
        <div className="mx-auto mt-1 flex w-[150px] flex-col items-center">
        {state !== 'locked' && (
          <div className="mx-auto mt-1 flex min-h-[25px] min-w-[42px] justify-center gap-0.5 rounded-full border-2 border-[#FFE58A] bg-gradient-to-b from-[#FFFCE1] via-[#FFD766] to-[#E99622] px-2 py-0.5 shadow-[inset_0_2px_0_rgba(255,255,255,.75),inset_0_-3px_0_rgba(132,71,13,.2),0_0_12px_rgba(255,211,69,.55),0_4px_0_rgba(91,55,19,.4),0_8px_10px_rgba(0,31,50,.26)]">
            {Array.from({ length: Math.max(1, Math.min(3, stars)) }, (_, index) => (
              <GameIcon key={index} name="star" size={18} className="drop-shadow-[0_1px_2px_rgba(117,56,0,.65)]" />
            ))}
          </div>
        )}
        {(label || subtitle) && (
          <div className="mx-auto mt-1 w-[170px] overflow-hidden rounded-[15px] border-2 border-[#E6B760]/85 bg-gradient-to-b from-[#3B2612]/95 to-[#1E1208]/95 px-3 py-2 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_4px_0_rgba(43,24,10,.46),0_8px_10px_rgba(0,0,0,.34)]">
            {label && <div className="khmer-body truncate text-[18px] font-normal leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,.7)]">{label}</div>}
            {subtitle && <div className="truncate text-[12px] font-normal leading-tight text-[#FFE8AA] drop-shadow-[0_2px_2px_rgba(0,0,0,.7)]">{subtitle}</div>}
          </div>
        )}
        </div>
        </div>
        </div>
      </motion.div>
    </button>
  );
}
