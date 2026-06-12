"use client";

import { useState, useEffect, useMemo } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  Calendar,
  ChevronRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

type FilterStatus = "all" | "email_sent" | "accepted" | "declined" | "countered";

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "email_sent", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
  { key: "countered", label: "Countered" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: "Pending",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
  email_sent: {
    label: "New Offer",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  viewed: {
    label: "Viewed",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  accepted: {
    label: "Accepted",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  declined: {
    label: "Declined",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  no_response: {
    label: "No Response",
    color: "text-gray-400",
    bg: "bg-gray-50",
    border: "border-gray-100",
  },
};

function formatCents(cents: number | null | undefined): string {
  if (cents == null || cents === 0) return "—";
  return `$${(cents / 100).toLocaleString()}`;
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type BrandEmbed = {
  company_name: string;
  logo_url: string | null;
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
  email_subject: string | null;
  start_at: string | null;
  content_due_at: string | null;
  brands: BrandEmbed;
  campaign_products: ProductEmbed[] | null;
} | null;

type OfferRow = {
  id: string;
  status: string;
  apply_status: string | null;
  token: string;
  email_sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  counter_offer_amount: number | null;
  application_note: string | null;
  created_at?: string;
  campaigns: CampaignEmbed;
};

/** PostgREST may return nested FK rows as a single object or a one-element array. */
function normalizeOfferRow(row: Record<string, unknown>): OfferRow {
  const rawCamp = row.campaigns;
  const camp = Array.isArray(rawCamp) ? rawCamp[0] : rawCamp;
  if (!camp || typeof camp !== "object") {
    return { ...(row as unknown as OfferRow), campaigns: null };
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
    email_subject: (c.email_subject as string | null) ?? null,
    start_at: (c.start_at as string | null) ?? null,
    content_due_at: (c.content_due_at as string | null) ?? null,
    brands: (brand as BrandEmbed) ?? null,
    campaign_products: Array.isArray(products)
      ? (products as ProductEmbed[])
      : null,
  };
  return { ...(row as unknown as Omit<OfferRow, "campaigns">), campaigns: campaign };
}

export default function InfluencerOffersPage() {
  const { userId, isLoaded } = useSupabaseUser();
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

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
        setOffers([]);
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("campaign_influencers")
        .select(
          `
            id, status, apply_status, token,
            email_sent_at, viewed_at, responded_at,
            counter_offer_amount, application_note, created_at,
            campaigns (
              id, name, description, type,
              flat_amount, cover_emoji, cover_color,
              email_subject, start_at, content_due_at,
              brands (
                company_name, logo_url, website
              ),
              campaign_products (
                id, name, value, image_url
              )
            )
          `,
        )
        .eq("influencer_id", inf.id)
        .order("created_at", { ascending: false });

      const rows = Array.isArray(data)
        ? data.map((r) => normalizeOfferRow(r as Record<string, unknown>))
        : [];
      setOffers(rows);
      setIsLoading(false);
    })();
  }, [isLoaded, userId]);

  const filteredOffers = useMemo(() => {
    if (activeFilter === "all") return offers;
    if (activeFilter === "countered") {
      return offers.filter((o) => o.apply_status === "countered");
    }
    return offers.filter((o) => o.status === activeFilter);
  }, [offers, activeFilter]);

  const counts = useMemo(
    () => ({
      all: offers.length,
      email_sent: offers.filter((o) => o.status === "email_sent").length,
      accepted: offers.filter((o) => o.status === "accepted").length,
      declined: offers.filter((o) => o.status === "declined").length,
      countered: offers.filter((o) => o.apply_status === "countered").length,
    }),
    [offers],
  );

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
          <h1 className="text-xl font-black text-gray-900">Offers</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            All brand campaign offers sent to you
          </p>
        </div>

        <div className="mb-5 flex gap-1 rounded-xl bg-gray-100 p-1">
          {FILTER_TABS.map((tab) => {
            const count = counts[tab.key];
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5",
                  "rounded-lg py-2 text-sm font-medium transition-all",
                  activeFilter === tab.key
                    ? "bg-white text-[#2b2ef8] shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs font-bold",
                      activeFilter === tab.key
                        ? "bg-[#2b2ef8]/10 text-[#2b2ef8]"
                        : "bg-gray-200 text-gray-600",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filteredOffers.length === 0 ? (
          <div
            className="flex flex-col items-center rounded-2xl border border-gray-100
            bg-white px-6 py-16 text-center shadow-sm"
          >
            <Mail size={28} className="mb-3 text-gray-200" />
            <p className="mb-1 text-sm font-medium text-gray-500">
              No offers in this category
            </p>
            <p className="text-xs text-gray-400">
              Brands will send you campaign offers here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredOffers.map((offer, i) => {
                const campaign = offer.campaigns;
                const brand = campaign?.brands;
                const config =
                  STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending;
                const isNew =
                  offer.status === "email_sent" && !offer.apply_status;

                return (
                  <m.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-white shadow-sm",
                      isNew
                        ? "border-blue-200 shadow-blue-50"
                        : "border-gray-100",
                    )}
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
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {campaign?.name ?? "Campaign"}
                          </p>
                          {isNew && (
                            <span className="shrink-0 rounded-md bg-blue-500 px-1.5 py-0.5 text-xs font-bold text-white">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          From {brand?.company_name ?? "Brand"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs font-semibold",
                            config.color,
                            config.bg,
                            config.border,
                          )}
                        >
                          {config.label}
                        </span>

                        {isNew && offer.token && (
                          <a
                            href={`/apply/${offer.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-xl bg-[#2b2ef8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1a1ce8]"
                          >
                            <Eye size={12} />
                            View Offer
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 px-5 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400">Offer</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {campaign?.type === "paid_with_product"
                              ? "📦 Product gifting"
                              : formatCents(campaign?.flat_amount)}
                          </p>
                        </div>
                      </div>

                      {offer.counter_offer_amount != null &&
                        offer.counter_offer_amount > 0 && (
                          <div className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-400">
                                Your counter
                              </p>
                              <p className="text-sm font-semibold text-[#2b2ef8]">
                                {formatCents(offer.counter_offer_amount)}
                              </p>
                            </div>
                          </div>
                        )}

                      {campaign?.content_due_at && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-400">Content due</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {new Date(campaign.content_due_at).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="ml-auto">
                        <p className="text-right text-xs text-gray-400">
                          Received{" "}
                          {timeAgo(
                            offer.email_sent_at ?? offer.created_at ?? "",
                          )}
                        </p>
                      </div>
                    </div>

                    {offer.application_note && (
                      <div className="px-5 pb-4">
                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                          <p className="mb-0.5 text-xs font-medium text-gray-500">
                            Your message:
                          </p>
                          <p className="text-xs leading-relaxed text-gray-600">
                            {offer.application_note}
                          </p>
                        </div>
                      </div>
                    )}
                  </m.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </LazyMotion>
  );
}
