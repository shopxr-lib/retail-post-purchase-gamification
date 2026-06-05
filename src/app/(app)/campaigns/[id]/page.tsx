import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db/prisma";
import { CampaignDetailClient } from "./client";

export const metadata = { title: "Campaign Detail" };

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;

  const campaign = await db.campaign.findUnique({
    where: { id, deletedAt: null },
    include: {
      prizes: { orderBy: { winningProbabilityValue: "desc" } },
      _count: { select: { qrCodes: true, gamePlays: true } },
    },
  });

  if (!campaign) notFound();
  return (
    <CampaignDetailClient
      campaign={{
        ...campaign,
        prizes: campaign.prizes.map(prize => ({
          ...prize,
          winningProbability: {
            mode: prize.winningProbabilityMode,
            value: prize.winningProbabilityValue,
          },
        }))
      }}
    />
  );
}
