import { motion } from 'framer-motion';
import type { KhmerKeyboardKey } from '../../data/keyboardMap';
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

export default function KeyboardKey({ keyData, state = 'normal', onPress }: KeyboardKeyProps) {
  const physicalLabel = physicalCodeLabel(keyData.code, keyData.action);
  const isActionKey = Boolean(keyData.action && keyData.action !== 'space');
  const disabled = (state === 'disabled' || keyData.disabled) && state !== 'shift-target';
  const displayLabel = {
    backspace: 'Back',
    enter: 'Enter',
    shift: 'Shift',
    caps: 'Caps',
    tab: 'Tab',
    control: 'Ctrl',
    altgr: keyData.code === 'AltLeft' ? 'Alt' : 'AltGr',
    meta: 'Win',
    menu: 'Menu',
    space: 'Space',
  }[keyData.action ?? ''] ?? keyData.khmer;
  const shiftLabel = !isActionKey && keyData.shiftKhmer && keyData.shiftKhmer !== keyData.khmer ? keyData.shiftKhmer : '';

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onPress(keyData.code)}
      animate={state === 'wrong' ? { x: [-7, 7, -5, 5, 0], y: [0, 5, 0] } : state === 'correct' ? { y: [0, 5, 0], scale: [1, 0.98, 1.06, 1] } : state === 'target' ? { y: [0, -2, 0] } : undefined}
      transition={{ duration: state === 'wrong' ? 0.36 : 0.45 }}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 5, scale: 0.97 }}
      className={cn(
        'pointer-events-auto khmer-body lesson-stone-key relative grid h-[52px] place-items-center px-2 text-[28px] font-black leading-none transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#42D9FF]/80',
        keyData.wide || keyData.action === 'space' ? 'text-[17px]' : '',
        'w-full min-w-0',
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
      data-active={state === 'target' ? 'true' : 'false'}
    >
      {state === 'target' && <span aria-hidden="true" className="lesson-key-target-arrow" />}
      <span aria-hidden="true" className="lesson-key-accent" />
      {shiftLabel && <span className="lesson-key-shift">{shiftLabel}</span>}
      <span className="lesson-key-glyph translate-y-[1px]">{displayLabel}</span>
      {physicalLabel && (
        <span className={cn('lesson-key-code absolute bottom-1 right-1 rounded-[5px] px-1.5 py-0.5 text-[9px] font-black leading-none', state === 'target' && 'lesson-key-code--target')}>
          {physicalLabel}
        </span>
      )}
    </motion.button>
  );
}
