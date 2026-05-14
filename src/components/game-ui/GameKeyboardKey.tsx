import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

type GameKeyboardKeyProps = {
  label: string;
  active?: boolean;
  state?: 'idle' | 'correct' | 'wrong';
  wide?: boolean;
  onPress?: () => void;
};

export default function GameKeyboardKey({ label, active = false, state = 'idle', wide = false, onPress }: GameKeyboardKeyProps) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      animate={state === 'wrong' ? { x: [-4, 4, -3, 3, 0] } : state === 'correct' ? { scale: [1, 1.08, 1] } : undefined}
      whileHover={{ y: -2 }}
      whileTap={{ y: 2, scale: 0.98 }}
      className={cn(
        'khmer-body relative grid h-14 place-items-center rounded-2xl border-2 bg-gradient-to-b from-white to-[#E8F2FF] px-3 text-2xl font-black text-[#17325A] shadow-[inset_0_-5px_0_rgba(18,59,105,.13),0_7px_12px_rgba(18,59,105,.16)] transition',
        wide ? 'min-w-28 flex-[1.6]' : 'min-w-12 flex-1',
        active ? 'border-primary ring-4 ring-primary/20' : 'border-[#BCD8F0]',
        state === 'correct' ? 'border-primary bg-gradient-to-b from-[#D9FFD8] to-[#7BE76E]' : '',
        state === 'wrong' ? 'border-coral bg-gradient-to-b from-[#FFE0E1] to-[#FF9A9F]' : '',
      )}
    >
      {label}
    </motion.button>
  );
}
