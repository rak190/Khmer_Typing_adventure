import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Settings, Trophy } from 'lucide-react';
import GameButton from '../components/game-ui/GameButton';
import GameIcon, { type GameIconName } from '../components/game-ui/GameIcon';
import GameProgressBar from '../components/game-ui/GameProgressBar';
import GameRewardCard from '../components/game-ui/GameRewardCard';
import GameScreen from '../components/layout/GameScreen';
import LizardMascot from '../components/characters/LizardMascot';
import PageTransition from '../components/layout/PageTransition';
import GameMapNode from '../components/game-ui/GameMapNode';
import { backgroundImages, imageAssets } from '../assets/assetManifest';
import {
  adventureWorlds,
  categoryBanners,
  getLessonState,
  getWorldProgress,
  getWorldStars,
  isWorldComplete,
  isWorldUnlocked,
  mapNodeLayout,
  type AdventureLesson,
  type AdventureWorld,
} from '../data/adventureWorlds';
import { resources } from '../data/mockData';

const sideActions = [
  { khmer: 'រង្វាន់', title: 'Treasure', icon: 'treasure' as const },
  { khmer: 'ភារកិច្ច', title: 'Daily Quests', icon: 'quests' as const, badge: '2' },
  { khmer: 'សមិទ្ធផល', title: 'Achievements', icon: 'achievements' as const },
  { khmer: 'ណែនាំ', title: 'Guide', icon: 'guide' as const },
];

const bannerTones = {
  green: 'from-[#74DE58] via-[#39AE44] to-[#167337] border-[#E9FFD7]',
  gold: 'from-[#FFE36D] via-[#F6A91C] to-[#C46F0C] border-[#FFF1B4]',
  purple: 'from-[#D7A7FF] via-[#8D5BEE] to-[#5433B7] border-[#F0D8FF]',
  blue: 'from-[#77D6FF] via-[#2389E8] to-[#075BB8] border-[#D2F4FF]',
  red: 'from-[#FF8A7D] via-[#EA3F35] to-[#A81922] border-[#FFD2C8]',
};

type HudPillProps = {
  icon: GameIconName;
  value: string | number;
  label?: string;
  plus?: boolean;
};

function HudPill({ icon, value, label, plus }: HudPillProps) {
  return (
    <button type="button" className="pointer-events-auto flex h-[62px] min-w-[170px] cursor-pointer items-center gap-3 rounded-[24px] border-[3px] border-[#75CCFF]/50 bg-gradient-to-b from-[#174B75] via-[#0D3559] to-[#071F38] px-4 text-white shadow-[inset_0_-6px_0_rgba(0,0,0,.25),inset_0_2px_0_rgba(255,255,255,.16),0_12px_20px_rgba(0,24,54,.34)]">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white/14 shadow-inner">
        <GameIcon name={icon} size={32} />
      </span>
      <span className="min-w-0 text-left leading-tight">
        {label && <span className="block text-[11px] font-black uppercase text-white/72">{label}</span>}
        <span className="block text-[24px] font-black drop-shadow-[0_2px_2px_rgba(0,0,0,.34)]">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      </span>
      {plus && <span className="ml-auto grid h-9 w-9 place-items-center rounded-full border-2 border-white/70 bg-gradient-to-b from-[#A9FF62] to-[#21A64B] text-[25px] font-black shadow-button">+</span>}
    </button>
  );
}

function RoundHudButton({ icon, badge, label }: { icon: ReactNode; badge?: string; label: string }) {
  return (
    <button type="button" aria-label={label} className="pointer-events-auto relative grid h-[64px] w-[64px] cursor-pointer place-items-center rounded-[23px] border-[3px] border-[#77D1FF]/65 bg-gradient-to-b from-[#0C629A] via-[#0A416E] to-[#062540] text-white shadow-[inset_0_-6px_0_rgba(0,0,0,.26),0_12px_18px_rgba(0,24,54,.3)]">
      {badge && <span className="absolute -right-2 -top-3 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#F34E35] text-lg font-black shadow-[0_4px_8px_rgba(0,0,0,.28)]">{badge}</span>}
      {icon}
    </button>
  );
}

