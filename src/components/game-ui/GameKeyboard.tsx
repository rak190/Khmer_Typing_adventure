import { useEffect, useState } from 'react';
import type { KeyboardKeyData } from '../../types/game';
import GameKeyboardKey from './GameKeyboardKey';

type KeyboardModifier = 'base' | 'shift' | 'altgr';

type GameKeyboardProps = {
  rows: KeyboardKeyData[][];
  activeKey?: string;
  feedbackKey?: string;
  feedbackState?: 'idle' | 'correct' | 'wrong';
  onKeyPress?: (key: KeyboardKeyData) => void;
  compact?: boolean;
};

export default function GameKeyboard({ rows, activeKey, feedbackKey, feedbackState = 'idle', onKeyPress, compact = false }: GameKeyboardProps) {
  const [modifier, setModifier] = useState<KeyboardModifier>('base');

  useEffect(() => {
    const updateModifier = (event: KeyboardEvent) => {
      const usingAltGr = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey);
      setModifier(usingAltGr ? 'altgr' : event.shiftKey ? 'shift' : 'base');
    };

    const resetModifier = (event: KeyboardEvent) => {
      const usingAltGr = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey);
      setModifier(usingAltGr ? 'altgr' : event.shiftKey ? 'shift' : 'base');
    };

    window.addEventListener('keydown', updateModifier);
    window.addEventListener('keyup', resetModifier);
    return () => {
      window.removeEventListener('keydown', updateModifier);
      window.removeEventListener('keyup', resetModifier);
    };
  }, []);

  const keyValueForModifier = (key: KeyboardKeyData) => {
    if (modifier === 'shift') return key.shift ?? key.value;
    if (modifier === 'altgr') return key.altgr ?? key.value;
    return key.value;
  };

  const pressKey = (key: KeyboardKeyData) => {
    if (key.action === 'shift') {
      setModifier((next) => (next === 'shift' ? 'base' : 'shift'));
      return;
    }

    if (key.action === 'altgr') {
      setModifier((next) => (next === 'altgr' ? 'base' : 'altgr'));
      return;
    }

    onKeyPress?.({ ...key, value: keyValueForModifier(key) });
    if (!key.action && modifier !== 'base') setModifier('base');
  };

  return (
    <div className={`${compact ? 'rounded-[22px] p-2' : 'rounded-[28px] p-3'} border-[3px] border-[#8BB8DC] bg-gradient-to-b from-[#DFF5FF] to-[#BCE6FF] shadow-[inset_0_-6px_0_rgba(29,83,128,.14),0_14px_24px_rgba(16,73,122,.2)]`}>
      <div className={`mb-2 flex items-center justify-between px-1 ${compact ? 'text-[10px]' : 'text-xs'} font-black text-[#17325A]`}>
        <span className="rounded-full bg-white/70 px-3 py-1">{modifier === 'base' ? 'Base layout' : modifier === 'shift' ? 'Shift layer' : 'AltGr layer'}</span>
        <span className="rounded-full bg-white/70 px-3 py-1">Khmer Typing Land map</span>
      </div>
      <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={compact ? 'flex justify-center gap-1.5' : 'flex justify-center gap-2'}>
            {row.map((key) => (
              <GameKeyboardKey
                key={`${rowIndex}-${key.label}`}
                label={compact && key.label === 'Space Khmer' ? 'Space' : key.label}
                shift={key.shift}
                altgr={key.altgr}
                active={activeKey === key.value || activeKey === key.shift || activeKey === key.altgr}
                state={feedbackKey === key.value || feedbackKey === key.shift || feedbackKey === key.altgr ? feedbackState : 'idle'}
                wide={key.wide}
                compact={compact}
                modifier={modifier}
                onPress={() => pressKey(key)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
