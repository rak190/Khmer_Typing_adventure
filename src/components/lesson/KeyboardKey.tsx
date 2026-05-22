import { motion } from 'framer-motion';
import type { KeyboardKeyData } from '../../types/game';
import { cn } from '../../lib/cn';

type KeyboardModifier = 'base' | 'shift' | 'altgr';

type KeyboardKeyProps = {
  keyData: KeyboardKeyData;
  active?: boolean;
  state?: 'idle' | 'correct' | 'wrong';
  modifier: KeyboardModifier;
  targetValue?: string;
  onPress: (keyData: KeyboardKeyData) => void;
};

function labelForModifier(keyData: KeyboardKeyData, modifier: KeyboardModifier, targetValue?: string) {
  if (targetValue && (keyData.value === targetValue || keyData.shift === targetValue || keyData.altgr === targetValue)) return targetValue;
  if (modifier === 'shift' && keyData.shift) return keyData.shift;
  if (modifier === 'altgr' && keyData.altgr) return keyData.altgr;
  return keyData.label;
}

export default function KeyboardKey({ keyData, active = false, state = 'idle', modifier, targetValue, onPress }: KeyboardKeyProps) {
  const label = labelForModifier(keyData, modifier, targetValue);
  const showShiftHint = !keyData.wide && Boolean(keyData.shift) && keyData.shift !== label;
  const showAltGrHint = !keyData.wide && Boolean(keyData.altgr) && keyData.altgr !== label;

  return (
    <motion.button
      type="button"
      onClick={() => onPress(keyData)}
      animate={state === 'wrong' ? { x: [-7, 7, -5, 5, 0] } : state === 'correct' ? { scale: [1, 1.09, 1] } : active ? { y: [0, -2, 0] } : undefined}
      transition={{ duration: state === 'wrong' ? 0.36 : 0.45 }}
      whileHover={{ y: -2 }}
      whileTap={{ y: 3, scale: 0.98 }}
      className={cn(
        'pointer-events-auto khmer-body relative grid h-[48px] place-items-center rounded-[13px] border-[2px] bg-gradient-to-b from-[#FFFFFF] to-[#D5E7F8] px-2 text-[22px] font-black leading-none text-[#0D223B] shadow-[inset_0_3px_0_rgba(255,255,255,.7),inset_0_-5px_0_rgba(8,33,65,.2),0_6px_0_rgba(3,19,43,.48),0_10px_12px_rgba(0,0,0,.16)] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/80',
        keyData.wide ? 'min-w-[96px] flex-[1.65] text-[17px]' : 'min-w-[54px] flex-1',
        active && 'border-[#FFE267] bg-gradient-to-b from-[#FFF8A9] via-[#FFD542] to-[#E19A12] text-[#321F08] ring-[5px] ring-[#FFE66B]/55 shadow-[inset_0_3px_0_rgba(255,255,255,.72),inset_0_-5px_0_rgba(95,55,9,.24),0_0_24px_rgba(255,215,74,.72),0_6px_0_rgba(90,54,13,.45)]',
        state === 'correct' && 'border-[#42F06A] bg-gradient-to-b from-[#E7FFD8] via-[#66E86A] to-[#179B40] text-white ring-4 ring-[#4CFF75]/45',
        state === 'wrong' && 'border-[#FF7878] bg-gradient-to-b from-[#FFE2E0] via-[#FF7972] to-[#CE2B32] text-white ring-4 ring-[#FF7878]/34',
        keyData.action === 'shift' && modifier === 'shift' && 'border-[#DDB8FF] bg-gradient-to-b from-[#F4E7FF] to-[#9E71F2]',
        keyData.action === 'altgr' && modifier === 'altgr' && 'border-[#FFD86C] bg-gradient-to-b from-[#FFF3B0] to-[#E9A520]',
      )}
      aria-label={keyData.label}
      data-testid="keyboard-key"
      data-key-value={keyData.value}
      data-key-shift={keyData.shift ?? ''}
      data-key-altgr={keyData.altgr ?? ''}
      data-key-code={keyData.code ?? ''}
      data-key-action={keyData.action ?? ''}
      data-active={active ? 'true' : 'false'}
    >
      {showShiftHint && <span className="absolute left-1.5 top-1 max-w-[42%] truncate text-[8px] leading-none text-[#6746B6]">{keyData.shift}</span>}
      {showAltGrHint && <span className="absolute right-1.5 top-1 max-w-[42%] truncate text-[8px] leading-none text-[#9A6100]">{keyData.altgr}</span>}
      <span className="translate-y-[1px]">{label}</span>
    </motion.button>
  );
}
