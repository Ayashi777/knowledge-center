import React from 'react';
import { cn } from '@shared/lib/utils/cn';

interface ModalOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in',
      className
    )}
    {...props}
  />
);

interface ModalPanelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalPanel: React.FC<ModalPanelProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'relative w-full overflow-hidden rounded-[2rem] border border-border bg-surface shadow-soft',
      className
    )}
    {...props}
  />
);
