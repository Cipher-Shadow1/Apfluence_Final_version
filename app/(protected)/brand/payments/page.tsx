"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Copy,
  CreditCard,
  Loader2,
  Search,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import ProDataGrid, { type DataGridColumn } from "@/components/brand/campaigns/ProDataGrid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDzdCardLabelFromCents, formatDzdCompactOrFullFromCents } from "@/lib/format/currency-display";
import { cn } from "@/lib/utils";

/** Baridi Mob receiver id — optional if you only show CCP; set `NEXT_PUBLIC_BARIDIMOB_RECEIVER_RIP` */
const BARIDIMOB_RECEIVER_RIP =
  process.env.NEXT_PUBLIC_BARIDIMOB_RECEIVER_RIP?.trim() || "— Optional: set NEXT_PUBLIC_BARIDIMOB_RECEIVER_RIP —";

/**
 * Apfluence platform CCP — the account **all brands** send deposits to (not the brand’s own CCP).
 * Replace in production via `NEXT_PUBLIC_APFLUENCE_RECEIVE_CCP`.
 */
const APFLUENCE_PLATFORM_CCP =
  process.env.NEXT_PUBLIC_APFLUENCE_RECEIVE_CCP?.trim() || "007 18492 003905672814 31";

const PAYMENTS_GRID_CAMPAIGN = { id: "brand-payments", name: "Payments" };

const BRAND_BLUE = "#1a1aff";
const BRAND_ORANGE = "#e83b1e";

type PayoutRow = {
  id: string;
  campaign_id: string;
  influencer_id?: string;
  amount: number;
  status: string;
  campaign_name: string;
  influencer_name: string;
  influencer_avatar: string | null;
  payment_method?: string;
  created_at: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  processing: "bg-blue-50 text-blue-800 border-blue-200",
  sent: "bg-emerald-50 text-emerald-800 border-emerald-200",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
};

