import {
  findKhmerKeyByCode,
  findKhmerKeyByOutput,
  formatPhysicalKeyLabel,
  getKhmerKeyOutput,
  HOME_ROW_KEY_CODES,
  type KeyboardModifier,
  type KhmerKeyboardKey,
  typeableKeyboardKeys,
} from '../data/keyboardMap';
import type {
  CurriculumLevel,
  CurriculumStage,
  CurriculumWorld,
  StagePracticeMode,
} from '../data/lessonCurriculum';
import { normalizeKhmerText } from './khmerText';

export type TypingUnit = {
  stageId?: string;
  value: string;
  key: KhmerKeyboardKey;
  modifier: KeyboardModifier;
  sourceItem: string;
  itemIndex?: number;
  practiceMode?: StagePracticeMode;
  displayLabel?: string;
};

export type UnsupportedCurriculumInput = {
  character: string;
  codePoint: string;
  sourceItem: string;
  itemIndex?: number;
  reason: 'unmapped-unicode-character' | 'unknown-physical-key-code' | 'disabled-physical-key';
};

export type LessonTypingPlan = {
  targetText: string;
  units: TypingUnit[];
  practiceMode?: StagePracticeMode;
  unsupportedInputs?: UnsupportedCurriculumInput[];
  hasUnsupportedInputs?: boolean;
};

export type CurriculumValidationResult = {
  valid: boolean;
  practiceMode: StagePracticeMode;
  unitCount: number;
  unsupportedInputs: UnsupportedCurriculumInput[];
};

const outputOptions = typeableKeyboardKeys
  .flatMap((key) => [
    { value: getKhmerKeyOutput(key), key, modifier: 'base' as const },
    key.shiftKhmer ? { value: key.shiftKhmer, key, modifier: 'shift' as const } : null,
    key.altgrKhmer ? { value: key.altgrKhmer, key, modifier: 'altgr' as const } : null,
  ])
  .filter((item): item is { value: string; key: KhmerKeyboardKey; modifier: KeyboardModifier } =>
    Boolean(item?.value),
  )
  .sort((left, right) => right.value.length - left.value.length);

function formatCodePoint(char: string): string {
  const cp = char.codePointAt(0);
  if (cp === undefined) return 'U+0000';
  return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
}

function getLessonInputTarget(worldId: number, lesson: CurriculumLevel) {
  if (lesson.id === 'boss') return 96;
  if (worldId <= 1) return 54;
  if (worldId <= 3) return 72;
  return 90;
}

/**
 * Splits a physical-key drill item (such as "KeyF", "code:KeyF", or "KeyF KeyJ")
 * into Mode A physical-key TypingUnits without requiring Khmer combining marks to stand alone.
 */
export function splitPhysicalKeyItemIntoUnits(
  item: string,
  itemIndex?: number,
): { units: TypingUnit[]; unsupportedInputs: UnsupportedCurriculumInput[] } {
  const tokens = item
    .trim()
    .split(/\s+/u)
    .filter((t) => t.length > 0);
  const units: TypingUnit[] = [];
  const unsupportedInputs: UnsupportedCurriculumInput[] = [];

  for (const rawToken of tokens) {
    const code = rawToken.startsWith('code:') ? rawToken.slice(5) : rawToken;
    const key = findKhmerKeyByCode(code);
    if (!key) {
      unsupportedInputs.push({
        character: code,
        codePoint: formatCodePoint(code),
        sourceItem: item,
        ...(itemIndex !== undefined ? { itemIndex } : {}),
        reason: 'unknown-physical-key-code',
      });
      continue;
    }
    if (key.disabled || (key.action && key.action !== 'space')) {
      unsupportedInputs.push({
        character: code,
        codePoint: formatCodePoint(code),
        sourceItem: item,
        ...(itemIndex !== undefined ? { itemIndex } : {}),
        reason: 'disabled-physical-key',
      });
      continue;
    }
    const label = formatPhysicalKeyLabel(key);
    units.push({
      value: label,
      displayLabel: label,
      key,
      modifier: 'base',
      sourceItem: item,
      practiceMode: 'physical-key',
      ...(itemIndex !== undefined ? { itemIndex } : {}),
    });
  }

  return { units, unsupportedInputs };
}

