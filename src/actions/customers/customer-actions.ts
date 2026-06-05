"use server";

import { db } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { customerSearchSchema } from "@/lib/validations/schemas";

export async function getCustomers(params: unknown) {
  await requireAdminSession();

  const parsed = customerSearchSchema.safeParse(params);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { search, page, limit, sortBy, sortOrder } = parsed.data;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      select: {
        id: true, name: true, email: true, phone: true,
        totalCredits: true, totalSpent: true, isActive: true,
        createdAt: true, lastLoginAt: true,
        _count: { select: { orders: true, gamePlays: true } },
      },
    }),
    db.customer.count({ where }),
  ]);

  return { success: true, customers, total, page, limit };
}

export async function grantCredits(customerId: string, amount: number, reason: string) {
  await requireAdminSession();

  const customer = await db.customer.findUnique({ where: { id: customerId } });
  if (!customer) return { error: "Customer not found" };

  const balanceBefore = customer.totalCredits;
  const balanceAfter = balanceBefore + amount;

  await db.$transaction([
    db.customer.update({
      where: { id: customerId },
      data: { totalCredits: { increment: amount } },
    }),
    db.creditTransaction.create({
      data: {
        customerId,
        type: amount > 0 ? "ADMIN_GRANT" : "ADMIN_DEDUCT",
        amount,
        balanceBefore,
        balanceAfter,
        description: reason || "Manual adjustment by admin",
      },
    }),
  ]);

  return { success: true };
}
