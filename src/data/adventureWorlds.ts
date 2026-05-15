import { mapImages } from '../assets/assetManifest';

export type AdventureNodeId = number | 'boss';
export type AdventureNodeState = 'completed' | 'current' | 'unlocked' | 'locked';
export type AdventureNodeColor = 'green' | 'gold' | 'purple' | 'blue' | 'gray' | 'red';

export type AdventureLesson = {
  id: AdventureNodeId;
  sequence: number;
  labelKh: string;
  labelEn: string;
  category: string;
  objective: string;
  progress: number;
  target: number;
  stars: number;
  color: AdventureNodeColor;
};

export type AdventureWorld = {
  id: number;
  title: string;
  titleKh: string;
  subtitle: string;
  theme: string;
  image: string;
  normalCompleted: number;
  bossCompleted: boolean;
  lessons: AdventureLesson[];
};

export type MapNodeLayout = {
  id: AdventureNodeId;
  x: number;
  y: number;
};

export const mapNodeLayout: MapNodeLayout[] = [
  { id: 1, x: 425, y: 470 },
  { id: 2, x: 600, y: 405 },
  { id: 3, x: 770, y: 300 },
  { id: 4, x: 910, y: 430 },
  { id: 5, x: 1085, y: 465 },
  { id: 6, x: 1235, y: 600 },
  { id: 7, x: 1385, y: 500 },
  { id: 8, x: 1510, y: 625 },
  { id: 'boss', x: 1435, y: 255 },
];

export const categoryBanners = [
  { key: 'consonants', x: 455, y: 315, tone: 'green', title: 'ព្យញ្ជនៈ', subtitle: 'Consonants' },
  { key: 'vowels', x: 835, y: 210, tone: 'gold', title: 'ស្រៈ', subtitle: 'Vowels' },
  { key: 'words', x: 1195, y: 360, tone: 'purple', title: 'ពាក្យ', subtitle: 'Typing Words' },
  { key: 'sentences', x: 910, y: 735, tone: 'blue', title: 'ប្រយោគ', subtitle: 'Sentences' },
  { key: 'boss', x: 1420, y: 220, tone: 'red', title: 'ប្រយុទ្ធ Boss', subtitle: 'Boss Challenge' },
] as const;

