import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { TreasurePanel } from '../components/game-ui/FeaturePanels';
import AppLayout from '../components/layout/AppLayout';
import PageTransition from '../components/layout/PageTransition';
import { claimEconomyReward, getActiveEconomyUserId, purchaseShopItem, shopItems } from '../lib/economy';
import { buildTreasureRewards, claimTreasureReward } from '../lib/playerFeatures';
import { loadStudentProgress } from '../lib/studentProgress';
import { useEconomyState, useInventoryState, useRewardClaimIds } from '../lib/useEconomyState';

export default function ShopPage() {
  const [studentProgress] = useState(() => loadStudentProgress());
  const [, setFeatureRevision] = useState(0);
  const [featureMessage, setFeatureMessage] = useState('');
  const [purchasingItemId, setPurchasingItemId] = useState<string | undefined>();
  const economy = useEconomyState();
  const inventory = useInventoryState();
  const treasureClaimIds = useRewardClaimIds('treasure');
  const treasureRewards = buildTreasureRewards(studentProgress, treasureClaimIds);
  const earnedStars = studentProgress.lessonResults.reduce((total, result) => total + result.stars, 0);
  const wallet = {
    coins: economy.coins,
    gems: economy.gems,
    XP: economy.typingXP,
    stars: earnedStars,
    hearts: economy.hearts,
    maxHearts: economy.maxHearts,
  };

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
      <AppLayout>
        <main className="min-h-screen bg-sky px-4 py-6 text-[#17325A]">
          <div className="mx-auto max-w-5xl">
            <section className="dashboard-panel rounded-[22px] border border-white/60 bg-white/88 p-5 shadow-game">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#E8F6FF] text-[#1764B2] shadow-inner">
                  <ShoppingBag size={24} />
                </span>
                <div className="min-w-0">
                  <h1 className="text-2xl font-black leading-tight text-[#17325A]">ហាងផ្សងព្រេង</h1>
                  <p className="mt-1 font-bold leading-snug text-[#4F6A7F]">
                    ទិញ skin និង item ដោយប្រើកាក់ដែលរកបានពីការហាត់វាយអក្សរ។
                  </p>
                </div>
              </div>
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
            </section>
          </div>
        </main>
      </AppLayout>
    </PageTransition>
  );
}
