import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPlayerControlStore, EMPTY_MOVEMENT } from '../systems/gameplayState';
import type { GameMode, MovementInput } from '../types';

export type { MovementInput };

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    target.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT'
  );
}

export function usePlayerControls(
  mode: GameMode,
  onInteract?: () => void,
  onEscape?: () => void,
  isModalOpen = false,
): MovementInput {
  const canMove = (mode === 'exploration' || mode === 'completed') && !isModalOpen;
  const [store] = useState(() => createPlayerControlStore(canMove));

  const onInteractRef = useRef(onInteract);
  const onEscapeRef = useRef(onEscape);
  const modeRef = useRef(mode);
  const isModalOpenRef = useRef(isModalOpen);

  useEffect(() => {
    onInteractRef.current = onInteract;
    onEscapeRef.current = onEscape;
    modeRef.current = mode;
    isModalOpenRef.current = isModalOpen;
  });

  useEffect(() => {
    store.setCanMove(canMove);
  }, [canMove, store]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableElement(event.target)) return;

      // In typing mode, TypingOverlay owns keyboard events; only clear held movement keys
      if (modeRef.current === 'typing') {
        store.clearKeys();
        return;
      }

      if (event.code === 'Escape') {
        event.preventDefault();
        store.clearKeys();
        onEscapeRef.current?.();
        return;
      }

      if (isModalOpenRef.current) {
        store.clearKeys();
        return;
      }

      if (event.code === 'KeyE' && modeRef.current === 'exploration') {
        event.preventDefault();
        store.clearKeys();
        onInteractRef.current?.();
        return;
      }

      if (store.handleKeyDown(event.code)) {
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Always process keyup even if mode changed so released keys never stay latched
      store.handleKeyUp(event.code);
    };

    const handleBlur = () => {
      store.clearKeys();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        store.clearKeys();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [store]);

  const movement = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => EMPTY_MOVEMENT,
  );

  return canMove ? movement : EMPTY_MOVEMENT;
}
