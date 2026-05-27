import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import GameButton from './GameButton';

type ActionModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  actionLabel?: string;
  onClose: () => void;
};

export default function ActionModal({ open, title, children, actionLabel = 'បិទ', onClose }: ActionModalProps) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[80] grid place-items-center bg-[#06182D]/68 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="action-modal-title">
      <section className="relative max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-[22px] border-[4px] border-[#B9893E] bg-gradient-to-b from-[#FFF8DC] via-[#FFFDF5] to-[#EFC36E] p-6 text-[#24395F] shadow-[0_28px_70px_rgba(0,0,0,.42),inset_0_3px_0_rgba(255,255,255,.65)]">
        <button
          type="button"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-[#B75A42] bg-gradient-to-b from-[#FF9EA1] to-[#D73542] text-white shadow-button focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        <h2 id="action-modal-title" className="pr-12 text-[28px] font-black leading-tight text-[#4D2D10]">{title}</h2>
        <div className="mt-4 space-y-3 text-[16px] font-bold leading-snug text-[#4D371E]">{children}</div>
        <GameButton variant="gold" size="md" className="mt-6 w-full" onClick={onClose}>
          {actionLabel}
        </GameButton>
      </section>
    </div>
  );
}
