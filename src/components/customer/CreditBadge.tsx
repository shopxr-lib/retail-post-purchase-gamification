"use client";

import { motion } from "framer-motion";
import { useCustomerStore } from "@/stores";
import { useEffect, useRef, useState } from "react";

export function CreditBadge({ credits: initialCredits }: { credits: number }) {
  const { customer } = useCustomerStore();
  const credits = customer?.totalCredits ?? initialCredits;
  const prevRef = useRef(credits);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (credits > prevRef.current) setFlash("up");
    else if (credits < prevRef.current) setFlash("down");
    prevRef.current = credits;
    if (flash) { const t = setTimeout(() => setFlash(null), 800); return () => clearTimeout(t); }
  }, [credits]);

  return (
    <motion.div
      animate={flash ? { scale: [1, 1.15, 1] } : {}}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors shadow-sm ${
        flash === "up"   ? "border-green-300 bg-green-50"  :
        flash === "down" ? "border-red-300 bg-red-50"      :
                           "border-brand-200 bg-brand-50"
      }`}
    >
      <span className="text-sm">💎</span>
      <span className={`text-sm font-bold tabular-nums ${
        flash === "up" ? "text-green-600" : flash === "down" ? "text-red-600" : "text-brand-600"
      }`}>{credits.toLocaleString()}</span>
      <span className="text-xs text-slate-400">credits</span>
    </motion.div>
  );
}
