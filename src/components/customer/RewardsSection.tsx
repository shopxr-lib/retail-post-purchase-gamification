"use client";
import { PRIZE_CONFIG, PRIZE_LABELS } from "@/constants";
import { motion } from "framer-motion";

interface CustomerPrize {
  id: string;
  claimStatus: string;
  wonAt: Date;
  claimedAt: Date | null;
  prizeSnapshot: { name: string; type: number; value: string | null } | null;
  claimedBy: { name: string; store: string } | null;
}

export function RewardsSection({ prizes }: { prizes: CustomerPrize[] }) {
  const unclaimed = prizes.filter((p) => p.claimStatus === "UNCLAIMED");
  const claimed = prizes.filter((p) => p.claimStatus === "CLAIMED");

  return (
    <div className="space-y-5">
      {prizes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
          <div className="mb-3 text-5xl">🎁</div>
          <p className="font-bold text-slate-600">No rewards yet</p>
          <p className="mt-1 text-sm text-slate-400">Play games to win exciting prizes!</p>
        </div>
      ) : (
        <>
          {unclaimed.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Unclaimed ({unclaimed.length})
              </h3>
              <div className="space-y-3">
                {unclaimed.map((p, i) => {
                  const snap = p.prizeSnapshot;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-sky-50 p-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                        {PRIZE_CONFIG[PRIZE_LABELS[snap?.type ?? 1]].icon ?? "🎁"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">{snap?.name ?? "Prize"}</p>
                        {snap?.value && (
                          <p className="mt-0.5 text-xs font-semibold text-brand-600">
                            {snap.value}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          Won {new Date(p.wonAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
                        Unclaimed
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {claimed.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Claimed ({claimed.length})
              </h3>
              <div className="space-y-2">
                {claimed.map((p) => {
                  const snap = p.prizeSnapshot;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-sky-50 p-3.5"
                    >
                      <span className="text-xl">
                        {PRIZE_CONFIG[PRIZE_LABELS[snap?.type ?? 1]].icon ?? "🎁"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-600">
                          {snap?.name ?? "Prize"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Claimed {p.claimedAt ? new Date(p.claimedAt).toLocaleString() : ""}
                          {p.claimedBy?.store && ` at ${p.claimedBy.store}`}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600">
                        Claimed
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
