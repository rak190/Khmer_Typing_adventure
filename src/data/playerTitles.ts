export type PlayerTitleConfig = {
  id: string;
  name: string;
  khmerName: string;
  description: string;
  unlockRequirement: string;
  ownedByDefault: boolean;
};

export const PLAYER_TITLES: PlayerTitleConfig[] = [
  {
    id: 'typing_hero',
    name: 'Typing Hero',
    khmerName: 'វីរបុរសវាយអក្សរ',
    description: 'Default title for every Khmer Typing Adventure student.',
    unlockRequirement: 'Unlocked by default.',
    ownedByDefault: true,
  },
  {
    id: 'first_steps',
    name: 'Khmer Typing Beginner',
    khmerName: 'អ្នកចាប់ផ្តើមខ្មែរ',
    description: 'For students who complete their first Khmer typing lesson.',
    unlockRequirement: 'Complete at least 1 lesson.',
    ownedByDefault: false,
  },
  {
    id: 'accuracy_monk',
    name: 'Accuracy Monk',
    khmerName: 'អ្នកថែភាពត្រឹមត្រូវ',
    description: 'A calm title for students who reach high accuracy.',
    unlockRequirement: 'Reach 95% accuracy in one lesson.',
    ownedByDefault: false,
  },
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    khmerName: 'អ្នកវាយលឿន',
    description: 'For students who meet a lesson CPM target.',
    unlockRequirement: 'Hit a target CPM in one lesson.',
    ownedByDefault: false,
  },
  {
    id: 'boss_victor',
    name: 'Boss Challenger',
    khmerName: 'អ្នកប្រយុទ្ធ Boss',
    description: 'For students who defeat at least one Boss.',
    unlockRequirement: 'Pass 1 Boss Battle.',
    ownedByDefault: false,
  },
  {
    id: 'streak_starter',
    name: 'Jungle Guardian',
    khmerName: 'អាណាព្យាបាលព្រៃ',
    description: 'For students who build a daily practice habit.',
    unlockRequirement: 'Reach a 3-day streak.',
    ownedByDefault: false,
  },
  {
    id: 'no_mistake_warrior',
    name: 'No Mistake Warrior',
    khmerName: 'អ្នកគ្មានកំហុស',
    description: 'For careful students who finish with no mistakes.',
    unlockRequirement: 'Complete a lesson with 100% accuracy and 0 mistakes.',
    ownedByDefault: false,
  },
  {
    id: 'khmer_master',
    name: 'Khmer Master',
    khmerName: 'អ្នកជំនាញខ្មែរ',
    description: 'A future mastery title for the full learning path.',
    unlockRequirement: 'Complete all structured lessons.',
    ownedByDefault: false,
  },
];

export const DEFAULT_TITLE_ID = 'typing_hero';
