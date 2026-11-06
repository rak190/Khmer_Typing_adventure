# Task 8B: World 1 Complete 3D Gameplay, Visual Quality, and Player Experience Polish Reference Report

**Document Status**: Historical baseline with current Task 8B verification addendum below
**Branch**: `feat/task-8b-world1-complete-polish`  
**Date**: November 2026  
**Scope**: World 1 (Temple Jungle / ព្រៃប្រាសាទ) Lessons 1–8 and Temple Guardian Boss Encounter  
**Related Requirements**: Master Task 8B, AGENTS.md, Architectural Guidelines  

---

## 1. Earlier implementation summary (historical; see current findings below)

Master Task 8B completes the transformation of World 1 (ព្រៃប្រាសាទ / Temple Jungle) from an exploratory prototype into a polished, high-fidelity 3D educational adventure game for Cambodian students.

### Core Problems Identified & Resolved During Independent Audit:
1. **Critical Discontinuity in Level 8 (Sacred River)**:
   - *Problem*: The ceremonial dragon barge was placed off-center at `X = -3.8` while stone piers were at `X = 0`. Walking forward snapped the player sideways by 2.5 meters into water without continuous walkable geometry.
   - *Fix*: Re-aligned the Ceremonial Dragon Barge along the central river channel (`X = 0`, width 3.2m, length 7.6m). The barge acts as a majestic floating bridge deck between Pier 0 and Island Pier 1 in Stage 0, smoothly sails forward to span the deep channel between Pier 1 and Guardian Shore Landing Pier 2 in Stage 1, and docks solidly without sideways teleportation or water clipping.
2. **Missing Geometry & Clamping Barrier in Level 3 (Angkor Twin Bridges)**:
   - *Problem*: Station 1 altar at `[0, 0, 10.5]` hovered in thin air over a 5m deep black chasm with no platform underneath. Furthermore, boundary clamping checked `s1Open` instead of `s0Open`, actively repelling the player away from Station 1.
   - *Fix*: Modeled a massive Mid-Chasm Stone Pier Platform rising from the chasm floor with carved flagstones and capitals supporting Station 1. Updated collision logic so players can walk out onto the Mid-Chasm Pier when Stage 0 is open/opening.
3. **Unreachable Station 2 in Level 5 & Level 6**:
   - *Problem*: `clampLessonCharacterPosition` capped `maxZ` at 18.0 (Level 5) and 18.5 (Level 6) when Stage 1 was open. However, Station 2 in both levels is positioned at `Z = 20.0`! Players could not step onto the Crown Sanctuary terrace or Overlook platform.
   - *Fix*: Updated `maxZ` to 22.0 (Level 5) and 21.5 (Level 6) upon Stage 1 completion, enabling full access to Station 2.
4. **Floating Altars in Level 2 (Lotus Garden)**:
   - *Problem*: Altars 1, 2, and 3 sat directly on the water surface with no supporting plinths, and walking between stations lacked stepping stones.
   - *Fix*: Added solid carved stone lotus plinth islands under all three altars, and stepping stones across the pond.
5. **Missing Lesson Mission Onboarding UI**:
   - *Problem*: `introMissionKh` and `introMissionEn` existed in config files but were never presented to students before lessons.
   - *Fix*: Created and wired `LessonIntroModal.tsx`, a child-friendly Khmer-first mission briefing modal with clear objectives, pedagogical touch-typing skill badges, 3-stage roadmap, and keyboard navigation (`Space`/`Enter`/`E`/`Escape`).
6. **Traversal Lock During 'opening' State**:
   - *Problem*: When stages were passed, status was `'opening'` for 2.2 seconds. Boundary clamping only recognized `'open'`, trapping the hero behind invisible walls during cinematic opening sweeps.
   - *Fix*: Extended `clampLessonCharacterPosition` to treat both `'open'` and `'opening'` as traversable.

---

## 2. A. Before & After Findings (Levels 1–8 & Temple Guardian)

