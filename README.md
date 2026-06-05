# Retail Post-Purchase Gamification Platform

A Next.js application that gamifies the retail post-purchase experience. Customers earn credits by scanning QR codes at point-of-sale, then spend those credits playing games to win prizes.

---

## Architecture Overview

### User Roles
| Role | Auth Method | Access |
|------|------------|--------|
| **Admin** | Email + password (Better Auth) | Full dashboard: campaigns, QR, customers, rewards, settings |
| **Customer** | Email OTP (Resend) | Scan QR → earn credits → play games → win prizes |

### Key Business Rules
- **One active campaign at a time** — determined by `startDate ≤ now ≤ endDate` (no manual status field)
- **One game per campaign** — `activeGameType` on the Campaign model
- **Credits = floor(amountPaid × creditsPerUnit)** — e.g. $49.90 × 1 = 49 credits (no minimum spend)
- **Campaign credit config is global** per campaign, not per game
- **Stores are seeded**, not managed via UI
- **All stores are active** once created (no status toggle)
- **OTP delivery is email-only** via Resend (no SMS/Twilio)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL + Prisma |
| Admin Auth | Better Auth (email + password) |
| Customer Auth | JWT sessions + Email OTP via Resend |
| Styling | Tailwind CSS v4 (light mode only) |
| State | Zustand |
| QR Scanning | @zxing/browser |
| QR Generation | qrcode |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, secrets, and RESEND_API_KEY

# 3. Push schema & seed
npx prisma db push
npx prisma db seed

# 4. Start dev server
npm run dev
```

### Default Admin Credentials (seed)
- **Email:** `admin@retail-gamify.app`
- **Password:** `Admin@123456`

---

## Project Structure

```
src/
├── app/
│   ├── (app)/               # Shared layout group
│   ├── admin/login/         # Admin login page
│   ├── campaigns/           # Campaign management
│   ├── customers/           # Customer list (admin)
│   ├── dashboard/           # Customer & admin dashboards
│   ├── games/               # Game overview (admin)
│   ├── login/               # Customer login (email OTP)
│   ├── qr/                  # QR code generation (admin)
│   ├── register/            # Customer registration
│   ├── rewards/             # Prizes (admin: unclaimed / customer: own)
│   └── settings/            # Store list & app settings
├── actions/                 # Server Actions
├── components/
│   ├── customer/            # Customer-facing UI
│   └── shared/              # AdminShell, QRGeneratorClient, etc.
├── hooks/                   # useGamePlay, useQRScanner, etc.
├── lib/
│   ├── auth/                # admin-auth.ts, customer-auth.ts, session.ts
│   ├── db/                  # Prisma client
│   ├── otp/                 # Email OTP service
│   └── validations/         # Zod schemas
└── stores/                  # Zustand stores
```

---

## Data Models

### Campaign
- `startDate` / `endDate` → isActive computed, no status field
- `creditsPerUnit` → credits per $1 of purchase (campaign-global)
- `activeGameType` → one game active at a time

### Order (renamed from Purchase)
- Created when a customer redeems a QR code
- Links customer → QR code → store

### OTPVerification
- `channel` is always `"EMAIL"` — Twilio/SMS removed

---

## Seeding Stores

Stores are managed via `prisma/seed.ts` only. To add a new store:

```ts
// prisma/seed.ts
await db.retailStore.upsert({
  where: { code: "MY-004" },
  update: {},
  create: {
    name: "New Store Name",
    code: "MY-004",
    city: "Petaling Jaya",
    state: "Selangor",
  },
});
```

Then re-run:
```bash
npx prisma db seed
```
