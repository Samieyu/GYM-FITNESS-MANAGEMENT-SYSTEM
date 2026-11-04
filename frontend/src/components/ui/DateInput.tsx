import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEthiopianDate } from '../../utils/ethiopianCalendar';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
  showEthiopianEquivalent?: boolean;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      id,
      value,
      showEthiopianEquivalent = true,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `date-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const ethEquivalent = value && showEthiopianEquivalent ? formatEthiopianDate(value as string) : null;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold uppercase tracking-wider text-content-secondary"
            >
              {label}
            </label>
            {ethEquivalent && (
              <span className="text-[11px] font-mono text-[#FF6B00] font-semibold">
                {ethEquivalent}
              </span>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            type="date"
            value={value}
            disabled={disabled}
            className={twMerge(
              clsx(
                'w-full min-h-[44px] px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
                'bg-surface border border-border-subtle text-content-primary',
                'focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                className
              )
            )}
            {...props}
          />
          <div className="absolute right-3.5 flex items-center pointer-events-none text-content-muted">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="flex items-center gap-1.5 text-xs text-red-400 font-medium pt-0.5" role="alert">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : (
          helperText && <p className="text-xs text-content-muted pt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
