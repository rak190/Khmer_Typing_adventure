import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookOpenCheck,
  FileText,
  GraduationCap,
  Plus,
  Printer,
  Star,
  Target,
  Users,
} from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import GameButton from '../components/game/GameButton';
import LessonCard from '../components/game/LessonCard';
import ProgressBar from '../components/game/ProgressBar';
import QuestCard from '../components/game/QuestCard';
import RewardChest from '../components/game/RewardChest';
import StudentCard from '../components/game/StudentCard';
import TeacherDashboardCard from '../components/game/TeacherDashboardCard';
import GameBadge from '../components/game-ui/GameBadge';
import GameHudCounter from '../components/game-ui/GameHudCounter';
import GameIcon from '../components/game-ui/GameIcon';
import PageTransition from '../components/layout/PageTransition';
import {
  dashboardBadges,
  lessonCompletionData,
  lessonStages,
  performanceData,
  quests,
  students,
} from '../data/mockData';

export default function DashboardPage() {
  const sophea = students[1];

  return (
    <PageTransition>
      <AppLayout>
        <div className="min-h-screen overflow-hidden sky-clouds px-4 py-4 xl:px-6">
          <div className="mx-auto max-w-[1520px]">
            <header className="mb-4 flex flex-wrap items-center justify-center gap-4">
              <div className="flex overflow-hidden rounded-2xl border border-white/50 bg-white/45 p-1 shadow-game backdrop-blur">
                <button className="rounded-xl bg-adventure px-8 py-3 font-black text-white shadow-lg">Student View</button>
                <button className="rounded-xl px-8 py-3 font-black text-[#312064]">Teacher Dashboard</button>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <GameHudCounter type="coins" value={1250} />
                <GameHudCounter type="gems" value={125} />
              </div>
            </header>

            <div className="grid gap-5 xl:grid-cols-[1.08fr_1fr]">
              <section className="space-y-4">
                <div className="game-card rounded-3xl p-4">
                  <div className="mb-3 text-xl font-black uppercase text-adventure">Student Progress</div>
                  <StudentCard student={sophea} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <section className="game-card rounded-3xl p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-black text-adventure">Badges</h3>
                      <span className="font-black">12 / 24</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {dashboardBadges.slice(0, 6).map((badge, index) => (
                        <GameBadge key={`${badge.label}-${index}`} label={badge.label} variant={index > 3 ? 'boss-slayer' : 'master'} compact locked={index > 3} />
                      ))}
                    </div>
                    <GameButton variant="purple" size="sm" className="mt-4 w-full">View All</GameButton>
                  </section>
                  <section className="game-card rounded-3xl p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-black text-primary">Daily Quests</h3>
                      <span className="text-xs font-bold text-primary">Resets in 9h 15m</span>
                    </div>
                    <div className="space-y-2">
                      {quests.map((quest) => (
                        <QuestCard key={quest.id} quest={quest} />
                      ))}
                    </div>
                    <GameButton size="sm" className="mt-3 w-full">Claim Reward</GameButton>
                  </section>
                  <section className="game-card rounded-3xl p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-black text-adventure">Unlocked Worlds</h3>
                      <span className="font-black">8 / 12</span>
                    </div>
                    <div className="rounded-2xl bg-[linear-gradient(180deg,#8FE7FF,#65C76E)] p-3">
                      <div className="flex justify-around">
                        {[1, 2, 3, 4, 5].map((world) => (
                          <div key={world} className="grid h-11 w-11 place-items-center rounded-full bg-primary font-black text-white shadow-button">
                            {world}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link to="/map">
                      <GameButton variant="blue" size="sm" className="mt-4 w-full">Explore Worlds</GameButton>
                    </Link>
                  </section>
                </div>

                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4321A5] to-purple p-5 text-white shadow-game">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black">Challenge Mode</h3>
                    <p className="font-bold text-sky">Defeat bosses & win big rewards!</p>
                    <Link to="/battle">
                      <GameButton variant="purple" className="mt-4">Enter Challenge</GameButton>
                    </Link>
                  </div>
                  <div className="absolute right-6 top-2 h-36 w-36 rounded-full bg-coral/35 blur-xl" />
                  <div className="absolute bottom-3 right-20 grid h-20 w-20 place-items-center rounded-full bg-black/40">
                    <GameIcon name="lock" size={42} />
                  </div>
                </section>

                <section className="game-card rounded-3xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-black text-adventure">Lesson Progress</h3>
                    <Link className="font-black text-adventure" to="/lesson">View All Lessons</Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {lessonStages.slice(0, 5).map((stage, index) => (
                      <LessonCard key={stage.id} stage={stage} progress={[100, 100, 90, 75, 0][index]} />
                    ))}
                  </div>
                </section>

                <div className="grid gap-4 md:grid-cols-2">
                  <section className="game-card rounded-3xl p-4">
                    <h3 className="mb-3 font-black text-adventure">Recent Activity</h3>
                    <div className="space-y-3 text-sm font-bold">
                      {[
                        ['Completed Lesson 3: Words', '+150 XP', '10 min ago'],
                        ['Achieved 96% Accuracy', '+100 XP', '35 min ago'],
                        ['Won Mini-game: Stone Guardian', '+200 XP', '1 hr ago'],
                      ].map(([activity, xp, time]) => (
                        <div key={activity} className="flex items-center justify-between rounded-xl bg-sky/65 p-3">
                          <span>{activity}</span>
                          <span className="text-primary">{xp}</span>
                          <span className="text-slate-500">{time}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <RewardChest />
                </div>
              </section>

              <section className="space-y-4">
                <div className="game-card rounded-3xl p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xl font-black uppercase text-adventure">Class Overview</div>
                      <select className="mt-1 rounded-xl border border-adventure/25 bg-white px-3 py-1 font-black">
                        <option>Grade 4A</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <GameButton icon={<Plus size={18} />}>Add Student</GameButton>
                      <GameButton variant="blue" icon={<Users size={18} />}>Manage Class</GameButton>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-5">
                    <TeacherDashboardCard title="Students" value="24" icon={<Users />} />
                    <TeacherDashboardCard title="Avg. WPM" value="31" subtitle="+6" icon={<BarChart3 />} />
                    <TeacherDashboardCard title="Avg. Accuracy" value="94%" subtitle="+4%" icon={<Target />} />
                    <TeacherDashboardCard title="Lessons Completed" value="78%" icon={<BookOpenCheck />} />
                    <TeacherDashboardCard title="Total XP Earned" value="125,450" icon={<Star />} />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.25fr_.9fr]">
                  <section className="game-card rounded-3xl p-4">
                    <h3 className="mb-4 font-black uppercase text-adventure">Class Performance</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="wpm" stroke="#1E78E6" strokeWidth={3} dot={{ r: 5 }} />
                          <Line type="monotone" dataKey="accuracy" stroke="#28B463" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                  <section className="game-card rounded-3xl p-4">
                    <h3 className="mb-4 font-black uppercase text-adventure">Lesson Completion</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={lessonCompletionData} dataKey="value" innerRadius={58} outerRadius={90} paddingAngle={2}>
                            {lessonCompletionData.map((entry) => (
                              <Cell key={entry.name} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center text-4xl font-black text-slateGame">78%</div>
                    <div className="text-center font-bold">Completed</div>
                  </section>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="game-card rounded-3xl p-4">
                    <h3 className="mb-3 font-black uppercase text-adventure">Student Leaderboard</h3>
                    <div className="space-y-2">
                      {students.map((student, index) => (
                        <div key={student.id} className={`grid grid-cols-[36px_1fr_60px_70px_80px] items-center rounded-xl p-2 text-sm font-bold ${student.name === 'Sophea' ? 'bg-gold/30' : 'bg-sky/60'}`}>
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-gold font-black">{index + 1}</span>
                          <span>{student.avatar} {student.name}</span>
                          <span>{student.wpm}</span>
                          <span>{student.accuracy}%</span>
                          <span>{student.xp.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <GameButton variant="blue" size="sm" className="mt-3 w-full">View Full Leaderboard</GameButton>
                  </section>
                  <section className="game-card rounded-3xl p-4">
                    <h3 className="mb-3 font-black uppercase text-adventure">Student List</h3>
                    <div className="space-y-2">
                      {students.map((student) => (
                        <div key={student.id} className="grid grid-cols-[1fr_50px_70px_70px_80px] items-center rounded-xl bg-white/70 p-2 text-sm font-bold">
                          <span>{student.avatar} {student.name}</span>
                          <span>{student.wpm}</span>
                          <span>{student.accuracy}%</span>
                          <span>{student.name === 'Sophea' ? '78%' : `${Math.min(96, student.level * 7)}%`}</span>
                          <span className={student.status === 'Active' ? 'text-primary' : 'text-[#D58400]'}>{student.status}</span>
                        </div>
                      ))}
                    </div>
                    <GameButton variant="blue" size="sm" className="mt-3 w-full">View All Students</GameButton>
                  </section>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#123C73] to-purple p-4 text-white shadow-game">
                    <div className="relative z-10">
                      <h3 className="font-black uppercase">Daily Class Challenge</h3>
                      <div className="mt-2 text-xl font-black">Stone Guardian Challenge</div>
                      <p className="text-sm font-bold text-sky">Type accurately as a class to defeat the boss!</p>
                      <ProgressBar value={65} max={100} color="green" showValue className="mt-4" />
                      <GameButton variant="purple" size="sm" className="mt-4">View Challenge</GameButton>
                    </div>
                    <div className="absolute right-6 top-6 h-32 w-32 rounded-full bg-coral/35 blur-xl" />
                  </section>
                  <section className="game-card rounded-3xl p-4">
                    <h3 className="mb-3 font-black uppercase text-adventure">Teacher Tools</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Assign Lessons', FileText],
                        ['Class Reports', BarChart3],
                        ['Print Certificates', Printer],
                        ['Typing Test', GraduationCap],
                      ].map(([label, Icon]) => (
                        <button key={label as string} className="flex items-center gap-3 rounded-2xl bg-sky p-3 text-left font-black text-adventure">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-adventure text-white">
                            <Icon size={20} />
                          </span>
                          {label as string}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </section>
            </div>
          </div>
        </div>
      </AppLayout>
    </PageTransition>
  );
}
