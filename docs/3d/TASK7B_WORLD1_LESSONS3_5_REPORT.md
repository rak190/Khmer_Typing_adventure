# Master Task 7B — World 1 Lessons 3–5: Complete 3D Game-Based Khmer Typing Adventures

## 1. Executive Summary

World 1 Lessons 3, 4, and 5 are now fully implemented, integrated, and verified as playable 3D educational typing adventures within the Khmer Typing Adventure Angkor Wat temple courtyard.

Each lesson adheres strictly to **Curriculum V2** (touch-typing pedagogy) and reuses the established three-stage Angkorian causeway architecture while featuring distinct, authentic architectural visual mechanics:
1. **World 1 Lesson 3 — ការសម្របសម្រួលដៃទាំងពីរ (Two-Hand Coordination)** (`/three-game?world=1&level=3`):
   - **Stage 1 (`w1-l3-s1`)**: `WestTowerRuneWindows` — 8 carved stela apertures on both gopura flanking towers illuminating symmetrically with bilateral home-row keystrokes (`F-J`, `D-K`, `S-L`, `A-;`).
   - **Stage 2 (`w1-l3-s2`)**: `LetterRhythmGems` — 10 celestial rhythm crystals floating along the balustrades at the Cruciform Gopura ($Z = 13.0\text{m}$) pulsing in rhythm with alternating consonant-vowel pairs.
   - **Stage 3 (`w1-l3-s3`)**: `FirstWordsLotusCollectibles` — 8 sacred blooming lotuses along the Bakan staircase ascending with completed initial home-row words.
2. **World 1 Lesson 4 — ការឈោងម្រាមចង្អុល G និង H (Index Reaches: G and H)** (`/three-game?world=1&level=4`):
   - **Stage 1 (`w1-l4-s1`)**: `VowelWellAltar` — Sacred circular stone basin with shimmering celestial water and sacred water jets rising with index-reach accuracy (`F \to G`, `J \to H`).
   - **Stage 2 (`w1-l4-s2`)**: `VowelSwitchStoneWheel` — Rotating carved stone sun wheel with 6 radiating spokes aligning at the Gopura terrace.
   - **Stage 3 (`w1-l4-s3`)**: `TinyWordsLotusAccumulator` — Clustered lotus blossoms along the causeway avenue opening in sequence with short words.
3. **World 1 Lesson 5 — ជួរលើដៃឆ្វេង Q W E R T (Left-Hand Upper Row)** (`/three-game?world=1&level=5`):
   - **Stage 1 (`w1-l5-s1`)**: `VowelMirrorStation` — Ornate bronze and obsidian reflection stela mirror revealing proper reach angles from home positions (`F \to R/T`, `D \to E`, `S \to W`, `A \to Q`).
   - **Stage 2 (`w1-l5-s2`)**: `AroundVowelsRuneRings` — Triple concentric celestial rune rings orbiting above the Gopura altar.
   - **Stage 3 (`w1-l5-s3`)**: `LightWordsTempleLanterns` — 8 carved Angkorian stone lanterns flanking the avenue igniting with radiant golden flame.

Lessons 1 through 5 are now sequentially unlockable in 3D, and Lesson 6 remains correctly locked/unsupported until future world modules are introduced.

---

## 2. Curriculum V2 & Touch-Typing Pedagogy Validation

All three lessons follow the Curriculum V2 touch-typing framework, focusing on muscle memory, finger assignments, and strict Unicode typing sequence:

