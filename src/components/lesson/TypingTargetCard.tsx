import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

type TypingTargetCardProps = {
  target: string;
  keyHint: string;
  handHint: string;
  feedbackState?: 'correct' | 'wrong';
  feedbackMessage?: string;
};

function visibleTarget(target: string) {
  return target === ' ' ? 'Spacebar' : target;
}

export default function TypingTargetCard({ target, keyHint, handHint, feedbackState, feedbackMessage }: TypingTargetCardProps) {
  return (
    <motion.section
      data-testid="typing-target-card"
      key={target}
      initial={{ y: 10, opacity: 0.86 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'lesson-stone-plaque pointer-events-none absolute left-[544px] top-[158px] z-20 h-[220px] w-[520px] px-7 py-4 text-center',
        feedbackState === 'wrong' ? 'lesson-stone-plaque--wrong' : feedbackState === 'correct' ? 'lesson-stone-plaque--correct' : 'lesson-stone-plaque--idle',
      )}
    >
      <div className="khmer-body text-[16px] font-black tracking-wide text-[#81531F]">ចុចគ្រាប់ចុចដែលបង្ហាញ</div>
      <div data-testid="typing-target" data-target={target} className="khmer-display lesson-plaque-glyph -mt-3 grid h-[112px] place-items-center text-[94px] font-normal leading-none">
        {visibleTarget(target)}
      </div>
      <div className="flex items-center justify-center gap-3 text-[18px] font-black leading-tight text-[#26395C]">
        <span className="lesson-target-chip">{keyHint}</span>
        <span className="lesson-target-chip lesson-target-chip--finger">{handHint}</span>
      </div>
      <div
        className={cn(
          'mt-2 min-h-[26px] text-[18px] font-black',
          feedbackState === 'wrong' ? 'text-[#C8302B]' : feedbackState === 'correct' ? 'text-[#14853A]' : 'text-[#76542B]',
        )}
      >
        {feedbackMessage ?? ' '}
      </div>
    </motion.section>
  );
}
