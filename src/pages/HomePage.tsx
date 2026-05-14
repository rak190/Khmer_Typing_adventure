import { Link } from 'react-router-dom';
import {
  BookOpen,
  ChevronDown,
  Gamepad2,
  GraduationCap,
  Home,
  Keyboard,
  Lock,
  Map,
  Music,
  Play,
  School,
  Shield,
  Swords,
  Timer,
  Trophy,
  Users,
  Volume2,
} from 'lucide-react';
import LizardMascot from '../components/characters/LizardMascot';
import GameBadge from '../components/game-ui/GameBadge';
import GameButton from '../components/game-ui/GameButton';
import GameHudCounter from '../components/game-ui/GameHudCounter';
import GameIcon from '../components/game-ui/GameIcon';
import GameLevelBadge from '../components/game-ui/GameLevelBadge';
import GameScreen from '../components/layout/GameScreen';
import PageTransition from '../components/layout/PageTransition';
import { achievements, resources } from '../data/mockData';
import { backgroundImages, imageAssets } from '../assets/assetManifest';

const navItems = [
  { label: 'Home', to: '/', icon: Home, active: true },
  { label: 'Lessons', to: '/lesson', icon: BookOpen, chevron: true },
  { label: 'Mini-Games', to: '/battle', icon: Gamepad2 },
  { label: 'Boss Battles', to: '/battle', icon: Swords },
  { label: 'Leaderboard', to: '/dashboard', icon: Trophy },
  { label: 'For Teachers', to: '/dashboard', icon: Users },
];

const loveItems = [
  { title: 'Khmer Lessons', subtitle: 'Learn letters, words & sentences step by step', icon: BookOpen, tone: 'from-[#72B7FF] to-[#2F72FF]', titleColor: 'text-[#146FE1]' },
  { title: 'Mini-Games', subtitle: 'Fun typing challenges that build your skills', icon: Gamepad2, tone: 'from-[#B486FF] to-[#784BEB]', titleColor: 'text-[#7A4CEB]' },
  { title: 'Boss Battles', subtitle: 'Defeat tricky bosses with your typing power', icon: Swords, tone: 'from-[#FF8C89] to-[#EA3D42]', titleColor: 'text-[#EE3E44]' },
  { title: 'Rewards', subtitle: 'Earn coins, badges & unlock cool prizes', icon: Trophy, tone: 'from-[#FFD968] to-[#F19B18]', titleColor: 'text-[#E9870C]' },
  { title: 'Teacher Friendly', subtitle: 'Track progress, assign lessons & support students', icon: Users, tone: 'from-[#7CE06E] to-[#28A94D]', titleColor: 'text-[#22A64D]' },
];

const pathStages = [
  { level: 1, khmer: 'គន្លឹះ ១', english: 'Consonants', tone: 'green', locked: false, icon: BookOpen },
  { level: 2, khmer: 'ការប្រើ', english: 'Vowels', tone: 'green', locked: false, icon: BookOpen },
  { level: 3, khmer: 'ពាក្យ ងាយ', english: 'Simple Words', tone: 'green', locked: false, icon: Home },
  { level: 4, khmer: 'ប្រយោគ', english: 'Sentences', tone: 'gold', locked: false, icon: School },
  { level: 5, khmer: 'មេប្រយុទ្ធ', english: 'Boss Challenge', tone: 'purple', locked: false, icon: Swords },
  { level: 6, khmer: '', english: 'Coming Soon', tone: 'gray', locked: true, icon: Lock },
];

const badgeVariants = ['newbie', 'rising-star', 'skilled', 'boss-slayer', 'legend'] as const;