const worldLessonSets = [
  {
    title: 'Temple Jungle',
    titleKh: 'ព្រៃប្រាសាទ',
    subtitle: 'រៀនព្យញ្ជនៈ ស្រៈ និងពាក្យដំបូង',
    theme: 'Beginner Island',
    image: mapImages.world1,
    lessons: [
      ['ព្យញ្ជនៈ', 'Consonant Keys', 'ព្យញ្ជនៈ', 'វាយព្យញ្ជនៈឱ្យត្រឹមត្រូវ ២០ តួ'],
      ['មេរៀន ២', 'Home Row', 'ព្យញ្ជនៈ', 'ដាក់ម្រាមដៃលើ Home Row ហើយវាយអក្សរ'],
      ['មេរៀន ៣', 'Vowel Marks', 'ស្រៈ', 'វាយស្រៈឱ្យត្រឹមត្រូវ ២០ ដង'],
      ['មេរៀន ៤', 'Vowel Combos', 'ស្រៈ', 'ផ្គូផ្គងព្យញ្ជនៈជាមួយស្រៈ'],
      ['មេរៀន ៥', 'Simple Words', 'ពាក្យ', 'វាយពាក្យខ្មែរខ្លីៗឱ្យត្រឹមត្រូវ'],
      ['ពាក្យ', 'Animal Words', 'ពាក្យ', 'វាយពាក្យអំពីសត្វឱ្យត្រឹមត្រូវ ២០ ពាក្យ'],
      ['អានវគ្គ', 'Reading Flow', 'ប្រយោគ', 'វាយឃ្លាខ្លីៗដោយរលូន'],
      ['ប្រយោគ', 'First Sentences', 'ប្រយោគ', 'វាយប្រយោគខ្លីៗ ៨ ប្រយោគ'],
      ['ប្រយុទ្ធ', 'Jungle Boss', 'Boss Battle', 'ឈ្នះ Boss ប្រាសាទព្រៃ'],
    ],
  },
  {
    title: 'River Ruins',
    titleKh: 'ប្រាសាទទន្លេ',
    subtitle: 'ហ្វឹកហាត់ស្រៈ ការបន្សំ និងល្បឿន',
    theme: 'Water Temple',
    image: mapImages.world2,
    lessons: [
      ['ស្រៈ', 'Vowel Review', 'ស្រៈ', 'រំលឹកទីតាំងស្រៈទាំងអស់'],
      ['សំឡេង', 'Sound Pairs', 'ស្រៈ', 'វាយគូសំឡេងឱ្យត្រូវគ្នា'],
      ['ពាក្យទឹក', 'River Words', 'ពាក្យ', 'វាយពាក្យអំពីទឹក និងធម្មជាតិ'],
      ['បន្សំ', 'Letter Blends', 'ពាក្យ', 'វាយព្យាង្គខ្មែរដែលបានបន្សំ'],
      ['ល្បឿន', 'Speed Words', 'ពាក្យ', 'រក្សាចង្វាក់វាយអក្សរឱ្យស្មើ'],
      ['កំណាត់', 'Short Phrases', 'ប្រយោគ', 'វាយឃ្លាខ្លីៗឱ្យត្រឹមត្រូវ'],
      ['អាន', 'Reading Lines', 'ប្រយោគ', 'វាយបន្ទាត់អានជាប់គ្នា'],
      ['ស្ទាត់', 'Accuracy Trial', 'ប្រយោគ', 'បញ្ចប់ដោយភាពត្រឹមត្រូវខ្ពស់'],
      ['ប្រយុទ្ធ', 'River Boss', 'Boss Battle', 'ឈ្នះការប្រកួតវាយអក្សរទន្លេ'],
    ],
  },
  {
    title: 'Sky Pagoda',
    titleKh: 'ចេតិយមេឃ',
    subtitle: 'ហ្វឹកហាត់ចង្វាក់ និងឃ្លាវែងៗ',
    theme: 'Sky Island',
    image: mapImages.world3,
    lessons: [
      ['ក្តារចុច', 'Keyboard Reach', 'ព្យញ្ជនៈ', 'ហ្វឹកហាត់ការឈានម្រាមដៃទៅគ្រាប់ចុចពិបាក'],
      ['ជួរលើ', 'Top Row', 'ព្យញ្ជនៈ', 'គ្រប់គ្រងអក្សរនៅជួរលើ'],
      ['ជួរក្រោម', 'Bottom Row', 'ព្យញ្ជនៈ', 'គ្រប់គ្រងអក្សរនៅជួរក្រោម'],
      ['សញ្ញា', 'Marks and Signs', 'ស្រៈ', 'វាយសញ្ញាខ្មែរដែលប្រើញឹកញាប់'],
      ['ពាក្យលឿន', 'Quick Words', 'ពាក្យ', 'វាយពាក្យមុនពេល Timer អស់'],
      ['ចង្វាក់', 'Typing Rhythm', 'ពាក្យ', 'រក្សាចង្វាក់វាយអក្សរឱ្យរលូន'],
      ['ឃ្លា', 'Phrase Builder', 'ប្រយោគ', 'បង្កើតឃ្លាឱ្យបានពេញលេញ'],
      ['ប្រយោគវែង', 'Long Sentences', 'ប្រយោគ', 'វាយប្រយោគវែងៗឱ្យត្រឹមត្រូវ'],
      ['ប្រយុទ្ធ', 'Sky Boss', 'Boss Battle', 'បញ្ចប់ការប្រកួតនៅលើមេឃ'],
    ],
  },
  {
    title: 'Golden Library',
    titleKh: 'បណ្ណាល័យមាស',
    subtitle: 'ពាក្យថ្មី និងប្រយោគក្នុងថ្នាក់រៀន',
    theme: 'Scholar Temple',
    image: mapImages.world4,
    lessons: [
      ['សាលា', 'School Words', 'ពាក្យ', 'វាយពាក្យអំពីថ្នាក់រៀន'],
      ['គ្រួសារ', 'Family Words', 'ពាក្យ', 'វាយពាក្យអំពីគ្រួសារ'],
      ['អាហារ', 'Food Words', 'ពាក្យ', 'វាយពាក្យអំពីអាហារ'],
      ['ពណ៌', 'Color Words', 'ពាក្យ', 'វាយពាក្យអំពីពណ៌'],
      ['លេខ', 'Numbers', 'ពាក្យ', 'វាយពាក្យលេខជាភាសាខ្មែរ'],
      ['សំណួរ', 'Question Lines', 'ប្រយោគ', 'វាយប្រយោគសំណួរ'],
      ['ចម្លើយ', 'Answer Lines', 'ប្រយោគ', 'វាយប្រយោគចម្លើយ'],
      ['មេរៀនសាលា', 'Classroom Mission', 'ប្រយោគ', 'វាយសេចក្តីណែនាំក្នុងថ្នាក់រៀន'],
      ['ប្រយុទ្ធ', 'Library Boss', 'Boss Battle', 'ឈ្នះការសាកល្បងអ្នកប្រាជ្ញ'],
    ],
  },
  {
    title: 'Shadow Volcano',
    titleKh: 'ភ្នំភ្លើងងងឹត',
    subtitle: 'ហ្វឹកហាត់ភាពត្រឹមត្រូវក្រោមសម្ពាធ',
    theme: 'Danger Island',
    image: mapImages.world5,
    lessons: [
      ['ពាក្យលំបាក', 'Hard Words', 'ពាក្យ', 'វាយពាក្យលំបាកឱ្យត្រឹមត្រូវ'],
      ['កុំច្រឡំ', 'Tricky Pairs', 'ពាក្យ', 'ជៀសវាងការច្រឡំគូគ្រាប់ចុច'],
      ['ល្បឿនខ្ពស់', 'High Speed', 'ពាក្យ', 'វាយអក្សរដោយល្បឿនលឿនជាងមុន'],
      ['ត្រឹមត្រូវ', 'Accuracy Drill', 'ពាក្យ', 'រក្សាកំហុសឱ្យតិចបំផុត'],
      ['ពេលវេលា', 'Timed Words', 'ពាក្យ', 'ឈ្នះ Timer ពាក្យ'],
      ['ប្រយោគលឿន', 'Fast Sentences', 'ប្រយោគ', 'វាយប្រយោគលឿនៗ'],
      ['កំហុសតិច', 'Low Mistake Run', 'ប្រយោគ', 'បញ្ចប់ដោយមានកំហុសតិច'],
      ['សាកល្បងធំ', 'Final Trial', 'ប្រយោគ', 'បញ្ចប់ការសាកល្បង Typing ចម្រុះ'],
      ['ប្រយុទ្ធ', 'Volcano Boss', 'Boss Battle', 'ឈ្នះ Boss ភ្នំភ្លើង'],
    ],
  },
  {
    title: 'Royal Angkor',
    titleKh: 'អង្គររាជ្យ',
    subtitle: 'វគ្គជំនាញចុងក្រោយសម្រាប់ Typing',
    theme: 'Final Kingdom',
    image: mapImages.world6,
    lessons: [
      ['រំលឹក', 'Grand Review', 'ចម្រុះ', 'រំលឹកក្រុមគ្រាប់ចុចទាំងអស់'],
      ['អក្សរទាំងអស់', 'All Letters', 'ចម្រុះ', 'វាយអក្សរទាំងអស់ដែលបានរៀន'],
      ['ពាក្យចម្រុះ', 'Mixed Words', 'ពាក្យ', 'វាយពាក្យចម្រុះ'],
      ['ប្រយោគចម្រុះ', 'Mixed Sentences', 'ប្រយោគ', 'វាយប្រយោគចម្រុះ'],
      ['អានលឿន', 'Fast Reading', 'ប្រយោគ', 'អាន ហើយវាយឱ្យលឿន'],
      ['កំណត់ត្រា', 'Record Run', 'ចម្រុះ', 'បង្កើតពិន្ទុខ្ពស់ថ្មី'],
      ['ជំនាញ', 'Master Skill', 'ចម្រុះ', 'បញ្ចប់មេរៀនជំនាញ'],
      ['វគ្គចុងក្រោយ', 'Final Lesson', 'ចម្រុះ', 'បញ្ចប់មេរៀន Typing ចុងក្រោយ'],
      ['ប្រយុទ្ធ', 'Angkor Champion', 'Boss Battle', 'ឈ្នះ Boss ចុងក្រោយ'],
    ],
  },
] as const;

