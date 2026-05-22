import { useSearchParams } from 'react-router-dom';
import LessonWorldScreen from '../components/lesson/LessonWorldScreen';
import { getCurriculumLevel, getCurriculumWorld, getDefaultCurriculumLevel, lessonCurriculum, type CurriculumLevel } from '../data/lessonCurriculum';

function parseLevelId(value: string | null) {
  if (value === 'boss') return 'boss';
  const level = Number(value ?? 1);
  return Number.isFinite(level) ? level : 1;
}

export default function LessonPage() {
  const [searchParams] = useSearchParams();
  const requestedWorldId = Number(searchParams.get('world') ?? 1);
  const world = getCurriculumWorld(Number.isFinite(requestedWorldId) ? requestedWorldId : 1) ?? lessonCurriculum[0];
  const requestedLevelId = parseLevelId(searchParams.get('level'));
  const lesson = getCurriculumLevel(world.id, requestedLevelId) ?? getDefaultCurriculumLevel();

  return <LessonWorldScreen key={`${world.id}-${lesson.id}`} world={world} lesson={lesson} />;
}
