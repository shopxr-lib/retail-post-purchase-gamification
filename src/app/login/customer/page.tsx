"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { sendLoginOTP, verifyOTPAndLogin } from "@/actions/auth/customer-actions";
import { useUIStore } from "@/stores";

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none shadow-sm transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:bg-white";
const otpInputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] text-slate-900 outline-none shadow-sm transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20";

type CustomerStep = "email" | "otp";

// ─── Error box ────────────────────────────────────────────────────────────────
function ErrBox({ msg }: { msg: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600"
    >
      {msg}
    </motion.p>
  );
}

// ─── Customer panel ───────────────────────────────────────────────────────────
function CustomerPanel() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [step, setStep] = useState<CustomerStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sendCode = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("identifier", email);
      fd.set("purpose", "LOGIN");
      const r = await sendLoginOTP(fd);
      if (r.error) {
        setError(r.error);
      } else {
        setStep("otp");
        addToast({ type: "info", title: "Code sent!", message: `Check ${email}` });
      }
    });
  };

  const verify = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("identifier", email);
      fd.set("code", code);
      fd.set("purpose", "LOGIN");
      const r = await verifyOTPAndLogin(fd);
      if (r.error) {
        setError(r.error);
      } else {
        addToast({ type: "success", title: "Welcome back! 🎉" });
        router.push("/dashboard");
      }
    });
  };

  return (
    <AnimatePresence mode="wait">
      {step === "email" ? (
        <motion.div
          key="email"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email && sendCode()}
              className={inputCls}
              autoFocus
            />
          </div>
          {error && <ErrBox msg={error} />}
          <button
            onClick={sendCode}
            disabled={isPending || !email}
            className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />{" "}
                Sending…
              </span>
            ) : (
              "Send me a code →"
            )}
          </button>
          <p className="text-center text-xs text-slate-400">
            No account?{" "}
            <a href="/register" className="font-semibold text-brand-600 hover:underline">
              Create one free
            </a>
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              6-digit code
            </label>
            <p className="mb-3 text-xs text-slate-400">
              Sent to <span className="font-semibold text-slate-600">{email}</span>
            </p>
            <input
              className={otpInputCls}
              placeholder="• • • • • •"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && code.length === 6 && verify()}
              autoFocus
            />
          </div>
          {error && <ErrBox msg={error} />}
          <button
            onClick={verify}
            disabled={isPending || code.length !== 6}
            className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />{" "}
                Verifying…
              </span>
            ) : (
              "Sign In ✓"
            )}
          </button>
          <button
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="w-full text-center text-xs text-slate-400 transition hover:text-slate-600"
          >
            ← Different email
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main login page ──────────────────────────────────────────────────────────
function LoginForm() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-white to-sky-50">
      {/* Left decorative panel */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 lg:flex lg:w-1/2 xl:w-5/12">
        {/* Background orbs */}
        <div className="absolute -left-12 top-1/4 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -right-12 bottom-1/4 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwaDQydjQySDE4QzI3Ljk0IDQyIDM2IDMzLjk0IDM2IDI0VjE4eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-40" />

        <div className="relative z-10 px-12 text-white">
          <div className="mb-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl backdrop-blur-sm">
              🎮
            </div>
            <h1 className="text-4xl font-black leading-tight">
              ShopXR
              <br />
            </h1>
            <p className="mt-3 text-lg font-medium text-brand-200">
              Post-Purchase Rewards Platform
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: "🎯", title: "Earn Credits", desc: "Get rewarded on every purchase" },
              { icon: "🎲", title: "Play Games", desc: "Spin, scratch & win exciting prizes" },
              { icon: "🏆", title: "Claim Prizes", desc: "Redeem rewards at any store" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="mt-0.5 text-xs text-brand-300">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: login card */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl shadow-glow-brand">
              🎮
            </div>
            <h1 className="text-2xl font-black text-slate-900">ShopXR</h1>
            <p className="mt-1 text-sm text-slate-500">Post-Purchase Rewards Platform</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-400">Sign in to your account to continue</p>
            </div>

            {/* Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <CustomerPanel />
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} ShopXR. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
