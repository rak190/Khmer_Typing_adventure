import { useEffect, useRef, useState } from 'react';
import type { GameMode } from '../types';

export type MovementInput = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

export function usePlayerControls(mode: GameMode, onInteract?: () => void, onEscape?: () => void) {
  const [movement, setMovement] = useState<MovementInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const keysRef = useRef<Record<string, boolean>>({});
  const onInteractRef = useRef(onInteract);
  const onEscapeRef = useRef(onEscape);
  const modeRef = useRef(mode);

  useEffect(() => {
    onInteractRef.current = onInteract;
    onEscapeRef.current = onEscape;
    modeRef.current = mode;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Never intercept keys when typing mode is active
      if (modeRef.current === 'typing') {
        if (event.code === 'Escape') {
          event.preventDefault();
          onEscapeRef.current?.();
        }
        return;
      }

      if (event.code === 'Escape') {
        event.preventDefault();
        onEscapeRef.current?.();
        return;
      }

      if (event.code === 'KeyE') {
        event.preventDefault();
        onInteractRef.current?.();
        return;
      }

      if (['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
        keysRef.current[event.code] = true;

        setMovement({
          forward: Boolean(keysRef.current['KeyW'] || keysRef.current['ArrowUp']),
          backward: Boolean(keysRef.current['KeyS'] || keysRef.current['ArrowDown']),
          left: Boolean(keysRef.current['KeyA'] || keysRef.current['ArrowLeft']),
          right: Boolean(keysRef.current['KeyD'] || keysRef.current['ArrowRight']),
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (modeRef.current === 'typing') return;

      if (['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight'].includes(event.code)) {
        keysRef.current[event.code] = false;

        setMovement({
          forward: Boolean(keysRef.current['KeyW'] || keysRef.current['ArrowUp']),
          backward: Boolean(keysRef.current['KeyS'] || keysRef.current['ArrowDown']),
          left: Boolean(keysRef.current['KeyA'] || keysRef.current['ArrowLeft']),
          right: Boolean(keysRef.current['KeyD'] || keysRef.current['ArrowRight']),
        });
      }
    };

    const handleBlur = () => {
      keysRef.current = {};
      setMovement({
        forward: false,
        backward: false,
        left: false,
        right: false,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const canMove = mode === 'exploration' || mode === 'completed';
  return canMove ? movement : { forward: false, backward: false, left: false, right: false };
}
