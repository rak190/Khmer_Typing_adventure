import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Flame,
  Gem,
  Heart,
  Lock,
  Medal,
  Pencil,
  Save,
  ShoppingBag,
  Sparkles,
  Star,
  Swords,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { imageAssets } from '../assets/assetManifest';
import { PROFILE_AVATARS, PROFILE_COSMETICS, PROFILE_FRAMES, type AvatarConfig, type ProfileFrameConfig } from '../data/avatars';
import { PLAYER_TITLES, type PlayerTitleConfig } from '../data/playerTitles';
import AppLayout from '../components/layout/AppLayout';
import PageTransition from '../components/layout/PageTransition';
import GameButton from '../components/game-ui/GameButton';
import { subscribeToSession, type AppSession } from '../lib/firebase';
import { getActiveEconomyUserId, type EconomyInventoryItem } from '../lib/economy';
import { buildAchievementProgress } from '../lib/playerFeatures';
import { getStudentDashboardStats, loadStudentProgress, STUDENT_PROGRESS_EVENT, type StudentProgress } from '../lib/studentProgress';
import { useEconomyState, useInventoryState } from '../lib/useEconomyState';
import { USER_PROFILE_EVENT } from '../lib/userProfile';
import {
  getUserProfile,
  loadCachedGameProfile,
  updateDisplayName,
  updateEquippedAvatar,
  updateEquippedFrame,
  updateEquippedTitle,
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

function Panel({ children, className = '', title, icon }: { children: ReactNode; className?: string; title?: string; icon?: ReactNode }) {
  return (
    <section className={`rounded-[22px] border-[3px] border-[#C99031] bg-[#062F35]/90 p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,.34),inset_0_2px_0_rgba(255,255,255,.12)] ${className}`}>
      {title && (
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#FFCC57] bg-[#0B4B50] text-[#FFE68A] shadow-inner">
            {icon}
          </span>
          <h2 className="khmer-body text-xl font-black text-[#FFE6A6]">{title}</h2>
        </div>
      )}
      {children}
    </section>
  );
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-[16px] border border-[#70D4C2]/45 bg-[#052D34]/86 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0E5960] text-[#FFE6A6]">{icon}</span>
        <span className="min-w-0">
          <span className="block text-xs font-black uppercase text-[#9FDFD3]">{label}</span>
          <span className="block truncate text-xl font-black text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        </span>
      </div>
    </div>
  );
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
  if (avatar.id === 'jungle_typist' && stats.totalLessonsCompleted >= 1) return { unlocked: true, reason: 'Lesson unlocked' };
  if (avatar.id === 'guardian_apprentice' && stats.totalLessonsCompleted >= 3) return { unlocked: true, reason: 'Progress unlocked' };
  if (avatar.id === 'boss_victor_elephant' && bossPasses(progress) >= 1) return { unlocked: true, reason: 'Boss unlocked' };
  if (avatar.id === 'golden_typing_hero' && earnedStars(progress) >= 30) return { unlocked: true, reason: 'Stars unlocked' };
  if (avatar.id === 'jungle_master' && Math.max(progress.currentStreak, progress.longestStreak) >= 7) return { unlocked: true, reason: 'Streak unlocked' };
  if (avatar.id === 'accuracy_monk_avatar' && stats.bestAccuracy >= 95) return { unlocked: true, reason: 'Accuracy unlocked' };
  return { unlocked: false, reason: avatar.unlockRequirement };
}

function titleUnlockState(title: PlayerTitleConfig, profile: GameProfile, progress: StudentProgress, stats: ReturnType<typeof getStudentDashboardStats>): UnlockState {
  if (title.ownedByDefault || profile.unlockedTitles.includes(title.id)) return { unlocked: true, reason: 'Unlocked' };
  if (title.id === 'first_steps' && stats.totalLessonsCompleted >= 1) return { unlocked: true, reason: 'Lesson unlocked' };
  if (title.id === 'accuracy_monk' && stats.bestAccuracy >= 95) return { unlocked: true, reason: 'Accuracy unlocked' };
  if (title.id === 'speed_runner' && progress.lessonResults.some((result) => result.passed && result.CPM >= result.targetCPM)) return { unlocked: true, reason: 'CPM unlocked' };
  if (title.id === 'boss_victor' && bossPasses(progress) >= 1) return { unlocked: true, reason: 'Boss unlocked' };
  if (title.id === 'streak_starter' && Math.max(progress.currentStreak, progress.longestStreak) >= 3) return { unlocked: true, reason: 'Streak unlocked' };
  if (title.id === 'no_mistake_warrior' && progress.lessonResults.some((result) => result.passed && result.accuracy === 100 && result.mistakes === 0)) return { unlocked: true, reason: 'No mistake unlocked' };
  if (title.id === 'khmer_master' && stats.totalLessons > 0 && stats.totalLessonsCompleted >= stats.totalLessons) return { unlocked: true, reason: 'Path complete' };
  return { unlocked: false, reason: title.unlockRequirement };
}

function frameUnlockState(frame: ProfileFrameConfig, profile: GameProfile, progress: StudentProgress, inventory: EconomyInventoryItem[], stats: ReturnType<typeof getStudentDashboardStats>): UnlockState {
  if (frame.ownedByDefault || profile.unlockedFrames.includes(frame.id)) return { unlocked: true, reason: 'Unlocked' };
  if (frame.shopItemId && inventoryOwns(inventory, frame.shopItemId)) return { unlocked: true, reason: 'Owned from Shop' };
  if (frame.id === 'bronze_learner_frame' && stats.totalLessonsCompleted >= 1) return { unlocked: true, reason: 'Lesson unlocked' };
  if (frame.id === 'gold_accuracy_frame' && stats.bestAccuracy >= 95) return { unlocked: true, reason: 'Accuracy unlocked' };
  if (frame.id === 'boss_victor_frame' && bossPasses(progress) >= 1) return { unlocked: true, reason: 'Boss unlocked' };
  if (frame.id === 'seven_day_streak_frame' && Math.max(progress.currentStreak, progress.longestStreak) >= 7) return { unlocked: true, reason: 'Streak unlocked' };
  return { unlocked: false, reason: frame.unlockRequirement };
}

function messageClass(tone: ProfileMessage['tone']) {
  if (tone === 'success') return 'border-[#8ED47A] bg-[#123F25] text-[#DFFFD4]';
  if (tone === 'error') return 'border-[#FF7A66] bg-[#4A1712] text-[#FFD7D1]';
  return 'border-[#70D4C2] bg-[#0B3C43] text-[#DDF8EF]';
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const economy = useEconomyState();
  const inventory = useInventoryState();
  const [session, setSession] = useState<AppSession | null>(null);
  const [profile, setProfile] = useState<GameProfile>(() => loadCachedGameProfile());
  const [progress, setProgress] = useState<StudentProgress>(() => loadStudentProgress());
  const [editName, setEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.displayName);
  const [message, setMessage] = useState<ProfileMessage | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  const userId = session?.userId ?? getActiveEconomyUserId();
  const stats = useMemo(() => getStudentDashboardStats(progress), [progress]);
  const achievements = useMemo(() => buildAchievementProgress(progress), [progress]);
  const avatar = PROFILE_AVATARS.find((item) => item.id === profile.equippedAvatarId) ?? PROFILE_AVATARS[0];
  const title = PLAYER_TITLES.find((item) => item.id === profile.equippedTitleId) ?? PLAYER_TITLES[0];
  const frame = PROFILE_FRAMES.find((item) => item.id === profile.equippedFrameId) ?? PROFILE_FRAMES[0];
  const xp = Math.max(economy.typingXP, stats.totalXP);
  const level = Math.max(economy.level, stats.currentLevel);
  const levelProgress = levelXP(xp, level);
  const selectedBadge = achievements.find((item) => item.badgeId === selectedBadgeId);

  useEffect(() => subscribeToSession(setSession), []);

  useEffect(() => {
    let active = true;
    void getUserProfile(userId).then((nextProfile) => {
      if (!active) return;
      setProfile(nextProfile);
      setNameDraft(nextProfile.displayName);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    const refresh = () => {
      setProfile(loadCachedGameProfile(userId));
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

  const saveName = async () => {
    const clean = nameDraft.trim().replace(/\s+/g, ' ');
    if (clean.length < 2 || clean.length > 20) {
      showMessage('error', 'Name must be 2-20 characters.');
      return;
    }

    setSaving(true);
    try {
      const nextProfile = await updateDisplayName(userId, clean);
      setProfile(nextProfile);
      setNameDraft(nextProfile.displayName);
      setEditName(false);
      showMessage('success', 'Name updated!');
    } catch {
      showMessage('error', 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const equipAvatar = async (item: AvatarConfig) => {
    const state = avatarUnlockState(item, profile, progress, inventory, stats);
    if (!state.unlocked) {
      showMessage('info', state.reason);
      return;
    }
    try {
      const nextProfile = await updateEquippedAvatar(userId, item.id);
      setProfile(nextProfile);
      showMessage('success', 'Avatar equipped!');
    } catch {
      showMessage('error', 'Could not save. Try again.');
    }
  };

  const equipTitle = async (item: PlayerTitleConfig) => {
    const state = titleUnlockState(item, profile, progress, stats);
    if (!state.unlocked) {
      showMessage('info', state.reason);
      return;
    }
    try {
      const nextProfile = await updateEquippedTitle(userId, item.id);
      setProfile(nextProfile);
      showMessage('success', 'Title equipped!');
    } catch {
      showMessage('error', 'Could not save. Try again.');
    }
  };

  const equipFrame = async (item: ProfileFrameConfig) => {
    const state = frameUnlockState(item, profile, progress, inventory, stats);
    if (!state.unlocked) {
      showMessage('info', state.reason);
      return;
    }
    try {
      const nextProfile = await updateEquippedFrame(userId, item.id);
      setProfile(nextProfile);
      showMessage('success', 'Frame equipped!');
    } catch {
      showMessage('error', 'Could not save. Try again.');
    }
  };

  return (
    <PageTransition>
      <AppLayout>
        <main
          className="relative min-h-screen overflow-x-hidden px-4 py-5 text-white xl:px-6"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(3, 22, 25, .9), rgba(5, 45, 53, .48) 45%, rgba(3, 24, 28, .92)), linear-gradient(180deg, rgba(4, 31, 39, .1), rgba(3, 18, 21, .96)), url(${imageAssets.backgrounds.worldMap})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,232,119,.2),transparent_24%),radial-gradient(circle_at_90%_80%,rgba(74,204,92,.22),transparent_20%)]" />

          <div className="relative z-10 mx-auto max-w-[1540px] space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <GameButton variant="blue" size="sm" leftIcon={<ArrowLeft size={18} />} onClick={() => navigate(-1)}>
                Back
              </GameButton>
              <div className="text-right">
                <h1 className="khmer-body text-[34px] font-black leading-tight text-[#FFE6A6]">ប្រវត្តិអ្នកលេង / Profile</h1>
                <p className="font-bold text-[#D6F6EE]">Choose your avatar, title, frame, and show your Khmer typing progress.</p>
              </div>
            </header>

            {message && (
              <div className={`rounded-[16px] border px-4 py-3 text-center font-black ${messageClass(message.tone)}`}>
                {message.text}
              </div>
            )}

            <section className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
              <Panel className="xl:sticky xl:top-5 xl:self-start">
                <div className={`mx-auto grid h-64 w-64 place-items-center overflow-hidden rounded-[32px] border-[6px] bg-[#052D34]/90 ${frame.className}`}>
                  <img src={avatar.image} alt={avatar.name} className="h-full w-full object-contain drop-shadow-[0_20px_18px_rgba(0,0,0,.36)]" />
                </div>

                <div className="mt-4 text-center">
                  {editName ? (
                    <div className="space-y-3">
                      <label className="block text-left text-sm font-black text-[#FFE6A6]" htmlFor="profile-name">Display name</label>
                      <input
                        id="profile-name"
                        value={nameDraft}
                        maxLength={20}
                        onChange={(event) => setNameDraft(event.target.value)}
                        className="h-12 w-full rounded-[16px] border-2 border-[#DDBD70] bg-white/95 px-4 text-lg font-black text-[#17325A] outline-none focus:border-[#248CEC]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <GameButton variant="white" size="sm" onClick={() => { setEditName(false); setNameDraft(profile.displayName); }}>Cancel</GameButton>
                        <GameButton variant="green" size="sm" leftIcon={<Save size={16} />} disabled={saving} onClick={saveName}>
                          Save
                        </GameButton>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="khmer-body text-3xl font-black text-white">{profile.displayName}</h2>
                      <p className="mt-1 text-lg font-black text-[#FFE6A6]">{title.khmerName} / {title.name}</p>
                      <GameButton variant="gold" size="sm" className="mt-4" leftIcon={<Pencil size={16} />} onClick={() => setEditName(true)}>
                        Edit Profile
                      </GameButton>
                    </>
                  )}
                </div>

                <div className="mt-5 rounded-[18px] border border-[#70D4C2]/45 bg-[#052D34]/86 p-4">
                  <div className="flex items-center justify-between font-black">
                    <span>Level {level}</span>
                    <span>{levelProgress.current}/{levelProgress.target} XP</span>
                  </div>
                  <div className="mt-2 h-4 overflow-hidden rounded-full bg-black/35 shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#6DE24D] to-[#F7E55B]" style={{ width: `${levelProgress.percent}%` }} />
                  </div>
                </div>
              </Panel>

              <div className="space-y-5">
                <Panel title="Stats" icon={<Trophy size={24} />}>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile icon={<Heart size={22} fill="currentColor" className="text-[#FF4B3F]" />} label="Hearts" value={`${economy.hearts}/${economy.maxHearts}`} />
                    <StatTile icon={<img src={imageAssets.coin} alt="" className="h-6 w-6" />} label="Coins" value={economy.coins} />
                    <StatTile icon={<Gem size={23} fill="currentColor" className="text-[#C671FF]" />} label="Gems" value={economy.gems} />
                    <StatTile icon={<Zap size={23} fill="currentColor" className="text-[#38D6FF]" />} label="Typing XP" value={xp} />
                    <StatTile icon={<Flame size={23} fill="currentColor" className="text-[#FF8D2D]" />} label="Streak" value={`${Math.max(economy.streak, stats.currentStreak)} days`} />
                    <StatTile icon={<Sparkles size={23} />} label="Best Streak" value={`${Math.max(economy.longestStreak, stats.longestStreak)} days`} />
                    <StatTile icon={<BookOpen size={23} />} label="Lessons" value={`${stats.totalLessonsCompleted}/${stats.totalLessons}`} />
                    <StatTile icon={<Swords size={23} />} label="Bosses" value={bossPasses(progress)} />
                    <StatTile icon={<Target size={23} />} label="Accuracy" value={`${stats.averageAccuracy}%`} />
                    <StatTile icon={<Zap size={23} />} label="Best CPM" value={stats.bestCPM} />
                  </div>
                </Panel>

                <Panel title="Avatar Selection" icon={<Medal size={24} />}>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {PROFILE_AVATARS.map((item) => {
                      const unlock = avatarUnlockState(item, profile, progress, inventory, stats);
                      const equipped = item.id === profile.equippedAvatarId;
                      return (
                        <article key={item.id} className={`rounded-[18px] border-2 p-3 ${equipped ? 'border-[#FFE17B] bg-[#113F2B]' : 'border-[#4DBAA6]/65 bg-[#083F46]/88'}`}>
                          <div className="grid h-28 place-items-center rounded-[14px] bg-black/20">
                            <img src={item.image} alt={item.name} className={`h-full w-full object-contain ${unlock.unlocked ? '' : 'grayscale opacity-50'}`} />
                          </div>
                          <h3 className="mt-3 truncate font-black text-[#FFE6A6]">{item.khmerName}</h3>
                          <p className="truncate text-sm font-bold text-white">{item.name}</p>
                          <p className="mt-1 line-clamp-2 min-h-10 text-xs font-bold text-[#C9F5E8]">{unlock.unlocked ? item.description : unlock.reason}</p>
                          <GameButton
                            variant={unlock.unlocked ? equipped ? 'green' : 'gold' : 'white'}
                            size="sm"
                            className="mt-3 w-full"
                            disabled={equipped}
                            leftIcon={unlock.unlocked ? equipped ? <CheckCircle2 size={16} /> : <BadgeCheck size={16} /> : <Lock size={16} />}
                            onClick={() => equipAvatar(item)}
                            aria-label={`${equipped ? 'Equipped' : 'Equip'} ${item.name}`}
                          >
                            {equipped ? 'Equipped' : unlock.unlocked ? 'Equip' : 'Locked'}
                          </GameButton>
                        </article>
                      );
                    })}
                  </div>
                </Panel>

                <Panel title="Player Titles" icon={<Award size={24} />}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {PLAYER_TITLES.map((item) => {
                      const unlock = titleUnlockState(item, profile, progress, stats);
                      const equipped = item.id === profile.equippedTitleId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => equipTitle(item)}
                          className={`rounded-[16px] border-2 px-4 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70 ${equipped ? 'border-[#FFE17B] bg-[#113F2B]' : unlock.unlocked ? 'border-[#4DBAA6]/65 bg-[#083F46]/88 hover:-translate-y-0.5' : 'border-white/15 bg-black/24 opacity-75'}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span>
                              <span className="khmer-body block font-black text-[#FFE6A6]">{item.khmerName}</span>
                              <span className="block font-black text-white">{item.name}</span>
                            </span>
                            {equipped ? <CheckCircle2 className="text-[#7FE35E]" /> : unlock.unlocked ? <BadgeCheck className="text-[#FFE17B]" /> : <Lock className="text-white/54" />}
                          </div>
                          <p className="mt-2 text-sm font-bold text-[#C9F5E8]">{unlock.unlocked ? item.description : unlock.reason}</p>
                        </button>
                      );
                    })}
                  </div>
                </Panel>

                <Panel title="Frames & Cosmetics" icon={<ShoppingBag size={24} />}>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {PROFILE_FRAMES.map((item) => {
                      const unlock = frameUnlockState(item, profile, progress, inventory, stats);
                      const equipped = item.id === profile.equippedFrameId;
                      return (
                        <article key={item.id} className={`rounded-[16px] border-2 p-3 ${equipped ? 'border-[#FFE17B] bg-[#113F2B]' : 'border-[#4DBAA6]/65 bg-[#083F46]/88'}`}>
                          <div className={`grid h-16 place-items-center rounded-[14px] border-[5px] bg-[#052D34] ${item.className}`}>
                            <span className="font-black">{item.name}</span>
                          </div>
                          <p className="mt-3 text-sm font-bold text-[#C9F5E8]">{unlock.unlocked ? item.unlockRequirement : unlock.reason}</p>
                          <GameButton variant={unlock.unlocked ? equipped ? 'green' : 'gold' : 'white'} size="sm" className="mt-3 w-full" disabled={equipped} onClick={() => equipFrame(item)}>
                            {equipped ? 'Equipped' : unlock.unlocked ? 'Equip Frame' : 'Locked'}
                          </GameButton>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {PROFILE_COSMETICS.map((item) => {
                      const owned = inventoryOwns(inventory, item.shopItemId);
                      return (
                        <article key={item.id} className={`rounded-[16px] border-2 p-3 ${owned ? 'border-[#7FE35E] bg-[#113F2B]' : 'border-white/15 bg-black/24'}`}>
                          <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0E5960] text-[#FFE6A6]">
                              {owned ? <CheckCircle2 size={22} /> : <Lock size={22} />}
                            </span>
                            <span>
                              <span className="khmer-body block font-black text-[#FFE6A6]">{item.khmerName}</span>
                              <span className="block text-sm font-black text-white">{item.name}</span>
                            </span>
                          </div>
                          <p className="mt-2 min-h-12 text-sm font-bold text-[#C9F5E8]">{owned ? `${item.description} Owned / effect coming soon.` : item.unlockRequirement}</p>
                          {!owned && (
                            <GameButton variant="gold" size="sm" className="mt-2 w-full" onClick={() => navigate('/shop')}>
                              Buy in Shop
                            </GameButton>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </Panel>

                <Panel title="Badges & Achievements" icon={<Star size={24} />}>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {achievements.map((badge) => (
                      <button
                        key={badge.badgeId}
                        type="button"
                        onClick={() => setSelectedBadgeId(badge.badgeId)}
                        className={`rounded-[16px] border-2 p-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70 ${badge.unlocked ? 'border-[#FFE17B] bg-[#113F2B]' : 'border-white/15 bg-black/24 opacity-75'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#0E5960] text-[#FFE6A6]">
                            {badge.unlocked ? <Trophy size={24} /> : <Lock size={22} />}
                          </span>
                          <span>
                            <span className="block font-black text-white">{badge.badgeName}</span>
                            <span className="block text-xs font-bold text-[#C9F5E8]">{badge.progress}/{badge.total}</span>
                          </span>
                        </div>
                        {selectedBadgeId === badge.badgeId && (
                          <p className="mt-3 text-sm font-bold text-[#FFE6A6]">{badge.unlocked ? badge.description : badge.requirement}</p>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedBadge && (
                    <div className="mt-4 rounded-[16px] border border-[#70D4C2]/45 bg-[#052D34]/86 px-4 py-3 font-bold text-[#D6F6EE]">
                      <strong className="text-[#FFE6A6]">{selectedBadge.badgeName}:</strong> {selectedBadge.unlocked ? selectedBadge.description : selectedBadge.requirement}
                    </div>
                  )}
                </Panel>
              </div>
            </section>
          </div>
        </main>
      </AppLayout>
    </PageTransition>
  );
}
