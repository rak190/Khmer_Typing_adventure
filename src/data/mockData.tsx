import {
  Award,
  BookOpen,
  Crown,
  Flame,
  Gamepad2,
  Gem,
  GraduationCap,
  Medal,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import type { Achievement, KeyboardKeyData, LessonStage, PowerUp, Quest, ResourceState, Student } from '../types/game';

export const resources: ResourceState = {
  coins: 1250,
  gems: 125,
  hearts: 5,
  maxHearts: 5,
  xp: 1250,
  nextXp: 1800,
  level: 12,
};

export const navItems = [
  { label: 'Home', khmer: 'ទំព័រដើម', to: '/', icon: BookOpen },
  { label: 'Lessons', khmer: 'មេរៀន', to: '/lesson', icon: GraduationCap },
  { label: 'Mini-Games', khmer: 'ល្បែង', to: '/battle', icon: Gamepad2 },
  { label: 'Boss Battles', khmer: 'ប្រយុទ្ធ', to: '/battle', icon: Swords },
  { label: 'Leaderboard', khmer: 'ចំណាត់ថ្នាក់', to: '/dashboard', icon: Trophy },
  { label: 'For Teachers', khmer: 'គ្រូបង្រៀន', to: '/dashboard', icon: Users },
];

export const featureCards = [
  { title: 'Khmer Lessons', khmer: 'មេរៀនខ្មែរ', text: 'Learn letters, words & sentences step by step', icon: BookOpen, tone: 'blue' },
  { title: 'Mini-Games', khmer: 'ល្បែងខ្លី', text: 'Fun typing challenges that build your skills', icon: Gamepad2, tone: 'purple' },
  { title: 'Challenge Mode', khmer: 'ប្រកួតប្រជែង', text: 'Defeat tricky bosses with your typing power', icon: Swords, tone: 'red' },
  { title: 'Teacher Friendly', khmer: 'សម្រាប់គ្រូ', text: 'Track progress, assign lessons & support students', icon: Users, tone: 'green' },
];

export const lessonStages: LessonStage[] = [
  { id: 1, khmer: 'ព្យញ្ជនៈ', english: 'Khmer Consonants', status: 'complete', stars: 3, color: 'green' },
  { id: 2, khmer: 'ស្រៈ', english: 'Khmer Vowels', status: 'complete', stars: 3, color: 'green' },
  { id: 3, khmer: 'ពាក្យងាយ', english: 'Simple Words', status: 'complete', stars: 2, color: 'green' },
  { id: 4, khmer: 'ប្រយោគ', english: 'Sentences', status: 'complete', stars: 2, color: 'gold' },
  { id: 5, khmer: 'មេប្រយុទ្ធ', english: 'Boss Challenge', status: 'complete', stars: 3, color: 'gold' },
  { id: 6, khmer: 'ពាក្យ', english: 'Words - Animals', status: 'current', stars: 2, color: 'purple' },
  { id: 7, khmer: 'អានលឿន', english: 'Speed Words', status: 'current', stars: 1, color: 'purple' },
  { id: 8, khmer: 'ប្រយោគ', english: 'Sentences', status: 'current', stars: 2, color: 'blue' },
  { id: 9, khmer: 'សរសេរ', english: 'Writing Boost', status: 'locked', stars: 0, color: 'gray' },
  { id: 10, khmer: 'សម្រង់', english: 'Story Lines', status: 'locked', stars: 0, color: 'gray' },
  { id: 11, khmer: 'ចៅហ្វាយ', english: 'Boss Gate', status: 'locked', stars: 0, color: 'gray' },
];

export const achievements: Achievement[] = [
  { id: 'first', name: 'First Steps', subtitle: 'Complete Lesson 1', icon: <Shield size={24} />, tone: 'green' },
  { id: 'speed', name: 'Speedy Typist', subtitle: 'Type 30 WPM', icon: <Star size={24} />, tone: 'gold' },
  { id: 'word', name: 'Word Master', subtitle: 'Type 100 Words', icon: <Medal size={24} />, tone: 'purple' },
  { id: 'boss', name: 'Boss Slayer', subtitle: 'Defeat 1 Boss', icon: <Swords size={24} />, tone: 'red' },
  { id: 'perfect', name: 'Perfect! 5', subtitle: 'Get 5 perfect lessons', icon: <Award size={24} />, tone: 'blue' },
];

export const quests: Quest[] = [
  { id: 'q1', title: 'Type 3 lessons', khmerTitle: 'វាយមេរៀន ៣', progress: 3, total: 3, rewardCoins: 30, complete: true },
  { id: 'q2', title: 'Earn 99% accuracy', khmerTitle: 'ត្រឹមត្រូវ ៩៩%', progress: 0, total: 99, rewardCoins: 20 },
  { id: 'q3', title: 'Play 1 mini-game', khmerTitle: 'លេងល្បែង ១', progress: 1, total: 1, rewardCoins: 20, complete: true },
];

export const students: Student[] = [
  { id: 's1', name: 'Ratha', avatar: '👦', level: 13, wpm: 45, accuracy: 98, xp: 12450, streak: 19, status: 'Active' },
  { id: 's2', name: 'Sophea', avatar: '🐘', level: 12, wpm: 32, accuracy: 96, xp: 8450, streak: 15, status: 'Active' },
  { id: 's3', name: 'Vicheka', avatar: '👧', level: 11, wpm: 31, accuracy: 95, xp: 7980, streak: 12, status: 'Active' },
  { id: 's4', name: 'Dara', avatar: '🧒', level: 10, wpm: 28, accuracy: 93, xp: 6720, streak: 9, status: 'In Progress' },
  { id: 's5', name: 'Pich', avatar: '👦', level: 9, wpm: 27, accuracy: 92, xp: 6150, streak: 8, status: 'In Progress' },
];

export const performanceData = [
  { day: 'May 5', wpm: 29, accuracy: 86 },
  { day: 'May 12', wpm: 34, accuracy: 88 },
  { day: 'May 19', wpm: 33, accuracy: 90 },
  { day: 'May 26', wpm: 38, accuracy: 93 },
  { day: 'Jun 2', wpm: 36, accuracy: 92 },
];

export const lessonCompletionData = [
  { name: 'Completed', value: 78, fill: '#28B463' },
  { name: 'In Progress', value: 15, fill: '#1E78E6' },
  { name: 'Not Started', value: 7, fill: '#CBD5E1' },
];

export const khmerLetters = ['ក', 'ខ', 'គ', 'ឃ', 'ង', 'ច', 'ឆ', 'ជ', 'ញ', 'ដ', 'ឋ', 'ឌ', 'ណ', 'ត', 'ថ'];

export const battleWords = ['សាលា', 'កូន', 'ទឹក', 'ផ្កា', 'ដំរី', 'ភ្នំ', 'អក្សរ', 'ព្រះ'];

export const keyboardRows: KeyboardKeyData[][] = [
  [
    { label: 'ឥ', value: 'ឥ' },
    { label: 'ឦ', value: 'ឦ' },
    { label: 'ក', value: 'ក' },
    { label: 'ខ', value: 'ខ' },
    { label: 'គ', value: 'គ' },
    { label: 'ឃ', value: 'ឃ' },
    { label: 'ង', value: 'ង' },
    { label: 'ច', value: 'ច' },
    { label: 'ឆ', value: 'ឆ' },
    { label: 'ជ', value: 'ជ' },
    { label: 'ញ', value: 'ញ' },
    { label: '⌫', value: '', action: 'backspace' },
  ],
  [
    { label: 'ដ', value: 'ដ' },
    { label: 'ឋ', value: 'ឋ' },
    { label: 'ឌ', value: 'ឌ' },
    { label: 'ឍ', value: 'ឍ' },
    { label: 'ណ', value: 'ណ' },
    { label: 'ត', value: 'ត' },
    { label: 'ថ', value: 'ថ' },
    { label: 'ទ', value: 'ទ' },
    { label: 'ធ', value: 'ធ' },
    { label: 'ន', value: 'ន' },
    { label: 'ប', value: 'ប' },
  ],
  [
    { label: 'ផ', value: 'ផ' },
    { label: 'ព', value: 'ព' },
    { label: 'ភ', value: 'ភ' },
    { label: 'ម', value: 'ម' },
    { label: 'យ', value: 'យ' },
    { label: 'រ', value: 'រ' },
    { label: 'ល', value: 'ល' },
    { label: 'វ', value: 'វ' },
    { label: 'ស', value: 'ស' },
    { label: 'ហ', value: 'ហ' },
    { label: 'Enter', value: '', action: 'enter', wide: true },
  ],
  [
    { label: 'ា', value: 'ា' },
    { label: 'ិ', value: 'ិ' },
    { label: 'ី', value: 'ី' },
    { label: 'ឹ', value: 'ឹ' },
    { label: 'ុ', value: 'ុ' },
    { label: 'ូ', value: 'ូ' },
    { label: 'ំ', value: 'ំ' },
    { label: 'ះ', value: 'ះ' },
    { label: 'Space Khmer', value: ' ', action: 'space', wide: true },
  ],
];

export const powerUps: PowerUp[] = [
  { id: 'shield', name: 'Shield', description: 'Block damage', icon: <Shield size={30} />, tone: 'blue' },
  { id: 'freeze', name: 'Time Freeze', description: 'Slow enemy', icon: <Sparkles size={30} />, tone: 'purple' },
  { id: 'double', name: 'Double Score', description: '2x points', icon: <Zap size={30} />, tone: 'gold' },
  { id: 'heal', name: 'Mega Heal', description: 'Recover health', icon: <Flame size={30} />, tone: 'red' },
];

export const dashboardBadges = [
  { label: 'Newbie', icon: <Medal size={24} />, tone: 'gold' },
  { label: 'Rising Star', icon: <Star size={24} />, tone: 'blue' },
  { label: 'Expert', icon: <Zap size={24} />, tone: 'purple' },
  { label: 'Master', icon: <Crown size={24} />, tone: 'gold' },
  { label: 'Legend', icon: <Gem size={24} />, tone: 'red' },
];
