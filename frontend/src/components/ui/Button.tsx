import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#FF6B00] hover:bg-[#FF8533] active:bg-[#CC5500] text-[#0E1116] shadow-sm hover:shadow-glow focus:ring-[#FF6B00]',
      secondary:
        'bg-surface-elevated hover:bg-surface border border-border-subtle hover:border-border-strong text-content-primary focus:ring-border-strong',
      ghost:
        'bg-transparent hover:bg-surface-elevated text-content-secondary hover:text-content-primary focus:ring-border-subtle',
      destructive:
        'bg-red-600 hover:bg-red-500 text-white shadow-sm focus:ring-red-600',
      outline:
        'bg-transparent border border-border-strong text-content-primary hover:border-[#FF6B00] hover:text-[#FF6B00] focus:ring-[#FF6B00]',
    };

    // Minimum 44px on mobile (size md) for WCAG touch targets
    const sizes = {
      sm: 'text-xs h-9 px-3 rounded-md gap-1.5 min-h-[36px]',
      md: 'text-sm h-11 px-5 rounded-lg gap-2 min-h-[44px]',
      lg: 'text-base h-13 px-7 rounded-xl gap-2.5 min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(
            baseStyles,
            variants[variant],
            sizes[size],
            fullWidth && 'w-full',
            className
          )
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