const nodeColors: AdventureNodeColor[] = ['green', 'green', 'green', 'gold', 'gold', 'purple', 'purple', 'blue', 'red'];

export const adventureWorlds: AdventureWorld[] = worldLessonSets.map((world, worldIndex) => {
  const normalCompleted = worldIndex === 0 ? 5 : 0;
  const bossCompleted = false;

  return {
    id: worldIndex + 1,
    title: world.title,
    titleKh: world.titleKh,
    subtitle: world.subtitle,
    theme: world.theme,
    image: world.image,
    normalCompleted,
    bossCompleted,
    lessons: world.lessons.map(([labelKh, labelEn, category, objective], lessonIndex) => ({
      id: lessonIndex === 8 ? 'boss' : lessonIndex + 1,
      sequence: lessonIndex + 1,
      labelKh,
      labelEn,
      category,
      objective,
      progress: lessonIndex < normalCompleted ? 20 : lessonIndex === normalCompleted ? 12 : 0,
      target: lessonIndex === 8 ? 1 : 20,
      stars: lessonIndex < normalCompleted ? (lessonIndex === 3 ? 2 : 3) : lessonIndex === normalCompleted ? 2 : 0,
      color: nodeColors[lessonIndex],
    })),
  };
});

export function isWorldComplete(world: AdventureWorld) {
  return world.normalCompleted >= 8 && world.bossCompleted;
}

export function isWorldUnlocked(worldId: number, worlds: AdventureWorld[] = adventureWorlds) {
  if (worldId === 1) return true;
  const previousWorld = worlds.find((world) => world.id === worldId - 1);
  return previousWorld ? isWorldComplete(previousWorld) : false;
}

export function getLessonState(world: AdventureWorld, lesson: AdventureLesson): AdventureNodeState {
  if (lesson.id === 'boss') {
    if (world.bossCompleted) return 'completed';
    if (world.normalCompleted >= 8) return 'current';
    return 'locked';
  }

  if (lesson.sequence <= world.normalCompleted) return 'completed';
  if (lesson.sequence === world.normalCompleted + 1) return 'current';
  return 'locked';
}

export function getWorldStars(world: AdventureWorld) {
  return world.lessons.reduce((total, lesson) => total + lesson.stars, 0);
}

export function getWorldProgress(world: AdventureWorld) {
  const cleared = world.normalCompleted + (world.bossCompleted ? 1 : 0);
  return { cleared, total: 9 };
}
