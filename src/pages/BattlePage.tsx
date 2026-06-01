import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, CheckCircle2, Clock, Flame, Gauge, Gem, HelpCircle, RotateCcw, Settings, Sparkles, Swords, Target, Trophy, Volume2, XCircle } from 'lucide-react';
import CharacterPlaceholder from '../components/characters/CharacterPlaceholder';
import GameButton from '../components/game/GameButton';
import KhmerKeyboard from '../components/game/KhmerKeyboard';
import Logo from '../components/game/Logo';
import ProgressBar from '../components/game/ProgressBar';
import StatPill from '../components/game/StatPill';
import ActionModal from '../components/game-ui/ActionModal';
import { ComingSoonPanel, SettingsPanel } from '../components/game-ui/FeaturePanels';
import PageTransition from '../components/layout/PageTransition';
import GameIcon from '../components/game-ui/GameIcon';
import PlayerProfileBadge from '../components/profile/PlayerProfileBadge';
import { backgroundImages } from '../assets/assetManifest';
import { getCurriculumLevel, getCurriculumWorld, lessonCurriculum } from '../data/lessonCurriculum';
import { getStructuredLessonByRoute } from '../data/typingProgression';
import {
  getLessonProgressRecords,
  resetLessonProgressRecords,
  saveLessonProgressToFirebase,
  saveMockLessonProgress,
} from '../data/mockData';
import { getKhmerKeyboardInput } from '../data/keyboardMap';
import type { KeyboardKeyData } from '../types/game';
import { countKhmerCharacters, countKhmerWords, khmerTextEquals, normalizeKhmerText } from '../lib/khmerText';
import {
  classifyWeakKey,
  getBestScoreForLesson,
  loadStudentProgress,
  resetStudentProgress,
  saveStudentLessonResult,
  summarizeWeakKeyStats,
  type StudentBadge,
  type StudentLessonResult,
  type WeakKeyStatRecord,
} from '../lib/studentProgress';
import {
  calculateAccuracy,
  calculateConsistency,
  calculateCpm,
  calculateFinalScore,
  calculateStars,
  calculateWpm,
  formatElapsedTime,
} from '../lib/typingMetrics';
import { loadAppSettings, resetFeatureProgressState, saveAppSettings } from '../lib/playerFeatures';
import { calculateRewards, prepareBossAttempt } from '../lib/economy';
import { useEconomyState } from '../lib/useEconomyState';

type BossRunStats = {
  correctInputs: number;
  correctWords: number;
  mistakes: number;
  backspaces: number;
  streak: number;
  bestStreak: number;
  weakKeyStats: WeakKeyStatRecord;
};
type BossModal = 'help' | 'settings' | 'sound' | 'continueLocked' | 'noHearts' | null;
type BattleCue = {
  id: number;
  kind: 'hit' | 'mistake' | 'wave' | 'defeat';
  text: string;
  combo: number;
};

function BattleResourceIcon({ name }: { name: 'coin' | 'gem' }) {
  return <GameIcon name={name} size={24} decorative={false} className="h-6 w-6" />;
}

function getInitialStats(): BossRunStats {
  return {
    correctInputs: 0,
    correctWords: 0,
    mistakes: 0,
    backspaces: 0,
    streak: 0,
    bestStreak: 0,
    weakKeyStats: {},
  };
}

function addWeakKeyStat(stats: WeakKeyStatRecord, value: string, field: 'mistakes' | 'backspaces') {
  const normalized = normalizeKhmerText(value || ' ');
  const existing = stats[normalized];
  return {
    ...stats,
    [normalized]: {
      value: normalized,
      mistakes: (existing?.mistakes ?? 0) + (field === 'mistakes' ? 1 : 0),
      backspaces: (existing?.backspaces ?? 0) + (field === 'backspaces' ? 1 : 0),
      category: existing?.category ?? classifyWeakKey(normalized),
      keyCode: existing?.keyCode,
    },
  };
}

function getBossTimerSeconds(itemCount: number, khmerCharacterCount: number) {
  return Math.max(120, Math.min(420, Math.ceil(khmerCharacterCount * 1.55 + itemCount * 5)));
}

function getBossMaxHp(itemCount: number) {
  return Math.max(280, Math.min(900, itemCount * 22));
}

function getBossTargets(worldId: number, bossLesson: NonNullable<ReturnType<typeof getCurriculumLevel>>) {
  const stageAccuracyGoals = bossLesson.stages.map((stage) => stage.accuracyGoal);
  return {
    minimumAccuracy: bossLesson.minimumAccuracy ?? Math.max(92, ...stageAccuracyGoals),
    targetCPM: bossLesson.speedTargetCpm ?? Math.min(72, 38 + worldId * 6),
    baseXP: 150 + worldId * 25,
  };
}

function BossPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`boss-battle-panel rounded-[18px] p-3 ${className}`}>{children}</section>;
}

