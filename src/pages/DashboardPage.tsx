import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  Keyboard,
  Lock,
  Map,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import GameButton from '../components/game/GameButton';
import GameBadge from '../components/game-ui/GameBadge';
import PageTransition from '../components/layout/PageTransition';
import ProgressBar from '../components/game/ProgressBar';
import { LESSON_PROGRESS_EVENT } from '../data/mockData';
import { structuredTypingWorlds, type StructuredTypingLesson, type StructuredTypingWorld } from '../data/typingProgression';
import {
  getProgressRecommendation,
  getStructuredLessonStatus,
  getStudentDashboardStats,
  createEmptyStudentProgress,
  loadStudentProgress,
  STUDENT_PROGRESS_EVENT,
  type StudentProgress,
} from '../lib/studentProgress';

type StatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon: ReactNode;
  tone?: 'blue' | 'green' | 'gold' | 'purple' | 'red';
};

const toneStyles = {
  blue: 'from-[#E7F7FF] to-[#BDEBFF] border-[#7DC9F2] text-[#174C90]',
  green: 'from-[#E9FFD9] to-[#BDF39B] border-[#76C95F] text-[#176D35]',
  gold: 'from-[#FFF6CA] to-[#FFD777] border-[#D99A27] text-[#70420A]',
  purple: 'from-[#F0E8FF] to-[#D7C0FF] border-[#9A77E8] text-[#4D2E93]',
  red: 'from-[#FFE7DF] to-[#FFB7A8] border-[#E06D5B] text-[#8B2B1E]',
};

function DashboardPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`dashboard-panel rounded-[22px] border border-white/60 bg-white/88 p-5 shadow-game ${className}`}>
      {children}
    </section>
  );
}

