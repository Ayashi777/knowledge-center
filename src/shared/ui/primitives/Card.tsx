import React from 'react';
import { cn } from '@shared/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div
    className={cn(
      'rounded-xl border border-border bg-surface shadow-soft',
      className
    )}
    {...props}
  />
);
