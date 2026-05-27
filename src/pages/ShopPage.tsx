import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BadgeCheck,
  ChevronRight,
  Clock,
  Gift,
  Heart,
  HeartPlus,
  Hourglass,
  Info,
  Keyboard,
  Mail,
  PackageOpen,
  RotateCcw,
  ScrollText,
  Settings,
  Shield,
  ShoppingCart,
  Snowflake,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { imageAssets } from '../assets/assetManifest';
import ActionModal from '../components/game-ui/ActionModal';
import GameButton from '../components/game-ui/GameButton';
import GameIcon from '../components/game-ui/GameIcon';
import AppLayout from '../components/layout/AppLayout';
import PageTransition from '../components/layout/PageTransition';
import {
  DAILY_DEAL_ITEM_ID,
  DAILY_DEAL_PRICE,
  FEATURED_BUNDLE,
  SHOP_ITEMS,
  type ShopCurrency,
  type ShopIconName,
  type ShopItemCategory,
  type ShopItemConfig,
} from '../data/shopItems';
import { getActiveEconomyUserId, getInventoryQuantity, purchaseShopItem } from '../lib/economy';
import { cn } from '../lib/cn';
import { useEconomyState, useInventoryState } from '../lib/useEconomyState';

type ShopTab = ShopItemCategory | 'owned';
type MessageTone = 'success' | 'error' | 'info';

const tabs: Array<{ id: ShopTab; label: string; icon: ReactNode }> = [
  { id: 'powerups', label: 'Power-ups', icon: <Zap size={18} /> },
  { id: 'hearts', label: 'Hearts', icon: <Heart size={18} /> },
  { id: 'cosmetics', label: 'Cosmetics', icon: <Sparkles size={18} /> },
  { id: 'bundles', label: 'Bundles', icon: <Gift size={18} /> },
  { id: 'owned', label: 'Owned Items', icon: <PackageOpen size={18} /> },
];

