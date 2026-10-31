# Task 6.5 — 3D Visual Upgrade & Blender Automation Report

**Branch:** `feat/task-6.5-3d-visual-upgrade`  
**Repository:** `https://github.com/rak190/Khmer_Typing_adventure`

---

## 1. 2D Visual Identity Analysis

Inspection of the project's 2D artwork established the canonical visual language for the 3D upgrade:
- **Hero Portrait (`src/assets/profile/khmer-typing-hero-avatar.png`)**: Youthful Cambodian student adventurer with layered spiky dark-espresso hair, an ornate gold headband featuring a signature diamond-shaped golden crest and glowing blue sapphire gem (`#38BDF8`), expressive brown eyes with dual white catchlights, a deep teal tunic (`#0F766E`), a draped teal scarf cowl with gold trim, ornate golden shoulder pauldrons, a crossed golden *sangvar* chest harness with a diamond sapphire clasp, a leather-and-gold medallion belt, pleated amber-brown *chong kben* breeches with a teal-and-gold front brocade apron, golden leather vambraces, golden ankle cuffs (*kang cheung*), and traditional sandals.
- **Temple & Courtyard Artwork (`src/assets/backgrounds/lesson-background.png`, `home-background.png`, `src/assets/map/angkor-flat.png`)**: Sunlit cerulean daytime sky (`#0284C7` to `#38BDF8`) transitioning to a warm golden-amber horizon (`#FDE68A`), golden-ochre weathered sandstone flagstone causeways with emerald grass joints, tranquil turquoise lotus reflecting pools (`#06B6D4`) with floating lily pads and blooming pink/gold lotus flowers, seated sandstone Guardian Lions (*Simha*), carved Angkorian Gopura gates with triangular pediments (*ហោជាង*), and a 5-tower Angkorian Prasat sanctuary silhouette.

---

## 2. 3D Art Direction Plan

- **Color & Atmosphere**: Replaced the previous dark void (`#0A1118`) with a bright daytime Cambodian sky dome (`#38BDF8`), warm golden horizon glow (`#FDE68A`), morning sun disk, drifting stylized cumulus clouds, and atmospheric horizon fog (`#BAE6FD`, `38m–108m`).
- **Lighting & Shadows**: Enabled WebGL shadow mapping (`dpr={[1, 1.5]}`), paired a warm directional sun light (`#FFFBEB`, `1024×1024` shadow map) with sky/sandstone hemisphere fill (`#E0F2FE` / `#9A6B3B`) and golden altar point lights.
- **Cohesive Stylized Proportions**: Matched the 3D hero, temple guardian statues, lotus altars, and tropical flora to the warm hand-crafted proportions of the 2D game.

---

## 3. Asset Sources and Licenses

All 3D assets in `public/models/` are documented in [`docs/3d/ASSET_LICENSES.md`](./ASSET_LICENSES.md):
- **Project-Authored Blender 5.2 Assets (Repository License)**:
  - `public/models/characters/khmer_student_hero.glb` (363.8 KB, 8 meshes, 11,208 triangles)
  - `public/models/props/khmer_simha_guardian.glb` (72.2 KB, 1 mesh, 2,380 triangles)
  - `public/models/props/khmer_lotus_altar.glb` (17.9 KB, 1 mesh, 420 triangles)
- **Verified CC0 1.0 Universal Public Domain Assets (Quaternius Ultimate Nature Pack, [`public/models/LICENSE-QUATERNIUS-CC0.txt`](../../public/models/LICENSE-QUATERNIUS-CC0.txt))**:
  - `public/models/props/palm_tree_tall.glb` (96.9 KB, 1 mesh, 1,772 triangles)
  - `public/models/props/rock_moss.glb` (5.2 KB, 1 mesh, 70 triangles)
  - `public/models/props/lotus_lilypad.glb` (22.0 KB, 1 mesh, 372 triangles)
  - `public/models/props/tropical_bush.glb` (20.1 KB, 1 mesh, 364 triangles)
  - `public/models/props/tropical_flowers.glb` (24.4 KB, 1 mesh, 408 triangles)
- **Total GLB Footprint**: **622.5 KB** across all 8 `.glb` files.

---

## 4. Blender Automation Performed

