# 3D setup report

Date: 2026-10-31. Scope: preparation only. The existing 2D UI, routing, source logic, Firebase configuration/rules and deployment files were not edited. No game was deployed or pushed; no production student data was read or modified.

## Git protection

- Started on main at 5afd5d14255d2ca55bec0d81c5c2bdb5692c1866.
- Initial tracked change: src/styles/index.css (17 additions, 8 deletions). No initial untracked files reported.
- Created and switched to feat/3d-game-migration; branch did not previously exist. No reset, stash, overwrite, commit or push.
- User CSS bytes stayed identical: SHA256 0544A24CA8E0170FC484E95E4D6388CFCB36685FF13B4F501DED23C5DE32F5C6 before/after.
- Root AGENTS.md preserved. Only package manifests, new docs/skill and placeholder directories are intended task changes. Diagnostic scripts/audit JSON are ignored under .local and are not deliverables.

## Environment inventory

| Item | Verified result |
| --- | --- |
| OS | Windows 11 Home 10.0.26300; PowerShell 5.1.26100.9711 |
| Node / npm | 26.13.0 / 11.20.0; [official releases page](https://nodejs.org/en/about/previous-releases) identifies 26.13.0 as LTS |
| Git | 2.56.0.windows.4 |
| VS Code | 1.144.0 x64; CLI available |
| Codex CLI | 0.166.0 via codex.cmd |
| Blender | 5.2.3 LTS; full-path executable works, not on PATH |
| Chrome / Edge | 156.0.8078.74 / 156.0.4314.50, installed paths/registry verified |
| RAM | 16,481,336 KiB visible (~15.7 GiB); ~4.7 GiB free at inventory time |
| GPU | Intel Iris Xe, driver 31.0.101.3889; WMI reports 1 GiB adapter RAM, which is not a reliable total shared-memory limit |
| Free disk | C: ~28.5 GiB; D: ~7.8 GiB; F: ~1314.6 GiB at inventory time |
| WebGL | Not verified at runtime; attempted MCP browser-code probe was unavailable. Manual blank-tab check documented |

Sandbox WMI/VS Code inventory was denied initially; approved read-only inventory succeeded outside the sandbox. Later the sandbox process helper failed to refresh; final shell checks used approved execution. No administrator or system security change was needed.

## Dependency installation and compatibility

| Package | Installed / saved range | Role |
| --- | --- | --- |
| three | 0.187.0 / ^0.187.0 | Runtime rendering |
| @react-three/fiber | 9.8.2 / ^9.8.2 | React renderer, stable v9 |
| @react-three/drei | 10.7.9 / ^10.7.9 | Stable helpers |
| @types/three | 0.187.0 / ^0.187.0 (dev) | Matching TypeScript definitions |

React and React DOM remain 19.2.6. npm registry peer checks: Fiber 9.8.2 accepts React/DOM >=19 <19.4 and Three >=0.156; Drei accepts React/DOM ^19, Fiber ^9 and Three >=0.159. npm ls verified a valid dependency tree. [R3F official documentation](https://r3f.docs.pmnd.rs/getting-started/introduction) pairs React 19 with Fiber 9; no Fiber 10 alpha installed.

package.json adds only the four packages above; package-lock.json records their resolution (55 packages added). No existing direct dependency upgraded or removed. No force/legacy-peer-deps/audit-fix used. No direct physics, postprocessing or state-management library added. Drei brings helper transitive packages including Zustand, camera-controls and stats-gl; stats-gl has a nested Three 0.170.0. This is compatible but potentially redundant: avoid importing unused stats/helpers in production and assess chunks when a scene exists. Installed packages do not enter the current app bundle until imported.

Existing tools remain: TypeScript 5.9.3, Vite 7.3.3, Tailwind 3.4.19, Firebase 12.13.0, ESLint 9.39.4. Framer Motion serves the 2D UI and Recharts serves dashboards; neither is redundant merely because 3D is added. gh-pages remains part of deployment; no deployment changes are justified here.

Audit against an isolated copy of the original HEAD package/lock manifests and after installation returned identical findings: 29 total (3 low, 14 moderate, 11 high, 1 critical). Findings include existing Vite, PostCSS, router, lint dependencies and transitive websocket-driver (critical). This is a baseline maintenance risk, not evidence of 3D peer incompatibility. Review advisories and dependency paths in a separate maintenance task; audit's proposed major/downgrade fixes are not automatically safe. No broad upgrade performed.

npm reported unapproved install scripts for @firebase/util, esbuild and protobufjs. They were not approved automatically. Existing build/tests still passed with the installed environment; clean-machine installation should review these packages before granting script permissions.

## MCP configuration and actual checks

Initial sandbox codex mcp list reported no configured servers. The approved host view also exposes pre-existing plugin-managed integrations; these were left untouched. Added only missing named entries in user Codex configuration:

| Server | Launcher/URL | Verification |
| --- | --- | --- |
| playwright | cmd.exe /d /c npx.cmd -y @playwright/mcp@latest | Enabled; initialize succeeded, 25 tools discovered; advertised server version 1.64.0-alpha-1790635538000 |
| context7 | cmd.exe /d /c npx.cmd -y @upstash/context7-mcp | Enabled; initialize succeeded, 2 tools discovered; server 4.4.4; keyless |
| openaiDeveloperDocs | https://developers.openai.com/mcp | Enabled; HTTP initialize and tools/list succeeded, server 1.0.0, 5 tools |

Playwright's official latest launcher advertises an alpha-tagged internal server/browser version; this is distinct from the stable Fiber selection. No game browser navigation occurred. A later attempt to call browser_run_code returned Tool not found in the discovered configuration; WebGL and screenshot/navigation workflows are not certified by startup success. Context7 documentation queries/rate limits were not exercised. MCP Auth 'Unsupported' in the CLI list is not itself a startup failure for these unauthenticated transports. Restart Codex for discovery in a new session.

Commands verified against [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp), [Context7 client instructions](https://context7.com/docs/resources/all-clients), [Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp), and [OpenAI Docs MCP](https://developers.openai.com/learn/docs-mcp). No secrets, production database access, Blender MCP or new GitHub MCP configuration added.

## VS Code and assets

Already installed: openai.chatgpt 26.1021.22027. Installed and re-listed: dbaeumer.vscode-eslint 3.0.34, esbenp.prettier-vscode 12.4.0, usernamehw.errorlens 3.30.0, eamodio.gitlens 19.5.0, cesium.gltf-vscode 2.5.1. Exact Marketplace links are in MANUAL_INSTALLATION_GUIDE.md. No user editor settings or existing AI extensions changed.

Prepared tracked placeholder folders: public/models/{characters,environments,bosses,props}, public/textures, public/audio/{music,effects}, src/features/three-game/{components,scenes,systems,hooks,utils}. No original assets moved. Inventoried asset manifest, backgrounds, map/Angkor art, character/mascot, six boss images, hands, profile and UI art; visually inspected angkor-flat.png. External asset download total: zero. See ASSET_LICENSES.md for reuse and licensed candidates.

## Baseline and final validation

| Check | Before setup | After dependency installation |
| --- | --- | --- |
| npm run typecheck (root tsc --noEmit) | Pass, but does not traverse referenced projects | Same |
| npm run lint | Pass | Pass |
| npm run test:typing | Pass | Pass |
| npm run test:gamification | Pass | Pass |
| npm run check | Pass | Pass |
| npm run build | Pass | Pass; same 2220 transformed modules and asset sizes |
| tsc --noEmit -p tsconfig.app.json | Eight existing diagnostics | Same eight diagnostics |
| tsc --noEmit -p tsconfig.node.json | Pass | Pass |
| npm ls 3D/React dependencies | 3D absent | Valid compatible tree |

Important baseline gap: root tsconfig.json has files: [] and project references. The existing scripts invoke tsc without build mode or explicit projects, so their passing result is not an application type-safety guarantee. Scripts were preserved; fix this deliberately alongside existing errors.

Existing application diagnostics (unchanged):

- FeaturePanels.tsx:233 TS2488: nullable value spread.
- GameSidebar.tsx:107 TS2345: undefined panel state.
- economy.ts:590 and :1157 TS2532: possibly undefined values.
- WorldMapPage.tsx:100 TS2339 and :502 TS2322: badge prop missing from type.
- WorldMapPage.tsx:563 TS2322: unlocked node state not accepted by component.
- profileService.ts:61 TS2322: string | false returned where boolean required.

Both builds warn about the existing 638 kB minified main JS chunk (>500 kB). The new packages are unused until the future isolated scene is imported. No 3D gameplay/runtime or full visual regression test is claimed. Existing routes and feature code were verified unchanged by Git diff, not navigated against live Firebase.

## Remaining work

No required installation is blocked. Manual optional editors and browser/WebGL check are documented. Main development risks are the baseline type-check gap and audit findings, limited D: storage, integrated GPU performance, large existing PNGs, Unicode/input focus conflicts, unverified original-art provenance and persistence write-through. Address these through the staged plan before full conversion.
