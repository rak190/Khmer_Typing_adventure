import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ExplorationHud from '../features/three-game/components/ExplorationHud';
import TypingOverlay from '../features/three-game/components/TypingOverlay';
import VictoryModal from '../features/three-game/components/VictoryModal';
import { usePlayerControls } from '../features/three-game/hooks/usePlayerControls';
import AncientGateScene from '../features/three-game/scenes/AncientGateScene';
import {
  applyBackspaceInput,
  applyTypedInput,
  computePrototypeMetrics,
  createPrototypeRewardLedger,
  createPrototypeTypingPlan,
  createTypingSessionState,
  GATE_POSITION_Z,
  getPrototypeDefaultLesson,
  isPositionNearGate,
  shouldUnlockGate,
} from '../features/three-game/systems/gameplayState';
import ThreeGameCanvas from '../features/three-game/ThreeGameCanvas';
import type {
  GameMode,
  GateState,
  Position3D,
  PrototypeReward,
  TypingSessionState,
} from '../features/three-game/types';

const INITIAL_PLAYER_POSITION: Position3D = [0, 0, -6];

export default function ThreePrototypePage() {
  const [mode, setMode] = useState<GameMode>('exploration');
  const playerPositionRef = useRef<Position3D>([...INITIAL_PLAYER_POSITION]);
  const [isNearGate, setIsNearGate] = useState<boolean>(() =>
    isPositionNearGate(INITIAL_PLAYER_POSITION[0], INITIAL_PLAYER_POSITION[2]),
  );
  const [gateState, setGateState] = useState<GateState>({ status: 'closed', openProgress: 0 });

  // Curriculum lesson & thresholds
  const { lesson, worldId, minimumAccuracy, speedTargetCpm } = useMemo(
    () => getPrototypeDefaultLesson(),
    [],
  );

  // Typing challenge state & in-memory reward ledger
  const nextAttemptIdRef = useRef(1);
  const rewardLedgerRef = useRef(createPrototypeRewardLedger());
  const [typingPlan, setTypingPlan] = useState(() => createPrototypeTypingPlan(12));
  const [sessionState, setSessionState] = useState<TypingSessionState>(() =>
    createTypingSessionState(1),
  );
  const [showModal, setShowModal] = useState(false);
  const [reward, setReward] = useState<PrototypeReward | null>(null);
  const [nowTime, setNowTime] = useState<number | null>(null);

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

  const startFreshTypingSession = useCallback(() => {
    nextAttemptIdRef.current += 1;
    const nextId = nextAttemptIdRef.current;
    setTypingPlan(createPrototypeTypingPlan(12));
    setSessionState(createTypingSessionState(nextId));
    setNowTime(null);
    setShowModal(false);
  }, []);

  const handleStartTyping = useCallback(() => {
    if (gateState.status === 'open') return;
    startFreshTypingSession();
    setMode('typing');
  }, [gateState.status, startFreshTypingSession]);

  const handleCancelTyping = useCallback(() => {
    startFreshTypingSession();
    setMode('exploration');
  }, [startFreshTypingSession]);

  const handleEscape = useCallback(() => {
    if (mode === 'typing') {
      handleCancelTyping();
    }
  }, [handleCancelTyping, mode]);

  const movement = usePlayerControls(
    mode,
    () => {
      if (isNearGate && gateState.status === 'closed' && mode === 'exploration' && !showModal) {
        handleStartTyping();
      }
    },
    handleEscape,
    showModal,
  );

  const handleRestartTyping = useCallback(() => {
    startFreshTypingSession();
    setMode('typing');
  }, [startFreshTypingSession]);

  // Live typing metrics
  const elapsedMs =
    (sessionState.endedAt ?? (nowTime ?? sessionState.startedAt ?? 0)) -
    (sessionState.startedAt ?? 0);

  const metrics = useMemo(() => {
    return computePrototypeMetrics(
      typingPlan.units,
      sessionState.completedCount,
      sessionState.incorrectCount,
      sessionState.backspaceCount,
      sessionState.bestStreak,
      elapsedMs,
      lesson,
      worldId,
    );
  }, [
    elapsedMs,
    lesson,
    sessionState.backspaceCount,
    sessionState.bestStreak,
    sessionState.completedCount,
    sessionState.incorrectCount,
    typingPlan.units,
    worldId,
  ]);

  const handleTypedValue = useCallback(
    (value: string) => {
      if (mode !== 'typing' || sessionState.finished) return;

      const now = performance.now();
      setNowTime(now);

      const { nextState, justFinished } = applyTypedInput(
        sessionState,
        typingPlan.units,
        value,
        now,
      );
      setSessionState(nextState);

      if (justFinished) {
        const finalElapsedMs = Math.max(1, (nextState.endedAt ?? now) - (nextState.startedAt ?? now));
        const finalMetrics = computePrototypeMetrics(
          typingPlan.units,
          nextState.completedCount,
          nextState.incorrectCount,
          nextState.backspaceCount,
          nextState.bestStreak,
          finalElapsedMs,
          lesson,
          worldId,
        );

        const { reward: claimedReward } = rewardLedgerRef.current.claimAttemptReward(
          nextState.attemptId,
          finalMetrics,
          speedTargetCpm,
          worldId,
          lesson.id,
        );
        setReward(claimedReward);

        if (shouldUnlockGate(finalMetrics)) {
          setMode('opening');
          setGateState({ status: 'opening', openProgress: 0 });
        } else {
          // Accuracy below curriculum minimumAccuracy: do NOT open gate; show retry modal
          setMode('exploration');
          setShowModal(true);
        }
      }
    },
    [lesson, mode, sessionState, speedTargetCpm, typingPlan.units, worldId],
  );

  const handleBackspace = useCallback(() => {
    if (mode !== 'typing' || sessionState.finished) return;
    setSessionState((prev) => applyBackspaceInput(prev));
  }, [mode, sessionState.finished]);

  const handleGateOpeningFinished = useCallback(() => {
    setGateState((prev) =>
      prev.status === 'open' ? prev : { status: 'open', openProgress: 1.0 },
    );
    setMode((prev) => (prev === 'opening' ? 'completed' : prev));
    setShowModal(true);
  }, []);

  // Fallback timer in case WebGL requestAnimationFrame is throttled in background/headless tabs
  useEffect(() => {
    if (mode !== 'opening') return undefined;
    const timer = window.setTimeout(() => {
      handleGateOpeningFinished();
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [handleGateOpeningFinished, mode]);

  const handleWalkThrough = useCallback(() => {
    setShowModal(false);
    setMode('completed');
  }, []);

  const handleRetryChallenge = useCallback(() => {
    setGateState({ status: 'closed', openProgress: 0 });
    if (playerPositionRef.current[2] > GATE_POSITION_Z - 2.4) {
      playerPositionRef.current = [0, 0, GATE_POSITION_Z - 3.0];
      setIsNearGate(true);
    }
    startFreshTypingSession();
    setMode('typing');
  }, [startFreshTypingSession]);

  return (
    <div
      data-testid="three-prototype-page"
      data-mode={mode}
      data-gate-status={gateState.status}
      className="relative h-screen w-screen overflow-hidden bg-black select-none"
    >
      {/* 3D R3F Canvas Viewport */}
      <ThreeGameCanvas>
        <AncientGateScene
          mode={mode}
          playerPositionRef={playerPositionRef}
          gateState={gateState}
          movement={movement}
          isModalOpen={showModal}
          onNearGateChange={setIsNearGate}
          onGateOpeningFinished={handleGateOpeningFinished}
        />
      </ThreeGameCanvas>

      {/* HTML Overlays */}
      {(mode === 'exploration' || mode === 'completed') && !showModal && (
        <ExplorationHud
          isNearGate={isNearGate}
          gateStatus={gateState.status}
          onStartTyping={handleStartTyping}
        />
      )}

      {mode === 'typing' && (
        <TypingOverlay
          targetUnits={typingPlan.units}
          metrics={metrics}
          minimumAccuracy={minimumAccuracy}
          speedTargetCpm={speedTargetCpm}
          completedCount={sessionState.completedCount}
          streak={sessionState.streak}
          onTypedValue={handleTypedValue}
          onBackspace={handleBackspace}
          onCancel={handleCancelTyping}
          onRestart={handleRestartTyping}
        />
      )}

      {showModal && (
        <VictoryModal
          passed={gateState.status === 'open' && Boolean(reward?.passed)}
          minimumAccuracy={minimumAccuracy}
          reward={reward}
          onWalkThrough={handleWalkThrough}
          onRetry={handleRetryChallenge}
        />
      )}
    </div>
  );
}
