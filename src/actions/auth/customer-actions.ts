"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { getOTPService } from "@/lib/otp/otp-service";
import { createCustomerSession, destroyCustomerSession } from "@/lib/auth/customer-auth";
import { customerRegisterSchema, verifyOTPSchema, sendOTPSchema } from "@/lib/validations/schemas";

function getIP(): string | undefined {
  const headersList = headers() as unknown as { get: (key: string) => string | null };
  return (
    headersList.get("x-forwarded-for")?.split(",")[0] ??
    headersList.get("x-real-ip") ??
    undefined
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerCustomer(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  };

  const parsed = customerRegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, phone } = parsed.data;

  const existing = await db.customer.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  if (existing) {
    const conflict = existing.email === email ? "email" : "phone number";
    return { error: `This ${conflict} is already registered. Please log in.` };
  }

  const customer = await db.customer.create({
    data: { name, email, phone },
  });

  const otpService = getOTPService();
  await otpService.send({
    customerId: customer.id,
    identifier: email,
    purpose: "REGISTER",
    ipAddress: getIP(),
  });

  return { success: true, customerId: customer.id, identifier: email };
}

// ─── Send Login OTP ───────────────────────────────────────────────────────────

export async function sendLoginOTP(formData: FormData) {
  const raw = {
    identifier: formData.get("identifier"),
    purpose: "LOGIN",
  };

  const parsed = sendOTPSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { identifier } = parsed.data;

  const customer = await db.customer.findFirst({ where: { email: identifier } });

  if (!customer) {
    // Security: don't reveal if account exists
    return { success: true, message: "If an account exists, you'll receive a code shortly." };
  }

  if (!customer.isActive) {
    return { error: "Your account has been suspended. Please contact support." };
  }

  const otpService = getOTPService();
  try {
    await otpService.send({
      customerId: customer.id,
      identifier,
      purpose: "LOGIN",
      ipAddress: getIP(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send code";
    return { error: message };
  }

  return { success: true, customerId: customer.id };
}

// ─── Verify OTP & Create Session ──────────────────────────────────────────────

export async function verifyOTPAndLogin(formData: FormData) {
  const raw = {
    identifier: formData.get("identifier"),
    code: formData.get("code"),
    purpose: formData.get("purpose") ?? "LOGIN",
  };

  const parsed = verifyOTPSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const otpService = getOTPService();
  try {
    const result = await otpService.verify(parsed.data);

    const customer = await db.customer.findFirst({
      where: { email: parsed.data.identifier },
    });

    if (!customer) return { error: "Account not found" };

    await db.customer.update({
      where: { id: customer.id },
      data: {
        lastLoginAt: new Date(),
        ...(["REGISTER", "VERIFY_EMAIL"].includes(parsed.data.purpose)
          ? { emailVerified: true }
          : {}),
      },
    });

    await createCustomerSession(customer);
    return { success: true, customerId: result.customerId ?? customer.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return { error: message };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutCustomer() {
  await destroyCustomerSession();
  redirect("/login");
}

export async function signOutCustomer() {
  await destroyCustomerSession();
  redirect("/login");
}