function TopNav() {
  return (
    <header className="absolute left-0 top-0 z-40 h-[92px] w-full rounded-b-[18px] bg-gradient-to-b from-[#075ED0] via-[#004AAE] to-[#003382] shadow-[0_9px_22px_rgba(0,35,105,.32)]">
      <Link to="/" className="pointer-events-auto absolute left-[60px] top-[10px] h-[142px] w-[220px] cursor-pointer">
        <img src={imageAssets.logo} alt="Khmer Typing Adventure" className="h-full w-full object-contain drop-shadow-[0_10px_12px_rgba(0,22,76,.34)]" />
      </Link>

      <nav className="absolute left-[300px] top-[20px] flex h-[52px] items-center gap-[18px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`pointer-events-auto flex h-[52px] cursor-pointer items-center gap-3 rounded-[21px] px-5 text-[18px] font-black text-white transition hover:-translate-y-0.5 ${
                item.active ? 'bg-gradient-to-b from-[#6DB3FF] to-[#2E70FF] shadow-[inset_0_-5px_0_rgba(9,45,145,.35),0_8px_14px_rgba(0,34,93,.24)]' : 'hover:bg-white/10'
              }`}
            >
              <Icon size={25} />
              <span>{item.label}</span>
              {item.chevron && <ChevronDown size={18} />}
            </Link>
          );
        })}
      </nav>

      <div className="absolute right-[36px] top-[18px] flex items-center gap-5">
        <GameHudCounter type="coins" value={resources.coins} showPlus className="h-[56px] min-w-[156px] rounded-[24px]" />
        <GameHudCounter type="hearts" value={`${resources.hearts}/${resources.maxHearts}`} label="Full" className="h-[56px] min-w-[140px] rounded-[24px]" />
        <Link
          to="/dashboard"
          className="pointer-events-auto flex h-[60px] w-[196px] cursor-pointer items-center gap-3 rounded-[24px] border-2 border-white/35 bg-gradient-to-b from-[#78E0FF]/85 to-[#1472D8]/90 px-3 text-white shadow-[inset_0_-5px_0_rgba(0,38,91,.25),0_9px_16px_rgba(0,36,97,.24)]"
        >
          <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-white/75 bg-gradient-to-b from-[#D6FFF7] to-[#30BE69]">
            <Users size={27} />
          </div>
          <div className="leading-tight">
            <div className="text-[17px] font-black">Sophea</div>
            <div className="text-[12px] font-extrabold text-white/90">Level 12</div>
          </div>
          <ChevronDown className="ml-auto" size={19} />
        </Link>
      </div>
    </header>
  );
}

function IslandStage({ stage, index }: { stage: (typeof pathStages)[number]; index: number }) {
  const Icon = stage.icon;
  const nodeColor =
    stage.tone === 'green'
      ? 'from-[#B8FF66] via-[#5DDD4F] to-[#229B3F] border-[#197936]'
      : stage.tone === 'gold'
        ? 'from-[#FFE278] via-[#FFBB3D] to-[#EE8315] border-[#B16100]'
        : stage.tone === 'purple'
          ? 'from-[#DDB8FF] via-[#9B63FF] to-[#683FDC] border-[#5731B7]'
          : 'from-[#DDE3EA] via-[#9DA8B4] to-[#616B78] border-[#56606C]';

  return (
    <div className="relative flex h-[206px] w-[178px] flex-col items-center">
      <div
        className={`relative h-[112px] w-[158px] rounded-[46%_54%_48%_52%/58%_60%_40%_42%] shadow-[0_15px_18px_rgba(36,82,74,.24)] ${
          stage.locked
            ? 'bg-gradient-to-b from-[#D3DAE1] via-[#88939F] to-[#4C5561]'
            : 'bg-gradient-to-b from-[#7BDE64] via-[#41B35A] to-[#76512F]'
        }`}
      >
        <div className="pointer-events-none absolute left-5 top-4 h-14 w-20 rounded-full bg-[#C2F678]/60 blur-sm" />
        <div className="absolute bottom-3 left-1/2 h-12 w-20 -translate-x-1/2 rounded-[12px_12px_5px_5px] bg-gradient-to-b from-[#C2934F] to-[#71502F] shadow-inner" />
        <Icon className={`absolute left-1/2 top-8 -translate-x-1/2 ${stage.locked ? 'text-[#2D3440]' : 'text-[#FFE7A8]'} drop-shadow`} size={42} />
      </div>
      <div className={`relative -mt-8 grid h-[66px] w-[66px] place-items-center rounded-full border-[5px] bg-gradient-to-b text-[31px] font-black text-white shadow-button ${nodeColor}`}>
        {stage.locked ? <GameIcon name="lock" size={31} /> : stage.level}
      </div>
      <div className={`khmer-body mt-1 text-center text-[18px] font-black leading-tight ${index === 3 ? 'text-[#F07816]' : index === 4 ? 'text-[#D7263D]' : 'text-[#28A34A]'}`}>
        {stage.khmer}
      </div>
      <div className="text-center text-[14px] font-black leading-tight text-[#15325D]">{stage.english}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <PageTransition>
      <GameScreen background={backgroundImages.home} reference="/src/reference/home-reference.png" className="font-sans text-[#102654]">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(255,255,255,.04)_0%,rgba(255,255,255,0)_42%,rgba(201,238,255,.72)_80%,rgba(255,255,255,.96)_100%)]" />

        <TopNav />

        <div className="absolute left-[24px] top-[24px] z-50 flex gap-3">
          {[Music, Volume2].map((Icon, index) => (
            <button
              key={index}
              className="pointer-events-auto grid h-[54px] w-[54px] cursor-pointer place-items-center rounded-full border-[3px] border-[#0B58B8] bg-gradient-to-b from-[#76D8FF] to-[#1F78E6] text-white shadow-button"
              aria-label={index === 0 ? 'Music' : 'Sound'}
            >
              <Icon size={28} />
            </button>
          ))}
        </div>

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

          <div className="pointer-events-none absolute left-[865px] top-[105px] z-20 w-[620px]">
            <LizardMascot className="w-[620px] max-w-none" withTiles={false} />
            <div className="absolute -bottom-[5px] left-[125px] h-[42px] w-[430px] rounded-full bg-[#543416]/35 blur-xl" />
          </div>

          <div className="pointer-events-none absolute right-[104px] top-[134px] z-30">
            <GameLevelBadge level={12} size="lg" />
            <div className="mt-3 w-[170px] rounded-full border-2 border-white bg-gradient-to-b from-[#4CDB73] to-[#20A74E] px-4 py-1 text-center text-[14px] font-black text-white shadow-button">
              820 / 1,500 XP
            </div>
          </div>

          <div className="pointer-events-none absolute right-[70px] top-[442px] z-20 h-[118px] w-[276px] rounded-[22px] border-[5px] border-[#77502E] bg-gradient-to-b from-[#B98A55] to-[#6C4327] p-4 text-center shadow-[0_14px_22px_rgba(57,54,24,.24)]">
            <div className="khmer-display mt-2 text-[36px] text-[#4A2C18] drop-shadow-[0_2px_0_rgba(255,231,156,.55)]">អក្សរខ្មែរ</div>
          </div>

          <section className="absolute left-[44px] top-[548px] z-30 h-[290px] w-[505px] rounded-[26px] border-2 border-white/80 bg-white/84 p-7 shadow-[0_18px_34px_rgba(30,89,132,.18)] backdrop-blur-md">
            <h2 className="mb-3 flex items-center gap-3 text-[24px] font-black text-[#102452]">
              <Shield size={22} className="text-[#51B936]" /> Why You'll Love It
            </h2>
            <div className="space-y-[10px]">
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

          <section className="absolute left-[565px] top-[548px] z-30 h-[290px] w-[1312px] rounded-[26px] border-2 border-white/80 bg-white/84 p-7 shadow-[0_18px_34px_rgba(30,89,132,.18)] backdrop-blur-md">
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
            <div className="relative flex h-[212px] items-end justify-between px-3">
              <div className="pointer-events-none absolute left-[84px] right-[92px] top-[106px] h-[12px] rounded-full bg-[#69B3D1] shadow-inner" />
              <div className="pointer-events-none absolute left-[84px] right-[92px] top-[106px] h-[12px] rounded-full bg-[repeating-linear-gradient(90deg,#69B3D1_0_34px,#2A6F88_34px_48px)] opacity-55" />
              {pathStages.map((stage, index) => (
                <IslandStage key={stage.level} stage={stage} index={index} />
              ))}
            </div>
          </section>

          <section className="absolute left-[565px] top-[856px] z-30 h-[86px] w-[1312px] rounded-[24px] border-2 border-[#665BEF] bg-gradient-to-r from-[#4836B7] via-[#3D50CF] to-[#2949A8] px-7 py-3 text-white shadow-[0_16px_26px_rgba(33,47,143,.28)]">
            <div className="flex h-full items-center gap-5">
              <h2 className="flex min-w-[190px] items-center gap-2 text-[15px] font-black">
                <Shield size={16} className="text-[#A4FF62]" /> Recent Achievements
              </h2>
              <div className="flex flex-1 items-center justify-between gap-2">
                {achievements.slice(0, 5).map((achievement, index) => (
                  <div key={achievement.id} className="flex min-w-[148px] items-center gap-3 border-r border-white/20 pr-4 last:border-r-0">
                    <GameBadge variant={badgeVariants[index]} label="" compact />
                    <div className="leading-tight">
                      <div className="text-[14px] font-black">{achievement.name}</div>
                      <div className="text-[10px] font-bold text-white/82">{achievement.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
              <GameButton variant="purple" size="sm" className="h-[44px] min-w-[160px] rounded-[24px] text-[13px]">
                View All Badges
              </GameButton>
            </div>
          </section>

          <section className="absolute left-[44px] top-[944px] z-30 h-[54px] w-[620px] rounded-[22px] border border-white/80 bg-white/75 px-5 shadow-[0_12px_22px_rgba(27,91,143,.16)] backdrop-blur">
            <div className="flex h-full items-center gap-4">
              <div className="relative h-[48px] w-[86px] shrink-0 rounded-[48%_52%_46%_54%/58%_54%_46%_42%] bg-gradient-to-b from-[#91E764] via-[#44A956] to-[#66472C] shadow">
                <GraduationCap className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white drop-shadow" size={26} />
              </div>
              <div>
                <div className="text-[19px] font-black text-[#0B3A80]">Trusted by Teachers. Loved by Students.</div>
                <div className="text-[12px] font-extrabold text-[#51637D]">Aligned with Cambodian curriculum standards.</div>
              </div>
            </div>
          </section>

          <section className="absolute left-[690px] top-[944px] z-40 flex h-[54px] w-[1142px] items-center gap-7 rounded-[22px] border border-white/80 bg-white/80 px-6 shadow-[0_12px_22px_rgba(27,91,143,.16)] backdrop-blur">
            {[
              { icon: Users, value: '120K+', label: 'Happy Students', color: 'text-[#2AB559]' },
              { icon: School, value: '2,500+', label: 'Schools', color: 'text-[#F28C16]' },
              { icon: Timer, value: '95%', label: 'Teacher Approval', color: 'text-[#F3A913]' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex min-w-[210px] items-center gap-3">
                  <Icon className={stat.color} size={34} />
                  <div>
                    <div className="text-[24px] font-black leading-none text-[#1370E6]">{stat.value}</div>
                    <div className="text-[12px] font-bold text-[#40506B]">{stat.label}</div>
                  </div>
                </div>
              );
            })}
            <Link to="/dashboard" className="pointer-events-auto ml-auto inline-flex cursor-pointer">
              <GameButton variant="white" size="sm" leftIcon={<GraduationCap size={19} />} className="h-[44px] min-w-[170px] rounded-[24px] border-[#8DBDFF] text-[14px]">
                For Teachers
              </GameButton>
            </Link>
          </section>

          <footer className="absolute bottom-0 left-0 z-30 h-[76px] w-full rounded-t-[18px] bg-gradient-to-b from-[#075AC9] via-[#0047A6] to-[#00317E] px-[66px] py-3 text-white shadow-[0_-10px_20px_rgba(0,54,118,.18)]">
            <div className="grid grid-cols-[250px_1fr_1fr_1fr_1.25fr] gap-10">
              <img src={imageAssets.logo} alt="" className="h-[58px] w-[150px] object-contain" />
              <div>
                <div className="mb-1 text-[13px] font-black">Quick Links</div>
                <div className="flex gap-3 text-[12px] font-bold text-white/86">
                  <div>Lessons</div>
                  <div>Mini-Games</div>
                  <div>Boss Battles</div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[13px] font-black">Support</div>
                <div className="flex gap-3 text-[12px] font-bold text-white/86">
                  <div>Help Center</div>
                  <div>Contact Us</div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[13px] font-black">About</div>
                <div className="flex gap-3 text-[12px] font-bold text-white/86">
                  <div>About Us</div>
                  <div>Blog</div>
                </div>
              </div>
              <div>
                <div className="mb-2 text-[13px] font-black">Follow Us</div>
                <div className="flex gap-3">
                  {['f', '▶', '♪', '☻'].map((item) => (
                    <div key={item} className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-b from-[#4AA4FF] to-[#2668E5] text-lg font-black shadow-button">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </main>
      </GameScreen>
    </PageTransition>
  );
}