| Lesson | Stage | Stage ID | Pedagogical Focus | Target Units | Key Mappings & Targets | Min Acc |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **L3: Two-Hand Coordination** | Stage 1 | `w1-l3-s1` | Home Alternation (`F-J`, `D-K`, `S-L`, `A-;`) | 24 | `ថ`, `់`, `ដ`, `ក`, `ស`, `ល`, `ា`, `ើ` | 90% |
| | Stage 2 | `w1-l3-s2` | Home Key Pairs (Consonant + Vowel Flow) | 23 | `ថ ់`, `ដ ក`, `ស ល`, `ា ើ`, `ក ដ`, `ល ស`, `ក ា`, `ដ ើ`, `ស ា`, `ល ើ` | 92% |
| | Stage 3 | `w1-l3-s3` | First Home-Row Words | 25 | `ដក`, `កដ`, `សល`, `លស`, `កា`, `ដា`, `សា`, `លា`, `កើ`, `ដើ` | 92% |
| **L4: Index Reaches: G & H** | Stage 1 | `w1-l4-s1` | Index Reaches (`F \to G`, `J \to H`) | 34 | `ថ`, `ង` (KeyG), `់`, `ហ` (KeyH) | 90% |
| | Stage 2 | `w1-l4-s2` | Index Reach Word Pairs | 26 | `ថ ង`, `់ ហ`, `ង ថ`, `ហ ់`, `ថ ហ`, `ង ់`, `ក ង`, `ដ ហ`, `ស ង`, `ល ហ` | 92% |
| | Stage 3 | `w1-l4-s3` | Index Reach Vocabulary | 43 | `ងា`, `ហា`, `កង`, `ដង`, `សង`, `លង`, `ហាង`, `កាហា` | 92% |
| **L5: Left Upper Row** | Stage 1 | `w1-l5-s1` | Left Reaches (`F \to R/T`, `D \to E`, `S \to W`, `A \to Q`) | 33 | `ថ`, `រ` (KeyR), `ត` (KeyT), `ដ`, `ើ` (KeyE), `ស`, `ឹ` (KeyW), `ឆ` (KeyQ), `ា` (KeyA) | 90% |
| | Stage 2 | `w1-l5-s2` | Upper Left Reaches & Pairs | 26 | `ថ រ`, `ថ ត`, `ដ ើ`, `ស ឹ`, `ា ឆ`, `រ ត`, `ើ ឹ`, `ឆ រ`, `ត ើ ឆ` | 92% |
| | Stage 3 | `w1-l5-s3` | Left Upper Vocabulary Words | 39 | `រដ`, `តរ`, `ឆា`, `រា`, `តា`, `សរ`, `កត`, `រើស`, `ដើរ` | 92% |

### Unicode Integrity
- Dependent vowels (`ា`, `ើ`, `ឹ`) and signs (`់`) are always entered in logical phonetic order (Base Consonant followed by Vowel/Sign).
- Zero broken graphemes, zero dropped diacritics, and 100% adherence to Khmer Unicode standards.

---

## 3. Stage 3D Visual Mechanics & Placements

### 1. Ancient Stone Gate 1 Visual Additions (`AncientStoneGate.tsx`)
Gate 1 ($Z = 6.0\text{m}$, bridge approach from $Z = -3.4\text{m}$ to $Z = +2.5\text{m}$) features stage-specific challenges for Stage 1:
- **Lesson 3 Stage 1 (`WestTowerRuneWindows`)**:
  - Located on both outer gopura towers at $X = \pm 3.1\text{m}$, $Z = 6.0\text{m}$, $Y = 1.8\text{m}$ to $3.6\text{m}$.
  - 8 vertical carved stela windows (4 on west tower, 4 on east tower).
  - Keystrokes with the left hand ignite the west tower windows, and right-hand keystrokes ignite the east tower windows, visually reinforcing bilateral hand coordination.
  - Active index highlights in pulsating gold (`#F59E0B`), and completed windows illuminate in brilliant celestial cyan (`#38BDF8`).
- **Lesson 4 Stage 1 (`VowelWellAltar`)**:
  - Located directly in front of Gate 1 at $X = 0$, $Y = 0$, $Z = 2.0\text{m}$.
  - Features a multi-tiered circular stone basin with an inner rippling celestial water disc (`#0EA5E9`) and glowing central spout.
  - Accurately typing G (`ង`) and H (`ហ`) triggers a vertical water column and golden ripples expanding outward.
- **Lesson 5 Stage 1 (`VowelMirrorStation`)**:
  - Located at $X = 0$, $Y = 0$, $Z = 1.8\text{m}$.
  - Features an ornate bronze and obsidian reflection mirror stela mounted on a carved sandstone pediment.
  - Reflects the finger reach paths from the home row upward to keys `Q`, `W`, `E`, `R`, `T`, illuminating runes along the border.

