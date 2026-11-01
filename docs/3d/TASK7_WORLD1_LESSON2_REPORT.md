# Master Task 7A — World 1 Lesson 2: Complete 3D Game-Based Khmer Typing Adventure

## 1. Executive Summary

World 1 Lesson 2 (**ជួរព្យញ្ជនៈ / Consonant Rows**) is now fully implemented, integrated, and verified as a playable 3D educational adventure in the sunlit Angkor Wat temple courtyard at route `/three-game?world=1&level=2`.

The implementation preserves the existing rigged student character, animations, Khmer Unicode curriculum, teaching overlays, gate mechanics, and multi-stage engine while introducing custom, lightweight thematic stage responses:
1. **Stage 1 — ស្ពានដំបូង (First Bridge)** (`w1-l2-s1`): 15 carved sandstone planks across the causeway approach with inlaid Khmer consonant runes that illuminate sequentially as new keys are typed.
2. **Stage 2 — គូប្រយ័ត្ន (Careful Pairs)** (`w1-l2-s2`): Twin Angkorian ceremonial stone lanterns flanking the Cruciform Gopura at $Z = 16\text{m}$ that ignite in unison as confusing consonant pairs are typed accurately.
3. **Stage 3 — ជើងភ្នំ (Hill Steps)** (`w1-l2-s3`): 8 ascending carved sandstone steps with golden lotus carvings that rise toward the Inner Bakan Sanctuary at $Z = 26\text{m}$ as meaningful Khmer words are completed.

---

## 2. Curriculum & Keyboard Validation

All target items across all three stages of Lesson 2 were audited against the official Khmer keyboard layout in `src/data/keyboardMap.ts`:

| Stage | Stage ID | Title (Kh/En) | Items Count | Min Accuracy | Target Items & Key Mappings |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Stage 1** | `w1-l2-s1` | ស្ពានដំបូង (First Bridge) | 15 | 90% | `ដ` (KeyD), `ឋ` (KeyZ), `ឌ` (KeyD+Shift), `ឍ` (KeyZ+Shift), `ណ` (KeyN+Shift), `ត` (KeyT), `ថ` (KeyF), `ទ` (KeyT+Shift), `ធ` (KeyF+Shift), `ន` (KeyN), `ប` (KeyB), `ផ` (KeyP), `ព` (KeyB+Shift), `ភ` (KeyP+Shift), `ម` (KeyM) |
| **Stage 2** | `w1-l2-s2` | គូប្រយ័ត្ន (Careful Pairs) | 8 pairs (16) | 92% | `ដឋ`, `ឌឍ`, `តថ`, `ទធ`, `បផ`, `ពភ`, `ណន`, `មន` |
| **Stage 3** | `w1-l2-s3` | ជើងភ្នំ (Hill Steps) | 8 words (19) | 92% | `តា` (KeyT, KeyA), `ដី` (KeyD, KeyI+Shift), `ទា` (KeyT+Shift, KeyA), `បា` (KeyB, KeyA), `មា` (KeyM, KeyA), `នំ` (KeyN, KeyM+Shift), `ទឹក` (KeyT+Shift, KeyW, KeyK), `មាត់` (KeyM, KeyA, KeyT, Quote) |

- **Validation Result**: 100% valid, 0 unsupported Unicode code points, 0 dropped characters.
- **Vowel & Diacritic Ordering**: In Stage 3, dependent vowels (`ា`, `ី`, `ឹ`), nikahit (`ំ`), and bantoc (`់`) follow correct Unicode logical order (consonant first) with explicit pedagogical guidance.

---

## 3. Stage-Specific 3D Mechanics

### Stage 1 — ស្ពានដំបូង (First Bridge)
- **Component**: `FirstBridgePlanks` in `AncientStoneGate.tsx`.
- **Environment Placement**: Spanning the causeway approach from $Z = -3.4\text{m}$ to $Z = +2.5\text{m}$ (relative to Gate 1 at $Z = 6\text{m}$).
- **Visual Feedback**:
  - 15 carved sandstone planks with inlaid rune glyph bands.
  - Active target plank glows with amber energy (`#F59E0B`).
  - Completed planks illuminate with brilliant cyan runes (`#38BDF8`) and golden curbs (`#FBBF24`).
  - When Stage 1 passes, all 15 planks blaze with divine radiant energy as the ancient gate doors slide open.

