# SWEATBOX Fitness Management System — Complete UI & UX Inventory

This inventory tracks the comprehensive redesign of every user interface surface, state, popup, and communication asset in the SWEATBOX web app. No legacy styling remains untouched.

**Phase Progress Tracking Rule**: Each item contains a checkbox `[ ]`. Checkboxes are marked `[x]` upon completion of their respective redesign phase after visual verification. A phase is only considered complete when all of its assigned inventory items are ticked.

---

## 1. Routes and Pages by Role

### 1.1 Public Pages (Unauthenticated)
- [ ] **PUB-PAGE-01**: Home Page — Hero with dynamic value proposition, high-contrast CTAs ("Join SWEATBOX", "Explore Plans"), responsive athletic imagery.
- [ ] **PUB-PAGE-02**: Home Page — "How It Works" 3-step athletic onboarding flow (Choose Plan -> Instant QR -> Train & Transform).
- [ ] **PUB-PAGE-03**: Home Page — Class Timetable & Schedule preview with category badges (HIIT, Strength, Yoga, Boxing).
- [ ] **PUB-PAGE-04**: Home Page — Certified Trainers Showcase with specialization tags and bio highlights.
- [ ] **PUB-PAGE-05**: Home Page — App Download & Mobile Experience showcase with high-contrast QR pass graphic.
- [ ] **PUB-PAGE-06**: Home Page — Interactive FAQ accordion (pricing, guest pass, cancellation, Ethiopian calendar).
- [ ] **PUB-PAGE-07**: Home Page — Global Athletic Footer with operating hours, Addis Ababa gym coordinates, contact channels, and branding.
- [ ] **PUB-PAGE-08**: Plans & Pricing Catalog (`tab=plans`) — Transparent tiered cards with ETB pricing, duration tags, feature checklists, and "Most Popular" highlight.
- [ ] **PUB-PAGE-09**: Group Classes Schedule (`tab=classes`) — Day-of-week selector, instructor badges, spots remaining indicators, and direct book triggers.
- [ ] **PUB-PAGE-10**: Sign-Up Wizard — Stepwise 3-step registration (Account Credentials -> Athlete Profile & Photo -> Plan & Payment Selection).
- [ ] **PUB-PAGE-11**: Sign-In / Login View — Minimal high-contrast card, email & password inputs, "Show Password" toggle, persistent auth links.
- [ ] **PUB-PAGE-12**: Forgot Password Request View — Focused email recovery card with clear instructions and Mailpit/live inbox hint.
- [ ] **PUB-PAGE-13**: Reset Password Form (`/reset-password?token=...`) — Password input with real-time strength meter and confirmation field.
- [ ] **PUB-PAGE-14**: Set Password for Invited Members (`/set-password?token=...`) — First-time onboarding card for reception-registered athletes.

### 1.2 Member / Athlete Pages (Role: `member`)
- [ ] **MEM-PAGE-01**: Athlete Command Dashboard — Personalized greeting, streak badge, quick check-in QR trigger, next workout card.
- [ ] **MEM-PAGE-02**: Membership Status Card — Circular progress ring displaying active plan days remaining, validity dates in Ethiopian Calendar, and renewal action.
- [ ] **MEM-PAGE-03**: Next Up / Upcoming Class Card — Live countdown to next booked class, instructor avatar, location room, and cancel/calendar actions.
- [ ] **MEM-PAGE-04**: Body Transformation Quick Stats — Weight, BMI, body fat percentage, and goal target progress bars with delta chips (+/- kg).
- [ ] **MEM-PAGE-05**: Check-In Pass (`/member/qr`) — Full-screen mobile-optimized 60-second dynamic TOTP QR pass with pulsating countdown and anti-passback indicator.
- [ ] **MEM-PAGE-06**: Workout Routines View — Day-by-day split tabs, exercise cards with target sets/reps/tempo, video/gif cue links, and one-tap "Mark Set Complete".
- [ ] **MEM-PAGE-07**: Transformation & Progress Logs View — Historical weight/measurement chart with range filters (4 Weeks, 3 Months, All Time).
- [ ] **MEM-PAGE-08**: Class Booking & Schedule View — Interactive week date strip, category filter chips (Cardio, Strength, Recovery), class cards with waitlist status.
- [ ] **MEM-PAGE-09**: Billing & Payment History View — Active subscription overview, past transactions list with Chapa/Cash receipts and ETB breakdowns.
- [ ] **MEM-PAGE-10**: SWEATBOX AI Fitness Coach View — Chat interface with Ethiopian nutrition awareness, form cues, and workout formulation.
- [ ] **MEM-PAGE-11**: Athlete Profile & Settings — Edit avatar with crop preview, personal fitness goals, phone, emergency contact, and notifications.
- [ ] **MEM-PAGE-12**: Unpaid Member Subscription Gate Screen — Focused Plan Selection view shown exclusively to newly signed-up or expired members before full feature unlock.

