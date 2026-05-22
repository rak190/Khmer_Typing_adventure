import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameScreen from '../layout/GameScreen';
import PageTransition from '../layout/PageTransition';
import { backgroundImages, imageAssets } from '../../assets/assetManifest';
import { getKhmerKeyboardValue, keyboardRows, saveLessonProgressToFirebase, saveMockLessonProgress } from '../../data/mockData';
import type { CurriculumLevel, CurriculumWorld } from '../../data/lessonCurriculum';
import type { KeyboardKeyData } from '../../types/game';
import LessonHud from './LessonHud';
import AdventureMissionPanel from './AdventureMissionPanel';
import TypingTargetCard from './TypingTargetCard';
import KhmerKeyboard from './KhmerKeyboard';
import QuestScroll, { type QuestStageState } from './QuestScroll';
import LessonCompleteModal from './LessonCompleteModal';

const TOTAL_BRIDGE_PROGRESS = 30;
const STAGE_LABELS = ['រៀនគ្រាប់ចុច', 'សាងសង់ស្ពាន', 'វគ្គប្រកួត'];

type LessonWorldScreenProps = {
  world: CurriculumWorld;
  lesson: CurriculumLevel;
};

type KeyMeta = {
  key: KeyboardKeyData;
  rowIndex: number;
  keyIndex: number;
  layer: 'base' | 'shift' | 'altgr';
};

type Feedback = {
  key: string;
  state: 'correct' | 'wrong';
  message: string;
};

const flatKeyboard = keyboardRows.flatMap((row, rowIndex) => row.map((key, keyIndex) => ({ key, rowIndex, keyIndex })));

function visibleKey(key: string) {
  return key === ' ' ? 'Spacebar' : key;
}

function cleanKeyCandidates(lesson: CurriculumLevel) {
  const values = [
    ...lesson.focusKeys.flatMap((item) => Array.from(item)),
    ...lesson.stages.flatMap((stage) => stage.items.flatMap((item) => Array.from(item))),
  ];
  const unique: string[] = [];

  for (const value of values) {
    if (!value || value === '\u200d' || value === '\u200c' || value === '\n' || value === '\r' || value === '\t') continue;
    if (value === ' ') continue;
    if (!unique.includes(value)) unique.push(value);
  }

  return unique.length > 0 ? unique : ['ក'];
}

function buildTargetSequence(lesson: CurriculumLevel) {
  const candidates = cleanKeyCandidates(lesson);
  return Array.from({ length: TOTAL_BRIDGE_PROGRESS }, (_, index) => candidates[index % candidates.length]);
}

function getKeyMeta(target: string): KeyMeta | undefined {
  for (const item of flatKeyboard) {
    if (item.key.value === target) return { ...item, layer: 'base' };
    if (item.key.shift === target) return { ...item, layer: 'shift' };
    if (item.key.altgr === target) return { ...item, layer: 'altgr' };
  }
  return undefined;
}

