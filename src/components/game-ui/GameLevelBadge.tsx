import { cn } from '../../lib/cn';

type GameLevelBadgeProps = {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = {
  sm: 'h-12 w-11 text-sm',
  md: 'h-16 w-14 text-lg',
  lg: 'h-24 w-20 text-2xl',
};

export default function GameLevelBadge({ level, size = 'md', className }: GameLevelBadgeProps) {
  return (
    <div className={cn('relative grid place-items-center', sizes[size], className)}>
      <svg viewBox="0 0 80 92" className="absolute inset-0 h-full w-full drop-shadow-lg" aria-hidden="true">
        <path d="M40 4 72 17v26c0 22-12 37-32 45C20 80 8 65 8 43V17L40 4Z" fill="#1E78E6" stroke="#075DC0" strokeWidth="6" />
        <path d="M40 10 65 21v20c0 18-8 30-25 38C23 71 15 59 15 41V21L40 10Z" fill="url(#levelGloss)" />
        <defs>
          <linearGradient id="levelGloss" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#74D9FF" />
            <stop offset="1" stopColor="#1268D8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative text-center font-black leading-none text-white">
        <div className="text-[10px] uppercase text-sky">Level</div>
        <div className="text-gold">{level}</div>
      </div>
    </div>
  );
}
