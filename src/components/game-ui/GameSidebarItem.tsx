import { cn } from '../../lib/cn';
import GameIcon, { type GameIconName } from './GameIcon';

type GameSidebarItemProps = {
  icon: GameIconName;
  khmer: string;
  subtitle: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function GameSidebarItem({ icon, khmer, subtitle, active = false, onClick, className }: GameSidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'pointer-events-auto flex min-w-44 cursor-pointer items-center gap-3 rounded-[24px] border-[3px] border-[#74451C]/60 bg-gradient-to-b from-[#FFF4CE] via-[#F6D184] to-[#D79948] p-3 text-left shadow-[inset_0_-5px_0_rgba(92,55,25,.18),0_13px_22px_rgba(33,81,107,.2)] transition hover:-translate-y-0.5 xl:min-w-0 xl:flex-col xl:text-center',
        active ? 'ring-4 ring-white ring-offset-2 ring-offset-gold' : '',
        className,
      )}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-white/70 bg-gradient-to-b from-[#7BD8FF] to-[#1E78E6] text-white shadow-button">
        <GameIcon name={icon} size={31} className="text-white" />
      </span>
      <span className="min-w-0">
        <span className="khmer-body block text-lg font-black text-[#4C2D17]">{khmer}</span>
        <span className="block text-xs font-black uppercase text-[#87613A]">{subtitle}</span>
      </span>
    </button>
  );
}
