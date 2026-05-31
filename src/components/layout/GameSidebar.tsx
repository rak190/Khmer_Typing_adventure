import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, CheckSquare, Home, Map, Settings, ShoppingBag, Swords, Trophy, UserRound } from 'lucide-react';
import ActionModal from '../game-ui/ActionModal';
import { AchievementsPanel, DailyQuestsPanel, SettingsPanel } from '../game-ui/FeaturePanels';
import Logo from '../game/Logo';
import AccountMenu from './AccountMenu';
import PlayerProfileBadge from '../profile/PlayerProfileBadge';
import GeneratedAvatar from '../profile/GeneratedAvatar';
import { resetLessonProgressRecords } from '../../data/mockData';
import { claimDailyQuestReward, getActiveEconomyUserId } from '../../lib/economy';
import { useDailyQuestClaimIds } from '../../lib/useEconomyState';
import { loadStudentProgress, resetStudentProgress } from '../../lib/studentProgress';
import { USER_PROFILE_EVENT } from '../../lib/userProfile';
import { loadCachedGameProfile } from '../../services/profileService';
import {
  buildAchievementProgress,
  buildDailyQuests,
  claimDailyQuest,
  loadAppSettings,
  resetFeatureProgressState,
  saveAppSettings,
} from '../../lib/playerFeatures';

const items = [
  { label: 'Dashboard', khmer: 'ផ្ទាំងគ្រប់គ្រង', to: '/dashboard', icon: Home },
  { label: 'World Map', khmer: 'ផែនទី', to: '/map', icon: Map },
  { label: 'Lessons', khmer: 'មេរៀន', to: '/lesson', icon: BookOpen },
  { label: 'Boss Battles', khmer: 'ប្រយុទ្ធ Boss', to: '/battle', icon: Swords },
  { label: 'Daily Quests', khmer: 'បេសកកម្មប្រចាំថ្ងៃ', action: 'dailyQuests' as const, icon: CheckSquare },
  { label: 'Shop', khmer: 'ហាង', to: '/shop', icon: ShoppingBag },
  { label: 'Achievements', khmer: 'សមិទ្ធផល', action: 'achievements' as const, icon: Trophy },
  { label: 'Profile', khmer: 'ប្រវត្តិរូប', to: '/profile', icon: UserRound },
  { label: 'Settings', khmer: 'ការកំណត់', action: 'settings' as const, icon: Settings },
];

