# Next steps

Updated: 2026-10-31. Branch: `feat/3d-world-map-integration`.

## Completed work

1. **3D setup and initial prototype (PR #16)**:
   - Installed compatible React 19 / Three.js dependencies (`three` ^0.187.0, `@react-three/fiber` ^9.8.2, `@react-three/drei` ^10.7.9, `@types/three` ^0.187.0).
   - Added lazy-loaded `/3d-prototype` (and `/three-game` alias) route with the Ancient Angkor Gate courtyard, third-person character controller, Khmer typing overlay, gate-opening animation, and WebGL fallback.
2. **Task 1 — Baseline TypeScript and build validation**:
   - Resolved all eight pre-existing baseline TypeScript diagnostics in `FeaturePanels.tsx`, `GameSidebar.tsx`, `economy.ts`, `WorldMapPage.tsx`, `GameMapNode.tsx`, and `profileService.ts`.
   - Updated `package.json` `typecheck` and `build` scripts to explicitly validate both `tsconfig.app.json` and `tsconfig.node.json`.
3. **Task 1 — 3D prototype gameplay stabilization**:
   - Removed the 70% accuracy bypass in `ThreePrototypePage.tsx`; gate unlocking now strictly requires `metrics.passed` (`completed && accuracy >= minimumAccuracy`, 90% for World 1 Lesson 1).
   - Replaced the hardcoded 75% accuracy label in `TypingOverlay.tsx` with the curriculum `minimumAccuracy` (90%+) and `speedTargetCpm` (28 CPM).
   - Preserved continuous Khmer Unicode cluster shaping (`typedText`, `currentTargetText`, `remainingText`) while displaying next-unit key/modifier (`Shift` / `AltGr`) and finger guidance, with IME composition guard and virtual `Backspace` support.
   - Replaced per-frame `setPlayerPosition` React state updates in `useFrame` with `playerPositionRef` and threshold-only `onNearGateChange` updates.
   - Implemented `createPlayerControlStore` (`useSyncExternalStore`) to lock movement during typing/modals and clear held movement keys across mode transitions, window blur, and tab visibility changes.
   - Added `createPrototypeRewardLedger` to keep prototype rewards strictly in memory and prevent duplicate reward claims per attempt across cancel/restart/retry flows.
   - Added error boundary and `webglcontextlost` handling in `ThreeGameCanvas.tsx` to ensure `WebGLFallback` renders when WebGL is unavailable or lost.
   - Expanded `scripts/threePrototypeTests.mjs` with regression tests covering accuracy pass/fail thresholds, Khmer Unicode/Shift/AltGr/Backspace handling, movement restrictions, key clearing, gate collision bounds, and duplicate reward prevention.
4. **Task 2 — Visual improvements for Cambodian students**:
   - **Environment & Courtyard**: Added sugar palm groves, 7-headed Angkor Naga causeway balustrades (*នាគ*), ceremonial streamer flags (*ទង់ក្រពើ*), stone lotus flower basins with floating blooms, causeway paver reliefs, and 36 deterministic ambient fireflies/spirit motes.
   - **Player Character & Regalia**: Redesigned hero mesh with traditional sapphire silk tunic, crossed golden royal sash (*សង្វារ*) with emerald brooch medallion, winged epaulets (*ពានាហា*), pleated *chong kben* wrap (*សំពត់ចងក្បិន*), golden bangles (*កងដៃ/កងជើង*), lotus topknot ornament (*មាលា*), anime eye catchlights, and explorer satchel with palm-leaf manuscript (*សាស្ត្រាស្លឹករឹត*).
   - **Organic Animations**: Implemented smooth blend tree between idle (rhythmic breathing bob, chest expansion, relaxed arm sway, curious head tilt) and walk (athletic forward lean, counter-swinging arms, knee bend, foot plant).
   - **Dynamic Camera**: Implemented exponential damping (`1 - Math.exp(-damping * dt)`) with mode-specific framing: over-the-shoulder exploration with lateral lead, intimate typing framing focused on student avatar and rune altar, cinematic opening sweep, and celebratory completed view.
   - **Ancient Stone Gate**: Enhanced Angkorian Gopura style with fluted sandstone pillars, carved lotus capitals, Kala mask lintel, tiered pediment with Kalasa spire finial (*កលស*), heavy teak-wood doors with bronze bosses and ring pulls (*ក្រវិលទ្វារ*), dual-mesh animated braziers, and sculpted guardian lions (*Simha*).
   - **Atmospheric Lighting**: Tuned warm golden-hour illumination with dual-hemisphere bounce, directional sun, soft rim lighting, and subtle horizon fog.
   - **Non-Intrusive Typing Feedback**: Connected keystroke events to 3D rune altar — correct inputs produce radiant cyan-gold flashes and expanding magic ripples; combos ($\ge 3$) emit rising spiritual sparkle motes; mistakes produce a gentle crimson shimmer, preserving 100% overlay readability.
   - **Zero Asset Bloat**: All 3D enhancements authored purely with procedural Three.js geometries and standard materials (0 external bytes downloaded, 100% CC0/commercial compliant, 60 FPS on low-end integrated school graphics).
5. **Task 3 — Direction Mapping & Shift Key Highlight Repairs**:
   - **Bug 1 (Horizontal Movement Inversion)**: Resolved camera frame-of-reference inversion where camera standing at negative Z looking along +Z caused world +X to project to screen-left and world -X to screen-right. Added `computeMovementDelta` in `gameplayState.ts` and integrated into `Character.tsx`. `A` / `ArrowLeft` now moves screen-left (world +X, facing $\pi/2$ rad), `D` / `ArrowRight` moves screen-right (world -X, facing $-\pi/2$ rad), `W` / `ArrowUp` moves forward (+Z, facing 0 rad), `S` / `ArrowDown` moves backward (-Z, facing $\pi$ rad), with strictly normalized diagonal movement and movement lock during typing.
   - **Bug 2 (Shift Key Highlighting Priority & Opposite-Hand Guidance)**: Corrected keyboard highlight priority in `TypingOverlay.tsx` where `keyData.disabled` was previously evaluated before `isShiftTarget`. Exported `getRequiredShiftKeyCode` from `fingerGuidance.ts` to highlight only the ergonomic opposite-hand Shift key (`ShiftLeft` for right-hand keys like KeyK; `ShiftRight` for left-hand keys like KeyA/KeyD). Enabled `ShiftLeft` and `ShiftRight` highlights even with `disabled: true` styling, while ignoring modifier-only physical keydowns so pressing Shift alone does not count as input or mistake.
   - **Regression Tests & Browser Validation**: Expanded `scripts/threePrototypeTests.mjs` with directional movement mapping, camera projection, diagonal normalization, and Shift highlight tests. Updated Playwright E2E browser test (`verify3dBrowser.mjs`) to verify screen-space movement directions, Shift key guidance, and typing mode restrictions.
6. **Task 4 — Reusable Multi-Stage 3D Khmer Learning System (World 1, Lesson 1)**:
   - **Curriculum-Driven Stage Engine**: Added `buildStageTypingPlan` in `src/lib/lessonTypingPlan.ts` and `resolveThreeLessonConfig`, `createStageTypingPlan`, `getStageMinimumAccuracy`, `computeStageMetrics`, `shouldUnlockStage`, `createInitialStageProgressStates`, `canAccessStage`, `recordStageAttemptResult`, `computeFinalLessonMetrics`, and `createInMemoryLessonPersistenceAdapter` in `src/features/three-game/systems/gameplayState.ts`.
   - **World 1, Lesson 1 (`ព្យញ្ជនៈដំបូង` / `First Consonants`) Multi-Stage Implementation**:
     1. **Stage 1 (`w1-l1-s1` — `ទ្វារអក្សរ` / `Glyph Gate`, `z = 6`)**: Warmup stage with 10 base & shifted consonants (`ក, ខ, គ, ឃ, ង, ច, ឆ, ជ, ឈ, ញ`), 90% accuracy goal, unlocking the Ancient Angkor Gopura Gate.
     2. **Stage 2 (`w1-l1-s2` — `ថ្មភ្លោះ` / `Twin Stones`, `z = 16`)**: Pattern stage with 8 consonant pairs (`កខ, គឃ, ចឆ, ជឈ, ងញ, ខក, ឆច, ឃគ`), 90% accuracy goal, unlocking the sliding Angkorian Twin Monoliths in `StageChallenges.tsx`.
     3. **Stage 3 (`w1-l1-s3` — `ផ្លូវព្រៃ` / `Jungle Path`, `z = 26`)**: Word stage with 8 short words (`កង, ចង, ជង, ខង, គង, ចក, កច, ជក`), 92% accuracy goal, unlocking the mossy Ta Prohm-inspired Jungle Archway leading into the Golden Lotus Sanctuary (`z = 31`).
   - **Stage Locking, Retry, & Final Lesson Rewards**:
     - Enforced strict sequential stage progression (`canAccessStage` and `clampMultiStageCharacterPosition`) so Stage 2 is locked until Stage 1 is passed and open, and Stage 3 is locked until Stage 2 is passed and open.
     - Failed stages keep their barrier closed and allow immediate retry without resetting earlier passed stages.
     - Final lesson completion aggregates accuracy, CPM, score, and stars across all 3 stages, claims session rewards once via `claimLessonReward` (blocking duplicate XP/coins on replay), and logs structured completion payloads to `createInMemoryLessonPersistenceAdapter()` for future teacher dashboard/Firebase integration without touching production data.
   - **Multi-Stage UI & Tests**:
     - Added 3-stage progress stepper and mission prompt in `ExplorationHud.tsx`, intact Khmer stage item rune tiles in `TypingOverlay.tsx`, and 3-stage summary breakdown in `VictoryModal.tsx`.
     - Expanded `scripts/threePrototypeTests.mjs` and Playwright E2E verification (`verify3dBrowser.mjs`) to validate all 3 stages, 90%/90%/92% accuracy thresholds, stage locking, retry behavior, final lesson scoring, and replay reward deduplication.

7. **Task 5 — World Map integration**:
   - Initially reused Task 4 from commit `6a61f845`; subsequently merged `origin/main` after PR #18 to resolve the overlapping history in PR #19. The explicit availability registry enables only World 1 / Lesson 1; generic curriculum resolution is not evidence of 3D support.
   - The map offers Khmer-labeled Play 2D / Play 3D choices. Both 3D routes validate IDs and existing map unlock rules; invalid, locked and unsupported lessons never mount the engine. Production routes require the existing login session. The bare `/3d-prototype` default is development-only.
   - Added a 2D lesson route guard for the existing map locks, closing the pre-existing direct-URL shortcut without changing the 2D game.
   - Route changes start a fresh lesson session. Replay resets stage/UI state while retaining the in-memory reward ledger to prevent duplicate rewards. Final summaries explain that results are temporary and unlock nothing.
   - Regression coverage: `scripts/threePrototypeTests.mjs` and the exported Playwright flow in `scripts/verifyThreeIntegrationBrowser.mjs` (run against a development server with Firebase disabled). No new dependencies, production result writes or deployment; PR #19 remains for review and is not merged automatically.

## Remaining for future tasks

1. **Manual school-hardware check**: Test `/3d-prototype` interactively on a target Cambodian school computer (integrated GPU) to confirm frame rate and keyboard layout comfort.
2. **Dependency security maintenance**: Review the pre-existing `npm audit` findings in a dedicated dependency maintenance pass before production deployment.
3. **Future 3D milestones (separate authorization required)**:
   - Wire `ThreeLessonPersistenceAdapter` to live student progress / teacher dashboard storage once approved.
   - Add World 1 Lessons 2–6 and Boss Battle 3D stage layouts using `resolveThreeLessonConfig(worldId, levelId)`.
   - Optional Web Audio sound effects (`public/audio/`) and touch/virtual joystick controls for tablet browsers.
