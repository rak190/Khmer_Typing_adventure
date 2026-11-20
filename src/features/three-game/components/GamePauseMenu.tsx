import { useState } from 'react';
import { Compass, BookOpen, Award, ShoppingBag, User, Settings as SettingsIcon, MapPin } from 'lucide-react';
import { buildAdventureWorlds, getLessonState } from '../../../data/adventureWorlds';
import { isThreeLessonSupported } from '../../../data/threeLessonAvailability';
import { WORLD_CHECKPOINTS } from '../physics/Checkpoints';
import { isFastTravelDiscovered, isCheckpointDiscovered } from '../../../lib/explorationRecord';
import type { ServiceTab } from '../services/InWorldServicesModal';

type GamePauseMenuProps = {
  onResume: () => void;
  onOpenService?: (service: ServiceTab) => void;
  onFastTravel?: (position: [number, number, number]) => void;
};

export default function GamePauseMenu({ onResume, onOpenService, onFastTravel }: GamePauseMenuProps) {
  const [selectedWorldIndex, setSelectedWorldIndex] = useState(0);
  const worlds = buildAdventureWorlds();
  const currentWorld = worlds[selectedWorldIndex] ?? worlds[0];

  const discoveredCheckpoints = WORLD_CHECKPOINTS.filter(
    (cp) => isFastTravelDiscovered(cp.id) || isCheckpointDiscovered(cp.id),
  );

  return (
    <div
      className="absolute inset-0 z-[80] grid place-items-center bg-slate-950/80 p-4 font-khmer backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="three-pause-title"
      data-testid="three-pause-menu"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-amber-300/80 bg-slate-900 p-6 text-white shadow-2xl">
        <h2 id="three-pause-title" className="text-center text-2xl font-bold text-amber-200">
          Pause · ផ្អាកការលេង
        </h2>
        <p className="mt-1 text-center text-xs text-slate-300">
          Your progress and adventure state are preserved in real-time.
        </p>

        <button
          type="button"
          autoFocus
          onClick={onResume}
          className="mt-4 w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300 active:scale-98"
        >
          Resume Adventure · បន្តការផ្សងព្រេង
        </button>

        {/* In-World Service Shortcuts */}
        <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-amber-200">
          World Services · សេវាកម្មក្នុងពិភព
        </h3>
        <nav className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Adventure services">
          {[
            { id: 'map', label: 'World Map', kh: 'ផែនទីពិភពលោក', icon: Compass },
            { id: 'sanctuary', label: 'Lessons', kh: 'វិហារអក្ខរក្រម', icon: BookOpen },
            { id: 'observatory', label: 'Progress', kh: 'ហោរាសាស្រ្ត', icon: Award },
            { id: 'market', label: 'Market / Shop', kh: 'ផ្សារបុរាណ', icon: ShoppingBag },
            { id: 'wardrobe', label: 'Wardrobe', kh: 'ភូសន្តរាភរណ៍', icon: User },
            { id: 'settings', label: 'Settings', kh: 'ការកំណត់', icon: SettingsIcon },
          ].map(({ id, label, kh, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                onResume();
                onOpenService?.(id as ServiceTab);
              }}
              className="flex flex-col items-center justify-center rounded-xl border border-white/15 bg-slate-800/90 p-3 text-center transition hover:border-amber-300 hover:bg-slate-700"
            >
              <Icon className="h-5 w-5 text-amber-300 mb-1" />
              <span className="text-xs font-bold text-white">{label}</span>
              <span className="text-[10px] text-slate-400">{kh}</span>
            </button>
          ))}
        </nav>

        {/* Discovered Fast-Travel Checkpoints */}
        {discoveredCheckpoints.length > 0 && onFastTravel && (
          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-400" />
              Discovered Fast Travel · ផ្លូវកាត់ធ្វើដំណើរ ({discoveredCheckpoints.length})
            </h3>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {discoveredCheckpoints.map((cp) => (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => {
                    onResume();
                    onFastTravel(cp.position);
                  }}
                  className="flex items-center justify-between rounded-xl border border-sky-400/30 bg-sky-950/40 px-3 py-2 text-left text-xs transition hover:border-sky-300 hover:bg-sky-900/60"
                >
                  <div>
                    <div className="font-bold text-white">{cp.nameKh}</div>
                    <div className="text-[10px] text-slate-400">{cp.nameEn}</div>
                  </div>
                  <span className="rounded bg-sky-400/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                    Teleport &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* World Lesson Navigator */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-200">
              Curriculum Lessons · មេរៀន
            </h3>
            <div className="flex gap-1">
              {worlds.map((w, idx) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWorldIndex(idx)}
                  className={`rounded-lg px-2 py-0.5 text-xs font-bold transition ${
                    selectedWorldIndex === idx
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  W{w.id}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            {currentWorld.titleKh} ({currentWorld.title})
          </p>

          <nav className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="World lessons">
            {selectedWorldIndex === 0 && (
              <a
                href="/game?foundation=1"
                className="rounded-xl border border-emerald-400/40 bg-emerald-950/60 px-3 py-2 text-center text-sm font-semibold hover:border-emerald-300"
              >
                Home row foundation
              </a>
            )}
            {currentWorld.lessons.map((lesson) => {
              const available =
                getLessonState(currentWorld, lesson) !== 'locked' &&
                isThreeLessonSupported(currentWorld.id, lesson.id);
              return available ? (
                <a
                  key={lesson.id}
                  href={`/game?world=${currentWorld.id}&level=${lesson.id}`}
                  className="rounded-xl border border-amber-400/40 bg-slate-800 px-3 py-2 text-center text-sm font-semibold hover:border-amber-300"
                  aria-label={`Play ${lesson.labelEn} in 3D`}
                >
                  {lesson.id === 'boss' ? 'Boss' : `Lesson ${lesson.id}`}
                  <span className="block truncate text-xs font-normal text-slate-300">{lesson.labelEn}</span>
                </a>
              ) : (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-white/10 bg-slate-800/50 px-3 py-2 text-center text-sm text-slate-400"
                  aria-label={`${lesson.labelEn} locked`}
                >
                  {lesson.id === 'boss' ? 'Boss' : `Lesson ${lesson.id}`}
                  <span className="block truncate text-xs">Locked</span>
                </div>
              );
            })}
          </nav>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Press Escape or click Resume to continue.
        </p>
      </div>
    </div>
  );
}
