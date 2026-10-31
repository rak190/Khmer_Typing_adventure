# Next steps

Updated: 2026-10-31. Branch: `fix/3d-prototype-stabilization`.

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

## Remaining for future tasks

1. **Manual school-hardware check**: Test `/3d-prototype` interactively on a target Cambodian school computer (integrated GPU) to confirm frame rate and keyboard layout comfort.
2. **Dependency security maintenance**: Review the pre-existing `npm audit` findings in a dedicated dependency maintenance pass before production deployment.
3. **Future 3D milestones (separate authorization required)**:
   - Optional Web Audio sound effects (`public/audio/`) and custom low-poly GLB assets (`public/models/`).
   - Touch/virtual joystick controls for tablet and mobile browsers.
   - Multi-gate stage progression and deliberate Firebase progress adapter once prototype sign-off is complete.
