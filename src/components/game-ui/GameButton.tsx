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
  gold: 'from-[#FFE778] via-[#FFC23A] to-[#EC8B15] border-[#A85D05] text-[#542B00]',
  green: 'from-[#A9F76A] via-[#3DD15B] to-[#138E44] border-[#0D7838] text-white',
  blue: 'from-[#69CFFF] via-[#207FE5] to-[#0753AA] border-[#064B9A] text-white',
  purple: 'from-[#C9A7FF] via-[#8059F0] to-[#5632BD] border-[#4B2DAA] text-white',
  red: 'from-[#FF969B] via-[#EF4E54] to-[#B92430] border-[#A41F29] text-white',
  white: 'from-white via-[#F9FCFF] to-[#DDEFFF] border-[#6AA7E8] text-[#174C90]',
};

const sizes = {
  sm: 'min-h-10 rounded-[14px] px-4 py-2 text-sm',
  md: 'min-h-12 rounded-[16px] px-5 py-3 text-base',
  lg: 'min-h-14 rounded-[18px] px-7 py-4 text-xl',
  xl: 'min-h-16 rounded-[22px] px-9 py-5 text-2xl',
};

export default function GameButton({
  children,
  variant = 'green',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  disabled,
  ...props
}: GameButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
      whileTap={disabled ? undefined : { y: 2, scale: 0.98 }}
      className={cn(
        'pointer-events-auto relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden border-[2px] bg-gradient-to-b font-black shadow-[inset_0_-4px_0_rgba(0,0,0,.16),0_8px_14px_rgba(0,0,0,.16)] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE66B]/70 disabled:cursor-not-allowed disabled:opacity-60 before:pointer-events-none before:absolute before:inset-x-4 before:top-1.5 before:h-1/3 before:rounded-full before:bg-white/28 before:content-[""]',
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
