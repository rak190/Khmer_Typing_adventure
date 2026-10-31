import {
  findKhmerKeyByCode,
  getFingerHomeKeyCode,
  hasTactileBump,
  isHomeRowRestKeyCode,
  type KhmerKeyboardKey,
} from '../data/keyboardMap';

export type FingerName = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
export type HandSide = 'left' | 'right';
export type FingerId = `${HandSide}-${FingerName}`;

export type FingerHighlight = {
  hand: HandSide;
  finger: FingerName;
  role: 'target' | 'shift' | 'altgr' | 'home';
};

export type ReachDirection = 'home' | 'inner-home' | 'outer-home' | 'up' | 'down' | 'space';

export type FingerGuidance = {
  activeHand: HandSide;
  activeFinger: FingerId;
  label: string;
  labelKh: string;
  bilingualLabel: string;
  handLabelKh: string;
  fingerLabelKh: string;
  homeKeyCode: string;
  homeKeyLatin: string;
  isOnHomePosition: boolean;
  reachDirection: ReachDirection;
  reachInstructionKh: string;
  highlights: FingerHighlight[];
  shiftRequired: boolean;
  altgrRequired: boolean;
  requiredShiftCode: 'ShiftLeft' | 'ShiftRight' | null;
  requiredModifierCode: 'ShiftLeft' | 'ShiftRight' | 'AltRight' | null;
};

const fingerLabels: Record<FingerName, string> = {
  pinky: 'pinky',
  ring: 'ring',
  middle: 'middle',
  index: 'index',
  thumb: 'thumb',
};

const fingerLabelsKh: Record<FingerName, string> = {
  pinky: 'ម្រាមដៃកូន',
  ring: 'ម្រាមដៃនាង',
  middle: 'ម្រាមដៃកណ្តាល',
  index: 'ម្រាមដៃចង្អុល',
  thumb: 'មេដៃ',
};

const handLabelsKh: Record<HandSide, string> = {
  left: 'ខាងឆ្វេង',
  right: 'ខាងស្តាំ',
};

function getTargetHand(key: KhmerKeyboardKey): HandSide {
  return key.hand === 'left' ? 'left' : 'right';
}

function getShiftHand(targetHand: HandSide): HandSide {
  return targetHand === 'left' ? 'right' : 'left';
}

function computeReachDirection(key: KhmerKeyboardKey, homeKeyCode: string): ReachDirection {
  if (key.action === 'space' || key.hand === 'thumb') return 'space';
  if (key.code === homeKeyCode) return 'home';
  if (key.row === 'home') {
    if (key.code === 'KeyG' || key.code === 'KeyH') return 'inner-home';
    return 'outer-home';
  }
  if (key.row === 'top') return 'up';
  return 'down';
}

function buildReachInstructionKh(
  key: KhmerKeyboardKey,
  homeKeyLatin: string,
  reachDirection: ReachDirection,
  fingerKh: string,
  handKh: string,
): string {
  if (reachDirection === 'space') {
    return 'ដាក់មេដៃលើគ្រាប់ចុច Spacebar';
  }
  const targetLatin = key.latin.toUpperCase();
  if (reachDirection === 'home') {
    const bumpNote = hasTactileBump(key.code) ? ' (មានគន្លឹះសម្គាល់លើគ្រាប់ចុច)' : '';
    return `ដាក់${fingerKh}${handKh}លើគ្រាប់ចុចទីតាំងដើម ${homeKeyLatin}${bumpNote}`;
  }
  if (reachDirection === 'inner-home') {
    return `ឈោង${fingerKh}${handKh}ទៅកណ្តាលពី ${homeKeyLatin} ទៅ ${targetLatin} រួចត្រឡប់មកទីតាំងដើម ${homeKeyLatin} វិញ`;
  }
  if (reachDirection === 'outer-home') {
    return `ឈោង${fingerKh}${handKh}ទៅចំហៀងពី ${homeKeyLatin} ទៅ ${targetLatin} រួចត្រឡប់មកទីតាំងដើម ${homeKeyLatin} វិញ`;
  }
  if (reachDirection === 'up') {
    return `ឈោង${fingerKh}${handKh}ឡើងលើពី ${homeKeyLatin} ទៅ ${targetLatin} រួចត្រឡប់មកទីតាំងដើម ${homeKeyLatin} វិញ`;
  }
  return `ឈោង${fingerKh}${handKh}ចុះក្រោមពី ${homeKeyLatin} ទៅ ${targetLatin} រួចត្រឡប់មកទីតាំងដើម ${homeKeyLatin} វិញ`;
}

