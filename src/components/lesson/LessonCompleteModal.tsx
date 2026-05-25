import { AlertTriangle, CheckCircle2, Map, RotateCcw, Sparkles } from 'lucide-react';
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
  onContinueUnavailable: () => void;
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
  onContinueUnavailable,
  onRetry,
  onPracticeWeakKeys,
}: LessonCompleteModalProps) {
  const feedbackMessage = getLessonFeedbackMessage(result, speedTargetCpm);

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 grid place-items-center bg-[#06182D]/68 px-6 backdrop-blur-sm">
      <motion.section
        data-testid="lesson-complete-modal"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-h-[92vh] w-[900px] overflow-y-auto rounded-[22px] border-[4px] border-[#B9893E] bg-gradient-to-b from-[#FFF8DC] via-[#FFFDF5] to-[#EFC36E] p-6 text-center text-[#24395F] shadow-[0_28px_70px_rgba(0,0,0,.42),inset_0_3px_0_rgba(255,255,255,.65)]"
      >
        <div className="grid items-center gap-5 text-left md:grid-cols-[120px_1fr_auto]">
          <img src={imageAssets.chest} alt="" className="mx-auto h-[92px] w-[92px] object-contain drop-shadow-[0_10px_10px_rgba(88,50,20,.25)]" />
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-black uppercase ${result.passed ? 'bg-[#E3FFD4] text-[#176D35]' : 'bg-[#FFE6DE] text-[#A32A1E]'}`}>
              {result.passed ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
              {result.passed ? 'Lesson passed' : 'Accuracy needed'}
            </div>
            <h2 className="mt-2 text-[36px] font-black leading-none">{result.passed ? 'Great work!' : 'Try again for better accuracy'}</h2>
            <p className="mt-2 max-w-[620px] text-[16px] font-black leading-snug text-[#4D371E]">{feedbackMessage}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3].map((star) => (
                <img key={star} src={imageAssets.star} alt="" className={`h-[54px] w-[54px] object-contain ${star <= result.stars ? '' : 'grayscale opacity-35'}`} />
              ))}
            </div>
            <div className="mt-1 text-[13px] font-black uppercase text-[#7A4D19]">Final score</div>
            <div className="text-[30px] font-black leading-none">{result.finalScore.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            { label: 'Accuracy', value: `${result.accuracy}%` },
            { label: 'CPM', value: result.cpm.toString() },
            { label: 'WPM', value: result.wpm.toString() },
            { label: 'Time', value: formatElapsedTime(result.elapsedSeconds) },
            { label: 'Mistakes', value: result.errorCount.toString() },
            { label: 'Backspaces', value: result.backspaceCount.toString() },
            { label: 'XP', value: `+${xp}` },
            { label: 'Coins', value: `+${coins}` },
          ].map((item) => (
            <div key={item.label} className="rounded-[14px] border-2 border-[#9B7340] bg-white/78 px-3 py-3 shadow-inner">
              <div className="text-[12px] font-black uppercase tracking-wide text-[#7A4D19]">{item.label}</div>
              <div className="mt-1 text-[25px] font-black leading-none text-[#24395F]">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_1fr] gap-3 text-left">
          <section className="rounded-[16px] border-2 border-[#A77B3C] bg-[#FFF9DF]/82 p-4 shadow-inner">
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

          <section className="rounded-[16px] border-2 border-[#A77B3C] bg-[#FFF9DF]/82 p-4 shadow-inner">
            <div className="text-[13px] font-black uppercase tracking-wide text-[#7A4D19]">Recommendation</div>
            <p className="mt-3 text-[17px] font-black leading-snug text-[#24395F]">{recommendation}</p>
            {newBadges.length > 0 && (
              <div className="mt-3 rounded-[12px] bg-[#E6FFCF] px-3 py-2 text-[15px] font-black text-[#236A2B]">
                New badge: {newBadges.map((badge) => badge.badgeName).join(', ')}
              </div>
            )}
            <div className="mt-3 rounded-[12px] bg-[#FFE9A6]/72 px-3 py-2 text-[15px] font-black text-[#513614]">
              Correct {result.acceptedCorrectInputs} / {result.totalRequiredInputs}
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <GameButton
            variant="blue"
            size="lg"
            leftIcon={<Map size={25} />}
            aria-disabled={!result.passed}
            className={!result.passed ? 'opacity-60' : undefined}
            onClick={() => {
              if (result.passed) onContinue();
              else onContinueUnavailable();
            }}
          >
            Continue
          </GameButton>
          <GameButton variant="white" size="lg" leftIcon={<RotateCcw size={25} />} onClick={onRetry}>
            Replay lesson
          </GameButton>
          <GameButton variant="purple" size="lg" leftIcon={<Sparkles size={25} />} onClick={onPracticeWeakKeys}>
            Practice weak keys
          </GameButton>
        </div>
      </motion.section>
    </div>
  );
}
