import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Flame, Hand, Lightbulb, Pause, Settings, Target, Trophy, Volume2 } from 'lucide-react';
import CharacterPlaceholder from '../components/characters/CharacterPlaceholder';
import GameButton from '../components/game/GameButton';
import KhmerKeyboard from '../components/game/KhmerKeyboard';
import LevelBadge from '../components/game/LevelBadge';
import Logo from '../components/game/Logo';
import ProgressBar from '../components/game/ProgressBar';
import StatPill from '../components/game/StatPill';
import XPBar from '../components/game/XPBar';
import GameIcon from '../components/game-ui/GameIcon';
import PageTransition from '../components/layout/PageTransition';
import { khmerLetters, resources } from '../data/mockData';
import type { KeyboardKeyData } from '../types/game';

export default function LessonPage() {
  const [index, setIndex] = useState(3);
  const [score, setScore] = useState(860);
  const [streak, setStreak] = useState(15);
  const [correct, setCorrect] = useState(24);
  const [attempts, setAttempts] = useState(25);
  const [shake, setShake] = useState(false);
  const [spark, setSpark] = useState(false);
  const currentLetter = khmerLetters[index % khmerLetters.length];
  const progress = Math.min(15, index + 1);
  const accuracy = Math.round((correct / Math.max(1, attempts)) * 100);

  const flashCards = useMemo(() => {
    const start = Math.max(0, index - 1);
    return khmerLetters.slice(start, start + 5).length >= 5
      ? khmerLetters.slice(start, start + 5)
      : [...khmerLetters.slice(start), ...khmerLetters.slice(0, 5 - khmerLetters.slice(start).length)];
  }, [index]);

  const handlePress = useCallback(
    (keyData: KeyboardKeyData | string) => {
      const value = typeof keyData === 'string' ? keyData : keyData.value;
      if (!value.trim()) return;

      setAttempts((next) => next + 1);
      if (value === currentLetter) {
        setCorrect((next) => next + 1);
        setScore((next) => next + 20 + Math.min(streak, 20));
        setStreak((next) => next + 1);
        setIndex((next) => (next + 1) % khmerLetters.length);
        setSpark(true);
        window.setTimeout(() => setSpark(false), 450);
      } else {
        setStreak(0);
        setShake(true);
        window.setTimeout(() => setShake(false), 380);
      }
    },
    [currentLetter, streak],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.length === 1) {
        handlePress(event.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePress]);

  return (
    <PageTransition className="min-h-screen overflow-hidden sky-clouds">
      <div className="relative min-h-screen px-4 py-4 lg:px-8">
        <div className="temple-silhouette" />
        <header className="relative z-20 flex flex-wrap items-center gap-4">
          <Link to="/map" className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#084B94] bg-gradient-to-b from-adventure to-[#063E8B] text-white shadow-button">
            <ArrowLeft size={30} />
          </Link>
          <Logo compact className="scale-[0.8] origin-left sm:scale-90" />
          <div className="ml-auto grid gap-3 md:grid-cols-3">
            <StatPill icon={<Target size={20} />} label="ពិន្ទុ" value={score} tone="blue" />
            <StatPill icon={<Flame size={20} />} label="Streak" value={streak} tone="blue" />
            <StatPill icon={<Target size={20} />} label="ត្រឹមត្រូវ" value={`${accuracy}%`} tone="blue" />
          </div>
          <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-[#0E68C8] to-[#0753A3] p-3 text-white shadow-game">
            <LevelBadge level={resources.level} />
            <XPBar xp={resources.xp} nextXp={resources.nextXp} className="w-56" />
          </div>
          <button className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-adventure to-[#073E8C] text-white shadow-button" aria-label="Pause">
            <Pause size={28} />
          </button>
          <button className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-adventure to-[#073E8C] text-white shadow-button" aria-label="Settings">
            <Settings size={28} />
          </button>
        </header>

        <div className="relative z-10 mt-6 grid gap-5 xl:grid-cols-[1fr_330px]">
          <main className="min-w-0">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
              <div className="khmer-body rounded-full bg-gradient-to-b from-primary to-[#16944B] px-8 py-3 text-xl font-black text-white shadow-button">
                មេរៀន ២ - ព្យញ្ជនៈ
              </div>
              <div className="flex items-center gap-3 rounded-full bg-white/60 px-6 py-3 shadow-inner backdrop-blur">
                <span className="text-xl font-black">{progress} / 15</span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 10 }).map((_, dotIndex) => (
                    <span
                      key={dotIndex}
                      className={`grid h-7 w-7 place-items-center rounded-full border-2 border-white text-xs font-black ${
                        dotIndex < progress ? 'bg-primary text-white' : 'bg-white/80 text-slate-400'
                      }`}
                    >
                      {dotIndex < progress ? <CheckCircle2 size={15} /> : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mx-auto max-w-5xl">
              <div className="flex items-center justify-center gap-5 overflow-x-auto pb-3">
                {flashCards.map((letter) => (
                  <motion.div
                    key={`${letter}-${index}`}
                    animate={letter === currentLetter && shake ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
                    className={`khmer-body grid h-36 min-w-32 place-items-center rounded-3xl border-4 bg-white text-7xl font-black shadow-game sm:h-44 sm:min-w-40 ${
                      letter === currentLetter ? 'border-primary shadow-glow' : 'border-slate-200'
                    }`}
                  >
                    {letter}
                    {letter === currentLetter && spark && (
                      <motion.span
                        className="absolute text-gold"
                        initial={{ opacity: 0, scale: 0.4, y: 20 }}
                        animate={{ opacity: 1, scale: 1.3, y: -62 }}
                        exit={{ opacity: 0 }}
                      >
                        +20
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid items-end gap-4 lg:grid-cols-[250px_1fr]">
              <CharacterPlaceholder type="elephant" className="mx-auto scale-90 origin-bottom" />
              <div>
                <div className="relative mb-5 rounded-3xl border-2 border-[#2670B5] bg-gradient-to-b from-[#0E4C86] to-[#08355F] p-5 text-white shadow-game">
                  <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-[#2670B5] bg-[#0B416F]" />
                  <div className="text-2xl font-black">
                    ល្អណាស់! វាយអក្សរដែលបាន <span className="text-[#7DFF68]">បន្លិច</span>។
                  </div>
                  <div className="khmer-body mt-2 text-2xl font-bold">សូមមើលអក្សរពណ៌បៃតង ហើយវាយឱ្យត្រឹមត្រូវ។</div>
                  <button className="absolute -right-6 top-1/2 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-adventure text-white shadow-button" aria-label="Play sound">
                    <Volume2 size={28} />
                  </button>
                </div>
                <div className="relative">
                  <KhmerKeyboard activeKey={currentLetter} onKeyPress={handlePress} />
                  <div className="pointer-events-none absolute inset-x-10 bottom-0 hidden h-52 translate-y-20 md:block">
                    <div className="absolute left-10 top-8 h-44 w-28 rounded-t-full bg-gradient-to-b from-[#FFD2A5] to-[#F4A767] shadow-xl" />
                    <div className="absolute left-28 top-4 h-44 w-16 rounded-t-full bg-gradient-to-b from-[#FFD2A5] to-[#F4A767] shadow-xl" />
                    <div className="absolute right-10 top-8 h-44 w-28 rounded-t-full bg-gradient-to-b from-[#FFD2A5] to-[#F4A767] shadow-xl" />
                    <div className="absolute right-28 top-4 h-44 w-16 rounded-t-full bg-gradient-to-b from-[#FFD2A5] to-[#F4A767] shadow-xl" />
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="space-y-4">
            <section className="game-card rounded-3xl p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-adventure">
                <Target className="text-coral" /> គោលដៅមេរៀន
              </h3>
              <p className="font-bold text-slate-700">វាយព្យញ្ជនៈទាំងអស់ឱ្យត្រឹមត្រូវ</p>
              <ProgressBar value={progress} max={15} color="green" showValue className="mt-4" />
            </section>
            <section className="game-card rounded-3xl p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-adventure"><Lightbulb className="text-gold" /> ជំនួយ</h3>
              <p className="font-bold text-slate-700">អក្សរនេះមានសំឡេងដូច “k”</p>
              <div className="khmer-body mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-center text-4xl font-black">
                {currentLetter} = k
              </div>
            </section>
            <section className="game-card rounded-3xl p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-adventure"><Hand className="text-primary" /> ម្រាមដៃជំនួយ</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                {['ដៃឆ្វេង', 'ដៃស្តាំ'].map((hand) => (
                  <div key={hand}>
                    <div className="rounded-full bg-mint px-3 py-1 text-sm font-black text-primary">{hand}</div>
                    <div className="relative mx-auto mt-3 h-28 w-24">
                      {[0, 1, 2, 3, 4].map((finger) => (
                        <div
                          key={finger}
                          className="absolute bottom-3 h-20 w-5 rounded-full bg-gradient-to-b from-[#FFD2A5] to-[#F4A767]"
                          style={{ left: `${finger * 18}px`, height: `${60 + (finger % 2) * 18}px` }}
                        />
                      ))}
                      <div className="absolute bottom-0 left-5 h-14 w-16 rounded-full bg-[#F4A767]" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="game-card rounded-3xl p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-adventure"><Trophy className="text-gold" /> វឌ្ឍនភាពរង្វាន់</h3>
              <p className="font-bold text-slate-700">ប្រមូលផ្កាយ ដើម្បីទទួលរង្វាន់!</p>
              <div className="mt-4 flex items-center gap-2 text-4xl">
                <GameIcon name="star" size={34} />
                <ProgressBar value={2} max={3} color="green" className="flex-1" />
                <GameIcon name="star" size={34} className="grayscale opacity-45" />
              </div>
              <div className="mt-2 font-black">ផ្កាយក្នុងមេរៀននេះ: 2 / 3</div>
            </section>
          </aside>
        </div>

        <div className="relative z-20 mt-4">
          <GameButton variant="blue" icon={<Volume2 />}>សំឡេង</GameButton>
        </div>
      </div>
    </PageTransition>
  );
}
