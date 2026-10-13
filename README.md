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

## 5. Implementation Roadmap & Phases

- [x] **Phase 1: Project Skeleton, Dev Environment & Core Database Schema**
- [ ] **Phase 2: Authentication, RBAC & Email Verification**
- [ ] **Phase 3: Membership Plans & Admin Pricing Engine (Rule 1)**
- [ ] **Phase 4: Payments (Chapa Webhooks, Cash, Bank Transfer) & Single Active Membership (Rules 2, 3, 4)**
- [ ] **Phase 5: Dynamic QR Check-In, Rotating Tokens & Attendance Engine (Rules 7, 8, 9)**
- [ ] **Phase 6: Walk-in Registration & Password Invitation (Rule 10)**
- [ ] **Phase 7: Scheduled Membership Expiration & Email Reminders (Rule 5)**
- [ ] **Phase 8: Trainers, Workout Plans & Progress Tracking**
- [ ] **Phase 9: Classes, Bookings, Waitlists & Notifications**
- [ ] **Phase 10: Equipment & Facility Maintenance Management**
- [ ] **Phase 11: AI Fitness Assistant (Gemini Integration) (Rule 11)**
- [ ] **Phase 12: Dashboards, Reports, Production Docker, Nginx & Final Polish**