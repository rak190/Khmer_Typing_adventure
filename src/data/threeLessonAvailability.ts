import {
  buildAdventureWorlds,
  getLessonState,
  isWorldUnlocked,
  type AdventureNodeId,
  type AdventureWorld,
} from './adventureWorlds';
import { lessonCurriculum, type CurriculumLevel } from './lessonCurriculum';
import { foundationHomeRowLesson } from './touchTypingFoundations';

// Curriculum data alone does not imply a finished 3D environment.
const supportedThreeLessons = new Set(['1:1']);

export function isThreeLessonSupported(worldId: number, lessonId: AdventureNodeId): boolean {
  const world = lessonCurriculum.find((item) => item.id === worldId);
  return Boolean(
    world?.levels.some((item) => item.id === lessonId) &&
      supportedThreeLessons.has(`${worldId}:${lessonId}`),
  );
}

type ValidLesson = { worldId: number; lesson: CurriculumLevel; isFoundation?: boolean };
export type ThreeLessonAccess =
  | { status: 'invalid' }
  | (ValidLesson & { status: 'ready' | 'locked' | 'unsupported' });

/** Strict URL validation followed by the same unlock rules used by the map. */
export function getThreeLessonAccess(
  params: URLSearchParams,
  worlds: AdventureWorld[] = buildAdventureWorlds(),
): ThreeLessonAccess {
  // Prerequisite Touch-Typing Foundation lesson (?foundation=1) is always accessible to beginners
  if (
    params.getAll('foundation').length === 1 &&
    params.get('foundation') === '1' &&
    !params.has('world') &&
    !params.has('level')
  ) {
    return {
      status: 'ready',
      worldId: 1,
      lesson: foundationHomeRowLesson,
      isFoundation: true,
    };
  }

  const worldParam = params.get('world');
  const levelParam = params.get('level');
  if (
    params.getAll('world').length !== 1 ||
    params.getAll('level').length !== 1 ||
    !worldParam ||
    !/^[1-9]\d*$/u.test(worldParam) ||
    !levelParam ||
    !/^(?:[1-9]\d*|boss)$/u.test(levelParam)
  ) {
    return { status: 'invalid' };
  }

  const worldId = Number(worldParam);
  const lessonId = levelParam === 'boss' ? 'boss' : Number(levelParam);
  const curriculumWorld = lessonCurriculum.find((item) => item.id === worldId);
  const lesson = curriculumWorld?.levels.find((item) => item.id === lessonId);
  if (!lesson) return { status: 'invalid' };

  const world = worlds.find((item) => item.id === worldId);
  const mapLesson = world?.lessons.find((item) => item.id === lessonId);
  if (
    !world ||
    !mapLesson ||
    !isWorldUnlocked(worldId, worlds) ||
    getLessonState(world, mapLesson) === 'locked'
  ) {
    return { status: 'locked', worldId, lesson };
  }
  return {
    status: isThreeLessonSupported(worldId, lessonId) ? 'ready' : 'unsupported',
    worldId,
    lesson,
  };
}
