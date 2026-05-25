import type { Achievement } from '../../types/game';
import { Link } from 'react-router-dom';
import GameBadge from './GameBadge';
import GameButton from './GameButton';

type GameAchievementStripProps = {
  achievements: Achievement[];
};

const variants = ['newbie', 'rising-star', 'skilled', 'expert', 'master', 'legend'] as const;

export default function GameAchievementStrip({ achievements }: GameAchievementStripProps) {
  return (
    <section className="rounded-[28px] border-2 border-[#CDE3F7] bg-white/80 p-5 shadow-game backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-adventure">Achievements</h2>
          <p className="font-bold text-slate-600">Collect badges as your typing skills grow.</p>
        </div>
        <Link to="/dashboard">
          <GameButton variant="purple" size="sm">View All Badges</GameButton>
        </Link>
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-1">
        {achievements.map((achievement, index) => (
          <GameBadge key={achievement.id} variant={variants[index % variants.length]} label={achievement.name} compact />
        ))}
      </div>
    </section>
  );
}
