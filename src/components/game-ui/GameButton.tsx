import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type GameButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children?: ReactNode;
  variant?: 'gold' | 'green' | 'blue' | 'purple' | 'red' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variants = {
  gold: 'from-[#FFF47C] via-[#FFC93F] to-[#F28C16] border-[#A85D05] text-[#542B00]',
  green: 'from-[#B9FF69] via-[#4DDB63] to-[#159447] border-[#0D7838] text-white',
  blue: 'from-[#7BD8FF] via-[#248CEC] to-[#0758B8] border-[#064B9A] text-white',
  purple: 'from-[#D2ACFF] via-[#8E65FF] to-[#5B35CC] border-[#4B2DAA] text-white',
  red: 'from-[#FF9CA1] via-[#FF5A5F] to-[#C92734] border-[#A41F29] text-white',
  white: 'from-white via-[#F9FCFF] to-[#DDEFFF] border-[#6AA7E8] text-[#174C90]',
};

const sizes = {
  sm: 'min-h-10 rounded-2xl px-4 py-2 text-sm',
  md: 'min-h-12 rounded-[18px] px-5 py-3 text-base',
  lg: 'min-h-14 rounded-[22px] px-7 py-4 text-xl',
  xl: 'min-h-16 rounded-[26px] px-9 py-5 text-2xl',
};

export default function GameButton({
  children,
  variant = 'green',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  ...props
}: GameButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ y: 2, scale: 0.98 }}
      className={cn(
        'pointer-events-auto relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden border-[3px] bg-gradient-to-b font-black shadow-[inset_0_-6px_0_rgba(0,0,0,.18),0_10px_18px_rgba(0,0,0,.2)] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70 disabled:cursor-not-allowed disabled:opacity-60 before:pointer-events-none before:absolute before:inset-x-4 before:top-1.5 before:h-1/3 before:rounded-full before:bg-white/35 before:content-[""]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {leftIcon && <span className="relative z-10 grid place-items-center">{leftIcon}</span>}
      <span className="relative z-10">{children}</span>
      {rightIcon && <span className="relative z-10 grid place-items-center">{rightIcon}</span>}
    </motion.button>
  );
}
