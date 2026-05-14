import { achievements } from '../../data/mockData';
import Badge from './Badge';
import GameButton from './GameButton';

export default function AchievementStrip() {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-[#3430A7] to-purple p-4 text-white shadow-game">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="khmer-body shrink-0 text-lg font-black">សមិទ្ធផលថ្មីៗ</div>
        <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {achievements.map((achievement) => (
            <Badge key={achievement.id} icon={achievement.icon} label={achievement.name} subtitle={achievement.subtitle} tone={achievement.tone} compact />
          ))}
        </div>
        <GameButton variant="purple" size="sm">View All Badges</GameButton>
      </div>
    </section>
  );
}
