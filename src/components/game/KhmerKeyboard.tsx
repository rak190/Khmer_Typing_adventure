import { useEffect, useMemo, useState } from 'react';
import type { KeyboardKeyData } from '../../types/game';
import {
  findKhmerKeyByCode,
  findKhmerKeyByOutput,
  getKhmerKeyOutput,
  khmerKeyboardRows,
  type KeyboardModifier,
  type KhmerKeyboardKey,
} from '../../data/keyboardMap';
import { cn } from '../../lib/cn';
import KeyboardKey from '../lesson/KeyboardKey';

type KhmerKeyboardProps = {
  activeKey?: string;
  feedbackKey?: string;
  feedbackState?: 'idle' | 'correct' | 'wrong';
  onKeyPress: (keyData: KeyboardKeyData) => void;
  compact?: boolean;
};

function getActionLabel(action: KeyboardKeyData['action'], code: string) {
  if (action === 'backspace') return 'Backspace';
  if (action === 'enter') return 'Enter';
  if (action === 'shift') return 'Shift';
  if (action === 'space') return 'Space Khmer';
  if (action === 'control') return 'Ctrl';
  if (action === 'altgr') return code === 'AltLeft' ? 'Alt' : 'AltGr';
  if (action === 'meta') return 'Win';
  if (action === 'menu') return 'Menu';
  if (action === 'tab') return 'Tab';
  if (action === 'caps') return 'Caps';
  return code;
}

function getBossKeyData(key: KhmerKeyboardKey, value: string): KeyboardKeyData {
  return {
    label: key.action ? getActionLabel(key.action, key.code) : key.khmer,
    value,
    shift: key.shiftKhmer,
    altgr: key.altgrKhmer,
    code: key.code,
    wide: key.wide,
    action: key.action,
  };
}

export default function KhmerKeyboard({ activeKey, feedbackKey, feedbackState = 'idle', onKeyPress, compact = false }: KhmerKeyboardProps) {
  const [modifier, setModifier] = useState<KeyboardModifier>('base');
  const activeTarget = useMemo(() => (activeKey ? findKhmerKeyByOutput(activeKey) : null), [activeKey]);
  const activeCode = activeTarget?.key.code ?? '';
  const shiftRequired = activeTarget?.modifier === 'shift';

  useEffect(() => {
    const updateModifier = (event: KeyboardEvent) => {
      const usingAltGr = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey);
      setModifier(usingAltGr ? 'altgr' : event.shiftKey ? 'shift' : 'base');
    };

    window.addEventListener('keydown', updateModifier);
    window.addEventListener('keyup', updateModifier);
    return () => {
      window.removeEventListener('keydown', updateModifier);
      window.removeEventListener('keyup', updateModifier);
    };
  }, []);

  function getKeyState(key: KhmerKeyboardKey) {
    const matchesFeedback = feedbackKey === key.khmer || feedbackKey === key.shiftKhmer || feedbackKey === key.altgrKhmer;
    if (shiftRequired && key.action === 'shift') return 'shift-target';
    if (matchesFeedback && feedbackState !== 'idle') return feedbackState === 'correct' ? 'correct' : 'wrong';
    if (activeCode === key.code) return 'target';
    if (key.disabled && !['backspace', 'enter', 'shift'].includes(key.action ?? '')) return 'disabled';
    return 'normal';
  }

  function handleKeyPress(code: string) {
    const key = findKhmerKeyByCode(code);
    if (!key) return;

    if (key.action === 'shift') {
      setModifier((next) => (next === 'shift' ? 'base' : 'shift'));
      return;
    }

    if (key.action === 'altgr') {
      setModifier((next) => (next === 'altgr' ? 'base' : 'altgr'));
      return;
    }

    if (key.action && !['backspace', 'enter', 'space'].includes(key.action)) return;

    const value = key.action === 'backspace' || key.action === 'enter'
      ? ''
      : activeCode === key.code && activeKey
        ? activeKey
        : getKhmerKeyOutput(key, modifier);

    onKeyPress(getBossKeyData(key, value));
    if (!key.action && modifier !== 'base') setModifier('base');
  }

  return (
    <div className={cn('boss-keyboard-scroll mx-auto w-full overflow-x-auto pb-2', compact ? 'max-w-[1120px]' : 'max-w-[1280px]')}>
      <section data-testid="boss-khmer-keyboard" className={cn('lesson-keyboard-deck boss-lesson-keyboard relative mx-auto px-4 pb-6 pt-5', compact && 'boss-lesson-keyboard--compact')}>
        <div className="pointer-events-none absolute inset-x-8 top-3 h-8 rounded-full bg-[#FFF0B5]/20 blur-sm" />
        <div className="relative z-30 space-y-2.5">
          {khmerKeyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
              {row.map((keyData) => (
                <KeyboardKey
                  key={`${rowIndex}-${keyData.latin}-${keyData.code}`}
                  keyData={{
                    ...keyData,
                    disabled: keyData.disabled && !['backspace', 'enter', 'shift'].includes(keyData.action ?? ''),
                  }}
                  state={getKeyState(keyData)}
                  onPress={handleKeyPress}
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
