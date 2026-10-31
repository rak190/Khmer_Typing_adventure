import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Lock,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
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
  const isBarrierOpen = allStagesCompleted || currentBarrierStatus === 'open';

  return (
    <div
      data-testid="three-exploration-hud"
      className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-5 font-khmer select-none"
    >
      {/* ===== TOP BAR & MULTI-STAGE STEPPER ===== */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="three-back-to-map"
              onClick={() => navigate('/map')}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-white/20 bg-slate-900/85 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-slate-800 hover:border-amber-400 active:scale-95"
              title="ត្រឡប់ទៅ 2D Adventure"
            >
              <ArrowLeft className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">ត្រឡប់ទៅ 2D Map</span>
            </button>

            <div
              data-testid="three-lesson-badge"
              className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-slate-900/90 px-3 py-1.5 shadow-lg backdrop-blur-md"
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
                className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-lg backdrop-blur-md transition hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">លេងមេរៀនឡើងវិញ</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setMuted(!muted)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/20 bg-slate-900/85 text-slate-300 shadow-lg backdrop-blur-md transition hover:text-white"
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
            className="pointer-events-auto mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-white/15 bg-slate-950/85 px-3 py-1.5 sm:px-4 sm:py-2 shadow-xl backdrop-blur-md"
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
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs transition ${
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
                    <div className="text-[10px] opacity-80 font-sans hidden sm:block">
                      {stage.titleEn} • {stage.accuracyGoal}%+
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== CENTER AREA IS INTENTIONALLY UNOBSTRUCTED ===== */}
      <div className="pointer-events-none flex-1" />

      {/* ===== BOTTOM INTERFACE: MOVEMENT HINTS + COMPACT BOTTOM-CENTER QUEST BAR ===== */}
      <div className="pointer-events-none flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 sm:gap-4 pb-1">
        {/* Left: Movement hints (collapses gracefully on small screens) */}
        <div
          data-testid="three-movement-hints"
          className="pointer-events-auto hidden md:flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/80 p-2.5 sm:p-3 text-xs text-slate-300 shadow-xl backdrop-blur-md shrink-0"
        >
          <Compass className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-white">ការបញ្ជាតួអង្គ (Movement)</div>
            <div className="text-[11px] text-slate-300 font-sans mt-0.5 flex items-center gap-1">
              <span className="rounded bg-slate-800 border border-slate-700 px-1 py-0.2 font-mono text-[10px] text-amber-300">W</span>
              <span className="rounded bg-slate-800 border border-slate-700 px-1 py-0.2 font-mono text-[10px] text-amber-300">A</span>
              <span className="rounded bg-slate-800 border border-slate-700 px-1 py-0.2 font-mono text-[10px] text-amber-300">S</span>
              <span className="rounded bg-slate-800 border border-slate-700 px-1 py-0.2 font-mono text-[10px] text-amber-300">D</span>
              <span className="text-slate-400 text-[10px]">+</span>
              <span className="rounded bg-slate-800 border border-slate-700 px-1 py-0.2 font-mono text-[10px] text-amber-300">↑</span>
              <span className="rounded bg-slate-800 border border-slate-700 px-1 py-0.2 font-mono text-[10px] text-amber-300">↓</span>
              <span className="rounded bg-slate-800 border border-slate-700 px-1 py-0.2 font-mono text-[10px] text-amber-300">←</span>
              <span className="rounded bg-slate-800 border border-slate-700 px-1 py-0.2 font-mono text-[10px] text-amber-300">→</span>
            </div>
          </div>
        </div>

        {/* Center: Compact Bottom-Center Quest Bar */}
        <div className="pointer-events-auto w-full max-w-xl mx-auto">
          {isBarrierOpen ? (
            <div
              data-testid="three-gate-open-banner"
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-950/90 via-slate-950/95 to-emerald-950/90 px-4 py-2.5 shadow-[0_0_25px_rgba(16,185,129,0.35)] backdrop-blur-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shrink-0">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1 text-center sm:text-left leading-tight">
                <div className="text-xs sm:text-sm font-bold text-emerald-200">
                  ✨ មេរៀនទាំងអស់បានសម្រេចជោគជ័យ! ដើរឆ្លងកាត់ទ្វារបុរាណ
                </div>
                <div className="text-[10px] sm:text-xs text-emerald-300/80 font-sans">
                  All stages unlocked! Walk through the ancient gate to explore!
                </div>
              </div>
              {onReplayLesson && (
                <button
                  type="button"
                  data-testid="three-replay-lesson-btn"
                  onClick={onReplayLesson}
                  className="flex items-center gap-1 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/30 active:scale-95 shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">លេងឡើងវិញ</span>
                </button>
              )}
            </div>
          ) : (
            <div
              className={`flex items-center justify-between gap-2.5 sm:gap-3.5 rounded-full border-2 ${
                isNearGate
                  ? 'border-amber-400 bg-gradient-to-r from-amber-950/95 via-slate-950/95 to-amber-950/95 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                  : 'border-amber-400/70 bg-gradient-to-r from-amber-950/90 via-slate-950/95 to-amber-950/90 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              } px-3.5 py-2 sm:px-5 sm:py-2.5 backdrop-blur-md transition-all duration-300`}
            >
              {/* Glowing Book Icon Badge */}
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 shrink-0 shadow-inner">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-amber-300" />
              </div>

              {/* Central Quest Text */}
              <div className="flex-1 min-w-0 text-center sm:text-left leading-tight">
                <div className="text-xs sm:text-sm font-bold text-amber-200 truncate">
                  {isNearGate ? (
                    <>
                      ចុច <span className="text-amber-400 font-mono font-black">[E]</span> ឬ ចុចប៊ូតុងនេះ ដើម្បីចាប់ផ្តើម
                    </>
                  ) : (
                    <>
                      ដើរទៅកាន់អាសនៈ <span className="text-amber-400 font-mono font-bold">[W / ↑]</span> ហើយចុច <span className="text-amber-400 font-mono font-bold">[E]</span>
                    </>
                  )}
                </div>
                <div className="text-[10px] sm:text-xs text-amber-300/80 font-sans truncate">
                  {activeStage
                    ? `(${activeStage.titleKh} • ${activeStage.titleEn} • គោលដៅ ${activeStageMinimumAccuracy}%+)`
                    : `(Stage ${activeStageIndex + 1} • Goal ${activeStageMinimumAccuracy}%+)`}
                </div>
              </div>

              {/* Start Stage Action Button */}
              <button
                type="button"
                data-testid="three-unlock-gate-btn"
                onClick={onStartTyping}
                className={`group flex items-center gap-1.5 sm:gap-2 rounded-full border ${
                  isNearGate
                    ? 'border-yellow-300 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse'
                    : 'border-amber-400/60 bg-gradient-to-r from-amber-600/90 to-amber-500/90 text-slate-950 shadow-md'
                } px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black transition hover:scale-105 active:scale-95 shrink-0`}
                title="ចុច ឬ ចុចគ្រាប់ចុច [E] ដើម្បីចាប់ផ្តើមវគ្គរៀន"
              >
                <span className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-md bg-slate-950 text-[10px] sm:text-xs font-mono font-bold text-amber-300">
                  E
                </span>
                <span className="whitespace-nowrap font-khmer">ចាប់ផ្តើម</span>
                <ChevronRight className="h-4 w-4 text-slate-950 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Branding watermark */}
        <div className="text-right text-[11px] text-slate-400/75 hidden md:block shrink-0">
          Khmer Typing Adventure 3D
        </div>
      </div>
    </div>
  );
}
