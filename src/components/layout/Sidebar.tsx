import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, CheckSquare, Home, Map, Settings, ShoppingBag, Swords, Trophy } from 'lucide-react';
import ActionModal from '../game-ui/ActionModal';
import { AchievementsPanel, DailyQuestsPanel, SettingsPanel, TreasurePanel } from '../game-ui/FeaturePanels';
import Logo from '../game/Logo';
import CharacterPlaceholder from '../characters/CharacterPlaceholder';
import AccountMenu from './AccountMenu';
import { resetLessonProgressRecords } from '../../data/mockData';
import { PLAYER_TITLES } from '../../data/playerTitles';
import { claimDailyQuestReward, claimEconomyReward, getActiveEconomyUserId, purchaseShopItem, shopItems } from '../../lib/economy';
import { useDailyQuestClaimIds, useEconomyState, useInventoryState, useRewardClaimIds } from '../../lib/useEconomyState';
import { loadStudentProgress, resetStudentProgress } from '../../lib/studentProgress';
import { USER_PROFILE_EVENT } from '../../lib/userProfile';
import { loadCachedGameProfile } from '../../services/profileService';
import {
  buildAchievementProgress,
  buildDailyQuests,
  buildTreasureRewards,
  claimDailyQuest,
  claimTreasureReward,
  loadAppSettings,
  resetFeatureProgressState,
  saveAppSettings,
} from '../../lib/playerFeatures';
import GeneratedAvatar from '../profile/GeneratedAvatar';

