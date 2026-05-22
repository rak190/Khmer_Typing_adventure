import { useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';
import ReferenceOverlay from '../dev/ReferenceOverlay';

type GameScreenProps = {
  children: ReactNode;
  background?: string;
  reference?: string;
  fit?: 'contain' | 'width' | 'stretch';
  designHeight?: number;
  fillViewport?: boolean;
  className?: string;
  style?: CSSProperties;
};

const DESIGN_WIDTH = 1920;
const DEFAULT_DESIGN_HEIGHT = 1080;
const debugLayoutEnabled = import.meta.env.VITE_DEBUG_LAYOUT === 'true';

export function GameScreen({ children, background, reference, fit = 'contain', designHeight = DEFAULT_DESIGN_HEIGHT, fillViewport = false, className = '', style }: GameScreenProps) {
  const [scale, setScale] = useState({ x: 1, y: 1 });

  useLayoutEffect(() => {
    const updateScale = () => {
      if (fit === 'stretch') {
        setScale({
          x: window.innerWidth / DESIGN_WIDTH,
          y: window.innerHeight / designHeight,
        });
        return;
      }

      const uniformScale = fillViewport
        ? Math.max(window.innerWidth / DESIGN_WIDTH, window.innerHeight / designHeight)
        : fit === 'width'
          ? window.innerWidth / DESIGN_WIDTH
          : Math.min(
              window.innerWidth / DESIGN_WIDTH,
              window.innerHeight / designHeight,
            );

      setScale({ x: uniformScale, y: uniformScale });
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [designHeight, fillViewport, fit]);

  return (
    <div
      className={`min-h-screen bg-[#0A6FB5] ${fit === 'width' && !fillViewport ? 'overflow-x-hidden overflow-y-auto' : 'overflow-hidden'}`}
      style={{
        backgroundImage: background ? `url(${background})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="relative mx-auto overflow-hidden bg-sky-200"
        style={{
          width: fillViewport || fit === 'stretch' ? '100vw' : DESIGN_WIDTH * scale.x,
          height: fillViewport || fit === 'stretch' ? '100vh' : designHeight * scale.y,
        }}
        data-game-screen-wrapper
      >
        <div
          className={`relative overflow-hidden ${debugLayoutEnabled ? 'outline outline-2 outline-cyan-300/60' : ''} ${className}`}
          style={{
            width: DESIGN_WIDTH,
            height: designHeight,
            transform: `scale(${scale.x}, ${scale.y})`,
            transformOrigin: fillViewport ? 'center center' : 'top left',
            left: fillViewport ? '50%' : undefined,
            top: fillViewport ? '50%' : undefined,
            translate: fillViewport ? '-50% -50%' : undefined,
            backgroundImage: background ? `url(${background})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '--game-scale-x': scale.x,
            '--game-scale-y': scale.y,
            ...style,
          } as CSSProperties}
          data-game-screen-canvas
        >
          {children}
          {debugLayoutEnabled && (
            <div className="pointer-events-none absolute left-3 top-3 z-[9998] select-none rounded-lg bg-black/65 px-3 py-2 text-xs font-black text-white">
              GameScreen 1920x{designHeight} | scale {scale.x.toFixed(3)}x{scale.y.toFixed(3)} | ref {reference ? 'set' : 'none'}
            </div>
          )}
          <ReferenceOverlay src={reference} />
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
