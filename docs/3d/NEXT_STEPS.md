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

## Remaining for future tasks

1. **Manual school-hardware check**: Test `/3d-prototype` interactively on a target Cambodian school computer (integrated GPU) to confirm frame rate and keyboard layout comfort.
2. **Dependency security maintenance**: Review the pre-existing `npm audit` findings in a dedicated dependency maintenance pass before production deployment.
3. **Future 3D milestones (separate authorization required)**:
   - Optional Web Audio sound effects (`public/audio/`) and custom low-poly GLB assets (`public/models/`).
   - Touch/virtual joystick controls for tablet and mobile browsers.
   - Multi-gate stage progression and deliberate Firebase progress adapter once prototype sign-off is complete.
