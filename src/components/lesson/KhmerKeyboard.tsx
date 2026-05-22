import { useEffect, useState } from 'react';
import { keyboardRows } from '../../data/mockData';
import type { KeyboardKeyData } from '../../types/game';
import KeyboardKey from './KeyboardKey';
import TypingHands from './TypingHands';

type KeyboardModifier = 'base' | 'shift' | 'altgr';

type KhmerKeyboardProps = {
  activeKey: string;
  feedbackKey?: string;
  feedbackState?: 'correct' | 'wrong';
  activeHand: 'left' | 'right' | 'both';
  onKeyPress: (key: string) => void;
};

function keyMatches(keyData: KeyboardKeyData, value?: string) {
  if (!value) return false;
  return keyData.value === value || keyData.shift === value || keyData.altgr === value;
}

function valueForModifier(keyData: KeyboardKeyData, modifier: KeyboardModifier, activeKey: string) {
  if (keyMatches(keyData, activeKey)) return activeKey;
  if (modifier === 'shift') return keyData.shift ?? keyData.value;
  if (modifier === 'altgr') return keyData.altgr ?? keyData.value;
  return keyData.value;
}

export default function KhmerKeyboard({ activeKey, feedbackKey, feedbackState, activeHand, onKeyPress }: KhmerKeyboardProps) {
  const [modifier, setModifier] = useState<KeyboardModifier>('base');

  useEffect(() => {
    const updateModifier = (event: KeyboardEvent) => {
      const usingAltGr = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey);
      setModifier(usingAltGr ? 'altgr' : event.shiftKey || event.getModifierState?.('CapsLock') ? 'shift' : 'base');
    };

    window.addEventListener('keydown', updateModifier);
    window.addEventListener('keyup', updateModifier);
    return () => {
      window.removeEventListener('keydown', updateModifier);
      window.removeEventListener('keyup', updateModifier);
    };
  }, []);

  const pressKey = (keyData: KeyboardKeyData) => {
    if (keyData.action === 'shift') {
      setModifier((next) => (next === 'shift' ? 'base' : 'shift'));
      return;
    }

    if (keyData.action === 'altgr') {
      setModifier((next) => (next === 'altgr' ? 'base' : 'altgr'));
      return;
    }

    if (keyData.action && keyData.action !== 'space') return;

    const value = valueForModifier(keyData, modifier, activeKey);
    if (value) onKeyPress(value);
    if (!keyData.action && modifier !== 'base') setModifier('base');
  };

  return (
    <section data-testid="khmer-keyboard" className="pointer-events-none absolute left-[178px] top-[686px] z-20 h-[334px] w-[1270px]">
      <div className="relative h-full rounded-[34px] border-[5px] border-[#486B93] bg-gradient-to-b from-[#153E73] via-[#0B2A55] to-[#061A36] p-5 shadow-[inset_0_4px_0_rgba(255,255,255,.12),inset_0_-10px_0_rgba(0,0,0,.22),0_18px_28px_rgba(0,36,75,.34)]">
        <div className="pointer-events-none absolute inset-x-9 top-4 h-10 rounded-full bg-white/8 blur-sm" />
        <div className="relative z-20 space-y-2">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-2">
              {row.map((keyData) => (
                <KeyboardKey
                  key={`${rowIndex}-${keyData.label}-${keyData.code ?? keyData.value}`}
                  keyData={keyData}
                  active={keyMatches(keyData, activeKey)}
                  state={keyMatches(keyData, feedbackKey) ? feedbackState ?? 'idle' : 'idle'}
                  modifier={modifier}
                  targetValue={activeKey}
                  onPress={pressKey}
                />
              ))}
            </div>
          ))}
        </div>
        <TypingHands activeHand={activeHand} />
      </div>
    </section>
  );
}
