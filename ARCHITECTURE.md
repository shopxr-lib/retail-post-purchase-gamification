# Gamify — Retail Post-Purchase Gamification Platform
## Complete Architecture & Project Structure

---

## Project Structure

```
gamify/
├── prisma/
│   ├── schema.prisma          # Full Prisma schema
│   ├── seed.ts                # Seed data
│   └── migrations/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── staff/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   └── customer/
│   │   │       ├── register/
│   │   │       │   └── page.tsx
│   │   │       ├── login/
│   │   │       │   └── page.tsx
│   │   │       ├── verify/
│   │   │       │   └── page.tsx
│   │   │       └── layout.tsx
│   │   │
│   │   ├── (customer)/
│   │   │   ├── layout.tsx        # Customer layout (session guard)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx      # QR + Games + Rewards
│   │   │   │   └── loading.tsx
│   │   │   ├── scan/
│   │   │   │   └── page.tsx      # QR scanner
│   │   │   ├── games/
│   │   │   │   ├── [type]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── rewards/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (staff)/
│   │   │   ├── layout.tsx        # Staff layout (session guard)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── qr/
│   │   │   │   ├── page.tsx
│   │   │   │   └── generate/
│   │   │   │       └── page.tsx
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── rewards/
│   │   │   │   └── page.tsx
│   │   │   ├── games/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...betterauth]/
│   │       │       └── route.ts  # Better Auth handler
│   │       ├── customer/
│   │       │   ├── auth/
│   │       │   │   ├── send-otp/
│   │       │   │   │   └── route.ts
│   │       │   │   └── verify-otp/
│   │       │   │       └── route.ts
│   │       │   └── session/
│   │       │       └── route.ts
│   │       ├── qr/
│   │       │   └── redeem/
│   │       │       └── route.ts
│   │       └── webhooks/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                   # Base UI components (shadcn-style)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── customer/
│   │   │   ├── QRScanner.tsx
│   │   │   ├── CreditBadge.tsx
│   │   │   ├── GameCard.tsx
│   │   │   ├── RewardCard.tsx
│   │   │   └── CustomerNav.tsx
│   │   │
│   │   ├── games/
│   │   │   ├── GameEngine.tsx    # Shared game wrapper
│   │   │   ├── TreasureBox.tsx
│   │   │   ├── TreasureBox3D.tsx
│   │   │   ├── ScratchCard.tsx
│   │   │   ├── Gachapon.tsx
│   │   │   └── BlindBox.tsx
│   │   │
│   │   ├── staff/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── CustomerTable.tsx
│   │   │   ├── QRGenerateForm.tsx
│   │   │   ├── QRDisplay.tsx
│   │   │   ├── ClaimModal.tsx
│   │   │   └── CustomerDrawer.tsx
│   │   │
│   │   └── shared/
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ThemeToggle.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── staff-auth.ts     # Better Auth config
│   │   │   ├── customer-auth.ts  # Custom session management
│   │   │   └── middleware.ts
│   │   │
│   │   ├── otp/
│   │   │   ├── otp-service.ts    # Abstract OTP interface
│   │   │   ├── email-provider.ts # Resend implementation
│   │   │   ├── sms-provider.ts   # Twilio implementation
│   │   │   └── otp-utils.ts      # Hash, verify, rate-limit
│   │   │
│   │   ├── qr/
│   │   │   ├── qr-generator.ts
│   │   │   └── qr-validator.ts
│   │   │
│   │   ├── games/
│   │   │   ├── game-engine.ts    # Core game logic
│   │   │   ├── reward-engine.ts  # Prize probability engine
│   │   │   └── game-types.ts     # Game type definitions
│   │   │
│   │   ├── db/
│   │   │   ├── prisma.ts         # Prisma client singleton
│   │   │   └── queries/
│   │   │       ├── customer.ts
│   │   │       ├── staff.ts
│   │   │       ├── qr.ts
│   │   │       └── campaign.ts
│   │   │
│   │   ├── validations/
│   │   │   ├── auth.schema.ts
│   │   │   ├── qr.schema.ts
│   │   │   ├── campaign.schema.ts
│   │   │   └── customer.schema.ts
│   │   │
│   │   └── utils/
│   │       ├── rate-limiter.ts
│   │       ├── audit.ts
│   │       └── format.ts
│   │
│   ├── actions/                  # Next.js Server Actions
│   │   ├── auth/
│   │   │   ├── customer-actions.ts
│   │   │   └── staff-actions.ts
│   │   ├── qr/
│   │   │   ├── generate.ts
│   │   │   └── redeem.ts
│   │   ├── games/
│   │   │   └── play.ts
│   │   ├── prizes/
│   │   │   └── claim.ts
│   │   ├── campaigns/
│   │   │   └── manage.ts
│   │   └── customers/
│   │       └── manage.ts
│   │
│   ├── hooks/
│   │   ├── useCustomerSession.ts
│   │   ├── useCredits.ts
│   │   ├── useQRScanner.ts
│   │   ├── useGamePlay.ts
│   │   ├── usePagination.ts
│   │   └── useDebounce.ts
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── customer-store.ts
│   │   ├── staff-store.ts
│   │   ├── game-store.ts
│   │   └── ui-store.ts
│   │
│   ├── types/
│   │   ├── customer.ts
│   │   ├── staff.ts
│   │   ├── game.ts
│   │   ├── prize.ts
│   │   └── api.ts
│   │
│   └── middleware.ts             # Route protection
│
├── public/
│   ├── games/                    # Game assets
│   └── icons/
│
├── .env.example
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── eslint.config.mjs
├── prettier.config.js
└── package.json
```

