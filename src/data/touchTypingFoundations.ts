import {
  findKhmerKeyByCode,
  formatPhysicalKeyLabel,
  HOME_ROW_KEY_CODES,
  type KhmerKey,
} from './keyboardMap';
import type { CurriculumLevel, CurriculumWorld } from './lessonCurriculum';
import { getFingerGuidance } from '../lib/fingerGuidance';

export const FOUNDATION_LESSON_ID = 'foundation-home-row';

export type TouchTypingFoundationModule = {
  number: number;
  id: string;
  titleKh: string;
  titleEn: string;
  practiceMode: 'hand-position' | 'physical-key' | 'unicode-output';
  focusKeys: string[];
  objectiveKh: string;
  objectiveEn: string;
};

/**
 * Part 5: 10-Stage Touch-Typing-First Beginner Progression
 * Inspired by the SBBIC Khmer Unicode Typing Trainer & standard NiDA touch-typing pedagogy.
 */
export const touchTypingFoundationModules: TouchTypingFoundationModule[] = [
  {
    number: 1,
    id: 'foundation-1-hand-intro',
    titleKh: 'មូលដ្ឋានទី ១៖ ការណែនាំអំពីក្តារចុច និងទីតាំងដៃ',
    titleEn: 'Foundation 1 — Keyboard and Hand Introduction',
    practiceMode: 'hand-position',
    focusKeys: [...HOME_ROW_KEY_CODES, 'Space'],
    objectiveKh:
      'រៀនអង្គុយឲ្យត្រង់ខ្លួន ដាក់ម្រាមដៃឆ្វេងលើ A S D F និងដៃស្តាំលើ J K L ; ដោយសម្គាល់គន្លឹះ F និង J និងដាក់មេដៃលើ Spacebar។',
    objectiveEn:
      'Learn sitting posture, left hand on A S D F, right hand on J K L ;, tactile bumps on F and J, and thumbs on Spacebar.',
  },
  {
    number: 2,
    id: 'foundation-2-left-home-row',
    titleKh: 'មូលដ្ឋានទី ២៖ ហាត់ជួរកណ្តាលដៃឆ្វេង (A S D F)',
    titleEn: 'Foundation 2 — Left-Hand Home-Row Practice',
    practiceMode: 'physical-key',
    focusKeys: ['KeyF', 'KeyD', 'KeyS', 'KeyA'],
    objectiveKh:
      'ស្គាល់ទីតាំងគ្រាប់ចុច F D S A ម្តងមួយៗ ដោយប្រើម្រាមដៃឆ្វេងត្រឹមត្រូវ និងរក្សាទីតាំងដើម។',
    objectiveEn:
      'Introduce F, D, S, and A progressively with slow controlled repetition and return to home position.',
  },
  {
    number: 3,
    id: 'foundation-3-right-home-row',
    titleKh: 'មូលដ្ឋានទី ៣៖ ហាត់ជួរកណ្តាលដៃស្តាំ (J K L ;)',
    titleEn: 'Foundation 3 — Right-Hand Home-Row Practice',
    practiceMode: 'physical-key',
    focusKeys: ['KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
    objectiveKh:
      'ស្គាល់ទីតាំងគ្រាប់ចុច J K L ; ម្តងមួយៗ ដោយប្រើម្រាមដៃស្តាំត្រឹមត្រូវ មិនច្រឡំសញ្ញាជើង (្) ឬស្រៈផ្សំ។',
    objectiveEn:
      'Introduce J, K, L, and Semicolon by physical key position without confusing combining-mark output.',
  },
  {
    number: 4,
    id: 'foundation-4-two-hand-coordination',
    titleKh: 'មូលដ្ឋានទី ៤៖ ការសម្របសម្រួលដៃឆ្វេង និងដៃស្តាំ',
    titleEn: 'Foundation 4 — Two-Hand Coordination',
    practiceMode: 'physical-key',
    focusKeys: [...HOME_ROW_KEY_CODES],
    objectiveKh:
      'ហាត់ចុចឆ្លាស់គ្នារវាងដៃឆ្វេង និងដៃស្តាំ (F J, D K, S L, A ;) ដោយផ្តោតលើភាពត្រឹមត្រូវមុនល្បឿន។',
    objectiveEn:
      'Alternate physical keys between left and right hands to build bilateral finger coordination.',
  },
  {
    number: 5,
    id: 'foundation-5-upper-row-reach',
    titleKh: 'មូលដ្ឋានទី ៥៖ ការឈោងម្រាមដៃទៅជួរលើ និងត្រឡប់មកវិញ',
    titleEn: 'Foundation 5 — Upper-Row Reach and Return',
    practiceMode: 'physical-key',
    focusKeys: ['KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyE', 'KeyI', 'KeyW', 'KeyO', 'KeyQ', 'KeyP'],
    objectiveKh:
      'ហាត់ឈោងម្រាមដៃពីជួរកណ្តាលឡើងទៅជួរលើ (ដូចជា F→R, J→U, D→E, K→I) រួចត្រឡប់មកទីតាំងដើមវិញ។',
    objectiveEn:
      'Teach fingers to reach upward from their home positions in small groups and return home.',
  },
  {
    number: 6,
    id: 'foundation-6-lower-row-reach',
    titleKh: 'មូលដ្ឋានទី ៦៖ ការឈោងម្រាមដៃទៅជួរក្រោម និងត្រឡប់មកវិញ',
    titleEn: 'Foundation 6 — Lower-Row Reach and Return',
    practiceMode: 'physical-key',
    focusKeys: ['KeyV', 'KeyB', 'KeyN', 'KeyM', 'KeyC', 'Comma', 'KeyX', 'Period', 'KeyZ', 'Slash'],
    objectiveKh:
      'ហាត់ឈោងម្រាមដៃពីជួរកណ្តាលចុះទៅជួរក្រោម (ដូចជា F→V, J→N, D→C, S→X) រួចត្រឡប់មកទីតាំងដើមវិញ។',
    objectiveEn:
      'Teach fingers to reach downward to the bottom row in small predictable patterns and return home.',
  },
  {
    number: 7,
    id: 'foundation-7-opposite-shift',
    titleKh: 'មូលដ្ឋានទី ៧៖ ការប្រើ Shift ដោយកូនដៃម្ខាងទៀត',
    titleEn: 'Foundation 7 — Shift and Two-Hand Coordination',
    practiceMode: 'unicode-output',
    focusKeys: ['ShiftLeft', 'ShiftRight', 'KeyK', 'KeyD', 'KeyF', 'KeyJ'],
    objectiveKh:
      'គ្រាប់ចុចដៃឆ្វេងត្រូវប្រើ Right Shift ហើយគ្រាប់ចុចដៃស្តាំត្រូវប្រើ Left Shift ដោយម្រាមកូនដៃម្ខាងទៀត។',
    objectiveEn:
      'Teach opposite-hand Shift technique: Left-hand target key -> Right Shift; Right-hand target key -> Left Shift.',
  },
  {
    number: 8,
    id: 'foundation-8-khmer-char-connection',
    titleKh: 'មូលដ្ឋានទី ៨៖ ការភ្ជាប់គ្រាប់ចុចទៅអក្សរខ្មែរ Unicode',
    titleEn: 'Foundation 8 — Khmer Character Connection',
    practiceMode: 'unicode-output',
    focusKeys: ['ថ', 'ក', 'ដ', 'ល', 'ស', 'ង', 'ហ', 'ា', 'ើ'],
    objectiveKh:
      'ភ្ជាប់គ្រាប់ចុចដែលបានរៀនទៅនឹងអក្សរខ្មែរ និងយល់ថាគ្រាប់ចុចមួយអាចបង្កើតអក្សរខុសគ្នាតាម Shift ឬ AltGr។',
    objectiveEn:
      'Connect learned physical keys to their Khmer Unicode outputs across base, Shift, and AltGr layers.',
  },
  {
    number: 9,
    id: 'foundation-9-khmer-unicode-sequences',
    titleKh: 'មូលដ្ឋានទី ៩៖ លំដាប់វាយអក្សរខ្មែរ ស្រៈ និងជើងអក្សរ (្)',
    titleEn: 'Foundation 9 — Khmer Unicode Sequences',
    practiceMode: 'unicode-output',
    focusKeys: ['កា', 'កើ', 'ក្រ', 'ខ្មែរ'],
    objectiveKh:
      'វាយតាមលំដាប់ Unicode ត្រឹមត្រូវ៖ ព្យញ្ជនៈដើម → សញ្ញាជើង (្) + ព្យញ្ជនៈជើង → ស្រៈនិស្ស័យ → សញ្ញាវណ្ណយុត្តិ។',
    objectiveEn:
      'Type Khmer Unicode in canonical order: base consonant -> coeng (្) + subscript -> dependent vowel -> diacritic.',
  },
  {
    number: 10,
    id: 'foundation-10-khmer-words-sentences',
    titleKh: 'មូលដ្ឋានទី ១០៖ ពាក្យ និងប្រយោគភាសាខ្មែរ',
    titleEn: 'Foundation 10 — Khmer Words and Sentences',
    practiceMode: 'unicode-output',
    focusKeys: ['កង', 'សាលា', 'ប្រទេសកម្ពុជា'],
    objectiveKh:
      'វាយពាក្យ និងប្រយោគភាសាខ្មែរដោយរក្សាភាពត្រឹមត្រូវ និងបង្កើនល្បឿន CPM បន្តិចម្តងៗ។',
    objectiveEn:
      'Practice common Khmer words and sentences while gradually building accuracy and CPM.',
  },
];

/**
 * Part 8: First Complete 5-Stage Beginner Foundation Lesson
 * Compatible with both 2D and 3D systems without modifying or invalidating World 1–6 lesson IDs.
 */
export const foundationHomeRowLesson: CurriculumLevel = {
  id: 1,
  labelKh: 'មូលដ្ឋានទីតាំងដៃ និងជួរកណ្តាល',
  labelEn: 'Home Row & Hand Position Foundation',
  category: 'Touch-Typing Foundation',
  objective:
    'Learn sitting posture, both-hand home-row placement (A S D F and J K L ;), finger reach-and-return, two-hand coordination, and basic Khmer home-row temple gate unlocking.',
  focusKeys: ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';', 'G', 'H'],
  unicodeRule:
    'Place left fingers on A S D F and right fingers on J K L ; (feel the tactile bumps on F and J). Practice physical key positions first before combining Khmer characters.',
  successCriteria:
    'Complete all 5 foundation stages with proper key accuracy to unlock the Ancient Khmer Sanctuary.',
  minimumAccuracy: 90,
  speedTargetCpm: 20,
  stages: [
    {
      id: 'f1-s1',
      kind: 'warmup',
      practiceMode: 'hand-position',
      untimed: true,
      titleKh: 'ទីតាំងដៃលើជួរកណ្តាល',
      titleEn: 'Learn Hand Position',
      mission: 'ពិនិត្យមើលទីតាំងដៃទាំងពីរលើជួរកណ្តាល (A S D F និង J K L ;) មុនពេលចាប់ផ្តើមវាយ។',
      skill: 'Sitting posture, home-row hand placement, F & J tactile bumps, thumb on Spacebar.',
      mechanic: 'Untimed visual hand-position inspection and optional home-row key check.',
      targetCount: 8,
      accuracyGoal: 85,
      physicalKeyCodes: [
        'KeyA',
        'KeyS',
        'KeyD',
        'KeyF',
        'KeyJ',
        'KeyK',
        'KeyL',
        'Semicolon',
      ],
      items: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
      postureInstructionsKh: [
        '១. អង្គុយឲ្យត្រង់ខ្លួន បន្ធូរស្មា និងដាក់ភ្នែកមើលអេក្រង់។',
        '២. ដៃឆ្វេងដាក់លើជួរកណ្តាល៖ កូនដៃ=A, ដៃនាង=S, ដៃកណ្តាល=D, ដៃចង្អុល=F (មានគន្លឹះសម្គាល់លើ F)។',
        '៣. ដៃស្តាំដាក់លើជួរកណ្តាល៖ ដៃចង្អុល=J (មានគន្លឹះសម្គាល់លើ J), ដៃកណ្តាល=K, ដៃនាង=L, កូនដៃ=;។',
        '៤. មេដៃទាំងពីរដាក់ក្បែរគ្រាប់ចុច Spacebar។',
        '៥. ចំណាំ៖ រូបដៃបង្ហាញដើម្បីណែនាំបច្ចេកទេសត្រឹមត្រូវ (កម្មវិធីវាស់តាមគ្រាប់ចុចពិតប្រាកដលើក្តារចុច)។',
      ],
      hint: 'ដាក់ម្រាមដៃចង្អុលលើ F និង J ដែលមានគន្លឹះសម្គាល់ រួចចុចប៊ូតុងបន្ត ឬសាកចុចគ្រាប់ចុចទាំង ៨។',
    },
    {
      id: 'f1-s2',
      kind: 'warmup',
      practiceMode: 'physical-key',
      untimed: true,
      titleKh: 'ស្គាល់គ្រាប់ចុចជួរកណ្តាល',
      titleEn: 'Guided Key Discovery',
      mission: 'ចុចគ្រាប់ចុចជួរកណ្តាលម្តងមួយៗ (F, J, D, K, S, L, A, ;) តាមការណែនាំម្រាមដៃ។',
      skill: 'Identify all 8 physical home-row keys and their assigned fingers.',
      mechanic: 'Mode A physical-key discovery using KeyboardEvent.code.',
      targetCount: 16,
      accuracyGoal: 88,
      physicalKeyCodes: [
        'KeyF',
        'KeyF',
        'KeyJ',
        'KeyJ',
        'KeyD',
        'KeyD',
        'KeyK',
        'KeyK',
        'KeyS',
        'KeyS',
        'KeyL',
        'KeyL',
        'KeyA',
        'KeyA',
        'Semicolon',
        'Semicolon',
      ],
      items: [
        'KeyF KeyF',
        'KeyJ KeyJ',
        'KeyD KeyD',
        'KeyK KeyK',
        'KeyS KeyS',
        'KeyL KeyL',
        'KeyA KeyA',
        'Semicolon Semicolon',
      ],
      hint: 'មើលទីតាំងគ្រាប់ចុច និងម្រាមដៃដែលភ្លឺ រួចចុចគ្រាប់ចុចពិតប្រាកដលើក្តារចុចយឺតៗឲ្យត្រឹមត្រូវ។',
    },
    {
      id: 'f1-s3',
      kind: 'pattern',
      practiceMode: 'physical-key',
      untimed: true,
      titleKh: 'ឈោងម្រាមដៃ និងត្រឡប់មកទីតាំងដើម',
      titleEn: 'Finger Reach and Return',
      mission: 'ហាត់ឈោងម្រាមដៃពីជួរកណ្តាលទៅគ្រាប់ចុចជិតៗ (G, H, R, U, E, I) រួចត្រឡប់មកទីតាំងដើមវិញ។',
      skill: 'Reach from home position to adjacent keys and return to home key.',
      mechanic: 'Mode A physical-key reach-and-return drill (F-G-F, J-H-J, F-R-F, J-U-J, D-E-D, K-I-K).',
      targetCount: 18,
      accuracyGoal: 88,
      physicalKeyCodes: [
        'KeyF',
        'KeyG',
        'KeyF',
        'KeyJ',
        'KeyH',
        'KeyJ',
        'KeyF',
        'KeyR',
        'KeyF',
        'KeyJ',
        'KeyU',
        'KeyJ',
        'KeyD',
        'KeyE',
        'KeyD',
        'KeyK',
        'KeyI',
        'KeyK',
      ],
      items: [
        'KeyF KeyG KeyF',
        'KeyJ KeyH KeyJ',
        'KeyF KeyR KeyF',
        'KeyJ KeyU KeyJ',
        'KeyD KeyE KeyD',
        'KeyK KeyI KeyK',
      ],
      hint: 'ក្រោយពេលឈោងចុច G, H, R, U, E ឬ I សូមត្រឡប់ម្រាមដៃមកដាក់លើគ្រាប់ចុចដើម (F, J, D, K) វិញជានិច្ច។',
    },
    {
      id: 'f1-s4',
      kind: 'pattern',
      practiceMode: 'physical-key',
      untimed: false,
      titleKh: 'សម្របសម្រួលដៃឆ្វេង និងដៃស្តាំ',
      titleEn: 'Left/Right Coordination',
      mission: 'ចុចឆ្លាស់គ្នារវាងដៃឆ្វេង និងដៃស្តាំលើជួរកណ្តាល ដោយផ្តោតលើភាពត្រឹមត្រូវ។',
      skill: 'Alternating left-hand and right-hand finger coordination.',
      mechanic: 'Mode A bilateral home-row alternation patterns.',
      targetCount: 16,
      accuracyGoal: 90,
      physicalKeyCodes: [
        'KeyF',
        'KeyJ',
        'KeyD',
        'KeyK',
        'KeyS',
        'KeyL',
        'KeyA',
        'Semicolon',
        'KeyA',
        'Semicolon',
        'KeyS',
        'KeyL',
        'KeyD',
        'KeyK',
        'KeyF',
        'KeyJ',
      ],
      items: [
        'KeyF KeyJ',
        'KeyD KeyK',
        'KeyS KeyL',
        'KeyA Semicolon',
        'KeyA Semicolon',
        'KeyS KeyL',
        'KeyD KeyK',
        'KeyF KeyJ',
      ],
      hint: 'រក្សាចង្វាក់ឆ្លាស់ដៃឆ្វេង-ស្តាំឲ្យស្មើគ្នា៖ ភាពត្រឹមត្រូវសំខាន់ជាងល្បឿន!',
    },
    {
      id: 'f1-s5',
      kind: 'word',
      practiceMode: 'unicode-output',
      untimed: false,
      titleKh: 'បេសកកម្មទ្វារប្រាសាទជួរកណ្តាល',
      titleEn: 'Mini Adventure Challenge',
      mission: 'ភ្ជាប់គ្រាប់ចុចជួរកណ្តាលទៅនឹងអក្សរខ្មែរ (ថ ក ដ ល ស ង ហ) ដើម្បីបើកទ្វារប្រាសាទបុរាណ!',
      skill: 'Connect home-row and index-reach physical keys to Khmer Unicode consonants.',
      mechanic: 'Mode B Khmer Unicode home-row temple gate challenge.',
      targetCount: 16,
      accuracyGoal: 90,
      items: ['ថក', 'ដល', 'សក', 'ងហ', 'កដ', 'សល', 'ថង', 'ហក'],
      hint: 'ប្រើគ្រាប់ចុចជួរកណ្តាលដែលទើបរៀន៖ F(ថ), K(ក), D(ដ), L(ល), S(ស), G(ង), H(ហ) ដើម្បីដោះសោទ្វារប្រាសាទ!',
    },
  ],
};

