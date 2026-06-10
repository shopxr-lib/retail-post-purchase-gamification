"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createCampaignAction } from "@/actions/campaigns/campaign-actions";
import { useUIStore } from "@/stores";
import { RequiredIcon } from "@/components/shared/RequiredIcon";
import Link from "next/link";
import { GAME_LABELS, PRIZE_LABELS, PRIZE_TYPES } from "@/constants";

interface PrizeForm {
  id: string;
  name: string;
  type: number;
  value: string;
  winningProbability: {
    mode: "PERCENTAGE" | "CREDIT_COUNT",
    value: string
  };
}

function PrizeCard({
  prize,
  index,
  onUpdate,
  onRemove,
  totalPct,
}: {
  prize: PrizeForm;
  index: number;
  onUpdate: (id: string, field: string, val: string | number) => void;
  onRemove: (id: string) => void;
  totalPct: number;
}) {
  const pt = PRIZE_TYPES.find((p) => p.value === prize.type);

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600">
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-slate-700">Prize {index + 1}</span>
        </div>
        <button
          onClick={() => onRemove(prize.id)}
          className="text-lg leading-none text-slate-300 transition hover:text-red-400"
        >
          ×
        </button>
      </div>

      <div className="grid gap-3">
        {/* Prize Name */}
        <div>
          <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-500">
            Name <RequiredIcon />
          </label>
          <input
            className={inputCls}
            placeholder="e.g. Grand Prize"
            value={prize.name}
            onChange={(e) => onUpdate(prize.id, "name", e.target.value as string)}
          />
        </div>

        {/* Prize Type */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
            Type <RequiredIcon />
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[1,2,3,4].map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => onUpdate(prize.id, "type", pt)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  prize.type === pt
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {PRIZE_LABELS[pt]}
              </button>
            ))}
          </div>
        </div>

        {/* Value (not for EMPTY) */}
        {prize.type !== 4 && (
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-500">
              {prize.type === 2
                ? "Coupon Code"
                : prize.type === 3
                  ? "Product Name"
                  : "Prize Details"}
            </label>
            <input
              className={inputCls}
              placeholder={pt?.placeholder ?? ""}
              value={prize.value}
              onChange={(e) => onUpdate(prize.id, "value", e.target.value)}
            />
          </div>
        )}

        {/* Probability Mode */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
            Win Probability Mode <RequiredIcon />
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { value: "PERCENTAGE", label: "Winning Percentage", desc: "% chance per play" },
              { value: "CREDIT_COUNT", label: "Credit Based Count", desc: "Win on Nth game" },
            ].map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => onUpdate(prize.id, "probabilityMode", m.value)}
                className={`flex flex-col items-start rounded-xl border px-3 py-2.5 text-xs transition ${
                  prize.winningProbability.mode === m.value
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                <span className="font-semibold">{m.label}</span>
                <span className="mt-0.5 text-[10px] opacity-70">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Probability Value */}
        <div>
          <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-500">
            {prize.winningProbability.mode === "PERCENTAGE" ? "Probability %" : "N-th Play wins"}
          </label>
          <div className="relative">
            <input
              className={inputCls}
              type="number"
              min="0.01"
              step={prize.winningProbability.mode === "PERCENTAGE" ? "0.1" : "1"}
              placeholder={prize.winningProbability.mode === "PERCENTAGE" ? "e.g. 10.5" : "e.g. 100"}
              value={prize.winningProbability.value}
              onChange={(e) => onUpdate(prize.id, "probabilityValue", e.target.value)}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              {prize.winningProbability.mode === "PERCENTAGE" ? "%" : "plays"}
            </span>
          </div>
          {prize.winningProbability.mode === "CREDIT_COUNT" && prize.winningProbability.value && (
            <p className="mt-1 text-[11px] text-slate-400">
              {prize.winningProbability.value}th game play wins this prize automatically
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function NewCampaignClient() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: 2,
    creditsPerUnit: "100",
    gameType: 1,
  });

  const [prizes, setPrizes] = useState<PrizeForm[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      type: 2,
      value: "",
      winningProbability: {
        mode: "PERCENTAGE",
        value: ""
      }
    },
  ]);

  const setField = (f: string, v: string | number) => setForm((prev) => ({ ...prev, [f]: v }));

  const addPrize = () =>
    setPrizes((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        name: "",
        type: 2,
        value: "",
        winningProbability: {
          mode: "PERCENTAGE",
          value: ""
        }
      },
    ]);

  const updatePrize = (id: string, field: string, val: string | number) =>
    setPrizes((p) =>
      p.map((pr) => {
        if (pr.id !== id) return pr;
        // handle nested winningProbability fields
        if (field === "probabilityMode") {
          return {
            ...pr,
            winningProbability: { ...(pr.winningProbability || {}), mode: String(val) as "PERCENTAGE" | "CREDIT_COUNT" },
          };
        }
        if (field === "probabilityValue") {
          return {
            ...pr,
            winningProbability: { ...(pr.winningProbability || {}), value: String(val) },
          };
        }

        return { ...pr, [field]: val } as PrizeForm;
      })
    );

  const removePrize = (id: string) => setPrizes((p) => p.filter((pr) => pr.id !== id));

  // Running percentage total
  const pctTotal = prizes
    .filter((p) => p.winningProbability.mode === "PERCENTAGE")
    .reduce((s, p) => s + (Number(p.winningProbability.value) || 0), 0);

  const pctOk =
    Math.abs(pctTotal - 100) < 0.01 ||
    prizes.filter((p) => p.winningProbability.mode === "PERCENTAGE").length === 0;

  const dateOk = useMemo(() => {
    if (!form.startDate) return true;
    if (!form.endDate) return true;

    return new Date(form.endDate) > new Date(form.startDate);
  }, [form.startDate, form.endDate]);

  const isValid = useMemo(() => {
    const hasRequiredFields =
      form.name &&
      form.startDate &&
      form.creditsPerUnit;

    const validEndDate =
      !form.startDate ||
      !form.endDate ||
      new Date(form.endDate).getTime() > new Date(form.startDate).getTime();

    const validPrizes =
      prizes.length > 0 &&
      prizes.every((p) => p.name && p.winningProbability.value);

    return Boolean(
      hasRequiredFields &&
      validEndDate &&
      validPrizes &&
      pctOk &&
      dateOk
    );
  }, [form.name, form.startDate, form.endDate, form.creditsPerUnit, prizes, pctOk, dateOk]);

  const handleSubmit = () => {
    if (!pctOk) {
      addToast({
        type: "error",
        title: "Probability error",
        message: `Percentages sum to ${pctTotal.toFixed(1)}%, must be 100%`,
      });
      return;
    }
    startTransition(async () => {
      const result = await createCampaignAction({
        name: form.name,
        startDate: form.startDate ? new Date(form.startDate) : null,
        endDate: form.endDate ? new Date(form.endDate) : null,
        creditsPerUnit: Number(form.creditsPerUnit),
        gameType: form.gameType,
        prizes: prizes.map((p) => ({
          name: p.name,
          type: p.type,
          value: p.type !== 4 ? p.value || undefined : undefined,
          probabilityMode: p.winningProbability.mode,
          probabilityValue: Number(p.winningProbability.value),
        })),
      });

      if ("error" in result && result.error) {
        addToast({ type: "error", title: "Error", message: result.error as string });
      } else if (result.success) {
        addToast({ type: "success", title: "Campaign created! 🎉" });
        router.push(`/campaigns/${result.campaignId}`);
      }
    });
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/campaigns" className="text-sm text-slate-400 transition hover:text-slate-700">
          ← Back
        </Link>
        <h1 className="text-2xl font-black text-slate-900">New Campaign</h1>
      </div>

      {/* Section: Details */}
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
          Campaign Details
        </h2>
        <div className="grid gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
              Name <RequiredIcon />
            </label>
            <input
              className={inputCls}
              placeholder="e.g. Summer 2026 Rewards"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Section: Status */}
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">Status</h2>
        <select
          className={inputCls}
          value={form.status}
          onChange={(e) => setField("status", e.target.value)}
        >
          <option value={1}>Active</option>
          <option value={2}>Draft</option>
        </select>
      </section>

      {/* Section: Dates */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
          Active Period
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
              Start Date <RequiredIcon />
            </label>
            <input
              className={inputCls}
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setField("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
              End Date
            </label>
            <input
              className={`${inputCls} ${!dateOk ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : ""}`}
              type="datetime-local"
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={(e) => setField("endDate", e.target.value)}
            />
            {!dateOk && (
              <p className="mt-1 text-xs text-red-500">End date must be after start date</p>
            )}
          </div>
        </div>
      </section>

      {/* Section: Credits */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
          Credit Settings
        </h2>
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
            $ Amount per Credit <RequiredIcon />
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              $
            </span>
            <input
              className={`${inputCls} pl-8`}
              type="number"
              min="1"
              placeholder="e.g. 100"
              value={form.creditsPerUnit}
              onChange={(e) => setField("creditsPerUnit", e.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Example:{" "}
            <span className="font-semibold text-slate-600">${form.creditsPerUnit || 100}</span>{" "}
            spent = 1 credit. $549 order →{" "}
            <span className="font-semibold text-brand-600">
              {Math.floor(549 / Number(form.creditsPerUnit || 100))} credits
            </span>
          </p>
        </div>
      </section>

      {/* Section: Game */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">Active Game</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[1,2,3,4,5].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setField("gameType", g)}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition ${
                form.gameType === g
                  ? "border-brand-400 bg-brand-50 text-brand-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {GAME_LABELS[g]}
            </button>
          ))}
        </div>
      </section>

      {/* Section: Prizes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
            Prizes
            {prizes.filter((p) => p.winningProbability.mode === "PERCENTAGE").length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  pctOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}
              >
                {pctTotal.toFixed(1)}% {pctOk ? "✓" : "≠ 100%"}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={addPrize}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            <span className="text-lg leading-none">+</span> Add Prize
          </button>
        </div>

        <AnimatePresence>
          {prizes.map((prize, i) => (
            <PrizeCard
              key={prize.id}
              prize={prize}
              index={i}
              onUpdate={updatePrize}
              onRemove={removePrize}
              totalPct={pctTotal}
            />
          ))}
        </AnimatePresence>

        {!pctOk && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-500">
            ⚠️ Percentage-mode prizes must total exactly 100%. Currently: {pctTotal.toFixed(1)}%
          </p>
        )}
      </section>

      <button
        onClick={handleSubmit}
        disabled={isPending || !isValid}
        className="w-full rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-4 text-base font-bold text-white shadow-xl shadow-brand-500/25 transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Creating campaign…
          </span>
        ) : (
          "Create Campaign →"
        )}
      </button>
    </div>
  );
}
