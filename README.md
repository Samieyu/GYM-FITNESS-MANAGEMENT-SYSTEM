# GYM & FITNESS MANAGEMENT SYSTEM

Comprehensive, high-performance web and backend platform for gym administrators, front-desk reception staff, personal trainers, and gym members.

---

## 1. Technology Stack

- **Frontend:** React.js 18 (Vite, TypeScript, Tailwind CSS with Dark Charcoal `#121212` and Orange Accent `#FF6B00`, Lucide Icons, HTML5 QR scanner)
- **Backend:** Node.js (v20+) + Express.js REST API (Layered architecture: routes, controllers, services, repositories)
- **Database:** PostgreSQL 16 with raw parameterized queries via `pg.Pool` (No heavy ORM)
- **Security:** Helmet, CORS whitelist, BCrypt/Argon2 password hashing, rate limiting, HMAC signed QR tokens
- **Email:** Nodemailer with Mailpit (SMTP port 1025, Web UI port 8025)
- **Payments:** Chapa API (sandbox / test mode) with verified webhook signatures and idempotency protection
- **AI Integration:** Google Gemini API for trainer-verified workout plans, exercise explanations, and Q&A
- **DevOps:** Docker, Docker Compose, Nginx reverse proxy with HTTPS on Oracle Cloud Infrastructure (OCI)

---

## 2. System Architecture & Modules

1. **Authentication & RBAC:** Roles (`admin`, `reception`, `trainer`, `member`), JWT access + refresh tokens, email verification.
2. **Memberships & Plans:** Only admins configure plans and prices. Enforced rule: **Only 1 active membership per member at a time**.
3. **Payments & Idempotency:** Chapa webhooks verified via HMAC-SHA256 signature; replay-protected; cash and bank transfer support for reception.
4. **Dynamic QR Check-In:** Personal QR with signed 60-second rotating HMAC token. Reception scanner denies expired memberships, logs all attempts, and ignores repeats within 2 hours.
5. **Walk-in Registration:** Reception registers member, captures details, assigns trainer, activates membership upon payment, and triggers email invite.
6. **Trainers & Workouts:** Exercise library, customizable routines, member completion tracking.
7. **Progress & Metrics:** Weight and body measurements with graph analytics and trainer comments.
8. **Classes & Waitlist:** Capacity-constrained booking system with automated waitlist promotion upon cancellation.
9. **Equipment & Maintenance:** Inventory tracking, staff defect reporting, and scheduled service alert system.
10. **Gemini AI Fitness Assistant:** Server-side LLM generating workout drafts (requiring trainer approval), exercise guides with mandatory medical disclaimer.
11. **Audit Logs:** Full logging for payments, check-ins, plan price updates, and overrides.

---

## 3. Database Schema

The canonical schema is documented in [`docs/gym_schema.sql`](./docs/gym_schema.sql) and executed via sequential migrations in [`backend/src/db/migrations/`](./backend/src/db/migrations/).

### Quick Database Bootstrap
```bash
# 1. Start PostgreSQL 16 & Mailpit via Docker
docker compose up -d

# 2. Run schema migrations
cd backend
npm run migrate

# 3. Seed initial users, plans, and exercise library
npm run seed
```

Default seeded accounts:
- **Admin:** `admin@gymfitness.local` / `Admin@123456`
- **Reception:** `reception@gymfitness.local` / `Reception@123456`
- **Trainer:** `trainer@gymfitness.local` / `Trainer@123456`
- **Member:** `member@gymfitness.local` / `Member@123456`

---

## 4. Development Quickstart

### Prerequisites
- Node.js v20+ & npm v10+
- Docker & Docker Compose

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # Starts REST API on http://localhost:5000
npm test           # Executes Jest test suite
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server on http://localhost:5173
npm run build      # Verifies TypeScript and builds production assets
```

### Mailpit (Email Web UI)
- Open `http://localhost:8025` to inspect all system emails (verification links, expiry alerts, walk-in invites).

---

## 5. Authentication & RBAC API (Phase 2)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new member and dispatch 24h verification email |
| `POST` | `/api/v1/auth/login` | Public (Rate Limited) | Authenticate user; blocks unverified accounts; returns JWT pair |
| `GET/POST`| `/api/v1/auth/verify-email` | Public | Verify token and activate user account |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh expired access token via rotating refresh token |
| `POST` | `/api/v1/auth/logout` | Public | Revoke active refresh token |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetch current profile via Bearer access token |
| `GET` | `/api/v1/auth/admin-check` | Admin Role Only | Verifies RBAC role enforcement |

---

