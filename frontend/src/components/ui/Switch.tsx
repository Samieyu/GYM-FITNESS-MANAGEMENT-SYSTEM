import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SwitchProps {
  id?: string;
  label?: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}) => {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={twMerge(clsx('flex items-center justify-between gap-4 min-h-[44px] py-1 text-left', className))}>
      {(label || description) && (
        <label htmlFor={switchId} className="cursor-pointer space-y-0.5 pr-2 select-none">
          {label && (
            <span className="block text-sm font-semibold text-content-primary">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-xs text-content-secondary">
              {description}
            </span>
          )}
        </label>
      )}
      <SwitchPrimitive.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={clsx(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-[#FF6B00]' : 'bg-surface-elevated border-border-strong'
        )}
      >
        <SwitchPrimitive.Thumb
          className={clsx(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  );
};
