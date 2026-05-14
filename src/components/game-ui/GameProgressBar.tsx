import { cn } from '../../lib/cn';

type GameProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'green' | 'blue' | 'purple' | 'gold' | 'red';
  className?: string;
};

const fills = {
  green: 'from-[#B9FF68] via-[#4DDB63] to-[#129548]',
  blue: 'from-[#A4EEFF] via-[#35A7FF] to-[#0962C1]',
  purple: 'from-[#D7B8FF] via-[#8B63FF] to-[#5A36CD]',
  gold: 'from-[#FFF47A] via-[#FFC83F] to-[#EF8813]',
  red: 'from-[#FFAAA8] via-[#FF5A5F] to-[#C92734]',
};

export default function GameProgressBar({ value, max = 100, label, showValue = false, variant = 'green', className }: GameProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black text-[#27405C]">
          {label && <span>{label}</span>}
          {showValue && <span>{value} / {max}</span>}
        </div>
      )}
      <div className="h-5 overflow-hidden rounded-full border-2 border-white/70 bg-[#183D63]/25 shadow-inner">
        <div
          className={cn('relative h-full rounded-full bg-gradient-to-r transition-all duration-500 before:absolute before:inset-x-2 before:top-1 before:h-1/3 before:rounded-full before:bg-white/40 before:content-[""]', fills[variant])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
