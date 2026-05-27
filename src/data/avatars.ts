import { imageAssets } from '../assets/assetManifest';

export type ProfileRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type UnlockType = 'default' | 'achievement' | 'shop' | 'streak' | 'progress';

export type AvatarConfig = {
  id: string;
  name: string;
  khmerName: string;
  image: string;
  rarity: ProfileRarity;
  unlockType: UnlockType;
  unlockRequirement: string;
  ownedByDefault: boolean;
  shopItemId?: string;
  description: string;
};

export type ProfileFrameConfig = {
  id: string;
  name: string;
  khmerName: string;
  rarity: ProfileRarity;
  unlockType: UnlockType;
  unlockRequirement: string;
  ownedByDefault: boolean;
  shopItemId?: string;
  className: string;
};

export type ProfileCosmeticConfig = {
  id: string;
  name: string;
  khmerName: string;
  slot: 'costume' | 'frame' | 'keyboard' | 'victory';
  shopItemId?: string;
  unlockRequirement: string;
  description: string;
};

export const PROFILE_AVATARS: AvatarConfig[] = [
  {
    id: 'sophea_elephant',
    name: 'Sophea Elephant',
    khmerName: 'ដំរី សុភា',
    image: imageAssets.elephantGuide,
    rarity: 'common',
    unlockType: 'default',
    unlockRequirement: 'Unlocked by default.',
    ownedByDefault: true,
    description: 'A friendly guide ready for Khmer typing practice.',
  },
  {
    id: 'temple_student',
    name: 'Temple Student',
    khmerName: 'សិស្សប្រាសាទ',
    image: imageAssets.lizardMascot,
    rarity: 'common',
    unlockType: 'default',
    unlockRequirement: 'Unlocked by default.',
    ownedByDefault: true,
    description: 'A cheerful learner from the temple classroom.',
  },
  {
    id: 'jungle_typist',
    name: 'Jungle Typist',
    khmerName: 'អ្នកវាយព្រៃ',
    image: imageAssets.map.world1,
    rarity: 'rare',
    unlockType: 'progress',
    unlockRequirement: 'Complete at least 1 lesson.',
    ownedByDefault: false,
    description: 'A green jungle badge for students who begin the journey.',
  },
  {
    id: 'guardian_apprentice',
    name: 'Guardian Apprentice',
    khmerName: 'សិស្សអាណាព្យាបាល',
    image: imageAssets.stoneGuardian,
    rarity: 'rare',
    unlockType: 'progress',
    unlockRequirement: 'Complete 3 lessons.',
    ownedByDefault: false,
    description: 'A temple guardian trainee for steady learners.',
  },
  {
    id: 'boss_victor_elephant',
    name: 'Boss Victor Elephant',
    khmerName: 'ដំរីឈ្នះ Boss',
    image: imageAssets.elephantGuide,
    rarity: 'epic',
    unlockType: 'achievement',
    unlockRequirement: 'Unlock by passing your first Boss.',
    ownedByDefault: false,
    description: 'A proud elephant avatar for boss battle winners.',
  },
  {
    id: 'golden_typing_hero',
    name: 'Golden Typing Hero',
    khmerName: 'វីរបុរសមាស',
    image: imageAssets.medal,
    rarity: 'legendary',
    unlockType: 'progress',
    unlockRequirement: 'Earn 30 stars.',
    ownedByDefault: false,
    description: 'A golden profile emblem for high-achieving students.',
  },
  {
    id: 'jungle_master',
    name: 'Jungle Master',
    khmerName: 'ម្ចាស់ព្រៃ',
    image: imageAssets.map.world4,
    rarity: 'epic',
    unlockType: 'streak',
    unlockRequirement: 'Reach a 7-day streak.',
    ownedByDefault: false,
    description: 'A profile mark for students who return every day.',
  },
  {
    id: 'accuracy_monk_avatar',
    name: 'Accuracy Monk',
    khmerName: 'អ្នកថែភាពត្រឹមត្រូវ',
    image: imageAssets.star,
    rarity: 'epic',
    unlockType: 'achievement',
    unlockRequirement: 'Reach 95% accuracy in a lesson.',
    ownedByDefault: false,
    description: 'A calm accuracy avatar for careful Khmer typing.',
  },
];

