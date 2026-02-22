import React from 'react';
import { cn } from '@shared/lib/utils/cn';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg',
      'placeholder:text-muted-fg focus-visible:outline-none focus-visible:shadow-focus',
      className
    )}
    {...props}
  />
));

Input.displayName = 'Input';
