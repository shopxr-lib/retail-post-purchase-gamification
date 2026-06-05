import { GAME_LABELS } from "@/constants";
import { capitalize } from "@/lib/utils";
import Link from "next/link";

interface Props {
  staff: {
    id: string; name: string; email: string; 
  };
  stats: {
    label: string;
    value: number;
    color: string;
  }[];
  activeCampaign: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date | null;
    gameType: number;
  } | null;
}

export function AdminDashboardClient({ staff, stats, activeCampaign }: Props) {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {staff.name}. Here’s what’s happening today.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            {/* glow */}
            <div
              className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} opacity-10 blur-xl`}
            />

            <p className="text-3xl font-black text-slate-900">{s.value}</p>

            <p className="mt-1 text-xs font-medium text-slate-400">{s.label}</p>

            {/* subtle index accent */}
            <div className="absolute right-3 top-3 text-[10px] text-slate-200">0{i + 1}</div>
          </div>
        ))}
      </div>

      {/* ACTIVE CAMPAIGN */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Active Campaign
          </h2>

          {activeCampaign && (
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600">
              Live
            </span>
          )}
        </div>

        <div className="p-6">
          {activeCampaign ? (
            <div className="flex items-start justify-between gap-6">
              {/* LEFT */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
                  <p className="truncate text-lg font-bold text-slate-900">
                    {activeCampaign.name}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                    📅 {activeCampaign.startDate.toLocaleDateString()} →{" "}
                    {activeCampaign.endDate ? activeCampaign.endDate.toLocaleDateString() : "∞"}
                  </span>

                  <span className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                    🎮 {capitalize(GAME_LABELS[activeCampaign.gameType as number])}
                  </span>

                  <span className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                    ⚡ Active campaign running
                  </span>
                </div>
              </div>

              {/* RIGHT CTA */}
              <Link
                href={`/campaigns/${activeCampaign.id}`}
                className="shrink-0 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:brightness-110"
              >
                Open →
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700">No active campaign right now</p>
                <p className="mt-1 text-sm text-slate-400">
                  Create a campaign to start collecting engagement.
                </p>
              </div>

              {/* <Link
                href="/campaigns/new"
                className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:brightness-110"
              >
                + Create
              </Link> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}