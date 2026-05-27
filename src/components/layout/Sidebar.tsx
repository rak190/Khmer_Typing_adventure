import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Crown, Gamepad2, Gift, Home, Map, Settings, ShieldCheck, ShoppingBag } from 'lucide-react';
import ActionModal from '../game-ui/ActionModal';
import { SettingsPanel, TreasurePanel } from '../game-ui/FeaturePanels';
import Logo from '../game/Logo';
import CharacterPlaceholder from '../characters/CharacterPlaceholder';
import AccountMenu from './AccountMenu';
import { resetLessonProgressRecords } from '../../data/mockData';
import { claimEconomyReward, getActiveEconomyUserId, purchaseShopItem, shopItems } from '../../lib/economy';
import { useEconomyState, useInventoryState, useRewardClaimIds } from '../../lib/useEconomyState';
import { loadStudentProgress, resetStudentProgress } from '../../lib/studentProgress';
import {
  buildTreasureRewards,
  claimTreasureReward,
  loadAppSettings,
  resetFeatureProgressState,
  saveAppSettings,
} from '../../lib/playerFeatures';

const items = [
  { label: 'Dashboard', khmer: 'ផ្ទាំងគ្រប់គ្រង', to: '/dashboard', icon: Home },
  { label: 'Learn', khmer: 'មេរៀន', to: '/lesson', icon: BookOpen },
  { label: 'World Map', khmer: 'ផែនទី', to: '/map', icon: Map },
  { label: 'Mini-Games', khmer: 'ល្បែង', to: '/battle', icon: Gamepad2 },
  { label: 'Challenges', khmer: 'ប្រកួត', to: '/battle', icon: ShieldCheck },
  { label: 'Rewards', khmer: 'រង្វាន់', action: 'rewards' as const, icon: Gift },
  { label: 'Shop', khmer: 'ហាង', to: '/shop', icon: ShoppingBag },
  { label: 'Leaderboards', khmer: 'ចំណាត់ថ្នាក់', to: '/dashboard', icon: Crown },
  { label: 'Settings', khmer: 'កំណត់', action: 'settings' as const, icon: Settings },
];

export default function Sidebar() {
  const [modal, setModal] = useState<'rewards' | 'settings' | null>(null);
  const [settings, setSettings] = useState(() => loadAppSettings());
  const [progress, setProgress] = useState(() => loadStudentProgress());
  const [, setFeatureRevision] = useState(0);
  const [featureMessage, setFeatureMessage] = useState('');
  const [purchasingItemId, setPurchasingItemId] = useState<string | undefined>();
  const economy = useEconomyState();
  const inventory = useInventoryState();
  const treasureClaimIds = useRewardClaimIds('treasure');
  const rewards = buildTreasureRewards(progress, treasureClaimIds);
  const earnedStars = progress.lessonResults.reduce((total, result) => total + result.stars, 0);
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

  return (
    <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto bg-gradient-to-b from-[#12A9F0] to-[#78E3FF] px-4 py-5 shadow-2xl lg:block">
      <Logo compact className="mb-5 scale-90 origin-left" />
      <div className="mb-4">
        <AccountMenu variant="topbar" />
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            'action' in item ? (
              <button
                key={item.label}
                type="button"
                onClick={() => setModal(item.action)}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-black text-[#07315F] transition hover:bg-white/40"
              >
                <Icon size={24} />
                <span>{item.label}</span>
              </button>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 font-black text-[#07315F] transition ${
                    isActive ? 'bg-adventure text-white shadow-button' : 'hover:bg-white/40'
                  }`
                }
              >
                <Icon size={24} />
                <span>{item.label}</span>
              </NavLink>
            )
          );
        })}
      </nav>
      <div className="mt-8 overflow-hidden rounded-3xl border-2 border-white/60 bg-gradient-to-b from-white/65 to-primary/35 p-3 text-center shadow-game">
        <CharacterPlaceholder type="lizard" withTiles className="-mx-8 -mb-10 scale-[0.62]" />
        <div className="relative rounded-2xl bg-primary/90 p-3 text-white">
          <div className="khmer-body font-black">រង្វាន់ប្រចាំថ្ងៃ</div>
          <div className="text-sm font-bold">Come back tomorrow for more XP & coins!</div>
        </div>
      </div>
      <div className="mt-8 grid place-items-center">
        <CharacterPlaceholder type="elephant" className="-mb-20 scale-[0.56]" />
      </div>
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