### Stage 2 — គូប្រយ័ត្ន (Careful Pairs)
- **Component**: `CarefulPairsTwinLanterns` in `StageChallenges.tsx`.
- **Environment Placement**: Flanking the Cruciform Gopura terrace entrance at $X = \pm 1.65\text{m}$, $Z = 14.8\text{m}$.
- **Visual Feedback**:
  - Octagonal fluted sandstone shafts with 8 paired tier rings matching the 8 curriculum pairs.
  - Each completed pair lights up matching paired tier rings and intensifies sacred brazier flames.
  - Combo streaks increase flame height and golden warmth (`#FBBF24`).
  - Mistyped pairs produce a gentle amber flicker and dissipation without breaking the stage.
  - On passing ($\ge 92\%$), both lanterns ignite into golden pillars of light as the monolith barriers part.

### Stage 3 — ជើងភ្នំ (Hill Steps)
- **Component**: `HillStepsStaircase` in `StageChallenges.tsx`.
- **Environment Placement**: Ascending through the Bakan portal from $Z = 25.2\text{m}$ to $Z = 28.4\text{m}$ toward the Inner Sanctum.
- **Visual Feedback**:
  - 8 carved sandstone steps with golden lotus petal friezes and flame finials.
  - Word thresholds: `[2, 4, 6, 8, 10, 12, 15, 19]` units.
  - Each completed word causes a step to rise and solidify with golden lotus illumination (`#FBBF24` / `#D97706`).
  - On clearing Stage 3 ($\ge 92\%$), the full stairway of light is raised, the teak double doors swing open, and the player steps onto the sacred forecourt framed by royal Tung Chey victory banners.

---

## 4. Progression, Access Control, and 2D/3D Parity

1. **Strict Prerequisites**:
   - `getThreeLessonAccess` verifies lesson completion sequentially.
   - When Lesson 1 is incomplete, accessing `/three-game?world=1&level=2` returns `status: 'locked'` and renders the locked modal (`សូមបញ្ចប់មេរៀនមុនសិន`).
   - Once Lesson 1 is cleared (in either 2D or 3D mode), Lesson 2 immediately transitions to `status: 'ready'`.
2. **World Map Integration**:
   - On the World Map, selecting Lesson 2 displays the golden `"រៀនក្នុងពិភព 3D (Play 3D)"` button when unlocked.
3. **Sequential Stage Locking in 3D**:
   - Stage 2 cannot be initiated until Stage 1 is cleared.
   - Stage 3 cannot be initiated until Stage 2 is cleared.
   - Character physics clamping (`clampMultiStageCharacterPosition`) physically blocks traversal past closed barriers.
4. **Completion Parity & Security**:
   - Saves record completion with payload ID `1:2`, mode `3d`, and category `unicode-output`.
   - Rewards are tracked through the in-memory ledger and server completion contract to prevent duplication.

---

## 5. Automated Verification Results

| Quality Gate | Command | Result | Details |
| :--- | :--- | :---: | :--- |
| **TypeScript Typecheck** | `npm.cmd run typecheck` | **PASS** | 0 errors across app and node configs |
| **ESLint** | `npm.cmd run lint` | **PASS** | 0 warnings, 0 errors |
| **Typing Core Tests** | `npm.cmd run test:typing` | **PASS** | Grapheme splitting, CPM, accuracy calculations |
| **Gamification Tests** | `npm.cmd run test:gamification` | **PASS** | Quests, achievements, wallet contracts |
| **3D Prototype Tests** | `npm.cmd run test:3d` | **PASS** | Includes 18-part test suite with full Lesson 2 coverage |
| **Completion Tests** | `npm.cmd run test:completion` | **PASS** | Security hardening and validation |
| **Functions Typecheck** | `npm.cmd run typecheck:functions` | **PASS** | 0 errors in Cloud Functions |
| **Functions Build** | `npm.cmd run build:functions` | **PASS** | Functions bundle built successfully |
| **Production Build** | `npm.cmd run build` | **PASS** | Compiled Vite production bundle in 6.79s |

---

## 6. Recommendations for Task 7B

1. **World 1 Lesson 3 (ជួរចុងក្រោយ / Last Consonants)**:
   - Covers remaining consonants (`យ`, `រ`, `ល`, `វ`, `ស`, `ហ`, `ឡ`, `អ`).
   - Can reuse the 3-stage causeway pipeline with custom environmental dressings (e.g. sacred lotus lily pads in moat, library scroll alcoves).
2. **Audio Stems**:
   - Add subtle traditional roneat / pinpeat chimes on successful rune activation and step elevation.
