import { db } from "@/lib/db/prisma";
import type { AuditAction, Prisma } from "@prisma/client";

interface AuditParams {
  staffId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue | null;
  ipAddress?: string;
  userAgent?: string;
}

export async function auditLog(params: AuditParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        staffId: params.staffId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        metadata: params.metadata ?? undefined,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (err) {
    // Audit log failure should never break the main flow
    console.error("Audit log failed:", err);
  }
}
