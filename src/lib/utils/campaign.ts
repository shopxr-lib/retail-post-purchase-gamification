import { db } from "../db/prisma";

export async function checkDateOverlap(
  startDate: Date,
  endDate: Date | null | undefined,
  status: number,
  excludeId?: string
): Promise<string | null> {
  // Only check if setting to ACTIVE
  if (status !== 1) return null;

  // If no endDate, treat as open-ended (overlaps with everything after startDate)
  const where: any = {
    id: excludeId ? { not: excludeId } : undefined,
    deletedAt: null,
    status: 1,
    // Overlap condition: existing.startDate < newEnd AND existing.endDate > newStart
    // If either endDate is open-ended we conservatively flag an overlap
    AND: [
      {
        OR: [
          { endDate: null },                                    // existing is open-ended
          { endDate: { gt: startDate } },                      // existing ends after new starts
        ],
      },
      {
        OR: [
          ...(endDate ? [{ startDate: { lt: endDate } }] : []),// existing starts before new ends
          ...(!endDate ? [{ startDate: { gte: startDate } }] : []), // or new is open-ended: any campaign starting after
          { startDate: { lte: startDate } },                   // existing started before/on new start
        ],
      },
    ],
  };

  // Clean up undefined
  if (!excludeId) delete where.id;

  const conflict = await db.campaign.findFirst({ where, select: { name: true, startDate: true, endDate: true } });

  if (!conflict) return null;

  const fmt = (d: Date | null) => d ? d.toLocaleDateString() : "open-ended";
  return `Date conflict with "${conflict.name}" (${fmt(conflict.startDate)} – ${fmt(conflict.endDate)}). Only one ACTIVE campaign can run at a time.`;
}