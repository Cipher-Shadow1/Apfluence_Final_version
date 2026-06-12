"use client";
import { NormalizedInfluencer as Influencer, NormalizedPost as MockPost } from "./influencer-side-panel.types";
import { type RowPlatform } from "./influencer-side-panel.types";
import {
  formatEngagementPercent,
  formatStatValue,
  getMetric,
  platformConfig,
} from "./influencer-side-panel.utils";
import { InfluencerSidePanelStatColumn } from "./InfluencerSidePanelStatColumn";
import { PlatformPostsScrollRail } from "./PlatformPostsScrollRail";
import { cn } from "@/components/ui/utils";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Eye,
  Heart,
  Info,
  MessageCircle,
  Share2,
} from "lucide-react";

export interface InfluencerSidePanelPlatformRowProps {
  platform: RowPlatform;
  influencer: Influencer;
  /** Mock posts for this row only (same platform, max 4); parent may pass []. */
  posts: MockPost[];
  isExpanded: boolean;
  onToggle: () => void;
}

function cardPlatform(
  platform: RowPlatform,
): "instagram" | "tiktok" | "youtube" | "x" | null {
  if (platform === "twitch") return null;
  return platform;
}

export function InfluencerSidePanelPlatformRow({
  platform,
  influencer,
  posts,
  isExpanded,
  onToggle,
}: InfluencerSidePanelPlatformRowProps) {
  const metric = getMetric(influencer, platform);
  const cardPlat = cardPlatform(platform);
  const recentPosts = posts;

  if (process.env.NODE_ENV !== "production") {
    console.info("[SidePanelRow] platform render check", {
      influencerId: influencer.id,
      platform,
      hasMetric: !!metric,
      incomingPosts: recentPosts.length,
      cardPlatform: cardPlat,
    });
  }

  if (!metric && recentPosts.length === 0) return null;

  const config = platformConfig[platform];
  const Icon = config.icon;

  const hasRenderablePosts = recentPosts.length > 0 && cardPlat != null;

  const resolveMetricCpv = () => {
    if (!metric) return null;
    if (metric.cpv != null && Number.isFinite(metric.cpv) && metric.cpv > 0) {
      return metric.cpv;
    }
    if (
      metric.cpe == null ||
      !Number.isFinite(metric.cpe) ||
      metric.cpe <= 0 ||
      metric.avgViews == null ||
      !Number.isFinite(metric.avgViews) ||
      metric.avgViews <= 0
    ) {
      return null;
    }
    const interactions =
      (metric.avgLikes ?? 0) + (metric.avgComments ?? 0) + (metric.avgShares ?? 0);
    if (interactions <= 0) return null;
    return (metric.cpe * interactions) / metric.avgViews;
  };

  const handleClass =
    platform === "instagram"
      ? "text-[var(--color-platform-instagram)]"
      : platform === "tiktok"
        ? "text-gray-900"
        : platform === "youtube"
          ? "text-[var(--color-platform-youtube)]"
          : "text-[var(--color-platform-twitch)]";

  const platformStyles: Record<
    RowPlatform,
    { rowBg: string; badgeBg: string }
  > = {
    instagram: {
      rowBg: "bg-[var(--color-bg-platform-instagram-soft)]",
      badgeBg:
        "bg-gradient-to-br from-[var(--color-platform-instagram-start)] via-[var(--color-platform-instagram-mid)] to-[var(--color-platform-instagram-end)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
    },
    tiktok: {
      rowBg: "bg-[var(--color-bg-surface-muted)]",
      badgeBg: "bg-[var(--color-platform-tiktok)]",
    },
    youtube: {
      rowBg: "bg-[var(--color-bg-platform-youtube-soft)]",
      badgeBg: "bg-[var(--color-platform-youtube)]",
    },
    twitch: {
      rowBg: "bg-[var(--color-bg-platform-twitch-soft)]",
      badgeBg: "bg-[var(--color-platform-twitch)]",
    },
    x: {
      rowBg: "bg-gray-50",
      badgeBg: "bg-black",
    },
  };

  /* ------------------------------------------------------------------ */
  /*  Platform-specific stat columns for the top row                     */
  /* ------------------------------------------------------------------ */

  function renderTopRowStats() {
    if (!metric) {
      return (
        <>
          <InfluencerSidePanelStatColumn value="—" label="Avg. engagement rate" />
          <InfluencerSidePanelStatColumn value="—" label="Pricing" />
          <InfluencerSidePanelStatColumn value="—" label="Avg. views" />
          <InfluencerSidePanelStatColumn value="—" label="Avg. likes" />
        </>
      );
    }

    const m = metric;
    if (platform === "instagram") {
      const igCpv =
        m.cpv != null && Number.isFinite(m.cpv) && m.cpv > 0
          ? m.cpv
          : resolveMetricCpv();
      return (
        <>
          <InfluencerSidePanelStatColumn
            value={`${formatEngagementPercent(m.engagement)}%`}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. engagement rate <Info className="h-3 w-3" />
              </span>
            }
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(m.cpe)}
            label="CPE"
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(igCpv)}
            label="CPV"
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(m.avgLikes)}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. likes <Heart className="size-3.5 text-gray-500" />
              </span>
            }
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(m.avgComments)}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. comments{" "}
                <MessageCircle className="size-3.5 text-gray-500" />
              </span>
            }
          />
        </>
      );
    }

    if (platform === "tiktok") {
      const ttCpv =
        m.cpv != null && Number.isFinite(m.cpv) && m.cpv > 0
          ? m.cpv
          : resolveMetricCpv();
      return (
        <>
          <InfluencerSidePanelStatColumn
            value={`${formatEngagementPercent(m.engagement)}%`}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. engagement rate <Info className="h-3 w-3" />
              </span>
            }
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(m.avgViews)}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. views <Eye className="size-3.5 text-gray-500" />
              </span>
            }
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(ttCpv)}
            label="CPV"
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(m.avgLikes)}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. likes <Heart className="size-3.5 text-gray-500" />
              </span>
            }
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(m.avgShares)}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. shares <Share2 className="size-3.5 text-gray-500" />
              </span>
            }
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(m.avgComments)}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. comments{" "}
                <MessageCircle className="size-3.5 text-gray-500" />
              </span>
            }
          />
        </>
      );
    }

    if (platform === "youtube") {
      const youtubeCpv =
        m.cpv != null && Number.isFinite(m.cpv) && m.cpv > 0
          ? m.cpv
          : resolveMetricCpv();
      return (
        <>
          <InfluencerSidePanelStatColumn
            value={`${formatEngagementPercent(m.engagement)}%`}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. engagement rate <Info className="h-3 w-3" />
              </span>
            }
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(youtubeCpv)}
            label="CPV"
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(m.avgViews)}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. views <Eye className="size-3.5 text-gray-500" />
              </span>
            }
          />
          <InfluencerSidePanelStatColumn
            value={formatStatValue(m.avgLikes)}
            label={
              <span className="inline-flex items-center gap-1">
                Avg. likes <Heart className="size-3.5 text-gray-500" />
              </span>
            }
          />
        </>
      );
    }

    return null;
  }

  return (
    <div className={cn("flex flex-col w-full", platformStyles[platform].rowBg)}>
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TOP ROW — always visible, never moves                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-0 whitespace-nowrap">
        {/* ── LEFT: Platform badge (icon + followers + label) ── */}
        <div
          className={cn(
            "w-[90px] shrink-0 self-stretch rounded-r-lg py-3 px-2 text-white flex flex-col items-center justify-center gap-1",
            platformStyles[platform].badgeBg,
          )}
        >
          <Icon className="h-5 w-5" />
          <p className="text-xl font-bold leading-none">
            {formatStatValue(metric?.followers)}
          </p>
          <p className="text-[11px] text-white/90">{config.label}</p>
        </div>

        {/* ── MIDDLE: Handle + Price + Stats ── */}
        <div className="min-w-0 flex-1 flex items-center gap-6 px-4 py-3">
          {/* Handle */}
          <a
            href="#"
            className={`inline-flex items-center gap-1 text-sm font-medium hover:underline shrink-0 ${handleClass}`}
          >
            {metric?.handle ?? influencer.username}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>

          {/* Est. price range pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 shrink-0">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            <span className="select-none">
              {metric?.estimatedPriceRange ?? "—"}
            </span>
          </span>

          {/* Stat columns: each is value (bold) over label (gray) */}
          {renderTopRowStats()}
        </div>

        {/* ── RIGHT: Chevron toggle ── */}
        <button
          onClick={onToggle}
          className="shrink-0 inline-flex size-8 items-center justify-center rounded-md text-zinc-600 hover:bg-white/80 mr-3"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* EXPANDABLE SECTION — only this appears/disappears             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {hasRenderablePosts && (
            <div className="min-w-0 mt-2">
              <PlatformPostsScrollRail
                posts={recentPosts}
                cardPlatform={cardPlat}
                authorUsername={metric?.handle || influencer.username}
                scrollKey={`${influencer.id}-${platform}`}
              />
            </div>
          )}

          {!hasRenderablePosts && (
            <p className="mt-3 text-sm text-zinc-500">
              No posts found for this social media.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
