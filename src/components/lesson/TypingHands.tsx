import { motion } from 'framer-motion';
import { handImages } from '../../assets/assetManifest';
import { cn } from '../../lib/cn';

export type FingerId = 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'left-thumb' | 'right-thumb' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky';

type TypingHandsProps = {
  activeHand: 'left' | 'right' | 'thumb';
  activeFinger: FingerId;
};

export default function TypingHands({ activeHand, activeFinger }: TypingHandsProps) {
  const glow = 'drop-shadow-[0_0_10px_rgba(83,235,102,.24)] drop-shadow-[0_12px_12px_rgba(35,18,8,.16)]';
  const leftActive = activeHand === 'left' || activeHand === 'thumb';
  const rightActive = activeHand === 'right' || activeHand === 'thumb';

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" data-active-finger={activeFinger}>
      <motion.img
        src={handImages.leftTyping}
        alt=""
        draggable={false}
        animate={leftActive ? { y: [0, -2, 0] } : { y: 0 }}
        transition={{ duration: 0.8, repeat: leftActive ? Infinity : 0, ease: 'easeInOut' }}
        className={cn(
          'pointer-events-none absolute bottom-[-166px] left-[170px] h-[172px] w-[306px] -rotate-[4deg] object-contain',
          leftActive ? `opacity-[.35] ${glow}` : 'opacity-[.15] drop-shadow-[0_12px_12px_rgba(35,18,8,.12)]',
        )}
      />
      <motion.img
        src={handImages.rightTyping}
        alt=""
        draggable={false}
        animate={rightActive ? { y: [0, -2, 0] } : { y: 0 }}
        transition={{ duration: 0.8, repeat: rightActive ? Infinity : 0, ease: 'easeInOut' }}
        className={cn(
          'pointer-events-none absolute bottom-[-166px] right-[154px] h-[172px] w-[306px] rotate-[4deg] object-contain',
          rightActive ? `opacity-[.35] ${glow}` : 'opacity-[.15] drop-shadow-[0_12px_12px_rgba(35,18,8,.12)]',
        )}
      />
    </div>
  );
}
