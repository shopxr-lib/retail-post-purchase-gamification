import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db/prisma";
import type { Customer } from "@prisma/client";

const SESSION_COOKIE = "gamify_customer_session";
const secret = new TextEncoder().encode(process.env.CUSTOMER_SESSION_SECRET!);

// ─── Token Creation ──────────────────────────────────────────────────────────

export async function createCustomerSession(customer: Customer): Promise<string> {
  const token = await new SignJWT({
    sub: customer.id,
    email: customer.email,
    phone: customer.phone,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  // Persist to DB for server-side invalidation
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.customerSession.create({
    data: {
      customerId: customer.id,
      token,
      expiresAt,
      ipAddress: null,
      userAgent: null,
    },
  });

  // Set httpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

// ─── Session Retrieval ───────────────────────────────────────────────────────

export async function getCustomerSession(): Promise<Customer | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    // Verify JWT
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;

    // Verify session still valid in DB (not revoked)
    const session = await db.customerSession.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
      include: { customer: true },
    });

    if (!session) return null;
    if (!session.customer.isActive) return null;

    return session.customer;
  } catch {
    return null;
  }
}

// ─── Require Session (throws if not authenticated) ──────────────────────────

export async function requireCustomerSession(): Promise<Customer> {
  const customer = await getCustomerSession();
  if (!customer) {
    throw new Error("Unauthorized");
  }
  return customer;
}

// ─── Logout ─────────────────────────────────────────────────────────────────

export async function destroyCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    // Invalidate in DB
    await db.customerSession.deleteMany({ where: { token } });
    cookieStore.delete(SESSION_COOKIE);
  }
}

// ─── Clean expired sessions (run via cron) ──────────────────────────────────

export async function cleanExpiredCustomerSessions(): Promise<void> {
  await db.customerSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