### Level 1: Ancient Finger Sanctuary (វិហារម្រាមបុរាណ)
- **Original Problem**: Stelas had static glow; sundial rotation was disconnected from player keystrokes; exit gate lacked physical consequence.
- **Implemented Improvement**: Keystroke reactive pulse on active stelas (F, D, S, A); astrolabe rotation speed accelerates with typing progress and streaks; luminous floor conduits light up to link stelas to central sundial; exit wall lowers into ground upon completion.
- **Gameplay Difference**: Clear visual direction guiding left-hand home row exploration (East Altar -> West Altar -> Central Sundial).
- **Visual Difference**: Golden and sky-blue energy channels connecting stone stelas to the rotating astrolabe.
- **Educational Purpose**: Left-hand home-row anchors (`F D S A` / `ថ ដ ស ា`) and finger independence.

### Level 2: Enchanted Lotus Garden (សួនផ្កាឈូកទិព្វ)
- **Original Problem**: Default stone causeway cut through the sacred water pool; altars floated unsupported on water surface; stepping pads lacked progressive emergence.
- **Implemented Improvement**: Suppressed default causeway (`hideCauseway: true`); added solid stone lotus plinth islands under all 3 altars; lily pads and flower petals bloom and elevate out of the water based on typing progress (`completedCount / totalStageUnits`).
- **Gameplay Difference**: Physical stepping path across the pond opens in response to typing accuracy; player cannot walk into deep water.
- **Visual Difference**: Shimmering teal pool with pink and cyan blooming lotus flowers and jade lily pads.
- **Educational Purpose**: Right-hand home-row anchors (`J K L ;` / `់ ក ល ើ`).

### Level 3: Angkor Twin Bridges (ស្ពានភ្លោះអង្គរ)
- **Original Problem**: Station 1 altar hovered over an empty void; causeway geometry clipped over chasm; player was blocked from standing at Station 1.
- **Implemented Improvement**: Suppressed default causeway; modeled monumental Mid-Chasm Stone Pier Platform rising from chasm floor; Left and Right cantilever arch blocks telescope outward with typing progress; royal keystone descends to lock both bridges upon completion.
- **Gameplay Difference**: Real spatial traversal consequence—player advances onto Mid-Chasm Pier, then crosses united arches to the far sanctuary.
- **Visual Difference**: Deep mist-filled chasm spanned by ornate sandstone cantilever arches with glowing turquoise runes.
- **Educational Purpose**: Bilateral two-hand home row coordination and rhythm alternation.

### Level 4: Jungle Crossroads (ផ្លូវបំបែកក្នុងព្រៃ)
- **Original Problem**: Left and right paths were disconnected; trail lacked clear directional cues; crossroads felt decorative rather than navigational.
- **Implemented Improvement**: Added connecting transversal trail between West Grove (`G / ង`) and East Shrine (`H / ហ`); rotating compass dial accelerates with keystroke hits; amber and cyan trail lanterns illuminate active paths; hidden jungle shrine unlocks upon completion.
- **Gameplay Difference**: Meaningful choice and exploration between West and East branches corresponding to index finger reaches.
- **Visual Difference**: Warm amber forest canopy with glowing compass runes and mossy stone pathways.
- **Educational Purpose**: Center index-finger reaches (`G H` / `ង ហ`).

### Level 5: Climbing Temple Tower (ការឡើងប្រាសាទកំពូល)
- **Original Problem**: Character could not reach Station 2 at `Z = 20.0` due to restrictive `maxZ = 18.0` clamp; steps popped into place without organic emergence; feet clipped through geometry.
- **Implemented Improvement**: Fixed `maxZ = 22.0` on Stage 1 open; smooth multi-tier stair elevation with procedural rise (`stair1Rise`, `stair2Rise`); smooth character Y elevation tracking steps (`Y = 0` -> `Y = 2.2m` -> `Y = 4.4m`); camera preset framing rises with character elevation.
- **Gameplay Difference**: Authentic vertical ascension up multi-tier terraces with panoramic reveal of surrounding temple jungle.
- **Visual Difference**: Multi-tier golden sandstone stepped pyramid with towering Bakan prang spires illuminated by summit braziers.
- **Educational Purpose**: Left-hand upper-row reaches (`Q W E R T` / `ឆ ដ រ ត អ`).