function physicalKeyName(code?: string) {
  if (!code) return 'គ្រាប់ចុចលើអេក្រង់';
  if (code.startsWith('Key')) return `${code.replace('Key', '')} key`;
  if (code.startsWith('Digit')) return `${code.replace('Digit', '')} key`;
  if (code === 'Space') return 'Spacebar';
  return code.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function getHandHint(meta?: KeyMeta) {
  if (!meta) return 'ប្រើគ្រាប់ចុចដែលភ្លឺ';
  const code = meta.key.code;
  if (!code || meta.key.action === 'space') return 'ប្រើមេដៃស្តាំ';

  const leftPinky = ['Backquote', 'Digit1', 'Tab', 'KeyQ', 'CapsLock', 'KeyA', 'ShiftLeft', 'KeyZ'];
  const leftRing = ['Digit2', 'KeyW', 'KeyS', 'KeyX'];
  const leftMiddle = ['Digit3', 'KeyE', 'KeyD', 'KeyC'];
  const leftIndex = ['Digit4', 'Digit5', 'KeyR', 'KeyT', 'KeyF', 'KeyG', 'KeyV', 'KeyB'];
  const rightIndex = ['Digit6', 'Digit7', 'KeyY', 'KeyU', 'KeyH', 'KeyJ', 'KeyN', 'KeyM'];
  const rightMiddle = ['Digit8', 'KeyI', 'KeyK', 'Comma'];
  const rightRing = ['Digit9', 'KeyO', 'KeyL', 'Period'];

  if (leftPinky.includes(code)) return 'ប្រើកូនដៃឆ្វេង';
  if (leftRing.includes(code)) return 'ប្រើម្រាមនាងឆ្វេង';
  if (leftMiddle.includes(code)) return 'ប្រើម្រាមកណ្តាលឆ្វេង';
  if (leftIndex.includes(code)) return 'ប្រើម្រាមចង្អុលឆ្វេង';
  if (rightIndex.includes(code)) return 'ប្រើម្រាមចង្អុលស្តាំ';
  if (rightMiddle.includes(code)) return 'ប្រើម្រាមកណ្តាលស្តាំ';
  if (rightRing.includes(code)) return 'ប្រើម្រាមនាងស្តាំ';
  return 'ប្រើកូនដៃស្តាំ';
}

function getActiveHand(meta?: KeyMeta): 'left' | 'right' | 'both' {
  if (!meta) return 'both';
  if (meta.key.action === 'space') return 'both';
  const code = meta.key.code;
  const leftCodes = ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'ControlLeft', 'MetaLeft', 'AltLeft'];
  return code && leftCodes.includes(code) ? 'left' : 'right';
}

function getKeyHint(meta?: KeyMeta) {
  if (!meta) return 'រកគ្រាប់ចុច';
  const keyName = physicalKeyName(meta.key.code);
  if (meta.layer === 'shift') return `Shift + ${keyName}`;
  if (meta.layer === 'altgr') return `AltGr + ${keyName}`;
  return keyName;
}

function getQuestStages(progress: number, finished: boolean): QuestStageState[] {
  return STAGE_LABELS.map((label, index) => {
    const start = index * 10;
    const end = start + 10;
    if (finished || progress >= end) return { label, state: 'completed' };
    if (progress >= start) return { label, state: 'current' };
    return { label, state: 'locked' };
  });
}