### 1.3 Front Desk & Reception Pages (Role: `reception`)
- [ ] **REC-PAGE-01**: Front Desk Operational Dashboard — Shift summary stat cards (Active Check-Ins Today, Peak Hour Volume, Pending Registrations).
- [ ] **REC-PAGE-02**: Live QR Entrance Scanner — Full-screen mobile/tablet camera viewfinder with target framing guides, torch toggle, and manual input fallback.
- [ ] **REC-PAGE-03**: Scan Decision Display (Allowed) — High-visibility emerald verification banner, member photo, active plan, days remaining, trainer assigned.
- [ ] **REC-PAGE-04**: Scan Decision Display (Denied) — High-visibility crimson rejection banner, specific denial reason (Expired, Anti-Passback Violation, Inactive), instant "Renew" and "Record Payment" shortcuts.
- [ ] **REC-PAGE-05**: Walk-In Registration Flow — Fast, stepwise counter registration form with real-time camera snapshot capture, plan selection, and cash recording.
- [ ] **REC-PAGE-06**: Front Desk Member Lookup — Instant search table with filters (Active, Expired, Suspended) and phone/email matching.
- [ ] **REC-PAGE-07**: Manual Payment Terminal — Step form for recording In-Person Cash, Telebirr, CBE Birr, or POS card payments with instant membership activation.

### 1.4 Certified Trainer Pages (Role: `trainer`)
- [ ] **TRN-PAGE-01**: Trainer Roster & Command Dashboard — Assigned athletes summary, today's schedule, pending workout plan approvals badge.
- [ ] **TRN-PAGE-02**: Assigned Members Roster — Filterable cards/table showing athlete goals, membership status, last gym check-in, and active routine.
- [ ] **TRN-PAGE-03**: Athlete Profile Detail View — Tabs for Overview, Workout Routine, Transformation Metric History, and Class Attendance.
- [ ] **TRN-PAGE-04**: Workout Routine Formulation & Review Editor — Interactive routine builder with drag handles, exercise selector, sets/reps configurator, and one-click Approval Gate.
- [ ] **TRN-PAGE-05**: Trainer Group Classes Management — View scheduled sessions, roster capacity, waitlist overflow, and class cancellation controls.
- [ ] **TRN-PAGE-06**: Class Attendance Marking Terminal — Fast touch-friendly roster to mark "Attended", "No-Show", or "Late Cancellation".
- [ ] **TRN-PAGE-07**: SWEATBOX Trainer AI Assistant — Technical AI formulation tool for biomechanical cues, progression overload calculations, and injury accommodations.

### 1.5 System Administrator Pages (Role: `admin`)
- [ ] **ADM-PAGE-01**: Admin Executive Dashboard — Metric cards (Total Revenue ETB, Active Members, Daily Scans, Equipment Health), charts for revenue trends and attendance heatmaps.
- [ ] **ADM-PAGE-02**: Staff Management Center — Grid of certified trainers and reception staff, status chips, and "Register New Staff" modal trigger.
- [ ] **ADM-PAGE-03**: Membership Plans & Pricing Manager — Management table of public and private tiers, price editors, duration settings, and promotional toggles.
- [ ] **ADM-PAGE-04**: Equipment Inventory & Facility Health — Equipment list grouped by zone (Cardio, Free Weights, Resistance Machines, Studio), operational status tags.
- [ ] **ADM-PAGE-05**: Equipment Defect & Repair Tracker — Fault report tickets, priority chips (Critical, Moderate, Low), and maintenance logging form.
- [ ] **ADM-PAGE-06**: Financial & Attendance Reports Terminal — Date range selector with certified Ethiopian Calendar conversion, export configuration, and CSV generators.
- [ ] **ADM-PAGE-07**: SWEATBOX Management Consultant AI — Strategic executive AI assistant for churn analysis, peak load optimization, and pricing modeling.

---

## 2. Popups, Modals, Drawers, Sheets, and Dialogs

