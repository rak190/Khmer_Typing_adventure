# Next steps

Setup is complete; full 3D conversion is not started. Work remains on feat/3d-game-migration with all changes uncommitted for review. Keep the user's pre-existing src/styles/index.css change separate when staging.

1. Review SETUP_REPORT.md and restart Codex/VS Code to discover MCP tools/extensions. No required application download is outstanding.
2. Check WebGL2 manually in Chrome/Edge; test on a representative school computer as well as this development PC. Optional art/audio tools can wait.
3. Request a focused baseline repair task: fix the eight existing TypeScript errors and make typecheck/build check both project configs, preserving gameplay. Review the unchanged npm audit findings in a separate dependency maintenance pass before deploying anything.
4. Only after a separate request, implement the first isolated gate slice in 3D_MIGRATION_PLAN.md. Start with primitives and memory-only progress. No paid or large asset packs needed.

Suggested next Codex prompt:

> Use .agents/skills/khmer-3d-game/SKILL.md and docs/3d/SETUP_REPORT.md. Fix only the eight documented baseline TypeScript errors and correct the typecheck/build scripts to validate both referenced projects. Preserve the user's CSS changes, all game behavior, Firebase rules/data and deployment configuration. Run explicit TypeScript checks, lint, tests and build. Do not begin 3D gameplay, commit, push or deploy.

After that task, a separate prompt can authorize the Ancient Khmer Typing Gate prototype. Keep steps small: rendering/fallback first, movement/camera second, existing typing controller integration third, gate/reward flow last. Measure once a playable slice exists; avoid browser automation for documentation-only changes.

Use this skill and the source map in 3D_MIGRATION_PLAN.md for persistent context instead of repeatedly re-reading the repository. Dependencies and extensions are installed; check availability before any reinstall. Use version-specific official docs/Context7 only for APIs actually being implemented. No model switch or agent delegation is required.
