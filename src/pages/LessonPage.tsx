import { Link, useSearchParams } from 'react-router-dom';
import LessonWorldScreen from '../components/lesson/LessonWorldScreen';
import { buildAdventureWorlds, getLessonState, isWorldUnlocked } from '../data/adventureWorlds';
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

  const worlds = buildAdventureWorlds();
  const mapWorld = worlds.find((item) => item.id === world.id);
  const mapLesson = mapWorld?.lessons.find((item) => item.id === lesson.id);
  if (practiceMode === 'curriculum' && mapWorld && mapLesson
    && (!isWorldUnlocked(world.id, worlds) || getLessonState(mapWorld, mapLesson) === 'locked')) {
    return (
      <div data-testid="two-d-lesson-locked" className="grid min-h-screen place-items-center bg-sky p-6 text-center font-khmer text-adventure">
        <div className="max-w-lg rounded-[22px] border border-white/70 bg-white/90 p-6 shadow-game">
          <h1 className="text-xl font-bold">សូមបញ្ចប់មេរៀនមុនសិន។ (This lesson is locked.)</h1>
          <Link className="mt-5 block rounded-xl bg-amber-300 p-3 font-bold" to="/map">ត្រឡប់ទៅផែនទី (Return to World Map)</Link>
        </div>
      </div>
    );
  }

  return <LessonWorldScreen key={`${practiceMode}-${world.id}-${lesson.id}`} world={world} lesson={lesson} practiceMode={practiceMode} />;
}