### Level 6: Sky Platforms (វេទិកាវេហាស៍)
- **Original Problem**: Clamping blocked access to Station 2 at `Z = 20.0` (`maxZ = 18.5`); floating platforms wobbled unpredictably without typing feedback.
- **Implemented Improvement**: Fixed `maxZ = 21.5` on Stage 1 open; platform wobble stabilizes as typing rhythm steadies; glowing celestial runic rings expand beneath active platforms; floating sun disc portal unlocks at summit.
- **Gameplay Difference**: Safe, non-punishing stepping platform traversal where platforms lock into solid footing as typing progress advances.
- **Visual Difference**: Brilliant azure sky and cloud sea with floating stone discs adorned with glowing cyan runic circles.
- **Educational Purpose**: Right-hand upper-row reaches (`Y U I O P` / `ប ហ គ ស ភ`).

### Level 7: Crystal Cave (រូងថ្មគ្រីស្តាល់)
- **Original Problem**: Cavern was too bright or clipped with outdoor palm trees; crystal clusters were static; no sense of subterranean exploration.
- **Implemented Improvement**: Enabled `isCavern: true` and `hideCauseway: true`; suppressed outdoor sun, clouds, and libraries; deep indigo/slate ambient atmosphere; giant crystal clusters (Z, X, C, V) flash on keystrokes and intensify shimmer with streak; ancient monolith exit door sinks into the cavern floor.
- **Gameplay Difference**: Clear light-guided route through dark subterranean hall without compromising character or keyboard readability.
- **Visual Difference**: Basalt cavern arches with radiant violet, magenta, and sapphire crystal clusters casting specular highlights.
- **Educational Purpose**: Left-hand lower-row reaches (`Z X C V B` / `ឋ ខ ច វ ប`).

### Level 8: Sacred River Crossing (ការឆ្លងកាត់ស្ទឹងស័ក្តិសិទ្ធិ)
- **Original Problem**: Dragon barge was misaligned at `X = -3.8`; player was violently snapped sideways across water; no connecting walkway between piers.
- **Implemented Improvement**: Centered Ceremonial Dragon Barge along central river channel (`X = 0`); barge serves as physical bridge deck between Pier 0 and Island Pier 1 (Stage 0), then sails forward to span the channel to Guardian Shore Pier 2 (Stage 1); continuous central traversal corridor (`X in [-2.5, 2.5]`); Guardian Shore Gateway lowers upon completion.
- **Gameplay Difference**: Continuous, physically grounded journey across the sacred baray directly to the Temple Guardian dais.
- **Visual Difference**: Golden sunset sky over turquoise waters, ceremonial dragon barge with carved Naga prow and red ceremonial canopy.
- **Educational Purpose**: Right-hand lower-row reaches (`N M , . /` / `ន ម ុំ ោះ ៕`) and full foundational sentence review.

### Temple Guardian Boss (ម្ចាស់ប្រាសាទព្រៃ)
- **Original Problem**: Sudden boss start without intro; audio triggers missing; boss defeat lacked emotional weight.
- **Implemented Improvement**: Procedural audio for boss awakening (`playBossAwaken`), shield shatter (`playShieldShatter`), and keystroke impacts; 3-tier wave progression with distinct visual feedback (awakening shield -> stone armor -> final typing trial); boss flinches on hits and shudders on mistakes; defeat sequence features reverent bow, particle dissipation, and temple lights awakening.
- **Gameplay Difference**: Thrilling, multi-phase typing boss fight with clear visual and acoustic feedback for shield destruction.
- **Visual Difference**: 8-meter Simha stone guardian surrounded by rotating concentric runic barrier shields that fracture and dissolve.
- **Educational Purpose**: Cumulative base keyboard touch-typing mastery under timed rhythm and accuracy constraints.

---

## 3. B. Environment Improvements & Transformation Systems

