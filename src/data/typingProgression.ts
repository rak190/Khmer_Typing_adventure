import type { AdventureNodeId } from './adventureWorlds';

export type TypingDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'boss';

export type TypingUnlockCondition = {
  type: 'none' | 'lesson';
  lessonId?: string;
};

export type StructuredTypingLesson = {
  lessonId: string;
  lessonTitle: string;
  worldId: number;
  worldTitle: string;
  skillFocus: string;
  targetText: string;
  minimumAccuracy: number;
  targetCPM: number;
  xpReward: number;
  unlockCondition: TypingUnlockCondition;
  difficulty: TypingDifficulty;
  routeWorldId: number;
  routeLessonId: AdventureNodeId;
  isBoss?: boolean;
  badgeGroup?: 'home' | 'consonant' | 'vowel' | 'word' | 'coeng' | 'mark' | 'sentence' | 'speed' | 'accuracy' | 'final';
};

export type StructuredTypingWorld = {
  worldId: number;
  title: string;
  subtitle: string;
  lessons: StructuredTypingLesson[];
};

function lesson(
  data: Omit<StructuredTypingLesson, 'unlockCondition' | 'worldTitle'> & { worldTitle?: string; unlockAfter?: string },
): StructuredTypingLesson {
  return {
    ...data,
    worldTitle: data.worldTitle ?? '',
    unlockCondition: data.unlockAfter ? { type: 'lesson', lessonId: data.unlockAfter } : { type: 'none' },
  };
}