All 3D modeling, material assignment, pivot normalization, mesh joining, and `.glb` exporting were executed automatically via headless **Blender 5.2.3 LTS** (`C:\Program Files\Blender Foundation\Blender 5.2\blender.exe --background --python ...`):
1. [`scripts/blender/create_khmer_hero.py`](../../scripts/blender/create_khmer_hero.py):
   - Procedurally constructs the stylized Khmer Student Hero in Blender 5.2, assigns calibrated linear PBR materials, joins static sub-primitives under each of the 8 articulated pivot Empty nodes (`HeroBody`, `HeroChest`, `HeroCape`, `HeroHead`, `HeroLeftArm`, `HeroRightArm`, `HeroLeftLeg`, `HeroRightLeg`), exports `public/models/characters/khmer_student_hero.glb`, and renders a studio verification preview.
2. [`scripts/blender/export_environment_assets.py`](../../scripts/blender/export_environment_assets.py):
   - Extracts CC0 source `.blend` files from the Quaternius Ultimate Nature Pack, normalizes mesh bounding boxes so bottom-center rests at `Y = 0` with consistent real-world heights, and exports optimized `.glb` props.
   - Generates and exports the custom `khmer_simha_guardian.glb` and `khmer_lotus_altar.glb` architectural models.

---

## 5. Character Upgrade Summary (Task 6.5 & 6.5A)

- Implemented [`src/features/three-game/hooks/useGltfAsset.ts`](../../src/features/three-game/hooks/useGltfAsset.ts) to load and cache `.glb` scenes in memory with automatic base URL path resolution (`resolveModelUrl`), shadow enablement, and non-blocking fallback.
- Created [`scripts/blender/create_stylized_hero.py`](../../scripts/blender/create_stylized_hero.py) producing `khmer_student_hero.glb` (809.1 KB, 32,096 triangles, 8 modular pivot groups) matching the canonical character reference sheet:
  - **Art Direction & Anatomy**: Stylized Cambodian student adventurer with anime/Pixar chibi proportions, warm golden-tan skin (`#E8A87C`) with Subsurface Scattering and soft rosy blush cheeks.
  - **Face & Hair**: Voluminous swept-back espresso hair with front bangs framing the golden headband; large expressive anime eyes with warm honey-brown irises, dark pupils, and dual bright white sparkle catchlights; cheerful upturned smiling mouth; and stylized button nose.
  - **Headband & Royal Regalia**: Golden diadem circlet with scalloped beaded gold pearls and rising vertical diamond crest with a faceted, glowing azure sapphire gemstone.
  - **Cambodian Adventurer Outfit**: Light cream/beige tunic and upper sleeves with gold cuffs; crossed golden *Royal Sangvar* ceremonial chest harness with center diamond sapphire brooch; golden pauldrons hugging shoulders.
  - **Angkor Wat Cape**: Primary rich teal cape and cowl scarf with an embossed **Golden Angkor Wat 5-Tower Temple Silhouette** on the back.
  - **Learning Satchel**: Brown leather adventurer satchel for learning materials slung diagonally across torso onto left hip.
  - **Pants & Footwear**: Puffed red-brown / russet *Chong Kben* breeches (`#883322`); golden ankle cuffs (*kang cheung*); and brown leather adventurer boots with gold cross-straps.
  - **Touch-Typing Hands**: Gold wrist cuffs (*kang dai*) with 5 articulated fingers (Thumb, Index, Middle, Ring, Pinky) arched in natural home-row touch-typing readiness.
- Upgraded [`src/features/three-game/components/Character.tsx`](../../src/features/three-game/components/Character.tsx) to mount the 8 articulated mesh groups from `khmer_student_hero.glb` directly onto the animated R3F hierarchy (`bodyRef`, `chestRef`, `capeRef`, `headRef`, `leftArmRef`, `rightArmRef`, `leftLegRef`, `rightLegRef`), plus a ground contact shadow and dynamic explorer aura ring.

---

## 5.1. HUD Correction & Compact Bottom-Center Quest Bar (Task 6.5)

- Redesigned [`src/features/three-game/components/ExplorationHud.tsx`](../../src/features/three-game/components/ExplorationHud.tsx) to resolve screen obstruction:
  - **Removed Center Panel**: Eliminated the large proximity modal in the middle of the screen that previously obscured the player character, temple walkway, and Gopura gate. The center screen is now 100% unobstructed.
  - **Compact Bottom-Center Quest Bar**: Added a floating pill-shaped quest bar docked at the bottom center (`max-w-xl mx-auto`), styled in a glowing amber/slate translucent gradient with warm golden border (`border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.35)]`).
  - **Clear Khmer Guidance**: Prominently displays actionable instruction text:
    - Exploring: `ដើរទៅកាន់អាសនៈ [W / ↑] ហើយចុច [E] ដើម្បីចាប់ផ្តើមដំណាក់កាលទី {N}`
    - Near Altar: `ចុច [E] ឬ ចុចប៊ូតុងនេះ ដើម្បីចាប់ផ្តើមដំណាក់កាលទី {N}`
    - Stage Completed: `✨ មេរៀនទាំងអស់បានសម្រេចជោគជ័យ! ដើរឆ្លងកាត់ទ្វារបុរាណ`
  - **Accessible Start Button**: Includes an interactive `[E] ចាប់ផ្តើម` button with keyboard keycap and gold chevron that allows instant stage activation via touch, click, or pressing `[E]`/`[Enter]`.
  - **Non-Overlapping Layout**: Movement hints (`[W][A][S][D] + [↑][←][↓][→]`) sit neatly on the bottom-left and collapse on mobile viewports so there is zero overlap.
  - **Responsive Design**: Adapts gracefully across desktop (`1440×900`), tablet (`768×1024`), and phone (`390×844`) screens without obscuring the character or gate.

