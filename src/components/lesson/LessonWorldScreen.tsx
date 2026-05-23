import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameScreen from '../layout/GameScreen';
import PageTransition from '../layout/PageTransition';
import { backgroundImages } from '../../assets/assetManifest';
import { saveLessonProgressToFirebase, saveMockLessonProgress } from '../../data/mockData';
import { findKhmerKeyByCharacter, findKhmerKeyByCode, targetableKhmerKeys, type KhmerKeyboardKey } from '../../data/keyboardMap';
import type { CurriculumLevel, CurriculumWorld } from '../../data/lessonCurriculum';
import LessonHud from './LessonHud';
import TypingTargetCard from './TypingTargetCard';
import KhmerKeyboard from './KhmerKeyboard';
import QuestScroll, { type QuestStageState } from './QuestScroll';
import LessonCompleteModal from './LessonCompleteModal';
import type { FingerId } from './TypingHands';

const TOTAL_BRIDGE_PROGRESS = 30;
const STAGE_LABELS = ['រៀនគ្រាប់ចុច', 'សាងសង់ស្ពាន', 'វគ្គប្រកួត'];

type LessonWorldScreenProps = {
  world: CurriculumWorld;
  lesson: CurriculumLevel;
};

type Feedback = {
  code: string;
  state: 'correct' | 'wrong';
  message: string;
};

function cleanKeyCandidates(lesson: CurriculumLevel) {
  const values = [
    ...lesson.focusKeys.flatMap((item) => Array.from(item)),
    ...lesson.stages.flatMap((stage) => stage.items.flatMap((item) => Array.from(item))),
  ];
  const unique: KhmerKeyboardKey[] = [];

  for (const value of values) {
    if (!value || value === '\u200d' || value === '\u200c' || value === '\n' || value === '\r' || value === '\t' || value === ' ') continue;
    const key = findKhmerKeyByCharacter(value);
    if (key && !unique.some((item) => item.code === key.code)) unique.push(key);
  }

  return unique.length > 0 ? unique : [targetableKhmerKeys.find((key) => key.code === 'KeyK') ?? targetableKhmerKeys[0]];
}

function buildTargetSequence(lesson: CurriculumLevel) {
  const candidates = cleanKeyCandidates(lesson);
  return Array.from({ length: TOTAL_BRIDGE_PROGRESS }, (_, index) => candidates[index % candidates.length]);
}

function getHandHint(target: KhmerKeyboardKey) {
  const handLabel = target.hand === 'left' ? 'ដៃឆ្វេង' : target.hand === 'right' ? 'ដៃស្តាំ' : 'មេដៃ';
  const fingerLabel = {
    pinky: 'កូនដៃ',
    ring: 'ម្រាមនាង',
    middle: 'ម្រាមកណ្តាល',
    index: 'ម្រាមចង្អុល',
    thumb: 'មេដៃ',
  }[target.finger];

  return `${handLabel} - ${fingerLabel}`;
}

function getKeyHint(target: KhmerKeyboardKey) {
  return `${target.latin} key`;
}

function getFingerHint(target: KhmerKeyboardKey) {
  const handLabel = target.hand === 'left' ? 'Left' : target.hand === 'right' ? 'Right' : 'Either';
  const fingerLabel = {
    pinky: 'Pinky',
    ring: 'Ring',
    middle: 'Middle',
    index: 'Index',
    thumb: 'Thumb',
  }[target.finger];

  return `Use ${handLabel} ${fingerLabel} Finger`;
}

function getActiveFinger(target: KhmerKeyboardKey): FingerId {
  if (target.hand === 'thumb') return 'right-thumb';
  return `${target.hand}-${target.finger}` as FingerId;
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

  const activeTarget = targetSequence[Math.min(progress, TOTAL_BRIDGE_PROGRESS - 1)] ?? targetSequence[0];
  const totalAttempts = correctCount + wrongCount;
  const accuracy = totalAttempts === 0 ? 100 : Math.round((correctCount / totalAttempts) * 100);
  const starsEarned = accuracy >= 95 ? 3 : accuracy >= 85 ? 2 : 1;
  const coinsEarned = 20 + starsEarned * 10 + Math.floor(score / 900);
  const questStages = getQuestStages(progress, finished);
  const keyHint = getKeyHint(activeTarget);
  const handHint = getFingerHint(activeTarget);
  const activeFinger = getActiveFinger(activeTarget);

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

  function handleAttempt(code: string) {
    if (finished || !code) return;
    const pressedKey = findKhmerKeyByCode(code);

    if (code === activeTarget.code) {
      showFeedback({ code, state: 'correct', message: 'បានដាក់ក្តារស្ពាន!' });
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

    if (!pressedKey?.disabled) {
      setWrongCount((next) => next + 1);
      setStreak(0);
      showFeedback({ code, state: 'wrong', message: 'ព្យាយាមម្តងទៀត' });
    }
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

      const mappedKey = findKhmerKeyByCode(event.code);
      if (!mappedKey || mappedKey.disabled) return;

      event.preventDefault();
      handleAttemptRef.current(mappedKey.code);
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

        <TypingTargetCard
          target={activeTarget.khmer}
          keyHint={keyHint}
          handHint={handHint}
          feedbackState={feedback?.state}
          feedbackMessage={feedback?.message}
        />

        <KhmerKeyboard
          activeCode={activeTarget.code}
          feedbackCode={feedback?.code}
          feedbackState={feedback?.state}
          activeHand={activeTarget.hand}
          activeFinger={activeFinger}
          onKeyPress={handleAttempt}
        />

        <QuestScroll
          objective="បំភ្លឺក្តារស្ពាន 30 Keys ដើម្បីបើកទ្វារ។"
          progress={progress}
          total={TOTAL_BRIDGE_PROGRESS}
          nextKey={activeTarget.khmer}
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
