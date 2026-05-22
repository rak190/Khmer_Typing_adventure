import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Settings, Trophy } from 'lucide-react';
import GameButton from '../components/game-ui/GameButton';
import GameIcon, { type GameIconName } from '../components/game-ui/GameIcon';
import GameProgressBar from '../components/game-ui/GameProgressBar';
import GameScreen from '../components/layout/GameScreen';
import PageTransition from '../components/layout/PageTransition';
import GameMapNode from '../components/game-ui/GameMapNode';
import { backgroundImages, imageAssets } from '../assets/assetManifest';
import {
  adventureWorlds,
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

const templeJungleCardImage = 'https://cdn.pixabay.com/photo/2016/01/30/22/31/cambodia-1170693_1280.jpg';

type HudPillProps = {
  icon: GameIconName;
  value: string | number;
  label?: string;
  plus?: boolean;
};

function HudPill({ icon, value, label, plus }: HudPillProps) {
  return (
    <button type="button" className="pointer-events-auto flex h-[66px] min-w-[168px] cursor-pointer items-center gap-3 rounded-[22px] border-[3px] border-[#F7B94F] bg-gradient-to-b from-[#245D74] via-[#123E57] to-[#3B2412] px-3 text-white shadow-[inset_0_3px_0_rgba(255,242,181,.28),inset_0_-8px_0_rgba(49,24,7,.5),0_6px_0_rgba(82,50,22,.55),0_18px_24px_rgba(0,23,45,.42)]">
      <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#F9D77B]/70 bg-gradient-to-b from-[#2AA69B] to-[#0D5A6B] shadow-[inset_0_2px_0_rgba(255,255,255,.3),inset_0_-4px_0_rgba(0,0,0,.24)]">
        <GameIcon name={icon} size={27} />
      </span>
      <span className="min-w-0 text-left leading-tight">
        {label && <span className="block text-[10px] font-bold uppercase text-white/72">{label}</span>}
        <span className="block text-[24px] font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,.34)]">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      </span>
      {plus && <span className="ml-auto grid h-9 w-9 place-items-center rounded-full border-2 border-[#FFF0A9] bg-gradient-to-b from-[#B9FF62] via-[#4EC94C] to-[#16733B] text-[24px] font-bold shadow-[inset_0_2px_0_rgba(255,255,255,.45),inset_0_-4px_0_rgba(0,0,0,.22),0_4px_0_rgba(65,45,11,.45)]">+</span>}
    </button>
  );
}

function RoundHudButton({ icon, badge, label }: { icon: ReactNode; badge?: string; label: string }) {
  return (
    <button type="button" aria-label={label} className="pointer-events-auto relative grid h-[60px] w-[60px] cursor-pointer place-items-center rounded-[22px] border-[3px] border-[#F7B94F] bg-gradient-to-b from-[#217A92] via-[#0E4962] to-[#35200F] text-white shadow-[inset_0_3px_0_rgba(255,244,188,.28),inset_0_-8px_0_rgba(40,19,7,.46),0_5px_0_rgba(88,56,22,.55),0_14px_18px_rgba(0,24,54,.38)]">
      {badge && <span className="absolute -right-2 -top-3 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#F34E35] text-base font-bold shadow-[0_4px_8px_rgba(0,0,0,.28)]">{badge}</span>}
      {icon}
    </button>
  );
}

function SideMenuCard({ khmer, title, icon, badge }: (typeof sideActions)[number]) {
  return (
    <button type="button" className="pointer-events-auto relative flex h-[124px] w-[108px] cursor-pointer flex-col items-center justify-center rounded-[21px] border-[2px] border-[#8FEFFF] bg-gradient-to-b from-[#1FA9A6] via-[#0E8D95] to-[#086373] px-2 pt-3 pb-2 text-center text-white shadow-[inset_0_2px_0_rgba(255,255,255,.28),inset_0_-7px_0_rgba(0,57,73,.42),0_0_0_1px_rgba(11,104,177,.82),0_3px_0_rgba(5,80,95,.72),0_10px_18px_rgba(0,24,56,.34)] transition hover:-translate-y-1">
      <span className="pointer-events-none absolute inset-[3px] rounded-[16px] border-[2px] border-[#126DB7]/80" />
      {badge && <span className="absolute -right-3 top-[22px] grid h-8 w-8 place-items-center rounded-full border-[2px] border-white bg-[#F0443E] text-base font-bold leading-none shadow-[0_3px_7px_rgba(0,0,0,.26)]">{badge}</span>}
      <span className="relative grid h-[50px] w-[50px] place-items-center text-white">
        <GameIcon name={icon} size={46} className="drop-shadow-[0_2px_1px_rgba(0,73,88,.48)]" />
      </span>
      <span className="relative mt-1 block min-w-0 leading-none">
        <span className="khmer-body block text-[13px] font-bold leading-[1.15] drop-shadow-[0_2px_1px_rgba(0,58,68,.7)]">{khmer}</span>
        <span className="mt-0.5 block text-[11px] font-bold leading-[1.05] text-white drop-shadow-[0_2px_1px_rgba(0,58,68,.72)]">{title}</span>
      </span>
    </button>
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
    <div className="absolute left-[915px] top-[94px] z-40 flex -translate-x-1/2 items-center gap-5">
      {worlds.map((world) => {
        const unlocked = isWorldUnlocked(world.id, worlds);
        const complete = isWorldComplete(world);
        const active = world.id === activeWorld.id;

        return (
          <button
            key={world.id}
            type="button"
            className={`pointer-events-auto relative grid h-[142px] w-[132px] cursor-pointer place-items-center text-[18px] font-bold text-white transition ${
              active ? 'scale-110 drop-shadow-[0_0_24px_rgba(255,239,111,.95)]' : unlocked ? 'drop-shadow-[0_18px_16px_rgba(0,28,50,.42)] hover:-translate-y-1 hover:scale-105' : 'cursor-not-allowed drop-shadow-[0_20px_15px_rgba(0,0,0,.65)]'
            }`}
            onClick={() => {
              if (unlocked) onSelect(world);
            }}
            aria-label={`${world.title}${unlocked ? '' : ' locked'}`}
          >
            <span className="absolute bottom-4 left-1/2 h-8 w-[108px] -translate-x-1/2 rounded-full bg-black/38 blur-[10px]" />
            {active && <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,246,143,.6),rgba(255,199,52,.24)_34%,transparent_68%)] blur-[12px]" />}
            <img src={world.image} alt="" className={`relative z-10 h-[124px] w-[128px] object-contain ${active ? 'saturate-150 brightness-125 drop-shadow-[0_0_20px_rgba(255,234,85,.95)] drop-shadow-[0_13px_12px_rgba(0,32,48,.42)]' : unlocked && complete ? 'grayscale-[.28] saturate-[.7] brightness-95 opacity-90 drop-shadow-[0_13px_12px_rgba(0,32,48,.4)]' : unlocked ? 'saturate-125 brightness-110 drop-shadow-[0_13px_12px_rgba(0,32,48,.42)]' : 'opacity-52 grayscale brightness-[.42] contrast-125 drop-shadow-[0_13px_12px_rgba(0,0,0,.68)]'}`} />
            {!unlocked && <span className="absolute inset-x-2 top-4 z-10 h-[110px] rounded-full bg-black/36 blur-[1px]" />}
            {!unlocked && <GameIcon name="lock" size={40} className="absolute z-20 text-[#E8E2D0] drop-shadow-[0_3px_4px_rgba(0,0,0,.85)]" />}
            <span className={`absolute left-1/2 top-[80px] z-20 -translate-x-1/2 text-[27px] font-bold drop-shadow-[0_3px_2px_rgba(0,0,0,.7)] ${unlocked ? '' : 'opacity-38'}`}>{world.id}</span>
            <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 gap-0.5 rounded-full bg-black/28 px-1.5 py-0.5">
              {[1, 2, 3].map((star) => <GameIcon key={star} name="star" size={15} className={complete || active ? '' : 'grayscale opacity-35'} />)}
            </div>
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
  const stateLabel = state === 'completed' ? 'Complete' : state === 'locked' ? 'Locked' : state === 'current' ? 'Current' : 'Ready';

  return (
    <aside className="absolute right-[22px] top-[252px] z-40 w-[340px] text-white">
      <div className="relative min-h-[548px] overflow-hidden rounded-[30px] border-[4px] border-[#F1C45C] bg-gradient-to-b from-[#124E67] via-[#0B7277] to-[#173D37] p-4 shadow-[inset_0_4px_0_rgba(255,255,255,.2),inset_0_-12px_0_rgba(3,47,42,.32),0_8px_0_rgba(98,62,22,.55),0_24px_34px_rgba(0,29,60,.4)]">
        <div className="pointer-events-none absolute inset-x-4 top-4 h-12 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between gap-3 px-2 pb-3">
          <div className="min-w-0">
            <div className="text-[18px] font-bold uppercase leading-tight drop-shadow-[0_2px_1px_rgba(0,55,62,.7)]">Current Mission</div>
            <div className="khmer-body -mt-0.5 truncate text-[12px] font-normal text-[#D7FFF5]">{world.titleKh}</div>
          </div>
          <div className="shrink-0 rounded-full border border-[#BFFFE6]/50 bg-[#083F4A]/62 px-3 py-1 text-[11px] font-bold uppercase text-[#CBFFE3] shadow-inner">{stateLabel}</div>
        </div>

        <section
          className="relative overflow-hidden rounded-[22px] border-[3px] border-[#75E3FF]/70 bg-[#2FB6D7] shadow-[inset_0_3px_0_rgba(255,255,255,.35),0_9px_14px_rgba(0,37,62,.24)]"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(22, 159, 193, .12), rgba(12, 96, 83, .22)), url(${backgroundImages.lesson})`,
            backgroundPosition: 'center center',
            backgroundSize: '100% 100%',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,.55)_0_5%,transparent_16%),linear-gradient(180deg,rgba(26,177,221,.12)_0%,rgba(8,90,82,.34)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0D7151]/78 to-transparent" />
          <img src={world.image} alt="" className="absolute bottom-2 right-2 h-[136px] w-[148px] object-contain drop-shadow-[0_10px_10px_rgba(0,52,42,.35)]" />
          <div className="relative min-h-[178px] px-4 py-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/55 bg-black/22 px-2.5 py-1 text-[12px] font-bold text-white shadow-[0_2px_6px_rgba(0,0,0,.12)]">
              {[1, 2, 3].map((star) => <GameIcon key={star} name="star" size={15} />)}
            </div>
            <div className="mt-8 max-w-[180px]">
              <div className="khmer-body text-[24px] font-bold leading-tight text-white drop-shadow-[0_3px_2px_rgba(0,52,70,.55)]">{title}</div>
              <div className="mt-1 text-[13px] font-bold leading-tight text-white/92 drop-shadow-[0_2px_1px_rgba(0,52,70,.45)]">{selected.labelEn}</div>
            </div>
          </div>
          <div className="relative flex h-[34px] items-center justify-center bg-gradient-to-r from-[#6737C8] via-[#7646E8] to-[#3C2DA6] px-3 text-center text-[14px] font-bold text-white">
            <span className="truncate">{world.title}</span>
          </div>
        </section>

        <section className="relative mt-4 rounded-[20px] border-[2px] border-[#EBC06A] bg-gradient-to-b from-[#FFF8DB] to-[#E9C67B] p-4 text-[#4E3216] shadow-[inset_0_2px_0_rgba(255,255,255,.6),inset_0_-5px_0_rgba(116,69,28,.12)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="khmer-body text-[16px] font-bold leading-tight">គោលដៅ Objective</div>
              <div className="khmer-body mt-1 line-clamp-3 text-[13px] font-normal leading-snug text-[#4E4234]">{selected.objective}</div>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-[#F6D080]/70 bg-white/55 shadow-inner">
              <GameIcon name={isBoss ? 'swords' : 'book'} size={30} className={isBoss ? 'text-[#D83636]' : 'text-[#24639B]'} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <GameProgressBar value={progress} max={selected.target} variant={isBoss ? 'gold' : 'green'} className="flex-1" />
            <div className="w-14 text-right text-[14px] font-bold text-[#4A2D12]">{progress}/{selected.target}</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {selected.focusKeys.slice(0, 10).map((key) => (
              <span key={key} className="khmer-body grid h-[26px] min-w-[26px] place-items-center rounded-full border border-[#C99A55] bg-white/80 px-2 text-[13px] font-normal leading-none text-[#5A3518] shadow-[inset_0_1px_0_rgba(255,255,255,.72)]">
                {key}
              </span>
            ))}
          </div>
        </section>

        <section className="relative mt-4 rounded-[20px] border-[2px] border-[#F7D080]/70 bg-[#FFF7D2] p-3 text-[#563414] shadow-[inset_0_2px_0_rgba(255,255,255,.7),inset_0_-5px_0_rgba(126,79,26,.12)]">
          <div className="khmer-body mb-2 text-[14px] font-bold">រង្វាន់ Rewards</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: 'coin' as const, value: '200' },
              { icon: 'star' as const, value: '30' },
              { icon: 'gem' as const, value: '2' },
            ].map((reward) => (
              <div key={reward.icon} className="grid h-[64px] place-items-center rounded-[16px] border border-[#E5B35F]/45 bg-white/45 py-1 text-center shadow-inner">
                <GameIcon name={reward.icon} size={30} />
                <span className="text-[13px] font-bold">{reward.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

function WorldProgressPanel({ world }: { world: AdventureWorld }) {
  const progress = getWorldProgress(world);
  const stars = getWorldStars(world);

  return (
    <div className="absolute bottom-[28px] left-[456px] z-30 h-[142px] w-[386px] overflow-hidden rounded-[26px] border-[4px] border-[#8A5B2A] bg-gradient-to-b from-[#FFF5CF] via-[#E6B55D] to-[#8C5325] p-4 shadow-[inset_0_4px_0_rgba(255,255,255,.42),inset_0_-10px_0_rgba(72,37,13,.28),0_7px_0_rgba(93,55,20,.52),0_20px_26px_rgba(0,30,62,.4)]">
      <div className="pointer-events-none absolute inset-x-3 top-3 h-[46px] rounded-[22px] bg-white/14" />
      <div className="relative grid h-full grid-cols-[62px_1fr_54px] items-center gap-3">
        <div className="grid h-[62px] w-[62px] place-items-center rounded-[20px] border-2 border-[#F7CE72] bg-gradient-to-b from-[#FFF8DA] via-[#E4B352] to-[#9B6024] shadow-[inset_0_3px_0_rgba(255,255,255,.55),inset_0_-6px_0_rgba(86,45,15,.22),0_5px_0_rgba(93,53,19,.34)]">
          <GameIcon name="star" size={43} />
        </div>

        <div className="min-w-0 self-center">
          <div className="flex items-center justify-between gap-3">
            <div className="khmer-body truncate text-[16px] font-bold leading-tight text-[#4A2A10] drop-shadow-[0_1px_0_rgba(255,235,170,.9)]">វឌ្ឍនភាព World {world.id}</div>
            <div className="shrink-0 rounded-full border border-[#C7832F]/45 bg-[#FFF7D6] px-2.5 py-0.5 text-[12px] font-bold text-[#4A2A10] shadow-inner">{progress.cleared}/{progress.total}</div>
          </div>
          <GameProgressBar value={progress.cleared} max={progress.total} variant="green" className="mt-2.5" />
        </div>

        <div className="relative grid h-[54px] w-[54px] place-items-center rounded-[17px] border border-[#F6D080]/40 bg-gradient-to-b from-[#8F5F2B]/40 to-[#4A2C13]/35 shadow-[inset_0_2px_0_rgba(255,255,255,.2),inset_0_-5px_0_rgba(0,0,0,.16)]">
          <GameIcon name="treasure" size={41} />
          <span className="absolute -right-1 -top-2 grid h-7 min-w-7 place-items-center rounded-full border-2 border-white bg-[#2FAF41] px-2 text-[11px] font-bold text-white">{stars}</span>
        </div>
      </div>
    </div>
  );
}

function RewardsPanel({ world }: { world: AdventureWorld }) {
  return (
    <div
      className="absolute bottom-[28px] left-[1006px] z-30 flex h-[142px] w-[386px] items-center gap-3.5 overflow-hidden rounded-[26px] border-[4px] border-[#E0A543] bg-[#17165D] p-4 text-white shadow-[inset_0_4px_0_rgba(255,245,187,.22),inset_0_-10px_0_rgba(25,11,58,.36),0_7px_0_rgba(80,48,20,.5),0_20px_26px_rgba(0,30,62,.42)]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(18, 29, 108, .96) 0%, rgba(27, 39, 123, .88) 48%, rgba(44, 16, 96, .86) 100%), url(${templeJungleCardImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 54%',
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(255,255,255,.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,.08),transparent_42%)]" />
      <div className="relative grid h-[64px] w-[64px] shrink-0 place-items-center rounded-[20px] border border-[#FFE0A0]/35 bg-gradient-to-b from-white/18 to-black/18 shadow-[inset_0_3px_0_rgba(255,255,255,.22),inset_0_-5px_0_rgba(0,0,0,.2),0_5px_0_rgba(24,12,50,.3)]">
        <GameIcon name="treasure" size={52} />
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="truncate text-[16px] font-bold leading-tight">{world.title}</div>
        <div className="line-clamp-2 text-[11px] font-bold leading-snug text-white/86">{world.id < 6 ? `បញ្ចប់ 8 មេរៀន និង Boss ដើម្បីបើក World ${world.id + 1}។` : 'ឈ្នះ Boss ចុងក្រោយ ដើម្បីបញ្ចប់ Adventure។'}</div>
        <GameButton variant="gold" size="lg" className="mt-2 h-[36px] min-w-[148px] rounded-[18px] text-[13px]">
          View Rewards
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
    const query = `world=${activeWorld.id}&level=${selected.id}`;
    navigate(selected.id === 'boss' ? `/battle?${query}` : `/lesson?${query}`);
  };

  return (
    <PageTransition>
      <GameScreen background={backgroundImages.worldMap} reference="/src/reference/world-map-reference.png" fit="stretch" className="font-sans text-[#1E2F58]" style={{ backgroundSize: '100% 100%' }}>
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_46%_42%,rgba(255,255,255,.08),transparent_36%),linear-gradient(180deg,rgba(0,92,160,.02),rgba(0,39,76,.12))]" />
        <svg className="pointer-events-none absolute inset-0 z-10 opacity-50" viewBox="0 0 1920 1080" aria-hidden="true">
          <path
            d="M462 736 C444 686 438 620 448 558 C470 500 496 414 532 358 C628 394 732 430 846 456 C924 464 1012 472 1084 486 C1088 574 1110 650 1146 711 C1246 706 1366 704 1466 700 C1510 620 1556 548 1584 545 C1534 492 1486 440 1460 392 C1488 316 1530 246 1570 190"
            fill="none"
            stroke="rgba(255,255,255,.62)"
            strokeLinecap="round"
            strokeDasharray="5 24"
            strokeWidth="5"
          />
          <path
            d="M462 736 C570 650 720 546 846 456 M1146 711 C1264 612 1370 502 1460 392"
            fill="none"
            stroke="rgba(255,235,142,.46)"
            strokeLinecap="round"
            strokeDasharray="4 26"
            strokeWidth="4"
          />
        </svg>

        <button
          className="pointer-events-auto absolute left-[62px] top-[26px] z-40 grid h-[58px] w-[58px] cursor-pointer place-items-center rounded-[20px] border-[3px] border-[#7C451F] bg-gradient-to-b from-[#FFE7A8] via-[#D99230] to-[#7A3E18] text-white shadow-[inset_0_3px_0_rgba(255,255,255,.45),inset_0_-7px_0_rgba(75,35,10,.35),0_5px_0_rgba(93,52,17,.55),0_12px_18px_rgba(0,29,60,.35)]"
          onClick={() => navigate('/')}
          aria-label="Back"
        >
          <ArrowLeft size={34} />
        </button>

        <div className="pointer-events-none absolute left-[132px] top-[12px] z-40 h-[178px] w-[292px]">
          <img src={imageAssets.logo} alt="Khmer Typing Adventure" className="h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,25,73,.32)]" />
        </div>

        <div className="absolute left-[72px] top-[338px] z-30 flex w-[108px] flex-col items-center gap-10">
          {sideActions.map((item) => <SideMenuCard key={item.title} {...item} />)}
        </div>

        <div className="absolute left-1/2 top-[24px] z-40 flex -translate-x-1/2 items-center gap-8">
          <HudPill icon="heart" value={`${resources.hearts}/${resources.maxHearts}`} label="Full" />
          <HudPill icon="coin" value={resources.coins} plus />
          <HudPill icon="gem" value={resources.gems} plus />
        </div>

        <div className="absolute right-[62px] top-[24px] z-40 flex items-center gap-3">
          <RoundHudButton icon={<Mail size={31} />} badge="3" label="Mail" />
          <RoundHudButton icon={<Trophy size={31} />} label="Trophy" />
          <RoundHudButton icon={<Settings size={31} />} label="Settings" />
        </div>

        <WorldSelector worlds={adventureWorlds} activeWorld={activeWorld} onSelect={selectWorld} />

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
              selected={node.id === selected.id}
              className="z-20 scale-[.82]"
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

        <div className="absolute bottom-[46px] right-[48px] z-40">
          <button
            type="button"
            className="pointer-events-auto relative h-[82px] w-[320px] cursor-pointer overflow-hidden rounded-[32px] border-[4px] border-[#0C8B39] bg-gradient-to-b from-[#7CFF61] via-[#33D94F] to-[#15A947] px-7 text-[26px] font-bold text-white shadow-[inset_0_-11px_0_rgba(0,91,50,.34),0_6px_0_rgba(0,103,60,.72),0_16px_22px_rgba(0,43,74,.36)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:grayscale"
            onClick={startSelectedLesson}
            disabled={selectedState === 'locked'}
          >
            <span className="pointer-events-none absolute left-[14px] right-[14px] top-[7px] h-[27px] rounded-full bg-white/42" />
            <span className="relative flex items-center justify-center gap-3 drop-shadow-[0_2px_1px_rgba(0,101,45,.55)]">
              <span className="khmer-body text-[25px] font-bold leading-none">{selectedState === 'locked' ? 'ជាប់សោ' : selected.id === 'boss' ? 'ចាប់ផ្តើម Boss' : 'ចាប់ផ្តើម'}</span>
              <span className="text-[25px] leading-none">{selectedState === 'locked' ? 'Locked' : selected.id === 'boss' ? '' : `Level ${selected.id}`}</span>
              {selectedState !== 'locked' && <ArrowLeft className="rotate-180" size={34} strokeWidth={3.2} />}
            </span>
          </button>
        </div>
      </GameScreen>
    </PageTransition>
  );
}

