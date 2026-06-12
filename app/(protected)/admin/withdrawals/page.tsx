import { getAdminWalletOverview } from "@/lib/queries/admin-wallets";
import { AdminWithdrawalsView } from "@/components/admin/AdminWithdrawalsView";

export default async function AdminWithdrawalsPage() {
  const data = await getAdminWalletOverview();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-5 py-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Withdrawal Queue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Send payouts and mark requests as completed.
        </p>
      </div>

      <AdminWithdrawalsView rows={data.withdrawalHistory ?? []} />
    </div>
  );
}
