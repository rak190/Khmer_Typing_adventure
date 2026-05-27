import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ChevronDown,
  Gamepad2,
  GraduationCap,
  Home,
  Keyboard,
  Map,
  Play,
  Shield,
  Swords,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import LizardMascot from '../components/characters/LizardMascot';
import ActionModal from '../components/game-ui/ActionModal';
import { AchievementsPanel, TreasurePanel } from '../components/game-ui/FeaturePanels';
import GameBadge from '../components/game-ui/GameBadge';
import GameButton from '../components/game-ui/GameButton';
import GameHudCounter from '../components/game-ui/GameHudCounter';
import GameIcon from '../components/game-ui/GameIcon';
import GameLevelBadge from '../components/game-ui/GameLevelBadge';
import AccountMenu from '../components/layout/AccountMenu';
import GameScreen from '../components/layout/GameScreen';
import PageTransition from '../components/layout/PageTransition';
import { backgroundImages, imageAssets, mapImages } from '../assets/assetManifest';
import { achievements } from '../data/mockData';
import { claimEconomyReward, getActiveEconomyUserId, purchaseShopItem, shopItems } from '../lib/economy';
import { useEconomyState, useInventoryState } from '../lib/useEconomyState';
import { loadStudentProgress } from '../lib/studentProgress';
import {
  buildAchievementProgress,
  buildTreasureRewards,
  claimTreasureReward,
  saveAchievementSnapshot,
} from '../lib/playerFeatures';

const navItems = [
  { label: 'ទំព័រដើម', to: '/', icon: Home, active: true },
  { label: 'មេរៀន', to: '/lesson', icon: BookOpen, chevron: true },
  { label: 'Mini-Games', to: '/battle', icon: Gamepad2 },
  { label: 'Boss Battles', to: '/battle', icon: Swords },
  { label: 'តារាងពិន្ទុ', to: '/dashboard', icon: Trophy },
  { label: 'សម្រាប់គ្រូ', to: '/dashboard', icon: Users },
];

const loveItems = [
  { title: 'មេរៀនខ្មែរ', subtitle: 'រៀនអក្សរ ពាក្យ និងប្រយោគជាជំហានៗ', icon: BookOpen, tone: 'from-[#72B7FF] to-[#2F72FF]', titleColor: 'text-[#146FE1]' },
  { title: 'Mini-Games', subtitle: 'លេងល្បែង Typing ដើម្បីបង្កើនជំនាញ', icon: Gamepad2, tone: 'from-[#B486FF] to-[#784BEB]', titleColor: 'text-[#7A4CEB]' },
  { title: 'Boss Battles', subtitle: 'ឈ្នះ Boss ដោយប្រើកម្លាំង Typing', icon: Swords, tone: 'from-[#FF8C89] to-[#EA3D42]', titleColor: 'text-[#EE3E44]' },
  { title: 'រង្វាន់', subtitle: 'រកកាក់ Badge និងបើករង្វាន់ថ្មីៗ', icon: Trophy, tone: 'from-[#FFD968] to-[#F19B18]', titleColor: 'text-[#E9870C]' },
  { title: 'សម្រាប់គ្រូ', subtitle: 'តាមដានវឌ្ឍនភាព និងគាំទ្រសិស្ស', icon: Users, tone: 'from-[#7CE06E] to-[#28A94D]', titleColor: 'text-[#22A64D]' },
];

const pathStages = [
  { level: 1, khmer: 'គន្លឹះ ១', english: 'Consonants', tone: 'green', locked: false, image: mapImages.world1 },
  { level: 2, khmer: 'ស្រៈ', english: 'Vowels', tone: 'green', locked: false, image: mapImages.world2 },
  { level: 3, khmer: 'ពាក្យ ងាយ', english: 'Simple Words', tone: 'green', locked: false, image: mapImages.world3 },
  { level: 4, khmer: 'ប្រយោគ', english: 'Sentences', tone: 'gold', locked: false, image: mapImages.world4 },
  { level: 5, khmer: 'មេប្រយុទ្ធ', english: 'Boss Challenge', tone: 'purple', locked: false, image: mapImages.world5 },
  { level: 6, khmer: '', english: 'Coming Soon', tone: 'gray', locked: true, image: mapImages.world6 },
];

const badgeVariants = ['newbie', 'rising-star', 'skilled', 'boss-slayer', 'legend'] as const;
const stageKhmerLabels = ['ព្យញ្ជនៈ', 'ស្រៈ', 'ពាក្យងាយ', 'ប្រយោគ', 'មេប្រយុទ្ធ', ''];

