"use server";
import { db } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { claimPrizeSchema } from "@/lib/validations/schemas";

export async function claimPrize(input: unknown) {
  const admin = await requireAdminSession();

  const parsed = claimPrizeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { customerPrizeId } = parsed.data;

  const cp = await db.customerPrize.findUnique({ where: { id: customerPrizeId } });
  if (!cp) return { error: "Prize not found" };
  if (cp.claimStatus !== "UNCLAIMED") return { error: "Prize has already been claimed or is void" };

  await db.customerPrize.update({
    where: { id: customerPrizeId },
    data: {
      claimStatus: "CLAIMED",
      claimedById: admin.id,
      claimedAt: new Date(),
    },
  });

  return { success: true };
}

export async function unclaimPrize(customerPrizeId: string) {
  await requireAdminSession();

  const cp = await db.customerPrize.findUnique({ where: { id: customerPrizeId } });
  if (!cp) return { error: "Prize not found" };
  if (cp.claimStatus !== "CLAIMED") return { error: "Prize is not in claimed state" };

  await db.customerPrize.update({
    where: { id: customerPrizeId },
    data: {
      claimStatus: "UNCLAIMED",
      claimedBy: {
        disconnect: true,
      },
      claimedAt: null,
    },
  });

  return { success: true };
}
