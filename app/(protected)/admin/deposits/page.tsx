import { getAdminWalletOverview } from "@/lib/queries/admin-wallets";
import { AdminDepositsView } from "@/components/admin/AdminDepositsView";

export default async function AdminDepositsPage() {
  const data = await getAdminWalletOverview();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-5 py-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Deposit Approvals</h1>
        <p className="mt-1 text-sm text-slate-500">
          Validate Baridimob receipts and credit brand wallets.
        </p>
      </div>
      <AdminDepositsView rows={data.depositHistory ?? []} />
    </div>
  );
}
