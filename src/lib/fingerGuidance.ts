import type { KhmerKeyboardKey } from '../data/keyboardMap';

export type FingerName = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
export type HandSide = 'left' | 'right';
export type FingerId = `${HandSide}-${FingerName}`;

export type FingerHighlight = {
  hand: HandSide;
  finger: FingerName;
  role: 'target' | 'shift';
};

export type FingerGuidance = {
  activeHand: HandSide;
  activeFinger: FingerId;
  label: string;
  highlights: FingerHighlight[];
  shiftRequired: boolean;
};

const fingerLabels: Record<FingerName, string> = {
  pinky: 'pinky',
  ring: 'ring',
  middle: 'middle',
  index: 'index',
  thumb: 'thumb',
};

function getTargetHand(key: KhmerKeyboardKey): HandSide {
  return key.hand === 'left' ? 'left' : 'right';
}

function getShiftHand(targetHand: HandSide): HandSide {
  return targetHand === 'left' ? 'right' : 'left';
}

export function getFingerGuidance(key: KhmerKeyboardKey, shiftRequired: boolean): FingerGuidance {
  if (key.action === 'space' || key.hand === 'thumb') {
    return {
      activeHand: 'right',
      activeFinger: 'right-thumb',
      label: 'Use thumb',
      highlights: [{ hand: 'right', finger: 'thumb', role: 'target' }],
      shiftRequired: false,
    };
  }

  const targetHand = getTargetHand(key);
  const targetFinger = key.finger;
  const activeFinger = `${targetHand}-${targetFinger}` as FingerId;

  if (!shiftRequired) {
    return {
      activeHand: targetHand,
      activeFinger,
      label: `Use ${targetHand} ${fingerLabels[targetFinger]} finger`,
      highlights: [{ hand: targetHand, finger: targetFinger, role: 'target' }],
      shiftRequired,
    };
  }

  const shiftHand = getShiftHand(targetHand);

  return {
    activeHand: targetHand,
    activeFinger,
    label: `Use ${shiftHand} pinky + Shift`,
    highlights: [
      { hand: shiftHand, finger: 'pinky', role: 'shift' },
      { hand: targetHand, finger: targetFinger, role: 'target' },
    ],
    shiftRequired,
  };
}

/**
 * Returns the exact opposite-hand Shift key code ('ShiftLeft' or 'ShiftRight')
 * for a key that requires Shift, or null if Shift is not required.
 */
export function getRequiredShiftKeyCode(
  key: KhmerKeyboardKey,
  shiftRequired: boolean,
): 'ShiftLeft' | 'ShiftRight' | null {
  if (!shiftRequired) return null;
  const guidance = getFingerGuidance(key, true);
  const shiftHighlight = guidance.highlights.find((h) => h.role === 'shift');
  if (!shiftHighlight) return null;
  return shiftHighlight.hand === 'left' ? 'ShiftLeft' : 'ShiftRight';
}