### Three Feedback Tiers:
1. **Feedback Tier A (Keystroke Level)**:
   - Runes, crystals, and beacons flare with emissive intensity (`emissiveIntensity` boost of +0.7 to +1.2 for 0.4s).
   - Soft Cambodian pentatonic keystroke chimes synthesize via Web Audio oscillator nodes.
2. **Feedback Tier B (Progress Level)**:
   - Interpolation ratio `completedCount / totalStageUnits` continuously drives mesh positions, petal expansion, arch extension, and barge sailing in `useFrame`.
3. **Feedback Tier C (Stage Mastery Level)**:
   - Authoritative stage completion triggers permanent structural transformations: barriers lower (`Y = -4.0`), bridges lock, and boundary clamps open.
   - Procedural audio fires: `playMechanismActivation()` (deep granite slide) or `playShieldShatter()` (resonant crystal crack).

---

## 4. C. Character & Camera Polish

### Rigged Character Locomotion & Animation:
- Smooth blending between **Idle**, **Walk**, and **Sprint** (`moveBlendRef` smoothly lerps over delta time).
- Natural knee bending on leg lifts and torso lean during movement.
- Procedural arm swing and secondary cape cloth simulation (`Cape_01`, `Cape_02`).
- **Typing Ready Posture**: Hero lowers hands forward toward the altar, spine straightens with focused breathing, and slight head nods acknowledge correct keystrokes.
- **Spell Casting**: Hero gestures forward with arm extension on milestone streaks, coordinating with `SpellProjectileSystem`.
- **Celebration / Victory**: High victory wave and joyful hops during stage opening sweeps and lesson completions.

### Dynamic Third-Person Camera:
- Data-driven `CameraPreset` configuration per level in `lessonExperienceConfig.ts`.
- Smooth over-the-shoulder framing in typing mode (`offsetX: -0.75`).
- Cinematic sweep and tilt during barrier opening (`mode === 'opening'`).
- Elevation-aware camera tracking for Level 5 stairs (`desiredCamPos` accounts for `ty`).

---

## 5. D. Game Feel, Audio & Educational Onboarding

### Procedural Web Audio Engine (`src/lib/audio/gameAudio.ts`):
- **Zero Asset Dependencies**: 100% synthesized in real time via Web Audio API.
- `playKeystrokeChime()`: Melodic Khmer pentatonic scale (Roneat Ek xylophone timbre).
- `playMistakeSound()`: Gentle wooden temple block tap (encouraging, non-punishing).
- `playTempleGong()`: Resonant Angkor bronze temple gong (110 Hz fundamental with metallic overtones).
- `playMechanismActivation()`: Low-pass filtered sawtooth rumble with harmonic release.
- `playShieldShatter()`: High-frequency transient crack followed by descending crystalline sparkle.
- `playBossAwaken()`: Low brass drone with sweeping resonant filter.
- `playFootstep()`: Procedural stone and gravel crunch with sprint pitch variation.

### Mission Onboarding & Pedagogical Transparency:
- **`LessonIntroModal.tsx`**: Presented before exploration begins. Displays authentic Khmer mission goals, pedagogical competency badges, stage roadmaps, and keyboard controls.
- **`VictoryModal.tsx`**: Displays final metrics (accuracy %, CPM, stars, XP, coins) along with the specific Khmer touch-typing skill achieved.
- **In-World Waypoints**: Dynamic 3D beacons display stage names, key requirements, and `[E]` interaction prompts.

---

## 6. E. Performance & Classroom Hardware Optimization

### Optimizations for Integrated GPU School Hardware:
- **Draw Call Reduction**: Suppressed redundant Causeway geometry on levels with custom terrain.
- **Material Sharing**: Reused standard sandstone, teak, and water materials across instanced meshes.
- **Geometry Efficiency**: Procedural box, cylinder, and ring geometries with optimized radial segments (12–20).
- **Frame-Rate Independence**: All animations and camera smoothers use exponential decay `1 - exp(-damping * dt)`.
- **SSR & Headless Compatibility**: Safe DOM and AudioContext initializations that run without error in Node.js test environments.

---

## 7. F. QA & Verification Record