export const PROFILE_FRAMES: ProfileFrameConfig[] = [
  {
    id: 'default_frame',
    name: 'Default Frame',
    khmerName: 'ស៊ុមដើម',
    rarity: 'common',
    unlockType: 'default',
    unlockRequirement: 'Unlocked by default.',
    ownedByDefault: true,
    className: 'border-[#E2C98B] shadow-[0_0_0_4px_rgba(255,255,255,.14)]',
  },
  {
    id: 'bronze_learner_frame',
    name: 'Bronze Learner Frame',
    khmerName: 'ស៊ុមសំរិទ្ធ',
    rarity: 'rare',
    unlockType: 'progress',
    unlockRequirement: 'Complete at least 1 lesson.',
    ownedByDefault: false,
    className: 'border-[#C87A32] shadow-[0_0_18px_rgba(200,122,50,.45)]',
  },
  {
    id: 'gold_accuracy_frame',
    name: 'Gold Accuracy Frame',
    khmerName: 'ស៊ុមមាសត្រឹមត្រូវ',
    rarity: 'epic',
    unlockType: 'achievement',
    unlockRequirement: 'Reach 95% accuracy to unlock.',
    ownedByDefault: false,
    className: 'border-[#FFD75D] shadow-[0_0_26px_rgba(255,215,93,.62)]',
  },
  {
    id: 'boss_victor_frame',
    name: 'Boss Victor Frame',
    khmerName: 'ស៊ុមឈ្នះ Boss',
    rarity: 'epic',
    unlockType: 'achievement',
    unlockRequirement: 'Unlock by passing your first Boss.',
    ownedByDefault: false,
    className: 'border-[#FF8C3A] shadow-[0_0_24px_rgba(255,140,58,.55)]',
  },
  {
    id: 'seven_day_streak_frame',
    name: '7-Day Streak Frame',
    khmerName: 'ស៊ុម Streak ៧ ថ្ងៃ',
    rarity: 'legendary',
    unlockType: 'streak',
    unlockRequirement: 'Reach a 7-day streak.',
    ownedByDefault: false,
    className: 'border-[#77F35B] shadow-[0_0_28px_rgba(119,243,91,.6)]',
  },
  {
    id: 'temple_badge_frame',
    name: 'Temple Badge Frame',
    khmerName: 'ស៊ុមប្រាសាទ',
    rarity: 'epic',
    unlockType: 'shop',
    unlockRequirement: 'Buy this item in Shop.',
    ownedByDefault: false,
    shopItemId: 'temple-badge-frame',
    className: 'border-[#D5A44A] shadow-[0_0_24px_rgba(213,164,74,.62)]',
  },
];

export const PROFILE_COSMETICS: ProfileCosmeticConfig[] = [
  {
    id: 'elephant-costume',
    name: 'Elephant Costume',
    khmerName: 'សម្លៀកបំពាក់ដំរី',
    slot: 'costume',
    shopItemId: 'elephant-costume',
    unlockRequirement: 'Buy this item in Shop.',
    description: 'Equip an Angkor adventure costume on your profile avatar.',
  },
  {
    id: 'temple-badge-frame',
    name: 'Temple Badge Frame',
    khmerName: 'ស៊ុមប្រាសាទ',
    slot: 'frame',
    shopItemId: 'temple-badge-frame',
    unlockRequirement: 'Buy this item in Shop.',
    description: 'Show a carved temple frame around your player card.',
  },
  {
    id: 'keyboard-skin',
    name: 'Keyboard Skin',
    khmerName: 'ស្បែកក្ដារចុច',
    slot: 'keyboard',
    shopItemId: 'keyboard-skin',
    unlockRequirement: 'Buy this item in Shop.',
    description: 'Owned keyboard skins will appear here before they are wired into lessons.',
  },
  {
    id: 'victory-effect',
    name: 'Victory Effect',
    khmerName: 'ពន្លឺជ័យជម្នះ',
    slot: 'victory',
    shopItemId: 'victory-effect',
    unlockRequirement: 'Buy this item in Shop.',
    description: 'Owned victory effects can be prepared here for future result screens.',
  },
];

export const DEFAULT_AVATAR_ID = 'sophea_elephant';
export const DEFAULT_FRAME_ID = 'default_frame';
