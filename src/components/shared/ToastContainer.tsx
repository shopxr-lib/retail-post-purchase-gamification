"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onRemove }: {
  toast: { id: string; type: string; title: string; message?: string; duration?: number };
  onRemove: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onRemove, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const styles = {
    success: { border: "border-green-200", bg: "bg-green-50", icon: "✅", text: "text-green-800", sub: "text-green-600" },
    error:   { border: "border-red-200",   bg: "bg-red-50",   icon: "❌", text: "text-red-800",   sub: "text-red-600"   },
    info:    { border: "border-blue-200",  bg: "bg-blue-50",  icon: "ℹ️", text: "text-blue-800",  sub: "text-blue-600"  },
    warning: { border: "border-amber-200", bg: "bg-amber-50", icon: "⚠️", text: "text-amber-800", sub: "text-amber-600" },
  };
  const s = styles[toast.type as keyof typeof styles] ?? styles.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      onClick={onRemove}
      className={`pointer-events-auto flex max-w-xs items-start gap-3 rounded-2xl border ${s.border} ${s.bg} px-4 py-3 shadow-lg cursor-pointer`}
    >
      <span className="text-base mt-0.5">{s.icon}</span>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${s.text}`}>{toast.title}</p>
        {toast.message && <p className={`text-xs mt-0.5 line-clamp-2 ${s.sub}`}>{toast.message}</p>}
      </div>
    </motion.div>
  );
}
