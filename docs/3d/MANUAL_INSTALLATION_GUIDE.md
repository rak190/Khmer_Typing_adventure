# Windows manual installation guide

Inventory date: 2026-10-31. No required application download remains for initial development. No machine-wide application, installer script, paid tool or security-setting change was executed. Use the official pages below if repairing or setting up another PC; do not reinstall working tools.

## Installed applications — retain these versions

| Application / purpose | Detected | Official download / channel | Windows installation if missing | Verify and next action |
| --- | --- | --- | --- | --- |
| Blender / model creation and GLB export | 5.2.3 LTS, executable verified | https://www.blender.org/download/ or https://www.blender.org/download/lts/; prefer LTS | Required only for custom modeling, optional for primitive prototype. Use official Windows x64 installer or portable ZIP; launch from Start menu | Run `& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --version`; model a small gate, export glTF 2.0 as GLB. Not on PATH; no PATH change needed |
| Visual Studio Code / editor | 1.144.0 x64 | https://code.visualstudio.com/Download; stable | Required for this chosen workflow. Choose Windows User Installer and optional Add to PATH, reopen terminal | `code --version`; open this repository and reload extensions |
| Node.js + npm / Vite build | Node 26.13.0, npm 11.20.0 | https://nodejs.org/en/download; LTS | Required. Official Windows x64 MSI; retain npm and PATH defaults; reopen terminal. No upgrade needed here | `node --version`; `npm.cmd --version`; on a clean checkout run `npm.cmd ci`, then checks |
| Git for Windows / version control | 2.56.0.windows.4 | https://git-scm.com/downloads/win; stable | Required. Official Windows installer, enable command-line Git; reopen terminal | `git --version`; `git status`; keep work on feat/3d-game-migration |
| Chrome or Edge / browser and GPU testing | Chrome 156.0.8078.74; Edge 156.0.4314.50 | https://www.google.com/chrome/ or https://www.microsoft.com/edge/download; stable | One required; both already available. Use built-in Edge or official Chrome installer | Help > About checks version. Visit `chrome://gpu` or `edge://gpu` and verify WebGL2 on the target PC; browser presence alone does not establish support |

The Blender site could not be retrieved by the research tool in this session; its official URL is supplied, while the installed LTS version was verified locally. No Blender download is necessary.

## Optional missing applications

Registry inventory did not find Krita/GIMP/Audacity; portable copies may exist elsewhere. These are optional and were not installed.

### Krita — concept art and texture editing

- Official page: https://krita.org/en/download/; stable Windows x64 (page showed 5.3.4.1 during research). Free official download; no Store purchase needed.
- Download Windows installer or portable archive from that page, run the installer yourself or extract the portable archive, and launch Krita. Approve any OS installation prompts only if desired.
- Verify Help > About and create/export a PNG. Keep editable source separately; place only optimized game textures in public/textures. Do not replace existing project art automatically.

### Audacity — short gate and reward sound editing

- Official page: https://www.audacityteam.org/download/windows/; stable Windows x64 (page showed 4.0.1). Choose the standalone MSI or portable archive; additional audio plugins are unnecessary.
- Install manually or extract the portable archive. Launch, check Help > About, import a short recording and export a WAV to verify operation.
- Keep master recordings outside shipped assets. Export a short compressed browser-compatible effect to public/audio/effects, document its rights, and add playback only after a student gesture. Not needed for the first silent prototype.

## VS Code extensions

All requested extensions are now installed. IDs were verified against their exact Marketplace pages; no competing AI extension was added. Existing Claude Code was left untouched.

| Extension | Version | Exact Marketplace page |
| --- | --- | --- |
| OpenAI Codex (already installed) | 26.1021.22027 | https://marketplace.visualstudio.com/items?itemName=openai.chatgpt |
| ESLint | 3.0.34 | https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint |
| Prettier | 12.4.0 | https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode |
| Error Lens | 3.30.0 | https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens |
| GitLens | 19.5.0 | https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens |
| Cesium glTF Tools | 2.5.1 | https://marketplace.visualstudio.com/items?itemName=cesium.gltf-vscode |

Verify with `code --list-extensions --show-versions`; reload VS Code. Use Extensions > Install from these exact IDs if another profile lacks them. No formatter-on-save setting was changed, preventing unrelated formatting. GitLens paid features and account signup are not needed for basic history inspection. Codex account sign-in is manual if the extension is not already authenticated.

## MCP and PowerShell follow-up

Codex CLI 0.166.0 works through `codex.cmd`. PowerShell execution policy blocks `codex.ps1`; use `.cmd` launchers for Codex/npm/npx instead of weakening execution policy.

The following were registered in user-level Codex configuration, not checked into the repository:

```powershell
codex.cmd mcp add playwright -- cmd.exe /d /c npx.cmd -y @playwright/mcp@latest
codex.cmd mcp add context7 -- cmd.exe /d /c npx.cmd -y @upstash/context7-mcp
codex.cmd mcp add openaiDeveloperDocs --url https://developers.openai.com/mcp
codex.cmd mcp list
```

Do not rerun add when entries already exist. Restart the Codex session to discover new tools. Registration and initialize/tools-list probes succeeded; see SETUP_REPORT.md for limitations. The launchers use npx and may need internet/npm cache access at future startup. No globally installed server package or project MCP dependency was added.

Context7's keyless startup succeeded. For rate limits/authentication failures, use the provider's [manual client documentation](https://context7.com/docs/resources/all-clients) or [dashboard](https://context7.com/dashboard). Obtain credentials yourself, configure them privately through the supported client mechanism, and never paste keys into Git, reports or chat. No API key was requested or stored here. OpenAI Docs MCP requires no credential for this read-only use; Playwright needs no service account.

For WebGL verification, open a blank browser tab's developer console and run:

```javascript
Boolean(document.createElement('canvas').getContext('webgl2'))
```

Then test an actual R3F scene in the separately requested prototype. This session's Playwright tool inventory did not expose browser_run_code; the attempted probe returned Tool not found, so no GPU runtime claim is made. Do not enable unsafe browser-code capabilities merely for this check.

## Asset downloads and optional future integrations

Follow [ASSET_LICENSES.md](ASSET_LICENSES.md) for exact free pack pages, license checks and GLB import steps. No asset download is required yet.

Blender MCP is deferred: manual Blender export is enough and avoids a bridge executing scene scripts. GitHub MCP is deferred: local Git is sufficient for setup; consider scoped repository access later for requested issue/PR workflows. Neither was installed. Any future machine-wide/winget installation, administrator operation, paid purchase or security-sensitive configuration needs explicit approval before execution.