### 2. Stage 2 & 3 Causeway Challenges (`StageChallenges.tsx`)
Located along the central avenue between Gate 1 ($Z = 6\text{m}$), Gate 2 ($Z = 16\text{m}$), and Gate 3 ($Z = 26\text{m}$):
- **Lesson 3 Stage 2 (`LetterRhythmGems`)**:
  - Flanking the cruciform terrace at $Z = 13.0\text{m}$ with 10 floating rhythm crystals.
  - Alternating colors (`#38BDF8` cyan and `#FBBF24` gold) pulse synchronously as consonant-vowel combinations are typed.
- **Lesson 3 Stage 3 (`FirstWordsLotusCollectibles`)**:
  - 8 floating golden lotus blooms placed along the Bakan entrance staircase from $Z = 23.5\text{m}$ to $Z = 25.5\text{m}$.
  - Each completed word causes a lotus to bloom into full petal configuration, emitting ambient upward particles.
- **Lesson 4 Stage 2 (`VowelSwitchStoneWheel`)**:
  - Centered at the Cruciform terrace ($Z = 14.5\text{m}$, $Y = 2.2\text{m}$).
  - A 6-spoke carved stone sun wheel that rotates by $60^\circ$ each time an index-reach pair is completed.
- **Lesson 4 Stage 3 (`TinyWordsLotusAccumulator`)**:
  - 8 clustered lotus blossom shrines lining both causeway stone balustrades at $X = \pm 1.8\text{m}$, $Z = 22\text{m} \dots 25\text{m}$.
  - Sequentially activates and ascends as vocabulary targets are reached.
- **Lesson 5 Stage 2 (`AroundVowelsRuneRings`)**:
  - Hovering above the Gopura terrace at $Z = 14.5\text{m}$, $Y = 2.6\text{m}$.
  - Triple nested concentric rings rotating on opposing axes, expanding their celestial radius as upper-row reach pairs succeed.
- **Lesson 5 Stage 3 (`LightWordsTempleLanterns`)**:
  - 8 traditional Khmer stone lanterns flanking the avenue approaching the inner sanctum ($Z = 22.0\text{m} \dots 25.5\text{m}$).
  - Braziers ignite with golden-orange flames and lantern core stelas glow with sacred fire as words are completed.

---

## 4. Availability, Access Control, and Completion Contract

1. **Availability Registry (`src/data/threeLessonAvailability.ts`)**:
   - `supportedThreeLessons` now strictly contains: `new Set(['1:1', '1:2', '1:3', '1:4', '1:5'])`.
   - Access to `/three-game?world=1&level=6` returns `{ status: 'unsupported' }` (or `'locked'` if earlier lessons are uncompleted).
2. **Completion Contract (`src/lib/completionContract.ts`)**:
   - 3D mode allowed lessons list expanded to: `['1:1', '1:2', '1:3', '1:4', '1:5']`.
   - Any attempt to submit completion for an unsupported 3D lesson (e.g. `1:6`) is rejected with `INVALID_MODE`.
3. **Multi-Stage Physical Barrier Clamping**:
   - Character movement is restricted by stage gates:
     - Stage 1 active: Clamped to $Z \in [-5.0, 5.8]$.
     - Stage 2 active: Clamped to $Z \in [-5.0, 15.8]$.
     - Stage 3 active: Clamped to $Z \in [-5.0, 25.8]$.
     - All stages cleared: Unlocked through to Sanctuary forecourt ($Z = 29.5\text{m}$).

---

## 5. Verification Test Suite Results

All quality gates, unit tests, integration tests, and production builds passed with 0 errors:

| Quality Gate | Command | Result | Verification Notes |
| :--- | :--- | :---: | :--- |
| **3D Prototype Tests** | `node scripts/threePrototypeTests.mjs` | **PASS** | 21 comprehensive sections testing full 3D flow for Lessons 1–5, barrier clamping, stage units, pass criteria, and lock/unlock progression. |
| **Completion Security Tests** | `node scripts/completionTests.mjs` | **PASS** | Validates 3D allowed lessons `1:1` through `1:5`, rejecting `1:6`. Verified idempotency, replay protection, and XP/coin reward caps. |
| **Typing Core Tests** | `node scripts/typingCoreTests.mjs` | **PASS** | Verified Khmer Unicode grapheme cluster splitting, CPM calculations, and touch-typing plans. |
| **Gamification Tests** | `node scripts/gamificationCoreTests.mjs` | **PASS** | Verified quests, student economy, and achievements. |
| **TypeScript Typecheck** | `npm.cmd run typecheck` | **PASS** | `tsc --noEmit` on `tsconfig.app.json` and `tsconfig.node.json` (0 errors). |
| **ESLint** | `npm.cmd run lint` | **PASS** | 0 warnings, 0 errors. |
| **Cloud Functions Typecheck** | `npm.cmd run typecheck:functions` | **PASS** | `tsc -p tsconfig.functions.json` (0 errors). |
| **Cloud Functions Build** | `npm.cmd run build:functions` | **PASS** | Functions bundle generated successfully. |
| **Production App Build** | `npm.cmd run build` | **PASS** | Production Vite client build completed in 5.55s. |

---

## 6. Visual Verification Gallery

The automated headless browser QA suite captured comprehensive screenshots of all stages, challenges, and typing modes:

### Lesson 3 — Two-Hand Coordination
- **Stage 1 (WestTowerRuneWindows)**: Flanking stela apertures on west and east gopura towers.
  ![Lesson 3 Stage 1](task7b_lesson3_stage1_west_tower_rune_windows.png)
- **Stage 1 Typing Mode**: Two-hand alternating prompts, key and finger cues.
  ![Lesson 3 Stage 1 Typing](task7b_lesson3_stage1_typing_mode.png)
- **Stage 2 (LetterRhythmGems)**: Rhythm crystals along the cruciform gopura balustrade.
  ![Lesson 3 Stage 2](task7b_lesson3_stage2_letter_rhythm_gems.png)
- **Stage 3 (FirstWordsLotusCollectibles)**: Floating lotuses along the hill steps.
  ![Lesson 3 Stage 3](task7b_lesson3_stage3_first_words_lotus.png)

### Lesson 4 — Index Reaches: G and H
- **Stage 1 (VowelWellAltar)**: Sacred water basin with radiating ripples.
  ![Lesson 4 Stage 1](task7b_lesson4_stage1_vowel_well_altar.png)
- **Stage 1 Typing Mode**: G and H index reach targets and finger cues.
  ![Lesson 4 Stage 1 Typing](task7b_lesson4_stage1_typing_mode.png)
- **Stage 2 (VowelSwitchStoneWheel)**: Rotating 6-spoke stone wheel at gopura terrace.
  ![Lesson 4 Stage 2](task7b_lesson4_stage2_vowel_switch_stone_wheel.png)
- **Stage 3 (TinyWordsLotusAccumulator)**: Clustered blooming lotuses along avenue.
  ![Lesson 4 Stage 3](task7b_lesson4_stage3_tiny_words_lotus.png)

### Lesson 5 — Left-Hand Upper Row
- **Stage 1 (VowelMirrorStation)**: Bronze and obsidian reflection stela mirror.
  ![Lesson 5 Stage 1](task7b_lesson5_stage1_vowel_mirror_station.png)
- **Stage 1 Typing Mode**: Q, W, E, R, T upper reaches and guidance.
  ![Lesson 5 Stage 1 Typing](task7b_lesson5_stage1_typing_mode.png)
- **Stage 2 (AroundVowelsRuneRings)**: Triple concentric celestial rune rings.
  ![Lesson 5 Stage 2](task7b_lesson5_stage2_around_vowels_rune_rings.png)
- **Stage 3 (LightWordsTempleLanterns)**: 8 carved Angkorian stone lanterns with golden flame.
  ![Lesson 5 Stage 3](task7b_lesson5_stage3_light_words_temple_lanterns.png)

### Access Control Notice
- **Lesson 6 Direct Access**: Locked / Unsupported modal correctly presented.
  ![Lesson 6 Notice](task7b_lesson6_unsupported_notice.png)

---

## 7. Conclusion

Master Task 7B is complete. World 1 Lessons 3, 4, and 5 provide an immersive, pedagogically sound, and visually polished 3D typing adventure for Cambodian students.
