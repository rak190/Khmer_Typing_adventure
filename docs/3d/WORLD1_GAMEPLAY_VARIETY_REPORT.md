# Task 7C.0 — World 1 Gameplay Variety & Adventure Pilot Report

**Repository:** [https://github.com/rak190/Khmer_Typing_adventure](https://github.com/rak190/Khmer_Typing_adventure)  
**Branch:** `feat/task-7c-0-gameplay-variety`  
**Date:** November 2026  
**Status:** Verification Passed & Pilots Ready for Review  

---

## 1. Executive Summary & Root Cause Analysis

### The Problem
During playtesting of World 1 Lessons 1–8, player feedback identified that while the underlying Khmer Unicode typing curriculum was strong and progressive, the 3D exploration experience felt repetitive and monotonous:
- **Identical Spatial Loop:** Every level reused the same linear stone causeway with identical physical barriers placed at roughly $Z = 6$, $Z = 16$, and $Z = 26$.
- **Predictable Routine:** Walk forward $\to$ approach identical altar $\to$ open typing overlay $\to$ unlock identical stone gate $\to$ walk forward $\to$ repeat.
- **Generic Quest HUD:** The exploration interface repeatedly displayed a generic prompt (*"ដើរទៅកាន់អាសនៈ [W/↑]"*) regardless of the lesson's unique educational theme.

### The Solution: Modular Experience Engine
To solve this without inflating AI compute or throwing away existing assets, we developed a data-driven **Lesson Experience Engine** and implemented three distinct **Pilot Adventures**:
1. **Level 1 (វិហារម្រាមបុរាណ / Ancient Finger Sanctuary):** A quadrangle courtyard where left-hand keys awaken 4 cardinal stelas (`F`, `D`, `S`, `A`) and a central sun-dial mechanism.
2. **Level 3 (ស្ពានភ្លោះអង្គរ / Angkor Twin Bridges):** A deep misty chasm spanned by twin parallel causeways that unite through bilateral left/right hand coordination.
3. **Level 5 (ការឡើងប្រាសាទកំពូល / Climbing Temple Tower):** A vertical stepped Angkorian pyramid with dynamic $Y$-axis character elevation and camera ascension.

---

## 2. Variety Configuration Framework Architecture

Located at [`src/features/three-game/config/lessonExperienceConfig.ts`](file:///d:/Coding/Khmer_Typing_adventure_codex/src/features/three-game/config/lessonExperienceConfig.ts):

```typescript
export interface StationConfig {
  stageIndex: number;
  stageId: string;
  position: [number, number, number];
  stationTitleKh: string;
  stationTitleEn: string;
  missionPromptKh: string;
  missionPromptEn: string;
  interactionRadius?: number;
  guideBeaconColor?: string;
  transformationType:
    | 'awaken-stela'
    | 'open-mechanism'
    | 'extend-bridge'
    | 'raise-stairs'
    | 'reveal-sanctuary'
    | 'bloom-lotus'
    | 'align-platforms'
    | 'ignite-crystal'
    | 'advance-boat'
    | 'shatter-shield';
}

export interface LessonExperienceConfig {
  lessonId: number | 'boss' | string;
  experienceType: ExperienceType;
  titleKh: string;
  titleEn: string;
  themeDescriptionKh: string;
  themeDescriptionEn: string;
  initialPlayerPosition: [number, number, number];
  courtyardBounds: [number, number, number, number];
  cameraPreset?: CameraPreset;
  stations: StationConfig[];
}
```

### Key Capabilities:
- **Spatial Diversity:** Each lesson defines its own boundaries, spawn positions, and station coordinates.
- **Bilingual Contextual HUD:** Stations supply authentic Khmer mission objectives (`missionPromptKh`) and clear English secondary instructions (`missionPromptEn`).
- **Backward Compatibility:** A fallback helper ensures non-pilot levels (2, 4, 6, 7, 8, boss) preserve their established gameplay and gates without regressions.

---

## 3. Pilot Level Implementations

### Pilot A — Level 1: Ancient Finger Sanctuary (`FingerSanctuaryExperience.tsx`)
- **Theme:** វិហារម្រាមបុរាណ (Ancient Finger Sanctuary)
- **Typing Objective:** Left-hand home row keys (`F` ថ, `D` ដ, `S` ស, `A` ា).
- **Environment & Mechanics:**
  - 4 monumental stone stelas arranged in a cardinal quadrangle around the courtyard.
  - Floating crystals glowing in amber, gold, blue, and cyan with energy conduits connected to the floor.
  - **Station 0 (East Altar):** Positioned at `[3.2, 0, -1.0]` for `F` & `D` recall.
  - **Station 1 (West Altar):** Positioned at `[-3.2, 0, -1.0]` for `S` & `A` recall.
  - **Station 2 (Central Sundial):** Positioned at `[0, 0, 4.5]` with a rotating bronze astrolabe that spins faster as streak increases, lowering the exit sun gate upon completion.

### Pilot B — Level 3: Angkor Twin Bridges (`TwinBridgesExperience.tsx`)
- **Theme:** ស្ពានភ្លោះអង្គរ (Angkor Twin Bridges)
- **Typing Objective:** Two-hand coordination, home-row alternation, and consonant-vowel pairs.
- **Environment & Mechanics:**
  - Deep misty chasm spanning between the courtyard and inner sanctuary.
  - Dual parallel causeways representing left-hand and right-hand key domains.
  - Stone cantilever arches and balustrades illuminated by glowing crystal runes (`#38BDF8` and `#F59E0B`).
  - **Station 0 (Bridgehead):** Anchors the foundations at `[0, 0, 0.0]`.
  - **Station 1 (Mid-Chasm Pier):** Extends cantilever arch bridges at `[0, 0, 10.5]`.
  - **Station 2 (Royal Keystone Altar):** Drops the central keystone at `[0, 0, 20.0]` to unite both causeways.

### Pilot C — Level 5: Climbing Temple Tower (`TempleTowerClimbExperience.tsx`)
- **Theme:** ការឡើងប្រាសាទកំពូល (Climbing Temple Tower)
- **Typing Objective:** Left-hand upper-row reaches (`Q`, `W`, `E`, `R`, `T`).
- **Environment & Mechanics:**
  - 3-tier stepped Angkorian temple pyramid ascending from ground to the high Bakan terrace.
  - **Vertical Character Elevation ($Y$):** Real-time kinematic step ascent:
    - $Z \le 3.0\text{m}$: Ground terrace ($Y = 0\text{m}$).
    - $3.0\text{m} < Z < 7.0\text{m}$: Flight 1 stone steps ($Y = 0 \to 2.2\text{m}$).
    - $7.0\text{m} \le Z \le 14.0\text{m}$: Intermediate terrace platform ($Y = 2.2\text{m}$).
    - $14.0\text{m} < Z < 18.0\text{m}$: Flight 2 stone steps ($Y = 2.2 \to 4.4\text{m}$).
    - $Z \ge 18.0\text{m}$: Crown sanctuary summit overlook ($Y = 4.4\text{m}$).
  - Dynamic third-person camera tracking that seamlessly elevates with the character's height.

---

## 4. Interaction & HUD Upgrades

### 1. Unified Proximity Interaction ($3.5\text{m}$)
- Character detects station proximity within a configurable radius (default $3.5\text{m}$).
- Bottom quest bar button pulses with golden glow and displays `[E] ចាប់ផ្តើម` (or Space/Enter).
- Proximity check is station-aware for non-linear multi-altar layouts.

### 2. Contextual Mission HUD
Instead of repetitive static text, the HUD displays dynamic stage directives:
- **Level 1 Station 0:** `"ដើរទៅអាសនៈខាងកើត [D/Right] ដើម្បីដាស់សិលា F (ថ) និង D (ដ)"`
- **Level 3 Station 0:** `"ឈានទៅក្បាលស្ពានភ្លោះ ដើម្បីដាស់គ្រឹះស្ពានដៃឆ្វេង និងដៃស្តាំ"`
- **Level 5 Station 1:** `"ឡើងតាមកាំជណ្តើរថ្មទៅថ្នាក់ទី ១ [W] ដើម្បីលើកកាំជណ្តើរឡើងទៅថ្នាក់ទី ២"`

---

## 5. Automated Verification Results

All automated checks and tests run and passed cleanly:

| Test Suite | Command | Result | Details |
|---|---|---|---|
| **TypeScript Compilation** | `npm run typecheck` | **PASS (0 errors)** | Strict typing across all components, configs, and scenes |
| **Code Linting** | `npm run lint` | **PASS (0 warnings)** | Clean code adhering to ESLint & Prettier |
| **Curriculum Prerequisites** | `npm run test:curriculum` | **PASS** | 0 prerequisite leaks across World 1 |
| **Core Typing Engine** | `npm run test:typing` | **PASS** | Khmer Unicode cluster & combining mark accuracy verified |
| **Gamification Engine** | `npm run test:gamification` | **PASS** | XP, Stars, and Coins progression intact |
| **3D Engine & Pilot Variety** | `npm run test:3d` | **PASS** | Pilot detection, station configs, and HUD SSR verified |
| **Completion Hardening** | `npm run test:completion` | **PASS** | Offline & online save validation intact |
| **Full Health Check** | `npm run check` | **PASS (Exit 0)** | Full end-to-end integration verified |

---

## 6. Visual QA Screenshots

The following comparison screenshots were captured in headless Chrome via Playwright:

### Level 1: Ancient Finger Sanctuary
| Stage / View | Screenshot |
|---|---|
| **Courtyard Quadrangle** | ![Level 1 Courtyard](./task7c0_l1_finger_sanctuary_courtyard.png) |
| **East Altar Approach** | ![Level 1 East Altar](./task7c0_l1_stage1_east_altar.png) |
| **East Altar Typing Mode** | ![Level 1 Typing](./task7c0_l1_stage1_typing_mode.png) |
| **Central Sundial** | ![Level 1 Sundial](./task7c0_l1_stage3_central_sundial.png) |

### Level 3: Angkor Twin Bridges
| Stage / View | Screenshot |
|---|---|
| **Chasm Overview** | ![Level 3 Chasm](./task7c0_l3_twin_bridges_chasm.png) |
| **Bridgehead Typing** | ![Level 3 Typing](./task7c0_l3_stage1_bridgehead_typing.png) |
| **Mid-Chasm Pier** | ![Level 3 Mid Pier](./task7c0_l3_stage2_mid_chasm_pier.png) |
| **Royal Keystone** | ![Level 3 Keystone](./task7c0_l3_stage3_royal_keystone.png) |

### Level 5: Climbing Temple Tower
| Stage / View | Screenshot |
|---|---|
| **Tower Base ($Y=0\text{m}$)** | ![Level 5 Base](./task7c0_l5_tower_climb_base.png) |
| **Base Typing Mode** | ![Level 5 Typing](./task7c0_l5_stage1_typing_mode.png) |
| **First Terrace ($Y=2.2\text{m}$)** | ![Level 5 Terrace](./task7c0_l5_stage2_first_terrace.png) |
| **Summit Overlook ($Y=4.4\text{m}$)** | ![Level 5 Summit](./task7c0_l5_stage3_summit_overlook.png) |

---

## 7. Recommended Next Steps (Checkpoint D)

Upon project owner approval of these three pilot experiences:
1. **Level 2 (Lotus Garden):** Cultivate floating lotus stepping pads across the water pool for right-hand home-row keys (`J`, `K`, `L`, `;`).
2. **Level 4 (Jungle Crossroads):** Branching stone pathways for index finger reaches (`G` and `H`).
3. **Level 6 (Sky Platforms):** Suspended floating rune platforms for right upper row (`Y`, `U`, `I`, `O`, `P`).
4. **Level 7 (Crystal Cavern):** Bioluminescent subterranean cavern for left lower row (`Z`, `X`, `C`, `V`).
5. **Level 8 (Sacred Baray Crossing):** Royal ceremonial dragon barge traversing the waters toward the Temple Guardian boss.
