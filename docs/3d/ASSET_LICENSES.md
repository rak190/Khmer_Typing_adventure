# Asset inventory and licensing

Reviewed 2026-10-31. **No external art/model/audio assets downloaded during setup or Task 2 (0 bytes).** The 3D prototype relies strictly on lightweight, project-authored procedural Three.js primitives and standard materials. This ensures 0 network downloads, instant page loads on low-bandwidth school networks, zero third-party licensing obligations, and smooth 60 FPS execution on low-end integrated graphics (Intel HD / Iris Xe).

## Task 2 Project-Authored 3D Procedural Assets

| Component | Description | Geometry / Materials | License |
| --- | --- | --- | --- |
| `Environment.tsx` | Cambodian sugar palms, 7-headed Naga balustrades (*នាគ*), ceremonial streamer flags (*ទង់ក្រពើ*), stone lotus basins, causeway pavers, fireflies/spirit motes | Cylinders, boxes, spheres, cones; standard low-roughness materials | Project-authored / CC0 equivalent |
| `Character.tsx` | Student hero avatar with sapphire silk tunic, golden royal sash (*សង្វារ*), emerald medallion, epaulets (*ពានាហា*), pleated *chong kben* (*សំពត់ចងក្បិន*), bangles, lotus topknot ornament (*មាលា*), explorer satchel with palm-leaf manuscript | Segmented compound hierarchical meshes with organic lerped idle/walk blend tree | Project-authored / CC0 equivalent |
| `ThirdPersonCamera.tsx` | Mode-specific tracking camera (exploration over-the-shoulder, typing altar focus, cinematic opening sweep, celebratory victory view) | Pure procedural math with exponential smoothing `1 - Math.exp(-damping * dt)` | Project-authored / CC0 equivalent |
| `AncientStoneGate.tsx` | Angkor Gopura portal, tiered pediments, Kalasa finial, carved teak/sandstone door leaves, bronze bosses, dual-layer braziers, guardian lions (*Simha*), dynamic rune altar | Procedural compound meshes, dynamic point lights, ripple mesh | Project-authored / CC0 equivalent |

## Existing project art (kept in place)

| Location | Reuse |
| --- | --- |
| src/assets/backgrounds/* | Menus, loading screens and lighting/color references |
| src/assets/map/world-1..6.png; angkor-flat.png | World map UI, gate silhouette, courtyard and foliage concept references |
| src/assets/characters/lizard-mascot.png, elephant-guide.png, stone-guardian.png | Character/boss design references and HTML portraits |
| src/assets/bosses/boss-*.png | Boss silhouette, palette and future modeling references |
| src/assets/icons/*; logo/*; ui/*; profile/* | Existing branding, HUD, rewards and profile overlays |
| src/assets/hands/* | Existing finger guidance; preserve alignment with keyboard |

src/assets/assetManifest.ts is the main import registry; manifest.ts re-exports it. Existing PNGs are not rigged/animated 3D models. Reference them in Blender while building meshes; a textured plane is only a billboard. Do not automatically project full backgrounds onto models. Repository art provenance was not established by this setup; retain original rights records and confirm rights before external redistribution.

## Researched candidates — not installed

| Asset/source | License and commercial use | Recommended format/import | Download size |
| --- | --- | --- | --- |
| [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) | Page declares CC0; commercial use allowed, attribution not required | Prefer included GLB/glTF; otherwise import OBJ/FBX in Blender and export selected rocks/palms as GLB | Not downloaded/measured; page lists 330 files |
| [Quaternius Ultimate Nature](https://quaternius.com/packs/ultimatenature.html) | Page declares CC0; commercial use allowed, attribution not required | Page lists Blend/FBX/OBJ; open a few useful models in Blender, apply transforms and export GLB | Not downloaded/measured; 150 models |
| Original Khmer gate, capsule character | Project-authored primitives initially; future artist/model provenance must be recorded | Separate gate halves/pivots; rigged GLB with idle/walk only if needed | Future |

License reference: [CC0 public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/). Keep a copy of each pack's actual license/readme even when attribution is optional. Credits to Kenney/Quaternius are encouraged. Verify the selected archive matches the page before import; unrelated paid bundles can have different terms.

Manual import: use the exact pack page above, choose its free download, retain only needed models and license, open/import them in Blender, check materials/scale/origin, export glTF 2.0 as GLB to public/models/props or environments. Test with glTF Tools. Record selected files and actual sizes here before committing them. Do not commit whole archives or Blender backups.

## Future asset checklist

- One student-friendly character (capsule first; optional rig and idle/walk later).
- One original sandstone gate with independent door pivots; low-poly courtyard, a few palms/rocks.
- Small shared texture atlas if flat colors become insufficient; no text baked into textures.
- Optional short gate/reward sounds, separately verified license; audio starts after a user gesture.
- No boss model or music pack is necessary for the first gate slice.

For every future import record: name, author, source page and archive URL, retrieval date, license file, commercial/attribution terms, destination, byte size, and modifications. New models go in public/models/{characters,environments,bosses,props}; textures in public/textures; audio in public/audio/{music,effects}.
