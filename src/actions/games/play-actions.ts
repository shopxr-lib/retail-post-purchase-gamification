"use server";

import { db } from "@/lib/db/prisma";
import { requireCustomerSession } from "@/lib/auth/session";
import { GAME_LABELS } from "@/constants";
import { capitalize } from "@/lib/utils";

export async function playGame(gameType: number, campaignId: string) {
  const customer = await requireCustomerSession();

  const hasOrder = await db.order.count({ where: { customerId: customer.id } });
  if (hasOrder === 0) return { error: "Scan a QR code from a purchase first" };

  try {
    const result = await db.$transaction(async (tx) => {
      const now = new Date();
      const campaign = await tx.campaign.findFirst({
        where: {
          id: campaignId,
          deletedAt: null,
          startDate: { lte: now },
          OR: [{ endDate: { gte: now } }, { endDate: { equals: null } }],
          gameType: gameType,
          status: 1,
        },
        include: { prizes: { where: { isActive: true } } },
      });
      if (!campaign) throw new Error("No active campaign for this game");

      const creditCost = 1;

      const updatedCustomer = await tx.customer.updateMany({
        where: { id: customer.id, totalCredits: { gte: creditCost } },
        data: { totalCredits: { decrement: creditCost } },
      });
      if (updatedCustomer.count === 0) throw new Error("Insufficient credits");

      const customerNow = await tx.customer.findUnique({
        where: { id: customer.id },
        select: { totalCredits: true },
      });
      const balanceBefore = (customerNow?.totalCredits ?? 0) + creditCost;
      const balanceAfter = customerNow?.totalCredits ?? 0;

      const gamePlay = await tx.gamePlay.create({
        data: { customerId: customer.id, campaignId, gameType, creditCost, status: "PENDING" },
      });

      await tx.creditTransaction.create({
        data: {
          customerId: customer.id,
          gamePlayId: gamePlay.id,
          type: "SPENT_GAME",
          amount: -creditCost,
          balanceBefore,
          balanceAfter,
          description: `Played ${capitalize(GAME_LABELS[gameType])}`,
        },
      });

      // Total plays for this campaign (for CREDIT_COUNT mode)
      const totalPlays = await tx.gamePlay.count({ where: { campaignId } });

      let wonPrize = null;

      // Check CREDIT_COUNT prizes first
      for (const prize of campaign.prizes) {
        if (prize.winningProbabilityMode !== "CREDIT_COUNT") continue;
        const n = prize.winningProbabilityValue;
        const offset = 10;
        // Win if (totalPlays - offset) is divisible by n
        if (n > 0 && totalPlays - offset > 0 && (totalPlays - offset) % n === 0) {
          wonPrize = prize;
          break;
        }
      }

      // If no credit-count prize, roll percentage prizes
      if (!wonPrize) {
        const pctPrizes = campaign.prizes.filter((p) => p.winningProbabilityMode === "PERCENTAGE");
        const roll = Math.random() * 100;
        let cumulative = 0;
        for (const prize of pctPrizes) {
          cumulative += prize.winningProbabilityValue;
          if (roll < cumulative) {
            wonPrize = prize;
            break;
          }
        }
      }

      let customerPrizeId: string | null = null;
      if (wonPrize && wonPrize.type !== 4) {
        // Store a snapshot of the prize at time of winning
        const cp = await tx.customerPrize.create({
          data: {
            customerId: customer.id,
            prizeId: wonPrize.id,
            gamePlayId: gamePlay.id,
            claimStatus: "UNCLAIMED",
            prizeSnapshot: {
              name: wonPrize.name,
              type: wonPrize.type,
              value: wonPrize.value,
            },
          },
        });
        customerPrizeId = cp.id;
      }

      await tx.gamePlay.update({
        where: { id: gamePlay.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          result: {
            won: !!wonPrize && wonPrize.type !== 4,
            prizeName: wonPrize?.name ?? null,
            prizeType: wonPrize?.type ?? null,
            prizeValue: wonPrize?.value ?? null,
            customerPrizeId,
          },
        },
      });

      return {
        won: !!wonPrize && wonPrize.type !== 4,
        prize:
          wonPrize && wonPrize.type !== 4
            ? {
                id: wonPrize.id,
                name: wonPrize.name,
                type: wonPrize.type,
                value: parseFloat(wonPrize.value as any),
                customerPrizeId,
              }
            : null,
        newBalance: balanceAfter,
        creditCost,
      };
    });

    return { success: true, ...result };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Game failed" };
  }
}
