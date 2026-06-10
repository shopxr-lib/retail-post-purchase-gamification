"use server";

import { db } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { createCampaignSchema, updateCampaignSchema, updatePrizeSchema } from "@/lib/validations/schemas";
import { checkDateOverlap } from "@/lib/utils/campaign";

export async function createCampaignAction(input: unknown) {
  await requireAdminSession();
  const parsed = createCampaignSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { prizes, endDate, ...data } = parsed.data;

  const overlap = await checkDateOverlap(data.startDate, endDate, data.status ?? 2);
  if (overlap) return { error: overlap };

  // Count existing gamePlays for CREDIT_COUNT offset
  const totalPlaysNow = await db.gamePlay.count();

  const campaignData = {
    ...data,
    ...(endDate ? { endDate } : {}),
    prizes: {
      create: prizes.map((p) => ({
        name: p.name,
        type: p.type,
        value: p.value ?? null,
        winningProbabilityMode: p.winningProbabilityMode,
        winningProbabilityValue: p.winningProbabilityValue,
        totalPlaysAtCreation: totalPlaysNow,
      })),
    },
  } as Parameters<typeof db.campaign.create>[0]["data"];

  const campaign = await db.campaign.create({ data: campaignData });

  return { success: true, campaignId: campaign.id };
}

export async function updateCampaignAction(input: unknown) {
  await requireAdminSession();
  const parsed = updateCampaignSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  const { id, endDate, ...data } = parsed.data;

  // only check if status or dates are being changed
  if (data.status === 1 || data.startDate || endDate) {
    // Fetch current campaign to fill in any fields not being updated
    const current = await db.campaign.findUnique({
      where: { id },
      select: { startDate: true, endDate: true, status: true },
    });
    if (!current) return { error: "Campaign not found" };

    const effectiveStatus    = data.status    ?? current.status;
    const effectiveStartDate = data.startDate ?? current.startDate;
    const effectiveEndDate   = endDate ?? current.endDate;

    const overlap = await checkDateOverlap(effectiveStartDate, effectiveEndDate, effectiveStatus, id);
    if (overlap) return { error: overlap };
  }

  const updateData = {
    ...data,
    ...(endDate !== undefined
      ? { endDate: endDate === null ? { set: null } : endDate }
      : {}),
  } as Parameters<typeof db.campaign.update>[0]["data"];

  const campaign = await db.campaign.update({ where: { id }, data: updateData });
  return { success: true, campaignId: campaign.id };
}

export async function updatePrizeAction(input: unknown) {
  await requireAdminSession();
  const parsed = updatePrizeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { id, ...data } = parsed.data;

  const prize = await db.prize.findUnique({
    where: { id },
  });

  const campaignPrizes = await db.prize.findMany({
  where: { campaignId: prize?.campaignId },
  });

  const total = campaignPrizes
    .filter(p => p.winningProbabilityMode === "PERCENTAGE")
    .reduce((s, p) => s + p.winningProbabilityValue, 0);

  if (Math.abs(total - 100) > 0.01) {
    throw new Error("Prize probabilities must sum to 100%");
  }

  await db.prize.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      value: data.value ?? null,
      winningProbabilityMode: data.winningProbabilityMode,
      winningProbabilityValue: data.winningProbabilityValue,
    },
  });
  return { success: true };
}

export async function addPrizeToCampaignAction(campaignId: string, input: unknown) {
  await requireAdminSession();
  const { prizeSchema } = await import("@/lib/validations/schemas");
  const parsed = prizeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const prize = await db.prize.create({
    data: {
      campaignId,
      ...parsed.data,
      value: parsed.data.value ?? null,
    },
  });
  return { success: true, prizeId: prize.id };
}

export async function deleteCampaignAction(campaignId: string) {
  await requireAdminSession();
  await db.campaign.update({ where: { id: campaignId }, data: { deletedAt: new Date() } });
  return { success: true };
}
