import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { formatElapsedTime, type TypingMetricResult } from '../../lib/typingMetrics';

type TypingTargetCardProps = {
  lessonTitle: string;
  skillFocus: string;
  targetText: string;
  typedText: string;
  currentText: string;
  keyHint?: string;
  handHint?: string;
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
        'lesson-stone-plaque lesson-guide-bubble pointer-events-none absolute left-[330px] top-[120px] z-20 h-[420px] w-[930px] px-8 py-7 text-left',
        feedbackState === 'wrong' ? 'lesson-stone-plaque--wrong' : feedbackState === 'correct' ? 'lesson-stone-plaque--correct' : 'lesson-stone-plaque--idle',
      )}
    >
      <div className="relative z-20">
        <div className="grid grid-cols-[1fr_390px] items-start gap-5">
          <div className="min-w-0">
            <div className="khmer-body text-[16px] font-black text-[#AEEBFF]">{lessonTitle}</div>
            <h1 className="mt-1 text-[29px] font-black leading-tight text-white">{skillFocus}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-[13px] font-black text-[#D7F3FF]">
              <span className="rounded-full border border-[#7ED8FF]/28 bg-white/8 px-3 py-1">Target accuracy {minimumAccuracy}%</span>
              <span className="rounded-full border border-[#7ED8FF]/28 bg-white/8 px-3 py-1">Target CPM {speedTargetCpm}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[13px] font-black text-white">
            <span className="lesson-live-stat"><span className="block text-[10px] uppercase text-white/62">Accuracy</span>{metrics.accuracy}%</span>
            <span className="lesson-live-stat"><span className="block text-[10px] uppercase text-white/62">CPM</span>{metrics.cpm}</span>
            <span className="lesson-live-stat"><span className="block text-[10px] uppercase text-white/62">Mistakes</span>{metrics.errorCount}</span>
            <span className="lesson-live-stat"><span className="block text-[10px] uppercase text-white/62">Backspace</span>{metrics.backspaceCount}</span>
          </div>
        </div>

        <div className="mt-5 rounded-[16px] border-2 border-[#7ED8FF]/30 bg-[#031B36]/64 p-5 shadow-inner">
          <div className="mb-2 flex items-center justify-between text-[12px] font-black uppercase tracking-wide text-[#BDEFFF]">
            <span>Text to type</span>
            <span>{metrics.acceptedCorrectInputs} / {metrics.totalRequiredInputs}</span>
          </div>
          <div data-testid="typing-target" data-target={currentText} className="khmer-body min-h-[116px] text-[38px] font-black leading-[1.75] text-white">
            <span className="text-[#99FFC9]">{typedText}</span>
            <span className="lesson-current-text">{visibleTarget(currentText)}</span>
            <span className="text-white/48">{remainingText}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <span className="lesson-target-chip">Time {formatElapsedTime(metrics.elapsedSeconds)}</span>
        </div>

        <div
          className={cn(
            'khmer-body mt-3 min-h-[30px] text-center text-[17px] font-black',
            feedbackState === 'wrong' ? 'text-[#FFB2A8]' : feedbackState === 'correct' ? 'text-[#98FFB8]' : 'text-[#D7F3FF]',
          )}
        >
          {feedbackMessage ?? ' '}
        </div>
      </div>
    </motion.section>
  );
}
