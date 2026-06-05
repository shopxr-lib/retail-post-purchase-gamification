import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const customerRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
    .transform((v) => (v.startsWith("+") ? v : `+${v}`)),
});

export const sendOTPSchema = z.object({
  identifier: z.string().email("Invalid email address"),
  purpose: z.enum(["LOGIN", "REGISTER", "VERIFY_EMAIL", "VERIFY_PHONE"]),
});

export const verifyOTPSchema = z.object({
  identifier: z.string().min(1),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
  purpose: z.enum(["LOGIN", "REGISTER", "VERIFY_EMAIL", "VERIFY_PHONE"]),
});

// ─── QR ──────────────────────────────────────────────────────────────────────

export const redeemQRSchema = z.object({
  code: z.string().min(1).max(200),
});

// ─── Prizes ──────────────────────────────────────────────────────────────────

export const prizeSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.number(),
  value: z.string().max(200).optional(), // coupon code, product name, description, empty
  winningProbabilityMode: z.enum(["PERCENTAGE", "CREDIT_COUNT"]),
  winningProbabilityValue: z.number().positive(),
});

// ─── Campaign ─────────────────────────────────────────────────────────────────

export const createCampaignSchema = z
  .object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    startDate: z.preprocess(
      (v) => (v ? new Date(v as string) : undefined),
      z.date()
    ),

    endDate: z.preprocess(
      (v) => (v ? new Date(v as string) : undefined),
      z.date().optional()
    ),
    status: z.number(),
    creditsPerUnit: z.number().int().positive(), // $ per credit (e.g. 100 = $100 per credit)
    gameType: z.number(),
    prizes: z.array(prizeSchema).min(1, "At least one prize required"),
  })
  .refine(
    (d) => {
      // Only validate date order if endDate is provided
      if (!d.endDate) return true;
      return d.endDate > d.startDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  )
  .refine(
    (d) => {
      const percentagePrizes = d.prizes.filter((p) => p.winningProbabilityMode === "PERCENTAGE");
      if (percentagePrizes.length === 0) return true;
      const total = percentagePrizes.reduce((s, p) => s + p.winningProbabilityValue, 0);
      return Math.abs(total - 100) < 0.01;
    },
    {
      message: "Percentage-mode prize probabilities must sum to exactly 100%",
      path: ["prizes"],
    }
  );

export const updateCampaignSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2).max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  creditsPerUnit: z.number().int().positive().optional(),
  status: z.number(),
  gameType: z.number()
  
});

export const updatePrizeSchema = prizeSchema.extend({
  id: z.string().cuid(),
});

// ─── Claims ───────────────────────────────────────────────────────────────────

export const claimPrizeSchema = z.object({
  customerPrizeId: z.string().cuid(),
  storeId: z.string().cuid(),
});

// ─── Customer search ─────────────────────────────────────────────────────────

export const customerSearchSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "totalSpent", "totalCredits", "name"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PrizeInput = z.infer<typeof prizeSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
