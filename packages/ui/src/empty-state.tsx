import * as React from 'react';
import { cn } from './utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-display-sm text-foreground mb-1">{title}</h3>
      {description && <p className="text-body-sm text-muted-foreground max-w-md mb-4">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
