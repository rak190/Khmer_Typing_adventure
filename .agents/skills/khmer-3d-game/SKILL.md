---
name: khmer-3d-game
description: Prepare or extend Khmer Typing Adventure's isolated React Three Fiber game, reusing its Khmer typing and progression systems. Use for this project's 3D work, not unrelated UI changes.
---

Read root AGENTS.md and docs/3d/NEXT_STEPS.md, then only the source needed for the requested slice.

- Put 3D components in src/features/three-game. Keep rendering, movement and camera independent of typing, scoring and persistence. Lazy-load any future 3D route; retain the 2D fallback.
- Reuse lib/khmerText.ts, lessonTypingPlan.ts, typingMetrics.ts, fingerGuidance.ts and data/keyboardMap.ts. Preserve NFC normalization, graphemes, dependent vowels, coeng sequences and input order. Do not use UTF-16 length as the Khmer CPM character count.
- Reuse curriculum, adventureWorlds, bosses and existing reward rules. Teach accuracy before speed; show CPM prominently. Keep Khmer text and keyboard/finger hints in accessible HTML overlays with existing theme tokens.
- During a typing challenge, suspend movement shortcuts and clear held keys. Handle focus, blur, composition, cancellation and retry explicitly. Never intercept normal form navigation.
- Prototype rewards use injected memory storage only. Some existing progress helpers write through to Firebase even when they look local: inspect callers before reuse. Never modify production student data or rules.
- Start with primitives, one canvas, bounded DPR and simple lighting. Avoid extra physics/postprocessing/state libraries until measured need. Budget for integrated GPUs and offer the 2D route when WebGL2 fails.
- Keep changes small and testable. Preserve branding and existing functionality; no unrelated redesign. Record external asset provenance in docs/3d/ASSET_LICENSES.md.
- Run targeted checks and existing lint/tests/build. Explicitly check both TypeScript project configs; root tsc currently misses source errors. Compare against SETUP_REPORT.md before calling a failure new.
