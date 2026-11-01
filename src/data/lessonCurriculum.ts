// Authoritative Khmer Touch-Typing Curriculum V2
// Structured around progressive touch-typing keyboard skills, NiDA layout pedagogy, and Khmer Unicode rules.
// Version: khmer-touch-typing-v2

import type { AdventureNodeId } from './adventureWorlds';

export const CURRICULUM_VERSION_V2 = 'khmer-touch-typing-v2';
export const CURRICULUM_VERSION_V1 = 'khmer-first-5.5-v1';

export type LessonStageKind = 'warmup' | 'pattern' | 'word' | 'phrase' | 'sentence' | 'boss';

export type StagePracticeMode = 'physical-key' | 'unicode-output' | 'hand-position';

export type CurriculumStage = {
  id: string;
  kind: LessonStageKind;
  titleKh: string;
  titleEn: string;
  mission: string;
  skill: string;
  mechanic: string;
  targetCount: number;
  accuracyGoal: number;
  speedTargetCpm?: number;
  items: string[];
  hint?: string;
  practiceMode?: StagePracticeMode;
  physicalKeyCodes?: string[];
  untimed?: boolean;
  postureInstructionsKh?: string[];
  introducedKeyCodes?: string[];
  recommendedHand?: 'left' | 'right' | 'both';
  recommendedFingers?: ('pinky' | 'ring' | 'middle' | 'index' | 'thumb')[];
  homeKeyAnchors?: string[];
  unicodeOutputExplained?: string;
};

export type CurriculumLevel = {
  id: AdventureNodeId;
  labelKh: string;
  labelEn: string;
  category: string;
  skillCategory?: string;
  objective: string;
  focusKeys: string[];
  introducedKeyCodes?: string[];
  previouslyLearnedKeyCodes?: string[];
  recommendedHands?: ('left' | 'right' | 'both')[];
  recommendedFingers?: ('pinky' | 'ring' | 'middle' | 'index' | 'thumb')[];
  homeKeyAnchors?: string[];
  unicodeRule: string;
  unicodeOutputExplained?: string;
  successCriteria: string;
  minimumAccuracy?: number;
  speedTargetCpm?: number;
  prerequisites?: string[];
  masteryEvidence?: string;
  curriculumVersion?: string;
  stages: CurriculumStage[];
};

export type CurriculumWorld = {
  id: number;
  title: string;
  titleKh: string;
  subtitle: string;
  theme: string;
  mainLessonKh: string;
  mainLessonEn: string;
  skillFocus: string;
  unicodeFocus: string;
  levels: CurriculumLevel[];
};

export const khmerTypingPrinciples = [
  'Touch-typing sequence: key location -> hand -> recommended finger -> reach & return -> Unicode output -> modifiers -> syllables -> words -> sentences.',
  'Khmer Unicode must be typed in canonical sequence: base consonant, subscript/coeng (KeyJ + consonant), consonant shifter, dependent vowel, diacritic.',
  'Dependent vowels are typed AFTER the base consonant, regardless of whether the visual glyph appears before, above, below, or around the consonant.',
  'Opposite-hand Shift technique: use Right Shift for left-hand keys, and Left Shift for right-hand keys.',
  'Accuracy is more important than speed for beginners; CPM is the authoritative speed metric for Khmer typing.',
];

