import { USER_PROFILE_EVENT } from '../lib/userProfile';
import { loadCachedGameProfile } from '../services/profileService';
import WorldPhysics from '../features/three-game/physics/WorldPhysics';
import Checkpoints, { WORLD_CHECKPOINTS } from '../features/three-game/physics/Checkpoints';
import Hazards from '../features/three-game/physics/Hazards';
import WorldStreamingManager, { getPlayerActiveRegion } from '../features/three-game/world/WorldStreamingManager';
import InWorldServicesModal, { type ServiceTab } from '../features/three-game/services/InWorldServicesModal';
import { isCheckpointDiscovered } from '../lib/explorationRecord';
import CompletionSaveStatus from '../components/lesson/CompletionSaveStatus';
import { auth } from '../lib/firebase';
import { submitLessonAttempt, isStudentOnlineSaveAvailable } from '../lib/lessonCompletion';
import { prepareBossAttempt } from '../lib/economy';
import { CURRICULUM_VERSION } from '../lib/completionContract';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { buildAdventureWorlds, getLessonState } from '../data/adventureWorlds';
import { LESSON_PROGRESS_EVENT, saveMockLessonProgress, type LessonProgressRecord } from '../data/mockData';
import { getThreeLessonAccess } from '../data/threeLessonAvailability';
import {
  createKeyPracticeTracker,
  FOUNDATION_LESSON_ID,
} from '../data/touchTypingFoundations';
import ExplorationHud from '../features/three-game/components/ExplorationHud';
import TypingOverlay from '../features/three-game/components/TypingOverlay';
import VictoryModal from '../features/three-game/components/VictoryModal';
import LessonIntroModal from '../features/three-game/components/LessonIntroModal';
import GamePauseMenu from '../features/three-game/components/GamePauseMenu';
import { usePlayerControls } from '../features/three-game/hooks/usePlayerControls';
import AncientGateScene from '../features/three-game/scenes/AncientGateScene';
import { gameAudio } from '../lib/audio/gameAudio';
import { getLessonExperienceConfig, isCustomExperienceSupported } from '../features/three-game/config/lessonExperienceConfig';
import {
  applyBackspaceInput,
  applyTypedInput,
  areAllStagesCompleted,
  canAccessStage,
  computeFinalLessonMetrics,
  computeStageMetrics,
  createInMemoryLessonPersistenceAdapter,
  createInitialStageProgressStates,
  createPrototypeRewardLedger,
  createStageTypingPlan,
  createTypingSessionState,
  doesStageUnlockPhysicalBarrier,
  getStageAltarPositionZ,
  getStageBarrierIndex,
  getStageMinimumAccuracy,
  getStagePositionZ,
  isPositionNearStage,
  recordStageAttemptResult,
  resolveFoundationLessonConfig,
  resolveThreeLessonConfig,
  setStageGateStatus,
  shouldUnlockStage,
} from '../features/three-game/systems/gameplayState';
import ThreeGameCanvas from '../features/three-game/ThreeGameCanvas';
import type {
  GameMode,
  GateState,
  Position3D,
  PrototypeReward,
  StageCompletionSummary,
  StageProgressState,
  ThreeLessonConfig,
  TypingSessionState,
} from '../features/three-game/types';
import type { TypingMetricResult } from '../lib/typingMetrics';

const INITIAL_PLAYER_POSITION: Position3D = [0, 0, -6];

export default function ThreePrototypePage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [worlds, setWorlds] = useState(() => buildAdventureWorlds());
  useEffect(() => {
    const refresh = () => setWorlds(buildAdventureWorlds());
    window.addEventListener(LESSON_PROGRESS_EVENT, refresh);
    return () => window.removeEventListener(LESSON_PROGRESS_EVENT, refresh);
  }, []);
  // Keep the original bare prototype URL only as a development testing entry.
  const params =
    (location.pathname === '/game' || (import.meta.env.DEV && location.pathname === '/3d-prototype')) && !location.search
      ? new URLSearchParams(`world=1&level=${worlds[0].lessons.find((lesson) => getLessonState(worlds[0], lesson) === 'current')?.id ?? 1}`)
      : searchParams;
  const access = getThreeLessonAccess(params, worlds);
  if (access.status !== 'ready') {
    const message =
      access.status === 'invalid'
        ? 'តំណមេរៀនមិនត្រឹមត្រូវ។ (Invalid world or lesson.)'
        : access.status === 'locked'
        ? 'សូមបញ្ចប់មេរៀនមុនសិន។ (This lesson is locked. Complete the earlier lessons on the map.)'
        : 'មេរៀននេះមានតែ 2D ប៉ុណ្ណោះ។ (This lesson is available in 2D only.)';
    return (
      <div
        data-testid="three-lesson-unavailable"
        data-reason={access.status}
        className="grid min-h-screen place-items-center bg-slate-900 p-6 font-khmer text-white"
      >
        <div className="max-w-lg rounded-2xl border border-amber-400/40 bg-slate-800 p-6 text-center">
          <h1 className="text-xl font-bold text-amber-300">{message}</h1>
          {access.status === 'unsupported' && (
            <Link
              className="mt-5 block rounded-xl bg-amber-400 p-3 font-bold text-slate-900"
              to={`${
                access.lesson.id === 'boss' ? '/battle' : '/lesson'
              }?world=${access.worldId}&level=${access.lesson.id}`}
            >
              រៀនជា 2D (Play 2D)
            </Link>
          )}
          <Link className="mt-5 block rounded-xl border border-white/30 p-3" to="/map">
            ត្រឡប់ទៅផែនទី (Return to World Map)
          </Link>
        </div>
      </div>
    );
  }
  const lessonConfig = access.isFoundation
    ? resolveFoundationLessonConfig()
    : resolveThreeLessonConfig(access.worldId, access.lesson.id);

  return <ThreeLessonSession key={`${location.key}:${location.search}`} lessonConfig={lessonConfig} />;
}

