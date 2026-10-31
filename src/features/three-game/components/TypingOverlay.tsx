import {
  CheckCircle2,
  Flame,
  Hand,
  HelpCircle,
  RotateCcw,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getKhmerKeyboardInput,
  getKhmerKeyOutput,
  hasTactileBump,
  isHomeRowRestKeyCode,
  isStandaloneCombiningMarkOutput,
  khmerKeyboardRows,
  type KhmerKeyboardKey,
} from '../../../data/keyboardMap';
import type { CurriculumStage } from '../../../data/lessonCurriculum';
import {
  getFingerGuidance,
  getRequiredAltGrKeyCode,
  getRequiredShiftKeyCode,
  type FingerName,
  type HandSide,
} from '../../../lib/fingerGuidance';
import { khmerTextEquals } from '../../../lib/khmerText';
import { getKhmerTypingUnitPresentation } from '../../../lib/typingTargetPresentation';
import { handImages } from '../../../assets/assetManifest';
import {
  getCurrentTargetText,
  getTypedText,
  type TypingUnit,
} from '../../../lib/lessonTypingPlan';
import type { TypingMetricResult } from '../../../lib/typingMetrics';

type TypingOverlayProps = {
  targetUnits: TypingUnit[];
  metrics: TypingMetricResult;
  minimumAccuracy: number;
  speedTargetCpm: number;
  completedCount: number;
  streak: number;
  stage?: CurriculumStage;
  stageIndex?: number;
  totalStages?: number;
  lessonTitleKh?: string;
  onTypedValue: (
    value: string,
    code: string,
    inputSource?: 'physical' | 'virtual',
  ) => void;
  onBackspace: () => void;
  onCancel: () => void;
  onRestart: () => void;
  onCompleteHandPositionStage?: () => void;
};

const LEFT_HAND_FINGERS: Array<{
  finger: FingerName;
  labelKh: string;
  homeKey: string;
  bump?: boolean;
}> = [
  { finger: 'pinky', labelKh: 'កូនដៃ', homeKey: 'A' },
  { finger: 'ring', labelKh: 'ដៃនាង', homeKey: 'S' },
  { finger: 'middle', labelKh: 'កណ្តាល', homeKey: 'D' },
  { finger: 'index', labelKh: 'ចង្អុល', homeKey: 'F', bump: true },
  { finger: 'thumb', labelKh: 'មេដៃ', homeKey: 'Space' },
];

const RIGHT_HAND_FINGERS: Array<{
  finger: FingerName;
  labelKh: string;
  homeKey: string;
  bump?: boolean;
}> = [
  { finger: 'thumb', labelKh: 'មេដៃ', homeKey: 'Space' },
  { finger: 'index', labelKh: 'ចង្អុល', homeKey: 'J', bump: true },
  { finger: 'middle', labelKh: 'កណ្តាល', homeKey: 'K' },
  { finger: 'ring', labelKh: 'ដៃនាង', homeKey: 'L' },
  { finger: 'pinky', labelKh: 'កូនដៃ', homeKey: ';' },
];

function visibleTargetUnit(value: string): string {
  return value === ' ' ? 'Spacebar' : value;
}

function getModifierKeyHint(unit: TypingUnit): string {
  const keyLabel = unit.key.action === 'space' ? 'Spacebar' : unit.key.latin.toUpperCase();
  if (unit.modifier === 'shift') return `Shift + ${keyLabel}`;
  if (unit.modifier === 'altgr') return `AltGr + ${keyLabel}`;
  return keyLabel;
}

