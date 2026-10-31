import type { TypingUnit } from './lessonTypingPlan';
import { isStandaloneCombiningMarkOutput } from '../data/keyboardMap';

/**
 * A typing target's physical key code is used for validation; these strings are
 * instructional only. Never use formatted labels as an input validation source.
 */
export function getKhmerTypingUnitPresentation(unit: TypingUnit): {
  khmer: string;
  keyLabel: string;
  combining: boolean;
} {
  const physical = unit.practiceMode === 'physical-key' || unit.practiceMode === 'hand-position';
  const value = physical ? unit.key.khmer : unit.value;
  const combining = isStandaloneCombiningMarkOutput(value);
  return {
    khmer: value === ' ' ? 'ចន្លោះ' : combining ? `◌${value}` : value,
    keyLabel: unit.key.action === 'space' ? 'Space' : unit.key.latin.toUpperCase(),
    combining,
  };
}

export function getKhmerTypingSequencePresentation(units: TypingUnit[]): string {
  return units.map((unit) => getKhmerTypingUnitPresentation(unit).khmer).join(' ');
}
