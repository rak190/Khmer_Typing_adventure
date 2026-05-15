import { useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';
import ReferenceOverlay from '../dev/ReferenceOverlay';

type GameScreenProps = {
  children: ReactNode;
  background?: string;
  reference?: string;
  fit?: 'contain' | 'width';
  designHeight?: number;
  className?: string;
  style?: CSSProperties;
};

const DESIGN_WIDTH = 1920;
const DEFAULT_DESIGN_HEIGHT = 1080;
const debugLayoutEnabled = import.meta.env.VITE_DEBUG_LAYOUT === 'true';

export function GameScreen({ children, background, reference, fit = 'contain', designHeight = DEFAULT_DESIGN_HEIGHT, className = '', style }: GameScreenProps) {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const updateScale = () => {
      const nextScale =
        fit === 'width'
          ? window.innerWidth / DESIGN_WIDTH
          : Math.min(
              window.innerWidth / DESIGN_WIDTH,
              window.innerHeight / designHeight,
            );
      setScale(nextScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className={`min-h-screen bg-[#0A6FB5] ${fit === 'width' ? 'overflow-x-hidden overflow-y-auto' : 'overflow-hidden'}`}>
      <div
        className="relative mx-auto overflow-hidden bg-sky-200"
        style={{
            width: DESIGN_WIDTH * scale,
          height: designHeight * scale,
        }}
        data-game-screen-wrapper
      >
        <div
          className={`relative overflow-hidden ${debugLayoutEnabled ? 'outline outline-2 outline-cyan-300/60' : ''} ${className}`}
          style={{
            width: DESIGN_WIDTH,
            height: designHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            backgroundImage: background ? `url(${background})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            ...style,
          }}
          data-game-screen-canvas
        >
          {children}
          {debugLayoutEnabled && (
            <div className="pointer-events-none absolute left-3 top-3 z-[9998] select-none rounded-lg bg-black/65 px-3 py-2 text-xs font-black text-white">
              GameScreen 1920x{designHeight} | scale {scale.toFixed(3)} | ref {reference ? 'set' : 'none'}
            </div>
          )}
          <ReferenceOverlay src={reference} />
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
