"use client";

import { useState, useTransition } from "react";
import { getQRCodeImage } from "@/actions/qr/qr-actions";
import { useUIStore } from "@/stores";
import { Loader2, QrCode } from "lucide-react";

export function QRViewButton({ qrId, disabled }: { qrId: string; disabled?: boolean }) {
  const { addToast } = useUIStore();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ qrImageUrl: string; creditsGranted: number } | null>(null);

  const handleView = () => {
    startTransition(async () => {
      const res = await getQRCodeImage(qrId);
      if ("error" in res && res.error) {
        addToast({ type: "error", title: "Error", message: res.error });
      } else if (res.success) {
        setResult(res as typeof result);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleView}
        disabled={disabled || isPending}
        title={disabled ? "QR code no longer active" : "View QR code"}
        aria-label={disabled ? "QR code no longer active" : "View QR code"}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
      </button>

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto w-fit rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <img src={result.qrImageUrl} alt="QR Code" width={220} height={220} className="rounded-xl" />
            </div>
            <p className="mt-4 text-sm font-semibold text-emerald-600">
              {result.creditsGranted} credit{result.creditsGranted !== 1 ? "s" : ""} on redemption
            </p>
            <button
              onClick={() => setResult(null)}
              className="mt-4 text-sm font-semibold text-brand-600 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}