---

## Database Relationships

```
RetailStore
  ├── has many StaffStoreAssignment → Staff
  ├── has many QRCode (generated at store)
  ├── has many Purchase
  └── has many CustomerPrize (claim location)

Staff (Better Auth)
  ├── has many StaffSession
  ├── has many StaffAccount
  ├── belongs to many RetailStore (via StaffStoreAssignment)
  ├── has many QRCode (generated)
  ├── has many CustomerPrize (claimed/unclaimed by)
  └── has many AuditLog

Customer
  ├── has many CustomerSession
  ├── has many OTPVerification
  ├── has many QRCode (redeemed)
  ├── has many Purchase
  ├── has many CreditTransaction
  ├── has many GamePlay
  └── has many CustomerPrize

Campaign
  ├── belongs to many RetailStore (via CampaignStore)
  ├── has many QRCode
  ├── has many GamePlay
  └── has many Prize

QRCode
  ├── belongs to Campaign
  ├── belongs to Staff (generatedBy)
  ├── belongs to RetailStore
  ├── optionally belongs to Customer (redeemedBy)
  └── has one Purchase

Purchase
  ├── belongs to Customer
  ├── belongs to QRCode (1:1)
  ├── belongs to RetailStore
  └── has one CreditTransaction

CreditTransaction
  ├── belongs to Customer
  ├── optionally belongs to Purchase
  └── optionally belongs to GamePlay

GamePlay
  ├── belongs to Customer
  ├── optionally belongs to Campaign
  ├── has one CreditTransaction
  └── has many CustomerPrize

Prize
  ├── belongs to Campaign
  └── has many CustomerPrize

CustomerPrize
  ├── belongs to Customer
  ├── belongs to Prize
  ├── optionally belongs to GamePlay
  ├── optionally belongs to Staff (claimedBy)
  └── optionally belongs to RetailStore (claimStore)
```

---

## Authentication Architecture

### Staff Auth (Better Auth)

Better Auth handles all staff authentication with email+password.

```ts
// src/lib/auth/staff-auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db/prisma";

export const staffAuth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "STAFF" },
      isActive: { type: "boolean", required: true, defaultValue: true },
    },
  },
});

// API route: src/app/api/auth/[...betterauth]/route.ts
import { staffAuth } from "@/lib/auth/staff-auth";
const handler = staffAuth.handler;
export { handler as GET, handler as POST };
```

### Customer Auth (Custom OTP)

Customers never set passwords. Auth is entirely OTP-based.

**Flow:**
1. Customer submits name + email + phone (register) or just email/phone (login)
2. Server generates a 6-digit OTP, hashes it with bcrypt, stores in `OTPVerification`
3. OTP sent via Resend (email) or Twilio (SMS) based on customer preference
4. Customer submits code → server verifies hash → creates `CustomerSession` with secure token
5. Token stored in httpOnly cookie + Zustand store