### 2.1 Universal & Authentication Popups
- [ ] **POP-AUTH-01**: Auth Dialog (Login Mode) — Centered modal (desktop) / bottom sheet (mobile), clean inputs, autofocus, visible error hints.
- [ ] **POP-AUTH-02**: Auth Dialog (Register Mode) — Stepwise layout, photo upload preview, terms agreement checkbox.
- [ ] **POP-AUTH-03**: Auth Dialog (Forgot Password) — Single-step recovery prompt with inline feedback.
- [ ] **POP-AUTH-04**: Session Expired Dialog — Non-dismissible prompt with re-login action preserving unsaved work.
- [ ] **POP-AUTH-05**: Logout Confirmation Dialog — Destructive warning dialog with safe "Cancel" and bold "Log Out" action.

### 2.2 Member Popups & Bottom Sheets
- [ ] **POP-MEM-01**: Member 60s Dynamic QR Pass Modal — High-contrast dark modal with animated circular timer ring and anti-passback security notice.
- [ ] **POP-MEM-02**: Log Progress & Body Transformation Sheet — Mobile bottom sheet for quick input of Weight (kg), Chest, Waist, Bicep measurements with instant delta calculation.
- [ ] **POP-MEM-03**: Workout Routine Detail Modal — Exercise breakdown modal with muscle group tags, movement instructions, and tempo guides.
- [ ] **POP-MEM-04**: Class Booking Confirmation Dialog — Clear modal detailing class name, time, trainer, room location, and cancellation policy.
- [ ] **POP-MEM-05**: Cancel Class Booking Dialog — Safe destructive dialog with spot release confirmation.
- [ ] **POP-MEM-06**: Join Waitlist Confirmation Sheet — Notification of queue position and auto-booking policy if a spot frees up.
- [ ] **POP-MEM-07**: SWEATBOX AI Fitness Coach Sheet — Mobile sliding chat drawer with Ethiopian nutrition suggestions and pre-populated query chips.
- [ ] **POP-MEM-08**: Renew Membership Plan Modal — Tier review, duration summary, and instant checkout redirect to Chapa.

### 2.3 Reception Popups & Sheets
- [ ] **POP-REC-01**: Camera QR Scanner Modal — Viewfinder overlay with animated scanning beam, camera flip toggle, and manual token lookup bar.
- [ ] **POP-REC-02**: Walk-In Registration Step Sheet — Stepwise counter onboarding modal with integrated camera preview and photo crop.
- [ ] **POP-REC-03**: Record Manual Cash Payment Modal — Member selector, plan picker, amount received input, notes, and receipt trigger.
- [ ] **POP-REC-04**: Override Anti-Passback Confirmation Dialog — Receptionist override authorization prompt for repeat check-in.

### 2.4 Trainer & Admin Popups
- [ ] **POP-TRN-01**: Trainer Workout Routine Editor Modal — Drag-and-drop exercise sequence modal with sets, reps, and target weights.
- [ ] **POP-TRN-02**: Approve Routine Confirmation Modal — Trainer approval gate confirmation with notification trigger to athlete.
- [ ] **POP-TRN-03**: Class Attendee Roster Sheet — Roster management modal with one-tap status toggles (Present, Absent, Excused).
- [ ] **POP-ADM-01**: Staff Registration Modal — Admin form for creating Trainers and Reception staff with email invitation trigger.
- [ ] **POP-ADM-02**: Plan Editor Modal — Plan title, description, price (ETB), duration (months), feature bullet points, and image uploader.
- [ ] **POP-ADM-03**: Create / Edit Class Modal — Class title, category selector, trainer picker, date & time pickers, and capacity ceiling.
- [ ] **POP-ADM-04**: Equipment Defect Report Modal — Equipment picker, issue description, severity tag, and photo attachment.
- [ ] **POP-ADM-05**: Equipment Maintenance Log Sheet — Technician name, service notes, replacement parts, and status resolution.
- [ ] **POP-ADM-06**: Financial & Attendance Export Dialog — Date range picker (E.C. & G.C.), report type selector, and instant CSV generation.
- [ ] **POP-ADM-07**: Delete / Deactivate Item Confirmation Dialogs — Universal reusable destructive dialog with item title emphasis.