function SideMenuCard({ khmer, title, icon, badge }: (typeof sideActions)[number]) {
  return (
    <button type="button" className="pointer-events-auto relative flex h-[112px] w-[112px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-[3px] border-[#75E5DB] bg-gradient-to-b from-[#11A8A5] via-[#087A91] to-[#06456F] px-2 text-center text-white shadow-[0_14px_24px_rgba(0,24,56,.44),inset_0_-7px_0_rgba(0,20,54,.32),inset_0_2px_0_rgba(255,255,255,.28)] transition hover:-translate-y-1">
      {badge && <span className="absolute -right-3 top-2 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#F13C2E] text-base font-black shadow-[0_4px_8px_rgba(0,0,0,.25)]">{badge}</span>}
      <GameIcon name={icon} size={46} className="drop-shadow-[0_3px_3px_rgba(0,0,0,.35)]" />
      <span className="khmer-body mt-1 text-[13px] font-black leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,.45)]">{khmer}</span>
      <span className="text-[11px] font-black leading-tight text-white/92 drop-shadow-[0_2px_2px_rgba(0,0,0,.45)]">{title}</span>
    </button>
  );
}

function CategoryBanner({ title, subtitle, x, y, tone }: (typeof categoryBanners)[number]) {
  return (
    <div
      className={`pointer-events-none absolute z-20 min-w-[166px] rounded-[18px] border-[3px] bg-gradient-to-b px-4 py-2 text-center text-white shadow-[inset_0_-6px_0_rgba(0,0,0,.2),inset_0_2px_0_rgba(255,255,255,.3),0_13px_18px_rgba(0,32,58,.36)] ${bannerTones[tone]}`}
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <span className="block text-[20px] font-black leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,.32)]">{title}</span>
      <span className="block text-[13px] font-black leading-tight text-white/92">{subtitle}</span>
      <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[14px] border-x-transparent border-t-current opacity-75" />
    </div>
  );
}

function WorldSelector({
  worlds,
  activeWorld,
  onSelect,
}: {
  worlds: AdventureWorld[];
  activeWorld: AdventureWorld;
  onSelect: (world: AdventureWorld) => void;
}) {
  return (
    <div className="absolute left-[500px] top-[112px] z-40 flex items-center gap-2 rounded-[24px] border-[3px] border-[#74D6FF]/55 bg-gradient-to-b from-[#103D68] via-[#0C3155] to-[#061D36] p-2 shadow-[0_14px_22px_rgba(0,24,54,.34),inset_0_2px_0_rgba(255,255,255,.14)]">
      {worlds.map((world) => {
        const unlocked = isWorldUnlocked(world.id, worlds);
        const complete = isWorldComplete(world);
        const active = world.id === activeWorld.id;

        return (
          <button
            key={world.id}
            type="button"
            className={`pointer-events-auto relative grid h-[64px] w-[64px] cursor-pointer place-items-center overflow-hidden rounded-[19px] border-[3px] text-[22px] font-black text-white shadow-[inset_0_-5px_0_rgba(0,0,0,.25),0_8px_12px_rgba(0,24,54,.28)] transition ${
              active ? 'border-[#FFE86A] bg-gradient-to-b from-[#43D85A] to-[#177A37]' : unlocked ? 'border-[#83D8FF] bg-gradient-to-b from-[#1989D2] to-[#0A3E74] hover:-translate-y-1' : 'border-[#6E7888] bg-gradient-to-b from-[#6E7888] to-[#3D4654] opacity-80'
            }`}
            onClick={() => {
              if (unlocked) onSelect(world);
            }}
            aria-label={`${world.title}${unlocked ? '' : ' locked'}`}
          >
            <img src={world.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
            <span className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,.5)]">{world.id}</span>
            {!unlocked && <GameIcon name="lock" size={22} className="absolute right-1 top-1 z-10" />}
            {complete && <GameIcon name="star" size={22} className="absolute -right-0.5 -top-0.5 z-10" />}
          </button>
        );
      })}
    </div>
  );
}