### Automated Test Suite Results:
- `npm run test:curriculum`: 9 levels in World 1 passed prerequisite audit with 0 violations (31 cumulative keys).
- `npm run test:typing`: Core typing metrics, unicode normalization, and keyboard mapping verified.
- `npm run test:gamification`: Progression, attempt tracking, and rewards ledger verified.
- `npm run test:3d`:
  - Procedural Web Audio synthesizers verified.
  - All 8 lesson configs + Boss verified with `introMissionKh`, `educationalSkillKh`, and `cameraPreset`.
  - Boundary clamping verified across all 8 lessons and Boss:
    - Level 1: Courtyard perimeter and exit gate.
    - Level 2: Stepping corridor `[-2.5, 2.5]`.
    - Level 3: Mid-Chasm Pier accessible at Station 1 (`[0, 0, 10.5]`) and causeway clamping over void.
    - Level 5: Station 2 reachable at `Z = 20.0` when Stage 1 open.
    - Level 6: Station 2 reachable at `Z = 20.0` when Stage 1 open.
    - Level 8: Central continuous dragon barge corridor (`X in [-2.5, 2.5]`) without sideways teleportation.
    - Stage status `'opening'` confirmed as traversable.
  - SSR rendering of `VictoryModal` pedagogical skill badges verified.
  - SSR rendering of `LessonIntroModal` mission briefing verified.
- `npm run test:completion`: Security hardening and identity validation tests passed.
- `npm run check`: Complete verification suite (`tsc --noEmit` on app & node configs + `eslint .` + full test suite) passed with **0 errors and 0 warnings** across all 22 previously reported lint/ref issues.
- `npm run build`: Production TypeScript (`tsc --noEmit`) and Vite bundle passed with 0 errors across 2,287 modules in 6.99s.

---

## 8. Summary of Files Modified

| File | Changes Made |
|---|---|
| `src/features/three-game/systems/gameplayState.ts` | Fixed `clampLessonCharacterPosition` to support `'opening'` status, fixed Level 5/6 Station 2 reaching, fixed Level 3 Mid-Chasm Pier access, and aligned Level 8 continuous barge corridor. |
| `src/features/three-game/components/Character.tsx` | Cleaned up unused imports (`clampCharacterPosition`, `clampMultiStageCharacterPosition`), preserved optimized physics clamping. |
| `src/features/three-game/components/experiences/FingerSanctuaryExperience.tsx` | Removed render-time ref reading; animated individual stela child pulse in-place in `useFrame` with smooth spring decay, preventing origin translation drift. |
| `src/features/three-game/components/experiences/LotusGardenExperience.tsx` | Added solid stone lotus plinth islands under Altars 1, 2, 3; animated blooming flower petals and water aura rings in-place in `useFrame` with smooth decay, preventing 0.8m translation jump; incorporated `streakBonus`. |
| `src/features/three-game/components/experiences/TwinBridgesExperience.tsx` | Modeled Mid-Chasm Stone Pier Platform supporting Station 1; animated arch pulse in `useFrame` with continuous decay; removed render-time ref reading. |
| `src/features/three-game/components/experiences/JungleCrossroadsExperience.tsx` | Added connecting cross-trail between West Grove and East Shrine; dynamic trail and altar lighting powered by `activeStageIndex` and `streak`; imperative rune pulse in `useFrame` with continuous decay. |
| `src/features/three-game/components/experiences/TempleTowerClimbExperience.tsx` | Animated monumental stairs rising; added Feedback A keystroke hit pulse to active climbing flights; crown spires and station rings powered by `streakBonus`; cleaned up unused variables and render-time refs. |
| `src/features/three-game/components/experiences/SkyPlatformsExperience.tsx` | Damped platform wobble via `stageProgressRatio` in `useFrame`; added Feedback A keystroke hit pulse in-place to platforms without closure leaks; active platform reach highlighting via `activeStageIndex`; incorporated `streakBonus`. |
| `src/features/three-game/components/experiences/CrystalCaveExperience.tsx` | Dynamic crystal cluster activation via `activeStageIndex`; shimmer and emissive intensity scaled by `streak`; clean imperative pulse with smooth decay. |
| `src/features/three-game/components/experiences/SacredRiverExperience.tsx` | Realigned Ceremonial Dragon Barge along central river channel (`X = 0`); continuous deck walkway connecting Pier 0, Island Pier 1, and Shore Landing Pier 2; imperative barge pulse in `useFrame` with smooth decay. |
| `src/features/three-game/components/LessonIntroModal.tsx` | Created Khmer-first mission briefing modal with touch-typing pedagogical badges, 3-stage preview, and keyboard shortcuts. |
| `src/pages/ThreePrototypePage.tsx` | Wired `LessonIntroModal`, established `isAnyModalOpen` locking to prevent hero locomotion and interaction during mission briefings, and auto-dismisses modal on debug stage start. |
| `scripts/threePrototypeTests.mjs` | Added test cases for fixed Level 8 barge traversal, Level 3 Mid-Chasm Pier, Level 5/6 Station 2 reaching, `'opening'` status traversal, and `LessonIntroModal` SSR rendering. |
| `docs/3d/TASK8B_WORLD1_QUALITY_REFERENCE_REPORT.md` | Comprehensive quality reference report documenting all before/after findings, architecture, and verification records. |


