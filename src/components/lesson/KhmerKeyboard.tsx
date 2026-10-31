import { findKhmerKeyByCode, khmerKeyboardRows } from '../../data/keyboardMap';
import type { KhmerKeyboardKey } from '../../data/keyboardMap';
import {
  getRequiredAltGrKeyCode,
  getRequiredShiftKeyCode,
  type FingerId,
} from '../../lib/fingerGuidance';
import KeyboardKey from './KeyboardKey';

type KhmerKeyboardProps = {
  activeCode: string;
  shiftRequired?: boolean;
  altgrRequired?: boolean;
  feedbackCode?: string;
  feedbackState?: 'correct' | 'wrong';
  activeHand: 'left' | 'right' | 'thumb';
  activeFinger: FingerId;
  hintLabel: string;
  keyLabel: string;
  onKeyPress: (code: string) => void;
};

function getKeyState(
  keyData: KhmerKeyboardKey,
  activeCode: string,
  requiredShiftCode: 'ShiftLeft' | 'ShiftRight' | null,
  requiredAltGrCode: 'AltRight' | null,
  feedbackCode?: string,
  feedbackState?: 'correct' | 'wrong',
) {
  if (feedbackCode === keyData.code && feedbackState) return feedbackState;
  if (activeCode === keyData.code) return 'target';
  if (requiredShiftCode && keyData.code === requiredShiftCode) return 'shift-target';
  if (requiredAltGrCode && keyData.code === requiredAltGrCode) return 'shift-target';
  if (keyData.disabled) return 'disabled';
  return 'normal';
}

export default function KhmerKeyboard({
  activeCode,
  shiftRequired = false,
  altgrRequired = false,
  feedbackCode,
  feedbackState,
  onKeyPress,
}: KhmerKeyboardProps) {
  const activeKey = activeCode ? findKhmerKeyByCode(activeCode) : undefined;
  const requiredShiftCode = activeKey ? getRequiredShiftKeyCode(activeKey, shiftRequired) : null;
  const requiredAltGrCode = getRequiredAltGrKeyCode(altgrRequired);

  return (
    <section
      data-testid="khmer-keyboard"
      className="pointer-events-none absolute left-[132px] top-[672px] z-20 h-[370px] w-[1318px]"
    >
      <div className="lesson-keyboard-deck relative h-full px-4 pb-7 pt-5">
        <div className="pointer-events-none absolute inset-x-8 top-3 h-8 rounded-full bg-[#FFF0B5]/20 blur-sm" />
        <div className="relative z-30 space-y-3">
          {khmerKeyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
              {row.map((keyData) => (
                <KeyboardKey
                  key={`${rowIndex}-${keyData.latin}-${keyData.code}`}
                  keyData={keyData}
                  state={getKeyState(
                    keyData,
                    activeCode,
                    requiredShiftCode,
                    requiredAltGrCode,
                    feedbackCode,
                    feedbackState,
                  )}
                  onPress={onKeyPress}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
