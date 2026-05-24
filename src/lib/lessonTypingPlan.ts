import {
  findKhmerKeyByOutput,
  getKhmerKeyOutput,
  type KeyboardModifier,
  type KhmerKeyboardKey,
  typeableKeyboardKeys,
} from '../data/keyboardMap';
import type { CurriculumLevel } from '../data/lessonCurriculum';
import { normalizeKhmerText } from './khmerText';

export type TypingUnit = {
  value: string;
  key: KhmerKeyboardKey;
  modifier: KeyboardModifier;
  sourceItem: string;
};

export type LessonTypingPlan = {
  targetText: string;
  units: TypingUnit[];
};

const outputOptions = typeableKeyboardKeys
  .flatMap((key) => ([
    { value: getKhmerKeyOutput(key), key, modifier: 'base' as const },
    key.shiftKhmer ? { value: key.shiftKhmer, key, modifier: 'shift' as const } : null,
    key.altgrKhmer ? { value: key.altgrKhmer, key, modifier: 'altgr' as const } : null,
  ]))
  .filter((item): item is { value: string; key: KhmerKeyboardKey; modifier: KeyboardModifier } => Boolean(item?.value))
  .sort((left, right) => right.value.length - left.value.length);

function getLessonInputTarget(worldId: number, lesson: CurriculumLevel) {
  if (lesson.id === 'boss') return 96;
  if (worldId <= 1) return 54;
  if (worldId <= 3) return 72;
  return 90;
}

function splitItemIntoUnits(item: string): TypingUnit[] {
  const normalized = normalizeKhmerText(item);
  const units: TypingUnit[] = [];
  let index = 0;

  while (index < normalized.length) {
    const remaining = normalized.slice(index);

    if (/^\s/u.test(remaining)) {
      const spaceMatch = findKhmerKeyByOutput(' ');
      if (spaceMatch) units.push({ value: ' ', key: spaceMatch.key, modifier: spaceMatch.modifier, sourceItem: item });
      index += Array.from(remaining[0])[0].length;
      continue;
    }

    const matched = outputOptions.find((option) => remaining.startsWith(option.value));

    if (matched) {
      units.push({ ...matched, sourceItem: item });
      index += matched.value.length;
      continue;
    }

    const [character] = Array.from(remaining);
    index += character.length;
  }

  return units;
}

export function buildLessonTypingPlan(lesson: CurriculumLevel, worldId: number): LessonTypingPlan {
  const sourceItems = lesson.stages.flatMap((stage) => stage.items).filter((item) => item.trim().length > 0);
  const maxInputs = getLessonInputTarget(worldId, lesson);
  const units: TypingUnit[] = [];
  const items = sourceItems.length > 0 ? sourceItems : lesson.focusKeys;

  for (let itemIndex = 0; itemIndex < items.length && units.length < maxInputs; itemIndex += 1) {
    const itemUnits = splitItemIntoUnits(items[itemIndex]);
    if (itemUnits.length === 0) continue;

    if (units.length > 0 && units.at(-1)?.value !== ' ') {
      const spaceMatch = findKhmerKeyByOutput(' ');
      if (spaceMatch) units.push({ value: ' ', key: spaceMatch.key, modifier: spaceMatch.modifier, sourceItem: ' ' });
    }

    units.push(...itemUnits);
  }

  if (units.at(-1)?.value === ' ') units.pop();

  return {
    targetText: units.map((unit) => unit.value).join(''),
    units,
  };
}

export function getTypedText(units: TypingUnit[], completedInputCount: number) {
  return units.slice(0, completedInputCount).map((unit) => unit.value).join('');
}

export function getCurrentTargetText(units: TypingUnit[], completedInputCount: number) {
  return units[completedInputCount]?.value ?? '';
}
