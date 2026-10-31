import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  findKhmerKeyByCode,
  getKhmerKeyboardInput,
  khmerKeyboardRows,
  type KhmerKeyboardKey,
} from '../../../data/keyboardMap';
import { getFingerGuidance } from '../../../lib/fingerGuidance';
import { khmerTextEquals } from '../../../lib/khmerText';
import type { TypingUnit } from '../../../lib/lessonTypingPlan';
import type { TypingMetricResult } from '../../../lib/typingMetrics';
import {
  Flame,
  HelpCircle,
  RotateCcw,
  Target,
  X,
  Zap,
} from 'lucide-react';

type TypingOverlayProps = {
  targetUnits: TypingUnit[];
  metrics: TypingMetricResult;
  completedCount: number;
  streak: number;
  onTypedValue: (value: string, code: string) => void;
  onBackspace: () => void;
  onCancel: () => void;
  onRestart: () => void;
};

export default function TypingOverlay({
  targetUnits,
  metrics,
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

  const activeTargetIndex = Math.min(completedCount, Math.max(0, targetUnits.length - 1));
  const activeTarget = targetUnits[activeTargetIndex];
  const isFinished = completedCount >= targetUnits.length;
  const shiftRequired = activeTarget?.modifier === 'shift';

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

  useEffect(() => {
    onTypedValueRef.current = onTypedValue;
    onBackspaceRef.current = onBackspace;
    activeTargetRef.current = activeTarget;
  });

  const handleInputEvent = useCallback((value: string, code: string) => {
    if (!activeTargetRef.current) return;
    const isCorrect = khmerTextEquals(value, activeTargetRef.current.value);

    window.clearTimeout(feedbackTimeoutRef.current);
    setFeedback({ code, state: isCorrect ? 'correct' : 'wrong' });
    feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 450);

    onTypedValueRef.current(value, code);
  }, []);

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

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
      if (keyboardInput) {
        event.preventDefault();
        handleInputEvent(keyboardInput.value, keyboardInput.key.code);
        return;
      }

      const matchedKey = findKhmerKeyByCode(event.code);
      if (matchedKey && !matchedKey.disabled && activeTargetRef.current) {
        event.preventDefault();
        const value = matchedKey.code === activeTargetRef.current.key.code
          ? activeTargetRef.current.value
          : matchedKey.khmer;
        handleInputEvent(value, matchedKey.code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(feedbackTimeoutRef.current);
    };
  }, [handleInputEvent, onCancel]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between bg-black/60 backdrop-blur-sm p-4 sm:p-6 font-khmer text-white select-none">
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
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <HelpCircle className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">{showKeyboard ? 'លាក់ក្តារចុច' : 'បង្ហាញក្តារចុច'}</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            title="ចាប់ផ្តើមឡើងវិញ (Restart)"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
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
            <span>វឌ្ឍនភាព: {completedCount} / {targetUnits.length}</span>
            <span>គោលដៅភាពត្រឹមត្រូវ: 75%+</span>
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
              <div className="text-xl sm:text-2xl font-black text-white font-sans">{metrics.cpm}</div>
            </div>
          </div>

          {/* Accuracy (Top Priority) */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-slate-900/85 p-3 shadow-lg">
            <Target className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-emerald-300">ភាពត្រឹមត្រូវ</div>
              <div className={`text-xl sm:text-2xl font-black font-sans ${metrics.accuracy >= 75 ? 'text-emerald-400' : 'text-coral'}`}>
                {Math.round(metrics.accuracy)}%
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-orange-500/40 bg-slate-900/85 p-3 shadow-lg">
            <Flame className="h-5 w-5 text-orange-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-orange-300">ជាប់ៗគ្នា</div>
              <div className="text-xl sm:text-2xl font-black text-white font-sans">{streak}</div>
            </div>
          </div>

          {/* Mistakes */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/85 p-3 shadow-lg">
            <div className="h-3 w-3 rounded-full bg-red-400 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-slate-300">កំហុស</div>
              <div className="text-xl sm:text-2xl font-black text-white font-sans">{metrics.incorrectInputs}</div>
            </div>
          </div>
        </div>

        {/* Big Target Letter Display */}
        <div className="relative flex w-full flex-col items-center justify-center rounded-3xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-center gap-2 text-3xl sm:text-4xl font-bold tracking-widest">
            {targetUnits.map((unit, index) => {
              const isTyped = index < completedCount;
              const isCurrent = index === completedCount;
              return (
                <span
                  key={`${index}-${unit.value}`}
                  className={`inline-block px-2 py-1 rounded-xl transition-all duration-150 ${
                    isTyped
                      ? 'text-emerald-400 opacity-60'
                      : isCurrent
                      ? 'scale-125 bg-amber-500/30 text-amber-300 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse'
                      : 'text-slate-400'
                  }`}
                >
                  {unit.value}
                </span>
              );
            })}
          </div>

          {/* Active Key and Finger Guidance Banner */}
          {activeTarget && !isFinished && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-200">
              <span>គ្រាប់ចុច: <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-amber-400/50">{activeTarget.key.latin.toUpperCase()}</span></span>
              <span>•</span>
              <span>{fingerGuidance.label}</span>
              {shiftRequired && (
                <span className="rounded bg-coral px-2 py-0.5 text-xs font-bold text-white">
                  ចុច Shift
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== BOTTOM STAGE: COMPACT RESPONSIVE ON-SCREEN KEYBOARD ===== */}
      {showKeyboard && (
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-white/15 bg-slate-950/90 p-2 sm:p-3 shadow-2xl backdrop-blur-md">
          <div className="space-y-1 sm:space-y-1.5">
            {khmerKeyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
                {row.map((keyData: KhmerKeyboardKey) => {
                  const isTarget = activeTarget?.key.code === keyData.code;
                  const isShiftTarget = shiftRequired && keyData.action === 'shift';
                  const isFeedback = feedback?.code === keyData.code;

                  let keyBg = 'bg-slate-800 text-slate-200 border-slate-700';
                  if (keyData.disabled) keyBg = 'bg-slate-900/50 text-slate-600 border-transparent';
                  else if (isFeedback && feedback.state === 'correct') keyBg = 'bg-emerald-600 text-white border-emerald-400 scale-105';
                  else if (isFeedback && feedback.state === 'wrong') keyBg = 'bg-coral text-white border-red-300 scale-105';
                  else if (isTarget) keyBg = 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)] scale-105 font-bold';
                  else if (isShiftTarget) keyBg = 'bg-purple-600 text-white border-purple-400 animate-pulse';

                  return (
                    <button
                      key={`${rowIndex}-${keyData.latin}-${keyData.code}`}
                      disabled={keyData.disabled}
                      onClick={() => {
                        const val = shiftRequired && keyData.shiftKhmer ? keyData.shiftKhmer : keyData.khmer;
                        handleInputEvent(val, keyData.code);
                      }}
                      className={`flex h-8 sm:h-10 min-w-[24px] sm:min-w-[36px] flex-col items-center justify-center rounded-lg border text-xs transition-all active:scale-90 ${keyBg} ${
                        keyData.action === 'space' ? 'w-48 sm:w-64' : 'px-1.5 sm:px-2'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-bold leading-none">
                        {keyData.khmer || keyData.latin}
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
