"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditBadge } from "./CreditBadge";
import { signOutCustomer } from "@/actions/auth/customer-actions";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", icon: "🏠", label: "Home" },
];

interface Props {
  user: { name: string; totalCredits: number } | null;
  children: React.ReactNode;
}

export function CustomerShell({ user, children }: Props) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-sm">🎮</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Welcome back</p>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">{user?.name ?? "Guest"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && <CreditBadge credits={user.totalCredits} />}
            {user && (
              <button
                onClick={async () => { setSigningOut(true); await signOutCustomer(); }}
                disabled={signingOut}
                className="text-xs text-slate-400 hover:text-slate-700 transition"
              >
                {signingOut ? "…" : "Sign out"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl safe-area-pb">
        <div className="flex max-w-5xl mx-auto">
          {NAV.map((item) => {
            const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-3 transition ${
                  active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span className={`text-xl transition-transform ${active ? "scale-110" : ""}`}>{item.icon}</span>
                <span className="text-[10px] font-semibold">{item.label}</span>
                {active && <span className="absolute bottom-0 w-8 h-0.5 bg-brand-500 rounded-t-full" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
