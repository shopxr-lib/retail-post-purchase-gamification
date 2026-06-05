"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useQRScanner } from "@/hooks";

export function QRScannerSection() {
  const { videoRef, isScanning, isProcessing, error, startScanning, stopScanning } = useQRScanner();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Scan QR Code</h2>
          <p className="mt-0.5 text-xs text-slate-400">Earn credits from your purchases</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isScanning ? (
          <div className="flex justify-center">
            <motion.div
              key="scanner"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="relative aspect-square max-h-64 overflow-hidden border border-slate-200 rounded-lg">
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-44 w-44">
                    {[
                      "top-0 left-0 border-t-2 border-l-2",
                      "top-0 right-0 border-t-2 border-r-2",
                      "bottom-0 left-0 border-b-2 border-l-2",
                      "bottom-0 right-0 border-b-2 border-r-2",
                    ].map((cls, i) => (
                      <div
                        key={i}
                        className={`absolute h-8 w-8 rounded-sm border-brand-400 ${cls}`}
                      />
                    ))}
                    <motion.div
                      className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent"
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center">
                      <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
                      <p className="text-xs text-white">Processing…</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 p-4 pt-3">
                {error && (
                  <p className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">
                    {error}
                  </p>
                )}
                <button
                  onClick={stopScanning}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 pt-0"
          >
            <button
              onClick={startScanning}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:shadow-lg hover:brightness-105 active:scale-95"
            >
              Scan QR Code
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
