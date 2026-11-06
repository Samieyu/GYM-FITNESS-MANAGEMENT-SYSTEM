import React, { useState } from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  CreditCard,
  Scale,
  Sparkles,
  QrCode,
  UserPlus,
  BarChart3,
  Wrench,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { User } from '../../api/auth';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from '../ui/BottomSheet';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/Tooltip';
import { clsx } from 'clsx';

export interface StaffNavigationProps {
  currentUser: User | null;
  isPaidMember?: boolean;
  activeTab: 'home' | 'plans' | 'classes';
  onSelectTab: (tab: 'home' | 'plans' | 'classes') => void;
  onOpenWorkout: () => void;
  onOpenProgress: () => void;
  onOpenAiCoach: () => void;
  onOpenQrPass: () => void;
  onOpenScanner?: () => void;
  onOpenWalkin?: () => void;
  onOpenEquipment?: () => void;
  onOpenAnalytics?: () => void;
  onOpenStaff?: () => void;
  onLogout: () => void;
}

export const StaffNavigation: React.FC<StaffNavigationProps> = ({
  currentUser,
  isPaidMember = false,
  activeTab,
  onSelectTab,
  onOpenWorkout,
  onOpenProgress,
  onOpenAiCoach,
  onOpenQrPass,
  onOpenScanner,
  onOpenWalkin,
  onOpenEquipment,
  onOpenAnalytics,
  onOpenStaff,
  onLogout,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!currentUser) return null;

  const role = currentUser.role;
  const isPaid = role === 'member' ? Boolean(isPaidMember) : true;

  const aiTooltip =
    role === 'admin'
      ? 'Management AI Consultant'
      : role === 'trainer'
      ? 'Trainer Coaching Co-Pilot'
      : 'SWEATBOX AI Fitness Coach';

  // Navigation Items Definitions
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      sublabel: 'መነሻ ገጽ',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      active: activeTab === 'home',
      visible: role !== 'member' || isPaid,
      onClick: () => onSelectTab('home'),
    },
    {
      id: 'workout',
      label: role === 'trainer' ? 'Workout Builder' : 'Workout Routines',
      sublabel: role === 'trainer' ? 'የልምምድ እቅድ ማዘጋጃ' : 'ልምምድ',
      icon: <Dumbbell className="w-5 h-5 shrink-0" />,
      active: false,
      visible: (role === 'member' && isPaid) || role === 'trainer',
      onClick: onOpenWorkout,
    },
    {
      id: 'classes',
      label: 'Group Classes',
      sublabel: 'ክፍሎች',
      icon: <Calendar className="w-5 h-5 shrink-0" />,
      active: activeTab === 'classes',
      visible: role !== 'reception' && (role !== 'member' || isPaid),
      onClick: () => onSelectTab('classes'),
    },
    {
      id: 'plans',
      label: role === 'admin' ? 'Manage Plans' : 'Plans & Pricing',
      sublabel: 'የደንበኝነት እቅዶች',
      icon: <CreditCard className="w-5 h-5 shrink-0" />,
      active: activeTab === 'plans' || (role === 'member' && !isPaid),
      visible: role === 'admin' || role === 'trainer' || (role === 'member' && !isPaid),
      onClick: () => onSelectTab('plans'),
    },
    {
      id: 'progress',
      label: 'Body Transformation',
      sublabel: 'ክብደትና ልኬት',
      icon: <Scale className="w-5 h-5 shrink-0" />,
      active: false,
      visible: (role === 'member' && isPaid) || role === 'trainer',
      onClick: onOpenProgress,
    },
    {
      id: 'qrpass',
      label: 'Digital QR Pass',
      sublabel: 'ዲጂታል መግቢያ',
      icon: <QrCode className="w-5 h-5 shrink-0" />,
      active: false,
      visible: role === 'member' && isPaid,
      onClick: onOpenQrPass,
    },
    {
      id: 'scanner',
      label: 'Front Desk Scanner',
      sublabel: 'መግቢያ መፈተሻ',
      icon: <QrCode className="w-5 h-5 shrink-0" />,
      active: false,
      visible: (role === 'reception' || role === 'admin') && Boolean(onOpenScanner),
      onClick: onOpenScanner,
    },
    {
      id: 'walkin',
      label: 'Walk-In Registration',
      sublabel: 'አዲስ ደንበኛ ምዝገባ',
      icon: <UserPlus className="w-5 h-5 shrink-0" />,
      active: false,
      visible: (role === 'reception' || role === 'admin') && Boolean(onOpenWalkin),
      onClick: onOpenWalkin,
    },
    {
      id: 'equipment',
      label: 'Equipment Inventory',
      sublabel: 'እቃዎችና ጥገና',
      icon: <Wrench className="w-5 h-5 shrink-0" />,
      active: false,
      visible: (role === 'admin' || role === 'trainer') && Boolean(onOpenEquipment),
      onClick: onOpenEquipment,
    },
    {
      id: 'staff',
      label: 'Staff Management',
      sublabel: 'የሰራተኞች አስተዳደር',
      icon: <Shield className="w-5 h-5 shrink-0" />,
      active: false,
      visible: role === 'admin' && Boolean(onOpenStaff),
      onClick: onOpenStaff,
    },
    {
      id: 'analytics',
      label: 'Financial Analytics',
      sublabel: 'ስታቲስቲክስ',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
      active: false,
      visible: role === 'admin' && Boolean(onOpenAnalytics),
      onClick: onOpenAnalytics,
    },
    {
      id: 'ai',
      label: aiTooltip,
      sublabel: 'AI ረዳት',
      icon: <Sparkles className="w-5 h-5 shrink-0 text-[#FF6B00]" />,
      active: false,
      visible: role !== 'reception' && (role !== 'member' || isPaid),
      onClick: onOpenAiCoach,
    },
  ];

  const visibleItems = navItems.filter((i) => i.visible);

  // Top 4 Primary actions for Mobile bottom bar based on role:
  const mobilePrimaryItems =
    role === 'reception'
      ? visibleItems.slice(0, 3)
      : role === 'trainer'
      ? visibleItems.slice(0, 3)
      : role === 'admin'
      ? visibleItems.slice(0, 3)
      : visibleItems.slice(0, 4);

  return (
    <TooltipProvider>
      {/* 1. DESKTOP COLLAPSIBLE SIDEBAR (>=1024px) */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col justify-between border-r border-border bg-surface/95 backdrop-blur-md py-5 fixed left-0 top-0 bottom-0 z-40 transition-all duration-200 select-none text-left h-screen max-h-screen overflow-visible',
          isExpanded ? 'w-60 px-4' : 'w-20 px-2'
        )}
      >
        {/* Sleek Floating Collapse / Expand Edge Toggle Button (Never clips logo) */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={clsx(
            'absolute top-8 z-50 w-7 h-7 rounded-full bg-surface-elevated border-2 border-border shadow-lg flex items-center justify-center text-text hover:text-primary hover:border-primary transition cursor-pointer',
            isExpanded ? '-right-3.5' : '-right-3.5'
          )}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4 stroke-[2.5]" /> : <ChevronRight className="w-4 h-4 stroke-[2.5]" />}
        </button>

        <div className="flex flex-col min-h-0 flex-1 overflow-hidden space-y-4">
          {/* Logo Brand Header */}
          <div className={clsx('flex items-center shrink-0', isExpanded ? 'gap-3 px-1' : 'justify-center')}>
            <button
              type="button"
              onClick={() => onSelectTab(role === 'member' && !isPaid ? 'plans' : 'home')}
              className={clsx('flex items-center overflow-hidden focus:outline-none group', isExpanded ? 'gap-3' : 'justify-center')}
              title="SWEATBOX Fitness"
            >
              <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black shrink-0 shadow-sm group-hover:scale-105 transition">
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
              </div>
              {isExpanded && (
                <div className="truncate">
                  <span className="font-display text-lg font-black tracking-tight text-text block leading-none">
                    SWEATBOX
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                    {role.toUpperCase()}
                  </span>
                </div>
              )}
            </button>
          </div>
          
          {/* Navigation Items (Scrollable when expanded without clipping footer) */}
          <nav className="flex flex-col gap-1.5 overflow-y-auto min-h-0 flex-1 pr-0.5" aria-label="Staff Desktop Navigation">
            {visibleItems.map((item) => {
              const content = (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className={clsx(
                    'flex items-center gap-3 w-full rounded-xl transition min-h-[44px]',
                    isExpanded ? 'px-3 py-2.5' : 'justify-center py-2.5',
                    item.active
                      ? 'bg-[#FF6B00] text-[#0E1116] font-bold shadow-sm'
                      : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated'
                  )}
                  aria-label={item.label}
                >
                  {item.icon}
                  {isExpanded && (
                    <div className="truncate">
                      <span className="text-xs font-bold block leading-tight">{item.label}</span>
                      <span className="text-[10px] opacity-75 font-normal block">{item.sublabel}</span>
                    </div>
                  )}
                </button>
              );

              return isExpanded ? (
                content
              ) : (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-bold">{item.label}</p>
                    <p className="text-[10px] opacity-75">{item.sublabel}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions (Theme Toggle & Sign Out - Always visible at bottom) */}
        <div className="shrink-0 pt-3 border-t border-border-subtle flex flex-col gap-2 mt-auto">
          {isExpanded ? (
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-content-secondary">Theme</span>
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            className={clsx(
              'flex items-center gap-3 w-full rounded-xl text-content-muted hover:text-red-400 hover:bg-red-500/10 transition min-h-[44px]',
              isExpanded ? 'px-3 py-2.5' : 'justify-center py-2.5'
            )}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="text-xs font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE & TABLET COMPACT BOTTOM BAR (<1024px) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border-strong px-2 py-1 shadow-2xl select-none"
        style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0px))' }}
        aria-label="Staff Mobile Navigation"
      >
        <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
          {mobilePrimaryItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition min-h-[48px]',
                item.active ? 'text-[#FF6B00]' : 'text-content-secondary hover:text-content-primary'
              )}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-[10px] font-bold tracking-tight mt-0.5 line-clamp-1">
                {item.label.split(' ')[0]}
              </span>
            </button>
          ))}

          {/* 4th Action: "More" Drawer Trigger */}
          <BottomSheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <BottomSheetTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-content-secondary hover:text-content-primary transition min-h-[48px]"
                aria-label="Open More Tools Menu"
              >
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-bold tracking-tight mt-0.5">More</span>
              </button>
            </BottomSheetTrigger>
            <BottomSheetContent>
              <BottomSheetHeader>
                <BottomSheetTitle>
                  {role === 'admin'
                    ? 'Admin Operations Suite'
                    : role === 'reception'
                    ? 'Front Desk Tools'
                    : 'Trainer Management Suite'}
                </BottomSheetTitle>
              </BottomSheetHeader>

              <div className="grid grid-cols-2 gap-2.5 py-4">
                {visibleItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      item.onClick?.();
                    }}
                    className={clsx(
                      'flex flex-col items-start p-3.5 rounded-xl border transition text-left min-h-[56px]',
                      item.active
                        ? 'bg-surface-elevated border-[#FF6B00] text-[#FF6B00]'
                        : 'bg-surface border-border-subtle hover:border-border-strong text-content-primary'
                    )}
                  >
                    <div className="mb-1 text-[#FF6B00]">{item.icon}</div>
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                    <span className="text-[10px] text-content-secondary mt-0.5">{item.sublabel}</span>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <span className="text-xs font-semibold text-content-secondary">Theme Toggle</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onLogout();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </BottomSheetContent>
          </BottomSheet>
        </div>
      </nav>
    </TooltipProvider>
  );
};
