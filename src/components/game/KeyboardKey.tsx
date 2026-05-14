import type { KeyboardKeyData } from '../../types/game';
import GameKeyboardKey from '../game-ui/GameKeyboardKey';

type KeyboardKeyProps = {
  keyData: KeyboardKeyData;
  active?: boolean;
  disabled?: boolean;
  onPress: (keyData: KeyboardKeyData) => void;
};

export default function KeyboardKey({ keyData, active, disabled, onPress }: KeyboardKeyProps) {
  return <GameKeyboardKey label={keyData.label} active={active} wide={keyData.wide} onPress={disabled ? undefined : () => onPress(keyData)} />;
}