export default function LessonWorldScreen({ world, lesson }: LessonWorldScreenProps) {
  const navigate = useNavigate();
  const targetSequence = useMemo(() => buildTargetSequence(lesson), [lesson]);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(860);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);
  const progressSavedRef = useRef(false);

  const activeTarget = targetSequence[Math.min(progress, TOTAL_BRIDGE_PROGRESS - 1)] ?? targetSequence[0] ?? '';
  const keyMeta = getKeyMeta(activeTarget);
  const totalAttempts = correctCount + wrongCount;
  const accuracy = totalAttempts === 0 ? 100 : Math.round((correctCount / totalAttempts) * 100);
  const starsEarned = accuracy >= 95 ? 3 : accuracy >= 85 ? 2 : 1;
  const coinsEarned = 20 + starsEarned * 10 + Math.floor(score / 900);
  const questStages = getQuestStages(progress, finished);
  const keyHint = getKeyHint(keyMeta);
  const handHint = getHandHint(keyMeta);
  const activeHand = getActiveHand(keyMeta);

  function showFeedback(nextFeedback: Feedback) {
    window.clearTimeout(feedbackTimeoutRef.current);
    setFeedback(nextFeedback);
    feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 620);
  }

  function resetLesson() {
    window.clearTimeout(feedbackTimeoutRef.current);
    setProgress(0);
    setScore(860);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setXpEarned(0);
    setFinished(false);
    setFeedback(null);
    progressSavedRef.current = false;
  }

  function handleAttempt(value: string) {
    if (finished || !value) return;

    if (value === activeTarget) {
      showFeedback({ key: value, state: 'correct', message: 'បានដាក់ក្តារស្ពាន!' });
      setCorrectCount((next) => next + 1);
      setScore((next) => next + 50 + Math.min(streak * 2, 40));
      setXpEarned((next) => next + 4);
      setStreak((next) => {
        const nextStreak = next + 1;
        setBestStreak((best) => Math.max(best, nextStreak));
        return nextStreak;
      });

      setProgress((current) => {
        const nextProgress = Math.min(TOTAL_BRIDGE_PROGRESS, current + 1);
        if (nextProgress >= TOTAL_BRIDGE_PROGRESS) setFinished(true);
        return nextProgress;
      });
      return;
    }

    setWrongCount((next) => next + 1);
    setStreak(0);
    showFeedback({ key: value, state: 'wrong', message: 'ព្យាយាមម្តងទៀត' });
  }

  const handleAttemptRef = useRef(handleAttempt);

  useEffect(() => {
    handleAttemptRef.current = handleAttempt;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const usingAltGr = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey);
      if ((event.ctrlKey || event.metaKey) && !usingAltGr) return;
      if (event.code === 'Space' || event.code === 'Backspace' || event.code === 'Tab') event.preventDefault();
      if (event.repeat) return;

      const mappedKey = getKhmerKeyboardValue(event);
      if (!mappedKey) return;

      event.preventDefault();
      handleAttemptRef.current(mappedKey);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => () => window.clearTimeout(feedbackTimeoutRef.current), []);

  useEffect(() => {
    if (!finished || progressSavedRef.current) return;

    const progressRecord = {
      worldId: world.id,
      lessonId: lesson.id,
      score,
      accuracy,
      wpm: 0,
      stars: starsEarned,
      xpEarned,
      coinsEarned,
      bestStreak,
    };

    saveMockLessonProgress(progressRecord);
    void saveLessonProgressToFirebase(progressRecord);
    progressSavedRef.current = true;
  }, [accuracy, bestStreak, coinsEarned, finished, lesson.id, score, starsEarned, world.id, xpEarned]);

  return (
    <PageTransition className="h-screen overflow-hidden bg-[#0A6FB5]">
      <GameScreen background={backgroundImages.lesson} fit="stretch" className="font-sans text-[#17325A]" style={{ backgroundSize: '100% 100%' }}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#57D6FF]/10 via-transparent to-[#092A28]/34" />
        <div className="temple-silhouette pointer-events-none opacity-50" />

        <LessonHud score={score} streak={streak} accuracy={accuracy} xpEarned={xpEarned} />

        <AdventureMissionPanel progress={progress} total={TOTAL_BRIDGE_PROGRESS} mascotSrc={imageAssets.lizardMascot} />

        <TypingTargetCard
          target={activeTarget}
          handHint={handHint}
          feedbackState={feedback?.state}
          feedbackMessage={feedback?.message}
        />

        <KhmerKeyboard activeKey={activeTarget} feedbackKey={feedback?.key} feedbackState={feedback?.state} activeHand={activeHand} onKeyPress={handleAttempt} />

        <QuestScroll
          objective="បំភ្លឺក្តារស្ពាន 30 Keys ដើម្បីបើកទ្វារ។"
          progress={progress}
          total={TOTAL_BRIDGE_PROGRESS}
          nextKey={activeTarget}
          keyHint={keyHint}
          stages={questStages}
          stars={starsEarned}
          xp={xpEarned}
          coins={coinsEarned}
        />

        {finished && (
          <LessonCompleteModal
            stars={starsEarned}
            accuracy={accuracy}
            xp={xpEarned}
            coins={coinsEarned}
            onContinue={() => navigate('/map')}
            onRetry={resetLesson}
          />
        )}
      </GameScreen>
    </PageTransition>
  );
}
