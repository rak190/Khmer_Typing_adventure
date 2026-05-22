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

export type LessonProgressRecord = {
  worldId: number;
  lessonId: number | 'boss';
  score: number;
  accuracy: number;
  wpm: number;
  stars: number;
  xpEarned: number;
  coinsEarned: number;
  bestStreak: number;
};

export const mockLessonProgress: LessonProgressRecord[] = [];

export function saveMockLessonProgress(progress: LessonProgressRecord) {
  const existingIndex = mockLessonProgress.findIndex((item) => item.worldId === progress.worldId && item.lessonId === progress.lessonId);
  if (existingIndex >= 0) {
    mockLessonProgress[existingIndex] = progress;
    return progress;
  }

  mockLessonProgress.push(progress);
  return progress;
}

export async function saveLessonProgressToFirebase(progress: LessonProgressRecord) {
  // Firebase persistence will be connected here after auth/user progress schema is ready.
  return progress;
}

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
    { label: '«', value: '«', shift: '»', altgr: '\u200d', code: 'Backquote' },
    { label: '១', value: '១', shift: '!', code: 'Digit1' },
    { label: '២', value: '២', shift: '@', code: 'Digit2' },
    { label: '៣', value: '៣', shift: '"', code: 'Digit3' },
    { label: '៤', value: '៤', shift: '$', code: 'Digit4' },
    { label: '៥', value: '៥', shift: '%', code: 'Digit5' },
    { label: '៦', value: '៦', shift: '^', code: 'Digit6' },
    { label: '៧', value: '៧', shift: '&', code: 'Digit7' },
    { label: '៨', value: '៨', shift: '*', code: 'Digit8' },
    { label: '៩', value: '៩', shift: '(', code: 'Digit9' },
    { label: '០', value: '០', shift: ')', code: 'Digit0' },
    { label: 'ឥ', value: 'ឥ', shift: '៌', code: 'Minus' },
    { label: 'ឲ', value: 'ឲ', shift: '=', code: 'Equal' },
    { label: '⌫', value: '', action: 'backspace', wide: true, code: 'Backspace' },
  ],
  [
    { label: 'Tab', value: '', action: 'tab', wide: true, code: 'Tab' },
    { label: 'ឆ', value: 'ឆ', shift: 'ឈ', code: 'KeyQ' },
    { label: 'ឹ', value: 'ឹ', shift: 'ឺ', code: 'KeyW' },
    { label: 'េ', value: 'េ', shift: 'ែ', altgr: 'ឯ', code: 'KeyE' },
    { label: 'រ', value: 'រ', shift: 'ឬ', altgr: 'ឫ', code: 'KeyR' },
    { label: 'ត', value: 'ត', shift: 'ទ', code: 'KeyT' },
    { label: 'យ', value: 'យ', shift: 'ួ', code: 'KeyY' },
    { label: 'ុ', value: 'ុ', shift: 'ូ', code: 'KeyU' },
    { label: 'ិ', value: 'ិ', shift: 'ី', altgr: 'ឦ', code: 'KeyI' },
    { label: 'ោ', value: 'ោ', shift: 'ៅ', altgr: 'ឱ', code: 'KeyO' },
    { label: 'ផ', value: 'ផ', shift: 'ភ', altgr: 'ឰ', code: 'KeyP' },
    { label: 'ៀ', value: 'ៀ', shift: 'ឿ', altgr: 'ឩ', code: 'BracketLeft' },
    { label: 'ឪ', value: 'ឪ', shift: 'ឧ', altgr: 'ឳ', code: 'BracketRight' },
    { label: 'ឮ', value: 'ឮ', shift: 'ឭ', altgr: '\\', wide: true, code: 'Backslash' },
  ],
  [
    { label: 'Caps', value: '', action: 'caps', wide: true, code: 'CapsLock' },
    { label: 'ា', value: 'ា', shift: 'ាំ', code: 'KeyA' },
    { label: 'ស', value: 'ស', shift: 'ៃ', code: 'KeyS' },
    { label: 'ដ', value: 'ដ', shift: 'ឌ', code: 'KeyD' },
    { label: 'ថ', value: 'ថ', shift: 'ធ', code: 'KeyF' },
    { label: 'ង', value: 'ង', shift: 'អ', code: 'KeyG' },
    { label: 'ហ', value: 'ហ', shift: 'ះ', code: 'KeyH' },
    { label: '្', value: '្', shift: 'ញ', code: 'KeyJ' },
    { label: 'ក', value: 'ក', shift: 'គ', code: 'KeyK' },
    { label: 'ល', value: 'ល', shift: 'ឡ', code: 'KeyL' },
    { label: 'ើ', value: 'ើ', shift: 'ោះ', altgr: '៖', code: 'Semicolon' },
    { label: '់', value: '់', shift: '៉', altgr: 'ៈ', code: 'Quote' },
    { label: 'Enter', value: '', action: 'enter', wide: true, code: 'Enter' },
  ],
  [
    { label: 'Shift', value: '', action: 'shift', wide: true, code: 'ShiftLeft' },
    { label: 'ឋ', value: 'ឋ', shift: 'ឍ', code: 'KeyZ' },
    { label: 'ខ', value: 'ខ', shift: 'ឃ', code: 'KeyX' },
    { label: 'ច', value: 'ច', shift: 'ជ', code: 'KeyC' },
    { label: 'វ', value: 'វ', shift: 'េះ', code: 'KeyV' },
    { label: 'ប', value: 'ប', shift: 'ព', code: 'KeyB' },
    { label: 'ន', value: 'ន', shift: 'ណ', code: 'KeyN' },
    { label: 'ម', value: 'ម', shift: 'ំ', code: 'KeyM' },
    { label: 'ុំ', value: 'ុំ', shift: 'ុះ', altgr: ',', code: 'Comma' },
    { label: '។', value: '។', shift: '៕', altgr: '.', code: 'Period' },
    { label: '៊', value: '៊', shift: '?', altgr: '/', code: 'Slash' },
    { label: 'Shift', value: '', action: 'shift', wide: true, code: 'ShiftRight' },
  ],
  [
    { label: 'Ctrl', value: '', action: 'control', wide: true, code: 'ControlLeft' },
    { label: 'Win', value: '', action: 'meta', code: 'MetaLeft' },
    { label: 'Alt', value: '', action: 'altgr', code: 'AltLeft' },
    { label: 'Space Khmer', value: ' ', action: 'space', wide: true },
    { label: 'AltGr', value: '', action: 'altgr', wide: true, code: 'AltRight' },
    { label: 'Menu', value: '', action: 'menu', code: 'ContextMenu' },
    { label: 'Ctrl', value: '', action: 'control', wide: true, code: 'ControlRight' },
  ],
];

export function getKhmerKeyboardValue(event: KeyboardEvent) {
  if (event.code === 'Space') return ' ';

  const key = keyboardRows.flat().find((item) => item.code === event.code);
  if (!key) return event.key.length === 1 ? event.key : null;
  if (key.action && key.action !== 'space') return null;

  const usingAltGr = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey);
  if (usingAltGr) return key.altgr || key.value || null;
  if (event.shiftKey || event.getModifierState?.('CapsLock')) return key.shift || key.value || null;
  return key.value || null;
}

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