### 2.5 Feedback Elements (Toasts, Tooltips, Alerts, Banners)
- [ ] **FEED-TOAST-01**: Success Toast — Non-blocking notification with checkmark, auto-dismiss (4000ms), manual close, and pause-on-hover.
- [ ] **FEED-TOAST-02**: Error Toast — High-contrast alert with actionable remedy wording and retry trigger.
- [ ] **FEED-TOAST-03**: Warning Toast — Expiry notice or impending class start alert.
- [ ] **FEED-TOAST-04**: Info Toast — Neutral status updates and background sync indicators.
- [ ] **FEED-BANNER-01**: Offline Network Status Banner — Persistent top alert showing offline connection state and automatic sync retry.
- [ ] **FEED-BANNER-02**: Expired Membership Banner — Prominent banner with direct "Renew Membership" call to action.
- [ ] **FEED-TOOLTIP-01**: Accessible Tooltip System — Radix-driven tooltips with 200ms delay, viewport edge collision detection, and screen-reader support.

---

## 3. Page & Component States

### 3.1 Loading States
- [ ] **STATE-LOAD-01**: Skeleton screen for Athlete Dashboard (header, status ring, upcoming cards).
- [ ] **STATE-LOAD-02**: Skeleton screen for Class Schedule & Timetable.
- [ ] **STATE-LOAD-03**: Skeleton screen for Plans & Pricing Cards.
- [ ] **STATE-LOAD-04**: Skeleton screen for Admin & Reception Data Tables (Members, Payments, Equipment).
- [ ] **STATE-LOAD-05**: Button loading spinners with disabled state and fixed dimensions (preventing layout shift).

### 3.2 Empty States
- [ ] **STATE-EMPTY-01**: No Active Workout Routine — Athlete prompt to formulate an AI plan or request one from a trainer.
- [ ] **STATE-EMPTY-02**: No Booked Classes — Clean illustration with a "Browse Classes" action button.
- [ ] **STATE-EMPTY-03**: No Progress Logs — Prompt with "Log Your First Weigh-In" button.
- [ ] **STATE-EMPTY-04**: No Equipment Faults — Positive green health status indicator.
- [ ] **STATE-EMPTY-05**: No Search Results — Informative message suggesting query adjustment.

### 3.3 Error & Boundary States
- [ ] **STATE-ERR-01**: 404 Not Found Page — Athletic branded navigation recovery with "Return to Dashboard" action.
- [ ] **STATE-ERR-02**: 403 Forbidden / No Permission Screen — Clear explanation of required access level with role switch link.
- [ ] **STATE-ERR-03**: 500 Server Error Screen — Non-technical friendly apology with "Try Again" and system health status link.
- [ ] **STATE-ERR-04**: Offline / Connection Lost Screen — Clear instructions to check network connectivity.
- [ ] **STATE-ERR-05**: Form Inline Error Messages — High-contrast red microcopy with icons positioned beneath invalid fields.

### 3.4 Success & Confirmation States
- [ ] **STATE-SUCC-01**: Payment Completed Screen — Celebration card with receipt breakdown, Ethiopian calendar dates, and "Open QR Pass" button.
- [ ] **STATE-SUCC-02**: Walk-In Registration Complete — Clear counter confirmation displaying member name and password activation notice.
- [ ] **STATE-SUCC-03**: Class Booking Success Modal — Immediate calendar addition option and class reminder confirmation.

---

## 4. Printable, Downloadable & Email Views

### 4.1 Printable & Downloadable Views
- [ ] **PRINT-01**: Payment Receipt & Tax Invoice View — Clean black-and-white printable layout with gym TIN, member details, payment reference, and ETB total.
- [ ] **PRINT-02**: Attendance Logs CSV Export — Formatted CSV download containing Ethiopian Calendar dates, timestamps, member IDs, and scan result statuses.
- [ ] **PRINT-03**: Member Roster CSV Export — Formatted CSV download with active plan tiers, contact numbers, and expiration dates.
- [ ] **PRINT-04**: Financial Reconciliation CSV Export — Formatted CSV with transaction IDs, payment methods (Chapa/Cash/POS), and revenue sums.

### 4.2 Brand Email Templates (HTML & Plain Text)
- [ ] **EMAIL-01**: Email Verification Notice — Responsive single-column layout with dark charcoal container, bold orange CTA button, and clear verification link.
- [ ] **EMAIL-02**: Walk-In Member Invitation & Set Password — Welcoming onboarding email with temporary credentials instructions and direct activation link.
- [ ] **EMAIL-03**: Password Reset Email — Secure, minimal template with expiration notice (1 hour) and high-contrast password reset button.
- [ ] **EMAIL-04**: Payment Confirmation & Receipt — Transaction breakdown, plan name, validity duration in Ethiopian Calendar, and mobile gym pass guide.
- [ ] **EMAIL-05**: Membership Expiration Warning (7-Day & 1-Day) — Urgency-oriented athletic reminder with one-click online renewal link.
- [ ] **EMAIL-06**: Class Booking Confirmation & Reminder — Session details (Class, Trainer, Date, Time, Room) and one-tap cancellation link.

