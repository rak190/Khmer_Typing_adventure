import type { KeyboardKeyData } from '../../types/game';
import { keyboardRows } from '../../data/mockData';
import GameKeyboard from '../game-ui/GameKeyboard';

type KhmerKeyboardProps = {
  activeKey?: string;
  onKeyPress: (keyData: KeyboardKeyData) => void;
  compact?: boolean;
};

export default function KhmerKeyboard({ activeKey, onKeyPress, compact = false }: KhmerKeyboardProps) {
  return <GameKeyboard rows={keyboardRows} activeKey={activeKey} onKeyPress={onKeyPress} compact={compact} />;
}
