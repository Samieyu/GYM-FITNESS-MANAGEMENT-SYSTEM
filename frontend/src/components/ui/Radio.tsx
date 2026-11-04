import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  className,
}) => {
  return (
    <div className={twMerge(clsx('space-y-2', className))}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const id = `${name}-${opt.value}`;

        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={clsx(
              'flex items-start gap-3 min-h-[44px] p-3 rounded-lg border transition-all cursor-pointer text-left',
              isSelected
                ? 'bg-surface-elevated border-[#FF6B00]'
                : 'bg-surface border-border-subtle hover:border-border-strong',
              opt.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                disabled={opt.disabled}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <div
                className={clsx(
                  'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                  isSelected
                    ? 'border-[#FF6B00] bg-transparent'
                    : 'border-border-strong bg-surface'
                )}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="block text-sm font-semibold text-content-primary">
                {opt.label}
              </span>
              {opt.description && (
                <span className="block text-xs text-content-secondary">
                  {opt.description}
                </span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};
