import React, { useState } from 'react';
import { Dumbbell, Menu, X, ArrowRight, User, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { clsx } from 'clsx';

export interface PublicHeaderProps {
  activeTab: 'home' | 'plans' | 'classes';
  onSelectTab: (tab: 'home' | 'plans' | 'classes') => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onScrollToTrainers?: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenLogin,
  onOpenRegister,
  onScrollToTrainers,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: 'home' | 'plans' | 'classes') => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const handleTrainersClick = () => {
    setMobileMenuOpen(false);
    if (activeTab !== 'home') {
      onSelectTab('home');
      setTimeout(() => {
        onScrollToTrainers?.();
      }, 100);
    } else {
      onScrollToTrainers?.();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full max-w-full border-b border-border-subtle bg-surface/95 backdrop-blur-md transition-colors box-border">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 w-full box-border">
        {/* Brand Logo */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleNav('home')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleNav('home');
          }}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0 min-w-max"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#FF6B00] text-[#0E1116] flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <div className="text-left shrink-0">
            <span className="font-display text-base sm:text-xl font-black tracking-tight flex items-center gap-1.5 leading-none whitespace-nowrap">
              <span className="text-slate-900 dark:text-white" style={{ color: 'var(--text-primary)' }}>POWERZONE</span> <span className="text-[#FF6B00]">FITNESS</span>
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-content-secondary hidden sm:block mt-0.5 whitespace-nowrap">
              Premium Athletic Gym
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          <button
            type="button"
            onClick={() => handleNav('home')}
            className={clsx(
              'px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px]',
              activeTab === 'home'
                ? 'bg-surface-elevated text-[#FF6B00]'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated/50'
            )}
          >
            Home
          </button>
          <button
            type="button"
            onClick={onOpenRegister}
            className="px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-content-secondary hover:text-content-primary hover:bg-surface-elevated/50 transition-colors min-h-[44px]"
          >
            Plans & Pricing
          </button>
          <button
            type="button"
            onClick={() => handleNav('classes')}
            className={clsx(
              'px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px]',
              activeTab === 'classes'
                ? 'bg-surface-elevated text-[#FF6B00]'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated/50'
            )}
          >
            Classes
          </button>
          <button
            type="button"
            onClick={handleTrainersClick}
            className="px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-content-secondary hover:text-content-primary hover:bg-surface-elevated/50 transition-colors min-h-[44px]"
          >
            Trainers
          </button>
        </nav>

        {/* Desktop Action & Theme Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="md"
            onClick={onOpenLogin}
            leftIcon={<User className="w-4 h-4" />}
          >
            Log In
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onOpenRegister}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign Up
          </Button>
        </div>

        {/* Mobile View Controls */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle />
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenRegister}
            className="text-xs px-2.5 sm:px-3 py-1 min-h-[34px] sm:min-h-[38px] font-bold shrink-0 hidden min-[360px]:inline-flex"
          >
            Sign Up
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-900 dark:text-white hover:bg-surface-elevated border border-border-subtle transition focus:outline-none shrink-0"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Accessible Overlay) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border-strong bg-surface px-3.5 sm:px-4 py-4 space-y-3 animate-fadeIn text-left w-full max-w-full overflow-hidden box-border">
          <nav className="flex flex-col space-y-1 w-full">
            <button
              type="button"
              onClick={() => handleNav('home')}
              className={clsx(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold min-h-[44px] transition text-left w-full',
                activeTab === 'home'
                  ? 'bg-surface-elevated text-[#FF6B00]'
                  : 'text-slate-800 dark:text-slate-100 hover:bg-surface-elevated/50'
              )}
            >
              <span>Home</span>
              {activeTab === 'home' && <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold min-h-[44px] transition text-left text-slate-800 dark:text-slate-100 hover:bg-surface-elevated/50 w-full"
            >
              <span>Membership Plans & Pricing</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('classes')}
              className={clsx(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold min-h-[44px] transition text-left w-full',
                activeTab === 'classes'
                  ? 'bg-surface-elevated text-[#FF6B00]'
                  : 'text-slate-800 dark:text-slate-100 hover:bg-surface-elevated/50'
              )}
            >
              <span>Group Classes Timetable</span>
              {activeTab === 'classes' && <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
            </button>

            <button
              type="button"
              onClick={handleTrainersClick}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-surface-elevated/50 min-h-[44px] transition text-left w-full"
            >
              <span>Certified Trainers</span>
              <Sparkles className="w-4 h-4 text-content-muted" />
            </button>
          </nav>

          <div className="pt-3 border-t border-border-subtle flex flex-col gap-2 w-full">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              leftIcon={<User className="w-4 h-4" />}
              className="w-full justify-center min-h-[44px] font-bold"
            >
              Sign In to Account
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full justify-center min-h-[44px] font-bold"
            >
              Sign Up / Join Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
