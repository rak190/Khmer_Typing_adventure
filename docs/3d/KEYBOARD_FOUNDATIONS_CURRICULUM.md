# Khmer Touch-Typing Foundations & Curriculum Architecture (Task 5.5)

**Primary Educational Reference:** [SBBIC Khmer Unicode Typing Trainer for Windows](https://sbbic.org/2010/05/27/khmer-unicode-typing-trainer-for-windows)  
**Keyboard Standard:** NiDA Khmer Unicode Layout (`src/data/keyboardMap.ts`)

---

## 1. Weaknesses Identified in the Previous Lesson Design

An audit of `src/data/lessonCurriculum.ts`, `src/data/typingProgression.ts`, `src/lib/fingerGuidance.ts`, `src/lib/lessonTypingPlan.ts`, and the 2D/3D lesson screens identified seven core educational and technical issues:

1. **Alphabetical Ordering Instead of Physical Home-Row Ordering**:
   - World 1, Lesson 1 (`ព្យញ្ជនៈដំបូង — First Consonants`) began in traditional Khmer alphabetical order (`ក ខ គ ឃ ង ច ឆ ជ ឈ ញ`).
   - Physically, this forced beginners to jump across all three keyboard rows (`KeyK` home, `KeyX` bottom, `Shift+KeyK` home, `Shift+KeyX` bottom, `KeyG` home, `KeyC` bottom, `KeyQ` top, `Shift+KeyC` bottom, `Shift+KeyQ` top, `Shift+KeyJ` home) on their very first lesson.
2. **Premature Shift Modifier Introduction**:
   - The 3rd character of Lesson 1 (`គ` = `Shift + KeyK`) and 4th character (`ឃ` = `Shift + KeyX`) required opposite-hand `Shift` coordination before students learned where to rest their hands on the home row.
3. **Combining Marks on the Physical Home Row**:
   - On the standard NiDA Khmer Unicode keyboard, three of the eight physical home-row rest keys produce combining marks or dependent vowels when pressed alone:
     - `KeyA` → `ា` (`U+17B6` Dependent Vowel AA)
     - `KeyJ` → `្` (`U+17D2` Khmer Sign Coeng / subscript virama)
     - `Semicolon` (`;`) → `ើ` (`U+17BE` Dependent Vowel OE)
   - Because the previous engine only supported character-output matching, beginners could not practice the 8 physical home-row keys (`A S D F` and `J K L ;`) without treating standalone `្` as a printable letter.
4. **English-Only Finger & Key Instructions**:
   - `src/lib/fingerGuidance.ts` returned English-only strings (`"Use right middle finger"`, `"Use left pinky + Shift"`), and `LessonWorldScreen.tsx` displayed `"Press Shift + K"`. Beginners who only read Khmer could not understand the finger guidance.
5. **No Home-Row Anchor or Reach-and-Return Instruction**:
   - Neither 2D nor 3D guidance explained which home-row key each finger belongs to (`A S D F` / `J K L ;`), the tactile index-finger bumps on `F` and `J`, or how to reach to nearby keys (`G`, `H`, `R`, `U`, `E`, `I`) and return to the home row.
6. **Inconsistent 2D vs. 3D Shift Key Highlighting & Missing 3D Hand Diagrams**:
   - In 2D (`src/components/lesson/KhmerKeyboard.tsx`), `if (shiftRequired && keyData.action === 'shift') return 'shift-target'` highlighted **both** `ShiftLeft` and `ShiftRight` simultaneously instead of highlighting only the opposite-hand Shift key.
   - In 3D (`src/features/three-game/components/TypingOverlay.tsx`), opposite-hand Shift was highlighted on the keyboard, but there was no visual both-hand finger diagram.
7. **Silent Data Loss in `splitItemIntoUnits()` (`src/lib/lessonTypingPlan.ts`)**:
   - When a curriculum string contained a character not present in `keyboardMap.ts`, `splitItemIntoUnits()` silently advanced past the character without recording any validation error.

---

## 2. Educational Principles Taken from the Reference Material

Drawing on the SBBIC Khmer Unicode Typing Trainer pedagogy and standard touch-typing instruction:

1. **Posture and Home-Row Anchoring First**: Students learn sitting posture, relaxed elbows/wrists, left hand on `A S D F`, right hand on `J K L ;`, thumbs on `Spacebar`, and tactile bumps on `F` and `J` before timed typing.
2. **Large, Readable Target + Physical Key Identification**: Clearly show both the physical key (`KeyboardEvent.code`) and its Khmer output.
3. **Visual Both-Hand Diagrams**: Display both left and right hands simultaneously, highlighting the active finger and any modifier finger (opposite-hand pinky for `Shift`, right thumb for `AltGr`).
4. **Reach-and-Return Technique**: Explicitly instruct students in Khmer how a finger moves from its home key to a target key and returns home (`ឈោងម្រាមដៃចង្អុលខាងឆ្វេងទៅកណ្តាលពី F ទៅ G រួចត្រឡប់មកទីតាំងដើម F វិញ`).
5. **Immediate Khmer-First Feedback**: Provide concise Khmer feedback (`"ល្អណាស់!"`, `"ប្រើម្រាមដៃចង្អុលខាងឆ្វេង"`, `"ត្រឡប់ម្រាមដៃទៅទីតាំងដើមវិញ"`, `"សាកល្បងម្តងទៀត"`).
6. **Accuracy Before Speed**: Early physical-key stages are untimed (`untimed: true`) and prioritize key-location accuracy over CPM.
7. **Honest Technical Boundary**: A standard web browser can verify which physical key code (`KeyboardEvent.code`) was pressed, and can distinguish physical keyboard events from on-screen virtual button clicks, but **cannot** detect which physical finger a student used without hardware sensors. Hand diagrams are presented as instructional guidance.

---

## 3. Recommended 10-Stage Beginner Progression

Defined in [`src/data/touchTypingFoundations.ts`](../../src/data/touchTypingFoundations.ts) (`touchTypingFoundationModules`):

| Module | Title (Khmer / English) | Mode | Focus Keys / Outputs | Educational Goal |
| :--- | :--- | :--- | :--- | :--- |
| **Foundation 1** | មូលដ្ឋានទី ១៖ ការណែនាំអំពីក្តារចុច និងទីតាំងដៃ (`Keyboard and Hand Introduction`) | `hand-position` | `KeyA`, `KeyS`, `KeyD`, `KeyF`, `KeyJ`, `KeyK`, `KeyL`, `Semicolon`, `Space` | Posture, left/right hands, `F` & `J` tactile bumps, thumbs on `Spacebar`. |
| **Foundation 2** | មូលដ្ឋានទី ២៖ ហាត់ជួរកណ្តាលដៃឆ្វេង (`Left-Hand Home-Row Practice`) | `physical-key` | `KeyF`, `KeyD`, `KeyS`, `KeyA` | Progressive left-hand home-row location and controlled repetition. |
| **Foundation 3** | មូលដ្ឋានទី ៣៖ ហាត់ជួរកណ្តាលដៃស្តាំ (`Right-Hand Home-Row Practice`) | `physical-key` | `KeyJ`, `KeyK`, `KeyL`, `Semicolon` | Progressive right-hand home-row location without combining-mark confusion. |
| **Foundation 4** | មូលដ្ឋានទី ៤៖ ការសម្របសម្រួលដៃឆ្វេង និងដៃស្តាំ (`Two-Hand Coordination`) | `physical-key` | `F J`, `D K`, `S L`, `A ;` | Alternating bilateral finger coordination across the home row. |
| **Foundation 5** | មូលដ្ឋានទី ៥៖ ការឈោងម្រាមដៃទៅជួរលើ (`Upper-Row Reach and Return`) | `physical-key` | `KeyR`, `KeyT`, `KeyY`, `KeyU`, `KeyE`, `KeyI`, `KeyW`, `KeyO`, `KeyQ`, `KeyP` | Reach upward from home row and return to home anchor key. |
| **Foundation 6** | មូលដ្ឋានទី ៦៖ ការឈោងម្រាមដៃទៅជួរក្រោម (`Lower-Row Reach and Return`) | `physical-key` | `KeyV`, `KeyB`, `KeyN`, `KeyM`, `KeyC`, `Comma`, `KeyX`, `Period`, `KeyZ`, `Slash` | Reach downward from home row and return to home anchor key. |
| **Foundation 7** | មូលដ្ឋានទី ៧៖ ការប្រើ Shift ដោយកូនដៃម្ខាងទៀត (`Shift and Two-Hand Coordination`) | `unicode-output` | `ShiftLeft`, `ShiftRight` + opposite-hand keys | Left-hand key → `ShiftRight`; Right-hand key → `ShiftLeft`. |
| **Foundation 8** | មូលដ្ឋានទី ៨៖ ការភ្ជាប់គ្រាប់ចុចទៅអក្សរខ្មែរ (`Khmer Character Connection`) | `unicode-output` | `ថ ក ដ ល ស ង ហ ា ើ` | Connect physical keys to base, Shift, and AltGr Khmer outputs. |
| **Foundation 9** | មូលដ្ឋានទី ៩៖ លំដាប់វាយអក្សរខ្មែរ ស្រៈ និងជើងអក្សរ (`Khmer Unicode Sequences`) | `unicode-output` | `កា`, `កើ`, `ក្រ`, `ខ្មែរ` | Canonical order: base consonant → coeng (`្`) + subscript → vowel → diacritic. |
| **Foundation 10** | មូលដ្ឋានទី ១០៖ ពាក្យ និងប្រយោគភាសាខ្មែរ (`Khmer Words and Sentences`) | `unicode-output` | Common words & sentences | Gradually build accuracy and CPM while reducing hints. |

---

## 4. Physical-Key (Mode A) vs. Khmer Unicode Output (Mode B) Practice

Both modes share the single verified keyboard map in [`src/data/keyboardMap.ts`](../../src/data/keyboardMap.ts):

| Feature | Mode A — Physical Keyboard Position Practice (`physical-key` / `hand-position`) | Mode B — Khmer Unicode Output Practice (`unicode-output`) |
| :--- | :--- | :--- |
| **Primary Identification** | `KeyboardEvent.code` (`KeyA`, `KeyS`, `KeyD`, `KeyF`, `KeyJ`, `KeyK`, `KeyL`, `Semicolon`, etc.) | Normalized Khmer Unicode output (`NFC` / `khmerTextEquals`) |
| **Combining Marks on Home Row** | Safe to practice `KeyJ` (`្`), `KeyA` (`ា`), and `Semicolon` (`ើ`) as physical keys without requiring standalone combining marks to form syllables | Requires valid Khmer Unicode typing order (consonant → coeng → vowel → diacritic) |
| **Virtual On-Screen Click Handling** | Virtual clicks display a Khmer guidance reminder to press the physical keyboard key and are **never** counted as verified physical-key mastery | Virtual clicks are tracked separately from physical keypresses |
| **Validation** | `splitPhysicalKeyItemIntoUnits()` verifies every code exists and is enabled in `keyboardMap.ts` | `splitItemIntoUnitsWithValidation()` flags any unmapped character in `unsupportedInputs` |

---

## 5. Home-Row and Finger Mappings (NiDA Khmer Unicode Layout)

| Physical Code | Key Label | Hand | Assigned Finger (Khmer / English) | Tactile Bump | Base Khmer Output | Shift Khmer Output | AltGr Khmer Output |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `KeyA` | `A` | Left (`ដៃឆ្វេង`) | ម្រាមដៃកូន (`left-pinky`) | No | `ា` (Vowel AA) | `ាំ` (AM) | — |
| `KeyS` | `S` | Left (`ដៃឆ្វេង`) | ម្រាមដៃនាង (`left-ring`) | No | `ស` (Consonant SA) | `ៃ` (Vowel AI) | — |
| `KeyD` | `D` | Left (`ដៃឆ្វេង`) | ម្រាមដៃកណ្តាល (`left-middle`) | No | `ដ` (Consonant DA) | `ឌ` (Consonant DO) | — |
| `KeyF` | `F` | Left (`ដៃឆ្វេង`) | ម្រាមដៃចង្អុល (`left-index`) | **Yes (`•`)** | `ថ` (Consonant THA) | `ធ` (Consonant THO) | — |
| `KeyG` *(reach from F)* | `G` | Left (`ដៃឆ្វេង`) | ម្រាមដៃចង្អុល (`left-index`) | No | `ង` (Consonant NGO) | `អ` (Consonant QA) | — |
| `KeyH` *(reach from J)* | `H` | Right (`ដៃស្តាំ`) | ម្រាមដៃចង្អុល (`right-index`) | No | `ហ` (Consonant HA) | `ះ` (Reahmuk) | — |
| `KeyJ` | `J` | Right (`ដៃស្តាំ`) | ម្រាមដៃចង្អុល (`right-index`) | **Yes (`•`)** | `្` (Sign Coeng) | `ញ` (Consonant NYO) | — |
| `KeyK` | `K` | Right (`ដៃស្តាំ`) | ម្រាមដៃកណ្តាល (`right-middle`) | No | `ក` (Consonant KA) | `គ` (Consonant KO) | — |
| `KeyL` | `L` | Right (`ដៃស្តាំ`) | ម្រាមដៃនាង (`right-ring`) | No | `ល` (Consonant LO) | `ឡ` (Consonant LA) | — |
| `Semicolon` | `;` | Right (`ដៃស្តាំ`) | ម្រាមដៃកូន (`right-pinky`) | No | `ើ` (Vowel OE) | `ោះ` (OH) | `ៗ` (Lek Too) |
| `Space` | `Spacebar` | Thumb (`មេដៃ`) | មេដៃ (`right-thumb`) | No | ` ` (Space) | ` ` (Space) | — |

---

## 6. Reusable 2D/3D Guidance Architecture

- **[`src/data/keyboardMap.ts`](../../src/data/keyboardMap.ts)**: Exports `HOME_ROW_KEY_CODES`, `LEFT_HOME_ROW_KEY_CODES`, `RIGHT_HOME_ROW_KEY_CODES`, `TACTILE_BUMP_KEY_CODES`, `isHomeRowRestKeyCode()`, `hasTactileBump()`, `getFingerHomeKeyCode()`, and `isStandaloneCombiningMarkOutput()`.
- **[`src/lib/fingerGuidance.ts`](../../src/lib/fingerGuidance.ts)**: `getFingerGuidance(key, shiftRequired, altgrRequired)` returns a unified `FingerGuidance` object containing `activeHand`, `activeFinger`, `labelKh`, `bilingualLabel`, `homeKeyCode`, `homeKeyLatin`, `isOnHomePosition`, `reachDirection`, `reachInstructionKh`, `requiredShiftCode` (`'ShiftLeft' | 'ShiftRight' | null`), `requiredModifierCode`, and `highlights`.
- **[`src/components/lesson/KhmerKeyboard.tsx`](../../src/components/lesson/KhmerKeyboard.tsx) & [`KeyboardKey.tsx`](../../src/components/lesson/KeyboardKey.tsx)**: Highlights only the exact opposite-hand Shift key (`getRequiredShiftKeyCode`), marks `F` and `J` tactile bumps (`data-tactile-bump="true"`), and marks the 8 home-row keys (`data-home-key="true"`).
- **[`src/features/three-game/components/TypingOverlay.tsx`](../../src/features/three-game/components/TypingOverlay.tsx)**: Displays the Both-Hand Finger & Home-Row Diagram (`data-testid="three-hand-guidance-diagram"`), Khmer-first reach-and-return instructions (`data-testid="three-reach-instruction"`), tactile bump indicators on `F` and `J`, and Stage 1 untimed posture review (`data-testid="three-hand-position-guide"`).

---

## 7. The Implemented 5-Stage Foundation Lesson (`foundation-home-row`)

Accessible in **3D** at `/three-game?foundation=1` (or `/3d-prototype?foundation=1`) and in **2D** at `/lesson?foundation=1`, and directly from World 1 on the World Map (`data-testid="map-foundation-banner"`):

1. **Stage 1 (`f1-s1` — ទីតាំងដៃលើជួរកណ្តាល / `Learn Hand Position`)**:
   - Mode: `hand-position` (`untimed: true`, `accuracyGoal: 85%`)
   - Student inspects the full keyboard, both hand diagrams, highlighted `A S D F` and `J K L ;` keys with `F`/`J` tactile bumps, and 5-step Khmer posture instructions. Student can press the 8 home-row keys or click `យល់ហើយ • បន្តទៅដំណាក់កាលទី 2` with no time limit.
2. **Stage 2 (`f1-s2` — ស្គាល់គ្រាប់ចុចជួរកណ្តាល / `Guided Key Discovery`)**:
   - Mode: `physical-key` (`untimed: true`, `accuracyGoal: 88%`)
   - 16 guided home-row physical keypresses (`KeyF`, `KeyJ`, `KeyD`, `KeyK`, `KeyS`, `KeyL`, `KeyA`, `Semicolon` in pairs). Unlocks the first Ancient Angkor Stone Gate (`Z = 6`).
3. **Stage 3 (`f1-s3` — ឈោងម្រាមដៃ និងត្រឡប់មកទីតាំងដើម / `Finger Reach and Return`)**:
   - Mode: `physical-key` (`untimed: true`, `accuracyGoal: 88%`)
   - 18 reach-and-return physical keypresses (`F→G→F`, `J→H→J`, `F→R→F`, `J→U→J`, `D→E→D`, `K→I→K`) at the Twin Stones altar (`Z = 16`).
4. **Stage 4 (`f1-s4` — សម្របសម្រួលដៃឆ្វេង និងដៃស្តាំ / `Left/Right Coordination`)**:
   - Mode: `physical-key` (`accuracyGoal: 90%`)
   - 16 alternating left/right hand coordination keypresses (`F J D K S L A ; A ; S L D K F J`). Unlocks the Twin Stones barrier (`Z = 16`).
5. **Stage 5 (`f1-s5` — បេសកកម្មទ្វារប្រាសាទជួរកណ្តាល / `Mini Adventure Challenge`)**:
   - Mode: `unicode-output` (`accuracyGoal: 90%`)
   - Connects the learned home-row and index-reach keys (`F, K, D, L, S, G, H`) to their printable Khmer consonants (`ថក ដល សក ងហ កដ សល ថង ហក`) to unlock the final Jungle Path Gate (`Z = 26`), followed by the **Foundation Practice Summary** (`data-testid="three-foundation-practice-summary"`) displaying keys practiced, strong/weak key positions, and next-lesson guidance.

---

## 8. Progress Compatibility Decisions

- **Existing World & Lesson IDs Preserved**: All World 1–6 lesson IDs (`1..8` and `'boss'`), stage IDs (`w1-l1-s1..s3`), and unlock rules in `adventureWorlds.ts` and `threeLessonAvailability.ts` remain 100% unchanged.
- **Dedicated Prerequisite Route (`?foundation=1`)**: Introducing the 5-stage Foundation Lesson via `?foundation=1` ensures zero collisions with saved student progress for World 1, Lesson 1 (`1:1` / `w1-home-runes`).
- **Temporary Session Rewards & Zero Production Firebase Writes**: Foundation completions use the in-memory `PrototypeRewardLedger` and `KeyPracticeTracker` without writing to production Firebase or mutating live map unlocks.

---

## 9. Test Results

- `npm run typecheck`: **Passed** (`0` TypeScript errors)
- `npm run lint`: **Passed** (`0` ESLint errors)
- `npm run test:typing` (`scripts/typingCoreTests.mjs`): **Passed** (covers all 8 home-row keys, hand/finger mappings, tactile bumps, opposite-hand Shift, AltGr, Unicode normalization, dependent vowels, coeng sequences, combining marks, Mode A vs Mode B typing plans, and unmapped character validation)
- `npm run test:gamification` (`scripts/gamificationCoreTests.mjs`): **Passed**
- `npm run test:3d` (`scripts/threePrototypeTests.mjs`): **Passed** (covers existing 3-stage World 1 Lesson 1, 5-stage Foundation Lesson, Mode A physical-key input, virtual-click vs physical-key distinction, per-key tracker strong/weak key reporting, and duplicate reward prevention)
- `npm run build`: **Passed**

---

## 10. Remaining Lessons Requiring Future Updates & Uncertain Mappings

Using `auditAllCurriculumMappings(lessonCurriculum)` in [`src/lib/lessonTypingPlan.ts`](../../src/lib/lessonTypingPlan.ts), we verified that World 1 Lessons 1–7 and the new Foundation Lesson have **zero** unmapped characters. However, the validator flagged specific legacy items in later lessons that previously failed silently and should be updated in a future curriculum pass after confirming hardware NiDA mappings:

1. **Khmer Signs Missing from `keyboardMap.ts` (Require NiDA Variant Confirmation)**:
   - `ៈ` (`U+17C8` Khmer Sign Yuukaleapintu — appears 44 times in words like `ស្រៈ` in World 1 Lesson 8, World 2 Lesson 3/8/Boss, World 6 Boss). On standard Windows/NiDA layouts, confirm whether `AltGr + Quote` (`'`) or `AltGr + Digit2` is the target classroom mapping before adding to `keyboardMap.ts` (note `Quote` currently maps `altgrKhmer: '័'` `U+17D0`).
   - `៌` (`U+17CC` Khmer Sign Robat — appears 8 times in words like `ពណ៌` in World 3 Lesson 4, World 4 Boss). Confirm `AltGr` / `Shift+Minus` mapping (`Minus` currently maps `shiftKhmer: '៍'` `U+17CD`).
   - `៏` (`U+17CF` Khmer Sign Ahsda — appears 5 times in `ក៏`, `ដ៏` in World 3 Lesson 4/Boss; typically `AltGr + Digit8` on NiDA).
   - `៎` (`U+17CE` Khmer Sign Kakabat — appears once in `ក៎` in World 3 Lesson 4; typically `AltGr + Digit7` or `AltGr + Equal` on NiDA).
2. **Embedded ASCII Symbols & English Words in Advanced Khmer Sentences**:
   - World 2 Lesson 8 Stage 3 (`ខ្មែរ = ខ + ្ + ម + ែ + រ។`) contains literal `+` (`U+002B`), which is not mapped in `keyboardMap.ts`.
   - World 5 Boss and World 6 Boss contain English words (`combo`, `timer`, `CPM`, `accuracy`, `backspace`, `Enter`) inside Khmer typing target strings, which cannot be typed while the keyboard is in Khmer layout mode. These sentences should be replaced with pure Khmer equivalents in a future curriculum cleanup task.
