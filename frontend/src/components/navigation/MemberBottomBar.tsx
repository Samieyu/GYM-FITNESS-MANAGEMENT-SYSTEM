import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  QrCode,
  Scale,
  Sparkles,
  CreditCard,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/Dropdown';

export interface MemberBottomBarProps {
  activeTab: 'home' | 'plans' | 'classes';
  isPaidMember: boolean;
  userName?: string;
  onSelectTab: (tab: 'home' | 'plans' | 'classes') => void;
  onOpenQrPass: () => void;
  onOpenProgress: () => void;
  onOpenAiCoach: () => void;
  onLogout: () => void;
}

export const MemberBottomBar: React.FC<MemberBottomBarProps> = ({
  activeTab,
  isPaidMember,
  userName = 'Athlete',
  onSelectTab,
  onOpenQrPass,
  onOpenProgress,
  onOpenAiCoach,
  onLogout,
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border-strong px-2 py-1 shadow-2xl select-none"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0px))' }}
      aria-label="Athlete Bottom Navigation"
    >
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {/* 1. Home Dashboard */}
        <button
          type="button"
          onClick={() => onSelectTab(isPaidMember ? 'home' : 'plans')}
          className={clsx(
            'flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition min-h-[48px]',
            activeTab === 'home' && isPaidMember
              ? 'text-[#FF6B00]'
              : 'text-content-secondary hover:text-content-primary'
          )}
          aria-label="Home Dashboard"
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>

        {/* 2. Group Classes */}
        <button
          type="button"
          onClick={() => onSelectTab('classes')}
          className={clsx(
            'flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition min-h-[48px]',
            activeTab === 'classes'
              ? 'text-[#FF6B00]'
              : 'text-content-secondary hover:text-content-primary'
          )}
          aria-label="Classes"
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Classes</span>
        </button>

        {/* 3. CENTER HERO: QR Check-In Pass */}
        {isPaidMember ? (
          <button
            type="button"
            onClick={onOpenQrPass}
            className="flex flex-col items-center justify-center relative -top-3 shrink-0"
            aria-label="Open 60-Second Dynamic QR Pass"
          >
            <div className="w-13 h-13 p-3 rounded-2xl bg-[#FF6B00] text-[#0E1116] shadow-glow flex items-center justify-center font-black active:scale-95 transition-transform">
              <QrCode className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[9px] font-bold text-[#FF6B00] uppercase tracking-wider mt-0.5">
              QR Pass
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectTab('plans')}
            className="flex flex-col items-center justify-center relative -top-3 shrink-0"
            aria-label="Choose Plan"
          >
            <div className="w-13 h-13 p-3 rounded-2xl bg-amber-500 text-[#0E1116] shadow-lg flex items-center justify-center font-black active:scale-95 transition-transform">
              <CreditCard className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mt-0.5">
              Join
            </span>
          </button>
        )}

        {/* 4. Body Progress */}
        <button
          type="button"
          onClick={onOpenProgress}
          disabled={!isPaidMember}
          className={clsx(
            'flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition min-h-[48px]',
            !isPaidMember
              ? 'opacity-40 cursor-not-allowed text-content-muted'
              : 'text-content-secondary hover:text-content-primary'
          )}
          aria-label="Body Progress"
        >
          <Scale className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Progress</span>
        </button>

        {/* 5. AI Coach */}
        <button
          type="button"
          onClick={onOpenAiCoach}
          disabled={!isPaidMember}
          className={clsx(
            'flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition min-h-[48px]',
            !isPaidMember
              ? 'opacity-40 cursor-not-allowed text-content-muted'
              : 'text-content-secondary hover:text-content-primary'
          )}
          aria-label="AI Coach"
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-[#FF6B00]" />
          <span className="text-[10px] font-bold tracking-tight">AI Coach</span>
        </button>

        {/* 6. Profile & Payments Dropdown Sheet */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex flex-col items-center justify-center px-1.5 py-1 rounded-xl text-content-secondary hover:text-content-primary transition min-h-[48px]"
              aria-label="More Athlete Options"
            >
              <UserIcon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold tracking-tight">Profile</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={8} className="w-56 mb-2">
            <div className="px-3 py-2 border-b border-border-subtle">
              <p className="text-xs font-bold text-content-primary">{userName}</p>
              <p className="text-[10px] text-content-secondary uppercase font-semibold">
                {isPaidMember ? 'Active Athlete Member' : 'Subscription Required'}
              </p>
            </div>
            <DropdownMenuItem onClick={() => onSelectTab('plans')}>
              <CreditCard className="w-4 h-4 text-[#FF6B00]" />
              <span>Membership Plans & Billing</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={onLogout}>
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
