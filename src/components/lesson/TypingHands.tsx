import { handImages } from '../../assets/assetManifest';
import { cn } from '../../lib/cn';
import type { FingerGuidance, FingerHighlight, FingerName, HandSide } from '../../lib/fingerGuidance';

type TypingHandsProps = {
  guidance: FingerGuidance;
};

const markerPositions: Record<HandSide, Record<FingerName, string>> = {
  left: {
    pinky: 'left-[32%] top-[32%]',
    ring: 'left-[50%] top-[18%]',
    middle: 'left-[65%] top-[18%]',
    index: 'left-[81%] top-[27%]',
    thumb: 'left-[85%] top-[56%]',
  },
  right: {
    thumb: 'left-[22%] top-[56%]',
    index: 'left-[34%] top-[27%]',
    middle: 'left-[49%] top-[18%]',
    ring: 'left-[63%] top-[18%]',
    pinky: 'left-[78%] top-[32%]',
  },
};

function getHighlight(highlights: FingerHighlight[], hand: HandSide, finger: FingerName) {
  return highlights.find((highlight) => highlight.hand === hand && highlight.finger === finger);
}

function HandCard({
  hand,
  guidance,
}: {
  hand: HandSide;
  guidance: FingerGuidance;
}) {
  const isActive = guidance.highlights.some((highlight) => highlight.hand === hand);
  const image = hand === 'left' ? handImages.leftTyping : handImages.rightTyping;

  return (
    <div
      className={cn(
        'lesson-side-hand-card',
        hand === 'left' ? 'lesson-side-hand-card--left' : 'lesson-side-hand-card--right',
        isActive && 'lesson-side-hand-card--active',
      )}
      data-active={isActive}
    >
      <div className="lesson-side-hand-figure">
        <img
          src={image}
          alt=""
          draggable={false}
          className={cn(
            'lesson-side-hand-image',
            hand === 'left' ? '-rotate-[7deg]' : 'rotate-[7deg]',
          )}
        />
        {(Object.keys(markerPositions[hand]) as FingerName[]).map((finger) => {
          const highlight = getHighlight(guidance.highlights, hand, finger);

          return (
            <span
              key={`${hand}-${finger}`}
              className={cn(
                'lesson-finger-marker',
                markerPositions[hand][finger],
                highlight?.role === 'target' && 'lesson-finger-marker--target',
                highlight?.role === 'shift' && 'lesson-finger-marker--shift',
              )}
            >
              {highlight?.role === 'shift' ? 'Shift' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function TypingHands({ guidance }: TypingHandsProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[25]"
      data-testid="typing-hand-hints"
      data-active-finger={guidance.activeFinger}
      data-shift-required={guidance.shiftRequired}
    >
      <HandCard hand="left" guidance={guidance} />
      <HandCard hand="right" guidance={guidance} />
    </div>
  );
}
