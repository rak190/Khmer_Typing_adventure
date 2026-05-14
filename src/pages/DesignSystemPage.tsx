import { BookOpen, Home, Map, Trophy } from 'lucide-react';
import GameAchievementStrip from '../components/game-ui/GameAchievementStrip';
import GameBadge from '../components/game-ui/GameBadge';
import GameButton from '../components/game-ui/GameButton';
import GameCard from '../components/game-ui/GameCard';
import GameHudCounter from '../components/game-ui/GameHudCounter';
import GameKeyboardKey from '../components/game-ui/GameKeyboardKey';
import GameLevelBadge from '../components/game-ui/GameLevelBadge';
import GameMapNode from '../components/game-ui/GameMapNode';
import GameMissionPanel from '../components/game-ui/GameMissionPanel';
import GameModal from '../components/game-ui/GameModal';
import GamePanel from '../components/game-ui/GamePanel';
import GameProgressBar from '../components/game-ui/GameProgressBar';
import GameRewardCard from '../components/game-ui/GameRewardCard';
import GameSidebarItem from '../components/game-ui/GameSidebarItem';
import GameStatCard from '../components/game-ui/GameStatCard';
import GameTabs from '../components/game-ui/GameTabs';
import PageTransition from '../components/layout/PageTransition';
import { achievements } from '../data/mockData';

const buttonVariants = ['gold', 'green', 'blue', 'purple', 'red', 'white'] as const;
const badgeVariants = ['newbie', 'rising-star', 'skilled', 'expert', 'master', 'legend', 'boss-slayer'] as const;

export default function DesignSystemPage() {
  return (
    <PageTransition className="min-h-screen bg-sky px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <header>
          <h1 className="text-4xl font-black text-adventure">Game UI Design System</h1>
          <p className="mt-2 font-bold text-slate-600">Reusable React, Tailwind, and SVG components. PNGs are only used for complex art and detailed icons.</p>
        </header>

        <GameCard header="Buttons" tone="blue">
          <div className="flex flex-wrap gap-4">
            {buttonVariants.map((variant) => (
              <GameButton key={variant} variant={variant} size="lg" leftIcon={<Trophy size={22} />}>
                {variant}
              </GameButton>
            ))}
          </div>
        </GameCard>

        <GameCard header="Badges" tone="cream">
          <div className="flex flex-wrap gap-5">
            {badgeVariants.map((variant, index) => (
              <GameBadge key={variant} variant={variant} locked={index === badgeVariants.length - 1} earned={index !== 5} />
            ))}
          </div>
        </GameCard>

        <GameCard header="HUD Counters And Progress" tone="white">
          <div className="flex flex-wrap gap-3">
            <GameHudCounter type="coins" value={1250} showPlus />
            <GameHudCounter type="gems" value={125} showPlus />
            <GameHudCounter type="hearts" value="5/5" />
            <GameHudCounter type="xp" value="820 XP" />
            <GameHudCounter type="score" value={860} />
            <GameHudCounter type="streak" value={18} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <GameProgressBar value={65} max={100} label="Green Progress" showValue variant="green" />
            <GameProgressBar value={42} max={100} label="Blue Progress" showValue variant="blue" />
            <GameProgressBar value={78} max={100} label="Purple Progress" showValue variant="purple" />
            <GameProgressBar value={55} max={100} label="Gold Progress" showValue variant="gold" />
          </div>
        </GameCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <GamePanel title="ផ្ទាំងល្បែង" subtitle="Game Panel" headerTone="purple">
            <p className="font-bold text-slate-600">Cream panel with a colored game header and editable React text.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <GameRewardCard icon="coin" value={200} label="coins" />
              <GameRewardCard icon="star" value={30} label="stars" />
              <GameRewardCard icon="gem" value={2} label="gems" />
            </div>
          </GamePanel>

          <GameCard header="Tabs, Sidebar, And Stats" tone="purple">
            <GameTabs
              active="map"
              tabs={[
                { id: 'home', label: 'Home' },
                { id: 'map', label: 'Map' },
                { id: 'battle', label: 'Battle' },
              ]}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <GameSidebarItem icon="treasure" khmer="រង្វាន់" subtitle="Treasure" />
              <GameSidebarItem icon="quests" khmer="បេសកកម្ម" subtitle="Daily Quests" active />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <GameStatCard icon={<Home />} value="120K+" label="Students" tone="green" />
              <GameStatCard icon={<BookOpen />} value="95%" label="Accuracy" tone="gold" />
            </div>
          </GameCard>
        </div>

        <GameCard header="Map Nodes And Keyboard" tone="blue">
          <div className="relative h-56 rounded-3xl bg-gradient-to-b from-[#83DFFF] to-[#57C871]">
            <GameMapNode level={1} state="completed" color="green" stars={3} label="ក" className="left-[18%] top-[50%]" />
            <GameMapNode level={6} state="current" color="purple" stars={2} label="ពាក្យ" className="left-[48%] top-[45%]" />
            <GameMapNode level={9} state="locked" color="gray" stars={0} label="ចាក់សោ" className="left-[78%] top-[55%]" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <GameKeyboardKey label="ក" active />
            <GameKeyboardKey label="ខ" state="correct" />
            <GameKeyboardKey label="គ" state="wrong" />
            <GameKeyboardKey label="Space" wide />
          </div>
        </GameCard>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <GameAchievementStrip achievements={achievements} />
          <GameMissionPanel selectedLevel={6} />
        </div>

        <div>
          <GameModal title="រង្វាន់ថ្មី!" rewardIcon="chest" actionLabel="Claim" inline>
            You earned coins, stars, and a new practice streak.
          </GameModal>
        </div>

        <div className="flex gap-3 text-sm font-bold text-slate-500">
          <Map size={18} />
          <span>All examples above keep text editable in React and avoid button/badge screenshot assets.</span>
        </div>
      </div>
    </PageTransition>
  );
}
