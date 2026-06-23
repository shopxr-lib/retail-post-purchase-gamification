import { redirect } from "next/navigation";
import { getUnifiedSession } from "@/lib/auth/session";
import { db } from "@/lib/db/prisma";
import type { Prize } from "@prisma/client";
import { CustomerDashboardClient } from "@/components/customer/CustomerDashboardClient";
import { AdminDashboardClient } from "@/components/staff/AdminDashboardClient";

export const metadata = { title: "Dashboard — ShopXR" };

function isActiveCampaign(c: { startDate: Date; endDate: Date | null; status: number }) {
  const now = new Date();
  const start = new Date(c.startDate);
  const end = c.endDate ? new Date(c.endDate) : null;

  if (c.status !== 1) return false;

  if (start > now) return false;

  if (end && end < now) return false;

  return true;
}

export default async function DashboardPage() {
  const session = await getUnifiedSession();
  if (!session) redirect("/login");

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  if (session.type === "admin") {
    const now = new Date();
    const [totalCustomers, totalQRsToday, totalRedemptionsToday, unclaimedPrizes, campaigns] =
      await Promise.all([
        db.customer.count({ where: { deletedAt: null } }),
        db.qRCode.count({
          where: {
            createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
            generatedById: session.id,
          },
        }),
        db.qRCode.count({
          where: {
            status: "REDEEMED",
            redeemedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            generatedById: session.id,
          },
        }),
        db.customerPrize.count({
          where: {
            claimStatus: "UNCLAIMED",
            prize: {
              type: {
                not: 4,
              },
            },
          },
        }),
        db.campaign.findMany({ where: { deletedAt: null }, orderBy: { startDate: "desc" } }),
      ]);

    const activeCampaign = campaigns.find((c) => isActiveCampaign(c)) ?? null;

    // const allCampaigns = await db.campaign.findMany({
    //     where: { deletedAt: null },
    //     include: {
    //       prizes: { select: { id: true, name: true } },
    //     },
    //     orderBy: { startDate: "desc" },
    //   });
    
    //   // 👇 TEST SEED (safe: checks by name before insert)
    //   for (const c of allCampaigns) {
    //     const now = new Date();
    //     const start = new Date(c.startDate);
    //     const end = c.endDate ? new Date(c.endDate) : null;
    
    //     const isActive = !c.deletedAt && c.status !== 2 && start <= now && (!end || end >= now);
    
    //     console.log("🔍 Checking campaign:", {
    //       id: c.id,
    //       name: c.name,
    //       isActive,
    //       existingPrizes: c.prizes.length,
    //     });
    
    //     if (!isActive) continue;
    
    //     const existingNames = new Set(c.prizes.map((p) => p.name));
    
    //     const testPrizes = [
    //       {
    //         name: "Jackpot on 20th Play",
    //         type: 3,
    //         value: "$500 Shopping Spree",
    //         winningProbabilityMode: "CREDIT_COUNT" as ProbabilityMode,
    //         winningProbabilityValue: 20,
    //       },
    //       {
    //         name: "Jackpot on 30th Play",
    //         type: 3,
    //         value: "$1000 Shopping Spree",
    //         winningProbabilityMode: "CREDIT_COUNT" as ProbabilityMode,
    //         winningProbabilityValue: 30,
    //       },
    //       {
    //         name: "Jackpot on 40th Play",
    //         type: 3,
    //         value: "$2000 Shopping Spree",
    //         winningProbabilityMode: "CREDIT_COUNT" as ProbabilityMode,
    //         winningProbabilityValue: 40,
    //       },
    //     ];
    
    //     const toInsert = testPrizes.filter((p) => !existingNames.has(p.name));
    
    //     console.log("🧪 Test prizes for campaign:", {
    //       campaignId: c.id,
    //       toInsertCount: toInsert.length,
    //       toInsert,
    //     });
    
    //     if (toInsert.length > 0) {
    //       await db.prize.createMany({
    //         data: toInsert.map((p) => ({
    //           ...p,
    //           campaignId: c.id,
    //         })),
    //       });
    
    //       console.log("✅ Inserted test prizes:", {
    //         campaignId: c.id,
    //         inserted: toInsert.map((p) => p.name),
    //       });
    //     }
    //   }

    const stats = [
      { label: "Total Customers", value: totalCustomers, color: "from-blue-500 to-blue-600" },
      { label: "QRs Today", value: totalQRsToday, color: "from-violet-500 to-violet-600" },
      {
        label: "Redemptions Today",
        value: totalRedemptionsToday,
        color: "from-green-500 to-green-600",
      },
      { label: "Unclaimed Prizes", value: unclaimedPrizes, color: "from-orange-500 to-orange-600" },
    ];

    return (
      <AdminDashboardClient
        staff={{ id: session.id, name: session.name, email: session.email }}
        stats={stats}
        activeCampaign={activeCampaign}
      />
    );
  }

  // ── CUSTOMER ───────────────────────────────────────────────────────────────
  const customer = await db.customer.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, phone: true, totalCredits: true },
  });
  if (!customer) redirect("/login");

  const [allCampaigns, prizes] = await Promise.all([
    db.campaign.findMany({ where: { deletedAt: null } }),
    db.customerPrize.findMany({
      where: { customerId: customer.id, prize: { type: { not: 4 } } },
      orderBy: { wonAt: "desc" },
      take: 10,
      include: {
        prize: { select: { name: true, type: true, value: true } },
        claimedBy: { select: { name: true, store: { select: { name: true } } } },
      },
    }),
  ]);

  const campaign = allCampaigns.find((c) => isActiveCampaign(c)) ?? null;
  const hasOrder = await db.order.count({ where: { customerId: customer.id } }).then((n) => n > 0);

  return (
    <CustomerDashboardClient
      customer={{ ...customer, hasPurchase: hasOrder }}
      campaign={
        campaign
          ? {
              id: campaign.id,
              name: campaign.name,
              endDate: campaign.endDate,
              gameType: campaign.gameType,
            }
          : null
      }
      prizes={prizes.map((p) => ({
        ...p,
        claimedBy: p.claimedBy
          ? {
              name: p.claimedBy.name,
              store: p.claimedBy.store.name,
            }
          : null,
        prizeSnapshot: p.prizeSnapshot
          ? {
              name: (p.prizeSnapshot as unknown as Prize).name,
              type: (p.prizeSnapshot as unknown as Prize).type,
              value: (p.prizeSnapshot as unknown as Prize).value,
            }
          : null,
      }))}
    />
  );
}
