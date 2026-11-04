import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  centerText?: string | number;
  centerSubtext?: string;
  color?: string; // e.g. '#FF6B00'
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  centerText,
  centerSubtext,
  color = '#FF6B00',
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      className={twMerge(clsx('relative inline-flex items-center justify-center', className))}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-border-subtle"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center Label */}
      {(centerText !== undefined || centerSubtext) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          {centerText !== undefined && (
            <span className="font-display text-xl sm:text-2xl font-bold text-content-primary tabular-nums leading-none">
              {centerText}
            </span>
          )}
          {centerSubtext && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-content-secondary mt-1">
              {centerSubtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
