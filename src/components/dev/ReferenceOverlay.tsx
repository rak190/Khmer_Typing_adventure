import { useEffect, useState } from 'react';

type ReferenceOverlayProps = {
  src?: string;
  opacity?: number;
  zIndex?: number;
};

const overlayEnabled = import.meta.env.VITE_SHOW_REFERENCE_OVERLAY === 'true';

export default function ReferenceOverlay({ src, opacity = 0.35, zIndex = 9999 }: ReferenceOverlayProps) {
  const [visible, setVisible] = useState(overlayEnabled);

  useEffect(() => {
    if (!overlayEnabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'o' && event.shiftKey && (event.ctrlKey || event.metaKey)) {
        setVisible((next) => !next);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!overlayEnabled || !src) return null;

  return (
    <>
      {visible && (
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity, pointerEvents: 'none', zIndex }}
        />
      )}
      <button
        type="button"
        onClick={() => setVisible((next) => !next)}
        className="absolute right-4 top-4 rounded-full bg-black/70 px-4 py-2 text-xs font-black text-white"
        style={{ zIndex: zIndex + 1 }}
      >
        {visible ? 'Hide ref' : 'Show ref'}
      </button>
    </>
  );
}
