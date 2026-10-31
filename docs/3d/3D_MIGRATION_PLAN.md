# Ancient Khmer Typing Gate — implementation plan

Planning only, 2026-10-31. No game conversion, new route or production persistence is implemented by setup.

## Preserve and reuse

| System | Existing source | 3D reuse boundary |
| --- | --- | --- |
| Unicode | src/lib/khmerText.ts | NFC, grapheme segmentation and fallback, Khmer character counting; never split display clusters |
| Input sequences | src/lib/lessonTypingPlan.ts | Ordered key units, including multi-code-point outputs; keep display clusters distinct from physical key units |
| Keyboard/fingers | src/data/keyboardMap.ts; src/lib/fingerGuidance.ts | Base/Shift/AltGr mapping and HTML hints |
| Learning UI | src/components/lesson/LessonWorldScreen.tsx, KhmerKeyboard.tsx, TypingHands.tsx, TypingTargetCard.tsx | Extract a small shared session controller later; do not copy its window key handler into movement controls |
| Curriculum | src/data/lessonCurriculum.ts; typingProgression.ts | Existing accuracy gates, targets and lesson IDs |
| Metrics | src/lib/typingMetrics.ts | Accuracy, CPM, WPM, score, consistency, stars and pass criteria; CPM counts correct Khmer characters per elapsed minute |
| Rewards | src/lib/economy.ts; useEconomyState.ts; playerFeatures.ts | Existing XP, coins, hearts, gems, inventory and claims; inject a prototype-only reward adapter |
| World/bosses | src/data/adventureWorlds.ts; bosses.ts; pages/WorldMapPage.tsx; BattlePage.tsx | Retain unlock rules and boss progression, adapt scene events later |
| Progress | src/lib/studentProgress.ts; userProfile.ts; services/profileService.ts | Keep schema and teacher-facing history; don't write prototype results into real lessons |
| Auth | src/lib/firebase.ts; config/environment.ts; src/App.tsx | Existing auth/protected routes remain; prototype must run with Firebase absent |

Accuracy carries 65% of the existing score, speed 25%, consistency 10%. Preserve existing calculations, including their current mistake penalties; do not silently redefine accuracy or use English five-character WPM as the Khmer speed measure.

Firebase currently has both students/{uid}/progress/summary and users/{uid} economy/result subcollections. This needs a deliberate adapter, not a second 3D save format. saveStudentLessonResult and related helpers may synchronize remotely; a local-looking call is not proof it is safe for a sandbox.

## First playable slice (separate future request)

1. Add a development-only, lazy-loaded /three-game route, leaving /lesson, /battle, /map and all other routes intact. Keep an explicit link back to 2D. Match existing routing/base path conventions without deployment edits.
2. Create a genuine R3F Canvas with a flat courtyard, stylized sandstone gate, palms and a capsule character. Reference the stepped temple silhouette and gold/green palette in src/assets/map/angkor-flat.png. Treat this as a respectful fictional Khmer setting, not an archaeological reconstruction.
3. Implement delta-time movement on the ground plane, bounded courtyard and simple box collisions. Use arrow/WASD controls only in exploration, an accessible interaction button/E near the gate, and a damped third-person camera. No physics engine is needed for this ground-only slice.
4. Enter typing mode from proximity interaction. Clear held keys, suspend movement/camera shortcuts, focus the visible HTML typing surface and show existing keyboard/finger hints. Support escape/cancel, blur/pause, retry and restoring focus. Avoid pointer lock in the first slice.
5. Use one existing beginner lesson through a shared controller. Display complete Khmer clusters, but process the existing ordered keyboard units. Do not mix synthetic Khmer keyboard mapping with OS IME text in the same event path; choose an explicit mode, defer composition evaluation until compositionend, and test both if supported.
6. On completion at the curriculum accuracy threshold, publish a single lessonPassed event. Animate gate panels through refs/useFrame or Three animation clips; keep typing state out of the render loop. Award once per attempt in a memory-backed adapter using existing reward calculation. Retry/cancel must not double-award.
7. Allow walking through the gate to a small finish area. Show accuracy first, CPM next, and a 2D return action. Retain results only for this sandbox session.

Suggested responsibilities:

| Folder | Responsibility |
| --- | --- |
| components | Character, camera, gate and accessible HTML HUD |
| scenes | AncientGateScene and visual composition |
| systems | Pure exploration/typing/opening/completed state transitions; input ownership; reward adapter |
| hooks | Controller lifecycle, focus and capability detection |
| utils | Base-aware asset URLs, scene bounds and disposal helpers |

Dependencies flow from visuals to domain interfaces; domain logic must not import Three.js. Use a discriminated state union and events, React state for milestones, refs for per-frame transforms. No new state-management package.

## Performance and failure behavior

Start with one canvas, DPR 1 (cap at 1.5 on capable devices), ambient plus one directional light, no dynamic shadows or postprocessing. Reuse geometry/materials; instance repeated foliage. Pause on hidden tabs, dispose resources and unregister input listeners on exit. Use Suspense and an error boundary for model loading and renderer/context failure, with a readable 2D return link.

Initial engineering targets, not measured results: >=30 FPS at 1280x720 on an integrated GPU, <100 draw calls, <100k visible triangles, <=10 MB of initial 3D assets, <=1K textures by default. Measure on a representative school PC before increasing quality. WebGL2 must be detected by actual context creation; GPU name alone is insufficient.

Use GLB with meters, consistent forward axis, grounded origins, separate gate pivots and named idle/walk clips when models replace primitives. Prefer local assets loaded with import.meta.env.BASE_URL; avoid remote HDRIs and runtime CDN dependencies.

## Acceptance and rollout

- Unit-test mode transitions, proximity, reward idempotency, and Unicode sequences through existing helpers.
- Exercise coeng+consonant, dependent vowels, marks, Shift/AltGr, backspace, blur, composition, cancellation, keyboard-only navigation and resize.
- In an isolated browser profile with Firebase absent, verify movement stops while typing, gate opens only on pass, one reward per attempt, no network writes, no console errors and working 2D fallback.
- Test unsupported WebGL2, model failure and context loss; record frame rate and memory after repeat entry/exit.
- Run explicit TypeScript project checks, lint, typing/gamification suites and build. Resolve documented baseline errors in a separate focused task before expanding implementation.
- Only later evaluate @react-three/rapier for jumping/uneven ground. Later Firebase schema/rules/deployment changes require a separate approved design and staging verification.
