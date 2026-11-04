import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  highlight?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  trend,
  highlight = false,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'p-4 sm:p-5 rounded-xl border transition-all text-left flex flex-col justify-between',
          highlight
            ? 'bg-surface-elevated border-[#FF6B00]/60 shadow-glow'
            : 'bg-surface border-border-subtle shadow-sm',
          className
        )
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-content-secondary line-clamp-1">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-surface-elevated text-[#FF6B00] shrink-0 border border-border-subtle">
            {icon}
          </div>
        )}
      </div>

      <div className="my-2 flex items-baseline gap-1.5">
        <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-content-primary tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-content-secondary">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle/50">
        {trend ? (
          <div
            className={clsx(
              'flex items-center gap-1 font-semibold text-xs',
              trend.direction === 'up' && 'text-emerald-400',
              trend.direction === 'down' && 'text-rose-400',
              trend.direction === 'neutral' && 'text-content-secondary'
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
            {trend.direction === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-content-muted font-normal ml-0.5">{trend.label}</span>
            )}
          </div>
        ) : subtext ? (
          <span className="text-content-muted">{subtext}</span>
        ) : (
          <span className="text-transparent">.</span>
        )}
      </div>
    </div>
  );
};
