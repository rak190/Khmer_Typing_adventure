import type { Student } from '../../types/game';
import LevelBadge from './LevelBadge';
import XPBar from './XPBar';
import StatPill from './StatPill';
import { Flame, Gauge, Target } from 'lucide-react';

export default function StudentCard({ student }: { student: Student }) {
  return (
    <section className="game-card rounded-3xl p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="grid min-h-44 min-w-40 place-items-center rounded-2xl bg-gradient-to-b from-[#7ED9FF] to-[#62D16E] text-7xl shadow-inner">
          {student.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black text-slateGame">{student.name}</h2>
              <p className="font-bold text-adventure">Explorer in Training</p>
            </div>
            <LevelBadge level={student.level} />
          </div>
          <XPBar xp={8450} nextXp={12000} className="mt-4" />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatPill icon={<Gauge size={20} />} label="WPM" value={student.wpm} tone="green" />
            <StatPill icon={<Target size={20} />} label="Accuracy" value={`${student.accuracy}%`} tone="blue" />
            <StatPill icon={<Flame size={20} />} label="Streak" value={student.streak} tone="gold" />
          </div>
        </div>
      </div>
    </section>
  );
}
