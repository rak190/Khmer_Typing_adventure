import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import GameButton from './GameButton';
import GameIcon, { type GameIconName } from './GameIcon';

type GameModalProps = {
  open?: boolean;
  title: ReactNode;
  children: ReactNode;
  rewardIcon?: GameIconName;
  actionLabel?: string;
  inline?: boolean;
  onClose?: () => void;
  onAction?: () => void;
};

export default function GameModal({ open = true, title, children, rewardIcon, actionLabel = 'OK', inline = false, onClose, onAction }: GameModalProps) {
  if (!open) return null;

  const panel = (
    <section className="relative w-full max-w-md rounded-[30px] border-[4px] border-[#D5B16D] bg-gradient-to-b from-white to-[#FFF4D8] p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,.35)]">
      <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-[#B75A42] bg-gradient-to-b from-[#FF9EA1] to-[#D73542] text-white shadow-button" onClick={onClose} aria-label="Close">
        <X size={22} />
      </button>
      {rewardIcon && <GameIcon name={rewardIcon} size={68} className="mx-auto mb-3" />}
      <h2 className="khmer-display text-3xl text-[#17325A]">{title}</h2>
      <div className="mt-3 font-bold text-[#536170]">{children}</div>
      <GameButton variant="gold" size="lg" className="mt-6 w-full" onClick={onAction ?? onClose}>
        {actionLabel}
      </GameButton>
    </section>
  );

  if (inline) return <div className="grid place-items-center rounded-3xl bg-[#06203A]/30 p-4">{panel}</div>;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#06203A]/55 p-4 backdrop-blur-sm">
      {panel}
    </div>
  );
}
