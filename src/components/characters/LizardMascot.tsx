import { motion } from 'framer-motion';
import { characterImages } from '../../assets/assetManifest';
import { cn } from '../../lib/cn';

type LizardMascotProps = {
  className?: string;
  withTiles?: boolean;
  animated?: boolean;
};

export default function LizardMascot({ className, withTiles = true, animated = true }: LizardMascotProps) {
  return (
    <motion.div
      className={cn('relative aspect-[13/14] w-full max-w-[560px]', className)}
      animate={animated ? { y: [0, -8, 0] } : undefined}
      transition={animated ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <img
        src={characterImages.lizard}
        alt="Khmer Typing Adventure lizard mascot"
        className="h-full w-full object-contain drop-shadow-[0_30px_20px_rgba(28,78,42,.3)]"
      />
      {withTiles && (
        <div className="absolute bottom-[22%] left-1/2 flex -translate-x-1/2 gap-4">
          {['ក', 'ខ', 'គ'].map((tile, index) => (
            <motion.div
              key={tile}
              className="khmer-body grid h-20 w-20 place-items-center rounded-2xl border-[3px] border-[#B08A51] bg-gradient-to-b from-[#FFFDF3] to-[#E8D5AB] text-[2.55rem] font-black text-ink shadow-[inset_0_-6px_0_rgba(105,71,27,.16),0_12px_18px_rgba(64,38,12,.28)]"
              animate={animated ? { rotate: index === 1 ? [3, -3, 3] : [-6, 3, -6], y: index === 1 ? [0, -4, 0] : [0, 3, 0] } : undefined}
              transition={animated ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
            >
              {tile}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