---

# Task 8B World 1 quality reference — implementation in progress

## Baseline and changes

The existing World 1 already has eight individual experience components, a three-wave guardian, Khmer typing overlays, progress-driven visual effects, stage-result gating, camera following, and a rigged student hero. This pass focused on a concrete mismatch between the visual transition and movement collision. Previously every custom lesson treated a stage with status `opening` as traversable, before its transformation finished. The experience components, conversely, waited for `open` to show their completed forms. A student could therefore move into an unfinished path.

The shared movement clamp now unlocks a route only at authoritative `open`. All eight experience components begin their completed visual target when the authoritative stage result sets `opening`; the existing controller still marks the stage `open` after the reveal. Lotus pads rise during validated typing progress, stop short of full height until a passing result, and return to their inactive height after a failed attempt. This preserves the distinction between practice feedback and a safe crossing.

| Level | Existing identity and baseline concern | Change in this pass | Learning purpose |
| --- | --- | --- | --- |
| 1 Finger Sanctuary | Stela and sundial reveal could lag behind traversal | Reveal starts with passed-stage opening; route waits for open | Connect F D S A practice to sanctuary activation |
| 2 Lotus Garden | Pad could appear fully raised during a failed task; water route opened early | Practice pad height capped; completed reveal and collision synchronized | Make safe pads distinguishable from practice feedback |
| 3 Twin Bridges | Arch and keystone reveal could lag behind movement | Reveal starts during opening; chasm route remains locked | Connect coordinated practice to bridge completion |
| 4 Jungle Crossroads | Branch could be entered before mechanism reveal finished | Branch unlock waits for open | Connect G/H practice to path choice |
| 5 Temple Tower | Stairs could be entered before their rise finished | Stairs rise during opening; climb waits for open | Connect upper-row mastery to ascent |
| 6 Sky Platforms | Route could open during platform alignment | Alignment begins during opening; traversal waits for open | Keep typing as the challenge, with stable platforms |
| 7 Crystal Cave | Barrier could be passed during illumination reveal | Reveal begins during opening; route waits for open | Connect lower-row practice to cave discovery |
| 8 Sacred River | Crossing collision could open during boat transition | Visual transition begins during opening; route waits for open | Connect review practice to river progression |

The guardian remains governed by the existing three-wave stage engine. This pass did not change its rewards, progression, or animation.

## Character, camera, game feel, and performance (earlier checkpoint)

Existing character animation, third-person camera, spell effects, audio, Khmer-first mission text, keyboard and finger guidance, and victory presentation were retained. They were inspected but not changed in this pass. No new meshes, textures, dependencies, or per-frame allocations were introduced. The production build still warns that the 3D route chunk is 1,295.14 kB before gzip (327.08 kB gzip). Frame rate, draw calls, triangles, and integrated-GPU performance were not measured.

## Verification

