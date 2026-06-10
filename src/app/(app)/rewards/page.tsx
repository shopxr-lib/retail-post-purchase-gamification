import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db/prisma";
import { AdminRewardsClient } from "./client";
export const dynamic = "force-dynamic";

export const metadata = { title: "Rewards" };

export default async function RewardsPage() {
  const session = await requireAdminSession();

  const [prizes, stores] = await Promise.all([
    db.customerPrize.findMany({
      where: {
        prize: {
          type: {
            not: 4,
          },
        },
      },
      orderBy: { wonAt: "desc" },
      take: 50,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        claimedBy: { select: { name: true, email: true } },
      },
    }),
    db.retailStore.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <AdminRewardsClient
      prizes={prizes as any}
      stores={stores}
      admin={{ name: session.name, email: session.email }}
    />
  );
}
