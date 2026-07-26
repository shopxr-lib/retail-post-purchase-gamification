import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db/prisma";
import OrdersClient from "./client";
export const dynamic = "force-dynamic";

export const metadata = { title: "Orders — Admin" };

export default async function OrdersPage() {
  const session = await requireAdminSession();
  const [customers] = await Promise.all([
    db.customer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        totalCredits: true,
        totalSpent: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { orders: true, gamePlays: true, prizes: true } },
        orders: {
          select: {
            id: true,
            createdAt: true,
            qrCode: {
              select: {
                amountPaid: true,
                receiptNumber: true,
                creditsGranted: true,
                generatedBy: {
                  select: {
                    name: true,
                    store: { select: { name: true } },
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
        },
        prizes: {
          where: {
            prizeSnapshot: {
              path: ["type"],
              not: 4,
            },
          },
          select: {
            id: true,
            claimStatus: true,
            wonAt: true,
            claimedAt: true,
            prizeSnapshot: true,
            claimedBy: { select: { name: true, store: { select: { name: true } } } },
          },
        },
      },
    }),
  ]);

  return (
    <OrdersClient
      admin={{ name: session.name, email: session.email, store: session.store! }}
      customers={customers.map((c) => ({
        ...c,
        totalSpent: parseFloat(c.totalSpent as any),
        orders: c.orders.map((o) => ({
          ...o,
          amountPaid: parseFloat(o.qrCode.amountPaid as any),
          receiptNumber: o.qrCode.receiptNumber,
          creditsGranted: o.qrCode.creditsGranted,
          qrCode: {
            ...o.qrCode,
            amountPaid: parseFloat(o.qrCode.amountPaid as any),
          },
          generatedBy: {
            name: o.qrCode.generatedBy.name,
            store: o.qrCode.generatedBy.store.name
          }
        })),
        prizes: c.prizes.map((p) => ({
          ...p,
          claimedBy: p.claimedBy
            ? {
                name: p.claimedBy.name,
                store: p.claimedBy.store.name,
              }
            : null,
        })),
      }))}
    />
  );
}
