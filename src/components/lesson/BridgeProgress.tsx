import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

type BridgeProgressProps = {
  progress: number;
  total: number;
  segments?: number;
};

export default function BridgeProgress({ progress, total, segments = 12 }: BridgeProgressProps) {
  const completedSegments = progress <= 0 ? 0 : Math.ceil((progress / Math.max(1, total)) * segments);
  const currentSegment = Math.min(segments - 1, completedSegments);

  return (
    <div className="relative mx-auto mt-1 h-[76px] w-full max-w-[735px]">
      <div className="absolute left-8 right-8 top-[39px] h-3 rounded-full bg-[#68401E] shadow-[0_5px_0_rgba(54,31,14,.25)]" />
      <div className="relative flex h-full items-center justify-center gap-2.5">
        {Array.from({ length: segments }, (_, index) => {
          const complete = index < completedSegments;
          const current = !complete && index === currentSegment && progress < total;
          return (
            <motion.span
              key={index}
              animate={
                complete
                  ? { y: [0, -2, 0], boxShadow: '0 0 22px rgba(84, 232, 92, .7), 0 0 14px rgba(255, 215, 78, .55)' }
                  : current
                    ? { y: [0, -3, 0], boxShadow: ['0 0 0 rgba(255, 224, 86, 0)', '0 0 18px rgba(255, 224, 86, .7)', '0 0 0 rgba(255, 224, 86, 0)'] }
                    : { y: 0 }
              }
              transition={{ duration: current ? 1.1 : 0.35, repeat: current ? Infinity : 0, ease: 'easeInOut' }}
              className={cn(
                'relative block h-[52px] flex-1 rounded-[10px] border-[3px] shadow-[inset_0_3px_0_rgba(255,255,255,.35),0_7px_0_rgba(78,46,22,.34)]',
                index % 2 === 0 ? '-rotate-2' : 'rotate-2',
                complete
                  ? 'border-[#1C7B38] bg-gradient-to-b from-[#FFF083] via-[#83EA5A] to-[#1EA746]'
                  : 'border-[#8B5A2C] bg-gradient-to-b from-[#C58A4A] via-[#9C6633] to-[#70411F]',
                current && 'border-[#E9B63F] ring-4 ring-[#FFD85D]/28',
              )}
            >
              <span className="pointer-events-none absolute inset-x-2 top-2 h-2 rounded-full bg-white/22" />
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
