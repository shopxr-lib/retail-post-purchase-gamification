"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { sendLoginOTP, verifyOTPAndLogin } from "@/actions/auth/customer-actions";
import { useUIStore } from "@/stores";
import { authClient } from "@/lib/auth/admin-client";

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none shadow-sm transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:bg-white";
const otpInputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] text-slate-900 outline-none shadow-sm transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20";

type Tab = "customer" | "admin";
type CustomerStep = "email" | "otp";

// ─── Tab pill ─────────────────────────────────────────────────────────────────
function TabPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
        active ? "text-white" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {active && (
        <motion.span
          layoutId="tab-bg"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 shadow-md"
        />
      )}
      <span className="relative flex items-center justify-center gap-1.5">
        {label}
      </span>
    </button>
  );
}

// ─── Error box ────────────────────────────────────────────────────────────────
function ErrBox({ msg }: { msg: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5"
    >
      {msg}
    </motion.p>
  );
}

// ─── Customer panel ───────────────────────────────────────────────────────────
function CustomerPanel({ from }: { from: string }) {
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
      if (r.error) { setError(r.error); }
      else { setStep("otp"); addToast({ type: "info", title: "Code sent!", message: `Check ${email}` }); }
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
      if (r.error) { setError(r.error); }
      else { addToast({ type: "success", title: "Welcome back! 🎉" }); router.push(from); }
    });
  };

  return (
    <AnimatePresence mode="wait">
      {step === "email" ? (
        <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && email && sendCode()}
              className={inputCls}
              autoFocus
            />
          </div>
          {error && <ErrBox msg={error} />}
          <button
            onClick={sendCode}
            disabled={isPending || !email}
            className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</span>
            ) : "Send me a code →"}
          </button>
          <p className="text-center text-xs text-slate-400">
            No account?{" "}
            <a href="/register" className="text-brand-600 font-semibold hover:underline">Create one free</a>
          </p>
        </motion.div>
      ) : (
        <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">6-digit code</label>
            <p className="text-xs text-slate-400 mb-3">Sent to <span className="font-semibold text-slate-600">{email}</span></p>
            <input
              className={otpInputCls}
              placeholder="• • • • • •"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={e => e.key === "Enter" && code.length === 6 && verify()}
              autoFocus
            />
          </div>
          {error && <ErrBox msg={error} />}
          <button
            onClick={verify}
            disabled={isPending || code.length !== 6}
            className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying…</span>
            ) : "Sign In ✓"}
          </button>
          <button onClick={() => { setStep("email"); setCode(""); setError(null); }} className="w-full text-xs text-slate-400 hover:text-slate-600 transition text-center">
            ← Different email
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Admin panel ──────────────────────────────────────────────────────────────
function AdminPanel() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const login = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await authClient.signIn.email({ email, password, callbackURL: "/dashboard" });
        if (result.error) { setError(result.error.message ?? "Invalid credentials"); }
        else { addToast({ type: "success", title: "Welcome, Admin!" }); router.push("/dashboard"); }
      } catch { setError("Login failed. Check your credentials."); }
    });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Admin email</label>
        <input type="email" placeholder="admin@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} className={inputCls} autoFocus />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className={`${inputCls} pr-10`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {error && <ErrBox msg={error} />}
      <button
        onClick={login}
        disabled={isPending || !email || !password}
        className="w-full rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</span>
        ) : "Sign In →"}
      </button>
    </motion.div>
  );
}

// ─── Main login page ──────────────────────────────────────────────────────────
function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";
  const [tab, setTab] = useState<Tab>("customer");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 via-white to-sky-50">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 items-center justify-center">
        {/* Background orbs */}
        <div className="absolute top-1/4 -left-12 w-72 h-72 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-12 w-72 h-72 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwaDQydjQySDE4QzI3Ljk0IDQyIDM2IDMzLjk0IDM2IDI0VjE4eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-40" />

        <div className="relative z-10 px-12 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-3xl mb-6">
              🎮
            </div>
            <h1 className="text-4xl font-black leading-tight">ShopXR<br /></h1>
            <p className="text-brand-200 mt-3 text-lg font-medium">Post-Purchase Rewards Platform</p>
          </div>

          <div className="space-y-4">
            {[
              { icon: "🎯", title: "Earn Credits", desc: "Get rewarded on every purchase" },
              { icon: "🎲", title: "Play Games",   desc: "Spin, scratch & win exciting prizes" },
              { icon: "🏆", title: "Claim Prizes", desc: "Redeem rewards at any store" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xl shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-brand-300 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: login card */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-600 items-center justify-center text-2xl shadow-glow-brand mb-3">
              🎮
            </div>
            <h1 className="text-2xl font-black text-slate-900">ShopXR</h1>
            <p className="text-slate-500 text-sm mt-1">Post-Purchase Rewards Platform</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-7">
              <TabPill active={tab === "customer"} onClick={() => setTab("customer")} label="Customer" />
              <TabPill active={tab === "admin"}    onClick={() => setTab("admin")}    label="Admin" />
            </div>

            {/* Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {tab === "customer"
                  ? <CustomerPanel from={from} />
                  : <AdminPanel />
                }
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
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
