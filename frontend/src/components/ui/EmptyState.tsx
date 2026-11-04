import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border-strong bg-surface/50 max-w-md mx-auto',
          className
        )
      )}
    >
      {icon && (
        <div className="p-4 rounded-2xl bg-surface-elevated text-[#FF6B00] mb-4 border border-border-subtle shadow-sm">
          {icon}
        </div>
      )}
      <h4 className="text-lg font-bold text-content-primary mb-1.5">{title}</h4>
      <p className="text-xs sm:text-sm text-content-secondary max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
