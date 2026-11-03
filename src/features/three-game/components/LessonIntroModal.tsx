import {
  BookOpen,
  ChevronRight,
  Compass,
  Play,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useEffect } from 'react';
import type { AdventureNodeId } from '../../../data/adventureWorlds';
import type { CurriculumStage } from '../../../data/lessonCurriculum';
import { getLessonExperienceConfig, isCustomExperienceSupported } from '../config/lessonExperienceConfig';

type LessonIntroModalProps = {
  isOpen: boolean;
  onStart: () => void;
  lessonId?: AdventureNodeId;
  lessonTitleKh?: string;
  lessonTitleEn?: string;
  stages?: CurriculumStage[];
};

export default function LessonIntroModal({
  isOpen,
  onStart,
  lessonId,
  lessonTitleKh = 'មេរៀន 3D',
  lessonTitleEn = '3D Lesson',
  stages = [],
}: LessonIntroModalProps) {
  const isCustomExp = isCustomExperienceSupported(lessonId);
  const expConfig = isCustomExp && lessonId ? getLessonExperienceConfig(lessonId) : null;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.key === 'e' ||
        e.key === 'E' ||
        e.key === 'Escape'
      ) {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onStart]);

  if (!isOpen) return null;

  const titleKh = expConfig ? expConfig.titleKh : lessonTitleKh;
  const titleEn = expConfig ? expConfig.titleEn : lessonTitleEn;
  const missionKh = expConfig
    ? expConfig.introMissionKh
    : `បេសកកម្ម៖ ហាត់វាយអក្សរខ្មែរឱ្យបានត្រឹមត្រូវ និងដោះសោទ្វារប្រាសាទបុរាណ។`;
  const missionEn = expConfig
    ? expConfig.introMissionEn
    : `Mission: Practice accurate Khmer typing to unlock the ancient temple sanctuary.`;
  const skillKh = expConfig ? expConfig.educationalSkillKh : '';
  const skillEn = expConfig ? expConfig.educationalSkillEn : '';

  return (
    <div
      data-testid="three-lesson-intro-modal"
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-khmer text-white select-none animate-in fade-in duration-300"
    >
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border-2 border-amber-500/70 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-7 text-center shadow-[0_0_50px_rgba(245,158,11,0.35)]">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Level Icon Badge */}
        <div className="mx-auto mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-2 border-amber-400 bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 shadow-lg">
          {lessonId === 'boss' ? (
            <Trophy className="h-7 w-7 sm:h-8 sm:w-8 animate-pulse" />
          ) : (
            <Compass className="h-7 w-7 sm:h-8 sm:w-8" />
          )}
        </div>

        {/* World & Category Subtitle */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-300">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>ពិភពទី ១ • ព្រៃប្រាសាទបុរាណ (World 1 • Ancient Temple)</span>
        </div>

        {/* Title */}
        <h2
          data-testid="three-intro-modal-title"
          className="mt-2 text-xl sm:text-2xl font-black text-amber-300"
        >
          {titleKh}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-300 font-sans">
          {titleEn}
        </p>

        {/* Main Mission Briefing Card */}
        <div className="my-4 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-amber-950/60 p-4 text-left shadow-inner">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
            <BookOpen className="h-4 w-4 text-amber-400 shrink-0" />
            <span>គោលបំណងបេសកកម្ម (Mission Objective)</span>
          </div>
          <p
            data-testid="three-intro-mission-kh"
            className="text-sm sm:text-base font-bold text-amber-100 leading-snug"
          >
            {missionKh}
          </p>
          <p
            data-testid="three-intro-mission-en"
            className="text-xs text-amber-200/80 font-sans mt-1"
          >
            {missionEn}
          </p>
        </div>

        {/* Pedagogical Target Skill */}
        {skillKh && (
          <div className="mb-4 rounded-xl border border-white/10 bg-slate-800/60 p-2.5 text-left text-xs">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>ជំនាញហាត់ម្រាមដៃ (Target Touch-Typing Skill)</span>
            </div>
            <div className="text-slate-200 mt-0.5">{skillKh}</div>
            <div className="text-[11px] text-slate-400 font-sans mt-0.5">{skillEn}</div>
          </div>
        )}

        {/* 3-Stage Journey Roadmap */}
        {stages.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
            {stages.map((stg, idx) => (
              <div
                key={stg.id}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950">
                  {idx + 1}
                </span>
                <span className="font-bold truncate max-w-[120px]">{stg.titleKh}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            data-testid="three-intro-start-btn"
            onClick={onStart}
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-6 py-2.5 text-sm sm:text-base font-black text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition hover:scale-105 active:scale-95"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            <span>ចាប់ផ្តើមបេសកកម្ម</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="mt-3 text-[11px] text-slate-400 font-sans flex items-center justify-center gap-1.5">
          <span>ចុច</span>
          <kbd className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">Space</kbd>
          <span>ឬ</span>
          <kbd className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">Enter</kbd>
          <span>ដើម្បីចាប់ផ្តើមរុករក</span>
        </div>
      </div>
    </div>
  );
}