---

## OTP Service Architecture

```ts
// src/lib/otp/otp-service.ts  — Provider-agnostic interface

export interface OTPProvider {
  send(to: string, code: string, purpose: OTPPurpose): Promise<{ success: boolean; messageId?: string }>;
}

export class OTPService {
  private emailProvider: OTPProvider;
  private smsProvider: OTPProvider;

  constructor(email: OTPProvider, sms: OTPProvider) {
    this.emailProvider = email;
    this.smsProvider = sms;
  }

  async sendOTP(params: {
    customerId?: string;
    identifier: string;        // email or phone
    channel: OTPChannel;
    purpose: OTPPurpose;
    ipAddress?: string;
  }) {
    // 1. Rate limit check (max 3 OTPs per 10 minutes per identifier)
    await this.checkRateLimit(params.identifier);
    
    // 2. Generate 6-digit code
    const code = this.generateCode();
    
    // 3. Hash the code
    const codeHash = await bcrypt.hash(code, 12);
    
    // 4. Store in DB
    await db.oTPVerification.create({
      data: {
        customerId: params.customerId,
        identifier: params.identifier,
        channel: params.channel,
        purpose: params.purpose,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        ipAddress: params.ipAddress,
      }
    });
    
    // 5. Send via appropriate provider
    const provider = params.channel === "EMAIL" 
      ? this.emailProvider 
      : this.smsProvider;
      
    return provider.send(params.identifier, code, params.purpose);
  }

  async verifyOTP(params: {
    identifier: string;
    code: string;
    purpose: OTPPurpose;
  }) {
    const record = await db.oTPVerification.findFirst({
      where: {
        identifier: params.identifier,
        purpose: params.purpose,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) throw new Error("OTP not found or expired");
    if (record.attempts >= record.maxAttempts) throw new Error("Too many attempts");

    // Increment attempts
    await db.oTPVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    const valid = await bcrypt.compare(params.code, record.codeHash);
    if (!valid) throw new Error("Invalid OTP");

    // Mark used
    await db.oTPVerification.update({
      where: { id: record.id },
      data: { isUsed: true, verifiedAt: new Date() },
    });

    return record;
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async checkRateLimit(identifier: string) {
    const count = await db.oTPVerification.count({
      where: {
        identifier,
        createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });
    if (count >= 3) throw new Error("Rate limit exceeded. Try again later.");
  }
}

// src/lib/otp/email-provider.ts
import { Resend } from "resend";

export class ResendEmailProvider implements OTPProvider {
  private resend = new Resend(process.env.RESEND_API_KEY!);

  async send(to: string, code: string, purpose: OTPPurpose) {
    const { data, error } = await this.resend.emails.send({
      from: "Gamify <noreply@yourdomain.com>",
      to,
      subject: `Your verification code: ${code}`,
      html: this.buildTemplate(code, purpose),
    });
    return { success: !error, messageId: data?.id };
  }

  private buildTemplate(code: string, purpose: OTPPurpose) {
    return `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2>Your verification code</h2>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; 
                    padding: 20px; background: #f4f4f5; border-radius: 8px; 
                    text-align: center;">${code}</div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #71717a; font-size: 12px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `;
  }
}

// src/lib/otp/sms-provider.ts
import twilio from "twilio";

