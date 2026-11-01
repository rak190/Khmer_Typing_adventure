import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true },
});

async function main() {
  const { splitItemIntoUnitsWithValidation, splitPhysicalKeyItemIntoUnits } = await server.ssrLoadModule('/src/lib/lessonTypingPlan.ts');

  function validateItems(levelId, stageId, items, isPhysical = false) {
    for (const item of items) {
      if (isPhysical || item.startsWith('Key') || item.startsWith('Semicolon') || item.startsWith('Comma') || item.startsWith('Period') || item.startsWith('Slash') || item.startsWith('Bracket') || item.startsWith('Minus') || item.startsWith('Equal') || item.startsWith('Backquote')) {
        const res = splitPhysicalKeyItemIntoUnits(item);
        if (res.unsupportedInputs.length > 0) {
          throw new Error(`[${levelId} / ${stageId}] Invalid physical item "${item}": ${JSON.stringify(res.unsupportedInputs)}`);
        }
      } else {
        const res = splitItemIntoUnitsWithValidation(item);
        if (res.unsupportedInputs.length > 0) {
          throw new Error(`[${levelId} / ${stageId}] Invalid unicode item "${item}": ${JSON.stringify(res.unsupportedInputs)}`);
        }
      }
    }
  }

  // Import curriculum definition builder
  const { buildAllCurriculumWorlds } = await import('./curriculumV2Definition.mjs');
  const worlds = buildAllCurriculumWorlds();

  console.log(`Auditing and validating all ${worlds.length} worlds...`);
  let totalLevels = 0;
  let totalStages = 0;
  let totalUnits = 0;

  for (const world of worlds) {
    console.log(`\nValidating World ${world.id}: ${world.title} (${world.titleKh})...`);
    for (const level of world.levels) {
      totalLevels++;
      totalStages += level.stages.length;
      for (const stage of level.stages) {
        validateItems(`${world.id}:${level.id}`, stage.id, stage.items, stage.practiceMode === 'physical-key');
        for (const it of stage.items) {
          if (stage.practiceMode === 'physical-key') {
            totalUnits += splitPhysicalKeyItemIntoUnits(it).units.length;
          } else {
            totalUnits += splitItemIntoUnitsWithValidation(it).units.length;
          }
        }
      }
    }
    console.log(`✓ World ${world.id} passed with ${world.levels.length} levels.`);
  }

  console.log(`\n✓ SUCCESS: All ${worlds.length} worlds, ${totalLevels} levels, ${totalStages} stages, ${totalUnits} typing units validated with 0 errors!`);

  // Generate the new src/data/lessonCurriculum.ts
  const outputCode = `// Authoritative Khmer Touch-Typing Curriculum V2
// Structured around progressive touch-typing keyboard skills, NiDA layout pedagogy, and Khmer Unicode rules.
// Version: khmer-touch-typing-v2

import type { AdventureNodeId } from './adventureWorlds';

export const CURRICULUM_VERSION_V2 = 'khmer-touch-typing-v2';
export const CURRICULUM_VERSION_V1 = 'khmer-first-5.5-v1';

export type LessonStageKind = 'warmup' | 'pattern' | 'word' | 'phrase' | 'sentence' | 'boss';

export type StagePracticeMode = 'physical-key' | 'unicode-output' | 'hand-position';

export type CurriculumStage = {
  id: string;
  kind: LessonStageKind;
  titleKh: string;
  titleEn: string;
  mission: string;
  skill: string;
  mechanic: string;
  targetCount: number;
  accuracyGoal: number;
  speedTargetCpm?: number;
  items: string[];
  hint?: string;
  practiceMode?: StagePracticeMode;
  physicalKeyCodes?: string[];
  untimed?: boolean;
  postureInstructionsKh?: string[];
  introducedKeyCodes?: string[];
  recommendedHand?: 'left' | 'right' | 'both';
  recommendedFingers?: ('pinky' | 'ring' | 'middle' | 'index' | 'thumb')[];
  homeKeyAnchors?: string[];
  unicodeOutputExplained?: string;
};

export type CurriculumLevel = {
  id: AdventureNodeId;
  labelKh: string;
  labelEn: string;
  category: string;
  skillCategory?: string;
  objective: string;
  focusKeys: string[];
  introducedKeyCodes?: string[];
  previouslyLearnedKeyCodes?: string[];
  recommendedHands?: ('left' | 'right' | 'both')[];
  recommendedFingers?: ('pinky' | 'ring' | 'middle' | 'index' | 'thumb')[];
  homeKeyAnchors?: string[];
  unicodeRule: string;
  unicodeOutputExplained?: string;
  successCriteria: string;
  minimumAccuracy?: number;
  speedTargetCpm?: number;
  prerequisites?: string[];
  masteryEvidence?: string;
  curriculumVersion?: string;
  stages: CurriculumStage[];
};

export type CurriculumWorld = {
  id: number;
  title: string;
  titleKh: string;
  subtitle: string;
  theme: string;
  mainLessonKh: string;
  mainLessonEn: string;
  skillFocus: string;
  unicodeFocus: string;
  levels: CurriculumLevel[];
};

export const khmerTypingPrinciples = [
  'Touch-typing sequence: key location -> hand -> recommended finger -> reach & return -> Unicode output -> modifiers -> syllables -> words -> sentences.',
  'Khmer Unicode must be typed in canonical sequence: base consonant, subscript/coeng (KeyJ + consonant), consonant shifter, dependent vowel, diacritic.',
  'Dependent vowels are typed AFTER the base consonant, regardless of whether the visual glyph appears before, above, below, or around the consonant.',
  'Opposite-hand Shift technique: use Right Shift for left-hand keys, and Left Shift for right-hand keys.',
  'Accuracy is more important than speed for beginners; CPM is the authoritative speed metric for Khmer typing.',
];

export const lessonCurriculum: CurriculumWorld[] = ${JSON.stringify(worlds, null, 2)};

export function getCurriculumWorld(worldId: number) {
  return lessonCurriculum.find((item) => item.id === worldId);
}

export function getCurriculumLevel(worldId: number, levelId: AdventureNodeId) {
  return getCurriculumWorld(worldId)?.levels.find((item) => item.id === levelId);
}

export function getDefaultCurriculumLevel() {
  return lessonCurriculum[0].levels[0];
}

export function flattenLevelItems(level: CurriculumLevel) {
  return level.stages.flatMap((stage) => stage.items);
}
`;

  writeFileSync('src/data/lessonCurriculum.ts', outputCode, 'utf8');
  console.log('✓ Successfully wrote revised curriculum to src/data/lessonCurriculum.ts!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(async () => {
  await server.close();
});
