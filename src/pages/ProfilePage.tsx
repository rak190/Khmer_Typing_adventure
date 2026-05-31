import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Flame,
  Lock,
  Save,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { imageAssets } from '../assets/assetManifest';
import { PROFILE_AVATARS, type AvatarCategory, type AvatarConfig } from '../data/avatars';
import { PLAYER_TITLES, type PlayerTitleConfig } from '../data/playerTitles';
import { PROFILE_THEMES, type ProfileThemeConfig } from '../data/profileThemes';
import AppLayout from '../components/layout/AppLayout';
import PageTransition from '../components/layout/PageTransition';
import GameButton from '../components/game-ui/GameButton';
import GeneratedAvatar from '../components/profile/GeneratedAvatar';
import { subscribeToSession, type AppSession } from '../lib/firebase';
import { getActiveEconomyUserId, type EconomyInventoryItem } from '../lib/economy';
import { getStudentDashboardStats, loadStudentProgress, STUDENT_PROGRESS_EVENT, type StudentProgress } from '../lib/studentProgress';
import { useEconomyState, useInventoryState } from '../lib/useEconomyState';
import { USER_PROFILE_EVENT } from '../lib/userProfile';
import {
  getUserProfile,
  loadCachedGameProfile,
  saveProfile,
  type GameProfile,
} from '../services/profileService';

type ProfileMessage = {
  tone: 'success' | 'error' | 'info';
  text: string;
};

type UnlockState = {
  unlocked: boolean;
  reason: string;
};

type ProfileDraft = Pick<GameProfile, 'displayName' | 'equippedAvatarId' | 'equippedSkinId' | 'equippedThemeId' | 'equippedTitleId'>;

type AvatarTab = {
  id: AvatarCategory;
  label: string;
  icon: ReactNode;
};

const avatarTabs: AvatarTab[] = [
  { id: 'heroes', label: 'Heroes', icon: <Trophy size={17} /> },
  { id: 'creatures', label: 'Creatures', icon: <Sparkles size={17} /> },
  { id: 'spirits', label: 'Spirits', icon: <Flame size={17} /> },
  { id: 'scholars', label: 'Scholars', icon: <BookOpen size={17} /> },
];

const visibleThemes = PROFILE_THEMES.filter((theme) => theme.id !== 'jade_palace');

const titleLabels: Record<string, string> = {
  typing_hero: 'Temple Scribe',
  first_steps: 'Jungle Typist',
  speed_runner: 'Speed Runner',
  accuracy_monk: 'Accuracy Monk',
  boss_victor: 'Boss Victor',
  streak_starter: 'Legendary Writer',
  no_mistake_warrior: 'Glyph Master',
  khmer_master: 'Ancient Sage',
};

function makeDraft(profile: GameProfile): ProfileDraft {
  return {
    displayName: profile.displayName,
    equippedAvatarId: profile.equippedAvatarId,
    equippedSkinId: profile.equippedSkinId,
    equippedThemeId: profile.equippedThemeId,
    equippedTitleId: profile.equippedTitleId,
  };
}

