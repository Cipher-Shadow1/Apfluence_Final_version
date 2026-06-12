"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";
import { LazyMotion, domAnimation, m } from "framer-motion";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: LucideIcon }
> = {
  pending: {
    label: "Pending",
    color: "text-gray-600",
    bg: "bg-gray-100",
    icon: Clock,
  },
  email_sent: {
    label: "New Offer",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: Mail,
  },
  viewed: {
    label: "Viewed",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    icon: Mail,
  },
  accepted: {
    label: "Accepted",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle2,
  },
  declined: {
    label: "Declined",
    color: "text-red-500",
    bg: "bg-red-50",
    icon: XCircle,
  },
  no_response: {
    label: "No Reply",
    color: "text-gray-400",
    bg: "bg-gray-50",
    icon: Clock,
  },
};

type InfluencerRow = {
  id: string;
  name: string;
  first_name: string;
  avatar_url: string | null;
};

type BrandEmbed = { company_name: string; logo_url: string | null } | null;

type CampaignEmbed = {
  id: string;
  name: string;
  cover_emoji: string | null;
  cover_color: string | null;
  type: string;
  flat_amount: number | null;
  brands: BrandEmbed;
} | null;

type SupabaseBrandEmbed = { company_name: string; logo_url: string | null }[];

type SupabaseCampaignEmbed = {
  id: string;
  name: string;
  cover_emoji: string | null;
  cover_color: string | null;
  type: string;
  flat_amount: number | null;
  brands: SupabaseBrandEmbed;
}[];

type OfferRow = {
  id: string;
  status: string;
  apply_status: string | null;
  created_at: string;
  campaigns: CampaignEmbed;
};

type SupabaseOfferRow = {
  id: string;
  status: string;
  apply_status: string | null;
  created_at: string;
  campaigns: SupabaseCampaignEmbed;
};

type OfferStatsRow = {
  status: string;
  apply_status: string | null;
};

function normalizeOfferRow(row: SupabaseOfferRow): OfferRow {
  const campaign = row.campaigns?.[0];
  return {
    id: row.id,
    status: row.status,
    apply_status: row.apply_status,
    created_at: row.created_at,
    campaigns: campaign
      ? {
          id: campaign.id,
          name: campaign.name,
          cover_emoji: campaign.cover_emoji,
          cover_color: campaign.cover_color,
          type: campaign.type,
          flat_amount: campaign.flat_amount,
          brands: campaign.brands?.[0] ?? null,
        }
      : null,
  };
}

export default function InfluencerHomePage() {
  const { userId, firstName, isLoaded } = useSupabaseUser();
  const router = useRouter();
  const [influencer, setInfluencer] = useState<InfluencerRow | null>(null);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [statsRows, setStatsRows] = useState<OfferStatsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const supabase = createClient();

    void (async () => {
      const { data: inf } = await supabase
        .from("influencers")
        .select("id, name, first_name, avatar_url")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (!inf) {
        setInfluencer(null);
        setOffers([]);
        setStatsRows([]);
        setIsLoading(false);
        return;
      }

      setInfluencer(inf as InfluencerRow);

      const influencerId = inf.id;

      const [statsResult, recentResult] = await Promise.all([
        supabase
          .from("campaign_influencers")
          .select("status, apply_status")
          .eq("influencer_id", influencerId),
        supabase
          .from("campaign_influencers")
          .select(
            `
            id, status, apply_status, created_at,
            campaigns (
              id, name, cover_emoji, cover_color,
              type, flat_amount,
              brands ( company_name, logo_url )
            )
          `,
          )
          .eq("influencer_id", influencerId)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setStatsRows((statsResult.data as OfferStatsRow[]) ?? []);
      setOffers(((recentResult.data as SupabaseOfferRow[]) ?? []).map(normalizeOfferRow));
      setIsLoading(false);
    })();
  }, [isLoaded, userId]);

  const stats = {
    total: statsRows.length,
    accepted: statsRows.filter((o) => o.status === "accepted").length,
    declined: statsRows.filter((o) => o.status === "declined").length,
    pending: statsRows.filter(
      (o) => o.status === "email_sent" && !o.apply_status,
    ).length,
  };

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
        {/* Greeting */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-black text-gray-900">
            {getGreeting()}, {influencer?.first_name ?? firstName ?? "Creator"}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Here&apos;s what&apos;s happening with your collaborations.
          </p>
        </m.div>

        {/* Pending offers alert */}
        {stats.pending > 0 && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-5 flex cursor-pointer items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3"
            onClick={() => router.push("/influencer/offers")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push("/influencer/offers");
              }
            }}
            role="button"
            tabIndex={0}
          >
            <AlertCircle size={18} className="shrink-0 text-[#2b2ef8]" />
            <p className="flex-1 text-sm font-semibold text-[#2b2ef8]">
              You have {stats.pending} new offer
              {stats.pending !== 1 ? "s" : ""} waiting for your response
            </p>
            <ChevronRight size={16} className="text-[#2b2ef8]" />
          </m.div>
        )}

        {/* Quick stats */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            {
              label: "Total Offers",
              value: stats.total,
              color: "text-gray-800",
              bg: "bg-white",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Accepted",
              value: stats.accepted,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Declined",
              value: stats.declined,
              color: "text-red-500",
              bg: "bg-red-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-2xl border border-gray-100 p-4 text-center shadow-sm",
                stat.bg,
              )}
            >
              <p className={cn("text-2xl font-black", stat.color)}>
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs font-medium text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </m.div>

        {/* Recent offers */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <h2 className="text-sm font-bold text-gray-800">Recent Offers</h2>
            <button
              type="button"
              onClick={() => router.push("/influencer/offers")}
              className="flex items-center gap-1 text-xs font-semibold text-[#2b2ef8] hover:underline"
            >
              View all
              <ChevronRight size={12} />
            </button>
          </div>

          {offers.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Mail size={28} className="mb-3 text-gray-200" />
              <p className="mb-1 text-sm font-medium text-gray-500">
                No offers yet
              </p>
              <p className="text-xs text-gray-400">
                Brands will send you campaign offers here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {offers.map((offer) => {
                const campaign = offer.campaigns;
                const brand = campaign?.brands;
                const config =
                  STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={offer.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push("/influencer/offers")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push("/influencer/offers");
                      }
                    }}
                    className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gray-50"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg shadow-sm"
                      style={{
                        background: campaign?.cover_color ?? "#6366F1",
                      }}
                    >
                      {campaign?.cover_emoji ?? "🎯"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {campaign?.name ?? "Campaign"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {brand?.company_name ?? "Brand"} •{" "}
                        {timeAgo(offer.created_at)}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                        config.color,
                        config.bg,
                      )}
                    >
                      <StatusIcon size={10} />
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </m.div>
      </div>
    </LazyMotion>
  );
}
