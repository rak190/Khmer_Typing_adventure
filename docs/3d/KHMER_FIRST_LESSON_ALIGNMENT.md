# Khmer-first curriculum and 2D/3D teaching alignment

## Project's core educational identity

Khmer Typing Adventure is a Cambodian-themed typing game where **Khmer Unicode typing skill** is the end goal, **keyboard location + correct finger guidance** are the method, and **gate/path unlocking, 2D lessons and 3D play** are the motivation. Physical key labels are supporting cues, not the main reading exercise.

The existing 2D game establishes the canonical presentation: large Khmer glyphs on stone keyboard keys, smaller physical key position labels, differentiated hand zones, live target, key feedback, and left/right illustrated hands with finger markers. The 3D mode may use a darker overlay for contrast, but should follow the same instructional hierarchy and source data.

## Corrections introduced in this branch

1. A shared, display-only formatter pairs every physical key with its actual mapped Khmer output. Combining-only characters (e.g. KeyJ's coeng `្`, KeyA's dependent vowel `ា`) use a dotted-circle display (`◌្`, `◌ា`) to explain that they are not independent letters.
2. The 2D foundation exercise now shows large Khmer output first and smaller Latin physical labels, instead of printing a continuous string of Latin letters.
3. The 3D foundation exercise likewise shows separate Khmer-first key tiles with physical labels, while preserving the existing physical keypress validation, fingerprint guidance, accuracy and reward logic.
4. The 3D mode now reuses the repository's established `left-hand-typing.png` and `right-hand-typing.png` artwork in its finger guide, instead of relying only on text boxes.
5. The foundation's first Unicode mini-game uses useful Khmer words `កង`, `សង`, `ដង`, `ដក`, `កក`, `សក`, built from previously introduced physical keys, in place of arbitrary consonant pairs.

## Curriculum progression to implement next

The current `touchTypingFoundationModules` enumerates ten conceptual modules but only **one five-stage playable foundation lesson** exists. Do **not** describe all ten modules as finished. Expand incrementally:

| Phase | Skills | Khmer learning output | Practice |
| --- | --- | --- | --- |
| 1 — Home anchors | A S D F / J K L ;, F/J bumps, fingers and thumbs | Display actual Khmer on each key; dotted circle for isolated combining marks | Physical key drills with hand images |
| 2 — Left / right home row | Finger-isolated repetition and alternation | First simple consonants: ថ, ស, ដ, ក, ល; teach A/J/; as Unicode components | Khmer-first target tiles, physical key validation |
| 3 — Index reaches | F/G/R/T/V/B and J/H/U/Y/N/M in small groups | Meaningful short Khmer items from unlocked keys | Reach-and-return guidance; finger home position |
| 4 — Upper / lower rows | Progressively cover all finger zones | Introduce unfamiliar Khmer consonants only when key position is learned | Simple Khmer syllable/word practice |
| 5 — Two-hand modifiers | Opposite-hand Shift, verified AltGr layout | Shifted Khmer consonants and vowels | Appropriate modifier and target finger indicators |
| 6 — Unicode combining | Coeng + consonant, dependent vowels, diacritics | Valid rendered syllables, not invalid standalone word targets | Underlying keystroke sequence visible in secondary hint |
| 7 — Fluent words | Familiar keys and meaningful Khmer vocabulary | Common words and phrases | Accuracy-first then CPM |
| 8 — Sentences and bosses | Mixed keyboard mastery | Full Khmer Unicode phrases and sentences | Existing world challenges |

### Pedagogical constraints
- Physical-key lessons compare `KeyboardEvent.code` and cannot assert which real finger a student used.
- Khmer-output lessons must validate correct Khmer Unicode input using the existing typing plan, normalization, coeng/Shift/AltGr behavior.
- A `◌` is only a **visual cue** for isolated Unicode components; it is not typed or part of the accepted value.
- Avoid inventing Khmer words or presenting gibberish as vocabulary. For newly introduced letters not yet supporting meaningful words, use labeled **letter/syllable practice** rather than calling clusters words.
- Never turn cursor hints into the learning target. The target is Khmer; the hints are physical key/finger guidance.
- Do not change existing world/lesson IDs or stored student progress; persistence remains outside this task.
- Validate advanced curriculum mappings; unresolved NiDA variants and mixed ASCII material remain documented in `KEYBOARD_FOUNDATIONS_CURRICULUM.md`.

## Verification

`scripts/typingCoreTests.mjs` includes formatter assertions. Run `npm run check`, `npm run build`, then browser check both `/lesson?foundation=1` and `/three-game?foundation=1`. Verify visible Khmer first, physical position and opposite finger prompts, no regression to movement/typing, and no Firebase writes. These commands have **not** been run within the connected GitHub edit environment; actual results must be confirmed locally or in CI.

## Design reference
SBBIC Khmer Unicode Typing Trainer: https://sbbic.org/2010/05/27/khmer-unicode-typing-trainer-for-windows

Use it as a teaching-method reference only, not as a source of copied proprietary assets.
