export type KhmerKey = {
  code: string;
  latin: string;
  khmer: string;
  shiftKhmer?: string;
  hand: 'left' | 'right' | 'thumb';
  finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
  row: 'top' | 'home' | 'bottom' | 'space';
};

export type KhmerKeyboardKey = KhmerKey & {
  altgrKhmer?: string;
  action?: 'backspace' | 'enter' | 'space' | 'shift' | 'altgr' | 'control' | 'meta' | 'menu' | 'tab' | 'caps';
  disabled?: boolean;
  wide?: boolean;
};

export type KeyboardModifier = 'base' | 'shift' | 'altgr';

export const khmerKeyboardRows: KhmerKeyboardKey[][] = [
  [
    { code: 'Backquote', latin: '`', khmer: '«', shiftKhmer: '»', altgrKhmer: '\u200d', hand: 'left', finger: 'pinky', row: 'top' },
    { code: 'Digit1', latin: '1', khmer: '១', shiftKhmer: '!', hand: 'left', finger: 'pinky', row: 'top' },
    { code: 'Digit2', latin: '2', khmer: '២', shiftKhmer: '@', hand: 'left', finger: 'ring', row: 'top' },
    { code: 'Digit3', latin: '3', khmer: '៣', shiftKhmer: '"', hand: 'left', finger: 'middle', row: 'top' },
    { code: 'Digit4', latin: '4', khmer: '៤', shiftKhmer: '$', hand: 'left', finger: 'index', row: 'top' },
    { code: 'Digit5', latin: '5', khmer: '៥', shiftKhmer: '%', hand: 'left', finger: 'index', row: 'top' },
    { code: 'Digit6', latin: '6', khmer: '៦', shiftKhmer: '^', hand: 'right', finger: 'index', row: 'top' },
    { code: 'Digit7', latin: '7', khmer: '៧', shiftKhmer: '&', hand: 'right', finger: 'index', row: 'top' },
    { code: 'Digit8', latin: '8', khmer: '៨', shiftKhmer: '*', hand: 'right', finger: 'middle', row: 'top' },
    { code: 'Digit9', latin: '9', khmer: '៩', shiftKhmer: '(', hand: 'right', finger: 'ring', row: 'top' },
    { code: 'Digit0', latin: '0', khmer: '០', shiftKhmer: ')', hand: 'right', finger: 'pinky', row: 'top' },
    { code: 'Minus', latin: '-', khmer: 'ឥ', shiftKhmer: '៍', hand: 'right', finger: 'pinky', row: 'top' },
    { code: 'Equal', latin: '=', khmer: 'ឲ', shiftKhmer: '=', hand: 'right', finger: 'pinky', row: 'top' },
    { code: 'Backspace', latin: 'Backspace', khmer: 'Backspace', hand: 'right', finger: 'pinky', row: 'top', action: 'backspace', disabled: true, wide: true },
  ],
  [
    { code: 'Tab', latin: 'Tab', khmer: 'Tab', hand: 'left', finger: 'pinky', row: 'top', action: 'tab', disabled: true, wide: true },
    { code: 'KeyQ', latin: 'Q', khmer: 'ឆ', shiftKhmer: 'ឈ', hand: 'left', finger: 'pinky', row: 'top' },
    { code: 'KeyW', latin: 'W', khmer: 'ឹ', shiftKhmer: 'ឺ', hand: 'left', finger: 'ring', row: 'top' },
    { code: 'KeyE', latin: 'E', khmer: 'េ', shiftKhmer: 'ែ', altgrKhmer: 'ឯ', hand: 'left', finger: 'middle', row: 'top' },
    { code: 'KeyR', latin: 'R', khmer: 'រ', shiftKhmer: 'ឬ', altgrKhmer: 'ឫ', hand: 'left', finger: 'index', row: 'top' },
    { code: 'KeyT', latin: 'T', khmer: 'ត', shiftKhmer: 'ទ', hand: 'left', finger: 'index', row: 'top' },
    { code: 'KeyY', latin: 'Y', khmer: 'យ', shiftKhmer: 'ួ', hand: 'right', finger: 'index', row: 'top' },
    { code: 'KeyU', latin: 'U', khmer: 'ុ', shiftKhmer: 'ូ', hand: 'right', finger: 'index', row: 'top' },
    { code: 'KeyI', latin: 'I', khmer: 'ិ', shiftKhmer: 'ី', altgrKhmer: 'ឦ', hand: 'right', finger: 'middle', row: 'top' },
    { code: 'KeyO', latin: 'O', khmer: 'ោ', shiftKhmer: 'ៅ', altgrKhmer: 'ឱ', hand: 'right', finger: 'ring', row: 'top' },
    { code: 'KeyP', latin: 'P', khmer: 'ផ', shiftKhmer: 'ភ', altgrKhmer: 'ឰ', hand: 'right', finger: 'pinky', row: 'top' },
    { code: 'BracketLeft', latin: '[', khmer: 'ៀ', shiftKhmer: 'ឿ', altgrKhmer: 'ឩ', hand: 'right', finger: 'pinky', row: 'top' },
    { code: 'BracketRight', latin: ']', khmer: 'ឪ', shiftKhmer: 'ឧ', altgrKhmer: 'ឳ', hand: 'right', finger: 'pinky', row: 'top' },
    { code: 'Backslash', latin: '\\', khmer: 'ឮ', shiftKhmer: 'ឭ', altgrKhmer: '\\', hand: 'right', finger: 'pinky', row: 'top', wide: true },
  ],
  [
    { code: 'CapsLock', latin: 'Caps', khmer: 'Caps', hand: 'left', finger: 'pinky', row: 'home', action: 'caps', disabled: true, wide: true },
    { code: 'KeyA', latin: 'A', khmer: 'ា', shiftKhmer: 'ាំ', hand: 'left', finger: 'pinky', row: 'home' },
    { code: 'KeyS', latin: 'S', khmer: 'ស', shiftKhmer: 'ៃ', hand: 'left', finger: 'ring', row: 'home' },
    { code: 'KeyD', latin: 'D', khmer: 'ដ', shiftKhmer: 'ឌ', hand: 'left', finger: 'middle', row: 'home' },
    { code: 'KeyF', latin: 'F', khmer: 'ថ', shiftKhmer: 'ធ', hand: 'left', finger: 'index', row: 'home' },
    { code: 'KeyG', latin: 'G', khmer: 'ង', shiftKhmer: 'អ', hand: 'left', finger: 'index', row: 'home' },
    { code: 'KeyH', latin: 'H', khmer: 'ហ', shiftKhmer: 'ះ', hand: 'right', finger: 'index', row: 'home' },
    { code: 'KeyJ', latin: 'J', khmer: '្', shiftKhmer: 'ញ', hand: 'right', finger: 'index', row: 'home' },
    { code: 'KeyK', latin: 'K', khmer: 'ក', shiftKhmer: 'គ', hand: 'right', finger: 'middle', row: 'home' },
    { code: 'KeyL', latin: 'L', khmer: 'ល', shiftKhmer: 'ឡ', hand: 'right', finger: 'ring', row: 'home' },
    { code: 'Semicolon', latin: ';', khmer: 'ើ', shiftKhmer: 'ោះ', altgrKhmer: 'ៗ', hand: 'right', finger: 'pinky', row: 'home' },
    { code: 'Quote', latin: "'", khmer: '់', shiftKhmer: '៉', altgrKhmer: '័', hand: 'right', finger: 'pinky', row: 'home' },
    { code: 'Enter', latin: 'Enter', khmer: 'Enter', hand: 'right', finger: 'pinky', row: 'home', action: 'enter', disabled: true, wide: true },
  ],
  [
    { code: 'ShiftLeft', latin: 'Shift', khmer: 'Shift', hand: 'left', finger: 'pinky', row: 'bottom', action: 'shift', disabled: true, wide: true },
    { code: 'KeyZ', latin: 'Z', khmer: 'ឋ', shiftKhmer: 'ឍ', hand: 'left', finger: 'pinky', row: 'bottom' },
    { code: 'KeyX', latin: 'X', khmer: 'ខ', shiftKhmer: 'ឃ', hand: 'left', finger: 'ring', row: 'bottom' },
    { code: 'KeyC', latin: 'C', khmer: 'ច', shiftKhmer: 'ជ', hand: 'left', finger: 'middle', row: 'bottom' },
    { code: 'KeyV', latin: 'V', khmer: 'វ', shiftKhmer: 'េះ', hand: 'left', finger: 'index', row: 'bottom' },
    { code: 'KeyB', latin: 'B', khmer: 'ប', shiftKhmer: 'ព', hand: 'left', finger: 'index', row: 'bottom' },
    { code: 'KeyN', latin: 'N', khmer: 'ន', shiftKhmer: 'ណ', hand: 'right', finger: 'index', row: 'bottom' },
    { code: 'KeyM', latin: 'M', khmer: 'ម', shiftKhmer: 'ំ', hand: 'right', finger: 'index', row: 'bottom' },
    { code: 'Comma', latin: ',', khmer: 'ុំ', shiftKhmer: 'ុះ', altgrKhmer: ',', hand: 'right', finger: 'middle', row: 'bottom' },
    { code: 'Period', latin: '.', khmer: '។', shiftKhmer: '៕', altgrKhmer: '.', hand: 'right', finger: 'ring', row: 'bottom' },
    { code: 'Slash', latin: '/', khmer: '៊', shiftKhmer: '?', altgrKhmer: '/', hand: 'right', finger: 'pinky', row: 'bottom' },
    { code: 'ShiftRight', latin: 'Shift', khmer: 'Shift', hand: 'right', finger: 'pinky', row: 'bottom', action: 'shift', disabled: true, wide: true },
  ],
  [
    { code: 'ControlLeft', latin: 'Ctrl', khmer: 'Ctrl', hand: 'left', finger: 'pinky', row: 'space', action: 'control', disabled: true, wide: true },
    { code: 'MetaLeft', latin: 'Win', khmer: 'Win', hand: 'left', finger: 'thumb', row: 'space', action: 'meta', disabled: true },
    { code: 'AltLeft', latin: 'Alt', khmer: 'Alt', hand: 'left', finger: 'thumb', row: 'space', action: 'altgr', disabled: true },
    { code: 'Space', latin: 'Space', khmer: 'Space Khmer', hand: 'thumb', finger: 'thumb', row: 'space', action: 'space', wide: true },
    { code: 'AltRight', latin: 'AltGr', khmer: 'AltGr', hand: 'right', finger: 'thumb', row: 'space', action: 'altgr', disabled: true, wide: true },
    { code: 'ContextMenu', latin: 'Menu', khmer: 'Menu', hand: 'right', finger: 'thumb', row: 'space', action: 'menu', disabled: true },
    { code: 'ControlRight', latin: 'Ctrl', khmer: 'Ctrl', hand: 'right', finger: 'pinky', row: 'space', action: 'control', disabled: true, wide: true },
  ],
];