function BossHudItem({ label, value, icon, tone = 'gold' }: { label: string; value: ReactNode; icon: ReactNode; tone?: 'gold' | 'green' | 'blue' | 'red' }) {
  const toneClass = {
    gold: 'text-[#FFE47A]',
    green: 'text-[#78FF9F]',
    blue: 'text-[#7ED8FF]',
    red: 'text-[#FF9A8C]',
  }[tone];

  return (
    <div className="boss-hud-item inline-flex items-center gap-2 rounded-[14px] px-3 py-2 font-black">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-white/12 ${toneClass}`}>{icon}</span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[10px] uppercase tracking-wide text-white/62">{label}</span>
        <span className="block truncate text-xl leading-none text-white">{value}</span>
      </span>
    </div>
  );
}

function BossGoalRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="boss-goal-row flex items-center justify-between rounded-[10px] bg-white/8 px-2.5 py-1.5 text-sm font-black">
      <span className="text-white/72">{label}</span>
      <span className="text-[#FFE47A]">{value}</span>
    </div>
  );
}

function getWaveLabel(stageKind?: string) {
  if (stageKind === 'boss') return 'Boss Wave';
  if (stageKind === 'typing') return 'Sentence Wave';
  if (stageKind === 'challenge') return 'Speed Wave';
  if (stageKind === 'focus') return 'Word Wave';
  return 'Letter Wave';
}

function getPerformanceFeedback(accuracy: number, cpm: number, targetCPM: number, streak: number, correctPrefix: boolean) {
  if (!correctPrefix) return { label: 'SLOW DOWN!', detail: 'Focus on correct Khmer keys.', tone: 'danger' as const };
  if (accuracy >= 99 && streak >= 5) return { label: 'PERFECT!', detail: `Combo x${streak}`, tone: 'perfect' as const };
  if (streak >= 8) return { label: 'AWESOME!', detail: `Combo x${streak}`, tone: 'hot' as const };
  if (cpm >= targetCPM) return { label: 'CPM TARGET!', detail: `${cpm} CPM`, tone: 'speed' as const };
  if (accuracy >= 95) return { label: 'GREAT!', detail: `${accuracy}% accuracy`, tone: 'good' as const };
  if (accuracy < 85 && streak === 0) return { label: 'STEADY!', detail: 'Accuracy first.', tone: 'warn' as const };
  return { label: `COMBO x${streak}`, detail: 'Keep the rhythm.', tone: 'neutral' as const };
}

function getPraiseForStreak(streak: number) {
  if (streak >= 8) return 'AWESOME';
  if (streak >= 5) return 'PERFECT';
  if (streak >= 3) return 'GREAT';
  return 'GOOD';
}

function getMistakeFeedback(streak: number) {
  if (streak >= 4) return 'SLOW DOWN';
  return streak === 0 ? 'TRY AGAIN' : 'OOPS';
}

export default function BattlePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const requestedWorldId = Number(searchParams.get('world') ?? 1);
  const world = getCurriculumWorld(Number.isFinite(requestedWorldId) ? requestedWorldId : 1) ?? lessonCurriculum[0];
  const bossLesson = getCurriculumLevel(world.id, 'boss') ?? lessonCurriculum[0].levels.find((level) => level.id === 'boss') ?? lessonCurriculum[0].levels[0];
  const structuredBossLesson = getStructuredLessonByRoute(world.id, 'boss');
  const battleItems = useMemo(() => bossLesson.stages.flatMap((stage) => stage.items).filter(Boolean), [bossLesson]);
  const targetText = useMemo(() => battleItems.join(' '), [battleItems]);
  const targetKhmerCharacterCount = useMemo(() => countKhmerCharacters(targetText), [targetText]);
  const bossTargets = useMemo(() => {
    const curriculumTargets = getBossTargets(world.id, bossLesson);
    return {
      minimumAccuracy: structuredBossLesson?.minimumAccuracy ?? curriculumTargets.minimumAccuracy,
      targetCPM: structuredBossLesson?.targetCPM ?? curriculumTargets.targetCPM,
      baseXP: structuredBossLesson?.xpReward ?? curriculumTargets.baseXP,
    };
  }, [bossLesson, structuredBossLesson, world.id]);
  const bossMaxHp = useMemo(() => getBossMaxHp(battleItems.length), [battleItems.length]);
  const initialTimer = useMemo(() => getBossTimerSeconds(battleItems.length, targetKhmerCharacterCount), [battleItems.length, targetKhmerCharacterCount]);

  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [bossHp, setBossHp] = useState(bossMaxHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [timer, setTimer] = useState(initialTimer);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [damage, setDamage] = useState<number | null>(null);
  const [attack, setAttack] = useState(false);
  const [battleCue, setBattleCue] = useState<BattleCue | null>(null);
  const [stats, setStats] = useState<BossRunStats>(() => getInitialStats());
  const [newBadges, setNewBadges] = useState<StudentBadge[]>([]);
  const [modal, setModal] = useState<BossModal>(null);
  const [settings, setSettings] = useState(() => loadAppSettings());
  const [initialProgress] = useState(() => loadStudentProgress());
  const [initialLessonProgress] = useState(() => getLessonProgressRecords());
  const [bossReady, setBossReady] = useState(false);
  const [bossEntryMessage, setBossEntryMessage] = useState('');
  const [attemptNonce, setAttemptNonce] = useState(0);
  const economy = useEconomyState();
  const progressSavedRef = useRef(false);
  const cueIdRef = useRef(0);

  const currentWord = battleItems[Math.min(wordIndex, Math.max(0, battleItems.length - 1))] ?? 'សាលា';
  const currentUnits = useMemo(() => Array.from(normalizeKhmerText(currentWord)), [currentWord]);
  const typedUnits = useMemo(() => Array.from(normalizeKhmerText(typed)), [typed]);
  const activeKey = currentUnits[typedUnits.length] ?? '';
  const wordTextSize = currentWord.length > 42 ? 'text-2xl' : currentWord.length > 24 ? 'text-3xl' : currentWord.length > 12 ? 'text-4xl' : 'text-6xl';
  const correctPrefix = useMemo(() => normalizeKhmerText(currentWord).startsWith(normalizeKhmerText(typed)), [currentWord, typed]);
  const bossDefeated = battleItems.length > 0 && wordIndex >= battleItems.length;
  const bossFailed = !bossDefeated && (timer <= 0 || playerHp <= 0);
  const battleFinished = bossDefeated || bossFailed;
  const elapsedMs = Math.max(1000, elapsedSeconds * 1000);

  const bossResult = useMemo(() => {
    const totalRequiredInputs = Math.max(1, stats.correctInputs + stats.mistakes);
    const accuracy = Math.round(calculateAccuracy(stats.correctInputs, totalRequiredInputs));
    const cpm = calculateCpm(stats.correctInputs, elapsedMs);
    const wpm = calculateWpm(stats.correctWords, elapsedMs);
    const consistency = calculateConsistency(totalRequiredInputs, stats.mistakes, stats.backspaces, stats.bestStreak);
    const finalScore = calculateFinalScore(accuracy, cpm, consistency, bossTargets.targetCPM);
    const stars = calculateStars(bossDefeated, accuracy, cpm, bossTargets.targetCPM);
    const passed = bossDefeated && accuracy >= bossTargets.minimumAccuracy;

    return {
      accuracy,
      cpm,
      wpm,
      consistency,
      finalScore,
      stars,
      passed,
      totalRequiredInputs,
      elapsedSeconds: Math.round(elapsedMs / 1000),
    };
  }, [bossDefeated, bossTargets.minimumAccuracy, bossTargets.targetCPM, elapsedMs, stats.backspaces, stats.bestStreak, stats.correctInputs, stats.correctWords, stats.mistakes]);

  const resultLessonId = structuredBossLesson?.lessonId ?? `curriculum-w${world.id}-boss`;
  const bossAttemptId = useMemo(
    () => `boss:${location.key}:${world.id}:${resultLessonId}:${attemptNonce}`,
    [attemptNonce, location.key, resultLessonId, world.id],
  );
  const previousBestScore = Math.max(
    getBestScoreForLesson(initialProgress, resultLessonId),
    initialLessonProgress.find((record) => record.worldId === world.id && record.lessonId === 'boss')?.score ?? 0,
  );
  const rewardCalculation = calculateRewards({
    mode: 'boss',
    accuracy: bossResult.accuracy,
    CPM: bossResult.cpm,
    targetCPM: bossTargets.targetCPM,
    mistakes: stats.mistakes,
    stars: bossResult.stars,
    passed: bossResult.passed,
    score: bossResult.finalScore,
    previousBestScore,
    currentStreak: economy.streak || initialProgress.currentStreak,
    worldId: world.id,
    lessonId: resultLessonId,
  });
  const finalXpEarned = battleFinished ? rewardCalculation.xpEarned : 0;
  const coinsEarned = battleFinished ? rewardCalculation.coinsEarned : 0;
  const gemsEarned = battleFinished ? rewardCalculation.gemsEarned : 0;
  const weakKeys = summarizeWeakKeyStats(stats.weakKeyStats, 5);
  const completedPrompts = Math.min(wordIndex, battleItems.length);
  const currentWave = useMemo(() => {
    let cursor = 0;
    const stageIndex = Math.max(0, bossLesson.stages.findIndex((stage) => {
      const nextCursor = cursor + stage.items.length;
      const withinStage = completedPrompts < nextCursor;
      cursor = nextCursor;
      return withinStage;
    }));

    return {
      stage: bossLesson.stages[stageIndex] ?? bossLesson.stages[0],
      index: stageIndex,
    };
  }, [bossLesson.stages, completedPrompts]);
  const waveLabel = getWaveLabel(currentWave.stage?.kind);
  const waveProgressPercent = battleItems.length > 0 ? Math.round((completedPrompts / battleItems.length) * 100) : 0;
  const timerPercent = initialTimer > 0 ? Math.max(0, Math.min(100, Math.round((timer / initialTimer) * 100))) : 0;
  const performanceFeedback = getPerformanceFeedback(bossResult.accuracy, bossResult.cpm, bossTargets.targetCPM, stats.streak, correctPrefix);
  const waveSummaries = useMemo(() => {
    let cursor = 0;
    return bossLesson.stages.map((stage, index) => {
      const start = cursor;
      cursor += stage.items.length;
      return {
        stage,
        index,
        completed: completedPrompts >= cursor,
        current: completedPrompts >= start && completedPrompts < cursor,
      };
    });
  }, [bossLesson.stages, completedPrompts]);
  const waveEndPositions = useMemo(() => {
    let cursor = 0;
    return bossLesson.stages.map((stage) => {
      cursor += stage.items.length;
      return cursor;
    });
  }, [bossLesson.stages]);
  const comboPower = Math.min(3, Math.floor(stats.streak / 3));

  const showBattleCue = useCallback((kind: BattleCue['kind'], text: string, combo = 0) => {
    cueIdRef.current += 1;
    const id = cueIdRef.current;
    setBattleCue({ id, kind, text, combo });
    window.setTimeout(() => {
      setBattleCue((current) => (current?.id === id ? null : current));
    }, kind === 'wave' || kind === 'defeat' ? 980 : 620);
  }, []);

  const completeCorrectWord = useCallback(() => {
    if (!bossReady || battleFinished) return;

    const completedWord = currentWord;
    const completedCount = Math.min(battleItems.length, wordIndex + 1);
    const nextBossHp = Math.max(0, Math.round(bossMaxHp * (1 - completedCount / Math.max(1, battleItems.length))));
    const nextDamage = Math.max(1, bossHp - nextBossHp);
    const nextStreak = stats.streak + 1;
    const waveCleared = waveEndPositions.includes(completedCount) && completedCount < battleItems.length;
    const defeated = completedCount >= battleItems.length;

    setStats((current) => {
      const nextStreak = current.streak + 1;
      return {
        ...current,
        correctInputs: current.correctInputs + countKhmerCharacters(completedWord),
        correctWords: current.correctWords + Math.max(1, countKhmerWords(completedWord)),
        streak: nextStreak,
        bestStreak: Math.max(current.bestStreak, nextStreak),
      };
    });
    setBossHp(nextBossHp);
    setWordIndex((next) => next + 1);
    setTyped('');
    setDamage(nextDamage);
    setAttack(true);
    showBattleCue(defeated ? 'defeat' : waveCleared ? 'wave' : 'hit', defeated ? 'VICTORY!' : waveCleared ? 'Wave Cleared' : getPraiseForStreak(nextStreak), nextStreak);
    window.setTimeout(() => setAttack(false), 420);
    window.setTimeout(() => setDamage(null), 800);
  }, [battleFinished, battleItems.length, bossHp, bossMaxHp, bossReady, currentWord, showBattleCue, stats.streak, waveEndPositions, wordIndex]);

  const registerMistake = useCallback((expectedValue: string) => {
    showBattleCue('mistake', getMistakeFeedback(stats.streak), 0);
    setStats((current) => ({
      ...current,
      mistakes: current.mistakes + 1,
      streak: 0,
      weakKeyStats: addWeakKeyStat(current.weakKeyStats, expectedValue, 'mistakes'),
    }));
    setPlayerHp((hp) => Math.max(0, hp - 8));
  }, [showBattleCue, stats.streak]);

  const submitWord = useCallback(() => {
    if (!bossReady || !typed || battleFinished) return;

    if (khmerTextEquals(typed, currentWord)) {
      completeCorrectWord();
    } else {
      registerMistake(activeKey || currentWord);
      setTyped('');
    }
  }, [activeKey, battleFinished, bossReady, completeCorrectWord, currentWord, registerMistake, typed]);

  const appendValue = useCallback((value: string) => {
    if (!bossReady || battleFinished) return;

    setTyped((next) => {
      const candidate = normalizeKhmerText(next + value).slice(0, normalizeKhmerText(currentWord).length);
      const target = normalizeKhmerText(currentWord);
      const expectedValue = Array.from(target)[Array.from(normalizeKhmerText(next)).length] ?? currentWord;

      if (!target.startsWith(candidate)) registerMistake(expectedValue);
      if (candidate.length >= target.length && khmerTextEquals(candidate, target)) {
        window.setTimeout(completeCorrectWord, 20);
      }

      return candidate;
    });
  }, [battleFinished, bossReady, completeCorrectWord, currentWord, registerMistake]);

  const handlePress = useCallback(
    (keyData: KeyboardKeyData) => {
      if (!bossReady || battleFinished) return;

      if (keyData.action === 'backspace') {
        setTyped((next) => {
          const nextTyped = normalizeKhmerText(next).slice(0, -1);
          setStats((current) => ({
            ...current,
            backspaces: current.backspaces + 1,
            weakKeyStats: addWeakKeyStat(current.weakKeyStats, activeKey || currentWord, 'backspaces'),
          }));
          return nextTyped;
        });
        return;
      }
      if (keyData.action === 'enter') {
        submitWord();
        return;
      }
      if (keyData.action && keyData.action !== 'space') return;
      appendValue(keyData.action === 'space' ? ' ' : keyData.value);
    },
    [activeKey, appendValue, battleFinished, bossReady, currentWord, submitWord],
  );

  useEffect(() => {
    if (!bossReady || battleFinished) return undefined;
    const interval = window.setInterval(() => {
      setTimer((next) => Math.max(0, next - 1));
      setElapsedSeconds((next) => next + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [battleFinished, bossReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!bossReady || battleFinished) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        submitWord();
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handlePress({ label: 'Backspace', value: '', action: 'backspace' });
      } else if (event.key.length === 1) {
        const mappedKey = getKhmerKeyboardInput(event);
        if (!mappedKey) return;
        event.preventDefault();
        appendValue(mappedKey.value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [appendValue, battleFinished, bossReady, handlePress, submitWord]);

  useEffect(() => {
    let cancelled = false;
    void prepareBossAttempt(undefined, bossAttemptId).then(({ usedRetryToken }) => {
      if (cancelled) return;
      setBossReady(true);
      setBossEntryMessage(usedRetryToken ? 'បានប្រើ Retry Token សម្រាប់ Boss នេះ។' : 'បានចំណាយបេះដូង 1 សម្រាប់ Boss នេះ។');
    }).catch((error) => {
      if (cancelled) return;
      const message = error instanceof Error ? error.message : 'Not enough hearts. Practice normal lessons or wait for refill.';
      setBossReady(false);
      setBossEntryMessage(message);
      setModal('noHearts');
    });
    return () => {
      cancelled = true;
    };
  }, [bossAttemptId]);

  useEffect(() => {
    if (!battleFinished || progressSavedRef.current) return;

    const completedAt = new Date().toISOString();
    const lessonResult: StudentLessonResult = {
      lessonId: resultLessonId,
      lessonTitle: structuredBossLesson?.lessonTitle ?? `${world.title} Boss`,
      worldId: structuredBossLesson?.worldId ?? world.id,
      skillFocus: structuredBossLesson?.skillFocus ?? bossLesson.objective,
      targetText,
      minimumAccuracy: bossTargets.minimumAccuracy,
      targetCPM: bossTargets.targetCPM,
      difficulty: 'boss',
      badgeGroup: structuredBossLesson?.badgeGroup,
      accuracy: bossResult.accuracy,
      CPM: bossResult.cpm,
      WPM: bossResult.wpm,
      mistakes: stats.mistakes,
      backspaces: stats.backspaces,
      weakKeys,
      stars: bossResult.stars,
      XP: finalXpEarned,
      coinsEarned,
      gemsEarned,
      rewardReasons: rewardCalculation.rewardReasons,
      mode: 'boss',
      score: bossResult.finalScore,
      passed: bossResult.passed,
      completedAt,
    };

    const saved = saveStudentLessonResult(lessonResult);
    setNewBadges(saved.newBadges);

    const progressRecord = {
      worldId: world.id,
      lessonId: 'boss' as const,
      score: bossResult.finalScore,
      accuracy: bossResult.accuracy,
      cpm: bossResult.cpm,
      wpm: bossResult.wpm,
      stars: bossResult.stars,
      xpEarned: finalXpEarned,
      coinsEarned,
      bestStreak: stats.bestStreak,
      passed: bossResult.passed,
      completed: bossDefeated,
      timeSeconds: bossResult.elapsedSeconds,
      mistakes: stats.mistakes,
      backspaces: stats.backspaces,
    };

    if (bossResult.passed) {
      saveMockLessonProgress(progressRecord);
      void saveLessonProgressToFirebase(progressRecord);
    }

    progressSavedRef.current = true;
  }, [battleFinished, bossDefeated, bossLesson.objective, bossResult, bossTargets.minimumAccuracy, bossTargets.targetCPM, coinsEarned, finalXpEarned, gemsEarned, resultLessonId, rewardCalculation.rewardReasons, stats.backspaces, stats.bestStreak, stats.mistakes, structuredBossLesson, targetText, weakKeys, world.id, world.title]);

  const retryBattle = () => {
    setBossHp(bossMaxHp);
    setTimer(initialTimer);
    setTyped('');
    setWordIndex(0);
    setPlayerHp(100);
    setDamage(null);
    setAttack(false);
    setBattleCue(null);
    setStats(getInitialStats());
    setElapsedSeconds(0);
    setNewBadges([]);
    setBossReady(false);
    setBossEntryMessage('');
    progressSavedRef.current = false;
    setAttemptNonce((current) => current + 1);
  };

  const handleResetProgress = () => {
    resetStudentProgress();
    resetFeatureProgressState();
    void resetLessonProgressRecords().catch((error) => console.error('Unable to reset lesson progress records.', error));
    retryBattle();
  };

  return (
    <PageTransition className="h-screen overflow-hidden text-white">
      <div
        className="boss-battle-page boss-battle-shell relative h-screen overflow-hidden px-3 py-3 lg:px-4"
        style={{ backgroundImage: `url(${backgroundImages.battle})` }}
      >
        <header className="boss-battle-header relative z-20 items-center gap-3 rounded-[20px] px-3 py-2">
          <Link to="/map" className="shrink-0">
            <Logo compact={false} className="origin-left scale-[.58] sm:scale-[.68] lg:scale-75" />
          </Link>
          <div className="boss-title-plaque flex min-w-0 flex-1 items-center justify-center gap-3 text-center">
            <span className="boss-title-icon grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-[#FFE47A]/40 bg-[#0A3A48]/70 text-[#FFE47A] shadow-[0_0_18px_rgba(255,228,122,.18)]">
              <Swords size={23} />
            </span>
            <div className="min-w-0">
              <h1 className="boss-title-text truncate font-black leading-tight">{world.title} Boss Battle</h1>
              <div className="boss-title-subtitle truncate text-xs font-black">Pass with {bossTargets.minimumAccuracy}% accuracy and {bossTargets.targetCPM} CPM target</div>
            </div>
          </div>
          <div className="boss-resource-bar ml-auto flex items-center justify-end gap-2">
            <StatPill icon={<BattleResourceIcon name="coin" />} value={economy.coins} tone="dark" className="boss-resource-pill min-h-10 rounded-[14px] px-3 py-1.5" />
            <StatPill icon={<BattleResourceIcon name="gem" />} value={economy.gems} tone="dark" className="boss-resource-pill min-h-10 rounded-[14px] px-3 py-1.5" />
            <button type="button" onClick={() => setModal('settings')} className="grid h-10 w-10 place-items-center rounded-[14px] bg-gradient-to-b from-[#1F9BFF] to-[#073E8B] shadow-button" aria-label="Settings">
              <Settings size={19} />
            </button>
            <GameButton variant="blue" size="sm" icon={<HelpCircle />} className="boss-help-button" onClick={() => setModal('help')}>Help</GameButton>
          </div>
        </header>

        <section className="boss-battle-hud relative z-10 rounded-[18px] px-3 py-2">
          <div className="boss-hud-metrics mx-auto flex min-w-0 items-center justify-center gap-2">
            <BossHudItem label="Accuracy" value={`${bossResult.accuracy}%`} icon={<Target size={18} />} tone={bossResult.accuracy >= bossTargets.minimumAccuracy ? 'green' : 'gold'} />
            <BossHudItem label="CPM" value={bossResult.cpm} icon={<Gauge size={18} />} tone={bossResult.cpm >= bossTargets.targetCPM ? 'green' : 'blue'} />
            <BossHudItem label="Mistakes" value={stats.mistakes} icon={<XCircle size={18} />} tone={stats.mistakes > 0 ? 'red' : 'gold'} />
            <BossHudItem label="Time" value={`${timer}s`} icon={<Clock size={18} />} tone={timer < 25 ? 'red' : 'gold'} />
          </div>
        </section>

        <div className="boss-battle-grid relative z-10 grid min-h-0 gap-2 2xl:grid-cols-[220px_minmax(0,1fr)_230px] xl:grid-cols-[190px_minmax(0,1fr)_205px] lg:grid-cols-[165px_minmax(0,1fr)_180px] md:grid-cols-[145px_minmax(0,1fr)_160px]">
          <aside className="boss-side-stack grid min-h-0 gap-2">
            <BossPanel className="boss-player-panel">
              <PlayerProfileBadge size="small" showTitle={false} showLevel className="boss-player-badge" />
              <div className="boss-player-hp mt-2 rounded-[12px] bg-white/8 px-2 py-1.5">
                <div className="mb-1 flex justify-between text-xs font-black uppercase text-white/68">
                  <span>HP</span>
                  <span>{playerHp}/100</span>
                </div>
                <ProgressBar value={playerHp} max={100} color="green" showValue />
              </div>
              <div className="boss-player-stats mt-2 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-[11px] bg-white/8 px-2 py-1.5">
                  <div className="text-xs font-black uppercase text-white/58">Streak</div>
                  <div className="text-2xl font-black text-[#FFE47A]">{stats.streak}</div>
                </div>
                <div className="rounded-[11px] bg-white/8 px-2 py-1.5">
                  <div className="text-xs font-black uppercase text-white/58">Best</div>
                  <div className="text-2xl font-black text-[#9FEAFF]">{stats.bestStreak}</div>
                </div>
                <div className="boss-player-score rounded-[11px] bg-[#FFE47A]/14 px-2 py-1.5">
                  <div className="text-xs font-black uppercase text-white/58">Score</div>
                  <div className="truncate text-2xl font-black text-[#FFE47A]">{bossResult.finalScore.toLocaleString()}</div>
                </div>
              </div>

              <div className="boss-target-panel mt-2">
                <h3 className="mb-2 flex items-center gap-2 text-base font-black"><Target className="text-[#FFE47A]" size={19} /> Battle Targets</h3>
                <div className="boss-target-grid grid gap-1.5">
                  <BossGoalRow label="Accuracy" value={`${bossTargets.minimumAccuracy}%`} />
                  <BossGoalRow label="CPM" value={bossTargets.targetCPM} />
                  <BossGoalRow label="Prompts" value={battleItems.length} />
                  <BossGoalRow label="Timer" value={formatElapsedTime(initialTimer)} />
                </div>
              </div>
            </BossPanel>
          </aside>

          <main className="boss-arena-panel relative grid min-h-0 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-[24px] p-2.5 shadow-2xl">
            <div className="relative z-10 grid min-h-0 items-center gap-2 md:grid-cols-[minmax(130px,.62fr)_minmax(340px,1.35fr)_minmax(140px,.68fr)] lg:grid-cols-[minmax(150px,.68fr)_minmax(390px,1.28fr)_minmax(160px,.72fr)]">
              <div className={`boss-fighter-side boss-fighter-side--player relative min-h-[235px] ${comboPower > 0 ? `boss-fighter-side--combo-${comboPower}` : ''} ${battleCue?.kind === 'mistake' ? 'boss-fighter-side--recoil' : ''}`}>
                <div className="boss-fighter-name left-3 top-3">
                  <span>Student</span>
                  <strong>Typing Hero</strong>
                </div>
                <div className="boss-character-stage boss-character-stage--player">
                  <span className="boss-character-glow boss-character-glow--player" />
                  <CharacterPlaceholder type="elephant" className={`boss-player-character mx-auto ${attack ? 'boss-player-character--attack' : ''}`} />
                  <span className="boss-character-platform boss-character-platform--player" />
                </div>
                {attack && (
                  <motion.div
                    className="boss-attack-beam"
                    initial={{ scaleX: 0, opacity: 0.9 }}
                    animate={{ scaleX: 1, opacity: 0 }}
                    transition={{ duration: 0.42, ease: 'easeOut' }}
                  />
                )}
              </div>

              <div className="boss-typing-column relative mx-auto w-full max-w-[680px]">
                {battleCue && (
                  <motion.div
                    key={battleCue.id}
                    className={`boss-flow-feedback boss-flow-feedback--${battleCue.kind}`}
                    initial={{ y: 14, scale: 0.92, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <span>{battleCue.text}</span>
                    {battleCue.combo >= 3 && <small>Combo x{battleCue.combo}</small>}
                  </motion.div>
                )}
                <div className={`boss-prompt-card relative mt-2 rounded-[22px] px-4 py-3 text-center ${correctPrefix ? 'boss-prompt-card--active' : 'boss-prompt-card--danger'} ${battleCue?.kind === 'mistake' ? 'boss-prompt-card--mistake' : ''}`}>
                  <div className="boss-wave-ribbon mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span>{waveLabel}</span>
                    <strong>Wave {currentWave.index + 1} / {bossLesson.stages.length}</strong>
                    <button type="button" onClick={() => setModal('sound')} className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-[#1F9BFF] to-[#073E8B] text-white shadow-button" aria-label="Play word sound">
                      <Volume2 size={19} />
                    </button>
                  </div>
                  <div className={`khmer-body boss-prompt-text mx-auto min-h-[104px] rounded-[18px] border-[3px] px-4 py-5 font-black leading-tight ${wordTextSize}`}>
                    {currentWord}
                  </div>
                  <div className={`khmer-body boss-input-box mt-2 min-h-[50px] rounded-[14px] border-2 px-3 py-2 text-center text-2xl font-black ${correctPrefix ? 'boss-input-box--correct' : 'boss-input-box--wrong'}`}>
                    {typed || '...'}
                  </div>
                  <div className="boss-prompt-instruction mt-2 text-center text-xs font-black text-[#24536A]">Type the boss phrase exactly, then press Enter if needed.</div>
                </div>

                <motion.div
                  key={`${performanceFeedback.label}-${stats.streak}-${correctPrefix}`}
                  className={`boss-combo-banner boss-combo-banner--${performanceFeedback.tone}`}
                  initial={{ y: 8, scale: 0.96, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.22 }}
                >
                  <span>{performanceFeedback.label}</span>
                  <small>{performanceFeedback.detail}</small>
                </motion.div>

              </div>

              <div className={`boss-fighter-side boss-fighter-side--enemy relative min-h-[245px] ${battleCue?.kind === 'hit' || battleCue?.kind === 'wave' ? 'boss-fighter-side--hit' : ''} ${bossDefeated ? 'boss-fighter-side--defeated' : ''}`}>
                <div className="boss-fighter-name right-3 top-3 text-right">
                  <span>Boss</span>
                  <strong>{bossLesson.labelEn}</strong>
                </div>
                <div className="boss-character-stage boss-character-stage--enemy">
                  <span className="boss-character-glow boss-character-glow--enemy" />
                  <CharacterPlaceholder type="guardian" className={`boss-enemy-character mx-auto ${battleCue?.kind === 'hit' || battleCue?.kind === 'wave' ? 'boss-enemy-character--hit' : ''} ${bossDefeated ? 'boss-enemy-character--defeated' : ''}`} />
                  <span className="boss-character-platform boss-character-platform--enemy" />
                </div>
                {damage && (
                  <motion.div
                    className="boss-damage-popup absolute left-1/2 top-24 z-20 text-6xl font-black text-[#FF8D74] drop-shadow-[0_0_18px_rgba(255,80,65,.85)]"
                    initial={{ opacity: 0, y: 24, scale: 0.6 }}
                    animate={{ opacity: 1, y: -36, scale: 1 }}
                  >
                    -{damage}
                  </motion.div>
                )}
              </div>
            </div>
            {battleCue?.kind === 'wave' && (
              <motion.div
                key={`wave-${battleCue.id}`}
                className="boss-wave-clear-moment"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                Wave Cleared
              </motion.div>
            )}

          </main>

          <aside className="boss-side-stack grid min-h-0 gap-2">
            <BossPanel className="boss-enemy-panel">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wide text-white/58">Boss</div>
                  <h3 className="text-lg font-black leading-tight">{bossLesson.labelEn}</h3>
                </div>
                <Flame className="text-[#FF8D74]" size={25} />
              </div>
              <div className="mt-2 rounded-[12px] bg-white/8 px-2 py-1.5">
                <div className="mb-1 flex justify-between text-xs font-black uppercase text-white/68">
                  <span>Boss HP</span>
                  <span>{bossHp}/{bossMaxHp}</span>
                </div>
                <ProgressBar value={bossHp} max={bossMaxHp} color="red" showValue />
              </div>
              <div className="mt-2 rounded-[12px] bg-white/8 px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wide text-white/58">Current Wave</span>
                  <span className="rounded-full bg-[#FFE47A]/18 px-2 py-0.5 text-xs font-black text-[#FFE47A]">{currentWave.index + 1}/{bossLesson.stages.length}</span>
                </div>
                <div className="mt-1 text-sm font-black text-white">{waveLabel}</div>
                <div className="text-[11px] font-black uppercase text-white/52">{currentWave.stage?.items.length ?? 0} prompts</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {waveSummaries.map(({ stage, index, completed, current }) => (
                  <div
                    key={stage.id}
                    className={`boss-wave-chip ${completed ? 'boss-wave-chip--done' : current ? 'boss-wave-chip--current' : ''}`}
                  >
                    {completed ? <CheckCircle2 size={13} /> : current ? <Sparkles size={13} /> : index + 1}
                    <span>{getWaveLabel(stage.kind).replace(' Wave', '')}</span>
                  </div>
                ))}
              </div>
            </BossPanel>

            <BossPanel className="boss-reward-card">
              <h3 className="mb-2 flex items-center gap-2 text-base font-black"><Award className="text-[#FFE47A]" size={20} /> Treasure</h3>
              <div className="grid grid-cols-3 gap-1.5 text-center font-black">
                <div className="rounded-[12px] bg-white/12 px-2 py-2">
                  <GameIcon name="star" size={24} />
                  <div className="text-sm">{bossResult.stars}</div>
                </div>
                <div className="rounded-[12px] bg-white/12 px-2 py-2">
                  <GameIcon name="coin" size={24} />
                  <div className="text-sm">+{coinsEarned}</div>
                </div>
                <div className="rounded-[12px] bg-white/12 px-2 py-2">
                  <Gem className="mx-auto text-[#9FEAFF]" size={24} />
                  <div className="text-sm">XP +{finalXpEarned}</div>
                </div>
              </div>
            </BossPanel>
          </aside>
        </div>

        <div className="boss-timer-dock relative z-10">
          <div className="boss-timer-meter rounded-[14px] p-2">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-wide text-white/68">
              <span>Battle Timer</span>
              <span>{waveProgressPercent}% complete</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 flex-1 overflow-hidden rounded-full border border-white/18 bg-black/22">
                <motion.div
                  className={`h-full rounded-full ${timer < 25 ? 'bg-gradient-to-r from-[#FF5C4A] to-[#FFE47A]' : 'bg-gradient-to-r from-[#2FD06F] via-[#FFE47A] to-[#7ED8FF]'}`}
                  animate={{ width: `${timerPercent}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
              <div className={`rounded-full px-3 py-1.5 text-base font-black ${timer < 25 ? 'bg-[#A32A1E] text-white' : 'bg-[#FFE47A] text-[#17325A]'}`}>{timer}s</div>
            </div>
          </div>
        </div>

        <div className="boss-keyboard-dock relative z-10">
          <KhmerKeyboard onKeyPress={handlePress} activeKey={settings.keyboardHintsEnabled ? activeKey : ''} compact />
        </div>

        {battleFinished && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-[#061B2F]/76 px-4 backdrop-blur-sm">
            <div className="w-full max-w-[760px] rounded-[24px] border-[4px] border-[#F4C85C] bg-gradient-to-b from-[#FFF8DC] to-[#E8BD68] p-6 text-[#4D2D10] shadow-[0_28px_60px_rgba(0,0,0,.45)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-black uppercase ${bossResult.passed ? 'bg-[#E3FFD4] text-[#176D35]' : 'bg-[#FFE6DE] text-[#A32A1E]'}`}>
                    {bossResult.passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {bossResult.passed ? 'Boss passed' : bossDefeated ? 'Accuracy not enough' : 'Boss failed'}
                  </div>
                  <h2 className="mt-2 text-[34px] font-black leading-tight">{bossResult.passed ? 'Boss Complete!' : 'Replay the Boss Challenge'}</h2>
                  <p className="mt-1 max-w-[520px] font-bold text-[#68411F]">
                    {bossResult.passed
                      ? 'You defeated the boss with enough accuracy to unlock progress.'
                      : 'Boss mode now requires both completion and accurate Khmer typing.'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3].map((star) => (
                      <GameIcon key={star} name="star" size={42} className={star <= bossResult.stars ? '' : 'grayscale opacity-35'} />
                    ))}
                  </div>
                  <div className="text-sm font-black uppercase text-[#7A4D19]">Score</div>
                  <div className="text-3xl font-black">{bossResult.finalScore.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Accuracy', value: `${bossResult.accuracy}%` },
                  { label: 'CPM', value: bossResult.cpm },
                  { label: 'WPM', value: bossResult.wpm },
                  { label: 'Time', value: formatElapsedTime(bossResult.elapsedSeconds) },
                  { label: 'Mistakes', value: stats.mistakes },
                  { label: 'Backspace', value: stats.backspaces },
                  { label: 'XP', value: `+${finalXpEarned}` },
                  { label: 'Coins', value: `+${coinsEarned}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-[14px] border-2 border-[#A77B3C] bg-white/68 px-3 py-3 shadow-inner">
                    <div className="text-xs font-black uppercase text-[#7A4D19]">{item.label}</div>
                    <div className="mt-1 text-2xl font-black text-[#24395F]">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <section className="rounded-[14px] border-2 border-[#A77B3C] bg-[#FFF9DF]/82 p-4">
                  <div className="text-sm font-black uppercase text-[#7A4D19]">Weak keys</div>
                  <div className="mt-2 space-y-2 font-black text-[#24395F]">
                    {weakKeys.length > 0 ? weakKeys.slice(0, 3).map((weakKey, index) => (
                      <div key={weakKey.value} className="flex justify-between rounded-[10px] bg-white/70 px-3 py-2">
                        <span>{index + 1}. <span className="khmer-body">{weakKey.value}</span></span>
                        <span>{weakKey.mistakes} mistakes</span>
                      </div>
                    )) : <div className="rounded-[10px] bg-white/70 px-3 py-2">No weak keys found.</div>}
                  </div>
                </section>
                <section className="rounded-[14px] border-2 border-[#A77B3C] bg-[#FFF9DF]/82 p-4">
                  <div className="text-sm font-black uppercase text-[#7A4D19]">Next step</div>
                  <p className="mt-2 font-black leading-snug text-[#24395F]">
                    {bossResult.passed ? 'Continue to the map and open the next world.' : `Replay until accuracy reaches ${bossTargets.minimumAccuracy}%.`}
                  </p>
                  {newBadges.length > 0 && (
                    <div className="mt-3 rounded-[10px] bg-[#E6FFCF] px-3 py-2 text-sm font-black text-[#236A2B]">
                      New badge: {newBadges.map((badge) => badge.badgeName).join(', ')}
                    </div>
                  )}
                </section>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <GameButton variant="blue" icon={<ArrowLeft />} onClick={() => navigate('/map')}>
                  Back to Map
                </GameButton>
                <GameButton variant="secondary" icon={<RotateCcw />} onClick={retryBattle}>
                  Try Again
                </GameButton>
                <GameButton
                  variant="primary"
                  icon={<Trophy />}
                  aria-disabled={!bossResult.passed}
                  className={!bossResult.passed ? 'opacity-60' : undefined}
                  onClick={() => {
                    if (bossResult.passed) navigate('/map');
                    else setModal('continueLocked');
                  }}
                >
                  Continue
                </GameButton>
              </div>
            </div>
          </div>
        )}

        <ActionModal open={modal === 'help'} title="របៀបលេង" onClose={() => setModal(null)}>
          <p>ជ្រើសមេរៀន ឬ Boss challenge បន្ទាប់មកវាយអត្ថបទខ្មែរឲ្យដូចដែលបានបង្ហាញ។</p>
          <p>សម្រាប់អ្នកចាប់ផ្តើម ភាពត្រឹមត្រូវសំខាន់ជាងល្បឿន។ CPM មានន័យថាចំនួនតួអក្សរក្នុងមួយនាទី។</p>
          <p>ប្រើជំនួយក្តារចុច និងជំនួយម្រាមដៃ។ Boss mode ត្រូវការវាយចប់ និងឈានដល់គោលដៅភាពត្រឹមត្រូវ/CPM។</p>
        </ActionModal>
        <ActionModal open={modal === 'settings'} title="ការកំណត់" onClose={() => setModal(null)}>
          <SettingsPanel
            settings={settings}
            onChange={(nextSettings) => setSettings(saveAppSettings(nextSettings))}
            onResetProgress={handleResetProgress}
          />
        </ActionModal>
        <ActionModal open={modal === 'sound'} title="សំឡេង" onClose={() => setModal(null)}>
          <ComingSoonPanel
            title={settings.soundEnabled ? 'សំឡេងពាក្យនឹងមានឆាប់ៗ' : 'សំឡេងត្រូវបានបិទ'}
            detail={settings.soundEnabled ? 'សំឡេងពាក្យមិនទាន់ភ្ជាប់នៅឡើយ។ សូមប្រើអត្ថបទ និងជំនួយក្តារចុចសម្រាប់ឃ្លា Boss នេះ។' : 'បើកសំឡេងក្នុងការកំណត់ នៅពេលមុខងារហាត់សំឡេងរួចរាល់។'}
          />
        </ActionModal>
        <ActionModal open={modal === 'continueLocked'} title="មិនទាន់ឆ្លង Boss" onClose={() => setModal(null)}>
          បន្តបានបន្ទាប់ពីឈ្នះ Boss ដោយមានភាពត្រឹមត្រូវយ៉ាងតិច {bossTargets.minimumAccuracy}%។ សូមសាកម្តងទៀត ហើយផ្តោតលើការវាយអក្សរខ្មែរឲ្យត្រឹមត្រូវជាមុន។
        </ActionModal>
        <ActionModal open={modal === 'noHearts'} title="បេះដូងមិនគ្រប់" onClose={() => navigate('/map')}>
          <div className="space-y-2 font-black">
            <p>Not enough hearts. Practice normal lessons or wait for refill.</p>
            {bossEntryMessage && bossEntryMessage !== 'Not enough hearts.' && <p>{bossEntryMessage}</p>}
          </div>
        </ActionModal>
      </div>
    </PageTransition>
  );
}
