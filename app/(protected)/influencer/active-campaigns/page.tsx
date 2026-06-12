"use client";

import { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import {
  Rocket,
  Calendar,
  FileText,
  ExternalLink,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

function formatCents(cents: number | null | undefined): string {
  if (cents == null || cents === 0) return "—";
  return `$${(cents / 100).toLocaleString()}`;
}

function daysUntil(ts: string | null): number | null {
  if (!ts) return null;
  const diff = new Date(ts).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function brandWebsiteHref(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
}

type BrandEmbed = {
  company_name: string;
  logo_url: string | null;
  phone_whatsapp: string | null;
  website: string | null;
} | null;

type ProductEmbed = {
  id: string;
  name: string;
  value: number;
  image_url: string | null;
};

type CampaignEmbed = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  flat_amount: number | null;
  cover_emoji: string | null;
  cover_color: string | null;
  content_due_at: string | null;
  publish_window_start: string | null;
  publish_window_end: string | null;
  start_at: string | null;
  brief_pdf_url: string | null;
  contract_pdf_url: string | null;
  requires_contract: boolean;
  content_tags: unknown;
  brands: BrandEmbed;
  campaign_products: ProductEmbed[] | null;
} | null;

type ActiveRow = {
  id: string;
  status: string;
  apply_status: string | null;
  token: string;
  custom_flat_amount: number | null;
  selected_product_ids: unknown;
  signed_contract_url: string | null;
  campaigns: CampaignEmbed;
};

function normalizeActiveRow(row: Record<string, unknown>): ActiveRow {
  const rawCamp = row.campaigns;
  const camp = Array.isArray(rawCamp) ? rawCamp[0] : rawCamp;
  if (!camp || typeof camp !== "object") {
    return { ...(row as unknown as ActiveRow), campaigns: null };
  }
  const c = camp as Record<string, unknown>;
  const rawBrand = c.brands;
  const brand = Array.isArray(rawBrand) ? rawBrand[0] : rawBrand;
  const products = c.campaign_products;
  const campaign: CampaignEmbed = {
    id: String(c.id),
    name: String(c.name ?? ""),
    description: (c.description as string | null) ?? null,
    type: String(c.type ?? ""),
    flat_amount: (c.flat_amount as number | null) ?? null,
    cover_emoji: (c.cover_emoji as string | null) ?? null,
    cover_color: (c.cover_color as string | null) ?? null,
    content_due_at: (c.content_due_at as string | null) ?? null,
    publish_window_start: (c.publish_window_start as string | null) ?? null,
    publish_window_end: (c.publish_window_end as string | null) ?? null,
    start_at: (c.start_at as string | null) ?? null,
    brief_pdf_url: (c.brief_pdf_url as string | null) ?? null,
    contract_pdf_url: (c.contract_pdf_url as string | null) ?? null,
    requires_contract: Boolean(c.requires_contract),
    content_tags: c.content_tags,
    brands: (brand as BrandEmbed) ?? null,
    campaign_products: Array.isArray(products)
      ? (products as ProductEmbed[])
      : null,
  };
  return {
    ...(row as unknown as Omit<ActiveRow, "campaigns">),
    campaigns: campaign,
  };
}

export default function ActiveCampaignsPage() {
  const { userId, isLoaded } = useSupabaseUser();
  const [campaigns, setCampaigns] = useState<ActiveRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    const supabase = createClient();

    void (async () => {
      const { data: inf } = await supabase
        .from("influencers")
        .select("id")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (!inf) {
        setCampaigns([]);
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("campaign_influencers")
        .select(
          `
            id, status, apply_status, token,
            custom_flat_amount, selected_product_ids,
            signed_contract_url,
            campaigns (
              id, name, description, type,
              flat_amount, cover_emoji, cover_color,
              content_due_at, publish_window_start,
              publish_window_end, start_at,
              brief_pdf_url, contract_pdf_url,
              requires_contract, content_tags,
              brands (
                company_name, logo_url,
                phone_whatsapp, website
              ),
              campaign_products (
                id, name, value, image_url
              )
            )
          `,
        )
        .eq("influencer_id", inf.id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false });

      const rows = Array.isArray(data)
        ? data.map((r) => normalizeActiveRow(r as Record<string, unknown>))
        : [];
      setCampaigns(rows);
      setIsLoading(false);
    })();
  }, [isLoaded, userId]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#2b2ef8]" />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="w-full">
        <div className="mb-5">
          <h1 className="text-xl font-black text-gray-900">Active Campaigns</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Your accepted collaborations and what you need to deliver
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div
            className="flex flex-col items-center rounded-2xl border border-gray-100
            bg-white px-6 py-16 text-center shadow-sm h-60"
          >
            <Rocket size={28} className="mb-3 text-gray-200" />
            <p className="mb-1 text-sm font-medium text-gray-500">
              No active campaigns yet
            </p>
            <p className="text-xs text-gray-400">
              Accepted offers will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((ci, i) => {
              const campaign = ci.campaigns;
              const brand = campaign?.brands;
              const daysLeft = daysUntil(campaign?.content_due_at ?? null);
              const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;
              const isOverdue = daysLeft !== null && daysLeft < 0;
              const websiteHref = brandWebsiteHref(brand?.website ?? null);

              return (
                <m.div
                  key={ci.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-4 border-b border-gray-50 px-5 py-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                      style={{
                        background: campaign?.cover_color ?? "#6366F1",
                      }}
                    >
                      {campaign?.cover_emoji ?? "🎯"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {campaign?.name ?? "Campaign"}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <Building2 size={11} className="text-gray-400" />
                        <p className="text-xs text-gray-400">
                          {brand?.company_name ?? "Brand"}
                        </p>
                      </div>
                    </div>
                    <span
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                    >
                      <CheckCircle2 size={11} />
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-5 py-4">
                    <div>
                      <p className="mb-1 text-xs text-gray-400">Your compensation</p>
                      <p className="text-sm font-bold text-gray-900">
                        {campaign?.type === "paid_with_product"
                          ? "📦 Product gifting"
                          : formatCents(
                            ci.custom_flat_amount ?? campaign?.flat_amount,
                          )}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-gray-400">Content due</p>
                      {campaign?.content_due_at ? (
                        <div className="flex items-center gap-1.5">
                          <Clock
                            size={13}
                            className={
                              isOverdue || isUrgent
                                ? "text-red-500"
                                : "text-gray-400"
                            }
                          />
                          <p
                            className={cn(
                              "text-sm font-bold",
                              isOverdue || isUrgent
                                ? "text-red-600"
                                : "text-gray-900",
                            )}
                          >
                            {daysLeft === 0
                              ? "Today!"
                              : daysLeft === 1
                                ? "Tomorrow"
                                : daysLeft !== null && daysLeft < 0
                                  ? "Overdue"
                                  : new Date(
                                    campaign.content_due_at,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                          </p>
                          {isUrgent &&
                            daysLeft !== null &&
                            daysLeft > 0 && (
                              <span className="text-xs font-medium text-red-500">
                                ({daysLeft}d left)
                              </span>
                            )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Not specified</p>
                      )}
                    </div>

                    {campaign?.publish_window_start && (
                      <div className="col-span-2">
                        <p className="mb-1 text-xs text-gray-400">Publish window</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(
                            campaign.publish_window_start,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {campaign?.publish_window_end && " → "}
                          {campaign?.publish_window_end &&
                            new Date(
                              campaign.publish_window_end,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                        </p>
                      </div>
                    )}
                  </div>

                  {isOverdue && campaign?.content_due_at && (
                    <div
                      className="mx-5 mb-4 flex items-center gap-2 rounded-xl border border-red-200
                      bg-red-50 px-3 py-2.5"
                    >
                      <AlertCircle size={14} className="shrink-0 text-red-500" />
                      <p className="text-xs font-semibold text-red-600">
                        Content due date has passed — follow up with the brand if
                        needed.
                      </p>
                    </div>
                  )}

                  {isUrgent &&
                    daysLeft !== null &&
                    daysLeft >= 0 &&
                    !isOverdue && (
                      <div
                        className="mx-5 mb-4 flex items-center gap-2 rounded-xl border border-red-200
                        bg-red-50 px-3 py-2.5"
                      >
                        <AlertCircle size={14} className="shrink-0 text-red-500" />
                        <p className="text-xs font-semibold text-red-600">
                          Content due{" "}
                          {daysLeft === 0
                            ? "today"
                            : `in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}{" "}
                          — don&apos;t forget to post!
                        </p>
                      </div>
                    )}

                  <div className="flex flex-wrap gap-2 px-5 pb-4">
                    {campaign?.brief_pdf_url && (
                      <a
                        href={campaign.brief_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-[#2b2ef8] hover:text-[#2b2ef8]"
                      >
                        <FileText size={12} />
                        View Brief
                      </a>
                    )}
                    {campaign?.contract_pdf_url && (
                      <a
                        href={campaign.contract_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-[#2b2ef8] hover:text-[#2b2ef8]"
                      >
                        <FileText size={12} />
                        View Contract
                      </a>
                    )}
                    {websiteHref && (
                      <a
                        href={websiteHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-[#2b2ef8] hover:text-[#2b2ef8]"
                      >
                        <ExternalLink size={12} />
                        Brand Website
                      </a>
                    )}
                  </div>
                </m.div>
              );
            })}
          </div>
        )}
      </div>
    </LazyMotion>
  );
}
