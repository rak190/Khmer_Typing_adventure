import { Map, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import GameButton from '../game-ui/GameButton';
import { imageAssets } from '../../assets/assetManifest';

type LessonCompleteModalProps = {
  stars: number;
  accuracy: number;
  xp: number;
  coins: number;
  onContinue: () => void;
  onRetry: () => void;
};

export default function LessonCompleteModal({ stars, accuracy, xp, coins, onContinue, onRetry }: LessonCompleteModalProps) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-50 grid place-items-center bg-[#06182D]/62 backdrop-blur-sm">
      <motion.section
        data-testid="lesson-complete-modal"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-[650px] rounded-[32px] border-[5px] border-[#B9893E] bg-gradient-to-b from-[#FFF8DC] via-[#FFFDF5] to-[#EFC36E] p-7 text-center text-[#24395F] shadow-[0_28px_70px_rgba(0,0,0,.42),inset_0_3px_0_rgba(255,255,255,.65)]"
      >
        <img src={imageAssets.chest} alt="" className="mx-auto h-[92px] w-[92px] object-contain drop-shadow-[0_10px_10px_rgba(88,50,20,.25)]" />
        <h2 className="khmer-body mt-1 text-[44px] font-black leading-none">ល្អណាស់!</h2>

        <div className="mt-5 flex justify-center gap-2">
          {[1, 2, 3].map((star) => (
            <img key={star} src={imageAssets.star} alt="" className={`h-[58px] w-[58px] object-contain ${star <= stars ? '' : 'grayscale opacity-35'}`} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'ភាពត្រឹមត្រូវ', value: `${accuracy}%` },
            { label: 'XP ទទួលបាន', value: `+${xp}` },
            { label: 'កាក់ទទួលបាន', value: `+${coins}` },
          ].map((item) => (
            <div key={item.label} className="rounded-[20px] border-2 border-[#9B7340] bg-white/76 px-3 py-4 shadow-inner">
              <div className="text-[13px] font-black uppercase tracking-wide text-[#7A4D19]">{item.label}</div>
              <div className="mt-1 text-[34px] font-black leading-none text-[#24395F]">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <GameButton variant="blue" size="lg" leftIcon={<Map size={26} />} onClick={onContinue}>
            បន្តទៅផែនទី
          </GameButton>
          <GameButton variant="white" size="lg" leftIcon={<RotateCcw size={26} />} onClick={onRetry}>
            ព្យាយាមម្តងទៀត
          </GameButton>
        </div>
      </motion.section>
    </div>
  );
}