const itemIconMap: Record<Exclude<ShopIconName, 'elephant' | 'chest'>, LucideIcon> = {
  retry: RotateCcw,
  scroll: ScrollText,
  hourglass: Hourglass,
  shield: Shield,
  freeze: Snowflake,
  heart: HeartPlus,
  keyboard: Keyboard,
  victory: Sparkles,
  frame: BadgeCheck,
};

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function msUntilDailyReset(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

function useDailyResetCountdown() {
  const [remainingMs, setRemainingMs] = useState(() => msUntilDailyReset());

  useEffect(() => {
    const interval = window.setInterval(() => setRemainingMs(msUntilDailyReset()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return formatCountdown(remainingMs);
}

function CurrencyIcon({ currency, size = 20 }: { currency: ShopCurrency; size?: number }) {
  return <GameIcon name={currency === 'coins' ? 'coin' : 'gem'} size={size} />;
}

function BundleIcon({ icon }: { icon: ShopIconName | 'coin' | 'gem' }) {
  if (icon === 'coin' || icon === 'gem') {
    return <GameIcon name={icon === 'coin' ? 'coin' : 'gem'} size={22} />;
  }

  const pseudoItem = SHOP_ITEMS.find((item) => item.icon === icon) ?? FEATURED_BUNDLE;
  return <ShopItemIcon item={pseudoItem} size="xs" />;
}

function ShopItemIcon({ item, size = 'md' }: { item: ShopItemConfig; size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    xs: 'h-7 w-7',
    sm: 'h-11 w-11',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  }[size];
  const iconSize = size === 'lg' ? 58 : size === 'md' ? 38 : size === 'sm' ? 28 : 18;

  if (item.icon === 'elephant') {
    return (
      <span className={cn('grid shrink-0 place-items-center overflow-hidden rounded-full', dimensions)}>
        <img src={imageAssets.elephantGuide} alt="" className="h-full w-full scale-125 object-cover object-top" />
      </span>
    );
  }

  if (item.icon === 'chest') {
    return <img src={imageAssets.chest} alt="" className={cn('shrink-0 object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,.35)]', dimensions)} />;
  }

  const Icon = itemIconMap[item.icon];
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full border-2 border-[#F0B641] bg-gradient-to-b from-[#1D9ED2] to-[#0A4A72] text-[#EAFBFF] shadow-[inset_0_3px_0_rgba(255,255,255,.2),0_8px_14px_rgba(0,0,0,.32)]',
        dimensions,
      )}
    >
      <Icon size={iconSize} strokeWidth={2.4} />
    </span>
  );
}

function HudPill({
  icon,
  value,
  label,
  onAdd,
}: {
  icon: ReactNode;
  value: string | number;
  label?: string;
  onAdd?: () => void;
}) {
  return (
    <div className="relative inline-flex min-h-[54px] items-center gap-2 rounded-[22px] border-2 border-[#E4A331] bg-gradient-to-b from-[#0C4C62] to-[#082A38] px-3 py-2 font-black text-white shadow-[inset_0_-5px_0_rgba(0,0,0,.28),0_8px_14px_rgba(0,0,0,.32)]">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#092B37]/60">{icon}</span>
      <span className="leading-none">
        <span className="block text-[22px]">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        {label && <span className="mt-1 block text-xs text-[#FFE7A6]">{label}</span>}
      </span>
      {onAdd && (
        <button
          type="button"
          className="ml-1 grid h-8 w-8 place-items-center rounded-full border-2 border-[#E9C35A] bg-[#123F4C] text-[#BFEAFF] transition hover:bg-[#185B69]"
          onClick={onAdd}
          aria-label={`Open ${label ?? 'resource'} options`}
        >
          <span className="text-xl leading-none">+</span>
        </button>
      )}
    </div>
  );
}

function RoundHudButton({ icon, label, badge, onClick }: { icon: ReactNode; label: string; badge?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="relative grid h-[54px] w-[54px] place-items-center rounded-full border-2 border-[#E4A331] bg-gradient-to-b from-[#0C4C62] to-[#082A38] text-[#F8F2D9] shadow-[inset_0_-5px_0_rgba(0,0,0,.28),0_8px_14px_rgba(0,0,0,.28)] transition hover:-translate-y-0.5 hover:border-[#FFD56A]"
      onClick={onClick}
      aria-label={label}
    >
      {icon}
      {badge && (
        <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full border-2 border-white bg-[#E84036] px-1 text-xs font-black text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function PriceBadge({ item, price = item.price }: { item: ShopItemConfig; price?: number }) {
  if (item.comingSoon) return <span>Coming soon</span>;
  return (
    <span className="inline-flex items-center justify-center gap-1">
      <CurrencyIcon currency={item.currency} size={19} />
      {price.toLocaleString()}
    </span>
  );
}

function MessageBanner({ tone, text }: { tone: MessageTone; text: string }) {
  const styles = {
    success: 'border-[#63E36D] bg-[#093F2C]/88 text-[#BAFFC2]',
    error: 'border-[#FF8B67] bg-[#4A1D18]/88 text-[#FFD1C4]',
    info: 'border-[#68BFF2] bg-[#0B3551]/88 text-[#D8F3FF]',
  }[tone];

  return (
    <div className={cn('rounded-[16px] border px-4 py-3 text-sm font-black shadow-[0_8px_16px_rgba(0,0,0,.18)]', styles)} role="status">
      {text}
    </div>
  );
}

function shopItemIsOwned(item: ShopItemConfig, inventoryQuantity: number, owned: boolean) {
  return item.type === 'cosmetic' || item.type === 'bundle' ? owned : inventoryQuantity > 0;
}

export default function ShopPage() {
  const economy = useEconomyState();
  const inventory = useInventoryState();
  const resetCountdown = useDailyResetCountdown();
  const [activeTab, setActiveTab] = useState<ShopTab>('powerups');
  const [selectedItemId, setSelectedItemId] = useState('retry-token');
  const [purchasingItemId, setPurchasingItemId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>(null);
  const [modal, setModal] = useState<{ title: string; detail: string } | null>(null);

  const inventoryById = useMemo(() => new Map(inventory.map((item) => [item.itemId, item])), [inventory]);
  const selectedItem = SHOP_ITEMS.find((item) => item.id === selectedItemId) ?? SHOP_ITEMS[0];
  const dailyDealItem = SHOP_ITEMS.find((item) => item.id === DAILY_DEAL_ITEM_ID) ?? SHOP_ITEMS[0];

  const visibleItems = SHOP_ITEMS.filter((item) => {
    const inventoryItem = inventoryById.get(item.id);
    const owned = shopItemIsOwned(item, inventoryItem?.quantity ?? 0, inventoryItem?.owned === true);

    if (activeTab === 'owned') return owned && !item.comingSoon;
    return item.category === activeTab;
  });

  const ownedItems = SHOP_ITEMS.filter((item) => {
    const inventoryItem = inventoryById.get(item.id);
    return shopItemIsOwned(item, inventoryItem?.quantity ?? 0, inventoryItem?.owned === true) && !item.comingSoon;
  });

  const showComingSoon = (title: string, detail = 'This offer is a preview. Purchases and inventory are real for normal shop items, but this feature is not connected yet.') => {
    setModal({ title, detail });
  };

  const canAfford = (item: ShopItemConfig, price = item.price) => {
    return item.currency === 'coins' ? economy.coins >= price : economy.gems >= price;
  };

  const handlePurchase = async (item: ShopItemConfig, priceOverride?: number, source = 'shop') => {
    setSelectedItemId(item.id);
    if (item.comingSoon) {
      showComingSoon(item.name, 'Bundle checkout is coming soon. No real-money purchase has been wired here.');
      return;
    }

    const inventoryItem = inventoryById.get(item.id);
    if (item.type === 'cosmetic' && inventoryItem?.owned) {
      setMessage({ tone: 'info', text: `${item.name} is already owned.` });
      return;
    }

    const price = priceOverride ?? item.price;
    if (!canAfford(item, price)) {
      setMessage({ tone: 'error', text: item.currency === 'coins' ? 'Not enough coins.' : 'Not enough gems.' });
      return;
    }

    const userId = getActiveEconomyUserId() ?? 'local-shop-user';
    setPurchasingItemId(item.id);
    try {
      await purchaseShopItem(userId, item.id, { priceOverride, source });
      setMessage({ tone: 'success', text: `${item.name} purchased. Inventory updated.` });
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Purchase failed. Please try again.' });
    } finally {
      setPurchasingItemId(null);
    }
  };

  const handleUse = (item: ShopItemConfig) => {
    const inventoryItem = inventoryById.get(item.id);
    const quantity = getInventoryQuantity(inventory, item.id);
    const owned = shopItemIsOwned(item, quantity, inventoryItem?.owned === true);

    if (!owned) {
      setMessage({ tone: 'error', text: `Buy ${item.name} before using it.` });
      return;
    }

    if (!item.effectConnected) {
      // TODO: Connect remaining item effects to lesson/boss gameplay once those activation hooks exist.
      setMessage({ tone: 'info', text: `${item.name} owned / effect coming soon.` });
      return;
    }

    if (item.id === 'retry-token') {
      setMessage({ tone: 'info', text: 'Retry Token is used automatically when you enter a Boss Battle.' });
      return;
    }

    if (item.id === 'streak-freeze') {
      setMessage({ tone: 'info', text: 'Streak Freeze is used automatically when a one-day gap would break your streak.' });
      return;
    }

    setMessage({ tone: 'info', text: `${item.name} is ready.` });
  };

  return (
    <PageTransition>
      <AppLayout>
        <main
          className="relative min-h-screen overflow-hidden bg-[#061E25] px-3 py-4 text-[#F8F2D9] sm:px-5"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(2,18,25,.9), rgba(2,30,34,.55) 42%, rgba(2,18,25,.9)), url(${imageAssets.backgrounds.home})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_12%,rgba(255,214,106,.18),transparent_24%),linear-gradient(180deg,rgba(5,45,53,.1),rgba(2,13,18,.38))]" />
          <div className="relative mx-auto max-w-[1500px]">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <span className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full border-[3px] border-[#E4A331] bg-gradient-to-b from-[#123F4D] to-[#071F28] text-[#FFD66A] shadow-[inset_0_-7px_0_rgba(0,0,0,.28),0_10px_18px_rgba(0,0,0,.35)]">
                  <ShoppingCart size={38} />
                </span>
                <div className="min-w-0">
                  <h1 className="khmer-display text-4xl font-black leading-tight text-[#FFD66A] drop-shadow-[0_3px_0_rgba(0,0,0,.35)] sm:text-5xl">
                    ហាង / Shop
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm font-black leading-snug text-white sm:text-base">
                    Use coins and gems to buy helpful items and cosmetics.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <HudPill icon={<GameIcon name="heart" size={30} />} value={`${economy.hearts}/${economy.maxHearts}`} label="Full" onAdd={() => showComingSoon('Hearts', 'Heart refills can be earned in the game. Direct heart top-ups are not connected yet.')} />
                <HudPill icon={<GameIcon name="coin" size={30} />} value={economy.coins} label="Coins" onAdd={() => showComingSoon('Coins', 'Coin bundles are coming soon. Use lesson and quest rewards for now.')} />
                <HudPill icon={<GameIcon name="gem" size={30} />} value={economy.gems} label="Gems" onAdd={() => showComingSoon('Gems', 'Gem offers are coming soon. No checkout is connected.')} />
                <HudPill icon={<Zap size={29} className="text-[#67D9FF]" />} value={economy.typingXP} label="Typing XP" />
                <RoundHudButton icon={<Mail size={26} />} badge="3" label="Notifications coming soon" onClick={() => showComingSoon('Notifications')} />
                <RoundHudButton icon={<Trophy size={26} />} label="Trophy details coming soon" onClick={() => showComingSoon('Trophies')} />
                <RoundHudButton icon={<Settings size={26} />} label="Settings" onClick={() => showComingSoon('Settings', 'Use the sidebar settings panel for active settings.')} />
              </div>
            </div>

            <div className="mb-3 flex min-w-0 gap-1 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={cn(
                    'inline-flex min-h-12 shrink-0 items-center gap-2 rounded-t-[14px] border-2 px-5 py-2 font-black shadow-[inset_0_-4px_0_rgba(0,0,0,.18)] transition',
                    activeTab === tab.id
                      ? 'border-[#F4B63A] bg-gradient-to-b from-[#FFE07A] to-[#E89A18] text-[#3A2103]'
                      : 'border-[#A4772C] bg-gradient-to-b from-[#0F5D62] to-[#092D36] text-[#F8F2D9] hover:border-[#F4B63A]',
                  )}
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={activeTab === tab.id}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]">
              <section className="min-w-0 space-y-4">
                <div className="relative overflow-hidden rounded-[18px] border-2 border-[#E4A331] bg-gradient-to-r from-[#4C164F]/95 via-[#5F1C77]/92 to-[#201447]/95 p-4 shadow-[inset_0_3px_0_rgba(255,255,255,.14),0_12px_24px_rgba(0,0,0,.32)]">
                  <div className="absolute -left-9 top-4 rotate-[-24deg] bg-[#D93632] px-10 py-1 text-xs font-black uppercase text-white shadow-lg">
                    Best Value
                  </div>
                  <div className="grid gap-4 md:grid-cols-[210px_minmax(0,1fr)_190px] md:items-center">
                    <div className="flex justify-center md:justify-start">
                      <img src={imageAssets.chest} alt="" className="h-28 w-44 object-contain drop-shadow-[0_12px_12px_rgba(0,0,0,.35)]" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="khmer-display text-2xl font-black leading-tight text-[#FFE07A]">កញ្ចប់ទ្រព្យអង្គរ</h2>
                      <p className="text-lg font-black text-white">Angkor Treasure Bundle</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {FEATURED_BUNDLE.includes?.map((item) => (
                          <span key={item.label} className="inline-flex items-center gap-1 rounded-full bg-[#1C143C]/75 px-3 py-1.5 text-sm font-black text-white">
                            <BundleIcon icon={item.icon} />
                            {item.value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[16px] bg-[#180F2E]/82 p-3 text-center shadow-inner">
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#2B2448] px-3 py-1 text-sm font-black text-[#FFE7A6]">
                        <Clock size={16} />
                        {resetCountdown}
                      </div>
                      <GameButton variant="green" size="sm" className="w-full" onClick={() => showComingSoon('Angkor Treasure Bundle', 'Demo bundle only. Real-money checkout is not implemented.')}>
                        Demo bundle
                      </GameButton>
                    </div>
                  </div>
                </div>

                {message && <MessageBanner tone={message.tone} text={message.text} />}

                <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3">
                  {visibleItems.length === 0 ? (
                    <div className="col-span-full rounded-[18px] border-2 border-[#C89438] bg-[#07333A]/90 p-6 text-center font-black text-[#D9F7DE]">
                      {activeTab === 'owned' ? 'No owned items yet. Buy items from the shop.' : 'No items in this category yet.'}
                    </div>
                  ) : visibleItems.map((item) => {
                    const inventoryItem = inventoryById.get(item.id);
                    const quantity = inventoryItem?.quantity ?? 0;
                    const owned = shopItemIsOwned(item, quantity, inventoryItem?.owned === true);
                    const notEnough = !item.comingSoon && !canAfford(item);
                    const alreadyOwned = item.type === 'cosmetic' && owned;
                    const selected = selectedItem.id === item.id;

                    return (
                      <article
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          'group min-h-[150px] cursor-pointer rounded-[16px] border-2 bg-gradient-to-b from-[#0C6062]/94 to-[#07333A]/96 p-3 text-left shadow-[inset_0_2px_0_rgba(255,255,255,.12),0_10px_18px_rgba(0,0,0,.24)] transition hover:-translate-y-0.5 hover:border-[#FFD66A]',
                          selected ? 'border-[#FFD66A] ring-2 ring-[#FFD66A]/45' : 'border-[#C89438]',
                        )}
                        onClick={() => setSelectedItemId(item.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedItemId(item.id);
                          }
                        }}
                        aria-label={`Select ${item.name}`}
                      >
                        <div className="flex h-full gap-3">
                          <ShopItemIcon item={item} size="md" />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="min-w-0">
                              <h3 className="khmer-body text-base font-black leading-tight text-[#FFF3B8]">{item.khmerName}</h3>
                              <p className="text-sm font-black leading-tight text-white">{item.name}</p>
                              <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-[#D0EFE6]">{item.description}</p>
                            </div>
                            <div className="mt-auto grid gap-2 pt-3">
                              <span className="w-fit rounded-full bg-[#0A412D] px-2 py-1 text-xs font-black text-[#8EF29B]">
                                Owned: {item.type === 'cosmetic' ? (owned ? 1 : 0) : quantity}
                              </span>
                              <button
                                type="button"
                                className="w-full min-w-0 rounded-[11px] border-2 border-[#A85D05] bg-gradient-to-b from-[#FFE778] via-[#FFC23A] to-[#EC8B15] px-3 py-1.5 text-sm font-black text-[#542B00] shadow-[inset_0_-3px_0_rgba(0,0,0,.15)] disabled:cursor-not-allowed disabled:opacity-60"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handlePurchase(item);
                                }}
                                disabled={notEnough || alreadyOwned || purchasingItemId === item.id}
                                aria-label={item.comingSoon ? `${item.name} coming soon` : `Buy ${item.name}`}
                              >
                                {purchasingItemId === item.id ? '...' : alreadyOwned ? 'Owned' : <PriceBadge item={item} />}
                              </button>
                            </div>
                            {notEnough && <div className="mt-2 text-xs font-black text-[#FFB79F]">{item.currency === 'coins' ? 'Not enough coins' : 'Not enough gems'}</div>}
                            {owned && !item.effectConnected && <div className="mt-2 text-xs font-black text-[#FFE7A6]">owned / effect coming soon</div>}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                  <section className="rounded-[18px] border-2 border-[#2EA796] bg-[#073E43]/92 p-4 shadow-[inset_0_2px_0_rgba(255,255,255,.1),0_10px_18px_rgba(0,0,0,.24)]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="khmer-body text-xl font-black text-[#FFE7A6]">ប្រចាំថ្ងៃ / Daily Deal</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0A2F39] px-3 py-1 text-sm font-black text-[#BFEAFF]">
                        <Clock size={15} />
                        {resetCountdown}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <ShopItemIcon item={dailyDealItem} size="md" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-white">Extra Heart x1</h3>
                        <p className="text-sm font-bold text-[#D0EFE6]">{dailyDealItem.khmerName}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-black">
                          <span className="text-[#FFB79F] line-through">
                            <CurrencyIcon currency={dailyDealItem.currency} size={16} /> {dailyDealItem.price}
                          </span>
                          <span className="rounded-full bg-[#D93632] px-2 py-1 text-white">-33%</span>
                        </div>
                      </div>
                      <GameButton
                        variant="gold"
                        size="sm"
                        disabled={!canAfford(dailyDealItem, DAILY_DEAL_PRICE) || purchasingItemId === dailyDealItem.id}
                        onClick={() => void handlePurchase(dailyDealItem, DAILY_DEAL_PRICE, 'daily-deal')}
                        aria-label="Buy daily deal Extra Heart"
                      >
                        <PriceBadge item={dailyDealItem} price={DAILY_DEAL_PRICE} />
                      </GameButton>
                    </div>
                  </section>

                  <section className="rounded-[18px] border-2 border-[#B88635] bg-gradient-to-r from-[#302B2B]/92 to-[#6A441A]/90 p-4 shadow-[inset_0_2px_0_rgba(255,255,255,.1),0_10px_18px_rgba(0,0,0,.24)]">
                    <div className="flex h-full items-center gap-4">
                      <img src={imageAssets.chest} alt="" className="h-24 w-32 shrink-0 object-contain drop-shadow-[0_9px_9px_rgba(0,0,0,.35)]" />
                      <div className="min-w-0 flex-1">
                        <h2 className="khmer-body text-xl font-black text-[#FFE7A6]">ការផ្តល់ពិសេស / Special Offers</h2>
                        <p className="font-black text-white">Treasure Chest</p>
                        <p className="text-sm font-bold text-[#F4E4BA]">Get more coins and gems!</p>
                      </div>
                      <GameButton variant="gold" size="sm" rightIcon={<ChevronRight size={18} />} onClick={() => showComingSoon('Special Offers', 'Offer browsing is a preview. No checkout or real-money purchase is connected.')}>
                        View Offers
                      </GameButton>
                    </div>
                  </section>
                </div>
              </section>

              <aside className="min-w-0 space-y-4">
                <SelectedItemPanel
                  item={selectedItem}
                  inventoryItem={inventoryById.get(selectedItem.id)}
                  canAfford={canAfford(selectedItem)}
                  purchasing={purchasingItemId === selectedItem.id}
                  onBuy={() => void handlePurchase(selectedItem)}
                  onUse={() => handleUse(selectedItem)}
                />

                <section className="rounded-[18px] border-2 border-[#C89438] bg-[#07333A]/94 p-4 shadow-[inset_0_2px_0_rgba(255,255,255,.1),0_10px_18px_rgba(0,0,0,.24)]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="khmer-body text-xl font-black text-[#FFE7A6]">សម្ភារៈរបស់អ្នក / Owned Items</h2>
                    <button type="button" className="inline-flex items-center gap-1 text-sm font-black text-[#FFE7A6]" onClick={() => setActiveTab('owned')}>
                      View all
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  {ownedItems.length === 0 ? (
                    <p className="rounded-[14px] border border-[#2EA796]/70 bg-[#06272F] px-3 py-4 text-sm font-black text-[#D0EFE6]">
                      No owned items yet. Buy items from the shop.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5">
                      {ownedItems.map((item) => {
                        const inventoryItem = inventoryById.get(item.id);
                        const quantity = inventoryItem?.quantity ?? (inventoryItem?.owned ? 1 : 0);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className="group relative grid min-h-[76px] place-items-center rounded-[13px] border border-[#4AA99D] bg-[#0A4650] p-2 shadow-inner transition hover:border-[#FFD66A]"
                            onClick={() => setSelectedItemId(item.id)}
                            aria-label={`Select owned item ${item.name}`}
                            title={item.name}
                          >
                            <ShopItemIcon item={item} size="sm" />
                            <span className="absolute bottom-1 right-1 rounded-full bg-[#031B22] px-1.5 py-0.5 text-xs font-black text-white">x{Math.max(1, quantity)}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="rounded-[18px] border-2 border-[#3A8DDB] bg-gradient-to-r from-[#163B9B]/90 to-[#0B5480]/90 p-4 shadow-[inset_0_2px_0_rgba(255,255,255,.16),0_10px_18px_rgba(0,0,0,.24)]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/45 bg-white/16">
                      <Info size={22} />
                    </span>
                    <p className="font-black leading-snug text-white">Power-ups help you practice better and win Boss Battles!</p>
                  </div>
                </section>
              </aside>
            </div>
          </div>

          <ActionModal open={modal !== null} title={modal?.title ?? 'Coming Soon'} onClose={() => setModal(null)}>
            <div className="rounded-[16px] border border-[#DDBD70] bg-white/60 p-4 text-[#4D371E]">
              <p>{modal?.detail ?? 'Coming soon.'}</p>
            </div>
          </ActionModal>
        </main>
      </AppLayout>
    </PageTransition>
  );
}

function SelectedItemPanel({
  item,
  inventoryItem,
  canAfford,
  purchasing,
  onBuy,
  onUse,
}: {
  item: ShopItemConfig;
  inventoryItem?: { quantity: number; owned: boolean };
  canAfford: boolean;
  purchasing: boolean;
  onBuy: () => void;
  onUse: () => void;
}) {
  const quantity = inventoryItem?.quantity ?? 0;
  const owned = shopItemIsOwned(item, quantity, inventoryItem?.owned === true);
  const alreadyOwned = item.type === 'cosmetic' && owned;
  const buyDisabled = !canAfford || alreadyOwned || purchasing;
  const useDisabled = !owned || !item.usable;
  const statusText = owned && !item.effectConnected ? 'owned / effect coming soon' : owned ? 'Owned' : 'Not owned yet';

  return (
    <section className="rounded-[22px] border-2 border-[#D89D31] bg-gradient-to-b from-[#074D4B]/96 to-[#062D33]/98 p-5 text-center shadow-[inset_0_3px_0_rgba(255,255,255,.12),0_16px_26px_rgba(0,0,0,.34)] xl:sticky xl:top-4">
      <div className="mx-auto mb-4 grid h-28 w-28 place-items-center rounded-full border-[3px] border-[#E4A331] bg-gradient-to-b from-[#0A6880] to-[#062C47] shadow-[inset_0_-7px_0_rgba(0,0,0,.24),0_10px_16px_rgba(0,0,0,.3)]">
        <ShopItemIcon item={item} size="lg" />
      </div>
      <h2 className="khmer-body text-2xl font-black leading-tight text-[#FFE7A6]">{item.khmerName}</h2>
      <p className="text-xl font-black text-white">{item.name}</p>
      <span className="mt-3 inline-flex rounded-full bg-[#0B5A34] px-3 py-1 text-sm font-black text-[#A8FFB1]">
        Owned: {item.type === 'cosmetic' ? (owned ? 1 : 0) : quantity}
      </span>
      <p className="mx-auto mt-4 max-w-[300px] text-sm font-bold leading-relaxed text-[#D0EFE6]">{item.description}</p>
      <div className="mt-4 rounded-[14px] border border-[#2EA796]/80 bg-[#0A4650]/86 p-3 text-left">
        <div className="text-center text-sm font-black text-[#FFE7A6]">Effect</div>
        <p className="mt-1 text-center text-sm font-bold leading-snug text-[#D0EFE6]">{item.effectLabel}</p>
        <p className="mt-2 text-center text-xs font-black uppercase tracking-wide text-[#FFE7A6]">{statusText}</p>
      </div>
      <div className="mt-4 grid gap-3">
        <GameButton variant="gold" size="md" disabled={buyDisabled} onClick={onBuy} aria-label={item.comingSoon ? `${item.name} coming soon` : `Buy ${item.name}`}>
          {purchasing ? 'Buying...' : alreadyOwned ? 'Owned' : <PriceBadge item={item} />}
        </GameButton>
        {item.usable && (
          <GameButton variant="green" size="md" disabled={useDisabled} onClick={onUse} aria-label={`Use ${item.name}`}>
            {owned && !item.effectConnected ? 'Effect coming soon' : 'ប្រើសម្ភារៈ / Use'}
          </GameButton>
        )}
        {!canAfford && !alreadyOwned && !item.comingSoon && (
          <p className="text-sm font-black text-[#FFB79F]">{item.currency === 'coins' ? 'Not enough coins.' : 'Not enough gems.'}</p>
        )}
      </div>
    </section>
  );
}
