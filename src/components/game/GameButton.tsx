import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import GameUIButton from '../game-ui/GameButton';

type LegacyGameButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'gold' | 'purple' | 'danger' | 'ghost' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
};

const variantMap = {
  primary: 'green',
  secondary: 'white',
  gold: 'gold',
  purple: 'purple',
  danger: 'red',
  ghost: 'white',
  blue: 'blue',
} as const;

export default function GameButton({ icon, variant = 'primary', size = 'md', ...props }: LegacyGameButtonProps) {
  return <GameUIButton leftIcon={icon} variant={variantMap[variant]} size={size} {...props} />;
}
