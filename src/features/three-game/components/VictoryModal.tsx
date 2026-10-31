import { ArrowRight, CheckCircle2, RotateCcw, Star, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CurriculumStage } from '../../../data/lessonCurriculum';
import type { TypingMetricResult } from '../../../lib/typingMetrics';
import type { PrototypeReward, StageCompletionSummary, StageProgressState } from '../types';

type VictoryModalProps = {
  passed: boolean;
  minimumAccuracy: number;
  reward: PrototypeReward | null;
  stageSummary?: StageCompletionSummary | null;
  stages?: CurriculumStage[];
  stageStates?: StageProgressState[];
  finalLessonMetrics?: TypingMetricResult | null;
  isDuplicateReward?: boolean;
  onWalkThrough: () => void;
  onRetry: () => void;
  onReplayLesson?: () => void;
};

export default function VictoryModal({
  passed,
  minimumAccuracy,
  reward,
  stageSummary = null,
  stages = [],
  stageStates = [],
  finalLessonMetrics = null,
  isDuplicateReward = false,
  onWalkThrough,
  onRetry,
  onReplayLesson,
}: VictoryModalProps) {
  const navigate = useNavigate();

  const isFinalStage = stageSummary ? stageSummary.isFinalStage : true;
  const isFinalLessonComplete = passed && isFinalStage;
  const totalStageCount = stages.length || 3;
  const displayMetrics =
    isFinalLessonComplete && finalLessonMetrics
      ? finalLessonMetrics
      : stageSummary?.metrics ?? null;

  const displayAccuracy = displayMetrics ? displayMetrics.accuracy : reward?.accuracy ?? 0;
  const displayCpm = displayMetrics ? displayMetrics.cpm : reward?.cpm ?? 0;
  const displayStars = displayMetrics ? displayMetrics.stars : reward?.stars ?? 0;
  const displayScore = displayMetrics ? displayMetrics.finalScore : reward?.score ?? 0;
  const foundationSummary = stageSummary?.foundationPracticeSummary ?? null;

  return (
    <div
      data-testid="three-victory-modal"
      data-passed={passed ? 'true' : 'false'}
      data-final-lesson-complete={isFinalLessonComplete ? 'true' : 'false'}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-khmer text-white select-none"
    >
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-7 text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-in fade-in zoom-in-95 duration-300">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Trophy / Icon */}
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-400 bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 shadow-lg">
          {passed ? <Trophy className="h-8 w-8 animate-bounce" /> : <RotateCcw className="h-8 w-8" />}
        </div>

        {/* Title */}
        <h2 data-testid="three-modal-title" className="text-xl sm:text-2xl font-black text-amber-300">
          {isFinalLessonComplete
            ? `បញ្ចប់មេរៀនទាំង ${totalStageCount} ដំណាក់កាលដោយជោគជ័យ!`
            : passed && stageSummary
            ? `ដំណាក់កាលទី ${stageSummary.stageIndex + 1} បានបើកហើយ! • ${stageSummary.titleKh}`
            : passed
            ? 'ទ្វារបុរាណត្រូវបានដោះសោ!'
            : stageSummary
            ? `ព្យាយាមម្តងទៀត • ដំណាក់កាលទី ${stageSummary.stageIndex + 1} (${stageSummary.titleKh})`
            : 'ព្យាយាមម្តងទៀត!'}
        </h2>
        <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-300 font-sans">
          {isFinalLessonComplete
            ? `Lesson Complete! All ${totalStageCount} Ancient Khmer Stages Unlocked!`
            : passed && stageSummary
            ? `${stageSummary.titleEn} unlocked! Proceed to Stage ${stageSummary.stageIndex + 2}.`
            : `Need at least ${minimumAccuracy}% accuracy to unlock this stage barrier.`}
        </p>

        {/* Stars */}
        {passed && (
          <div className="my-4 flex items-center justify-center gap-2">
            {[1, 2, 3].map((starIdx) => {
              const active = starIdx <= displayStars;
              return (
                <div
                  key={starIdx}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    active
                      ? 'border-amber-400 bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'border-white/10 bg-slate-800/40 text-slate-600'
                  }`}
                >
                  <Star className={`h-5 w-5 ${active ? 'fill-amber-400' : ''}`} />
                </div>
              );
            })}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="my-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-2.5">
            <div className="text-[11px] font-bold text-slate-400">ភាពត្រឹមត្រូវ (Accuracy)</div>
            <div
              data-testid="three-modal-accuracy"
              className={`text-xl sm:text-2xl font-black font-sans ${
                displayAccuracy >= minimumAccuracy ? 'text-emerald-400' : 'text-coral'
              }`}
            >
              {Math.round(displayAccuracy)}%
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-2.5">
            <div className="text-[11px] font-bold text-slate-400">ល្បឿន (CPM)</div>
            <div
              data-testid="three-modal-cpm"
              className="text-xl sm:text-2xl font-black text-amber-400 font-sans"
            >
              {displayCpm}
            </div>
          </div>

          {isFinalLessonComplete && reward && (
            <>
              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-2.5">
                <div className="text-[11px] font-bold text-slate-400">ពិន្ទុ XP រៀនសូត្រ</div>
                <div
                  data-testid="three-modal-xp"
                  className="text-lg sm:text-xl font-black text-blue-400 font-sans"
                >
                  +{isDuplicateReward ? 0 : reward.xpEarned} XP
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-2.5">
                <div className="text-[11px] font-bold text-slate-400">កាក់មាស & ពិន្ទុសរុប</div>
                <div
                  data-testid="three-modal-coins"
                  data-score={displayScore}
                  className="text-lg sm:text-xl font-black text-yellow-400 font-sans"
                >
                  +{isDuplicateReward ? 0 : reward.coinsEarned} 🪙 • {displayScore} pts
                </div>
              </div>
            </>
          )}
        </div>

        {isFinalLessonComplete && isDuplicateReward && (
          <div
            data-testid="three-modal-duplicate-reward-notice"
            className="mb-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200"
          >
            រង្វាន់មេរៀននេះត្រូវបានទទួលរួចហើយក្នុងវគ្គនេះ (Lesson reward already claimed this session)
          </div>
        )}

        {/* Stage Summary Breakdown on Final Completion */}
        {isFinalLessonComplete && stages.length > 0 && stageStates.length > 0 && (
          <div
            data-testid="three-modal-stage-breakdown"
            className="my-3 rounded-2xl border border-white/10 bg-slate-950/75 p-3 text-left"
          >
            <div className="mb-2 text-xs font-bold text-amber-300">
              សង្ខេបលទ្ធផលតាមដំណាក់កាល (Stage Breakdown):
            </div>
            <div className="space-y-1.5">
              {stages.map((st, idx) => {
                const stState = stageStates[idx];
                return (
                  <div
                    key={st.id}
                    data-testid={`three-modal-stage-row-${idx + 1}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/80 px-3 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="font-bold text-white">
                        {idx + 1}. {st.titleKh} ({st.titleEn})
                      </span>
                    </div>
                    <div className="font-sans text-slate-300">
                      <span className="font-bold text-emerald-400">
                        {stState?.bestAccuracy ?? 0}%
                      </span>{' '}
                      • <span className="font-bold text-amber-300">{stState?.bestCpm ?? 0} CPM</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Foundation Practice Summary (Keys Practiced, Strong/Weak Keys, Next Lesson Guidance) */}
        {isFinalLessonComplete && foundationSummary && (
          <div
            data-testid="three-foundation-practice-summary"
            className="my-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/35 p-3.5 text-left space-y-2"
          >
            <div className="text-xs font-black text-emerald-300">
              ✋ សង្ខេបការហាត់ទីតាំងដៃ និងគ្រាប់ចុច (Touch-Typing Foundation Summary)
            </div>
            <p className="text-xs text-slate-200">{foundationSummary.feedbackKh}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/10 bg-slate-900/80 p-2">
                <div className="font-bold text-amber-300 mb-1">
                  គ្រាប់ចុចដែលបានហាត់ ({foundationSummary.keysPracticed.length}):
                </div>
                <div
                  data-testid="three-foundation-keys-practiced"
                  className="flex flex-wrap gap-1 font-mono"
                >
                  {foundationSummary.keysPracticed.map((k) => (
                    <span
                      key={k.code}
                      className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-white border border-white/15"
                    >
                      {k.latin} ({k.khmer})
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/80 p-2 space-y-1">
                <div>
                  <span className="font-bold text-emerald-400">គ្រាប់ចុចខ្លាំង (Strong): </span>
                  <span data-testid="three-foundation-strong-keys" className="font-mono text-slate-200">
                    {foundationSummary.strongKeys.length > 0
                      ? foundationSummary.strongKeys.map((k) => k.latin).join(', ')
                      : 'កំពុងកសាងបទពិសោធន៍'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-coral">គ្រាប់ចុចត្រូវហាត់បន្ថែម (Weak): </span>
                  <span data-testid="three-foundation-weak-keys" className="font-mono text-slate-200">
                    {foundationSummary.weakKeys.length > 0
                      ? foundationSummary.weakKeys.map((k) => `${k.latin}(${k.accuracy}%)`).join(', ')
                      : 'គ្មានកំហុស (100%)'}
                  </span>
                </div>
              </div>
            </div>
            <div
              data-testid="three-foundation-next-guidance"
              className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-200 font-semibold"
            >
              <div>{foundationSummary.nextLessonGuidanceKh}</div>
              <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                {foundationSummary.nextLessonGuidanceEn}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <p data-testid="three-temporary-results-notice" className="mt-3 text-xs leading-relaxed text-amber-200">
          លទ្ធផល និងរង្វាន់សាកល្បងនេះមិនត្រូវបានរក្សាទុកជាអចិន្ត្រៃយ៍ទេ ហើយមិនបើកមេរៀនថ្មីទេ។ Prototype results and session rewards are temporary. They are not permanently saved and do not unlock lessons.
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          {passed ? (
            <button
              type="button"
              data-testid="three-walk-through-btn"
              onClick={onWalkThrough}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-6 py-3 font-black text-slate-950 shadow-xl transition hover:brightness-110 active:scale-95"
            >
              <span>
                {isFinalLessonComplete
                  ? 'ដើរចូលទីសក្ការៈអង្គរ (Explore Sanctuary)'
                  : `បន្តទៅដំណាក់កាលទី ${(stageSummary?.stageIndex ?? 0) + 2} (Continue to Stage ${(stageSummary?.stageIndex ?? 0) + 2})`}
              </span>
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              data-testid="three-retry-btn"
              onClick={onRetry}
              className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-amber-400 active:scale-95"
            >
              <RotateCcw className="h-5 w-5" />
              <span>សាកល្បងម្តងទៀត (Try Stage Again)</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              data-testid="three-practice-again-btn"
              onClick={isFinalLessonComplete && onReplayLesson ? onReplayLesson : onRetry}
              className="flex-1 rounded-xl border border-white/20 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              {isFinalLessonComplete
                ? 'លេងមេរៀន 3D ឡើងវិញ (Replay 3D Lesson)'
                : 'អនុវត្តដំណាក់កាលនេះម្តងទៀត'}
            </button>
            <button
              type="button"
              data-testid="three-summary-return-map"
              onClick={() => navigate('/map')}
              className="flex-1 rounded-xl border border-white/20 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              ត្រឡប់ទៅផែនទី (Return to World Map)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
