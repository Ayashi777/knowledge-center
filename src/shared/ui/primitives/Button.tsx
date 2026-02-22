import React from 'react';
import { cn } from '@shared/lib/utils/cn';

type ButtonVariant = 'primary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-fg shadow-soft hover:brightness-105 active:brightness-95',
  ghost:
    'bg-transparent text-muted-fg hover:bg-muted hover:text-fg',
  outline:
    'bg-surface text-fg border border-border hover:bg-muted',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-sm',
  icon: 'h-10 w-10 p-0',
};

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all',
      'focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50',
      variantClass[variant],
      sizeClass[size],
      className
    )}
    {...props}
  />
);
