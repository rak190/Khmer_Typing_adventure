import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameScreen from '../layout/GameScreen';
import PageTransition from '../layout/PageTransition';
import ActionModal from '../game-ui/ActionModal';
import { SettingsPanel } from '../game-ui/FeaturePanels';
import { backgroundImages } from '../../assets/assetManifest';
import { resetLessonProgressRecords, saveLessonProgressToFirebase, saveMockLessonProgress } from '../../data/mockData';
import { findKhmerKeyByCode, getKhmerKeyboardInput } from '../../data/keyboardMap';
import type { CurriculumLevel, CurriculumWorld } from '../../data/lessonCurriculum';
import { getStructuredLessonByRoute } from '../../data/typingProgression';
import { countKhmerCharacters, countKhmerWords, khmerTextEquals } from '../../lib/khmerText';
import { buildLessonTypingPlan, getCurrentTargetText, getTypedText, type TypingUnit } from '../../lib/lessonTypingPlan';
import { getFingerGuidance } from '../../lib/fingerGuidance';
import {
  calculateLessonXP,
  classifyWeakKey,
  getBestScoreForLesson,
  getProgressRecommendation,
  loadStudentProgress,
  resetStudentProgress,
  saveStudentLessonResult,
  summarizeWeakKeyStats,
  type StudentBadge,
  type StudentLessonResult,
  type WeakKeyStatRecord,
} from '../../lib/studentProgress';
import {
  calculateTypingMetrics,
  getLessonMinimumAccuracy,
  getLessonSpeedTargetCpm,
  type TypingMetricResult,
} from '../../lib/typingMetrics';
import { loadAppSettings, resetFeatureProgressState, saveAppSettings } from '../../lib/playerFeatures';
import LessonHud from './LessonHud';
import TypingTargetCard from './TypingTargetCard';
import KhmerKeyboard from './KhmerKeyboard';
import QuestScroll, { type QuestStageState } from './QuestScroll';
import LessonCompleteModal from './LessonCompleteModal';
import TypingHands from './TypingHands';

const STAGE_LABELS = ['Learn keys', 'Build rhythm', 'Finish text'];

type LessonWorldScreenProps = {
  world: CurriculumWorld;
  lesson: CurriculumLevel;
  practiceMode?: 'curriculum' | 'weak';
};

type Feedback = {
  code: string;
  state: 'correct' | 'wrong';
  message: string;
};

type LessonRunState = {
  completedInputCount: number;
  incorrectInputs: number;
  backspaceCount: number;
  streak: number;
  bestStreak: number;
  xpEarned: number;
  weakKeyStats: WeakKeyStatRecord;
  finished: boolean;
  startedAt: number | null;
  endedAt: number | null;
};

function getInitialRunState(): LessonRunState {
  return {
    completedInputCount: 0,
    incorrectInputs: 0,
    backspaceCount: 0,
    streak: 0,
    bestStreak: 0,
    xpEarned: 0,
    weakKeyStats: {},
    finished: false,
    startedAt: null,
    endedAt: null,
  };
}

function getKeyHint(target: TypingUnit) {
  const keyLabel = target.key.action === 'space' ? 'Spacebar' : target.key.latin;
  return target.modifier === 'shift' ? `Press Shift + ${keyLabel}` : `Press ${keyLabel}`;
}

function getQuestStages(progress: number, total: number, finished: boolean): QuestStageState[] {
  const chunk = Math.max(1, Math.ceil(total / STAGE_LABELS.length));

  return STAGE_LABELS.map((label, index) => {
    const start = index * chunk;
    const end = Math.min(total, start + chunk);
    if (finished || progress >= end) return { label, state: 'completed' };
    if (progress >= start) return { label, state: 'current' };
    return { label, state: 'locked' };
  });
}

function visibleKey(key: string) {
  return key === ' ' ? 'Spacebar' : key;
}

function getElapsedMs(state: LessonRunState, now = performance.now()) {
  if (state.startedAt === null) return 0;
  return (state.endedAt ?? now) - state.startedAt;
}

