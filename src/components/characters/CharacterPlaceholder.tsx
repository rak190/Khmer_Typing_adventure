import { motion } from 'framer-motion';
import { characterImages } from '../../assets/assetManifest';
import { cn } from '../../lib/cn';

type CharacterPlaceholderProps = {
  type: 'lizard' | 'elephant' | 'guardian';
  className?: string;
  withTiles?: boolean;
};

const imageMap = {
  lizard: characterImages.lizard,
  elephant: characterImages.elephant,
  guardian: characterImages.guardian,
};

const altMap = {
  lizard: 'Green lizard mascot',
  elephant: 'Elephant guide character',
  guardian: 'Stone Guardian boss',
};

export default function CharacterPlaceholder({ type, className, withTiles = false }: CharacterPlaceholderProps) {
  return (
    <motion.div
      className={cn('relative h-80 w-72', type === 'lizard' ? 'h-96 w-80' : '', className)}
      animate={{ y: [0, type === 'guardian' ? -4 : -6, 0] }}
      transition={{ duration: type === 'guardian' ? 2.8 : 3.2, repeat: Infinity }}
      aria-label={altMap[type]}
    >
      <img src={imageMap[type]} alt={altMap[type]} className="h-full w-full object-contain drop-shadow-[0_24px_20px_rgba(0,0,0,.25)]" />
      {withTiles && type === 'lizard' && (
        <div className="absolute bottom-28 left-1/2 flex -translate-x-1/2 gap-3">
          {['ក', 'ខ', 'គ'].map((tile, index) => (
            <motion.div
              key={tile}
              className="khmer-body grid h-16 w-16 rotate-[-5deg] place-items-center rounded-2xl border-2 border-[#BFAE8B] bg-[#FFF9E9] text-3xl font-black shadow-button"
              animate={{ rotate: index === 1 ? 5 : -5 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              {tile}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