export function getFingerGuidance(
  key: KhmerKeyboardKey,
  shiftRequired: boolean,
  altgrRequired = false,
): FingerGuidance {
  if (key.action === 'space' || key.hand === 'thumb') {
    const labelKh = 'ប្រើមេដៃចុច Spacebar';
    return {
      activeHand: 'right',
      activeFinger: 'right-thumb',
      label: 'Use thumb',
      labelKh,
      bilingualLabel: `${labelKh} (Use thumb)`,
      handLabelKh: 'មេដៃ',
      fingerLabelKh: fingerLabelsKh.thumb,
      homeKeyCode: 'Space',
      homeKeyLatin: 'Space',
      isOnHomePosition: true,
      reachDirection: 'space',
      reachInstructionKh: 'ដាក់មេដៃលើគ្រាប់ចុច Spacebar',
      highlights: [{ hand: 'right', finger: 'thumb', role: 'target' }],
      shiftRequired: false,
      altgrRequired: false,
      requiredShiftCode: null,
      requiredModifierCode: null,
    };
  }

  const targetHand = getTargetHand(key);
  const targetFinger = key.finger;
  const activeFinger = `${targetHand}-${targetFinger}` as FingerId;
  const fingerKh = fingerLabelsKh[targetFinger];
  const handKh = handLabelsKh[targetHand];
  const homeKeyCode = getFingerHomeKeyCode(targetHand, targetFinger);
  const homeKey = findKhmerKeyByCode(homeKeyCode);
  const homeKeyLatin = homeKey ? homeKey.latin.toUpperCase() : homeKeyCode.replace('Key', '');
  const isOnHomePosition = isHomeRowRestKeyCode(key.code) && key.code === homeKeyCode;
  const reachDirection = computeReachDirection(key, homeKeyCode);
  const reachInstructionKh = buildReachInstructionKh(
    key,
    homeKeyLatin,
    reachDirection,
    fingerKh,
    handKh,
  );

  if (altgrRequired) {
    const label = `Use right AltGr + ${targetHand} ${fingerLabels[targetFinger]} finger`;
    const labelKh = `ចុច AltGr ខាងស្តាំ + ${fingerKh}${handKh}`;
    return {
      activeHand: targetHand,
      activeFinger,
      label,
      labelKh,
      bilingualLabel: `${labelKh} (${label})`,
      handLabelKh: `ដៃ${handKh}`,
      fingerLabelKh: fingerKh,
      homeKeyCode,
      homeKeyLatin,
      isOnHomePosition,
      reachDirection,
      reachInstructionKh,
      highlights: [
        { hand: 'right', finger: 'thumb', role: 'altgr' },
        { hand: targetHand, finger: targetFinger, role: 'target' },
      ],
      shiftRequired: false,
      altgrRequired: true,
      requiredShiftCode: null,
      requiredModifierCode: 'AltRight',
    };
  }

  if (!shiftRequired) {
    const label = `Use ${targetHand} ${fingerLabels[targetFinger]} finger`;
    const labelKh = `ប្រើ${fingerKh}${handKh}`;
    return {
      activeHand: targetHand,
      activeFinger,
      label,
      labelKh,
      bilingualLabel: `${labelKh} (${label})`,
      handLabelKh: `ដៃ${handKh}`,
      fingerLabelKh: fingerKh,
      homeKeyCode,
      homeKeyLatin,
      isOnHomePosition,
      reachDirection,
      reachInstructionKh,
      highlights: [{ hand: targetHand, finger: targetFinger, role: 'target' }],
      shiftRequired,
      altgrRequired: false,
      requiredShiftCode: null,
      requiredModifierCode: null,
    };
  }

  const shiftHand = getShiftHand(targetHand);
  const shiftHandKh = handLabelsKh[shiftHand];
  const requiredShiftCode = shiftHand === 'left' ? 'ShiftLeft' : 'ShiftRight';
  const label = `Use ${shiftHand} pinky + Shift`;
  const labelKh = `ចុច Shift ${shiftHandKh} (កូនដៃ) + ${fingerKh}${handKh}`;

  return {
    activeHand: targetHand,
    activeFinger,
    label,
    labelKh,
    bilingualLabel: `${labelKh} (${label})`,
    handLabelKh: `ដៃ${handKh}`,
    fingerLabelKh: fingerKh,
    homeKeyCode,
    homeKeyLatin,
    isOnHomePosition,
    reachDirection,
    reachInstructionKh,
    highlights: [
      { hand: shiftHand, finger: 'pinky', role: 'shift' },
      { hand: targetHand, finger: targetFinger, role: 'target' },
    ],
    shiftRequired,
    altgrRequired: false,
    requiredShiftCode,
    requiredModifierCode: requiredShiftCode,
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
  return guidance.requiredShiftCode;
}

/**
 * Returns the AltGr modifier key code ('AltRight') when AltGr is required, or null otherwise.
 */
export function getRequiredAltGrKeyCode(altgrRequired: boolean): 'AltRight' | null {
  return altgrRequired ? 'AltRight' : null;
}
