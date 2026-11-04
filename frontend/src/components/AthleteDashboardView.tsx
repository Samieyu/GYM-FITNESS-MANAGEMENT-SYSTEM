import React, { useState } from 'react';
import {
  QrCode,
  Sparkles,
  Dumbbell,
  CreditCard,
  Scale,
  Flame,
  Droplets,
  Heart,
  Trophy,
  Clock,
  Bookmark,
  Search,
  RefreshCw,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { User } from '../api/auth';
import { Membership, Payment } from '../api/payments';
import { FitnessClass, ClassBooking } from '../api/classes';
import { Plan } from '../api/plans';
import { formatEthiopianDate, formatEthiopianDateTime } from '../utils/ethiopianCalendar';

interface AthleteDashboardViewProps {
  currentUser: User;
  myMembership: Membership | null;
  myPayments: Payment[];
  classesList: FitnessClass[];
  myBookings: ClassBooking[];
  plans: Plan[];
  onOpenQrPass: () => void;
  onOpenWorkout: () => void;
  onOpenProgress: () => void;
  onOpenAiCoach: () => void;
  onInitiatePayment: (plan: Plan) => void;
  onBookClass: (cls: FitnessClass) => void;
  onCancelBooking: (cls: FitnessClass) => void;
  bookingLoadingId: string | null;
  onRefreshClasses: () => void;
  onVerifyChapaTx: (txRef: string) => void;
  onNavigateTab: (tab: 'plans' | 'classes' | 'home') => void;
}

export const AthleteDashboardView: React.FC<AthleteDashboardViewProps> = ({
  currentUser,
  myMembership,
  myPayments,
  classesList,
  myBookings,
  plans,
  onOpenQrPass,
  onOpenWorkout,
  onOpenProgress,
  onOpenAiCoach,
  onInitiatePayment,
  onBookClass,
  onCancelBooking,
  bookingLoadingId,
  onRefreshClasses,
  onVerifyChapaTx,
  onNavigateTab,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [searchQuery, setSearchQuery] = useState('');

  // Determine greeting based on local time
  const currentHour = new Date().getHours();
  const greetingEn = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const greetingAm = currentHour < 12 ? 'እንደምን አደሩ' : currentHour < 18 ? 'እንደምን ዋሉ' : 'እንደምን አመሹ';

  const todayIso = new Date().toISOString();
  const todayEth = formatEthiopianDate(todayIso);

  // Filter classes matching search query
  const filteredClasses = classesList.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trainer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simulated calendar days for the current month
  const todayDateNum = new Date().getDate();
  const calendarDays = [
    { day: 1, attended: false },
    { day: 2, attended: false },
    { day: 3, attended: false },
    { day: 4, attended: false },
    { day: 5, attended: false },
    { day: 6, attended: false },
    { day: 7, attended: true },
    { day: 8, attended: true },
    { day: 9, attended: true },
    { day: 10, attended: false, denied: true },
    { day: 11, attended: false },
    { day: 12, attended: false },
    { day: 13, attended: false },
    { day: 14, attended: true },
    { day: 15, attended: false },
    { day: 16, attended: false },
    { day: 17, attended: false },
    { day: 18, attended: true },
    { day: 19, attended: true },
    { day: 20, attended: false },
    { day: 21, attended: false },
    { day: 22, attended: false },
    { day: 23, attended: false },
    { day: 24, attended: true },
    { day: 25, attended: false },
    { day: 26, attended: false },
    { day: 27, attended: false },
    { day: 28, attended: false },
    { day: 29, attended: todayDateNum === 29 },
    { day: 30, attended: false },
  ];

  return (
    <div className="w-full space-y-6">
      {/* ATHLETE COMMAND HEADER */}
      <div className="bg-surface rounded-3xl p-5 sm:p-7 shadow-soft border border-border flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-colors">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
              {greetingEn}, {currentUser.firstName}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
              <Calendar className="w-3.5 h-3.5" />
              {todayEth}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-muted flex flex-wrap items-center gap-2">
            <span>Ready for today's session?</span>
            <span className="text-border">•</span>
            <span className="font-medium text-text">{greetingAm}! ዛሬ ጠንክረን እንስራ።</span>
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search classes, workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background border border-border rounded-full text-xs text-text placeholder-text-muted focus:outline-none focus:border-primary w-48 xl:w-60 transition"
            />
          </div>

          {/* Time Range Filter Pill */}
          <button
            type="button"
            onClick={() => setSelectedTimeRange(selectedTimeRange === 'Weekly' ? 'Monthly' : 'Weekly')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface border border-border text-text hover:bg-background text-xs font-semibold transition"
          >
            <span>{selectedTimeRange}</span>
            <span className="text-[10px] text-text-muted">⌄</span>
          </button>

          {/* 1-Click Digital QR Pass Button (Primary Brand CTA) */}
          <button
            type="button"
            onClick={onOpenQrPass}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-xs shadow-md shadow-primary/20 transition transform active:scale-95"
            title="Open dynamic 60s rotating QR Pass for gym front desk check-in"
          >
            <QrCode className="w-4 h-4" />
            <span>Digital QR Pass • መግቢያ</span>
          </button>

          {/* AI Coach Floating Trigger */}
          <button
            type="button"
            onClick={onOpenAiCoach}
            className="p-2.5 rounded-full bg-surface border border-border hover:border-primary/40 text-text transition hover:bg-background"
            title="Consult SWEATBOX AI Coach"
            aria-label="SWEATBOX AI Coach"
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      {/* TOP 4 METRIC CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hydration */}
        <div className="bg-surface rounded-3xl p-5 shadow-soft border border-border flex items-center justify-between transition-colors">
          <div>
            <div className="text-2xl font-black text-text">
              2.4 <span className="text-xs font-normal text-text-muted">L</span>
            </div>
            <p className="text-xs text-text-muted font-medium mt-1">Water Intake • ውሃ</p>
            <div className="mt-2 text-[11px] text-sky-500 font-semibold flex items-center gap-1">
              <span>Goal: 3.0 Liters</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center">
            <Droplets className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Active Calories */}
        <div className="bg-surface rounded-3xl p-5 shadow-soft border border-border flex items-center justify-between transition-colors">
          <div>
            <div className="text-2xl font-black text-text">
              2,150 <span className="text-xs font-normal text-text-muted">kcal</span>
            </div>
            <p className="text-xs text-text-muted font-medium mt-1">Active Burn • ካሎሪ</p>
            <div className="mt-2 text-[11px] text-amber-500 font-semibold flex items-center gap-1">
              <span>Daily Target: 2,400</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Heart Rate */}
        <div className="bg-surface rounded-3xl p-5 shadow-soft border border-border flex items-center justify-between transition-colors">
          <div>
            <div className="text-2xl font-black text-text">
              122 <span className="text-xs font-normal text-text-muted">BPM</span>
            </div>
            <p className="text-xs text-text-muted font-medium mt-1">Heart Intensity • የልብ ምት</p>
            <div className="mt-2 text-[11px] text-rose-500 font-semibold flex items-center gap-1">
              <span>Aerobic Zone</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Attendance Streak */}
        <div className="bg-surface rounded-3xl p-5 shadow-soft border border-border flex items-center justify-between transition-colors">
          <div>
            <div className="text-2xl font-black text-text">
              4 <span className="text-xs font-normal text-text-muted">Days</span>
            </div>
            <p className="text-xs text-text-muted font-medium mt-1">Weekly Streak • ፅናት</p>
            <div className="mt-2 text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
              <span>Consistency: 80%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER COLUMN (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* WORKOUT ACTIVITY CHART CARD */}
          <div className="bg-surface rounded-3xl p-6 shadow-soft border border-border transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-text">Workout Activity</h2>
                <p className="text-xs text-text-muted">Weekly training intensity & gym check-ins</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-text-muted font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                  Gym Scans
                </span>
                <span className="flex items-center gap-1.5 text-text-muted font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                  Intensity Wave
                </span>
              </div>
            </div>

            {/* Smooth Wave Chart Graphic */}
            <div className="relative h-44 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary, #FF6B00)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--color-primary, #FF6B00)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal reference grid lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" className="text-text" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" className="text-text" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" className="text-text" />

                {/* Shaded Area under wave */}
                <path
                  d="M 0,90 Q 75,30 150,80 T 300,50 T 450,75 T 600,40 L 600,120 L 0,120 Z"
                  fill="url(#waveGradient)"
                />

                {/* Primary Accent Wave Line (Orange) */}
                <path
                  d="M 0,90 Q 75,30 150,80 T 300,50 T 450,75 T 600,40"
                  fill="none"
                  stroke="var(--color-primary, #FF6B00)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Secondary Contrast Line (Sky Blue) */}
                <path
                  d="M 0,60 Q 90,85 180,45 T 350,70 T 500,45 T 600,80"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Peak Point at Wednesday */}
                <circle cx="300" cy="50" r="5" fill="#0284C7" stroke="var(--color-surface, #151921)" strokeWidth="2.5" />
                <circle cx="300" cy="50" r="10" fill="var(--color-primary, #FF6B00)" fillOpacity="0.4" />
              </svg>

              {/* Floating Pill Tag at Wed peak */}
              <div
                className="absolute text-[11px] font-bold px-3 py-1 rounded-full bg-surface text-text border border-border shadow-md -translate-x-1/2 flex items-center gap-1.5"
                style={{ left: '50%', top: '20px' }}
              >
                <Scale className="w-3 h-3 text-primary" />
                <span>Target: 78 kg</span>
              </div>
            </div>

            {/* Days of Week Labels */}
            <div className="flex justify-between items-center text-xs font-semibold text-text-muted pt-3 border-t border-border mt-2 px-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span className="text-primary font-bold">Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>

          {/* ROW OF 3 ACTION & SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Subscription Card */}
            <div className="bg-surface rounded-3xl p-5 shadow-soft border border-border flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Subscription</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    myMembership?.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {myMembership?.status === 'active' ? 'Active' : 'Unsubscribed'}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-text">
                  {myMembership?.plan_name || 'No Active Plan'}
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {myMembership
                    ? `${myMembership.plan_price?.toLocaleString()} ETB / Full facility pass`
                    : 'Subscribe to unlock all features & 60s dynamic QR pass'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                {myMembership?.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('plans')}
                    className="w-full py-2.5 rounded-2xl bg-background hover:bg-surface border border-border text-text text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>View Plan Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('plans')}
                    className="w-full py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-black shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <span>Upgrade to Pro • እቅድ ምረጥ</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Payment & Renewal Card */}
            <div className="bg-surface rounded-3xl p-5 shadow-soft border border-border flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Payment & Renewal</span>
                  <CreditCard className="w-4 h-4 text-text-muted" />
                </div>
                <p className="text-xs text-text-muted">Renew by / የሚያበቃበት</p>
                <h3 className="text-sm font-bold text-text mt-0.5">
                  {myMembership?.end_date ? formatEthiopianDate(myMembership.end_date) : 'Not Subscribed'}
                </h3>
                <p className="text-[11px] text-text-muted mt-2">
                  Chapa Gateway • Telebirr / CBE Birr
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {myMembership?.status !== 'active' && plans.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => onInitiatePayment(plans[0])}
                      className="flex-1 py-2 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-black transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Pay Now • አሁን ይክፈሉ</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('plans')}
                      className="flex-1 py-2 rounded-2xl bg-background hover:bg-surface border border-border text-text text-xs font-semibold transition flex items-center justify-center gap-1"
                    >
                      <span>Change Plan</span>
                    </button>
                  )}
                </div>

                {myPayments.some((p) => p.status === 'pending' && p.payment_method === 'chapa') && (
                  <button
                    type="button"
                    onClick={() => {
                      const p = myPayments.find((pay) => pay.status === 'pending');
                      if (p) onVerifyChapaTx(p.payment_reference);
                    }}
                    className="w-full py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[11px] font-semibold border border-amber-500/30 transition text-center"
                    title="Verify live transaction status on Chapa"
                  >
                    Verify Pending Transaction
                  </button>
                )}
              </div>
            </div>

            {/* 3. Daily Workout Split Card */}
            <div className="bg-surface rounded-3xl p-5 shadow-soft border border-border flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Assigned Routine</span>
                  <Dumbbell className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-base font-extrabold text-text">Today's Split</h3>
                <div className="mt-2 space-y-1.5 text-xs text-text-muted">
                  <div className="flex justify-between items-center py-1 border-b border-border/60">
                    <span className="font-medium text-text">Barbell Bench Press</span>
                    <span className="font-bold text-primary">4 × 8</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-text">Back Squats</span>
                    <span className="font-bold text-primary">4 × 8</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={onOpenWorkout}
                  className="w-full py-2.5 rounded-2xl bg-background hover:bg-surface border border-border text-text text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Open Workout & AI Coach</span>
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE BOOKINGS SECTION (IF ANY RESERVATIONS) */}
          {myBookings.length > 0 && (
            <div className="bg-surface rounded-3xl p-6 shadow-soft border border-border transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-text">My Reserved Classes & Waitlist</h2>
                </div>
                <button
                  type="button"
                  onClick={onRefreshClasses}
                  className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-background transition"
                  aria-label="Refresh class bookings"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myBookings.map((bk) => (
                  <div
                    key={bk.booking_id}
                    className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-text text-sm">{bk.title}</p>
                      <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-muted" />
                        {formatEthiopianDateTime(bk.start_time)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          bk.booking_status === 'booked'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {bk.booking_status === 'waitlisted' ? `Waitlist #${bk.waitlist_position}` : 'Confirmed'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const cls = classesList.find((c) => c.id === bk.class_id);
                          if (cls) onCancelBooking(cls);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] text-rose-500 hover:bg-rose-500/10 font-bold transition border border-rose-500/20"
                        title="Cancel reservation"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ATHLETE PROFILE & CALENDAR (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* ATHLETE PROFILE MINI-CARD */}
          <div className="bg-surface rounded-3xl p-6 shadow-soft border border-border transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary/30 to-primary text-primary-foreground font-black text-2xl flex items-center justify-center border-2 border-primary/40 shadow-sm shrink-0">
                {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-text leading-tight truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </h2>
                <p className="text-xs text-text-muted mt-0.5 truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background border border-border text-text-muted">
                  {currentUser.role} • Verified
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-border text-center">
              <div>
                <p className="text-[11px] text-text-muted">Height</p>
                <p className="text-sm font-bold text-text">178 cm</p>
              </div>
              <div className="border-x border-border">
                <p className="text-[11px] text-text-muted">Weight</p>
                <p className="text-sm font-bold text-text">78 kg</p>
              </div>
              <div>
                <p className="text-[11px] text-text-muted">Goal</p>
                <p className="text-sm font-bold text-primary">Build</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenProgress}
              className="mt-4 w-full py-2.5 rounded-2xl bg-background hover:bg-surface text-text text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-border active:scale-98"
            >
              <Scale className="w-3.5 h-3.5 text-primary" />
              <span>Update Weight & Measurements</span>
            </button>
          </div>

          {/* MONTHLY ATTENDANCE CALENDAR WIDGET */}
          <div className="bg-surface rounded-3xl p-6 shadow-soft border border-border transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text flex items-center gap-1.5">
                <span>Attendance</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background border border-border text-text-muted">
                  {todayEth.split(' ')[0]} {todayEth.split(' ')[2]}
                </span>
              </h2>
              <span className="text-xs font-semibold text-text-muted">Month Activity</span>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-text-muted mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((item) => {
                let cellClass = 'text-text-muted hover:bg-background';
                if (item.attended) {
                  cellClass = 'bg-primary text-primary-foreground font-black shadow-sm';
                } else if (item.denied) {
                  cellClass = 'bg-rose-500 text-white font-bold';
                }

                return (
                  <div
                    key={item.day}
                    className={`h-7 w-7 rounded-full flex items-center justify-center mx-auto transition text-[11px] ${cellClass}`}
                  >
                    {item.day}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[11px] text-text-muted pt-4 mt-4 border-t border-border">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                <span>Check-in Allowed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span>Denied</span>
              </div>
            </div>
          </div>

          {/* TRENDING GROUP FITNESS CLASSES CARD */}
          <div className="bg-surface rounded-3xl p-6 shadow-soft border border-border transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-text">Upcoming Classes</h2>
                <p className="text-xs text-text-muted">Strict capacity & automated waitlist</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('classes')}
                className="text-xs font-bold text-primary hover:underline transition"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {filteredClasses.length === 0 ? (
                <div className="text-center py-6 text-text-muted text-xs">
                  No upcoming group classes scheduled.
                </div>
              ) : (
                filteredClasses.slice(0, 3).map((cls) => {
                  const isBooked = myBookings.some((b) => b.class_id === cls.id);
                  const isFull = cls.booked_count >= cls.capacity;

                  return (
                    <div
                      key={cls.id}
                      className="p-3.5 rounded-2xl bg-background border border-border flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-text text-xs leading-tight">{cls.title}</h4>
                        <p className="text-[11px] text-text-muted mt-0.5">Coach: {cls.trainer_name || 'Coach Dawit'}</p>
                        <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatEthiopianDateTime(cls.start_time)}</span>
                        </p>
                      </div>

                      <div>
                        {isBooked ? (
                          <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                            Reserved
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onBookClass(cls)}
                            disabled={bookingLoadingId === cls.id}
                            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition shadow-sm ${
                              isFull
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-primary text-primary-foreground hover:bg-primary-hover'
                            }`}
                          >
                            {bookingLoadingId === cls.id ? '...' : isFull ? 'Waitlist' : 'Book'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
