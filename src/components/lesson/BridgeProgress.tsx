import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

type BridgeProgressProps = {
  progress: number;
  total: number;
  segments?: number;
};

export default function BridgeProgress({ progress, total, segments }: BridgeProgressProps) {
  const brickCount = Math.max(1, segments ?? total);
  const completedSegments = Math.min(brickCount, Math.max(0, progress));
  const currentSegment = Math.min(brickCount - 1, completedSegments);

  return (
    <div className="lesson-brick-progress relative mx-auto mt-1 h-[76px] w-full max-w-[735px]">
      <div className="lesson-brick-progress-track absolute left-2 right-2 top-[27px] h-[36px]" />
      <div className="relative flex h-full items-center justify-center gap-1.5 px-3">
        {Array.from({ length: brickCount }, (_, index) => {
          const complete = index < completedSegments;
          const current = !complete && index === currentSegment && progress < total;
          return (
            <motion.div
              key={index}
              animate={
                complete
                  ? { y: [10, -2, 0], opacity: [0.45, 1, 1], boxShadow: '0 0 12px rgba(84, 232, 92, .45), 0 0 10px rgba(255, 215, 78, .45)' }
                  : current
                    ? { y: [0, -3, 0], boxShadow: ['0 0 0 rgba(255, 224, 86, 0)', '0 0 14px rgba(255, 224, 86, .65)', '0 0 0 rgba(255, 224, 86, 0)'] }
                    : { y: 0 }
              }
              transition={{ duration: current ? 1.1 : 0.35, repeat: current ? Infinity : 0, ease: 'easeInOut' }}
              className={cn(
                'lesson-progress-brick relative block h-[38px] flex-1',
                index % 2 === 0 ? '-rotate-2' : 'rotate-2',
                complete ? 'lesson-progress-brick--filled' : 'lesson-progress-brick--empty',
                current && 'lesson-progress-brick--current',
              )}
            >
              <span className="pointer-events-none absolute inset-x-1 top-1 h-1.5 rounded-full bg-white/18" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