export const structuredTypingWorlds: StructuredTypingWorld[] = [
  {
    worldId: 1,
    title: 'Home Key Temple',
    subtitle: 'Home key and basic keyboard familiarity',
    lessons: [
      lesson({
        lessonId: 'w1-home-runes',
        lessonTitle: 'Home Row Runes',
        worldId: 1,
        skillFocus: 'Find the center Khmer keys and build careful rhythm.',
        targetText: 'ក គ ស ដ ល ហ ក គ ស ដ ល ហ',
        minimumAccuracy: 90,
        targetCPM: 28,
        xpReward: 80,
        difficulty: 'beginner',
        routeWorldId: 1,
        routeLessonId: 1,
        badgeGroup: 'home',
      }),
      lesson({
        lessonId: 'w1-stone-reach',
        lessonTitle: 'Stone Key Reach',
        worldId: 1,
        skillFocus: 'Move from home keys to nearby consonants without rushing.',
        targetText: 'ក ខ គ ច ជ ដ ត ប ម ន',
        minimumAccuracy: 90,
        targetCPM: 30,
        xpReward: 90,
        difficulty: 'beginner',
        routeWorldId: 1,
        routeLessonId: 2,
        unlockAfter: 'w1-home-runes',
        badgeGroup: 'home',
      }),
    ],
  },
  {
    worldId: 2,
    title: 'Consonant Jungle',
    subtitle: 'Common Khmer consonants: ក ខ គ ច ជ ដ ត ប ម ន',
    lessons: [
      lesson({
        lessonId: 'w2-common-consonants',
        lessonTitle: 'Common Consonant Trail',
        worldId: 2,
        skillFocus: 'Master the most common Khmer consonants.',
        targetText: 'ក ខ គ ច ជ ដ ត ប ម ន កត់ ចាំ មាន',
        minimumAccuracy: 90,
        targetCPM: 34,
        xpReward: 100,
        difficulty: 'beginner',
        routeWorldId: 1,
        routeLessonId: 2,
        unlockAfter: 'w1-stone-reach',
        badgeGroup: 'consonant',
      }),
      lesson({
        lessonId: 'w2-boss-consonants',
        lessonTitle: 'Consonant Gate Boss',
        worldId: 2,
        skillFocus: 'Boss check for common consonants in short words.',
        targetText: 'កូន មក តាម ដាន កម្រិត',
        minimumAccuracy: 92,
        targetCPM: 38,
        xpReward: 150,
        difficulty: 'boss',
        routeWorldId: 1,
        routeLessonId: 3,
        unlockAfter: 'w2-common-consonants',
        isBoss: true,
        badgeGroup: 'consonant',
      }),
    ],
  },
  {
    worldId: 3,
    title: 'Vowel Waterfall',
    subtitle: 'Khmer vowels: ា ិ ី ឹ ឺ ុ ូ េ ែ ៃ',
    lessons: [
      lesson({
        lessonId: 'w3-simple-vowels',
        lessonTitle: 'Short Vowel Well',
        worldId: 3,
        skillFocus: 'Type dependent vowels after the consonant in Unicode order.',
        targetText: 'កា កិ គី ចុ ដូ តឹ បឺ មុ',
        minimumAccuracy: 92,
        targetCPM: 38,
        xpReward: 110,
        difficulty: 'beginner',
        routeWorldId: 1,
        routeLessonId: 4,
        unlockAfter: 'w2-boss-consonants',
        badgeGroup: 'vowel',
      }),
      lesson({
        lessonId: 'w3-front-vowels',
        lessonTitle: 'Mirror Vowels',
        worldId: 3,
        skillFocus: 'Practice vowels that render before or around consonants.',
        targetText: 'កេ កែ កៃ កោ កៅ តែ ទៅ',
        minimumAccuracy: 92,
        targetCPM: 40,
        xpReward: 120,
        difficulty: 'intermediate',
        routeWorldId: 1,
        routeLessonId: 5,
        unlockAfter: 'w3-simple-vowels',
        badgeGroup: 'vowel',
      }),
    ],
  },
  {
    worldId: 4,
    title: 'Word Market',
    subtitle: 'Common Khmer words',
    lessons: [
      lesson({
        lessonId: 'w4-common-words',
        lessonTitle: 'Market Word Path',
        worldId: 4,
        skillFocus: 'Connect consonants and vowels inside useful words.',
        targetText: 'តា ទឹក កូន សាលា រៀន មក ទៅ',
        minimumAccuracy: 93,
        targetCPM: 44,
        xpReward: 130,
        difficulty: 'intermediate',
        routeWorldId: 1,
        routeLessonId: 6,
        unlockAfter: 'w3-front-vowels',
        badgeGroup: 'word',
      }),
      lesson({
        lessonId: 'w4-boss-words',
        lessonTitle: 'Word Guardian Boss',
        worldId: 4,
        skillFocus: 'Boss check for common words with clean spacing.',
        targetText: 'កូន រៀន នៅ សាលា ខ្មែរ',
        minimumAccuracy: 94,
        targetCPM: 48,
        xpReward: 170,
        difficulty: 'boss',
        routeWorldId: 2,
        routeLessonId: 'boss',
        unlockAfter: 'w4-common-words',
        isBoss: true,
        badgeGroup: 'word',
      }),
    ],
  },
  {
    worldId: 5,
    title: 'Subscript Cavern',
    subtitle: 'Subscript/coeng practice: ក្រ ប្រម ស្រ ត្រ',
    lessons: [
      lesson({
        lessonId: 'w5-coeng-basics',
        lessonTitle: 'Coeng Stone Steps',
        worldId: 5,
        skillFocus: 'Use coeng/subscript order without breaking Khmer clusters.',
        targetText: 'ក្រ ត្រ ស្រ ប្រម ខ្មែរ គ្រូ',
        minimumAccuracy: 94,
        targetCPM: 46,
        xpReward: 150,
        difficulty: 'intermediate',
        routeWorldId: 3,
        routeLessonId: 4,
        unlockAfter: 'w4-boss-words',
        badgeGroup: 'coeng',
      }),
      lesson({
        lessonId: 'w5-boss-coeng',
        lessonTitle: 'Subscript Hero Boss',
        worldId: 5,
        skillFocus: 'Boss check for mixed subscript combinations.',
        targetText: 'ខ្មែរ គ្រូ ស្រែ ប្រមូល ត្រា',
        minimumAccuracy: 95,
        targetCPM: 50,
        xpReward: 210,
        difficulty: 'boss',
        routeWorldId: 3,
        routeLessonId: 'boss',
        unlockAfter: 'w5-coeng-basics',
        isBoss: true,
        badgeGroup: 'coeng',
      }),
    ],
  },
  {
    worldId: 6,
    title: 'Mark Shrine',
    subtitle: 'Khmer signs and marks: ំ ះ ៈ ៍ ៏ ័ ៌',
    lessons: [
      lesson({
        lessonId: 'w6-signs-marks',
        lessonTitle: 'Sacred Marks',
        worldId: 6,
        skillFocus: 'Practice Khmer marks as part of complete syllables.',
        targetText: 'កំ កះ កៈ ក៏ ក័ ក៌ សំរាប់',
        minimumAccuracy: 94,
        targetCPM: 48,
        xpReward: 150,
        difficulty: 'intermediate',
        routeWorldId: 4,
        routeLessonId: 3,
        unlockAfter: 'w5-boss-coeng',
        badgeGroup: 'mark',
      }),
    ],
  },
  {
    worldId: 7,
    title: 'Sentence Bridge',
    subtitle: 'Short sentences',
    lessons: [
      lesson({
        lessonId: 'w7-short-sentences',
        lessonTitle: 'Short Sentence Bridge',
        worldId: 7,
        skillFocus: 'Keep accuracy while typing short Khmer sentences.',
        targetText: 'ខ្ញុំ រៀន ភាសា ខ្មែរ។ ខ្ញុំ វាយ ត្រឹមត្រូវ។',
        minimumAccuracy: 95,
        targetCPM: 54,
        xpReward: 180,
        difficulty: 'advanced',
        routeWorldId: 5,
        routeLessonId: 6,
        unlockAfter: 'w6-signs-marks',
        badgeGroup: 'sentence',
      }),
    ],
  },
  {
    worldId: 8,
    title: 'Speed Trial',
    subtitle: 'Timed speed challenge',
    lessons: [
      lesson({
        lessonId: 'w8-speed-challenge',
        lessonTitle: 'River Speed Trial',
        worldId: 8,
        skillFocus: 'Increase CPM only after accuracy is stable.',
        targetText: 'ខ្មែរ រៀន វាយ លឿន ត្រឹមត្រូវ រាល់ថ្ងៃ',
        minimumAccuracy: 95,
        targetCPM: 66,
        xpReward: 210,
        difficulty: 'advanced',
        routeWorldId: 5,
        routeLessonId: 7,
        unlockAfter: 'w7-short-sentences',
        badgeGroup: 'speed',
      }),
    ],
  },
  {
    worldId: 9,
    title: 'Accuracy Trial',
    subtitle: 'Accuracy challenge',
    lessons: [
      lesson({
        lessonId: 'w9-accuracy-challenge',
        lessonTitle: 'Monk Accuracy Trial',
        worldId: 9,
        skillFocus: 'Slow down and protect every Khmer Unicode sequence.',
        targetText: 'ភាព ត្រឹមត្រូវ សំខាន់ ជាង ល្បឿន។',
        minimumAccuracy: 97,
        targetCPM: 58,
        xpReward: 230,
        difficulty: 'advanced',
        routeWorldId: 6,
        routeLessonId: 4,
        unlockAfter: 'w8-speed-challenge',
        badgeGroup: 'accuracy',
      }),
    ],
  },
  {
    worldId: 10,
    title: 'Angkor Final Boss',
    subtitle: 'Final boss mixed paragraph',
    lessons: [
      lesson({
        lessonId: 'w10-final-boss',
        lessonTitle: 'Angkor Mixed Paragraph',
        worldId: 10,
        skillFocus: 'Final mixed paragraph with accuracy and CPM pressure.',
        targetText: 'ខ្ញុំ ជា វីរបុរស វាយអក្សរ ខ្មែរ។ ខ្ញុំ អាច វាយ ពាក្យ ប្រយោគ និង អត្ថបទ ខ្លី ដោយ ត្រឹមត្រូវ។',
        minimumAccuracy: 97,
        targetCPM: 72,
        xpReward: 320,
        difficulty: 'boss',
        routeWorldId: 6,
        routeLessonId: 'boss',
        unlockAfter: 'w9-accuracy-challenge',
        isBoss: true,
        badgeGroup: 'final',
      }),
    ],
  },
].map((world) => ({
  ...world,
  lessons: world.lessons.map((item) => ({ ...item, worldTitle: world.title })),
}));

