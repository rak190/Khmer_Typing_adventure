import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Award, BarChart3, Flame, Lock, Map, Sparkles, Star, Target, Trophy, Zap } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import GameButton from '../components/game/GameButton';
import GameBadge from '../components/game-ui/GameBadge';
import PageTransition from '../components/layout/PageTransition';
import { LESSON_PROGRESS_EVENT } from '../data/mockData';
import { structuredTypingWorlds } from '../data/typingProgression';
import {
  getProgressRecommendation,
  getStructuredLessonStatus,
  getStudentDashboardStats,
  loadStudentProgress,
  STUDENT_PROGRESS_EVENT,
  type StudentProgress,
} from '../lib/studentProgress';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: 'blue' | 'green' | 'gold' | 'purple';
};

const toneStyles = {
  blue: 'from-[#E6F7FF] to-[#BDEBFF] border-[#7DC9F2] text-[#174C90]',
  green: 'from-[#E9FFD9] to-[#BDF39B] border-[#76C95F] text-[#176D35]',
  gold: 'from-[#FFF6CA] to-[#FFD777] border-[#D99A27] text-[#70420A]',
  purple: 'from-[#F0E8FF] to-[#D7C0FF] border-[#9A77E8] text-[#4D2E93]',
};

function StatCard({ label, value, icon, tone = 'blue' }: StatCardProps) {
  return (
    <section className={`rounded-[18px] border-2 bg-gradient-to-b p-4 shadow-[inset_0_2px_0_rgba(255,255,255,.62),0_12px_22px_rgba(24,71,112,.12)] ${toneStyles[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[12px] font-black uppercase tracking-wide opacity-75">{label}</div>
          <div className="mt-1 text-[32px] font-black leading-none">{value}</div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/58 shadow-inner">{icon}</div>
      </div>
    </section>
  );
}

function statusClass(status: string) {
  if (status === 'completed') return 'border-[#48B96A] bg-[#E8FFD8] text-[#176D35]';
  if (status === 'unlocked') return 'border-[#D4A03B] bg-[#FFF1A8] text-[#70420A]';
  return 'border-[#B7B1A6] bg-[#EEE8DE] text-[#706C66] grayscale';
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<StudentProgress>(() => loadStudentProgress());
  const stats = useMemo(() => getStudentDashboardStats(progress), [progress]);
  const recommendation = useMemo(() => getProgressRecommendation(progress), [progress]);

  useEffect(() => {
    const refreshProgress = () => setProgress(loadStudentProgress());
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
        <div className="min-h-screen sky-clouds px-4 py-5 xl:px-6">
          <div className="mx-auto max-w-[1500px] space-y-5">
            <header className="rounded-[24px] border border-white/55 bg-white/72 p-5 shadow-game backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[13px] font-black uppercase tracking-wide text-[#1E78E6]">Student Dashboard</div>
                  <h1 className="khmer-body text-[34px] font-black leading-tight text-[#17325A]">Khmer Typing Adventure Progress</h1>
                  <p className="mt-1 max-w-[820px] font-bold text-[#31516F]">{recommendation}</p>
                </div>
                <div className="flex gap-3">
                  <Link to="/map">
                    <GameButton variant="blue" icon={<Map size={20} />}>Lesson Map</GameButton>
                  </Link>
                  <Link to="/lesson?practice=weak">
                    <GameButton variant="purple" icon={<Sparkles size={20} />}>Practice Weak Keys</GameButton>
                  </Link>
                </div>
              </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total XP" value={stats.totalXP.toLocaleString()} icon={<Zap size={28} />} tone="gold" />
              <StatCard label="Current Level" value={stats.currentLevel} icon={<Trophy size={28} />} tone="purple" />
              <StatCard label="Current Streak" value={`${stats.currentStreak} days`} icon={<Flame size={28} />} tone="green" />
              <StatCard label="Lessons Complete" value={`${stats.totalLessonsCompleted}/${stats.totalLessons}`} icon={<Star size={28} />} tone="blue" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
              <section className="rounded-[24px] border border-white/55 bg-white/78 p-5 shadow-game backdrop-blur">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[22px] font-black uppercase text-adventure">Structured Khmer Path</h2>
                    <p className="font-bold text-[#46647A]">Next: {stats.currentLessonTitle} · {stats.currentWorld}</p>
                  </div>
                  <div className="rounded-full bg-[#E7F6FF] px-4 py-2 text-sm font-black text-[#174C90]">
                    Longest streak {stats.longestStreak} days
                  </div>
                </div>

                <div className="space-y-4">
                  {structuredTypingWorlds.map((world) => (
                    <section key={world.worldId} className="rounded-[18px] border-2 border-[#D6BC77] bg-gradient-to-b from-[#FFF8DA] to-[#F0D698] p-4 shadow-inner">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-[18px] font-black text-[#4D371E]">World {world.worldId}: {world.title}</h3>
                          <p className="text-sm font-bold text-[#76542B]">{world.subtitle}</p>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {world.lessons.map((lesson) => {
                          const status = getStructuredLessonStatus(progress, lesson);
                          const body = (
                            <div className={`h-full rounded-[14px] border-2 p-3 ${statusClass(status)}`}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-black">{lesson.lessonTitle}</div>
                                {status === 'locked' ? <Lock size={18} /> : lesson.isBoss ? <Award size={18} /> : <Target size={18} />}
                              </div>
                              <div className="mt-1 line-clamp-2 text-sm font-bold opacity-80">{lesson.skillFocus}</div>
                              <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-black">
                                <span className="rounded-full bg-white/62 px-2 py-1">Acc {lesson.minimumAccuracy}%</span>
                                <span className="rounded-full bg-white/62 px-2 py-1">CPM {lesson.targetCPM}</span>
                                <span className="rounded-full bg-white/62 px-2 py-1">XP {lesson.xpReward}</span>
                              </div>
                            </div>
                          );

                          if (status === 'locked') return <div key={lesson.lessonId}>{body}</div>;

                          return (
                            <Link key={lesson.lessonId} to={`/lesson?world=${lesson.routeWorldId}&level=${lesson.routeLessonId}`}>
                              {body}
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <section className="rounded-[24px] border border-white/55 bg-white/78 p-5 shadow-game backdrop-blur">
                  <h2 className="mb-4 text-[22px] font-black uppercase text-adventure">Typing Performance</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Avg Accuracy" value={`${stats.averageAccuracy}%`} icon={<Target size={24} />} tone="green" />
                    <StatCard label="Avg CPM" value={stats.averageCPM} icon={<BarChart3 size={24} />} tone="blue" />
                    <StatCard label="Best Accuracy" value={`${stats.bestAccuracy}%`} icon={<Star size={24} />} tone="gold" />
                    <StatCard label="Best CPM" value={stats.bestCPM} icon={<Zap size={24} />} tone="purple" />
                  </div>
                </section>

                <section className="rounded-[24px] border border-white/55 bg-white/78 p-5 shadow-game backdrop-blur">
                  <h2 className="text-[22px] font-black uppercase text-adventure">Weak Characters</h2>
                  <div className="mt-3 space-y-2">
                    {stats.weakCharacters.length > 0 ? stats.weakCharacters.map((weakKey, index) => (
                      <div key={weakKey.value} className="flex items-center justify-between rounded-[14px] border border-[#DDBD70] bg-[#FFF8DA] px-4 py-3 font-black text-[#4D371E]">
                        <span>{index + 1}. <span className="khmer-body text-[22px]">{weakKey.value}</span></span>
                        <span>{weakKey.mistakes} mistakes · {weakKey.backspaces} backspaces</span>
                      </div>
                    )) : (
                      <div className="rounded-[14px] bg-[#E7F6FF] px-4 py-3 font-bold text-[#31516F]">No weak-key history yet. Complete a lesson to build adaptive practice.</div>
                    )}
                  </div>
                </section>

                <section className="rounded-[24px] border border-white/55 bg-white/78 p-5 shadow-game backdrop-blur">
                  <h2 className="mb-4 text-[22px] font-black uppercase text-adventure">Badges Earned</h2>
                  <div className="grid grid-cols-3 gap-4">
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
                </section>

                <section className="rounded-[24px] border border-white/55 bg-white/78 p-5 shadow-game backdrop-blur">
                  <h2 className="mb-4 text-[22px] font-black uppercase text-adventure">Recent Lesson History</h2>
                  <div className="space-y-2">
                    {stats.recentLessonHistory.length > 0 ? stats.recentLessonHistory.map((result) => (
                      <div key={`${result.lessonId}-${result.completedAt}`} className="rounded-[14px] border border-[#B9D8F2] bg-[#F2FBFF] p-3">
                        <div className="flex items-center justify-between gap-3 font-black text-[#17325A]">
                          <span>{result.lessonTitle}</span>
                          <span>{result.passed ? 'Passed' : 'Retry'}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[12px] font-black text-[#46647A]">
                          <span>Acc {result.accuracy}%</span>
                          <span>CPM {result.CPM}</span>
                          <span>Stars {result.stars}</span>
                          <span>XP +{result.XP}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-[14px] bg-[#E7F6FF] px-4 py-3 font-bold text-[#31516F]">No lesson results saved yet.</div>
                    )}
                  </div>
                </section>
              </section>
            </div>
          </div>
        </div>
      </AppLayout>
    </PageTransition>
  );
}
