import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

type TypingTargetCardProps = {
  target: string;
  handHint: string;
  feedbackState?: 'correct' | 'wrong';
  feedbackMessage?: string;
};

function visibleTarget(target: string) {
  return target === ' ' ? 'Spacebar' : target;
}

export default function TypingTargetCard({ target, handHint, feedbackState, feedbackMessage }: TypingTargetCardProps) {
  return (
    <motion.section
      data-testid="typing-target-card"
      key={target}
      initial={{ y: 10, opacity: 0.86 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'pointer-events-none absolute left-[544px] top-[410px] z-20 h-[220px] w-[520px] rounded-[30px] border-[5px] px-7 py-4 text-center shadow-[inset_0_3px_0_rgba(255,255,255,.62),inset_0_-7px_0_rgba(74,57,45,.15),0_16px_24px_rgba(0,48,86,.24)]',
        feedbackState === 'wrong'
          ? 'border-[#B83C37] bg-gradient-to-b from-[#FFE6DE] to-[#E9B28A]'
          : feedbackState === 'correct'
            ? 'border-[#1E873D] bg-gradient-to-b from-[#F5FFD9] to-[#B8E66C]'
            : 'border-[#7E6A52] bg-gradient-to-b from-[#FFF8E8] via-[#F8E9C4] to-[#C6B094]',
      )}
    >
      <div className="khmer-body text-[16px] font-black tracking-wide text-[#81531F]">ចុចគ្រាប់ចុចដែលបង្ហាញ</div>
      <div data-testid="typing-target" data-target={target} className="khmer-display -mt-3 grid h-[126px] place-items-center text-[98px] font-normal leading-none text-[#171B28]">
        {visibleTarget(target)}
      </div>
      <div className="khmer-body flex items-center justify-center text-[20px] font-black leading-tight text-[#26395C]">
        <span>{handHint}</span>
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
