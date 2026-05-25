import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, Gauge, HelpCircle, RotateCcw, Settings, ShieldAlert, Swords, Target, Trophy, Volume2, XCircle } from 'lucide-react';
import CharacterPlaceholder from '../components/characters/CharacterPlaceholder';
import GameButton from '../components/game/GameButton';
import KhmerKeyboard from '../components/game/KhmerKeyboard';
import Logo from '../components/game/Logo';
import ProgressBar from '../components/game/ProgressBar';
import StatPill from '../components/game/StatPill';
import PageTransition from '../components/layout/PageTransition';
import GameIcon from '../components/game-ui/GameIcon';
import { getCurriculumLevel, getCurriculumWorld, lessonCurriculum } from '../data/lessonCurriculum';
import { getStructuredLessonByRoute } from '../data/typingProgression';
import {
  getKhmerKeyboardValue,
  getLessonProgressRecords,
  resources,
  saveLessonProgressToFirebase,
  saveMockLessonProgress,
} from '../data/mockData';
import type { KeyboardKeyData } from '../types/game';
import { countKhmerCharacters, countKhmerWords, khmerTextEquals, normalizeKhmerText } from '../lib/khmerText';
import {
  calculateLessonXP,
  classifyWeakKey,
  getBestScoreForLesson,
  loadStudentProgress,
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

type BossRunStats = {
  correctInputs: number;
  correctWords: number;
  mistakes: number;
  backspaces: number;
  streak: number;
  bestStreak: number;
  weakKeyStats: WeakKeyStatRecord;
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

function getBossTimerSeconds(itemCount: number) {
  return Math.max(75, Math.min(180, itemCount * 8 + 45));
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

export default function BattlePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedWorldId = Number(searchParams.get('world') ?? 1);
  const world = getCurriculumWorld(Number.isFinite(requestedWorldId) ? requestedWorldId : 1) ?? lessonCurriculum[0];
  const bossLesson = getCurriculumLevel(world.id, 'boss') ?? lessonCurriculum[0].levels.find((level) => level.id === 'boss') ?? lessonCurriculum[0].levels[0];
  const structuredBossLesson = getStructuredLessonByRoute(world.id, 'boss');
  const battleItems = useMemo(() => bossLesson.stages.flatMap((stage) => stage.items).filter(Boolean), [bossLesson]);
  const targetText = useMemo(() => battleItems.join(' '), [battleItems]);
  const bossTargets = useMemo(() => {
    const curriculumTargets = getBossTargets(world.id, bossLesson);
    return {
      minimumAccuracy: structuredBossLesson?.minimumAccuracy ?? curriculumTargets.minimumAccuracy,
      targetCPM: structuredBossLesson?.targetCPM ?? curriculumTargets.targetCPM,
      baseXP: structuredBossLesson?.xpReward ?? curriculumTargets.baseXP,
    };
  }, [bossLesson, structuredBossLesson, world.id]);
  const bossMaxHp = useMemo(() => getBossMaxHp(battleItems.length), [battleItems.length]);
  const initialTimer = useMemo(() => getBossTimerSeconds(battleItems.length), [battleItems.length]);

  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [bossHp, setBossHp] = useState(bossMaxHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [timer, setTimer] = useState(initialTimer);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [damage, setDamage] = useState<number | null>(null);
  const [attack, setAttack] = useState(false);
  const [stats, setStats] = useState<BossRunStats>(() => getInitialStats());
  const [newBadges, setNewBadges] = useState<StudentBadge[]>([]);
  const progressSavedRef = useRef(false);

  const currentWord = battleItems[wordIndex % Math.max(1, battleItems.length)] ?? 'សាលា';
  const currentUnits = useMemo(() => Array.from(normalizeKhmerText(currentWord)), [currentWord]);
  const typedUnits = useMemo(() => Array.from(normalizeKhmerText(typed)), [typed]);
  const activeKey = currentUnits[typedUnits.length] ?? '';
  const wordTextSize = currentWord.length > 42 ? 'text-2xl' : currentWord.length > 24 ? 'text-3xl' : currentWord.length > 12 ? 'text-4xl' : 'text-6xl';
  const correctPrefix = useMemo(() => normalizeKhmerText(currentWord).startsWith(normalizeKhmerText(typed)), [currentWord, typed]);
  const bossDefeated = bossHp <= 0;
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
  const previousBestScore = Math.max(
    getBestScoreForLesson(loadStudentProgress(), resultLessonId),
    getLessonProgressRecords().find((record) => record.worldId === world.id && record.lessonId === 'boss')?.score ?? 0,
  );
  const finalXpEarned = calculateLessonXP({
    passed: bossResult.passed,
    baseXP: bossTargets.baseXP,
    stars: bossResult.stars,
    accuracy: bossResult.accuracy,
    cpm: bossResult.cpm,
    targetCPM: bossTargets.targetCPM,
    mistakes: stats.mistakes,
    score: bossResult.finalScore,
    previousBestScore,
  });
  const coinsEarned = bossResult.passed ? 50 + bossResult.stars * 20 + world.id * 5 : 0;
  const weakKeys = summarizeWeakKeyStats(stats.weakKeyStats, 5);

  const completeCorrectWord = useCallback(() => {
    if (battleFinished) return;

    const nextDamage = 30 + stats.streak * 4;
    const completedWord = currentWord;

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
    setBossHp((hp) => {
      const nextHp = Math.max(0, hp - nextDamage);
      return nextHp;
    });
    setWordIndex((next) => next + 1);
    setTyped('');
    setDamage(nextDamage);
    setAttack(true);
    window.setTimeout(() => setAttack(false), 420);
    window.setTimeout(() => setDamage(null), 800);
  }, [battleFinished, currentWord, stats.streak]);

  const registerMistake = useCallback((expectedValue: string) => {
    setStats((current) => ({
      ...current,
      mistakes: current.mistakes + 1,
      streak: 0,
      weakKeyStats: addWeakKeyStat(current.weakKeyStats, expectedValue, 'mistakes'),
    }));
    setPlayerHp((hp) => Math.max(0, hp - 8));
  }, []);

  const submitWord = useCallback(() => {
    if (!typed || battleFinished) return;

    if (khmerTextEquals(typed, currentWord)) {
      completeCorrectWord();
    } else {
      registerMistake(activeKey || currentWord);
      setTyped('');
    }
  }, [activeKey, battleFinished, completeCorrectWord, currentWord, registerMistake, typed]);

  const appendValue = useCallback((value: string) => {
    if (battleFinished) return;

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
  }, [battleFinished, completeCorrectWord, currentWord, registerMistake]);

  const handlePress = useCallback(
    (keyData: KeyboardKeyData) => {
      if (battleFinished) return;

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
    [activeKey, appendValue, battleFinished, currentWord, submitWord],
  );

  useEffect(() => {
    if (battleFinished) return undefined;
    const interval = window.setInterval(() => {
      setTimer((next) => Math.max(0, next - 1));
      setElapsedSeconds((next) => next + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [battleFinished]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (battleFinished) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        submitWord();
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handlePress({ label: 'Backspace', value: '', action: 'backspace' });
      } else if (event.key.length === 1) {
        const mappedKey = getKhmerKeyboardValue(event);
        if (!mappedKey) return;
        event.preventDefault();
        appendValue(mappedKey);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [appendValue, battleFinished, handlePress, submitWord]);

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
  }, [battleFinished, bossDefeated, bossLesson.objective, bossResult, bossTargets.minimumAccuracy, bossTargets.targetCPM, coinsEarned, finalXpEarned, resultLessonId, stats.backspaces, stats.bestStreak, stats.mistakes, structuredBossLesson, targetText, weakKeys, world.id, world.title]);

  const retryBattle = () => {
    setBossHp(bossMaxHp);
    setTimer(initialTimer);
    setTyped('');
    setWordIndex(0);
    setPlayerHp(100);
    setDamage(null);
    setAttack(false);
    setStats(getInitialStats());
    setElapsedSeconds(0);
    setNewBadges([]);
    progressSavedRef.current = false;
  };

  return (
    <PageTransition className="min-h-screen overflow-hidden jungle-vignette text-white">
      <div className="relative min-h-screen px-4 py-4 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.04),transparent_34%,rgba(0,0,0,.12))]" />
        <header className="relative z-20 flex flex-wrap items-center gap-4">
          <Link to="/map" className="shrink-0">
            <Logo compact={false} className="scale-75 origin-left lg:scale-90" />
          </Link>
          <div className="mx-auto flex items-center gap-3 rounded-[18px] bg-black/28 px-6 py-3 shadow-inner">
            <Swords className="text-gold" size={34} />
            <div>
              <h1 className="text-3xl font-black tracking-wide">{world.title} Boss</h1>
              <div className="text-sm font-black text-white/74">Pass with {bossTargets.minimumAccuracy}% accuracy and {bossTargets.targetCPM} CPM target</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatPill icon={<BattleResourceIcon name="coin" />} value={resources.coins} tone="dark" />
            <StatPill icon={<BattleResourceIcon name="gem" />} value={resources.gems} tone="dark" />
            <button className="grid h-14 w-14 place-items-center rounded-[18px] bg-gradient-to-b from-adventure to-[#063E8B] shadow-button" aria-label="Settings">
              <Settings />
            </button>
            <GameButton variant="blue" icon={<HelpCircle />}>How to Play</GameButton>
          </div>
        </header>

        <div className="relative z-10 mt-4 grid gap-5 xl:grid-cols-[260px_1fr_250px]">
          <aside className="space-y-4">
            <section className="dark-game-panel rounded-[18px] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-16 w-16 place-items-center rounded-[16px] border-2 border-white/65 bg-gradient-to-b from-sky to-primary">
                  <ShieldAlert size={34} />
                </div>
                <div>
                  <h2 className="text-xl font-black">Boss Rules</h2>
                  <div className="text-sm font-bold text-sky">Accuracy unlocks progress.</div>
                </div>
              </div>
            </section>
            <section className="dark-game-panel rounded-[18px] p-4">
              <h3 className="mb-3 rounded-[12px] bg-adventure px-4 py-2 text-base font-black">Targets</h3>
              <div className="grid gap-2 text-sm font-black">
                <div className="flex justify-between rounded-[12px] bg-white/8 px-3 py-2"><span>Accuracy</span><span>{bossTargets.minimumAccuracy}%</span></div>
                <div className="flex justify-between rounded-[12px] bg-white/8 px-3 py-2"><span>CPM</span><span>{bossTargets.targetCPM}</span></div>
                <div className="flex justify-between rounded-[12px] bg-white/8 px-3 py-2"><span>Words</span><span>{battleItems.length}</span></div>
                <div className="flex justify-between rounded-[12px] bg-white/8 px-3 py-2"><span>Time</span><span>{formatElapsedTime(initialTimer)}</span></div>
              </div>
            </section>
            <section className="dark-game-panel rounded-[18px] p-4 text-center">
              <div className="text-sm font-black uppercase text-white/70">Streak</div>
              <div className="text-5xl font-black text-gold">{stats.streak}</div>
              <div className="font-black text-gold">Best {stats.bestStreak}</div>
            </section>
            <section className="dark-game-panel rounded-[18px] p-4 text-center">
              <div className="text-sm font-black uppercase text-white/70">Final Score</div>
              <div className="text-5xl font-black text-gold">{bossResult.finalScore.toLocaleString()}</div>
              <div className="font-black text-sky">Best {previousBestScore.toLocaleString()}</div>
            </section>
          </aside>

          <main className="relative min-h-[720px] overflow-hidden rounded-[24px] border border-white/15 bg-black/12 p-4 shadow-2xl">
            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-44">
                <div className="mb-1 text-xl font-black">Student</div>
                <ProgressBar value={playerHp} max={100} color="green" showValue />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Accuracy', value: `${bossResult.accuracy}%`, icon: <Target size={22} /> },
                  { label: 'CPM', value: bossResult.cpm, icon: <Gauge size={22} /> },
                  { label: 'Mistakes', value: stats.mistakes, icon: <XCircle size={22} /> },
                  { label: 'Time', value: `${timer}s`, icon: <Clock size={22} /> },
                ].map((item) => (
                  <div key={item.label} className="min-w-[112px] rounded-[14px] border border-white/16 bg-black/28 px-3 py-2 font-black">
                    <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-[10px] bg-white/12 text-gold">{item.icon}</div>
                    <div className="text-xs uppercase text-white/62">{item.label}</div>
                    <div className="text-2xl leading-none">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="min-w-56">
                <div className="mb-1 text-xl font-black">{bossLesson.labelEn}</div>
                <ProgressBar value={bossHp} max={bossMaxHp} color="red" showValue />
              </div>
            </div>

            <div className="relative z-10 mt-5 grid items-center gap-2 md:grid-cols-[1fr_330px_1fr]">
              <div className="relative">
                <CharacterPlaceholder type="elephant" className="mx-auto scale-95" />
                {attack && <motion.div className="absolute right-0 top-48 h-6 w-80 rounded-full bg-gold shadow-[0_0_26px_#FFC107]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} />}
              </div>
              <div className="relative mx-auto w-full max-w-sm">
                <button className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-adventure text-white shadow-button" aria-label="Play word sound">
                  <Volume2 size={26} />
                </button>
                <div className={`khmer-body rounded-[20px] border-4 border-gold bg-[#FFF8E7] px-5 py-9 text-center font-black leading-tight text-ink shadow-[0_0_24px_rgba(255,193,7,.55)] ${wordTextSize}`}>
                  {currentWord}
                </div>
                <div className={`khmer-body mt-3 min-h-[64px] rounded-[16px] border-2 px-4 py-3 text-center text-3xl font-black ${correctPrefix ? 'border-primary bg-primary/20 text-white' : 'border-coral bg-coral/20 text-coral'}`}>
                  {typed || '...'}
                </div>
                <div className="mt-2 text-center text-sm font-black text-white/72">Type the boss phrase exactly, then press Enter if needed.</div>
              </div>
              <div className="relative">
                <CharacterPlaceholder type="guardian" className="mx-auto scale-105" />
                {damage && (
                  <motion.div
                    className="absolute left-1/2 top-40 text-6xl font-black text-coral"
                    initial={{ opacity: 0, y: 20, scale: 0.6 }}
                    animate={{ opacity: 1, y: -30, scale: 1 }}
                  >
                    -{damage}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="relative z-10 mx-auto mt-3 max-w-3xl">
              <div className="mb-3 flex items-center gap-3 rounded-[16px] bg-black/40 p-3">
                <ProgressBar value={timer} max={initialTimer} color={timer < 25 ? 'red' : 'green'} className="flex-1" />
                <div className="rounded-full bg-adventure px-4 py-2 text-xl font-black">{timer}s</div>
              </div>
              <KhmerKeyboard onKeyPress={handlePress} activeKey={activeKey} compact />
            </div>
          </main>

          <aside className="dark-game-panel rounded-[18px] p-4">
            <h3 className="mb-4 text-center text-xl font-black">Boss Lesson</h3>
            <div className="space-y-3">
              {bossLesson.stages.map((stage) => (
                <div key={stage.id} className="rounded-[14px] bg-white/8 p-3">
                  <div className="font-black">{stage.titleEn}</div>
                  <div className="khmer-body mt-1 text-sm font-bold leading-snug text-sky">{stage.mission}</div>
                  <div className="mt-2 text-xs font-black uppercase text-white/55">{stage.items.length} prompts | {stage.accuracyGoal}% goal</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[14px] border border-adventure/40 bg-adventure/20 p-4">
              <div className="text-center font-black">Rewards</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-lg font-black">
                <span><GameIcon name="star" size={28} /> {bossResult.stars}</span>
                <span><GameIcon name="coin" size={28} /> +{coinsEarned}</span>
                <span>XP +{finalXpEarned}</span>
              </div>
            </div>
          </aside>
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
                <GameButton variant="primary" icon={<Trophy />} disabled={!bossResult.passed} onClick={() => navigate('/map')}>
                  Continue
                </GameButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
