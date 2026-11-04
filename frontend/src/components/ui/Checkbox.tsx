import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, disabled, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label
        htmlFor={inputId}
        className={clsx(
          'flex items-start gap-3 min-h-[44px] py-1 cursor-pointer select-none text-left',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={twMerge(
              clsx(
                'w-5 h-5 rounded-sm border transition-all duration-150 flex items-center justify-center',
                checked
                  ? 'bg-[#FF6B00] border-[#FF6B00] text-[#0E1116]'
                  : 'bg-surface border-border-strong text-transparent hover:border-[#FF6B00]',
                className
              )
            )}
          >
            <Check className={clsx('w-3.5 h-3.5 stroke-[3]', checked ? 'opacity-100' : 'opacity-0')} />
          </div>
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <span className="block text-sm font-medium text-content-primary">
                {label}
              </span>
            )}
            {description && (
              <span className="block text-xs text-content-secondary">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
