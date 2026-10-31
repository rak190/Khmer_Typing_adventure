import { ArrowLeft, CheckCircle2, Compass, Lock, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CurriculumStage } from '../../../data/lessonCurriculum';
import type { GateStatus, StageProgressState } from '../types';

type ExplorationHudProps = {
  isNearGate: boolean;
  gateStatus: GateStatus;
  lessonTitleKh?: string;
  lessonTitleEn?: string;
  stages?: CurriculumStage[];
  stageStates?: StageProgressState[];
  activeStageIndex?: number;
  activeStageMinimumAccuracy?: number;
  allStagesCompleted?: boolean;
  onStartTyping: () => void;
  onReplayLesson?: () => void;
};

export default function ExplorationHud({
  isNearGate,
  gateStatus,
  lessonTitleKh = 'ព្យញ្ជនៈដំបូង',
  lessonTitleEn = 'First Consonants',
  stages = [],
  stageStates = [],
  activeStageIndex = 0,
  activeStageMinimumAccuracy = 90,
  allStagesCompleted = false,
  onStartTyping,
  onReplayLesson,
}: ExplorationHudProps) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);

  const activeStage = stages[activeStageIndex];
  const activeStageState = stageStates[activeStageIndex];
  const currentBarrierStatus: GateStatus = activeStageState?.status ?? gateStatus;
  const totalStageCount = stages.length || 3;

  return (
    <div
      data-testid="three-exploration-hud"
      className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6 font-khmer select-none"
    >
      {/* ===== TOP BAR & MULTI-STAGE STEPPER ===== */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2.5">
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

            <div
              data-testid="three-lesson-badge"
              className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-slate-900/85 px-3.5 py-1.5 shadow-lg backdrop-blur-md"
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-300">
                3D Lesson • {lessonTitleKh} ({lessonTitleEn})
              </span>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {allStagesCompleted && onReplayLesson && (
              <button
                type="button"
                data-testid="three-replay-lesson-btn"
                onClick={onReplayLesson}
                className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-slate-900/85 px-3 py-2 text-xs font-bold text-amber-300 shadow-lg backdrop-blur-md transition hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>លេងមេរៀនឡើងវិញ</span>
              </button>
            )}
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

        {/* Multi-Stage Curriculum Stepper */}
        {stages.length > 0 && (
          <div
            data-testid="three-stage-stepper"
            className="pointer-events-auto mx-auto flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/15 bg-slate-950/80 px-3.5 py-2 shadow-xl backdrop-blur-md"
          >
            {stages.map((stage, idx) => {
              const state = stageStates[idx];
              const isCompleted = Boolean(state?.passed && state?.status === 'open');
              const isCurrent = idx === activeStageIndex && !allStagesCompleted;
              const isLocked = !isCompleted && !isCurrent;
              const stageStatusLabel = isCompleted
                ? 'completed'
                : isCurrent
                ? 'active'
                : 'locked';

              return (
                <div
                  key={stage.id}
                  data-testid={`three-stage-badge-${idx + 1}`}
                  data-stage-status={stageStatusLabel}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition ${
                    isCompleted
                      ? 'border-emerald-400/50 bg-emerald-950/70 text-emerald-200'
                      : isCurrent
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                      : 'border-white/10 bg-slate-900/60 text-slate-400 opacity-75'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : isLocked ? (
                    <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  ) : (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shrink-0">
                      {idx + 1}
                    </span>
                  )}
                  <div className="leading-tight">
                    <div className="font-bold">
                      {idx + 1}. {stage.titleKh}
                    </div>
                    <div className="text-[10px] opacity-80 font-sans">
                      {stage.titleEn} • {stage.accuracyGoal}%+
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== CENTER PROXIMITY PROMPT ===== */}
      <div className="flex flex-col items-center justify-center">
        {!allStagesCompleted && isNearGate && currentBarrierStatus === 'closed' && (
          <div className="pointer-events-auto flex flex-col items-center gap-2">
            {activeStage && (
              <div className="rounded-xl border border-amber-400/30 bg-slate-950/85 px-4 py-1.5 text-center text-xs text-amber-200 shadow-lg backdrop-blur-md">
                <span className="font-bold">
                  ដំណាក់កាលទី {activeStageIndex + 1}/{stages.length}: {activeStage.titleKh}
                </span>{' '}
                • គោលដៅភាពត្រឹមត្រូវ {activeStageMinimumAccuracy}%+
              </div>
            )}
            <div className="transform transition-all duration-300">
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
                    {activeStage
                      ? `ចាប់ផ្តើមដំណាក់កាលទី ${activeStageIndex + 1}: ${activeStage.titleKh} (${activeStage.titleEn})`
                      : 'ដោះសោទ្វារបុរាណ (Unlock Gate)'}
                  </div>
                  <div className="text-xs font-semibold text-slate-900/80 font-sans">
                    Press [E] or Click to start Khmer Typing Challenge ({activeStageMinimumAccuracy}%+ Accuracy)
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-slate-950 animate-spin" />
              </button>
            </div>
          </div>
        )}

        {!allStagesCompleted && !isNearGate && currentBarrierStatus === 'closed' && (
          <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/85 px-5 py-3 text-center shadow-xl backdrop-blur-md">
            <span className="text-xs font-bold text-amber-200">
              {activeStage
                ? `ដើរទៅមុខ [W / ↑] ទៅកាន់អាសនៈដំណាក់កាលទី ${activeStageIndex + 1} (${activeStage.titleKh})`
                : 'ដើរទៅមុខ [W / ↑] ទៅជិតអាសនៈទ្វារបុរាណ ដើម្បីចាប់ផ្តើម'}
            </span>
            <button
              type="button"
              data-testid="three-unlock-gate-btn"
              onClick={onStartTyping}
              className="rounded-xl border border-amber-400/50 bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/30"
            >
              ឬ ចុចទីនេះដើម្បីចាប់ផ្តើមដំណាក់កាលទី {activeStageIndex + 1} (Start Stage {activeStageIndex + 1})
            </button>
          </div>
        )}

        {(allStagesCompleted || currentBarrierStatus === 'open') && (
          <div
            data-testid="three-gate-open-banner"
            className="pointer-events-auto rounded-2xl border border-emerald-400/40 bg-slate-900/90 px-5 py-2.5 text-center text-sm font-bold text-emerald-300 shadow-xl backdrop-blur-md"
          >
            ✨ មេរៀនទាំង {totalStageCount} ដំណាក់កាលបានបើកហើយ! ដើរចូលទីសក្ការៈអង្គរ (All {totalStageCount} stages unlocked! Walk through the sanctuary!)
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
          Khmer Typing Adventure 3D Multi-Stage System
        </div>
      </div>
    </div>
  );
}
