import { Link } from 'react-router-dom';
import { buildAdventureWorlds, getLessonState } from '../../../data/adventureWorlds';
import { isThreeLessonSupported } from '../../../data/threeLessonAvailability';

type GamePauseMenuProps = {
  onResume: () => void;
};

const destinations = [
  { label: 'World Map', path: '/map' },
  { label: 'Progress', path: '/dashboard' },
  { label: 'Shop', path: '/shop' },
  { label: 'Profile', path: '/profile' },
] as const;

export default function GamePauseMenu({ onResume }: GamePauseMenuProps) {
  const world = buildAdventureWorlds()[0];

  return (
    <div className="absolute inset-0 z-[80] grid place-items-center bg-slate-950/75 p-4 font-khmer backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="three-pause-title" data-testid="three-pause-menu">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border-2 border-amber-300/70 bg-slate-900 p-6 text-white shadow-2xl">
        <h2 id="three-pause-title" className="text-center text-2xl font-bold text-amber-200">Pause · ផ្អាក</h2>
        <p className="mt-2 text-center text-sm text-slate-300">Your lesson progress stays saved while you explore.</p>
        <button type="button" autoFocus onClick={onResume} className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 hover:bg-amber-300">Resume · បន្ត</button>
        <nav className="mt-3 grid grid-cols-2 gap-2" aria-label="Adventure shortcuts">
          {destinations.map(({ label, path }) => (
            <Link key={path} to={path} className="rounded-xl border border-white/20 bg-slate-800 px-3 py-3 text-center font-semibold hover:border-amber-300 hover:bg-slate-700">{label}</Link>
          ))}
        </nav>
        <h3 className="mt-6 text-lg font-bold text-amber-200">Temple Jungle · Lessons</h3>
        <p className="mb-3 text-xs text-slate-300">Completed lessons can be replayed. Finish each lesson to unlock the next.</p>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="World 1 lessons">
          <Link to="/game?foundation=1" className="rounded-xl border border-emerald-400/40 bg-emerald-950/60 px-3 py-2 text-center text-sm font-semibold hover:border-emerald-300">Home row foundation</Link>
          {world.lessons.map((lesson) => {
            const available = getLessonState(world, lesson) !== 'locked' && isThreeLessonSupported(world.id, lesson.id);
            return available ? (
              <Link key={lesson.id} to={`/game?world=${world.id}&level=${lesson.id}`} className="rounded-xl border border-amber-400/40 bg-slate-800 px-3 py-2 text-center text-sm font-semibold hover:border-amber-300" aria-label={`Play ${lesson.labelEn} in 3D`}>
                {lesson.id === 'boss' ? 'Boss' : `Lesson ${lesson.id}`}<span className="block truncate text-xs font-normal text-slate-300">{lesson.labelEn}</span>
              </Link>
            ) : (
              <div key={lesson.id} className="rounded-xl border border-white/10 bg-slate-800/50 px-3 py-2 text-center text-sm text-slate-400" aria-label={`${lesson.labelEn} locked`}>
                {lesson.id === 'boss' ? 'Boss' : `Lesson ${lesson.id}`}<span className="block truncate text-xs">Locked</span>
              </div>
            );
          })}
        </nav>
        <p className="mt-4 text-center text-xs text-slate-400">Press Escape to resume.</p>
      </div>
    </div>
  );
}
