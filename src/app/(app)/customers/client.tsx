"use client";
import { Fragment, useState } from "react";

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

export default function CustomersClient({
  total,
  limit,
  page,
  search,
  customers,
}: {
  total: number;
  limit: number;
  page: number;
  search: string;
  customers: Customer[];
}) {
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, "prizes" | "purchases">>({});

  const totalPages = Math.ceil(total / limit);
  const getTab = (customerId: string) => activeTab[customerId] ?? "prizes";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Customers
          </h1>
          <p className="text-sm text-slate-500">Manage and explore customer activity</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
          {total} total
        </span>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name, email or phone…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Search
        </button>

        {search && (
          <a
            href="/customers"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            Clear
          </a>
        )}
      </form>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {customers.length === 0 ? (
          <div className="p-14 text-center text-slate-500">
            No customers found.
          </div>
        ) : (
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
                {customers.map((c) => (
                  <Fragment key={c.id}>
                    <tr
                      className="cursor-pointer transition hover:bg-slate-50/70"
                      onClick={() =>
                        setExpandedCustomer(expandedCustomer === c.id ? null : c.id)
                      }
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

                      <td className="px-5 py-4 font-semibold text-brand-600">
                        {c.totalCredits}
                      </td>

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
                                  <p className="text-sm text-slate-500">
                                    No purchases yet.
                                  </p>
                                ) : (
                                  c.orders.map((order) => (
                                    <div
                                      key={order.id}
                                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                                    >
                                      <div className="grid gap-4 md:grid-cols-4">
                                        <div>
                                          <p className="text-xs text-slate-400">
                                            Amount
                                          </p>
                                          <p className="text-lg font-semibold text-slate-900">
                                            ${Number(order.amountPaid).toFixed(2)}
                                          </p>
                                        </div>

                                        <div>
                                          <p className="text-xs text-slate-400">
                                            Receipt
                                          </p>
                                          <p className={order.receiptNumber ? `text-slate-700` : `text-slate-400`}>
                                            {order.receiptNumber ?? "Not Added"}
                                          </p>
                                        </div>

                                        <div>
                                          <p className="text-xs text-slate-400">
                                            Purchased By
                                          </p>
                                          <p>{order.generatedBy?.name ?? "-"}</p>
                                        </div>

                                        <div>
                                          <p className="text-xs text-slate-400">
                                            Store
                                          </p>
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
                                  <p className="text-sm text-slate-500">
                                    No prizes won yet.
                                  </p>
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

                                          <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                              prize.claimStatus === "CLAIMED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-amber-100 text-amber-700"
                                            }`}
                                          >
                                            {prize.claimStatus}
                                          </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
                                          <div>
                                            <p className="text-slate-700 font-medium">
                                              Won At
                                            </p>
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
                                                  {new Date(
                                                    prize.claimedAt
                                                  ).toLocaleString()}
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/customers?page=${p}${
                search ? `&search=${encodeURIComponent(search)}` : ""
              }`}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                p === page
                  ? "bg-brand-600 text-white shadow"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}