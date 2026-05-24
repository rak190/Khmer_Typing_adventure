import { khmerKeyboardRows } from '../../data/keyboardMap';
import type { KhmerKeyboardKey } from '../../data/keyboardMap';
import KeyboardKey from './KeyboardKey';
import TypingHands, { type FingerId } from './TypingHands';

type KhmerKeyboardProps = {
  activeCode: string;
  feedbackCode?: string;
  feedbackState?: 'correct' | 'wrong';
  activeHand: 'left' | 'right' | 'thumb';
  activeFinger: FingerId;
  onKeyPress: (code: string) => void;
};

function getKeyState(keyData: KhmerKeyboardKey, activeCode: string, feedbackCode?: string, feedbackState?: 'correct' | 'wrong') {
  if (keyData.disabled) return 'disabled';
  if (feedbackCode === keyData.code && feedbackState) return feedbackState;
  if (activeCode === keyData.code) return 'target';
  return 'normal';
}

export default function KhmerKeyboard({ activeCode, feedbackCode, feedbackState, activeHand, activeFinger, onKeyPress }: KhmerKeyboardProps) {

  return (
    <section data-testid="khmer-keyboard" className="pointer-events-none absolute left-[132px] top-[672px] z-20 h-[370px] w-[1318px]">
      <div className="lesson-keyboard-deck relative h-full px-4 pb-7 pt-5">
        <div className="pointer-events-none absolute inset-x-8 top-3 h-8 rounded-full bg-[#FFF0B5]/20 blur-sm" />
        <div className="relative z-30 space-y-3">
          {khmerKeyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
              {row.map((keyData) => (
                <KeyboardKey
                  key={`${rowIndex}-${keyData.latin}-${keyData.code}`}
                  keyData={keyData}
                  state={getKeyState(keyData, activeCode, feedbackCode, feedbackState)}
                  onPress={onKeyPress}
                />
              ))}
            </div>
          ))}
        </div>
        <TypingHands activeHand={activeHand} activeFinger={activeFinger} />
      </div>
    </section>
  );
}