- `npm run check`: passed, including both TypeScript projects, ESLint, curriculum, typing, gamification, 3D, and completion suites.
- `npm run build`: passed, with the existing large-chunk warning.
- `npm run test:browser`: passed in headless Chrome with software WebGL. It mounted canvas, exploration HUD, and waypoint for all eight World 1 lessons and the boss. It exercised Level 1 altar proximity, typing overlay, key presses, cancel, and return to the map.
- Added regression assertions that `opening` does not unlock the first route in any of Lessons 1–8.

The browser suite does not type through every lesson or boss wave, measure performance, or save before/after gameplay screenshots. No screenshots are presented as proof of completed interactions. Full Task 8B acceptance remains open: actual traversal after every stage, replay and failure flows on every route, boss wave interactions, camera and animation polish, quality settings, and school-hardware measurement need further implementation and verification.

The known direct-client-Firestore-write security concern remains outside this pass. No production backend, student records, or security rules were changed. No push, merge, or deployment was performed.

---

## Current verification addendum — 5 November 2026

The historical opening summary above describes an earlier checkpoint and contains claims that the current evidence does not support. In particular, `opening` is no longer traversable. The current implementation makes visual mechanisms begin their completed movement at `opening`, while collision opens only at `open`. This prevents entry during the 2.2-second reveal.

### Implemented in this continuation

- Added continuous stage-gated lotus-root and river-wake walkways where the movement controller permits walking over water. The river boat still animates, and its canopy folds away after docking so it does not cover the shore camera.
- Continued custom lessons from the completed station rather than teleporting the hero to the next altar. The waypoint points to the next objective. The boss still keeps the hero in its arena between waves.
- Extended Level 3's second unlocked boundary to reach its third altar. A straight approach to the chasm now stops at the safe edge instead of snapping the hero sideways onto a bridge.
- Adjusted the Level 5 summit spires after an actual gameplay screenshot showed overbright geometry filling the camera. The opening camera now aims toward the next station or guardian.
- Added `?quality=low|balanced|high`. Low uses DPR 1, disables shadows, and omits optional scenery and gallery models. The lesson platforms, stations, guardian, waypoints, and keyboard overlay remain present. High opts into the existing full scenery asset. Quality selection by an in-game control is still outstanding.
- Added a development-only renderer readout and a repeatable Playwright flow in `scripts/verifyTask8bWorld1Browser.mjs`. The script presses keys through the existing typing handler; it does not mark stages passed. It injects player positions solely to set up proximity and locked-route checks. The browser's ordinary movement keys verify forward motion after Continue.

### Browser QA evidence

The full Playwright run in headless Chrome at 1280×720 passed for Lessons 1–8 and the boss. For each route it checked: three curriculum stages through victory, a wrong key that did not advance progress, a deliberately inaccurate completed Stage 1 attempt that failed, retry and successful completion, cancel and restart, no duplicate completion record, movement after Continue, and replay reset. The route smoke suite also passed separately. These are automated browser checks; they do not establish that every visible mesh matches its collision boundary or that every animation feels smooth to a child.

Screenshots are **before Stage 1 and after victory in the same implementation**, captured from actual browser gameplay. They are not a comparison against an older commit:

| Route | Before | After |
| --- | --- | --- |
| Level 1 | [before](task8b-evidence/level-1-before.png) | [after](task8b-evidence/level-1-after.png) |
| Level 3 | [before](task8b-evidence/level-3-before.png) | [after](task8b-evidence/level-3-after.png) |
| Level 5 | [before](task8b-evidence/level-5-before.png) | [after](task8b-evidence/level-5-after.png) |
| Level 8 | [before](task8b-evidence/level-8-before.png) | [after](task8b-evidence/level-8-after.png) |
| Guardian | [before](task8b-evidence/level-boss-before.png) | [after](task8b-evidence/level-boss-after.png) |

The renderer measurements below are single approximate samples from headless Chrome using **software WebGL**. FPS varies with loading and software contention; these values cannot predict integrated-GPU school hardware performance.