/**
 * Splits a Khmer Unicode item into TypingUnits and explicitly records any unmapped characters
 * instead of silently hiding them from validation.
 */
export function splitItemIntoUnitsWithValidation(
  item: string,
  itemIndex?: number,
  options?: { strict?: boolean },
): { units: TypingUnit[]; unsupportedInputs: UnsupportedCurriculumInput[] } {
  if (item.trim().startsWith('code:')) {
    const result = splitPhysicalKeyItemIntoUnits(item, itemIndex);
    if (options?.strict && result.unsupportedInputs.length > 0) {
      const first = result.unsupportedInputs[0];
      throw new Error(
        `Unsupported physical key "${first.character}" (${first.reason}) in item "${item}"`,
      );
    }
    return result;
  }

  const normalized = normalizeKhmerText(item);
  const units: TypingUnit[] = [];
  const unsupportedInputs: UnsupportedCurriculumInput[] = [];
  let index = 0;

  while (index < normalized.length) {
    const remaining = normalized.slice(index);

    if (/^\s/u.test(remaining)) {
      const spaceMatch = findKhmerKeyByOutput(' ');
      if (spaceMatch) {
        units.push({
          value: ' ',
          key: spaceMatch.key,
          modifier: spaceMatch.modifier,
          sourceItem: item,
          practiceMode: 'unicode-output',
          ...(itemIndex !== undefined ? { itemIndex } : {}),
        });
      }
      index += Array.from(remaining[0])[0].length;
      continue;
    }

    const matched = outputOptions.find((option) => remaining.startsWith(option.value));

    if (matched) {
      units.push({
        ...matched,
        sourceItem: item,
        practiceMode: 'unicode-output',
        ...(itemIndex !== undefined ? { itemIndex } : {}),
      });
      index += matched.value.length;
      continue;
    }

    const [character] = Array.from(remaining);
    unsupportedInputs.push({
      character,
      codePoint: formatCodePoint(character),
      sourceItem: item,
      ...(itemIndex !== undefined ? { itemIndex } : {}),
      reason: 'unmapped-unicode-character',
    });
    index += character.length;
  }

  if (options?.strict && unsupportedInputs.length > 0) {
    const first = unsupportedInputs[0];
    throw new Error(
      `Unmapped curriculum character "${first.character}" (${first.codePoint}) in item "${item}"`,
    );
  }

  return { units, unsupportedInputs };
}

export function splitItemIntoUnits(
  item: string,
  itemIndex?: number,
  options?: { strict?: boolean },
): TypingUnit[] {
  return splitItemIntoUnitsWithValidation(item, itemIndex, options).units;
}

export function validateCurriculumItem(
  item: string,
  practiceMode: StagePracticeMode = 'unicode-output',
): CurriculumValidationResult {
  if (practiceMode === 'physical-key') {
    const { units, unsupportedInputs } = splitPhysicalKeyItemIntoUnits(item);
    return {
      valid: units.length > 0 && unsupportedInputs.length === 0,
      practiceMode: 'physical-key',
      unitCount: units.length,
      unsupportedInputs,
    };
  }

  if (practiceMode === 'hand-position') {
    const { units, unsupportedInputs } = splitPhysicalKeyItemIntoUnits(
      item.trim().length > 0 ? item : HOME_ROW_KEY_CODES.join(' '),
    );
    return {
      valid: units.length > 0 && unsupportedInputs.length === 0,
      practiceMode: 'hand-position',
      unitCount: units.length,
      unsupportedInputs,
    };
  }

  const { units, unsupportedInputs } = splitItemIntoUnitsWithValidation(item);
  return {
    valid: units.length > 0 && unsupportedInputs.length === 0,
    practiceMode: 'unicode-output',
    unitCount: units.length,
    unsupportedInputs,
  };
}

