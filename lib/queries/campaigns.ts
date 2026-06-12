"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Database } from "@/types/supabase";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type CampaignProduct = Database["public"]["Tables"]["campaign_products"]["Row"];

export type CampaignWithStats = Campaign & {
  creators_count: number;
  engaged_count: number;
  emails_sent: number;
  response_rate: number;
  products: CampaignProduct[];
};

// ─── Get brand_id from auth_user_id ───────────────────────────────────
async function getBrandId(authUserId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();
  return data?.id ?? null;
}

// ─── Get all campaigns with stats + products ──────────────────────────
export async function getBrandCampaigns(
  authUserId: string,
): Promise<CampaignWithStats[]> {
  const brandId = await getBrandId(authUserId);
  if (!brandId) return [];

  const { data, error } = await supabaseAdmin
    .from("campaigns")
    .select(
      `
      *,
      campaign_influencers ( id, status, apply_status ),
      campaign_products    ( * )
    `,
    )
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getBrandCampaigns:", error);
    return [];
  }

  return (data ?? []).map((c: any) => {
    const influencers = c.campaign_influencers ?? [];
    const products = c.campaign_products ?? [];

    const emailsSent = influencers.filter((i: any) =>
      ["email_sent", "viewed", "accepted", "declined"].includes(i.status),
    ).length;

    const engaged = influencers.filter((i: any) =>
      ["viewed", "accepted", "declined"].includes(i.status),
    ).length;

    const responded = influencers.filter((i: any) =>
      ["accepted", "declined"].includes(i.apply_status ?? ""),
    ).length;

    return {
      ...c,
      creators_count: influencers.length,
      engaged_count: engaged,
      emails_sent: emailsSent,
      response_rate:
        emailsSent > 0 ? Math.round((responded / emailsSent) * 100) : 0,
      products,
    };
  });
}

// ─── Dashboard stats ──────────────────────────────────────────────────
export async function getCampaignDashboardStats(authUserId: string): Promise<{
  engagedInfluencers: number;
  emailsSent: number;
  responseRate: number;
}> {
  const campaigns = await getBrandCampaigns(authUserId);

  const totalEmailsSent = campaigns.reduce((s, c) => s + c.emails_sent, 0);
  const totalEngaged = campaigns.reduce((s, c) => s + c.engaged_count, 0);
  const totalResponded = campaigns.reduce(
    (s, c) => s + Math.round((c.response_rate / 100) * c.emails_sent),
    0,
  );

  return {
    engagedInfluencers: totalEngaged,
    emailsSent: totalEmailsSent,
    responseRate:
      totalEmailsSent > 0
        ? Math.round((totalResponded / totalEmailsSent) * 100)
        : 0,
  };
}

// ─── Activity feed ────────────────────────────────────────────────────
export async function getCampaignActivity(
  authUserId: string,
  limit = 20,
): Promise<any[]> {
  const brandId = await getBrandId(authUserId);
  if (!brandId) return [];

  const { data, error } = await supabaseAdmin
    .from("campaign_activity")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCampaignActivity:", error);
    return [];
  }

  const items = (data ?? [])
    .sort((a: any, b: any) => {
      const ta = new Date(a?.created_at ?? 0).getTime();
      const tb = new Date(b?.created_at ?? 0).getTime();
      return tb - ta;
    });

  return items.slice(0, limit);
}

