import React from 'react';
import { AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, disabled, ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-content-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          className={twMerge(
            clsx(
              'w-full min-h-[96px] px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
              'bg-surface border border-border-subtle text-content-primary placeholder:text-content-muted',
              'focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]',
              'disabled:opacity-50 disabled:cursor-not-allowed resize-y',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