---

## 6. Animation Summary

`Character.tsx` drives 6 distinct, blended procedural animations at 60 FPS:
1. **Calm Idle**: Gentle chest breathing expansion, subtle head look, and soft cape breeze.
2. **Walk / Run Stride**: Energetic leg/arm swing, vertical stride bob, athletic forward torso lean, and billowing adventurer capelet.
3. **Turning & Direction Changes**: Shortest-angle yaw interpolation (`MOVE_SPEED = 5.8`) with dynamic body banking (`turnBank`) into turns.
4. **Altar / Typing Interaction**: Character automatically orients toward the gate/altar (`+Z`), raises hands in an active typing/invocation posture, and performs an encouraging nod whenever `completedCount` increases.
5. **Mistake Reaction**: Subtle head shake and torso flinch whenever `incorrectCount` increments.
6. **Stage / Gate Completion Celebration**: Joyful jump/bounce and raised-arm cheer wave during `opening` and `completed` modes.

---

## 7. Temple Environment Upgrade Summary

Upgraded [`src/features/three-game/components/Environment.tsx`](../../src/features/three-game/components/Environment.tsx) and [`src/features/three-game/ThreeGameCanvas.tsx`](../../src/features/three-game/ThreeGameCanvas.tsx):
- Sunlit cerulean-to-gold sky dome, morning sun disk, drifting clouds, and horizon fog.
- Flanking turquoise lotus reflecting pools (`#06B6D4`) with shimmering water, CC0 `lotus_lilypad.glb` pads, and sacred pink/gold lotus blooms.
- Multi-tinted golden sandstone causeway flagstones, laterite curbs, and Naga balustrade posts.
- Framed avenue of CC0 `palm_tree_tall.glb` palms, `rock_moss.glb` boulders, `tropical_bush.glb` shrubs, and `tropical_flowers.glb` clusters leading to the 5-tower Angkorian Prasat complex.

---

## 8. Gate and Altar Interaction Improvements

Upgraded [`src/features/three-game/components/AncientStoneGate.tsx`](../../src/features/three-game/components/AncientStoneGate.tsx) and [`src/features/three-game/components/StageChallenges.tsx`](../../src/features/three-game/components/StageChallenges.tsx):
- Flanking `khmer_simha_guardian.glb` statues guarding the Stage 1 Gopura gate.
- `khmer_lotus_altar.glb` pedestals across all 3 stage barriers with rotating ground proximity aura rings, glowing inscription tablets, and floating octahedral rune crystals that pulse on correct Khmer keystrokes and turn emerald upon stage completion.

---

## 9. Camera, Lighting, and Performance Metrics

- **Canvas DPR**: Bounded to `[1, 1.5]` with `powerPreference: 'high-performance'`.
- **Shadow Map**: Single directional sun shadow map (`1024×1024`) with bounded frustum.
- **Total 3D GLB Asset Payload**: **622.5 KB** across 8 `.glb` files (shared via in-memory `gltfCache` so repeated palms, rocks, lily pads, bushes, flowers, Simha statues, and altars reuse geometry/materials).

---

## 10. Automated Test & Build Results

All automated checks pass with zero errors:
- `npm run typecheck`: **PASS**
- `npm run lint`: **PASS**
- `npm run test` (`test:typing`, `test:gamification`, `test:3d`, `test:completion`): **PASS**
- `npm run build`: **PASS**

---

## 11. Preserved Gameplay & Security Safeguards

- All Khmer Unicode cluster segmentation, opposite-hand Shift highlighting, reach-and-return finger guidance, and curriculum pass thresholds (90% / 92%) are 100% preserved.
- All Task 6.1 Firebase security rules (`firestore.rules`), Cloud Functions (`functions/index.ts`), and student progress schemas remain untouched.
