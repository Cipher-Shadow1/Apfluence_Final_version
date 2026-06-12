import { getAdminWalletOverview } from "@/lib/queries/admin-wallets";
import { formatMoneyFromCents } from "@/lib/money";
import { formatDzdCardLabelFromCents } from "@/lib/format/currency-display";
import {
  ApproveDepositButton,
  DistributeCampaignButton,
  SendWithdrawalButton,
} from "@/components/admin/AdminWalletActions";
import { ReceiptPreview } from "@/components/admin/ReceiptPreview";

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${accent} p-4 shadow-sm`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-2 text-[clamp(1.1rem,2vw,1.8rem)] font-black leading-tight text-slate-900 tabular-nums break-all">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const data = await getAdminWalletOverview();

  return (
    <div className="mx-auto w-full max-w-9xl space-y-6 px-5 py-6">
      <div>
        <h1 className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 bg-clip-text text-3xl font-black text-transparent">
          Admin Finance Console
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review deposits, distribute campaign payouts, and send influencer withdrawals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Apfluence Balance"
          value={formatDzdCardLabelFromCents(data.stats.platformBalance)}
          hint="Approved deposits minus sent withdrawals"
          accent="from-indigo-50 to-white"
        />
        <StatCard
          label="Total Approved Deposits"
          value={formatDzdCardLabelFromCents(data.stats.totalApprovedDeposits)}
          hint="Money added by all brands"
          accent="from-blue-50 to-white"
        />
        <StatCard
          label="Total Sent Withdrawals"
          value={formatDzdCardLabelFromCents(data.stats.totalSentWithdrawals)}
          hint="Money sent out to influencers"
          accent="from-cyan-50 to-white"
        />
        <StatCard
          label="Pending Deposits"
          value={String(data.stats.pendingDeposits)}
          hint="Waiting for approval"
          accent="from-amber-50 to-white"
        />
        <StatCard
          label="Pending Withdrawals"
          value={String(data.stats.pendingWithdrawals)}
          hint="Waiting to send"
          accent="from-rose-50 to-white"
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">Pending Deposits</h2>
        </div>
        {data.pendingDeposits.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No pending deposits.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Brand</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Receipt</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingDeposits.map((row: any) => (
                  <tr key={row.id} className="border-b border-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{row.brand_name}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {formatMoneyFromCents(Number(row.amount ?? 0), "DZD")}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{row.payment_ref ?? "-"}</td>
                    <td className="px-5 py-3">
                      {row.receipt_url ? (
                        <ReceiptPreview url={row.receipt_url} />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ApproveDepositButton transactionId={row.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">Campaign Distribution Queue</h2>
        </div>
        {data.campaignQueue.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">
            No campaigns currently eligible for payout.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3">Accepted</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.campaignQueue.map((row: any) => (
                  <tr key={row.id} className="border-b border-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{row.name}</td>
                    <td className="px-5 py-3 text-slate-700">{row.accepted_count}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {row.already_distributed ? "Already distributed" : "Ready"}
                    </td>
                    <td className="px-5 py-3">
                      {row.already_distributed ? (
                        <span className="text-xs font-medium text-emerald-600">Completed</span>
                      ) : (
                        <DistributeCampaignButton campaignId={row.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">Withdrawal Queue</h2>
        </div>
        {data.pendingWithdrawals.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No pending withdrawals.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Influencer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">CCP</th>
                  <th className="px-5 py-3">Full name</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingWithdrawals.map((row: any) => (
                  <tr key={row.id} className="border-b border-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {row.influencer_name}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {formatMoneyFromCents(Number(row.amount ?? 0), "DZD")}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {row.ccp_number}
                      {row.ccp_key ? ` / ${row.ccp_key}` : ""}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{row.full_name}</td>
                    <td className="px-5 py-3">
                      <SendWithdrawalButton requestId={row.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
