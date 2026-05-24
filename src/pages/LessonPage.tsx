import { useSearchParams } from 'react-router-dom';
import LessonWorldScreen from '../components/lesson/LessonWorldScreen';
import { getCurriculumLevel, getCurriculumWorld, getDefaultCurriculumLevel, lessonCurriculum } from '../data/lessonCurriculum';
import { buildWeakKeyPracticeLesson, loadStudentProgress } from '../lib/studentProgress';

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
  const practiceMode = searchParams.get('practice') === 'weak' ? 'weak' : 'curriculum';
  const lesson = practiceMode === 'weak'
    ? buildWeakKeyPracticeLesson(loadStudentProgress())
    : getCurriculumLevel(world.id, requestedLevelId) ?? getDefaultCurriculumLevel();

  return <LessonWorldScreen key={`${practiceMode}-${world.id}-${lesson.id}`} world={world} lesson={lesson} practiceMode={practiceMode} />;
}