export default function GameSidebar() {
  const [modal, setModal] = useState<'dailyQuests' | 'achievements' | 'settings' | null>(null);
  const [settings, setSettings] = useState(() => loadAppSettings());
  const [progress, setProgress] = useState(() => loadStudentProgress());
  const [profile, setProfile] = useState(() => loadCachedGameProfile());
  const [, setFeatureRevision] = useState(0);
  const [featureMessage, setFeatureMessage] = useState('');
  const dailyQuestClaimIds = useDailyQuestClaimIds();
  const dailyQuests = buildDailyQuests(progress, undefined, dailyQuestClaimIds);
  const achievements = buildAchievementProgress(progress);

  const handleResetProgress = () => {
    resetStudentProgress();
    resetFeatureProgressState();
    void resetLessonProgressRecords().catch((error) => console.error('Unable to reset lesson progress records.', error));
    setProgress(loadStudentProgress());
    setFeatureRevision((revision) => revision + 1);
  };

  useEffect(() => {
    const refreshProgress = () => setProgress(loadStudentProgress());
    window.addEventListener('khmer-student-progress-change', refreshProgress);
    return () => window.removeEventListener('khmer-student-progress-change', refreshProgress);
  }, []);

  useEffect(() => {
    const refreshProfile = () => setProfile(loadCachedGameProfile());
    window.addEventListener(USER_PROFILE_EVENT, refreshProfile);
    return () => window.removeEventListener(USER_PROFILE_EVENT, refreshProfile);
  }, []);

  const handleDailyQuestClaim = async (questId: string) => {
    const quest = dailyQuests.find((item) => item.id === questId);
    if (!quest || quest.status === 'claimed') {
      setFeatureMessage('Already claimed.');
      return;
    }
    if (quest.status !== 'claimable') return;

    try {
      const userId = getActiveEconomyUserId();
      if (userId) await claimDailyQuestReward(userId, quest.id, quest.reward);
      claimDailyQuest(questId);
      setFeatureMessage('Quest reward claimed!');
      setFeatureRevision((revision) => revision + 1);
    } catch (error) {
      setFeatureMessage(error instanceof Error ? error.message : 'Saved locally. Sync will retry.');
    }
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-x-visible overflow-y-auto border-r-2 border-[#A4772C]/70 bg-gradient-to-b from-[#05333B] via-[#062D36] to-[#041B24] px-5 py-5 shadow-2xl xl:w-80 lg:block">
      <Link
        to="/"
        className="mb-6 block w-fit origin-left transition hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70"
        aria-label="Go to homepage"
      >
        <Logo compact className="origin-left scale-110" />
      </Link>
      <div className="mb-4">
        <AccountMenu variant="topbar" />
      </div>
      <nav className="space-y-1.5" aria-label="Game navigation">
        {items.map((item) => {
          const Icon = item.icon;
          if ('action' in item) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setModal(item.action)}
                className="relative flex w-full items-center gap-3 border-b border-[#75B9AE]/12 px-3 py-3 text-left font-black text-[#F2E7C7] transition hover:bg-white/10 hover:text-[#FFE7A6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE66B]/70"
              >
                <Icon size={24} className="shrink-0 text-[#EEDDB6]" />
                <span className="min-w-0 leading-tight">
                  <span className="khmer-body block text-sm">{item.khmer}</span>
                  <span className="block text-sm">{item.label}</span>
                </span>
                {item.action === 'dailyQuests' && dailyQuests.some((quest) => quest.status === 'claimable') && (
                  <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-[#F05B4F] px-1.5 text-xs font-black text-white">
                    {dailyQuests.filter((quest) => quest.status === 'claimable').length}
                  </span>
                )}
              </button>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 border-b border-[#75B9AE]/12 px-3 py-3 font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE66B]/70 ${
                  isActive
                    ? 'rounded-l-[14px] border-b-transparent bg-gradient-to-r from-[#D89116] to-[#B8730B] text-white shadow-[inset_0_-4px_0_rgba(0,0,0,.16),0_8px_14px_rgba(0,0,0,.24)] after:absolute after:-right-5 after:top-0 after:h-full after:w-6 after:bg-[#B8730B] after:[clip-path:polygon(0_0,100%_50%,0_100%)]'
                    : 'text-[#F2E7C7] hover:bg-white/10 hover:text-[#FFE7A6]'
                }`
              }
            >
              {item.label === 'Profile' ? (
                <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#FFE17B] bg-[#0B4A50] shadow-[0_0_12px_rgba(255,225,123,.28)]">
                  <GeneratedAvatar
                    avatarId={profile.equippedAvatarId}
                    skinStyleId={profile.equippedSkinId}
                    themeId={profile.equippedThemeId}
                    frameId={profile.equippedFrameId}
                    artStyle="illustration"
                    iconOnly
                    level={Math.max(1, progress.currentLevel)}
                    size="100%"
                    ariaLabel={`${profile.displayName || 'Guest'} avatar`}
                  />
                </span>
              ) : (
                <Icon size={24} className="shrink-0 text-[#EEDDB6]" />
              )}
              <span className="min-w-0 leading-tight">
                <span className="khmer-body block text-sm">{item.khmer}</span>
                <span className="block text-sm">{item.label}</span>
              </span>
            </NavLink>
          );
        })}
      </nav>
      <NavLink to="/profile" className="mt-8 block rounded-[18px] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70">
        <PlayerProfileBadge size="large" showXP showTitle showLevel />
      </NavLink>
      <ActionModal open={modal === 'dailyQuests'} title="បេសកកម្មប្រចាំថ្ងៃ" onClose={() => setModal(null)}>
        {featureMessage && (
          <div className="rounded-[13px] border border-[#8ED47A] bg-[#ECFFD9] px-3 py-2 text-center text-sm font-black text-[#176D35]">
            {featureMessage}
          </div>
        )}
        <DailyQuestsPanel quests={dailyQuests} onClaim={handleDailyQuestClaim} />
      </ActionModal>
      <ActionModal open={modal === 'achievements'} title="សមិទ្ធផល" onClose={() => setModal(null)}>
        <AchievementsPanel achievements={achievements} />
      </ActionModal>
      <ActionModal open={modal === 'settings'} title="ការកំណត់" onClose={() => setModal(null)}>
        <SettingsPanel
          settings={settings}
          onChange={(nextSettings) => setSettings(saveAppSettings(nextSettings))}
          onResetProgress={handleResetProgress}
        />
      </ActionModal>
    </aside>
  );
}
