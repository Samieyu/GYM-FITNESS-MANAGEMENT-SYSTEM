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
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-surface/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleNav('home')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleNav('home');
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-[#0E1116] flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="font-display text-xl font-black tracking-tight text-content-primary flex items-center gap-1 leading-none">
              SWEATBOX <span className="text-[#FF6B00]">FITNESS</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-content-secondary block mt-0.5">
              Premium Athletic Gym
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
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
            onClick={() => handleNav('plans')}
            className={clsx(
              'px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px]',
              activeTab === 'plans'
                ? 'bg-surface-elevated text-[#FF6B00]'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated/50'
            )}
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
        <div className="hidden md:flex items-center gap-3">
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
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenRegister}
            className="text-xs px-3 min-h-[38px]"
          >
            Sign Up
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-content-primary hover:bg-surface-elevated border border-border-subtle transition focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Accessible Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-strong bg-surface px-4 py-5 space-y-3 animate-fadeIn text-left">
          <nav className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => handleNav('home')}
              className={clsx(
                'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold min-h-[44px] transition text-left',
                activeTab === 'home'
                  ? 'bg-surface-elevated text-[#FF6B00]'
                  : 'text-content-primary hover:bg-surface-elevated/50'
              )}
            >
              <span>Home Overview</span>
              {activeTab === 'home' && <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
            </button>

            <button
              type="button"
              onClick={() => handleNav('plans')}
              className={clsx(
                'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold min-h-[44px] transition text-left',
                activeTab === 'plans'
                  ? 'bg-surface-elevated text-[#FF6B00]'
                  : 'text-content-primary hover:bg-surface-elevated/50'
              )}
            >
              <span>Membership Plans & Pricing</span>
              {activeTab === 'plans' && <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
            </button>

            <button
              type="button"
              onClick={() => handleNav('classes')}
              className={clsx(
                'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold min-h-[44px] transition text-left',
                activeTab === 'classes'
                  ? 'bg-surface-elevated text-[#FF6B00]'
                  : 'text-content-primary hover:bg-surface-elevated/50'
              )}
            >
              <span>Group Classes Timetable</span>
              {activeTab === 'classes' && <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
            </button>

            <button
              type="button"
              onClick={handleTrainersClick}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-content-primary hover:bg-surface-elevated/50 min-h-[44px] transition text-left"
            >
              <span>Certified Trainers</span>
              <Sparkles className="w-4 h-4 text-content-muted" />
            </button>
          </nav>

          <div className="pt-3 border-t border-border-subtle flex flex-col gap-2.5">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              leftIcon={<User className="w-4 h-4" />}
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
            >
              Create Free Account
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