const items = [
  { label: 'Dashboard', khmer: 'ផ្ទាំងគ្រប់គ្រង', to: '/dashboard', icon: Home },
  { label: 'World Map', khmer: 'ផែនទី', to: '/map', icon: Map },
  { label: 'Lessons', khmer: 'មេរៀន', to: '/lesson', icon: BookOpen },
  { label: 'Boss Battles', khmer: 'ប្រយុទ្ធ Boss', to: '/battle', icon: Swords },
  { label: 'Daily Quests', khmer: 'បេសកកម្មប្រចាំថ្ងៃ', action: 'dailyQuests' as const, icon: CheckSquare },
  { label: 'Shop', khmer: 'ហាង', to: '/shop', icon: ShoppingBag },
  { label: 'Achievements', khmer: 'សមិទ្ធផល', action: 'achievements' as const, icon: Trophy },
  { label: 'Settings', khmer: 'កំណត់', action: 'settings' as const, icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [modal, setModal] = useState<'rewards' | 'dailyQuests' | 'achievements' | 'settings' | null>(null);
  const [settings, setSettings] = useState(() => loadAppSettings());
  const [progress, setProgress] = useState(() => loadStudentProgress());
  const [profile, setProfile] = useState(() => loadCachedGameProfile());
  const [, setFeatureRevision] = useState(0);
  const [featureMessage, setFeatureMessage] = useState('');
  const [purchasingItemId, setPurchasingItemId] = useState<string | undefined>();
  const economy = useEconomyState();
  const inventory = useInventoryState();
  const treasureClaimIds = useRewardClaimIds('treasure');
  const dailyQuestClaimIds = useDailyQuestClaimIds();
  const rewards = buildTreasureRewards(progress, treasureClaimIds);
  const dailyQuests = buildDailyQuests(progress, undefined, dailyQuestClaimIds);
  const achievements = buildAchievementProgress(progress);
  const earnedStars = progress.lessonResults.reduce((total, result) => total + result.stars, 0);
  const playerXP = Math.max(economy.typingXP, progress.totalXP);
  const playerLevel = Math.max(economy.level, progress.currentLevel);
  const playerXPGoal = Math.max(100, playerLevel * 100);
  const playerXPInLevel = playerXP % playerXPGoal;
  const playerXPPercent = Math.round((playerXPInLevel / playerXPGoal) * 100);
  const playerTitle = PLAYER_TITLES.find((item) => item.id === profile.equippedTitleId) ?? PLAYER_TITLES[0];
  const wallet = {
    coins: economy.coins,
    gems: economy.gems,
    XP: economy.typingXP,
    stars: earnedStars,
    hearts: economy.hearts,
    maxHearts: economy.maxHearts,
  };

  const handleResetProgress = () => {
    resetStudentProgress();
    resetFeatureProgressState();
    void resetLessonProgressRecords().catch((error) => console.error('Unable to reset lesson progress records.', error));
    setProgress(loadStudentProgress());
    setFeatureRevision((revision) => revision + 1);
  };

  useEffect(() => {
    const refreshProfile = () => setProfile(loadCachedGameProfile());
    window.addEventListener(USER_PROFILE_EVENT, refreshProfile);
    return () => window.removeEventListener(USER_PROFILE_EVENT, refreshProfile);
  }, []);

  const handleTreasureClaim = async (rewardId: string) => {
    const reward = rewards.find((item) => item.id === rewardId);
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
    <aside className="hidden h-screen w-64 shrink-0 overflow-x-hidden overflow-y-auto border-r-2 border-[#A4772C]/70 bg-gradient-to-b from-[#05333B] via-[#062D36] to-[#041B24] px-4 py-5 shadow-2xl lg:block">
      <Logo compact className="mb-5 scale-90 origin-left" />
      <div className="mb-4">
        <AccountMenu variant="topbar" />
      </div>
      <nav className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            'action' in item ? (
              <button
                key={item.label}
                type="button"
                onClick={() => setModal(item.action)}
                className="flex w-full items-center gap-3 border-b border-[#75B9AE]/12 px-3 py-3 text-left font-black text-[#F2E7C7] transition hover:bg-white/10 hover:text-[#FFE7A6]"
              >
                <Icon size={24} className="shrink-0 text-[#EEDDB6]" />
                <span className="min-w-0 leading-tight">
                  <span className="khmer-body block text-sm">{item.khmer}</span>
                  <span className="block text-sm">{item.label}</span>
                </span>
              </button>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 border-b border-[#75B9AE]/12 px-3 py-3 font-black transition ${
                    isActive
                      ? 'rounded-l-[14px] border-b-transparent bg-gradient-to-r from-[#D89116] to-[#B8730B] text-white shadow-[inset_0_-4px_0_rgba(0,0,0,.16),0_8px_14px_rgba(0,0,0,.24)] after:absolute after:-right-5 after:top-0 after:h-full after:w-6 after:bg-[#B8730B] after:[clip-path:polygon(0_0,100%_50%,0_100%)]'
                      : 'text-[#F2E7C7] hover:bg-white/10 hover:text-[#FFE7A6]'
                  }`
                }
              >
                <Icon size={24} className="shrink-0 text-[#EEDDB6]" />
                <span className="min-w-0 leading-tight">
                  <span className="khmer-body block text-sm">{item.khmer}</span>
                  <span className="block text-sm">{item.label}</span>
                </span>
              </NavLink>
            )
          );
        })}
      </nav>
      <div className="hidden">
        <CharacterPlaceholder type="lizard" withTiles className="-mx-8 -mb-10 scale-[0.62]" />
        <div className="relative rounded-[14px] bg-[#0A3A42]/94 p-3 text-white">
          <div className="khmer-body font-black">រង្វាន់ប្រចាំថ្ងៃ</div>
          <div className="text-sm font-bold text-[#FFE7A6]">Come back tomorrow for more XP & coins!</div>
        </div>
      </div>
      <div className="hidden">
        <CharacterPlaceholder type="elephant" className="-mb-20 scale-[0.56]" />
      </div>
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="mt-8 block w-full overflow-hidden rounded-[18px] border-2 border-[#C89438] bg-gradient-to-b from-[#0B4A4D]/94 to-[#062D36] p-3 text-white shadow-game transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70"
        aria-label="Open player profile"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[16px] border-2 border-[#C89438] bg-[#0A3A42]">
            <GeneratedAvatar
              avatarId={profile.equippedAvatarId}
              skinStyleId={profile.equippedSkinId}
              themeId={profile.equippedThemeId}
              frameId={profile.equippedFrameId}
              level={playerLevel}
              size="100%"
              ariaLabel={`${profile.displayName} avatar`}
            />
          </div>
          <div className="min-w-0 text-left">
            <div className="khmer-body truncate text-sm font-black text-[#FFE7A6]">{profile.displayName}</div>
            <div className="truncate text-xs font-bold text-[#D6F6EE]">{playerTitle.name}</div>
            <div className="mt-2 text-lg font-black">Level {playerLevel}</div>
          </div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/35 shadow-inner">
          <div className="h-full rounded-full bg-gradient-to-r from-[#6DE24D] to-[#F7E55B]" style={{ width: `${playerXPPercent}%` }} />
        </div>
        <div className="mt-1 text-center text-xs font-black text-[#D6F6EE]">
          {playerXPInLevel.toLocaleString()} / {playerXPGoal.toLocaleString()} XP
        </div>
      </button>
      <ActionModal open={modal === 'rewards'} title="រង្វាន់" onClose={() => setModal(null)}>
        <TreasurePanel
          rewards={rewards}
          wallet={wallet}
          shopItems={shopItems}
          inventory={inventory}
          purchaseMessage={featureMessage}
          purchasingItemId={purchasingItemId}
          onClaim={handleTreasureClaim}
          onPurchase={handlePurchase}
        />
      </ActionModal>
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
