import { motion } from 'framer-motion';
import { imageAssets } from '../../assets/assetManifest';

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export default function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <motion.div
      className={`relative inline-flex flex-col items-center ${className}`}
      whileHover={{ rotate: compact ? 0 : -1, scale: 1.02 }}
      aria-label="Khmer Typing Adventure"
    >
      <img
        src={imageAssets.logo}
        alt="Khmer Typing"
        className={compact ? 'h-auto max-h-20 w-auto max-w-[180px] object-contain' : 'h-auto max-h-32 w-auto max-w-[300px] object-contain'}
      />
      {!compact && (
        <div className="khmer-body -mt-2 rounded-full bg-[#683B1E] px-3 py-0.5 text-xs font-bold text-white shadow">
          ហ្គេមវាយអក្សរខ្មែរ!
        </div>
      )}
    </motion.div>
  );
}