export default function TypingOverlay({
  targetUnits,
  metrics,
  minimumAccuracy,
  speedTargetCpm,
  completedCount,
  streak,
  stage,
  stageIndex = 0,
  totalStages = 3,
  lessonTitleKh = 'ព្យញ្ជនៈដំបូង',
  onTypedValue,
  onBackspace,
  onCancel,
  onRestart,
  onCompleteHandPositionStage,
}: TypingOverlayProps) {
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [feedback, setFeedback] = useState<{
    code: string;
    state: 'correct' | 'wrong';
    messageKh: string;
  } | null>(null);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);
  const isComposingRef = useRef(false);

  const isFinished = targetUnits.length > 0 && completedCount >= targetUnits.length;
  const activeTarget = isFinished ? undefined : targetUnits[completedCount];
  const shiftRequired = activeTarget?.modifier === 'shift';
  const altgrRequired = activeTarget?.modifier === 'altgr';
  const stagePracticeMode =
    stage?.practiceMode ?? activeTarget?.practiceMode ?? 'unicode-output';
  const isPhysicalKeyMode =
    stagePracticeMode === 'physical-key' || stagePracticeMode === 'hand-position';
  const isHandPositionStage = stagePracticeMode === 'hand-position';

  const stageItemGroups = useMemo(() => {
    const groups: Array<{
      itemIndex: number;
      text: string;
      startUnitIdx: number;
      endUnitIdx: number;
    }> = [];
    targetUnits.forEach((unit, unitIdx) => {
      const idx = unit.itemIndex ?? unitIdx;
      const last = groups[groups.length - 1];
      if (!last || last.itemIndex !== idx) {
        groups.push({
          itemIndex: idx,
          text: isPhysicalKeyMode ? getKhmerTypingUnitPresentation(unit).khmer : unit.value,
          startUnitIdx: unitIdx,
          endUnitIdx: unitIdx,
        });
      } else {
        last.text += isPhysicalKeyMode ? ` ${getKhmerTypingUnitPresentation(unit).khmer}` : unit.value;
        last.endUnitIdx = unitIdx;
      }
    });
    return groups;
  }, [isPhysicalKeyMode, targetUnits]);

  const fullTargetText = useMemo(
    () => targetUnits.map((unit) => unit.value).join(''),
    [targetUnits],
  );
  const typedText = useMemo(
    () => getTypedText(targetUnits, completedCount),
    [completedCount, targetUnits],
  );
  const currentTargetText = useMemo(
    () => getCurrentTargetText(targetUnits, completedCount),
    [completedCount, targetUnits],
  );
  const remainingText = useMemo(
    () => fullTargetText.slice(typedText.length + currentTargetText.length),
    [currentTargetText.length, fullTargetText, typedText.length],
  );

  const fingerGuidance = useMemo(() => {
    if (!activeTarget) {
      return {
        activeHand: 'right' as const,
        activeFinger: 'right-index' as const,
        label: 'រួចរាល់ (Completed)',
        labelKh: 'រួចរាល់',
        bilingualLabel: 'រួចរាល់ (Completed)',
        handLabelKh: 'ដៃខាងស្តាំ',
        fingerLabelKh: 'ម្រាមដៃចង្អុល',
        homeKeyCode: 'KeyJ',
        homeKeyLatin: 'J',
        isOnHomePosition: true,
        reachDirection: 'home' as const,
        reachInstructionKh: 'រួចរាល់',
        highlights: [],
        shiftRequired: false,
        altgrRequired: false,
        requiredShiftCode: null,
        requiredModifierCode: null,
      };
    }
    return getFingerGuidance(activeTarget.key, Boolean(shiftRequired), Boolean(altgrRequired));
  }, [activeTarget, altgrRequired, shiftRequired]);

  const requiredShiftCode = useMemo(() => {
    return activeTarget ? getRequiredShiftKeyCode(activeTarget.key, Boolean(shiftRequired)) : null;
  }, [activeTarget, shiftRequired]);

  const requiredAltGrCode = useMemo(() => {
    return getRequiredAltGrKeyCode(Boolean(altgrRequired));
  }, [altgrRequired]);

  const onTypedValueRef = useRef(onTypedValue);
  const onBackspaceRef = useRef(onBackspace);
  const activeTargetRef = useRef(activeTarget);
  const isFinishedRef = useRef(isFinished);
  const fingerGuidanceRef = useRef(fingerGuidance);
  const isPhysicalKeyModeRef = useRef(isPhysicalKeyMode);

  useEffect(() => {
    onTypedValueRef.current = onTypedValue;
    onBackspaceRef.current = onBackspace;
    activeTargetRef.current = activeTarget;
    isFinishedRef.current = isFinished;
    fingerGuidanceRef.current = fingerGuidance;
    isPhysicalKeyModeRef.current = isPhysicalKeyMode;
  });

  const handleInputEvent = useCallback(
    (value: string, code: string, inputSource: 'physical' | 'virtual' = 'physical') => {
      if (isFinishedRef.current || !activeTargetRef.current) return;
      const target = activeTargetRef.current;
      const guidance = fingerGuidanceRef.current;

      if (isPhysicalKeyModeRef.current && inputSource === 'virtual') {
        // Do not count a virtual mouse click as verified physical-key mastery in Mode A
        window.clearTimeout(feedbackTimeoutRef.current);
        setFeedback({
          code,
          state: 'correct',
          messageKh: `សូមចុចគ្រាប់ចុចពិតប្រាកដ [${target.key.latin.toUpperCase()}] លើក្តារចុចរបស់អ្នក (${guidance.labelKh})`,
        });
        feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 900);
        onTypedValueRef.current(value, code, 'virtual');
        return;
      }

      const isCorrect = isPhysicalKeyModeRef.current
        ? code === target.key.code
        : khmerTextEquals(value, target.value);

      window.clearTimeout(feedbackTimeoutRef.current);
      setFeedback({
        code,
        state: isCorrect ? 'correct' : 'wrong',
        messageKh: isCorrect
          ? guidance.isOnHomePosition
            ? 'ល្អណាស់! (Well done!)'
            : 'ល្អណាស់! ត្រឡប់ម្រាមដៃទៅទីតាំងដើមវិញ'
          : `សាកល្បងម្តងទៀត • ${guidance.labelKh}`,
      });
      feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 650);

      onTypedValueRef.current(value, code, inputSource);
    },
    [],
  );

  useEffect(() => {
    const handleCompositionStart = () => {
      isComposingRef.current = true;
    };

    const handleCompositionEnd = () => {
      isComposingRef.current = false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Tab') return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.code === 'Space' && target?.closest('button, a')) return;
      if (event.code === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.isComposing || isComposingRef.current) return;

      if (event.code === 'Backspace') {
        event.preventDefault();
        onBackspaceRef.current();
        return;
      }

      // Ignore modifier-only key events so pressing Shift alone does not count as input or mistake
      if (
        [
          'ShiftLeft',
          'ShiftRight',
          'AltLeft',
          'AltRight',
          'ControlLeft',
          'ControlRight',
          'MetaLeft',
          'MetaRight',
          'CapsLock',
        ].includes(event.code)
      ) {
        return;
      }

      const usingAltGr = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey);
      if ((event.ctrlKey || event.metaKey) && !usingAltGr) return;
      if (event.code === 'Space') event.preventDefault();
      if (event.repeat) return;

      const keyboardInput = getKhmerKeyboardInput(event);
      if (!keyboardInput) return;

      event.preventDefault();
      handleInputEvent(keyboardInput.value, keyboardInput.key.code, 'physical');
    };

    window.addEventListener('compositionstart', handleCompositionStart);
    window.addEventListener('compositionend', handleCompositionEnd);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('compositionstart', handleCompositionStart);
      window.removeEventListener('compositionend', handleCompositionEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(feedbackTimeoutRef.current);
    };
  }, [handleInputEvent, onCancel]);

  const renderHandStrip = (
    hand: HandSide,
    titleKh: string,
    fingers: Array<{ finger: FingerName; labelKh: string; homeKey: string; bump?: boolean }>,
  ) => {
    const isHandActive = fingerGuidance.highlights.some((h) => h.hand === hand);
    return (
      <div
        data-testid={`three-hand-card-${hand}`}
        data-active={isHandActive ? 'true' : 'false'}
        className={`flex flex-col gap-1.5 rounded-2xl border px-3 py-2 transition ${
          isHandActive
            ? 'border-amber-400/70 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            : 'border-white/10 bg-slate-900/75'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className={isHandActive ? 'text-amber-300' : 'text-slate-300'}>
            ✋ {titleKh}
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            {hand === 'left' ? 'A • S • D • F' : 'J • K • L • ;'}
          </span>
        </div>
        <div className="relative mx-auto h-16 w-32 overflow-hidden rounded-lg bg-white/5">
          <img
            src={hand === 'left' ? handImages.leftTyping : handImages.rightTyping}
            alt={hand === 'left' ? 'ទីតាំងដៃឆ្វេង' : 'ទីតាំងដៃស្តាំ'}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex items-center justify-center gap-1">
          {fingers.map((f) => {
            const highlight = fingerGuidance.highlights.find(
              (h) => h.hand === hand && h.finger === f.finger,
            );
            const isTargetFinger = highlight?.role === 'target';
            const isModifierFinger =
              highlight?.role === 'shift' || highlight?.role === 'altgr';
            return (
              <div
                key={`${hand}-${f.finger}`}
                data-testid={`three-finger-${hand}-${f.finger}`}
                data-finger-role={highlight?.role ?? 'rest'}
                className={`flex min-w-[46px] flex-col items-center rounded-xl border px-1.5 py-1 text-center transition ${
                  isTargetFinger
                    ? 'border-amber-300 bg-amber-400 text-slate-950 font-black scale-105 shadow-[0_0_10px_rgba(245,158,11,0.7)]'
                    : isModifierFinger
                    ? 'border-purple-300 bg-purple-600 text-white font-bold scale-105 shadow-[0_0_10px_rgba(168,85,247,0.7)]'
                    : 'border-white/10 bg-slate-800/80 text-slate-300'
                }`}
              >
                <span className="text-[10px] leading-tight">{f.labelKh}</span>
                <span className="font-mono text-[10px] font-bold leading-tight">
                  {f.homeKey}
                  {f.bump ? '•' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      data-testid="three-typing-overlay"
      data-practice-mode={stagePracticeMode}
      className="absolute inset-0 z-20 flex flex-col justify-between bg-black/65 backdrop-blur-sm p-3 sm:p-5 font-khmer text-white select-none overflow-y-auto"
    >
      {/* ===== HEADER / TOP CONTROLS ===== */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            data-testid="three-typing-stage-banner"
            className="rounded-xl border border-amber-500/40 bg-slate-900/90 px-4 py-2 shadow-lg"
          >
            <div className="text-xs font-bold text-amber-400">
              {stage
                ? `ដំណាក់កាលទី ${stageIndex + 1}/${totalStages} • ${stage.titleKh} (${stage.titleEn})`
                : `ការប្រកួតដោះសោទ្វារបុរាណ • ${lessonTitleKh}`}
            </div>
            {stage && <div className="text-[11px] text-slate-300">{stage.mission}</div>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <HelpCircle className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">
              {showKeyboard ? 'លាក់ក្តារចុច' : 'បង្ហាញក្តារចុច'}
            </span>
          </button>

          <button
            type="button"
            data-testid="three-typing-restart"
            onClick={onRestart}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            title="ចាប់ផ្តើមឡើងវិញ (Restart)"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            data-testid="three-typing-cancel"
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/60 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-900/80"
            title="បោះបង់ (Cancel / Esc)"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">ចាកចេញ [Esc]</span>
          </button>
        </div>
      </div>

      {/* ===== CENTER STAGE: TARGET CARD, HAND DIAGRAMS & METRICS ===== */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 my-auto py-1">
        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
            <span data-testid="three-typing-progress">
              វឌ្ឍនភាព: {completedCount} / {targetUnits.length}
            </span>
            <span data-testid="three-typing-accuracy-goal">
              {stage?.untimed
                ? `គោលដៅភាពត្រឹមត្រូវ: ${minimumAccuracy}%+ • គ្មានកំណត់ពេល (ផ្តោតលើបច្ចេកទេសម្រាមដៃ)`
                : `គោលដៅភាពត្រឹមត្រូវ: ${minimumAccuracy}%+ • គោលដៅ CPM: ${speedTargetCpm}`}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${(completedCount / Math.max(1, targetUnits.length)) * 100}%` }}
            />
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
          {/* CPM (Main Speed Metric) */}
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-slate-900/85 p-2.5 shadow-lg">
            <Zap className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-amber-300">
                {stage?.untimed ? 'CPM (មិនបង្ខំល្បឿន)' : 'CPM (ល្បឿន)'}
              </div>
              <div
                data-testid="three-typing-cpm"
                className="text-lg sm:text-xl font-black text-white font-sans"
              >
                {metrics.cpm}
              </div>
            </div>
          </div>

          {/* Accuracy (Top Priority) */}
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-slate-900/85 p-2.5 shadow-lg">
            <Target className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-emerald-300">ភាពត្រឹមត្រូវ</div>
              <div
                data-testid="three-typing-accuracy"
                className={`text-lg sm:text-xl font-black font-sans ${
                  metrics.accuracy >= minimumAccuracy ? 'text-emerald-400' : 'text-coral'
                }`}
              >
                {Math.round(metrics.accuracy)}%
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 rounded-2xl border border-orange-500/40 bg-slate-900/85 p-2.5 shadow-lg">
            <Flame className="h-5 w-5 text-orange-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-orange-300">ជាប់ៗគ្នា</div>
              <div
                data-testid="three-typing-streak"
                className="text-lg sm:text-xl font-black text-white font-sans"
              >
                {streak}
              </div>
            </div>
          </div>

          {/* Mistakes */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/85 p-2.5 shadow-lg">
            <div className="h-3 w-3 rounded-full bg-red-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-slate-300">កំហុស</div>
              <div
                data-testid="three-typing-mistakes"
                className="text-lg sm:text-xl font-black text-white font-sans"
              >
                {metrics.incorrectInputs}
              </div>
            </div>
          </div>
        </div>

        {/* Stage 1 Special Card: Learn Hand Position & Sitting Posture Checklist */}
        {isHandPositionStage && stage?.postureInstructionsKh && (
          <div
            data-testid="three-hand-position-guide"
            className="w-full rounded-2xl border border-emerald-400/40 bg-slate-900/95 p-3.5 shadow-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-emerald-300">
                <Hand className="h-4 w-4 text-amber-400" />
                <span>ការណែនាំអំពីឥរិយាបថ និងទីតាំងដៃលើជួរកណ្តាល (Home-Row Hand Placement)</span>
              </div>
              {onCompleteHandPositionStage && (
                <button
                  type="button"
                  data-testid="three-complete-hand-position-btn"
                  onClick={onCompleteHandPositionStage}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md transition hover:brightness-110 active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>យល់ហើយ • បន្តទៅដំណាក់កាលទី 2 (Continue)</span>
                </button>
              )}
            </div>
            <ul className="space-y-1 text-xs text-slate-200 leading-relaxed">
              {stage.postureInstructionsKh.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Continuous Khmer / Physical Key Target Display */}
        <div className="relative flex w-full flex-col items-center justify-center rounded-3xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
          {/* Curriculum Stage Item Tiles */}
          {stageItemGroups.length > 0 && (
            <div
              data-testid="three-typing-stage-items"
              className="mb-2.5 flex flex-wrap items-center justify-center gap-1.5"
            >
              {stageItemGroups.map((group) => {
                const isGroupDone = completedCount > group.endUnitIdx;
                const isGroupActive =
                  completedCount >= group.startUnitIdx && completedCount <= group.endUnitIdx;
                return (
                  <span
                    key={group.itemIndex}
                    data-testid={`three-stage-item-${group.itemIndex}`}
                    data-item-state={
                      isGroupDone ? 'done' : isGroupActive ? 'active' : 'pending'
                    }
                    className={`khmer-body rounded-xl border px-2.5 py-0.5 text-base sm:text-lg font-bold transition ${
                      isGroupDone
                        ? 'border-emerald-400/50 bg-emerald-950/60 text-emerald-300'
                        : isGroupActive
                        ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.45)] scale-105'
                        : 'border-white/10 bg-slate-800/70 text-slate-400'
                    }`}
                  >
                    {group.text}
                  </span>
                );
              })}
            </div>
          )}

          <div
            data-testid="three-typing-target"
            data-target={currentTargetText}
            className="khmer-body min-h-[54px] text-center text-3xl sm:text-4xl font-bold leading-[1.8]"
          >
            {isPhysicalKeyMode ? (
              <div className="flex flex-wrap items-center justify-center gap-1.5" data-testid="three-khmer-physical-targets">
                {targetUnits.map((unit, index) => {
                  const presentation = getKhmerTypingUnitPresentation(unit);
                  return (
                    <span key={index} className={`flex min-w-10 flex-col items-center rounded-lg border px-1.5 py-1 leading-tight ${
                      index < completedCount
                        ? 'border-emerald-400/40 bg-emerald-950/50 text-emerald-300'
                        : index === completedCount
                        ? 'border-amber-300 bg-amber-500/25 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.45)]'
                        : 'border-white/10 bg-slate-800/60 text-slate-300'
                    }`}>
                      <span className="text-2xl font-bold">{presentation.khmer}</span>
                      <span className="font-mono text-[10px] opacity-70">{presentation.keyLabel}</span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <>
                <span className="text-emerald-400">{typedText}</span>
                {currentTargetText && (
                  <span className="rounded-lg bg-amber-500/30 px-1.5 py-0.5 text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-8">
                    {visibleTargetUnit(currentTargetText)}
                  </span>
                )}
                <span className="text-slate-400">{remainingText}</span>
              </>
            )}
          </div>

          {/* Active Key, Finger & Home-Row Reach Guidance Banner */}
          {activeTarget && !isFinished && (
            <div
              data-testid="three-active-guidance-banner"
              className="mt-3 flex flex-col items-center gap-1.5 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-xs sm:text-sm font-semibold text-amber-200 w-full"
            >
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {isPhysicalKeyMode ? (
                  <span>
                    គ្រាប់ចុចត្រូវចុច:{' '}
                    <span className="font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-amber-400/50">
                      {activeTarget.key.latin.toUpperCase()}
                    </span>{' '}
                    <span className="text-xs text-slate-300">
                      (អក្សរខ្មែរលើគ្រាប់ចុច៖ {activeTarget.key.khmer}
                      {isStandaloneCombiningMarkOutput(activeTarget.key.khmer)
                        ? ' • សញ្ញាផ្សំ/ជើងអក្សរ'
                        : ''}
                      )
                    </span>
                  </span>
                ) : (
                  <>
                    <span>
                      អក្សរត្រូវវាយ:{' '}
                      <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-amber-400/50">
                        {visibleTargetUnit(activeTarget.value)}
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      គ្រាប់ចុច:{' '}
                      <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-amber-400/50">
                        {getModifierKeyHint(activeTarget)}
                      </span>
                    </span>
                  </>
                )}
                <span>•</span>
                <span data-testid="three-finger-instruction">{fingerGuidance.bilingualLabel}</span>
                {shiftRequired && (
                  <span className="rounded bg-coral px-2 py-0.5 text-xs font-bold text-white">
                    ចុច Shift ({requiredShiftCode === 'ShiftLeft' ? 'ឆ្វេង' : 'ស្តាំ'})
                  </span>
                )}
                {altgrRequired && (
                  <span className="rounded bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
                    ចុច AltGr
                  </span>
                )}
              </div>

              <div
                data-testid="three-reach-instruction"
                className="text-xs text-emerald-300 font-bold"
              >
                🎯 {fingerGuidance.reachInstructionKh}
              </div>

              {feedback && (
                <div
                  data-testid="three-feedback-message"
                  data-feedback-state={feedback.state}
                  className={`rounded-lg px-3 py-0.5 text-xs font-bold ${
                    feedback.state === 'correct'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-red-500/20 text-red-200 border border-red-400/40'
                  }`}
                >
                  {feedback.messageKh}
                </div>
              )}
            </div>
          )}

          {/* Both-Hand Visual Finger & Home-Row Diagram */}
          <div
            data-testid="three-hand-guidance-diagram"
            data-active-finger={fingerGuidance.activeFinger}
            data-home-key={fingerGuidance.homeKeyCode}
            className="mt-3 grid w-full grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {renderHandStrip('left', 'ដៃឆ្វេង (Left Hand)', LEFT_HAND_FINGERS)}
            {renderHandStrip('right', 'ដៃស្តាំ (Right Hand)', RIGHT_HAND_FINGERS)}
          </div>

          {stage?.hint && (
            <div
              data-testid="three-typing-stage-hint"
              className="mt-2 text-center text-xs text-slate-300"
            >
              💡 {stage.hint}
            </div>
          )}
        </div>
      </div>

      {/* ===== BOTTOM STAGE: COMPACT RESPONSIVE ON-SCREEN KEYBOARD ===== */}
      {showKeyboard && (
        <div
          data-testid="three-khmer-keyboard"
          className="mx-auto w-full max-w-4xl rounded-2xl border border-white/15 bg-slate-950/90 p-2 sm:p-3 shadow-2xl backdrop-blur-md"
        >
          <div className="space-y-1 sm:space-y-1.5">
            {khmerKeyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
                {row.map((keyData: KhmerKeyboardKey) => {
                  const isBackspace = keyData.action === 'backspace';
                  const isTarget = activeTarget?.key.code === keyData.code;
                  const isShiftTarget = Boolean(
                    requiredShiftCode && requiredShiftCode === keyData.code,
                  );
                  const isAltGrTarget = Boolean(
                    requiredAltGrCode && requiredAltGrCode === keyData.code,
                  );
                  const isHomeKey = isHomeRowRestKeyCode(keyData.code);
                  const isFingerHomeAnchor =
                    !isTarget && activeTarget && fingerGuidance.homeKeyCode === keyData.code;
                  const isTactileBump = hasTactileBump(keyData.code);
                  const isFeedback = feedback?.code === keyData.code;
                  const isDisabled = Boolean(keyData.disabled && !isBackspace);

                  let keyBg = 'bg-slate-800 text-slate-200 border-slate-700';
                  if (isFeedback && feedback.state === 'correct') {
                    keyBg = 'bg-emerald-600 text-white border-emerald-400 scale-105';
                  } else if (isFeedback && feedback.state === 'wrong') {
                    keyBg = 'bg-coral text-white border-red-300 scale-105';
                  } else if (isTarget) {
                    keyBg =
                      'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)] scale-105 font-bold';
                  } else if (isShiftTarget || isAltGrTarget) {
                    keyBg =
                      'bg-purple-600 text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.7)] animate-pulse font-bold scale-105';
                  } else if (isFingerHomeAnchor) {
                    keyBg = 'bg-slate-800 text-emerald-300 border-emerald-400/80 ring-1 ring-emerald-400/50';
                  } else if (isHomeKey && isHandPositionStage) {
                    keyBg = 'bg-emerald-950/80 text-emerald-200 border-emerald-400/60';
                  } else if (isHomeKey) {
                    keyBg = 'bg-slate-800/95 text-slate-100 border-amber-500/35';
                  } else if (isDisabled) {
                    keyBg = 'bg-slate-900/50 text-slate-600 border-transparent';
                  }

                  const displayKhmer = isBackspace
                    ? '⌫'
                    : shiftRequired && keyData.shiftKhmer
                    ? keyData.shiftKhmer
                    : altgrRequired && keyData.altgrKhmer
                    ? keyData.altgrKhmer
                    : keyData.khmer || keyData.latin;

                  return (
                    <button
                      type="button"
                      key={`${rowIndex}-${keyData.latin}-${keyData.code}`}
                      data-key-code={keyData.code}
                      data-home-key={isHomeKey ? 'true' : undefined}
                      data-tactile-bump={isTactileBump ? 'true' : undefined}
                      data-is-target={isTarget ? 'true' : undefined}
                      data-is-shift-target={isShiftTarget || isAltGrTarget ? 'true' : undefined}
                      disabled={isDisabled}
                      onClick={() => {
                        if (isBackspace) {
                          onBackspaceRef.current();
                          return;
                        }
                        const modifier =
                          activeTarget && keyData.code === activeTarget.key.code
                            ? activeTarget.modifier
                            : 'base';
                        const val = getKhmerKeyOutput(keyData, modifier);
                        handleInputEvent(val, keyData.code, 'virtual');
                      }}
                      className={`relative flex h-8 sm:h-10 min-w-[24px] sm:min-w-[36px] flex-col items-center justify-center rounded-lg border text-xs transition-all active:scale-90 ${keyBg} ${
                        keyData.action === 'space' ? 'w-48 sm:w-64' : 'px-1.5 sm:px-2'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-bold leading-none">
                        {displayKhmer}
                      </span>
                      <span className="text-[8px] sm:text-[9px] opacity-75 leading-none font-mono">
                        {keyData.latin.toUpperCase()}
                      </span>
                      {isTactileBump && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-0.5 left-1/2 h-0.5 w-2.5 -translate-x-1/2 rounded-full bg-amber-300"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