function MissionPanel({ selected, world, state }: { selected: AdventureLesson; world: AdventureWorld; state: 'completed' | 'current' | 'unlocked' | 'locked' }) {
  const isBoss = selected.id === 'boss';
  const title = isBoss ? 'បេសកកម្ម Boss' : `កម្រិត ${selected.id}`;
  const progress = selected.id === 'boss' && state !== 'completed' ? 0 : selected.progress;

  return (
    <aside className="absolute right-[28px] top-[118px] z-40 h-[704px] w-[320px] rounded-[30px] border-[5px] border-[#8B5426] bg-gradient-to-b from-[#FFF3C8] via-[#FFFDF4] to-[#E5C586] p-4 text-[#4E3216] shadow-[inset_0_-8px_0_rgba(116,69,28,.16),inset_0_2px_0_rgba(255,255,255,.55),0_24px_40px_rgba(0,29,60,.34)]">
      <div className="text-center">
        <div className="khmer-body text-[28px] font-black leading-tight text-[#604018]">បេសកកម្ម</div>
        <div className="text-[18px] font-black text-[#5A3A17]">បេសកកម្មបច្ចុប្បន្ន</div>
      </div>

      <section className="mt-3 overflow-hidden rounded-[20px] border-[3px] border-[#2B348F] bg-white shadow-[0_12px_18px_rgba(77,53,26,.18)]">
        <div className="flex items-center justify-between bg-gradient-to-r from-[#3547BE] via-[#5F4BE3] to-[#7E53EE] px-4 py-3 text-white shadow-[inset_0_-5px_0_rgba(0,0,0,.16)]">
          <div>
            <div className="text-[22px] font-black leading-tight">{title}</div>
            <div className="text-[14px] font-bold">{selected.labelEn}</div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((star) => <GameIcon key={star} name="star" size={26} />)}
          </div>
        </div>
        <div className="relative h-[132px] bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,.88)_0_6%,transparent_15%),linear-gradient(180deg,#72D5FF_0%,#C9F3FF_52%,#74C96E_53%,#42A95A_100%)]">
          <div className="absolute left-7 top-5 h-12 w-16 rounded-full bg-white/65 blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#43AD59] to-transparent" />
        </div>
        <div className="bg-gradient-to-r from-[#7F54F0] to-[#4F30C5] px-4 py-2 text-center text-white">
          <div className="text-[18px] font-black">{world.title}</div>
        </div>
      </section>

      <section className="mt-3 rounded-[18px] border-2 border-[#D0A763] bg-[#FFF8E3] p-3 shadow-inner">
        <div className="text-[16px] font-black text-[#68421F]">គោលដៅ Objective</div>
        <div className="mt-1 text-[13px] font-extrabold text-[#5C5041]">{selected.objective}</div>
        <div className="mt-3 flex items-center gap-3">
          <GameProgressBar value={progress} max={selected.target} variant={isBoss ? 'gold' : 'green'} className="flex-1" />
          <div className="text-[16px] font-black">{progress}/{selected.target}</div>
        </div>
      </section>

      <section className="mt-3 rounded-[18px] border-2 border-[#D0A763] bg-[#FFF8E3] p-3 shadow-inner">
        <div className="mb-3 text-[16px] font-black text-[#68421F]">រង្វាន់ Rewards</div>
        <div className="grid grid-cols-3 gap-2">
          <GameRewardCard icon="coin" value="200" label="" />
          <GameRewardCard icon="star" value="30" label="" />
          <GameRewardCard icon="gem" value="2" label="" />
        </div>
      </section>

      <section className="mt-3 rounded-[18px] border-2 border-[#C7CDD8] bg-gradient-to-b from-[#F6F7FA] to-[#E7E9EE] p-3">
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <div>
            <div className="text-[13px] font-black text-[#6B7280]">ទ្វារពិភពលោក World Gate</div>
            <div className="text-[16px] font-black text-[#4D5563]">{world.normalCompleted}/8 មេរៀន</div>
            <div className="mt-1 text-[12px] font-bold text-[#7B8492]">បញ្ចប់ 8 Level + Boss ដើម្បីបើកពិភពបន្ទាប់</div>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-[#C7CDD8] bg-white shadow-inner">
            <GameIcon name="lock" size={32} />
          </div>
        </div>
      </section>
    </aside>
  );
}