function draftsEqual(a: ProfileDraft, b: ProfileDraft) {
  return a.displayName === b.displayName
    && a.equippedAvatarId === b.equippedAvatarId
    && a.equippedSkinId === b.equippedSkinId
    && a.equippedThemeId === b.equippedThemeId
    && a.equippedTitleId === b.equippedTitleId;
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

function levelXP(totalXP: number, level: number) {
  const start = xpThresholdForLevel(level);
  const end = xpThresholdForLevel(level + 1);
  const target = Math.max(1, end - start);
  const current = Math.max(0, Math.min(target, totalXP - start));
  return { current, target, percent: Math.round((current / target) * 100) };
}

function bossPasses(progress: StudentProgress) {
  return progress.lessonResults.filter((result) => result.passed && (result.difficulty === 'boss' || result.lessonId.includes('boss'))).length;
}

function earnedStars(progress: StudentProgress) {
  return progress.lessonResults.reduce((total, result) => total + result.stars, 0);
}

function inventoryOwns(inventory: EconomyInventoryItem[], itemId?: string) {
  if (!itemId) return false;
  return inventory.some((item) => item.itemId === itemId && (item.owned || item.quantity > 0));
}

function avatarUnlockState(avatar: AvatarConfig, profile: GameProfile, progress: StudentProgress, inventory: EconomyInventoryItem[], stats: ReturnType<typeof getStudentDashboardStats>): UnlockState {
  if (avatar.ownedByDefault || profile.unlockedAvatars.includes(avatar.id)) return { unlocked: true, reason: 'Unlocked' };
  if (avatar.shopItemId && inventoryOwns(inventory, avatar.shopItemId)) return { unlocked: true, reason: 'Owned from Shop' };
  if (avatar.id === 'jungle_typist' && stats.totalLessonsCompleted >= 1) return { unlocked: true, reason: 'Complete 1 lesson' };
  if (avatar.id === 'guardian_apprentice' && stats.totalLessonsCompleted >= 3) return { unlocked: true, reason: 'Complete 3 lessons' };
  if (avatar.id === 'boss_victor_elephant' && bossPasses(progress) >= 1) return { unlocked: true, reason: 'Pass 1 Boss' };
  if (avatar.id === 'golden_typing_hero' && earnedStars(progress) >= 30) return { unlocked: true, reason: 'Earn 30 stars' };
  if (avatar.id === 'jungle_master' && Math.max(progress.currentStreak, progress.longestStreak) >= 7) return { unlocked: true, reason: 'Reach a 7-day streak' };
  if (avatar.id === 'accuracy_monk_avatar' && stats.bestAccuracy >= 95) return { unlocked: true, reason: 'Reach 95% accuracy' };
  return { unlocked: false, reason: avatar.unlockRequirement };
}

function titleUnlockState(title: PlayerTitleConfig, profile: GameProfile, progress: StudentProgress, stats: ReturnType<typeof getStudentDashboardStats>): UnlockState {
  if (title.ownedByDefault || profile.unlockedTitles.includes(title.id)) return { unlocked: true, reason: 'Unlocked' };
  if (title.id === 'first_steps' && stats.totalLessonsCompleted >= 1) return { unlocked: true, reason: 'Complete 1 lesson' };
  if (title.id === 'accuracy_monk' && stats.bestAccuracy >= 95) return { unlocked: true, reason: 'Reach 95% accuracy' };
  if (title.id === 'speed_runner' && progress.lessonResults.some((result) => result.passed && result.CPM >= result.targetCPM)) return { unlocked: true, reason: 'Meet a CPM target' };
  if (title.id === 'boss_victor' && bossPasses(progress) >= 1) return { unlocked: true, reason: 'Pass 1 Boss' };
  if (title.id === 'streak_starter' && Math.max(progress.currentStreak, progress.longestStreak) >= 3) return { unlocked: true, reason: 'Reach a 3-day streak' };
  if (title.id === 'no_mistake_warrior' && progress.lessonResults.some((result) => result.passed && result.accuracy === 100 && result.mistakes === 0)) return { unlocked: true, reason: '100% accuracy, 0 mistakes' };
  if (title.id === 'khmer_master' && stats.totalLessons > 0 && stats.totalLessonsCompleted >= stats.totalLessons) return { unlocked: true, reason: 'Complete all lessons' };
  return { unlocked: false, reason: title.unlockRequirement };
}

function themeUnlockState(theme: ProfileThemeConfig, profile: GameProfile, progress: StudentProgress): UnlockState {
  if (theme.defaultUnlocked || profile.unlockedThemes.includes(theme.id)) return { unlocked: true, reason: 'Unlocked' };
  if (theme.id === 'jade_palace' && Math.max(progress.currentStreak, progress.longestStreak) >= 7) return { unlocked: true, reason: 'Reach a 7-day streak' };
  if (theme.id === 'storm_citadel' && bossPasses(progress) >= 1) return { unlocked: true, reason: 'Pass 1 Boss Battle' };
  return { unlocked: false, reason: theme.unlockRequirement };
}

function messageClass(tone: ProfileMessage['tone']) {
  if (tone === 'success') return 'border-[#8ED47A] bg-[#123F25] text-[#DFFFD4]';
  if (tone === 'error') return 'border-[#FF7A66] bg-[#4A1712] text-[#FFD7D1]';
  return 'border-[#70D4C2] bg-[#0B3C43] text-[#DDF8EF]';
}

function StepPanel({ number, title, children, className = '' }: { number: number; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`relative rounded-[16px] border border-[#A9772F] bg-[#051927]/88 p-3 shadow-[inset_0_1px_0_rgba(255,232,154,.16),0_14px_28px_rgba(0,0,0,.28)] ${className}`}>
      <div className="mb-2 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 rotate-45 place-items-center border-2 border-[#C58A34] bg-[#082239] text-[#FFE39C] shadow-[0_0_14px_rgba(255,188,73,.25)]">
          <span className="-rotate-45 font-black">{number}</span>
        </span>
        <h2 className="text-xl font-black text-[#F4D18A]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PreviewStat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string | number; tone: string }) {
  return (
    <div className="flex min-h-[78px] items-center gap-3 border border-[#9D6E2C]/70 bg-[#061B29]/80 px-4 py-3 shadow-inner">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tone}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-[#F5D79B]">{label}</span>
        <span className="block truncate text-2xl font-black text-white">{value}</span>
      </span>
    </div>
  );
}

function titleName(titleId: string) {
  return titleLabels[titleId] ?? PLAYER_TITLES.find((item) => item.id === titleId)?.name ?? 'Temple Scribe';
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const economy = useEconomyState();
  const inventory = useInventoryState();
  const [session, setSession] = useState<AppSession | null>(null);
  const [profile, setProfile] = useState<GameProfile>(() => loadCachedGameProfile());
  const [draft, setDraft] = useState<ProfileDraft>(() => makeDraft(loadCachedGameProfile()));
  const [progress, setProgress] = useState<StudentProgress>(() => loadStudentProgress());
  const [message, setMessage] = useState<ProfileMessage | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('heroes');

  const userId = session?.userId ?? getActiveEconomyUserId();
  const stats = useMemo(() => getStudentDashboardStats(progress), [progress]);
  const xp = Math.max(economy.typingXP, stats.totalXP);
  const level = Math.max(economy.level, stats.currentLevel);
  const levelProgress = levelXP(xp, level);
  const hasChanges = !draftsEqual(draft, makeDraft(profile));
  const activeTheme = PROFILE_THEMES.find((item) => item.id === draft.equippedThemeId) ?? PROFILE_THEMES[0];
  const visibleAvatars = PROFILE_AVATARS.filter((item) => item.category === activeCategory);
  const currentAvatar = PROFILE_AVATARS.find((item) => item.id === draft.equippedAvatarId) ?? PROFILE_AVATARS[0];

  useEffect(() => subscribeToSession(setSession), []);

  useEffect(() => {
    let active = true;
    void getUserProfile(userId).then((nextProfile) => {
      if (!active) return;
      setProfile(nextProfile);
      setDraft(makeDraft(nextProfile));
      const nextAvatar = PROFILE_AVATARS.find((item) => item.id === nextProfile.equippedAvatarId);
      if (nextAvatar) setActiveCategory(nextAvatar.category);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    const refresh = () => {
      const nextProfile = loadCachedGameProfile(userId);
      setProfile(nextProfile);
      setDraft(makeDraft(nextProfile));
      setProgress(loadStudentProgress());
    };
    window.addEventListener(USER_PROFILE_EVENT, refresh);
    window.addEventListener(STUDENT_PROGRESS_EVENT, refresh);
    return () => {
      window.removeEventListener(USER_PROFILE_EVENT, refresh);
      window.removeEventListener(STUDENT_PROGRESS_EVENT, refresh);
    };
  }, [userId]);

  const showMessage = (tone: ProfileMessage['tone'], text: string) => setMessage({ tone, text });

  const updateDraft = (fields: Partial<ProfileDraft>) => {
    setDraft((current) => ({ ...current, ...fields }));
    setMessage(null);
  };

  const selectAvatar = (item: AvatarConfig) => {
    const state = avatarUnlockState(item, profile, progress, inventory, stats);
    if (!state.unlocked) {
      showMessage('info', state.reason);
      return;
    }
    updateDraft({ equippedAvatarId: item.id });
  };

  const selectTitle = (item: PlayerTitleConfig) => {
    const state = titleUnlockState(item, profile, progress, stats);
    if (!state.unlocked) {
      showMessage('info', state.reason);
      return;
    }
    updateDraft({ equippedTitleId: item.id });
  };

  const selectTheme = (item: ProfileThemeConfig) => {
    const state = themeUnlockState(item, profile, progress);
    if (!state.unlocked) {
      showMessage('info', state.reason);
      return;
    }
    updateDraft({ equippedThemeId: item.id });
  };

  const handleSave = async () => {
    const cleanName = draft.displayName.trim().replace(/\s+/g, ' ');
    if (cleanName.length < 2 || cleanName.length > 20) {
      showMessage('error', 'Name must be 2-20 characters.');
      return;
    }

    setSaving(true);
    try {
      const nextProfile = await saveProfile(userId, { ...draft, displayName: cleanName });
      setProfile(nextProfile);
      setDraft(makeDraft(nextProfile));
      showMessage('success', 'Profile saved!');
    } catch {
      showMessage('error', 'Could not save profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <AppLayout>
        <main
          className="relative min-h-screen overflow-x-hidden px-3 py-4 text-white lg:px-5"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(2, 13, 17, .96), rgba(3, 25, 35, .82) 46%, rgba(2, 13, 17, .96)), linear-gradient(180deg, rgba(6, 28, 35, .22), rgba(1, 10, 12, .96)), url(${imageAssets.backgrounds.worldMap})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_4%,rgba(255,206,100,.18),transparent_20%),radial-gradient(circle_at_85%_70%,rgba(50,190,210,.12),transparent_22%)]" />

          <div className="relative z-10 mx-auto max-w-[1560px]">
            <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <GameButton variant="blue" size="sm" leftIcon={<ArrowLeft size={18} />} onClick={() => navigate(-1)}>
                Back
              </GameButton>
              <div className="text-center">
                <h1 className="text-[34px] font-black leading-none text-[#FFD66D] drop-shadow-[0_3px_0_rgba(38,19,0,.9)] lg:text-[44px]">Character Profile</h1>
                <div className="mx-auto mt-2 h-px max-w-[320px] bg-gradient-to-r from-transparent via-[#D49A3B] to-transparent" />
              </div>
              <GameButton
                variant="gold"
                size="sm"
                leftIcon={<Save size={18} />}
                disabled={saving}
                onClick={handleSave}
                aria-label="Save profile changes"
              >
                {saving ? 'Saving' : 'Save Changes'}
              </GameButton>
            </header>

            {message && (
              <div className={`mt-3 rounded-[12px] border px-4 py-2 text-center font-black ${messageClass(message.tone)}`}>
                {message.text}
              </div>
            )}

            <section className="mt-4 grid gap-4 xl:grid-cols-[430px_minmax(0,1fr)] 2xl:grid-cols-[470px_minmax(0,1fr)]">
              <aside className="relative overflow-hidden rounded-[18px] border-2 border-[#B77A2B] bg-[#041723]/92 p-3 shadow-[0_22px_44px_rgba(0,0,0,.45),inset_0_0_0_1px_rgba(255,223,145,.18)]">
                <div className="pointer-events-none absolute inset-2 rounded-[14px] border border-[#644319]" />
                <div className="relative overflow-hidden rounded-[14px] border border-[#7D5724] bg-gradient-to-b from-[#082943] via-[#08333A] to-[#04141C] px-4 pt-5">
                  <img src={activeTheme.artwork} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-[.82]" draggable={false} />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-[#031827]/16 to-[#020B10]/74" />
                  <div className="absolute inset-0 opacity-75 mix-blend-screen" style={{ background: `radial-gradient(circle at 48% 18%, ${activeTheme.colors.glow}4d, transparent 28%), linear-gradient(135deg, transparent, ${activeTheme.colors.sky}66 62%, ${activeTheme.colors.ground}99)` }} />
                  <div className="absolute left-8 top-7 h-28 w-28 rounded-full border border-[#D9F3FF]/40 bg-[#D9F3FF]/10 blur-[1px]" />
                  <div className="absolute bottom-7 left-8 right-8 h-12 rounded-[50%] bg-black/30 blur-sm" />
                  <div className="relative mx-auto h-[265px] w-[265px] lg:h-[300px] lg:w-[300px]">
                    <GeneratedAvatar
                      avatarId={draft.equippedAvatarId}
                      skinStyleId={draft.equippedSkinId}
                      themeId={draft.equippedThemeId}
                      frameId={profile.equippedFrameId}
                      titleId={draft.equippedTitleId}
                      artStyle="illustration"
                      level={level}
                      size="100%"
                      showLevelBadge
                      ariaLabel={`${currentAvatar.name} generated character avatar`}
                    />
                  </div>
                </div>

                <div className="relative px-4 py-4 text-center">
                  <h2 className="truncate text-[30px] font-black text-white drop-shadow">{draft.displayName.trim() || 'Typing Hero'}</h2>
                  <div className="mx-auto mt-1 inline-flex min-w-[190px] items-center justify-center rounded-full border border-[#C68B34] bg-[#061A28] px-5 py-1 text-lg font-black text-[#FFD766] shadow-[0_0_16px_rgba(255,202,82,.22)]">
                    {titleName(draft.equippedTitleId)}
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-sm font-black">
                      <span className="text-[#4ED3FF]">XP</span>
                      <span>{levelProgress.current.toLocaleString()} / {levelProgress.target.toLocaleString()}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border border-[#65A6B6]/40 bg-black/45">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#189CDE] to-[#34E4E4]" style={{ width: `${levelProgress.percent}%` }} />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-[14px] border border-[#9D6E2C]/80">
                    <PreviewStat icon={<Zap size={28} />} label="Best CPM" value={stats.bestCPM || stats.averageCPM} tone="bg-[#173F36] text-[#A4EF69]" />
                    <PreviewStat icon={<Target size={28} />} label="Accuracy" value={`${stats.bestAccuracy || stats.averageAccuracy}%`} tone="bg-[#301D4A] text-[#C77DFF]" />
                    <PreviewStat icon={<Flame size={28} />} label="Streak" value={`${Math.max(economy.streak, stats.currentStreak)} Days`} tone="bg-[#4B2515] text-[#FF9D37]" />
                    <PreviewStat icon={<BookOpen size={28} />} label="Lessons" value={stats.totalLessonsCompleted} tone="bg-[#143454] text-[#45B9FF]" />
                  </div>
                </div>
              </aside>

              <div className="space-y-3">
                <StepPanel number={1} title="Display Name">
                  <label className="sr-only" htmlFor="profile-display-name">Display name</label>
                  <div className="flex items-center gap-3 rounded-[12px] border border-[#516474] bg-[#061725] px-4 py-2 focus-within:border-[#D7A041]">
                    <input
                      id="profile-display-name"
                      value={draft.displayName}
                      maxLength={20}
                      onChange={(event) => updateDraft({ displayName: event.target.value })}
                      className="h-10 min-w-0 flex-1 bg-transparent text-xl font-black text-[#F7E8CA] outline-none"
                      aria-describedby="profile-name-rule"
                    />
                    <span className="text-[#D7B27B]" aria-hidden="true">Edit</span>
                  </div>
                  <p id="profile-name-rule" className="mt-1 text-xs font-bold text-[#9DC6C2]">2-20 characters. Khmer and English are welcome.</p>
                </StepPanel>

                <StepPanel number={2} title="Avatar">
                  <div className="flex flex-wrap gap-2">
                    {avatarTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveCategory(tab.id)}
                        className={`flex min-w-[132px] items-center justify-center gap-2 rounded-[9px] border px-4 py-2 font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70 ${activeCategory === tab.id ? 'border-[#F5C15C] bg-gradient-to-b from-[#F6C45C] to-[#9B6112] text-[#211100] shadow-[0_0_14px_rgba(255,198,79,.55)]' : 'border-[#52616A] bg-[#071927] text-[#D8D0BF] hover:border-[#B78943]'}`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2 md:grid-cols-6 xl:grid-cols-8">
                    {visibleAvatars.map((item) => {
                      const unlock = avatarUnlockState(item, profile, progress, inventory, stats);
                      const selected = item.id === draft.equippedAvatarId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={!unlock.unlocked}
                          title={unlock.unlocked ? item.name : unlock.reason}
                          onClick={() => selectAvatar(item)}
                          aria-label={`${selected ? 'Selected' : 'Select'} ${item.name} avatar`}
                          className={`relative grid aspect-square min-h-[76px] place-items-center rounded-[10px] border bg-[#071927] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70 ${selected ? 'border-[#FFD45E] shadow-[0_0_18px_rgba(255,207,73,.68)]' : unlock.unlocked ? 'border-[#846B37] hover:border-[#E1AA47]' : 'border-white/15 opacity-55 grayscale'}`}
                        >
                          <GeneratedAvatar
                            avatarId={item.id}
                            skinStyleId={draft.equippedSkinId}
                            themeId={draft.equippedThemeId}
                            frameId={profile.equippedFrameId}
                            titleId={draft.equippedTitleId}
                            artStyle="illustration"
                            level={level}
                            size="82%"
                            ariaLabel={`${item.name} avatar option`}
                          />
                          {selected && <CheckCircle2 className="absolute bottom-1 right-1 rounded-full bg-[#2B8D31] text-[#F7FFD7]" size={24} fill="currentColor" />}
                          {!unlock.unlocked && <Lock className="absolute bottom-2 right-2 rounded bg-black/70 p-0.5 text-[#EFE3CE]" size={21} />}
                        </button>
                      );
                    })}
                  </div>
                </StepPanel>

                <StepPanel number={3} title="Appearance">
                  <div>
                    <div className="mb-2 text-sm font-black text-[#F4D18A]">Theme</div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                      {visibleThemes.map((item) => {
                        const unlock = themeUnlockState(item, profile, progress);
                        const selected = item.id === draft.equippedThemeId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            disabled={!unlock.unlocked}
                            title={unlock.unlocked ? item.name : unlock.reason}
                            onClick={() => selectTheme(item)}
                            aria-label={`${selected ? 'Selected' : 'Select'} ${item.name} theme`}
                            className={`relative overflow-hidden rounded-[12px] border p-1.5 text-center transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70 ${selected ? 'border-[#FFD45E] shadow-[0_0_18px_rgba(255,207,73,.7)]' : unlock.unlocked ? 'border-[#80612D] hover:border-[#DBA54B]' : 'border-white/15 opacity-55 grayscale'}`}
                          >
                            <span className="relative block h-24 overflow-hidden rounded-[8px] bg-[#061927] md:h-28 xl:h-24">
                              <img src={item.artwork} alt="" className="h-full w-full object-cover saturate-[1.08]" draggable={false} />
                              <span className="absolute inset-0 bg-gradient-to-t from-black/34 via-transparent to-transparent" />
                              <span className="absolute inset-0 opacity-45 mix-blend-screen" style={{ background: `radial-gradient(circle at 68% 28%, ${item.colors.glow}99, transparent 32%)` }} />
                            </span>
                            <span className="mt-1.5 block truncate text-sm font-black text-[#F2DEB4]">{item.name}</span>
                            {selected && <CheckCircle2 className="absolute right-2 top-2 rounded-full bg-[#2B8D31] text-[#F7FFD7]" size={24} fill="currentColor" />}
                            {!unlock.unlocked && <Lock className="absolute right-2 top-2 rounded bg-black/70 p-0.5 text-[#EFE3CE]" size={22} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </StepPanel>

                <StepPanel number={4} title="Title">
                  <div className="flex flex-wrap gap-2">
                    {PLAYER_TITLES.map((item) => {
                      const unlock = titleUnlockState(item, profile, progress, stats);
                      const selected = item.id === draft.equippedTitleId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={!unlock.unlocked}
                          title={unlock.unlocked ? item.description : unlock.reason}
                          onClick={() => selectTitle(item)}
                          aria-label={`${selected ? 'Selected' : 'Select'} ${titleName(item.id)} title`}
                          className={`relative min-h-11 rounded-full border px-5 py-2 font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70 ${selected ? 'border-[#FFD45E] bg-[#241804] text-[#FFD868] shadow-[0_0_17px_rgba(255,209,78,.58)]' : unlock.unlocked ? 'border-[#478942] bg-[#0A3A23] text-[#D8FFB5] hover:border-[#8EE36E]' : 'border-white/15 bg-black/28 text-[#9F9588] opacity-75'}`}
                        >
                          <span>{titleName(item.id)}</span>
                          {selected && <CheckCircle2 className="absolute -bottom-1 -right-1 rounded-full bg-[#2B8D31] text-[#F7FFD7]" size={20} fill="currentColor" />}
                          {!unlock.unlocked && <Lock className="mr-2 inline-block" size={15} />}
                        </button>
                      );
                    })}
                  </div>
                </StepPanel>

                {hasChanges && (
                  <div className="rounded-[12px] border border-[#D8A348]/65 bg-[#201606]/80 px-4 py-2 text-center text-sm font-black text-[#FFE5A2]">
                    Unsaved changes are previewing live. Use Save Changes to keep them.
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </AppLayout>
    </PageTransition>
  );
}