export function buildLessonTypingPlan(lesson: CurriculumLevel, worldId: number): LessonTypingPlan {
  const hasPhysicalStages = lesson.stages.some(
    (s) => s.practiceMode === 'physical-key' || s.practiceMode === 'hand-position',
  );
  if (hasPhysicalStages) {
    const units: TypingUnit[] = [];
    const unsupportedInputs: UnsupportedCurriculumInput[] = [];
    for (const stage of lesson.stages) {
      const stagePlan = buildStageTypingPlan(stage);
      units.push(...stagePlan.units.map(unit => ({ ...unit, stageId: stage.id })));
      if (stagePlan.unsupportedInputs) {
        unsupportedInputs.push(...stagePlan.unsupportedInputs);
      }
    }
    return {
      targetText: units.map((unit) => unit.value).join(''),
      units,
      practiceMode: 'physical-key',
      unsupportedInputs,
      hasUnsupportedInputs: unsupportedInputs.length > 0,
    };
  }

  const sourceItems = lesson.stages
    .flatMap((stage) => stage.items)
    .filter((item) => item.trim().length > 0);
  const maxInputs = getLessonInputTarget(worldId, lesson);
  const units: TypingUnit[] = [];
  const unsupportedInputs: UnsupportedCurriculumInput[] = [];
  const items = sourceItems.length > 0 ? sourceItems : lesson.focusKeys;

  for (let itemIndex = 0; itemIndex < items.length && units.length < maxInputs; itemIndex += 1) {
    const splitResult = splitItemIntoUnitsWithValidation(items[itemIndex], itemIndex);
    if (splitResult.unsupportedInputs.length > 0) {
      unsupportedInputs.push(...splitResult.unsupportedInputs);
    }
    const itemUnits = splitResult.units;
    if (itemUnits.length === 0) continue;

    if (units.length > 0 && units.at(-1)?.value !== ' ') {
      const spaceMatch = findKhmerKeyByOutput(' ');
      if (spaceMatch) {
        units.push({
          value: ' ',
          key: spaceMatch.key,
          modifier: spaceMatch.modifier,
          sourceItem: ' ',
          practiceMode: 'unicode-output',
        });
      }
    }

    units.push(...itemUnits);
  }

  if (units.at(-1)?.value === ' ') units.pop();

  return {
    targetText: units.map((unit) => unit.value).join(''),
    units,
    practiceMode: 'unicode-output',
    unsupportedInputs,
    hasUnsupportedInputs: unsupportedInputs.length > 0,
  };
}

/**
 * Builds a Khmer or Physical-Key typing plan for a single curriculum stage.
 * Supports:
 * - Mode A ('physical-key') using `stage.physicalKeyCodes` or physical key codes in `stage.items`
 * - Mode Hand-Position ('hand-position') for untimed home-row placement review
 * - Mode B ('unicode-output') using exact Khmer Unicode sequence order
 */
export function buildStageTypingPlan(
  stage: CurriculumStage,
  fallbackItems: string[] = [],
): LessonTypingPlan {
  const practiceMode: StagePracticeMode = stage.practiceMode ?? 'unicode-output';

  if (practiceMode === 'hand-position') {
    const codes =
      stage.physicalKeyCodes && stage.physicalKeyCodes.length > 0
        ? stage.physicalKeyCodes
        : [...HOME_ROW_KEY_CODES];
    const units: TypingUnit[] = [];
    const unsupportedInputs: UnsupportedCurriculumInput[] = [];
    codes.forEach((code, itemIndex) => {
      const res = splitPhysicalKeyItemIntoUnits(code, itemIndex);
      units.push(
        ...res.units.map((u) => ({
          ...u,
          practiceMode: 'hand-position' as const,
        })),
      );
      unsupportedInputs.push(...res.unsupportedInputs);
    });
    return {
      targetText: units.map((unit) => unit.value).join(''),
      units,
      practiceMode: 'hand-position',
      unsupportedInputs,
      hasUnsupportedInputs: unsupportedInputs.length > 0,
    };
  }

  if (practiceMode === 'physical-key') {
    const rawItems =
      stage.items && stage.items.length > 0
        ? stage.items.filter((item) => item.trim().length > 0)
        : stage.physicalKeyCodes ?? [];
    const units: TypingUnit[] = [];
    const unsupportedInputs: UnsupportedCurriculumInput[] = [];

    for (let itemIndex = 0; itemIndex < rawItems.length; itemIndex += 1) {
      const res = splitPhysicalKeyItemIntoUnits(rawItems[itemIndex], itemIndex);
      if (res.unsupportedInputs.length > 0) {
        unsupportedInputs.push(...res.unsupportedInputs);
      }
      if (res.units.length === 0) continue;
      units.push(...res.units);
    }

    return {
      targetText: units.map((unit) => unit.value).join(''),
      units,
      practiceMode: 'physical-key',
      unsupportedInputs,
      hasUnsupportedInputs: unsupportedInputs.length > 0,
    };
  }

  const rawItems = stage.items.filter((item) => item.trim().length > 0);
  const items =
    rawItems.length > 0 ? rawItems : fallbackItems.filter((item) => item.trim().length > 0);
  const units: TypingUnit[] = [];
  const unsupportedInputs: UnsupportedCurriculumInput[] = [];

  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    const res = splitItemIntoUnitsWithValidation(items[itemIndex], itemIndex);
    if (res.unsupportedInputs.length > 0) {
      unsupportedInputs.push(...res.unsupportedInputs);
    }
    if (res.units.length === 0) continue;
    units.push(...res.units);
  }

  return {
    targetText: units.map((unit) => unit.value).join(''),
    units,
    practiceMode: 'unicode-output',
    unsupportedInputs,
    hasUnsupportedInputs: unsupportedInputs.length > 0,
  };
}

