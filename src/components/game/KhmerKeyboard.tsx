import type { KeyboardKeyData } from '../../types/game';
import { keyboardRows } from '../../data/mockData';
import GameKeyboard from '../game-ui/GameKeyboard';

type KhmerKeyboardProps = {
  activeKey?: string;
  feedbackKey?: string;
  feedbackState?: 'idle' | 'correct' | 'wrong';
  onKeyPress: (keyData: KeyboardKeyData) => void;
  compact?: boolean;
};

export default function KhmerKeyboard({ activeKey, feedbackKey, feedbackState = 'idle', onKeyPress, compact = false }: KhmerKeyboardProps) {
  return <GameKeyboard rows={keyboardRows} activeKey={activeKey} feedbackKey={feedbackKey} feedbackState={feedbackState} onKeyPress={onKeyPress} compact={compact} />;
}
