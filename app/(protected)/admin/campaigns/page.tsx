import { getAdminWalletOverview } from "@/lib/queries/admin-wallets";
import { DistributeCampaignButton } from "@/components/admin/AdminWalletActions";

export default async function AdminCampaignPayoutsPage() {
  const data = await getAdminWalletOverview();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-5 py-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Campaign Payout Distribution</h1>
        <p className="mt-1 text-sm text-slate-500">
          One-click split to all accepted influencers.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">
            Eligible Campaigns ({data.campaignQueue.length})
          </h2>
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
                  <th className="px-5 py-3">Distribution</th>
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
    </div>
  );
}
