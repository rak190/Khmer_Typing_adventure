import { ArrowLeft, Compass, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GateStatus } from '../types';

type ExplorationHudProps = {
  isNearGate: boolean;
  gateStatus: GateStatus;
  onStartTyping: () => void;
};

export default function ExplorationHud({
  isNearGate,
  gateStatus,
  onStartTyping,
}: ExplorationHudProps) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);

  return (
    <div
      data-testid="three-exploration-hud"
      className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6 font-khmer select-none"
    >
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            data-testid="three-back-to-map"
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900/80 px-3.5 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-slate-800 hover:border-amber-400 active:scale-95"
            title="ត្រឡប់ទៅ 2D Adventure"
          >
            <ArrowLeft className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">ត្រឡប់ទៅ 2D Map</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-slate-900/80 px-3 py-1.5 shadow-lg backdrop-blur-md">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-300">
              3D Prototype • ទ្វារបុរាណអង្គរ
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-slate-900/80 text-slate-300 shadow-lg backdrop-blur-md transition hover:text-white"
            title={muted ? 'បើកសំឡេង' : 'បិទសំឡេង'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ===== CENTER PROXIMITY PROMPT ===== */}
      <div className="flex flex-col items-center justify-center">
        {isNearGate && gateStatus === 'closed' && (
          <div className="pointer-events-auto transform transition-all duration-300 animate-bounce">
            <button
              type="button"
              data-testid="three-unlock-gate-btn"
              onClick={onStartTyping}
              className="group flex items-center gap-3 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 px-6 py-3.5 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] transition hover:scale-105 active:scale-95"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-amber-400 font-mono font-bold text-sm">
                E
              </div>
              <div className="text-left">
                <div className="text-sm font-black tracking-wide">
                  ដោះសោទ្វារបុរាណ (Unlock Gate)
                </div>
                <div className="text-xs font-semibold text-slate-900/80 font-sans">
                  Press [E] or Click to start Khmer Typing Challenge
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-slate-950 animate-spin" />
            </button>
          </div>
        )}

        {!isNearGate && gateStatus === 'closed' && (
          <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/80 px-5 py-3 text-center shadow-xl backdrop-blur-md">
            <span className="text-xs font-bold text-amber-200">
              ដើរទៅមុខ [W / ↑] ទៅជិតអាសនៈទ្វារបុរាណ ដើម្បីចាប់ផ្តើម
            </span>
            <button
              type="button"
              data-testid="three-unlock-gate-btn"
              onClick={onStartTyping}
              className="rounded-xl border border-amber-400/50 bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/30"
            >
              ឬ ចុចទីនេះដើម្បីចាប់ផ្តើមវាយអក្សរ (Start Challenge)
            </button>
          </div>
        )}

        {gateStatus === 'open' && (
          <div
            data-testid="three-gate-open-banner"
            className="pointer-events-auto rounded-2xl border border-emerald-400/40 bg-slate-900/90 px-5 py-2.5 text-center text-sm font-bold text-emerald-300 shadow-xl backdrop-blur-md"
          >
            ✨ ទ្វារបុរាណបើកហើយ! ដើរទៅមុខដើម្បីចូលទីសក្ការៈ (Walk through into the sanctuary!)
          </div>
        )}
      </div>

      {/* ===== BOTTOM BAR & MOVEMENT CONTROLS ===== */}
      <div className="flex items-end justify-between">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/75 p-3 text-xs text-slate-300 shadow-xl backdrop-blur-md">
          <Compass className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-white">ការបញ្ជាតួអង្គ (Movement)</div>
            <div className="text-[11px] text-slate-400 font-sans">
              [W][A][S][D] ឬ [↑][←][↓][→] ដើម្បីដើរ
            </div>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-400/80 hidden sm:block">
          Khmer Typing Adventure 3D Prototype
        </div>
      </div>
    </div>
  );
}
