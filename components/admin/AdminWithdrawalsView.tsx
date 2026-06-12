"use client";

import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import ProDataGrid, { type DataGridColumn } from "@/components/brand/campaigns/ProDataGrid";
import { formatMoneyFromCents } from "@/lib/money";
import { SendWithdrawalButton } from "@/components/admin/AdminWalletActions";

type WithdrawalRow = {
  id: string;
  influencer_name: string;
  amount: number;
  status: "pending" | "processing" | "sent" | "rejected" | string;
  ccp_number: string;
  ccp_key: string | null;
  full_name: string;
  created_at: string;
  processed_at?: string | null;
};

export function AdminWithdrawalsView({ rows }: { rows: WithdrawalRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const queryOk =
        !q ||
        row.influencer_name.toLowerCase().includes(q) ||
        row.full_name.toLowerCase().includes(q);
      const statusOk = !statusFilter || row.status === statusFilter;
      return queryOk && statusOk;
    });
  }, [query, rows, statusFilter]);

  const columns: DataGridColumn[] = useMemo(
    () => [
      {
        key: "influencer",
        label: "Influencer",
        width: 220,
        minWidth: 180,
        pinned: "left",
        render: (row: WithdrawalRow) => (
          <span className="text-sm font-semibold text-slate-800">{row.influencer_name}</span>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        width: 140,
        minWidth: 120,
        render: (row: WithdrawalRow) => (
          <span className="text-sm font-semibold text-[#2b2ef8]">
            {formatMoneyFromCents(Number(row.amount ?? 0), "DZD")}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        width: 150,
        minWidth: 120,
        headerExtra: () => (
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusFilterOpen((p) => !p)}
              className={cn(
                "rounded-md p-1 transition-all",
                statusFilter
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600",
              )}
            >
              <Filter size={13} />
            </button>
            {statusFilterOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setStatusFilterOpen(false)} />
                <div className="absolute right-0 top-full z-40 mt-1 w-44 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
                  {["all", "pending", "processing", "sent", "rejected"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStatusFilter(s === "all" ? null : s);
                        setStatusFilterOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {s === "all" ? "Show all" : s[0].toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ),
        render: (row: WithdrawalRow) => (
          <span
            className={cn(
              "rounded-lg px-2 py-1 text-xs font-semibold",
              row.status === "sent"
                ? "bg-emerald-50 text-emerald-700"
                : row.status === "rejected"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-amber-50 text-amber-700",
            )}
          >
            {row.status}
          </span>
        ),
      },
      {
        key: "ccp",
        label: "CCP",
        width: 170,
        minWidth: 140,
        render: (row: WithdrawalRow) => (
          <span className="text-sm text-slate-600">
            {row.ccp_number}
            {row.ccp_key ? ` / ${row.ccp_key}` : ""}
          </span>
        ),
      },
      {
        key: "full_name",
        label: "Full Name",
        width: 220,
        minWidth: 180,
        render: (row: WithdrawalRow) => <span className="text-sm text-slate-700">{row.full_name}</span>,
      },
      {
        key: "created",
        label: "Requested At",
        width: 170,
        minWidth: 140,
        render: (row: WithdrawalRow) => (
          <span className="text-xs text-slate-500">
            {new Date(row.created_at).toLocaleString()}
          </span>
        ),
      },
      {
        key: "action",
        label: "Action",
        width: 140,
        minWidth: 120,
        render: (row: WithdrawalRow) =>
          row.status === "pending" || row.status === "processing" ? (
            <SendWithdrawalButton requestId={row.id} />
          ) : (
            <span className="text-xs text-slate-400">Processed</span>
          ),
      },
    ],
    [statusFilter, statusFilterOpen],
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-bold text-slate-900">Withdrawal History</h2>
      </div>
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by influencer"
            className="w-72 rounded-xl border border-gray-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-indigo-300"
          />
        </div>
      </div>
      <div style={{ height: "calc(100vh - 310px)" }} className="min-h-[360px]">
        <ProDataGrid
          columns={columns}
          rows={filtered}
          campaign={null}
          selectedIds={selectedIds}
          toggleOne={(id) =>
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          toggleAll={() =>
            setSelectedIds((prev) =>
              prev.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id)),
            )
          }
          allSelected={filtered.length > 0 && selectedIds.size === filtered.length}
          onRemove={() => {}}
          removingId={null}
          onColumnReorder={() => {}}
        />
      </div>
    </section>
  );
}
