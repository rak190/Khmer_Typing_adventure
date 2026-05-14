import { Lock, Star } from 'lucide-react';
import type { LessonStage } from '../../types/game';
import ProgressBar from './ProgressBar';

type LessonCardProps = {
  stage: LessonStage;
  progress?: number;
};

export default function LessonCard({ stage, progress = 75 }: LessonCardProps) {
  const locked = stage.status === 'locked';

  return (
    <div className={`game-card rounded-2xl p-4 ${locked ? 'opacity-70 grayscale' : ''}`}>
      <div className="h-24 rounded-xl bg-[linear-gradient(180deg,#8FE7FF,#80D26A)] p-3">
        <div className="island-shape mx-auto h-20 w-28" />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <div className="khmer-body text-lg font-black text-primary">{stage.khmer}</div>
          <div className="font-black text-slateGame">{stage.english}</div>
        </div>
        {locked ? <Lock className="text-slate-500" /> : <span className="khmer-body rounded-xl bg-mint px-3 py-1 font-black text-primary">កម្រិត {stage.id}</span>}
      </div>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3].map((star) => (
          <Star key={star} size={18} className={star <= stage.stars ? 'fill-gold text-[#E29800]' : 'fill-slate-300 text-slate-300'} />
        ))}
      </div>
      <ProgressBar value={locked ? 0 : progress} color={locked ? 'blue' : 'green'} className="mt-3" />
    </div>
  );
}
