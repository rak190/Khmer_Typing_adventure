import {
  Flame,
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
  khmerKeyboardRows,
  type KhmerKeyboardKey,
} from '../../../data/keyboardMap';
import { getFingerGuidance } from '../../../lib/fingerGuidance';
import { khmerTextEquals } from '../../../lib/khmerText';
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
  onTypedValue: (value: string, code: string) => void;
  onBackspace: () => void;
  onCancel: () => void;
  onRestart: () => void;
};

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
  onTypedValue,
  onBackspace,
  onCancel,
  onRestart,
}: TypingOverlayProps) {
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [feedback, setFeedback] = useState<{ code: string; state: 'correct' | 'wrong' } | null>(null);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);
  const isComposingRef = useRef(false);

  const isFinished = completedCount >= targetUnits.length;
  const activeTarget = isFinished ? undefined : targetUnits[completedCount];
  const shiftRequired = activeTarget?.modifier === 'shift';
  const altgrRequired = activeTarget?.modifier === 'altgr';

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
        shiftRequired: false,
      };
    }
    return getFingerGuidance(activeTarget.key, shiftRequired);
  }, [activeTarget, shiftRequired]);

  const onTypedValueRef = useRef(onTypedValue);
  const onBackspaceRef = useRef(onBackspace);
  const activeTargetRef = useRef(activeTarget);
  const isFinishedRef = useRef(isFinished);

  useEffect(() => {
    onTypedValueRef.current = onTypedValue;
    onBackspaceRef.current = onBackspace;
    activeTargetRef.current = activeTarget;
    isFinishedRef.current = isFinished;
  });

  const handleInputEvent = useCallback((value: string, code: string) => {
    if (isFinishedRef.current || !activeTargetRef.current) return;
    const isCorrect = khmerTextEquals(value, activeTargetRef.current.value);

    window.clearTimeout(feedbackTimeoutRef.current);
    setFeedback({ code, state: isCorrect ? 'correct' : 'wrong' });
    feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 450);

    onTypedValueRef.current(value, code);
  }, []);

  useEffect(() => {
    const handleCompositionStart = () => {
      isComposingRef.current = true;
    };

    const handleCompositionEnd = () => {
      isComposingRef.current = false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
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

      const usingAltGr = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey);
      if ((event.ctrlKey || event.metaKey) && !usingAltGr) return;
      if (['Space', 'Tab'].includes(event.code)) event.preventDefault();
      if (event.repeat) return;

      const keyboardInput = getKhmerKeyboardInput(event);
      if (!keyboardInput) return;

      event.preventDefault();
      handleInputEvent(keyboardInput.value, keyboardInput.key.code);
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

  return (
    <div
      data-testid="three-typing-overlay"
      className="absolute inset-0 z-20 flex flex-col justify-between bg-black/60 backdrop-blur-sm p-4 sm:p-6 font-khmer text-white select-none"
    >
      {/* ===== HEADER / TOP CONTROLS ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-amber-500/40 bg-slate-900/90 px-4 py-2 shadow-lg">
            <span className="text-xs font-bold text-amber-400">
              ការប្រកួតដោះសោទ្វារបុរាណ • មូលដ្ឋានព្យញ្ជនៈ (Temple Gate Challenge)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <HelpCircle className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">{showKeyboard ? 'លាក់ក្តារចុច' : 'បង្ហាញក្តារចុច'}</span>
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

      {/* ===== CENTER STAGE: TARGET CARD & METRICS ===== */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 my-auto">
        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
            <span data-testid="three-typing-progress">វឌ្ឍនភាព: {completedCount} / {targetUnits.length}</span>
            <span data-testid="three-typing-accuracy-goal">
              គោលដៅភាពត្រឹមត្រូវ: {minimumAccuracy}%+ • គោលដៅ CPM: {speedTargetCpm}
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
        <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full">
          {/* CPM (Main Speed Metric) */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/40 bg-slate-900/85 p-3 shadow-lg">
            <Zap className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-amber-300">CPM (ល្បឿន)</div>
              <div data-testid="three-typing-cpm" className="text-xl sm:text-2xl font-black text-white font-sans">
                {metrics.cpm}
              </div>
            </div>
          </div>

          {/* Accuracy (Top Priority) */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-slate-900/85 p-3 shadow-lg">
            <Target className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-emerald-300">ភាពត្រឹមត្រូវ</div>
              <div
                data-testid="three-typing-accuracy"
                className={`text-xl sm:text-2xl font-black font-sans ${
                  metrics.accuracy >= minimumAccuracy ? 'text-emerald-400' : 'text-coral'
                }`}
              >
                {Math.round(metrics.accuracy)}%
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-orange-500/40 bg-slate-900/85 p-3 shadow-lg">
            <Flame className="h-5 w-5 text-orange-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-orange-300">ជាប់ៗគ្នា</div>
              <div data-testid="three-typing-streak" className="text-xl sm:text-2xl font-black text-white font-sans">
                {streak}
              </div>
            </div>
          </div>

          {/* Mistakes */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/85 p-3 shadow-lg">
            <div className="h-3 w-3 rounded-full bg-red-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-slate-300">កំហុស</div>
              <div data-testid="three-typing-mistakes" className="text-xl sm:text-2xl font-black text-white font-sans">
                {metrics.incorrectInputs}
              </div>
            </div>
          </div>
        </div>

        {/* Continuous Khmer Text Display (preserving grapheme/coeng/dependent vowel shaping) */}
        <div className="relative flex w-full flex-col items-center justify-center rounded-3xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 shadow-2xl backdrop-blur-md">
          <div
            data-testid="three-typing-target"
            data-target={currentTargetText}
            className="khmer-body min-h-[64px] text-center text-3xl sm:text-4xl font-bold leading-[1.8]"
          >
            <span className="text-emerald-400">{typedText}</span>
            {currentTargetText && (
              <span className="rounded-lg bg-amber-500/30 px-1.5 py-0.5 text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-8">
                {visibleTargetUnit(currentTargetText)}
              </span>
            )}
            <span className="text-slate-400">{remainingText}</span>
          </div>

          {/* Active Key and Finger Guidance Banner */}
          {activeTarget && !isFinished && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-200">
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
              <span>•</span>
              <span>{fingerGuidance.label}</span>
              {shiftRequired && (
                <span className="rounded bg-coral px-2 py-0.5 text-xs font-bold text-white">
                  ចុច Shift
                </span>
              )}
              {altgrRequired && (
                <span className="rounded bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
                  ចុច AltGr
                </span>
              )}
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
                  const isShiftTarget = shiftRequired && keyData.action === 'shift';
                  const isAltGrTarget = altgrRequired && keyData.action === 'altgr';
                  const isFeedback = feedback?.code === keyData.code;
                  const isDisabled = Boolean(keyData.disabled && !isBackspace);

                  let keyBg = 'bg-slate-800 text-slate-200 border-slate-700';
                  if (isDisabled) keyBg = 'bg-slate-900/50 text-slate-600 border-transparent';
                  else if (isFeedback && feedback.state === 'correct') keyBg = 'bg-emerald-600 text-white border-emerald-400 scale-105';
                  else if (isFeedback && feedback.state === 'wrong') keyBg = 'bg-coral text-white border-red-300 scale-105';
                  else if (isTarget) keyBg = 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)] scale-105 font-bold';
                  else if (isShiftTarget || isAltGrTarget) keyBg = 'bg-purple-600 text-white border-purple-400 animate-pulse';

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
                        handleInputEvent(val, keyData.code);
                      }}
                      className={`flex h-8 sm:h-10 min-w-[24px] sm:min-w-[36px] flex-col items-center justify-center rounded-lg border text-xs transition-all active:scale-90 ${keyBg} ${
                        keyData.action === 'space' ? 'w-48 sm:w-64' : 'px-1.5 sm:px-2'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-bold leading-none">
                        {displayKhmer}
                      </span>
                      <span className="text-[8px] sm:text-[9px] opacity-60 leading-none font-mono">
                        {keyData.latin.toUpperCase()}
                      </span>
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
