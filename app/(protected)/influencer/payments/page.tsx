"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  ArrowDownToLine,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Banknote,
  Landmark,
  ChevronRight,
} from "lucide-react";
import { formatMoneyFromCents } from "@/lib/money";
import {
  formatDzdCardLabelFromCents,
  formatDzdCompactOrFullFromCents,
} from "@/lib/format/currency-display";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LazyMotion, domAnimation, m } from "framer-motion";

/* ── Types ───────────────────────────────────────────────────── */

type PayoutRow = {
  id: string;
  amount: number;
  status: string;
  campaign_name: string;
  brand_name: string;
  brand_logo: string | null;
  created_at: string | null;
};

type WithdrawalRow = {
  id: string;
  amount: number;
  status: string;
  ccp_number: string;
  ccp_key: string | null;
  full_name: string;
  admin_note: string | null;
  processed_at: string | null;
  created_at: string | null;
};

type Tab = "earnings" | "withdrawals";

/* ── Helpers ─────────────────────────────────────────────────── */

function fmtDate(ts: string | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_BADGE: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  paid: {
    label: "Paid",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "text-blue-700",
    bg: "bg-blue-50",
    icon: Loader2,
  },
  sent: {
    label: "Sent",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-50",
    icon: XCircle,
  },
};

/* ── Component ───────────────────────────────────────────────── */

