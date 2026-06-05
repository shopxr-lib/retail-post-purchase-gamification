"use server";

import { db } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/auth/session";

export async function getStores() {
  await requireAdminSession();
  return db.retailStore.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function getActiveStores() {
  // Used on customer-facing pages — no auth needed
  return db.retailStore.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