async function uploadReceiptToCloudinary(file: File): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
  if (!cloud || !preset) {
    throw new Error("Cloudinary is not configured (cloud name / upload preset).");
  }
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const resource = isPdf ? "raw" : "image";
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resource}/upload`, {
    method: "POST",
    body: fd,
  });
  const data = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Receipt upload failed.");
  }
  if (!data.secure_url) throw new Error("Upload did not return a URL.");
  return data.secure_url;
}

function balanceTitleClass(cents: number): string {
  const major = Math.round((Number(cents) || 0) / 100);
  const abs = Math.abs(major);
  if (abs >= 10_000_000) return "text-xl sm:text-2xl md:text-3xl";
  if (abs >= 1_000_000) return "text-2xl sm:text-3xl md:text-4xl";
  return "text-2xl sm:text-3xl md:text-4xl lg:text-5xl";
}

function BrandPaymentsContent() {
  const searchParams = useSearchParams();
  const highlightCampaignId = searchParams.get("campaign");

  const [loading, setLoading] = useState(true);
  const [brandBalance, setBrandBalance] = useState(0);
  const [pendingDepositCount, setPendingDepositCount] = useState(0);
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [fundFile, setFundFile] = useState<File | null>(null);
  const [fundSubmitting, setFundSubmitting] = useState(false);

  const resetAddFundsForm = useCallback(() => {
    setFundAmount("");
    setFundFile(null);
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/brand-overview");
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(typeof payload?.error === "string" ? payload.error : "Failed to load wallet");
        setRows([]);
        return;
      }
      setBrandBalance(Number(payload.brandBalance ?? 0));
      setPendingDepositCount(Number(payload.pendingDepositCount ?? 0));
      setRows(Array.isArray(payload.rows) ? payload.rows : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pay = useCallback(
    async (payoutId: string) => {
      setPayError(null);
      setPayingId(payoutId);
      try {
        const res = await fetch(`/api/wallet/payouts/${payoutId}/pay`, { method: "POST" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setPayError(typeof payload?.error === "string" ? payload.error : "Payment failed");
          toast.error(typeof payload?.error === "string" ? payload.error : "Payment failed");
          return;
        }
        toast.success("Payment sent from your wallet.");
        await load();
      } finally {
        setPayingId(null);
      }
    },
    [load],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.influencer_name.toLowerCase().includes(q) ||
        r.campaign_name.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const unpaidRows = useMemo(
    () => rows.filter((r) => r.status === "pending" || r.status === "processing"),
    [rows],
  );
  const unpaidTotalCents = useMemo(
    () => unpaidRows.reduce((s, r) => s + Number(r.amount ?? 0), 0),
    [unpaidRows],
  );
  const unpaidInfluencerCount = useMemo(() => {
    const ids = unpaidRows.map((r) => r.influencer_id).filter(Boolean) as string[];
    return new Set(ids).size || unpaidRows.length;
  }, [unpaidRows]);

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredRows.length && filteredRows.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map((r) => r.id)));
    }
  };

  const allSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));

  const copyBaridimob = async () => {
    if (!BARIDIMOB_RECEIVER_RIP || BARIDIMOB_RECEIVER_RIP.startsWith("—")) {
      toast.error("Configure Baridi Mob RIP in the environment if you use it.");
      return;
    }
    try {
      await navigator.clipboard.writeText(BARIDIMOB_RECEIVER_RIP.replace(/\s+/g, " ").trim());
      toast.success("Baridi Mob RIP copied.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const copyPlatformCcp = async () => {
    const raw = APFLUENCE_PLATFORM_CCP.replace(/\s+/g, " ").trim();
    if (!raw) {
      toast.error("Platform CCP is not configured.");
      return;
    }
    try {
      await navigator.clipboard.writeText(raw);
      toast.success("Apfluence CCP copied.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const submitAddFunds = async () => {
    const major = Number(String(fundAmount).replace(/,/g, "").trim());
    if (!Number.isFinite(major) || major <= 0) {
      toast.error("Enter a valid amount in DZD.");
      return;
    }
    if (!fundFile) {
      toast.error("Attach your payment receipt (image or PDF).");
      return;
    }
    setFundSubmitting(true);
    try {
      const receiptUrl = await uploadReceiptToCloudinary(fundFile);
      const amountCents = Math.round(major * 100);
      const res = await fetch("/api/wallet/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountCents,
          receipt_url: receiptUrl,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof payload?.error === "string" ? payload.error : "Could not submit deposit.");
        return;
      }
      toast.success("Deposit submitted. An admin will review your receipt.");
      setAddFundsOpen(false);
      resetAddFundsForm();
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setFundSubmitting(false);
    }
  };

  const baseGridColumns = useMemo((): DataGridColumn[] => {
    return [
      {
        key: "influencer",
        label: "Creator",
        width: 240,
        minWidth: 180,
        pinned: "left",
        render: (row: PayoutRow) => (
          <div className="flex items-center gap-3 min-w-0">
            {row.influencer_avatar ? (
              <Image
                src={row.influencer_avatar}
                alt=""
                width={36}
                height={36}
                className="rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                {row.influencer_name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{row.influencer_name}</p>
              <p className="text-[11px] text-gray-400 truncate tabular-nums">
                {row.created_at
                  ? new Date(row.created_at).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "campaign",
        label: "Campaign",
        width: 200,
        minWidth: 140,
        render: (row: PayoutRow) => (
          <span
            className={cn(
              "text-sm text-gray-800 truncate block max-w-[200px]",
              highlightCampaignId === row.campaign_id && "text-indigo-700 font-semibold",
            )}
            title={row.campaign_name}
          >
            {row.campaign_name}
          </span>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        width: 130,
        minWidth: 100,
        render: (row: PayoutRow) => (
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {formatDzdCompactOrFullFromCents(row.amount)} DZD
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        width: 130,
        minWidth: 100,
        headerExtra: () => (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-7 w-[108px] text-[10px] font-bold uppercase border-gray-200">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        ),
        render: (row: PayoutRow) => (
          <span
            className={cn(
              "text-[11px] font-bold px-2 py-1 rounded-lg border capitalize",
              STATUS_STYLE[row.status] ?? "bg-gray-50 text-gray-700 border-gray-200",
            )}
          >
            {row.status}
          </span>
        ),
      },
      {
        key: "action",
        label: "Action",
        width: 140,
        minWidth: 120,
        render: (row: PayoutRow) => {
          const canPay = row.status === "pending" || row.status === "processing";
          if (!canPay) {
            return <span className="text-xs text-gray-400">—</span>;
          }
          return (
            <Button
              type="button"
              size="sm"
              className="rounded-xl text-white border-0 hover:opacity-95"
              style={{ backgroundColor: BRAND_BLUE }}
              disabled={payingId === row.id}
              onClick={(e) => {
                e.stopPropagation();
                void pay(row.id);
              }}
            >
              {payingId === row.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                  Pay
                </>
              )}
            </Button>
          );
        },
      },
    ];
  }, [payingId, statusFilter, highlightCampaignId, pay]);

  const [columnOrder, setColumnOrder] = useState<DataGridColumn[] | null>(null);

  useEffect(() => {
    setColumnOrder(null);
  }, [baseGridColumns]);

  const gridColumns = columnOrder ?? baseGridColumns;

  return (
    <div className="relative min-h-full flex flex-col pb-28">
      <div
        className="flex-1 w-full max-w-none px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
        style={{
          background: `linear-gradient(180deg, ${BRAND_BLUE}08 0%, transparent 28%), linear-gradient(135deg, ${BRAND_ORANGE}06 0%, transparent 40%)`,
        }}
      >
        <div className="mb-6">
          <Link
            href="/brand/campaigns"
            className="inline-flex items-center gap-1.5 text-sm mb-3 font-medium transition-colors hover:opacity-90"
            style={{ color: BRAND_BLUE }}
          >
            <ArrowLeft size={16} />
            Campaigns
          </Link>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{
              color: BRAND_BLUE,
              textShadow: `0 1px 0 ${BRAND_ORANGE}33`,
            }}
          >
            Payments
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Request payouts from a campaign after publish, then fund your wallet and pay creators here. Deposits require
            admin approval before your balance updates.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border-2 bg-white shadow-md p-5 sm:p-6",
            )}
            style={{ borderColor: `${BRAND_BLUE}40` }}
          >
            <div
              className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-2xl pointer-events-none opacity-30"
              style={{ background: BRAND_BLUE }}
            />
            <div className="relative flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #1214c4 100%)`,
                  boxShadow: `0 8px 24px -6px ${BRAND_BLUE}66`,
                }}
              >
                <Wallet className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND_BLUE }}>
                  Wallet balance
                </p>
                <p
                  className={cn(
                    "font-black text-gray-900 tabular-nums tracking-tight mt-1 leading-none",
                    balanceTitleClass(brandBalance),
                  )}
                  title={formatDzdCardLabelFromCents(brandBalance)}
                >
                  {formatDzdCardLabelFromCents(brandBalance)}
                </p>
                {pendingDepositCount > 0 ? (
                  <p className="text-xs mt-2 font-medium" style={{ color: BRAND_ORANGE }}>
                    {pendingDepositCount} deposit{pendingDepositCount !== 1 ? "s" : ""} awaiting admin approval.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">Ready to pay creators from this balance.</p>
                )}
              </div>
            </div>
            <Button
              type="button"
              className="mt-5 w-full sm:w-auto rounded-xl font-semibold text-white shadow-lg border-0 hover:opacity-95"
              style={{
                background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #1214c4 50%, ${BRAND_ORANGE} 100%)`,
                boxShadow: `0 10px 28px -8px ${BRAND_BLUE}55`,
              }}
              onClick={() => setAddFundsOpen(true)}
            >
              Add funds
            </Button>
          </div>

          <div
            className={cn("relative overflow-hidden rounded-2xl border-2 bg-white shadow-md p-5 sm:p-6")}
            style={{ borderColor: `${BRAND_ORANGE}55` }}
          >
            <div
              className="absolute -right-12 -bottom-12 h-36 w-36 rounded-full blur-2xl pointer-events-none opacity-25"
              style={{ background: BRAND_ORANGE }}
            />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND_ORANGE }}>
                Unpaid
              </p>
              <p
                className={cn(
                  "font-black text-gray-900 tabular-nums tracking-tight mt-1 leading-none",
                  balanceTitleClass(unpaidTotalCents),
                )}
                title={formatDzdCardLabelFromCents(unpaidTotalCents)}
              >
                {formatDzdCardLabelFromCents(unpaidTotalCents)}
              </p>
              <p className="text-sm text-slate-600 mt-3">
                <span className="font-bold" style={{ color: BRAND_BLUE }}>
                  {unpaidInfluencerCount}
                </span>{" "}
                creator{unpaidInfluencerCount !== 1 ? "s" : ""} with unpaid payout
                {unpaidRows.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Pay each row below when your wallet has enough balance.
              </p>
            </div>
          </div>
        </div>

        {highlightCampaignId ? (
          <div
            className="mb-4 rounded-xl border-2 px-4 py-3 text-sm font-medium bg-white/90"
            style={{ borderColor: `${BRAND_BLUE}50`, color: BRAND_BLUE }}
          >
            Highlighting payout requests linked to the campaign you opened.
          </div>
        ) : null}

        {loadError ? (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</div>
        ) : null}

        {payError ? (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{payError}</div>
        ) : null}

        <div
          className="rounded-2xl border-2 bg-white shadow-md overflow-hidden flex flex-col min-h-[420px]"
          style={{ borderColor: `${BRAND_BLUE}28` }}
        >
          <div
            className="px-4 py-3 flex flex-wrap items-center gap-3 border-b"
            style={{ borderColor: `${BRAND_ORANGE}22`, background: `linear-gradient(90deg, ${BRAND_BLUE}06 0%, transparent 50%, ${BRAND_ORANGE}08 100%)` }}
          >
            <h2 className="text-sm font-bold" style={{ color: BRAND_BLUE }}>
              Payment requests
            </h2>
            <div className="flex-1 min-w-[200px] max-w-md ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search creator or campaign…"
                  className="pl-9 h-9 rounded-xl bg-white border-2 focus-visible:ring-[#1a1aff]/25"
                  style={{ borderColor: `${BRAND_BLUE}30` }}
                />
              </div>
            </div>
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400 shrink-0" /> : null}
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <ProDataGrid
              columns={gridColumns}
              rows={filteredRows}
              campaign={PAYMENTS_GRID_CAMPAIGN}
              selectedIds={selectedIds}
              toggleOne={toggleOne}
              toggleAll={toggleAll}
              allSelected={allSelected}
              onRemove={() => {}}
              removingId={null}
              onColumnReorder={setColumnOrder}
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 border-t-2 bg-white/95 backdrop-blur-md",
          "supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        )}
        style={{ borderColor: `${BRAND_BLUE}22` }}
      >
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-600">
            <span>
              Wallet:{" "}
              <strong className="tabular-nums" style={{ color: BRAND_BLUE }}>
                {formatDzdCardLabelFromCents(brandBalance)}
              </strong>
            </span>
            <span>
              Unpaid:{" "}
              <strong className="tabular-nums" style={{ color: BRAND_ORANGE }}>
                {formatDzdCardLabelFromCents(unpaidTotalCents)}
              </strong>
            </span>
            <span>
              Pending deposits:{" "}
              <strong className="text-slate-900">{pendingDepositCount}</strong>
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl font-semibold border-2 bg-white hover:bg-slate-50"
            style={{ borderColor: BRAND_ORANGE, color: BRAND_ORANGE }}
            onClick={() => void load()}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Dialog
        open={addFundsOpen}
        onOpenChange={(open) => {
          setAddFundsOpen(open);
          if (!open) resetAddFundsForm();
        }}
      >
        <DialogContent
          hideCloseButton
          className={cn(
            "flex max-h-[min(90vh,640px)] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl",
            "sm:max-w-lg",
          )}
          style={{ boxShadow: `0 25px 50px -12px ${BRAND_BLUE}40, 0 0 0 1px ${BRAND_ORANGE}22` }}
        >
          <div
            className="relative shrink-0 px-5 pt-6 pb-4 text-white overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #1214c4 45%, ${BRAND_ORANGE} 100%)`,
            }}
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-25"
              style={{ background: BRAND_ORANGE }}
            />
            <div
              className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full opacity-20"
              style={{ background: BRAND_BLUE }}
            />
            <DialogClose
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              disabled={fundSubmitting}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <DialogHeader className="relative text-left space-y-1.5 pr-10">
              <DialogTitle className="text-xl font-black tracking-tight text-white">Add funds</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-white/90">
                Send DZD to <strong className="text-white">Apfluence’s platform CCP</strong> (same for every brand).
                Enter the amount and attach your receipt.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="max-h-[min(52vh,380px)] overflow-y-auto bg-slate-50">
            <div className="px-4 py-4 space-y-4">
              <div
                className="rounded-xl border-2 bg-white px-3 py-3 shadow-sm space-y-4"
                style={{ borderColor: `${BRAND_BLUE}33` }}
              >
                <div>
                  <p
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: BRAND_BLUE }}
                  >
                    <Building2 className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND_ORANGE }} />
                    Apfluence — CCP
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                    Platform collection account — all brands pay to this CCP.
                  </p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code className="flex-1 text-sm font-mono font-bold tracking-wide text-slate-900 break-all tabular-nums">
                      {APFLUENCE_PLATFORM_CCP}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-lg border-2 font-semibold h-9"
                      style={{ borderColor: BRAND_ORANGE, color: BRAND_ORANGE }}
                      onClick={() => void copyPlatformCcp()}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND_BLUE }}>
                    Baridi Mob RIP{" "}
                    <span className="font-normal normal-case text-slate-400">optional</span>
                  </p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code className="flex-1 text-xs font-mono font-semibold text-slate-700 break-all leading-snug">
                      {BARIDIMOB_RECEIVER_RIP}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-lg border font-semibold h-9 border-slate-200 text-slate-700"
                      onClick={() => void copyBaridimob()}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fund-amount" className="text-slate-800 text-sm font-semibold">
                  Amount sent (DZD)
                </Label>
                <Input
                  id="fund-amount"
                  inputMode="decimal"
                  placeholder="e.g. 50000"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="h-11 rounded-xl border-2 border-slate-200 text-sm"
                  style={{ borderColor: `${BRAND_BLUE}35` }}
                />
                <p className="text-[11px] text-slate-500">Should match your receipt.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fund-receipt" className="text-slate-800 text-sm font-semibold">
                  Receipt (image or PDF)
                </Label>
                <div
                  className="flex flex-col gap-2 rounded-xl border-2 border-dashed bg-white px-3 py-4 sm:flex-row sm:items-center"
                  style={{ borderColor: `${BRAND_ORANGE}50` }}
                >
                  <Input
                    id="fund-receipt"
                    type="file"
                    accept="image/*,application/pdf"
                    className="cursor-pointer rounded-lg border-0 bg-transparent text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:font-semibold file:text-white"
                    style={{ color: BRAND_BLUE }}
                    onChange={(e) => setFundFile(e.target.files?.[0] ?? null)}
                  />
                  <Upload className="h-6 w-6 shrink-0 mx-auto sm:mx-0" style={{ color: BRAND_ORANGE }} />
                </div>
                {fundFile ? (
                  <p className="text-[11px] text-slate-600 truncate font-medium" title={fundFile.name}>
                    {fundFile.name}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-2 font-semibold"
              style={{ borderColor: BRAND_ORANGE, color: BRAND_ORANGE }}
              onClick={() => setAddFundsOpen(false)}
              disabled={fundSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl font-semibold text-white shadow-md"
              style={{
                background: BRAND_BLUE,
                boxShadow: `0 8px 24px -6px ${BRAND_BLUE}55`,
              }}
              onClick={() => void submitAddFunds()}
              disabled={fundSubmitting}
            >
              {fundSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting…
                </>
              ) : (
                "Submit deposit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BrandPaymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 text-sm">Loading payments…</div>}>
      <BrandPaymentsContent />
    </Suspense>
  );
}
