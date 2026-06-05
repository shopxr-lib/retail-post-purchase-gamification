"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { registerCustomer, verifyOTPAndLogin } from "@/actions/auth/customer-actions";
import { useUIStore } from "@/stores";

type Step = "details" | "otp";

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const btnPrimary =
  "w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRegister = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("email", email);
      fd.set("phone", phone);

      const result = await registerCustomer(fd);
      if ("error" in result && result.error) {
        setError(result.error);
      } else if (result.success) {
        setIdentifier(result.identifier as string);
        setStep("otp");
        addToast({ type: "info", title: "Code sent!", message: `Check your email: ${email}` });
      }
    });
  };

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("identifier", identifier);
      fd.set("code", code);
      fd.set("purpose", "REGISTER");

      const result = await verifyOTPAndLogin(fd);
      if (result.error) {
        setError(result.error);
      } else {
        addToast({ type: "success", title: "Welcome!", message: "Account created successfully." });
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-border shadow-card p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "details" ? "Join the rewards programme" : `Enter the code sent to ${identifier}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "details" ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-3"
              >
                <input className={inputCls} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className={inputCls} placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className={inputCls} placeholder="Phone number (e.g. +601234567890)" value={phone} onChange={(e) => setPhone(e.target.value)} />

                {error && (
                  <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button onClick={handleRegister} disabled={isPending || !name || !email || !phone} className={btnPrimary}>
                  {isPending ? "Sending code…" : "Continue"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-3"
              >
                <input
                  className={`${inputCls} text-center text-2xl tracking-widest font-mono`}
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />

                {error && (
                  <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button onClick={handleVerify} disabled={isPending || code.length !== 6} className={btnPrimary}>
                  {isPending ? "Verifying…" : "Create Account"}
                </button>

                <button onClick={() => setStep("details")} className="w-full text-xs text-muted-foreground hover:text-foreground transition">
                  ← Back
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-brand-600 font-medium hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