| Route | Sample FPS | Draw calls | Triangles |
| --- | ---: | ---: | ---: |
| 1 | 2.8 | 2,119 | 328,958 |
| 2 | 3.7 | 1,652 | 190,018 |
| 3 | 4.4 | 1,655 | 190,916 |
| 4 | 3.7 | 1,625 | 189,034 |
| 5 | 4.8 | 1,651 | 189,522 |
| 6 | 2.1 | 1,637 | 190,054 |
| 7 | 5.3 | 190 | 119,124 |
| 8 | 3.2 | 1,650 | 189,334 |
| Guardian | 4.0 | 1,335 | 291,338 |

The outdoor draw-call counts remain too high for a confident 30 FPS school-computer claim. A final Low-mode Level 1 sample after omitting optional galleries measured 1,041 draw calls and 102,248 triangles, down from 2,119 calls and 328,958 triangles in Balanced. This is a geometry comparison in the software renderer, not a school-hardware FPS result. No production data or Firebase rules were touched.

### Acceptance checklist

| Criterion | Status | Evidence or remaining gap |
| --- | --- | --- |
| Eight lessons playable in 3D | Pass | Full browser typing flow through victory on each route |
| Boss playable | Pass | Three waves and victory in browser |
| Distinct lesson identity | Partial | Eight separate experiences and missions; child usability review outstanding |
| Immediate correct-key feedback | Partial | Progress-driven scene effects present; visual timing not measured per key |
| Physical transformation in each lesson | Partial | Component inspection and selected screenshots; every mesh transition not visually audited |
| Meaningful stage progression event | Partial | Stage-gated route bounds and no-teleport Continue; full path traversal not completed on every route |
| Transformation and collision alignment | Partial | Lotus and river support added; all major meshes not collision-audited |
| No stage bypass | Partial | Authoritative stage checks and clamp tests pass; all geometric edge cases unverified |
| Smooth character movement and animation | Unverified | Movement keys work; transitions and foot contact need visual playtest |
| Polished typing-mode transition | Partial | Typing overlay and camera render; cinematic timing needs visual playtest |
| Clear exploration and typing camera | Partial | Selected screenshots reviewed; tower and boat occlusion fixed, all routes not visually reviewed |
| Boss wave reactions and completion | Partial | Three-wave pass verified; reaction animation quality not formally assessed |
| Khmer-first mission instructions | Pass | Intro, HUD, and stage missions are present and browser-rendered |
| Effects never obstruct teaching UI | Partial | Selected screenshots reviewed; every effect timing unverified |
| Keyboard and finger guidance correct | Pass | Existing typing/finger tests pass; physical keyboard used in browser flow |
| Curriculum and rewards preserved | Pass | Curriculum, completion, and duplicate-reward tests pass |
| Performance measured and optimized | Partial | Software-renderer samples and Low mode; target hardware measurement unavailable |
| Browser verification all World 1 routes | Pass | Full Playwright run, including boss |
| Existing 2D features intact | Partial | Automated fallback tests pass; no full 2D browser regression in this run |
| Automated tests and build pass | Pass | `npm run check`, `npm run build`, and `npm run test:browser` passed after the gameplay changes; Level 5 and 8 targeted full-playthrough reruns passed after their final visual fixes |
| No production data or rules changed | Pass | Repository diff contains only 3D source, tests, and this report |
| Report complete | Partial | Open issues and measurement limits recorded; manual school-hardware QA outstanding |

Further unverified scenarios: missing GLB fallback, repeated entry and exit, tab visibility during a long stage, reduced-motion behavior, the full High-quality setting, and an in-game graphics quality control. The direct-client-Firestore-write security concern remains a separate production blocker. No push, merge, or deployment was performed.

The final Level 5 screenshot shows the hero and shrine after reducing the overlarge spires, but it is still a limited forward view rather than a full panoramic camera sequence. The final Level 8 screenshot shows the shore without the former red canopy blocking the camera. Level 5 and Level 8 each passed a targeted full three-stage, fail/retry, victory, and replay browser rerun after these visual changes. The production build still warns that the 3D route chunk is about 1.30 MB before gzip.
