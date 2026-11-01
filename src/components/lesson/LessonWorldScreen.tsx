import CompletionSaveStatus from './CompletionSaveStatus';
import { auth } from '../../lib/firebase';
import { submitLessonAttempt, isStudentOnlineSaveAvailable } from '../../lib/lessonCompletion';
import { CURRICULUM_VERSION } from '../../lib/completionContract';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameScreen from '../layout/GameScreen';
import PageTransition from '../layout/PageTransition';
import ActionModal from '../game-ui/ActionModal';
import { SettingsPanel } from '../game-ui/FeaturePanels';
import { backgroundImages } from '../../assets/assetManifest';
import {
  resetLessonProgressRecords,
  saveMockLessonProgress,
} from '../../data/mockData';
import { findKhmerKeyByCode, getKhmerKeyboardInput } from '../../data/keyboardMap';
import type { CurriculumLevel, CurriculumWorld } from '../../data/lessonCurriculum';
import { createKeyPracticeTracker, FOUNDATION_LESSON_ID } from '../../data/touchTypingFoundations';
import { getStructuredLessonByRoute } from '../../data/typingProgression';
import { countKhmerCharacters, countKhmerWords, khmerTextEquals } from '../../lib/khmerText';
import {
  buildLessonTypingPlan,
  getCurrentTargetText,
  getTypedText,
  type TypingUnit,
} from '../../lib/lessonTypingPlan';
import { getFingerGuidance } from '../../lib/fingerGuidance';
import {
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
import {
  loadAppSettings,
  resetFeatureProgressState,
  saveAppSettings,
} from '../../lib/playerFeatures';
import { calculateRewards } from '../../lib/economy';
import { useEconomyState } from '../../lib/useEconomyState';
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
  practiceMode?: 'curriculum' | 'weak' | 'foundation';
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
  virtualAssistedCount: number;
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
    virtualAssistedCount: 0,
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
  if (target.modifier === 'shift') return `ចុច Shift + ${keyLabel} (Press Shift + ${keyLabel})`;
  if (target.modifier === 'altgr') return `ចុច AltGr + ${keyLabel} (Press AltGr + ${keyLabel})`;
  return `ចុច ${keyLabel} (Press ${keyLabel})`;
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

function buildMetrics(
  state: LessonRunState,
  targetUnits: TypingUnit[],
  speedTargetCpm: number,
  minimumAccuracy: number,
): TypingMetricResult {
  const typedText = getTypedText(targetUnits, state.completedInputCount);
  const elapsedMs = getElapsedMs(state);

  return calculateTypingMetrics({
    completed: state.finished && targetUnits.length > 0,
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

function addWeakKeyStat(
  stats: WeakKeyStatRecord,
  value: string,
  keyCode: string | undefined,
  field: 'mistakes' | 'backspaces',
) {
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

export default function LessonWorldScreen({
  world,
  lesson,
  practiceMode = 'curriculum',
}: LessonWorldScreenProps) {
  const navigate = useNavigate();
  const plan = useMemo(() => buildLessonTypingPlan(lesson, world.id), [lesson, world.id]);
  const structuredLesson =
    practiceMode === 'curriculum' ? getStructuredLessonByRoute(world.id, lesson.id) : undefined;
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
  const economy = useEconomyState();
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);
  const progressSavedRef = useRef(false);
  const [committedReward, setCommittedReward] = useState({ XP:0, coins:0, gems:0 });
  const [saveMessage, setSaveMessage] = useState('');
  const attemptIdRef = useRef(crypto.randomUUID());
  const attemptUidRef = useRef(auth?.currentUser?.uid);
  const foundationTrackerRef = useRef(createKeyPracticeTracker());
  const stageErrorsRef = useRef<Record<string, number>>({});

  const activeTarget =
    targetUnits[Math.min(runState.completedInputCount, Math.max(0, targetUnits.length - 1))];
  const typedText = getTypedText(targetUnits, runState.completedInputCount);
  const currentTargetText = getCurrentTargetText(targetUnits, runState.completedInputCount);
  const metrics = useMemo(
    () => buildMetrics(runState, targetUnits, speedTargetCpm, minimumAccuracy),
    [minimumAccuracy, runState, speedTargetCpm, targetUnits],
  );
  const liveScore = metrics.finalScore;
  const weakKeys = summarizeWeakKeyStats(runState.weakKeyStats, 5);
  const resultLessonId =
    practiceMode === 'weak'
      ? 'weak-key-practice'
      : practiceMode === 'foundation'
      ? FOUNDATION_LESSON_ID
      : structuredLesson?.lessonId ?? `${world.id}:${lesson.id}`;
  const previousBestScore = getBestScoreForLesson(initialProgress, resultLessonId);
  const rewardCalculation = calculateRewards({
    mode: 'lesson',
    accuracy: metrics.accuracy,
    CPM: metrics.cpm,
    targetCPM: speedTargetCpm,
    mistakes: metrics.errorCount,
    stars: metrics.stars,
    passed: metrics.passed,
    score: metrics.finalScore,
    previousBestScore,
    currentStreak: economy.streak || initialProgress.currentStreak,
    worldId: structuredLesson?.worldId ?? world.id,
    lessonId: resultLessonId,
  });
  const finalXpEarned = auth?.currentUser ? committedReward.XP : rewardCalculation.xpEarned;
  const displayedXpEarned = runState.finished
    ? finalXpEarned
    : Math.min(40, runState.completedInputCount * 2);
  const coinsEarned = auth?.currentUser ? committedReward.coins : runState.finished ? rewardCalculation.coinsEarned : 0;
  const gemsEarned = auth?.currentUser ? committedReward.gems : runState.finished ? rewardCalculation.gemsEarned : 0;
  const questStages = getQuestStages(
    runState.completedInputCount,
    targetUnits.length,
    runState.finished,
  );
  const shiftRequired = activeTarget?.modifier === 'shift';
  const altgrRequired = activeTarget?.modifier === 'altgr';
  const keyHint = activeTarget ? getKeyHint(activeTarget) : 'រួចរាល់ (Complete)';
  const fingerGuidance = activeTarget
    ? getFingerGuidance(activeTarget.key, shiftRequired, altgrRequired)
    : {
        activeHand: 'right' as const,
        activeFinger: 'right-index' as const,
        label: 'Complete',
        labelKh: 'រួចរាល់',
        bilingualLabel: 'រួចរាល់ (Complete)',
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
  const handHint = `${fingerGuidance.bilingualLabel} • ${fingerGuidance.reachInstructionKh}`;
  const visibleKeyHint = settings.keyboardHintsEnabled
    ? keyHint
    : 'ជំនួយក្តារចុចត្រូវបានបិទក្នុងការកំណត់។';
  const visibleHandHint = settings.handHintsEnabled
    ? handHint
    : 'ជំនួយម្រាមដៃត្រូវបានបិទក្នុងការកំណត់។';

  function showFeedback(nextFeedback: Feedback) {
    window.clearTimeout(feedbackTimeoutRef.current);
    setFeedback(nextFeedback);
    feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 620);
  }

  function updateRunState(updater: (current: LessonRunState, now: number) => LessonRunState) {
    const now = performance.now();
    setRunState((current) => {
      const startedState =
        current.startedAt === null && !current.finished
          ? { ...current, startedAt: now }
          : current;
      return updater(startedState, now);
    });
  }

  function resetLesson() {
    window.clearTimeout(feedbackTimeoutRef.current);
    setRunState(getInitialRunState());
    setFeedback(null);
    setNewBadges([]);
    progressSavedRef.current = false;
    foundationTrackerRef.current.reset();
    stageErrorsRef.current = {};
    attemptIdRef.current = crypto.randomUUID();
    setCommittedReward({ XP:0, coins:0, gems:0 });
  }

  function handleResetProgress() {
    resetStudentProgress();
    resetFeatureProgressState();
    void resetLessonProgressRecords().catch((error) =>
      console.error('Unable to reset lesson progress records.', error),
    );
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
        weakKeyStats: removedTarget
          ? addWeakKeyStat(
              current.weakKeyStats,
              removedTarget.value,
              removedTarget.key.code,
              'backspaces',
            )
          : current.weakKeyStats,
        streak: 0,
      };
    });
  }

  function handleTypedValue(
    value: string,
    code: string,
    inputSource: 'physical' | 'virtual' = 'physical',
  ) {
    if (runState.finished || modal || !activeTarget) return;

    const isPhysicalKeyMode =
      activeTarget.practiceMode === 'physical-key' ||
      activeTarget.practiceMode === 'hand-position';

    if (practiceMode === 'foundation') foundationTrackerRef.current.recordKeyAttempt(activeTarget.key.code, code, isPhysicalKeyMode ? code === activeTarget.key.code : khmerTextEquals(value, activeTarget.value), inputSource);
    if (isPhysicalKeyMode && inputSource === 'virtual') {
      // Do not count a virtual mouse click as verified physical-key mastery in Mode A
      showFeedback({
        code,
        state: 'correct',
        message: `សូមចុចគ្រាប់ចុចពិតប្រាកដ [${activeTarget.key.latin.toUpperCase()}] លើក្តារចុចរបស់អ្នក (${fingerGuidance.labelKh})`,
      });
      return;
    }

    const isMatched = isPhysicalKeyMode
      ? code === activeTarget.key.code
      : khmerTextEquals(value, activeTarget.value);

    if (isMatched) {
      updateRunState((current, now) => {
        const nextCompletedInputCount = Math.min(
          targetUnits.length,
          current.completedInputCount + 1,
        );
        const nextStreak = current.streak + 1;
        const finished = targetUnits.length > 0 && nextCompletedInputCount >= targetUnits.length;

        return {
          ...current,
          completedInputCount: nextCompletedInputCount,
          virtualAssistedCount:
            current.virtualAssistedCount + (inputSource === 'virtual' ? 1 : 0),
          streak: nextStreak,
          bestStreak: Math.max(current.bestStreak, nextStreak),
          xpEarned: current.xpEarned + 4,
          finished,
          endedAt: finished ? now : current.endedAt,
        };
      });
      showFeedback({
        code,
        state: 'correct',
        message:
          inputSource === 'virtual'
            ? 'ល្អ! សាកចុចគ្រាប់ចុចពិតប្រាកដលើក្តារចុចផងដែរ។'
            : 'ល្អណាស់! (Well done!)',
      });
      return;
    }

    if (activeTarget.stageId) stageErrorsRef.current[activeTarget.stageId] = (stageErrorsRef.current[activeTarget.stageId] ?? 0) + 1;
    updateRunState((current) => ({
      ...current,
      incorrectInputs: current.incorrectInputs + 1,
      weakKeyStats: addWeakKeyStat(
        current.weakKeyStats,
        activeTarget.value,
        activeTarget.key.code,
        'mistakes',
      ),
      streak: 0,
    }));
    showFeedback({
      code,
      state: 'wrong',
      message: shiftRequired
        ? 'សាកល្បងម្តងទៀត • ចុច Shift ជាមួយគ្រាប់ចុចនេះ (Use Shift)'
        : `សាកល្បងម្តងទៀត • ${fingerGuidance.labelKh}`,
    });
  }

  function handleKeyboardPress(code: string) {
    if (modal) return;
    if (code === 'Backspace') {
      handleBackspace();
      return;
    }

    const pressedKey = findKhmerKeyByCode(code);
    if (!pressedKey || pressedKey.disabled || !activeTarget) return;

    const value =
      pressedKey.code === activeTarget.key.code ? activeTarget.value : pressedKey.khmer;
    handleTypedValue(value, code, 'virtual');
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
      if (event.code === 'Space' || event.code === 'Backspace' || event.code === 'Tab') {
        event.preventDefault();
      }
      if (event.repeat) return;

      if (event.code === 'Backspace') {
        event.preventDefault();
        handleKeyboardPressRef.current('Backspace');
        return;
      }

      const keyboardInput = getKhmerKeyboardInput(event);
      if (!keyboardInput) return;

      event.preventDefault();
      handleTypedValueRef.current(keyboardInput.value, keyboardInput.key.code, 'physical');
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

    if (auth?.currentUser?.uid !== attemptUidRef.current) {
      progressSavedRef.current = true;
      queueMicrotask(() => setSaveMessage('Account changed. Restart this lesson before saving.'));
      return;
    }
    if (auth?.currentUser && practiceMode === 'weak') {
      progressSavedRef.current = true;
      queueMicrotask(() => setSaveMessage('Adaptive practice is local-only pending trusted identity support.'));
      return;
    }
    if (auth?.currentUser && isStudentOnlineSaveAvailable()) {
      progressSavedRef.current = true;
      const foundationStages = practiceMode === 'foundation' ? lesson.stages.map(stage => {
        const count = targetUnits.filter(unit => unit.stageId === stage.id).length;
        const accuracy = count ? Math.max(0, Math.round((count - (stageErrorsRef.current[stage.id] ?? 0)) / count * 100)) : 0;
        return { id:stage.id, accuracy, completed:count > 0 && accuracy >= stage.accuracyGoal };
      }) : [];
      const attempt = {
        attemptId: attemptIdRef.current, lessonId: practiceMode === 'foundation' ? FOUNDATION_LESSON_ID : `${world.id}:${lesson.id}`,
        version: CURRICULUM_VERSION, mode: practiceMode === 'foundation' ? 'foundation' as const : '2d' as const,
        category: practiceMode === 'foundation' ? 'mixed' as const : 'unicode-output' as const,
        completedAt: new Date().toISOString(),
        metrics: { accuracy: metrics.accuracy, cpm: metrics.cpm, score: metrics.finalScore, stars: metrics.stars, mistakes: metrics.errorCount, backspaces: metrics.backspaceCount, elapsedSeconds: metrics.elapsedSeconds, passed: metrics.passed && (practiceMode !== 'foundation' || foundationStages.every(stage => stage.completed)) },
        stages: foundationStages, weakKeys,
        ...(practiceMode === 'foundation' ? { foundation: foundationTrackerRef.current.getSummary() } : {}),
      };
      queueMicrotask(() => setSaveMessage('Saving?'));
      void submitLessonAttempt(attempt).then(saved => { setCommittedReward(saved.reward); setSaveMessage(`Saved ? XP ${saved.reward.XP} ? coins ${saved.reward.coins}`); }).catch(error => setSaveMessage(`Save failed / pending on this device: ${error.message}`));
      return;
    }

    // Foundation practice keeps rewards temporary until Task 6 and does not mutate production Firebase or World 1-6 map progress
    if (practiceMode === 'foundation') {
      progressSavedRef.current = true;
      return;
    }

    const completedAt = new Date().toISOString();
    const lessonResult: StudentLessonResult = {
      lessonId: resultLessonId,
      lessonTitle:
        practiceMode === 'weak'
          ? 'Weak-Key Practice'
          : structuredLesson?.lessonTitle ?? lesson.labelEn,
      worldId: structuredLesson?.worldId ?? world.id,
      skillFocus: structuredLesson?.skillFocus ?? lesson.objective,
      targetText: plan.targetText,
      minimumAccuracy,
      targetCPM: speedTargetCpm,
      difficulty:
        structuredLesson?.difficulty ?? (practiceMode === 'weak' ? 'adaptive' : 'beginner'),
      badgeGroup: structuredLesson?.badgeGroup,
      accuracy: metrics.accuracy,
      CPM: metrics.cpm,
      WPM: metrics.wpm,
      mistakes: metrics.errorCount,
      backspaces: metrics.backspaceCount,
      weakKeys,
      stars: metrics.stars,
      XP: finalXpEarned,
      coinsEarned,
      gemsEarned,
      rewardReasons: rewardCalculation.rewardReasons,
      mode: 'lesson',
      score: metrics.finalScore,
      passed: metrics.passed,
      completedAt,
    };
    const saved = saveStudentLessonResult(lessonResult);
    queueMicrotask(() => setNewBadges(saved.newBadges));

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

    }

    progressSavedRef.current = true;
  }, [
    coinsEarned,
    finalXpEarned,
    gemsEarned,
    lesson.id,
    lesson.labelEn,
    lesson.objective,
    lesson.stages,
    metrics,
    minimumAccuracy,
    plan.targetText,
    practiceMode,
    resultLessonId,
    rewardCalculation.rewardReasons,
    runState.bestStreak,
    runState.finished,
    speedTargetCpm,
    structuredLesson,
    targetUnits,
    weakKeys,
    world.id,
  ]);

  if (!activeTarget) {
    return (
      <PageTransition className="h-screen overflow-hidden bg-[#0A6FB5]">
      <CompletionSaveStatus message={saveMessage} />
        <GameScreen
          background={backgroundImages.lesson}
          fit="stretch"
          className="grid place-items-center font-sans text-[#17325A]"
          style={{ backgroundSize: '100% 100%' }}
        >
          <div className="rounded-[24px] bg-white/90 px-8 py-6 text-2xl font-black">
            This lesson has no typeable Khmer targets yet.
          </div>
        </GameScreen>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="h-screen overflow-hidden bg-[#0A6FB5]">
      <CompletionSaveStatus message={saveMessage} />
      <GameScreen
        background={backgroundImages.lesson}
        fit="stretch"
        className="font-sans text-[#17325A]"
        style={{ backgroundSize: '100% 100%' }}
      >
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
          physicalUnits={plan.practiceMode === 'physical-key' ? targetUnits : undefined}
          completedPhysicalInputs={runState.completedInputCount}
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
          altgrRequired={settings.keyboardHintsEnabled && altgrRequired}
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
              lessonTitle:
                practiceMode === 'weak'
                  ? 'Weak-Key Practice'
                  : structuredLesson?.lessonTitle ?? lesson.labelEn,
              worldId: structuredLesson?.worldId ?? world.id,
              skillFocus: structuredLesson?.skillFocus ?? lesson.objective,
              targetText: plan.targetText,
              minimumAccuracy,
              targetCPM: speedTargetCpm,
              difficulty:
                structuredLesson?.difficulty ??
                (practiceMode === 'weak' ? 'adaptive' : 'beginner'),
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
        <ActionModal
          open={modal === 'continueLocked'}
          title="ត្រូវការភាពត្រឹមត្រូវ"
          onClose={() => setModal(null)}
        >
          បន្តបានបន្ទាប់ពីឆ្លងមេរៀន។ សូមលេងម្តងទៀត និងផ្តោតលើការវាយអក្សរខ្មែរឲ្យត្រឹមត្រូវ រហូតដល់ភាពត្រឹមត្រូវ{' '}
          {minimumAccuracy}%។
        </ActionModal>
      </GameScreen>
    </PageTransition>
  );
}