function SectionHeading({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#E8F6FF] text-[#1764B2] shadow-inner">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-black leading-tight text-[#17325A]">{title}</h2>
          {subtitle && <p className="mt-0.5 font-bold leading-snug text-[#4F6A7F]">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail, icon, tone = 'blue' }: StatCardProps) {
  return (
    <section className={`rounded-[18px] border-2 bg-gradient-to-b p-4 shadow-[inset_0_2px_0_rgba(255,255,255,.62),0_10px_18px_rgba(24,71,112,.1)] ${toneStyles[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-black uppercase tracking-wide opacity-75">{label}</div>
          <div className="mt-1 truncate text-[30px] font-black leading-none">{value}</div>
          {detail && <div className="mt-1 truncate text-xs font-black opacity-70">{detail}</div>}
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-white/58 shadow-inner">{icon}</div>
      </div>
    </section>
  );
}

function lessonHref(lesson: StructuredTypingLesson) {
  return lesson.isBoss
    ? `/battle?world=${lesson.routeWorldId}`
    : `/lesson?world=${lesson.routeWorldId}&level=${lesson.routeLessonId}`;
}

function WorldProgressCard({ world, progress }: { world: StructuredTypingWorld; progress: StudentProgress }) {
  const lessonStates = world.lessons.map((lesson) => ({
    lesson,
    status: getStructuredLessonStatus(progress, lesson),
  }));
  const completed = lessonStates.filter((item) => item.status === 'completed').length;
  const nextLesson = lessonStates.find((item) => item.status === 'unlocked')?.lesson;
  const percent = world.lessons.length > 0 ? Math.round((completed / world.lessons.length) * 100) : 0;

  return (
    <article className="rounded-[18px] border-2 border-[#D8B56C] bg-gradient-to-b from-[#FFF9DE] to-[#EDCF88] p-4 text-[#4D371E] shadow-[inset_0_2px_0_rgba(255,255,255,.62),0_12px_20px_rgba(72,84,73,.12)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-wide text-[#8A632C]">World {world.worldId}</div>
          <h3 className="truncate text-lg font-black leading-tight">{world.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm font-bold text-[#76542B]">{world.subtitle}</p>
        </div>
        <div className="rounded-full bg-white/60 px-3 py-1 text-sm font-black">{completed}/{world.lessons.length}</div>
      </div>

      <div className="mt-3">
        <ProgressBar value={percent} max={100} color={percent === 100 ? 'green' : 'gold'} showValue />
      </div>

      <div className="mt-3 grid gap-2">
        {lessonStates.map(({ lesson, status }) => {
          const content = (
            <div className={`flex items-center justify-between gap-2 rounded-[12px] border px-3 py-2 text-sm font-black transition ${
              status === 'completed'
                ? 'border-[#58B86E] bg-[#E7FFD7] text-[#176D35]'
                : status === 'unlocked'
                  ? 'border-[#D79B2E] bg-[#FFF2B0] text-[#70420A] hover:-translate-y-0.5 hover:shadow-md'
                  : 'border-[#BBB4A7] bg-[#EEE8DE] text-[#706C66]'
            }`}
          >
            <span className="min-w-0 truncate">{lesson.lessonTitle}</span>
            <span className="shrink-0">
              {status === 'completed' ? <CheckCircle2 size={17} /> : status === 'unlocked' ? <ChevronRight size={17} /> : <Lock size={16} />}
            </span>
          </div>
          );

          return status === 'locked'
            ? <div key={lesson.lessonId}>{content}</div>
            : <Link key={lesson.lessonId} to={lessonHref(lesson)}>{content}</Link>;
        })}
      </div>

      {nextLesson ? (
        <Link to={lessonHref(nextLesson)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#174C90] px-3 py-2 text-sm font-black text-white shadow-button">
          Practice Next <ChevronRight size={16} />
        </Link>
      ) : (
        <div className="mt-3 rounded-[14px] bg-[#DFFFD4] px-3 py-2 text-center text-sm font-black text-[#176D35]">World complete</div>
      )}
    </article>
  );
}

function safeLoadStudentProgress(): StudentProgress {
  try {
    return loadStudentProgress();
  } catch (error) {
    console.error('Unable to load dashboard progress.', error);
    return createEmptyStudentProgress();
  }
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<StudentProgress>(() => safeLoadStudentProgress());
  const stats = useMemo(() => getStudentDashboardStats(progress), [progress]);
  const recommendation = useMemo(() => getProgressRecommendation(progress), [progress]);
  const completionPercent = stats.totalLessons > 0 ? Math.round((Math.min(stats.totalLessonsCompleted, stats.totalLessons) / stats.totalLessons) * 100) : 0;
  const nextStructuredLesson = structuredTypingWorlds.flatMap((world) => world.lessons).find((lesson) => getStructuredLessonStatus(progress, lesson) === 'unlocked');
  const earnedBadges = progress.badges.filter((badge) => badge.unlocked);

  useEffect(() => {
    const refreshProgress = () => setProgress(safeLoadStudentProgress());
    window.addEventListener('storage', refreshProgress);
    window.addEventListener(STUDENT_PROGRESS_EVENT, refreshProgress);
    window.addEventListener(LESSON_PROGRESS_EVENT, refreshProgress);

    return () => {
      window.removeEventListener('storage', refreshProgress);
      window.removeEventListener(STUDENT_PROGRESS_EVENT, refreshProgress);
      window.removeEventListener(LESSON_PROGRESS_EVENT, refreshProgress);
    };
  }, []);

  return (
    <PageTransition>
      <AppLayout>
        <div className="dashboard-page min-h-screen px-4 py-5 xl:px-6">
          <div className="mx-auto max-w-[1480px] space-y-5">
            <header className="dashboard-hero overflow-hidden rounded-[28px] border border-white/55 p-5 text-white shadow-game">
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
                <div className="max-w-[780px]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/14 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#DDF6FF]">
                    <Sparkles size={15} /> Student Progress
                  </div>
                  <h1 className="mt-3 text-[34px] font-black leading-tight sm:text-[42px]">Khmer Typing Dashboard</h1>
                  <p className="mt-2 text-lg font-bold leading-snug text-white/86">{recommendation}</p>
                  <div className="mt-4 max-w-[560px]">
                    <div className="mb-1 flex justify-between text-xs font-black uppercase tracking-wide text-white/72">
                      <span>Adventure Progress</span>
                      <span>{completionPercent}%</span>
                    </div>
                    <ProgressBar value={completionPercent} max={100} color="gold" showValue />
                  </div>
                </div>
                <div className="grid min-w-[260px] gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <Link to={nextStructuredLesson ? lessonHref(nextStructuredLesson) : '/map'}>
                    <GameButton variant="primary" icon={<BookOpen size={20} />} className="w-full">Continue</GameButton>
                  </Link>
                  <Link to="/map">
                    <GameButton variant="blue" icon={<Map size={20} />} className="w-full">Lesson Map</GameButton>
                  </Link>
                  <Link to="/lesson?practice=weak">
                    <GameButton variant="purple" icon={<Keyboard size={20} />} className="w-full">Weak Keys</GameButton>
                  </Link>
                </div>
              </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total XP" value={stats.totalXP.toLocaleString()} detail={`Level ${stats.currentLevel}`} icon={<Zap size={28} />} tone="gold" />
              <StatCard label="Lessons Complete" value={`${stats.totalLessonsCompleted}/${stats.totalLessons}`} detail={stats.currentWorld} icon={<Trophy size={28} />} tone="purple" />
              <StatCard label="Current Streak" value={`${stats.currentStreak} days`} detail={`Longest ${stats.longestStreak} days`} icon={<Flame size={28} />} tone="green" />
              <StatCard label="Next Lesson" value={stats.currentLessonTitle} detail="Unlocked path" icon={<Target size={28} />} tone="blue" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
              <DashboardPanel>
                <SectionHeading
                  icon={<Map size={24} />}
                  title="Learning Path"
                  subtitle="Compact view of unlocked lessons, completed worlds, and the next practice target."
                />
                <div className="grid gap-4 lg:grid-cols-2">
                  {structuredTypingWorlds.map((world) => (
                    <WorldProgressCard key={world.worldId} world={world} progress={progress} />
                  ))}
                </div>
              </DashboardPanel>

              <div className="space-y-5">
                <DashboardPanel>
                  <SectionHeading icon={<BarChart3 size={24} />} title="Typing Performance" subtitle="CPM is the main Khmer speed metric." />
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Avg Accuracy" value={`${stats.averageAccuracy}%`} icon={<Target size={24} />} tone="green" />
                    <StatCard label="Avg CPM" value={stats.averageCPM} icon={<BarChart3 size={24} />} tone="blue" />
                    <StatCard label="Best Accuracy" value={`${stats.bestAccuracy}%`} icon={<Star size={24} />} tone="gold" />
                    <StatCard label="Best CPM" value={stats.bestCPM} icon={<Zap size={24} />} tone="purple" />
                  </div>
                </DashboardPanel>

                <DashboardPanel>
                  <SectionHeading icon={<Keyboard size={24} />} title="Weak Keys" subtitle="Practice these before harder boss lessons." />
                  <div className="space-y-2">
                    {stats.weakCharacters.length > 0 ? stats.weakCharacters.map((weakKey, index) => (
                      <div key={weakKey.value} className="flex items-center justify-between gap-3 rounded-[16px] border border-[#DDBD70] bg-[#FFF8DA] px-4 py-3 font-black text-[#4D371E]">
                        <span>{index + 1}. <span className="khmer-body text-[24px]">{weakKey.value}</span></span>
                        <span className="text-sm">{weakKey.mistakes} mistakes</span>
                      </div>
                    )) : (
                      <div className="rounded-[16px] bg-[#E7F6FF] px-4 py-4 font-bold text-[#31516F]">
                        No weak keys yet. Complete one lesson and this card will turn mistakes into practice.
                      </div>
                    )}
                  </div>
                </DashboardPanel>

                <DashboardPanel>
                  <SectionHeading icon={<Award size={24} />} title="Badges" subtitle={`${earnedBadges.length}/${progress.badges.length} earned`} />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {progress.badges.map((badge, index) => (
                      <GameBadge
                        key={badge.badgeId}
                        label={badge.badgeName}
                        compact
                        locked={!badge.unlocked}
                        earned={badge.unlocked}
                        variant={index % 3 === 0 ? 'master' : index % 3 === 1 ? 'rising-star' : 'boss-slayer'}
                      />
                    ))}
                  </div>
                </DashboardPanel>

                <DashboardPanel>
                  <SectionHeading icon={<CalendarDays size={24} />} title="Recent Activity" subtitle="Latest saved lesson results." />
                  <div className="space-y-2">
                    {stats.recentLessonHistory.length > 0 ? stats.recentLessonHistory.map((result) => (
                      <div key={`${result.lessonId}-${result.completedAt}`} className="rounded-[16px] border border-[#B9D8F2] bg-[#F2FBFF] p-3">
                        <div className="flex items-center justify-between gap-3 font-black text-[#17325A]">
                          <span className="min-w-0 truncate">{result.lessonTitle}</span>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${result.passed ? 'bg-[#DFFFD4] text-[#176D35]' : 'bg-[#FFE5DC] text-[#8B2B1E]'}`}>
                            {result.passed ? 'Passed' : 'Retry'}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[12px] font-black text-[#46647A]">
                          <span>Acc {result.accuracy}%</span>
                          <span>CPM {result.CPM}</span>
                          <span>Stars {result.stars}</span>
                          <span>XP +{result.XP}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-[16px] bg-[#E7F6FF] px-4 py-4 font-bold text-[#31516F]">
                        No lesson history yet. Start a lesson to save your first result here.
                      </div>
                    )}
                  </div>
                </DashboardPanel>

                <DashboardPanel className="border-[#A9DFA5] bg-[#F4FFE8]/92">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#DFFFD4] text-[#176D35] shadow-inner">
                      <ShieldCheck size={24} />
                    </span>
                    <div>
                      <h2 className="text-xl font-black text-[#176D35]">Classroom Ready</h2>
                      <p className="mt-1 font-bold leading-snug text-[#3B6D41]">
                        Progress is saved locally with lesson IDs, accuracy, CPM, mistakes, XP, badges, and timestamps for future teacher reports.
                      </p>
                    </div>
                  </div>
                </DashboardPanel>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </PageTransition>
  );
}
