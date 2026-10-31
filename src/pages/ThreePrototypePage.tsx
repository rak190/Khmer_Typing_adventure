import { useCallback, useEffect, useMemo, useState } from 'react';
import ExplorationHud from '../features/three-game/components/ExplorationHud';
import TypingOverlay from '../features/three-game/components/TypingOverlay';
import VictoryModal from '../features/three-game/components/VictoryModal';
import { usePlayerControls } from '../features/three-game/hooks/usePlayerControls';
import AncientGateScene from '../features/three-game/scenes/AncientGateScene';
import {
  calculatePrototypeMemoryReward,
  computePrototypeMetrics,
  createPrototypeTypingPlan,
  GATE_INTERACTION_RADIUS,
  GATE_POSITION_Z,
  getPrototypeDefaultLesson,
} from '../features/three-game/systems/gameplayState';
import ThreeGameCanvas from '../features/three-game/ThreeGameCanvas';
import type { GameMode, GateState, Position3D, PrototypeReward } from '../features/three-game/types';
import { khmerTextEquals } from '../lib/khmerText';

export default function ThreePrototypePage() {
  const [mode, setMode] = useState<GameMode>('exploration');
  const [playerPosition, setPlayerPosition] = useState<Position3D>([0, 0, -6]);
  const [gateState, setGateState] = useState<GateState>({ status: 'closed', openProgress: 0 });

  // Typing challenge state
  const { lesson, worldId } = useMemo(() => getPrototypeDefaultLesson(), []);
  const [typingPlan, setTypingPlan] = useState(() => createPrototypeTypingPlan(12));
  const [completedCount, setCompletedCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reward, setReward] = useState<PrototypeReward | null>(null);
  const [nowTime, setNowTime] = useState<number | null>(null);

  useEffect(() => {
    if (startedAt === null || endedAt !== null || mode !== 'typing') return undefined;
    const timer = window.setInterval(() => {
      setNowTime(performance.now());
    }, 500);
    return () => window.clearInterval(timer);
  }, [endedAt, mode, startedAt]);

  // Proximity check: distance from player to gate altar
  const isNearGate = useMemo(() => {
    const [px, , pz] = playerPosition;
    const distance = Math.hypot(px - 0, pz - (GATE_POSITION_Z - 2.4));
    return distance <= GATE_INTERACTION_RADIUS;
  }, [playerPosition]);

  const handleStartTyping = useCallback(() => {
    if (gateState.status === 'open') return;
    setMode('typing');
    setStartedAt(performance.now());
  }, [gateState.status]);

  const handleEscape = useCallback(() => {
    if (mode === 'typing') {
      setMode('exploration');
    }
  }, [mode]);

  const movement = usePlayerControls(
    mode,
    () => {
      if (isNearGate && gateState.status === 'closed' && mode === 'exploration') {
        handleStartTyping();
      }
    },
    handleEscape
  );

  const resetTypingSession = useCallback(() => {
    setTypingPlan(createPrototypeTypingPlan(12));
    setCompletedCount(0);
    setIncorrectCount(0);
    setBackspaceCount(0);
    setStreak(0);
    setBestStreak(0);
    setStartedAt(null);
    setEndedAt(null);
    setShowModal(false);
  }, []);

  const handleCancelTyping = useCallback(() => {
    setMode('exploration');
  }, []);

  const handleRestartTyping = useCallback(() => {
    resetTypingSession();
    setStartedAt(performance.now());
  }, [resetTypingSession]);

  // Live typing metrics
  const elapsedMs = (endedAt ?? (nowTime ?? startedAt ?? 0)) - (startedAt ?? 0);
  const metrics = useMemo(() => {
    return computePrototypeMetrics(
      typingPlan.units,
      completedCount,
      incorrectCount,
      backspaceCount,
      bestStreak,
      elapsedMs,
      lesson,
      worldId
    );
  }, [backspaceCount, bestStreak, completedCount, elapsedMs, incorrectCount, lesson, typingPlan.units, worldId]);

  // Typing event handler
  const handleTypedValue = useCallback((value: string) => {
    if (mode !== 'typing') return;
    const activeTarget = typingPlan.units[completedCount];
    if (!activeTarget) return;

    const now = performance.now();
    if (startedAt === null) {
      setStartedAt(now);
    }

    if (khmerTextEquals(value, activeTarget.value)) {
      const nextCompleted = completedCount + 1;
      const nextStreak = streak + 1;
      const nextBestStreak = Math.max(bestStreak, nextStreak);

      setCompletedCount(nextCompleted);
      setStreak(nextStreak);
      setBestStreak(nextBestStreak);

      // Check if finished
      if (nextCompleted >= typingPlan.units.length) {
        setEndedAt(now);
        const finalMetrics = computePrototypeMetrics(
          typingPlan.units,
          nextCompleted,
          incorrectCount,
          backspaceCount,
          nextBestStreak,
          now - (startedAt ?? now),
          lesson,
          worldId
        );

        const memoryReward = calculatePrototypeMemoryReward(
          finalMetrics,
          finalMetrics.cpm,
          worldId,
          lesson.id
        );
        setReward(memoryReward);

        if (finalMetrics.passed || finalMetrics.accuracy >= 70) {
          // Trigger Gate Opening!
          setMode('opening');
          setGateState({ status: 'opening', openProgress: 0 });
        } else {
          // Needs practice
          setShowModal(true);
        }
      }
    } else {
      setIncorrectCount((c) => c + 1);
      setStreak(0);
    }
  }, [backspaceCount, bestStreak, completedCount, incorrectCount, lesson, mode, startedAt, streak, typingPlan.units, worldId]);

  const handleBackspace = useCallback(() => {
    if (mode !== 'typing') return;
    setCompletedCount((c) => Math.max(0, c - 1));
    setBackspaceCount((b) => b + 1);
    setStreak(0);
  }, [mode]);

  const handleGateOpeningFinished = useCallback(() => {
    setGateState({ status: 'open', openProgress: 1.0 });
    setMode('completed');
    setShowModal(true);
  }, []);

  const handleWalkThrough = useCallback(() => {
    setShowModal(false);
    // Player remains in 'completed' mode which allows full free movement through the open gate
  }, []);

  const handleRetryChallenge = useCallback(() => {
    setGateState({ status: 'closed', openProgress: 0 });
    resetTypingSession();
    setMode('typing');
    setStartedAt(performance.now());
  }, [resetTypingSession]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black select-none">
      {/* 3D R3F Canvas Viewport */}
      <ThreeGameCanvas>
        <AncientGateScene
          mode={mode}
          playerPosition={playerPosition}
          gateState={gateState}
          movement={movement}
          onPositionChange={setPlayerPosition}
          onGateOpeningFinished={handleGateOpeningFinished}
        />
      </ThreeGameCanvas>

      {/* HTML Overlays */}
      {mode === 'exploration' && (
        <ExplorationHud
          isNearGate={isNearGate}
          gateStatus={gateState.status}
          onStartTyping={handleStartTyping}
        />
      )}

      {mode === 'completed' && !showModal && (
        <ExplorationHud
          isNearGate={false}
          gateStatus={gateState.status}
          onStartTyping={handleStartTyping}
        />
      )}

      {mode === 'typing' && (
        <TypingOverlay
          targetUnits={typingPlan.units}
          metrics={metrics}
          completedCount={completedCount}
          streak={streak}
          onTypedValue={handleTypedValue}
          onBackspace={handleBackspace}
          onCancel={handleCancelTyping}
          onRestart={handleRestartTyping}
        />
      )}

      {showModal && (
        <VictoryModal
          passed={gateState.status === 'open' || (reward?.passed ?? false)}
          reward={reward}
          onWalkThrough={handleWalkThrough}
          onRetry={handleRetryChallenge}
        />
      )}
    </div>
  );
}
