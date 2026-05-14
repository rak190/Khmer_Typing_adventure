import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import GameIcon from '../game-ui/GameIcon';
import GameProgressBar from '../game-ui/GameProgressBar';

type RewardChestProps = {
  progress?: number;
  max?: number;
  compact?: boolean;
};

export default function RewardChest({ progress = 450, max = 1000, compact = false }: RewardChestProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-gold/50 bg-gradient-to-br from-[#FFF4C8] to-white p-4 shadow-game">
      <Sparkles className="absolute right-4 top-4 text-gold" size={22} />
      <div className="flex items-center gap-4">
        <motion.div animate={{ rotate: [0, -2, 2, 0], y: [0, -2, 0] }} transition={{ duration: 2.4, repeat: Infinity }} className="relative grid h-20 w-24 shrink-0 place-items-center">
          <GameIcon name="chest" size={82} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="khmer-body text-sm font-black text-[#7A4B11]">រង្វាន់ Chest</div>
          {!compact && <p className="text-sm font-bold text-slate-600">Keep learning to unlock more rewards!</p>}
          <GameProgressBar value={progress} max={max} variant="green" showValue className="mt-2" />
        </div>
      </div>
    </div>
  );
}