export function getStructuredLessons() {
  return structuredTypingWorlds.flatMap((world) => world.lessons);
}

export function getStructuredLesson(lessonId: string) {
  return getStructuredLessons().find((lessonItem) => lessonItem.lessonId === lessonId);
}

export function getStructuredLessonByRoute(routeWorldId: number, routeLessonId: AdventureNodeId) {
  return getStructuredLessons().find((lessonItem) => lessonItem.routeWorldId === routeWorldId && lessonItem.routeLessonId === routeLessonId);
}

export function getPreviousStructuredLesson(lessonId: string) {
  const lessons = getStructuredLessons();
  const index = lessons.findIndex((lessonItem) => lessonItem.lessonId === lessonId);
  return index > 0 ? lessons[index - 1] : null;
}

export function isStructuredLessonUnlocked(completedLessonIds: string[], lessonItem: StructuredTypingLesson) {
  if (lessonItem.unlockCondition.type === 'none') return true;
  return Boolean(lessonItem.unlockCondition.lessonId && completedLessonIds.includes(lessonItem.unlockCondition.lessonId));
}

export function getNextStructuredLesson(completedLessonIds: string[]) {
  return getStructuredLessons().find((lessonItem) => !completedLessonIds.includes(lessonItem.lessonId) && isStructuredLessonUnlocked(completedLessonIds, lessonItem));
}
