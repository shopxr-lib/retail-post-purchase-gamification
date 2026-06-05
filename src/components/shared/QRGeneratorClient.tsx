"use client";

import { useState, useTransition } from "react";
import { generateQRCode } from "@/actions/qr/qr-actions";
import { useUIStore } from "@/stores";
import { RequiredIcon } from "./RequiredIcon";

interface Props {
  campaign: { id: string; name: string; creditsPerUnit: number };
}

export function QRGeneratorClient({ campaign }: Props) {
  const { addToast } = useUIStore();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [result, setResult] = useState<{
    qrCode: string;
    qrImageUrl: string;
    creditsGranted: number;
  } | null>(null);

  const estimatedCredits = amount
    ? Math.floor(Number(amount) / campaign.creditsPerUnit)
    : 0;

  const handleGenerate = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("amountPaid", amount);
      fd.set("campaignId", campaign.id);
      if (receiptNumber) fd.set("receiptNumber", receiptNumber);

      const res = await generateQRCode(fd);

      if ("error" in res && res.error) {
        addToast({ type: "error", title: "Error", message: res.error });
      } else if (res.success) {
        setResult(res as typeof result);
        setAmount("");
        setReceiptNumber("");
      }
    });
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">
          QR Generator
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {campaign.name} ·{" "}
          <span className="font-medium text-slate-600">
            ${campaign.creditsPerUnit} = 1 credit
          </span>
        </p>
      </div>

      <div className="p-6">
        {/* RESULT STATE */}
        {result ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto w-fit rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <img
                src={result.qrImageUrl}
                alt="QR Code"
                width={220}
                height={220}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-600">
                ✓ {result.creditsGranted} credit
                {result.creditsGranted !== 1 ? "s" : ""} will be granted
              </p>
              <p className="text-xs text-slate-500">
                QR generated successfully
              </p>
            </div>

            <button
              onClick={() => setResult(null)}
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 hover:underline"
            >
              Generate another →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* INPUT GRID */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* AMOUNT */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
                  Amount Paid <RequiredIcon />
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    $
                  </span>
                  <input
                    className={`${inputCls} pl-8`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {amount && Number(amount) > 0 && (
                  <p className="mt-2 text-xs font-medium text-brand-600">
                    ≈ {estimatedCredits} credit
                    {estimatedCredits !== 1 ? "s" : ""} will be issued
                  </p>
                )}
              </div>

              {/* RECEIPT */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
                  Receipt Number
                </label>

                <input
                  className={inputCls}
                  placeholder="Optional"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                />
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleGenerate}
              disabled={isPending || !amount || Number(amount) <= 0}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating QR…
                </span>
              ) : (
                "Generate QR Code"
              )}
            </button>

            {/* FOOTER HINT */}
            <div className="text-center text-[11px] text-slate-400">
              QR will be instantly usable after generation
            </div>
          </div>
        )}
      </div>
    </div>
  );
}