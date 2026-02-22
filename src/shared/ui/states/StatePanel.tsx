import React from 'react';
import { Icon } from '@shared/ui/icons';
import { Card } from '@shared/ui/primitives';
import { cn } from '@shared/lib/utils/cn';

type StateVariant = 'loading' | 'empty' | 'error' | 'success';

interface StatePanelProps {
  variant: StateVariant;
  title: string;
  description?: string;
  className?: string;
}

const variantStyles: Record<StateVariant, { icon: string; tone: string }> = {
  loading: { icon: 'loading', tone: 'text-primary' },
  empty: { icon: 'info-circle', tone: 'text-muted-fg' },
  error: { icon: 'x-mark', tone: 'text-danger' },
  success: { icon: 'check', tone: 'text-success' },
};

export const StatePanel: React.FC<StatePanelProps> = ({
  variant,
  title,
  description,
  className,
}) => {
  const { icon, tone } = variantStyles[variant];

  return (
    <Card className={cn('rounded-2xl border-border bg-muted/20 px-6 py-10 text-center shadow-none', className)}>
      <div className={cn('mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface', tone)}>
        <Icon
          name={icon as any}
          className={cn('h-6 w-6', variant === 'loading' && 'animate-spin')}
        />
      </div>
      <h3 className="text-lg font-black uppercase tracking-tight text-fg">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-fg">{description}</p>}
    </Card>
  );
};