function WorldProgressPanel({ world }: { world: AdventureWorld }) {
  const progress = getWorldProgress(world);
  const stars = getWorldStars(world);

  return (
    <div className="absolute bottom-[28px] left-[260px] z-30 h-[142px] w-[400px] rounded-[28px] border-[5px] border-[#8B5426] bg-gradient-to-b from-[#FFF3C8] via-[#F5D180] to-[#CD8738] p-4 shadow-[0_18px_28px_rgba(0,30,62,.42),inset_0_2px_0_rgba(255,255,255,.45)]">
      <div className="pointer-events-none absolute -left-3 top-3 h-[116px] w-[52px] rounded-[24px] border-2 border-[#B98A53] bg-gradient-to-b from-[#FFF8DA] to-[#D2A35E] shadow-inner" />
      <div className="relative text-center text-[20px] font-black leading-tight text-[#4A2A10] drop-shadow-[0_1px_0_rgba(255,235,170,.9)]">វឌ្ឍនភាព World {world.id}</div>
      <div className="relative mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <GameIcon name="star" size={50} />
        <GameProgressBar value={progress.cleared} max={progress.total} variant="green" showValue />
        <div className="relative grid h-[62px] w-[62px] place-items-center rounded-[18px] bg-[#6F3E16]/28 shadow-inner">
          <GameIcon name="treasure" size={50} />
          <span className="absolute -bottom-2 -right-2 grid h-8 min-w-8 place-items-center rounded-full border-2 border-white bg-[#2FAF41] px-2 text-xs font-black text-white">{stars}</span>
        </div>
      </div>
    </div>
  );
}

function RewardsPanel({ world }: { world: AdventureWorld }) {
  return (
    <div className="absolute bottom-[28px] left-[700px] z-30 flex h-[142px] w-[460px] items-center gap-5 rounded-[28px] border-[4px] border-[#FFC35B] bg-gradient-to-r from-[#123A8B] via-[#1B277B] to-[#34115F] p-4 text-white shadow-[0_18px_28px_rgba(0,30,62,.44),inset_0_2px_0_rgba(255,255,255,.2)]">
      <GameIcon name="treasure" size={90} />
      <div className="flex-1">
        <div className="text-[19px] font-black leading-tight">{world.title}</div>
        <div className="text-[12px] font-bold text-white/82">{world.id < 6 ? `បញ្ចប់ 8 មេរៀន និង Boss ដើម្បីបើក World ${world.id + 1}។` : 'ឈ្នះ Boss ចុងក្រោយ ដើម្បីបញ្ចប់ Adventure។'}</div>
        <GameButton variant="gold" size="lg" className="mt-3 h-[48px] min-w-[198px] rounded-[22px] text-[17px]">
          រង្វាន់
        </GameButton>
      </div>
    </div>
  );
}

