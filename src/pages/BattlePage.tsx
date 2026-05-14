import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, Settings, Swords, Volume2 } from 'lucide-react';
import CharacterPlaceholder from '../components/characters/CharacterPlaceholder';
import GameButton from '../components/game/GameButton';
import KhmerKeyboard from '../components/game/KhmerKeyboard';
import Logo from '../components/game/Logo';
import ProgressBar from '../components/game/ProgressBar';
import RewardChest from '../components/game/RewardChest';
import StatPill from '../components/game/StatPill';
import PageTransition from '../components/layout/PageTransition';
import GameIcon from '../components/game-ui/GameIcon';
import { battleWords, powerUps, quests, resources } from '../data/mockData';
import type { KeyboardKeyData } from '../types/game';

function BattleResourceIcon({ name }: { name: 'coin' | 'gem' }) {
  return <GameIcon name={name} size={24} decorative={false} className="h-6 w-6" />;
}

export default function BattlePage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [bossHp, setBossHp] = useState(360);
  const [playerHp] = useState(120);
  const [combo, setCombo] = useState(18);
  const [score, setScore] = useState(860);
  const [timer, setTimer] = useState(74);
  const [damage, setDamage] = useState<number | null>(15);
  const [attack, setAttack] = useState(false);
  const currentWord = battleWords[wordIndex % battleWords.length];
  const correctPrefix = useMemo(() => currentWord.startsWith(typed), [currentWord, typed]);

  const completeCorrectWord = useCallback(() => {
    const nextDamage = 25 + combo;
    setBossHp((hp) => Math.max(0, hp - nextDamage));
    setScore((next) => next + 60 + combo * 5);
    setCombo((next) => next + 1);
    setWordIndex((next) => next + 1);
    setTyped('');
    setDamage(nextDamage);
    setAttack(true);
    window.setTimeout(() => setAttack(false), 420);
    window.setTimeout(() => setDamage(null), 800);
  }, [combo]);

  const submitWord = useCallback(() => {
    if (!typed) return;

    if (typed === currentWord) {
      completeCorrectWord();
    } else {
      setCombo(0);
      setTyped('');
    }
  }, [completeCorrectWord, currentWord, typed]);

  const handlePress = useCallback(
    (keyData: KeyboardKeyData) => {
      if (keyData.action === 'backspace') {
        setTyped((next) => next.slice(0, -1));
        return;
      }
      if (keyData.action === 'enter') {
        submitWord();
        return;
      }
      if (keyData.action === 'space') {
        setTyped((next) => `${next} `);
        return;
      }
      setTyped((next) => {
        const candidate = next + keyData.value;
        if (candidate.length >= currentWord.length && candidate === currentWord) {
          window.setTimeout(completeCorrectWord, 20);
        }
        return candidate.slice(0, currentWord.length);
      });
    },
    [completeCorrectWord, currentWord, submitWord],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimer((next) => (next <= 0 ? 100 : next - 1));
    }, 650);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        submitWord();
      } else if (event.key === 'Backspace') {
        setTyped((next) => next.slice(0, -1));
      } else if (event.key.length === 1) {
        setTyped((next) => (next + event.key).slice(0, currentWord.length));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentWord.length, submitWord]);

  return (
    <PageTransition className="min-h-screen overflow-hidden jungle-vignette text-white">
      <div className="relative min-h-screen px-4 py-4 lg:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute left-10 top-32 h-96 w-40 rotate-6 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute right-16 top-28 h-96 w-52 -rotate-12 rounded-full bg-adventure/25 blur-3xl" />
        </div>
        <header className="relative z-20 flex flex-wrap items-center gap-4">
          <Link to="/" className="shrink-0">
            <Logo compact={false} className="scale-75 origin-left lg:scale-90" />
          </Link>
          <div className="mx-auto flex items-center gap-3 rounded-3xl bg-black/25 px-8 py-3 shadow-inner">
            <Swords className="text-gold" size={34} />
            <h1 className="text-3xl font-black tracking-wide">MINI-GAME BATTLE</h1>
          </div>
          <div className="flex items-center gap-2">
            <StatPill icon={<BattleResourceIcon name="coin" />} value={resources.coins} tone="dark" />
            <StatPill icon={<BattleResourceIcon name="gem" />} value={resources.gems} tone="dark" />
            <button className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-adventure to-[#063E8B] shadow-button" aria-label="Settings">
              <Settings />
            </button>
            <GameButton variant="blue" icon={<HelpCircle />}>How to Play</GameButton>
          </div>
        </header>

        <div className="relative z-10 mt-4 grid gap-5 xl:grid-cols-[250px_1fr_240px]">
          <aside className="space-y-4">
            <section className="dark-game-panel rounded-3xl p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-gradient-to-b from-sky to-primary text-5xl">🐘</div>
                <div>
                  <h2 className="text-2xl font-black">Sophea</h2>
                  <div className="font-bold text-sky">Level 12</div>
                  <ProgressBar value={1280} max={2000} color="blue" className="mt-2 w-32" />
                </div>
              </div>
            </section>
            <section className="dark-game-panel rounded-3xl p-4">
              <h3 className="mb-3 rounded-xl bg-adventure px-4 py-2 text-lg font-black">DAILY MISSIONS</h3>
              <div className="space-y-3">
                {quests.map((quest) => (
                  <div key={quest.id} className="rounded-2xl bg-white/8 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black">{quest.title}</span>
                      <span className="text-gold">+{quest.rewardCoins}</span>
                    </div>
                    <ProgressBar value={quest.progress} max={quest.total} color="green" className="mt-2" />
                  </div>
                ))}
              </div>
            </section>
            <section className="dark-game-panel rounded-3xl p-4 text-center">
              <div className="text-lg font-black">STREAK</div>
              <div className="text-5xl font-black text-gold">{combo}</div>
              <div className="font-black text-gold">Keep it up!</div>
            </section>
            <section className="dark-game-panel rounded-3xl p-4 text-center">
              <div className="text-xl font-black">SCORE</div>
              <div className="text-6xl font-black text-gold">{score}</div>
              <div className="font-black text-sky">BEST: 1,250</div>
            </section>
          </aside>

          <main className="relative min-h-[720px] overflow-hidden rounded-[32px] border border-white/15 bg-black/10 p-4 shadow-2xl">
            <div className="absolute inset-x-12 top-24 h-16 rounded-full bg-gold/20 blur-2xl" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="min-w-44">
                <div className="mb-1 text-2xl font-black">Sophea</div>
                <ProgressBar value={playerHp} max={120} color="green" showValue />
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-gold drop-shadow">COMBO</div>
                <div className="text-7xl font-black text-gold drop-shadow">x {combo}</div>
                <div className="rounded-2xl border-2 border-gold bg-[#D38721]/90 px-6 py-2 text-2xl font-black shadow-button">AWESOME!</div>
              </div>
              <div className="min-w-52">
                <div className="mb-1 text-2xl font-black">Stone Guardian</div>
                <ProgressBar value={bossHp} max={600} color="red" showValue />
              </div>
            </div>

            <div className="relative z-10 mt-4 grid items-center gap-2 md:grid-cols-[1fr_300px_1fr]">
              <div className="relative">
                <CharacterPlaceholder type="elephant" className="mx-auto scale-95" />
                {attack && <motion.div className="absolute right-0 top-48 h-6 w-80 rounded-full bg-gold shadow-[0_0_26px_#FFC107]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} />}
              </div>
              <div className="relative mx-auto w-full max-w-sm">
                <button className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-adventure text-white shadow-button" aria-label="Play word sound">
                  <Volume2 size={26} />
                </button>
                <div className="khmer-body rounded-3xl border-4 border-gold bg-[#FFF8E7] px-6 py-10 text-center text-7xl font-black text-ink shadow-[0_0_28px_rgba(255,193,7,.8)]">
                  {currentWord}
                </div>
                <div className={`mt-3 rounded-2xl border-2 px-4 py-3 text-center text-3xl font-black ${correctPrefix ? 'border-primary bg-primary/20 text-white' : 'border-coral bg-coral/20 text-coral'}`}>
                  {typed || '...'}
                </div>
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

            <div className="relative z-10 mx-auto mt-1 max-w-3xl">
              <div className="mb-3 flex items-center gap-3 rounded-2xl bg-black/40 p-3">
                <ProgressBar value={timer} max={100} color={timer < 25 ? 'red' : 'green'} className="flex-1" />
                <div className="rounded-full bg-adventure px-4 py-2 text-xl font-black">{Math.ceil(timer / 6)}s</div>
              </div>
              <KhmerKeyboard onKeyPress={handlePress} activeKey={currentWord[typed.length]} compact />
            </div>

            <div className="relative z-10 mt-4 flex items-center gap-5">
              <RewardChest progress={60} max={100} compact />
              <div className="hidden flex-1 items-end gap-8 lg:flex">
                {[200, 400, 600, 900, 1200].map((milestone) => (
                  <div key={milestone} className="flex-1 text-center">
                    <div className={`mx-auto h-8 w-8 rounded-full ${score >= milestone ? 'bg-gold' : 'bg-slate-500'}`} />
                    <div className="font-black">{milestone}</div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          <aside className="dark-game-panel rounded-3xl p-4">
            <h3 className="mb-4 text-center text-xl font-black">POWER-UPS</h3>
            <div className="space-y-4">
              {powerUps.map((power) => (
                <button key={power.id} className="flex w-full items-center gap-3 rounded-2xl bg-white/8 p-3 text-left transition hover:bg-white/15">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-adventure/35 text-gold">{power.icon}</div>
                  <div>
                    <div className="font-black">{power.name}</div>
                    <div className="text-sm font-bold text-sky">{power.description}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-3xl border border-adventure/40 bg-adventure/20 p-4">
              <div className="text-center font-black">REWARDS</div>
              <div className="mt-3 flex items-center justify-center gap-3 text-2xl font-black">
                <span className="inline-flex items-center gap-1"><GameIcon name="coin" size={28} /> +25</span>
                <span className="inline-flex items-center gap-1"><GameIcon name="star" size={28} /> +1</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
