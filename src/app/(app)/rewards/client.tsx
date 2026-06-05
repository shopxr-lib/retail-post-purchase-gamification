"use client";

import { useState, useTransition } from "react";
import { claimPrize, unclaimPrize } from "@/actions/prizes/claim-actions";
import { useUIStore } from "@/stores";
import { PRIZE_CONFIG, PRIZE_LABELS } from "@/constants";

interface CustomerPrize {
  id: string;
  claimStatus: string;
  wonAt: Date;
  claimedAt: Date | null;
  prizeSnapshot: any;
  customer: { name: string; email: string; phone: string };
  claimStore: { name: string } | null;
  claimedBy: { name: string; email: string } | null;
}

export function AdminRewardsClient({
  prizes,
  stores,
  admin,
}: {
  prizes: CustomerPrize[];
  stores: { id: string; name: string }[];
  admin: { name: string; email: string };
}) {
  const { addToast } = useUIStore();
  const [isPending, startTransition] = useTransition();
  const [localPrizes, setLocalPrizes] = useState(prizes);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [unclaimingId, setUnclaimingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    type: "claim" | "unclaim" | null;
    prizeId: string | null;
  }>({ type: null, prizeId: null });

  const handleClaim = (prizeId: string) => {
    setClaimingId(prizeId);

    startTransition(async () => {
      const result = await claimPrize({
        customerPrizeId: prizeId,
        storeId: stores[0]?.id ?? "",
      });

      if ("error" in result && result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
      } else {
        addToast({ type: "success", title: "Prize claimed ✓" });

        setLocalPrizes((prev) =>
          prev.map((p) =>
            p.id === prizeId
              ? {
                  ...p,
                  claimStatus: "CLAIMED",
                  claimedAt: new Date(),
                  claimedBy: admin,
                }
              : p
          )
        );
      }

      setClaimingId(null);
    });
  };

  const handleUnclaim = (prizeId: string) => {
    setUnclaimingId(prizeId);

    startTransition(async () => {
      const result = await unclaimPrize(prizeId);

      if ("error" in result && result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
      } else {
        addToast({ type: "success", title: "Prize unclaimed ✓" });

        setLocalPrizes((prev) =>
          prev.map((p) =>
            p.id === prizeId
              ? { ...p, claimStatus: "UNCLAIMED", claimedAt: null, claimedBy: null }
              : p
          )
        );
      }

      setUnclaimingId(null);
    });
  };

  const openClaimConfirm = (id: string) => {
    setConfirm({ type: "claim", prizeId: id });
  };

  const openUnclaimConfirm = (id: string) => {
    setConfirm({ type: "unclaim", prizeId: id });
  };

  const executeAction = () => {
    if (!confirm.prizeId) return;

    if (confirm.type === "claim") {
      handleClaim(confirm.prizeId);
    } else if (confirm.type === "unclaim") {
      handleUnclaim(confirm.prizeId);
    }

    setConfirm({ type: null, prizeId: null });
  };
  
  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rewards</h1>
            <p className="mt-1 text-sm text-slate-500">Manage prize claims and redemption flow</p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {localPrizes.length} total
          </span>
        </div>

        {/* EMPTY STATE */}
        {localPrizes.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
            <div className="text-5xl">🎉</div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">All caught up</h3>
            <p className="mt-1 text-sm text-slate-500">No rewards waiting for action</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* TABLE HEADER */}
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Prize Management</h2>
              <p className="text-xs text-slate-500">Review and update prize claim status</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                    {["Prize", "Customer", "Time Won", "Claimed By", "Action"].map((h) => (
                      <th key={h} className="px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {localPrizes.map((p) => {
                    const snap = p.prizeSnapshot as {
                      name: string;
                      type: number;
                      value: string | null;
                    } | null;

                    return (
                      <tr key={p.id} className="group transition hover:bg-slate-50/70">
                        {/* PRIZE */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2">
                            <span className="text-lg leading-none">
                              {PRIZE_CONFIG[PRIZE_LABELS[snap?.type ?? 1]].icon}
                            </span>

                            <div>
                              <p className="font-semibold text-slate-900 group-hover:text-slate-950">
                                {snap?.name ?? "Prize"}
                              </p>
                              {snap?.value && (
                                <p className="text-xs text-slate-400">{snap.value}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* CUSTOMER */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{p.customer.name}</p>
                            <p className="text-xs text-slate-400">{p.customer.phone}</p>
                          </div>
                        </td>

                        {/* TIME */}
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                          {new Date(p.wonAt).toLocaleString()}
                        </td>

                        {/* CLAIMED BY */}
                        <td className="px-6 py-4 text-xs">
                          {p.claimedBy ? (
                            <div>
                              <p className="font-medium text-slate-900">{p.claimedBy.name}</p>
                              <p className="text-[11px] text-slate-400">{p.claimedBy.email}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">Not Claimed Yet</span>
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-6 py-4">
                          {p.claimStatus === "UNCLAIMED" ? (
                            <button
                              onClick={() => openClaimConfirm(p.id)}
                              disabled={isPending && claimingId === p.id}
                              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
                            >
                              {isPending && claimingId === p.id ? "Claiming…" : "Claim"}
                            </button>
                          ) : (
                            <button
                              onClick={() => openUnclaimConfirm(p.id)}
                              disabled={isPending && unclaimingId === p.id}
                              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
                            >
                              {isPending && unclaimingId === p.id ? "Reverting…" : "Unclaim"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {confirm.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              {confirm.type === "claim" ? "Claim Prize?" : "Unclaim Prize?"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {confirm.type === "claim"
                ? "This will mark the prize as claimed and assign it to the current admin."
                : "This will revert the prize back to unclaimed state."}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirm({ type: null, prizeId: null })}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={executeAction}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  confirm.type === "claim"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
