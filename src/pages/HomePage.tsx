import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Gamepad2, GraduationCap, Keyboard, Music, PlayCircle, School, Shield, Swords, Timer, Trophy, Users, Volume2 } from 'lucide-react';
import LizardMascot from '../components/characters/LizardMascot';
import GameAchievementStrip from '../components/game-ui/GameAchievementStrip';
import GameButton from '../components/game-ui/GameButton';
import GameCard from '../components/game-ui/GameCard';
import GameHudCounter from '../components/game-ui/GameHudCounter';
import GameIcon from '../components/game-ui/GameIcon';
import GameLevelBadge from '../components/game-ui/GameLevelBadge';
import GameMapNode from '../components/game-ui/GameMapNode';
import GameScreen from '../components/layout/GameScreen';
import PageTransition from '../components/layout/PageTransition';
import { backgroundImages, imageAssets } from '../assets/assetManifest';
import { achievements, resources } from '../data/mockData';

const featureItems = [
  { title: 'Khmer Lessons', subtitle: 'From letters to sentences', icon: BookOpen, tone: 'from-[#B890FF] to-purple' },
  { title: 'Mini-Games', subtitle: 'Practice while having fun', icon: Gamepad2, tone: 'from-[#7BE76E] to-primary' },
  { title: 'Challenge Mode', subtitle: 'Defeat bosses with your typing', icon: Swords, tone: 'from-[#FF8D8F] to-coral' },
  { title: 'Teacher Friendly', subtitle: 'Track class progress easily', icon: Users, tone: 'from-[#64C9FF] to-adventure' },
];

