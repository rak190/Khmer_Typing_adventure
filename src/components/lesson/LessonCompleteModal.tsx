import { Map, RotateCcw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import GameButton from '../game-ui/GameButton';
import { imageAssets } from '../../assets/assetManifest';
import { formatElapsedTime, getLessonFeedbackMessage, type TypingMetricResult } from '../../lib/typingMetrics';
import type { StudentBadge, WeakKeySummary } from '../../lib/studentProgress';

type LessonCompleteModalProps = {
  result: TypingMetricResult;
  speedTargetCpm: number;
  xp: number;
  coins: number;
  weakKeys: WeakKeySummary[];
  newBadges: StudentBadge[];
  recommendation: string;
  onContinue: () => void;
  onRetry: () => void;
  onPracticeWeakKeys: () => void;
};

export default function LessonCompleteModal({
  result,
  speedTargetCpm,
  xp,
  coins,
  weakKeys,
  newBadges,
  recommendation,
  onContinue,
  onRetry,
  onPracticeWeakKeys,
}: LessonCompleteModalProps) {
  const feedbackMessage = getLessonFeedbackMessage(result, speedTargetCpm);

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 grid place-items-center bg-[#06182D]/62 backdrop-blur-sm">
      <motion.section
        data-testid="lesson-complete-modal"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-[860px] rounded-[28px] border-[5px] border-[#B9893E] bg-gradient-to-b from-[#FFF8DC] via-[#FFFDF5] to-[#EFC36E] p-7 text-center text-[#24395F] shadow-[0_28px_70px_rgba(0,0,0,.42),inset_0_3px_0_rgba(255,255,255,.65)]"
      >
        <img src={imageAssets.chest} alt="" className="mx-auto h-[82px] w-[82px] object-contain drop-shadow-[0_10px_10px_rgba(88,50,20,.25)]" />
        <h2 className="khmer-body mt-1 text-[38px] font-black leading-none">{result.passed ? 'ល្អណាស់!' : 'ហាត់ម្ដងទៀត'}</h2>

        <div className="mt-4 flex justify-center gap-2">
          {[1, 2, 3].map((star) => (
            <img key={star} src={imageAssets.star} alt="" className={`h-[54px] w-[54px] object-contain ${star <= result.stars ? '' : 'grayscale opacity-35'}`} />
          ))}
        </div>

        <p className="mx-auto mt-3 max-w-[660px] text-[17px] font-black leading-snug text-[#4D371E]">{feedbackMessage}</p>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            { label: 'Accuracy', value: `${result.accuracy}%` },
            { label: 'CPM', value: result.cpm.toString() },
            { label: 'WPM', value: result.wpm.toString() },
            { label: 'Score', value: result.finalScore.toLocaleString() },
            { label: 'Mistakes', value: result.errorCount.toString() },
            { label: 'Backspaces', value: result.backspaceCount.toString() },
            { label: 'Time', value: formatElapsedTime(result.elapsedSeconds) },
            { label: 'XP', value: `+${xp}` },
          ].map((item) => (
            <div key={item.label} className="rounded-[16px] border-2 border-[#9B7340] bg-white/76 px-3 py-3 shadow-inner">
              <div className="text-[12px] font-black uppercase tracking-wide text-[#7A4D19]">{item.label}</div>
              <div className="mt-1 text-[25px] font-black leading-none text-[#24395F]">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_1fr] gap-3 text-left">
          <section className="rounded-[18px] border-2 border-[#A77B3C] bg-[#FFF9DF]/82 p-4 shadow-inner">
            <div className="text-[13px] font-black uppercase tracking-wide text-[#7A4D19]">Your weak keys today</div>
            <div className="mt-3 space-y-2 text-[17px] font-black text-[#24395F]">
              {weakKeys.length > 0 ? weakKeys.slice(0, 3).map((weakKey, index) => (
                <div key={weakKey.value} className="flex items-center justify-between rounded-[12px] bg-white/70 px-3 py-2">
                  <span>{index + 1}. <span className="khmer-body">{weakKey.value}</span></span>
                  <span>{weakKey.mistakes} mistakes</span>
                </div>
              )) : (
                <div className="rounded-[12px] bg-white/70 px-3 py-2">No weak keys found in this run.</div>
              )}
            </div>
          </section>

          <section className="rounded-[18px] border-2 border-[#A77B3C] bg-[#FFF9DF]/82 p-4 shadow-inner">
            <div className="text-[13px] font-black uppercase tracking-wide text-[#7A4D19]">Recommendation</div>
            <p className="mt-3 text-[17px] font-black leading-snug text-[#24395F]">{recommendation}</p>
            {newBadges.length > 0 && (
              <div className="mt-3 rounded-[12px] bg-[#E6FFCF] px-3 py-2 text-[15px] font-black text-[#236A2B]">
                New badge: {newBadges.map((badge) => badge.badgeName).join(', ')}
              </div>
            )}
            <div className="mt-3 rounded-[12px] bg-[#FFE9A6]/72 px-3 py-2 text-[15px] font-black text-[#513614]">
              Correct {result.acceptedCorrectInputs} / {result.totalRequiredInputs} · +{coins} coins
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <GameButton variant="blue" size="lg" leftIcon={<Map size={25} />} onClick={onContinue} disabled={!result.passed}>
            បន្តទៅផែនទី
          </GameButton>
          <GameButton variant="white" size="lg" leftIcon={<RotateCcw size={25} />} onClick={onRetry}>
            ព្យាយាមម្ដងទៀត
          </GameButton>
          <GameButton variant="purple" size="lg" leftIcon={<Sparkles size={25} />} onClick={onPracticeWeakKeys}>
            Practice Weak Keys
          </GameButton>
        </div>
      </motion.section>
    </div>
  );
}