function ThreeLessonSession({ lessonConfig }: { lessonConfig: ThreeLessonConfig }) {
  const [searchParams] = useSearchParams();
  const { worldId, lesson, stages, lessonSpeedTargetCpm, isFoundationLesson } = lessonConfig;
  const isBossEncounter = lesson.id === 'boss';
  const lessonRewardKey = isFoundationLesson ? FOUNDATION_LESSON_ID : lesson.id;

  const attemptUidRef = useRef(auth?.currentUser?.uid);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<
    'saving' | 'saved' | 'pending-offline' | 'backend-unavailable' | 'save-failed' | 'local-demo' | 'idle'
  >('idle');
  const [mode, setMode] = useState<GameMode>('exploration');
  const isCustomLesson = isCustomExperienceSupported(lesson.id);
  const expConfig = useMemo(() => getLessonExperienceConfig(lesson.id), [lesson.id]);
  const initialPlayerPos = useMemo<Position3D>(() => {
    if (isBossEncounter) return [0, 0, 24];
    if (isCustomLesson && expConfig) return [...expConfig.initialPlayerPosition];
    return [0, 0, INITIAL_PLAYER_POSITION[2]];
  }, [expConfig, isBossEncounter, isCustomLesson]);
  const playerPositionRef = useRef<Position3D>(initialPlayerPos);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [stageStates, setStageStates] = useState<StageProgressState[]>(() =>
    createInitialStageProgressStates(stages),
  );
  const [isNearGate, setIsNearGate] = useState<boolean>(() => {
    if (isBossEncounter) return true;
    if (isCustomLesson && expConfig) {
      const st0 = expConfig.stations[0];
      if (st0) {
        return (
          Math.hypot(initialPlayerPos[0] - st0.position[0], initialPlayerPos[2] - st0.position[2]) <=
          (st0.interactionRadius ?? 3.5)
        );
      }
    }
    return isPositionNearStage(
      initialPlayerPos[0],
      initialPlayerPos[2],
      0,
      stages.length,
    );
  });
  const [gateState, setGateState] = useState<GateState>(() => ({
    status: isBossEncounter ? 'open' : 'closed',
    openProgress: isBossEncounter ? 1 : 0,
  }));

  const activeStage = stages[activeStageIndex] ?? stages[0];
  const activeStageMinimumAccuracy = useMemo(
    () => getStageMinimumAccuracy(activeStage, lesson, worldId),
    [activeStage, lesson, worldId],
  );

  // Typing challenge state, in-memory reward ledger, persistence adapter, and key practice tracker
  const nextAttemptIdRef = useRef(1);
  const lessonCompletionCounterRef = useRef(0);
  const rewardLedgerRef = useRef(createPrototypeRewardLedger());
  const persistenceAdapterRef = useRef(createInMemoryLessonPersistenceAdapter());
  const keyPracticeTrackerRef = useRef(createKeyPracticeTracker());

  const [profile, setProfile] = useState(() => loadCachedGameProfile());
  useEffect(() => {
    const refreshProfile = () => setProfile(loadCachedGameProfile());
    window.addEventListener(USER_PROFILE_EVENT, refreshProfile);
    return () => window.removeEventListener(USER_PROFILE_EVENT, refreshProfile);
  }, []);

  const [typingPlan, setTypingPlan] = useState(() =>
    createStageTypingPlan(stages[0], lesson.focusKeys),
  );

  const [sessionState, setSessionState] = useState<TypingSessionState>(() =>
    createTypingSessionState(1),
  );
  const [showModal, setShowModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceTab | null>(() => {
    const p = searchParams.get('panel') as ServiceTab | null;
    return p && ['sanctuary', 'map', 'observatory', 'market', 'wardrobe', 'settings'].includes(p) ? p : null;
  });
  const [teleportFade, setTeleportFade] = useState(false);
  const [activeRegionName, setActiveRegionName] = useState(() =>
    getPlayerActiveRegion(initialPlayerPos),
  );

  const handleFastTravel = useCallback((pos: Position3D) => {
    setTeleportFade(true);
    playerPositionRef.current = [pos[0], pos[1], pos[2]];
    setActiveRegionName(getPlayerActiveRegion(pos));
    setTimeout(() => setTeleportFade(false), 300);
  }, []);

  const handleHazardTrigger = useCallback(() => {
    const lastCp = WORLD_CHECKPOINTS.find((cp) => isCheckpointDiscovered(cp.id)) ?? WORLD_CHECKPOINTS[0];
    setTeleportFade(true);
    playerPositionRef.current = [...lastCp.position];
    setTimeout(() => setTeleportFade(false), 250);
  }, []);

  const [stageSummary, setStageSummary] = useState<StageCompletionSummary | null>(null);
  const [finalLessonMetrics, setFinalLessonMetrics] = useState<TypingMetricResult | null>(null);
  const [reward, setReward] = useState<PrototypeReward | null>(null);
  const [isDuplicateReward, setIsDuplicateReward] = useState(false);
  const [nowTime, setNowTime] = useState<number | null>(null);

  const stageStatuses = useMemo(() => stageStates.map((s) => s.status), [stageStates]);
  const allCompleted = useMemo(() => areAllStagesCompleted(stageStates), [stageStates]);

  useEffect(() => {
    if (
      sessionState.startedAt === null ||
      sessionState.endedAt !== null ||
      mode !== 'typing'
    ) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setNowTime(performance.now());
    }, 500);
    return () => window.clearInterval(timer);
  }, [mode, sessionState.endedAt, sessionState.startedAt]);

  const startStageTypingSession = useCallback(
    (targetStageIndex: number) => {
      const targetStage = stages[targetStageIndex] ?? stages[0];
      nextAttemptIdRef.current += 1;
      const nextId = nextAttemptIdRef.current;
      setTypingPlan(createStageTypingPlan(targetStage, lesson.focusKeys));
      setSessionState(createTypingSessionState(nextId));
      setNowTime(null);
      setShowModal(false);
    },
    [lesson.focusKeys, stages],
  );

  const handleStartTyping = useCallback(() => {
    if (!canAccessStage(activeStageIndex, activeStageIndex, stageStates)) return;
    if (isBossEncounter && activeStageIndex === 0) {
      try {
        const uid = auth?.currentUser?.uid;
        if (uid) void prepareBossAttempt(uid);
      } catch {
        /* Local / offline fallback */
      }
    }
    setShowIntroModal(false);
    startStageTypingSession(activeStageIndex);
    gameAudio.playTempleGong();
    setMode('typing');
  }, [activeStageIndex, isBossEncounter, stageStates, startStageTypingSession]);

  const handleCancelTyping = useCallback(() => {
    startStageTypingSession(activeStageIndex);
    setMode('exploration');
  }, [activeStageIndex, startStageTypingSession]);

  const handleEscape = useCallback(() => {
    if (activeServiceModal) {
      setActiveServiceModal(null);
    } else if (mode === 'typing') {
      handleCancelTyping();
    } else if (!showModal && !showIntroModal) {
      setPauseOpen((open) => !open);
    }
  }, [activeServiceModal, handleCancelTyping, mode, showIntroModal, showModal]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const win = window as unknown as {
      __threeGetPlayerPos?: () => Position3D;
      __threeSetPlayerPos?: (x: number, y: number, z: number) => void;
      __threeUnlockAllStages?: () => void;
      __threeStartStage?: (stageIdx: number) => void;
      __threeGetLessonDebug?: () => {
        activeStageIndex: number;
        stageStates: StageProgressState[];
        rewardTotals: ReturnType<typeof rewardLedgerRef.current.getTotals>;
        completionsCount: number;
        mode: GameMode;
        isNearGate: boolean;
        completedCount: number;
        nextKey: { code: string; modifier: string } | null;
      };
    };
    win.__threeGetPlayerPos = () => playerPositionRef.current;
    win.__threeSetPlayerPos = (x: number, y: number, z: number) => {
      playerPositionRef.current = [x, y, z];
      let near = false;
      if (isBossEncounter) {
        near = true;
      } else if (isCustomLesson && expConfig) {
        const station = expConfig.stations[activeStageIndex];
        if (station) {
          near =
            Math.hypot(x - station.position[0], z - station.position[2]) <=
            (station.interactionRadius ?? 3.5);
        }
      } else {
        near = isPositionNearStage(x, z, activeStageIndex, stages.length);
      }
      setIsNearGate(near);
    };
    win.__threeUnlockAllStages = () => {
      setStageStates((prev) => prev.map((s) => ({ ...s, status: 'open', passed: true })));
      setGateState({ status: 'open', openProgress: 1.0 });
      setMode('completed');
    };
    win.__threeStartStage = (stageIdx: number) => {
      setActiveStageIndex(stageIdx);
      setShowIntroModal(false);
      startStageTypingSession(stageIdx);
      setMode('typing');
    };
    win.__threeGetLessonDebug = () => ({
      activeStageIndex,
      stageStates,
      rewardTotals: rewardLedgerRef.current.getTotals(),
      completionsCount: persistenceAdapterRef.current.getCompletions().length,
      mode,
      isNearGate,
      completedCount: sessionState.completedCount,
      nextKey: typingPlan.units[sessionState.completedCount]
        ? {
            code: typingPlan.units[sessionState.completedCount].key.code,
            modifier: typingPlan.units[sessionState.completedCount].modifier,
          }
        : null,
    });
    return () => {
      delete win.__threeGetPlayerPos;
      delete win.__threeSetPlayerPos;
      delete win.__threeUnlockAllStages;
      delete win.__threeStartStage;
      delete win.__threeGetLessonDebug;
    };
  }, [
    activeStageIndex,
    expConfig,
    isBossEncounter,
    isCustomLesson,
    isNearGate,
    mode,
    sessionState.completedCount,
    stageStates,
    stages.length,
    startStageTypingSession,
    typingPlan.units,
  ]);

  const isAnyModalOpen = showModal || showIntroModal || pauseOpen || Boolean(activeServiceModal);

  const movement = usePlayerControls(
    mode,
    () => {
      if (
        isNearGate &&
        canAccessStage(activeStageIndex, activeStageIndex, stageStates) &&
        mode === 'exploration' &&
        !isAnyModalOpen
      ) {
        handleStartTyping();
      }
    },
    handleEscape,
    isAnyModalOpen,
  );

  const handleRestartTyping = useCallback(() => {
    startStageTypingSession(activeStageIndex);
    setMode('typing');
  }, [activeStageIndex, startStageTypingSession]);

  // Live typing metrics for the active stage
  const elapsedMs =
    (sessionState.endedAt ?? (nowTime ?? sessionState.startedAt ?? 0)) -
    (sessionState.startedAt ?? 0);

  const metrics = useMemo(() => {
    return computeStageMetrics(
      typingPlan.units,
      sessionState.completedCount,
      sessionState.incorrectCount,
      sessionState.backspaceCount,
      sessionState.bestStreak,
      elapsedMs,
      activeStage,
      lesson,
      worldId,
    );
  }, [
    activeStage,
    elapsedMs,
    lesson,
    sessionState.backspaceCount,
    sessionState.bestStreak,
    sessionState.completedCount,
    sessionState.incorrectCount,
    typingPlan.units,
    worldId,
  ]);

  const finalizeStageAttempt = useCallback(
    (completedSession: TypingSessionState, finalElapsedMs: number) => {
      const stageMetrics = computeStageMetrics(
        typingPlan.units,
        completedSession.completedCount,
        completedSession.incorrectCount,
        completedSession.backspaceCount,
        completedSession.bestStreak,
        finalElapsedMs,
        activeStage,
        lesson,
        worldId,
      );

      const passed = shouldUnlockStage(stageMetrics);
      const isFinalStage = activeStageIndex >= stages.length - 1;
      const unlocksPhysicalBarrier = doesStageUnlockPhysicalBarrier(
        activeStageIndex,
        stages.length,
      );
      const nextStatus = passed
        ? unlocksPhysicalBarrier
          ? 'opening'
          : 'open'
        : 'closed';

      const nextStageStates = recordStageAttemptResult(
        stageStates,
        activeStageIndex,
        stageMetrics,
        completedSession,
        typingPlan.units,
        finalElapsedMs,
        nextStatus,
      );

      setStageStates(nextStageStates);
      setStageSummary({
        stageIndex: activeStageIndex,
        stageId: activeStage.id,
        titleKh: activeStage.titleKh,
        titleEn: activeStage.titleEn,
        kind: activeStage.kind,
        minimumAccuracy: activeStageMinimumAccuracy,
        passed,
        metrics: stageMetrics,
        isFinalStage,
        foundationPracticeSummary: isFoundationLesson
          ? keyPracticeTrackerRef.current.getSummary()
          : null,
      });

      if (passed) {
        gameAudio.playStageVictory();
        persistenceAdapterRef.current.recordStageCompletion(
          worldId,
          lessonRewardKey,
          nextStageStates[activeStageIndex],
        );

        const activeBarrierIndex = getStageBarrierIndex(activeStageIndex, stages.length);
        if (unlocksPhysicalBarrier && activeBarrierIndex === 0) {
          setGateState({ status: 'opening', openProgress: 0 });
        }

        if (isFinalStage) {
          const aggregatedMetrics = computeFinalLessonMetrics(
            nextStageStates,
            lesson,
            worldId,
          );
          const { reward: claimedReward, duplicate } =
            rewardLedgerRef.current.claimLessonReward(
              worldId,
              lessonRewardKey,
              aggregatedMetrics,
              lessonSpeedTargetCpm,
              completedSession.attemptId,
            );
          setFinalLessonMetrics(aggregatedMetrics);
          // Save local student progress so World Map unlocks the next lesson
          if (!isFoundationLesson && aggregatedMetrics.passed) {
            const progressRecord: LessonProgressRecord = {
              worldId,
              lessonId: lesson.id,
              score: aggregatedMetrics.finalScore,
              accuracy: aggregatedMetrics.accuracy,
              cpm: aggregatedMetrics.cpm,
              wpm: Math.round(aggregatedMetrics.cpm / 5),
              stars: aggregatedMetrics.stars,
              xpEarned: claimedReward.xpEarned,
              coinsEarned: claimedReward.coinsEarned,
              bestStreak: nextStageStates.reduce((max, s) => Math.max(max, s.bestStreak), 0),
              passed: true,
              completed: true,
              timeSeconds: aggregatedMetrics.elapsedSeconds,
              mistakes: aggregatedMetrics.errorCount,
              backspaces: aggregatedMetrics.backspaceCount,
            };
            saveMockLessonProgress(progressRecord);
          }
          const canSaveOnline = isStudentOnlineSaveAvailable();
          const currentUid = auth?.currentUser?.uid;
          if (!attemptUidRef.current && currentUid) {
            attemptUidRef.current = currentUid;
          }
          if (canSaveOnline && currentUid && (!attemptUidRef.current || attemptUidRef.current === currentUid)) {
            setReward(claimedReward);
            setSaveStatus('saving');
            setSaveMessage('Saving…');
            void submitLessonAttempt({
              attemptId: crypto.randomUUID(), lessonId: isFoundationLesson ? FOUNDATION_LESSON_ID : `${worldId}:${lesson.id}`,
              version: CURRICULUM_VERSION, mode: isFoundationLesson ? 'foundation' : '3d', category: isFoundationLesson ? 'mixed' : 'unicode-output',
              completedAt: new Date().toISOString(),
              metrics: { accuracy: aggregatedMetrics.accuracy, cpm: aggregatedMetrics.cpm, score: aggregatedMetrics.finalScore, stars: aggregatedMetrics.stars, mistakes: aggregatedMetrics.errorCount, backspaces: aggregatedMetrics.backspaceCount, elapsedSeconds: aggregatedMetrics.elapsedSeconds, passed: aggregatedMetrics.passed },
              ...(isFoundationLesson ? { foundation: keyPracticeTrackerRef.current.getSummary() } : {}),
              stages: nextStageStates.map(s => ({ id:s.stageId, accuracy:s.bestAccuracy, completed:s.passed })),
            }).then((saved) => {
              setReward({
                ...claimedReward,
                xpEarned: saved.reward.XP,
                coinsEarned: saved.reward.coins,
                totalSessionXp: saved.reward.XP,
                totalSessionCoins: saved.reward.coins,
              });
              setSaveStatus('saved');
              setSaveMessage(`Saved · XP ${saved.reward.XP} · coins ${saved.reward.coins}`);
              if (!isFoundationLesson && aggregatedMetrics.passed) {
                saveMockLessonProgress({
                  worldId,
                  lessonId: lesson.id,
                  score: aggregatedMetrics.finalScore,
                  accuracy: aggregatedMetrics.accuracy,
                  cpm: aggregatedMetrics.cpm,
                  wpm: Math.round(aggregatedMetrics.cpm / 5),
                  stars: aggregatedMetrics.stars,
                  xpEarned: saved.reward.XP,
                  coinsEarned: saved.reward.coins,
                  bestStreak: nextStageStates.reduce((max, s) => Math.max(max, s.bestStreak), 0),
                  passed: true,
                  completed: true,
                  timeSeconds: aggregatedMetrics.elapsedSeconds,
                  mistakes: aggregatedMetrics.errorCount,
                  backspaces: aggregatedMetrics.backspaceCount,
                });
              }
            }).catch((error: Error) => {
              const isOffline = !navigator.onLine || error.message?.includes('network') || error.message?.includes('unavailable');
              if (isOffline) {
                setSaveStatus('pending-offline');
                setSaveMessage('Pending on this device: Saved locally; will sync when online');
              } else {
                setSaveStatus('save-failed');
                setSaveMessage(`Save failed / pending on this device: ${error.message}`);
              }
            });
          } else {
            setReward(claimedReward);
            const isGuest = !auth?.currentUser || auth?.currentUser?.isAnonymous;
            setSaveStatus(isGuest ? 'local-demo' : 'backend-unavailable');
            setSaveMessage('');
          }
          setIsDuplicateReward(duplicate);

          lessonCompletionCounterRef.current += 1;
          persistenceAdapterRef.current.recordLessonCompletion({
            worldId,
            lessonId: lessonRewardKey,
            lessonCompletionIndex: lessonCompletionCounterRef.current,
            stageStates: nextStageStates,
            finalMetrics: aggregatedMetrics,
            reward: claimedReward,
            completedAt: Date.now(),
          });
        }

        if (unlocksPhysicalBarrier) {
          setMode('opening');
        } else {
          setMode('exploration');
          setShowModal(true);
        }
      } else {
        setMode('exploration');
        setShowModal(true);
      }
    },
    [
      activeStage,
      activeStageIndex,
      activeStageMinimumAccuracy,
      isFoundationLesson,
      lesson,
      lessonRewardKey,
      lessonSpeedTargetCpm,
      stageStates,
      stages.length,
      typingPlan.units,
      worldId,
    ],
  );

  // Untimed completion handler for Stage 1 (Learn Hand Position)
  const handleCompleteHandPositionStage = useCallback(() => {
    if (mode !== 'typing' || activeStage.practiceMode !== 'hand-position') return;
    const now = performance.now();
    typingPlan.units.forEach((u) => {
      keyPracticeTrackerRef.current.recordKeyAttempt(u.key.code, u.key.code, true, 'physical');
    });
    const completedSession: TypingSessionState = {
      ...sessionState,
      startedAt: sessionState.startedAt ?? now - 4000,
      endedAt: now,
      completedCount: typingPlan.units.length,
      streak: typingPlan.units.length,
      bestStreak: Math.max(sessionState.bestStreak, typingPlan.units.length),
      finished: true,
    };
    setSessionState(completedSession);
    finalizeStageAttempt(completedSession, 4000);
  }, [activeStage.practiceMode, finalizeStageAttempt, mode, sessionState, typingPlan.units]);

  const handleTypedValue = useCallback(
    (value: string, code: string, inputSource: 'physical' | 'virtual' = 'physical') => {
      if (mode !== 'typing' || sessionState.finished) return;
      const activeTarget = typingPlan.units[sessionState.completedCount];
      if (!activeTarget) return;

      const isPhysicalMode =
        activeTarget.practiceMode === 'physical-key' ||
        activeTarget.practiceMode === 'hand-position';

      // In Mode A (physical-key practice), do not count virtual mouse clicks as verified physical-key mastery
      if (isPhysicalMode && inputSource === 'virtual') {
        keyPracticeTrackerRef.current.recordKeyAttempt(
          activeTarget.key.code,
          code,
          code === activeTarget.key.code,
          'virtual',
        );
        return;
      }

      const now = performance.now();
      setNowTime(now);

      const { nextState, matched, justFinished } = applyTypedInput(
        sessionState,
        typingPlan.units,
        value,
        now,
        code,
      );
      keyPracticeTrackerRef.current.recordKeyAttempt(
        activeTarget.key.code,
        code,
        matched,
        inputSource,
      );
      setSessionState(nextState);

      if (justFinished) {
        const finalElapsedMs = Math.max(
          1,
          (nextState.endedAt ?? now) - (nextState.startedAt ?? now),
        );
        finalizeStageAttempt(nextState, finalElapsedMs);
      }
    },
    [finalizeStageAttempt, mode, sessionState, typingPlan.units],
  );

  const handleBackspace = useCallback(() => {
    if (mode !== 'typing' || sessionState.finished) return;
    setSessionState((prev) => applyBackspaceInput(prev));
  }, [mode, sessionState.finished]);

  const handleStageOpeningFinished = useCallback(
    (stageIdx = activeStageIndex) => {
      if (
        mode !== 'opening' ||
        stageIdx !== activeStageIndex ||
        !stageStates[stageIdx]?.passed
      ) {
        return;
      }
      setStageStates((prev) => setStageGateStatus(prev, stageIdx, 'open'));
      const barrierIndex = getStageBarrierIndex(stageIdx, stages.length);
      if (barrierIndex === 0) {
        setGateState((prev) =>
          prev.status === 'open' ? prev : { status: 'open', openProgress: 1.0 },
        );
      }
      const isFinalStage = stageIdx >= stages.length - 1;
      setMode((prev) =>
        prev === 'opening' ? (isFinalStage ? 'completed' : 'exploration') : prev,
      );
      setShowModal(true);
    },
    [activeStageIndex, mode, stageStates, stages.length],
  );

  const handleGateOpeningFinished = useCallback(() => {
    const firstBarrierStageIdx = stages.length === 5 ? 1 : 0;
    handleStageOpeningFinished(firstBarrierStageIdx);
  }, [handleStageOpeningFinished, stages.length]);

  // Fallback timer in case WebGL requestAnimationFrame is throttled in background/headless tabs
  useEffect(() => {
    if (mode !== 'opening') return undefined;
    const timer = window.setTimeout(() => {
      handleStageOpeningFinished(activeStageIndex);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [activeStageIndex, handleStageOpeningFinished, mode]);

  const handleWalkThrough = useCallback(() => {
    setShowModal(false);
    if (activeStageIndex + 1 < stages.length) {
      const nextIdx = activeStageIndex + 1;
      setActiveStageIndex(nextIdx);
      startStageTypingSession(nextIdx);
      if (isBossEncounter) {
        playerPositionRef.current = [0, 0, 24];
        setIsNearGate(true);
      } else if (isCustomLesson && expConfig) {
        // Keep the hero at the completed station so the newly opened route
        // remains part of the adventure. The waypoint now leads to nextIdx.
        setIsNearGate(false);
      } else {
        // Advance player along the temple causeway to the next stage's altar
        const nextAltarZ = getStageAltarPositionZ(nextIdx, stages.length) - 0.5;
        playerPositionRef.current = [0, 0, nextAltarZ];
        setIsNearGate(true);
      }
      setMode('exploration');
    } else {
      if (isBossEncounter) {
        playerPositionRef.current = [0, 0, 26];
      } else if (isCustomLesson && expConfig) {
        const lastStation = expConfig.stations[expConfig.stations.length - 1];
        if (lastStation) {
          playerPositionRef.current = [
            lastStation.position[0],
            lastStation.position[1],
            lastStation.position[2] + 2.0,
          ];
        }
      } else {
        const finalSanctuaryZ = getStagePositionZ(stages.length - 1, stages.length) + 2.5;
        playerPositionRef.current = [0, 0, finalSanctuaryZ];
      }
      setMode('completed');
    }
  }, [activeStageIndex, expConfig, isBossEncounter, isCustomLesson, stages.length, startStageTypingSession]);

  const handleRetryChallenge = useCallback(() => {
    setStageStates((prev) => setStageGateStatus(prev, activeStageIndex, 'closed'));
    if (isBossEncounter) {
      playerPositionRef.current = [0, 0, 24];
      setIsNearGate(true);
    } else if (isCustomLesson && expConfig) {
      const curStation = expConfig.stations[activeStageIndex];
      if (curStation) {
        playerPositionRef.current = [
          curStation.position[0],
          curStation.position[1],
          curStation.position[2] - 1.2,
        ];
        setIsNearGate(true);
      }
    } else {
      const barrierIdx = getStageBarrierIndex(activeStageIndex, stages.length);
      if (barrierIdx === 0 && doesStageUnlockPhysicalBarrier(activeStageIndex, stages.length)) {
        setGateState({ status: 'closed', openProgress: 0 });
      }
      const altarZ = getStageAltarPositionZ(activeStageIndex, stages.length);
      if (playerPositionRef.current[2] > altarZ) {
        playerPositionRef.current = [0, 0, altarZ - 0.6];
        setIsNearGate(true);
      }
    }
    startStageTypingSession(activeStageIndex);
    setMode('typing');
  }, [activeStageIndex, expConfig, isBossEncounter, isCustomLesson, stages.length, startStageTypingSession]);

  const handleReplayLesson = useCallback(() => {
    keyPracticeTrackerRef.current.reset();
    setStageStates(createInitialStageProgressStates(stages));
    setGateState({
      status: isBossEncounter ? 'open' : 'closed',
      openProgress: isBossEncounter ? 1 : 0,
    });
    setActiveStageIndex(0);
    setStageSummary(null);
    setFinalLessonMetrics(null);
    setReward(null);
    setIsDuplicateReward(false);
    if (isBossEncounter) {
      playerPositionRef.current = [0, 0, 24];
    } else if (isCustomLesson && expConfig) {
      playerPositionRef.current = [...expConfig.initialPlayerPosition];
    } else {
      playerPositionRef.current = [0, 0, getStageAltarPositionZ(0, stages.length) - 0.6];
    }
    setIsNearGate(true);
    startStageTypingSession(0);
    setMode('exploration');
  }, [expConfig, isBossEncounter, isCustomLesson, stages, startStageTypingSession]);

  const activeStageStatus = stageStates[activeStageIndex]?.status ?? gateState.status;

  return (
    <div
      data-testid="three-prototype-page"
      data-mode={mode}
      data-gate-status={activeStageStatus}
      data-active-stage={activeStageIndex + 1}
      data-all-stages-completed={allCompleted ? 'true' : 'false'}
      data-foundation-lesson={isFoundationLesson ? 'true' : undefined}
      className="relative h-screen w-screen overflow-hidden bg-black select-none"
    >
      {/* 3D R3F Canvas Viewport */}
      <CompletionSaveStatus message={saveMessage} status={saveStatus} />
      <ThreeGameCanvas>
        <WorldPhysics>
          <WorldStreamingManager
            playerPositionRef={playerPositionRef}
            onOpenService={(srv) => setActiveServiceModal(srv)}
            onEnterLesson={(wId, lId) => {
              window.location.search = `?world=${wId}&level=${lId}`;
            }}
            unlockedLevels={{ 1: 8, 2: 8, 3: 8, 4: 8, 5: 8, 6: 'boss' }}
          />
          <Checkpoints
            playerPositionRef={playerPositionRef}
            onCheckpointTrigger={() => {
              gameAudio.playMechanismActivation();
            }}
          />
          <Hazards
            playerPositionRef={playerPositionRef}
            onHazardTrigger={handleHazardTrigger}
          />
          <AncientGateScene
            mode={mode}
            playerPositionRef={playerPositionRef}
            gateState={gateState}
            stageStatuses={stageStatuses}
            activeStageIndex={activeStageIndex}
            movement={movement}
            isModalOpen={isAnyModalOpen}
            streak={sessionState.streak}
            completedCount={sessionState.completedCount}
            incorrectCount={sessionState.incorrectCount}
            onNearGateChange={setIsNearGate}
            onGateOpeningFinished={handleGateOpeningFinished}
            onStageOpeningFinished={handleStageOpeningFinished}
            onInteract={handleStartTyping}
            lessonId={lesson.id}
            stageId={activeStage?.id}
            totalStageUnits={typingPlan.units.length}
            skinStyleId={profile.equippedSkinId}
            avatarId={profile.equippedAvatarId}
            respawnPosition={[0, 0, -8]}
            onHazardReset={handleHazardTrigger}
          />
        </WorldPhysics>
      </ThreeGameCanvas>

      {/* HTML Overlays */}
      {teleportFade && (
        <div className="absolute inset-0 z-[100] bg-slate-950 pointer-events-none transition-opacity duration-300" />
      )}
      {activeServiceModal && (
        <InWorldServicesModal
          initialTab={activeServiceModal}
          onClose={() => setActiveServiceModal(null)}
          onSelectLesson={(wId, lId) => {
            setActiveServiceModal(null);
            window.location.search = `?world=${wId}&level=${lId}`;
          }}
          onFastTravel={handleFastTravel}
          currentRegionName={activeRegionName}
        />
      )}
      {(mode === 'exploration' || mode === 'completed') && !showModal && !pauseOpen && (
        <ExplorationHud
          isNearGate={isNearGate}
          gateStatus={activeStageStatus}
          lessonTitleKh={lesson.labelKh}
          lessonTitleEn={lesson.labelEn}
          stages={stages}
          stageStates={stageStates}
          activeStageIndex={activeStageIndex}
          activeStageMinimumAccuracy={activeStageMinimumAccuracy}
          allStagesCompleted={allCompleted}
          onStartTyping={handleStartTyping}
          onReplayLesson={handleReplayLesson}
          lessonId={lesson.id}
        />
      )}

      {mode === 'typing' && (
        <TypingOverlay
          targetUnits={typingPlan.units}
          metrics={metrics}
          minimumAccuracy={activeStageMinimumAccuracy}
          speedTargetCpm={lessonSpeedTargetCpm}
          completedCount={sessionState.completedCount}
          streak={sessionState.streak}
          stage={activeStage}
          stageIndex={activeStageIndex}
          totalStages={stages.length}
          lessonTitleKh={lesson.labelKh}
          onTypedValue={handleTypedValue}
          onBackspace={handleBackspace}
          onCancel={handleCancelTyping}
          onRestart={handleRestartTyping}
          onCompleteHandPositionStage={handleCompleteHandPositionStage}
        />
      )}

      {showModal && (
        <VictoryModal
          passed={Boolean(stageSummary?.passed)}
          minimumAccuracy={stageSummary?.minimumAccuracy ?? activeStageMinimumAccuracy}
          reward={reward}
          stageSummary={stageSummary}
          stages={stages}
          stageStates={stageStates}
          finalLessonMetrics={finalLessonMetrics}
          isDuplicateReward={isDuplicateReward}
          saveStatus={saveStatus}
          isFoundationLesson={isFoundationLesson}
          onWalkThrough={handleWalkThrough}
          onRetry={handleRetryChallenge}
          onReplayLesson={handleReplayLesson}
          lessonId={lesson.id}
        />
      )}

      {showIntroModal && mode === 'exploration' && !showModal && (
        <LessonIntroModal
          isOpen={showIntroModal}
          onStart={() => setShowIntroModal(false)}
          lessonId={lesson.id}
          lessonTitleKh={lesson.labelKh}
          lessonTitleEn={lesson.labelEn}
          stages={stages}
        />
      )}
      {(mode === 'exploration' || mode === 'completed') && !showIntroModal && !showModal && (
        <>
          {!pauseOpen && !activeServiceModal && (
            <button
              type="button"
              data-testid="three-pause-button"
              onClick={() => setPauseOpen(true)}
              className="absolute bottom-4 right-4 z-30 rounded-xl border border-amber-300/60 bg-slate-900/90 px-4 py-2 font-bold text-white shadow-lg hover:border-amber-300"
            >
              ☰ Menu
            </button>
          )}
          {pauseOpen && (
            <GamePauseMenu
              onResume={() => setPauseOpen(false)}
              onOpenService={(srv) => {
                setPauseOpen(false);
                setActiveServiceModal(srv);
              }}
              onFastTravel={handleFastTravel}
            />
          )}
        </>
      )}
    </div>
  );
}
