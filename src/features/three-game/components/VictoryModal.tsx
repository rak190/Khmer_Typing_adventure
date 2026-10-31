import { ArrowRight, RotateCcw, Star, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PrototypeReward } from '../types';

type VictoryModalProps = {
  passed: boolean;
  reward: PrototypeReward | null;
  onWalkThrough: () => void;
  onRetry: () => void;
};

export default function VictoryModal({
  passed,
  reward,
  onWalkThrough,
  onRetry,
}: VictoryModalProps) {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-khmer text-white select-none">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-in fade-in zoom-in-95 duration-300">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Trophy / Icon */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-400 bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 shadow-lg">
          {passed ? <Trophy className="h-10 w-10 animate-bounce" /> : <RotateCcw className="h-10 w-10" />}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-amber-300">
          {passed ? 'ទ្វារបុរាណត្រូវបានដោះសោ!' : 'ព្យាយាមម្តងទៀត!'}
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-300 font-sans">
          {passed
            ? 'The Ancient Angkor Gate has opened!'
            : 'Focus on accuracy to open the ancient stone gate.'}
        </p>

        {/* Stars */}
        {passed && (
          <div className="my-5 flex items-center justify-center gap-2">
            {[1, 2, 3].map((starIdx) => {
              const active = reward ? starIdx <= reward.stars : true;
              return (
                <div
                  key={starIdx}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                    active
                      ? 'border-amber-400 bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'border-white/10 bg-slate-800/40 text-slate-600'
                  }`}
                >
                  <Star className={`h-6 w-6 ${active ? 'fill-amber-400' : ''}`} />
                </div>
              );
            })}
          </div>
        )}

        {/* Metrics Grid */}
        {reward && (
          <div className="my-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
              <div className="text-xs font-bold text-slate-400">ភាពត្រឹមត្រូវ (Accuracy)</div>
              <div className="text-2xl font-black text-emerald-400 font-sans">
                {Math.round(reward.accuracy)}%
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
              <div className="text-xs font-bold text-slate-400">ល្បឿន (CPM)</div>
              <div className="text-2xl font-black text-amber-400 font-sans">
                {reward.cpm}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
              <div className="text-xs font-bold text-slate-400">ពិន្ទុ XP រៀនសូត្រ</div>
              <div className="text-xl font-black text-blue-400 font-sans">
                +{reward.xpEarned} XP
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
              <div className="text-xs font-bold text-slate-400">កាក់មាស</div>
              <div className="text-xl font-black text-yellow-400 font-sans">
                +{reward.coinsEarned} 🪙
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          {passed ? (
            <button
              onClick={onWalkThrough}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-6 py-3.5 font-black text-slate-950 shadow-xl transition hover:brightness-110 active:scale-95"
            >
              <span>ដើរកាត់ទ្វារបុរាណ (Walk Through Gate)</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-amber-400 active:scale-95"
            >
              <RotateCcw className="h-5 w-5" />
              <span>សាកល្បងម្តងទៀត (Try Again)</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="flex-1 rounded-xl border border-white/20 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              អនុវត្តម្តងទៀត
            </button>
            <button
              onClick={() => navigate('/map')}
              className="flex-1 rounded-xl border border-white/20 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              ត្រឡប់ទៅ Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
