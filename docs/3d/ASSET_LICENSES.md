# 3D Asset Licenses & Provenance

This document records the licensing, authorship, source provenance, and optimization details for all 3D models and materials used in **Khmer Typing Adventure** (`src/features/three-game/` and `public/models/`).

---

## 1. Authorship & License Categories

1. **Project-Authored 3D Assets & Procedural R3F Components (Repository Copyright)**:
   - Authored specifically for **Khmer Typing Adventure** using Blender 5.2 Python (`bpy`) automation (`scripts/blender/`) and React Three Fiber procedural geometry (`src/features/three-game/components/`).
   - **License**: Owned by the repository author and governed by the project's repository license (not "CC0 equivalent"—previous documentation wording has been corrected to distinguish project-owned work from external Public Domain CC0 assets).

2. **Verified External CC0 1.0 Universal Public Domain Assets**:
   - Sourced from **Quaternius Ultimate Nature Pack** (Creator: [Quaternius](https://quaternius.com)).
   - **License**: [Creative Commons Zero v1.0 Universal (CC0 1.0 Public Domain Dedication)](https://creativecommons.org/publicdomain/zero/1.0/).
   - Full license text is stored in [`public/models/LICENSE-QUATERNIUS-CC0.txt`](../../public/models/LICENSE-QUATERNIUS-CC0.txt).
   - Commercial and educational use, modification, optimization, and redistribution are permitted without restriction.

---

## 2. Exported GLB Asset Registry (`public/models/`)

| Asset Name | Local File Path | Category | Creator / Source | License | Import Date | File Size | Triangles | Meshes | Modifications Made (Blender 5.2 `bpy`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Khmer Student Hero** | `public/models/characters/khmer_student_hero.glb` | Character | Project-Authored (`scripts/blender/create_stylized_hero.py`) modeled after `src/assets/profile/khmer-typing-hero-avatar.png` and character reference sheet | Project-Authored (Repository License) | 2026-10-31 | 809.1 KB | 32,096 | 8 | Stylized Cambodian youth student adventurer with anime/Pixar chibi proportions, warm golden-tan skin (#E8A87C) with Subsurface Scattering and soft blush cheeks; expressive honey-brown eyes with dual catchlights, sculpted lids, and brows; dark espresso swept-back hair; golden headband with beaded trim and diamond crest with glowing blue sapphire; cream/beige tunic; primary teal cape and cowl featuring an embossed Golden Angkor Wat 5-tower temple silhouette on the back; crossed golden *sangvar* harness with center sapphire brooch; golden pauldrons; brown leather adventure satchel for learning items; puffed red-brown *chong kben* breeches; golden wrist cuffs (*kang dai*) with 5 articulated touch-typing fingers; golden ankle cuffs (*kang cheung*); and brown leather adventure boots with gold straps; organized into 8 articulated joint pivot groups (`HeroWaistMesh`, `HeroChestMesh`, `HeroCapeMesh`, `HeroHeadMesh`, `HeroLeftArmMesh`, `HeroRightArmMesh`, `HeroLeftLegMesh`, `HeroRightLegMesh`). |
| **Tall Sugar Palm Tree** | `public/models/props/palm_tree_tall.glb` | Foliage / Tree | Quaternius — *Ultimate Nature Pack* (`Blends/PalmTree_1.blend`, https://quaternius.com) | CC0 1.0 Universal | 2026-10-31 | 96.9 KB | 1,772 | 1 | Extracted from `.blend`, applied transforms, centered bottom origin at `Y = 0`, normalized height to `5.4 m`, exported to glTF 2.0 `.glb`. |
| **Mossy Temple Boulder** | `public/models/props/rock_moss.glb` | Rock / Terrain | Quaternius — *Ultimate Nature Pack* (`Blends/Rock_Moss_1.blend`, https://quaternius.com) | CC0 1.0 Universal | 2026-10-31 | 5.2 KB | 70 | 1 | Extracted from `.blend`, centered bottom origin at `Y = 0`, normalized height to `1.35 m`, exported to `.glb`. |
| **Floating Lotus Lilypad** | `public/models/props/lotus_lilypad.glb` | Water Flora | Quaternius — *Ultimate Nature Pack* (`Blends/Lilypad.blend`, https://quaternius.com) | CC0 1.0 Universal | 2026-10-31 | 22.0 KB | 372 | 1 | Extracted from `.blend`, centered bottom origin at `Y = 0`, normalized height to `0.07 m`, exported to `.glb`. |
| **Tropical Courtyard Bush** | `public/models/props/tropical_bush.glb` | Foliage / Shrub | Quaternius — *Ultimate Nature Pack* (`Blends/Bush_1.blend`, https://quaternius.com) | CC0 1.0 Universal | 2026-10-31 | 20.1 KB | 364 | 1 | Extracted from `.blend`, centered bottom origin at `Y = 0`, normalized height to `0.90 m`, exported to `.glb`. |
| **Tropical Courtyard Flowers** | `public/models/props/tropical_flowers.glb` | Foliage / Flower | Quaternius — *Ultimate Nature Pack* (`Blends/Flowers.blend`, https://quaternius.com) | CC0 1.0 Universal | 2026-10-31 | 24.4 KB | 408 | 1 | Extracted from `.blend`, centered bottom origin at `Y = 0`, normalized height to `0.42 m`, exported to `.glb`. |
| **Khmer Simha Guardian Lion** | `public/models/props/khmer_simha_guardian.glb` | Temple Statue | Project-Authored (`scripts/blender/export_environment_assets.py`) modeled after `src/assets/backgrounds/lesson-background.png` | Project-Authored (Repository License) | 2026-10-31 | 72.2 KB | 2,380 | 1 | Sculpted seated Angkorian *Simha* guardian lion on stepped mossy lotus plinth with golden collar, crown crest, and glowing amber eyes; joined into 1 multi-material mesh. |
| **Khmer Lotus Learning Altar** | `public/models/props/khmer_lotus_altar.glb` | Interactive Prop | Project-Authored (`scripts/blender/export_environment_assets.py`) | Project-Authored (Repository License) | 2026-10-31 | 17.9 KB | 420 | 1 | Sculpted stepped sandstone and royal-gold lotus pedestal altar with 4 golden corner finials; joined into 1 multi-material mesh. |

**Total Exported GLB Asset Footprint**: **1.04 MB** across 8 `.glb` files (37,882 total source triangles).

---

## 3. Procedural React Three Fiber Architectural & Atmospheric Elements

The following components in `src/features/three-game/components/` are project-authored in TypeScript/React Three Fiber and carry no third-party asset dependencies:
- **Sunlit Cambodian Sky Dome, Morning Sun, & Stylized Drifting Clouds** (`Environment.tsx`)
- **Turquoise Lotus Reflecting Pools & Sacred Pink Lotus Blooms** (`Environment.tsx`)
- **Golden-Ochre Sandstone Causeway, Flagstones, & Naga Balustrades** (`Environment.tsx`)
- **5-Tower Angkorian Prasat Sanctuary Complex (`ប្រាង្គប្រាសាទអង្គរ`)** (`Environment.tsx`)
- **Ancient Angkor Gopura Stone Gate, Sliding Doors, & Progressive Khmer Rune Lintels** (`AncientStoneGate.tsx`)
- **Stage 2 Twin Monoliths (`ថ្មភ្លោះ`) & Stage 3 Ta Prohm Banyan Root Sanctuary Arch (`ផ្លូវព្រៃ`)** (`StageChallenges.tsx`)
