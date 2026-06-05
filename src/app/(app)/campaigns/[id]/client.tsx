"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores";
import {
  updatePrizeAction,
  addPrizeToCampaignAction,
  updateCampaignAction,
} from "@/actions/campaigns/campaign-actions";
import Link from "next/link";
import { RequiredIcon } from "@/components/shared/RequiredIcon";
import { GAME_LABELS, PRIZE_CONFIG, PRIZE_LABELS } from "@/constants";
import { capitalize } from "@/lib/utils";

interface Prize {
  id: string;
  name: string;
  type: number;
  value: string | null;
  winningProbability: {
    mode: string;
    value: number;
  };
  isActive: boolean;
}

interface Campaign {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  creditsPerUnit: number;
  gameType: number;
  prizes: Prize[];
  _count: { qrCodes: number; gamePlays: number };
  status: number;
}

function statusInfo(campaign: Campaign) {
  if (campaign.status === 2) {
    return { label: "Draft", cls: "bg-yellow-100 text-yellow-700" };
  }

  const now = new Date();
  const start = new Date(campaign.startDate);
  const end = campaign.endDate ? new Date(campaign.endDate) : null;

  if (start > now) {
    return { label: "Upcoming", cls: "bg-blue-100 text-blue-600" };
  }

  // No end date = ongoing campaign
  if (!end) {
    return { label: "Active", cls: "bg-green-100 text-green-700" };
  }

  if (end >= now) {
    return { label: "Active", cls: "bg-green-100 text-green-700" };
  }

  return { label: "Ended", cls: "bg-slate-100 text-slate-500" };
}

// ─── Edit Campaign Form ───────────────────────────────────────────────────────
function EditCampaignForm({ campaign, onSaved }: { campaign: Campaign; onSaved: () => void }) {
  const { addToast } = useUIStore();
  const [isPending, startTransition] = useTransition();

  // Convert Date to datetime-local string
  const toDatetimeLocal = (d: Date) =>
    new Date(d.getTime() - new Date(d).getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [form, setForm] = useState({
    name: campaign.name,
    startDate: toDatetimeLocal(new Date(campaign.startDate)),
    endDate: campaign.endDate ? toDatetimeLocal(new Date(campaign.endDate)) : "",
    creditsPerUnit: String(campaign.creditsPerUnit),
    gameType: campaign.gameType,
    status: campaign.status,
  });

  const dateOk = !form.endDate || new Date(form.endDate) > new Date(form.startDate);

  const save = () => {
    if (!dateOk) return;
    startTransition(async () => {
      const result = await updateCampaignAction({
        id: campaign.id,
        name: form.name,
        startDate: new Date(form.startDate),
        endDate: form.endDate ? new Date(form.endDate) : null,
        creditsPerUnit: Number(form.creditsPerUnit),
        gameType: form.gameType,
        status: form.status,
      });
      if ("error" in result && result.error) {
        addToast({ type: "error", title: "Error", message: result.error as string });
      } else {
        addToast({ type: "success", title: "Campaign updated!" });
        onSaved();
      }
    });
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition";

  return (
    <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="font-bold text-slate-900">Edit Campaign</h2>

      {/* Name & Description */}
      <div className="grid gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
            Name <RequiredIcon />
          </label>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
            Start Date <RequiredIcon />
          </label>
          <input
            className={inputCls}
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
            End Date <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>
          <input
            className={`${inputCls} ${form.endDate && !dateOk ? "border-red-300" : ""}`}
            type="datetime-local"
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          />
          {form.endDate && !dateOk && (
            <p className="mt-1 text-xs text-red-500">End date must be after start date</p>
          )}
        </div>
      </div>

      {/* Credits */}
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
            value={form.creditsPerUnit}
            onChange={(e) => setForm((f) => ({ ...f, creditsPerUnit: e.target.value }))}
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          $549 → {Math.floor(549 / Number(form.creditsPerUnit || 1))} credits
        </p>
      </div>

      {/* Game Type */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
          Active Game
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[1, 2, 3, 4, 5].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm((f) => ({ ...f, gameType: g }))}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition ${
                form.gameType === g
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {GAME_LABELS[g]}
            </button>
          ))}
        </div>
      </div>

      {/* Status toggle */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500">
          Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: s }))}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                form.status === s
                  ? s === 2
                    ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                    : "border-green-400 bg-green-50 text-green-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              {s === 2 ? "Draft" : "Active"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {form.status === 2
            ? "Draft campaigns are hidden from customers and cannot receive QR scans."
            : "Active campaigns show customers and status is calculated from start/end dates."}
        </p>
      </div>

      <button
        onClick={save}
        disabled={isPending || !form.name || !form.creditsPerUnit || !dateOk}
        className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Saving…
          </span>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}

