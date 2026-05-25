import { handImages } from '../../assets/assetManifest';
import { cn } from '../../lib/cn';
import type { FingerGuidance, FingerHighlight, FingerName, HandSide } from '../../lib/fingerGuidance';

type TypingHandsProps = {
  guidance: FingerGuidance;
};

const markerPositions: Record<HandSide, Record<FingerName, string>> = {
  left: {
    pinky: 'left-[34%] top-[31%]',
    ring: 'left-[53%] top-[17%]',
    middle: 'left-[68%] top-[17%]',
    index: 'left-[84%] top-[28%]',
    thumb: 'left-[88%] top-[56%]',
  },
  right: {
    thumb: 'left-[20%] top-[56%]',
    index: 'left-[32%] top-[28%]',
    middle: 'left-[49%] top-[17%]',
    ring: 'left-[64%] top-[17%]',
    pinky: 'left-[80%] top-[31%]',
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
      <div className={cn('lesson-side-hand-figure', hand === 'left' ? 'lesson-side-hand-figure--left' : 'lesson-side-hand-figure--right')}>
        <img
          src={image}
          alt=""
          draggable={false}
          className="lesson-side-hand-image"
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
              {highlight ? <span className="sr-only">{highlight.role === 'shift' ? 'Shift finger' : 'Target finger'}</span> : null}
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