export default function InfluencerPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingWithdrawalCount, setPendingWithdrawalCount] = useState(0);
  const [pendingWithdrawalAmount, setPendingWithdrawalAmount] = useState(0);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("earnings");
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Withdrawal form
  const [wAmount, setWAmount] = useState("");
  const [wCcpNumber, setWCcpNumber] = useState("");
  const [wCcpKey, setWCcpKey] = useState("");
  const [wFullName, setWFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── Fetch ──────────────────────────────────────────────────── */

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/influencer-overview");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.error ?? "Failed to load wallet");
        return;
      }
      setBalance(Number(json.balance ?? 0));
      setTotalEarned(Number(json.totalEarned ?? 0));
      setPendingWithdrawalCount(Number(json.pendingWithdrawalCount ?? 0));
      setPendingWithdrawalAmount(Number(json.pendingWithdrawalAmount ?? 0));
      setPayouts((json.payouts ?? []) as PayoutRow[]);
      setWithdrawals((json.withdrawals ?? []) as WithdrawalRow[]);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* ── Submit withdrawal ─────────────────────────────────────── */

  const submitWithdrawal = async () => {
    const amount = Math.round(Number(wAmount) * 100); // convert DZD major → cents
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amount > balance) {
      toast.error("Amount exceeds your wallet balance");
      return;
    }
    if (!wCcpNumber.trim()) {
      toast.error("CCP number is required");
      return;
    }
    if (!wFullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          ccp_number: wCcpNumber.trim(),
          ccp_key: wCcpKey.trim() || null,
          full_name: wFullName.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Failed to submit");

      toast.success("Withdrawal request submitted successfully");
      setWithdrawOpen(false);
      setWAmount("");
      setWCcpNumber("");
      setWCcpKey("");
      setWFullName("");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to submit withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Derived ────────────────────────────────────────────────── */

  const paidCount = useMemo(
    () => payouts.filter((p) => p.status === "paid").length,
    [payouts],
  );

  /* ── Render ─────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#1a1aff]" />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="w-full space-y-6">
        {/* ── Page title ───────────────────────────────────────── */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-black text-gray-900">
            Payments & Wallet
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Track your earnings and manage withdrawals
          </p>
        </m.div>

        {/* ── Summary cards ────────────────────────────────────── */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-4"
        >
          {/* Card 1 — Wallet Balance */}
          <div
            className="flex-1 min-w-[260px] flex flex-col justify-between rounded-2xl bg-white px-5 py-5"
            style={{
              border: "1px solid #e5e7eb",
              borderTop: "4px solid #1a1aff",
              boxShadow:
                "0 0 0 1px rgba(26,26,255,0.08), 0 0 16px 2px rgba(26,26,255,0.15), 0 2px 8px 0 rgba(26,26,255,0.08)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a1aff] text-white">
                <Wallet size={14} />
              </span>
              <p className="text-xs font-semibold text-gray-600">
                Available Balance
              </p>
            </div>
            <p className="mt-3 text-2xl font-black leading-tight text-gray-900 tabular-nums">
              {formatDzdCardLabelFromCents(balance)}
            </p>
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
              disabled={balance <= 0}
              className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#1a1aff] hover:underline disabled:text-gray-300 disabled:no-underline"
            >
              <ArrowDownToLine size={14} /> Request Withdrawal
            </button>
          </div>

          {/* Card 2+3 — Merged: Total Earned | Pending */}
          <div className="flex flex-1 divide-x divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Section — Total Earned */}
            <div className="flex flex-col justify-center px-5 py-5 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                  <TrendingUp size={11} />
                </span>
                <p className="text-xs text-gray-500">Total Earned</p>
              </div>
              <div className="flex items-center gap-2.5">
                <p className="text-2xl font-black leading-tight text-gray-900 tabular-nums">
                  {formatDzdCardLabelFromCents(totalEarned)}
                </p>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {paidCount} paid
                </span>
              </div>
            </div>

            {/* Section — Pending Withdrawals */}
            <div className="flex flex-col justify-center px-5 py-5 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                  <Clock size={11} />
                </span>
                <p className="text-xs text-gray-500">Pending Withdrawals</p>
              </div>
              <div className="flex items-center gap-2.5">
                <p className="text-2xl font-black leading-tight text-gray-900 tabular-nums">
                  {pendingWithdrawalCount}
                </p>
                {pendingWithdrawalAmount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    {formatDzdCompactOrFullFromCents(pendingWithdrawalAmount)}{" "}
                    DZD
                  </span>
                )}
              </div>
            </div>
          </div>
        </m.div>

        {/* ── Tabs + Table ─────────────────────────────────────── */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-gray-100 px-4 pt-3">
            {(
              [
                {
                  key: "earnings" as Tab,
                  label: "Earnings",
                  count: payouts.length,
                },
                {
                  key: "withdrawals" as Tab,
                  label: "Withdrawals",
                  count: withdrawals.length,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative px-4 pb-3 pt-1 text-sm font-semibold transition-colors",
                  activeTab === tab.key
                    ? "text-[#1a1aff]"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    activeTab === tab.key
                      ? "bg-[#1a1aff]/10 text-[#1a1aff]"
                      : "bg-gray-100 text-gray-500",
                  )}
                >
                  {tab.count}
                </span>
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#1a1aff]" />
                )}
              </button>
            ))}
          </div>

          {/* Table content */}
          <div className="min-h-[300px]">
            {activeTab === "earnings" ? (
              payouts.length === 0 ? (
                <EmptyState
                  icon={Banknote}
                  title="No earnings yet"
                  subtitle="When brands pay you for campaigns, your earnings will appear here."
                />
              ) : (
                <div className="divide-y divide-gray-50">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_1fr_120px_100px_110px] gap-3 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    <span>Campaign</span>
                    <span>Brand</span>
                    <span>Amount</span>
                    <span>Status</span>
                    <span>Date</span>
                  </div>
                  {payouts.map((row) => {
                    const badge = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending;
                    const Icon = badge.icon;
                    return (
                      <div
                        key={row.id}
                        className="grid grid-cols-[1fr_1fr_120px_100px_110px] items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50/50"
                      >
                        <span className="truncate text-sm font-semibold text-gray-800">
                          {row.campaign_name}
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          {row.brand_logo ? (
                            <img
                              src={row.brand_logo}
                              alt=""
                              className="h-5 w-5 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-5 w-5 shrink-0 rounded-md bg-indigo-100" />
                          )}
                          <span className="truncate text-sm text-gray-600">
                            {row.brand_name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">
                          {formatMoneyFromCents(row.amount, "DZD")}
                        </span>
                        <span
                          className={cn(
                            "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                            badge.color,
                            badge.bg,
                          )}
                        >
                          <Icon size={10} />
                          {badge.label}
                        </span>
                        <span className="text-xs text-gray-400 tabular-nums">
                          {fmtDate(row.created_at)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )
            ) : withdrawals.length === 0 ? (
              <EmptyState
                icon={Landmark}
                title="No withdrawals yet"
                subtitle="Request a withdrawal to transfer your balance to your CCP account."
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {/* Table header */}
                <div className="grid grid-cols-[120px_1fr_130px_100px_110px] gap-3 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <span>Amount</span>
                  <span>CCP Number</span>
                  <span>Full Name</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>
                {withdrawals.map((row) => {
                  const badge = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending;
                  const Icon = badge.icon;
                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-[120px_1fr_130px_100px_110px] items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50/50"
                    >
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatMoneyFromCents(row.amount, "DZD")}
                      </span>
                      <span className="text-sm text-gray-600 font-mono">
                        {row.ccp_number}
                        {row.ccp_key ? ` / ${row.ccp_key}` : ""}
                      </span>
                      <span className="truncate text-sm text-gray-600">
                        {row.full_name}
                      </span>
                      <span
                        className={cn(
                          "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                          badge.color,
                          badge.bg,
                        )}
                      >
                        <Icon size={10} />
                        {badge.label}
                      </span>
                      <span className="text-xs text-gray-400 tabular-nums">
                        {fmtDate(row.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </m.div>

        {/* ── Withdrawal Modal ─────────────────────────────────── */}
        {withdrawOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    Request Withdrawal
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Withdraw to your CCP account. Admin will process your
                    request.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !submitting && setWithdrawOpen(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Available balance */}
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#1a1aff]/20 bg-[#1a1aff]/5 px-4 py-3">
                <Wallet size={18} className="text-[#1a1aff]" />
                <div>
                  <p className="text-xs text-gray-500">Available balance</p>
                  <p className="text-lg font-black text-gray-900">
                    {formatDzdCardLabelFromCents(balance)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Amount (DZD)
                  </label>
                  <input
                    value={wAmount}
                    onChange={(e) => setWAmount(e.target.value)}
                    placeholder={`Max: ${formatDzdCompactOrFullFromCents(balance)}`}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1a1aff]/40 focus:ring-2 focus:ring-[#1a1aff]/10"
                  />
                </div>

                {/* CCP Number */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    CCP Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={wCcpNumber}
                    onChange={(e) => setWCcpNumber(e.target.value)}
                    placeholder="e.g. 00799999001234567"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-mono outline-none focus:border-[#1a1aff]/40 focus:ring-2 focus:ring-[#1a1aff]/10"
                  />
                </div>

                {/* CCP Key */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    CCP Key{" "}
                    <span className="font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>
                  <input
                    value={wCcpKey}
                    onChange={(e) => setWCcpKey(e.target.value)}
                    placeholder="e.g. 42"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-mono outline-none focus:border-[#1a1aff]/40 focus:ring-2 focus:ring-[#1a1aff]/10"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Account Holder Name{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={wFullName}
                    onChange={(e) => setWFullName(e.target.value)}
                    placeholder="Full name as on CCP account"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1a1aff]/40 focus:ring-2 focus:ring-[#1a1aff]/10"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawOpen(false)}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void submitWithdrawal()}
                  disabled={submitting}
                  className="rounded-xl bg-[#1a1aff] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1515d4] disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />{" "}
                      Submitting…
                    </span>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </m.div>
          </div>
        )}
      </div>
    </LazyMotion>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Banknote;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
        <Icon size={22} className="text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-600">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}
