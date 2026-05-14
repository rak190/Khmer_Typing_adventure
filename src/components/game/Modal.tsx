import type { ReactNode } from 'react';
import GameModal from '../game-ui/GameModal';

type ModalProps = {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
};

export default function Modal({ title, children, open, onClose }: ModalProps) {
  return (
    <GameModal open={open} title={title} rewardIcon="star" onClose={onClose} onAction={onClose} actionLabel="Awesome!">
      {children}
    </GameModal>
  );
}
