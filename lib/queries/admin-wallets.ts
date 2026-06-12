"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getAdminWalletOverview() {
  const [
    walletsRes,
    pendingDepositsRes,
    withdrawalsRes,
    campaignsRes,
    campaignTxRes,
    approvedDepositsRes,
    sentWithdrawalsRes,
    depositHistoryRes,
    withdrawalHistoryRes,
  ] =
    await Promise.all([
      supabaseAdmin
        .from("wallets")
        .select("id, owner_id, owner_type, balance")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("transactions")
        .select("id, amount, receipt_url, payment_ref, created_at, to_wallet_id, campaign_id")
        .eq("type", "deposit")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("withdrawal_requests")
        .select("id, influencer_id, amount, status, ccp_number, ccp_key, full_name, created_at")
        .in("status", ["pending", "processing"])
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("campaigns")
        .select("id, name, created_at, status")
        .in("status", ["active", "completed", "paused"])
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("transactions")
        .select("id, campaign_id, created_at")
        .eq("type", "campaign_payment")
        .eq("status", "approved"),
      supabaseAdmin
        .from("transactions")
        .select("amount")
        .eq("type", "deposit")
        .eq("status", "approved"),
      supabaseAdmin
        .from("transactions")
        .select("amount")
        .eq("type", "withdrawal")
        .eq("status", "sent"),
      supabaseAdmin
        .from("transactions")
        .select("id, amount, status, receipt_url, payment_ref, created_at, approved_at, to_wallet_id")
        .eq("type", "deposit")
        .order("created_at", { ascending: false })
        .limit(300),
      supabaseAdmin
        .from("withdrawal_requests")
        .select("id, influencer_id, amount, status, ccp_number, ccp_key, full_name, created_at, processed_at")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);

  if (walletsRes.error) throw new Error(walletsRes.error.message);
  if (pendingDepositsRes.error) throw new Error(pendingDepositsRes.error.message);
  if (withdrawalsRes.error) throw new Error(withdrawalsRes.error.message);
  if (campaignsRes.error) throw new Error(campaignsRes.error.message);
  if (campaignTxRes.error) throw new Error(campaignTxRes.error.message);
  if (approvedDepositsRes.error) throw new Error(approvedDepositsRes.error.message);
  if (sentWithdrawalsRes.error) throw new Error(sentWithdrawalsRes.error.message);
  if (depositHistoryRes.error) throw new Error(depositHistoryRes.error.message);
  if (withdrawalHistoryRes.error) throw new Error(withdrawalHistoryRes.error.message);

  const wallets = walletsRes.data ?? [];
  const pendingDeposits = pendingDepositsRes.data ?? [];
  const pendingWithdrawals = withdrawalsRes.data ?? [];
  const campaigns = campaignsRes.data ?? [];
  const campaignPaymentTx = campaignTxRes.data ?? [];
  const approvedDeposits = approvedDepositsRes.data ?? [];
  const sentWithdrawals = sentWithdrawalsRes.data ?? [];
  const depositHistory = depositHistoryRes.data ?? [];
  const withdrawalHistory = withdrawalHistoryRes.data ?? [];

  const walletById = new Map(wallets.map((w: any) => [w.id, w]));
  const brandOwnerIds = Array.from(
    new Set(
      [...pendingDeposits, ...depositHistory]
        .map((tx: any) => walletById.get(tx.to_wallet_id)?.owner_id)
        .filter(Boolean),
    ),
  );
  const influencerIds = Array.from(
    new Set(
      [...pendingWithdrawals, ...withdrawalHistory]
        .map((row: any) => row.influencer_id)
        .filter(Boolean),
    ),
  );

  const [brandsRes, influencersRes, acceptedPerCampaignRes] = await Promise.all([
    brandOwnerIds.length
      ? supabaseAdmin.from("brands").select("id, company_name").in("id", brandOwnerIds)
      : Promise.resolve({ data: [], error: null } as any),
    influencerIds.length
      ? supabaseAdmin
          .from("influencers")
          .select("id, name, first_name, last_name, username")
          .in("id", influencerIds)
      : Promise.resolve({ data: [], error: null } as any),
    campaigns.length
      ? supabaseAdmin
          .from("campaign_influencers")
          .select("campaign_id, apply_status")
          .in(
            "campaign_id",
            campaigns.map((c: any) => c.id),
          )
      : Promise.resolve({ data: [], error: null } as any),
  ]);

  if (brandsRes.error) throw new Error(brandsRes.error.message);
  if (influencersRes.error) throw new Error(influencersRes.error.message);
  if (acceptedPerCampaignRes.error)
    throw new Error(acceptedPerCampaignRes.error.message);

  const brandById = new Map<string, any>((brandsRes.data ?? []).map((b: any) => [b.id, b]));
  const influencerById = new Map<string, any>(
    (influencersRes.data ?? []).map((i: any) => [i.id, i]),
  );

  const acceptedCountByCampaign = new Map<string, number>();
  for (const row of acceptedPerCampaignRes.data ?? []) {
    if (row.apply_status !== "accepted") continue;
    const current = acceptedCountByCampaign.get(row.campaign_id) ?? 0;
    acceptedCountByCampaign.set(row.campaign_id, current + 1);
  }

  const hasApprovedCampaignPayment = new Set(
    campaignPaymentTx.map((tx: any) => tx.campaign_id).filter(Boolean),
  );

  const enrichedDeposits = pendingDeposits.map((tx: any) => {
    const wallet = walletById.get(tx.to_wallet_id);
    const brand = wallet ? brandById.get(wallet.owner_id) : null;
    return {
      ...tx,
      brand_name: brand?.company_name ?? "Unknown Brand",
      brand_id: wallet?.owner_id ?? null,
    };
  });

  const enrichedDepositHistory = depositHistory.map((tx: any) => {
    const wallet = walletById.get(tx.to_wallet_id);
    const brand = wallet ? brandById.get(wallet.owner_id) : null;
    return {
      ...tx,
      brand_name: brand?.company_name ?? "Unknown Brand",
      brand_id: wallet?.owner_id ?? null,
    };
  });

  const enrichedWithdrawals = pendingWithdrawals.map((row: any) => {
    const influencer = influencerById.get(row.influencer_id);
    return {
      ...row,
      influencer_name:
        influencer?.name ||
        [influencer?.first_name, influencer?.last_name].filter(Boolean).join(" ") ||
        influencer?.username ||
        "Unknown Influencer",
    };
  });

  const enrichedWithdrawalHistory = withdrawalHistory.map((row: any) => {
    const influencer = influencerById.get(row.influencer_id);
    return {
      ...row,
      influencer_name:
        influencer?.name ||
        [influencer?.first_name, influencer?.last_name].filter(Boolean).join(" ") ||
        influencer?.username ||
        "Unknown Influencer",
    };
  });

  const campaignQueue = campaigns
    .map((campaign: any) => ({
      ...campaign,
      accepted_count: acceptedCountByCampaign.get(campaign.id) ?? 0,
      already_distributed: hasApprovedCampaignPayment.has(campaign.id),
    }))
    .filter((campaign: any) => campaign.accepted_count > 0);

  const stats = wallets.reduce(
    (acc: any, wallet: any) => {
      if (wallet.owner_type === "brand") acc.brandBalance += Number(wallet.balance ?? 0);
      if (wallet.owner_type === "influencer") {
        acc.influencerBalance += Number(wallet.balance ?? 0);
      }
      return acc;
    },
    { brandBalance: 0, influencerBalance: 0 },
  );

  const totalApprovedDeposits = approvedDeposits.reduce(
    (sum: number, tx: any) => sum + Number(tx.amount ?? 0),
    0,
  );
  const totalSentWithdrawals = sentWithdrawals.reduce(
    (sum: number, tx: any) => sum + Number(tx.amount ?? 0),
    0,
  );
  const platformBalance = totalApprovedDeposits - totalSentWithdrawals;

  return {
    stats: {
      ...stats,
      platformBalance,
      totalApprovedDeposits,
      totalSentWithdrawals,
      pendingDeposits: enrichedDeposits.length,
      pendingWithdrawals: enrichedWithdrawals.length,
      payoutCampaigns: campaignQueue.filter((c: any) => !c.already_distributed).length,
    },
    pendingDeposits: enrichedDeposits,
    pendingWithdrawals: enrichedWithdrawals,
    depositHistory: enrichedDepositHistory,
    withdrawalHistory: enrichedWithdrawalHistory,
    campaignQueue,
  };
}
