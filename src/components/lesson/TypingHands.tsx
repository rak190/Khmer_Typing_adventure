import { memo } from 'react';
import { handImages } from '../../assets/assetManifest';
import { cn } from '../../lib/cn';
import type { FingerGuidance, FingerHighlight, FingerName, HandSide } from '../../lib/fingerGuidance';

type TypingHandsProps = {
  guidance: FingerGuidance;
};

const markerPositions: Record<HandSide, Record<FingerName, string>> = {
  left: {
    pinky: 'left-[33.5%] top-[27%]',
    ring: 'left-[50%] top-[15%]',
    middle: 'left-[63%] top-[15%]',
    index: 'left-[72%] top-[23%]',
    thumb: 'left-[80%] top-[50.5%]',
  },
  right: {
    thumb: 'left-[20%] top-[49.5%]',
    index: 'left-[28%] top-[25%]',
    middle: 'left-[42%] top-[15%]',
    ring: 'left-[57.5%] top-[15.5%]',
    pinky: 'left-[65%] top-[28%]',
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

function TypingHands({ guidance }: TypingHandsProps) {
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

export default memo(TypingHands);
