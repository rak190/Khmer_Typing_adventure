import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import ReferenceOverlay from '../dev/ReferenceOverlay';

type GameScreenProps = {
  children: ReactNode;
  background?: string;
  reference?: string;
  className?: string;
  style?: CSSProperties;
};

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

function getScale() {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
}

export default function GameScreen({ children, background, reference, className = '', style }: GameScreenProps) {
  const [scale, setScale] = useState(getScale);

  useEffect(() => {
    const onResize = () => setScale(getScale());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const wrapperSize = useMemo(
    () => ({
      width: DESIGN_WIDTH * scale,
      height: DESIGN_HEIGHT * scale,
    }),
    [scale],
  );

  return (
    <div className="grid min-h-screen place-items-center overflow-hidden bg-[#0A6FB5]">
      <div className="relative overflow-hidden" style={wrapperSize}>
        <div
          className={`absolute left-0 top-0 overflow-hidden ${className}`}
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            backgroundImage: background ? `url(${background})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            ...style,
          }}
        >
          {children}
          <ReferenceOverlay src={reference} />
        </div>
      </div>
    </div>
  );
}
