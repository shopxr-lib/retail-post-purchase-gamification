import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db/prisma";
import { QRGeneratorClient } from "@/components/shared/QRGeneratorClient";

export const metadata = { title: "QR Codes — Admin" };

export default async function QRPage() {
  await requireAdminSession();

  const now = new Date();
  const activeCampaign = await db.campaign.findFirst({
    where: {
      status: 1,
      deletedAt: null,
      startDate: { lte: now },
      OR: [{ endDate: { gte: now } }, { endDate: { equals: null } }],
    },
  });

  const recentQRs = await db.qRCode.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      generatedBy: { select: { name: true, store: { select: { name: true } } } },
      redeemedBy: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">QR Codes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Generate, track and manage QR redemptions in real time
          </p>
        </div>
      </div>

      {/* GENERATOR / ALERT */}
      {!activeCampaign ? (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-amber-800">No active campaign</p>
              <p className="mt-1 text-sm text-amber-700">
                QR generation is disabled until a campaign is active.
              </p>
            </div>

            {/* <Link
              href="/campaigns/new"
              className="shrink-0 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
            >
              Create Campaign
            </Link> */}
          </div>
        </div>
      ) : (
        <QRGeneratorClient
          campaign={{
            id: activeCampaign.id,
            name: activeCampaign.name,
            creditsPerUnit: activeCampaign.creditsPerUnit,
          }}
        />
      )}

      {/* TABLE CARD */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* TABLE HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent QR Activity</h2>
            <p className="text-xs text-slate-500">Last 5 generated QR codes</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {recentQRs.length} entries
            </span>
          </div>
        </div>

        {/* EMPTY STATE */}
        {recentQRs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-2 text-sm font-medium text-slate-700">No QR codes generated yet</div>
            <div className="text-xs text-slate-400">
              Once staff generate QR codes, they will appear here
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur">
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                  {[
                    "#",
                    "Customer",
                    "Amount",
                    "Receipt",
                    "Credits",
                    "Store",
                    "Staff",
                    "Status",
                    "Date",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentQRs.map((qr, index) => (
                  <tr key={qr.id} className="group transition hover:bg-slate-50/70">
                    {/* INDEX */}
                    <td className="px-6 py-4 text-slate-400">{index + 1}</td>

                    {/* CUSTOMER */}
                    <td
                      className={`px-6 py-4 font-medium ${
                        qr.redeemedBy ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {qr.redeemedBy?.name ?? "Not redeemed"}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-6 py-4 text-slate-900">
                      ${Number(qr.amountPaid).toFixed(2)}
                    </td>

                    {/* RECEIPT */}
                    <td
                      className={`px-6 py-4 ${qr.receiptNumber ? "text-slate-900" : "text-slate-400"}`}
                    >
                      {qr.receiptNumber ?? "Not Added"}
                    </td>

                    {/* CREDITS */}
                    <td className="px-6 py-4 font-bold text-brand-600">{qr.creditsGranted}</td>

                    {/* STORE */}
                    <td className="px-6 py-4 text-slate-600">{qr.generatedBy.store.name}</td>

                    {/* STAFF */}
                    <td className="px-6 py-4 text-slate-600">{qr.generatedBy.name}</td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          qr.status === "REDEEMED"
                            ? "bg-emerald-100 text-emerald-700"
                            : qr.status === "ACTIVE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {qr.status}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-400">
                      {new Date(qr.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
