import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true },
});

async function main() {
  const { splitItemIntoUnitsWithValidation, splitPhysicalKeyItemIntoUnits } = await server.ssrLoadModule('/src/lib/lessonTypingPlan.ts');
  const { getWorld1 } = await import('./curriculum_w1.mjs');
  const world1 = getWorld1();

  console.log(`Starting Curriculum Prerequisite Audit for World 1 (${world1.titleKh} / ${world1.title})...\n`);

  const cumulativeKeys = new Set();
  const violations = [];

  for (const level of world1.levels) {
    const levelIdStr = `World 1 : Level ${level.id} (${level.labelKh})`;
    // Add newly introduced keys from level definition
    if (Array.isArray(level.introducedKeyCodes)) {
      for (const code of level.introducedKeyCodes) {
        cumulativeKeys.add(code);
      }
    }

    for (const stage of level.stages) {
      const stageStr = `Stage ${stage.id} (${stage.titleKh} [${stage.practiceMode || 'unicode-output'}])`;

      for (const item of stage.items) {
        if (stage.practiceMode === 'physical-key') {
          const res = splitPhysicalKeyItemIntoUnits(item);
          if (res.unsupportedInputs.length > 0) {
            violations.push({
              level: levelIdStr,
              stage: stageStr,
              item,
              reason: `Unsupported physical input: ${JSON.stringify(res.unsupportedInputs)}`,
            });
          }
          for (const u of res.units) {
            if (!cumulativeKeys.has(u.key.code)) {
              violations.push({
                level: levelIdStr,
                stage: stageStr,
                item,
                reason: `Key "${u.key.code}" (${u.value}) used before formal introduction. Current taught keys: [${Array.from(cumulativeKeys).join(', ')}]`,
              });
            }
          }
        } else {
          // unicode-output mode
          const res = splitItemIntoUnitsWithValidation(item);
          if (res.unsupportedInputs.length > 0) {
            violations.push({
              level: levelIdStr,
              stage: stageStr,
              item,
              reason: `Unsupported unicode input: ${JSON.stringify(res.unsupportedInputs)}`,
            });
          }

          for (const u of res.units) {
            // Check modifier: World 1 is unshifted base keyboard
            if (u.modifier !== 'base') {
              violations.push({
                level: levelIdStr,
                stage: stageStr,
                item,
                reason: `Modifier "${u.modifier}" on key "${u.key.code}" (${u.value}) is not allowed in World 1 (Shift/AltGr are taught in Worlds 2-3).`,
              });
            }

            // Check coeng: KeyJ is coeng in Khmer layout. Coeng is introduced in World 2
            if (u.key.code === 'KeyJ') {
              violations.push({
                level: levelIdStr,
                stage: stageStr,
                item,
                reason: `Coeng (KeyJ subscript) is not allowed in World 1 (coeng consonants are introduced in World 2).`,
              });
            }

            // Check if physical key was introduced
            if (!cumulativeKeys.has(u.key.code)) {
              violations.push({
                level: levelIdStr,
                stage: stageStr,
                item,
                reason: `Character "${u.value}" requires untaught key "${u.key.code}". Current taught keys: [${Array.from(cumulativeKeys).join(', ')}]`,
              });
            }
          }
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(`❌ FOUND ${violations.length} CURRICULUM PREREQUISITE VIOLATIONS IN WORLD 1:\n`);
    violations.forEach((v, idx) => {
      console.error(`${idx + 1}. [${v.level}] [${v.stage}]`);
      console.error(`   Item: "${v.item}"`);
      console.error(`   Violation: ${v.reason}\n`);
    });
    process.exitCode = 1;
  } else {
    console.log(`✅ SUCCESS: All ${world1.levels.length} levels in World 1 passed prerequisite audit with 0 violations!`);
    console.log(`   Total cumulative keys taught in World 1: ${cumulativeKeys.size}`);
  }

  await server.close();
}

main().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
