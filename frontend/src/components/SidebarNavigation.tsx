import React from 'react';
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
} from 'lucide-react';
import { User } from '../api/auth';

interface SidebarNavigationProps {
  currentUser: User | null;
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
  onLogout: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  currentUser,
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
  onLogout,
}) => {
  if (!currentUser) return null;

  const role = currentUser.role;

  // AI assistant button tooltip & styling based on persona
  const aiTooltip =
    role === 'admin'
      ? 'Management AI Consultant • የአስተዳደር አማካሪ'
      : role === 'trainer'
      ? 'Trainer AI Coaching Co-Pilot • የአሰልጣኝ ረዳት'
      : 'Titan AI Fitness Coach • የአካል ብቃት አሰልጣኝ';

  return (
    <aside className="w-20 bg-[#0B0D10] border-r border-slate-900 flex flex-col justify-between items-center py-6 fixed left-0 top-0 bottom-0 z-40 select-none">
      {/* TOP BRAND LOGO */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => onSelectTab('home')}
          className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#B4F82C] shadow-lg shadow-[#B4F82C]/10 hover:scale-105 transition"
          title="Titan Fitness Management System"
        >
          {/* Geometric Triangle Gym Brand Icon */}
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L2 20h20L12 2zm0 4.5l6.5 11.5h-13L12 6.5z" />
          </svg>
        </button>

        {/* PRIMARY VERTICAL NAV ICONS */}
        <nav className="flex flex-col items-center gap-3">
          {/* 1. Home / Dashboard (All roles) */}
          <button
            onClick={() => onSelectTab('home')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
              activeTab === 'home'
                ? 'bg-[#B4F82C] text-slate-950 font-black shadow-md shadow-[#B4F82C]/20 scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Dashboard • መነሻ ገጽ"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>

          {/* 2. Workout Routines (Members and Trainers only, NOT Reception) */}
          {(role === 'member' || role === 'trainer') && (
            <button
              onClick={onOpenWorkout}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title={role === 'trainer' ? 'Workout Plan Builder • የልምምድ እቅድ ማዘጋጃ' : 'Workout Routines • ልምምድ'}
            >
              <Dumbbell className="w-5 h-5" />
            </button>
          )}

          {/* 3. Group Fitness Classes (Member, Trainer, Admin, NOT Reception) */}
          {role !== 'reception' && (
            <button
              onClick={() => onSelectTab('classes')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                activeTab === 'classes'
                  ? 'bg-[#B4F82C] text-slate-950 font-black shadow-md shadow-[#B4F82C]/20 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="Group Classes • ክፍሎች"
            >
              <Calendar className="w-5 h-5" />
            </button>
          )}

          {/* 4. Membership Plans (Admin & Trainer only - Not shown in paid member sidebar) */}
          {(role === 'admin' || role === 'trainer') && (
            <button
              onClick={() => onSelectTab('plans')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                activeTab === 'plans'
                  ? 'bg-[#B4F82C] text-slate-950 font-black shadow-md shadow-[#B4F82C]/20 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title={role === 'admin' ? 'Manage Membership Plans • የእቅድ አስተዳደር' : 'Membership Plans • የደንበኝነት እቅዶች'}
            >
              <CreditCard className="w-5 h-5" />
            </button>
          )}

          {/* 5. Athlete Body Progress (Member & Trainer only, NOT Reception) */}
          {(role === 'member' || role === 'trainer') && (
            <button
              onClick={onOpenProgress}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Body Transformation & Logs • ክብደትና ልኬት"
            >
              <Scale className="w-5 h-5" />
            </button>
          )}

          {/* 6. Dynamic QR Pass (Member only) */}
          {role === 'member' && (
            <button
              onClick={onOpenQrPass}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#B4F82C] hover:bg-slate-900 transition"
              title="Dynamic QR Entrance Pass • ዲጂታል መግቢያ"
            >
              <QrCode className="w-5 h-5" />
            </button>
          )}

          {/* 7. Front Desk Live Scanner (Staff: Reception & Admin) */}
          {(role === 'reception' || role === 'admin') && onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#B4F82C] hover:bg-slate-900 transition"
              title="Front Desk QR Scanner • መግቢያ መፈተሻ"
            >
              <QrCode className="w-5 h-5" />
            </button>
          )}

          {/* 8. Walk-in Registration (Staff: Reception & Admin) */}
          {(role === 'reception' || role === 'admin') && onOpenWalkin && (
            <button
              onClick={onOpenWalkin}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#B4F82C] hover:bg-slate-900 transition"
              title="Walk-in Member Registration • አዲስ ደንበኛ ምዝገባ"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}

          {/* 9. Equipment Inventory & Defects (Staff: Admin & Trainer only - REMOVED from member & reception) */}
          {(role === 'admin' || role === 'trainer') && onOpenEquipment && (
            <button
              onClick={onOpenEquipment}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Equipment & Maintenance • እቃዎችና ጥገና"
            >
              <Wrench className="w-5 h-5" />
            </button>
          )}

          {/* 10. Financial & Attendance Analytics (Admin only, REMOVED from reception) */}
          {role === 'admin' && onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#B4F82C] hover:bg-slate-900 transition"
              title="Financial & Attendance Analytics • ስታቲስቲክስ"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          )}

          {/* 11. Single Merged AI Assistant (Tailored per role: Member, Trainer, Admin; REMOVED from reception) */}
          {role !== 'reception' && (
            <button
              onClick={onOpenAiCoach}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#B4F82C] hover:text-white hover:bg-slate-900 transition group"
              title={aiTooltip}
            >
              <Sparkles className="w-5 h-5 transition group-hover:scale-110" />
            </button>
          )}
        </nav>
      </div>

      {/* BOTTOM ICONS: LOGOUT ONLY (Duplicate Q&A removed) */}
      <div className="flex flex-col items-center">
        <button
          onClick={onLogout}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
          title="Sign Out • ውጣ"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
