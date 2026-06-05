"use server";

import { db } from "@/lib/db/prisma";
import { requireCustomerSession, requireAdminSession } from "@/lib/auth/session";
import { redeemQRSchema } from "@/lib/validations/schemas";
import QRCode from "qrcode";

// ─── Generate QR (Admin only) ─────────────────────────────────────────────────

export async function generateQRCode(formData: FormData) {
  const session = await requireAdminSession();

  const amountPaid = Number(formData.get("amountPaid"));
  const receiptNumber = (formData.get("receiptNumber") as string) || undefined;
  const campaignId = formData.get("campaignId") as string;

  if (!amountPaid || amountPaid <= 0) return { error: "Amount must be greater than 0" };
  if (!campaignId) return { error: "Campaign is required" };

  const now = new Date();
  const campaign = await db.campaign.findFirst({
    where: {
      id: campaignId,
      deletedAt: null,
      startDate: { lte: now },
      OR: [{ endDate: { gte: now } }, { endDate: { equals: null } }],
      status: 1,
    },
  });
  if (!campaign) return { error: "No active campaign found" };

  const credits = Math.floor(amountPaid / campaign.creditsPerUnit);

  const qr = await db.qRCode.create({
    data: {
      campaignId,
      generatedById: session.id,
      amountPaid,
      receiptNumber: receiptNumber ?? null,
      creditsGranted: credits,
      status: "ACTIVE",
    },
  });

  const qrImageUrl = await QRCode.toDataURL(qr.code, {
    width: 320,
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  return { success: true, qrCode: qr.code, qrImageUrl, creditsGranted: credits };
}

// ─── Redeem QR (Customer only) ────────────────────────────────────────────────

export async function redeemQRCode(code: string) {
  const customer = await requireCustomerSession();

  const parsed = redeemQRSchema.safeParse({ code });
  if (!parsed.success) return { error: "Invalid QR code format" };

  try {
    const result = await db.$transaction(async (tx) => {
      const qr = await tx.qRCode.findUnique({
        where: { code: parsed.data.code },
        include: {
          campaign: { select: { startDate: true, endDate: true, deletedAt: true, status: true } },
        },
      });

      if (!qr) throw new Error("QR code not found");
      if (qr.status !== "ACTIVE") throw new Error("This QR code has already been used");

      // Check campaign still active
      const now = new Date();
      if (
        qr.campaign.deletedAt ||
        qr.campaign.startDate > now ||
        (qr.campaign.endDate !== null && qr.campaign.endDate < now) ||
        qr.campaign.status !== 1
      )
        throw new Error("The associated campaign is no longer active");

      const updated = await tx.qRCode.updateMany({
        where: { id: qr.id, status: "ACTIVE" },
        data: { status: "REDEEMED", redeemedById: customer.id, redeemedAt: new Date() },
      });
      if (updated.count === 0) throw new Error("This QR code has already been claimed");

      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          qrCodeId: qr.id,
        },
      });

      const updatedCustomer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalCredits: { increment: qr.creditsGranted },
          totalSpent: { increment: qr.amountPaid },
        },
      });

      const balanceBefore = updatedCustomer.totalCredits - qr.creditsGranted;

      await tx.creditTransaction.create({
        data: {
          customerId: customer.id,
          orderId: order.id,
          type: "EARNED_QR",
          amount: qr.creditsGranted,
          balanceBefore,
          balanceAfter: updatedCustomer.totalCredits,
          description: `Order scanned — ${qr.receiptNumber ?? qr.code.slice(0, 8)}`,
        },
      });

      return {
        creditsEarned: qr.creditsGranted,
        newBalance: updatedCustomer.totalCredits,
        orderId: order.id,
      };
    });

    return { success: true, ...result };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to redeem QR code" };
  }
}