// ─── Outreach inbox rows (all sent campaign emails) ──────────────────
export async function getBrandOutreachInboxEmails(
  authUserId: string,
  limit = 500,
): Promise<any[]> {
  const brandId = await getBrandId(authUserId);
  if (!brandId) return [];

  const { data, error } = await supabaseAdmin
    .from("campaign_activity")
    .select(
      `
      id,
      campaign_id,
      title,
      description,
      created_at,
      meta,
      campaigns ( name )
    `,
    )
    .eq("brand_id", brandId)
    .eq("type", "outreach_email_sent")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getBrandOutreachInboxEmails:", error);
    return [];
  }

  const rows = data ?? [];

  // Hide historical email logs for influencers that were removed from the campaign.
  const campaignInfluencerPairs = rows
    .map((row: any) => {
      const influencerId = row?.meta?.influencer_id;
      if (!row?.campaign_id || !influencerId) return null;
      return {
        campaignId: String(row.campaign_id),
        influencerId: String(influencerId),
      };
    })
    .filter(Boolean) as Array<{ campaignId: string; influencerId: string }>;

  let activePairSet = new Set<string>();
  if (campaignInfluencerPairs.length > 0) {
    const campaignIds = Array.from(
      new Set(campaignInfluencerPairs.map((p) => p.campaignId)),
    );
    const influencerIds = Array.from(
      new Set(campaignInfluencerPairs.map((p) => p.influencerId)),
    );

    const { data: activeLinks, error: activeLinksError } = await supabaseAdmin
      .from("campaign_influencers")
      .select("campaign_id,influencer_id")
      .in("campaign_id", campaignIds)
      .in("influencer_id", influencerIds);

    if (activeLinksError) {
      console.error("getBrandOutreachInboxEmails active links:", activeLinksError);
    } else {
      activePairSet = new Set(
        (activeLinks ?? []).map(
          (link: any) => `${String(link.campaign_id)}::${String(link.influencer_id)}`,
        ),
      );
    }
  }

  return rows
    .filter((row: any) => {
      const influencerId = row?.meta?.influencer_id;
      if (!row?.campaign_id || !influencerId) return true;
      return activePairSet.has(`${String(row.campaign_id)}::${String(influencerId)}`);
    })
    .map((row: any) => {
    const meta = row?.meta ?? {};
    return {
      id: row.id,
      campaignId: row.campaign_id ?? null,
      campaignName: row?.campaigns?.name ?? "Unknown Campaign",
      createdAt: row.created_at,
      subject: meta?.subject ?? row?.title ?? "",
      toEmail: meta?.toEmail ?? "",
      toName: meta?.toName ?? "",
      description: row?.description ?? "",
      status: "sent",
    };
  });
}

// ─── Active outreach sending batches (with pending delayed emails) ─────
export async function getBrandOutreachPendingBatches(
  authUserId: string,
): Promise<
  Array<{
    id: string;
    campaignId: string | null;
    campaignName: string;
    createdAt: string;
    total: number;
    sent: number;
    pending: number;
    status: string;
  }>
> {
  const brandId = await getBrandId(authUserId);
  if (!brandId) return [];

  const { data, error } = await supabaseAdmin
    .from("campaign_activity")
    .select(
      `
      id,
      campaign_id,
      created_at,
      meta,
      campaigns ( name )
    `,
    )
    .eq("brand_id", brandId)
    .eq("type", "outreach_email_batch_progress")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("getBrandOutreachPendingBatches:", error);
    return [];
  }

  return (data ?? [])
    .map((row: any) => {
      const meta = row?.meta ?? {};
      return {
        id: row.id,
        campaignId: row.campaign_id ?? null,
        campaignName: row?.campaigns?.name ?? "Campaign",
        createdAt: row.created_at,
        total: Number(meta?.total ?? 0),
        sent: Number(meta?.sent ?? 0),
        pending: Number(meta?.pending ?? 0),
        status: String(meta?.status ?? "unknown"),
      };
    })
    .filter((row) => row.status === "running" && row.pending > 0);
}

