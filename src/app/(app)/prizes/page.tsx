import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db/prisma";
import { PrizesClient } from "./client";
export const dynamic = "force-dynamic";

export const metadata = { title: "Prizes" };

export default async function PrizesPage() {
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
        claimedBy: { select: { name: true, email: true, store: { select: { name: true } } } },
      },
    }),
    db.retailStore.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PrizesClient
      prizes={prizes.map(prize => ({
        ...prize,
        claimStore: prize.claimedBy?.store
      })) as any}
      stores={stores}
      admin={{ name: session.name, email: session.email, store: session.store! }}
    />
  );
}
