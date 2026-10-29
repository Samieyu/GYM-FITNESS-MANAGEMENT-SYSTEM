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
      {/* TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {greetingEn}, {currentUser.firstName}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#B4F82C]/30 text-slate-900 font-bold border border-[#B4F82C]">
              {todayEth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Let's do some workout today...</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium text-slate-700">{greetingAm}! ዛሬ ጠንክረን እንስራ።</span>
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search classes, workout... / ፈልግ"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-48 lg:w-60 transition"
            />
          </div>

          {/* Time Filter Pill */}
          <button
            onClick={() => setSelectedTimeRange(selectedTimeRange === 'Weekly' ? 'Monthly' : 'Weekly')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            <span>{selectedTimeRange}</span>
            <span className="text-[10px] text-slate-400">⌄</span>
          </button>

          {/* 1-Click Digital QR Pass Button (Primary Lime Brand CTA) */}
          <button
            onClick={onOpenQrPass}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#B4F82C] hover:bg-[#9FE01B] text-slate-950 font-bold text-xs shadow-sm hover:shadow transition transform active:scale-95"
            title="Open dynamic 60s rotating QR Pass for gym front desk check-in"
          >
            <QrCode className="w-4 h-4" />
            <span>Digital QR Pass • መግቢያ QR</span>
          </button>

          {/* AI Coach Floating Trigger */}
          <button
            onClick={onOpenAiCoach}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Consult Titan AI Coach"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </div>

      {/* TOP 4 METRIC CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hydration */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">2.4 <span className="text-xs font-normal text-slate-400">Liters</span></div>
            <p className="text-xs text-slate-500 font-medium mt-1">Water Intake • ውሃ</p>
            <div className="mt-2 text-[11px] text-sky-600 font-semibold flex items-center gap-1">
              <span>Goal: 3.0 Liters</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
            <Droplets className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Calories */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">2,150 <span className="text-xs font-normal text-slate-400">kcal</span></div>
            <p className="text-xs text-slate-500 font-medium mt-1">Active Calories • ካሎሪ</p>
            <div className="mt-2 text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <span>Daily Target: 2,400</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Heart Rate */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">122 <span className="text-xs font-normal text-slate-400">BPM</span></div>
            <p className="text-xs text-slate-500 font-medium mt-1">Heart Intensity • የልብ ምት</p>
            <div className="mt-2 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
              <span>Aerobic Zone</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Attendance Streak */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">4 <span className="text-xs font-normal text-slate-400">Days</span></div>
            <p className="text-xs text-slate-500 font-medium mt-1">Weekly Streak • ፅናት</p>
            <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span>Consistency: 80%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER COLUMN (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* WORKOUT ACTIVITY CHART CARD */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Workout Activity</h3>
                <p className="text-xs text-slate-400">Weekly training intensity & gym visits</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
                  Gym Scans
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B4F82C] inline-block border border-slate-400"></span>
                  Intensity Wave
                </span>
              </div>
            </div>

            {/* Smooth Wave Chart Graphic */}
            <div className="relative h-44 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B4F82C" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#B4F82C" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal reference grid lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                {/* Shaded Area under wave */}
                <path
                  d="M 0,90 Q 75,30 150,80 T 300,50 T 450,75 T 600,40 L 600,120 L 0,120 Z"
                  fill="url(#waveGradient)"
                />

                {/* Primary Accent Wave Line (Lime) */}
                <path
                  d="M 0,90 Q 75,30 150,80 T 300,50 T 450,75 T 600,40"
                  fill="none"
                  stroke="#9FE01B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Secondary Contrast Line (Slate Dark) */}
                <path
                  d="M 0,60 Q 90,85 180,45 T 350,70 T 500,45 T 600,80"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Peak Point at Wednesday */}
                <circle cx="300" cy="50" r="5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="300" cy="50" r="10" fill="#B4F82C" fillOpacity="0.4" />
              </svg>

              {/* Floating Pill Tag at Wed peak */}
              <div
                className="absolute text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-950 text-white shadow-md -translate-x-1/2 flex items-center gap-1"
                style={{ left: '50%', top: '22px' }}
              >
                <Scale className="w-3 h-3 text-[#B4F82C]" />
                <span>Target: 78 kg</span>
              </div>
            </div>

            {/* Days of Week Labels */}
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 pt-2 border-t border-slate-100 mt-2 px-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span className="text-slate-900 font-bold">Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>

          {/* ROW OF 3 ACTION & SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Subscription Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subscription</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {myMembership?.status === 'active' ? 'Active' : 'Unsubscribed'}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {myMembership?.plan_name || 'No Active Plan'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {myMembership
                    ? `${myMembership.plan_price?.toLocaleString()} ETB / Full facility pass`
                    : 'Subscribe with Chapa to activate 60s QR code pass'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                {myMembership?.status === 'active' ? (
                  <button
                    onClick={() => onNavigateTab('plans')}
                    className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>View Plan Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigateTab('plans')}
                    className="w-full py-2.5 rounded-2xl bg-[#B4F82C] hover:bg-[#9FE01B] text-slate-950 text-xs font-black shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <span>Upgrade to Pro • እቅድ ምረጥ</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Payment Renewal Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment & Renewal</span>
                  <CreditCard className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">Renew by / የሚያበቃበት</p>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {myMembership?.end_date ? formatEthiopianDate(myMembership.end_date) : 'Not Subscribed'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-2">
                  Chapa Gateway • Telebirr / CBE Birr
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {myMembership?.status !== 'active' && plans.length > 0 ? (
                    <button
                      onClick={() => onInitiatePayment(plans[0])}
                      className="flex-1 py-2 rounded-2xl bg-[#B4F82C] hover:bg-[#9FE01B] text-slate-950 text-xs font-black transition flex items-center justify-center gap-1"
                    >
                      <span>Pay Now • አሁን ይክፈሉ</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateTab('plans')}
                      className="flex-1 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center justify-center gap-1"
                    >
                      <span>Change Plan</span>
                    </button>
                  )}
                </div>

                {myPayments.some((p) => p.status === 'pending' && p.payment_method === 'chapa') && (
                  <button
                    onClick={() => {
                      const p = myPayments.find((pay) => pay.status === 'pending');
                      if (p) onVerifyChapaTx(p.payment_reference);
                    }}
                    className="w-full py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold border border-amber-200 transition text-center"
                    title="Verify live transaction status on Chapa"
                  >
                    Verify Pending Transaction
                  </button>
                )}
              </div>
            </div>

            {/* 3. Daily Workout Split Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Routine</span>
                  <Dumbbell className="w-4 h-4 text-[#9FE01B]" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Today's Workout</h4>
                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="font-medium">Barbell Bench Press</span>
                    <span className="font-bold text-slate-900">4 × 8</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium">Back Squats</span>
                    <span className="font-bold text-slate-900">4 × 8</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={onOpenWorkout}
                  className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B4F82C]" />
                  <span>Open Workout & AI Coach</span>
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE BOOKINGS SECTION (IF ANY RESERVATIONS) */}
          {myBookings.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-slate-900" />
                  <h3 className="text-base font-bold text-slate-900">My Reserved Classes & Waitlist</h3>
                </div>
                <button
                  onClick={onRefreshClasses}
                  className="p-1.5 text-slate-400 hover:text-slate-700 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myBookings.map((bk) => (
                  <div
                    key={bk.booking_id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{bk.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatEthiopianDateTime(bk.start_time)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          bk.booking_status === 'booked'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {bk.booking_status === 'waitlisted' ? `Waitlist #${bk.waitlist_position}` : 'Confirmed'}
                      </span>
                      <button
                        onClick={() => {
                          const cls = classesList.find((c) => c.id === bk.class_id);
                          if (cls) onCancelBooking(cls);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] text-rose-500 hover:bg-rose-50 font-medium transition"
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
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-[#B4F82C] font-black text-2xl flex items-center justify-center border-2 border-white shadow">
                {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {currentUser.firstName} {currentUser.lastName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {currentUser.role} • Verified
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 text-center">
              <div>
                <p className="text-[11px] text-slate-400">Height</p>
                <p className="text-sm font-bold text-slate-900">178 cm</p>
              </div>
              <div className="border-x border-slate-100">
                <p className="text-[11px] text-slate-400">Weight</p>
                <p className="text-sm font-bold text-slate-900">78 kg</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Fitness Goal</p>
                <p className="text-sm font-bold text-slate-900">Build</p>
              </div>
            </div>

            <button
              onClick={onOpenProgress}
              className="mt-4 w-full py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <Scale className="w-3.5 h-3.5 text-slate-700" />
              <span>Update Weight & Measurements</span>
            </button>
          </div>

          {/* MONTHLY ATTENDANCE CALENDAR WIDGET */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>Attendance</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {todayEth.split(' ')[0]} {todayEth.split(' ')[2]}
                </span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">June 2026</span>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
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
                let cellClass = 'text-slate-700 hover:bg-slate-100';
                if (item.attended) {
                  cellClass = 'bg-[#B4F82C] text-slate-950 font-black shadow-sm';
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
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-4 mt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B4F82C] inline-block"></span>
                <span>Check-in Allowed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span>Denied</span>
              </div>
            </div>
          </div>

          {/* TRENDING GROUP FITNESS CLASSES CARD */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upcoming Classes</h3>
                <p className="text-xs text-slate-400">Strict capacity & automated waitlist</p>
              </div>
              <button
                onClick={() => onNavigateTab('classes')}
                className="text-xs font-bold text-slate-900 hover:text-slate-600 transition"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {filteredClasses.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No upcoming group classes scheduled.
                </div>
              ) : (
                filteredClasses.slice(0, 3).map((cls) => {
                  const isBooked = myBookings.some((b) => b.class_id === cls.id);
                  const isFull = cls.booked_count >= cls.capacity;

                  return (
                    <div
                      key={cls.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs leading-tight">{cls.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Coach: {cls.trainer_name || 'Alex Strong'}</p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatEthiopianDateTime(cls.start_time)}</span>
                        </p>
                      </div>

                      <div>
                        {isBooked ? (
                          <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Reserved
                          </span>
                        ) : (
                          <button
                            onClick={() => onBookClass(cls)}
                            disabled={bookingLoadingId === cls.id}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition shadow-sm ${
                              isFull
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-[#B4F82C] text-slate-950 hover:bg-[#9FE01B]'
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
