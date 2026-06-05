"use server";

import { db } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/auth/session";

// Game config is now per-campaign (creditCost on campaign level).
// This file kept for any future per-game configuration needs.

export async function getCampaignGameConfig(campaignId: string) {
  await requireAdminSession();
  return db.campaign.findUnique({
    where: { id: campaignId },
    select: { gameType: true, creditsPerUnit: true },
  });
}
