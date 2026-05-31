import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Gem,
  Heart,
  Info,
  Mail,
  Map,
  Medal,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Swords,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { imageAssets } from '../assets/assetManifest';
import { PLAYER_TITLES } from '../data/playerTitles';
import { resetLessonProgressRecords } from '../data/mockData';
import {
  getNextStructuredLesson,
  getStructuredLessons,
  type StructuredTypingLesson,
} from '../data/typingProgression';
import ActionModal from '../components/game-ui/ActionModal';
import GameButton from '../components/game-ui/GameButton';
import { AchievementsPanel, DailyQuestsPanel, SettingsPanel } from '../components/game-ui/FeaturePanels';
import AppLayout from '../components/layout/AppLayout';
import PageTransition from '../components/layout/PageTransition';
import GeneratedAvatar from '../components/profile/GeneratedAvatar';
import { claimDailyQuestReward, getActiveEconomyUserId } from '../lib/economy';
import {
  buildAchievementProgress,
  buildDailyQuests,
  claimDailyQuest,
  loadAppSettings,
  PLAYER_FEATURES_EVENT,
  resetFeatureProgressState,
  saveAppSettings,
  type AppSettings,
  type DailyQuest,
  type RewardAmount,
} from '../lib/playerFeatures';
import {
  createEmptyStudentProgress,
  getStudentDashboardStats,
  loadStudentProgress,
  resetStudentProgress,
  STUDENT_PROGRESS_EVENT,
  type StudentLessonResult,
  type StudentProgress,
} from '../lib/studentProgress';
import { useDailyQuestClaimIds, useEconomyState } from '../lib/useEconomyState';
import { USER_PROFILE_EVENT } from '../lib/userProfile';
import { loadCachedGameProfile } from '../services/profileService';

type DashboardModal = 'details' | 'dailyQuests' | 'achievements' | 'settings' | 'messages' | null;

type HudPillProps = {
  icon: ReactNode;
  value: string;
  label: string;
  onAdd?: () => void;
  ariaLabel?: string;
};

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  subtitle: string;
  tone: 'purple' | 'gold' | 'blue' | 'green' | 'orange';
  progress?: number;
};

const statTones: Record<StatCardProps['tone'], string> = {
  purple: 'from-[#321758]/94 via-[#4A2584]/90 to-[#271044]/94 border-[#B88DFF] text-[#F8EDFF]',
  gold: 'from-[#513608]/94 via-[#8C5E12]/90 to-[#3C2705]/94 border-[#FFD267] text-[#FFF8D8]',
  blue: 'from-[#073A5C]/94 via-[#075E8C]/90 to-[#05283E]/94 border-[#43CFFF] text-[#E9FAFF]',
  green: 'from-[#063F30]/94 via-[#0B764A]/90 to-[#052C22]/94 border-[#61D66C] text-[#EFFFF0]',
  orange: 'from-[#62350A]/94 via-[#A85C10]/90 to-[#472506]/94 border-[#FFB848] text-[#FFF0D3]',
};

const questCopy: Record<string, { title: string; detail: string; icon: ReactNode }> = {
  'complete-lesson': {
    title: 'បញ្ចប់មេរៀន 1 ថ្ងៃ',
    detail: 'Complete 1 lesson',
    icon: <Swords size={24} />,
  },
  'type-khmer-characters': {
    title: 'វាយតួអក្សរខ្មែរ',
    detail: 'Type Khmer characters',
    icon: <BookOpen size={24} />,
  },
  'accuracy-target': {
    title: 'គោលដៅត្រឹមត្រូវ',
    detail: 'Reach today\'s accuracy target',
    icon: <Target size={24} />,
  },
  'attempt-boss': {
    title: 'សាកល្បង Boss',
    detail: 'Try a Boss Battle',
    icon: <ShieldCheck size={24} />,
  },
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}

function xpThresholdForLevel(level: number) {
  const safeLevel = Math.max(1, Math.floor(level));
  const thresholds = [0, 100, 250, 450, 700];
  if (safeLevel - 1 < thresholds.length) return thresholds[safeLevel - 1];

  let currentLevel = 5;
  let requirement = 700;
  let step = 350;
  while (currentLevel < safeLevel) {
    requirement += step;
    step = Math.round(step * 1.18);
    currentLevel += 1;
  }
  return requirement;
}