## 6. Membership Plans & Pricing Engine API (Phase 3)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/plans` | Public | List all active plans with pricing and image URLs |
| `GET` | `/api/v1/plans/:id` | Public | Retrieve detailed plan by ID |
| `GET` | `/api/v1/plans/admin/all` | Admin Only | List all plans (including inactive/archived) |
| `POST` | `/api/v1/plans` | Admin Only | Create new plan; validates non-negative price; logs audit |
| `PUT` | `/api/v1/plans/:id` | Admin Only | Update plan; logs price changes in `audit_logs` |
| `POST` | `/api/v1/plans/:id/image` | Admin Only | Upload plan photo from local storage (Base64 decoded) |

---

## 7. Payments & Membership Activation API (Phase 4)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/payments/chapa/initialize` | Member Only | Initialize Chapa checkout; verifies single active membership rule |
| `POST` | `/api/v1/payments/chapa/webhook` | Public (Verified) | Verified webhook with HMAC-SHA256 signature; replay protected |
| `POST` | `/api/v1/payments/manual` | Admin & Reception | Record offline cash or bank transfer payment with audit log |
| `GET` | `/api/v1/memberships/my-active` | Member Only | Fetch active membership status and countdown of remaining days |
| `GET` | `/api/v1/payments/my-history` | Member Only | Fetch billing and payment transaction history |
| `GET` | `/api/v1/payments/admin/all` | Admin & Reception | Paginated payment transactions with status and method filters |

---

## 8. Dynamic QR Check-In & Gate Attendance API (Phase 5)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/checkins/my-qr` | Member Only | Generate 60-second rotating cryptographic HMAC-SHA256 signed QR pass |
| `POST` | `/api/v1/checkins/scan` | Reception & Admin | Process gate QR code or manual member UUID check-in |
| `GET` | `/api/v1/checkins/recent` | Reception & Admin | Live recent attendance log stream formatted in Ethiopian Calendar |
| `GET` | `/api/v1/checkins/my-history` | Member Only | Member individual attendance history with weekly intensity trends |

---

## 9. Workout Routines, Classes & Gemini AI API (Phases 6–8)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/workouts/exercises` | Authenticated | Exercise catalog with muscle groups, equipment, and form tips |
| `GET/POST` | `/api/v1/workouts/my-routine` | Member Only | Retrieve assigned workout routine and log completed exercise sets |
| `POST` | `/api/v1/classes` | Admin & Trainer | Schedule group fitness classes with capacity limits |
| `POST` | `/api/v1/classes/:id/book` | Member Only | Book class slot or join automated waitlist upon full capacity |
| `DELETE` | `/api/v1/classes/:id/cancel` | Member Only | Cancel booking with automatic promotion of next waitlisted member |
| `POST` | `/api/v1/ai/consult` | Authenticated | Multi-role SWEATBOX AI Assistant powered by Google Gemini |

---

## 10. Ethiopian Localization & Business Workflows

- **Ethiopian Calendar & Time**: Real-time conversion between Gregorian and Ethiopian calendars (e.g., *Tikimt 2019 E.C.*), time-of-day Amharic greetings (*እንደምን አደሩ*, *እንደምን ዋሉ*, *እንደምን አመሹ*).
- **Payment Ecosystem**: Integrated with Chapa for direct local processing via **Telebirr**, **CBE Birr**, and local cards in Ethiopian Birr (**ETB**), with support for offline desk payments.
- **Multi-Branch Operations**: Seamless onboarding with branch selection across primary facilities:
  - **Bole Branch** (Cameroon St, Edna Mall Area)
  - **Gebriel Branch** (22 Mazoria, Near St. Gabriel)
  - **Semit Branch** (Summit 72 Main Boulevard)
- **High-Contrast Dark & Light Athletic Themes**: Fully WCAG AA compliant with bespoke charcoal slate surfaces, neon athletic orange accents (`#FF6B00`), and crystal-clear contrast across desktop (1280px+) and mobile viewports.

---

## 11. Completed Phases & Project Milestone Sign-Off

- [x] **Phase 1: Project Skeleton, Dev Environment & Core Database Schema**
- [x] **Phase 2: Authentication, RBAC & Email Verification**
- [x] **Phase 3: Membership Plans & Admin Pricing Engine (Rule 1)**
- [x] **Phase 4: Payments (Chapa Webhooks, Telebirr, CBE Birr) & Single Active Membership (Rules 2, 3, 4)**
- [x] **Phase 5: Front Desk & Reception Portal (Optical QR Viewfinder, Manual UUID Entry, Live Ethiopian Attendance Feed)**
- [x] **Phase 6: Member Portal & Dynamic 60-Second Rotating QR Pass (Rules 7, 8, 9, 10)**
- [x] **Phase 7: System Administrator Portal, Staff Onboarding & Equipment Defect Inventory**
- [x] **Phase 8: Polish, Micro-interactions, Cleaned AI Output, Profile Avatars & Production Finalization**