function buildMetrics(state: LessonRunState, targetUnits: TypingUnit[], speedTargetCpm: number, minimumAccuracy: number): TypingMetricResult {
  const typedText = getTypedText(targetUnits, state.completedInputCount);
  const elapsedMs = getElapsedMs(state);

  return calculateTypingMetrics({
    completed: state.finished,
    totalRequiredInputs: targetUnits.length,
    acceptedCorrectInputs: state.completedInputCount,
    incorrectInputs: state.incorrectInputs,
    backspaceCount: state.backspaceCount,
    elapsedMs,
    correctKhmerCharacters: countKhmerCharacters(typedText),
    correctWords: countKhmerWords(typedText),
    bestStreak: state.bestStreak,
    speedTargetCpm,
    minimumAccuracy,
  });
}

function addWeakKeyStat(stats: WeakKeyStatRecord, value: string, keyCode: string | undefined, field: 'mistakes' | 'backspaces') {
  const existing = stats[value];
  return {
    ...stats,
    [value]: {
      value,
      mistakes: (existing?.mistakes ?? 0) + (field === 'mistakes' ? 1 : 0),
      backspaces: (existing?.backspaces ?? 0) + (field === 'backspaces' ? 1 : 0),
      keyCode: keyCode ?? existing?.keyCode,
      category: existing?.category ?? classifyWeakKey(value),
    },
  };
}

