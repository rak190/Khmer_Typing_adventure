import type { KeyboardKeyData } from '../../types/game';
import GameKeyboardKey from './GameKeyboardKey';

type GameKeyboardProps = {
  rows: KeyboardKeyData[][];
  activeKey?: string;
  onKeyPress?: (key: KeyboardKeyData) => void;
  compact?: boolean;
};

export default function GameKeyboard({ rows, activeKey, onKeyPress, compact = false }: GameKeyboardProps) {
  return (
    <div className="rounded-[28px] border-[3px] border-[#8BB8DC] bg-gradient-to-b from-[#DFF5FF] to-[#BCE6FF] p-3 shadow-[inset_0_-6px_0_rgba(29,83,128,.14),0_14px_24px_rgba(16,73,122,.2)]">
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((key) => (
              <GameKeyboardKey
                key={`${rowIndex}-${key.label}`}
                label={compact && key.label === 'Space Khmer' ? 'Space' : key.label}
                active={activeKey === key.value}
                wide={key.wide}
                onPress={() => onKeyPress?.(key)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
