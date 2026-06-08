import { GAME_LABELS } from "@/constants";
import { db } from "@/lib/db/prisma";
import { capitalize } from "@/lib/utils";
import { log } from "@/lib/utils/logger";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_GAME_URL!,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Preflight Request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  try {
    const ctx = "/api/game";
    log(ctx, "Incoming External Game Request", {
      allowedOrigin: process.env.NEXT_PUBLIC_GAME_URL,
      origin: request.headers.get("origin"),
    });

    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const campaignId = url.searchParams.get("campaignId");
    const mode = url.searchParams.get("mode");
    const prizeId = url.searchParams.get("prizeId");
    const gameType = Number(url.searchParams.get("gameType"))

    if (!token) {
      throw new Error("Missing Parameters");
    }

    if (mode === "start") {
      const now = new Date();
      const activeCampaign = await db.campaign.findFirst({
        where: {
          status: 1,
          deletedAt: null,
          startDate: { lte: now },
          OR: [{ endDate: { gte: now } }, { endDate: { equals: null } }],
        },
        include: { prizes: true, _count: { select: { gamePlays: true } } },
      });

      const customer = await db.customer.findUnique({
        where: { id: token },
      });

      return new Response(
        JSON.stringify({
          data: {
            gameDetails: {
              selectedGame: activeCampaign?.gameType,
              remainingCredit: customer?.totalCredits,
              prizes: activeCampaign?.prizes.map((prize) => ({
                ...prize,
                winningProbability: {
                  mode: prize.winningProbabilityMode,
                  value: prize.winningProbabilityValue,
                },
              })),
              playCount: activeCampaign?._count.gamePlays,
              expired: false,
            },
            widgetSettings: {
              creditPerAmount: activeCampaign?.creditsPerUnit,
            },
          },
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else if (mode === "play") {
      if (!campaignId) throw new Error("Missing Paramters");
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        include: { prizes: true, _count: { select: { gamePlays: true } } },
      });
      const expired = campaign?.status === 2 || campaign?.deletedAt != null;

      if (expired) {
        return new Response(
          JSON.stringify({
            data: {
              success: false,
              expired: true
            }
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      else if (!campaign || (gameType && gameType !== campaign?.gameType)) {
        return new Response(
          JSON.stringify({
            data: {
              success: false,
              invalid: true, 
              selectedGame: campaign?.gameType
            }
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const customer = await db.customer.findUnique({
        where: { id: token },
      });

      let currentPrizeId = null;
      const unclaimedReservation = await db.prizeReservation.findFirst({
        where: {
          campaignId: campaign?.id,
          claimed: false,
        },
        orderBy: { prize: { winningProbabilityValue: "asc" } },
      });

      const now = new Date();

      if (unclaimedReservation) {
        const { customerId, expiresAt } = unclaimedReservation;
        const isExpired = new Date(expiresAt) < now;

        if (customerId === token || isExpired) {
          const reservation = await db.prizeReservation.update({
            where: { id: unclaimedReservation.id },
            data: {
              customerId: isExpired ? token : unclaimedReservation.customerId,
              expiresAt: new Date(Date.now() + 0 * 60 * 1000), // 1 minute from now
            },
          });
          log(ctx, "Updating prize reservation", { reservation });
          currentPrizeId = reservation.prizeId
        }

      }

      if (!currentPrizeId) {
        // Step 2: Find any credit based prize
        const creditBasedPrize = campaign?.prizes.find(
          (p) =>
            p.winningProbabilityMode === "CREDIT_COUNT" &&
            p.winningProbabilityValue === campaign.playCount + 1
        );
        if (creditBasedPrize) {
          const reservation = await db.prizeReservation.create({
            data: {
              customerId: token,
              campaignId: campaignId,
              prizeId: creditBasedPrize.id,
              expiresAt: new Date(Date.now() + 0 * 60 * 1000),
            },
          });
          log(ctx, `Creating new prize reservation`, { reservation });
          currentPrizeId = reservation.prizeId;
        } else {
          // Step 3: Find any probability based prize
          const weightedPrizes = campaign.prizes.filter(
            (p) => p.winningProbabilityMode === "PERCENTAGE"
          );
          const totalWeight = weightedPrizes?.reduce(
            (sum, p) => sum + (p.winningProbabilityValue || 0),
            0
          );
  
          let random = Math.random() * totalWeight;
          for (const prize of weightedPrizes) {
            random -= prize.winningProbabilityValue || 0;
            if (random <= 0) {
              // send prize
              currentPrizeId = prize.id;
              log(ctx, "Generated weighted prize", { prize });
              break;
            }
          }
        }
      }

      return new Response(
        JSON.stringify({
          data: {
            remainingCredit: customer?.totalCredits,
            playCount: campaign?._count.gamePlays,
            expired,
            prizes: campaign?.prizes.map((prize) => ({
              ...prize,
              winningProbability: {
                mode: prize.winningProbabilityMode,
                value: prize.winningProbabilityValue,
              },
            })),
            selectedGame: campaign?.gameType,
            currentPrize: currentPrizeId
              ? campaign?.prizes.find((prize) => prize.id === currentPrizeId)
              : null,
          },
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else if (prizeId) {
      if (!campaignId) throw new Error("Missing Paramters");
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        include: { prizes: true, _count: { select: { gamePlays: true } } },
      });
      const expired = campaign?.status === 2 || campaign?.deletedAt != null;

      const customer = await db.customer.findUnique({
        where: { id: token },
      });

      const prize = await db.prize.findUnique({
        where: { id: prizeId }
      })

      if (expired) {
        return new Response(
          JSON.stringify({
            data: {
              success: false,
              expired: true
            }
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      else if (!campaign || !customer || !prize || (gameType && gameType !== campaign?.gameType)) {
        return new Response(
          JSON.stringify({
            data: {
              success: false,
              invalid: true, 
              selectedGame: campaign?.gameType
            }
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      let currentPrizeId: string | null = null;

      if (prize.winningProbabilityMode === "PERCENTAGE") {
        currentPrizeId = prizeId
      }
      else if (prize.winningProbabilityValue === (campaign._count.gamePlays+1)) {
        currentPrizeId = prizeId
      }
      else {
        const unclaimedReservation = await db.prizeReservation.findFirst({
          where: {
            campaignId: campaign?.id,
            claimed: false,
          },
          orderBy: { prize: { winningProbabilityValue: "asc" } },
        });

        const now = new Date();

        if (unclaimedReservation) {
          const { customerId, expiresAt } = unclaimedReservation;
          const isExpired = new Date(expiresAt) < now;

          if (customerId === token || isExpired) {
            const reservation = await db.prizeReservation.update({
              where: { id: unclaimedReservation.id },
              data: {
                customerId: isExpired ? token : unclaimedReservation.customerId,
                expiresAt: new Date(Date.now() + 0 * 60 * 1000), // 1 minute from now
              },
            });
            log(ctx, "Updating prize reservation", { reservation });
            currentPrizeId = reservation.prizeId
          }

          // Step 2: Find any credit based prize
          const creditBasedPrize = campaign?.prizes.find(
            (p) =>
              p.winningProbabilityMode === "CREDIT_COUNT" &&
              p.winningProbabilityValue === campaign.playCount + 1
          );
          if (creditBasedPrize) {
            const reservation = await db.prizeReservation.create({
              data: {
                customerId: token,
                campaignId: campaignId,
                prizeId: creditBasedPrize.id,
                expiresAt: new Date(Date.now() + 0 * 60 * 1000),
              },
            });
            log(ctx, `Creating new prize reservation`, { reservation });
            currentPrizeId = reservation.prizeId;
          } else {
            // Step 3: Find any probability based prize
            const weightedPrizes = campaign.prizes.filter(
              (p) => p.winningProbabilityMode === "PERCENTAGE"
            );
            const totalWeight = weightedPrizes?.reduce(
              (sum, p) => sum + (p.winningProbabilityValue || 0),
              0
            );

            let random = Math.random() * totalWeight;
            for (const prize of weightedPrizes) {
              random -= prize.winningProbabilityValue || 0;
              if (random <= 0) {
                // send prize
                currentPrizeId = prize.id;
                log(ctx, "Generated weighted prize", { prize });
              }
            }
          }
        }

        if (!currentPrizeId) {
          return new Response(
            JSON.stringify({
              data: {
                success: false,
                invalid: true, 
              }
            }),
            {
              status: 200,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      const result = await db.$transaction(async (tx) => {
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

        const wonPrize = await db.prize.findUnique({ where: { id: currentPrizeId! } })

        await tx.customerPrize.create({
          data: {
            customerId: customer.id,
            prizeId: currentPrizeId!,
            gamePlayId: gamePlay.id,
            claimStatus: "UNCLAIMED",
            prizeSnapshot: {
              name: wonPrize?.name,
              type: wonPrize?.type,
              value: wonPrize?.value,
            },
          },
        });

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
              customerPrizeId: currentPrizeId,
            },
          },
        });

        return {
          success: true,
          prize: wonPrize,
        }
      })

      return new Response(
        JSON.stringify({
          data: {
            success: result.success,
            prize: result.prize,
            selectedGame: campaign.gameType
          }
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        mode,
        token,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Something went wrong" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}