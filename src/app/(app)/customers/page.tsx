import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db/prisma";
import CustomersClient from "./client";
export const dynamic = "force-dynamic";

export const metadata = { title: "Customers — Admin" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  await requireAdminSession();

  const sp = await searchParams;
  const search = sp.search ?? "";
  const page = Math.max(1, Number(sp.page ?? 1));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null as null,
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
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
    db.customer.count({ where }),
  ]);

  return (
    <CustomersClient
      total={total}
      limit={limit}
      page={page}
      search={search}
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
