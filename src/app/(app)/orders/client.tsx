"use client";
import { claimPrize, unclaimPrize } from "@/actions/prizes/claim-actions";
import { useUIStore } from "@/stores";
import { RetailStore } from "@prisma/client";
import { Fragment, useState, useTransition } from "react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalCredits: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  _count: {
    orders: number;
    gamePlays: number;
    prizes: number;
  };
  orders: {
    id: string;
    amountPaid: number;
    receiptNumber: string | null;
    creditsGranted: number;
    generatedBy: { name: string; store: string };
    createdAt: Date;
  }[];
  prizes: {
    id: string;
    claimStatus: string;
    wonAt: Date;
    claimedAt: Date | null;
    prizeSnapshot: any;
    claimedBy: { name: string; store: string } | null;
  }[];
}

export default function OrdersClient({
  admin,
  customers,
}: {
  admin: {
    name: string;
    email: string;
    store: RetailStore;
  };
  customers: Customer[];
}) {
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, "prizes" | "purchases">>({});
  const getTab = (customerId: string) => activeTab[customerId] ?? "prizes";

  const { addToast } = useUIStore();
  const [isPending, startTransition] = useTransition();
  const [localCustomers, setLocalCustomers] = useState(customers);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [unclaimingId, setUnclaimingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<{
    type: "claim" | "unclaim" | null;
    prizeId: string | null;
  }>({ type: null, prizeId: null });

  const filteredCustomers = localCustomers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.totalCredits.toString() === q ||
      c.totalSpent.toString() === q
    )
  });

  const handleClaim = (prizeId: string) => {
    setClaimingId(prizeId);

    startTransition(async () => {
      const result = await claimPrize({
        customerPrizeId: prizeId,
        storeId: admin.store.id,
      });

      if ("error" in result && result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
      } else {
        addToast({ type: "success", title: "Prize claimed ✓" });

        setLocalCustomers((prev) =>
          prev.map((c) => ({
            ...c,
            prizes: c.prizes.map((p) =>
              p.id === prizeId
                ? {
                    ...p,
                    claimStatus: "CLAIMED",
                    claimedAt: new Date(),
                    claimedBy: {
                      name: admin.name,
                      store: admin.store.name,
                    },
                  }
                : p
            ),
          }))
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

        setLocalCustomers((prev) =>
          prev.map((c) => ({
            ...c,
            prizes: c.prizes.map((p) =>
              p.id === prizeId
                ? {
                    ...p,
                    claimStatus: "UNCLAIMED",
                    claimedAt: null,
                    claimedBy: null,
                  }
                : p
            ),
          }))
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
        {/* Header */}
        <div className="flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h1>
            <p className="text-sm text-slate-500">Manage and explore customer activity</p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {localCustomers.length} total
          </span>
        </div>

        {/* SEARCH */}
        {localCustomers.length > 0 && (
          <div className="relative w-full">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, email, or phone number …"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* EMPTY STATE */}
        {localCustomers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
            <div className="text-5xl">🎉</div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">All caught up</h3>
            <p className="mt-1 text-sm text-slate-500">No orders waiting for action</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <div className="text-4xl">🔍</div>
            <h3 className="mt-3 text-base font-semibold text-slate-800">No matches</h3>
            <p className="mt-1 text-sm text-slate-500">Try a different search term</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                    {[
                      "Customer",
                      "Contact",
                      "Credits",
                      "Spent",
                      "Purchases",
                      "Prizes",
                      "Plays",
                      "Joined",
                    ].map((h) => (
                      <th key={h} className="px-5 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((c) => (
                    <Fragment key={c.id}>
                      <tr
                        className="cursor-pointer transition hover:bg-slate-50/70"
                        onClick={() => setExpandedCustomer(expandedCustomer === c.id ? null : c.id)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">
                              {expandedCustomer === c.id ? "▾" : "▸"}
                            </span>
                            <div>
                              <p className="font-medium text-slate-900">{c.name}</p>
                              {/* <p className="text-xs text-slate-500">ID: {c.id}</p> */}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          <p className="text-slate-900">{c.email}</p>
                          <p className="text-xs text-slate-500">{c.phone}</p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-brand-600">{c.totalCredits}</td>

                        <td className="px-5 py-4 text-slate-700">
                          ${Number(c.totalSpent).toFixed(2)}
                        </td>

                        <td className="px-5 py-4">{c._count.orders}</td>
                        <td className="px-5 py-4">{c._count.prizes}</td>
                        <td className="px-5 py-4">{c._count.gamePlays}</td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleString()}
                        </td>
                      </tr>

                      {/* Expanded Section */}
                      {expandedCustomer === c.id && (
                        <tr>
                          <td colSpan={8} className="bg-slate-50/60 px-6 py-5">
                            <div className="space-y-4">
                              {/* Tabs */}
                              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                                {(["prizes", "purchases"] as const).map((tab) => (
                                  <button
                                    key={tab}
                                    onClick={() =>
                                      setActiveTab((prev) => ({
                                        ...prev,
                                        [c.id]: tab,
                                      }))
                                    }
                                    className={`rounded-lg px-4 py-1.5 text-sm transition ${
                                      getTab(c.id) === tab
                                        ? "bg-brand-600 text-white shadow"
                                        : "text-slate-600 hover:bg-slate-100"
                                    }`}
                                  >
                                    {tab === "prizes" ? "Prizes" : "Purchases"}
                                  </button>
                                ))}
                              </div>

                              {/* Purchases */}
                              {getTab(c.id) === "purchases" && (
                                <div className="space-y-3">
                                  {c.orders.length === 0 ? (
                                    <p className="text-sm text-slate-500">No purchases yet.</p>
                                  ) : (
                                    c.orders.map((order) => (
                                      <div
                                        key={order.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                                      >
                                        <div className="grid gap-4 md:grid-cols-4">
                                          <div>
                                            <p className="text-xs text-slate-400">Amount</p>
                                            <p className="text-lg font-semibold text-slate-900">
                                              ${Number(order.amountPaid).toFixed(2)}
                                            </p>
                                          </div>

                                          <div>
                                            <p className="text-xs text-slate-400">Receipt</p>
                                            <p
                                              className={
                                                order.receiptNumber
                                                  ? `text-slate-700`
                                                  : `text-slate-400`
                                              }
                                            >
                                              {order.receiptNumber ?? "Not Added"}
                                            </p>
                                          </div>

                                          <div>
                                            <p className="text-xs text-slate-400">Purchased By</p>
                                            <p>{order.generatedBy?.name ?? "-"}</p>
                                          </div>

                                          <div>
                                            <p className="text-xs text-slate-400">Store</p>
                                            <p>{order.generatedBy?.store ?? "-"}</p>
                                          </div>
                                        </div>

                                        <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                                          {new Date(order.createdAt).toLocaleString()}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}

                              {/* Prizes */}
                              {getTab(c.id) === "prizes" && (
                                <div className="grid gap-3">
                                  {c.prizes.length === 0 ? (
                                    <p className="text-sm text-slate-500">No prizes won yet.</p>
                                  ) : (
                                    c.prizes.map((prize) => {
                                      const snap = prize.prizeSnapshot as {
                                        name: string;
                                        type: string;
                                        value?: string;
                                      };

                                      return (
                                        <div
                                          key={prize.id}
                                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <h5 className="font-semibold text-slate-900">
                                                {snap?.name ?? "Prize"}
                                              </h5>
                                              {snap?.value && (
                                                <p className="text-sm text-slate-500">
                                                  {snap.value}
                                                </p>
                                              )}
                                            </div>

                                            {prize.claimStatus === "UNCLAIMED" ? (
                                              <button
                                                onClick={() => openClaimConfirm(prize.id)}
                                                disabled={isPending && claimingId === prize.id}
                                                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
                                              >
                                                {isPending && claimingId === prize.id
                                                  ? "Claiming…"
                                                  : "Claim"}
                                              </button>
                                            ) : (
                                              <button
                                                onClick={() => openUnclaimConfirm(prize.id)}
                                                disabled={isPending && unclaimingId === prize.id}
                                                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
                                              >
                                                {isPending && unclaimingId === prize.id
                                                  ? "Reverting…"
                                                  : "Unclaim"}
                                              </button>
                                            )}
                                          </div>

                                          <div className="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
                                            <div>
                                              <p className="font-medium text-slate-700">Won At</p>
                                              {new Date(prize.wonAt).toLocaleString()}
                                            </div>

                                            {prize.claimStatus === "CLAIMED" && (
                                              <>
                                                <div>
                                                  <p className="font-medium text-slate-700">
                                                    Claimed By
                                                  </p>
                                                  {prize.claimedBy?.name ?? "-"}
                                                </div>

                                                <div>
                                                  <p className="font-medium text-slate-700">
                                                    Store
                                                  </p>
                                                  {prize.claimedBy?.store ?? "-"}
                                                </div>

                                                {prize.claimedAt && (
                                                  <div>
                                                    <p className="font-medium text-slate-700">
                                                      Claimed At
                                                    </p>
                                                    {new Date(prize.claimedAt).toLocaleString()}
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
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
