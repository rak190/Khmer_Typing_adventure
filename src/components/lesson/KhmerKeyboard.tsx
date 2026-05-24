import { khmerKeyboardRows } from '../../data/keyboardMap';
import type { KhmerKeyboardKey } from '../../data/keyboardMap';
import KeyboardKey from './KeyboardKey';
import TypingHands, { type FingerId } from './TypingHands';

type KhmerKeyboardProps = {
  activeCode: string;
  shiftRequired?: boolean;
  feedbackCode?: string;
  feedbackState?: 'correct' | 'wrong';
  activeHand: 'left' | 'right' | 'thumb';
  activeFinger: FingerId;
  hintLabel: string;
  keyLabel: string;
  onKeyPress: (code: string) => void;
};

function getKeyState(keyData: KhmerKeyboardKey, activeCode: string, shiftRequired = false, feedbackCode?: string, feedbackState?: 'correct' | 'wrong') {
  if (shiftRequired && keyData.action === 'shift') return 'shift-target';
  if (keyData.disabled) return 'disabled';
  if (feedbackCode === keyData.code && feedbackState) return feedbackState;
  if (activeCode === keyData.code) return 'target';
  return 'normal';
}

function getColumnSpan(keyData: KhmerKeyboardKey) {
  if (keyData.action === 'space') return 6;
  if (keyData.wide) return 2;
  return 1;
}

export default function KhmerKeyboard({ activeCode, shiftRequired = false, feedbackCode, feedbackState, activeHand, activeFinger, hintLabel, keyLabel, onKeyPress }: KhmerKeyboardProps) {
  return (
    <section data-testid="khmer-keyboard" className="pointer-events-none absolute left-[110px] top-[628px] z-20 h-[414px] w-[1370px]">
      <div className="lesson-keyboard-deck relative h-full px-4 pb-7 pt-5">
        <div className="pointer-events-none absolute inset-x-8 top-3 h-8 rounded-full bg-[#FFF0B5]/20 blur-sm" />
        <div className="relative z-30 mb-3 grid grid-cols-[1fr_auto] items-center gap-4 px-3 text-white">
          <div className="lesson-finger-hint-panel">
            <span className="text-[#FFE58A]">{hintLabel}</span>
            {shiftRequired && <span className="lesson-shift-pill">Shift</span>}
          </div>
          <div className="lesson-next-key-pill">{keyLabel}</div>
        </div>
        <div className="relative z-30 space-y-2.5">
          {khmerKeyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1.5">
              {row.map((keyData) => (
                <div key={`${rowIndex}-${keyData.latin}-${keyData.code}`} style={{ gridColumn: `span ${getColumnSpan(keyData)}` }}>
                  <KeyboardKey
                    keyData={keyData}
                    state={getKeyState(keyData, activeCode, shiftRequired, feedbackCode, feedbackState)}
                    onPress={onKeyPress}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <TypingHands activeHand={activeHand} activeFinger={activeFinger} />
      </div>
    </section>
  );
}