export default function HomePage() {
  return (
    <PageTransition>
      <GameScreen background={backgroundImages.home} reference="/src/reference/home-reference.png" className="font-sans">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.08)_0%,rgba(255,255,255,0)_42%,rgba(8,98,160,.12)_100%)]" />

        <div className="absolute left-[28px] top-[24px] z-30 flex gap-3">
          {[Music, Volume2].map((Icon, index) => (
            <button
              key={index}
              className="grid h-[52px] w-[52px] place-items-center rounded-full border-[3px] border-[#0756AF] bg-gradient-to-b from-[#73D8FF] to-[#1E78E6] text-white shadow-button"
              aria-label={index === 0 ? 'Music' : 'Sound'}
            >
              <Icon size={28} />
            </button>
          ))}
        </div>

        <header className="absolute right-[38px] top-[20px] z-30 flex items-start gap-6">
          <div className="flex gap-3">
            <GameHudCounter type="coins" value={resources.coins} showPlus />
            <GameHudCounter type="hearts" value={`${resources.hearts}/${resources.maxHearts}`} label="Full" />
          </div>
          <div className="flex h-[62px] min-w-[214px] items-center gap-3 rounded-[20px] border-2 border-white/25 bg-[#06315F]/82 px-3 py-2 text-white shadow-[inset_0_-5px_0_rgba(0,0,0,.22),0_8px_18px_rgba(0,23,70,.25)]">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-mint to-primary shadow">
              <Users size={26} />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-black">Sophea</div>
              <div className="text-xs font-bold text-sky">Grade 4</div>
            </div>
          </div>
        </header>

        <main className="absolute inset-0">
          <div className="absolute left-[148px] top-[14px] z-20 h-[245px] w-[500px]">
            <img src={imageAssets.logo} alt="Khmer Typing Adventure" className="h-full w-full object-contain drop-shadow-[0_18px_18px_rgba(61,44,12,.22)]" />
            <div className="khmer-display absolute bottom-[18px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[18px] border-[4px] border-[#6F3A17] bg-gradient-to-b from-[#9D6530] to-[#5A311B] px-8 py-2 text-[26px] text-[#FFE7AA] shadow-button">
              ហ្គេមវាយអក្សរខ្មែរ!
            </div>
          </div>

          <motion.section
            className="absolute left-[58px] top-[244px] z-20 w-[315px]"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="rounded-[24px] border-[3px] border-white/70 bg-white/72 p-4 shadow-[0_16px_30px_rgba(10,81,139,.22)] backdrop-blur-md">
              <div className="space-y-3">
                {featureItems.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex items-center gap-3">
                      <div className={`grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full border-2 border-white/80 bg-gradient-to-b text-white shadow-button ${feature.tone}`}>
                        <Icon size={29} />
                      </div>
                      <div>
                        <div className="text-[17px] font-black leading-tight text-[#102F61]">{feature.title}</div>
                        <div className="text-[12px] font-bold leading-tight text-[#2C4D75]">{feature.subtitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          <motion.section
            className="absolute left-[112px] top-[470px] z-20 w-[680px]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <h1 className="hero-title-shadow text-[76px] font-black leading-[.98] tracking-normal">
              <span className="block text-primary">Learn Khmer.</span>
              <span className="block text-[#F47B11]">Play Games.</span>
              <span className="block text-adventure">Become a Typing Hero!</span>
            </h1>
            <p className="mt-5 w-[580px] text-[22px] font-extrabold leading-[1.42] text-[#17325A]">
              An exciting adventure to master Khmer typing through quests, rewards, and mini-game battles.
            </p>
            <div className="mt-7 flex items-center gap-5">
              <Link to="/map">
                <GameButton size="xl" variant="gold" rightIcon={<PlayCircle size={30} />} className="min-w-[320px] text-[28px]">
                  Start Adventure
                </GameButton>
              </Link>
              <Link to="/lesson">
                <GameButton size="lg" variant="white" leftIcon={<Keyboard size={25} />} className="min-w-[190px] border-adventure text-[20px]">
                  Try Demo
                </GameButton>
              </Link>
            </div>
          </motion.section>

          <div className="absolute left-[830px] top-[70px] z-20">
            <div className="absolute left-[170px] top-[650px] h-[190px] w-[610px] rounded-[48%_52%_46%_54%/58%_54%_46%_42%] bg-gradient-to-b from-[#7DDF66] via-primary to-[#5A381D] shadow-[0_28px_42px_rgba(24,72,54,.28)]" />
            <div className="absolute left-[555px] top-[585px] h-36 w-48 rounded-[44%] bg-primary/35 blur-2xl" />
            <LizardMascot className="relative z-10 w-[700px]" />
            <div className="absolute left-[680px] top-[620px] z-20 grid h-[122px] w-[158px] place-items-center">
              <GameIcon name="chest" size={116} />
            </div>
            <div className="absolute left-[458px] top-[722px] z-30 grid h-[78px] w-[78px] place-items-center rounded-full border-[4px] border-[#E18A00] bg-gradient-to-b from-[#FFF27A] to-[#F19A12] shadow-button">
              <GameIcon name="star" size={52} />
            </div>
          </div>

          <div className="absolute right-[78px] top-[120px] z-30">
            <GameLevelBadge level={12} size="lg" />
            <div className="mt-2 w-[128px] rounded-full border-2 border-white bg-primary px-4 py-1 text-center text-sm font-black text-white shadow-button">
              820 XP
            </div>
          </div>

          <div className="absolute left-[70px] top-[795px] z-20 w-[438px]">
            <GameCard tone="cream" className="h-[188px] rounded-[26px] border-[#D8B36F] p-5">
              <h2 className="mb-3 flex items-center gap-2 text-[23px] font-black text-[#132C55]">
                <Shield className="text-primary" /> Why You'll Love It
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/75 p-3 shadow-inner">
                  <div className="font-black text-adventure">Rewards</div>
                  <div className="text-xs font-bold text-slate-600">Coins, stars, chests</div>
                </div>
                <div className="rounded-2xl bg-white/75 p-3 shadow-inner">
                  <div className="font-black text-adventure">Bosses</div>
                  <div className="text-xs font-bold text-slate-600">Type to defeat foes</div>
                </div>
              </div>
            </GameCard>
          </div>

          <div className="absolute left-[535px] top-[795px] z-20 w-[650px]">
            <GameCard tone="blue" className="h-[188px] rounded-[26px] p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[23px] font-black text-[#132C55]">Adventure Path</h2>
                <Link to="/map">
                  <GameButton variant="blue" size="sm">View Map</GameButton>
                </Link>
              </div>
              <div className="relative h-[106px] rounded-[22px] bg-gradient-to-b from-[#EAF9FF] to-white">
                <div className="absolute left-[8%] right-[8%] top-[50%] h-4 -translate-y-1/2 rounded-full bg-[#72C0DA] shadow-inner" />
                {[1, 2, 3, 4, 5].map((node, index) => (
                  <GameMapNode key={node} level={node} state={index === 4 ? 'current' : 'completed'} color={index < 3 ? 'green' : 'gold'} stars={index < 4 ? 3 : 2} className="scale-[.72]" style={{ left: `${12 + index * 17}%`, top: '50%' }} />
                ))}
                <GameMapNode level={6} state="locked" color="gray" stars={0} className="scale-[.72]" style={{ left: '88%', top: '50%' }} />
              </div>
            </GameCard>
          </div>

          <div className="absolute left-[1216px] top-[790px] z-20 w-[620px]">
            <GameAchievementStrip achievements={achievements.slice(0, 5)} />
          </div>

          <section className="absolute bottom-[24px] left-[70px] z-20 flex h-[74px] w-[1780px] items-center gap-5 rounded-[24px] border border-[#E3C07A] bg-[#FFF8E6]/88 px-5 shadow-[0_12px_30px_rgba(60,50,30,.16)] backdrop-blur">
            <div className="flex w-[520px] items-center gap-4">
              <div className="relative h-16 w-24 shrink-0 rounded-[48%_52%_46%_54%/58%_54%_46%_42%] bg-gradient-to-b from-[#7DDF66] via-primary to-[#5A381D] shadow">
                <BookOpen className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white drop-shadow" size={26} />
              </div>
              <div>
                <div className="text-xl font-black text-adventure">Trusted by Teachers. Loved by Students.</div>
                <div className="text-sm font-bold text-slate-600">Aligned with Cambodian curriculum standards.</div>
              </div>
            </div>
            {[
              { icon: Users, value: '120K+', label: 'Happy Students', color: 'text-primary' },
              { icon: School, value: '2,500+', label: 'Schools', color: 'text-[#F47B11]' },
              { icon: Timer, value: '95%', label: 'Teacher Approval', color: 'text-gold' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex h-[56px] min-w-[260px] items-center gap-3 rounded-2xl bg-white/80 px-4 shadow-inner">
                  <Icon className={stat.color} size={36} />
                  <div>
                    <div className="text-2xl font-black leading-tight text-adventure">{stat.value}</div>
                    <div className="text-sm font-bold text-slate-600">{stat.label}</div>
                  </div>
                </div>
              );
            })}
            <Link to="/dashboard" className="ml-auto">
              <GameButton variant="white" size="md" leftIcon={<GraduationCap size={20} />}>
                For Teachers
              </GameButton>
            </Link>
          </section>
        </main>
      </GameScreen>
    </PageTransition>
  );
}
