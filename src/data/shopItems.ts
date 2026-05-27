export type ShopCurrency = 'coins' | 'gems';
export type ShopItemCategory = 'powerups' | 'hearts' | 'cosmetics' | 'bundles';
export type ShopItemType = 'powerup' | 'heart' | 'cosmetic' | 'bundle';
export type ShopIconName =
  | 'retry'
  | 'scroll'
  | 'hourglass'
  | 'shield'
  | 'freeze'
  | 'heart'
  | 'keyboard'
  | 'elephant'
  | 'victory'
  | 'frame'
  | 'chest';

export type ShopItemEffect =
  | 'retry-token'
  | 'hint-scroll'
  | 'slow-time'
  | 'accuracy-shield'
  | 'streak-freeze'
  | 'extra-heart'
  | 'keyboard-skin'
  | 'elephant-costume'
  | 'victory-effect'
  | 'temple-badge-frame'
  | 'bundle';

export type ShopItemConfig = {
  id: string;
  name: string;
  khmerName: string;
  description: string;
  effect: ShopItemEffect;
  effectLabel: string;
  category: ShopItemCategory;
  price: number;
  currency: ShopCurrency;
  icon: ShopIconName;
  type: ShopItemType;
  usable: boolean;
  effectConnected: boolean;
  comingSoon?: boolean;
  includes?: Array<{ label: string; value: string; icon: ShopIconName | 'coin' | 'gem' }>;
};

export const SHOP_ITEMS: ShopItemConfig[] = [
  {
    id: 'retry-token',
    name: 'Retry Token',
    khmerName: 'សញ្ញាសាកល្បងម្ដងទៀត',
    description: 'Try a Boss Battle again without spending a heart.',
    effect: 'retry-token',
    effectLabel: 'Auto-used before a Boss Battle when you have no free retry left.',
    category: 'powerups',
    price: 300,
    currency: 'coins',
    icon: 'retry',
    type: 'powerup',
    usable: true,
    effectConnected: true,
  },
  {
    id: 'hint-scroll',
    name: 'Hint Scroll',
    khmerName: 'ក្រដាសជំនួយ',
    description: 'Keep a helpful keyboard or finger hint ready for practice.',
    effect: 'hint-scroll',
    effectLabel: 'Shows a clearer hint during a hard typing moment.',
    category: 'powerups',
    price: 250,
    currency: 'coins',
    icon: 'scroll',
    type: 'powerup',
    usable: true,
    effectConnected: false,
  },
  {
    id: 'slow-time',
    name: 'Slow Time',
    khmerName: 'បន្ថយពេល',
    description: 'Gives you 10 calmer seconds during a Boss challenge.',
    effect: 'slow-time',
    effectLabel: 'Slows a Boss timer for a short practice window.',
    category: 'powerups',
    price: 20,
    currency: 'gems',
    icon: 'hourglass',
    type: 'powerup',
    usable: true,
    effectConnected: false,
  },
  {
    id: 'accuracy-shield',
    name: 'Accuracy Shield',
    khmerName: 'ខែលត្រឹមត្រូវ',
    description: 'Protects one early mistake so beginners can recover.',
    effect: 'accuracy-shield',
    effectLabel: 'Blocks one mistake penalty during a focused run.',
    category: 'powerups',
    price: 25,
    currency: 'gems',
    icon: 'shield',
    type: 'powerup',
    usable: true,
    effectConnected: false,
  },
  {
    id: 'streak-freeze',
    name: 'Streak Freeze',
    khmerName: 'ការពារ Streak',
    description: 'Protects your daily practice streak after one missed day.',
    effect: 'streak-freeze',
    effectLabel: 'Auto-used when a one-day gap would break your streak.',
    category: 'powerups',
    price: 15,
    currency: 'gems',
    icon: 'freeze',
    type: 'powerup',
    usable: true,
    effectConnected: true,
  },
  {
    id: 'extra-heart',
    name: 'Extra Heart',
    khmerName: 'បេះដូងបន្ថែម',
    description: 'Store one heart refill for more Boss practice later.',
    effect: 'extra-heart',
    effectLabel: 'Adds one heart when the heart-use flow is connected.',
    category: 'hearts',
    price: 150,
    currency: 'coins',
    icon: 'heart',
    type: 'heart',
    usable: true,
    effectConnected: false,
  },
  {
    id: 'keyboard-skin',
    name: 'Keyboard Skin',
    khmerName: 'ស្បែកក្ដារចុច',
    description: 'A temple-stone look for your typing keyboard.',
    effect: 'keyboard-skin',
    effectLabel: 'Cosmetic keyboard style for a future appearance menu.',
    category: 'cosmetics',
    price: 30,
    currency: 'gems',
    icon: 'keyboard',
    type: 'cosmetic',
    usable: false,
    effectConnected: false,
  },
  {
    id: 'elephant-costume',
    name: 'Elephant Costume',
    khmerName: 'សំលៀកបំពាក់ដំរី',
    description: 'Dress your guide in an Angkor adventure costume.',
    effect: 'elephant-costume',
    effectLabel: 'Cosmetic guide outfit for a future profile menu.',
    category: 'cosmetics',
    price: 45,
    currency: 'gems',
    icon: 'elephant',
    type: 'cosmetic',
    usable: false,
    effectConnected: false,
  },
  {
    id: 'victory-effect',
    name: 'Victory Effect',
    khmerName: 'ពន្លឺជ័យជម្នះ',
    description: 'Celebrate clean wins with bright temple fireworks.',
    effect: 'victory-effect',
    effectLabel: 'Cosmetic win animation for future lesson results.',
    category: 'cosmetics',
    price: 40,
    currency: 'gems',
    icon: 'victory',
    type: 'cosmetic',
    usable: false,
    effectConnected: false,
  },
  {
    id: 'temple-badge-frame',
    name: 'Temple Badge Frame',
    khmerName: 'ស៊ុមប្រាសាទ',
    description: 'Frame your profile badge with carved temple stone.',
    effect: 'temple-badge-frame',
    effectLabel: 'Cosmetic badge frame for a future achievements view.',
    category: 'cosmetics',
    price: 35,
    currency: 'gems',
    icon: 'frame',
    type: 'cosmetic',
    usable: false,
    effectConnected: false,
  },
  {
    id: 'angkor-treasure-bundle',
    name: 'Angkor Treasure Bundle',
    khmerName: 'កញ្ចប់ទ្រព្យអង្គរ',
    description: 'A demo bundle preview for future seasonal offers.',
    effect: 'bundle',
    effectLabel: 'Bundle purchasing is coming soon.',
    category: 'bundles',
    price: 0,
    currency: 'gems',
    icon: 'chest',
    type: 'bundle',
    usable: false,
    effectConnected: false,
    comingSoon: true,
    includes: [
      { label: 'Coins', value: '5,000', icon: 'coin' },
      { label: 'Gems', value: '200', icon: 'gem' },
      { label: 'Hearts', value: '5', icon: 'heart' },
      { label: 'Bonus', value: '3', icon: 'freeze' },
    ],
  },
];

export const FEATURED_BUNDLE = SHOP_ITEMS.find((item) => item.id === 'angkor-treasure-bundle')!;
export const DAILY_DEAL_ITEM_ID = 'extra-heart';
export const DAILY_DEAL_PRICE = 100;
