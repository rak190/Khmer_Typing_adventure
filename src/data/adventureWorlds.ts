import { mapImages } from '../assets/assetManifest';
import { lessonCurriculum } from './lessonCurriculum';
import { getLessonProgressRecords, type LessonProgressRecord } from './mockData';

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
  unicodeRule: string;
  successCriteria: string;
  focusKeys: string[];
  stageCount: number;
  stagePreview: string[];
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
  mainLessonKh: string;
  mainLessonEn: string;
  skillFocus: string;
  unicodeFocus: string;
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
  { id: 1, x: 465, y: 755 },
  { id: 2, x: 440, y: 565 },
  { id: 3, x: 540, y: 370 },
  { id: 4, x: 858, y: 460 },
  { id: 5, x: 1073, y: 493 },
  { id: 6, x: 1140, y: 740 },
  { id: 7, x: 1460, y: 703 },
  { id: 8, x: 1465, y: 385 },
  { id: 'boss', x: 1565, y: 190 },
];

export const categoryBanners = [
  { key: 'consonants', x: 455, y: 315, tone: 'green', title: 'ព្យញ្ជនៈ', subtitle: 'Consonants' },
  { key: 'vowels', x: 835, y: 210, tone: 'gold', title: 'ស្រៈ', subtitle: 'Vowels' },
  { key: 'words', x: 1195, y: 360, tone: 'purple', title: 'ពាក្យ', subtitle: 'Typing Words' },
  { key: 'sentences', x: 910, y: 735, tone: 'blue', title: 'ប្រយោគ', subtitle: 'Sentences' },
  { key: 'boss', x: 1420, y: 220, tone: 'red', title: 'ប្រយុទ្ធ Boss', subtitle: 'Boss Challenge' },
] as const;

const worldImages: Record<number, string> = {
  1: mapImages.world1,
  2: mapImages.world2,
  3: mapImages.world3,
  4: mapImages.world4,
  5: mapImages.world5,
  6: mapImages.world6,
};

const nodeColors: AdventureNodeColor[] = ['green', 'green', 'green', 'gold', 'gold', 'purple', 'purple', 'blue', 'red'];

function findProgressRecord(progressRecords: LessonProgressRecord[], worldId: number, lessonId: AdventureNodeId) {
  return progressRecords.find((record) => record.worldId === worldId && record.lessonId === lessonId);
}

function isLessonComplete(progressRecords: LessonProgressRecord[], worldId: number, lessonId: AdventureNodeId) {
  return Boolean(findProgressRecord(progressRecords, worldId, lessonId));
}

function getSequentialCompletedCount(worldId: number, levels: typeof lessonCurriculum[number]['levels'], progressRecords: LessonProgressRecord[]) {
  let completed = 0;

  for (const level of levels) {
    if (level.id === 'boss') continue;
    if (!isLessonComplete(progressRecords, worldId, level.id)) break;
    completed += 1;
  }

  return completed;
}

export function buildAdventureWorlds(progressRecords: LessonProgressRecord[] = getLessonProgressRecords()): AdventureWorld[] {
  return lessonCurriculum.map((world) => {
    const normalCompleted = getSequentialCompletedCount(world.id, world.levels, progressRecords);
    const bossCompleted = isLessonComplete(progressRecords, world.id, 'boss');

    return {
      id: world.id,
      title: world.title,
      titleKh: world.titleKh,
      subtitle: world.subtitle,
      theme: world.theme,
      mainLessonKh: world.mainLessonKh,
      mainLessonEn: world.mainLessonEn,
      skillFocus: world.skillFocus,
      unicodeFocus: world.unicodeFocus,
      image: worldImages[world.id],
      normalCompleted,
      bossCompleted,
      lessons: world.levels.map((level, lessonIndex) => {
        const target = level.stages.reduce((total, stage) => total + stage.targetCount, 0);
        const progressRecord = findProgressRecord(progressRecords, world.id, level.id);
        const completed = level.id === 'boss' ? bossCompleted : lessonIndex < normalCompleted;

        return {
          id: level.id,
          sequence: lessonIndex + 1,
          labelKh: level.labelKh,
          labelEn: level.labelEn,
          category: level.category,
          objective: level.objective,
          unicodeRule: level.unicodeRule,
          successCriteria: level.successCriteria,
          focusKeys: level.focusKeys,
          stageCount: level.stages.length,
          stagePreview: level.stages.map((stage) => stage.titleKh),
          progress: completed ? target : 0,
          target,
          stars: completed ? progressRecord?.stars ?? 3 : 0,
          color: nodeColors[lessonIndex],
        };
      }),
    };
  });
}

export const adventureWorlds: AdventureWorld[] = buildAdventureWorlds();

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