export const lessonCurriculum: CurriculumWorld[] = [
  {
    "id": 1,
    "title": "Temple Jungle",
    "titleKh": "ព្រៃប្រាសាទ",
    "subtitle": "ទីតាំងគ្រាប់ចុច ឥរិយាបថដៃ និងការឈោងម្រាម",
    "theme": "Beginner Island",
    "mainLessonKh": "ចេះទីតាំងគ្រាប់ចុច ម្រាមដៃត្រឹមត្រូវ និងទម្លាប់វិលទៅទីតាំងដើម",
    "mainLessonEn": "Physical key locations, hand posture, and touch-typing reach-and-return",
    "skillFocus": "Accuracy and finger placement first, one controlled keystroke at a time.",
    "unicodeFocus": "Home row, vertical reaches, and base Khmer consonant/vowel outputs.",
    "levels": [
      {
        "id": 1,
        "labelKh": "ជួរកណ្តាលដៃឆ្វេង",
        "labelEn": "Left-Hand Home Row",
        "category": "Home-Row Foundations",
        "skillCategory": "home-row",
        "objective": "រៀនទីតាំងគ្រាប់ចុច F D S A នៅជួរកណ្តាលដៃឆ្វេង (ថ ដ ស ា) ដោយដាក់ម្រាមដៃឲ្យត្រូវ និងយល់ពីអក្សរខ្មែរដែលចេញ។",
        "focusKeys": [
          "F",
          "D",
          "S",
          "A",
          "ថ",
          "ដ",
          "ស",
          "ា"
        ],
        "introducedKeyCodes": [
          "KeyF",
          "KeyD",
          "KeyS",
          "KeyA"
        ],
        "recommendedHands": [
          "left"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF"
        ],
        "unicodeRule": "F បង្កើត ថ, D បង្កើត ដ, S បង្កើត ស, A បង្កើត ស្រៈ ា។ ស្រៈ ា ត្រូវវាយបន្ទាប់ពីព្យញ្ជនៈជានិច្ច។",
        "unicodeOutputExplained": "F -> ថ (ម្រាមចង្អុល), D -> ដ (ម្រាមកណ្តាល), S -> ស (ម្រាមនាង), A -> ា (ម្រាមកូន)",
        "successCriteria": "វាយគ្រាប់ចុចជួរកណ្តាលដៃឆ្វេងដោយភាពត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 28,
        "stages": [
          {
            "id": "w1-l1-s1",
            "kind": "warmup",
            "titleKh": "ទ្វារអក្សរ",
            "titleEn": "Glyph Gate",
            "mission": "ហាត់ចុចគ្រាប់ចុច F (ថ) ដោយម្រាមចង្អុលឆ្វេង និង D (ដ) ដោយម្រាមកណ្តាលឆ្វេង។",
            "skill": "Left index and middle finger home-row placement and control.",
            "mechanic": "Physical-key discovery and touch tactile anchor awareness on F.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "physical-key",
            "physicalKeyCodes": [
              "KeyF",
              "KeyD"
            ],
            "items": [
              "KeyF KeyD",
              "KeyD KeyF",
              "KeyF KeyF",
              "KeyD KeyD",
              "KeyF KeyD KeyF KeyD",
              "KeyD KeyF KeyD KeyF",
              "KeyF KeyD KeyD",
              "KeyD KeyF KeyF",
              "KeyF KeyF KeyD KeyD",
              "KeyD KeyD KeyF KeyF"
            ],
            "hint": "ដាក់ម្រាមចង្អុលឆ្វេងលើ F (មានស្នាមពក) និងម្រាមកណ្តាលឆ្វេងលើ D។"
          },
          {
            "id": "w1-l1-s2",
            "kind": "pattern",
            "titleKh": "ថ្មភ្លោះ",
            "titleEn": "Twin Stones",
            "mission": "ហាត់ចុចគ្រាប់ចុច S (ស) ដោយម្រាមនាងឆ្វេង និង A (ា) ដោយម្រាមកូនដៃឆ្វេង។",
            "skill": "Left ring and pinky finger home-row control.",
            "mechanic": "Physical-key coordination on left outer home row.",
            "targetCount": 8,
            "accuracyGoal": 90,
            "practiceMode": "physical-key",
            "physicalKeyCodes": [
              "KeyS",
              "KeyA"
            ],
            "items": [
              "KeyS KeyA",
              "KeyA KeyS",
              "KeyS KeyS",
              "KeyA KeyA",
              "KeyS KeyA KeyS KeyA",
              "KeyA KeyS KeyA KeyS",
              "KeyS KeyS KeyA",
              "KeyA KeyA KeyS"
            ],
            "hint": "ប្រើម្រាមនាងលើ S និងកូនដៃឆ្វេងលើ A ដោយមិនលើកកដៃឡើង។"
          },
          {
            "id": "w1-l1-s3",
            "kind": "word",
            "titleKh": "ផ្លូវព្រៃ",
            "titleEn": "Jungle Path",
            "mission": "ហាត់ចង្វាក់ម្រាមដៃទាំង ៤ នៃដៃឆ្វេង (A S D F) និងវាយព្យាង្គងាយៗ។",
            "skill": "Coordinated left home-row touch typing with valid Khmer vowel composition.",
            "mechanic": "Full left home-row progression and simple syllable assembly.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សា",
              "ដា",
              "ថា",
              "សាសា",
              "ដាដា",
              "ដាស",
              "ថាស",
              "សដា"
            ],
            "hint": "វាយព្យញ្ជនៈមុន រួចចុច ា ដោយកូនដៃឆ្វេង (KeyA)។"
          }
        ]
      },
      {
        "id": 2,
        "labelKh": "ជួរកណ្តាលដៃស្តាំ",
        "labelEn": "Right-Hand Home Row",
        "category": "Home-Row Foundations",
        "skillCategory": "home-row",
        "objective": "រៀនទីតាំងគ្រាប់ចុច J K L ; នៅជួរកណ្តាលដៃស្តាំ (្ ក ល ើ) ដោយស្គាល់ភាពខុសគ្នារវាងព្យញ្ជនៈ ជើងអក្សរ និងស្រៈ។",
        "focusKeys": [
          "J",
          "K",
          "L",
          ";",
          "្",
          "ក",
          "ល",
          "ើ"
        ],
        "introducedKeyCodes": [
          "KeyJ",
          "KeyK",
          "KeyL",
          "Semicolon"
        ],
        "recommendedHands": [
          "right"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyJ"
        ],
        "unicodeRule": "J បង្កើតសញ្ញាជើង (្), K បង្កើត ក, L បង្កើត ល, ; បង្កើតស្រៈ ើ។ ជើងអក្សរ និងស្រៈ មិនអាចវាយតែឯងទេ។",
        "unicodeOutputExplained": "J -> ្ (ម្រាមចង្អុលស្តាំ), K -> ក (ម្រាមកណ្តាល), L -> ល (ម្រាមនាង), ; -> ើ (ម្រាមកូន)",
        "successCriteria": "វាយគ្រាប់ចុចជួរកណ្តាលដៃស្តាំដោយភាពត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 30,
        "stages": [
          {
            "id": "w1-l2-s1",
            "kind": "warmup",
            "titleKh": "ស្ពានដំបូង",
            "titleEn": "First Bridge",
            "mission": "ហាត់ចុចគ្រាប់ចុច J (្) ដោយម្រាមចង្អុលស្តាំ និង K (ក) ដោយម្រាមកណ្តាលស្តាំ។",
            "skill": "Right index and middle finger home-row placement.",
            "mechanic": "Tactile bump recognition on J and clean finger strike on K.",
            "targetCount": 15,
            "accuracyGoal": 90,
            "practiceMode": "physical-key",
            "physicalKeyCodes": [
              "KeyJ",
              "KeyK"
            ],
            "items": [
              "KeyJ KeyK",
              "KeyK KeyJ",
              "KeyJ KeyJ",
              "KeyK KeyK",
              "KeyJ KeyK KeyJ",
              "KeyK KeyJ KeyK",
              "KeyJ KeyK KeyK",
              "KeyK KeyJ KeyJ",
              "KeyJ KeyJ KeyK KeyK",
              "KeyK KeyK KeyJ KeyJ",
              "KeyJ KeyK KeyJ KeyK",
              "KeyK KeyJ KeyK KeyJ",
              "KeyJ KeyK KeyK KeyJ",
              "KeyK KeyJ KeyJ KeyK",
              "KeyJ KeyK KeyJ"
            ],
            "hint": "ដាក់ម្រាមចង្អុលស្តាំលើ J (មានស្នាមពក) និងម្រាមកណ្តាលស្តាំលើ K។"
          },
          {
            "id": "w1-l2-s2",
            "kind": "pattern",
            "titleKh": "គូប្រយ័ត្ន",
            "titleEn": "Careful Pairs",
            "mission": "ហាត់ចុច L (ល) ដោយម្រាមនាងស្តាំ និង ; (ើ) ដោយម្រាមកូនដៃស្តាំ។",
            "skill": "Right ring and pinky home-row control.",
            "mechanic": "Physical control and rhythmic pairing on right outer home row.",
            "targetCount": 16,
            "accuracyGoal": 92,
            "practiceMode": "physical-key",
            "physicalKeyCodes": [
              "KeyL",
              "Semicolon"
            ],
            "items": [
              "KeyL Semicolon",
              "Semicolon KeyL",
              "KeyL KeyL",
              "Semicolon Semicolon",
              "KeyL Semicolon KeyL",
              "Semicolon KeyL Semicolon",
              "KeyL KeyL Semicolon",
              "Semicolon Semicolon KeyL",
              "KeyL Semicolon KeyL Semicolon",
              "Semicolon KeyL Semicolon KeyL",
              "KeyL KeyL Semicolon Semicolon",
              "Semicolon Semicolon KeyL KeyL",
              "KeyL Semicolon Semicolon KeyL",
              "Semicolon KeyL KeyL Semicolon",
              "KeyL Semicolon KeyL",
              "Semicolon KeyL Semicolon"
            ],
            "hint": "ម្រាមនាងស្តាំលើ L និងម្រាមកូនដៃស្តាំលើ Semicolon (;)។"
          },
          {
            "id": "w1-l2-s3",
            "kind": "word",
            "titleKh": "ជណ្តើរភ្នំ",
            "titleEn": "Hill Steps",
            "mission": "ហាត់វាយព្យញ្ជនៈ និងស្រៈជួរកណ្តាលដៃស្តាំ បង្កើតជាពាក្យខ្លីៗ។",
            "skill": "Right-hand home-row composition and valid Khmer syllables.",
            "mechanic": "Typing valid Khmer syllables formed by right-hand home keys.",
            "targetCount": 19,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កក",
              "លក",
              "កល",
              "កើ",
              "លើ",
              "កកក",
              "កើល",
              "លើក",
              "កលើ",
              "លកើ",
              "កលក",
              "លកល",
              "លើកក",
              "កកើ",
              "លើលើ",
              "កកល",
              "លលើ",
              "កលើក",
              "លើកល"
            ],
            "hint": "វាយ ក (KeyK) រួចចុច ើ (Semicolon)។ ស្រៈត្រូវវាយបន្ទាប់ពីព្យញ្ជនៈជានិច្ច។"
          }
        ]
      },
      {
        "id": 3,
        "labelKh": "ការសម្របសម្រួលដៃទាំងពីរ",
        "labelEn": "Two-Hand Coordination",
        "category": "Home-Row Foundations",
        "skillCategory": "two-hand-coordination",
        "objective": "ហាត់ចុចឆ្លាស់គ្នារវាងដៃឆ្វេង និងដៃស្តាំលើជួរកណ្តាល ដើម្បីកសាងចង្វាក់វាយអក្សរត្រឹមត្រូវ និងទម្លាប់វិលទៅទីតាំងដើម។",
        "focusKeys": [
          "F",
          "J",
          "D",
          "K",
          "S",
          "L",
          "A",
          ";",
          "កា",
          "សា",
          "ដា",
          "កើ",
          "សាលា"
        ],
        "introducedKeyCodes": [
          "KeyF",
          "KeyJ",
          "KeyD",
          "KeyK",
          "KeyS",
          "KeyL",
          "KeyA",
          "Semicolon"
        ],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "ផ្សំគ្រាប់ចុចដៃឆ្វេង (A S D F) និងដៃស្តាំ (J K L ;) បង្កើតពាក្យខ្មែរត្រឹមត្រូវ។",
        "unicodeOutputExplained": "ឆ្លាស់ដៃ: ឆ្វេង (ថ ដ ស ា) + ស្តាំ (្ ក ល ើ)",
        "successCriteria": "វាយលំហាត់ឆ្លាស់ដៃទាំងពីរដោយភាពត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 25,
        "stages": [
          {
            "id": "w1-l3-s1",
            "kind": "warmup",
            "titleKh": "ឆ្លាស់ដៃជួរកណ្តាល (Home-Row Hand Alternation)",
            "titleEn": "Home Alternation — F-J & D-K Pairs",
            "mission": "ហាត់ចុចឆ្លាស់គ្នារវាងម្រាមដៃឆ្វេង និងស្តាំ៖ F J, D K, S L, A ;។",
            "skill": "Bilateral hand balance and rhythm on home row.",
            "mechanic": "Strict alternating left-right physical keystrokes.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "physical-key",
            "items": [
              "KeyF KeyJ",
              "KeyD KeyK",
              "KeyS KeyL",
              "KeyA Semicolon",
              "KeyJ KeyF",
              "KeyK KeyD",
              "KeyL KeyS",
              "Semicolon KeyA",
              "KeyF KeyJ KeyD KeyK",
              "KeyS KeyL KeyA Semicolon"
            ],
            "hint": "រក្សាម្រាមដៃទាំង ៨ លើទីតាំងជួរកណ្តាលជានិច្ច ពេលចុចឆ្លាស់ដៃ។"
          },
          {
            "id": "w1-l3-s2",
            "kind": "pattern",
            "titleKh": "គូគ្រាប់ចុចជួរកណ្តាល (Home Key Pairs)",
            "titleEn": "Home Pairs — Consonant + Vowel Flow",
            "mission": "ហាត់វាយព្យញ្ជនៈដៃស្តាំ និងស្រៈដៃឆ្វេង (កា) និងច្រាសមកវិញ (សា, ដា)។",
            "skill": "Cross-hand consonant and vowel syllable coordination.",
            "mechanic": "Two-hand syllable construction using learned home keys.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កា",
              "សា",
              "ដា",
              "កើ",
              "ថើ",
              "លា",
              "សើ",
              "កាស",
              "ដាក",
              "សាក"
            ],
            "hint": "ក (ស្តាំ) + ា (ឆ្វេង) = កា។ ស (ឆ្វេង) + ា (ឆ្វេង) = សា។"
          },
          {
            "id": "w1-l3-s3",
            "kind": "word",
            "titleKh": "ពាក្យដំបូងជួរកណ្តាល (First Home-Row Words)",
            "titleEn": "First Words — Complete Home Vocabulary",
            "mission": "វាយពាក្យខ្មែរពិតប្រាកដដែលកើតចេញពីគ្រាប់ចុចជួរកណ្តាលទាំងអស់។",
            "skill": "Forming meaningful Khmer words purely with home-row keys.",
            "mechanic": "Full home-row vocabulary typing with high accuracy.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សាលា",
              "កាក",
              "ដាក",
              "សាកល",
              "ថាស",
              "លើក",
              "សើច",
              "ដក"
            ],
            "hint": "សាលា វាយ ស + ា + ល + ា ដោយចង្វាក់រលូន មិនបាច់ប្រញាប់។"
          }
        ]
      },
      {
        "id": 4,
        "labelKh": "ការឈោងម្រាមចង្អុល G និង H",
        "labelEn": "Index Reaches: G and H",
        "category": "Horizontal Reach",
        "skillCategory": "reach-return",
        "objective": "រៀនឈោងម្រាមចង្អុលឆ្វេងពី F ទៅ G (ង) និងម្រាមចង្អុលស្តាំពី J ទៅ H (ហ) រួចត្រឡប់មកទីតាំងដើមវិញភ្លាម។",
        "focusKeys": [
          "G",
          "H",
          "ង",
          "ហ",
          "កង",
          "សង",
          "ដង",
          "ហាង"
        ],
        "introducedKeyCodes": [
          "KeyG",
          "KeyH"
        ],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "index"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "G បង្កើត ង (ម្រាមចង្អុលឆ្វេងឈោងពី F)។ H បង្កើត ហ (ម្រាមចង្អុលស្តាំឈោងពី J)។",
        "unicodeOutputExplained": "F -> G (ង), J -> H (ហ) រួចត្រឡប់មក F និង J វិញ។",
        "successCriteria": "វាយការឈោង G និង H ដោយត្រឡប់មកទីតាំងដើមត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 26,
        "stages": [
          {
            "id": "w1-l4-s1",
            "kind": "warmup",
            "titleKh": "ការឈោងម្រាមចង្អុល (Index Reaches F→G, J→H)",
            "titleEn": "Index Reaches — F to G and J to H",
            "mission": "ហាត់ឈោងម្រាមចង្អុលឆ្វេង F→G→F និងស្តាំ J→H→J ដោយរក្សាម្រាមផ្សេងលើទីតាំងដើម។",
            "skill": "Horizontal index finger reaching and immediate return to tactile anchor.",
            "mechanic": "Reach-and-return drills with F and J anchor verification.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "physical-key",
            "items": [
              "KeyF KeyG KeyF",
              "KeyJ KeyH KeyJ",
              "KeyG KeyF KeyG",
              "KeyH KeyJ KeyH",
              "KeyF KeyG KeyJ KeyH",
              "KeyG KeyH",
              "KeyH KeyG",
              "KeyF KeyG KeyF KeyG",
              "KeyJ KeyH KeyJ KeyH",
              "KeyF KeyG KeyJ KeyH KeyF KeyJ"
            ],
            "hint": "ពេលចុច G រួច ត្រូវទាញម្រាមចង្អុលឆ្វេងមកលើ F វិញភ្លាម។"
          },
          {
            "id": "w1-l4-s2",
            "kind": "pattern",
            "titleKh": "ព្យាង្គផ្សំម្រាមចង្អុល (Index Syllable Patterns)",
            "titleEn": "Index Syllables — Words with ង and ហ",
            "mission": "ហាត់វាយព្យញ្ជនៈ ង និង ហ ផ្សំជាមួយស្រៈ និងព្យញ្ជនៈជួរកណ្តាល។",
            "skill": "Combining reached index consonants with home-row vowels and consonants.",
            "mechanic": "Accurate composition of syllables ending in ង or beginning with ហ.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កង",
              "សង",
              "ដង",
              "ហាង",
              "ហើ",
              "លង",
              "ថង",
              "ហាល",
              "កាហា",
              "សាហា"
            ],
            "hint": "កង: ចុច ក (K) រួចឈោងម្រាមចង្អុលឆ្វេងទៅ ង (G) ហើយត្រឡប់មក F វិញ។"
          },
          {
            "id": "w1-l4-s3",
            "kind": "word",
            "titleKh": "ចង្វាក់ម្រាមចង្អុលទាំងពីរ (Bilateral Index Rhythm)",
            "titleEn": "Index Word Mastery — Complete Index Flow",
            "mission": "វាយពាក្យខ្មែរដែលមាន ង និង ហ យ៉ាងស្ទាត់ជំនាញ។",
            "skill": "Fluid bilateral typing of words utilizing G, H, and home-row keys.",
            "mechanic": "Full word challenges emphasizing index coordination.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ហាង",
              "សាហាវ",
              "កងកម្លាំង",
              "ដង្ហើម",
              "សង្ហារ",
              "ហាត់",
              "សហការ",
              "ដង្កូវ"
            ],
            "hint": "ហាង: ចុច ហ (H) + ា (A) + ង (G)។ ចងចាំទាញម្រាមដៃមកទីតាំងដើម។"
          }
        ]
      },
      {
        "id": 5,
        "labelKh": "ជួរលើដៃឆ្វេង Q W E R T",
        "labelEn": "Left-Hand Upper Row",
        "category": "Upper-Row Reaches",
        "skillCategory": "upper-row",
        "objective": "រៀនឈោងម្រាមដៃឆ្វេងឡើងទៅជួរលើ៖ Q (ឆ), W (ឹ), E (េ), R (រ), T (ត) និងត្រឡប់មកទីតាំងដើម។",
        "focusKeys": [
          "Q",
          "W",
          "E",
          "R",
          "T",
          "ឆ",
          "ឹ",
          "េ",
          "រ",
          "ត"
        ],
        "introducedKeyCodes": [
          "KeyQ",
          "KeyW",
          "KeyE",
          "KeyR",
          "KeyT"
        ],
        "recommendedHands": [
          "left"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index"
        ],
        "homeKeyAnchors": [
          "KeyF"
        ],
        "unicodeRule": "Q បង្កើត ឆ, W បង្កើត ស្រៈ ឹ, E បង្កើត ស្រៈ េ, R បង្កើត រ, T បង្កើត ត។ ស្រៈ េ ត្រូវវាយបន្ទាប់ពីព្យញ្ជនៈជានិច្ច។",
        "unicodeOutputExplained": "A->Q (ឆ), S->W (ឹ), D->E (េ), F->R (រ), F->T (ត)",
        "successCriteria": "វាយគ្រាប់ចុចជួរលើដៃឆ្វេងដោយភាពត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 28,
        "stages": [
          {
            "id": "w1-l5-s1",
            "kind": "warmup",
            "titleKh": "ឈោងជួរលើដៃឆ្វេង (Left Upper-Row Reaches)",
            "titleEn": "Left Upper Reaches — F→R, F→T, D→E, S→W, A→Q",
            "mission": "ហាត់ឈោងម្រាមដៃឆ្វេងឡើងទៅជួរលើម្តងមួយៗ រួចត្រឡប់មកជួរកណ្តាលវិញ។",
            "skill": "Upward vertical reach and return for left hand fingers.",
            "mechanic": "Controlled reach-and-return drills with home-row anchor stability.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "physical-key",
            "items": [
              "KeyF KeyR KeyF",
              "KeyF KeyT KeyF",
              "KeyD KeyE KeyD",
              "KeyS KeyW KeyS",
              "KeyA KeyQ KeyA",
              "KeyR KeyT",
              "KeyE KeyW",
              "KeyQ KeyR",
              "KeyT KeyE KeyW KeyQ",
              "KeyF KeyR KeyD KeyE KeyS KeyW KeyA KeyQ"
            ],
            "hint": "F ឈោងទៅ R និង T (ម្រាមចង្អុល)។ D ឈោងទៅ E (ម្រាមកណ្តាល)។"
          },
          {
            "id": "w1-l5-s2",
            "kind": "pattern",
            "titleKh": "ព្យាង្គ និងស្រៈជួរលើ (Upper-Left Syllables)",
            "titleEn": "Upper Syllables — Syllables with ឆ, ឹ, េ, រ, ត",
            "mission": "ហាត់វាយព្យាង្គដែលប្រើអក្សរជួរលើដៃឆ្វេង រួមទាំងស្រៈ េ និង ឹ។",
            "skill": "Proper Unicode sequence with visual-left vowel េ and superscript vowel ឹ.",
            "mechanic": "Typing syllables where base consonant is typed before េ or ឹ.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "រា",
              "តា",
              "ឆា",
              "កេរ",
              "ដេរ",
              "តឹក",
              "ទឹក",
              "ឆឹក",
              "រែក",
              "តេ"
            ],
            "hint": "កេរ: វាយ ក (K) មុន រួចចុច េ (E) រួចចុច រ (R)។ ព្យញ្ជនៈមកមុនស្រៈជានិច្ច។"
          },
          {
            "id": "w1-l5-s3",
            "kind": "word",
            "titleKh": "ពាក្យជួរលើដៃឆ្វេង (Left Upper Words)",
            "titleEn": "Left Upper Words — Vocabulary Practice",
            "mission": "វាយពាក្យខ្មែរដែលមានអក្សរជួរលើដៃឆ្វេង។",
            "skill": "Fluent application of left upper keys in common Khmer words.",
            "mechanic": "Full word challenges with mixed left upper and home keys.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សេរី",
              "តស៊ូ",
              "រទេះ",
              "ឆាប់",
              "រត់",
              "ដេរស្អាត",
              "ទឹកតែ",
              "រៀនសូត្រ"
            ],
            "hint": "សេរី: ស + េ + រ + ី។ ចងចាំថាស្រៈ េ វាយក្រោយព្យញ្ជនៈ ស។"
          }
        ]
      },
      {
        "id": 6,
        "labelKh": "ជួរលើដៃស្តាំ Y U I O P",
        "labelEn": "Right-Hand Upper Row",
        "category": "Upper-Row Reaches",
        "skillCategory": "upper-row",
        "objective": "រៀនឈោងម្រាមដៃស្តាំឡើងទៅជួរលើ៖ Y (យ), U (ុ), I (ិ), O (ោ), P (ផ), [ (ៀ) និងត្រឡប់មកទីតាំងដើម។",
        "focusKeys": [
          "Y",
          "U",
          "I",
          "O",
          "P",
          "[",
          "យ",
          "ុ",
          "ិ",
          "ោ",
          "ផ",
          "ៀ"
        ],
        "introducedKeyCodes": [
          "KeyY",
          "KeyU",
          "KeyI",
          "KeyO",
          "KeyP",
          "BracketLeft"
        ],
        "recommendedHands": [
          "right"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyJ"
        ],
        "unicodeRule": "Y បង្កើត យ, U បង្កើត ស្រៈ ុ, I បង្កើត ស្រៈ ិ, O បង្កើត ស្រៈ ោ, P បង្កើត ផ, [ បង្កើត ស្រៈ ៀ។ ស្រៈទាំងអស់វាយក្រោយព្យញ្ជនៈ។",
        "unicodeOutputExplained": "J->Y (យ), J->U (ុ), K->I (ិ), L->O (ោ), ;->P (ផ), ;->[ (ៀ)",
        "successCriteria": "វាយគ្រាប់ចុចជួរលើដៃស្តាំដោយភាពត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 28,
        "stages": [
          {
            "id": "w1-l6-s1",
            "kind": "warmup",
            "titleKh": "ឈោងជួរលើដៃស្តាំ (Right Upper-Row Reaches)",
            "titleEn": "Right Upper Reaches — J→Y, J→U, K→I, L→O, ;→P, ;→[",
            "mission": "ហាត់ឈោងម្រាមដៃស្តាំឡើងទៅជួរលើម្តងមួយៗ រួចត្រឡប់មកជួរកណ្តាលវិញ។",
            "skill": "Upward vertical reach and return for right hand fingers.",
            "mechanic": "Right-hand upper-row movement and tactile anchor awareness on J.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "physical-key",
            "items": [
              "KeyJ KeyY KeyJ",
              "KeyJ KeyU KeyJ",
              "KeyK KeyI KeyK",
              "KeyL KeyO KeyL",
              "Semicolon KeyP Semicolon",
              "Semicolon BracketLeft Semicolon",
              "KeyY KeyU",
              "KeyI KeyO",
              "KeyP BracketLeft",
              "KeyJ KeyY KeyK KeyI KeyL KeyO Semicolon KeyP"
            ],
            "hint": "J ឈោងទៅ Y និង U (ម្រាមចង្អុល)។ K ឈោងទៅ I (ម្រាមកណ្តាល)។ L ឈោងទៅ O (ម្រាមនាង)។"
          },
          {
            "id": "w1-l6-s2",
            "kind": "pattern",
            "titleKh": "ព្យាង្គស្រៈជួរលើដៃស្តាំ (Upper-Right Syllables)",
            "titleEn": "Upper-Right Syllables — Syllables with យ, ុ, ិ, ោ, ផ, ៀ",
            "mission": "ហាត់វាយព្យាង្គផ្សំស្រៈជួរលើដៃស្តាំ (ុ, ិ, ោ, ៀ)។",
            "skill": "Accurate Khmer syllable typing with right upper-row vowels.",
            "mechanic": "Correct logical sequence: base consonant followed by dependent vowel.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "យូ",
              "កុ",
              "សិ",
              "កោ",
              "ផឹក",
              "រៀន",
              "កុល",
              "សិល",
              "យល់",
              "ផាត់"
            ],
            "hint": "កោ: វាយ ក (K) រួចចុច ោ (O)។ ទោះបី ោ មានផ្នែកនៅខាងមុខ ក៏ត្រូវវាយក្រោយ ក ដែរ។"
          },
          {
            "id": "w1-l6-s3",
            "kind": "word",
            "titleKh": "ពាក្យជួរលើដៃស្តាំ (Right Upper Words)",
            "titleEn": "Right Upper Words — Real Vocabulary Practice",
            "mission": "វាយពាក្យខ្មែរដែលមានអក្សរជួរលើដៃស្តាំ។",
            "skill": "Integrated typing of common Khmer words using upper-row keys.",
            "mechanic": "Full word challenges with right-hand upper reach coordination.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កុមារ",
              "យាយ",
              "រៀន",
              "សិស្ស",
              "ចោរ",
              "ផឹកទឹក",
              "យូរយារ",
              "កោសិកា"
            ],
            "hint": "រៀន: វាយ រ (KeyR) + ៀ (BracketLeft) + ន (KeyN)។ ស្រៈ ៀ វាយនៅចន្លោះ រ និង ន។"
          }
        ]
      },
      {
        "id": 7,
        "labelKh": "ជួរក្រោមដៃឆ្វេង Z X C V B",
        "labelEn": "Left-Hand Lower Row",
        "category": "Lower-Row Reaches",
        "skillCategory": "lower-row",
        "objective": "រៀនឈោងម្រាមដៃឆ្វេងចុះទៅជួរក្រោម៖ Z (ឋ), X (ខ), C (ច), V (វ), B (ប) និងត្រឡប់មកទីតាំងដើម។",
        "focusKeys": [
          "Z",
          "X",
          "C",
          "V",
          "B",
          "ឋ",
          "ខ",
          "ច",
          "វ",
          "ប"
        ],
        "introducedKeyCodes": [
          "KeyZ",
          "KeyX",
          "KeyC",
          "KeyV",
          "KeyB"
        ],
        "recommendedHands": [
          "left"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index"
        ],
        "homeKeyAnchors": [
          "KeyF"
        ],
        "unicodeRule": "Z បង្កើត ឋ, X បង្កើត ខ, C បង្កើត ច, V បង្កើត វ, B បង្កើត ប។ ម្រាមដៃត្រូវឈោងចុះក្រោម រួចត្រឡប់មក A S D F វិញ។",
        "unicodeOutputExplained": "A->Z (ឋ), S->X (ខ), D->C (ច), F->V (វ), F->B (ប)",
        "successCriteria": "វាយគ្រាប់ចុចជួរក្រោមដៃឆ្វេងដោយភាពត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 28,
        "stages": [
          {
            "id": "w1-l7-s1",
            "kind": "warmup",
            "titleKh": "ឈោងជួរក្រោមដៃឆ្វេង (Left Lower-Row Reaches)",
            "titleEn": "Left Lower Reaches — F→V, F→B, D→C, S→X, A→Z",
            "mission": "ហាត់ឈោងម្រាមដៃឆ្វេងចុះទៅជួរក្រោមម្តងមួយៗ រួចត្រឡប់មកជួរកណ្តាលវិញ។",
            "skill": "Downward vertical reach and return for left hand fingers.",
            "mechanic": "Controlled downward strike and instant return to home row.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "physical-key",
            "items": [
              "KeyF KeyV KeyF",
              "KeyF KeyB KeyF",
              "KeyD KeyC KeyD",
              "KeyS KeyX KeyS",
              "KeyA KeyZ KeyA",
              "KeyV KeyB",
              "KeyC KeyX",
              "KeyZ KeyV",
              "KeyB KeyC KeyX KeyZ",
              "KeyF KeyV KeyD KeyC KeyS KeyX KeyA KeyZ"
            ],
            "hint": "F ឈោងចុះទៅ V និង B (ម្រាមចង្អុល)។ D ឈោងចុះទៅ C (ម្រាមកណ្តាល)។ S ឈោងចុះទៅ X (ម្រាមនាង)។"
          },
          {
            "id": "w1-l7-s2",
            "kind": "pattern",
            "titleKh": "ព្យញ្ជនៈជួរក្រោម (Lower-Left Syllables)",
            "titleEn": "Lower Syllables — Syllables with ខ, ច, វ, ប, ឋ",
            "mission": "ហាត់វាយព្យញ្ជនៈជួរក្រោមដៃឆ្វេងផ្សំជាមួយស្រៈ។",
            "skill": "Combining left lower-row consonants with home-row vowels.",
            "mechanic": "Smooth transitions between bottom row and home row.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ខា",
              "ចា",
              "វា",
              "បា",
              "ឋាន",
              "ចិត",
              "ខាត",
              "បី",
              "បង",
              "វាល"
            ],
            "hint": "ខា: ចុច ខ (X) ដោយម្រាមនាងឆ្វេង រួចចុច ា (A) ដោយកូនដៃឆ្វេង។"
          },
          {
            "id": "w1-l7-s3",
            "kind": "word",
            "titleKh": "ពាក្យជួរក្រោមដៃឆ្វេង (Left Lower Words)",
            "titleEn": "Left Lower Words — Practical Vocabulary",
            "mission": "វាយពាក្យខ្មែរដែលមានព្យញ្ជនៈជួរក្រោមដៃឆ្វេង។",
            "skill": "Accurate word typing with lower-left consonants in context.",
            "mechanic": "Full word challenges emphasizing downward finger control.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ចរាចរ",
              "ខិតខំ",
              "វាលស្រែ",
              "បងប្អូន",
              "ចាកចេញ",
              "បីដង",
              "ខុសត្រូវ",
              "ឋិតថេរ"
            ],
            "hint": "ចរាចរ: ច (C) + រ (R) + ា (A) + ច (C) + រ (R)។"
          }
        ]
      },
      {
        "id": 8,
        "labelKh": "ជួរក្រោមដៃស្តាំ N M , . /",
        "labelEn": "Right-Hand Lower Row",
        "category": "Lower-Row Reaches",
        "skillCategory": "lower-row",
        "objective": "រៀនឈោងម្រាមដៃស្តាំចុះទៅជួរក្រោម៖ N (ន), M (ម), Comma (ុំ), Period (។ សញ្ញាខណ្ឌ), Slash (៊) និងត្រឡប់មកទីតាំងដើម។",
        "focusKeys": [
          "N",
          "M",
          ",",
          ".",
          "/",
          "ន",
          "ម",
          "ុំ",
          "។",
          "៊"
        ],
        "introducedKeyCodes": [
          "KeyN",
          "KeyM",
          "Comma",
          "Period",
          "Slash"
        ],
        "recommendedHands": [
          "right"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyJ"
        ],
        "unicodeRule": "N បង្កើត ន, M បង្កើត ម, Comma (,) បង្កើត ស្រៈ ុំ, Period (.) បង្កើតសញ្ញាខណ្ឌ ។, Slash (/) បង្កើត ៊។ សញ្ញាខណ្ឌបញ្ចប់ល្បះ។",
        "unicodeOutputExplained": "J->N (ន), J->M (ម), K->, (ុំ), L->. (។), ;->/ (៊)",
        "successCriteria": "វាយគ្រាប់ចុចជួរក្រោមដៃស្តាំ និងសញ្ញាខណ្ឌដោយភាពត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 30,
        "stages": [
          {
            "id": "w1-l8-s1",
            "kind": "warmup",
            "titleKh": "ឈោងជួរក្រោមដៃស្តាំ (Right Lower-Row Reaches)",
            "titleEn": "Right Lower Reaches — J→N, J→M, K→,, L→., ;→/",
            "mission": "ហាត់ឈោងម្រាមដៃស្តាំចុះទៅជួរក្រោមម្តងមួយៗ រួចត្រឡប់មកជួរកណ្តាលវិញ។",
            "skill": "Downward vertical reach and return for right hand fingers.",
            "mechanic": "Right-hand lower-row reaches with immediate return to home row.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "physical-key",
            "items": [
              "KeyJ KeyN KeyJ",
              "KeyJ KeyM KeyJ",
              "KeyK Comma KeyK",
              "KeyL Period KeyL",
              "Semicolon Slash Semicolon",
              "KeyN KeyM",
              "Comma Period",
              "KeyN KeyM Comma Period",
              "Period Slash",
              "KeyJ KeyN KeyK Comma KeyL Period"
            ],
            "hint": "J ឈោងចុះទៅ N និង M (ម្រាមចង្អុល)។ K ឈោងចុះទៅ Comma (,) (ម្រាមកណ្តាល)។ L ឈោងចុះទៅ Period (.) (ម្រាមនាង)។"
          },
          {
            "id": "w1-l8-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យ និងសញ្ញាខណ្ឌ (Lower-Right Syllables & Khan)",
            "titleEn": "Lower-Right Patterns — Syllables with ន, ម, ុំ and ។",
            "mission": "ហាត់វាយព្យាង្គ និងពាក្យខ្លីៗដែលប្រើ ន, ម, ស្រៈ ុំ និងសញ្ញាខណ្ឌ ។។",
            "skill": "Typing syllables with ន, ម, ុំ and concluding with Khmer Khan punctuation (។).",
            "mechanic": "Applying punctuation Period (.) at the end of Khmer clauses.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "នា",
              "មា",
              "កុំ",
              "សុំ",
              "មាន",
              "នាំ",
              "មុន",
              "នាង",
              "មក។",
              "បាន។"
            ],
            "hint": "កុំ: ក (K) + ុំ (Comma)។ សញ្ញាខណ្ឌ (។) ចុច Period (.) ដោយម្រាមនាងស្តាំ។"
          },
          {
            "id": "w1-l8-s3",
            "kind": "word",
            "titleKh": "ពាក្យពេញជួរក្រោម (Full Lower-Row Review)",
            "titleEn": "Lower Review — Complete Word & Sentence Flow",
            "mission": "វាយពាក្យ និងឃ្លាខ្មែរពេញលេញដោយប្រើគ្រាប់ចុចមូលដ្ឋានទាំងអស់។",
            "skill": "Integration of all base keyboard keys across home, top, and bottom rows.",
            "mechanic": "Multi-word phrases concluding with proper Khmer punctuation.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "មានបាន",
              "នាំមុខ",
              "មនុស្ស",
              "រៀនសូត្រ។",
              "សាលារៀន។",
              "ខិតខំរៀន។",
              "ធ្វើការងារ។",
              "ប្រទេសកម្ពុជា។"
            ],
            "hint": "បញ្ចប់ប្រយោគដោយចុចសញ្ញាខណ្ឌ ។ (Period)។"
          }
        ]
      },
      {
        "id": "boss",
        "labelKh": "ម្ចាស់ប្រាសាទព្រៃ (Temple Guardian)",
        "labelEn": "Temple Guardian — Base Keyboard Mastery",
        "category": "World Boss Mastery",
        "skillCategory": "keyboard-mastery",
        "objective": "ប្រឡងជាប់ពិភពទី ១ ដោយបង្ហាញការចងចាំទីតាំងគ្រាប់ចុចមូលដ្ឋានទាំងអស់ (ជួរកណ្តាល ជួរលើ ជួរក្រោម) ដោយមិនបាច់មើលក្តារចុច។",
        "focusKeys": [
          "គ្រាប់ចុចមូលដ្ឋានទាំងអស់"
        ],
        "introducedKeyCodes": [
          "KeyF",
          "KeyD",
          "KeyS",
          "KeyA",
          "KeyJ",
          "KeyK",
          "KeyL",
          "Semicolon",
          "KeyG",
          "KeyH",
          "KeyQ",
          "KeyW",
          "KeyE",
          "KeyR",
          "KeyT",
          "KeyY",
          "KeyU",
          "KeyI",
          "KeyO",
          "KeyP",
          "KeyZ",
          "KeyX",
          "KeyC",
          "KeyV",
          "KeyB",
          "KeyN",
          "KeyM"
        ],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយដោយរក្សាភាពត្រឹមត្រូវ ៩០% ឡើងទៅ លើគ្រប់ជួរនៃក្តារចុច។",
        "unicodeOutputExplained": "ការវាយអក្សរដោយមិនមើលក្តារចុច (Touch Typing) លើគ្រាប់ចុចមូលដ្ឋានទាំងអស់។",
        "successCriteria": "ឆ្លងកាត់ទាំង ៣ Wave ដោយជោគជ័យ ដើម្បីដោះសោពិភពទី ២។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 32,
        "stages": [
          {
            "id": "w1-boss-s1",
            "kind": "boss",
            "titleKh": "Wave ជួរកណ្តាល និងម្រាមចង្អុល (Home Row & Reach Wave)",
            "titleEn": "Boss Wave 1 — Home Row & Index Reach Mastery",
            "mission": "វាយពាក្យជួរកណ្តាល និងម្រាមចង្អុល (A S D F G H J K L ;) ដោយមិនខុស។",
            "skill": "Flawless recall of home-row and index reach key locations.",
            "mechanic": "Fast-paced word wave requiring steady rhythm and zero keyboard looking.",
            "targetCount": 12,
            "accuracyGoal": 90,
            "practiceMode": "unicode-output",
            "items": [
              "សាលា",
              "កាក",
              "ដាក",
              "កង",
              "សង",
              "ដង",
              "ហាង",
              "សាហាវ",
              "ដង្ហើម",
              "លើក",
              "សើច",
              "ហាត់"
            ],
            "hint": "រក្សាម្រាមដៃលើ F និង J ជាទីតាំងស្នូលជានិច្ច។"
          },
          {
            "id": "w1-boss-s2",
            "kind": "boss",
            "titleKh": "Wave ជួរលើ និងជួរក្រោម (Upper & Lower Row Wave)",
            "titleEn": "Boss Wave 2 — Vertical Reach Mastery",
            "mission": "វាយពាក្យដែលឈោងទៅជួរលើ និងជួរក្រោមដោយភាពច្បាស់លាស់។",
            "skill": "Accurate vertical reaches returning cleanly to home positions.",
            "mechanic": "Extended reach challenges testing vertical finger independence.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ទឹកតែ",
              "រៀន",
              "កុមារ",
              "ចរាចរ",
              "ខិតខំ",
              "មានបាន",
              "នាំមុខ",
              "សេរី",
              "យាយ",
              "មនុស្ស"
            ],
            "hint": "ឈោងម្រាមដៃទៅដល់គោលដៅ រួចដកម្រាមដៃមកជួរកណ្តាលវិញភ្លាម។"
          },
          {
            "id": "w1-boss-s3",
            "kind": "boss",
            "titleKh": "Wave ស្ទាត់គ្រាប់ចុចមូលដ្ឋាន (Base Keyboard Flow Wave)",
            "titleEn": "Boss Wave 3 — Ultimate Base Keyboard Trial",
            "mission": "វាយឃ្លាពេញលេញដោយប្រើគ្រាប់ចុចមូលដ្ឋានទាំងអស់ និងសញ្ញាខណ្ឌ ។។",
            "skill": "Synthesis of all base-layer touch typing skills with high accuracy.",
            "mechanic": "Final boss trial securing graduation from World 1.",
            "targetCount": 6,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សិស្សខិតខំរៀនសូត្រ។",
              "កុមារទៅសាលារៀន។",
              "យើងស្រឡាញ់ភាសាខ្មែរ។",
              "ធ្វើការងារដោយយកចិត្តទុកដាក់។",
              "សាមគ្គីនាំមកនូវជោគជ័យ។",
              "ប្រទេសកម្ពុជាស្រស់ស្អាត។"
            ],
            "hint": "ផ្តោតលើភាពត្រឹមត្រូវមុនល្បឿន។ វាយមួយៗឲ្យច្បាស់។"
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "title": "River Ruins",
    "titleKh": "ប្រាសាទមាត់ស្ទឹង",
    "subtitle": "បច្ចេកទេស ប្តូរ, AltGr និងលំដាប់ស្រៈ",
    "theme": "Water Realm",
    "mainLessonKh": "ចេះប្រើ ប្តូរ ឆ្លាស់ដៃ ស្រទាប់ AltGr និងវាយស្រៈតាមលំដាប់ត្រឹមត្រូវ",
    "mainLessonEn": "ប្តូរ opposite-hand technique, AltGr layers, and strict Unicode vowel order",
    "skillFocus": "Opposite-hand ប្តូរ coordination and logical keystroke sequence.",
    "unicodeFocus": "ប្តូរed consonants/vowels, AltGr repetition marks, and circumfix vowels.",
    "levels": [
      {
        "id": 1,
        "labelKh": "រំលឹកគ្រាប់ចុចមូលដ្ឋាន",
        "labelEn": "Base-Key Review",
        "category": "Modifier Preparation",
        "skillCategory": "base-review",
        "objective": "រំលឹកទីតាំងគ្រាប់ចុចមូលដ្ឋានទាំងអស់លើគ្រប់ជួរ មុនពេលឈានចូលរៀនបច្ចេកទេស ប្តូរ និង AltGr។",
        "focusKeys": [
          "គ្រាប់ចុចជួរកណ្តាល",
          "ជួរលើ",
          "ជួរក្រោម"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "រក្សាម្រាមដៃលើទីតាំងដើម A S D F និង J K L ; ជានិច្ច ពេលឈោងម្រាម។",
        "unicodeOutputExplained": "ការរំលឹកគ្រាប់ចុចមិនប្រើ ប្តូរ លើគ្រប់ជួរ។",
        "successCriteria": "វាយអត្ថបទរំលឹកដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 32,
        "stages": [
          {
            "id": "w2-l1-s1",
            "kind": "warmup",
            "titleKh": "លំហាត់រំលឹកជួរកណ្តាល (Home Row Refresh)",
            "titleEn": "Home Row Refresh — Accuracy & Anchor Check",
            "mission": "វាយពាក្យជួរកណ្តាលដោយរក្សាលំនឹងម្រាមដៃលើ F និង J។",
            "skill": "Home-row anchor awareness and fluid typing cadence.",
            "mechanic": "Accuracy check on basic home-row words.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សាលា",
              "កាក",
              "ដាក",
              "កង",
              "សង",
              "ដង",
              "ហាង",
              "លើក",
              "សើច",
              "ដក"
            ],
            "hint": "ផ្តោតលើភាពត្រឹមត្រូវ និងទម្លាប់វិលមក F និង J វិញ។"
          },
          {
            "id": "w2-l1-s2",
            "kind": "pattern",
            "titleKh": "រំលឹកការឈោងជួរលើ-ក្រោម (Vertical Refresh)",
            "titleEn": "Vertical Refresh — Top & Bottom Rows",
            "mission": "វាយពាក្យដែលមានការឈោងឡើងលើ និងចុះក្រោម។",
            "skill": "Vertical reach and return coordination across rows.",
            "mechanic": "Cross-row typing flow with clean finger retraction.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ទឹក",
              "រៀន",
              "កុមារ",
              "ចរាចរ",
              "ខិតខំ",
              "មាន",
              "នាំ",
              "សេរី",
              "យាយ",
              "មនុស្ស"
            ],
            "hint": "ឈោងម្រាមដៃទៅរកគ្រាប់ចុច រួចដកម្រាមដៃមកជួរកណ្តាលវិញភ្លាម។"
          },
          {
            "id": "w2-l1-s3",
            "kind": "sentence",
            "titleKh": "ល្បះរំលឹកពេញលេញ (Comprehensive Sentence Refresh)",
            "titleEn": "Sentence Refresh — Full Base Keyboard Mastery",
            "mission": "វាយប្រយោគពេញលេញដោយប្រើគ្រាប់ចុចមូលដ្ឋាន។",
            "skill": "Integrated typing of complete clauses with standard punctuation.",
            "mechanic": "Full sentence flow checking readiness for modifier learning.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កុមារខិតខំរៀនសូត្រនៅសាលា។",
              "យើងស្រឡាញ់ទឹកដីកម្ពុជា។",
              "មនុស្សគ្រប់រូបត្រូវការសន្តិភាព។",
              "ការរៀនសូត្រនាំមកនូវចំណេះដឹង។",
              "សាមគ្គីភាពនាំមកនូវជោគជ័យ។"
            ],
            "hint": "វាយមួយៗដោយភាពស្ងប់ស្ងាត់ និងត្រឹមត្រូវ។"
          }
        ]
      },
      {
        "id": 2,
        "labelKh": "Right ប្តូរ សម្រាប់ដៃឆ្វេង",
        "labelEn": "Right ប្តូរ for Left Hand",
        "category": "Modifier Foundations",
        "skillCategory": "shift-opposite",
        "objective": "រៀនប្រើ Right ប្តូរ (កូនដៃស្តាំ) ជាមួយគ្រាប់ចុចដៃឆ្វេង ដើម្បីវាយ ធ, ឌ, ៃ, ាំ, អ, ឈ, ឺ, ែ, ឬ, ទ, ឍ, ឃ, ជ, េះ, ព។",
        "focusKeys": [
          "Rightប្តូរ",
          "ធ",
          "ឌ",
          "ៃ",
          "ាំ",
          "អ",
          "ឈ",
          "ឺ",
          "ែ",
          "ឬ",
          "ទ",
          "ឍ",
          "ឃ",
          "ជ",
          "េះ",
          "ព"
        ],
        "introducedKeyCodes": [
          "ប្តូរRight"
        ],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "គ្រាប់ចុចគោលដៅដៃឆ្វេង ត្រូវចុចសង្កត់ Right ប្តូរ ដោយកូនដៃស្តាំជានិច្ច មុនពេលចុចគ្រាប់ចុចឆ្វេង។",
        "unicodeOutputExplained": "Right ប្តូរ + F=ធ, D=ឌ, S=ៃ, A=ាំ, G=អ, Q=ឈ, W=ឺ, E=ែ, R=ឬ, T=ទ, Z=ឍ, X=ឃ, C=ជ, V=េះ, B=ព",
        "successCriteria": "វាយអក្សរ ប្តូរ ដៃឆ្វេងដោយប្រើ Right ប្តូរ ត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 26,
        "stages": [
          {
            "id": "w2-l2-s1",
            "kind": "warmup",
            "titleKh": "កាយវិការ Right ប្តូរ (Right ប្តូរ Mechanics)",
            "titleEn": "Right ប្តូរ Mechanics — Two-Hand Opposition",
            "mission": "ហាត់ចុចសង្កត់ Right ប្តូរ ដោយកូនដៃស្តាំ រួចចុចគ្រាប់ចុចដៃឆ្វេង (F, D, T, C, B)។",
            "skill": "Opposite-hand ប្តូរ mechanics: right pinky holds ប្តូរ, left strikes.",
            "mechanic": "Timed modifier hold-and-strike sequence.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "unicode-output",
            "items": [
              "ធ",
              "ឌ",
              "ទ",
              "ជ",
              "ព",
              "ធ",
              "ទ",
              "ជ",
              "ព",
              "ធទជព"
            ],
            "hint": "សង្កត់ Right ប្តូរ ដោយកូនដៃស្តាំ -> ចុចគ្រាប់ចុចឆ្វេង -> លែង ប្តូរ ទាំងពីរ។"
          },
          {
            "id": "w2-l2-s2",
            "kind": "pattern",
            "titleKh": "ព្យញ្ជន ប្តូរ ដៃឆ្វេង (Left-Hand ប្តូរed Consonants)",
            "titleEn": "Left ប្តូរed Patterns — Consonant Pairs & Syllables",
            "mission": "ហាត់វាយព្យញ្ជន ធ, ទ, ជ, ព, ឃ, ឈ, អ ផ្សំជាមួយស្រៈ។",
            "skill": "Fluid integration of left-hand shifted consonants into basic syllables.",
            "mechanic": "Bilateral coordination with right-pinky ប្តូរ hold.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ធំ",
              "ទូ",
              "ជើង",
              "ពូ",
              "ឈើ",
              "អាន",
              "ឃ្លា",
              "ទា",
              "ជួប",
              "ពិត"
            ],
            "hint": "ធ: Right ប្តូរ + F។ ទ: Right ប្តូរ + T។ ជ: Right ប្តូរ + C។ ព: Right ប្តូរ + B។"
          },
          {
            "id": "w2-l2-s3",
            "kind": "word",
            "titleKh": "ពាក្យ ប្តូរ ដៃឆ្វេង (Left ប្តូរ Words)",
            "titleEn": "Left ប្តូរ Words — Real Vocabulary",
            "mission": "វាយពាក្យខ្មែរដែលមានអក្សរ ប្តូរ ដៃឆ្វេង។",
            "skill": "Accurate vocabulary typing requiring opposite-hand Right ប្តូរ.",
            "mechanic": "Full word challenges with left shifted consonants.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ធំធេង",
              "ទូកក្តោង",
              "ជំនួយ",
              "ពូកែ",
              "ឈើព្រៃ",
              "អានសៀវភៅ",
              "ទិវា",
              "ជោគជ័យ"
            ],
            "hint": "រក្សាការសង្កត់ Right ប្តូរ ឲ្យជាប់ មុនពេលចុចគ្រាប់ចុចដៃឆ្វេង។"
          }
        ]
      },
      {
        "id": 3,
        "labelKh": "Left ប្តូរ សម្រាប់ដៃស្តាំ",
        "labelEn": "Left ប្តូរ for Right Hand",
        "category": "Modifier Foundations",
        "skillCategory": "shift-opposite",
        "objective": "រៀនប្រើ Left ប្តូរ (កូនដៃឆ្វេង) ជាមួយគ្រាប់ចុចដៃស្តាំ ដើម្បីវាយ ញ, គ, ឡ, ោះ, ះ, ួ, ូ, ី, ៅ, ភ, ណ, ំ, ុះ, ៕។",
        "focusKeys": [
          "Leftប្តូរ",
          "ញ",
          "គ",
          "ឡ",
          "ោះ",
          "ះ",
          "ួ",
          "ូ",
          "ី",
          "ៅ",
          "ភ",
          "ណ",
          "ំ",
          "ុះ",
          "៕"
        ],
        "introducedKeyCodes": [
          "ប្តូរLeft"
        ],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "គ្រាប់ចុចគោលដៅដៃស្តាំ ត្រូវចុចសង្កត់ Left ប្តូរ ដោយកូនដៃឆ្វេងជានិច្ច មុនពេលចុចគ្រាប់ចុចស្តាំ។",
        "unicodeOutputExplained": "Left ប្តូរ + J=ញ, K=គ, L=ឡ, ;=ោះ, H=ះ, Y=ួ, U=ូ, I=ី, O=ៅ, P=ភ, N=ណ, M=ំ, ,=ុះ, .=៕",
        "successCriteria": "វាយអក្សរ ប្តូរ ដៃស្តាំដោយប្រើ Left ប្តូរ ត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 26,
        "stages": [
          {
            "id": "w2-l3-s1",
            "kind": "warmup",
            "titleKh": "កាយវិការ Left ប្តូរ (Left ប្តូរ Mechanics)",
            "titleEn": "Left ប្តូរ Mechanics — Left Pinky Hold",
            "mission": "ហាត់ចុចសង្កត់ Left ប្តូរ ដោយកូនដៃឆ្វេង រួចចុចគ្រាប់ចុចដៃស្តាំ (K, P, J, L, N)។",
            "skill": "Opposite-hand ប្តូរ mechanics: left pinky holds ប្តូរ, right strikes.",
            "mechanic": "Modifier hold-and-strike sequence on right keyboard half.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "unicode-output",
            "items": [
              "គ",
              "ភ",
              "ញ",
              "ឡ",
              "ណ",
              "គ",
              "ភ",
              "ញ",
              "ឡ",
              "គភញឡណ"
            ],
            "hint": "សង្កត់ Left ប្តូរ ដោយកូនដៃឆ្វេង -> ចុចគ្រាប់ចុចស្តាំ -> លែង ប្តូរ ទាំងពីរ។"
          },
          {
            "id": "w2-l3-s2",
            "kind": "pattern",
            "titleKh": "ព្យញ្ជន និងស្រៈ ប្តូរ ដៃស្តាំ (Right-Hand ប្តូរ Patterns)",
            "titleEn": "Right ប្តូរed Patterns — Syllables with គ, ភ, ញ, ឡ, ណ",
            "mission": "ហាត់វាយព្យាង្គដែលប្រើអក្សរ ប្តូរ ដៃស្តាំ រួមទាំងស្រៈ ី, ូ, ៅ, ួ។",
            "skill": "Syllable typing combining right shifted consonants and vowels.",
            "mechanic": "Left-pinky ប្តូរ hold with right-hand precision strikes.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "គិត",
              "ភ្នំ",
              "ឡាន",
              "គុណ",
              "ញញឹម",
              "កោះ",
              "ចេះ",
              "គោ",
              "ភូមិ",
              "ធំ"
            ],
            "hint": "គ: Left ប្តូរ + K។ ភ: Left ប្តូរ + P។ ញ: Left ប្តូរ + J។ ឡ: Left ប្តូរ + L។"
          },
          {
            "id": "w2-l3-s3",
            "kind": "word",
            "titleKh": "ពាក្យ ប្តូរ ដៃស្តាំ (Right ប្តូរ Words)",
            "titleEn": "Right ប្តូរ Words — Real Vocabulary Practice",
            "mission": "វាយពាក្យខ្មែរដែលមានអក្សរ ប្តូរ ដៃស្តាំ។",
            "skill": "Accurate vocabulary typing requiring opposite-hand Left ប្តូរ.",
            "mechanic": "Full word challenges with right shifted characters.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "គំនិតល្អ",
              "ភ្នំពេញ",
              "ឡានទំនើប",
              "កូនញញឹម",
              "ដឹងគុណ",
              "ភាសាខ្មែរ",
              "សិស្សគំរូ",
              "កោះកុង"
            ],
            "hint": "ភ្នំ: Left ប្តូរ + P (ភ) + J (្) + Left ប្តូរ + N (ន) + Left ប្តូរ + M (ំ)។"
          }
        ]
      },
      {
        "id": 4,
        "labelKh": "ការសម្របសម្រួល ប្តូរ ឆ្លាស់ដៃ",
        "labelEn": "Two-Hand ប្តូរ Coordination",
        "category": "Modifier Foundations",
        "skillCategory": "two-hand-shift",
        "objective": "ហាត់ចុចឆ្លាស់គ្នារវាង Left ប្តូរ និង Right ប្តូរ ក្នុងពាក្យតែមួយយ៉ាងរលូន ដោយមិនច្រឡំកូនដៃ។",
        "focusKeys": [
          "Leftប្តូរ",
          "Rightប្តូរ",
          "ពូជ",
          "ធំ",
          "ភ្នំ",
          "សិស្ស",
          "គិត",
          "ឃ្មុំ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "ជ្រើសរើស ប្តូរ ម្ខាងទៀតដោយស្វ័យប្រវត្តិតាមដៃនៃគ្រាប់ចុចគោលដៅ។",
        "unicodeOutputExplained": "ឆ្វេងប្រើ Right ប្តូរ, ស្តាំប្រើ Left ប្តូរ ឆ្លាស់គ្នាក្នុងពាក្យតែមួយ។",
        "successCriteria": "វាយពាក្យផ្សំ ប្តូរ ឆ្លាស់ដៃដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 28,
        "stages": [
          {
            "id": "w2-l4-s1",
            "kind": "warmup",
            "titleKh": "ឆ្លាស់ ប្តូរ ឆ្វេង-ស្តាំ (Alternating ប្តូរ Drills)",
            "titleEn": "ប្តូរ Alternation — Left ប្តូរ vs Right ប្តូរ",
            "mission": "ហាត់វាយអក្សរ ប្តូរ ដៃឆ្វេង (ធ) ឆ្លាស់ជាមួយអក្សរ ប្តូរ ដៃស្តាំ (គ)។",
            "skill": "Rapid switching between Left ប្តូរ and Right ប្តូរ.",
            "mechanic": "Strict alternating bilateral modifier execution.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "unicode-output",
            "items": [
              "ធ គ",
              "ទ ភ",
              "ជ ញ",
              "ព ឡ",
              "ឃ ណ",
              "ធគ",
              "ទភ",
              "ជញ",
              "ពឡ",
              "ឃណ"
            ],
            "hint": "ធ (Right ប្តូរ) -> គ (Left ប្តូរ) -> ទ (Right ប្តូរ) -> ភ (Left ប្តូរ)។"
          },
          {
            "id": "w2-l4-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យមាន ប្តូរ ទាំងសងខាង (Bilateral ប្តូរ Words)",
            "titleEn": "Two-Hand ប្តូរ Words — Mixed Pinky Coordination",
            "mission": "វាយពាក្យខ្មែរដែលទាមទារ ប្តូរ ទាំងដៃឆ្វេង និងដៃស្តាំ។",
            "skill": "Coordination of both pinkies handling opposite modifiers within words.",
            "mechanic": "Compound word patterns requiring multiple ប្តូរ strokes.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ពូជ",
              "ធំធេង",
              "គំនិត",
              "ភាសា",
              "វិជ្ជា",
              "ជំនួយ",
              "ភូមិភាគ",
              "ទិវា",
              "ឃ្មុំ",
              "ញាតិ"
            ],
            "hint": "ពូជ: ព (Right ប្តូរ + B) + ូ (Left ប្តូរ + U) + ជ (Right ប្តូរ + C)។"
          },
          {
            "id": "w2-l4-s3",
            "kind": "sentence",
            "titleKh": "ល្បះផ្សំ ប្តូរ ពេញលេញ (Full ប្តូរ Sentences)",
            "titleEn": "ប្តូរ Mastery Sentences — Complete Flow",
            "mission": "វាយប្រយោគដែលមានពាក្យប្រើ ប្តូរ ចម្រុះ។",
            "skill": "Integration of two-hand ប្តូរ coordination into natural sentence flow.",
            "mechanic": "Fluent sentence execution with zero pinky confusion.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "យើងត្រូវមានគំនិតធំធេង និងចេះជួយគ្នា។",
              "ភាសាខ្មែរជាភាសាជាតិដែលថ្លៃថ្លារបស់យើង។",
              "សិស្សានុសិស្សខិតខំរៀនដើម្បីជោគជ័យ។",
              "ភ្នំពេញជារាជធានីនៃព្រះរាជាណាចក្រកម្ពុជា។",
              "ការចេះដឹងជាទ្រព្យសម្បត្តិមានតម្លៃបំផុត។"
            ],
            "hint": "កុំប្រញាប់។ សង្កត់ ប្តូរ ឲ្យជាប់ មុនចុចអក្សរ។"
          }
        ]
      },
      {
        "id": 5,
        "labelKh": "ស្រទាប់ AltGr និងសញ្ញាពិសេស",
        "labelEn": "AltGr Layers & Special Signs",
        "category": "Modifier Foundations",
        "skillCategory": "altgr",
        "objective": "រៀនប្រើគ្រាប់ចុច AltGr (Right Alt) ដើម្បីវាយសញ្ញាលេខទោ (ៗ) និងស្រៈពេញតួមួយចំនួនដូចជា ឯ, ឱ, ឦ, ឫ។",
        "focusKeys": [
          "AltGr",
          "ៗ",
          "ឯ",
          "ឱ",
          "ឦ",
          "ឫ",
          "ក្មេងៗ",
          "ច្រើនៗ",
          "ឆាប់ៗ"
        ],
        "introducedKeyCodes": [
          "AltRight"
        ],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "thumb",
          "pinky",
          "middle",
          "ring",
          "index"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "AltGr + ; បង្កើតសញ្ញាលេខទោ (ៗ)។ AltGr + E=ឯ, O=ឱ, I=ឦ, R=ឫ។ សញ្ញា ៗ ប្រើសម្រាប់ផ្ទួនពាក្យ។",
        "unicodeOutputExplained": "AltGr (មេដៃស្តាំ) + ; = ៗ (សញ្ញាលេខទោ), E=ឯ, O=ឱ, I=ឦ, R=ឫ",
        "successCriteria": "វាយសញ្ញាលេខទោ (ៗ) និងស្រៈពេញតួ AltGr ដោយភាពត្រឹមត្រូវ ៩០% ឡើងទៅ។",
        "minimumAccuracy": 90,
        "speedTargetCpm": 26,
        "stages": [
          {
            "id": "w2-l5-s1",
            "kind": "warmup",
            "titleKh": "ស្គាល់គ្រាប់ចុច AltGr (AltGr Key Discovery)",
            "titleEn": "AltGr Discovery — Right Alt & Semicolon (ៗ)",
            "mission": "ហាត់សង្កត់ AltGr ដោយមេដៃស្តាំ រួចចុច Semicolon (;) ដើម្បីវាយសញ្ញាលេខទោ ៗ។",
            "skill": "Thumb AltGr actuation and precise pinky strike on Semicolon.",
            "mechanic": "AltGr modifier mechanics without displacing hand position.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "unicode-output",
            "items": [
              "ៗ",
              "ឯ",
              "ឱ",
              "ឦ",
              "ឫ",
              "ៗ",
              "ៗ",
              "ឯ",
              "ឱ",
              "ៗៗ"
            ],
            "hint": "សង្កត់ AltGr (នៅស្តាំ Spacebar) ដោយមេដៃស្តាំ រួចចុច Semicolon (;) ដើម្បីចេញ ៗ។"
          },
          {
            "id": "w2-l5-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យផ្ទួនប្រើលេខទោ (Repetition Mark Words)",
            "titleEn": "Word Repetition — Words with ៗ",
            "mission": "ហាត់វាយពាក្យខ្មែរដែលប្រើសញ្ញាលេខទោ ៗ សម្រាប់ផ្ទួនសំឡេង។",
            "skill": "Applying the Khmer repetition mark ៗ accurately at the end of words.",
            "mechanic": "Typing common Khmer reduplicated words.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ក្មេងៗ",
              "ច្រើនៗ",
              "ឆាប់ៗ",
              "តិចៗ",
              "ញឹកៗ",
              "ល្អៗ",
              "វែងៗ",
              "ថ្មីៗ",
              "ផ្សេងៗ",
              "រឿយៗ"
            ],
            "hint": "ក្មេងៗ: វាយ ក្មេង រួចចុច AltGr + Semicolon ដើម្បីដាក់ ៗ។"
          },
          {
            "id": "w2-l5-s3",
            "kind": "word",
            "titleKh": "ស្រៈពេញតួ AltGr (Independent Vowel Words)",
            "titleEn": "AltGr Independent Vowels — ឯកសារ, ឱកាស",
            "mission": "វាយពាក្យខ្មែរដែលចាប់ផ្តើមដោយស្រៈពេញតួ ឯ, ឱ, ឫ។",
            "skill": "Typing independent vowels using AltGr modifier combinations.",
            "mechanic": "Vocabulary challenges featuring AltGr independent vowels.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ឯកសារ",
              "ឱកាសល្អ",
              "ឯករាជ្យ",
              "ឫទ្ធី",
              "ឯកឧត្តម",
              "ឱសថ",
              "ឯកភាព",
              "ឫស្សី"
            ],
            "hint": "ឯ: AltGr + E។ ឱ: AltGr + O។ ឫ: AltGr + R។"
          }
        ]
      },
      {
        "id": 6,
        "labelKh": "លំដាប់តួស្រះទូទៅ",
        "labelEn": "Simple Dependent Vowels",
        "category": "Khmer Composition",
        "skillCategory": "dependent-vowels",
        "objective": "ហ្វឹកហាត់វាយតួស្រះទូទៅតាមលំដាប់ Unicode ត្រឹមត្រូវ៖ ព្យញ្ជនដើមជានិច្ច រួចទើបវាយស្រៈ (ា, ិ, ី, ឹ, ឺ, ុ, ូ, ួ)។",
        "focusKeys": [
          "ា",
          "ិ",
          "ី",
          "ឹ",
          "ឺ",
          "ុ",
          "ូ",
          "ួ",
          "កា",
          "កិ",
          "គី",
          "ទឹក"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "តួស្រះត្រូវវាយបន្ទាប់ពីព្យញ្ជនជានិច្ច ទោះបីរូបរាងរបស់វាស្ថិតនៅពីលើ ពីក្រោម ឬពីមុខក្តី។",
        "unicodeOutputExplained": "លំដាប់: ព្យញ្ជន + ស្រៈ។ ហាមវាយស្រៈមុនព្យញ្ជនជាដាច់ខាត។",
        "successCriteria": "វាយព្យាង្គ និងពាក្យផ្សំស្រៈដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 30,
        "stages": [
          {
            "id": "w2-l6-s1",
            "kind": "warmup",
            "titleKh": "ស្រៈលើ និងស្រៈក្រោម (Above & Below Vowels)",
            "titleEn": "Vowel Drills — Superscript & Subscript Vowels",
            "mission": "ហាត់វាយព្យញ្ជន ក ជាមួយស្រៈលើ (ិ, ី, ឹ, ឺ) និងស្រៈក្រោម (ុ, ូ, ួ)។",
            "skill": "Strict sequence adherence for superscript and subscript vowels.",
            "mechanic": "Systematic vowel matrix practice with base consonant ក.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កា",
              "កិ",
              "កី",
              "កឹ",
              "កឺ",
              "កុ",
              "កូ",
              "កួ",
              "គិ",
              "គី"
            ],
            "hint": "វាយ ក (KeyK) មុន រួចទើបចុចស្រៈ។ ស្រៈ ី ចុច Left ប្តូរ + I។ ស្រៈ ូ ចុច Left ប្តូរ + U។"
          },
          {
            "id": "w2-l6-s2",
            "kind": "pattern",
            "titleKh": "គូព្យាង្គស្រៈប្តូរ (Vowel Switch Patterns)",
            "titleEn": "Vowel Switching — Same Consonant, Different Vowel",
            "mission": "ហាត់ប្តូរស្រៈលើព្យញ្ជនដដែល ដើម្បីពង្រឹងការចងចាំទីតាំងស្រៈ។",
            "skill": "Fast vowel key selection maintaining proper Unicode sequence.",
            "mechanic": "Rapid vowel substitution drills across hands.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ទីណា",
              "គិតគូរ",
              "ទឹកដី",
              "កូនចៅ",
              "ដឹងឮ",
              "មីងមា",
              "សួស្តី",
              "មូលដ្ឋាន",
              "រូបភាព",
              "ជីវិត"
            ],
            "hint": "ទីណា: ទ (Right ប្តូរ + T) + ី (Left ប្តូរ + I) + ណ (Left ប្តូរ + N) + ា (A)។"
          },
          {
            "id": "w2-l6-s3",
            "kind": "word",
            "titleKh": "ពាក្យតួស្រះទូទៅ (Everyday Vowel Words)",
            "titleEn": "Everyday Vowel Words — Practical Vocabulary",
            "mission": "វាយពាក្យខ្មែរទូទៅដែលផ្សំឡើងពីតួស្រះទាំងនេះ។",
            "skill": "Fluid typing of common vowel-rich vocabulary.",
            "mechanic": "Real-world words testing vowel location accuracy.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ទឹកដីកម្ពុជា",
              "កូនសិស្សល្អ",
              "គិតគូរវែងឆ្ងាយ",
              "ជីវិតរុងរឿង",
              "សួស្តីឆ្នាំថ្មី",
              "រូបសំណាក",
              "មូលនិធិ",
              "ទីកន្លែង"
            ],
            "hint": "ពិនិត្យមើលលំដាប់ Unicode៖ ព្យញ្ជនមកមុនស្រះជានិច្ច។"
          }
        ]
      },
      {
        "id": 7,
        "labelKh": "ស្រៈមើលខាងមុខ និងស្រៈព័ទ្ធជុំវិញ",
        "labelEn": "Visual-Left & Circumfix Vowels",
        "category": "Khmer Composition",
        "skillCategory": "visual-left-vowels",
        "objective": "រៀនវាយស្រៈដែលបង្ហាញរូបរាងនៅខាងមុខ ឬព័ទ្ធជុំវិញព្យញ្ជន (េ, ែ, ៃ, ោ, ៅ, ើ, ឿ, ៀ) ដោយវាយព្យញ្ជនដើមមុនជានិច្ច។",
        "focusKeys": [
          "េ",
          "ែ",
          "ៃ",
          "ោ",
          "ៅ",
          "ើ",
          "ឿ",
          "ៀ",
          "ទៅ",
          "មើល",
          "រៀន",
          "កែ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "ទោះបីជាស្រៈ េ, ែ, ៃ, ោ, ៅ, ើ, ឿ, ៀ បង្ហាញនៅខាងមុខព្យញ្ជនក្តី ក្នុងការវាយកុំព្យូទ័រ ត្រូវវាយព្យញ្ជនមុនជានិច្ច។",
        "unicodeOutputExplained": "ឧទាហរណ៍: \"កែ\" = ចុច ក (K) រួចចុច ែ (ប្តូរ+E)។ ហាមវាយ ែ មុន ក!",
        "successCriteria": "វាយស្រៈមើលខាងមុខ និងព័ទ្ធជុំវិញដោយលំដាប់ត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 30,
        "stages": [
          {
            "id": "w2-l7-s1",
            "kind": "warmup",
            "titleKh": "ស្រៈមើលខាងមុខ (Visual-Left Vowels េ, ែ, ៃ)",
            "titleEn": "Visual-Left Drills — េ, ែ, ៃ Sequence",
            "mission": "ហាត់វាយ កេ (K+E), កែ (K+ប្តូរ+E), កៃ (K+ប្តូរ+S) ដោយវាយ ក មុន។",
            "skill": "Cognitive retraining: typing the base consonant before the visual-left vowel.",
            "mechanic": "Sequence validation ensuring consonant precedes visual-left vowel.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កេ",
              "កែ",
              "កៃ",
              "តេ",
              "តែ",
              "ដៃ",
              "គេ",
              "កែប្រែ",
              "ចែ",
              "ថែ"
            ],
            "hint": "វាយ ក (K) រួចទើបវាយ ែ (ប្តូរ+E)។ មិនត្រូវចុច ែ មុន ក ឡើយ។"
          },
          {
            "id": "w2-l7-s2",
            "kind": "pattern",
            "titleKh": "ស្រៈព័ទ្ធជុំវិញ (Circumfix Vowels ោ, ៅ, ើ, ឿ, ៀ)",
            "titleEn": "Circumfix Patterns — ោ, ៅ, ើ, ឿ, ៀ",
            "mission": "ហាត់វាយស្រៈដែលព័ទ្ធជុំវិញព្យញ្ជន ដោយវាយព្យញ្ជនមុន។",
            "skill": "Mastery of multipart circumfix vowels wrapped around base consonant.",
            "mechanic": "Correct single-keystroke circumfix input after consonant.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កោ",
              "កៅ",
              "កើ",
              "កឿ",
              "កៀ",
              "ទៅ",
              "មើល",
              "រៀន",
              "កោះ",
              "ចៅ"
            ],
            "hint": "ទៅ: ត (KeyT) + ៅ (ប្តូរ+KeyO)។ មើល: ម (KeyM) + ើ (Semicolon) + ល (KeyL)។"
          },
          {
            "id": "w2-l7-s3",
            "kind": "word",
            "titleKh": "ពាក្យស្រៈមើលខាងមុខ (Visual-Left Words)",
            "titleEn": "Visual-Left Words — Integrated Vocabulary",
            "mission": "វាយពាក្យខ្មែរដែលមានស្រៈមើលខាងមុខ និងព័ទ្ធជុំវិញ។",
            "skill": "Flawless execution of visual-left and circumfix vowels in authentic words.",
            "mechanic": "Real-world vocabulary typing under strict Unicode validation.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ទៅសាលា",
              "រៀនសូត្រ",
              "មើលសៀវភៅ",
              "កែប្រែខ្លួន",
              "ចៅហ្វាយនាយ",
              "ថែទាំសុខភាព",
              "ដោះស្រាយ",
              "ជឿជាក់"
            ],
            "hint": "រៀន: រ (KeyR) + ៀ (BracketLeft) + ន (KeyN)។"
          }
        ]
      },
      {
        "id": 8,
        "labelKh": "ព្យាង្គ និងពាក្យផ្សំ ប្តូរ ចម្រុះ",
        "labelEn": "Mixed Modifier Syllables",
        "category": "Modifier Foundations",
        "skillCategory": "modifier-synthesis",
        "objective": "អនុវត្តការវាយពាក្យចម្រុះដែលរួមបញ្ចូល ប្តូរ សងខាង ស្រទាប់ AltGr និងស្រៈគ្រប់ប្រភេទប្រកបដោយទំនុកចិត្ត។",
        "focusKeys": [
          "ចម្រុះ ប្តូរ និងស្រៈ",
          "ស្ទាត់",
          "រៀន",
          "សាលា",
          "កម្ពុជា",
          "ជោគជ័យ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "រួមបញ្ចូលបច្ចេកទេសទាំងអស់នៃពិភពទី ២ ក្នុងការវាយពាក្យស្មុគស្មាញ។",
        "unicodeOutputExplained": "ការសំយោគ ប្តូរ ឆ្វេង-ស្តាំ, AltGr ៗ, និងលំដាប់ស្រៈទាំងអស់។",
        "successCriteria": "វាយពាក្យផ្សំចម្រុះដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 32,
        "stages": [
          {
            "id": "w2-l8-s1",
            "kind": "warmup",
            "titleKh": "លំហាត់កម្តៅសាច់ដុំចម្រុះ (Mixed Modifier Warmup)",
            "titleEn": "Modifier Warmup — Fast ប្តូរ & Vowel Execution",
            "mission": "វាយពាក្យចម្រុះដែលមានទាំង ប្តូរ ឆ្វេង-ស្តាំ និងស្រៈ។",
            "skill": "Quick mental mapping from Khmer character to hand/modifier combo.",
            "mechanic": "Rapid mixed-word drills with varying modifier demands.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ធំ",
              "ភ្នំ",
              "ទៅ",
              "រៀន",
              "ក្មេងៗ",
              "ច្រើនៗ",
              "ពូកែ",
              "ជោគជ័យ",
              "ភាសា",
              "គំនិត"
            ],
            "hint": "សង្កេតអក្សរ -> កំណត់ដៃ និងម្រាម -> ចុចដោយចង្វាក់រលូន។"
          },
          {
            "id": "w2-l8-s2",
            "kind": "pattern",
            "titleKh": "ចង្វាក់ពាក្យស្មុគស្មាញ (Complex Word Patterns)",
            "titleEn": "Complex Word Patterns — Advanced Syllables",
            "mission": "វាយពាក្យខ្មែរដែលមានស្រទាប់អក្សរច្រើន និងសញ្ញាពិសេស។",
            "skill": "Accurate typing of compound words combining multiple modifiers.",
            "mechanic": "Advanced vocabulary challenges testing finger independence.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កម្ពុជា",
              "ប្រទេសជាតិ",
              "ប្រពៃណី",
              "ប្រជាជន",
              "សិស្សានុសិស្ស",
              "សាកលវិទ្យាល័យ",
              "អភិវឌ្ឍន៍",
              "ជោគជ័យធំធេង"
            ],
            "hint": "កម្ពុជា: ក + ម + ្ + ព + ុ + ជ + ា។ វាយមួយៗតាមលំដាប់។"
          },
          {
            "id": "w2-l8-s3",
            "kind": "sentence",
            "titleKh": "ល្បះស្ទាត់ជំនាញ (Modifier Fluency Sentences)",
            "titleEn": "Modifier Fluency — Natural Khmer Phrasing",
            "mission": "វាយប្រយោគពេញលេញដែលបង្ហាញពីភាពស្ទាត់ជំនាញលើ Modifier។",
            "skill": "Sustained typing accuracy across multi-clause sentences.",
            "mechanic": "Full sentence typing demonstrating World 2 mastery.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សិស្សានុសិស្សខិតខំរៀនសូត្រដើម្បីអនាគតភ្លឺស្វាង។",
              "ប្រទេសកម្ពុជាមានប្រពៃណីចំណាស់ និងស្រស់ស្អាត។",
              "យើងត្រូវចេះជួយយកអាសាគ្នាទៅវិញទៅមកជានិច្ច។",
              "ការអានសៀវភៅច្រើនៗជួយពង្រីកចំណេះដឹង និងគំនិត។",
              "សន្តិភាព និងស្ថិរភាពជាមូលដ្ឋាននៃការអភិវឌ្ឍជាតិ។"
            ],
            "hint": "រក្សាការដកដង្ហើមស្មើ និងវាយដោយភាពជឿជាក់។"
          }
        ]
      },
      {
        "id": "boss",
        "labelKh": "ម្ចាស់ស្ទឹងបុរាណ (River Ruins Guardian)",
        "labelEn": "River Guardian — Modifier & Composition Master",
        "category": "World Boss Mastery",
        "skillCategory": "modifier-mastery",
        "objective": "ប្រឡងជាប់ពិភពទី ២ ដោយបង្ហាញភាពស្ទាត់ជំនាញពេញលេញលើ ប្តូរ ឆ្វេង-ស្តាំ, AltGr និងលំដាប់ស្រៈ Unicode ត្រឹមត្រូវ។",
        "focusKeys": [
          "បច្ចេកទេសទាំងអស់នៃពិភពទី ២"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយពាក្យ និងប្រយោគស្មុគស្មាញដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "unicodeOutputExplained": "ការប្រឡងបញ្ចប់ពិភពទី ២៖ គ្មានការចុច ប្តូរ ខុសដៃ គ្មានការវាយស្រៈមុនព្យញ្ជន។",
        "successCriteria": "ឆ្លងកាត់ទាំង ៣ Wave ដោយជោគជ័យ ដើម្បីដោះសោពិភពទី ៣ (Sky Pagoda)។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w2-boss-s1",
            "kind": "boss",
            "titleKh": "Wave បច្ចេកទេស ប្តូរ (ប្តូរ Precision Wave)",
            "titleEn": "Boss Wave 1 — Opposite-Hand ប្តូរ Precision",
            "mission": "វាយពាក្យ ប្តូរ ឆ្លាស់ដៃយ៉ាងរហ័ស និងត្រឹមត្រូវ។",
            "skill": "Flawless opposite-hand ប្តូរ execution under test conditions.",
            "mechanic": "High-speed word challenges testing pinky modifier accuracy.",
            "targetCount": 12,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ធំធេង",
              "ភ្នំពេញ",
              "ពូកែ",
              "គំនិត",
              "ភាសា",
              "ទូក",
              "ជោគជ័យ",
              "ឡាន",
              "កោះ",
              "ឈើ",
              "អាន",
              "ជំនួយ"
            ],
            "hint": "ឆ្វេងប្រើ Right ប្តូរ, ស្តាំប្រើ Left ប្តូរ ជានិច្ច។"
          },
          {
            "id": "w2-boss-s2",
            "kind": "boss",
            "titleKh": "Wave លំដាប់ស្រៈ និង AltGr (Vowel Sequence & AltGr Wave)",
            "titleEn": "Boss Wave 2 — Vowel Order & AltGr Reduplication",
            "mission": "វាយពាក្យដែលមានស្រៈមើលខាងមុខ និងសញ្ញាលេខទោ ៗ។",
            "skill": "Perfect Unicode sequencing for visual-left vowels and AltGr ៗ usage.",
            "mechanic": "Strict validation against premature vowel input.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ទៅសាលា",
              "រៀនសូត្រ",
              "មើលសៀវភៅ",
              "ក្មេងៗ",
              "ច្រើនៗ",
              "ឆាប់ៗ",
              "កែប្រែ",
              "ចៅហ្វាយ",
              "ឯកសារ",
              "ឱកាស"
            ],
            "hint": "ព្យញ្ជនមកមុនស្រះជានិច្ច។ AltGr + ; សម្រាប់ ៗ។"
          },
          {
            "id": "w2-boss-s3",
            "kind": "boss",
            "titleKh": "Wave ម្ចាស់ស្ទឹងពិតប្រាកដ (River Champion Wave)",
            "titleEn": "Boss Wave 3 — Ultimate River Ruins Trial",
            "mission": "វាយឃ្លាស្មុគស្មាញពេញលេញ ដើម្បីទទួលបានជ័យជម្នះលើពិភពទី ២។",
            "skill": "Mastery of all modifier and composition skills in extended sentences.",
            "mechanic": "Final boss trial securing graduation from World 2.",
            "targetCount": 6,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កូនខ្មែរគ្រប់រូបត្រូវខិតខំរៀនសូត្រភាសាជាតិ។",
              "យើងមានមោទនភាពចំពោះប្រាសាទបុរាណរបស់យើង។",
              "ចំណេះវិជ្ជាជាពន្លឺបំភ្លឺផ្លូវជីវិតឲ្យរុងរឿង។",
              "ការចេះអត់ឱន និងជួយគ្នាបង្កើតសង្គមយ៉ាងកក់ក្តៅ។",
              "យុវជនជាទំពាំងស្នងឫស្សីនៃប្រទេសកម្ពុជា។",
              "សាមគ្គីភាពរវាងប្រជាជននាំមកនូវកម្លាំងមហាសាល។"
            ],
            "hint": "រក្សាការផ្តោតអារម្មណ៍។ ភាពត្រឹមត្រូវនាំមកនូវជោគជ័យ!"
          }
        ]
      }
    ]
  },
  {
    "id": 3,
    "title": "Sky Pagoda",
    "titleKh": "ចេតិយអាកាស",
    "subtitle": "ជើងអក្សរ (្) កម្រងព្យញ្ជន និងសញ្ញាវណ្ណយុត្តិ",
    "theme": "Sky Realm",
    "mainLessonKh": "ចេះចុចជើងអក្សរ ្ + ព្យញ្ជន វាយកម្រងជើង ស្រៈ និងសញ្ញាវណ្ណយុត្តិ",
    "mainLessonEn": "Coeng subscript mechanics (KeyJ), consonant clusters, and diacritics",
    "skillFocus": "Mastery of Coeng key operation and multi-tier Unicode syllable assembly.",
    "unicodeFocus": "Canonical typing order: Base -> Subscript (្+C) -> ប្តូរer -> Vowel -> Diacritic.",
    "levels": [
      {
        "id": 1,
        "labelKh": "រំលឹកព្យាង្គ ព្យញ្ជន និងស្រៈ",
        "labelEn": "Syllable Flow Review",
        "category": "Composition Review",
        "skillCategory": "syllable-review",
        "objective": "រំលឹកការវាយព្យញ្ជន និងតួស្រះទូទៅយ៉ាងស្ទាត់ជំនាញ មុននឹងចូលដល់ការវាយជើងអក្សរស្មុគស្មាញ។",
        "focusKeys": [
          "ព្យញ្ជន និងស្រៈ",
          "កា",
          "គី",
          "ទឹក",
          "សាលា"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយព្យញ្ជនដើមមុនស្រះជានិច្ច ដោយចង្វាក់រលូន។",
        "unicodeOutputExplained": "ការរំលឹកព្យាង្គទោលមុនពេលរៀនជើងអក្សរ។",
        "successCriteria": "វាយព្យាង្គរំលឹកដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 32,
        "stages": [
          {
            "id": "w3-l1-s1",
            "kind": "warmup",
            "titleKh": "រំលឹកព្យាង្គទោល (Single Syllable Refresh)",
            "titleEn": "Single Syllables — Accuracy & Speed Check",
            "mission": "វាយព្យាង្គទោលផ្សំស្រៈផ្សេងៗដោយគ្មានការស្ទាក់ស្ទើរ។",
            "skill": "Fast syllable recognition and keystroke execution.",
            "mechanic": "Rapid single-syllable drills.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កា",
              "គី",
              "ទឹក",
              "ទៅ",
              "មើល",
              "រៀន",
              "កូន",
              "ដី",
              "សួស្តី",
              "ទីណា"
            ],
            "hint": "វាយព្យញ្ជនមុនស្រះជានិច្ច។"
          },
          {
            "id": "w3-l1-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យពីរព្យាង្គទូទៅ (Two-Syllable Words)",
            "titleEn": "Two-Syllable Words — Flow & Rhythm",
            "mission": "វាយពាក្យពីរព្យាង្គដោយរក្សាចង្វាក់វាយអក្សរស្មើ។",
            "skill": "Sustained rhythm across multiple syllable units.",
            "mechanic": "Compound word rhythm drills.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សាលា",
              "កុមារ",
              "ភាសា",
              "គំនិត",
              "ចំណេះ",
              "ជីវិត",
              "ភូមិភាគ",
              "ទិវា",
              "មាតុភូមិ",
              "ការងារ"
            ],
            "hint": "ចងចាំទីតាំងគ្រាប់ចុចដោយមិនបាច់មើលក្តារចុច។"
          },
          {
            "id": "w3-l1-s3",
            "kind": "sentence",
            "titleKh": "ល្បះរំលឹកត្រៀមជើងអក្សរ (Preparation Sentences)",
            "titleEn": "Preparation Sentences — Readiness Verification",
            "mission": "វាយប្រយោគពេញលេញដែលបញ្ជាក់ពីការត្រៀមខ្លួនសម្រាប់ជើងអក្សរ។",
            "skill": "Accurate typing of full clauses with natural Khmer flow.",
            "mechanic": "Sentence evaluation prior to Coeng mechanics.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កុមារីកុមារាខិតខំរៀនសូត្រនៅសាលា។",
              "យើងស្រឡាញ់ភាសាជាតិនិងប្រពៃណីខ្មែរ។",
              "ចំណេះដឹងជាទ្រព្យដែលគ្មានអ្នកណាអាចលួចបាន។",
              "ការតស៊ូព្យាយាមតែងតែនាំមកនូវជោគជ័យ។",
              "សន្តិភាពនាំមកនូវសេចក្តីសុខដល់មនុស្សគ្រប់រូប។"
            ],
            "hint": "រក្សាភាពត្រឹមត្រូវឲ្យលើស ៩២%។"
          }
        ]
      },
      {
        "id": 2,
        "labelKh": "បច្ចេកទេសចុចជើងអក្សរ Coeng (្)",
        "labelEn": "Coeng KeyJ Mechanics",
        "category": "Subscript Foundations",
        "skillCategory": "coeng-mechanics",
        "objective": "រៀនប្រើគ្រាប់ចុច J ដើម្បីចុចសញ្ញាជើងអក្សរ Coeng (្) ដោយយល់ថា ជើងអក្សរ = ចុច J + ព្យញ្ជនដែលត្រូវធ្វើជាជើង។",
        "focusKeys": [
          "KeyJ",
          "្",
          "ក្ក",
          "ខ្ម",
          "ក្ត",
          "ថ្ម",
          "សង្ឃ",
          "ភ្នំ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "right"
        ],
        "recommendedFingers": [
          "index"
        ],
        "homeKeyAnchors": [
          "KeyJ"
        ],
        "unicodeRule": "ដើម្បីវាយជើងអក្សរ៖ វាយព្យញ្ជនដើម -> ចុច J (្) -> វាយព្យញ្ជនដែលជាជើង។ ហាមវាយ ្ តែឯង។",
        "unicodeOutputExplained": "KeyJ = សញ្ញាជើង (្)។ ឧទាហរណ៍ \"ក្ក\" = ក (K) + ្ (J) + ក (K)។",
        "successCriteria": "វាយជើងអក្សរដោយប្រើ KeyJ ត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 26,
        "stages": [
          {
            "id": "w3-l2-s1",
            "kind": "warmup",
            "titleKh": "កាយវិការចុច Coeng ្ (Coeng KeyJ Discovery)",
            "titleEn": "Coeng KeyJ Discovery — Index Finger Strike",
            "mission": "ហាត់ចុច ព្យញ្ជនដើម + J (្) + ព្យញ្ជនជើង (ក្ក, ត្ត, ស្ស)។",
            "skill": "Coeng keystroke operation with right index finger on J.",
            "mechanic": "Subscript trigger recognition and execution.",
            "targetCount": 10,
            "accuracyGoal": 90,
            "practiceMode": "unicode-output",
            "items": [
              "ក្ក",
              "ត្ត",
              "ស្ស",
              "ម្ម",
              "ល្ល",
              "ក្ក",
              "ត្ត",
              "ស្ស",
              "ម្ម",
              "ក្កត្តស្ស"
            ],
            "hint": "ក្ក: ចុច ក (K) -> ចុច ្ (J) -> ចុច ក (K)។ ម្រាមចង្អុលស្តាំលើ J!"
          },
          {
            "id": "w3-l2-s2",
            "kind": "pattern",
            "titleKh": "ជើងអក្សរមូលដ្ឋាន (Basic Subscript Pairs)",
            "titleEn": "Basic Subscript Pairs — ខ្ម, ក្ត, ថ្ម, ភ្ន",
            "mission": "ហាត់វាយព្យាង្គដែលមានជើងអក្សរងាយៗ។",
            "skill": "Combining different consonants with Coeng binder.",
            "mechanic": "Base + Coeng + Subscript consonant sequences.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ខ្ម",
              "ក្ត",
              "ថ្ម",
              "ភ្ន",
              "ស្ង",
              "ក្ប",
              "ឆ្ក",
              "ទ្វ",
              "ច្ប",
              "ស្ន"
            ],
            "hint": "ថ្ម: ថ (F) + ្ (J) + ម (M)។"
          },
          {
            "id": "w3-l2-s3",
            "kind": "word",
            "titleKh": "ពាក្យមានជើងអក្សរដំបូង (First Subscript Words)",
            "titleEn": "First Subscript Words — Real Vocabulary",
            "mission": "វាយពាក្យខ្មែរដែលមានជើងអក្សរ។",
            "skill": "Applying Coeng mechanics in common everyday words.",
            "mechanic": "Full word challenges with simple subscript consonants.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ថ្មពិល",
              "ភ្នំពេញ",
              "សង្ឃឹម",
              "ក្តៅ",
              "ច្បាប់",
              "ឆ្កែ",
              "ទ្វារ",
              "ស្នេហា"
            ],
            "hint": "ភ្នំ: ភ (ប្តូរ+P) + ្ (J) + ន (N) + ំ (ប្តូរ+M)។"
          }
        ]
      },
      {
        "id": 3,
        "labelKh": "ជើងព្យញ្ជនទូទៅ",
        "labelEn": "Common Subscript Consonants",
        "category": "Subscript Foundations",
        "skillCategory": "subscripts",
        "objective": "ហ្វឹកហាត់វាយជើងព្យញ្ជនទូទៅទាំង ៣៣ តួ ដោយចងចាំថា ជើងអក្សរប្រើគ្រាប់ចុចព្យញ្ជនធម្មតា បន្ទាប់ពីចុច J (្)។",
        "focusKeys": [
          "្ក",
          "្ខ",
          "្ង",
          "្ច",
          "្ត",
          "្ន",
          "្ប",
          "្ម",
          "្យ",
          "្រ",
          "្ល",
          "្វ",
          "្ស"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "គ្រប់ព្យញ្ជនទាំងអស់ពេលធ្វើជាជើង ត្រូវចុច J (្) មុន រួចចុចគ្រាប់ចុចនៃព្យញ្ជននោះ។",
        "unicodeOutputExplained": "្ + ក = ្ក, ្ + រ = ្រ, ្ + ល = ្ល, ្ + ម = ្ម, ្ + ញ = ្ញ",
        "successCriteria": "វាយជើងព្យញ្ជនទូទៅដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 28,
        "stages": [
          {
            "id": "w3-l3-s1",
            "kind": "warmup",
            "titleKh": "ជើងអក្សរជួរកណ្តាល និងជួរលើ (Home & Upper Subscripts)",
            "titleEn": "Home & Upper Subscripts — ្ក, ្ល, ្ស, ្រ, ្ត",
            "mission": "ហាត់វាយជើងអក្សរដែលកើតចេញពីគ្រាប់ចុចជួរកណ្តាល និងជួរលើ។",
            "skill": "Fluent execution of common subscripts from familiar rows.",
            "mechanic": "Subscript drills pairing KeyJ with home and top row keys.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ក្រ",
              "ក្ល",
              "ក្ស",
              "ក្ត",
              "ក្ថ",
              "ត្រ",
              "ថ្ល",
              "ស្ទ",
              "ស្ត",
              "ស្ល"
            ],
            "hint": "ក្រ: ក (K) + ្ (J) + រ (R)។ ្រ ស្ថិតនៅខាងក្រោម ក។"
          },
          {
            "id": "w3-l3-s2",
            "kind": "pattern",
            "titleKh": "ជើងអក្សរជួរក្រោម (Lower Row Subscripts ្ម, ្ន, ្ប, ្វ)",
            "titleEn": "Lower Subscripts — ្ម, ្ន, ្ប, ្វ, ្ច",
            "mission": "ហាត់វាយជើងអក្សរដែលកើតចេញពីគ្រាប់ចុចជួរក្រោម (ន, ម, ប, វ, ច)។",
            "skill": "Downward reaches immediately following Coeng trigger on KeyJ.",
            "mechanic": "Coeng to bottom-row reach transitions.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ក្ម",
              "ក្ន",
              "ក្ប",
              "ក្វ",
              "ខ្ម",
              "គ្ន",
              "ស្ម",
              "ស្ន",
              "ស្ប",
              "ស្វ"
            ],
            "hint": "ខ្ម: ខ (X) + ្ (J) + ម (M)។ ស្វ: ស (S) + ្ (J) + វ (V)។"
          },
          {
            "id": "w3-l3-s3",
            "kind": "word",
            "titleKh": "ពាក្យជើងអក្សរទូទៅ (Common Subscript Vocabulary)",
            "titleEn": "Subscript Vocabulary — Practical Words",
            "mission": "វាយពាក្យខ្មែរដែលមានជើងអក្សរទូទៅ។",
            "skill": "Applying various subscript consonants in real vocabulary.",
            "mechanic": "Full word challenges with assorted subscript combinations.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ក្មេងល្អ",
              "ស្វាគមន៍",
              "កណ្តាល",
              "សង្គម",
              "មន្ត្រី",
              "អង្គការ",
              "សេចក្តី",
              "បញ្ហា"
            ],
            "hint": "ស្វាគមន៍: ស + ្ + វ + ា + គ + ម + ន + ៍ (Minus + ប្តូរ)។"
          }
        ]
      },
      {
        "id": 4,
        "labelKh": "ព្យញ្ជនផ្ញើជើង និងកម្រងអក្សរ",
        "labelEn": "Consonant Clusters",
        "category": "Cluster Foundations",
        "skillCategory": "clusters",
        "objective": "រៀនវាយកម្រងព្យញ្ជនផ្ញើជើងញឹកញាប់ក្នុងភាសាខ្មែរ៖ ក្រ, គ្រ, ប្រ, ស្រ, ខ្ល, ឆ្ល, ផ្ល, ស្ទ។",
        "focusKeys": [
          "ក្រ",
          "គ្រ",
          "ប្រ",
          "ស្រ",
          "ខ្ល",
          "ឆ្ល",
          "ផ្ល",
          "ស្ទ",
          "ក្រូច",
          "គ្រូ",
          "ប្រាក់",
          "ស្រុក"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "កម្រងអក្សរផ្ញើជើងត្រូវវាយ ព្យញ្ជនទី ១ -> ្ (J) -> ព្យញ្ជនទី ២ ជានិច្ច។",
        "unicodeOutputExplained": "ក្រ = ក + ្ + រ, គ្រ = គ + ្ + រ, ប្រ = ប + ្ + រ, ស្រ = ស + ្ + រ",
        "successCriteria": "វាយកម្រងព្យញ្ជនផ្ញើជើងដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 28,
        "stages": [
          {
            "id": "w3-l4-s1",
            "kind": "warmup",
            "titleKh": "កម្រងជើង រ (Clusters with Subscript រ: ក្រ, គ្រ, ប្រ, ស្រ)",
            "titleEn": "Subscript Ro Clusters — ក្រ, គ្រ, ប្រ, ស្រ, ត្រ",
            "mission": "ហាត់វាយកម្រងព្យញ្ជនផ្ញើជើង រ (្ + រ) ឲ្យបានរលូន។",
            "skill": "Fluid typing of clusters carrying subscript រ (្ + KeyR).",
            "mechanic": "Repetitive muscle memory drills for subscript Ro combinations.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ក្រ",
              "គ្រ",
              "ប្រ",
              "ស្រ",
              "ត្រ",
              "ទ្រ",
              "ជ្រ",
              "ច្រ",
              "ព្រ",
              "ភ្រ"
            ],
            "hint": "ស្រ: ស (S) + ្ (J) + រ (R)។ ជើង រ វាយ ្ រួចចុច R។"
          },
          {
            "id": "w3-l4-s2",
            "kind": "pattern",
            "titleKh": "កម្រងជើង ល និង វ (Clusters with Subscript ល, វ: ខ្ល, ឆ្ល, ផ្ល, ស្ទ)",
            "titleEn": "Subscript Lo & Vo Clusters — ខ្ល, ឆ្ល, ផ្ល, ស្ទ, ភ្ល",
            "mission": "ហាត់វាយកម្រងព្យញ្ជនផ្ញើជើង ល, វ និង ទទឹង។",
            "skill": "High accuracy on lateral consonant cluster combinations.",
            "mechanic": "Cluster syllable patterns featuring subscript Lo and Vo.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ខ្ល",
              "ឆ្ល",
              "ផ្ល",
              "ភ្ល",
              "ស្ទ",
              "ស្ធ",
              "ក្វ",
              "ខ្វ",
              "ច្វ",
              "ទ្វ"
            ],
            "hint": "ផ្ល: ប (B) + ្ (J) + ល (L)។ ស្ទ: ស (S) + ្ (J) + ទ (ប្តូរ+T)។"
          },
          {
            "id": "w3-l4-s3",
            "kind": "word",
            "titleKh": "ពាក្យកម្រងព្យញ្ជន (Consonant Cluster Words)",
            "titleEn": "Cluster Words — Vocabulary Practice",
            "mission": "វាយពាក្យខ្មែរដែលមានកម្រងព្យញ្ជនផ្ញើជើង។",
            "skill": "Applying cluster touch typing in everyday vocabulary.",
            "mechanic": "Full word challenges with consonant clusters.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ក្រូចថ្លុង",
              "លោកគ្រូ",
              "ប្រាក់ខែ",
              "ស្រុកកំណើត",
              "ខ្លាធំ",
              "ឆ្លើយតប",
              "ផ្លូវជាតិ",
              "ស្ទឹងសែន"
            ],
            "hint": "លោកគ្រូ: ល + ោ + ក + គ + ្ + រ + ូ។"
          }
        ]
      },
      {
        "id": 5,
        "labelKh": "ការបន្ថែមតួស្រះលើកម្រងជើង",
        "labelEn": "Clusters with Dependent Vowels",
        "category": "Cluster Foundations",
        "skillCategory": "clusters-vowels",
        "objective": "រៀនវាយតួស្រះបន្ទាប់ពីកម្រងជើងអក្សរ តាមលំដាប់ Unicode៖ ព្យញ្ជនដើម -> ្ -> ព្យញ្ជនជើង -> ស្រៈ។",
        "focusKeys": [
          "ក្រៅ",
          "ក្រុម",
          "ស្អាត",
          "ខ្មៅ",
          "គ្រូ",
          "ស្រី",
          "ព្រៃ",
          "ត្រី",
          "គ្រួសារ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "តួស្រះត្រូវវាយបន្ទាប់ពីជើងអក្សរជានិច្ច ទោះបីស្រៈនោះមើលទៅនៅខាងមុខក្តី (ដូចជា ក្រៅ = ក + ្ + រ + ៅ)។",
        "unicodeOutputExplained": "លំដាប់: ព្យញ្ជនដើម + ្ + ព្យញ្ជនជើង + ស្រៈ។ ហាមវាយស្រៈនៅចន្លោះជើងអក្សរជាដាច់ខាត។",
        "successCriteria": "វាយកម្រងជើងផ្សំស្រៈដោយលំដាប់ត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 28,
        "stages": [
          {
            "id": "w3-l5-s1",
            "kind": "warmup",
            "titleKh": "កម្រងជើង + ស្រៈលើ-ក្រោម (Clusters + Superscript/Subscript Vowels)",
            "titleEn": "Clusters + Vertical Vowels — គ្រូ, ត្រី, ក្រុម",
            "mission": "ហាត់វាយកម្រងជើងជាមួយស្រៈលើ និងស្រៈក្រោម (ី, ូ, ុ)។",
            "skill": "Multi-layer vertical stacking: Base -> Coeng -> Subscript -> Vowel.",
            "mechanic": "Four-keystroke syllable drills with vertical vowel placement.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "គ្រូ",
              "ត្រី",
              "ស្រី",
              "ព្រៃ",
              "ក្រុម",
              "ស្ទុះ",
              "ភ្លៀង",
              "ផ្លូវ",
              "ឆ្លុះ",
              "ខ្លី"
            ],
            "hint": "ត្រី: ត (T) + ្ (J) + រ (R) + ី (ប្តូរ+I)។ ស្រៈ ី វាយចុងក្រោយ។"
          },
          {
            "id": "w3-l5-s2",
            "kind": "pattern",
            "titleKh": "កម្រងជើង + ស្រៈមុខ-ព័ទ្ធ (Clusters + Visual-Left/Circumfix Vowels)",
            "titleEn": "Clusters + Visual-Left Vowels — ក្រៅ, ខ្មៅ, ស្អាត",
            "mission": "ហាត់វាយកម្រងជើងជាមួយស្រៈមើលខាងមុខ និងព័ទ្ធជុំវិញ (ៅ, ែ, ៀ)។",
            "skill": "Maintaining proper Unicode sequence when visual-left vowels wrap clusters.",
            "mechanic": "Complex syllable construction under strict typing order.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ក្រៅ",
              "ខ្មៅ",
              "ស្អាត",
              "ព្រោះ",
              "ខ្មែរ",
              "ច្រើន",
              "ស្ទើរ",
              "ឆ្លៀត",
              "ក្មេង",
              "ត្រៀម"
            ],
            "hint": "ខ្មែរ: ខ (X) + ្ (J) + ម (M) + ែ (ប្តូរ+E) + រ (R)។ វាយ ខ និង ជើង ម មុន ស្រៈ ែ!"
          },
          {
            "id": "w3-l5-s3",
            "kind": "word",
            "titleKh": "ពាក្យកម្រងជើងផ្សំស្រៈ (Complete Cluster Vocabulary)",
            "titleEn": "Cluster Vocabulary — Everyday Khmer Words",
            "mission": "វាយពាក្យខ្មែរដែលមានកម្រងជើង និងស្រៈចម្រុះ។",
            "skill": "Fluent typing of multi-component Khmer vocabulary.",
            "mechanic": "Full word challenges featuring complex syllables.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ភាសាខ្មែរ",
              "គ្រួសាររីករាយ",
              "ព្រៃឈើខៀវស្រងាត់",
              "ត្រីខកំប៉ុង",
              "ស្អាតបាត",
              "ក្រុមការងារ",
              "ផ្លូវស្អាត",
              "ត្រៀមខ្លួន"
            ],
            "hint": "ភាសាខ្មែរ: ភ + ា + ស + ា + [ដកឃ្លា] + ខ + ្ + ម + ែ + រ។"
          }
        ]
      },
      {
        "id": 6,
        "labelKh": "សញ្ញាវណ្ណយុត្តិខ្មែរ",
        "labelEn": "Khmer Diacritics",
        "category": "Diacritic Foundations",
        "skillCategory": "diacritics",
        "objective": "រៀនវាយសញ្ញាវណ្ណយុត្តិខ្មែរសំខាន់ៗ៖ បន្តក់ ់ (Quote), សំយោគសញ្ញា ័ (AltGr+Quote), រះមុខ ះ (ប្តូរ+H), និគ្គហិត ំ (ប្តូរ+M)។",
        "focusKeys": [
          "់",
          "័",
          "ះ",
          "ំ",
          "ៈ",
          "កត់",
          "ចប់",
          "វ័យ",
          "ជ័យ",
          "ចេះ",
          "ផ្ទះ",
          "ធំ"
        ],
        "introducedKeyCodes": [
          "Quote"
        ],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "index"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "សញ្ញាវណ្ណយុត្តិ ត្រូវវាយនៅចុងបញ្ចប់នៃព្យាង្គ បន្ទាប់ពីព្យញ្ជន ឬស្រៈ។",
        "unicodeOutputExplained": "Quote = ់ (បន្តក់), AltGr+Quote = ័ (សំយោគសញ្ញា), ប្តូរ+H = ះ (រះមុខ), ប្តូរ+M = ំ (និគ្គហិត)",
        "successCriteria": "វាយសញ្ញាវណ្ណយុត្តិខ្មែរដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 28,
        "stages": [
          {
            "id": "w3-l6-s1",
            "kind": "warmup",
            "titleKh": "បន្តក់ និងសំយោគសញ្ញា (Bantoc ់ & Samyok Sanya ័)",
            "titleEn": "Diacritic Drills — Quote Key (់) & AltGr+Quote (័)",
            "mission": "ហាត់ចុចសញ្ញាបន្តក់ ់ (Quote) និងសំយោគសញ្ញា ័ (AltGr + Quote)។",
            "skill": "Precise pinky actuation on Quote key for Khmer diacritics.",
            "mechanic": "Diacritic keystroke discovery and syllable application.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កត់",
              "ចប់",
              "ចាប់",
              "ដាក់",
              "កាត់",
              "វ័យ",
              "ជ័យ",
              "ន័យ",
              "ភ័យ",
              "សព្វ"
            ],
            "hint": "កត់: ក (K) + ់ (Quote) + ត (T)។ ជ័យ: ជ (ប្តូរ+C) + ័ (AltGr+Quote) + យ (Y)។"
          },
          {
            "id": "w3-l6-s2",
            "kind": "pattern",
            "titleKh": "រះមុខ និងនិគ្គហិត (Reahmuk ះ & Nikahit ំ)",
            "titleEn": "Diacritic Patterns — Reahmuk (ះ) & Nikahit (ំ)",
            "mission": "ហាត់វាយសញ្ញារះមុខ ះ (ប្តូរ+H) និងនិគ្គហិត ំ (ប្តូរ+M)។",
            "skill": "Applying terminal diacritics with ប្តូរ coordination.",
            "mechanic": "Syllables concluding with diacritical vowel marks.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ចេះ",
              "ទះ",
              "ផ្ទះ",
              "ជួបជុំ",
              "ធំ",
              "ដាំ",
              "ចំ",
              "កំលាំង",
              "ក្រុម",
              "កាល"
            ],
            "hint": "ចេះ: ច (C) + េ (E) + ះ (ប្តូរ+H)។ ធំ: ធ (ប្តូរ+F) + ំ (ប្តូរ+M)។"
          },
          {
            "id": "w3-l6-s3",
            "kind": "word",
            "titleKh": "ពាក្យសញ្ញាវណ្ណយុត្តិ (Diacritic Vocabulary)",
            "titleEn": "Diacritic Words — Everyday Vocabulary",
            "mission": "វាយពាក្យខ្មែរដែលមានសញ្ញាវណ្ណយុត្តិចម្រុះ។",
            "skill": "Accurate vocabulary typing requiring terminal diacritics.",
            "mechanic": "Full word challenges with assorted diacritic marks.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ជ័យជំនះ",
              "ផ្ទះសំបែង",
              "ចាប់ផ្តើម",
              "កត់ត្រា",
              "វ័យក្មេង",
              "ធំធាត់",
              "ជួបជុំគ្នា",
              "កាលវេលា"
            ],
            "hint": "ជ័យជំនះ: ជ័យ + ជំនះ។ ពិនិត្យមើលសញ្ញា ័, ំ និង ះ។"
          }
        ]
      },
      {
        "id": 7,
        "labelKh": "លំដាប់ Unicode ពេញលេញ",
        "labelEn": "Full Khmer Syllable Order",
        "category": "Advanced Composition",
        "skillCategory": "full-unicode-order",
        "objective": "អនុវត្តលំដាប់វាយ Unicode ពេញលេញតាមក្បួនខ្នាតអក្សរសាស្ត្រខ្មែរ៖ ព្យញ្ជនដើម + ជើងអក្សរ + សញ្ញាប្តូរសំឡេង + ស្រៈ + សញ្ញាវណ្ណយុត្តិ។",
        "focusKeys": [
          "លំដាប់ពេញលេញ",
          "ខ្មែរ",
          "កម្ពុជា",
          "សិស្ស",
          "រៀនសូត្រ",
          "មិត្តភក្តិ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "លំដាប់ពេញលេញ: ១.ព្យញ្ជនដើម -> ២.ជើងអក្សរ (្ + ព្យញ្ជន) -> ៣.ស្រៈ -> ៤.សញ្ញាវណ្ណយុត្តិ។",
        "unicodeOutputExplained": "ក្បួនខ្នាតអក្ខរាវិរុទ្ធយូនីកូដខ្មែរ៖ គ្មានការរំលង ឬវាយច្របូកច្របល់លំដាប់ឡើយ។",
        "successCriteria": "វាយព្យាង្គ និងពាក្យស្មុគស្មាញតាមលំដាប់ត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 30,
        "stages": [
          {
            "id": "w3-l7-s1",
            "kind": "warmup",
            "titleKh": "លំដាប់ ៤ ជាន់ (Four-Tier Syllables)",
            "titleEn": "Four-Tier Syllables — Base + Coeng + Vowel + Mark",
            "mission": "ហាត់វាយព្យាង្គដែលមានធាតុផ្សំ ៤ ជាន់តាមលំដាប់តឹងរ៉ឹង។",
            "skill": "Execution of complete multi-tier syllable sequences.",
            "mechanic": "Strict step-by-step keystroke sequence validation.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ខ្មែរ",
              "កម្ពុ",
              "សិស្ស",
              "ក្តៅ",
              "ព្រោះ",
              "ស្លាប់",
              "ឆ្លើយ",
              "ភ្ញៀវ",
              "ធ្លាក់",
              "ខ្លាំង"
            ],
            "hint": "សិស្ស: ស + ិ + ្ + ស។ ខ្មែរ: ខ + ្ + ម + ែ + រ។"
          },
          {
            "id": "w3-l7-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យស្មុគស្មាញពេញលេញ (Full Complex Words)",
            "titleEn": "Complex Words — Canonical Unicode Structure",
            "mission": "វាយពាក្យខ្មែរដែលមានលំដាប់យូនីកូដពេញលេញ។",
            "skill": "Maintaining canonical sequence across compound multi-part words.",
            "mechanic": "Advanced word challenges testing structural Unicode rigor.",
            "targetCount": 8,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កម្ពុជា",
              "រៀនសូត្រ",
              "សេចក្តីសុខ",
              "មិត្តភក្តិ",
              "សិស្សានុសិស្ស",
              "ប្រវត្តិសាស្ត្រ",
              "ប្រពៃណីខ្មែរ",
              "កេរដំណែល"
            ],
            "hint": "មិត្តភក្តិ: ម + ិ + ្ + ត + [ដកឃ្លា] + ភ + ក + ្ + ត + ិ។"
          },
          {
            "id": "w3-l7-s3",
            "kind": "sentence",
            "titleKh": "ល្បះយូនីកូដពេញលេញ (Canonical Unicode Sentences)",
            "titleEn": "Canonical Sentences — Multi-Tier Text Flow",
            "mission": "វាយប្រយោគពេញលេញដែលបង្ហាញពីការយល់ដឹងច្បាស់លាស់អំពីលំដាប់យូនីកូដ។",
            "skill": "Fluent typing of authentic Khmer sentences with complex orthography.",
            "mechanic": "Full sentence flow checking readiness for practical vocabulary.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "កម្ពុជាជាទឹកដីនៃប្រាសាទបុរាណនិងប្រពៃណីយ៉ាងរុងរឿង។",
              "សិស្សានុសិស្សគ្រប់រូបត្រូវខិតខំរៀនសូត្រដើម្បីអនាគត។",
              "យើងជាកូនខ្មែរត្រូវចេះស្រឡាញ់និងថែរក្សាភាសាជាតិ។",
              "មិត្តភក្តិល្អតែងតែជួយយកអាសាគ្នាក្នុងគ្រាលំបាក។",
              "ការចេះដឹងផ្នែកបច្ចេកវិទ្យាជួយអភិវឌ្ឍប្រទេសជាតិឲ្យជឿនលឿន។"
            ],
            "hint": "វាយមួយៗដោយភាពម៉ត់ចត់។ ភាពត្រឹមត្រូវជាចម្បង!"
          }
        ]
      },
      {
        "id": 8,
        "labelKh": "ពាក្យ និងឃ្លាស្មុគស្មាញ",
        "labelEn": "Complex Words & Phrases",
        "category": "Advanced Composition",
        "skillCategory": "complex-composition",
        "objective": "អនុវត្តការវាយពាក្យ និងឃ្លាស្មុគស្មាញដែលមានជើងអក្សរ ស្រៈ និងសញ្ញាចម្រុះយ៉ាងស្ទាត់ជំនាញ។",
        "focusKeys": [
          "ចម្រុះជើង និងសញ្ញា",
          "សាលារៀន",
          "គ្រូបង្រៀន",
          "ប្រទេសជាតិ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "សំយោគគ្រប់ជំនាញនៃពិភពទី ៣ ក្នុងការវាយអត្ថបទខ្មែរពិតប្រាកដ។",
        "unicodeOutputExplained": "ការបញ្ចប់ពិភពទី ៣ ដោយភាពស្ទាត់ជំនាញលើរាល់បន្សំយូនីកូដ។",
        "successCriteria": "វាយពាក្យ និងឃ្លាស្មុគស្មាញដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 32,
        "stages": [
          {
            "id": "w3-l8-s1",
            "kind": "warmup",
            "titleKh": "លំហាត់កម្តៅសាច់ដុំស្មុគស្មាញ (Complex Warmup)",
            "titleEn": "Complex Warmup — Rapid Cluster & Diacritic Drills",
            "mission": "វាយពាក្យស្មុគស្មាញយ៉ាងលឿន និងត្រឹមត្រូវ។",
            "skill": "Rapid recall of complex typing sequences under warm-up conditions.",
            "mechanic": "Fast-paced multi-syllable word challenges.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សាលារៀន",
              "គ្រូបង្រៀន",
              "សិស្សល្អ",
              "ប្រទេសជាតិ",
              "ប្រពៃណី",
              "ប្រវត្តិ",
              "កិត្តិយស",
              "វិញ្ញាសា",
              "សន្តិភាព",
              "អភិវឌ្ឍ"
            ],
            "hint": "ផ្តោតលើភាពត្រឹមត្រូវ។ ម្រាមដៃវិលមកទីតាំងដើមជានិច្ច។"
          },
          {
            "id": "w3-l8-s2",
            "kind": "pattern",
            "titleKh": "ឃ្លាផ្សំជើងអក្សរច្រើន (Multi-Subscript Phrases)",
            "titleEn": "Multi-Subscript Phrases — Extended Clauses",
            "mission": "វាយឃ្លាដែលមានជើងអក្សរច្រើនបន្តបន្ទាប់គ្នា។",
            "skill": "High sustained accuracy across continuous subscript-dense phrases.",
            "mechanic": "Phrase challenges demanding continuous Coeng execution.",
            "targetCount": 6,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ការសិក្សាស្រាវជ្រាវវិទ្យាសាស្ត្រ",
              "ប្រពៃណីនិងប្រពៃណីខ្មែរល្អផូរផង់",
              "សិស្សានុសិស្សខិតខំប្រឹងប្រែង",
              "ប្រទេសជាតិមានការអភិវឌ្ឍរីកចម្រើន",
              "មិត្តភក្តិជួយគ្នាទៅវិញទៅមក",
              "សាមគ្គីភាពរឹងមាំនាំមកជោគជ័យ"
            ],
            "hint": "វាយមួយៗដោយភាពស្ងប់ស្ងាត់។"
          },
          {
            "id": "w3-l8-s3",
            "kind": "sentence",
            "titleKh": "ល្បះស្មុគស្មាញពេញលេញ (Full Complex Sentences)",
            "titleEn": "Complex Sentences — Complete Flow Demonstration",
            "mission": "វាយប្រយោគពេញលេញដែលមានកម្រងជើង និងសញ្ញាគ្រប់ប្រភេទ។",
            "skill": "Synthesis of all World 3 skills into authentic, fluent typing.",
            "mechanic": "Graduation trial before confronting the Sky Guardian.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ការអប់រំនិងការស្រាវជ្រាវជាមូលដ្ឋានគ្រឹះនៃការអភិវឌ្ឍធនធានមនុស្ស។",
              "ប្រាសាទអង្គរវត្តជាសម្បត្តិបេតិកភណ្ឌពិភពលោកល្បីល្បាញរបស់ខ្មែរ។",
              "យើងត្រូវចេះរួបរួមសាមគ្គីគ្នាដើម្បីកសាងប្រទេសជាតិឲ្យសម្បូរសប្បាយ។",
              "ការរៀនវាយអក្សរខ្មែរតាមកុំព្យូទ័រជួយសម្រួលដល់ការងារនិងការសិក្សា។",
              "សេចក្តីព្យាយាមគង់បានសម្រេចនូវរាល់បំណងប្រាថ្នាដែលយើងប៉ង។"
            ],
            "hint": "សង្កេតពាក្យ -> វាយតាមលំដាប់ -> បញ្ចប់ដោយសញ្ញាខណ្ឌ ។។"
          }
        ]
      },
      {
        "id": "boss",
        "labelKh": "អ្នកការពារចេតិយ (Sky Stupa Guardian)",
        "labelEn": "Sky Stupa Guardian — Complex Composition Master",
        "category": "World Boss Mastery",
        "skillCategory": "cluster-mastery",
        "objective": "ប្រឡងជាប់ពិភពទី ៣ ដោយបង្ហាញភាពស្ទាត់ជំនាញលើ Coeng (KeyJ), ជើងអក្សរគ្រប់ប្រភេទ, កម្រងព្យញ្ជន, ស្រៈ និងសញ្ញាវណ្ណយុត្តិ។",
        "focusKeys": [
          "បច្ចេកទេសទាំងអស់នៃពិភពទី ៣"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយពាក្យ និងប្រយោគស្មុគស្មាញបំផុតដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "unicodeOutputExplained": "ការប្រឡងបញ្ចប់ពិភពទី ៣៖ គ្មានកំហុសលំដាប់យូនីកូដ គ្មានកំហុសជើងអក្សរ។",
        "successCriteria": "ឆ្លងកាត់ទាំង ៣ Wave ដោយជោគជ័យ ដើម្បីដោះសោពិភពទី ៤ (Golden Library)។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w3-boss-s1",
            "kind": "boss",
            "titleKh": "Wave ជើងអក្សរ និងកម្រងព្យញ្ជន (Subscript & Cluster Wave)",
            "titleEn": "Boss Wave 1 — Subscript & Cluster Precision",
            "mission": "វាយពាក្យកម្រងជើងអក្សរយ៉ាងរហ័ស និងត្រឹមត្រូវ។",
            "skill": "Rapid, error-free subscript and cluster typing.",
            "mechanic": "Fast-paced word wave requiring sharp Coeng reflexes.",
            "targetCount": 12,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ខ្មែរ",
              "កម្ពុជា",
              "សិស្ស",
              "គ្រូ",
              "ត្រី",
              "ស្រុក",
              "ខ្លា",
              "ឆ្លើយ",
              "ផ្លូវ",
              "ស្ទឹង",
              "ភ្នំ",
              "ថ្ម"
            ],
            "hint": "កុំភ្លេច: ជើងអក្សរត្រូវចុច J មុនព្យញ្ជនជើងជានិច្ច។"
          },
          {
            "id": "w3-boss-s2",
            "kind": "boss",
            "titleKh": "Wave លំដាប់ Unicode និងសញ្ញាវណ្ណយុត្តិ (Unicode Order & Diacritic Wave)",
            "titleEn": "Boss Wave 2 — Canonical Sequence & Diacritic Accuracy",
            "mission": "វាយពាក្យដែលមានទាំងជើង ស្រៈ និងសញ្ញាវណ្ណយុត្តិចម្រុះ។",
            "skill": "Flawless multi-tier sequence execution under challenge pressure.",
            "mechanic": "Advanced word challenges testing structural precision.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សេចក្តីសុខ",
              "មិត្តភក្តិ",
              "ជ័យជំនះ",
              "ចាប់ផ្តើម",
              "កត់ត្រា",
              "វ័យក្មេង",
              "ស្អាតបាត",
              "ច្រើនៗ",
              "ក្មេងៗ",
              "ជួបជុំ"
            ],
            "hint": "ព្យញ្ជន -> ជើង -> ស្រៈ -> សញ្ញា។ វាយមួយៗឲ្យច្បាស់!"
          },
          {
            "id": "w3-boss-s3",
            "kind": "boss",
            "titleKh": "Wave ម្ចាស់ចេតិយអាកាស (Sky Stupa Champion Wave)",
            "titleEn": "Boss Wave 3 — Ultimate Sky Pagoda Trial",
            "mission": "វាយប្រយោគស្មុគស្មាញពេញលេញ ដើម្បីទទួលបានជ័យជម្នះលើពិភពទី ៣។",
            "skill": "Complete mastery of multi-syllable, multi-tier Khmer Unicode text.",
            "mechanic": "Final boss trial securing graduation from World 3.",
            "targetCount": 6,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ភាសាខ្មែរជាព្រលឹងនៃជាតិខ្មែរដែលយើងត្រូវរួមគ្នាថែរក្សា។",
              "ការរៀនសូត្រដោយយកចិត្តទុកដាក់តែងតែនាំមកនូវលទ្ធផលល្អប្រសើរ។",
              "ប្រទេសកម្ពុជាមានប្រវត្តិសាស្ត្រនិងប្រពៃណីសម្បូរបែបគួរជាទីមោទនភាព។",
              "សិស្សានុសិស្សគប្បីខិតខំអានសៀវភៅដើម្បីពង្រីកចំណេះដឹងទូទៅ។",
              "សាមគ្គីភាពនិងការយោគយល់គ្នាជាកម្លាំងយ៉ាងរឹងមាំសម្រាប់សង្គមជាតិ។",
              "ចំណេះវិជ្ជាបច្ចេកវិទ្យានឹងជួយកសាងអនាគតយ៉ាងរុងរឿងដល់យុវជនខ្មែរ។"
            ],
            "hint": "រក្សាការផ្តោតអារម្មណ៍ខ្ពស់។ អ្នកត្រៀមខ្លួនសម្រាប់ពិភពទី ៤ ហើយ!"
          }
        ]
      }
    ]
  },
  {
    "id": 4,
    "title": "Golden Library",
    "titleKh": "បណ្ណាល័យមាស",
    "subtitle": "ពាក្យប្រចាំថ្ងៃ ជីវិតសាលារៀន និងប្រយោគមានន័យ",
    "theme": "Scholarly Archive",
    "mainLessonKh": "រៀនវាយពាក្យសាលារៀន គ្រួសារ សកម្មភាពប្រចាំថ្ងៃ និងសញ្ញាវណ្ណយុត្តិ",
    "mainLessonEn": "Practical vocabulary, school life, daily communication, and punctuation",
    "skillFocus": "Applying touch typing to authentic school, family, and communication texts.",
    "unicodeFocus": "Spacing between phrases, punctuation marks (Khan ។, Bariyoosan ៕), and fluency.",
    "levels": [
      {
        "id": 1,
        "labelKh": "ពាក្យប្រចាំថ្ងៃងាយៗ",
        "labelEn": "Daily Familiar Vocabulary",
        "category": "Practical Typing",
        "skillCategory": "practical-vocabulary",
        "objective": "អនុវត្តការវាយពាក្យសាមញ្ញប្រចាំថ្ងៃក្នុងផ្ទះ ធម្មជាតិ និងជីវភាពរស់នៅ។",
        "focusKeys": [
          "ទឹក",
          "បាយ",
          "ផ្ទះ",
          "ផ្លូវ",
          "ដើមឈើ",
          "សួនច្បារ",
          "ខ្យល់",
          "ពន្លឺ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយដោយរក្សាភាពត្រឹមត្រូវខ្ពស់ និងប្រើដកឃ្លា (Spacebar) រវាងពាក្យ ឬឃ្លា។",
        "unicodeOutputExplained": "ពាក្យទូទៅក្នុងជីវភាពប្រចាំថ្ងៃ។ Spacebar បង្កើតចន្លោះឃ្លា។",
        "successCriteria": "វាយពាក្យប្រចាំថ្ងៃដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 32,
        "stages": [
          {
            "id": "w4-l1-s1",
            "kind": "warmup",
            "titleKh": "ពាក្យជីវភាពទូទៅ (Daily Life Words)",
            "titleEn": "Daily Life Words — Water, Food, Nature",
            "mission": "វាយពាក្យងាយៗទាក់ទងនឹងទឹក បាយ ផ្ទះ ផ្លូវ។",
            "skill": "Fluency on high-frequency everyday Khmer words.",
            "mechanic": "Rapid single-word typing drills.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ទឹក",
              "បាយ",
              "ផ្ទះ",
              "ផ្លូវ",
              "ខ្យល់",
              "ពន្លឺ",
              "ព្រះអាទិត្យ",
              "មេឃ",
              "ដី",
              "ភ្លៀង"
            ],
            "hint": "រក្សាម្រាមដៃលើទីតាំងជួរកណ្តាល ពេលវាយចប់ពាក្យនីមួយៗ។"
          },
          {
            "id": "w4-l1-s2",
            "kind": "pattern",
            "titleKh": "គូពាក្យផ្សំធម្មជាតិ (Nature Word Pairs)",
            "titleEn": "Nature Pairs — Compound Vocabulary",
            "mission": "វាយពាក្យផ្សំធម្មជាតិពីរព្យាង្គឡើងទៅ។",
            "skill": "Smooth transition between compound words.",
            "mechanic": "Compound word pairing practice.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ដើមឈើ",
              "សួនច្បារ",
              "ទឹកភ្លៀង",
              "ពន្លឺថ្ងៃ",
              "មេឃស្រឡះ",
              "ខ្យល់ត្រជាក់",
              "ផ្លូវជាតិ",
              "ផ្ទះស្អាត",
              "ដីស្រែ",
              "ទន្លេធំ"
            ],
            "hint": "ដើមឈើ: ដើម + ឈើ។ វាយដោយចង្វាក់ស្មើ។"
          },
          {
            "id": "w4-l1-s3",
            "kind": "sentence",
            "titleKh": "ល្បះប្រចាំថ្ងៃ (Daily Sentences)",
            "titleEn": "Daily Sentences — Natural Expression",
            "mission": "វាយល្បះខ្លីៗអំពីធម្មជាតិ និងការរស់នៅ។",
            "skill": "Typing natural descriptive sentences concluding with Khan (។).",
            "mechanic": "Full sentence flow with proper spacing.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ពន្លឺព្រះអាទិត្យរះបំភ្លឺផែនដីនៅពេលព្រឹក។",
              "យើងទាំងអស់គ្នាត្រូវការទឹកស្អាតសម្រាប់បរិភោគ។",
              "ដើមឈើផ្តល់នូវម្លប់ត្រជាក់និងខ្យល់បរិសុទ្ធ។",
              "សួនច្បារមុខផ្ទះមានផ្កាចម្រុះសម្បុរស្រស់ស្អាត។",
              "ផ្លូវទៅកាន់ភូមិមានភាពស្ងប់ស្ងាត់និងស្រស់បំព្រង។"
            ],
            "hint": "ចុច Spacebar ពេលដកឃ្លា និងចុច Period (.) ដើម្បីដាក់សញ្ញាខណ្ឌ ។។"
          }
        ]
      },
      {
        "id": 2,
        "labelKh": "ពាក្យគ្រួសារ និងគេហដ្ឋាន",
        "labelEn": "Family & Home Vocabulary",
        "category": "Practical Typing",
        "skillCategory": "practical-vocabulary",
        "objective": "អនុវត្តការវាយពាក្យដែលទាក់ទងនឹងសមាជិកគ្រួសារ និងការរស់នៅក្នុងផ្ទះ។",
        "focusKeys": [
          "ឪពុក",
          "ម្តាយ",
          "បង",
          "ប្អូន",
          "ជីដូន",
          "ជីតា",
          "គ្រួសារ",
          "ផ្ទះសម្បែង"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "ឪពុក ប្រើស្រៈពេញតួ ឪ (BracketRight)។ ម្តាយ ប្រើ ម + ្ + ត + ា + យ។",
        "unicodeOutputExplained": "BracketRight = ឪ (ស្រៈពេញតួ ឪពុក)។ ម្តាយ = ម + ្ + ត + ា + យ។",
        "successCriteria": "វាយពាក្យគ្រួសារ និងគេហដ្ឋានដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 32,
        "stages": [
          {
            "id": "w4-l2-s1",
            "kind": "warmup",
            "titleKh": "សមាជិកគ្រួសារ (Family Members)",
            "titleEn": "Family Members — Father, Mother, Siblings",
            "mission": "វាយពាក្យសំដៅលើសមាជិកគ្រួសារ។",
            "skill": "Accurate typing of family vocabulary including independent vowel ឪ.",
            "mechanic": "Targeted family noun keystroke execution.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ឪពុក",
              "ម្តាយ",
              "បងប្រុស",
              "បងស្រី",
              "ប្អូនប្រុស",
              "ប្អូនស្រី",
              "ជីដូន",
              "ជីតា",
              "កូនក្មួយ",
              "គ្រួសារ"
            ],
            "hint": "ឪ: ចុច BracketRight (]) ដោយកូនដៃស្តាំ។"
          },
          {
            "id": "w4-l2-s2",
            "kind": "pattern",
            "titleKh": "គេហដ្ឋាន និងសម្ភារក្នុងផ្ទះ (Home & Furnishings)",
            "titleEn": "Home & Household Objects",
            "mission": "វាយពាក្យទាក់ទងនឹងផ្ទះសម្បែង និងរបស់របរប្រើប្រាស់។",
            "skill": "Household vocabulary typing with varied cluster combinations.",
            "mechanic": "Compound word drills around domestic life.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ផ្ទះសម្បែង",
              "បន្ទប់គេង",
              "ផ្ទះបាយ",
              "តុបាយ",
              "កៅអី",
              "ទ្វារបង្អួច",
              "ចានកែវ",
              "សម្លៀកបំពាក់",
              "គ្រែដេក",
              "ចង្ក្រាន"
            ],
            "hint": "ផ្ទះសម្បែង: ផ្ទះ + សម្បែង (ស + ម + ្ + ប + ែ + ង)។"
          },
          {
            "id": "w4-l2-s3",
            "kind": "sentence",
            "titleKh": "ល្បះអំពីគ្រួសារ (Family Sentences)",
            "titleEn": "Family Sentences — Warmth & Respect",
            "mission": "វាយប្រយោគពេញលេញអំពីសេចក្តីស្រឡាញ់ក្នុងគ្រួសារ។",
            "skill": "Typing extended clauses celebrating family and home.",
            "mechanic": "Multi-word sentences with authentic Khmer phrasing.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ឪពុកម្តាយតែងតែមើលថែរក្សាកូនៗដោយក្តីស្រឡាញ់។",
              "យើងត្រូវចេះគោរពនិងដឹងគុណចំពោះលោកទាំងពីរ។",
              "បងប្អូនត្រូវចេះស្រឡាញ់យោគយល់និងជួយទុក្ខលំបាកគ្នា។",
              "គ្រួសារដែលមានសុភមង្គលនាំមកនូវភាពកក់ក្តៅដល់ចិត្ត។",
              "នៅពេលល្ងាចគ្រួសារយើងជួបជុំគ្នាហូបបាយយ៉ាងរីករាយ។"
            ],
            "hint": "កូនៗ: កូន + AltGr + Semicolon (ៗ)។"
          }
        ]
      },
      {
        "id": 3,
        "labelKh": "ពាក្យសាលារៀន និងថ្នាក់រៀន",
        "labelEn": "School & Classroom Vocabulary",
        "category": "Practical Typing",
        "skillCategory": "practical-vocabulary",
        "objective": "អនុវត្តការវាយពាក្យទាក់ទងនឹងសាលារៀន ថ្នាក់រៀន គ្រូ និងសិស្សានុសិស្ស។",
        "focusKeys": [
          "សាលា",
          "គ្រូ",
          "សិស្ស",
          "តុ",
          "កៅអី",
          "ក្តារខៀន",
          "ថ្នាក់រៀន",
          "មេរៀន"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយពាក្យទាក់ទងនឹងការអប់រំដោយរក្សាភាពត្រឹមត្រូវនៃជើងអក្សរ និងស្រៈ។",
        "unicodeOutputExplained": "ពាក្យគន្លឹះក្នុងជីវិតសិក្សា។",
        "successCriteria": "វាយពាក្យសាលារៀនដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w4-l3-s1",
            "kind": "warmup",
            "titleKh": "បរិវេណសាលា (School Environment)",
            "titleEn": "School Environment — School, Teacher, Student",
            "mission": "វាយពាក្យសំខាន់ៗក្នុងសាលារៀន។",
            "skill": "Fluency on educational vocabulary.",
            "mechanic": "School noun typing drills.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សាលារៀន",
              "លោកគ្រូ",
              "អ្នកគ្រូ",
              "សិស្សានុសិស្ស",
              "ថ្នាក់រៀន",
              "ទីលាន",
              "បណ្ណាល័យ",
              "ទង់ជាតិ",
              "ការិយាល័យ",
              "បន្ទប់ពិសោធន៍"
            ],
            "hint": "សិស្សានុសិស្ស: សិស្ស + ានុ + សិស្ស។"
          },
          {
            "id": "w4-l3-s2",
            "kind": "pattern",
            "titleKh": "ឧបករណ៍ក្នុងថ្នាក់រៀន (Classroom Equipment)",
            "titleEn": "Classroom Equipment — Desks, Boards, Books",
            "mission": "វាយឈ្មោះសម្ភារ និងឧបករណ៍ក្នុងថ្នាក់។",
            "skill": "Precision on technical and classroom terminology.",
            "mechanic": "Compound noun typing challenges.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ក្តារខៀន",
              "តុគ្រូ",
              "តុសិស្ស",
              "កៅអីអង្គុយ",
              "ផែនទីពិភពលោក",
              "កណ្តឹងសាលា",
              "ធុងសំរាម",
              "កាលវិភាគ",
              "បញ្ជីវត្តមាន",
              "សៀវភៅគោល"
            ],
            "hint": "ក្តារខៀន: ក + ្ + ត + ា + រ + [ដកឃ្លា] + ខ + ៀ + ន។"
          },
          {
            "id": "w4-l3-s3",
            "kind": "sentence",
            "titleKh": "ល្បះជីវិតសាលារៀន (School Life Sentences)",
            "titleEn": "School Life Sentences — Study & Discipline",
            "mission": "វាយប្រយោគពេញលេញអំពីការរៀនសូត្រក្នុងថ្នាក់។",
            "skill": "Typing realistic school sentences with proper pacing.",
            "mechanic": "Full sentence flow checking educational terminology.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សិស្សានុសិស្សមកដល់សាលារៀនមុនម៉ោងគោរពទង់ជាតិ។",
              "លោកគ្រូអ្នកគ្រូបង្រៀនមេរៀនដោយយកចិត្តទុកដាក់បំផុត។",
              "យើងត្រូវរក្សាភាពស្ងប់ស្ងាត់និងស្តាប់ការពន្យល់ក្នុងថ្នាក់។",
              "បណ្ណាល័យសាលាជាកន្លែងផ្ទុកឯកសារនិងសៀវភៅមានតម្លៃ។",
              "ការគោរពវិន័យសាលានាំមកនូវសណ្តាប់ធ្នាប់និងកិត្តិយស។"
            ],
            "hint": "វាយមួយៗដោយភាពម៉ត់ចត់។"
          }
        ]
      },
      {
        "id": 4,
        "labelKh": "មុខវិជ្ជា និងសម្ភារសិក្សា",
        "labelEn": "Subjects & School Supplies",
        "category": "Practical Typing",
        "skillCategory": "practical-vocabulary",
        "objective": "អនុវត្តការវាយឈ្មោះមុខវិជ្ជា និងសម្ភារសិក្សាដែលសិស្សប្រើប្រាស់ជារៀងរាល់ថ្ងៃ។",
        "focusKeys": [
          "សៀវភៅ",
          "ប៊ិក",
          "ខ្មៅដៃ",
          "ភាសាខ្មែរ",
          "គណិតវិទ្យា",
          "វិទ្យាសាស្ត្រ",
          "ប្រវត្តិវិទ្យា"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "គណិតវិទ្យា: គ + ណ + ិ + ត + [ដកឃ្លា] + វ + ិ + ទ + ្ + យ + ា។ ជើង យ វាយ ្ + Y។",
        "unicodeOutputExplained": "្ + Y = ្យ (ជើង យ) ក្នុងពាក្យ វិទ្យា។",
        "successCriteria": "វាយឈ្មោះមុខវិជ្ជា និងសម្ភារសិក្សាដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w4-l4-s1",
            "kind": "warmup",
            "titleKh": "សម្ភារសិក្សាផ្ទាល់ខ្លួន (School Supplies)",
            "titleEn": "School Supplies — Pen, Pencil, Ruler, Bag",
            "mission": "វាយឈ្មោះសម្ភារសិក្សាដែលដាក់ក្នុងកាតាប។",
            "skill": "Fast typing of common student supply terms.",
            "mechanic": "Vocabulary drills on stationery items.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សៀវភៅសរសេរ",
              "ប៊ិកខៀវ",
              "ខ្មៅដៃ",
              "ជ័រលុប",
              "បន្ទាត់",
              "កាតាបស្ពាយ",
              "ប្រអប់ប៊ិក",
              "កន្ត្រៃ",
              "ក្រដាសគំនូរ",
              "កាវបិទ"
            ],
            "hint": "ខ្មៅដៃ: ខ + ្ + ម + ៅ + [ដកឃ្លា] + ដ + ៃ (ប្តូរ+S)។"
          },
          {
            "id": "w4-l4-s2",
            "kind": "pattern",
            "titleKh": "ឈ្មោះមុខវិជ្ជាសិក្សា (Academic Subjects)",
            "titleEn": "Academic Subjects — Khmer, Math, Science",
            "mission": "វាយឈ្មោះមុខវិជ្ជាសំខាន់ៗក្នុងកម្មវិធីសិក្សា។",
            "skill": "Subscript Ya (្យ) and specialized educational terms.",
            "mechanic": "Subject name typing challenges.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ភាសាខ្មែរ",
              "គណិតវិទ្យា",
              "វិទ្យាសាស្ត្រ",
              "ប្រវត្តិវិទ្យា",
              "ភូមិវិទ្យា",
              "ពលរដ្ឋល្អ",
              "គំនូរនិងតន្ត្រី",
              "អប់រំកាយ",
              "បច្ចេកវិទ្យា",
              "ភាសាអង់គ្លេស"
            ],
            "hint": "វិទ្យា: វ + ិ + ទ + ្ (J) + យ (Y) + ា (A)។"
          },
          {
            "id": "w4-l4-s3",
            "kind": "sentence",
            "titleKh": "ល្បះអំពីមុខវិជ្ជា (Subject Sentences)",
            "titleEn": "Subject Sentences — Learning & Application",
            "mission": "វាយប្រយោគពេញលេញអំពីសារសំខាន់នៃមុខវិជ្ជានីមួយៗ។",
            "skill": "Fluency in descriptive academic statements.",
            "mechanic": "Multi-part sentence typing concluding with punctuation.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "មុខវិជ្ជាភាសាខ្មែរជួយឲ្យយើងចេះអាននិងសរសេរបានស្ទាត់។",
              "គណិតវិទ្យាបណ្តុះការគិតបែបសមហេតុផលនិងការដោះស្រាយបញ្ហា។",
              "វិទ្យាសាស្ត្រជួយយើងយល់ដឹងអំពីធម្មជាតិនិងបាតុភូតជុំវិញខ្លួន។",
              "ប្រវត្តិវិទ្យាធ្វើឲ្យយើងស្គាល់ពីប្រភពដើមនិងវីរភាពបុព្វបុរស។",
              "ការរៀនបច្ចេកវិទ្យាជួយយើងប្រើប្រាស់កុំព្យូទ័របានត្រឹមត្រូវ។"
            ],
            "hint": "រក្សាចង្វាក់វាយឲ្យស្មើ មិនបាច់ប្រញាប់។"
          }
        ]
      },
      {
        "id": 5,
        "labelKh": "សកម្មភាព និងទម្លាប់ប្រចាំថ្ងៃ",
        "labelEn": "Actions & Daily Routines",
        "category": "Practical Typing",
        "skillCategory": "practical-vocabulary",
        "objective": "អនុវត្តការវាយពាក្យកិរិយាស័ព្ទ និងសកម្មភាពប្រចាំថ្ងៃរបស់សិស្ស៖ រៀន, សរសេរ, អាន, ដើរ, ហូប, គេង, ហាត់ប្រាណ។",
        "focusKeys": [
          "រៀន",
          "សរសេរ",
          "អាន",
          "ដើរ",
          "ហូប",
          "គេង",
          "ហាត់ប្រាណ",
          "ជួយការងារ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "សរសេរ: ស + រ + ស + េ + រ។ ស្រៈ េ វាយក្រោយ ស ទីពីរ។",
        "unicodeOutputExplained": "កិរិយាស័ព្ទសកម្មភាពប្រចាំថ្ងៃ។",
        "successCriteria": "វាយពាក្យសកម្មភាពដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w4-l5-s1",
            "kind": "warmup",
            "titleKh": "កិរិយាស័ព្ទប្រចាំថ្ងៃ (Daily Action Verbs)",
            "titleEn": "Daily Action Verbs — Read, Write, Walk, Eat",
            "mission": "វាយកិរិយាស័ព្ទទូទៅដែលយើងធ្វើរាល់ថ្ងៃ។",
            "skill": "Fluency on action verb keystroke sequences.",
            "mechanic": "Action verb speed drills.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "រៀន",
              "សរសេរ",
              "អាន",
              "ដើរ",
              "ហូប",
              "គេង",
              "ស្តាប់",
              "និយាយ",
              "គូររូប",
              "ហាត់ប្រាណ"
            ],
            "hint": "សរសេរ: ស + រ + ស + េ (E) + រ (R)។"
          },
          {
            "id": "w4-l5-s2",
            "kind": "pattern",
            "titleKh": "កម្រងសកម្មភាពជាប់គ្នា (Connected Action Phrases)",
            "titleEn": "Connected Actions — Morning to Evening Routines",
            "mission": "វាយឃ្លាសកម្មភាពដែលកើតឡើងតាមលំដាប់លំដោយ។",
            "skill": "Sequential action phrase typing.",
            "mechanic": "Phrase challenges describing daily routines.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ភ្ញាក់ពីគេង",
              "លុបលាងមុខ",
              "ដុសធ្មេញ",
              "ស្លៀកពាក់",
              "ហូបអាហារពេលព្រឹក",
              "ធ្វើដំណើរទៅសាលា",
              "ចូលរៀន",
              "ត្រឡប់មកផ្ទះ",
              "ធ្វើកិច្ចការផ្ទះ",
              "ចូលគេងទាន់ពេល"
            ],
            "hint": "ភ្ញាក់ពីគេង: ភ + ្ + ញ + ា + ក + ់ + [ដកឃ្លា] + ព + ី + [ដកឃ្លា] + គ + េ + ង។"
          },
          {
            "id": "w4-l5-s3",
            "kind": "sentence",
            "titleKh": "ល្បះទម្លាប់ប្រចាំថ្ងៃ (Routine Sentences)",
            "titleEn": "Routine Sentences — Healthy Daily Habits",
            "mission": "វាយប្រយោគពេញលេញអំពីទម្លាប់ល្អៗក្នុងជីវិត។",
            "skill": "Sustained typing accuracy across multi-action sentences.",
            "mechanic": "Extended narrative sentence practice.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ខ្ញុំតែងតែភ្ញាក់ពីព្រលឹមដើម្បីហាត់ប្រាណនិងស្រូបយកខ្យល់អាកាស។",
              "ក្រោយពេលញ៉ាំអាហារពេលព្រឹករួចខ្ញុំរៀបចំកាតាបទៅសាលារៀន។",
              "នៅសាលារៀនខ្ញុំខិតខំស្តាប់ការពន្យល់និងកត់ត្រាមេរៀនទុក។",
              "ពេលត្រឡប់មកដល់ផ្ទះវិញខ្ញុំជួយការងារឪពុកម្តាយយ៉ាងសប្បាយរីករាយ។",
              "មុនពេលចូលគេងខ្ញុំតែងតែអានសៀវភៅនិងរៀបចំសម្ភារសម្រាប់ថ្ងៃស្អែក។"
            ],
            "hint": "វាយមួយៗដោយភាពស្ងប់ស្ងាត់ និងច្បាស់លាស់។"
          }
        ]
      },
      {
        "id": 6,
        "labelKh": "សំណួរ និងចម្លើយខ្លីៗ",
        "labelEn": "Questions & Short Answers",
        "category": "Practical Typing",
        "skillCategory": "practical-vocabulary",
        "objective": "រៀនវាយសញ្ញាសួរ (?) (ប្តូរ+/) ពាក្យសួរ និងទម្រង់ចម្លើយខ្លីៗក្នុងទំនាក់ទំនងប្រចាំថ្ងៃ។",
        "focusKeys": [
          "?",
          "តើ...ទេ?",
          "បាទ",
          "ចាស",
          "អ្វី?",
          "ឯណា?",
          "ហេតុអ្វី?",
          "សុខសប្បាយ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "សញ្ញាសួរ (?) វាយដោយសង្កត់ Left ប្តូរ រួចចុច Slash (/) ដោយកូនដៃស្តាំ។",
        "unicodeOutputExplained": "Left ប្តូរ + Slash (/) = ? (សញ្ញាសួរ)។",
        "successCriteria": "វាយសំណួរ និងចម្លើយប្រកបដោយភាពត្រឹមត្រូវ ៩២% ឡើងទៅ។",
        "minimumAccuracy": 92,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w4-l6-s1",
            "kind": "warmup",
            "titleKh": "សញ្ញាសួរ និងពាក្យសួរ (Question Mark & Question Words)",
            "titleEn": "Question Words — ? (ប្តូរ+/), What, Where, Why",
            "mission": "ហាត់ចុចសញ្ញាសួរ ? (Left ប្តូរ + /) និងពាក្យសួរ។",
            "skill": "Precise pinky execution for question mark (?) and question starters.",
            "mechanic": "Question syntax and punctuation typing.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "តើអ្វី?",
              "ឯណា?",
              "ពេលណា?",
              "ហេតុអ្វី?",
              "ដូចម្តេច?",
              "នរណា?",
              "ប៉ុន្មាន?",
              "ពិតទេ?",
              "សុខទេ?",
              "តើ?"
            ],
            "hint": "សញ្ញាសួរ ?: Left ប្តូរ (កូនដៃឆ្វេង) + Slash (កូនដៃស្តាំ)។"
          },
          {
            "id": "w4-l6-s2",
            "kind": "pattern",
            "titleKh": "គូសន្ទនាខ្លីៗ (Short Dialogue Pairs)",
            "titleEn": "Dialogue Pairs — Question and Answer Formats",
            "mission": "វាយគូសំណួរ និងចម្លើយគួរសម (បាទ, ចាស)។",
            "skill": "Typing dialogic sequences with polite Khmer affirmative particles.",
            "mechanic": "Interactive dialogue pair challenges.",
            "targetCount": 6,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "តើអ្នកសុខសប្បាយទេ? បាទ ខ្ញុំសុខសប្បាយ។",
              "តើអ្នកឈ្មោះអ្វី? ខ្ញុំឈ្មោះសុខា។",
              "តើអ្នកទៅណា? ខ្ញុំទៅសាលារៀន។",
              "តើម៉ោងប៉ុន្មានហើយ? ម៉ោងប្រាំពីរហើយ។",
              "តើអ្នកចូលចិត្តរៀនទេ? ចាស ខ្ញុំចូលចិត្តណាស់។",
              "តើអ្នកយល់មេរៀនទេ? បាទ ខ្ញុំយល់ច្បាស់ហើយ។"
            ],
            "hint": "បាទ: ប + ា + ទ។ ចាស: ច + ា + ស។"
          },
          {
            "id": "w4-l6-s3",
            "kind": "sentence",
            "titleKh": "ការសន្ទនាពេញលេញ (Full Conversational Flow)",
            "titleEn": "Conversational Flow — Courteous Communication",
            "mission": "វាយការសន្ទនាគួរសមពេញលេញរវាងមិត្តភក្តិ ឬគ្រូនិងសិស្ស។",
            "skill": "Fluency across punctuated conversational sentences.",
            "mechanic": "Extended dialogue flow testing question and exclamation rhythm.",
            "targetCount": 5,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "ជម្រាបសួរលោកគ្រូ! តើថ្ងៃនេះលោកគ្រូមានសុខភាពល្អទេ? បាទ គ្រូសុខសប្បាយធម្មតា។",
              "សួស្តីមិត្តភក្តិ! តើឯងបានធ្វើកិច្ចការផ្ទះរួចរាល់ហើយឬនៅ? បាទ ខ្ញុំបានធ្វើរួចហើយ។",
              "តើយើងត្រូវយកសៀវភៅអ្វីខ្លះទៅរៀនថ្ងៃនេះ? សៀវភៅភាសាខ្មែរនិងគណិតវិទ្យា។",
              "តើឯងចង់ទៅបណ្ណាល័យជាមួយខ្ញុំទេ? ចាស ខ្ញុំចង់ទៅអានសៀវភៅជាមួយឯងណាស់។",
              "សូមអរគុណច្រើនសម្រាប់ការជួយពន្យល់មេរៀនដល់ខ្ញុំ! មិនអីទេ រីករាយនឹងជួយជានិច្ច។"
            ],
            "hint": "សង្កេតសញ្ញាសួរ (?) និងសញ្ញាខណ្ឌ (។) ឲ្យបានត្រឹមត្រូវ។"
          }
        ]
      },
      {
        "id": 7,
        "labelKh": "សញ្ញាខណ្ឌ និងគម្លាតឃ្លា",
        "labelEn": "Punctuation & Spacing",
        "category": "Practical Typing",
        "skillCategory": "punctuation-spacing",
        "objective": "រៀនប្រើប្រាស់សញ្ញាខណ្ឌ ។ (Period), សញ្ញាបរិយូសាន ៕ (ប្តូរ+Period), និងការដកឃ្លា (Spacebar) តាមក្បួនខ្នាតអក្ខរាវិរុទ្ធខ្មែរ។",
        "focusKeys": [
          "Period",
          "ប្តូរPeriod",
          "។",
          "៕",
          "Spacebar",
          "គម្លាតឃ្លា"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "ring",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "ក្នុងភាសាខ្មែរ មិនប្រើដកឃ្លារវាងពាក្យគ្រប់ពាក្យដូចភាសាអង់គ្លេសទេ គឺដកឃ្លាតែពេលចប់ឃ្លាមួយៗប៉ុណ្ណោះ។ ចប់ល្បះប្រើ ។, ចប់រឿងប្រើ ៕។",
        "unicodeOutputExplained": "Period = ។ (ខណ្ឌ), ប្តូរ + Period = ៕ (បរិយូសាន), Space = ដកឃ្លា។",
        "successCriteria": "ប្រើសញ្ញាខណ្ឌ និងគម្លាតឃ្លាដោយភាពត្រឹមត្រូវ ៩៤% ឡើងទៅ។",
        "minimumAccuracy": 94,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w4-l7-s1",
            "kind": "warmup",
            "titleKh": "សញ្ញាខណ្ឌ និងបរិយូសាន (Khan ។ & Bariyoosan ៕)",
            "titleEn": "Terminal Punctuation — Khan (।) & Bariyoosan (៕)",
            "mission": "ហាត់ចុចសញ្ញាខណ្ឌ ។ (Period) និងសញ្ញាបរិយូសាន ៕ (Left ប្តូរ + Period)។",
            "skill": "Precise terminal punctuation with right ring finger on Period.",
            "mechanic": "Punctuation strike and ប្តូរ combination.",
            "targetCount": 10,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "បាន។",
              "ហើយ។",
              "ចប់។",
              "ល្អ។",
              "រៀន។",
              "ចប់សព្វគ្រប់៕",
              "ជ័យជយោ៕",
              "សូមអរគុណ៕",
              "ចប់រឿង៕",
              "សន្តិភាព៕"
            ],
            "hint": "សញ្ញាខណ្ឌ (។) ចុច Period (.)។ សញ្ញាបរិយូសាន (៕) ចុច Left ប្តូរ + Period (.)។"
          },
          {
            "id": "w4-l7-s2",
            "kind": "pattern",
            "titleKh": "ក្បួនដកឃ្លាក្នុងឃ្លាខ្មែរ (Khmer Phrase Spacing)",
            "titleEn": "Phrase Boundary Spacing — Natural Pause Insertion",
            "mission": "ហាត់ដកឃ្លាតាមក្បួនខ្នាតអក្សរសាស្ត្រខ្មែរ (ដកឃ្លាតែពេលចប់ឃ្លា មិនដកឃ្លាគ្រប់ពាក្យ)។",
            "skill": "Applying the Spacebar strictly at semantic clause boundaries.",
            "mechanic": "Spacing accuracy validation according to Khmer orthography.",
            "targetCount": 6,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "ពេលព្រឹកព្រលឹម ខ្ញុំក្រោកពីគេង។",
              "នៅសាលារៀន សិស្សខិតខំរៀនសូត្រ។",
              "ពេលសម្រាក យើងនាំគ្នាលេងកីឡា។",
              "ដើម្បីសុខភាពល្អ យើងត្រូវហូបស្អាត រស់នៅស្អាត។",
              "យុវជនជាសរសរទ្រូង នៃប្រទេសជាតិ។",
              "ការរៀនសូត្រ នាំមកនូវពន្លឺជីវិត។"
            ],
            "hint": "ដកឃ្លា (Spacebar) តែនៅកន្លែងដែលមានចន្លោះឃ្លាធម្មជាតិប៉ុណ្ណោះ។"
          },
          {
            "id": "w4-l7-s3",
            "kind": "sentence",
            "titleKh": "អត្ថបទកថាខណ្ឌខ្លី (Short Punctuation Paragraph)",
            "titleEn": "Short Paragraph — Spacing & Sentence Boundaries",
            "mission": "វាយកថាខណ្ឌខ្លីដែលមានទាំងគម្លាតឃ្លា សញ្ញាខណ្ឌ និងសញ្ញាបរិយូសាន។",
            "skill": "Flawless boundary management across continuous multi-sentence text.",
            "mechanic": "Paragraph validation with terminal Bariyoosan.",
            "targetCount": 3,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "ប្រទេសកម្ពុជាមានសម្បត្តិប្រពៃណីសម្បូរបែប។ ប្រជាជនរស់នៅដោយសេចក្តីសុខសាន្ត និងស្រឡាញ់សន្តិភាព។ យើងមានមោទនភាពចំពោះជាតិយើង៕",
              "ការសិក្សាស្រាវជ្រាវជួយអភិវឌ្ឍបញ្ញាស្មារតី។ សិស្សគ្រប់រូបគួរចំណាយពេលអានសៀវភៅជារៀងរាល់ថ្ងៃ ដើម្បីទទួលបានចំណេះដឹងថ្មីៗ៕",
              "សាមគ្គីភាពជាកម្លាំងយ៉ាងរឹងមាំក្នុងការកសាងជាតិ។ នៅពេលដែលយើងរួបរួមគ្នា យើងអាចសម្រេចបាននូវរាល់កិច្ចការធំធេងទាំងអស់៕"
            ],
            "hint": "បញ្ចប់អត្ថបទដោយសញ្ញាបរិយូសាន ៕ (Left ប្តូរ + Period)។"
          }
        ]
      },
      {
        "id": 8,
        "labelKh": "សុភាសិត និងឃ្លាខ្លីៗមានន័យ",
        "labelEn": "Meaningful Phrases & Proverbs",
        "category": "Practical Typing",
        "skillCategory": "practical-vocabulary",
        "objective": "អនុវត្តការវាយសុភាសិតខ្មែរ និងពាក្យស្លោកអប់រំចិត្តមានអត្ថន័យជ្រាលជ្រៅ។",
        "focusKeys": [
          "ចេះមកពីរៀន",
          "មានមកពីរក",
          "ចំណេះជាទ្រព្យ",
          "សុភាសិតខ្មែរ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយសុភាសិតដោយភាពត្រឹមត្រូវ និងយល់ពីអត្ថន័យអប់រំនៃឃ្លានីមួយៗ។",
        "unicodeOutputExplained": "សុភាសិត និងពាក្យស្លោកបុរាណខ្មែរ។",
        "successCriteria": "វាយសុភាសិត និងឃ្លាមានន័យដោយភាពត្រឹមត្រូវ ៩៤% ឡើងទៅ។",
        "minimumAccuracy": 94,
        "speedTargetCpm": 36,
        "stages": [
          {
            "id": "w4-l8-s1",
            "kind": "warmup",
            "titleKh": "សុភាសិតខ្លីៗ (Short Proverbs)",
            "titleEn": "Short Proverbs — Wisdom in Few Words",
            "mission": "វាយសុភាសិតខ្លីៗដែលធ្លាប់ឮ និងចងចាំងាយ។",
            "skill": "Fluency on proverb rhythm and traditional phrasing.",
            "mechanic": "Proverb rhythm typing challenges.",
            "targetCount": 8,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "ចេះមកពីរៀន មានមកពីរក។",
              "ចំណេះវិជ្ជា ប្រសើរជាងទ្រព្យ។",
              "ធ្វើល្អបានល្អ ធ្វើអាក្រក់បានអាក្រក់។",
              "ទឹកថ្លាឈ្វេង កុំអាលគិតថារាក់។",
              "ស្រឡាញ់ខ្លួន ឲ្យស្ងួនចំណេះ។",
              "ចង់ចេះឲ្យសួរ ចង់ល្អឲ្យកែ។",
              "អត់ធ្មត់មានជ័យ ភ័យនាំឲ្យខាត។",
              "សាមគ្គីរស់ បែកបាក់សាមគ្គីស្លាប់។"
            ],
            "hint": "សង្កេតចង្វាក់នៃពាក្យ និងសញ្ញាខណ្ឌ ។។"
          },
          {
            "id": "w4-l8-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យស្លោកអប់រំចិត្ត (Educational Maxims)",
            "titleEn": "Educational Maxims — Moral Guidance",
            "mission": "វាយពាក្យស្លោកអប់រំអំពីការខិតខំប្រឹងប្រែង និងចរិយាសម្បត្តិ។",
            "skill": "Typing rhyming moral expressions with high precision.",
            "mechanic": "Poetic proverb phrasing practice.",
            "targetCount": 6,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "ចំណេះដឹងគឺជាកូនសោ បើកទ្វារទៅកាន់អនាគតភ្លឺស្វាង។",
              "ការមិនចេះមិនមែនជាកំហុសទេ តែការមិនរៀនទើបជាកំហុសពិតប្រាកដ។",
              "ពេលវេលាដែលកន្លងផុតទៅហើយ មិនអាចត្រឡប់មកវិញបានឡើយ។",
              "ដើមឈើដែលមានផ្លែផ្អែម តែងតែមានមែកធ្ងន់ឱនលំទោន។",
              "មនុស្សដែលមានចំណេះដឹងជ្រៅជ្រះ តែងតែមានភាពរាបសានិងថ្លៃថ្នូរ។",
              "កម្លាំងញើសឈាមដែលបានលះបង់ នឹងនាំមកនូវផ្លែផ្កាផ្អែមល្ហែម។"
            ],
            "hint": "វាយមួយៗដោយភាពជឿជាក់ និងស្ងប់ស្ងាត់។"
          },
          {
            "id": "w4-l8-s3",
            "kind": "sentence",
            "titleKh": "អត្ថបទអប់រំពេញលេញ (Complete Moral Passage)",
            "titleEn": "Moral Passage — Complete Text Flow",
            "mission": "វាយអត្ថបទអប់រំទស្សនវិជ្ជាខ្មែរពេញលេញ។",
            "skill": "Synthesis of practical vocabulary, punctuation, and moral expressions.",
            "mechanic": "Graduation trial before confronting the Golden Librarian.",
            "targetCount": 4,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "ការអប់រំជាមូលដ្ឋានគ្រឹះយ៉ាងរឹងមាំបំផុតសម្រាប់កសាងជីវិតមនុស្ស។ បុគ្គលដែលខិតខំក្រេបជញ្ជក់ចំណេះដឹង នឹងក្លាយជាពលរដ្ឋមានតម្លៃសម្រាប់សង្គមជាតិ៕",
              "យុវជនខ្មែរគប្បីយកចិត្តទុកដាក់លើការសិក្សាស្រាវជ្រាវគ្រប់ពេលវេលា។ ភាពឧស្សាហ៍ព្យាយាមនឹងជួយយកឈ្នះរាល់ឧបសគ្គទាំងឡាយក្នុងជីវិត៕",
              "ចរិយាសម្បត្តិ សីលសម្បត្តិ និងចំណេះដឹង ត្រូវតែដើរទន្ទឹមគ្នាជានិច្ច។ មនុស្សដែលមានទាំងចំណេះនិងចរិយាសម្បត្តិ តែងតែទទួលបានការគោរពស្រឡាញ់ពីមនុស្សជុំវិញខ្លួន៕",
              "ភាសាខ្មែរជាសម្បត្តិប្រពៃណីមហាសាលដែលបុព្វបុរសបានបន្សល់ទុកឲ្យយើង។ យើងជាកូនចៅជំនាន់ក្រោយ មានកាតព្វកិច្ចថែរក្សា និងលើកតម្កើងភាសាជាតិឲ្យបានគង់វង្ស៕"
            ],
            "hint": "រក្សាការផ្តោតអារម្មណ៍។ អ្នកកាន់តែខិតជិតដល់ភាពជាអ្នកជំនាញហើយ!"
          }
        ]
      },
      {
        "id": "boss",
        "labelKh": "បណ្ណារក្សមាស (Golden Librarian Challenge)",
        "labelEn": "Golden Librarian — Practical School Quest",
        "category": "World Boss Mastery",
        "skillCategory": "practical-mastery",
        "objective": "ប្រឡងជាប់ពិភពទី ៤ ដោយបង្ហាញភាពស្ទាត់ជំនាញលើពាក្យប្រចាំថ្ងៃ ជីវិតសាលារៀន សម្ភារសិក្សា សុភាសិត និងសញ្ញាវណ្ណយុត្តិខ្មែរ។",
        "focusKeys": [
          "បច្ចេកទេសទាំងអស់នៃពិភពទី ៤"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយអត្ថបទអនុវត្តជាក់ស្តែងដោយភាពត្រឹមត្រូវ ៩៤% ឡើងទៅ។",
        "unicodeOutputExplained": "ការប្រឡងបញ្ចប់ពិភពទី ៤៖ ស្ទាត់ជំនាញលើពាក្យជីវិតពិត គម្លាតឃ្លា និងសញ្ញាវណ្ណយុត្តិ។",
        "successCriteria": "ឆ្លងកាត់ទាំង ៣ Wave ដោយជោគជ័យ ដើម្បីដោះសោពិភពទី ៥ (Shadow Volcano)។",
        "minimumAccuracy": 94,
        "speedTargetCpm": 36,
        "stages": [
          {
            "id": "w4-boss-s1",
            "kind": "boss",
            "titleKh": "Wave ពាក្យសាលា និងគ្រួសារ (School & Family Wave)",
            "titleEn": "Boss Wave 1 — School & Family Terminology",
            "mission": "វាយពាក្យទាក់ទងនឹងសាលារៀន មុខវិជ្ជា និងគ្រួសារយ៉ាងរហ័ស។",
            "skill": "Rapid recall and touch typing of core practical nouns.",
            "mechanic": "Fast-paced word wave testing everyday vocabulary fluency.",
            "targetCount": 12,
            "accuracyGoal": 92,
            "practiceMode": "unicode-output",
            "items": [
              "សាលារៀន",
              "លោកគ្រូ",
              "សិស្ស",
              "សៀវភៅ",
              "ប៊ិក",
              "ភាសាខ្មែរ",
              "គណិតវិទ្យា",
              "ឪពុក",
              "ម្តាយ",
              "បងប្អូន",
              "គ្រួសារ",
              "ផ្ទះ"
            ],
            "hint": "វាយដោយភាពជឿជាក់។ រក្សាម្រាមដៃលើទីតាំងដើម។"
          },
          {
            "id": "w4-boss-s2",
            "kind": "boss",
            "titleKh": "Wave សំណួរ និងសុភាសិត (Questions & Proverbs Wave)",
            "titleEn": "Boss Wave 2 — Questions, Dialogues & Proverbs",
            "mission": "វាយសំណួរ ចម្លើយគួរសម និងសុភាសិតអប់រំចិត្ត។",
            "skill": "Punctuation mark (?) and quotation precision in natural Khmer dialogue.",
            "mechanic": "Interrogative and proverbial text validation.",
            "targetCount": 8,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "តើអ្នកសុខសប្បាយទេ? បាទ ខ្ញុំសុខសប្បាយ។",
              "តើអ្នកចូលចិត្តអានសៀវភៅទេ? ចាស ខ្ញុំចូលចិត្តណាស់។",
              "ចេះមកពីរៀន មានមកពីរក។",
              "ចំណេះវិជ្ជា ប្រសើរជាងទ្រព្យ។",
              "ធ្វើល្អបានល្អ ធ្វើអាក្រក់បានអាក្រក់។",
              "ក្មេងៗខិតខំរៀនសូត្រច្រើនៗ។",
              "សូមអរគុណច្រើនលោកគ្រូ! មិនអីទេកូន។",
              "សាមគ្គីរស់ បែកបាក់សាមគ្គីស្លាប់។"
            ],
            "hint": "សង្កេតសញ្ញាសួរ ? (Left ប្តូរ + /) និង ៗ (AltGr + ;)។"
          },
          {
            "id": "w4-boss-s3",
            "kind": "boss",
            "titleKh": "Wave បណ្ណារក្សជើងឯក (Golden Librarian Champion Wave)",
            "titleEn": "Boss Wave 3 — Ultimate Golden Library Trial",
            "mission": "វាយកថាខណ្ឌអប់រំពេញលេញ ដើម្បីទទួលបានជ័យជម្នះលើពិភពទី ៤។",
            "skill": "Mastery of practical Khmer writing, orthographic spacing, and terminal marks.",
            "mechanic": "Final boss trial securing graduation from World 4.",
            "targetCount": 5,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "ការអានសៀវភៅជាទម្លាប់ល្អប្រសើរដែលជួយពង្រីកចំណេះដឹង និងការគិតប្រកបដោយហេតុផល។ សិស្សគ្រប់រូបគប្បីឆ្លៀតពេលអានសៀវភៅល្អៗជារៀងរាល់ថ្ងៃ ដើម្បីអភិវឌ្ឍសមត្ថភាពផ្ទាល់ខ្លួន៕",
              "សាលារៀនជាថ្នាលបណ្តុះបណ្តាលចំណេះដឹង ជំនាញ និងសីលសម្បត្តិដល់កុលបុត្រខ្មែរគ្រប់រូប។ លោកគ្រូអ្នកគ្រូបានលះបង់កម្លាំងកាយចិត្ត ដើម្បីជួយសិស្សឲ្យក្លាយជាទំពាំងស្នងឫស្សីយ៉ាងរឹងមាំ៕",
              "ភាសាខ្មែរជាមរតកប្រពៃណីវិសេសវិសាលដែលយើងទាំងអស់គ្នាត្រូវរួមសាមគ្គីគ្នាការពារ និងអភិរក្ស។ ការវាយអក្សរខ្មែរតាមប្រព័ន្ធកុំព្យូទ័របានត្រឹមត្រូវ ជាការចូលរួមចំណែកយ៉ាងសំខាន់ក្នុងការលើកស្ទួយភាសាជាតិ៕",
              "ចំណេះវិជ្ជាដែលយើងទទួលបានពីការសិក្សា នឹងក្លាយជាទ្រព្យសម្បត្តិជាប់ខ្លួនមួយជីវិត។ គ្មាននរណាម្នាក់អាចដកហូតចំណេះដឹងដែលយើងមានក្នុងខួរក្បាលបានឡើយ៕",
              "សេចក្តីព្យាយាមក្នុងការរៀនសូត្រ ប្រៀបដូចជាការស្រោចទឹកលើដើមរុក្ខជាតិដូច្នោះដែរ។ នៅពេលដែលពេលវេលាមកដល់ វានឹងផ្តល់ផ្លែផ្កាស្រស់បំព្រងសម្រាប់ជីវិតយើង៕"
            ],
            "hint": "ដកដង្ហើមវែងៗ។ វាយមួយៗដោយភាពស្ងប់ស្ងាត់ និងត្រឹមត្រូវបំផុត!"
          }
        ]
      }
    ]
  },
  {
    "id": 5,
    "title": "Shadow Volcano",
    "titleKh": "ភ្នំភ្លើងស្រមោល",
    "subtitle": "ភាពសុក្រឹត កែតម្រូវគ្រាប់ចុចខ្សោយ និងចង្វាក់ស្មើ",
    "theme": "Fire & Discipline",
    "mainLessonKh": "ពង្រឹងភាពត្រឹមត្រូវ ៩៥% លុបបំបាត់កំហុស និងបង្កើតចង្វាក់វាយអក្សរស្មើ",
    "mainLessonEn": "High accuracy (95%+), error correction, weak-key remediation, and steady pacing",
    "skillFocus": "Accuracy remediation over raw speed, disciplined return-to-home habits.",
    "unicodeFocus": "Precision keystrokes under pressure, clean modifier release, and sustained CPM.",
    "levels": [
      {
        "id": 1,
        "labelKh": "ការហ្វឹកហាត់គ្រាប់ចុចខ្សោយ",
        "labelEn": "Weak-Key Identification & Practice",
        "category": "Accuracy Remediation",
        "skillCategory": "accuracy-remediation",
        "objective": "កំណត់ និងហ្វឹកហាត់គ្រាប់ចុចដែលសិស្សងាយនឹងចុចច្រឡំបំផុត (ដូចជា ថ/ធ, ដ/ឌ, ត/ទ, ស/សៃ, ឆ/ឈ)។",
        "focusKeys": [
          "ថ",
          "ធ",
          "ដ",
          "ឌ",
          "ត",
          "ទ",
          "ស",
          "ៃ",
          "ឆ",
          "ឈ",
          "ខ",
          "ឃ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "ផ្តោតលើភាពខុសគ្នារវាងអក្សរធម្មតា និងអក្សរប្រើ ប្តូរ លើគ្រាប់ចុចដដែល។",
        "unicodeOutputExplained": "F=ថ vs ប្តូរ+F=ធ; D=ដ vs ប្តូរ+D=ឌ; T=ត vs ប្តូរ+T=ទ; Q=ឆ vs ប្តូរ+Q=ឈ; X=ខ vs ប្តូរ+X=ឃ",
        "successCriteria": "វាយគូគ្រាប់ចុចងាយច្រឡំដោយភាពត្រឹមត្រូវ ៩៥% ឡើងទៅ។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w5-l1-s1",
            "kind": "warmup",
            "titleKh": "គូគ្រាប់ចុចងាយច្រឡំ (Confusing Key Pairs)",
            "titleEn": "Confusing Key Pairs — Base vs ប្តូរ Contrast",
            "mission": "ហាត់វាយឆ្លាស់គ្នារវាងអក្សរធម្មតា និងអក្សរ ប្តូរ លើគ្រាប់ចុចដដែល (ថ/ធ, ដ/ឌ, ត/ទ)។",
            "skill": "Discrimination between base and shifted outputs on identical physical keys.",
            "mechanic": "Side-by-side contrast drills requiring distinct mental triggers.",
            "targetCount": 12,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ថ ធ",
              "ដ ឌ",
              "ត ទ",
              "ស ៃ",
              "ឆ ឈ",
              "ខ ឃ",
              "ច ជ",
              "ប ព",
              "ក គ",
              "ល ឡ",
              "ថធ",
              "ដឌ"
            ],
            "hint": "F តែឯង = ថ; Right ប្តូរ + F = ធ។ D តែឯង = ដ; Right ប្តូរ + D = ឌ។"
          },
          {
            "id": "w5-l1-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យប្រៀបធៀបគូអក្សរ (Contrast Word Drills)",
            "titleEn": "Contrast Words — Targeted Precision",
            "mission": "វាយពាក្យដែលប្រើអក្សរងាយច្រឡំទាំងនេះក្នុងបរិបទជាក់ស្តែង។",
            "skill": "Precision targeting of easily confused keys in real words.",
            "mechanic": "Contrast word typing under high accuracy requirement.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ថាស ធុង",
              "ដី ឌី",
              "តា ទា",
              "សេះ ដៃ",
              "ឆាប់ ឈើ",
              "ខុស ឃ្មុំ",
              "ចាន ជើង",
              "បី ពូ",
              "កូន គំនិត",
              "លាភ ឡាន"
            ],
            "hint": "សង្កេតឲ្យច្បាស់មុនចុច។ កុំប្រញាប់!"
          },
          {
            "id": "w5-l1-s3",
            "kind": "sentence",
            "titleKh": "ល្បះកែតម្រូវភាពសុក្រឹត (Precision Sentences)",
            "titleEn": "Precision Sentences — Error-Free Flow",
            "mission": "វាយប្រយោគដែលមានពាក្យប្រៀបធៀបដោយគ្មានកំហុសសូម្បីតែមួយ។",
            "skill": "Flawless sentence typing with zero base/shift confusion.",
            "mechanic": "Zero-tolerance accuracy challenges.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "លោកតាទៅទិញទា និងត្រីធំពីផ្សារ។",
              "កូនសិស្សខិតខំដេរថាស និងដាំដើមឈើ។",
              "យើងត្រូវចេះបែងចែករវាងខុសនិងត្រូវឲ្យបានច្បាស់លាស់។",
              "ពូឌីជិះទូកទៅមើលកោះ និងភ្នំជាមួយកូនចៅ។",
              "ការគិតគូរវែងឆ្ងាយជួយឲ្យយើងសម្រេចបានជោគជ័យធំធេង។"
            ],
            "hint": "ភាពត្រឹមត្រូវ ៩៥% គឺសំខាន់ជាងល្បឿន។ វាយមួយៗឲ្យច្បាស់!"
          }
        ]
      },
      {
        "id": 2,
        "labelKh": "កែតម្រូវការឈោងម្រាមដៃ",
        "labelEn": "Reaching Error Correction",
        "category": "Accuracy Remediation",
        "skillCategory": "reach-correction",
        "objective": "លុបបំបាត់ទម្លាប់អាក្រក់ក្នុងការឈោងម្រាមដៃឆ្ងាយ និងធានាថាម្រាមដៃវិលមកទីតាំងដើមជានិច្ច ក្រោយពេលចុចគ្រាប់ចុចជួរលើ ឬក្រោម។",
        "focusKeys": [
          "ឈោងហើយត្រឡប់",
          "F->T->F",
          "J->U->J",
          "D->C->D",
          "K->,->K"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "រាល់ពេលឈោងម្រាមទៅជួរលើ ឬក្រោម ត្រូវទាញម្រាមដៃមកប៉ះ F ឬ J វិញភ្លាម។",
        "unicodeOutputExplained": "ការរក្សាតុល្យភាពដៃ និងការវិលត្រឡប់មកទីតាំងដើម (Return to Home Row)។",
        "successCriteria": "វាយលំហាត់ឈោងហើយត្រឡប់ដោយភាពត្រឹមត្រូវ ៩៥% ឡើងទៅ។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w5-l2-s1",
            "kind": "warmup",
            "titleKh": "ឈោងឡើង-ចុះហើយត្រឡប់ (Reach-and-Return Drills)",
            "titleEn": "Reach & Return Drills — Rapid Recoil",
            "mission": "ហាត់ចុចគ្រាប់ចុចជួរលើ/ក្រោម រួចវិលមកជួរកណ្តាលវិញភ្លាមៗ (F R F, J N J, D E D, K I K)។",
            "skill": "Instant muscle recoil returning fingers to home-row tactile anchors.",
            "mechanic": "Anchor recoil drills preventing drift.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "practiceMode": "physical-key",
            "items": [
              "KeyF KeyR KeyF",
              "KeyJ KeyN KeyJ",
              "KeyD KeyE KeyD",
              "KeyK KeyI KeyK",
              "KeyS KeyW KeyS",
              "KeyL KeyO KeyL",
              "KeyA KeyQ KeyA",
              "Semicolon KeyP Semicolon",
              "KeyF KeyV KeyF",
              "KeyJ KeyM KeyJ"
            ],
            "hint": "ចុចគ្រាប់ចុចក្រៅជួរកណ្តាលរួច ត្រូវដកម្រាមដៃមកទីតាំងដើមវិញភ្លាម។"
          },
          {
            "id": "w5-l2-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យមានការឈោងបញ្ឆិត (Diagonal Reach Words)",
            "titleEn": "Diagonal Reaches — Word Applications",
            "mission": "វាយពាក្យដែលទាមទារការឈោងម្រាមដៃបញ្ឆិតជួរលើ និងក្រោម។",
            "skill": "Diagonal finger accuracy without shifting wrist position.",
            "mechanic": "Diagonal reach word sequences.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ចរាចរ",
              "វិទ្យាសាស្ត្រ",
              "កិត្តិយស",
              "កណ្តាល",
              "មនុស្ស",
              "សង្គម",
              "រៀនសូត្រ",
              "ប្រពៃណី",
              "ប្រវត្តិ",
              "អភិវឌ្ឍ"
            ],
            "hint": "រក្សាកដៃឲ្យត្រង់ កុំរំកិលកែងដៃ។"
          },
          {
            "id": "w5-l2-s3",
            "kind": "sentence",
            "titleKh": "ល្បះកាយវិការត្រឹមត្រូវ (Posture & Movement Sentences)",
            "titleEn": "Posture Sentences — Smooth Movement Flow",
            "mission": "វាយប្រយោគពេញលេញដោយរក្សាឥរិយាបថដៃ និងកាយវិការម្រាមដៃល្អឥតខ្ចោះ។",
            "skill": "Sustained typing accuracy while maintaining ergonomic home-row posture.",
            "mechanic": "Full sentence flow checking physical discipline.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ការវាយអក្សរដោយរក្សាទីតាំងដៃត្រឹមត្រូវជួយការពារការឈឺកដៃ។",
              "ម្រាមដៃរបស់យើងត្រូវតែមានភាពរហ័សរហួននិងវិលមកទីតាំងដើម។",
              "ការហ្វឹកហាត់ជាប្រចាំជួយឲ្យសាច់ដុំម្រាមដៃចងចាំទីតាំងគ្រាប់ចុច។",
              "កុំចុចគ្រាប់ចុចដោយប្រើកម្លាំងខ្លាំងពេក ត្រូវចុចថ្នមៗនិងច្បាស់ៗ។",
              "ភាពស្ងប់ស្ងាត់និងការផ្តោតអារម្មណ៍ជាគន្លឹះនៃភាពត្រឹមត្រូវខ្ពស់។"
            ],
            "hint": "អង្គុយឲ្យត្រង់ខ្លួន ដាក់ជើងទាំងពីរស្មើលើឥដ្ឋ។"
          }
        ]
      },
      {
        "id": 3,
        "labelKh": "លុបបំបាត់ការច្រឡំដៃឆ្វេង-ស្តាំ",
        "labelEn": "Hand Separation & Balance",
        "category": "Accuracy Remediation",
        "skillCategory": "bilateral-balance",
        "objective": "លុបបំបាត់ទម្លាប់ប្រើម្រាមដៃខុសម្ខាង (ដូចជា ប្រើដៃឆ្វេងចុចអក្សរខាងស្តាំ) ដោយពង្រឹងដែនកំណត់រវាងដៃឆ្វេង និងដៃស្តាំ។",
        "focusKeys": [
          "ដែនកំណត់ដៃ",
          "T/Y",
          "G/H",
          "B/N",
          "កណ្តាលក្តារចុច"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "index"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "T, G, B ជាកម្មសិទ្ធិរបស់ដៃឆ្វេង។ Y, H, N ជាកម្មសិទ្ធិរបស់ដៃស្តាំ។ ហាមលូកដៃឆ្លងដែន!",
        "unicodeOutputExplained": "ឆ្វេង: T(ត), G(ង), B(ប)។ ស្តាំ: Y(យ), H(ហ), N(ន)។",
        "successCriteria": "វាយលំហាត់ព្រំដែនដៃឆ្វេង-ស្តាំដោយភាពត្រឹមត្រូវ ៩៥% ឡើងទៅ។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w5-l3-s1",
            "kind": "warmup",
            "titleKh": "ព្រំដែនកណ្តាលក្តារចុច (Center Boundary Drills)",
            "titleEn": "Center Boundary — T/Y, G/H, B/N Strict Separation",
            "mission": "ហាត់ចុចគ្រាប់ចុចកណ្តាលក្តារចុចដោយប្រើដៃត្រឹមត្រូវ (ឆ្វេង T, G, B vs ស្តាំ Y, H, N)។",
            "skill": "Strict midline adherence preventing cross-hand reaching habits.",
            "mechanic": "Midline boundary drills enforcing correct hand assignment.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "practiceMode": "physical-key",
            "items": [
              "KeyT KeyY",
              "KeyG KeyH",
              "KeyB KeyN",
              "KeyT KeyG KeyB",
              "KeyY KeyH KeyN",
              "KeyT KeyY KeyG KeyH",
              "KeyB KeyN KeyT KeyY",
              "KeyG KeyH KeyB KeyN",
              "KeyF KeyT KeyG KeyB",
              "KeyJ KeyY KeyH KeyN"
            ],
            "hint": "T, G, B ប្រើម្រាមចង្អុលឆ្វេងជានិច្ច! Y, H, N ប្រើម្រាមចង្អុលស្តាំជានិច្ច!"
          },
          {
            "id": "w5-l3-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យកាត់ព្រំដែនកណ្តាល (Midline Boundary Words)",
            "titleEn": "Boundary Words — Words Crossing T/Y, G/H, B/N",
            "mission": "វាយពាក្យដែលរួមបញ្ចូលគ្រាប់ចុចកណ្តាលទាំងសងខាង។",
            "skill": "Coordinated bilateral index finger typing along the keyboard midline.",
            "mechanic": "Cross-midline word challenges.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "តយុគ",
              "ហង្ស",
              "បងប្អូន",
              "ទាហាន",
              "យោធា",
              "នគរបាល",
              "ធម្មជាតិ",
              "កម្ពុជា",
              "បុណ្យទាន",
              "មាតុភូមិ"
            ],
            "hint": "បង: ប (ឆ្វេង) + ង (ឆ្វេង)។ ហង្ស: ហ (ស្តាំ) + ង (ឆ្វេង) + ស (ឆ្វេង) + ៍ (ស្តាំ)។"
          },
          {
            "id": "w5-l3-s3",
            "kind": "sentence",
            "titleKh": "ល្បះតុល្យភាពដៃទាំងពីរ (Bilateral Balance Sentences)",
            "titleEn": "Bilateral Sentences — Coordinated Fluency",
            "mission": "វាយប្រយោគពេញលេញដែលមានតុល្យភាពស្មើគ្នារវាងដៃឆ្វេង និងដៃស្តាំ។",
            "skill": "Balanced bilateral typing flow with zero midline crossing errors.",
            "mechanic": "Multi-clause sentence validation under 95% accuracy.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "បងប្អូនទាំងអស់គ្នាត្រូវចេះជួយទុក្ខលំបាកគ្នាក្នុងគ្រាលំបាក។",
              "កងកម្លាំងការពារជាតិបំពេញភារកិច្ចការពារទឹកដីដោយស្មោះត្រង់។",
              "មាតុភូមិកម្ពុជាជាទីកន្លែងកំណើតយ៉ាងកក់ក្តៅរបស់ប្រជាជនយើង។",
              "ការងារដែលធ្វើឡើងដោយសាមគ្គីភាពតែងតែទទួលបានផលល្អប្រសើរ។",
              "ធម្មជាតិស្រស់បំព្រងផ្តល់នូវភាពស្ងប់សុខដល់ផ្លូវចិត្តរបស់យើង។"
            ],
            "hint": "រក្សាចង្វាក់វាយឲ្យស្មើ មិនបាច់ប្រញាប់។"
          }
        ]
      },
      {
        "id": 4,
        "labelKh": "ភាពត្រឹមត្រូវនៃគ្រាប់ចុច ប្តូរ",
        "labelEn": "Modifier Accuracy",
        "category": "Accuracy Remediation",
        "skillCategory": "modifier-accuracy",
        "objective": "កែលម្អភាពសុក្រឹតនៃការចុច និងលែងគ្រាប់ចុច ប្តូរ (កុំឲ្យជាប់ ប្តូរ លើអក្សរបន្ទាប់ ឬលែង ប្តូរ លឿនពេក)។",
        "focusKeys": [
          "ប្តូរ Timing",
          "ចុចជាប់",
          "លែងទាន់ពេល",
          "ធ",
          "គ",
          "ព",
          "ភ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "ក្បួន ប្តូរ ៣ ជំហាន៖ ១.ចុច ប្តូរ ឲ្យជាប់ -> ២.ចុចគ្រាប់ចុចគោលដៅ -> ៣.លែង ប្តូរ ភ្លាម។",
        "unicodeOutputExplained": "ការកំណត់ពេល (Timing) នៃការសង្កត់ និងលែង ប្តូរ ឲ្យបានត្រឹមត្រូវ។",
        "successCriteria": "វាយពាក្យ ប្តូរ ចម្រុះដោយគ្មានកំហុស Timing ភាពត្រឹមត្រូវ ៩៥% ឡើងទៅ។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 34,
        "stages": [
          {
            "id": "w5-l4-s1",
            "kind": "warmup",
            "titleKh": "កំណត់ពេល ប្តូរ (ប្តូរ Timing Drills)",
            "titleEn": "ប្តូរ Timing — Hold, Strike, Release",
            "mission": "ហាត់វាយអក្សរ ប្តូរ តែមួយតួ នៅកណ្តាលអក្សរធម្មតា (ក-ធ-ក, ស-គ-ស)។",
            "skill": "Precise modifier hold-and-release timing without leaking to adjacent keys.",
            "mechanic": "Isolated modifier stroke sandwiched between base keys.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "កធក",
              "សគស",
              "ដពដ",
              "លភល",
              "តជត",
              "មឃម",
              "នញន",
              "ចឡច",
              "កធកគ",
              "សពសភ"
            ],
            "hint": "សង្កត់ ប្តូរ -> ចុចអក្សរ -> លែង ប្តូរ ភ្លាម មុននឹងចុចអក្សរបន្ទាប់!"
          },
          {
            "id": "w5-l4-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យប្តូរ ប្តូរ រហ័ស (Rapid ប្តូរ Transition Words)",
            "titleEn": "Rapid Transitions — Base and ប្តូរ Alternations",
            "mission": "វាយពាក្យដែលប្តូររវាងអក្សរធម្មតា និងអក្សរ ប្តូរ ជាប់ៗគ្នា។",
            "skill": "Rapid alternation between shifted and unshifted keystrokes within words.",
            "mechanic": "Word patterns demanding tight modifier timing.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "គំនិត",
              "ភ្នំពេញ",
              "ធំធេង",
              "ភាសា",
              "វិជ្ជា",
              "ជំនួយ",
              "ពូកែ",
              "ជោគជ័យ",
              "ឡានទំនើប",
              "កោះកុង"
            ],
            "hint": "ពិនិត្យមើលកុំឲ្យជាប់ ប្តូរ លើអក្សរបន្ទាប់។"
          },
          {
            "id": "w5-l4-s3",
            "kind": "sentence",
            "titleKh": "ល្បះ ប្តូរ ឥតខ្ចោះ (Flawless ប្តូរ Sentences)",
            "titleEn": "Flawless ប្តូរ Flow — Sentence Level Precision",
            "mission": "វាយប្រយោគដែលមានការប្រើ ប្តូរ ចម្រុះដោយភាពច្បាស់លាស់បំផុត។",
            "skill": "Flawless modifier accuracy across multi-clause sentences.",
            "mechanic": "High-standard sentence validation under 95% accuracy.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "សិស្សានុសិស្សមានគំនិតធំធេងនិងចេះជួយគ្នាទៅវិញទៅមក។",
              "ភាសាខ្មែរជាភាសាជាតិស្រស់ស្អាតនិងមានតម្លៃមិនអាចកាត់ថ្លៃបាន។",
              "រាជធានីភ្នំពេញមានការអភិវឌ្ឍសំណង់ទំនើបៗជាច្រើន។",
              "យើងមានមោទនភាពចំពោះជោគជ័យធំធេងរបស់ប្រទេសជាតិយើង។",
              "ការចេះដឹងផ្នែកវិទ្យាសាស្ត្រនិងបច្ចេកវិទ្យានាំមកនូវភាពរីកចម្រើន។"
            ],
            "hint": "សង្កត់ ប្តូរ ឲ្យជាប់ មុនចុចអក្សរ រួចលែងឲ្យទាន់ពេល។"
          }
        ]
      },
      {
        "id": 5,
        "labelKh": "ល្បឿន និងភាពសុក្រឹតនៃជើងអក្សរ",
        "labelEn": "Fast Coeng Under Pressure",
        "category": "Accuracy Remediation",
        "skillCategory": "coeng-fluency",
        "objective": "បង្កើនល្បឿន និងភាពសុក្រឹតក្នុងការវាយជើងអក្សរ Coeng (KeyJ) ដោយគ្មានការភាន់ច្រឡំ ឬភ្លេចចុច ្។",
        "focusKeys": [
          "ជើងអក្សររហ័ស",
          "ខ្មែរ",
          "កម្ពុជា",
          "សិស្ស",
          "មន្ត្រី",
          "សង្គម"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "index",
          "middle",
          "ring",
          "pinky"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "កុំភ្លេចចុច J (្) មុនព្យញ្ជនជើងជាដាច់ខាត។ វាយដោយទំនុកចិត្ត និងចង្វាក់លឿន។",
        "unicodeOutputExplained": "ការវាយជើងអក្សរដោយរហ័ស និងមិនខុសលំដាប់។",
        "successCriteria": "វាយពាក្យមានជើងអក្សរដោយភាពត្រឹមត្រូវ ៩៥% និង CPM ៣៦ ឡើងទៅ។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 36,
        "stages": [
          {
            "id": "w5-l5-s1",
            "kind": "warmup",
            "titleKh": "ល្បឿនចុច Coeng (Coeng Reflex Drills)",
            "titleEn": "Coeng Reflexes — Fast Index Tap on J",
            "mission": "វាយជើងអក្សរទូទៅដោយចង្វាក់លឿន និងច្បាស់។",
            "skill": "Rapid reflex actuation of KeyJ for subscript binding.",
            "mechanic": "High-cadence Coeng trigger drills.",
            "targetCount": 12,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ខ្ម",
              "ក្ត",
              "ថ្ម",
              "ភ្ន",
              "ស្ង",
              "ក្ប",
              "ឆ្ក",
              "ទ្វ",
              "ច្ប",
              "ស្ន",
              "ក្រ",
              "ស្ល"
            ],
            "hint": "ម្រាមចង្អុលស្តាំចុច J យ៉ាងរហ័ស រួចចុចព្យញ្ជនជើងភ្លាម។"
          },
          {
            "id": "w5-l5-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យកម្រងជើងល្បឿនលឿន (Fast Cluster Words)",
            "titleEn": "Fast Cluster Words — Subscript Precision Under Pace",
            "mission": "វាយពាក្យកម្រងជើងអក្សរដោយរក្សាល្បឿន CPM ខ្ពស់។",
            "skill": "Fluid cluster word typing at elevated typing speeds.",
            "mechanic": "Paced cluster word challenges.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ខ្មែរ",
              "កម្ពុជា",
              "សិស្ស",
              "មន្ត្រី",
              "សង្គម",
              "កណ្តាល",
              "សេចក្តី",
              "បញ្ហា",
              "អភិវឌ្ឍ",
              "រដ្ឋបាល"
            ],
            "hint": "វាយដោយភាពជឿជាក់។ ចង្វាក់ស្មើជាគន្លឹះនៃល្បឿន។"
          },
          {
            "id": "w5-l5-s3",
            "kind": "sentence",
            "titleKh": "ល្បះជើងអក្សរល្បឿនលឿន (High-Speed Subscript Sentences)",
            "titleEn": "High-Speed Subscript Flow — Full Sentences",
            "mission": "វាយប្រយោគដែលមានជើងអក្សរច្រើនដោយល្បឿនលឿន និងភាពត្រឹមត្រូវ ៩៥%។",
            "skill": "Sustained typing speed on complex subscript-heavy text.",
            "mechanic": "Timed high-accuracy sentence execution.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "speedTargetCpm": 38,
            "practiceMode": "unicode-output",
            "items": [
              "ប្រជាជនកម្ពុជាខិតខំកសាងនិងអភិវឌ្ឍប្រទេសជាតិឲ្យរីកចម្រើន។",
              "សិស្សានុសិស្សគ្រប់រូបត្រូវគោរពលោកគ្រូអ្នកគ្រូនិងវិន័យសាលា។",
              "សេចក្តីព្យាយាមនិងសាមគ្គីភាពនាំមកនូវជោគជ័យត្រចះត្រចង់។",
              "មន្ត្រីរាជការបំពេញការងារបម្រើប្រជាពលរដ្ឋដោយស្មោះត្រង់និងសុចរិត។",
              "ប្រពៃណីខ្មែរសម្បូរបែបបានទទួលការកោតសរសើរពីអន្តរជាតិ។"
            ],
            "hint": "រក្សាចង្វាក់វាយឲ្យរលូន មិនបាច់បង្ខំ។"
          }
        ]
      },
      {
        "id": 6,
        "labelKh": "ការវាយពាក្យវែងៗដោយមិនខុស",
        "labelEn": "Sustained Precision on Long Words",
        "category": "Accuracy Remediation",
        "skillCategory": "long-words",
        "objective": "កសាងសមត្ថភាពក្នុងការវាយពាក្យបច្ចេកទេសវែងៗ និងពាក្យផ្សំច្រើនព្យាង្គដោយរក្សាការផ្តោតអារម្មណ៍ និងគ្មានកំហុស។",
        "focusKeys": [
          "ពាក្យវែងៗ",
          "សាកលវិទ្យាល័យ",
          "ប្រវត្តិសាស្ត្រ",
          "អន្តរជាតិ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "បំបែកពាក្យវែងជាព្យាង្គតូចៗក្នុងចិត្ត រួចវាយតាមលំដាប់មួយៗដោយម៉ត់ចត់។",
        "unicodeOutputExplained": "ការវាយពាក្យវែងៗដែលមានច្រើនព្យាង្គ និងជើងអក្សរច្រើនជាន់។",
        "successCriteria": "វាយពាក្យវែងៗដោយភាពត្រឹមត្រូវ ៩៥% ឡើងទៅ។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 36,
        "stages": [
          {
            "id": "w5-l6-s1",
            "kind": "warmup",
            "titleKh": "ពាក្យ ៣-៤ ព្យាង្គ (Three to Four Syllable Words)",
            "titleEn": "Multi-Syllable Warmup — 3-4 Syllable Terms",
            "mission": "វាយពាក្យ ៣ ទៅ ៤ ព្យាង្គដោយរក្សាភាពត្រឹមត្រូវខ្ពស់។",
            "skill": "Sustained mental concentration across multi-syllable terms.",
            "mechanic": "Extended syllable sequence drills.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "សាកលវិទ្យាល័យ",
              "ប្រវត្តិសាស្ត្រ",
              "អន្តរជាតិ",
              "បច្ចេកវិទ្យា",
              "សេដ្ឋកិច្ច",
              "រាជរដ្ឋាភិបាល",
              "គមនាគមន៍",
              "សុខាភិបាល",
              "ប្រពៃណីជាតិ",
              "សហប្រតិបត្តិការ"
            ],
            "hint": "សាកលវិទ្យាល័យ: សាកល + វិទ្យា + ល័យ។ វាយមួយព្យាង្គម្តងៗ។"
          },
          {
            "id": "w5-l6-s2",
            "kind": "pattern",
            "titleKh": "ឃ្លាបច្ចេកទេស និងរដ្ឋបាល (Administrative Terms)",
            "titleEn": "Administrative Terms — Technical Compound Phrases",
            "mission": "វាយឃ្លារដ្ឋបាល និងបច្ចេកទេសដែលមានពាក្យវែងៗជាប់គ្នា។",
            "skill": "High accuracy on formal and administrative Khmer compound phrases.",
            "mechanic": "Complex compound phrase typing.",
            "targetCount": 8,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ក្រសួងអប់រំយុវជននិងកីឡា",
              "ព្រះរាជាណាចក្រកម្ពុជា",
              "ការអភិវឌ្ឍសេដ្ឋកិច្ចសង្គម",
              "វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា",
              "មន្ទីរពេទ្យកាល់ម៉ែត",
              "រាជបណ្ឌិត្យសភាកម្ពុជា",
              "បេតិកភណ្ឌពិភពលោក",
              "សហគមន៍អន្តរជាតិ"
            ],
            "hint": "សង្កេតពាក្យទាំងមូល រួចវាយដោយចង្វាក់ស្មើ។"
          },
          {
            "id": "w5-l6-s3",
            "kind": "sentence",
            "titleKh": "ល្បះផ្លូវការពេញលេញ (Formal Multi-Clause Sentences)",
            "titleEn": "Formal Sentences — Technical Text Flow",
            "mission": "វាយប្រយោគផ្លូវការពេញលេញដែលមានពាក្យបច្ចេកទេសវែងៗ។",
            "skill": "Flawless typing of formal, administrative, and academic sentences.",
            "mechanic": "Extended formal sentence validation.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ក្រសួងអប់រំយុវជននិងកីឡាបានដាក់ចេញនូវផែនការយុទ្ធសាស្ត្រថ្មី។",
              "ការស្រាវជ្រាវវិទ្យាសាស្ត្រនិងបច្ចេកវិទ្យាជួយជំរុញសេដ្ឋកិច្ចជាតិឲ្យលូតលាស់។",
              "សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញជាគ្រឹះស្ថានឧត្តមសិក្សាចំណាស់ជាងគេ។",
              "យើងទាំងអស់គ្នាត្រូវចូលរួមចំណែកការពារបរិស្ថានដើម្បីការអភិវឌ្ឍប្រកបដោយចីរភាព។",
              "ទំនាក់ទំនងអន្តរជាតិជួយពង្រឹងកិច្ចសហប្រតិបត្តិការរវាងប្រទេសនានា។"
            ],
            "hint": "វាយដោយភាពម៉ត់ចត់។ ភាពត្រឹមត្រូវជាចម្បង!"
          }
        ]
      },
      {
        "id": 7,
        "labelKh": "ចង្វាក់វាយអក្សរស្មើ និងទៀងទាត់",
        "labelEn": "Rhythmic Consistency Drills",
        "category": "Pacing & Consistency",
        "skillCategory": "pacing-fluency",
        "objective": "បង្កើតចង្វាក់វាយអក្សរស្មើ និងទៀងទាត់ដូចចង្វាក់មេត្រូនូម (Metronome) ដោយគ្មានការឈប់ស្ទាក់ស្ទើរ ឬចុចញាប់ពេក។",
        "focusKeys": [
          "ចង្វាក់ស្មើ",
          "ទៀងទាត់",
          "មិនបង្ខំ",
          "រលូន"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយដោយចង្វាក់ចុចស្មើគ្នាលើគ្រប់គ្រាប់ចុច មិនចុចលឿនពេកហើយឈប់គាំងឡើយ។",
        "unicodeOutputExplained": "ចង្វាក់វាយអក្សរទៀងទាត់ (Rhythmic Cadence) នាំមកនូវល្បឿនពិតប្រាកដ។",
        "successCriteria": "រក្សាចង្វាក់ស្មើ និងភាពត្រឹមត្រូវ ៩៥% លើអត្ថបទបន្តបន្ទាប់។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 38,
        "stages": [
          {
            "id": "w5-l7-s1",
            "kind": "warmup",
            "titleKh": "លំហាត់ចង្វាក់ស្មើ (Metronome Cadence Drills)",
            "titleEn": "Metronome Drills — Steady Cadence Warmup",
            "mission": "វាយពាក្យខ្លីៗដោយចង្វាក់ចុចស្មើគ្នា មិនប្រញាប់ មិនស្ទាក់ស្ទើរ។",
            "skill": "Steady rhythmic cadence: even time interval between every keystroke.",
            "mechanic": "Cadence stabilization exercises.",
            "targetCount": 12,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "សាលា",
              "កុមារ",
              "រៀនសូត្រ",
              "មានបាន",
              "ទឹកដី",
              "ភាសា",
              "គំនិត",
              "ការងារ",
              "ជីវិត",
              "សង្គម",
              "ប្រទេស",
              "ជោគជ័យ"
            ],
            "hint": "ចុចមួយៗស្មើចង្វាក់៖ ១... ២... ៣... ៤... ដោយមិនឈប់គាំង។"
          },
          {
            "id": "w5-l7-s2",
            "kind": "pattern",
            "titleKh": "ឃ្លាចង្វាក់វែង (Extended Cadence Phrases)",
            "titleEn": "Extended Cadence — Sustained Regular Flow",
            "mission": "វាយឃ្លាវែងៗដោយរក្សាចង្វាក់ចុចឲ្យនៅដដែលតាំងពីដើមដល់ចប់។",
            "skill": "Maintaining cadence stability through changing character complexity.",
            "mechanic": "Continuous rhythmic phrase typing.",
            "targetCount": 8,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ការខិតខំរៀនសូត្រជារៀងរាល់ថ្ងៃ",
              "សេចក្តីព្យាយាមតែងនាំមកជោគជ័យ",
              "យើងស្រឡាញ់ទឹកដីកំណើតរបស់យើង",
              "ការអានសៀវភៅជួយពង្រីកចំណេះដឹង",
              "សាមគ្គីភាពជាកម្លាំងយ៉ាងរឹងមាំបំផុត",
              "ចំណេះវិជ្ជាជាទ្រព្យជាប់ខ្លួនមួយជីវិត",
              "ការរស់នៅដោយសុចរិតនាំមកសេចក្តីសុខ",
              "យុវជនជាទំពាំងស្នងឫស្សីនៃជាតិ"
            ],
            "hint": "រក្សាល្បឿនដដែល ទោះបីជួបពាក្យមានជើងអក្សរក្តី។"
          },
          {
            "id": "w5-l7-s3",
            "kind": "sentence",
            "titleKh": "ល្បះចង្វាក់រលូន (Smooth Cadence Sentences)",
            "titleEn": "Smooth Sentences — Uninterrupted Flow",
            "mission": "វាយប្រយោគពេញលេញដោយចង្វាក់រលូន និងភាពត្រឹមត្រូវ ៩៥%។",
            "skill": "Seamless typing cadence across varied grammatical structures.",
            "mechanic": "Full sentence flow checking cadence consistency.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "speedTargetCpm": 40,
            "practiceMode": "unicode-output",
            "items": [
              "ការវាយអក្សរដោយមានចង្វាក់ស្មើជួយឲ្យយើងវាយបានលឿននិងមិនងាយហត់។",
              "សិស្សគ្រប់រូបគប្បីហ្វឹកហាត់វាយអក្សរឲ្យបានទៀងទាត់ជារៀងរាល់ថ្ងៃ។",
              "នៅពេលដែលយើងចងចាំទីតាំងគ្រាប់ចុចច្បាស់ យើងអាចវាយបានដោយមិនបាច់មើល។",
              "ភាពត្រឹមត្រូវនិងចង្វាក់ស្មើជាមូលដ្ឋានគ្រឹះសំខាន់នៃអ្នកវាយអក្សរអាជីព។",
              "ការតាំងចិត្តខ្ពស់និងការអនុវត្តជាក់ស្តែងនឹងនាំយើងទៅដល់គោលដៅជោគជ័យ។"
            ],
            "hint": "ដកដង្ហើមវែងៗ។ រក្សាចង្វាក់ឲ្យដូចតន្ត្រីរលូន។"
          }
        ]
      },
      {
        "id": 8,
        "labelKh": "ការបង្កើនល្បឿន CPM ប្រកបដោយការគ្រប់គ្រង",
        "labelEn": "Controlled CPM Building",
        "category": "Pacing & Consistency",
        "skillCategory": "speed-building",
        "objective": "បង្កើនល្បឿនវាយអក្សរជាលំដាប់ (៤០ ទៅ ៦០ CPM) ដោយរក្សាភាពត្រឹមត្រូវលើសពី ៩៥% ជានិច្ច (មិនបណ្តោយឲ្យល្បឿនបំផ្លាញភាពត្រឹមត្រូវឡើយ)។",
        "focusKeys": [
          "បង្កើន CPM",
          "៤០ CPM",
          "៥០ CPM",
          "៦០ CPM",
          "ភាពត្រឹមត្រូវ ៩៥%"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "គោលការណ៍មាស៖ \"ភាពត្រឹមត្រូវជាចម្បង ល្បឿននឹងតាមមកដោយឯកឯង\"។ ហាមបង្ខំល្បឿនរហូតដល់ខុស។",
        "unicodeOutputExplained": "CPM (Characters Per Minute) ជាខ្នាតវាស់ល្បឿនផ្លូវការនៃអក្សរខ្មែរ។",
        "successCriteria": "សម្រេចបានល្បឿន ៤៥ CPM ឡើងទៅ ដោយរក្សាភាពត្រឹមត្រូវ ៩៥%។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 45,
        "stages": [
          {
            "id": "w5-l8-s1",
            "kind": "warmup",
            "titleKh": "ល្បឿនកម្រិត ១៖ ៤០ CPM (Speed Level 1: 40 CPM)",
            "titleEn": "Speed Tier 1 — 40 CPM Target with 95% Accuracy",
            "mission": "វាយពាក្យទូទៅដោយរក្សាល្បឿនយ៉ាងតិច ៤០ CPM និងភាពត្រឹមត្រូវ ៩៥%។",
            "skill": "Controlled pace acceleration reaching 40 CPM benchmark.",
            "mechanic": "Paced word challenges with real-time speed monitoring.",
            "targetCount": 12,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "សាលារៀន",
              "លោកគ្រូ",
              "សិស្សល្អ",
              "ភាសាខ្មែរ",
              "គណិតវិទ្យា",
              "សៀវភៅ",
              "ប៊ិកខៀវ",
              "កាតាប",
              "មេរៀន",
              "កិច្ចការ",
              "ចំណេះដឹង",
              "ជោគជ័យ"
            ],
            "hint": "រក្សាល្បឿនស្មើ ៤០ CPM។ កុំប្រញាប់រហូតដល់ខុស។"
          },
          {
            "id": "w5-l8-s2",
            "kind": "pattern",
            "titleKh": "ល្បឿនកម្រិត ២៖ ៥០ CPM (Speed Level 2: 50 CPM)",
            "titleEn": "Speed Tier 2 — 50 CPM Target with 95% Accuracy",
            "mission": "វាយឃ្លាមានន័យដោយបង្កើនល្បឿនដល់ ៥០ CPM។",
            "skill": "Elevating typing fluency to 50 CPM while sustaining 95% precision.",
            "mechanic": "Intermediate speed ramp validation.",
            "targetCount": 8,
            "accuracyGoal": 95,
            "speedTargetCpm": 50,
            "practiceMode": "unicode-output",
            "items": [
              "សិស្សានុសិស្សខិតខំរៀនសូត្រ",
              "ប្រទេសកម្ពុជាមានសន្តិភាពពេញលេញ",
              "យើងស្រឡាញ់ប្រពៃណីនិងប្រពៃណីជាតិ",
              "ការអានសៀវភៅផ្តល់នូវពន្លឺជីវិត",
              "សាមគ្គីភាពរឹងមាំនាំមកនូវជ័យជម្នះ",
              "ចំណេះវិជ្ជាបច្ចេកវិទ្យាជួយអភិវឌ្ឍជាតិ",
              "ការតស៊ូព្យាយាមតែងតែសម្រេចផលល្អ",
              "យុវជនជាកម្លាំងចលករមានឥទ្ធិពល"
            ],
            "hint": "ចង្វាក់រលូននាំមកនូវល្បឿន ៥០ CPM ដោយមិនដឹងខ្លួន។"
          },
          {
            "id": "w5-l8-s3",
            "kind": "sentence",
            "titleKh": "ល្បឿនកម្រិត ៣៖ ៦០ CPM (Speed Level 3: 60 CPM)",
            "titleEn": "Speed Tier 3 — 60 CPM Benchmark Mastery",
            "mission": "វាយអត្ថបទពេញលេញដោយសម្រេចបានល្បឿន ៦០ CPM និងភាពត្រឹមត្រូវ ៩៥%។",
            "skill": "Advanced touch-typing fluency achieving 60 CPM speed benchmark.",
            "mechanic": "High-speed paragraph trial testing graduation readiness.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "speedTargetCpm": 60,
            "practiceMode": "unicode-output",
            "items": [
              "ការអប់រំជាមូលដ្ឋានគ្រឹះសំខាន់ក្នុងការកសាងធនធានមនុស្សសម្រាប់អភិវឌ្ឍប្រទេសជាតិ។",
              "ភាសាខ្មែរជាសម្បត្តិប្រពៃណីវិសេសវិសាលដែលយើងទាំងអស់គ្នាត្រូវរួមគ្នាថែរក្សាការពារ។",
              "យុវជនជំនាន់ក្រោយគប្បីខិតខំក្រេបជញ្ជក់ចំណេះដឹងនិងបច្ចេកវិទ្យាដើម្បីកសាងអនាគតភ្លឺស្វាង។",
              "ការរៀនវាយអក្សរខ្មែរឲ្យបានស្ទាត់ជំនាញជួយបង្កើនប្រសិទ្ធភាពក្នុងការសិក្សានិងការងារ។",
              "សេចក្តីព្យាយាមនិងការតស៊ូជួយឲ្យយើងជម្នះបាននូវរាល់ឧបសគ្គទាំងឡាយក្នុងជីវិតរស់នៅ។"
            ],
            "hint": "សម្រេចបាន ៦០ CPM និងភាពត្រឹមត្រូវ ៩៥%! អ្នកជាកំពូលអ្នកវាយអក្សរហើយ!"
          }
        ]
      },
      {
        "id": "boss",
        "labelKh": "អ្នកយាមភ្នំភ្លើង (Volcano Champion Trial)",
        "labelEn": "Volcano Champion — High Accuracy Trial",
        "category": "World Boss Mastery",
        "skillCategory": "accuracy-mastery",
        "objective": "ប្រឡងជាប់ពិភពទី ៥ ដោយបង្ហាញភាពស្ទាត់ជំនាញពេញលេញ៖ ភាពត្រឹមត្រូវ ៩៥%+, គ្មានកំហុស ប្តូរ, ចង្វាក់ស្មើ និងល្បឿនលឿនក្រោមសម្ពាធ។",
        "focusKeys": [
          "បច្ចេកទេសទាំងអស់នៃពិភពទី ៥"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយអត្ថបទប្រឡងដោយភាពត្រឹមត្រូវ ៩៥% ឡើងទៅ។ កំហុសតិចតួចបំផុត! ",
        "unicodeOutputExplained": "ការប្រឡងបញ្ចប់ពិភពទី ៥៖ ភាពត្រឹមត្រូវខ្ពស់បំផុត គ្មានការចុចខុសគ្រាប់ចុច។",
        "successCriteria": "ឆ្លងកាត់ទាំង ៣ Wave ដោយជោគជ័យ ដើម្បីដោះសោពិភពចុងក្រោយ (Royal Angkor)។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 45,
        "stages": [
          {
            "id": "w5-boss-s1",
            "kind": "boss",
            "titleKh": "Wave ភាពត្រឹមត្រូវ ៩៥% (95% Accuracy Wave)",
            "titleEn": "Boss Wave 1 — Precision Under Pressure",
            "mission": "វាយពាក្យដែលងាយច្រឡំ និងពាក្យ ប្តូរ ដោយភាពត្រឹមត្រូវ ៩៥% ឡើងទៅ។",
            "skill": "High-precision typing on vulnerable keys under test conditions.",
            "mechanic": "Zero-tolerance word wave testing finger discipline.",
            "targetCount": 12,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ថាស",
              "ធុង",
              "ដី",
              "ឌី",
              "តា",
              "ទា",
              "សេះ",
              "ដៃ",
              "ឆាប់",
              "ឈើ",
              "ខុស",
              "ឃ្មុំ"
            ],
            "hint": "ភាពត្រឹមត្រូវជាចម្បង។ វាយមួយៗឲ្យច្បាស់!"
          },
          {
            "id": "w5-boss-s2",
            "kind": "boss",
            "titleKh": "Wave ពាក្យវែង និងចង្វាក់ស្មើ (Long Words & Cadence Wave)",
            "titleEn": "Boss Wave 2 — Sustained Cadence on Long Words",
            "mission": "វាយពាក្យបច្ចេកទេសវែងៗដោយចង្វាក់ស្មើ និងល្បឿន ៤៥ CPM។",
            "skill": "Cadence stability on complex multi-part words under timed pressure.",
            "mechanic": "Extended compound word wave.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "speedTargetCpm": 45,
            "practiceMode": "unicode-output",
            "items": [
              "សាកលវិទ្យាល័យ",
              "ប្រវត្តិសាស្ត្រ",
              "អន្តរជាតិ",
              "បច្ចេកវិទ្យា",
              "សេដ្ឋកិច្ច",
              "រាជរដ្ឋាភិបាល",
              "គមនាគមន៍",
              "សុខាភិបាល",
              "ប្រពៃណីជាតិ",
              "សហប្រតិបត្តិការ"
            ],
            "hint": "រក្សាចង្វាក់ស្មើ។ កុំប្រញាប់!"
          },
          {
            "id": "w5-boss-s3",
            "kind": "boss",
            "titleKh": "Wave ម្ចាស់ភ្នំភ្លើងស្រមោល (Volcano Champion Wave)",
            "titleEn": "Boss Wave 3 — Ultimate Shadow Volcano Trial",
            "mission": "វាយអត្ថបទពេញលេញដោយសម្រេចបានភាពត្រឹមត្រូវ ៩៥% និងល្បឿន ៥០ CPM។",
            "skill": "Mastery of disciplined, rhythmic, high-speed touch typing.",
            "mechanic": "Final boss trial securing graduation from World 5.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "speedTargetCpm": 50,
            "practiceMode": "unicode-output",
            "items": [
              "ការហ្វឹកហាត់ដោយការតស៊ូព្យាយាមបាននាំយើងឆ្លងផុតឧបសគ្គគ្រប់បែបយ៉ាង។ ឥឡូវនេះម្រាមដៃរបស់យើងមានភាពរហ័សរហួននិងចងចាំទីតាំងគ្រាប់ចុចបានយ៉ាងស្ទាត់ជំនាញ៕",
              "ភាពត្រឹមត្រូវនិងចង្វាក់ស្មើជាកម្លាំងស្នូលដែលជួយឲ្យយើងវាយអក្សរបានលឿននិងឥតខ្ចោះ។ យើងត្រៀមខ្លួនរួចរាល់ហើយដើម្បីឈានទៅកាន់ពិភពចុងក្រោយនៅអង្គររាជធានី៕",
              "ចំណេះដឹងផ្នែកបច្ចេកវិទ្យានិងការវាយអក្សរខ្មែរតាមប្រព័ន្ធកុំព្យូទ័រជាទ្រព្យសម្បត្តិមានតម្លៃសម្រាប់អនាគត។ យើងមានមោទនភាពចំពោះការលះបង់និងការខិតខំប្រឹងប្រែងរបស់យើង៕",
              "សាមគ្គីភាពនិងការតាំងចិត្តមុតមាំនឹងជួយឲ្យយើងសម្រេចបាននូវរាល់បំណងប្រាថ្នាទាំងអស់ក្នុងជីវិត។ គ្មានអ្វីដែលអាចរារាំងអ្នកដែលមានការតាំងចិត្តពិតប្រាកដបានឡើយ៕",
              "សូមអបអរសាទរចំពោះជ័យជម្នះត្រចះត្រចង់នៅភ្នំភ្លើងស្រមោល! អ្នកបានក្លាយជាអ្នកវាយអក្សរមានសមត្ថភាពខ្ពស់ហើយ៕"
            ],
            "hint": "អ្នកបានយកឈ្នះពិភពទី ៥ ហើយ! ត្រៀមខ្លួនសម្រាប់ Angkor Kingdom!"
          }
        ]
      }
    ]
  },
  {
    "id": 6,
    "title": "Royal Angkor",
    "titleKh": "អង្គររាជធានី",
    "subtitle": "ឯករាជ្យភាព ភាពស្ទាត់ជំនាញ និងវីរបុរសវាយអក្សរខ្មែរ",
    "theme": "National Heritage & Mastery",
    "mainLessonKh": "វាយអត្ថបទខ្មែរគ្រប់ទម្រង់ដោយឯករាជ្យ គ្មានការជំនួយ ភាពត្រឹមត្រូវខ្ពស់ និងល្បឿនស្ទាត់",
    "mainLessonEn": "Complete touch-typing independence, complex cultural texts, and heroic fluency",
    "skillFocus": "Autonomous touch typing, long multi-sentence passages, and Angkor mastery.",
    "unicodeFocus": "Independent vowels, multi-subscript compounds, literary text, and final champion challenges.",
    "levels": [
      {
        "id": 1,
        "labelKh": "ការរំលឹកគ្រាប់ចុចពេញក្តារចុច",
        "labelEn": "Full Keyboard Recall",
        "category": "Autonomous Mastery",
        "skillCategory": "full-recall",
        "objective": "រំលឹកគ្រាប់ចុចទាំងអស់លើក្តារចុចខ្មែរ (ជួរកណ្តាល ជួរលើ ជួរក្រោម ស្រទាប់ ប្តូរ និង AltGr) ដោយឯករាជ្យភាព ១០០%។",
        "focusKeys": [
          "គ្រប់គ្រាប់ចុចទាំងអស់",
          "ស្វ័យប្រវត្តិ",
          "ការវាយអក្សរដោយមិនបាច់មើលក្តារចុច"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយដោយមិនបាច់មើលដៃ ឬក្តារចុចឡើយ។ ភ្នែកសម្លឹងមើលតែអេក្រង់។",
        "unicodeOutputExplained": "ការវាយអក្សរដោយចងចាំទីតាំងគ្រាប់ចុចក្នុងសាច់ដុំ (Muscle Memory)។",
        "successCriteria": "វាយអត្ថបទរំលឹកពេញក្តារចុចដោយភាពត្រឹមត្រូវ ៩៥% ឡើងទៅ។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 40,
        "stages": [
          {
            "id": "w6-l1-s1",
            "kind": "warmup",
            "titleKh": "រំលឹកគ្រប់ស្រទាប់ក្តារចុច (Full Layer Recall)",
            "titleEn": "Full Layer Recall — Base, ប្តូរ & AltGr Integration",
            "mission": "វាយពាក្យដែលប្រមូលផ្តុំគ្រប់ស្រទាប់នៃក្តារចុចខ្មែរ។",
            "skill": "Instant access to all keyboard layers without visual reliance.",
            "mechanic": "Multi-layer key recall challenge.",
            "targetCount": 12,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "សាលា",
              "ធំធេង",
              "ក្មេងៗ",
              "ភ្នំពេញ",
              "រៀនសូត្រ",
              "កម្ពុជា",
              "ឯកសារ",
              "ឱកាស",
              "ប្រវត្តិ",
              "ជ័យជំនះ",
              "មនុស្ស",
              "សន្តិភាព"
            ],
            "hint": "ភ្នែកសម្លឹងមើលតែអក្សរលើអេក្រង់។ ទុកចិត្តលើម្រាមដៃរបស់អ្នក!"
          },
          {
            "id": "w6-l1-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យបន្សំគ្រប់ជួរ (Cross-Row Compound Words)",
            "titleEn": "Cross-Row Compounds — Dynamic Finger Coordination",
            "mission": "វាយពាក្យដែលរួមបញ្ចូលអក្សរពីគ្រប់ជួរទាំងអស់។",
            "skill": "Seamless full-keyboard transitions across all rows and modifiers.",
            "mechanic": "Full-keyboard compound word challenge.",
            "targetCount": 10,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ប្រាសាទអង្គរវត្ត",
              "រាជធានីភ្នំពេញ",
              "ព្រះរាជាណាចក្រកម្ពុជា",
              "សាកលវិទ្យាល័យភូមិន្ទ",
              "ក្រសួងអប់រំយុវជននិងកីឡា",
              "ប្រពៃណីនិងកេរដំណែលខ្មែរ",
              "សាមគ្គីភាពជាតិខ្មែរ",
              "ការស្រាវជ្រាវវិទ្យាសាស្ត្រ",
              "ការអភិវឌ្ឍប្រកបដោយចីរភាព",
              "មរតកដូនតាខ្មែរ"
            ],
            "hint": "រក្សាចង្វាក់វាយឲ្យរលូន មិនបាច់ប្រញាប់។"
          },
          {
            "id": "w6-l1-s3",
            "kind": "sentence",
            "titleKh": "ល្បះរំលឹកស្ទាត់ជំនាញ (Recall Fluency Sentences)",
            "titleEn": "Recall Sentences — Natural Expression Flow",
            "mission": "វាយប្រយោគពេញលេញដែលបង្ហាញពីការចងចាំទីតាំងគ្រាប់ចុចឥតខ្ចោះ។",
            "skill": "Flawless typing across multi-clause sentences without keyboard looking.",
            "mechanic": "High-speed autonomous sentence validation.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "practiceMode": "unicode-output",
            "items": [
              "ប្រាសាទអង្គរវត្តជាបេះដូងនិងជាព្រលឹងនៃប្រជាជាតិខ្មែរគ្រប់រូប។",
              "យើងមានមោទនភាពយ៉ាងក្រៃលែងចំពោះភាពអស្ចារ្យនៃបុព្វបុរសយើង។",
              "ការរៀនវាយអក្សរខ្មែរតាមប្រព័ន្ធកុំព្យូទ័រជាការលើកស្ទួយអក្សរសាស្ត្រជាតិ។",
              "សិស្សានុសិស្សគប្បីខិតខំរៀនសូត្រដើម្បីក្លាយជាទំពាំងស្នងឫស្សីយ៉ាងរឹងមាំ។",
              "សន្តិភាពនិងស្ថិរភាពនយោបាយជាកត្តាចាំបាច់បំផុតសម្រាប់ការអភិវឌ្ឍ។"
            ],
            "hint": "វាយមួយៗដោយភាពជឿជាក់ និងស្ងប់ស្ងាត់។"
          }
        ]
      },
      {
        "id": 2,
        "labelKh": "ស្រៈពេញតួ និងសញ្ញាកម្រ",
        "labelEn": "Independent Vowels & Rare Signs",
        "category": "Autonomous Mastery",
        "skillCategory": "independent-vowels",
        "objective": "រៀន និងអនុវត្តការវាយស្រៈពេញតួទាំងអស់៖ ឥ, ឦ, ឧ, ឩ, ឪ, ឫ, ឬ, ឯ, ឱ, ឰ និងសញ្ញាកម្រៗ។",
        "focusKeys": [
          "ឥ",
          "ឦ",
          "ឧ",
          "ឩ",
          "ឪ",
          "ឫ",
          "ឬ",
          "ឯ",
          "ឱ",
          "ឰ",
          "ឥស្សរជន",
          "ឧត្តម"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "ស្រៈពេញតួប្រើសម្រាប់ពាក្យបាលី-សំស្ក្រឹត ឬពាក្យខ្មែរបុរាណ។ វាយតាមគ្រាប់ចុចជាក់លាក់របស់វា។",
        "unicodeOutputExplained": "Minus=ឥ, BracketRight+ប្តូរ=ឧ, BracketRight=ឪ, KeyR+ប្តូរ=ឬ, AltGr+E=ឯ, AltGr+O=ឱ, AltGr+R=ឫ",
        "successCriteria": "វាយស្រៈពេញតួ និងពាក្យកម្រដោយភាពត្រឹមត្រូវ ៩៤% ឡើងទៅ។",
        "minimumAccuracy": 94,
        "speedTargetCpm": 38,
        "stages": [
          {
            "id": "w6-l2-s1",
            "kind": "warmup",
            "titleKh": "ស្រៈពេញតួទូទៅ (Independent Vowels Warmup)",
            "titleEn": "Independent Vowels — ឥ, ឧ, ឪ, ឯ, ឱ, ឬ, ឫ",
            "mission": "ហាត់វាយស្រៈពេញតួទូទៅក្នុងភាសាខ្មែរ។",
            "skill": "Keystroke mastery for Khmer independent vowels.",
            "mechanic": "Independent vowel key identification drills.",
            "targetCount": 10,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "ឥស្សរជន",
              "ឧត្តម",
              "ឪពុក",
              "ឯកសារ",
              "ឱកាស",
              "ឬទ្ធី",
              "ឫស្សី",
              "ឩឡារិក",
              "នៅឯ",
              "ឥទ្ធិពល"
            ],
            "hint": "ឥ: Minus (-)។ ឧ: ប្តូរ + BracketRight (])។ ឪ: BracketRight (])។ ឯ: AltGr + E។ ឱ: AltGr + O។"
          },
          {
            "id": "w6-l2-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យបាលី-សំស្ក្រឹត (Pali-Sanskrit Vocabulary)",
            "titleEn": "Pali-Sanskrit Words — Classical Orthography",
            "mission": "វាយពាក្យខ្មែរខ្ពង់ខ្ពស់ដែលផ្តើមដោយស្រៈពេញតួ។",
            "skill": "Typing classical literary terms with independent vowel initials.",
            "mechanic": "Literary word typing challenges.",
            "targetCount": 8,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "ឥស្សរភាព",
              "ឧត្តមសេនីយ៍",
              "ឪឡឹក",
              "ឯករាជ្យជាតិ",
              "ឱសថស្ថាន",
              "ឬកពារ",
              "ឫទ្ធានុភាព",
              "ឧស្សាហកម្ម"
            ],
            "hint": "សង្កេតគ្រាប់ចុចនៃស្រៈពេញតួនីមួយៗឲ្យបានច្បាស់។"
          },
          {
            "id": "w6-l2-s3",
            "kind": "sentence",
            "titleKh": "ល្បះអក្សរសិល្ប៍បុរាណ (Literary Sentences)",
            "titleEn": "Literary Sentences — Classical Khmer Texts",
            "mission": "វាយប្រយោគអក្សរសិល្ប៍ដែលមានស្រៈពេញតួ និងពាក្យបុរាណ។",
            "skill": "Flawless execution of formal and classical sentences.",
            "mechanic": "Full literary sentence validation.",
            "targetCount": 5,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "ឯករាជ្យ បូរណភាពទឹកដី និងសន្តិភាព ជាបំណងប្រាថ្នារបស់ជាតិយើង។",
              "ឥស្សរជនជាន់ខ្ពស់បានចូលរួមក្នុងពិធីបុណ្យជាតិយ៉ាងឱឡារិក។",
              "ឪពុកម្តាយតែងតែប្រាថ្នាឲ្យកូនៗមានអនាគតឧត្តុង្គឧត្តម។",
              "ឱសថបុរាណខ្មែរផ្សំឡើងពីដើមរុក្ខជាតិនិងឫសឈើក្នុងព្រៃធម្មជាតិ។",
              "ការមានឫកពារថ្លៃថ្នូរនិងចរិយាសម្បត្តិល្អនាំមកនូវការគោរពស្រឡាញ់។"
            ],
            "hint": "វាយដោយភាពម៉ត់ចត់ និងគោរពអក្ខរាវិរុទ្ធខ្មែរ។"
          }
        ]
      },
      {
        "id": 3,
        "labelKh": "ពាក្យបច្ចេកទេស និងកម្រងជើងស្មុគស្មាញ",
        "labelEn": "Compound Words & Multi-Subscripts",
        "category": "Autonomous Mastery",
        "skillCategory": "compound-words",
        "objective": "អនុវត្តការវាយពាក្យបច្ចេកទេស កម្រងជើងស្មុគស្មាញ និងពាក្យដែលមានរចនាសម្ព័ន្ធអក្សរច្រើនជាន់។",
        "focusKeys": [
          "កិត្តិយស",
          "វិញ្ញាសា",
          "ប្រពៃណី",
          "កេរដំណែល",
          "សេដ្ឋកិច្ច",
          "ប្រជាជាតិ"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "កិត្តិយស: ក + ិ + ្ + ត + ្ + ត + ិ + [ដកឃ្លា] + យ + ស។ (ជើង ត ពីរជាន់: ្ + ត + ្ + ត)។",
        "unicodeOutputExplained": "ពាក្យដែលមានជើងអក្សរជាន់គ្នា ឬបន្តបន្ទាប់គ្នា។",
        "successCriteria": "វាយពាក្យកម្រងជើងស្មុគស្មាញដោយភាពត្រឹមត្រូវ ៩៤% ឡើងទៅ។",
        "minimumAccuracy": 94,
        "speedTargetCpm": 40,
        "stages": [
          {
            "id": "w6-l3-s1",
            "kind": "warmup",
            "titleKh": "ពាក្យជើងពីរជាន់ (Multi-Subscript Warmup)",
            "titleEn": "Multi-Subscripts — កិត្តិ, សន្តិ, វិញ្ញា",
            "mission": "វាយពាក្យដែលមានជើងអក្សរច្រើនជាន់ ឬបន្តបន្ទាប់គ្នា។",
            "skill": "Sustained typing accuracy on double-subscript words.",
            "mechanic": "Double-subscript typing drills.",
            "targetCount": 10,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "កិត្តិយស",
              "វិញ្ញាសា",
              "សន្តិភាព",
              "កេរដំណែល",
              "ប្រពៃណី",
              "សេដ្ឋកិច្ច",
              "ប្រជាជាតិ",
              "អភិវឌ្ឍន៍",
              "កិច្ចការ",
              "មិត្តភក្តិ"
            ],
            "hint": "កិត្តិ: ក + ិ + ្ + ត + ្ + ត + ិ។"
          },
          {
            "id": "w6-l3-s2",
            "kind": "pattern",
            "titleKh": "ពាក្យវិទ្យាសាស្ត្រ និងសង្គម (Scientific & Social Terms)",
            "titleEn": "Scientific & Social Terms — Complex Compounds",
            "mission": "វាយពាក្យបច្ចេកទេសក្នុងវិស័យវិទ្យាសាស្ត្រ សេដ្ឋកិច្ច និងសង្គម។",
            "skill": "Typing technical academic terms with intricate orthography.",
            "mechanic": "Specialized terminology typing challenges.",
            "targetCount": 8,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "បច្ចេកវិទ្យាគមនាគមន៍",
              "ការអភិវឌ្ឍធនធានមនុស្ស",
              "បរិស្ថានវិទ្យានិងជីវចម្រុះ",
              "ប្រព័ន្ធគ្រប់គ្រងរដ្ឋបាល",
              "សេដ្ឋកិច្ចឌីជីថល",
              "សាកលភាវូបនីយកម្ម",
              "លទ្ធិប្រជាធិបតេយ្យ",
              "សិទ្ធិមនុស្សនិងសេរីភាព"
            ],
            "hint": "បំបែកពាក្យវែងជាព្យាង្គៗក្នុងចិត្ត វាយដោយចង្វាក់ស្មើ។"
          },
          {
            "id": "w6-l3-s3",
            "kind": "sentence",
            "titleKh": "ល្បះបច្ចេកទេសពេញលេញ (Technical Sentences)",
            "titleEn": "Technical Sentences — Academic Text Flow",
            "mission": "វាយប្រយោគបច្ចេកទេសពេញលេញដោយគ្មានកំហុស។",
            "skill": "Flawless typing of academic and governmental prose.",
            "mechanic": "Extended technical sentence validation.",
            "targetCount": 5,
            "accuracyGoal": 94,
            "practiceMode": "unicode-output",
            "items": [
              "ការអភិវឌ្ឍបច្ចេកវិទ្យាគមនាគមន៍ជួយជំរុញសេដ្ឋកិច្ចឌីជីថលឲ្យរីកចម្រើន។",
              "រាជរដ្ឋាភិបាលកម្ពុជាបានដាក់ចេញនូវយុទ្ធសាស្ត្របញ្ចកោណដំណាក់កាលទីមួយ។",
              "ការបណ្តុះបណ្តាលធនធានមនុស្សជាគន្លឹះសំខាន់ក្នុងការលើកកម្ពស់ផលិតភាព។",
              "យើងត្រូវរួមគ្នារក្សាការពារបរិស្ថាននិងជីវចម្រុះដើម្បីការអភិវឌ្ឍប្រកបដោយចីរភាព។",
              "សន្តិភាព ស្ថិរភាព និងសាមគ្គីភាពជាតិជាគ្រឹះយ៉ាងរឹងមាំនៃការកសាងអនាគត។"
            ],
            "hint": "រក្សាការផ្តោតអារម្មណ៍ខ្ពស់។ វាយមួយៗឲ្យច្បាស់!"
          }
        ]
      },
      {
        "id": 4,
        "labelKh": "ល្បះ និងប្រយោគពេញលេញ",
        "labelEn": "Full Sentences with Natural Flow",
        "category": "Autonomous Mastery",
        "skillCategory": "natural-sentences",
        "objective": "អនុវត្តការវាយប្រយោគពេញលេញដែលមានក្បួនវេយ្យាករណ៍ត្រឹមត្រូវ ចង្វាក់រលូន និងល្បឿន ៤៥ CPM ឡើងទៅ។",
        "focusKeys": [
          "ប្រយោគពេញលេញ",
          "ចង្វាក់រលូន",
          "៤៥+ CPM"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយប្រយោគវែងៗដោយគ្មានការកែតម្រូវច្រើន (Backspaces តិចតួចបំផុត)។",
        "unicodeOutputExplained": "ភាពស្ទាត់ជំនាញក្នុងការវាយអត្ថបទខ្មែរធម្មជាតិ។",
        "successCriteria": "វាយប្រយោគពេញលេញដោយភាពត្រឹមត្រូវ ៩៥% និងល្បឿន ៤៥ CPM ឡើងទៅ។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 45,
        "stages": [
          {
            "id": "w6-l4-s1",
            "kind": "warmup",
            "titleKh": "ល្បះប្រចាំថ្ងៃកម្រិតខ្ពស់ (Advanced Daily Sentences)",
            "titleEn": "Advanced Daily Sentences — Speed & Flow",
            "mission": "វាយល្បះប្រចាំថ្ងៃវែងៗដោយល្បឿន ៤៥ CPM។",
            "skill": "Sustained typing pace on multi-clause everyday sentences.",
            "mechanic": "Paced sentence drills with live speed feedback.",
            "targetCount": 6,
            "accuracyGoal": 95,
            "speedTargetCpm": 45,
            "practiceMode": "unicode-output",
            "items": [
              "សិស្សានុសិស្សគ្រប់រូបត្រូវខិតខំរៀនសូត្រដើម្បីកសាងអនាគតភ្លឺស្វាង។",
              "ភាសាខ្មែរជាភាសាជាតិដែលថ្លៃថ្លាដែលបង្កប់នូវព្រលឹងនិងអត្តសញ្ញាណជាតិ។",
              "យើងមានមោទនភាពយ៉ាងក្រៃលែងចំពោះប្រាសាទបុរាណដែលដូនតាបានបន្សល់ទុក។",
              "ការរៀនវាយអក្សរខ្មែរតាមកុំព្យូទ័រជួយសម្រួលដល់ការសិក្សានិងការងារប្រចាំថ្ងៃ។",
              "ការស្រឡាញ់សៀវភៅនិងការអានជាប្រចាំជួយអភិវឌ្ឍបញ្ញាស្មារតីឲ្យរីកចម្រើន។",
              "សាមគ្គីភាពរវាងប្រជាជនខ្មែរជាកម្លាំងចលករយ៉ាងរឹងមាំក្នុងការអភិវឌ្ឍជាតិ។"
            ],
            "hint": "រក្សាចង្វាក់វាយឲ្យស្មើ និងរលូនដូចទឹកហូរ។"
          },
          {
            "id": "w6-l4-s2",
            "kind": "pattern",
            "titleKh": "ល្បះពិសម្បុរនាទេសភាព (Descriptive Nature Passages)",
            "titleEn": "Descriptive Passages — Rich Imagery & Vocabulary",
            "mission": "វាយល្បះពិសម្បុរនាសម្រស់ធម្មជាតិ និងទឹកដីកម្ពុជា។",
            "skill": "Typing poetic and descriptive Khmer text with artistic vocabulary.",
            "mechanic": "Descriptive narrative typing challenges.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "speedTargetCpm": 45,
            "practiceMode": "unicode-output",
            "items": [
              "នៅពេលព្រឹកព្រលឹម ពន្លឺព្រះអាទិត្យរះបំភ្លឺកំពូលប្រាសាទអង្គរវត្តយ៉ាងអស្ចារ្យ។",
              "វាលស្រែខៀវស្រងាត់លាតសន្ធឹងដាច់កន្ទុយភ្នែកក្រោមខ្យល់ជំនោររដូវរំហើយ។",
              "ទឹកទន្លេសាបហូរកាត់កាត់ភូមិឋានប្រជាជនប្រកបដោយភាពស្ងប់សុខនិងសម្បូរសប្បាយ។",
              "ព្រៃឈើខៀវស្រងាត់ផ្តល់នូវជម្រកដល់សត្វព្រៃនិងជួយរក្សាលំនឹងបរិស្ថានធម្មជាតិ។",
              "សំឡេងសត្វស្លាបយំច្រៀងរំពងពេញព្រៃបង្កើតបានជាតន្ត្រីធម្មជាតិពិរោះរណ្តំ។"
            ],
            "hint": "សង្កេតពាក្យពិសម្បុរនា -> វាយដោយអារម្មណ៍ស្រស់ស្រាយ។"
          },
          {
            "id": "w6-l4-s3",
            "kind": "sentence",
            "titleKh": "ល្បះអប់រំចិត្តកម្រិតខ្ពស់ (Moral Philosophy Sentences)",
            "titleEn": "Moral Philosophy — Thoughtful Sentences",
            "mission": "វាយប្រយោគទស្សនវិជ្ជាអប់រំចិត្តជ្រាលជ្រៅ។",
            "skill": "High-speed typing of philosophically rich, punctuated prose.",
            "mechanic": "Sustained fluency validation under 45 CPM target.",
            "targetCount": 5,
            "accuracyGoal": 95,
            "speedTargetCpm": 45,
            "practiceMode": "unicode-output",
            "items": [
              "បុគ្គលដែលមានចំណេះវិជ្ជាខ្ពង់ខ្ពស់តែងតែមានភាពរាបសានិងចេះគោរពអ្នកដទៃ។",
              "ការតស៊ូព្យាយាមជម្នះរាល់ការលំបាកជាដំណើរនាំទៅរកភាពជោគជ័យត្រចះត្រចង់។",
              "សេចក្តីស្មោះត្រង់និងសេចក្តីសុចរិតជាទ្រព្យសម្បត្តិពិសិដ្ឋដែលមិនអាចកាត់ថ្លៃបាន។",
              "ការចេះអត់ឱននិងការយោគយល់គ្នាទៅវិញទៅមកជួយកសាងសង្គមសុខដុមរមនា។",
              "ពេលវេលាជាវត្ថុមានតម្លៃបំផុតដែលយើងត្រូវប្រើប្រាស់ឲ្យមានប្រយោជន៍ជាអតិបរមា។"
            ],
            "hint": "វាយដោយភាពស្ងប់ស្ងាត់ និងជឿជាក់លើខ្លួនឯង។"
          }
        ]
      },
      {
        "id": 5,
        "labelKh": "ការសរសេរកថាខណ្ឌខ្លី",
        "labelEn": "Practical Paragraph Writing",
        "category": "Autonomous Mastery",
        "skillCategory": "paragraph-writing",
        "objective": "អនុវត្តការវាយអត្ថបទកថាខណ្ឌខ្លី (៣-៤ ល្បះជាប់គ្នា) ដោយរក្សាការផ្តោតអារម្មណ៍ និងគ្មានការចុចច្រឡំ។",
        "focusKeys": [
          "កថាខណ្ឌខ្លី",
          "ការផ្តោតអារម្មណ៍",
          "គ្មានកំហុស"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "រក្សាការដកដង្ហើមវែងៗ និងចង្វាក់វាយអក្សរស្មើពីដើមកថាខណ្ឌរហូតដល់ចប់។",
        "unicodeOutputExplained": "ការវាយអត្ថបទវែងជាប់គ្នាដោយរក្សា CPM និងភាពត្រឹមត្រូវខ្ពស់។",
        "successCriteria": "វាយកថាខណ្ឌខ្លីដោយភាពត្រឹមត្រូវ ៩៥% និងល្បឿន ៤៥ CPM ឡើងទៅ។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 45,
        "stages": [
          {
            "id": "w6-l5-s1",
            "kind": "warmup",
            "titleKh": "កថាខណ្ឌអំពីការសិក្សា (Paragraph on Education)",
            "titleEn": "Education Paragraph — Continuous Flow",
            "mission": "វាយកថាខណ្ឌខ្លីស្តីពីតម្លៃនៃការអប់រំ និងការសិក្សាស្រាវជ្រាវ។",
            "skill": "Sustained endurance on multi-sentence educational text.",
            "mechanic": "Continuous paragraph validation with internal Khan marks.",
            "targetCount": 3,
            "accuracyGoal": 95,
            "speedTargetCpm": 45,
            "practiceMode": "unicode-output",
            "items": [
              "ការអប់រំជាមូលដ្ឋានគ្រឹះយ៉ាងរឹងមាំក្នុងការកសាងអនាគតរបស់បុគ្គលគ្រប់រូប។ នៅពេលដែលយើងខិតខំរៀនសូត្រ យើងនឹងទទួលបាននូវចំណេះដឹងនិងជំនាញសម្រាប់អភិវឌ្ឍខ្លួន។ ចំណេះដឹងនេះនឹងជួយឲ្យយើងក្លាយជាពលរដ្ឋល្អក្នុងសង្គមជាតិ៕",
              "សៀវភៅជាមិត្តល្អបំផុតដែលតែងតែចែករំលែកនូវចំណេះដឹងនិងគំនិតថ្មីៗដល់យើង។ ការអានសៀវភៅជារៀងរាល់ថ្ងៃជួយពង្រីកការគិតនិងការយល់ដឹងអំពីពិភពលោក។ យុវជនគ្រប់រូបគួរតែបង្កើតទម្លាប់អានឲ្យបានជាប់ជាប្រចាំ៕",
              "ការរៀនវាយអក្សរខ្មែរតាមកុំព្យូទ័រដោយប្រើបច្ចេកទេស ការវាយអក្សរដោយមិនបាច់មើលក្តារចុច ជួយសន្សំពេលវេលាបានយ៉ាងច្រើន។ នៅពេលដែលយើងមិនបាច់មើលក្តារចុច យើងអាចផ្តោតអារម្មណ៍លើគំនិតនិងខ្លឹមសារនៃអត្ថបទបានល្អប្រសើរ៕"
            ],
            "hint": "វាយបន្តបន្ទាប់គ្នាដោយរលូន មិនបាច់ឈប់ស្ទាក់ស្ទើរ។"
          },
          {
            "id": "w6-l5-s2",
            "kind": "pattern",
            "titleKh": "កថាខណ្ឌអំពីប្រពៃណីខ្មែរ (Paragraph on Khmer Culture)",
            "titleEn": "Cultural Paragraph — Heritage & Identity",
            "mission": "វាយកថាខណ្ឌខ្លីស្តីពីមរតកប្រពៃណី និងប្រាសាទបុរាណខ្មែរ។",
            "skill": "Paragraph stamina on vocabulary-dense cultural prose.",
            "mechanic": "Cultural narrative typing challenges.",
            "targetCount": 3,
            "accuracyGoal": 95,
            "speedTargetCpm": 45,
            "practiceMode": "unicode-output",
            "items": [
              "ប្រាសាទអង្គរវត្តជាស្ថាបត្យកម្មមហស្ចារ្យដែលត្រូវបានកសាងឡើងក្នុងសម័យអង្គរយ៉ាងរុងរឿង។ សំណង់ថ្មភក់ធំស្កឹមស្កៃនេះបានបង្ហាញពីទេពកោសល្យនិងភាពប៉ិនប្រសប់របស់បុព្វបុរសខ្មែរ។ សព្វថ្ងៃនេះ អង្គរវត្តបានក្លាយជាគោលដៅទេសចរណ៍ល្បីល្បាញលើពិភពលោក៕",
              "របាំព្រះរាជទ្រព្យខ្មែរជាសម្បត្តិបេតិកភណ្ឌប្រពៃណីអរូបីនៃមនុស្សជាតិដែលត្រូវបានទទួលស្គាល់ដោយអង្គការយូណេស្កូ។ កាយវិការទន់ភ្លន់និងសម្លៀកបំពាក់ប្រណីតបានធ្វើឲ្យរបាំនេះមានភាពទាក់ទាញយ៉ាងខ្លាំង។ យើងត្រូវរួមគ្នាថែរក្សារបាំបុរាណនេះឲ្យបានគង់វង្ស៕",
              "ប្រពៃណីនិងទំនៀមទម្លាប់ខ្មែរតែងតែបង្រៀនកូនចៅឲ្យចេះគោរពចាស់ទុំនិងដឹងគុណឪពុកម្តាយ។ ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិនិងបុណ្យភ្ជុំបិណ្ឌជាឱកាសជួបជុំគ្រួសារយ៉ាងកក់ក្តៅ។ ទំនៀមទម្លាប់ទាំងនេះបានផ្សារភ្ជាប់ទំនាក់ទំនងសង្គមឲ្យកាន់តែជិតស្និទ្ធ៕"
            ],
            "hint": "រក្សាភាពត្រឹមត្រូវ ៩៥% ជានិច្ច។"
          },
          {
            "id": "w6-l5-s3",
            "kind": "sentence",
            "titleKh": "កថាខណ្ឌអំពីការអភិវឌ្ឍជាតិ (Paragraph on National Progress)",
            "titleEn": "National Progress Paragraph — Modern Development",
            "mission": "វាយកថាខណ្ឌខ្លីស្តីពីការអភិវឌ្ឍសេដ្ឋកិច្ច និងសន្តិភាពនៅកម្ពុជា។",
            "skill": "High-speed paragraph mastery on socio-economic text.",
            "mechanic": "Full paragraph validation under 48 CPM benchmark.",
            "targetCount": 3,
            "accuracyGoal": 95,
            "speedTargetCpm": 48,
            "practiceMode": "unicode-output",
            "items": [
              "សន្តិភាពពេញលេញបានបើកឱកាសឲ្យប្រទេសកម្ពុជាអភិវឌ្ឍសេដ្ឋកិច្ចនិងសង្គមយ៉ាងឆាប់រហ័ស។ ហេដ្ឋារចនាសម្ព័ន្ធផ្លូវស្ពាននិងសំណង់អគារទំនើបៗត្រូវបានសាងសង់ឡើងជាបន្តបន្ទាប់។ ជីវភាពរស់នៅរបស់ប្រជាពលរដ្ឋមានភាពប្រសើរឡើងពីមួយថ្ងៃទៅមួយថ្ងៃ៕",
              "វិស័យកសិកម្មនិងឧស្សាហកម្មបានដើរតួនាទីយ៉ាងសំខាន់ក្នុងការជំរុញកំណើនសេដ្ឋកិច្ចជាតិ។ ផលិតផលខ្មែរជាច្រើនត្រូវបានកែច្នៃនិងនាំចេញទៅកាន់ទីផ្សារអន្តរជាតិ។ កសិករនិងកម្មករខ្មែរជាកម្លាំងចលករយ៉ាងរឹងមាំនៃការផលិតកម្មជាតិ៕",
              "យុវជនជំនាន់ក្រោយជាកម្លាំងស្នូលក្នុងការដឹកនាំប្រទេសជាតិទៅកាន់យុគសម័យឌីជីថល។ ការយល់ដឹងអំពីបច្ចេកវិទ្យានិងការច្នៃប្រឌិតថ្មីៗនឹងជួយឲ្យកម្ពុជាប្រកួតប្រជែងលើឆាកអន្តរជាតិបាន។ យើងទាំងអស់គ្នាត្រូវត្រៀមខ្លួនឲ្យបានរួចរាល់សម្រាប់អនាគត៕"
            ],
            "hint": "អ្នកកំពុងវាយអក្សរបានយ៉ាងរលូន និងស្ទាត់ជំនាញបំផុត!"
          }
        ]
      },
      {
        "id": 6,
        "labelKh": "អត្ថបទប្រពៃណី និងប្រវត្តិសាស្ត្រ",
        "labelEn": "Extended Cultural & Historical Texts",
        "category": "Autonomous Mastery",
        "skillCategory": "extended-passages",
        "objective": "អនុវត្តការវាយអត្ថបទវែងៗទាក់ទងនឹងប្រវត្តិសាស្ត្រ អក្សរសាស្ត្រ និងកេរដំណែលអង្គរយ៉ាងរុងរឿង។",
        "focusKeys": [
          "អត្ថបទវែង",
          "ប្រវត្តិសាស្ត្រ",
          "កេរដំណែលអង្គរ",
          "ភាពស្ទាត់"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "វាយអត្ថបទប្រវត្តិសាស្ត្រវែងៗដោយភាពម៉ត់ចត់ និងចង្វាក់ស្មើ គ្មានការប្រញាប់។",
        "unicodeOutputExplained": "ការសាកល្បងសមត្ថភាពលើអត្ថបទប្រពៃណីពេញលេញ។",
        "successCriteria": "វាយអត្ថបទវែងដោយភាពត្រឹមត្រូវ ៩៥% និងល្បឿន ៤៨ CPM ឡើងទៅ។",
        "minimumAccuracy": 95,
        "speedTargetCpm": 48,
        "stages": [
          {
            "id": "w6-l6-s1",
            "kind": "warmup",
            "titleKh": "ប្រវត្តិប្រាសាទបាយ័ន (Bayon Temple Passage)",
            "titleEn": "Bayon Passage — Historical Architecture",
            "mission": "វាយអត្ថបទខ្លីស្តីពីប្រាសាទបាយ័ន និងស្នាមញញឹមព្រហ្មមុខបួន។",
            "skill": "High sustained accuracy on descriptive historical narrative.",
            "mechanic": "Historical text passage challenge.",
            "targetCount": 2,
            "accuracyGoal": 95,
            "speedTargetCpm": 48,
            "practiceMode": "unicode-output",
            "items": [
              "ប្រាសាទបាយ័នស្ថិតនៅចំកណ្តាលនៃរាជធានីអង្គរធំដែលត្រូវបានកសាងឡើងដោយព្រះបាទជ័យវរ្ម័នទីប្រាំពីរ។ ប្រាសាទនេះមានភាពល្បីល្បាញដោយសារព្រហ្មមុខបួនញញឹមពព្រាយដែលឆ្លុះបញ្ចាំងពីសេចក្តីមេត្តាករុណា។ ចម្លាក់ក្បាច់នៅលើជញ្ជាំងប្រាសាទបានបង្ហាញពីជីវភាពរស់នៅប្រចាំថ្ងៃរបស់ប្រជាជនខ្មែរសម័យបុរាណយ៉ាងរស់រវើក៕",
              "ការសិក្សាស្រាវជ្រាវអំពីប្រាសាទបាយ័នបានជួយឲ្យយើងយល់ដឹងកាន់តែច្បាស់អំពីប្រវត្តិសាស្ត្រនិងជំនឿសាសនានាសម័យអង្គរ។ ភ្ញៀវទេសចរជាតិនិងអន្តរជាតិតែងតែមកទស្សនាប្រាសាទនេះដោយក្តីកោតសរសើរមិនដាច់ពីមាត់។ យើងមានកាតព្វកិច្ចចូលរួមថែរក្សាសម្បត្តិបេតិកភណ្ឌនេះឲ្យនៅគង់វង្សយូរអង្វែង៕"
            ],
            "hint": "វាយដោយស្មារតីគោរពមរតកដូនតា។"
          },
          {
            "id": "w6-l6-s2",
            "kind": "pattern",
            "titleKh": "ប្រវត្តិអក្សរសាស្ត្រខ្មែរ (History of Khmer Script)",
            "titleEn": "Khmer Script History — Evolution from Pallava to Unicode",
            "mission": "វាយអត្ថបទខ្លីស្តីពីការវិវត្តនៃអក្សរខ្មែរតាំងពីសម័យបុរាណរហូតដល់សម័យយូនីកូដ។",
            "skill": "Advanced typing on linguistic and typographic history of Khmer script.",
            "mechanic": "Linguistic history passage validation.",
            "targetCount": 2,
            "accuracyGoal": 95,
            "speedTargetCpm": 48,
            "practiceMode": "unicode-output",
            "items": [
              "អក្សរខ្មែរមានប្រភពដើមមកពីអក្សរព្រាហ្មីនិងអក្សរបល្លវនៃប្រទេសឥណ្ឌាបុរាណដែលបានចូលមកដល់ទឹកដីខ្មែរតាំងពីដើមគ្រិស្តសករាជ។ ឆ្លងកាត់ការកែច្នៃនិងវិវត្តរាប់ពាន់ឆ្នាំ បុព្វបុរសខ្មែរបានបង្កើតនូវទម្រង់អក្សរស្រស់ស្អាតនិងមានភាពពិសេសផ្ទាល់ខ្លួន។ សិលាចារឹកបុរាណជាច្រើនបានកត់ត្រានូវព្រឹត្តិការណ៍ប្រវត្តិសាស្ត្រតាមតួអក្សរខ្មែរចំណាស់នេះ៕",
              "នៅក្នុងយុគសម័យឌីជីថល អក្សរខ្មែរត្រូវបានបញ្ចូលទៅក្នុងស្តង់ដារអន្តរជាតិយូនីកូដដែលអនុញ្ញាតឲ្យយើងប្រើប្រាស់លើកុំព្យូទ័រនិងទូរស័ព្ទដៃបានយ៉ាងទូលំទូលាយ។ ការចេះវាយអក្សរខ្មែរតាមប្រព័ន្ធកុំព្យូទ័របានត្រឹមត្រូវជាស្ពានតភ្ជាប់ប្រពៃណីបុរាណទៅកាន់ពិភពបច្ចេកវិទ្យាទំនើប។ យើងគ្រប់រូបគួរតែមានមោទនភាពនិងប្រើប្រាស់អក្សរជាតិឲ្យបានត្រឹមត្រូវជានិច្ច៕"
            ],
            "hint": "យូនីកូដជាមោទនភាពនៃបច្ចេកវិទ្យាខ្មែរទំនើប!"
          },
          {
            "id": "w6-l6-s3",
            "kind": "sentence",
            "titleKh": "កេរដំណែលទឹកនៃអាណាចក្រអង្គរ (Angkor Hydraulic Civilization)",
            "titleEn": "Angkor Water Engineering — Civilization Passage",
            "mission": "វាយអត្ថបទខ្លីស្តីពីប្រព័ន្ធធារាសាស្ត្រ និងបារាយណ៍បុរាណនៅអង្គរ។",
            "skill": "High-end typing endurance on multi-clause historical scholarship.",
            "mechanic": "Complex narrative passage validation under 50 CPM target.",
            "targetCount": 2,
            "accuracyGoal": 95,
            "speedTargetCpm": 50,
            "practiceMode": "unicode-output",
            "items": [
              "អាណាចក្រអង្គរជាកេរដំណែលអស្ចារ្យដែលផ្អែកលើការគ្រប់គ្រងប្រព័ន្ធទឹកប្រកបដោយភាពឆ្លាតវៃនិងវិស្វកម្មកម្រិតខ្ពស់។ បារាយណ៍ធំៗដូចជាបារាយណ៍ខាងលិចនិងបារាយណ៍ខាងកើតត្រូវបានជីកឡើងដើម្បីស្តុកទឹកសម្រាប់បម្រើដល់ការធ្វើកសិកម្មនិងការរស់នៅ។ ប្រព័ន្ធធារាសាស្ត្រស្មុគស្មាញនេះបានធ្វើឲ្យអង្គរមានភាពសម្បូរសប្បាយផ្នែកស្បៀងអាហារនិងមានស្ថិរភាពយូរអង្វែង៕",
              "ភាពជោគជ័យនៃអាណាចក្រអង្គរមិនត្រឹមតែអាស្រ័យលើអំណាចយោធាប៉ុណ្ណោះទេ ប៉ុន្តែអាស្រ័យលើការយល់ដឹងស៊ីជម្រៅអំពីធម្មជាតិនិងបរិស្ថាន។ វិស្វករខ្មែរបុរាណបានចេះប្រើប្រាស់ធនធានទឹកពីជួរភ្នំគូលែនមកស្រោចស្រពវាលស្រែយ៉ាងមានប្រសិទ្ធភាពខ្ពស់។ មេរៀនប្រវត្តិសាស្ត្រនេះបានបង្រៀនយើងអំពីសារសំខាន់នៃការគ្រប់គ្រងធនធានធម្មជាតិប្រកបដោយចីរភាព៕"
            ],
            "hint": "អ្នកកំពុងវាយអត្ថបទប្រវត្តិសាស្ត្រកម្រិតខ្ពស់បំផុតដោយជោគជ័យ!"
          }
        ]
      },
      {
        "id": 7,
        "labelKh": "ការវាយតម្លៃភាពត្រឹមត្រូវ និងល្បឿន",
        "labelEn": "Accuracy & Fluency Assessment",
        "category": "Autonomous Mastery",
        "skillCategory": "assessment",
        "objective": "វាយតម្លៃសមត្ថភាពវាយអក្សរខ្មែរពេញលេញ៖ ភាពត្រឹមត្រូវ ៩៦%+, ល្បឿន ៥០+ CPM, គ្មានការកែតម្រូវច្រើន និងចង្វាក់ស្មើល្អឥតខ្ចោះ។",
        "focusKeys": [
          "ការវាយតម្លៃ",
          "៩៦% ត្រឹមត្រូវ",
          "៥០+ CPM"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "ការវាយតម្លៃស្តង់ដារ៖ រក្សាភាពត្រឹមត្រូវឲ្យបាន ៩៦% ឡើងទៅ។",
        "unicodeOutputExplained": "ការប្រឡងវាស់កម្រិតមុនពេលឈានដល់មេរៀនចុងក្រោយ និង Boss អង្គរ។",
        "successCriteria": "សម្រេចបានភាពត្រឹមត្រូវ ៩៦% និងល្បឿន ៥០ CPM ឡើងទៅ។",
        "minimumAccuracy": 96,
        "speedTargetCpm": 50,
        "stages": [
          {
            "id": "w6-l7-s1",
            "kind": "warmup",
            "titleKh": "ការវាយតម្លៃល្បឿន និងភាពសុក្រឹត (Speed & Precision Test)",
            "titleEn": "Assessment Part 1 — Speed & Precision Baseline",
            "mission": "វាយអត្ថបទសាកល្បងដោយរក្សាភាពត្រឹមត្រូវ ៩៦% និងល្បឿន ៥០ CPM។",
            "skill": "Benchmark assessment verifying student readiness for final graduation.",
            "mechanic": "Strict timed assessment with 96% accuracy threshold.",
            "targetCount": 4,
            "accuracyGoal": 96,
            "speedTargetCpm": 50,
            "practiceMode": "unicode-output",
            "items": [
              "ភាសាខ្មែរជាមរតកពិសិដ្ឋដែលផ្សារភ្ជាប់ចិត្តកូនខ្មែរគ្រប់រូបឲ្យចេះស្រឡាញ់និងសាមគ្គីគ្នា។",
              "ការខិតខំប្រឹងប្រែងរៀនសូត្រជាដំណើរតែមួយគត់ដែលអាចកែប្រែជោគវាសនានិងអនាគតរបស់យើងបាន។",
              "ប្រទេសកម្ពុជាមានសម្បត្តិប្រពៃណីសម្បូរបែបដែលពិភពលោកទាំងមូលតែងតែកោតសរសើរ។",
              "យើងមានមោទនភាពចំពោះការរីកចម្រើននៃបច្ចេកវិទ្យានិងការអប់រំនៅក្នុងប្រទេសយើង។"
            ],
            "hint": "ផ្តោតអារម្មណ៍ឲ្យបាន ១០០%។ កុំឲ្យមានកំហុសសូម្បីតែមួយតួ!"
          },
          {
            "id": "w6-l7-s2",
            "kind": "pattern",
            "titleKh": "ការវាយតម្លៃការសម្របសម្រួលស្មុគស្មាញ (Complex Coordination Test)",
            "titleEn": "Assessment Part 2 — Multi-Tier Orthography",
            "mission": "វាយអត្ថបទដែលមានកម្រងជើង និងស្រៈចម្រុះដោយគ្មានការភាន់ច្រឡំ។",
            "skill": "Flawless execution of complex Khmer orthography under assessment pressure.",
            "mechanic": "High-density cluster and diacritic assessment.",
            "targetCount": 4,
            "accuracyGoal": 96,
            "speedTargetCpm": 50,
            "practiceMode": "unicode-output",
            "items": [
              "សិស្សានុសិស្សខិតខំប្រឹងប្រែងរៀនសូត្រវិទ្យាសាស្ត្រនិងបច្ចេកវិទ្យាទំនើបៗ។",
              "មិត្តភក្តិល្អតែងតែជួយយកអាសាគ្នាក្នុងគ្រាលំបាកនិងចែករំលែកសេចក្តីសុខជាមួយគ្នា។",
              "សេចក្តីព្យាយាមនិងការតាំងចិត្តមុតមាំនឹងនាំយើងទៅដល់គោលដៅជោគជ័យ។",
              "ប្រពៃណីនិងប្រពៃណីល្អផូរផង់របស់ខ្មែរត្រូវបានកូនចៅជំនាន់ក្រោយបន្តថែរក្សា។"
            ],
            "hint": "រក្សាចង្វាក់ស្មើ។ ភាពត្រឹមត្រូវ ៩៦% ជាគោលដៅ!"
          },
          {
            "id": "w6-l7-s3",
            "kind": "sentence",
            "titleKh": "ការវាយតម្លៃភាពស្ទាត់ជំនាញពេញលេញ (Comprehensive Fluency Test)",
            "titleEn": "Assessment Part 3 — Master Fluency Benchmark",
            "mission": "វាយកថាខណ្ឌពេញលេញដោយសម្រេចបានពិន្ទុខ្ពស់បំផុត។",
            "skill": "Master-level touch typing fluency across diverse prose.",
            "mechanic": "Comprehensive assessment graduation gate.",
            "targetCount": 3,
            "accuracyGoal": 96,
            "speedTargetCpm": 52,
            "practiceMode": "unicode-output",
            "items": [
              "ការវាយអក្សរខ្មែរតាមប្រព័ន្ធកុំព្យូទ័រដោយមិនបាច់មើលក្តារចុចជាជំនាញមានតម្លៃបំផុតសម្រាប់យុគសម័យបច្ចុប្បន្ន។ ជំនាញនេះជួយឲ្យយើងធ្វើការងារបានលឿន មានប្រសិទ្ធភាពខ្ពស់ និងកាត់បន្ថយភាពនឿយហត់របស់ភ្នែកនិងដៃយ៉ាងច្រើន៕",
              "សេចក្តីស្រឡាញ់ចំពោះជាតិមាតុភូមិនិងភាសាជាតិបានជំរុញឲ្យយើងខិតខំហ្វឹកហាត់ដោយមិនខ្លាចនឿយហត់។ ជោគជ័យដែលយើងទទួលបាននៅថ្ងៃនេះជាផ្លែផ្កានៃការលះបង់និងការតាំងចិត្តយ៉ាងពិតប្រាកដ។ យើងមានមោទនភាពដែលបានក្លាយជាអ្នកវាយអក្សរស្ទាត់ជំនាញ៕",
              "ចំណេះដឹងនិងជំនាញដែលយើងមាននឹងក្លាយជាអាវុធមានឥទ្ធិពលក្នុងការចូលរួមកសាងនិងអភិវឌ្ឍប្រទេសជាតិ។ យុវជនគ្រប់រូបគួរតែបន្តអភិវឌ្ឍសមត្ថភាពផ្ទាល់ខ្លួនឥតឈប់ឈរ ដើម្បីដើរឲ្យទាន់ការវិវត្តនៃសង្គមនិងពិភពលោក៕"
            ],
            "hint": "អ្នកសម្រេចបានកម្រិតជំនាញកំពូលហើយ! ត្រៀមខ្លួនសម្រាប់មេរៀនចុងក្រោយ!"
          }
        ]
      },
      {
        "id": 8,
        "labelKh": "វគ្គចុងក្រោយមុនក្លាយជាវីរបុរសអង្គរ",
        "labelEn": "Angkor Hero Preparation",
        "category": "Autonomous Mastery",
        "skillCategory": "hero-prep",
        "objective": "បញ្ចប់មេរៀនចុងក្រោយបង្អស់នៃកម្មវិធីសិក្សា ដោយរៀបចំខ្លួនឲ្យក្លាយជា វីរបុរសវាយអក្សរនៃអង្គរ (វីរបុរសវាយអក្សរខ្មែរ)។",
        "focusKeys": [
          "វីរបុរសអង្គរ",
          "ស្ទាត់ជំនាញពេញលេញ",
          "ការវាយអក្សរដោយមិនបាច់មើលក្តារចុច Hero"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "បង្ហាញពីការយល់ដឹងនិងការអនុវត្តច្បាប់យូនីកូដខ្មែរគ្រប់រូបមន្តដោយស្វ័យប្រវត្តិ។",
        "unicodeOutputExplained": "ការបញ្ចប់កម្មវិធីសិក្សា ៥៤ មេរៀននៃ Khmer Typing Adventure។",
        "successCriteria": "ឆ្លងកាត់មេរៀនទី ៨ ដោយភាពត្រឹមត្រូវ ៩៦% និងដោះសោ Final Boss។",
        "minimumAccuracy": 96,
        "speedTargetCpm": 52,
        "stages": [
          {
            "id": "w6-l8-s1",
            "kind": "word",
            "titleKh": "ពាក្យអង្គរពិសិដ្ឋ (Sacred Angkor Vocabulary)",
            "titleEn": "Sacred Angkor Words — Pride & Heritage",
            "mission": "វាយពាក្យគន្លឹះទាក់ទងនឹងប្រវត្តិសាស្ត្រ និងវីរភាពអង្គរ។",
            "skill": "Rapid high-accuracy execution of hallmark cultural vocabulary.",
            "mechanic": "Sacred vocabulary challenge.",
            "targetCount": 12,
            "accuracyGoal": 96,
            "practiceMode": "unicode-output",
            "items": [
              "អង្គរវត្ត",
              "រាជធានី",
              "វីរបុរស",
              "កិត្តិយស",
              "កេរដំណែល",
              "មរតកជាតិ",
              "សាមគ្គីភាព",
              "មោទនភាព",
              "កម្ពុជា",
              "ជ័យជំនះ",
              "សន្តិភាព",
              "អនាគត"
            ],
            "hint": "វាយដោយមោទនភាពជាតិខ្មែរជ្រាលជ្រៅ។"
          },
          {
            "id": "w6-l8-s2",
            "kind": "sentence",
            "titleKh": "សំណួរ និងចម្លើយចំណេះដឹងយូនីកូដ (Unicode Knowledge Q&A)",
            "titleEn": "Unicode Knowledge Q&A — Master Theory & Practice",
            "mission": "វាយសំណួរ និងចម្លើយអំពីក្បួនខ្នាតយូនីកូដខ្មែរត្រឹមត្រូវ។",
            "skill": "Demonstrating theoretical and practical mastery of Khmer Unicode principles.",
            "mechanic": "Educational Q&A dialogue typing.",
            "targetCount": 4,
            "accuracyGoal": 96,
            "practiceMode": "unicode-output",
            "items": [
              "តើតួស្រះផ្សំត្រូវវាយពេលណា? ស្រះត្រូវវាយបន្ទាប់ពីព្យញ្ជនជានិច្ច ទោះបីមើលទៅនៅខាងមុខក្តី។",
              "តើជើងអក្សរត្រូវវាយដូចម្តេច? ចុចសញ្ញាជើង (្) បន្ទាប់មកចុចព្យញ្ជនដែលត្រូវធ្វើជាជើង។",
              "តើសញ្ញាប្តូរសំឡេងត្រូវវាយនៅកន្លែងណា? សញ្ញាប្តូរសំឡេងត្រូវវាយមុនតួស្រះជានិច្ច។",
              "ហេតុអ្វីបានជាភាពត្រឹមត្រូវសំខាន់ជាងល្បឿន? ភាពត្រឹមត្រូវធ្វើឲ្យអត្ថបទមានន័យនិងការពារកំហុសអក្ខរាវិរុទ្ធ។"
            ],
            "hint": "នេះជាក្បួនខ្នាតមាសដែលអ្នកបានរៀនតាំងពីពិភពទី ១ រហូតដល់ពិភពទី ៦!"
          },
          {
            "id": "w6-l8-s3",
            "kind": "sentence",
            "titleKh": "ព្រះរាជសារវីរបុរស (Royal Hero Message)",
            "titleEn": "Royal Hero Message — Declaration of Mastery",
            "mission": "វាយសារប្រកាសពីការបញ្ចប់ការសិក្សា និងការត្រៀមខ្លួនសម្រាប់ Final Boss។",
            "skill": "Sustained typing endurance on celebratory heroic passage.",
            "mechanic": "Solemn declaration passage validation.",
            "targetCount": 3,
            "accuracyGoal": 96,
            "speedTargetCpm": 52,
            "practiceMode": "unicode-output",
            "items": [
              "ខ្ញុំបានឆ្លងកាត់ការហ្វឹកហាត់យ៉ាងស្វិតស្វាញពេញទាំងប្រាំមួយពិភព។ ខ្ញុំបានចេះទីតាំងគ្រាប់ចុច ឥរិយាបថដៃ ម្រាមដៃត្រឹមត្រូវ និងក្បួនខ្នាតយូនីកូដខ្មែរយ៉ាងច្បាស់លាស់៕",
              "ខ្ញុំអាចវាយពាក្យ ប្រយោគ និងកថាខណ្ឌវែងៗដោយមិនបាច់មើលក្តារចុច និងរក្សាភាពត្រឹមត្រូវខ្ពស់បំផុត។ ជំនាញនេះនឹងក្លាយជាទ្រព្យសម្បត្តិមានតម្លៃសម្រាប់ជីវិតខ្ញុំ៕",
              "ឥឡូវនេះ ខ្ញុំត្រៀមខ្លួនរួចរាល់ហើយដើម្បីឈានចូលទៅកាន់ការប្រឡងចុងក្រោយនៅប្រាសាទអង្គរវត្ត។ ខ្ញុំនឹងក្លាយជា វីរបុរសវាយអក្សរនៃអង្គរ ពិតប្រាកដនៃប្រទេសកម្ពុជា៕"
            ],
            "hint": "អ្នកបានត្រៀមខ្លួនរួចរាល់ហើយសម្រាប់ Angkor Champion Boss!"
          }
        ]
      },
      {
        "id": "boss",
        "labelKh": "ម្ចាស់ជើងឯកអង្គរ (Angkor Kingdom Typing Champion)",
        "labelEn": "Angkor Champion — Ultimate Typing Adventure",
        "category": "World Boss Mastery",
        "skillCategory": "final-champion",
        "objective": "បញ្ចប់ដំណើរផ្សងព្រេង Khmer Typing Adventure ដោយបង្ហាញជំនាញវាយអក្សរខ្មែរ ការវាយអក្សរដោយមិនបាច់មើលក្តារចុច ពេញលេញ៖ ភាពត្រឹមត្រូវ ៩៦%+, ល្បឿន ៥២+ CPM, និងក្បួនយូនីកូដឥតខ្ចោះ។",
        "focusKeys": [
          "ជំនាញទាំងអស់នៃពិភពទាំង ៦"
        ],
        "introducedKeyCodes": [],
        "recommendedHands": [
          "both"
        ],
        "recommendedFingers": [
          "pinky",
          "ring",
          "middle",
          "index",
          "thumb"
        ],
        "homeKeyAnchors": [
          "KeyF",
          "KeyJ"
        ],
        "unicodeRule": "ការប្រឡងបញ្ចប់មហាកម្មវិធី៖ ភាពត្រឹមត្រូវខ្ពស់បំផុត គ្មានការចុចខុសគ្រាប់ចុច។",
        "unicodeOutputExplained": "វីរបុរសវាយអក្សរនៃអង្គរ — កំពូលអ្នកវាយអក្សរខ្មែរនៃព្រះរាជាណាចក្រកម្ពុជា។",
        "successCriteria": "ឆ្លងកាត់ទាំង ៣ Wave ដើម្បីទទួលងារជា \"ម្ចាស់ជើងឯកអង្គរ\" និងបញ្ចប់ Game ទាំងស្រុង។",
        "minimumAccuracy": 96,
        "speedTargetCpm": 52,
        "stages": [
          {
            "id": "w6-boss-s1",
            "kind": "boss",
            "titleKh": "Wave ពាក្យអង្គរជើងឯក (Angkor Champion Words)",
            "titleEn": "Boss Wave 1 — Cultural Mastery Wave",
            "mission": "វាយពាក្យអង្គរ និងពាក្យប្រពៃណីខ្មែរយ៉ាងរហ័សដោយគ្មានកំហុស។",
            "skill": "Rapid flawless recall of advanced Khmer cultural vocabulary.",
            "mechanic": "Fast-paced word wave demanding instant finger reflexes.",
            "targetCount": 15,
            "accuracyGoal": 96,
            "practiceMode": "unicode-output",
            "items": [
              "អង្គរវត្ត",
              "កម្ពុជា",
              "យូនីកូដ",
              "ប្រពៃណី",
              "កេរដំណែល",
              "ប្រាសាទ",
              "សិល្ប",
              "អក្សរសាស្ត្រ",
              "កិត្តិយស",
              "វិញ្ញាសា",
              "សន្តិភាព",
              "មរតក",
              "សាមគ្គី",
              "ជោគជ័យ",
              "វីរបុរស"
            ],
            "hint": "រក្សាភាពស្ងប់ស្ងាត់។ ម្រាមដៃរបស់អ្នកចងចាំទីតាំងគ្រាប់ចុចទាំងអស់ហើយ!"
          },
          {
            "id": "w6-boss-s2",
            "kind": "boss",
            "titleKh": "Wave ចំណេះដឹងយូនីកូដ និងក្បួនខ្នាត (Unicode Principles Wave)",
            "titleEn": "Boss Wave 2 — Definitive Orthographic Mastery",
            "mission": "វាយគោលការណ៍គ្រឹះនៃយូនីកូដខ្មែរដោយភាពត្រឹមត្រូវ ៩៦% ឡើងទៅ។",
            "skill": "Flawless typing of foundational orthographic rules under championship pressure.",
            "mechanic": "High-standard theoretical and practical synthesis.",
            "targetCount": 6,
            "accuracyGoal": 96,
            "speedTargetCpm": 52,
            "practiceMode": "unicode-output",
            "items": [
              "តួស្រះត្រូវវាយក្រោយព្យញ្ជនជានិច្ច ទោះបីជារូបរាងរបស់វាបង្ហាញនៅខាងមុខក្តី។",
              "ជើងអក្សរត្រូវវាយដោយចុចសញ្ញាជើង (្) បន្ទាប់មកចុចព្យញ្ជនដែលត្រូវធ្វើជាជើង។",
              "សញ្ញាប្តូរសំឡេងត្រូវវាយមុនតួស្រះ ដើម្បីរក្សានូវលំដាប់យូនីកូដត្រឹមត្រូវ។",
              "បច្ចេកទេស ប្តូរ ឆ្លាស់ដៃជួយឲ្យយើងវាយបានលឿននិងមិនរោយម្រាមដៃឡើយ។",
              "ភាពត្រឹមត្រូវជាចម្បង ល្បឿននឹងកើនឡើងជាលំដាប់តាមការអនុវត្តជាក់ស្តែង។",
              "ការចេះវាយអក្សរខ្មែរស្ទាត់ជំនាញជាការចូលរួមចំណែកលើកតម្កើងអក្សរសាស្ត្រជាតិ។"
            ],
            "hint": "វាយមួយៗដោយភាពម៉ត់ចត់បំផុត!"
          },
          {
            "id": "w6-boss-s3",
            "kind": "boss",
            "titleKh": "Wave វីរបុរសអង្គរអមតៈ (Immortal Angkor Hero Wave)",
            "titleEn": "Boss Wave 3 — Ultimate Championship Coronation",
            "mission": "វាយសារប្រកាសជ័យជម្នះជាស្ថាពរ ដើម្បីគ្រងតំណែងជា វីរបុរសវាយអក្សរនៃអង្គរ! ",
            "skill": "Supreme touch typing mastery: flawless accuracy, speed, and endurance.",
            "mechanic": "Final boss trial securing total game completion.",
            "targetCount": 5,
            "accuracyGoal": 96,
            "speedTargetCpm": 52,
            "practiceMode": "unicode-output",
            "items": [
              "ខ្ញុំជាវីរបុរសវាយអក្សរខ្មែរ។ ខ្ញុំចេះវាយអក្សរខ្មែរតាមប្រព័ន្ធកុំព្យូទ័រដោយលំដាប់យូនីកូដត្រឹមត្រូវនិងរហ័សរហួន។ ខ្ញុំមានមោទនភាពចំពោះសមត្ថភាពនិងការខិតខំប្រឹងប្រែងរបស់ខ្ញុំ៕",
              "ការសិក្សាស្រាវជ្រាវនិងការអភិវឌ្ឍចំណេះដឹងបច្ចេកវិទ្យានឹងជួយកសាងប្រទេសកម្ពុជាឲ្យកាន់តែសម្បូរសប្បាយរុងរឿង។ យើងជាកូនខ្មែរមានកាតព្វកិច្ចចូលរួមចំណែកការពារនិងអភិរក្សអត្តសញ្ញាណជាតិ៕",
              "ភាសាខ្មែរជាសម្បត្តិប្រពៃណីមហាសាលដែលបានផ្សារភ្ជាប់ប្រជាជាតិយើងរាប់ពាន់ឆ្នាំមកហើយ។ ការប្រើប្រាស់អក្សរជាតិឲ្យបានត្រឹមត្រូវជាកាតព្វកិច្ចពិសិដ្ឋរបស់ពលរដ្ឋខ្មែរគ្រប់រូប៕",
              "ដំណើរផ្សងព្រេងនៅប្រាសាទបុរាណបានបង្រៀនខ្ញុំអំពីសារសំខាន់នៃការតស៊ូព្យាយាម ភាពអត់ធន់ និងសាមគ្គីភាព។ គ្មានឧបសគ្គណាដែលអាចរារាំងអ្នកដែលមានការតាំងចិត្តពិតប្រាកដបានឡើយ៕",
              "សូមអបអរសាទរ! អ្នកបានបញ្ចប់ការប្រឡងជាស្ថាពរ និងបានក្លាយជាម្ចាស់ជើងឯកវាយអក្សរខ្មែរនៃអង្គររាជធានីហើយ! ជ័យជយោព្រះរាជាណាចក្រកម្ពុជាយ៉ាងរុងរឿងជានិរន្តរ៍៕"
            ],
            "hint": "សូមអបអរសាទរ! អ្នកបានក្លាយជា វីរបុរសវាយអក្សរនៃអង្គរ ពេញលេញហើយ!"
          }
        ]
      }
    ]
  }
];

export function getCurriculumWorld(worldId: number) {
  return lessonCurriculum.find((item) => item.id === worldId);
}

export function getCurriculumLevel(worldId: number, levelId: AdventureNodeId) {
  return getCurriculumWorld(worldId)?.levels.find((item) => item.id === levelId);
}

export function getDefaultCurriculumLevel() {
  return lessonCurriculum[0].levels[0];
}

export function flattenLevelItems(level: CurriculumLevel) {
  return level.stages.flatMap((stage) => stage.items);
}