export default function WorldMapPage() {
  const navigate = useNavigate();
  const [activeWorld, setActiveWorld] = useState<AdventureWorld>(adventureWorlds[0]);
  const firstCurrentLesson = activeWorld.lessons.find((lesson) => getLessonState(activeWorld, lesson) === 'current') ?? activeWorld.lessons[0];
  const [selected, setSelected] = useState<AdventureLesson>(firstCurrentLesson);
  const selectedState = getLessonState(activeWorld, selected);

  const selectWorld = (world: AdventureWorld) => {
    setActiveWorld(world);
    setSelected(world.lessons.find((lesson) => getLessonState(world, lesson) === 'current') ?? world.lessons[0]);
  };

  const startSelectedLesson = () => {
    if (selectedState === 'locked') return;
    navigate(selected.id === 'boss' ? '/battle' : '/lesson');
  };

  return (
    <PageTransition>
      <GameScreen background={backgroundImages.worldMap} reference="/src/reference/world-map-reference.png" className="font-sans text-[#1E2F58]">
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_46%_42%,rgba(255,255,255,.08),transparent_36%),linear-gradient(180deg,rgba(0,92,160,.02),rgba(0,39,76,.12))]" />
        <svg className="pointer-events-none absolute inset-0 z-10 opacity-50" viewBox="0 0 1920 1080" aria-hidden="true">
          <path
            d="M425 470 C500 432 545 430 600 405 S712 328 770 300 C825 335 864 394 910 430 C970 450 1025 456 1085 465 C1158 502 1190 560 1235 600 C1285 570 1335 530 1385 500 C1432 532 1474 580 1510 625"
            fill="none"
            stroke="rgba(255,255,255,.62)"
            strokeLinecap="round"
            strokeDasharray="5 24"
            strokeWidth="5"
          />
          <path
            d="M1235 600 C1128 660 1004 700 875 730 M1085 735 C1170 666 1300 530 1435 255"
            fill="none"
            stroke="rgba(255,235,142,.46)"
            strokeLinecap="round"
            strokeDasharray="4 26"
            strokeWidth="4"
          />
        </svg>

        <button
          className="pointer-events-auto absolute left-[28px] top-[30px] z-40 grid h-[76px] w-[76px] cursor-pointer place-items-center rounded-[22px] border-[4px] border-[#7C451F] bg-gradient-to-b from-[#FFE0A2] to-[#B96B28] text-white shadow-button"
          onClick={() => navigate('/')}
          aria-label="Back"
        >
          <ArrowLeft size={42} />
        </button>

        <div className="pointer-events-none absolute left-[160px] top-[22px] z-40 h-[202px] w-[310px]">
          <img src={imageAssets.logo} alt="Khmer Typing Adventure" className="h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,25,73,.32)]" />
        </div>

        <div className="pointer-events-none absolute left-[30px] top-[184px] z-30 w-[226px]">
          <LizardMascot className="w-[226px] max-w-none drop-shadow-[0_18px_18px_rgba(0,37,58,.32)]" withTiles={false} animated={false} />
        </div>

        <div className="absolute left-[35px] top-[438px] z-30 flex w-[112px] flex-col gap-3">
          {sideActions.map((item) => <SideMenuCard key={item.title} {...item} />)}
        </div>

        <div className="absolute left-[650px] top-[30px] z-40 flex items-center gap-5">
          <HudPill icon="heart" value={`${resources.hearts}/${resources.maxHearts}`} label="Full" />
          <HudPill icon="coin" value={resources.coins} plus />
          <HudPill icon="gem" value={resources.gems} plus />
        </div>

        <div className="absolute right-[34px] top-[30px] z-40 flex items-center gap-4">
          <RoundHudButton icon={<Mail size={31} />} badge="3" label="Mail" />
          <RoundHudButton icon={<Trophy size={31} />} label="Trophy" />
          <RoundHudButton icon={<Settings size={31} />} label="Settings" />
        </div>

        <WorldSelector worlds={adventureWorlds} activeWorld={activeWorld} onSelect={selectWorld} />

        <div className="pointer-events-none absolute left-[500px] top-[198px] z-30 w-[360px] rounded-[24px] border-[3px] border-[#FFE8A4]/80 bg-gradient-to-b from-[#FFF1BC] via-[#F3C46E] to-[#B97828] px-5 py-3 text-[#4A2A10] shadow-[0_14px_20px_rgba(0,24,54,.28),inset_0_2px_0_rgba(255,255,255,.45)]">
          <div className="khmer-body text-[22px] font-black leading-tight">{activeWorld.titleKh}</div>
          <div className="text-[22px] font-black leading-tight">ពិភព {activeWorld.id}: {activeWorld.title}</div>
          <div className="text-[12px] font-extrabold">{activeWorld.subtitle}</div>
        </div>

        {categoryBanners.map((label) => <CategoryBanner key={label.key} {...label} />)}

        {mapNodeLayout.map((node) => {
          const lesson = activeWorld.lessons.find((item) => item.id === node.id);
          if (!lesson) return null;
          const state = getLessonState(activeWorld, lesson);

          return (
            <GameMapNode
              key={node.id}
              level={node.id === 'boss' ? '!' : node.id}
              state={state}
              color={state === 'locked' && node.id !== 'boss' ? 'gray' : lesson.color}
              stars={lesson.stars}
              label={lesson.labelKh}
              subtitle={lesson.labelEn}
              selected={node.id === selected.id}
              className="z-20 scale-[.9]"
              style={{ left: node.x, top: node.y }}
              onClick={() => {
                setSelected(lesson);
              }}
            />
          );
        })}

        <MissionPanel selected={selected} world={activeWorld} state={selectedState} />
        <WorldProgressPanel world={activeWorld} />
        <RewardsPanel world={activeWorld} />

        <div className="absolute bottom-[30px] right-[28px] z-40">
          <GameButton variant={selected.id === 'boss' ? 'red' : 'green'} size="xl" rightIcon={<ArrowLeft className="rotate-180" size={38} />} className="h-[94px] min-w-[324px] rounded-[32px] border-[5px] text-[27px] shadow-[inset_0_-10px_0_rgba(0,0,0,.22),0_18px_28px_rgba(0,45,37,.36)] disabled:cursor-not-allowed disabled:grayscale" onClick={startSelectedLesson} disabled={selectedState === 'locked'}>
            {selectedState === 'locked' ? 'ជាប់សោ' : selected.id === 'boss' ? 'ចាប់ផ្តើម Boss' : `ចាប់ផ្តើម Level ${selected.id}`}
          </GameButton>
        </div>
      </GameScreen>
    </PageTransition>
  );
}
