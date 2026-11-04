import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from './Skeleton';

export interface ChartWrapperProps {
  title: string;
  description?: string;
  rangeTabs?: { label: string; value: string }[];
  activeRange?: string;
  onRangeChange?: (range: string) => void;
  isLoading?: boolean;
  srSummary?: string; // Accessible summary for screen readers
  children: React.ReactNode;
  className?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  description,
  rangeTabs,
  activeRange,
  onRangeChange,
  isLoading = false,
  srSummary,
  children,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'p-5 sm:p-6 rounded-2xl border border-border-subtle bg-surface shadow-sm space-y-4 text-left',
          className
        )
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-content-primary">{title}</h4>
          {description && (
            <p className="text-xs text-content-secondary mt-0.5">{description}</p>
          )}
        </div>

        {rangeTabs && onRangeChange && (
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-elevated border border-border-subtle self-start sm:self-auto">
            {rangeTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onRangeChange(tab.value)}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors min-h-[32px]',
                  activeRange === tab.value
                    ? 'bg-[#FF6B00] text-[#0E1116]'
                    : 'text-content-secondary hover:text-content-primary'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {srSummary && <p className="sr-only">{srSummary}</p>}

      <div className="relative min-h-[220px] w-full flex items-center justify-center">
        {isLoading ? (
          <div className="w-full space-y-3">
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
