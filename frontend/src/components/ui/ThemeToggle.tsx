import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={twMerge(
        clsx(
          'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150',
          'bg-surface-elevated hover:bg-surface border border-border-subtle hover:border-[#FF6B00]',
          'text-content-secondary hover:text-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]',
          className
        )
      )}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
};