---

## 5. Mobile & Responsive Layouts (360px, 768px, 1280px)

- [x] **RESP-01**: Mobile Viewport (360px - 480px) — Thumb-zone navigation bar, bottom sheets for all action dialogs, touch targets >= 44px, zero horizontal overflow.
- [x] **RESP-02**: Tablet Viewport (768px - 1024px) — Collapsible navigation drawer, 2-column card layouts, adaptive data tables.
- [x] **RESP-03**: Desktop Viewport (1280px+) — Persistent left sidebar, 12-column grid system, multi-pane dashboard layouts, centered modal dialogs.
- [x] **RESP-04**: Theme Toggle Engine — Seamless instant transition between Dark Athletic Charcoal (`#0E1116`) and Light Athletic White (`#FFFFFF`) with persistent `localStorage` preference.

---

## 6. Phase 2 App Shells & Navigation Architecture
- [x] **NAV-PUB**: PublicHeader (slim desktop top bar with logo, Plans, Classes, Trainers, Log In, and persistent Sign Up CTA; mobile hamburger sheet)
- [x] **NAV-MEM**: MemberBottomBar (fixed mobile thumb navigation with Home, Classes, pulsating 60s QR Pass, Progress, AI Coach, and Profile/Payments menu)
- [x] **NAV-STF**: StaffNavigation (collapsible 64px/240px desktop sidebar with tooltips + compact bottom bar for top 3 actions and full slide-over tools drawer)

---

## 6. Phase 1 Design System Component Library (Verified in Dev Gallery)
- [x] **COMP-BTN**: Button (primary, secondary, outline, ghost, destructive, loading, touch targets >= 44px)
- [x] **COMP-INP**: Input (text, password with eye toggle, error state, with icons, touch targets >= 44px)
- [x] **COMP-SEL**: Select (custom chevron, accessible option list)
- [x] **COMP-TXT**: Textarea (multiline coaching/notes input)
- [x] **COMP-CHK**: Checkbox (touch-friendly custom indicator with labels)
- [x] **COMP-RAD**: RadioGroup (custom athletic selection cards)
- [x] **COMP-SWT**: Switch (Radix UI accessible toggle)
- [x] **COMP-DAT**: DateInput (with real-time Ethiopian Calendar format display)
- [x] **COMP-PHO**: PhotoUploader (file picker + mobile camera selfie capture + preview)
- [x] **COMP-CRD**: Card (default surface, elevated, interactive with athletic glow)
- [x] **COMP-STC**: StatCard (large tabular metrics, delta indicators, trend arrows)
- [x] **COMP-BDG**: Badge & Status Chip (success, warning, danger, info, primary with dot indicators)
- [x] **COMP-TAB**: Tabs (Radix UI accessible tabs with mobile touch overflow)
- [x] **COMP-MOD**: Modal (Radix UI accessible dialog with focus lock & scale-up animation)
- [x] **COMP-SHT**: BottomSheet (mobile-first sliding sheet with visual drag handle)
- [x] **COMP-DRP**: Dropdown (Radix UI accessible menu with collision avoidance)
- [x] **COMP-TIP**: Tooltip (Radix UI accessible tooltip)
- [x] **COMP-TST**: Toast System (ToastProvider, useToast hook: success, error, warning, info)
- [x] **COMP-ALT**: Alert (accessible inline feedback banners)
- [x] **COMP-SKL**: Skeleton (shimmer loaders, CardSkeleton, TableSkeleton)
- [x] **COMP-EMP**: EmptyState (athletic icon, title, copy, primary action CTA)
- [x] **COMP-AVT**: Avatar (initials fallback, image error handling, presence status dot)
- [x] **COMP-RNG**: ProgressRing (circular SVG progress arc with center metrics)
- [x] **COMP-PAG**: Pagination (touch-friendly prev/next with page counts)
- [x] **COMP-TBL**: ResponsiveTable (turns into stacked cards on mobile, tabular on desktop)
- [x] **COMP-CHW**: ChartWrapper (range filter tabs, loading skeleton, screen-reader table summary)
- [x] **COMP-GAL**: DevComponentGallery (interactive showcase mounted at footer button / in-app)

---

## Summary of Checklist Items
- **Total Unique Surfaces & Assets**: 68 items + 27 Design System Primitives
- **Phase 1 Component Primitives Completed**: 28 / 28 (100%)
- **Full App Pages Pending Integration**: Phases 2–8