function TopNav({ onOpenModal }: { onOpenModal: (modal: HomeModal) => void }) {
  const economy = useEconomyState();

  return (
    <header className="absolute left-0 top-0 z-40 h-[92px] w-full rounded-b-[18px] bg-gradient-to-b from-[#075ED0] via-[#004AAE] to-[#003382] shadow-[0_9px_22px_rgba(0,35,105,.32)]">
      <Link to="/" className="pointer-events-auto absolute left-[46px] top-[-10px] h-[166px] w-[250px] cursor-pointer">
        <img src={imageAssets.logo} alt="Khmer Typing Adventure" className="h-full w-full object-contain drop-shadow-[0_10px_12px_rgba(0,22,76,.34)]" />
      </Link>

      <nav className="absolute left-[300px] right-[520px] top-[17px] flex h-[58px] items-center justify-center gap-[14px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`pointer-events-auto flex h-[56px] min-w-0 cursor-pointer items-center gap-2.5 rounded-[22px] px-5 text-[15px] font-black text-white transition hover:-translate-y-0.5 ${
                item.active ? 'bg-gradient-to-b from-[#6DB3FF] to-[#2E70FF] shadow-[inset_0_-5px_0_rgba(9,45,145,.35),0_8px_14px_rgba(0,34,93,.24)]' : 'hover:bg-white/10'
              }`}
            >
              <Icon className="shrink-0" size={23} />
              <span className="whitespace-nowrap">{item.label}</span>
              {item.chevron && <ChevronDown className="shrink-0" size={17} />}
            </Link>
          );
        })}
      </nav>

      <div className="absolute right-[30px] top-[18px] flex items-center gap-3">
        <GameHudCounter type="coins" value={economy.coins} showPlus onAdd={() => onOpenModal('coins')} className="h-[56px] min-h-0 min-w-[132px] rounded-[23px] px-3 py-2 text-[15px]" />
        <GameHudCounter type="hearts" value={`${economy.hearts}/${economy.maxHearts}`} label="Full" className="h-[56px] min-h-0 min-w-[126px] rounded-[23px] px-3 py-2 text-[15px]" />
        <AccountMenu variant="home" />
      </div>
    </header>
  );
}

function IslandStage({ stage, index }: { stage: (typeof pathStages)[number]; index: number }) {
  const nodeColor =
    stage.tone === 'green'
      ? 'from-[#B8FF66] via-[#5DDD4F] to-[#229B3F] border-[#197936]'
      : stage.tone === 'gold'
        ? 'from-[#FFE278] via-[#FFBB3D] to-[#EE8315] border-[#B16100]'
        : stage.tone === 'purple'
          ? 'from-[#DDB8FF] via-[#9B63FF] to-[#683FDC] border-[#5731B7]'
          : 'from-[#DDE3EA] via-[#9DA8B4] to-[#616B78] border-[#56606C]';

  return (
    <div className="relative flex h-[248px] w-[204px] flex-col items-center">
      <div className="relative h-[176px] w-[214px]">
        <img
          src={stage.image}
          alt={`${stage.english} world`}
          draggable={false}
          className={`pointer-events-none h-full w-full object-contain drop-shadow-[0_16px_14px_rgba(28,78,72,.23)] ${stage.locked ? 'grayscale brightness-75' : ''}`}
        />
      </div>
      <div className={`relative -mt-14 grid h-[70px] w-[70px] place-items-center rounded-full border-[5px] bg-gradient-to-b text-[32px] font-black text-white shadow-button ${nodeColor}`}>
        {stage.locked ? <GameIcon name="lock" size={31} /> : stage.level}
      </div>
      <div className={`khmer-body mt-1 text-center text-[18px] font-black leading-tight ${index === 3 ? 'text-[#F07816]' : index === 4 ? 'text-[#D7263D]' : 'text-[#28A34A]'}`}>
        {stageKhmerLabels[index] || stage.khmer}
      </div>
      <div className="text-center text-[14px] font-black leading-tight text-[#15325D]">{stage.english}</div>
    </div>
  );
}

type HomeModal = 'coins' | 'badges' | null;

export default function HomePage() {
  const [modal, setModal] = useState<HomeModal>(null);
  const [studentProgress] = useState(() => loadStudentProgress());
  const [, setFeatureRevision] = useState(0);
  const [featureMessage, setFeatureMessage] = useState('');
  const [purchasingItemId, setPurchasingItemId] = useState<string | undefined>();
  const economy = useEconomyState();
  const inventory = useInventoryState();
  const treasureRewards = buildTreasureRewards(studentProgress);
  const achievementProgress = buildAchievementProgress(studentProgress);
  const earnedStars = studentProgress.lessonResults.reduce((total, result) => total + result.stars, 0);
  const wallet = {
    coins: economy.coins,
    gems: economy.gems,
    XP: economy.typingXP,
    stars: earnedStars,
    hearts: economy.hearts,
    maxHearts: economy.maxHearts,
  };

  useEffect(() => {
    if (modal === 'badges') saveAchievementSnapshot(studentProgress);
  }, [modal, studentProgress]);

  const handleTreasureClaim = async (rewardId: string) => {
    const reward = treasureRewards.find((item) => item.id === rewardId);
    if (!reward || reward.status === 'claimed') {
      setFeatureMessage('Already claimed.');
      return;
    }
    if (reward.status !== 'claimable') return;

    try {
      const userId = getActiveEconomyUserId();
      if (userId) await claimEconomyReward(userId, reward.id, reward.reward, 'treasure');
      claimTreasureReward(rewardId);
      setFeatureMessage('Reward claimed!');
      setFeatureRevision((revision) => revision + 1);
    } catch (error) {
      setFeatureMessage(error instanceof Error ? error.message : 'Saved locally. Sync will retry.');
    }
  };

  const handlePurchase = async (itemId: string) => {
    const userId = getActiveEconomyUserId();
    if (!userId) {
      setFeatureMessage('Saved locally. Sync will retry.');
      return;
    }
    setPurchasingItemId(itemId);
    try {
      await purchaseShopItem(userId, itemId);
      setFeatureMessage('Purchased!');
    } catch (error) {
      setFeatureMessage(error instanceof Error ? error.message : 'Saved locally. Sync will retry.');
    } finally {
      setPurchasingItemId(undefined);
    }
  };

  return (
    <PageTransition>
      <GameScreen background={backgroundImages.home} reference="/src/reference/home-reference.png" fit="width" designHeight={1380} className="font-sans text-[#102654]">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(255,255,255,.04)_0%,rgba(255,255,255,0)_42%,rgba(201,238,255,.72)_80%,rgba(255,255,255,.96)_100%)]" />

        <TopNav onOpenModal={setModal} />

        <main className="absolute inset-0 z-20">
          <section className="absolute left-[172px] top-[188px] z-30 w-[650px]">
            <h1 className="hero-title-shadow text-[60px] font-black leading-[1.08] tracking-normal">
              <span className="block text-[#48B72B]">Learn Khmer.</span>
              <span className="block text-[#F27A12]">Play Games.</span>
              <span className="block text-[#1576EA]">Become a Typing Hero!</span>
            </h1>
            <p className="mt-5 w-[520px] text-[21px] font-extrabold leading-[1.42] text-[#17325A]">
              An exciting adventure to master Khmer typing for <span className="font-black">Grade 3-9 students.</span>
            </p>
            <div className="mt-7 flex items-center gap-5">
              <Link to="/map" className="pointer-events-auto inline-flex cursor-pointer">
                <GameButton size="xl" variant="gold" rightIcon={<Play size={27} />} className="h-[70px] min-w-[330px] rounded-[36px] text-[25px]">
                  Start Adventure
                </GameButton>
              </Link>
              <Link to="/lesson" className="pointer-events-auto inline-flex cursor-pointer">
                <GameButton size="lg" variant="white" leftIcon={<Keyboard size={24} />} className="h-[62px] min-w-[190px] rounded-[34px] border-[#2376E6] text-[20px]">
                  Try Demo
                </GameButton>
              </Link>
            </div>
          </section>

          <div className="pointer-events-none absolute left-[845px] top-[154px] z-20 w-[660px]">
            <LizardMascot className="w-[660px] max-w-none" withTiles={false} animated={false} />
            <div className="absolute -bottom-[5px] left-[132px] h-[44px] w-[458px] rounded-full bg-[#543416]/35 blur-xl" />
          </div>

          <div className="pointer-events-none absolute right-[104px] top-[134px] z-30 flex w-[170px] flex-col items-center">
            <GameLevelBadge level={economy.level} size="lg" />
            <div className="mt-3 w-[170px] rounded-full border-2 border-white bg-gradient-to-b from-[#4CDB73] to-[#20A74E] px-4 py-1 text-center text-[14px] font-black text-white shadow-button">
              {economy.typingXP.toLocaleString()} XP
            </div>
          </div>

          <section className="absolute left-[42px] top-[660px] z-30 h-[390px] w-[505px] rounded-[24px] border border-[#DCEAF8] bg-white/95 p-7 shadow-[0_16px_30px_rgba(26,92,142,.14)] backdrop-blur-sm">
            <h2 className="mb-3 flex items-center gap-3 text-[24px] font-black text-[#102452]">
              <Shield size={22} className="text-[#51B936]" /> Why You'll Love It
            </h2>
            <div className="space-y-[13px]">
              {loveItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center gap-4">
                    <div className={`grid h-[48px] w-[48px] shrink-0 place-items-center rounded-full border-[3px] border-white bg-gradient-to-b text-white shadow-button ${item.tone}`}>
                      <Icon size={26} />
                    </div>
                    <div>
                      <div className={`text-[17px] font-black leading-tight ${item.titleColor}`}>{item.title}</div>
                      <div className="text-[12px] font-extrabold leading-tight text-[#1B3158]">{item.subtitle}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="absolute left-[565px] top-[660px] z-30 h-[330px] w-[1312px] rounded-[24px] border border-[#DCEAF8] bg-white/95 p-7 shadow-[0_16px_30px_rgba(26,92,142,.14)] backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-3 text-[24px] font-black text-[#102452]">
                <Shield size={22} className="text-[#7DBC31]" /> Your Adventure Path
              </h2>
              <Link to="/map" className="pointer-events-auto inline-flex cursor-pointer">
                <GameButton variant="white" size="md" leftIcon={<Map size={22} />} className="h-[56px] rounded-[28px] border-[#8DBDFF] px-7 text-[17px]">
                  View Map
                </GameButton>
              </Link>
            </div>
            <div className="relative flex h-[244px] -translate-y-4 items-end justify-between px-1 pt-0">
              <div className="pointer-events-none absolute left-[98px] right-[96px] top-[154px] h-[12px] rounded-full bg-[#69B3D1] shadow-inner" />
              <div className="pointer-events-none absolute left-[98px] right-[96px] top-[154px] h-[12px] rounded-full bg-[repeating-linear-gradient(90deg,#69B3D1_0_34px,#2A6F88_34px_48px)] opacity-55" />
              {pathStages.map((stage, index) => (
                <IslandStage key={stage.level} stage={stage} index={index} />
              ))}
            </div>
          </section>

          <section className="absolute left-[565px] top-[1008px] z-40 h-[96px] w-[1312px] rounded-[21px] border border-[#7E77F3] bg-gradient-to-r from-[#4937B7] via-[#384ECE] to-[#294AA6] px-7 py-3 text-white shadow-[0_16px_26px_rgba(30,48,143,.3)]">
            <div className="flex h-full items-center gap-5">
              <h2 className="flex min-w-[205px] items-center gap-2 text-[15px] font-black">
                <Shield size={16} className="text-[#A4FF62]" /> Recent Achievements
              </h2>
              <div className="flex flex-1 items-center justify-between gap-2">
                {achievements.slice(0, 5).map((achievement, index) => (
                  <div key={achievement.id} className="flex min-w-[152px] items-center gap-3 border-r border-white/20 pr-4 last:border-r-0">
                    <GameBadge variant={badgeVariants[index]} label="" compact />
                    <div className="leading-tight">
                      <div className="text-[14px] font-black">{achievement.name}</div>
                      <div className="text-[10px] font-bold text-white/82">{achievement.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
              <GameButton variant="purple" size="sm" className="h-[46px] min-w-[166px] rounded-[24px] text-[13px]" onClick={() => setModal('badges')}>
                View All Badges
              </GameButton>
            </div>
          </section>

          <section className="absolute left-[42px] top-[1184px] z-40 flex h-[100px] w-[1790px] items-center rounded-[20px] border border-white/90 bg-[#F6FBFF]/96 px-7 shadow-[0_10px_22px_rgba(27,91,143,.14)] backdrop-blur">
            <img src={mapImages.angkorFlat} alt="" className="pointer-events-none absolute left-[-10px] bottom-[-22px] h-[282px] w-[508px] object-contain drop-shadow-[0_12px_14px_rgba(34,92,83,.24)]" />
            <div className="flex h-full w-[880px] shrink-0 items-center gap-4 pl-[390px]">
              <GraduationCap className="shrink-0 text-[#176DE2] drop-shadow" size={44} />
              <div className="min-w-0">
                <div className="whitespace-nowrap text-[21px] font-black leading-tight text-[#0B3A80]">Trusted by Teachers. Loved by Students.</div>
                <div className="whitespace-nowrap text-[12px] font-extrabold text-[#51637D]">Aligned with Cambodian curriculum standards.</div>
              </div>
            </div>
            <div className="ml-2 flex flex-1 items-center justify-between gap-6">
              {[
                { icon: Users, value: '120K+', label: 'Happy Students', color: 'text-[#2AB559]' },
                { icon: Trophy, value: '2,500+', label: 'Schools', color: 'text-[#F28C16]' },
                { icon: Timer, value: '95%', label: 'Teacher Approval', color: 'text-[#F3A913]' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex min-w-[182px] items-center gap-3">
                    <Icon className={stat.color} size={38} />
                    <div>
                      <div className="text-[27px] font-black leading-none text-[#1370E6]">{stat.value}</div>
                      <div className="text-[12px] font-bold text-[#40506B]">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to="/dashboard" className="pointer-events-auto ml-auto inline-flex cursor-pointer">
              <GameButton variant="white" size="sm" leftIcon={<GraduationCap size={19} />} className="h-[50px] min-w-[178px] rounded-[25px] border-[#8DBDFF] text-[14px]">
                For Teachers
              </GameButton>
            </Link>
          </section>

          <footer className="absolute bottom-0 left-0 z-30 h-[92px] w-full overflow-hidden rounded-t-[18px] bg-gradient-to-b from-[#075AC9] via-[#0047A6] to-[#00317E] px-[76px] py-2 text-white shadow-[0_-10px_20px_rgba(0,54,118,.18)]">
            <div className="grid h-full grid-cols-[300px_300px_260px_250px_1fr] items-start gap-14">
              <img src={imageAssets.logo} alt="" className="mt-[-8px] h-[108px] w-[258px] object-contain drop-shadow-[0_8px_10px_rgba(0,18,70,.28)]" />
              <div>
                <div className="mb-1 text-[12px] font-black">Quick Links</div>
                <div className="space-y-0.5 text-[11px] font-bold leading-tight text-white/86">
                  <div>Lessons</div>
                  <div>Mini-Games</div>
                  <div>Boss Battles</div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[12px] font-black">Support</div>
                <div className="space-y-0.5 text-[11px] font-bold leading-tight text-white/86">
                  <div>Help Center</div>
                  <div>Contact Us</div>
                  <div>Privacy Policy</div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[12px] font-black">About</div>
                <div className="space-y-0.5 text-[11px] font-bold leading-tight text-white/86">
                  <div>About Us</div>
                  <div>Blog</div>
                  <div>Careers</div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[12px] font-black">Follow Us</div>
                <div className="mb-1 flex gap-2">
                  {[
                    { item: 'f', color: 'from-[#4AA4FF] to-[#2668E5]' },
                    { item: '▶', color: 'from-[#FF5B54] to-[#D91B20]' },
                    { item: '♪', color: 'from-[#1D2433] to-[#05070C]' },
                    { item: '☻', color: 'from-[#8EA6FF] to-[#5865F2]' },
                  ].map(({ item, color }) => (
                    <div key={item} className={`grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-b ${color} text-base font-black shadow-button`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-bold leading-tight text-white/78">
                  <div>Made with love in Cambodia</div>
                  <div>Copyright 2026 Khmer Typing Adventure</div>
                </div>
              </div>
            </div>
          </footer>
        </main>

        <ActionModal open={modal === 'coins'} title="រង្វាន់" onClose={() => setModal(null)}>
          <TreasurePanel
            rewards={treasureRewards}
            wallet={wallet}
            shopItems={shopItems}
            inventory={inventory}
            purchaseMessage={featureMessage}
            purchasingItemId={purchasingItemId}
            onClaim={handleTreasureClaim}
            onPurchase={handlePurchase}
          />
        </ActionModal>
        <ActionModal open={modal === 'badges'} title="សមិទ្ធផល" onClose={() => setModal(null)}>
          <AchievementsPanel achievements={achievementProgress} />
        </ActionModal>
      </GameScreen>
    </PageTransition>
  );
}
