import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { formatElapsedTime, type TypingMetricResult } from '../../lib/typingMetrics';

type TypingTargetCardProps = {
  lessonTitle: string;
  skillFocus: string;
  targetText: string;
  typedText: string;
  currentText: string;
  keyHint: string;
  handHint: string;
  metrics: TypingMetricResult;
  speedTargetCpm: number;
  minimumAccuracy: number;
  feedbackState?: 'correct' | 'wrong';
  feedbackMessage?: string;
};

function visibleTarget(target: string) {
  return target === ' ' ? 'Spacebar' : target;
}

export default function TypingTargetCard({
  lessonTitle,
  skillFocus,
  targetText,
  typedText,
  currentText,
  keyHint,
  handHint,
  metrics,
  speedTargetCpm,
  minimumAccuracy,
  feedbackState,
  feedbackMessage,
}: TypingTargetCardProps) {
  const remainingText = targetText.slice(typedText.length + currentText.length);

  return (
    <motion.section
      data-testid="typing-target-card"
      key={targetText}
      initial={{ y: 10, opacity: 0.86 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'lesson-stone-plaque lesson-guide-bubble pointer-events-none absolute left-[390px] top-[122px] z-20 h-[430px] w-[850px] px-9 py-7 text-left',
        feedbackState === 'wrong' ? 'lesson-stone-plaque--wrong' : feedbackState === 'correct' ? 'lesson-stone-plaque--correct' : 'lesson-stone-plaque--idle',
      )}
    >
      <div className="relative z-20">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="khmer-body text-[17px] font-black text-[#AEEBFF]">{lessonTitle}</div>
            <h1 className="mt-1 text-[30px] font-black leading-tight text-white">{skillFocus}</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[13px] font-black text-white">
            <span className="lesson-live-stat">Acc {metrics.accuracy}%</span>
            <span className="lesson-live-stat">CPM {metrics.cpm}</span>
            <span className="lesson-live-stat">Goal {minimumAccuracy}%</span>
            <span className="lesson-live-stat">Target {speedTargetCpm}</span>
          </div>
        </div>

        <div className="mt-5 rounded-[18px] border-2 border-[#7ED8FF]/26 bg-[#041F3D]/58 p-5 shadow-inner">
          <div className="mb-2 flex items-center justify-between text-[13px] font-black uppercase tracking-wide text-[#BDEFFF]">
            <span>Target Text</span>
            <span>{metrics.acceptedCorrectInputs} / {metrics.totalRequiredInputs}</span>
          </div>
          <div data-testid="typing-target" data-target={currentText} className="khmer-body min-h-[116px] text-[34px] font-black leading-[1.85] text-white">
            <span className="text-[#83FFC0]">{typedText}</span>
            <span className="lesson-current-text">{visibleTarget(currentText)}</span>
            <span className="text-white/48">{remainingText}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_1fr_auto] items-center gap-3">
          <span className="lesson-target-chip">{keyHint}</span>
          <span className="lesson-target-chip lesson-target-chip--finger">{handHint}</span>
          <span className="lesson-target-chip">Time {formatElapsedTime(metrics.elapsedSeconds)}</span>
        </div>

        <div
          className={cn(
            'khmer-body mt-3 min-h-[32px] text-center text-[18px] font-black',
            feedbackState === 'wrong' ? 'text-[#FFB2A8]' : feedbackState === 'correct' ? 'text-[#98FFB8]' : 'text-[#D7F3FF]',
          )}
        >
          {feedbackMessage ?? ' '}
        </div>
      </div>
    </motion.section>
  );
}