function getLevelXP(totalXP: number, level: number) {
  const start = xpThresholdForLevel(level);
  const end = xpThresholdForLevel(level + 1);
  const target = Math.max(1, end - start);
  const current = clamp(totalXP - start, 0, target);
  return {
    current,
    target,
    percent: Math.round((current / target) * 100),
  };
}

function rewardLabel(reward: RewardAmount) {
  const parts = [
    reward.coins ? `${reward.coins} coins` : null,
    reward.gems ? `${reward.gems} gems` : null,
    reward.XP ? `${reward.XP} XP` : null,
    reward.stars ? `${reward.stars} stars` : null,
  ].filter(Boolean);
  return parts.join(' + ');
}

function lessonHref(lesson: StructuredTypingLesson) {
  return lesson.isBoss
    ? `/battle?world=${lesson.routeWorldId}`
    : `/lesson?world=${lesson.routeWorldId}&level=${lesson.routeLessonId}`;
}

function safeLoadStudentProgress(): StudentProgress {
  try {
    return loadStudentProgress();
  } catch (error) {
    console.error('Unable to load dashboard progress.', error);
    return createEmptyStudentProgress();
  }
}

function formatResetCountdown(now: Date) {
  const reset = new Date(now);
  reset.setHours(24, 0, 0, 0);
  const ms = Math.max(0, reset.getTime() - now.getTime());
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function DashboardPanel({
  children,
  className = '',
  ariaLabelledBy,
}: {
  children: ReactNode;
  className?: string;
  ariaLabelledBy?: string;
}) {
  return (
    <section
      aria-labelledby={ariaLabelledBy}
      className={`dashboard-panel rounded-[22px] border-[3px] border-[#C99031] bg-[#062F35]/88 p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,.34),inset_0_2px_0_rgba(255,255,255,.12)] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({ id, icon, title, subtitle, action }: { id: string; icon: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#FFCC57] bg-[#0B4B50] text-[#FFE68A] shadow-[inset_0_-3px_0_rgba(0,0,0,.22)]">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 id={id} className="khmer-body text-xl font-black leading-tight text-[#FFE6A6]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm font-bold leading-snug text-[#C9F5E8]">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function HudPill({ icon, value, label, onAdd, ariaLabel }: HudPillProps) {
  return (
    <div className="flex min-h-[54px] items-center gap-3 rounded-full border-[3px] border-[#D99725] bg-[#052D34]/92 px-4 py-2 shadow-[0_8px_18px_rgba(0,0,0,.28),inset_0_2px_0_rgba(255,255,255,.1)]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0B4A50] text-white">{icon}</span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[24px] font-black leading-none text-white">{value}</span>
        <span className="block text-xs font-black text-[#FFE7A6]">{label}</span>
      </span>
      {onAdd && (
        <button
          type="button"
          aria-label={ariaLabel ?? `Open shop for ${label}`}
          onClick={onAdd}
          className="ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[#72C8BD]/70 bg-[#0E5960] text-[#FFF0A5] shadow-inner transition hover:bg-[#16706F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70"
        >
          +
        </button>
      )}
    </div>
  );
}

function HudIconButton({
  icon,
  label,
  badge,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative grid h-[58px] w-[58px] place-items-center rounded-full border-[3px] border-[#D99725] bg-[#052D34]/92 text-[#FFE7A6] shadow-[0_8px_18px_rgba(0,0,0,.28),inset_0_2px_0_rgba(255,255,255,.1)] transition hover:-translate-y-0.5 hover:bg-[#0B4A50] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70"
    >
      {icon}
      {badge ? (
        <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full border-2 border-white bg-[#E83D38] px-1 text-xs font-black text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function StatCard({ icon, label, value, subtitle, tone, progress }: StatCardProps) {
  return (
    <article className={`min-h-[118px] rounded-[18px] border-[3px] bg-gradient-to-br p-4 shadow-[0_14px_28px_rgba(0,0,0,.3),inset_0_2px_0_rgba(255,255,255,.16)] ${statTones[tone]}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white/24 bg-white/13 shadow-inner">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="khmer-body truncate text-sm font-black text-[#FFE9A8]">{label}</div>
          <div className="mt-1 text-[28px] font-black leading-none tracking-normal text-white">{value}</div>
          <div className="mt-1 truncate text-sm font-bold text-white/78">{subtitle}</div>
        </div>
      </div>
      {typeof progress === 'number' && (
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/32 shadow-inner" aria-hidden="true">
          <div className="h-full rounded-full bg-gradient-to-r from-[#7BE747] to-[#FBE44B]" style={{ width: `${clamp(progress)}%` }} />
        </div>
      )}
    </article>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const safePercent = clamp(percent);
  return (
    <div
      className="grid h-36 w-36 shrink-0 place-items-center rounded-full border-[3px] border-[#2DAE8A] shadow-[0_12px_22px_rgba(0,0,0,.32),inset_0_0_0_10px_rgba(0,0,0,.18)]"
      style={{ background: `conic-gradient(#7FE33F ${safePercent * 3.6}deg, rgba(7, 54, 59, .92) 0deg)` }}
      aria-label={`${safePercent}% complete`}
    >
      <div className="grid h-24 w-24 place-items-center rounded-full bg-[#062B31] text-center text-[34px] font-black text-[#FFF3C6] shadow-inner">
        {safePercent}%
      </div>
    </div>
  );
}

function MetricLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#85D5C8]/18 py-2 last:border-b-0">
      <span className="flex min-w-0 items-center gap-2 font-bold text-[#DDF8EF]">
        <span className="text-[#FFE172]">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 font-black text-white">{value}</span>
    </div>
  );
}

function StreakPanel({ current, best }: { current: number; best: number }) {
  const activeDots = clamp(current, 0, 7);

  return (
    <DashboardPanel className="min-h-[240px] bg-[#07343A]/91" ariaLabelledBy="streak-heading">
      <div className="flex items-start gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#153E42] text-[#FF8D2D] shadow-inner">
          <Flame size={42} fill="currentColor" />
        </span>
        <div>
          <h2 id="streak-heading" className="khmer-body text-2xl font-black text-[#FFE6A6]">ស្ទ្រីកហាត់</h2>
          <div className="mt-1 text-[42px] font-black leading-none text-[#FFD75D]">{current} ថ្ងៃ</div>
          <p className="mt-1 font-bold text-white/82">Best: {best} days</p>
        </div>
      </div>
      <div className="mt-5 flex gap-2 rounded-full bg-black/22 p-2">
        {Array.from({ length: 7 }, (_, index) => (
          <span
            key={index}
            className={`grid h-8 flex-1 place-items-center rounded-full border text-sm font-black ${
              index < activeDots
                ? 'border-[#A8F06A] bg-gradient-to-b from-[#9EEE4B] to-[#3F9E20] text-white'
                : 'border-white/10 bg-white/13 text-white/45'
            }`}
            aria-label={index < activeDots ? `Practice day ${index + 1} complete` : `Practice day ${index + 1} pending`}
          >
            {index < activeDots ? <CheckCircle2 size={18} /> : ''}
          </span>
        ))}
      </div>
      <p className="khmer-body mt-5 rounded-[14px] border border-[#51C990]/30 bg-[#083E42] px-4 py-3 text-center font-black text-[#DDFAD4]">
        បន្តហាត់រាល់ថ្ងៃ ដើម្បីរក្សា streak!
      </p>
    </DashboardPanel>
  );
}

function RecentLessonRow({ result }: { result: StudentLessonResult }) {
  const stars = clamp(result.stars, 0, 3);

  return (
    <article className="flex items-center gap-3 rounded-[14px] border-2 border-[#E2C98B] bg-[#F8EAC3] px-3 py-3 text-[#263117] shadow-[0_7px_14px_rgba(0,0,0,.16)]">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] border-2 border-[#2B8C3C] bg-gradient-to-b from-[#4CBF46] to-[#197838] text-xl font-black text-white shadow-inner">
        {String(result.worldId).replace(/\D/g, '') || 'L'}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-black text-[#263117]">{result.lessonTitle}</h3>
        <p className="text-sm font-bold text-[#4B5832]">Accuracy: {result.accuracy}% · CPM {result.CPM}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-0.5 sm:flex" aria-label={`${stars} stars`}>
        {Array.from({ length: 3 }, (_, index) => (
          <Star
            key={index}
            size={19}
            className={index < stars ? 'text-[#F7A915]' : 'text-[#9E9C8C]'}
            fill="currentColor"
          />
        ))}
      </div>
      <CheckCircle2 className={result.passed ? 'text-[#259B3E]' : 'text-[#A85D05]'} size={24} />
    </article>
  );
}

function QuestPreviewRow({
  quest,
  disabled,
  onClaim,
}: {
  quest: DailyQuest;
  disabled: boolean;
  onClaim: (questId: string) => void;
}) {
  const copy = questCopy[quest.id] ?? { title: quest.title, detail: quest.description, icon: <Target size={24} /> };
  const percent = quest.total > 0 ? Math.round((quest.progress / quest.total) * 100) : 0;

  return (
    <article className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-[16px] border border-[#4DBAA6]/80 bg-[#0B4A50]/92 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.12)]">
      <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#D99725] bg-gradient-to-b from-[#D88A18] to-[#92520A] text-white shadow-inner">
        {copy.icon}
      </span>
      <div className="min-w-0">
        <div className="khmer-body truncate font-black text-[#FFF0B0]">{copy.title}</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-[#D6F6EE]">
          <span>{copy.detail}</span>
          <span>{quest.progress}/{quest.total}</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/35 shadow-inner">
          <div className="h-full rounded-full bg-gradient-to-r from-[#63D63A] to-[#B6FF54]" style={{ width: `${clamp(percent)}%` }} />
        </div>
      </div>
      <div className="min-w-[88px] text-right">
        {quest.status === 'claimable' ? (
          <GameButton
            variant="green"
            size="sm"
            disabled={disabled}
            onClick={() => onClaim(quest.id)}
            aria-label={`Claim ${rewardLabel(quest.reward)} for ${copy.detail}`}
          >
            Claim
          </GameButton>
        ) : (
          <div className={`rounded-full px-3 py-2 text-sm font-black ${quest.status === 'claimed' ? 'bg-[#DFFFD4] text-[#176D35]' : 'bg-[#173A3E] text-[#FFE6A6]'}`}>
            {quest.status === 'claimed' ? 'Claimed' : rewardLabel(quest.reward)}
          </div>
        )}
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const economy = useEconomyState();
  const dailyQuestClaimIds = useDailyQuestClaimIds();
  const [progress, setProgress] = useState<StudentProgress>(() => safeLoadStudentProgress());
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [profile, setProfile] = useState(() => loadCachedGameProfile());
  const [modal, setModal] = useState<DashboardModal>(null);
  const [featureMessage, setFeatureMessage] = useState('');
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const [extraClaimIds, setExtraClaimIds] = useState<string[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);
  const [now, setNow] = useState(() => new Date());

  const stats = useMemo(() => getStudentDashboardStats(progress), [progress]);
  const lessons = useMemo(() => getStructuredLessons(), []);
  const nextStructuredLesson = useMemo(() => getNextStructuredLesson(progress.completedLessons), [progress.completedLessons]);
  const lessonTarget = nextStructuredLesson ? lessonHref(nextStructuredLesson) : '/map';
  const achievements = useMemo(() => buildAchievementProgress(progress), [progress]);
  const combinedClaimIds = useMemo(() => Array.from(new Set([...dailyQuestClaimIds, ...extraClaimIds])), [dailyQuestClaimIds, extraClaimIds]);
  const dailyQuests = useMemo(() => buildDailyQuests(progress, undefined, combinedClaimIds), [combinedClaimIds, progress]);
  const previewQuests = dailyQuests.slice(0, 3);
  const claimableQuestCount = dailyQuests.filter((quest) => quest.status === 'claimable').length;

  const earnedStars = progress.lessonResults.reduce((total, result) => total + result.stars, 0);
  const totalStars = Math.max(lessons.length * 3, 1);
  const bossLessons = lessons.filter((lesson) => lesson.isBoss);
  const bossesDefeated = progress.lessonResults.filter((result) => result.passed && (result.difficulty === 'boss' || result.lessonId.includes('boss'))).length;
  const completionPercent = stats.totalLessons > 0 ? Math.round((Math.min(stats.totalLessonsCompleted, stats.totalLessons) / stats.totalLessons) * 100) : 0;
  const displayXP = Math.max(economy.typingXP, stats.totalXP);
  const displayLevel = Math.max(economy.level, stats.currentLevel);
  const levelXP = getLevelXP(displayXP, displayLevel);
  const streak = Math.max(economy.streak, stats.currentStreak);
  const longestStreak = Math.max(economy.longestStreak, stats.longestStreak);
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;
  const resetCountdown = formatResetCountdown(now);
  const profileTitle = PLAYER_TITLES.find((item) => item.id === profile.equippedTitleId) ?? PLAYER_TITLES[0];

  useEffect(() => {
    const refreshProgress = () => {
      setProgress(safeLoadStudentProgress());
      setIsHydrating(false);
    };

    refreshProgress();
    window.addEventListener(STUDENT_PROGRESS_EVENT, refreshProgress);
    window.addEventListener(PLAYER_FEATURES_EVENT, refreshProgress);

    return () => {
      window.removeEventListener(STUDENT_PROGRESS_EVENT, refreshProgress);
      window.removeEventListener(PLAYER_FEATURES_EVENT, refreshProgress);
    };
  }, []);

  useEffect(() => {
    const refreshProfile = () => setProfile(loadCachedGameProfile());
    window.addEventListener(USER_PROFILE_EVENT, refreshProfile);
    return () => window.removeEventListener(USER_PROFILE_EVENT, refreshProfile);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const openShop = () => navigate('/shop');

  const handleDailyQuestClaim = async (questId: string) => {
    const quest = dailyQuests.find((item) => item.id === questId);
    if (!quest || quest.status !== 'claimable') return;

    setClaimingQuestId(questId);
    setFeatureMessage('');
    try {
      const userId = getActiveEconomyUserId();
      if (userId) await claimDailyQuestReward(userId, quest.id, quest.reward);
      claimDailyQuest(questId);
      setExtraClaimIds((ids) => Array.from(new Set([...ids, questId])));
      setFeatureMessage('Quest reward claimed!');
    } catch (error) {
      setFeatureMessage(error instanceof Error ? error.message : 'Saved locally. Sync will retry.');
    } finally {
      setClaimingQuestId(null);
    }
  };

  const handleResetProgress = () => {
    resetStudentProgress();
    resetFeatureProgressState();
    void resetLessonProgressRecords().catch((error) => console.error('Unable to reset lesson progress records.', error));
    setProgress(safeLoadStudentProgress());
  };

  return (
    <PageTransition>
      <AppLayout>
        <div
          className="relative min-h-screen overflow-x-hidden px-4 py-4 text-white xl:px-6"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(3, 22, 25, .86), rgba(5, 45, 53, .38) 42%, rgba(3, 24, 28, .88)), linear-gradient(180deg, rgba(4, 31, 39, .12), rgba(3, 18, 21, .94)), url(${imageAssets.backgrounds.worldMap})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_8%,rgba(255,232,119,.18),transparent_24%),radial-gradient(circle_at_92%_84%,rgba(74,204,92,.22),transparent_20%)]" />

          <main className="relative z-10 mx-auto max-w-[1540px] space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <HudPill
                  icon={<Heart className="text-[#FF4B3F]" size={28} fill="currentColor" />}
                  value={`${economy.hearts}/${economy.maxHearts}`}
                  label="Full"
                  onAdd={openShop}
                  ariaLabel="Open shop for hearts"
                />
                <HudPill
                  icon={<img src={imageAssets.coin} alt="" className="h-8 w-8" />}
                  value={formatNumber(economy.coins)}
                  label="Coins"
                  onAdd={openShop}
                  ariaLabel="Open shop for coins"
                />
                <HudPill
                  icon={<Gem className="text-[#C671FF]" size={30} fill="currentColor" />}
                  value={formatNumber(economy.gems)}
                  label="Gems"
                  onAdd={openShop}
                  ariaLabel="Open shop for gems"
                />
                <HudPill
                  icon={<Zap className="text-[#38D6FF]" size={30} fill="currentColor" />}
                  value={formatNumber(displayXP)}
                  label="Typing XP"
                />
              </div>
              <div className="flex items-center gap-3">
                <HudIconButton icon={<Mail size={26} />} label="Open messages" badge={claimableQuestCount || undefined} onClick={() => setModal('messages')} />
                <HudIconButton icon={<Trophy size={27} />} label="Open achievements" onClick={() => setModal('achievements')} />
                <HudIconButton icon={<Settings size={28} />} label="Open settings" onClick={() => setModal('settings')} />
              </div>
            </header>

            {isHydrating && (
              <div className="rounded-full border border-[#FFE6A6]/45 bg-[#062F35]/82 px-4 py-2 text-sm font-black text-[#FFE6A6]">
                Loading saved dashboard data...
              </div>
            )}

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
              <div className="relative overflow-hidden rounded-[24px] border-[3px] border-[#D99725] bg-[#062F35]/54 p-4 shadow-[0_18px_40px_rgba(0,0,0,.34),inset_0_2px_0_rgba(255,255,255,.12)] sm:p-5">
                <div className="absolute inset-0 bg-gradient-to-r from-[#05343C]/72 via-[#075967]/28 to-transparent" />
                <div className="relative z-10 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="flex items-end justify-center">
                    <div className="relative h-[220px] w-[220px]">
                      <div className="absolute bottom-0 left-1/2 h-20 w-44 -translate-x-1/2 rounded-[50%] bg-[#4B351F]/70 shadow-[0_20px_30px_rgba(0,0,0,.34)]" />
                      <img
                        src={imageAssets.elephantGuide}
                        alt="Elephant typing guide"
                        className="relative h-full w-full object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,.36)]"
                      />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col justify-center py-2">
                    <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-[#FFE6A6]/50 bg-[#04292F]/76 px-3 py-1 text-xs font-black uppercase text-[#FFE6A6]">
                      <Sparkles size={15} /> Typing Hero Control Center
                    </div>
                    <h1 className="khmer-body text-[32px] font-black leading-tight text-white drop-shadow sm:text-[42px]">
                      សួស្តី! អ្នកវាយអក្សរ
                      <span className="block font-sans text-[34px] sm:text-[42px]">Level {displayLevel}</span>
                    </h1>
                    <p className="khmer-body mt-2 max-w-2xl text-xl font-black leading-snug text-[#E6FFF7]">
                      Continue your Khmer typing adventure!
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[16px] border border-[#70D4C2]/45 bg-[#052D34]/82 px-4 py-3">
                        <div className="text-xs font-black uppercase text-[#FFE6A6]">Current World</div>
                        <div className="truncate text-xl font-black text-white">{stats.currentWorld}</div>
                      </div>
                      <div className="rounded-[16px] border border-[#70D4C2]/45 bg-[#052D34]/82 px-4 py-3">
                        <div className="text-xs font-black uppercase text-[#FFE6A6]">Next Lesson</div>
                        <div className="truncate text-xl font-black text-white">{stats.currentLessonTitle}</div>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <GameButton
                        variant="gold"
                        size="md"
                        rightIcon={<ChevronRight size={20} />}
                        onClick={() => navigate(lessonTarget)}
                        aria-label={`Continue ${stats.currentLessonTitle}`}
                      >
                        Continue Level {displayLevel}
                      </GameButton>
                      <GameButton variant="blue" size="md" leftIcon={<Map size={19} />} onClick={() => navigate('/map')}>
                        World Map
                      </GameButton>
                    </div>
                  </div>
                </div>
              </div>

              <StreakPanel current={streak} best={longestStreak} />
            </section>

            <section aria-label="Dashboard stats" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <StatCard
                icon={<Medal size={34} />}
                label="Typing XP"
                value={formatNumber(displayXP)}
                subtitle={`Level ${displayLevel}`}
                tone="purple"
                progress={levelXP.percent}
              />
              <StatCard
                icon={<Star size={36} fill="currentColor" />}
                label="ផ្កាយសរុប"
                value={`${earnedStars}/${totalStars}`}
                subtitle="Stars earned"
                tone="gold"
                progress={Math.round((earnedStars / totalStars) * 100)}
              />
              <StatCard
                icon={<Target size={36} />}
                label="ភាពត្រឹមត្រូវ"
                value={`${stats.averageAccuracy}%`}
                subtitle="Average Accuracy"
                tone="blue"
              />
              <StatCard
                icon={<Zap size={36} fill="currentColor" />}
                label="CPM ល្អបំផុត"
                value={`${stats.bestCPM || stats.averageCPM}`}
                subtitle="CPM"
                tone="green"
              />
              <StatCard
                icon={<Swords size={36} />}
                label="ពួក Boss"
                value={`${bossesDefeated}`}
                subtitle="Boss Defeated"
                tone="orange"
                progress={bossLessons.length > 0 ? Math.round((bossesDefeated / bossLessons.length) * 100) : 0}
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(300px,.85fr)_minmax(360px,1fr)_minmax(400px,1.15fr)]">
              <DashboardPanel ariaLabelledBy="progress-heading">
                <SectionTitle
                  id="progress-heading"
                  icon={<Award size={24} />}
                  title="ការរីកចម្រើន / Progress Overview"
                  subtitle="World progress, stars, bosses, and badges."
                />
                <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <ProgressRing percent={completionPercent} />
                    <div>
                      <div className="khmer-body text-xl font-black text-white">ពិភពលោក {nextStructuredLesson?.routeWorldId ?? 1}</div>
                      <div className="font-bold text-[#C9F5E8]">{stats.currentWorld}</div>
                    </div>
                  </div>
                  <div className="rounded-[18px] border border-[#65C6B6]/34 bg-[#052A30]/82 px-4 py-3">
                    <MetricLine icon={<BookOpen size={18} />} label="Lessons completed" value={`${stats.totalLessonsCompleted}/${stats.totalLessons}`} />
                    <MetricLine icon={<Star size={18} fill="currentColor" />} label="Stars collected" value={`${earnedStars}/${totalStars}`} />
                    <MetricLine icon={<Swords size={18} />} label="Bosses defeated" value={`${bossesDefeated}/${bossLessons.length}`} />
                    <MetricLine icon={<Trophy size={18} />} label="Achievements" value={`${unlockedAchievements}/${achievements.length}`} />
                  </div>
                </div>
                <GameButton
                  variant="gold"
                  size="md"
                  className="mt-5 w-full"
                  rightIcon={<ChevronRight size={20} />}
                  onClick={() => setModal('details')}
                >
                  View Details
                </GameButton>
              </DashboardPanel>

              <DashboardPanel ariaLabelledBy="recent-lessons-heading">
                <SectionTitle
                  id="recent-lessons-heading"
                  icon={<BookOpen size={24} />}
                  title="មេរៀនថ្មីៗ / Recent Lessons"
                  subtitle="Latest completed lesson results."
                />
                <div className="space-y-3">
                  {stats.recentLessonHistory.length > 0 ? (
                    stats.recentLessonHistory.slice(0, 3).map((result) => (
                      <RecentLessonRow key={`${result.lessonId}-${result.completedAt}`} result={result} />
                    ))
                  ) : (
                    <div className="rounded-[16px] border border-[#63C6B5]/45 bg-[#083F46]/90 px-4 py-6 text-center font-bold text-[#D6F6EE]">
                      No lessons completed yet. Start your first lesson!
                    </div>
                  )}
                </div>
                <GameButton
                  variant="gold"
                  size="md"
                  className="mt-5 w-full"
                  rightIcon={<ChevronRight size={20} />}
                  onClick={() => navigate('/lesson')}
                >
                  View All Lessons
                </GameButton>
              </DashboardPanel>

              <DashboardPanel ariaLabelledBy="daily-quests-heading">
                <SectionTitle
                  id="daily-quests-heading"
                  icon={<CalendarDays size={24} />}
                  title="បេសកកម្មប្រចាំថ្ងៃ / Daily Quests"
                  subtitle="Practice goals that reset every day."
                  action={(
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#70D4C2]/55 bg-[#052A30]/82 px-3 py-2 text-sm font-black text-[#FFF0B0]">
                      <Clock size={16} /> {resetCountdown}
                    </span>
                  )}
                />
                {featureMessage && (
                  <div className="mb-3 rounded-[14px] border border-[#7FE35E]/55 bg-[#143E26]/88 px-3 py-2 text-center text-sm font-black text-[#DFFFD4]">
                    {featureMessage}
                  </div>
                )}
                <div className="space-y-3">
                  {previewQuests.map((quest) => (
                    <QuestPreviewRow
                      key={quest.id}
                      quest={quest}
                      disabled={claimingQuestId === quest.id}
                      onClaim={handleDailyQuestClaim}
                    />
                  ))}
                </div>
                <GameButton
                  variant="gold"
                  size="md"
                  className="mt-5 w-full"
                  rightIcon={<ChevronRight size={20} />}
                  onClick={() => setModal('dailyQuests')}
                >
                  View All Quests
                </GameButton>
              </DashboardPanel>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-[20px] border-[3px] border-[#3DA7E8] bg-gradient-to-r from-[#0B4D98]/92 via-[#124A86]/90 to-[#0A396A]/92 p-4 shadow-[0_14px_32px_rgba(0,0,0,.28)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/18 text-[#D9F5FF]">
                      <Info size={24} />
                    </span>
                    <div>
                      <h2 className="khmer-body text-lg font-black text-white">គន្លឹះហាត់ / Practice Tip</h2>
                      <p className="font-bold text-[#E5F8FF]">Accuracy comes first. Calm Khmer keystrokes make CPM grow naturally.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <GameButton variant="gold" size="sm" rightIcon={<ChevronRight size={18} />} onClick={() => navigate(lessonTarget)}>
                      Continue Practice
                    </GameButton>
                    <GameButton variant="blue" size="sm" leftIcon={<BookOpen size={18} />} onClick={() => navigate('/lesson')}>
                      Lessons
                    </GameButton>
                    <GameButton variant="green" size="sm" leftIcon={<ShoppingCart size={18} />} onClick={() => navigate('/shop')}>
                      Shop
                    </GameButton>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="rounded-[20px] border-[3px] border-[#C99031] bg-[#062F35]/88 p-4 text-left shadow-[0_14px_32px_rgba(0,0,0,.28)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70"
                aria-label="Open player profile"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 overflow-hidden rounded-full border-2 border-[#FFE17B] bg-[#0B4A50] text-[#FFE17B]">
                    <GeneratedAvatar
                      avatarId={profile.equippedAvatarId}
                      skinStyleId={profile.equippedSkinId}
                      themeId={profile.equippedThemeId}
                      frameId={profile.equippedFrameId}
                      level={displayLevel}
                      size="100%"
                      ariaLabel={`${profile.displayName || progress.studentName || 'Typing Hero'} avatar`}
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="khmer-body font-black text-[#FFE6A6]">{profile.displayName || progress.studentName || 'Typing Hero'}</div>
                    <div className="text-sm font-bold text-[#D6F6EE]">{profileTitle.name} · Level {displayLevel} · {levelXP.current}/{levelXP.target} XP</div>
                  </div>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/32 shadow-inner">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#6DE24D] to-[#F7E55B]" style={{ width: `${levelXP.percent}%` }} />
                </div>
              </button>
            </section>
          </main>

          <ActionModal open={modal === 'details'} title="Progress Details" actionLabel="Close" onClose={() => setModal(null)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[14px] border border-[#DDBD70] bg-white/60 p-3">
                <div className="font-black text-[#17325A]">Current path</div>
                <div>{stats.currentWorld}</div>
                <div>{stats.currentLessonTitle}</div>
              </div>
              <div className="rounded-[14px] border border-[#DDBD70] bg-white/60 p-3">
                <div className="font-black text-[#17325A]">Typing performance</div>
                <div>Accuracy {stats.averageAccuracy}% · Best CPM {stats.bestCPM}</div>
                <div>Best accuracy {stats.bestAccuracy}%</div>
              </div>
            </div>
          </ActionModal>

          <ActionModal open={modal === 'dailyQuests'} title="Daily Quests" actionLabel="Close" onClose={() => setModal(null)}>
            {featureMessage && (
              <div className="rounded-[13px] border border-[#8ED47A] bg-[#ECFFD9] px-3 py-2 text-center text-sm font-black text-[#176D35]">
                {featureMessage}
              </div>
            )}
            <DailyQuestsPanel quests={dailyQuests} onClaim={handleDailyQuestClaim} />
          </ActionModal>

          <ActionModal open={modal === 'achievements'} title="Achievements" actionLabel="Close" onClose={() => setModal(null)}>
            <AchievementsPanel achievements={achievements} />
          </ActionModal>

          <ActionModal open={modal === 'settings'} title="Settings" actionLabel="Close" onClose={() => setModal(null)}>
            <SettingsPanel
              settings={settings}
              onChange={(nextSettings) => setSettings(saveAppSettings(nextSettings))}
              onResetProgress={handleResetProgress}
            />
          </ActionModal>

          <ActionModal open={modal === 'messages'} title="Messages" actionLabel="Close" onClose={() => setModal(null)}>
            <p>Notifications will collect quest reminders, teacher notes, and event rewards here. For now, claimable quest alerts are shown on the Daily Quests panel.</p>
          </ActionModal>
        </div>
      </AppLayout>
    </PageTransition>
  );
}
