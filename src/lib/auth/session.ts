import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "@/lib/db/prisma";
import { adminAuth } from "@/lib/auth/admin-auth";

export type UserType = "admin" | "customer";

export interface UnifiedSession {
  type: UserType;
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalCredits?: number;
}

const secret = new TextEncoder().encode(process.env.CUSTOMER_SESSION_SECRET!);

export async function getUnifiedSession(): Promise<UnifiedSession | null> {
  // Try admin session (Better Auth)
  try {
    const h = await headers();
    const session = await adminAuth.api.getSession({ headers: h });
    if (session?.user) {
      const admin = await db.staff.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, isActive: true },
      });
      if (admin?.isActive) {
        return { type: "admin", id: admin.id, name: admin.name, email: admin.email };
      }
    }
  } catch {}

  // Try customer session (JWT)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("gamify_customer_session")?.value;
    if (!token) return null;

    await jwtVerify(token, secret);

    const session = await db.customerSession.findFirst({
      where: { token, expiresAt: { gt: new Date() } },
      include: {
        customer: {
          select: {
            id: true, name: true, email: true,
            phone: true, totalCredits: true, isActive: true,
          },
        },
      },
    });

    if (!session?.customer?.isActive) return null;

    const c = session.customer;
    return {
      type: "customer",
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      totalCredits: c.totalCredits,
    };
  } catch {}

  return null;
}

export async function requireSession(): Promise<UnifiedSession> {
  const session = await getUnifiedSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdminSession(): Promise<UnifiedSession> {
  const session = await getUnifiedSession();
  if (!session || session.type !== "admin") throw new Error("Unauthorized");
  return session;
}

export async function requireCustomerSession(): Promise<UnifiedSession> {
  const session = await getUnifiedSession();
  if (!session || session.type !== "customer") throw new Error("Unauthorized");
  return session;
}
