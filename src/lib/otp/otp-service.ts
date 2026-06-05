import bcrypt from "bcryptjs";
import { db } from "@/lib/db/prisma";
import type { OTPPurpose } from "@prisma/client";

// ─── Email Provider (Resend) ──────────────────────────────────────────────────

export class ResendEmailProvider {
  async send(to: string, code: string, purpose: OTPPurpose) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY!);

      const subjectMap: Record<OTPPurpose, string> = {
        LOGIN: "Your login code",
        REGISTER: "Welcome — verify your email",
        VERIFY_EMAIL: "Verify your email address",
        VERIFY_PHONE: "Verify your phone number",
      };

      const { data, error } = await resend.emails.send({
        from: `ShopXR <${process.env.RESEND_FROM_EMAIL}>`,
        to,
        subject: `${subjectMap[purpose]}: ${code}`,
        html: buildEmailTemplate(code, purpose),
      });

      if (error) return { success: false, error: error.message };
      return { success: true, messageId: data?.id };
    } catch (err) {
      console.error("Resend error:", err);
      return { success: false, error: "Failed to send email" };
    }
  }
}

function buildEmailTemplate(code: string, purpose: OTPPurpose): string {
  const titleMap: Record<OTPPurpose, string> = {
    LOGIN: "Your Login Code",
    REGISTER: "Verify Your Email",
    VERIFY_EMAIL: "Verify Your Email Address",
    VERIFY_PHONE: "Verify Your Phone Number",
  };

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"/></head>
  <body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:40px 16px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 8px;">${titleMap[purpose]}</h1>
      <p style="font-size:15px;color:#64748b;margin:0 0 32px;">Use the code below to continue. It expires in 10 minutes.</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;letter-spacing:12px;font-size:36px;font-weight:700;color:#0ea5e9;margin-bottom:32px;">
        ${code}
      </div>
      <p style="font-size:13px;color:#94a3b8;margin:0;">If you did not request this code, you can safely ignore this email.</p>
    </div>
  </body>
  </html>
  `;
}

// ─── OTP Service ─────────────────────────────────────────────────────────────

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface SendOTPOptions {
  customerId?: string;
  identifier: string; // always email now
  channel?: "EMAIL"; // only EMAIL supported
  purpose: OTPPurpose;
  ipAddress?: string;
}

export interface VerifyOTPOptions {
  identifier: string;
  code: string;
  purpose: OTPPurpose;
}

class OTPService {
  private provider = new ResendEmailProvider();

  async send(options: SendOTPOptions): Promise<{ success: boolean; error?: string }> {
    const { customerId, identifier, purpose, ipAddress } = options;

    // Rate limit: check last sent
    const recent = await db.oTPVerification.findFirst({
      where: {
        identifier,
        purpose,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recent) {
      const secondsSinceSent = (Date.now() - recent.lastSentAt.getTime()) / 1000;
      if (secondsSinceSent < RESEND_COOLDOWN_SECONDS) {
        const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceSent);
        throw new Error(`Please wait ${wait}s before requesting a new code.`);
      }
      // Invalidate old
      await db.oTPVerification.update({
        where: { id: recent.id },
        data: { isUsed: true },
      });
    }

    const code = generateOTP();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await db.oTPVerification.create({
      data: {
        customerId,
        identifier,
        channel: "EMAIL",
        purpose,
        codeHash,
        expiresAt,
        maxAttempts: MAX_ATTEMPTS,
        ipAddress,
      },
    });

    const result = await this.provider.send(identifier, code, purpose);
    if (!result.success) {
      throw new Error(result.error ?? "Failed to send code");
    }
    return { success: true };
  }

  async verify(
    options: VerifyOTPOptions
  ): Promise<{ success: boolean; customerId?: string }> {
    const { identifier, code, purpose } = options;

    const record = await db.oTPVerification.findFirst({
      where: {
        identifier,
        purpose,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) throw new Error("No active verification code found. Please request a new one.");

    if (record.attempts >= record.maxAttempts) {
      throw new Error("Too many incorrect attempts. Please request a new code.");
    }

    const match = await bcrypt.compare(code, record.codeHash);

    if (!match) {
      await db.oTPVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = record.maxAttempts - record.attempts - 1;
      throw new Error(`Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
    }

    await db.oTPVerification.update({
      where: { id: record.id },
      data: { isUsed: true, verifiedAt: new Date() },
    });

    return { success: true, customerId: record.customerId ?? undefined };
  }
}

let _service: OTPService | null = null;
export function getOTPService(): OTPService {
  if (!_service) _service = new OTPService();
  return _service;
}