export class TwilioSMSProvider implements OTPProvider {
  private client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  async send(to: string, code: string, purpose: OTPPurpose) {
    try {
      const message = await this.client.messages.create({
        body: `Your Gamify verification code: ${code}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to,
      });
      return { success: true, messageId: message.sid };
    } catch (error) {
      return { success: false };
    }
  }
}

// Singleton
import { ResendEmailProvider } from "./email-provider";
import { TwilioSMSProvider } from "./sms-provider";

export const otpService = new OTPService(
  new ResendEmailProvider(),
  new TwilioSMSProvider()
);
```

---

## QR Generation & Redemption Flow

```ts
// src/actions/qr/generate.ts
"use server";

export async function generateQRCode(input: GenerateQRInput) {
  const staff = await requireStaffSession();
  const validated = generateQRSchema.parse(input);
  
  // Verify active campaign exists
  const campaign = await db.campaign.findFirst({
    where: { isActive: true, status: "ACTIVE" },
  });
  if (!campaign) throw new Error("No active campaign");

  // Calculate credits
  const credits = Math.floor(
    Number(validated.amountPaid) * campaign.creditsPerUnit
  );

  const qr = await db.qRCode.create({
    data: {
      campaignId: campaign.id,
      generatedById: staff.id,
      storeId: validated.storeId,
      amountPaid: validated.amountPaid,
      receiptNumber: validated.receiptNumber,
      creditsGranted: credits,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      status: "ACTIVE",
    },
  });

  await auditLog({ staffId: staff.id, action: "QR_GENERATE", entityId: qr.id });

  // Return QR code string for client rendering
  return { qrCode: qr.code, creditsGranted: credits };
}

// src/actions/qr/redeem.ts
"use server";

export async function redeemQRCode(code: string) {
  const customer = await requireCustomerSession();

  return await db.$transaction(async (tx) => {
    // 1. Lock and fetch QR
    const qr = await tx.qRCode.findUnique({
      where: { code },
      include: { campaign: true },
    });

    if (!qr) throw new Error("Invalid QR code");
    if (qr.status !== "ACTIVE") throw new Error("QR code already used or expired");
    if (qr.expiresAt < new Date()) throw new Error("QR code has expired");
    if (!qr.campaign.isActive) throw new Error("Campaign is no longer active");

    // 2. Mark QR as redeemed (atomic)
    await tx.qRCode.update({
      where: { id: qr.id, status: "ACTIVE" }, // extra guard
      data: {
        status: "REDEEMED",
        redeemedById: customer.id,
        redeemedAt: new Date(),
      },
    });

    // 3. Create purchase record
    const purchase = await tx.purchase.create({
      data: {
        customerId: customer.id,
        qrCodeId: qr.id,
        storeId: qr.storeId,
        staffId: qr.generatedById,
        amountPaid: qr.amountPaid,
        receiptNumber: qr.receiptNumber,
        creditsEarned: qr.creditsGranted,
        campaignId: qr.campaignId,
      },
    });

    // 4. Credit transaction (atomic balance update)
    const updatedCustomer = await tx.customer.update({
      where: { id: customer.id },
      data: { 
        totalCredits: { increment: qr.creditsGranted },
        totalSpent: { increment: qr.amountPaid },
      },
    });

    await tx.creditTransaction.create({
      data: {
        customerId: customer.id,
        purchaseId: purchase.id,
        type: "EARNED_QR",
        amount: qr.creditsGranted,
        balanceBefore: updatedCustomer.totalCredits - qr.creditsGranted,
        balanceAfter: updatedCustomer.totalCredits,
        description: `QR redemption - ${qr.receiptNumber ?? qr.code}`,
      },
    });

    return { credits: qr.creditsGranted, newBalance: updatedCustomer.totalCredits };
  });
}
```

---

## Game Engine Architecture

```ts
// src/lib/games/game-engine.ts

export interface GameResult {
  prizeId: string | null;
  prizeName: string;
  prizeType: PrizeType;
  value?: number;
  won: boolean;
  animationData: Record<string, unknown>;
}

export interface GameEngine {
  play(customerId: string, campaignId: string): Promise<GameResult>;
}

// Base implementation shared by all games
export class BaseGameEngine {
  protected async validateAndDeductCredits(
    customerId: string,
    campaignId: string,
    gameType: GameType,
    tx: PrismaTransaction
  ) {
    const config = await tx.gameConfig.findUnique({ where: { gameType } });
    if (!config?.isEnabled) throw new Error("Game not available");

    const customer = await tx.customer.findUnique({ where: { id: customerId } });
    if (!customer || customer.totalCredits < config.creditCost) {
      throw new Error("Insufficient credits");
    }

    // Check campaign has this game enabled
    const campaign = await tx.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign?.enabledGames.includes(gameType)) {
      throw new Error("Game not enabled for this campaign");
    }

    // Deduct credits
    const updated = await tx.customer.update({
      where: { id: customerId },
      data: { totalCredits: { decrement: config.creditCost } },
    });

    return { creditCost: config.creditCost, newBalance: updated.totalCredits };
  }

  protected async generateReward(campaignId: string, tx: PrismaTransaction): Promise<Prize | null> {
    const prizes = await tx.prize.findMany({
      where: { campaignId, isActive: true },
      orderBy: { probability: "desc" },
    });

    const roll = Math.random();
    let cumulative = 0;

    for (const prize of prizes) {
      cumulative += prize.probability;
      if (roll <= cumulative) {
        // Check stock
        if (prize.totalStock !== null && prize.claimedCount >= prize.totalStock) {
          continue; // Skip out-of-stock prizes
        }
        return prize;
      }
    }

    return null; // No prize won
  }

  async play(customerId: string, campaignId: string, gameType: GameType): Promise<GameResult> {
    return await db.$transaction(async (tx) => {
      // 1. Validate & deduct credits
      const { creditCost, newBalance } = await this.validateAndDeductCredits(
        customerId, campaignId, gameType, tx
      );

      // 2. Create GamePlay record
      const gamePlay = await tx.gamePlay.create({
        data: { customerId, campaignId, gameType, creditCost, status: "PENDING" },
      });

      // 3. Generate reward
      const prize = await this.generateReward(campaignId, tx);

      // 4. Record credit transaction
      await tx.creditTransaction.create({
        data: {
          customerId,
          gamePlayId: gamePlay.id,
          type: "SPENT_GAME",
          amount: -creditCost,
          balanceBefore: newBalance + creditCost,
          balanceAfter: newBalance,
          description: `${gameType} play`,
        },
      });

      let customerPrize = null;

      if (prize) {
        // 5. Assign prize to customer
        customerPrize = await tx.customerPrize.create({
          data: {
            customerId,
            prizeId: prize.id,
            gamePlayId: gamePlay.id,
            claimStatus: "UNCLAIMED",
          },
        });

        // 6. Increment prize claimed count
        await tx.prize.update({
          where: { id: prize.id },
          data: { claimedCount: { increment: 1 } },
        });
      }

      // 7. Mark game complete
      await tx.gamePlay.update({
        where: { id: gamePlay.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          result: { prizeId: prize?.id, won: !!prize },
        },
      });

      return {
        prizeId: prize?.id ?? null,
        prizeName: prize?.name ?? "Better luck next time!",
        prizeType: prize?.type ?? "DIGITAL",
        value: prize?.value ? Number(prize.value) : undefined,
        won: !!prize,
        animationData: {},
      };
    });
  }
}

// Each game is a thin wrapper that can override animation data / config
export class TreasureBoxGame extends BaseGameEngine {
  async play(customerId: string, campaignId: string) {
    const result = await super.play(customerId, campaignId, "TREASURE_BOX");
    return { ...result, animationData: { animation: "box-open", particles: true } };
  }
}

export class ScratchCardGame extends BaseGameEngine {
  async play(customerId: string, campaignId: string) {
    const result = await super.play(customerId, campaignId, "SCRATCH_CARD");
    return { ...result, animationData: { animation: "scratch-reveal", regions: 9 } };
  }
}

// Factory
export function createGame(type: GameType): BaseGameEngine {
  switch (type) {
    case "TREASURE_BOX":    return new TreasureBoxGame();
    case "TREASURE_BOX_3D": return new TreasureBoxGame();
    case "SCRATCH_CARD":    return new ScratchCardGame();
    case "GACHAPON":        return new BaseGameEngine();
    case "BLIND_BOX":       return new BaseGameEngine();
  }
}
```

---

## Zustand Store Structure

```ts
// src/stores/customer-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomerStore {
  customer: Customer | null;
  sessionToken: string | null;
  credits: number;
  setCustomer: (customer: Customer) => void;
  setCredits: (credits: number) => void;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => void;
  logout: () => void;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customer: null,
      sessionToken: null,
      credits: 0,
      setCustomer: (customer) => set({ customer, credits: customer.totalCredits }),
      setCredits: (credits) => set({ credits }),
      addCredits: (amount) => set((s) => ({ credits: s.credits + amount })),
      deductCredits: (amount) => set((s) => ({ credits: Math.max(0, s.credits - amount) })),
      logout: () => set({ customer: null, sessionToken: null, credits: 0 }),
    }),
    { name: "customer-session", partialize: (s) => ({ sessionToken: s.sessionToken }) }
  )
);

// src/stores/ui-store.ts
interface UIStore {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];
  setTheme: (theme: "light" | "dark") => void;
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// src/stores/game-store.ts
interface GameStore {
  activeGame: GameType | null;
  isPlaying: boolean;
  lastResult: GameResult | null;
  playHistory: GamePlay[];
  setActiveGame: (game: GameType | null) => void;
  setPlaying: (playing: boolean) => void;
  setLastResult: (result: GameResult) => void;
}
```

---

## Server Actions Reference

```ts
// src/actions/prizes/claim.ts
"use server";

export async function claimPrize(customerPrizeId: string, storeId: string) {
  const staff = await requireStaffSession();
  
  // Confirm dialog happens on client; action just executes
  return await db.$transaction(async (tx) => {
    const cp = await tx.customerPrize.findUnique({
      where: { id: customerPrizeId },
      include: { prize: true, customer: true },
    });
    if (!cp) throw new Error("Prize not found");

    await tx.customerPrize.update({
      where: { id: customerPrizeId },
      data: {
        claimStatus: "CLAIMED",
        claimedById: staff.id,
        claimStoreId: storeId,
        claimedAt: new Date(),
      },
    });

    await auditLog({
      staffId: staff.id,
      action: "PRIZE_CLAIM",
      entityType: "CustomerPrize",
      entityId: customerPrizeId,
      metadata: { customerId: cp.customerId, prizeName: cp.prize.name },
    });
  });
}

export async function unclaimPrize(customerPrizeId: string) {
  const staff = await requireStaffSession();
  
  await db.customerPrize.update({
    where: { id: customerPrizeId },
    data: {
      claimStatus: "UNCLAIMED",
      claimedById: null,
      claimStoreId: null,
      claimedAt: null,
    },
  });

  await auditLog({ staffId: staff.id, action: "PRIZE_UNCLAIM", entityType: "CustomerPrize", entityId: customerPrizeId });
}
```

---

## Key React Components

### Customer QR Scanner

```tsx
// src/components/customer/QRScanner.tsx
"use client";

import { useCallback, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { motion, AnimatePresence } from "framer-motion";
import { redeemQRCode } from "@/actions/qr/redeem";
import { useCustomerStore } from "@/stores/customer-store";
import { useUIStore } from "@/stores/ui-store";

export function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addCredits, addToast } = useCustomerStore();
  const { addToast } = useUIStore();

  const onScan = useCallback(async (code: string) => {
    try {
      const { credits, newBalance } = await redeemQRCode(code);
      addCredits(credits);
      addToast({ type: "success", message: `+${credits} credits earned!` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Scan failed";
      addToast({ type: "error", message });
    }
  }, []);

  // ... ZXing setup, camera permissions, etc.
}
```

### Game Engine Component

```tsx
// src/components/games/GameEngine.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGamePlay } from "@/hooks/useGamePlay";
import { useCustomerStore } from "@/stores/customer-store";

interface GameEngineProps {
  gameType: GameType;
  children: (props: {
    isPlaying: boolean;
    onPlay: () => void;
    result: GameResult | null;
    canPlay: boolean;
  }) => React.ReactNode;
}

export function GameEngine({ gameType, children }: GameEngineProps) {
  const { credits } = useCustomerStore();
  const { isPlaying, lastResult, play } = useGamePlay(gameType);
  
  const canPlay = credits > 0; // also check QR scanned at least once

  return (
    <div className="relative">
      {children({ isPlaying, onPlay: play, result: lastResult, canPlay })}
      
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50"
          >
            <RewardReveal result={lastResult} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Customer Table (Staff Dashboard)

```tsx
// src/components/staff/CustomerTable.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

// Expandable row showing full customer history
export function CustomerTable() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", { search, page }],
    queryFn: () => fetchCustomers({ search, page, limit: 20 }),
    placeholderData: (prev) => prev,
  });

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} />
      
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Email / Phone</th>
            <th>Total Spent</th>
            <th>Credits</th>
            <th>Purchases</th>
            <th>Prizes Won</th>
            <th>Store</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.customers.map((customer) => (
            <>
              <tr key={customer.id} onClick={() => setExpandedId(
                expandedId === customer.id ? null : customer.id
              )}>
                {/* ... cells */}
              </tr>
              
              <AnimatePresence>
                {expandedId === customer.id && (
                  <motion.tr
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <td colSpan={8}>
                      <CustomerDetailExpanded customerId={customer.id} />
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </>
          ))}
        </tbody>
      </table>
      
      <Pagination page={page} total={data?.total} onChange={setPage} />
    </div>
  );
}
```

---

## Middleware & Route Protection

```ts
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Staff routes
  if (path.startsWith("/(staff)") || path.startsWith("/dashboard")) {
    const staffToken = req.cookies.get("better-auth.session_token")?.value;
    if (!staffToken) return NextResponse.redirect(new URL("/staff/login", req.url));
    // Better Auth validates on the server action / page level
  }

