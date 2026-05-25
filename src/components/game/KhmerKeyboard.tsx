import type { KeyboardKeyData } from '../../types/game';
import { khmerKeyboardRows } from '../../data/keyboardMap';
import GameKeyboard from '../game-ui/GameKeyboard';

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

const bossKeyboardRows: KeyboardKeyData[][] = khmerKeyboardRows.map((row) =>
  row.map((key) => ({
    label: key.action ? getActionLabel(key.action, key.code) : key.khmer,
    value: key.action === 'space' ? ' ' : key.action ? '' : key.khmer,
    shift: key.shiftKhmer,
    altgr: key.altgrKhmer,
    code: key.code,
    wide: key.wide,
    action: key.action,
  })),
);

export default function KhmerKeyboard({ activeKey, feedbackKey, feedbackState = 'idle', onKeyPress, compact = false }: KhmerKeyboardProps) {
  return <GameKeyboard rows={bossKeyboardRows} activeKey={activeKey} feedbackKey={feedbackKey} feedbackState={feedbackState} onKeyPress={onKeyPress} compact={compact} />;
}