// ─── Inline Prize Edit Row ────────────────────────────────────────────────────
function PrizeRow({
  prize,
  allPrizes,
  onSaved,
}: {
  prize: Prize;
  allPrizes: Prize[];
  onSaved: () => void;
}) {
  const { addToast } = useUIStore();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: prize.name,
    type: prize.type,
    value: prize.value ?? "",
    winningProbability: {
      mode: prize.winningProbability.mode as "PERCENTAGE" | "CREDIT_COUNT",
      value: prize.winningProbability.value,
    },
  });

  const percentageTotal = allPrizes
    .filter((p) => p.winningProbability.mode === "PERCENTAGE")
    .reduce((sum, p) => sum + (Number(p.winningProbability.value) || 0), 0);

  const isValidTotal =
    Math.abs(percentageTotal - 100) < 0.01 ||
    allPrizes.filter((p) => p.winningProbability.mode === "PERCENTAGE").length === 0;

  const save = () => {
    if (!isValidTotal) {
      addToast({
        type: "error",
        title: "Invalid probability distribution",
        message: `Total percentage must equal 100% (currently ${percentageTotal.toFixed(1)}%)`,
      });
      return;
    }

    startTransition(async () => {
      const result = await updatePrizeAction({
        id: prize.id,
        name: form.name,
        type: form.type,
        value: form.type !== 4 ? form.value || undefined : undefined,
        probabilityMode: form.winningProbability.mode,
        probabilityValue: Number(form.winningProbability.value),
      });
      if ("error" in result && result.error) {
        addToast({ type: "error", title: "Error", message: result.error as string });
      } else {
        addToast({ type: "success", title: "Prize updated" });
        setEditing(false);
        onSaved();
      }
    });
  };

  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition";

  return (
    <div
      className={`rounded-xl border transition ${editing ? "border-brand-300 bg-brand-50/30" : "border-slate-100 bg-white"} p-4`}
    >
      {!editing ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-2xl">
              {PRIZE_CONFIG[PRIZE_LABELS[prize.type]].icon ?? "🎁"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{prize.name}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {PRIZE_LABELS[prize.type]}
                </span>
                {prize.value && (
                  <span className="max-w-[120px] truncate text-xs text-slate-400">
                    {prize.value}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {prize.winningProbability.mode === "PERCENTAGE"
                    ? `${prize.winningProbability.value}% chance`
                    : `Every ${prize.winningProbability.value}th play`}
                </span>
              </div>
            </div>
          </div>
          {/* <button
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-100 hover:text-brand-700"
          >
            Edit
          </button> */}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
              Editing Prize
            </p>
            <button
              onClick={() => setEditing(false)}
              className="text-lg leading-none text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>

          <input
            className={inputCls}
            placeholder="Prize name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
                  form.type === t
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {PRIZE_LABELS[t]}
              </button>
            ))}
          </div>

          {form.type !== 4 && (
            <input
              className={inputCls}
              placeholder={
                form.type === 1
                  ? "Coupon code"
                  : form.type === 2
                    ? "Product name"
                    : "Prize description"
              }
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            />
          )}

          <div className="grid grid-cols-2 gap-2">
            {(["PERCENTAGE", "CREDIT_COUNT"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm((f) => ({ ...f, probabilityMode: m }))}
                className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
                  form.winningProbability.mode === m
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {m === "PERCENTAGE" ? "Percentage" : "Every N-th Play"}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              className={inputCls}
              type="number"
              min="0.01"
              placeholder={
                form.winningProbability.mode === "PERCENTAGE"
                  ? "% chance (e.g. 10)"
                  : "Every N-th play (e.g. 50)"
              }
              value={form.winningProbability.value}
              onChange={(e) => setForm((f) => ({ ...f, probabilityValue: e.target.value }))}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              {form.winningProbability.mode === "PERCENTAGE" ? "%" : "plays"}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={isPending || !form.name || !form.winningProbability.value}
              className="flex-1 rounded-xl bg-brand-600 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-xl border border-slate-200 px-4 text-sm text-slate-500 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Prize Form ───────────────────────────────────────────────────────────
function AddPrizeForm({
  campaignId,
  currentPrizes,
  onAdded,
}: {
  campaignId: string;
  currentPrizes: Prize[];
  onAdded: () => void;
}) {
  const { addToast } = useUIStore();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    type: 2,
    value: "",
    winningProbability: {
      mode: "PERCENTAGE" as "PERCENTAGE" | "CREDIT_COUNT",
      value: "",
    },
  });

  const existingPct = currentPrizes
    .filter((p) => p.winningProbability.mode === "PERCENTAGE")
    .reduce((s, p) => s + p.winningProbability.value, 0);

  const newPrizePct =
    form.winningProbability.mode === "PERCENTAGE" ? Number(form.winningProbability.value) || 0 : 0;

  const projectedTotal = existingPct + newPrizePct;
  const pctWouldExceed = form.winningProbability.mode === "PERCENTAGE" && projectedTotal > 100.001;
  const pctWouldComplete =
    form.winningProbability.mode === "PERCENTAGE" && Math.abs(projectedTotal - 100) < 0.01;

  // Block submit if adding this prize would make pct exceed 100
  // OR if existing pct prizes don't add up to 100 after adding this one
  const canSubmit =
    form.name &&
    form.winningProbability.value &&
    !isPending &&
    !pctWouldExceed &&
    (form.winningProbability.mode === "CREDIT_COUNT" || pctWouldComplete);

  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition";

  const submit = () => {
    startTransition(async () => {
      const result = await addPrizeToCampaignAction(campaignId, {
        name: form.name,
        type: form.type,
        value: form.type !== 4 ? form.value || undefined : undefined,
        probabilityMode: form.winningProbability.mode,
        probabilityValue: Number(form.winningProbability.value),
      });
      if ("error" in result && result.error) {
        addToast({ type: "error", title: "Error", message: result.error as string });
      } else {
        addToast({ type: "success", title: "Prize added!" });
        setForm({
          name: "",
          type: 2,
          value: "",
          winningProbability: {
            mode: "PERCENTAGE",
            value: "",
          },
        });
        onAdded();
      }
    });
  };

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Add New Prize</p>
      <input
        className={inputCls}
        placeholder="Prize name *"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: t }))}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
              form.type === t
                ? "border-brand-400 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            {PRIZE_LABELS[t]}
          </button>
        ))}
      </div>
      {form.type !== 4 && (
        <input
          className={inputCls}
          placeholder={
            form.type === 2 ? "Coupon code" : form.type === 3 ? "Product name" : "Description"
          }
          value={form.value}
          onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
        />
      )}
      {form.winningProbability.mode === "PERCENTAGE" && form.winningProbability.value && (
        <p
          className={`mt-1 text-xs ${
            pctWouldExceed ? "text-red-500" : pctWouldComplete ? "text-green-600" : "text-slate-400"
          }`}
        >
          {pctWouldExceed
            ? `Exceeds 100% (current total: ${existingPct.toFixed(1)}%, this would add ${newPrizePct}%)`
            : pctWouldComplete
              ? "✓ Probabilities will total exactly 100%"
              : `Running total after adding: ${projectedTotal.toFixed(1)}% (need 100%)`}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {(["PERCENTAGE", "CREDIT_COUNT"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setForm((f) => ({ ...f, probabilityMode: m }))}
            className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
              form.winningProbability.mode === m
                ? "border-brand-400 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            {m === "PERCENTAGE" ? "Percentage" : "Every N-th"}
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          className={inputCls}
          type="number"
          min="0.01"
          placeholder={
            form.winningProbability.mode === "PERCENTAGE" ? "% (e.g. 10)" : "Every N-th play"
          }
          value={form.winningProbability.value}
          onChange={(e) => setForm((f) => ({ ...f, probabilityValue: e.target.value }))}
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {form.winningProbability.mode === "PERCENTAGE" ? "%" : "plays"}
        </span>
      </div>
      <button
        onClick={submit}
        disabled={isPending || !form.name || !form.winningProbability.value || !canSubmit}
        className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
      >
        {isPending ? "Adding…" : "+ Add Prize"}
      </button>
    </div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────
export function CampaignDetailClient({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showAddPrize, setShowAddPrize] = useState(false);
  const { label: statusLabel, cls: statusCls } = statusInfo(campaign);

  const pctPrizes = campaign.prizes.filter((p) => p.winningProbability.mode === "PERCENTAGE");
  const pctTotal = pctPrizes.reduce((s, p) => s + p.winningProbability.value, 0);
  const pctOk = pctPrizes.length === 0 || Math.abs(pctTotal - 100) < 0.01;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">{campaign.name}</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusCls}`}>
              {statusLabel}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* <button
            onClick={() => setShowEdit((s) => !s)}
            className={`rounded-xl px-3 py-1.5 text-sm font-bold transition ${
              showEdit
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-brand-50 text-brand-600 hover:bg-brand-100"
            }`}
          >
            {showEdit ? "× Discard" : "Edit"}
          </button> */}
          <Link
            href="/campaigns"
            className="text-sm text-slate-400 transition hover:text-slate-700"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Edit form (collapsible) */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <EditCampaignForm
              campaign={campaign}
              onSaved={() => {
                setShowEdit(false);
                router.refresh();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats grid */}
      {!showEdit && (
        <Fragment>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "QRs Generated", value: campaign._count.qrCodes },
              { label: "Game Plays", value: campaign._count.gamePlays },
              { label: "Prizes", value: campaign.prizes.length },
              { label: "Credit Rate", value: `$${campaign.creditsPerUnit}`, suffix: "/credit" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <p className="text-2xl font-black text-slate-900">
                  {s.value}
                  <span className="text-xs font-normal text-slate-400">{s.suffix}</span>
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Details card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">Details</h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="mb-1 text-xs font-semibold tracking-wide text-slate-400">
                  Start Date
                </dt>
                <dd className="font-semibold text-slate-800">
                  {new Date(campaign.startDate).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold tracking-wide text-slate-400">
                  End Date
                </dt>
                <dd
                  className={`${campaign.endDate ? "font-semibold text-slate-800" : "font-normal text-slate-400"}`}
                >
                  {campaign.endDate ? new Date(campaign.endDate).toLocaleString() : "Not Set"}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold tracking-wide text-slate-400">
                  Active Game
                </dt>
                <dd className="font-semibold text-slate-800">
                  {capitalize(GAME_LABELS[campaign.gameType])}
                </dd>
              </div>
            </dl>
          </div>

          {/* Prizes section */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                Prizes
                {pctPrizes.length > 0 && (
                  <span
                    className={`ml-1 rounded-full px-2.5 py-1 text-xs font-bold ${pctOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                  >
                    {pctTotal.toFixed(1)}% {pctOk ? "" : "≠ 100%"}
                  </span>
                )}
              </h2>
              {/* <button
                onClick={() => setShowAddPrize((s) => !s)}
                className="rounded-xl bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-600 transition hover:bg-brand-100 hover:text-brand-700"
              >
                {showAddPrize ? "× Cancel" : "+ Add Prize"}
              </button> */}
            </div>

            {/* <p className="mb-5 text-xs text-slate-400">Editing a prize only affects future wins.</p> */}

            {!pctOk && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
                ⚠️ Percentage prizes sum to {pctTotal.toFixed(1)}% — they must total 100% for fair
                odds.
              </div>
            )}

            {campaign.prizes.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">
                No prizes yet. Add one above.
              </p>
            ) : (
              <div className="space-y-3">
                {campaign.prizes.map((p) => (
                  <PrizeRow
                    key={p.id}
                    prize={p}
                    allPrizes={campaign.prizes}
                    onSaved={() => router.refresh()}
                  />
                ))}
              </div>
            )}

            <AnimatePresence>
              {showAddPrize && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <AddPrizeForm
                    campaignId={campaign.id}
                    currentPrizes={campaign.prizes}
                    onAdded={() => {
                      setShowAddPrize(false);
                      router.refresh();
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Fragment>
      )}
    </div>
  );
}