export const targetableKhmerKeys = khmerKeyboardRows.flat().filter((key) => !key.disabled && !key.action);
export const typeableKeyboardKeys = khmerKeyboardRows.flat().filter((key) => !key.disabled && (!key.action || key.action === 'space'));

export function findKhmerKeyByCode(code: string) {
  return khmerKeyboardRows.flat().find((key) => key.code === code);
}

export function findKhmerKeyByCharacter(character: string) {
  return typeableKeyboardKeys.find((key) => key.khmer === character || key.shiftKhmer === character || key.altgrKhmer === character || (key.action === 'space' && character === ' '));
}

export function getKhmerKeyOutput(key: KhmerKeyboardKey, modifier: KeyboardModifier = 'base') {
  if (key.action === 'space') return ' ';
  if (modifier === 'altgr') return key.altgrKhmer ?? key.khmer;
  if (modifier === 'shift') return key.shiftKhmer ?? key.khmer;
  return key.khmer;
}

export function findKhmerKeyByOutput(output: string) {
  for (const key of typeableKeyboardKeys) {
    if (key.action === 'space' && output === ' ') return { key, modifier: 'base' as const };
    if (key.khmer === output) return { key, modifier: 'base' as const };
    if (key.shiftKhmer === output) return { key, modifier: 'shift' as const };
    if (key.altgrKhmer === output) return { key, modifier: 'altgr' as const };
  }

  return null;
}

export function getKhmerKeyboardInput(event: KeyboardEvent) {
  const key = findKhmerKeyByCode(event.code);
  if (!key) return null;
  if (key.action && key.action !== 'space') return null;

  const usingAltGr = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey);
  const modifier: KeyboardModifier = usingAltGr ? 'altgr' : event.shiftKey ? 'shift' : 'base';

  return {
    key,
    modifier,
    value: getKhmerKeyOutput(key, modifier),
  };
}
