"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export type DepositInput = {
  brandId: string;
  amount: number;
  receiptUrl: string;
  paymentRef?: string | null;
};

export async function createPendingDeposit(input: DepositInput) {
  const { brandId, amount, receiptUrl, paymentRef } = input;
  if (!brandId) throw new Error("brandId is required");
  if (!receiptUrl?.trim()) throw new Error("receiptUrl is required");
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("amount must be a positive integer");
  }

  const { data: walletId, error: walletError } = await supabaseAdmin.rpc(
    "ensure_wallet",
    {
      p_owner_id: brandId,
      p_owner_type: "brand",
    },
  );

  if (walletError || !walletId) {
    throw new Error(walletError?.message ?? "Failed to initialize brand wallet");
  }

  const { data, error } = await supabaseAdmin
    .from("transactions")
    .insert({
      type: "deposit",
      status: "pending",
      amount,
      to_wallet_id: walletId,
      receipt_url: receiptUrl,
      payment_ref: paymentRef?.trim() || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function approveDepositByAdmin(input: {
  transactionId: string;
  adminId: string;
  adminNote?: string | null;
}) {
  const { data, error } = await supabaseAdmin.rpc("admin_approve_deposit", {
    p_transaction_id: input.transactionId,
    p_admin_id: input.adminId,
    p_admin_note: input.adminNote ?? null,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function distributeCampaignFundsByAdmin(input: {
  campaignId: string;
  adminId: string;
  adminNote?: string | null;
}) {
  const { data, error } = await supabaseAdmin.rpc(
    "admin_distribute_campaign_payment",
    {
      p_campaign_id: input.campaignId,
      p_admin_id: input.adminId,
      p_admin_note: input.adminNote ?? null,
    },
  );

  if (error) throw new Error(error.message);
  return data;
}

export type WithdrawalInput = {
  influencerId: string;
  amount: number;
  ccpNumber: string;
  ccpKey?: string | null;
  fullName: string;
};

export async function createWithdrawalRequest(input: WithdrawalInput) {
  if (!input.influencerId) throw new Error("influencerId is required");
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("amount must be a positive integer");
  }
  if (!input.ccpNumber?.trim()) throw new Error("ccpNumber is required");
  if (!input.fullName?.trim()) throw new Error("fullName is required");

  const { data, error } = await supabaseAdmin
    .from("withdrawal_requests")
    .insert({
      influencer_id: input.influencerId,
      amount: input.amount,
      status: "pending",
      ccp_number: input.ccpNumber.trim(),
      ccp_key: input.ccpKey?.trim() || null,
      full_name: input.fullName.trim(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function markWithdrawalSentByAdmin(input: {
  withdrawalRequestId: string;
  adminId: string;
  adminNote?: string | null;
}) {
  const { data, error } = await supabaseAdmin.rpc("admin_mark_withdrawal_sent", {
    p_withdrawal_request_id: input.withdrawalRequestId,
    p_admin_id: input.adminId,
    p_admin_note: input.adminNote ?? null,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function requestCampaignInfluencerPayment(input: {
  authUserId: string;
  campaignId: string;
  campaignInfluencerId: string;
}) {
  const { data: brand, error: brandError } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("auth_user_id", input.authUserId)
    .maybeSingle();

  if (brandError || !brand?.id) {
    throw new Error("Brand profile not found");
  }

  const { data: ci, error: ciError } = await supabaseAdmin
    .from("campaign_influencers")
    .select(
      `
      id,
      campaign_id,
      influencer_id,
      status,
      custom_flat_amount,
      campaigns ( id, brand_id, flat_amount, name )
    `,
    )
    .eq("id", input.campaignInfluencerId)
    .eq("campaign_id", input.campaignId)
    .single();

  if (ciError || !ci) {
    throw new Error("Campaign influencer not found");
  }

  const campaign = ci.campaigns as any;
  if (!campaign || campaign.brand_id !== brand.id) {
    throw new Error("You can only request payment for your own campaign");
  }

  if (ci.status !== "published") {
    throw new Error("Payment can only be requested after content is published");
  }

  const amount = Number(ci.custom_flat_amount ?? campaign.flat_amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Offer amount is missing for this influencer");
  }

  const { data, error } = await supabaseAdmin
    .from("campaign_payouts")
    .upsert(
      {
        campaign_id: input.campaignId,
        campaign_influencer_id: ci.id,
        influencer_id: ci.influencer_id,
        amount,
        status: "pending",
      },
      { onConflict: "campaign_id,influencer_id" },
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await supabaseAdmin.from("campaign_activity").insert({
    brand_id: brand.id,
    campaign_id: input.campaignId,
    type: "payment_requested",
    title: "Payment requested",
    description: `Payment requested for influencer in campaign "${campaign?.name ?? "Campaign"}"`,
    meta: {
      campaign_influencer_id: ci.id,
      influencer_id: ci.influencer_id,
      amount,
    },
  });

  return data;
}

export async function payCampaignPayoutByBrand(input: {
  authUserId: string;
  payoutId: string;
}) {
  const { data, error } = await supabaseAdmin.rpc("brand_pay_campaign_payout", {
    p_payout_id: input.payoutId,
    p_auth_user_id: input.authUserId,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function getBrandWalletOverview(authUserId: string) {
  const { data: brand, error: brandError } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (brandError || !brand?.id) throw new Error("Brand profile not found");

  const [{ data: wallet }, { data: campaigns }, { data: payouts }, { data: influencers }] =
    await Promise.all([
      supabaseAdmin
        .from("wallets")
        .select("id,balance")
        .eq("owner_id", brand.id)
        .eq("owner_type", "brand")
        .maybeSingle(),
      supabaseAdmin.from("campaigns").select("id,name").eq("brand_id", brand.id),
      supabaseAdmin
        .from("campaign_payouts")
        .select("id,amount,status,campaign_id,influencer_id,created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("influencers").select("id,name,avatar_url"),
    ]);

  const campaignById = new Map<string, any>((campaigns ?? []).map((c: any) => [c.id, c]));
  const influencerById = new Map<string, any>((influencers ?? []).map((i: any) => [i.id, i]));
  const campaignIds = new Set((campaigns ?? []).map((c: any) => c.id));

  const payoutRows = (payouts ?? [])
    .filter((row: any) => campaignIds.has(row.campaign_id))
    .map((row: any) => ({
      id: row.id,
      campaign_id: row.campaign_id,
      influencer_id: row.influencer_id as string,
      amount: Number(row.amount ?? 0),
      status: row.status,
      campaign_name: campaignById.get(row.campaign_id)?.name ?? "Campaign",
      influencer_name: influencerById.get(row.influencer_id)?.name ?? "Influencer",
      influencer_avatar: influencerById.get(row.influencer_id)?.avatar_url ?? null,
      payment_method: "Wallet transfer",
      created_at: row.created_at ?? null,
    }));

  let pendingDepositCount = 0;
  if (wallet?.id) {
    const { count } = await supabaseAdmin
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("type", "deposit")
      .eq("status", "pending")
      .eq("to_wallet_id", wallet.id);
    pendingDepositCount = count ?? 0;
  }

  return {
    brandBalance: Number(wallet?.balance ?? 0),
    pendingDepositCount,
    rows: payoutRows,
  };
}

export async function getInfluencerWalletOverview(authUserId: string) {
  const { data: influencer, error: infError } = await supabaseAdmin
    .from("influencers")
    .select("id, name")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (infError || !influencer?.id) throw new Error("Influencer profile not found");

  const influencerId = influencer.id;

  const [{ data: wallet }, { data: payouts }, { data: withdrawals }] =
    await Promise.all([
      supabaseAdmin
        .from("wallets")
        .select("id,balance,total_deposited,total_withdrawn")
        .eq("owner_id", influencerId)
        .eq("owner_type", "influencer")
        .maybeSingle(),
      supabaseAdmin
        .from("campaign_payouts")
        .select(
          "id, amount, status, created_at, campaign_id, campaigns ( id, name, brands ( company_name, logo_url ) )",
        )
        .eq("influencer_id", influencerId)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("withdrawal_requests")
        .select("id, amount, status, ccp_number, ccp_key, full_name, admin_note, processed_at, created_at")
        .eq("influencer_id", influencerId)
        .order("created_at", { ascending: false }),
    ]);

  const payoutRows = (payouts ?? []).map((row: any) => {
    const campaign = row.campaigns as any;
    const brand = Array.isArray(campaign?.brands) ? campaign.brands[0] : campaign?.brands;
    return {
      id: row.id,
      amount: Number(row.amount ?? 0),
      status: row.status as string,
      campaign_name: campaign?.name ?? "Campaign",
      brand_name: brand?.company_name ?? "Brand",
      brand_logo: brand?.logo_url ?? null,
      created_at: row.created_at ?? null,
    };
  });

  const withdrawalRows = (withdrawals ?? []).map((row: any) => ({
    id: row.id,
    amount: Number(row.amount ?? 0),
    status: row.status as string,
    ccp_number: row.ccp_number ?? "",
    ccp_key: row.ccp_key ?? null,
    full_name: row.full_name ?? "",
    admin_note: row.admin_note ?? null,
    processed_at: row.processed_at ?? null,
    created_at: row.created_at ?? null,
  }));

  const totalEarned = payoutRows
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingWithdrawals = withdrawalRows.filter(
    (r) => r.status === "pending" || r.status === "processing",
  );

  return {
    balance: Number(wallet?.balance ?? 0),
    totalEarned,
    pendingWithdrawalCount: pendingWithdrawals.length,
    pendingWithdrawalAmount: pendingWithdrawals.reduce((s, r) => s + r.amount, 0),
    payouts: payoutRows,
    withdrawals: withdrawalRows,
  };
}