export function validateStageTypingPlan(stage: CurriculumStage): CurriculumValidationResult {
  const plan = buildStageTypingPlan(stage);
  const unsupportedInputs = plan.unsupportedInputs ?? [];
  return {
    valid: plan.units.length > 0 && unsupportedInputs.length === 0,
    practiceMode: plan.practiceMode ?? 'unicode-output',
    unitCount: plan.units.length,
    unsupportedInputs,
  };
}

export function validateLessonCurriculumMappings(
  lesson: CurriculumLevel,
): CurriculumValidationResult {
  const stageResults = lesson.stages.map((stage) => validateStageTypingPlan(stage));
  const unsupportedInputs = stageResults.flatMap((r) => r.unsupportedInputs);
  const unitCount = stageResults.reduce((sum, r) => sum + r.unitCount, 0);
  const allValid = stageResults.every((r) => r.valid);

  return {
    valid: allValid && unitCount > 0 && unsupportedInputs.length === 0,
    practiceMode: lesson.stages[0]?.practiceMode ?? 'unicode-output',
    unitCount,
    unsupportedInputs,
  };
}

export function auditAllCurriculumMappings(worlds: CurriculumWorld[]): {
  totalLessons: number;
  fullyMappedLessonCount: number;
  lessonsWithUnsupportedInputs: Array<{
    worldId: number;
    lessonId: CurriculumLevel['id'];
    labelEn: string;
    unsupportedInputs: UnsupportedCurriculumInput[];
  }>;
} {
  let totalLessons = 0;
  let fullyMappedLessonCount = 0;
  const lessonsWithUnsupportedInputs: Array<{
    worldId: number;
    lessonId: CurriculumLevel['id'];
    labelEn: string;
    unsupportedInputs: UnsupportedCurriculumInput[];
  }> = [];

  for (const world of worlds) {
    for (const lesson of world.levels) {
      totalLessons += 1;
      const result = validateLessonCurriculumMappings(lesson);
      if (result.valid) {
        fullyMappedLessonCount += 1;
      } else {
        lessonsWithUnsupportedInputs.push({
          worldId: world.id,
          lessonId: lesson.id,
          labelEn: lesson.labelEn,
          unsupportedInputs: result.unsupportedInputs,
        });
      }
    }
  }

  return {
    totalLessons,
    fullyMappedLessonCount,
    lessonsWithUnsupportedInputs,
  };
}

export function getTypedText(units: TypingUnit[], completedInputCount: number) {
  return units
    .slice(0, completedInputCount)
    .map((unit) => unit.value)
    .join('');
}

export function getCurrentTargetText(units: TypingUnit[], completedInputCount: number) {
  return units[completedInputCount]?.value ?? '';
}
