import { motion } from 'framer-motion';
import { memo } from 'react';
import {
  hasTactileBump,
  isHomeRowRestKeyCode,
  type KhmerKeyboardKey,
} from '../../data/keyboardMap';
import { cn } from '../../lib/cn';

type KeyboardKeyProps = {
  keyData: KhmerKeyboardKey;
  state?: 'normal' | 'target' | 'correct' | 'wrong' | 'disabled' | 'shift-target';
  onPress: (code: string) => void;
};

function physicalCodeLabel(code: string, action?: KhmerKeyboardKey['action']) {
  if (action === 'space') return 'Space';
  if (code.startsWith('Key')) return code.replace('Key', '');
  if (code.startsWith('Digit')) return code.replace('Digit', '');
  if (code === 'Backslash') return '\\';
  if (code === 'BracketLeft') return '[';
  if (code === 'BracketRight') return ']';
  if (code === 'Semicolon') return ';';
  if (code === 'Quote') return "'";
  if (code === 'Comma') return ',';
  if (code === 'Period') return '.';
  if (code === 'Slash') return '/';
  if (code === 'Minus') return '-';
  if (code === 'Equal') return '=';
  return '';
}

function handZoneClass(keyData: KhmerKeyboardKey) {
  if (keyData.hand === 'left') return 'lesson-key-zone--left';
  if (keyData.hand === 'right') return 'lesson-key-zone--right';
  return 'lesson-key-zone--thumb';
}

function displayKeyLabel(keyData: KhmerKeyboardKey) {
  if (!keyData.action) return keyData.khmer;

  return {
    backspace: '\u232b',
    enter: '\u21b5',
    shift: '\u21e7',
    caps: 'Caps',
    tab: 'Tab',
    control: 'Ctrl',
    altgr: keyData.code === 'AltLeft' ? 'Alt' : 'AltGr',
    meta: '\u229e',
    menu: '\u2630',
    space: 'Space',
  }[keyData.action];
}

function KeyboardKey({ keyData, state = 'normal', onPress }: KeyboardKeyProps) {
  const physicalLabel = physicalCodeLabel(keyData.code, keyData.action);
  const shiftLabel = !keyData.action ? keyData.shiftKhmer : undefined;
  const displayLabel = displayKeyLabel(keyData);
  const isBackspace = keyData.action === 'backspace';
  const isActionKey = Boolean(keyData.action);
  const disabled = Boolean(keyData.disabled && !isBackspace);
  const isHomeKey = isHomeRowRestKeyCode(keyData.code);
  const isTactileBump = hasTactileBump(keyData.code);

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onPress(keyData.code)}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 5, scale: 0.97 }}
      className={cn(
        'pointer-events-auto khmer-body lesson-stone-key relative grid h-[50px] place-items-center px-2 text-[28px] font-black leading-none transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#42D9FF]/80',
        keyData.wide ? 'min-w-[102px] flex-[1.58] text-[17px]' : 'min-w-[58px] flex-1',
        handZoneClass(keyData),
        isActionKey && 'lesson-key--special text-[16px] tracking-wide',
        state === 'target' && 'lesson-key--target',
        state === 'shift-target' && 'lesson-key--shift-target',
        state === 'correct' && 'lesson-key--pressed lesson-key--correct',
        state === 'wrong' && 'lesson-key--pressed lesson-key--wrong',
        disabled && 'lesson-key--disabled cursor-default',
      )}
      aria-label={`${keyData.latin} ${keyData.khmer}`}
      data-testid="keyboard-key"
      data-key-value={keyData.khmer}
      data-key-shift={keyData.shiftKhmer ?? ''}
      data-key-altgr={keyData.altgrKhmer ?? ''}
      data-key-code={keyData.code}
      data-key-action={keyData.action ?? ''}
      data-home-key={isHomeKey ? 'true' : undefined}
      data-tactile-bump={isTactileBump ? 'true' : undefined}
      data-is-shift-target={state === 'shift-target' ? 'true' : undefined}
      data-active={state === 'target' ? 'true' : 'false'}
    >
      {state === 'target' && <span aria-hidden="true" className="lesson-key-target-arrow" />}
      <span aria-hidden="true" className="lesson-key-accent" />
      {shiftLabel && <span className="lesson-key-shift">{shiftLabel}</span>}
      <span className="lesson-key-glyph translate-y-[1px]">{displayLabel}</span>
      {isTactileBump && (
        <span
          aria-hidden="true"
          title="គន្លឹះសម្គាល់ម្រាមដៃចង្អុល (Index finger tactile bump)"
          className="pointer-events-none absolute bottom-1.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-amber-400/90 shadow-sm"
        />
      )}
      {physicalLabel && (
        <span
          className={cn(
            'lesson-key-code absolute bottom-1 right-1 rounded-[5px] px-1.5 py-0.5 text-[9px] font-black leading-none',
            state === 'target' && 'lesson-key-code--target',
          )}
        >
          {physicalLabel}
        </span>
      )}
    </motion.button>
  );
}

export default memo(KeyboardKey);
