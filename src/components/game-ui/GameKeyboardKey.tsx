import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

type GameKeyboardKeyProps = {
  label: string;
  shift?: string;
  altgr?: string;
  active?: boolean;
  state?: 'idle' | 'correct' | 'wrong';
  wide?: boolean;
  compact?: boolean;
  modifier?: 'base' | 'shift' | 'altgr';
  onPress?: () => void;
};

export default function GameKeyboardKey({ label, shift, altgr, active = false, state = 'idle', wide = false, compact = false, modifier = 'base', onPress }: GameKeyboardKeyProps) {
  const mainLabel = modifier === 'shift' && shift ? shift : modifier === 'altgr' && altgr ? altgr : label;
  const showLayerHints = Boolean(shift || altgr) && !wide;

  return (
    <motion.button
      type="button"
      onClick={onPress}
      animate={state === 'wrong' ? { x: [-4, 4, -3, 3, 0] } : state === 'correct' ? { scale: [1, 1.08, 1] } : undefined}
      whileHover={{ y: -2 }}
      whileTap={{ y: 2, scale: 0.98 }}
      className={cn(
        'khmer-body relative grid place-items-center border-2 bg-gradient-to-b from-white to-[#E8F2FF] font-black text-[#17325A] shadow-[inset_0_-5px_0_rgba(18,59,105,.13),0_7px_12px_rgba(18,59,105,.16)] transition',
        compact ? 'h-10 rounded-xl px-2 text-lg' : 'h-14 rounded-2xl px-3 text-2xl',
        wide ? (compact ? 'min-w-24 flex-[1.8]' : 'min-w-28 flex-[1.6]') : compact ? 'min-w-9 flex-1' : 'min-w-12 flex-1',
        active ? 'border-primary ring-4 ring-primary/20' : 'border-[#BCD8F0]',
        modifier === 'shift' && 'border-[#B486FF] bg-gradient-to-b from-[#F1E8FF] to-[#DAC2FF]',
        modifier === 'altgr' && 'border-[#F0B749] bg-gradient-to-b from-[#FFF5D8] to-[#FFE0A1]',
        state === 'correct' ? 'border-primary bg-gradient-to-b from-[#D9FFD8] to-[#7BE76E]' : '',
        state === 'wrong' ? 'border-coral bg-gradient-to-b from-[#FFE0E1] to-[#FF9A9F]' : '',
      )}
    >
      {showLayerHints && shift && (
        <span className={cn('absolute left-1 top-0.5 max-w-[48%] truncate text-[9px] leading-none text-[#7A4CEB]', compact && 'text-[7px]')}>
          {shift}
        </span>
      )}
      {showLayerHints && altgr && (
        <span className={cn('absolute right-1 top-0.5 max-w-[48%] truncate text-[9px] leading-none text-[#B46A00]', compact && 'text-[7px]')}>
          {altgr}
        </span>
      )}
      <span className="translate-y-0.5">{mainLabel}</span>
    </motion.button>
  );
}
