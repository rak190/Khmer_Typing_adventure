import { CheckCircle2, Coins } from 'lucide-react';
import type { Quest } from '../../types/game';
import ProgressBar from './ProgressBar';

export default function QuestCard({ quest }: { quest: Quest }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-mint/80 p-3 shadow-inner">
      <div className="flex items-center gap-3">
        <CheckCircle2 className={quest.complete ? 'fill-primary text-white' : 'text-primary'} size={25} />
        <div className="min-w-0 flex-1">
          <div className="khmer-body font-black text-primary">{quest.khmerTitle}</div>
          <div className="text-sm font-bold text-slate-700">{quest.title}</div>
        </div>
        <div className="flex items-center gap-1 font-black text-[#9C6100]">
          <Coins size={18} />
          {quest.rewardCoins}
        </div>
      </div>
      <ProgressBar value={quest.progress} max={quest.total} color="green" showValue className="mt-2" />
    </div>
  );
}
