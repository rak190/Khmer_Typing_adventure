import { AlertTriangle, Check, Gauge, Lock, ScrollText, Star, Target, Zap } from 'lucide-react';
import { cn } from '../../lib/cn';

export type QuestStageState = {
  label: string;
  state: 'completed' | 'current' | 'locked';
};

type QuestScrollProps = {
  objective: string;
  progress: number;
  total: number;
  nextKey: string;
  keyHint: string;
  handHint: string;
  stages: QuestStageState[];
  accuracy: number;
  minimumAccuracy: number;
  cpm: number;
  speedTargetCpm: number;
  stars: number;
  xp: number;
};

function visibleKey(key: string) {
  return key === ' ' ? 'Spacebar' : key;
}

export default function QuestScroll({
  objective,
  progress,
  total,
  nextKey,
  keyHint,
  handHint,
  stages,
  accuracy,
  minimumAccuracy,
  cpm,
  speedTargetCpm,
  stars,
  xp,
}: QuestScrollProps) {
  const progressPercent = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  const belowAccuracyTarget = accuracy < minimumAccuracy;
  const shortFingerHint = handHint.replace(/^Use /, 'Use ');

  return (
    <aside data-testid="quest-scroll" className="lesson-scroll-board pointer-events-none absolute right-[40px] top-[132px] z-30 h-[820px] w-[340px] px-6 py-6 text-[#4C2D14]">
      <div className="lesson-scroll-roller absolute left-5 right-5 top-3 h-3" />
      <div className="lesson-scroll-roller absolute bottom-3 left-5 right-5 h-3" />

      <div className="flex items-center gap-3 text-[#24395F]">
        <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#B68A45] bg-[#FFF4C4] text-[#7B4C20]">
          <ScrollText size={27} />
        </span>
        <div>
          <h2 className="khmer-body text-[29px] font-black leading-none">បេសកកម្ម</h2>
          <div className="text-[12px] font-black uppercase tracking-wide text-[#8B5A20]">Typing goal</div>
        </div>
      </div>

      <div className="mt-5 border-t-2 border-[#B58749]/35 pt-4">
        <div className="text-[12px] font-black uppercase tracking-wide text-[#754617]">Objective</div>
        <p className="khmer-body mt-1 line-clamp-2 text-[18px] font-bold leading-snug text-[#27324A]">{objective}</p>
      </div>

      <div className="mt-5 border-t-2 border-[#B58749]/35 pt-4">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div className="text-[12px] font-black uppercase tracking-wide text-[#754617]">Progress</div>
          <div className="text-[15px] font-black text-[#24395F]">{progress} / {total} characters</div>
        </div>
        <div className="rounded-full border-2 border-[#A9783B]/45 bg-[#7A4B22]/18 p-1 shadow-inner">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-[#2FAE66] via-[#78D77C] to-[#FFE16A] shadow-[0_0_10px_rgba(98,190,96,.35)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-1 text-right text-[12px] font-black text-[#755126]">
          {progressPercent}%
        </div>

        <div className="mt-4 space-y-2">
          {stages.map((stage) => (
            <div
              key={stage.label}
              className={cn(
                'flex min-h-[40px] items-center gap-3 rounded-[12px] border px-3 py-2 text-[14px] font-black shadow-inner',
                stage.state === 'completed' && 'border-[#53B96A]/70 bg-[#E8FFD8] text-[#176D35]',
                stage.state === 'current' && 'border-[#C89B32]/80 bg-[#FFF3BE] text-[#553C10]',
                stage.state === 'locked' && 'border-[#B6B0A8]/70 bg-[#EFE9DF] text-[#77736D]',
              )}
            >
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full',
                  stage.state === 'completed' && 'bg-[#24A84B] text-white',
                  stage.state === 'current' && 'bg-[#C89B32] text-white',
                  stage.state === 'locked' && 'bg-[#BDB7AF] text-white',
                )}
              >
                {stage.state === 'completed' ? <Check size={18} strokeWidth={4} /> : stage.state === 'locked' ? <Lock size={16} /> : <span className="h-2.5 w-2.5 rounded-full bg-current" />}
              </span>
              <span className="min-w-0 truncate">{stage.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t-2 border-[#B58749]/35 pt-4">
        <div className="text-[12px] font-black uppercase tracking-wide text-[#754617]">Next key</div>
        <div className="mt-2 rounded-[16px] border-2 border-[#9D7342]/70 bg-[#FFF3C9]/74 p-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="grid min-h-[48px] min-w-[70px] max-w-[128px] place-items-center rounded-[12px] border-2 border-[#7A5430] bg-gradient-to-b from-[#FFF9D9] to-[#DDBA70] px-3 text-center shadow-[inset_0_-4px_0_rgba(93,58,28,.18)]">
              <span className="khmer-display max-w-full truncate text-[24px] font-black leading-none text-[#17325A]">{visibleKey(nextKey)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-black text-[#34507A]">{keyHint}</div>
              <div className="mt-1 text-[14px] font-black leading-snug text-[#7B4C20]">{shortFingerHint}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t-2 border-[#B58749]/35 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[13px] border border-[#B58749]/45 bg-white/42 p-3 shadow-inner">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-black uppercase text-[#754617]"><Target size={14} /> Accuracy</div>
            <div className="text-[20px] font-black text-[#24395F]">{accuracy}% <span className="text-[12px] text-[#755126]">/ {minimumAccuracy}%</span></div>
          </div>
          <div className="rounded-[13px] border border-[#B58749]/45 bg-white/42 p-3 shadow-inner">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-black uppercase text-[#754617]"><Gauge size={14} /> CPM</div>
            <div className="text-[20px] font-black text-[#24395F]">{cpm} <span className="text-[12px] text-[#755126]">/ {speedTargetCpm}</span></div>
          </div>
        </div>
        {belowAccuracyTarget && (
          <div className="mt-2 flex items-start gap-2 rounded-[12px] border border-[#C67A2F]/45 bg-[#FFF0C7] px-3 py-2 text-[12px] font-black leading-snug text-[#8A4C16]">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>Slow down and focus on correct keys.</span>
          </div>
        )}
      </div>

      <div className="mt-5 border-t-2 border-[#B58749]/35 pt-4">
        <div className="text-[12px] font-black uppercase tracking-wide text-[#754617]">Rewards</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-center text-[13px] font-black text-[#24395F]">
          <div className="rounded-[13px] border border-[#B58749]/45 bg-white/42 px-3 py-3 shadow-inner">
            <Star className="mx-auto mb-1 text-[#D29B18]" size={24} fill="currentColor" />
            Stars {stars}
          </div>
          <div className="rounded-[13px] border border-[#B58749]/45 bg-white/42 px-3 py-3 shadow-inner">
            <Zap className="mx-auto mb-1 text-[#2476B8]" size={24} fill="currentColor" />
            +{xp} XP
          </div>
        </div>
      </div>
    </aside>
  );
}
