import { GAME_LABELS } from "@/constants";
import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db/prisma";
import { capitalize } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = { title: "Campaigns — Admin" };

function campaignStatus(c: {
  startDate: Date;
  endDate: Date | null;
  deletedAt: Date | null;
  status: number;
}) {
  if (c.deletedAt) return { label: "Deleted", cls: "bg-red-100 text-red-500" };
  if (c.status === 2) return { label: "Draft", cls: "bg-yellow-100 text-yellow-700" };

  const now = new Date();
  const start = new Date(c.startDate);
  const end = c.endDate ? new Date(c.endDate) : null;

  if (start > now) {
    return { label: "Upcoming", cls: "bg-blue-100 text-blue-600" };
  }

  // No end date = ongoing campaign
  if (!end) {
    return { label: "Active", cls: "bg-green-100 text-green-700" };
  }

  if (end >= now) {
    return { label: "Active", cls: "bg-green-100 text-green-700" };
  }

  return { label: "Ended", cls: "bg-slate-100 text-slate-500" };
}

export default async function CampaignsPage() {
  await requireAdminSession();

  const campaigns = await db.campaign.findMany({
    where: { deletedAt: null },
    include: {
      prizes: { select: { id: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campaigns</h1>
          <p className="mt-1 text-sm text-slate-500">
            View Campaigns
          </p>
           {/* <Link
              href="/campaigns/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:brightness-105"
            >
              + New Campaign
            </Link> */}
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-16 text-center shadow-sm">
          <p className="mb-3 text-4xl">🎯</p>
          <p className="font-bold text-slate-700">No campaigns yet</p>
          {/* <p className="text-sm text-slate-400 mt-1">Create your first campaign to get started.</p>
          <Link href="/campaigns/new" className="inline-block mt-4 text-sm text-brand-600 font-semibold hover:underline">
            Create campaign →
          </Link> */}
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => {
            const { label, cls } = campaignStatus(c);

            return (
              <Link
                key={c.id}
                href={`/campaigns/${c.id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-bold text-slate-900 transition group-hover:text-brand-600">
                        {c.name}
                      </h2>

                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>
                        {label}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                        📅 {c.startDate.toLocaleDateString()} →
                        {c.endDate ? c.endDate.toLocaleDateString() : "∞"}
                      </span>

                      <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                        🎮 {capitalize(GAME_LABELS[c.gameType as number])}
                      </span>

                      <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                        🎁 {c.prizes.length} prizes
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="text-slate-300 transition group-hover:text-brand-500">→</div>
                </div>

                {/* subtle gradient hover line */}
                <div className="absolute inset-x-0 bottom-0 h-[2px] scale-x-0 bg-gradient-to-r from-brand-400 to-brand-600 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