export const foundationCurriculumWorld: CurriculumWorld = {
  id: 1,
  title: 'Touch-Typing Foundation Sanctuary',
  titleKh: 'មូលដ្ឋានដាក់ដៃ និងក្តារចុចខ្មែរ',
  subtitle: 'Home-row hand placement, finger reach, and Khmer key foundations',
  theme: 'Ancient Khmer Courtyard Foundation',
  mainLessonKh: 'ទីតាំងដៃលើជួរកណ្តាល និងម្រាមដៃត្រឹមត្រូវ',
  mainLessonEn: 'Home-Row Hand Placement & Finger Technique',
  skillFocus: 'Home-row keys (A S D F / J K L ;), finger reach & return, and bilateral coordination.',
  unicodeFocus: 'Distinguish physical key location from Khmer combining marks before typing consonants.',
  levels: [foundationHomeRowLesson],
};

export type KeyPracticeStatEntry = {
  code: string;
  latin: string;
  khmer: string;
  expectedHand: KhmerKey['hand'];
  expectedFinger: KhmerKey['finger'];
  fingerLabelKh: string;
  attempts: number;
  correctCount: number;
  incorrectCount: number;
  physicalCorrectCount: number;
  virtualAssistedCount: number;
  accuracy: number;
};

export type FoundationPracticeSummary = {
  totalAttempts: number;
  totalCorrect: number;
  totalIncorrect: number;
  physicalCorrectCount: number;
  virtualAssistedCount: number;
  overallAccuracy: number;
  physicalMasteryRate: number;
  keysPracticed: KeyPracticeStatEntry[];
  strongKeys: KeyPracticeStatEntry[];
  weakKeys: KeyPracticeStatEntry[];
  feedbackKh: string;
  nextLessonGuidanceKh: string;
  nextLessonGuidanceEn: string;
};