export default function LessonWorldScreen({ world, lesson, practiceMode = 'curriculum' }: LessonWorldScreenProps) {
  const navigate = useNavigate();
  const plan = useMemo(() => buildLessonTypingPlan(lesson, world.id), [lesson, world.id]);
  const structuredLesson = practiceMode === 'curriculum' ? getStructuredLessonByRoute(world.id, lesson.id) : undefined;
  const targetUnits = plan.units;
  const speedTargetCpm = getLessonSpeedTargetCpm(lesson, world.id);
  const minimumAccuracy = getLessonMinimumAccuracy(lesson, world.id);
  const [runState, setRunState] = useState<LessonRunState>(() => getInitialRunState());
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [newBadges, setNewBadges] = useState<StudentBadge[]>([]);
  const [modal, setModal] = useState<'pause' | 'settings' | 'continueLocked' | null>(null);
  const [settings, setSettings] = useState(() => loadAppSettings());
  const [initialProgress] = useState(() => loadStudentProgress());
  const [, setClockTick] = useState(0);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);
  const progressSavedRef = useRef(false);

  const activeTarget = targetUnits[Math.min(runState.completedInputCount, Math.max(0, targetUnits.length - 1))];
  const typedText = getTypedText(targetUnits, runState.completedInputCount);
  const currentTargetText = getCurrentTargetText(targetUnits, runState.completedInputCount);
  const metrics = useMemo(
    () => buildMetrics(runState, targetUnits, speedTargetCpm, minimumAccuracy),
    [minimumAccuracy, runState, speedTargetCpm, targetUnits],
  );
  const liveScore = metrics.finalScore;
  const weakKeys = summarizeWeakKeyStats(runState.weakKeyStats, 5);
  const resultLessonId = practiceMode === 'weak' ? 'weak-key-practice' : structuredLesson?.lessonId ?? `${world.id}:${lesson.id}`;
  const previousBestScore = getBestScoreForLesson(initialProgress, resultLessonId);
  const finalXpEarned = calculateLessonXP({
    passed: metrics.passed,
    baseXP: structuredLesson?.xpReward ?? (practiceMode === 'weak' ? 65 : 90),
    stars: metrics.stars,
    accuracy: metrics.accuracy,
    cpm: metrics.cpm,
    targetCPM: speedTargetCpm,
    mistakes: metrics.errorCount,
    score: metrics.finalScore,
    previousBestScore,
  });
  const displayedXpEarned = runState.finished ? finalXpEarned : Math.min(40, runState.completedInputCount * 2);
  const coinsEarned = Math.max(0, runState.finished && metrics.passed ? 20 + metrics.stars * 10 + Math.floor(metrics.finalScore / 1200) : 0);
  const questStages = getQuestStages(runState.completedInputCount, targetUnits.length, runState.finished);
  const shiftRequired = activeTarget?.modifier === 'shift';
  const keyHint = activeTarget ? getKeyHint(activeTarget) : 'Complete';
  const fingerGuidance = activeTarget
    ? getFingerGuidance(activeTarget.key, shiftRequired)
    : {
        activeHand: 'right' as const,
        activeFinger: 'right-index' as const,
        label: 'Complete',
        highlights: [],
        shiftRequired: false,
      };
  const handHint = fingerGuidance.label;
  const visibleKeyHint = settings.keyboardHintsEnabled ? keyHint : 'ជំនួយក្តារចុចត្រូវបានបិទក្នុងការកំណត់។';
  const visibleHandHint = settings.handHintsEnabled ? handHint : 'ជំនួយម្រាមដៃត្រូវបានបិទក្នុងការកំណត់។';

  function showFeedback(nextFeedback: Feedback) {
    window.clearTimeout(feedbackTimeoutRef.current);
    setFeedback(nextFeedback);
    feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 620);
  }

  function updateRunState(updater: (current: LessonRunState, now: number) => LessonRunState) {
    const now = performance.now();
    setRunState((current) => {
      const startedState = current.startedAt === null && !current.finished ? { ...current, startedAt: now } : current;
      return updater(startedState, now);
    });
  }

  function resetLesson() {
    window.clearTimeout(feedbackTimeoutRef.current);
    setRunState(getInitialRunState());
    setFeedback(null);
    setNewBadges([]);
    progressSavedRef.current = false;
  }

  function handleResetProgress() {
    resetStudentProgress();
    resetFeatureProgressState();
    void resetLessonProgressRecords().catch((error) => console.error('Unable to reset lesson progress records.', error));
    resetLesson();
  }

  function handleBackspace() {
    if (runState.finished || modal) return;

    updateRunState((current) => {
      const removedTarget = targetUnits[Math.max(0, current.completedInputCount - 1)];
      return {
        ...current,
        completedInputCount: Math.max(0, current.completedInputCount - 1),
        backspaceCount: current.backspaceCount + 1,
        weakKeyStats: removedTarget ? addWeakKeyStat(current.weakKeyStats, removedTarget.value, removedTarget.key.code, 'backspaces') : current.weakKeyStats,
        streak: 0,
      };
    });
  }

  function handleTypedValue(value: string, code: string) {
    if (runState.finished || modal || !activeTarget) return;

    if (khmerTextEquals(value, activeTarget.value)) {
      updateRunState((current, now) => {
        const nextCompletedInputCount = Math.min(targetUnits.length, current.completedInputCount + 1);
        const nextStreak = current.streak + 1;
        const finished = nextCompletedInputCount >= targetUnits.length;

        return {
          ...current,
          completedInputCount: nextCompletedInputCount,
          streak: nextStreak,
          bestStreak: Math.max(current.bestStreak, nextStreak),
          xpEarned: current.xpEarned + 4,
          finished,
          endedAt: finished ? now : current.endedAt,
        };
      });
      showFeedback({ code, state: 'correct', message: 'Correct Khmer input.' });
      return;
    }

    updateRunState((current) => ({
      ...current,
      incorrectInputs: current.incorrectInputs + 1,
      weakKeyStats: addWeakKeyStat(current.weakKeyStats, activeTarget.value, activeTarget.key.code, 'mistakes'),
      streak: 0,
    }));
    showFeedback({ code, state: 'wrong', message: shiftRequired ? 'Use Shift for this key.' : 'Try the highlighted Khmer key.' });
  }

  function handleKeyboardPress(code: string) {
    if (modal) return;
    if (code === 'Backspace') {
      handleBackspace();
      return;
    }

    const pressedKey = findKhmerKeyByCode(code);
    if (!pressedKey || pressedKey.disabled || !activeTarget) return;

    const value = pressedKey.code === activeTarget.key.code ? activeTarget.value : pressedKey.khmer;
    handleTypedValue(value, code);
  }

  const handleKeyboardPressRef = useRef(handleKeyboardPress);
  const handleTypedValueRef = useRef(handleTypedValue);
  const modalRef = useRef(modal);
  const handleKeyboardButtonPress = useCallback((code: string) => {
    handleKeyboardPressRef.current(code);
  }, []);

  useEffect(() => {
    handleKeyboardPressRef.current = handleKeyboardPress;
    handleTypedValueRef.current = handleTypedValue;
    modalRef.current = modal;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const usingAltGr = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey);
      if (modalRef.current) return;
      if ((event.ctrlKey || event.metaKey) && !usingAltGr) return;
      if (event.code === 'Space' || event.code === 'Backspace' || event.code === 'Tab') event.preventDefault();
      if (event.repeat) return;

      if (event.code === 'Backspace') {
        event.preventDefault();
        handleKeyboardPressRef.current('Backspace');
        return;
      }

      const keyboardInput = getKhmerKeyboardInput(event);
      if (!keyboardInput) return;

      event.preventDefault();
      handleTypedValueRef.current(keyboardInput.value, keyboardInput.key.code);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (runState.startedAt === null || runState.finished) return undefined;
    const intervalId = window.setInterval(() => setClockTick((tick) => tick + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, [runState.finished, runState.startedAt]);

  useEffect(() => () => window.clearTimeout(feedbackTimeoutRef.current), []);

  useEffect(() => {
    if (!runState.finished || progressSavedRef.current) return;

    const completedAt = new Date().toISOString();
    const lessonResult: StudentLessonResult = {
      lessonId: resultLessonId,
      lessonTitle: practiceMode === 'weak' ? 'Weak-Key Practice' : structuredLesson?.lessonTitle ?? lesson.labelEn,
      worldId: structuredLesson?.worldId ?? world.id,
      skillFocus: structuredLesson?.skillFocus ?? lesson.objective,
      targetText: plan.targetText,
      minimumAccuracy,
      targetCPM: speedTargetCpm,
      difficulty: structuredLesson?.difficulty ?? (practiceMode === 'weak' ? 'adaptive' : 'beginner'),
      badgeGroup: structuredLesson?.badgeGroup,
      accuracy: metrics.accuracy,
      CPM: metrics.cpm,
      WPM: metrics.wpm,
      mistakes: metrics.errorCount,
      backspaces: metrics.backspaceCount,
      weakKeys,
      stars: metrics.stars,
      XP: finalXpEarned,
      score: metrics.finalScore,
      passed: metrics.passed,
      completedAt,
    };
    const saved = saveStudentLessonResult(lessonResult);
    setNewBadges(saved.newBadges);

    const progressRecord = {
      worldId: world.id,
      lessonId: lesson.id,
      score: metrics.finalScore,
      accuracy: metrics.accuracy,
      cpm: metrics.cpm,
      wpm: metrics.wpm,
      stars: metrics.stars,
      xpEarned: finalXpEarned,
      coinsEarned,
      bestStreak: runState.bestStreak,
      passed: metrics.passed,
      completed: true,
      timeSeconds: metrics.elapsedSeconds,
      mistakes: metrics.errorCount,
      backspaces: metrics.backspaceCount,
    };

    if (practiceMode === 'curriculum' && metrics.passed) {
      saveMockLessonProgress(progressRecord);
      void saveLessonProgressToFirebase(progressRecord);
    }

    progressSavedRef.current = true;
  }, [coinsEarned, finalXpEarned, lesson.id, lesson.labelEn, lesson.objective, metrics, minimumAccuracy, plan.targetText, practiceMode, resultLessonId, runState.bestStreak, runState.finished, speedTargetCpm, structuredLesson, weakKeys, world.id]);

  if (!activeTarget) {
    return (
      <PageTransition className="h-screen overflow-hidden bg-[#0A6FB5]">
        <GameScreen background={backgroundImages.lesson} fit="stretch" className="grid place-items-center font-sans text-[#17325A]" style={{ backgroundSize: '100% 100%' }}>
          <div className="rounded-[24px] bg-white/90 px-8 py-6 text-2xl font-black">This lesson has no typeable Khmer targets yet.</div>
        </GameScreen>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="h-screen overflow-hidden bg-[#0A6FB5]">
      <GameScreen background={backgroundImages.lesson} fit="stretch" className="font-sans text-[#17325A]" style={{ backgroundSize: '100% 100%' }}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#57D6FF]/10 via-transparent to-[#092A28]/34" />
        <div className="temple-silhouette pointer-events-none opacity-40" />

        <LessonHud
          score={liveScore}
          streak={runState.streak}
          accuracy={metrics.accuracy}
          cpm={metrics.cpm}
          xpEarned={displayedXpEarned}
          onPause={() => setModal('pause')}
          onSettings={() => setModal('settings')}
        />

        <TypingTargetCard
          lessonTitle={`${world.title} - ${lesson.labelEn}`}
          skillFocus={lesson.objective}
          targetText={plan.targetText}
          typedText={typedText}
          currentText={currentTargetText}
          keyHint={visibleKeyHint}
          handHint={visibleHandHint}
          metrics={metrics}
          speedTargetCpm={speedTargetCpm}
          minimumAccuracy={minimumAccuracy}
          feedbackState={feedback?.state}
          feedbackMessage={feedback?.message}
        />

        {settings.handHintsEnabled && <TypingHands guidance={fingerGuidance} />}

        <KhmerKeyboard
          activeCode={settings.keyboardHintsEnabled ? activeTarget.key.code : ''}
          shiftRequired={settings.keyboardHintsEnabled && shiftRequired}
          feedbackCode={settings.keyboardHintsEnabled ? feedback?.code : undefined}
          feedbackState={feedback?.state}
          activeHand={fingerGuidance.activeHand}
          activeFinger={fingerGuidance.activeFinger}
          hintLabel={handHint}
          keyLabel={keyHint}
          onKeyPress={handleKeyboardButtonPress}
        />

        <QuestScroll
          objective={lesson.successCriteria}
          progress={runState.completedInputCount}
          total={targetUnits.length}
          nextKey={visibleKey(activeTarget.value)}
          keyHint={visibleKeyHint}
          handHint={visibleHandHint}
          stages={questStages}
          stars={metrics.stars}
          xp={displayedXpEarned}
        />

        {runState.finished && (
          <LessonCompleteModal
            result={metrics}
            speedTargetCpm={speedTargetCpm}
            xp={finalXpEarned}
            coins={coinsEarned}
            weakKeys={weakKeys}
            newBadges={newBadges}
            recommendation={getProgressRecommendation(loadStudentProgress(), {
              lessonId: resultLessonId,
              lessonTitle: practiceMode === 'weak' ? 'Weak-Key Practice' : structuredLesson?.lessonTitle ?? lesson.labelEn,
              worldId: structuredLesson?.worldId ?? world.id,
              skillFocus: structuredLesson?.skillFocus ?? lesson.objective,
              targetText: plan.targetText,
              minimumAccuracy,
              targetCPM: speedTargetCpm,
              difficulty: structuredLesson?.difficulty ?? (practiceMode === 'weak' ? 'adaptive' : 'beginner'),
              badgeGroup: structuredLesson?.badgeGroup,
              accuracy: metrics.accuracy,
              CPM: metrics.cpm,
              WPM: metrics.wpm,
              mistakes: metrics.errorCount,
              backspaces: metrics.backspaceCount,
              weakKeys,
              stars: metrics.stars,
              XP: finalXpEarned,
              score: metrics.finalScore,
              passed: metrics.passed,
              completedAt: new Date().toISOString(),
            })}
            onContinue={() => navigate('/map')}
            onContinueUnavailable={() => setModal('continueLocked')}
            onRetry={resetLesson}
            onPracticeWeakKeys={() => navigate('/lesson?practice=weak')}
          />
        )}

        <ActionModal open={modal === 'pause'} title="មេរៀនបានផ្អាក" onClose={() => setModal(null)}>
          បិទផ្ទាំងនេះដើម្បីបន្តវាយ។ វឌ្ឍនភាពនឹងរក្សាទុកនៅពេលលទ្ធផលមេរៀនបញ្ចប់។
        </ActionModal>
        <ActionModal open={modal === 'settings'} title="ការកំណត់" onClose={() => setModal(null)}>
          <SettingsPanel
            settings={settings}
            onChange={(nextSettings) => setSettings(saveAppSettings(nextSettings))}
            onResetProgress={handleResetProgress}
          />
        </ActionModal>
        <ActionModal open={modal === 'continueLocked'} title="ត្រូវការភាពត្រឹមត្រូវ" onClose={() => setModal(null)}>
          បន្តបានបន្ទាប់ពីឆ្លងមេរៀន។ សូមលេងម្តងទៀត និងផ្តោតលើការវាយអក្សរខ្មែរឲ្យត្រឹមត្រូវ រហូតដល់ភាពត្រឹមត្រូវ {minimumAccuracy}%។
        </ActionModal>
      </GameScreen>
    </PageTransition>
  );
}
