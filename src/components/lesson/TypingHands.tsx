import { motion } from 'framer-motion';
import { handImages } from '../../assets/assetManifest';
import { cn } from '../../lib/cn';

type TypingHandsProps = {
  activeHand: 'left' | 'right' | 'both';
};

export default function TypingHands({ activeHand }: TypingHandsProps) {
  const glow = 'drop-shadow-[0_0_18px_rgba(83,235,102,.72)] drop-shadow-[0_18px_18px_rgba(35,18,8,.3)]';

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <motion.img
        src={handImages.leftTyping}
        alt=""
        draggable={false}
        animate={activeHand === 'left' || activeHand === 'both' ? { y: [0, -4, 0] } : { y: 0 }}
        transition={{ duration: 0.8, repeat: activeHand === 'left' || activeHand === 'both' ? Infinity : 0, ease: 'easeInOut' }}
        className={cn(
          'pointer-events-none absolute bottom-[-76px] left-[158px] h-[214px] w-[370px] -rotate-[4deg] object-contain opacity-[.85]',
          activeHand === 'left' || activeHand === 'both' ? glow : 'drop-shadow-[0_18px_18px_rgba(35,18,8,.26)]',
        )}
      />
      <motion.img
        src={handImages.rightTyping}
        alt=""
        draggable={false}
        animate={activeHand === 'right' || activeHand === 'both' ? { y: [0, -4, 0] } : { y: 0 }}
        transition={{ duration: 0.8, repeat: activeHand === 'right' || activeHand === 'both' ? Infinity : 0, ease: 'easeInOut' }}
        className={cn(
          'pointer-events-none absolute bottom-[-76px] right-[142px] h-[214px] w-[370px] rotate-[4deg] object-contain opacity-[.85]',
          activeHand === 'right' || activeHand === 'both' ? glow : 'drop-shadow-[0_18px_18px_rgba(35,18,8,.26)]',
        )}
      />
    </div>
  );
}