export type KeyPracticeTracker = {
  recordKeyAttempt: (
    expectedCode: string,
    actualCode: string,
    isCorrect: boolean,
    inputSource?: 'physical' | 'virtual',
  ) => void;
  getSummary: () => FoundationPracticeSummary;
  reset: () => void;
};

export function createKeyPracticeTracker(): KeyPracticeTracker {
  const statsByCode = new Map<string, KeyPracticeStatEntry>();

  function ensureEntry(code: string): KeyPracticeStatEntry {
    const existing = statsByCode.get(code);
    if (existing) return existing;

    const key = findKhmerKeyByCode(code);
    const guidance = key ? getFingerGuidance(key, false) : null;
    const entry: KeyPracticeStatEntry = {
      code,
      latin: key ? formatPhysicalKeyLabel(key) : code.replace('Key', ''),
      khmer: key?.khmer ?? '',
      expectedHand: key?.hand ?? 'left',
      expectedFinger: key?.finger ?? 'index',
      fingerLabelKh: guidance?.labelKh ?? 'ប្រើម្រាមដៃត្រឹមត្រូវ',
      attempts: 0,
      correctCount: 0,
      incorrectCount: 0,
      physicalCorrectCount: 0,
      virtualAssistedCount: 0,
      accuracy: 100,
    };
    statsByCode.set(code, entry);
    return entry;
  }

  return {
    recordKeyAttempt(expectedCode, _actualCode, isCorrect, inputSource = 'physical') {
      const entry = ensureEntry(expectedCode);
      entry.attempts += 1;
      if (isCorrect) {
        entry.correctCount += 1;
        if (inputSource === 'virtual') {
          entry.virtualAssistedCount += 1;
        } else {
          entry.physicalCorrectCount += 1;
        }
      } else {
        entry.incorrectCount += 1;
      }
      entry.accuracy =
        entry.attempts > 0 ? Math.round((entry.correctCount / entry.attempts) * 100) : 100;
    },
    getSummary() {
      const keysPracticed = Array.from(statsByCode.values()).filter((e) => e.attempts > 0);
      const totalAttempts = keysPracticed.reduce((s, e) => s + e.attempts, 0);
      const totalCorrect = keysPracticed.reduce((s, e) => s + e.correctCount, 0);
      const totalIncorrect = keysPracticed.reduce((s, e) => s + e.incorrectCount, 0);
      const physicalCorrectCount = keysPracticed.reduce((s, e) => s + e.physicalCorrectCount, 0);
      const virtualAssistedCount = keysPracticed.reduce((s, e) => s + e.virtualAssistedCount, 0);
      const overallAccuracy =
        totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;
      const physicalMasteryRate =
        totalCorrect > 0 ? Math.round((physicalCorrectCount / totalCorrect) * 100) : 100;

      const strongKeys = keysPracticed.filter(
        (e) => e.accuracy >= 90 && e.incorrectCount === 0 && e.physicalCorrectCount > 0,
      );
      const weakKeys = keysPracticed
        .filter((e) => e.incorrectCount > 0 || e.accuracy < 90)
        .sort((a, b) => b.incorrectCount - a.incorrectCount || a.accuracy - b.accuracy);

      const feedbackKh =
        weakKeys.length === 0
          ? 'ល្អណាស់! អ្នកបានចុចគ្រាប់ចុចជួរកណ្តាលបានយ៉ាងត្រឹមត្រូវ!'
          : `ល្អណាស់! សូមហាត់បន្ថែមលើគ្រាប់ចុច ${weakKeys
              .slice(0, 3)
              .map((k) => k.latin)
              .join(', ')} ហើយត្រឡប់ម្រាមដៃទៅទីតាំងដើមជានិច្ច។`;

      return {
        totalAttempts,
        totalCorrect,
        totalIncorrect,
        physicalCorrectCount,
        virtualAssistedCount,
        overallAccuracy,
        physicalMasteryRate,
        keysPracticed,
        strongKeys,
        weakKeys,
        feedbackKh,
        nextLessonGuidanceKh:
          'ជំហានបន្ទាប់៖ បន្តទៅ មេរៀនទី ១ (ព្យញ្ជនៈដំបូង — World 1, Lesson 1) ដោយរក្សាម្រាមដៃលើជួរកណ្តាល A S D F និង J K L ;!',
        nextLessonGuidanceEn:
          'Next Step: Proceed to World 1, Lesson 1 (First Consonants) while keeping your fingers anchored on A S D F and J K L ;.',
      };
    },
    reset() {
      statsByCode.clear();
    },
  };
}