  // Customer routes
  if (path.startsWith("/(customer)")) {
    const customerToken = req.cookies.get("customer_session")?.value;
    if (!customerToken) return NextResponse.redirect(new URL("/customer/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(staff)/:path*", "/(customer)/:path*"],
};
```

---

## Seed Data

```ts
// prisma/seed.ts
import { PrismaClient, GameType, PrizeType } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // Retail stores
  const store1 = await db.retailStore.create({
    data: { name: "Flagship Store KL", code: "KL-001", city: "Kuala Lumpur" },
  });
  const store2 = await db.retailStore.create({
    data: { name: "Sunway Pyramid", code: "MY-002", city: "Subang Jaya" },
  });

  // Super admin staff
  const adminPassword = await hash("Admin@123", 12);
  const admin = await db.staff.create({
    data: {
      name: "Super Admin",
      email: "admin@gamify.com",
      role: "SUPER_ADMIN",
      emailVerified: true,
      accounts: {
        create: {
          accountId: "admin@gamify.com",
          providerId: "credential",
          password: adminPassword,
        },
      },
      stores: { create: { storeId: store1.id, isPrimary: true } },
    },
  });

  // Campaign
  const campaign = await db.campaign.create({
    data: {
      name: "Year-End Bonanza 2025",
      status: "ACTIVE",
      isActive: true,
      startDate: new Date("2025-11-01"),
      endDate: new Date("2025-12-31"),
      creditsPerUnit: 1,
      enabledGames: ["TREASURE_BOX", "SCRATCH_CARD", "GACHAPON"],
      stores: { create: { storeId: store1.id } },
    },
  });

  // Prizes
  await db.prize.createMany({
    data: [
      { campaignId: campaign.id, name: "RM50 Voucher", type: "VOUCHER", value: 50, probability: 0.05, totalStock: 100 },
      { campaignId: campaign.id, name: "RM20 Voucher", type: "VOUCHER", value: 20, probability: 0.15, totalStock: 500 },
      { campaignId: campaign.id, name: "10% Discount", type: "DISCOUNT", value: 10, probability: 0.30 },
      { campaignId: campaign.id, name: "5% Discount", type: "DISCOUNT", value: 5, probability: 0.35 },
      { campaignId: campaign.id, name: "Better Luck Next Time", type: "DIGITAL", probability: 0.15 },
    ],
  });

  // Game configs
  await db.gameConfig.createMany({
    data: Object.values(GameType).map((gameType) => ({
      gameType,
      creditCost: 1,
      isEnabled: true,
      config: { defaultProbability: 0.5 },
    })),
  });

  console.log("✅ Seed complete");
}

main().catch(console.error).finally(() => db.$disconnect());
```

---

## Environment Variables

```bash
# .env.example

# ─── Database ───────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/gamify"

# ─── App ────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_SECRET="your-super-secret-32-char-string"

# ─── Better Auth ────────────────────────────────
BETTER_AUTH_SECRET="your-better-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"

# ─── Customer Session ───────────────────────────
CUSTOMER_SESSION_SECRET="your-customer-session-secret"
CUSTOMER_SESSION_MAX_AGE="604800"   # 7 days in seconds

# ─── Resend (Email OTP) ──────────────────────────
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# ─── Twilio (SMS OTP) ────────────────────────────
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+60123456789"

# ─── QR Code ────────────────────────────────────
QR_EXPIRY_HOURS="24"

# ─── Rate Limiting ──────────────────────────────
OTP_RATE_LIMIT_WINDOW_MINUTES="10"
OTP_RATE_LIMIT_MAX="3"
OTP_EXPIRY_MINUTES="10"
OTP_MAX_ATTEMPTS="5"
```

---

## Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    
    "@prisma/client": "^6.0.0",
    "better-auth": "^1.0.0",
    
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    
    "framer-motion": "^11.0.0",
    "tailwindcss": "^4.0.0",
    
    "resend": "^4.0.0",
    "twilio": "^5.0.0",
    
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0",
    "qrcode": "^1.5.3",
    "@zxing/browser": "^0.1.5",
    
    "sonner": "^1.5.0",
    "react-hot-toast": "^2.4.1",
    
    "jose": "^5.0.0",
    "nanoid": "^5.0.0",
    
    "date-fns": "^3.0.0",
    "numeral": "^2.0.6"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/qrcode": "^1.5.5",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0"
  }
}
```

---

## Setup Instructions

```bash
# 1. Create Next.js 15 project
npx create-next-app@latest gamify \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*"

cd gamify

# 2. Install all dependencies (see package.json above)
npm install

# 3. Setup Prisma
npx prisma init
# Paste schema.prisma content
npx prisma migrate dev --name init
npx prisma generate

# 4. Seed database
npx tsx prisma/seed.ts

# 5. Setup Better Auth
npx @better-auth/cli generate
# Follow prompts to configure staff auth

# 6. Copy .env.example to .env.local and fill in values
cp .env.example .env.local

# 7. Run development
npm run dev
```

---

## Production Deployment

### Recommended Stack
- **Hosting**: Vercel (seamless Next.js 15 + edge runtime)
- **Database**: Neon (serverless PostgreSQL) or Supabase
- **Email**: Resend (already integrated)
- **SMS**: Twilio (already integrated)
- **File Storage**: Vercel Blob or Cloudflare R2 (for QR code images, prize images)
- **CDN**: Vercel Edge Network (built-in)
- **Monitoring**: Sentry + Vercel Analytics
- **Rate Limiting**: Upstash Redis (replace in-memory rate limiter for production)

### Production Checklist
- [ ] Replace in-memory rate limiter with Upstash Redis
- [ ] Set up Neon database with connection pooling via PgBouncer
- [ ] Configure Prisma Accelerate for edge runtime queries
- [ ] Enable Vercel Edge Config for feature flags
- [ ] Set up Sentry error boundaries
- [ ] Configure CORS for API routes
- [ ] Enable CSP headers in next.config.ts
- [ ] Set up database backups (Neon auto-backups)
- [ ] Configure Upstash Redis for session caching
- [ ] Set up QR code image generation with Vercel OG

### Security Hardening
- Validate all QR code redemptions inside DB transactions with row-level locking
- Store customer session tokens as httpOnly, SameSite=Strict cookies
- Hash OTPs with bcrypt (cost factor 12) before storage
- Audit log all sensitive staff actions
- Server-side validate every form input with Zod
- Use Prisma's parameterized queries (SQL injection prevention built-in)

---

## Scalability Architecture Decisions

| Decision | Choice | Reasoning |
|---|---|---|
| Auth for Staff | Better Auth | Production-ready, Prisma adapter, handles sessions properly |
| Auth for Customers | Custom OTP | No passwords needed, fits the retail kiosk UX perfectly |
| QR Redemption | DB Transaction + status guard | Prevents race conditions, atomic double-spend protection |
| Game Engine | Strategy pattern | All games share credit/prize logic; only animation differs |
| OTP Delivery | Provider interface | Swap Resend/Twilio anytime without touching business logic |
| Credits | Integer (not Decimal) | Avoids floating-point issues for credit arithmetic |
| Soft Deletes | `deletedAt` on key models | Keeps audit trail, enables data recovery |
| Prize Probability | Weighted random cumulative | Accurate probability distribution across all prizes |
| Pagination | Cursor-based (production) | Offset pagination shown for simplicity; use cursor for scale |
| State Management | Zustand + TanStack Query | Zustand for UI/session, TanStack for server state |
```
