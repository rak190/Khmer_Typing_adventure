import { motion } from 'framer-motion';
import { handImages } from '../../assets/assetManifest';
import { cn } from '../../lib/cn';

export type FingerId = 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'left-thumb' | 'right-thumb' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky';

type TypingHandsProps = {
  activeHand: 'left' | 'right' | 'thumb';
  activeFinger: FingerId;
};

const fingerGroups: Array<{ hand: 'left' | 'right'; fingers: Array<{ id: FingerId; label: string }> }> = [
  {
    hand: 'left',
    fingers: [
      { id: 'left-pinky', label: 'P' },
      { id: 'left-ring', label: 'R' },
      { id: 'left-middle', label: 'M' },
      { id: 'left-index', label: 'I' },
      { id: 'left-thumb', label: 'T' },
    ],
  },
  {
    hand: 'right',
    fingers: [
      { id: 'right-thumb', label: 'T' },
      { id: 'right-index', label: 'I' },
      { id: 'right-middle', label: 'M' },
      { id: 'right-ring', label: 'R' },
      { id: 'right-pinky', label: 'P' },
    ],
  },
];

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
          'pointer-events-none absolute bottom-[-184px] left-[170px] h-[172px] w-[306px] -rotate-[4deg] object-contain',
          leftActive ? `opacity-[.28] ${glow}` : 'opacity-[.11] drop-shadow-[0_12px_12px_rgba(35,18,8,.12)]',
        )}
      />
      <motion.img
        src={handImages.rightTyping}
        alt=""
        draggable={false}
        animate={rightActive ? { y: [0, -2, 0] } : { y: 0 }}
        transition={{ duration: 0.8, repeat: rightActive ? Infinity : 0, ease: 'easeInOut' }}
        className={cn(
          'pointer-events-none absolute bottom-[-184px] right-[154px] h-[172px] w-[306px] rotate-[4deg] object-contain',
          rightActive ? `opacity-[.28] ${glow}` : 'opacity-[.11] drop-shadow-[0_12px_12px_rgba(35,18,8,.12)]',
        )}
      />
      <div className="lesson-finger-strip">
        {fingerGroups.map((group) => (
          <div key={group.hand} className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wide text-white/62">{group.hand}</span>
            {group.fingers.map((finger) => (
              <span
                key={finger.id}
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full border text-[12px] font-black',
                  finger.id === activeFinger
                    ? 'border-[#FFE26D] bg-[#FFE26D] text-[#12314C] shadow-[0_0_16px_rgba(255,226,109,.72)]'
                    : 'border-white/18 bg-white/10 text-white/60',
                )}
              >
                {finger.label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