export async function createCampaign(payload: {
  authUserId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  type: "paid" | "paid_with_product";
  contentTags: Array<{ type: "hashtag" | "mention"; value: string }>;
  flatAmount?: number | null; // in cents
  showProductPrice?: boolean;
  maxProductCount?: number | null;
  maxProductValue?: number | null; // in cents
  briefPdfUrl?: string | null;
  contractPdfUrl?: string | null;
  requiresContract?: boolean;
  targetListId?: string | null;
  coverColor?: string;
  coverEmoji?: string;
  emailSubject?: string;
  emailTemplate?: string;
  campaignGoal?: string | null;
  primaryKpi?: string | null;
  targetKpiValue?: number | null;
  campaignLanguage?: string | null;
  campaignCurrency?: string | null;
  targetCountries?: string[];
  targetCities?: string[];
  targetNiches?: string[];
  minFollowers?: number | null;
  maxFollowers?: number | null;
  minEngagementRate?: number | null;
  authenticityMinScore?: number | null;
  startAt?: string | null;
  contentDueAt?: string | null;
  publishWindowStart?: string | null;
  publishWindowEnd?: string | null;
  products?: Array<{
    name: string;
    imageUrl?: string;
    value: number; // in cents
    description?: string;
  }>;
}): Promise<Campaign | null> {
  const brandId = await getBrandId(payload.authUserId);
  if (!brandId) {
    console.error(
      "createCampaign: brand not found for ID",
      payload.authUserId,
    );
    return null;
  }

  const { data: campaign, error } = await supabaseAdmin
    .from("campaigns")
    .insert({
      brand_id: brandId,
      name: payload.name,
      description: payload.description ?? null,
      logo_url: payload.logoUrl ?? null,
      type: payload.type,
      content_tags: payload.contentTags,
      flat_amount: payload.flatAmount ?? null,
      show_product_price: payload.showProductPrice ?? true,
      max_product_count: payload.maxProductCount ?? null,
      max_product_value: payload.maxProductValue ?? null,
      brief_pdf_url: payload.briefPdfUrl ?? null,
      contract_pdf_url: payload.contractPdfUrl ?? null,
      requires_contract: payload.requiresContract ?? false,
      target_list_id: payload.targetListId ?? null,
      cover_color: payload.coverColor ?? "#6366F1",
      cover_emoji: payload.coverEmoji ?? "🎯",
      email_subject: payload.emailSubject ?? null,
      email_template: payload.emailTemplate ?? null,
      campaign_goal: payload.campaignGoal ?? null,
      primary_kpi: payload.primaryKpi ?? null,
      target_kpi_value: payload.targetKpiValue ?? null,
      campaign_language: payload.campaignLanguage ?? null,
      campaign_currency: payload.campaignCurrency ?? null,
      start_at: payload.startAt ?? null,
      content_due_at: payload.contentDueAt ?? null,
      publish_window_start: payload.publishWindowStart ?? null,
      publish_window_end: payload.publishWindowEnd ?? null,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("createCampaign:", error);
    return null;
  }

  if (payload.type === "paid_with_product" && payload.products?.length) {
    const productRows = payload.products.map((p, i) => ({
      campaign_id: campaign.id,
      name: p.name,
      image_url: p.imageUrl ?? null,
      value: p.value,
      description: p.description ?? null,
      sort_order: i,
    }));

    const { error: prodError } = await supabaseAdmin
      .from("campaign_products")
      .insert(productRows);

    if (prodError) console.error("createCampaign products:", prodError);
  }

  // Write activity entry in campaign_activity table
  const entry = {
    brand_id: brandId,
    campaign_id: campaign.id,
    type: "campaign_created",
    title: "Campaign created",
    description: `Created campaign "${payload.name}"`,
  };
  await supabaseAdmin.from("campaign_activity").insert(entry);

  return campaign;
}

export async function deleteCampaign(
  authUserId: string,
  campaignId: string,
): Promise<boolean> {
  const brandId = await getBrandId(authUserId);
  if (!brandId) return false;

  const { error } = await supabaseAdmin
    .from("campaigns")
    .delete()
    .eq("id", campaignId)
    .eq("brand_id", brandId);

  if (error) {
    console.error("deleteCampaign:", error);
    return false;
  }
  return true;
}

// ─── Get a single campaign with full details ──────────────────────────
export async function getCampaignById(campaignId: string): Promise<any | null> {
  const { data, error } = await supabaseAdmin
    .from("campaigns")
    .select(
      `
      *,
      campaign_products ( * ),
      campaign_influencers (
        *,
        campaign_payouts ( id, status, amount, created_at ),
        influencers (
          id,
          name,
          first_name,
          last_name,
          username,
          email,
          avatar_url,
          flag,
          niches,
          languages,
          authenticity_score,
          country_code,
          bio,
          phone,
          billing_address_line1,
          billing_city,
          billing_country,
          influencer_platform_metrics (
            *,
            platforms ( name, display_name )
          )
        )
      )
    `,
    )
    .eq("id", campaignId)
    .single();

  if (error) {
    console.error("getCampaignById:", error);
    return null;
  }
  return data;
}

// ─── Add influencers from a list to a campaign ────────────────────────
export async function addListInfluencersToCampaign(
  campaignId: string,
  listId: string,
): Promise<{ added: number; skipped: number }> {
  // 1. Get influencers in the list
  const { data: listInfluencers, error: listError } = await supabaseAdmin
    .from("brand_list_influencers")
    .select("influencer_id")
    .eq("list_id", listId);

  if (listError || !listInfluencers?.length) return { added: 0, skipped: 0 };

  // 2. Get existing influencers already in the campaign
  const { data: existingInfluencers, error: existingError } = await supabaseAdmin
    .from("campaign_influencers")
    .select("influencer_id")
    .eq("campaign_id", campaignId);

  const existingSet = new Set((existingInfluencers || []).map(r => r.influencer_id));

  let added = 0;
  let skipped = 0;

  for (const row of listInfluencers) {
    if (existingSet.has(row.influencer_id)) {
      skipped++;
      continue;
    }

    const { error } = await supabaseAdmin.from("campaign_influencers").insert({
      campaign_id: campaignId,
      influencer_id: row.influencer_id,
      status: "pending",
    });

    if (error) {
      if (error.code === "23505") skipped++;
      else console.error("addListInfluencersToCampaign:", error);
    } else {
      added++;
    }
  }

  return { added, skipped };
}

// ─── Remove influencer from campaign ─────────────────────────────────
export async function removeInfluencerFromCampaign(
  campaignId: string,
  influencerId: string,
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("campaign_influencers")
    .delete()
    .eq("campaign_id", campaignId)
    .eq("influencer_id", influencerId);

  if (error) {
    console.error("removeInfluencerFromCampaign:", error);
    return false;
  }
  return true;
}

// ─── Update campaign influencer status ───────────────────────────────
export async function updateCampaignInfluencerStatus(
  campaignInfluencerId: string,
  status: string,
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("campaign_influencers")
    .update({ status })
    .eq("id", campaignInfluencerId);

  if (error) {
    console.error("updateCampaignInfluencerStatus:", error);
    return false;
  }
  return true;
}

// ─── Update custom flat offer per influencer ─────────────────────────
export async function updateCampaignInfluencerOffer(
  campaignInfluencerId: string,
  customFlatAmount: number | null,
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("campaign_influencers")
    .update({ custom_flat_amount: customFlatAmount })
    .eq("id", campaignInfluencerId);

  if (error) {
    console.error("updateCampaignInfluencerOffer:", error);
    return false;
  }
  return true;
}

// ─── Update campaign email defaults ───────────────────────────────────
export async function updateCampaignEmailDefaults(
  authUserId: string,
  campaignId: string,
  emailSubject: string,
  emailTemplate: string,
): Promise<boolean> {
  const brandId = await getBrandId(authUserId);
  if (!brandId) return false;

  const { error } = await supabaseAdmin
    .from("campaigns")
    .update({
      email_subject: emailSubject,
      email_template: emailTemplate,
    })
    .eq("id", campaignId)
    .eq("brand_id", brandId);

  if (error) {
    console.error("updateCampaignEmailDefaults:", error);
    return false;
  }
  return true;
}
