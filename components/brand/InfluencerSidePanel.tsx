"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { NormalizedInfluencer as Influencer, NormalizedPost as MockPost } from "./sidepanel/influencer-side-panel.types";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { InfluencerSidePanelTabBar } from "./sidepanel/InfluencerSidePanelTabBar";
import { InfluencerSidePanelHeader } from "./sidepanel/InfluencerSidePanelHeader";
import { InfluencerSidePanelPlatformRow } from "./sidepanel/InfluencerSidePanelPlatformRow";
import {
  PLATFORM_ORDER,
  getCountryName,
} from "./sidepanel/influencer-side-panel.utils";
import { type RowPlatform } from "./sidepanel/influencer-side-panel.types";
import SaveToListButton from "./sidepanel/SaveToListButton";
import { OutreachTab } from "./sidepanel/OutreachTab";
import { InfluencerCommercialReadOnly } from "@/components/influencer/InfluencerCommercialReadOnly";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";
import { getInfluencerPostsAdmin } from "@/lib/queries/posts";
import { cn } from "@/lib/utils";
import { pdfPreviewEmbedSrc } from "@/lib/pdf-preview";
import { FileText, Layers, Maximize2, Upload, X, Youtube } from "lucide-react";

function isVideoUrl(url: string): boolean {
  const raw = url.toLowerCase();
  return (
    raw.includes("/video/upload/") ||
    raw.endsWith(".mp4") ||
    raw.endsWith(".mov") ||
    raw.endsWith(".webm")
  );
}

function isImageUrl(url: string): boolean {
  const raw = url.toLowerCase();
  return (
    raw.includes("/image/upload/") ||
    raw.endsWith(".jpg") ||
    raw.endsWith(".jpeg") ||
    raw.endsWith(".png") ||
    raw.endsWith(".webp") ||
    raw.endsWith(".gif")
  );
}

function isPdfUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes(".pdf") || u.includes("/pdf");
}

function draftTypeLabel(type: unknown): { label: string; Icon: typeof Upload } {
  const t = String(type ?? "media").toLowerCase();
  if (t === "youtube") return { label: "YouTube", Icon: Youtube };
  if (t === "blog") return { label: "Blog", Icon: FileText };
  return { label: "Media", Icon: Upload };
}

function formatDraftWhen(iso: string | undefined): string {
  if (!iso) return "Unknown date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Up to 4 mock posts for the given channel row (empty when no data or Twitch). */
function normalizePostPlatform(value: string): RowPlatform | null {
  const key = value.trim().toLowerCase();
  if (!key) return null;
  if (key.includes("instagram") || key === "insta" || key.startsWith("ig"))
    return "instagram";
  if (key.includes("tiktok") || key.includes("tik tok") || key.startsWith("tt"))
    return "tiktok";
  if (
    key.includes("youtube") ||
    key.includes("you tube") ||
    key.startsWith("yt")
  )
    return "youtube";
  if (
    key === "x" ||
    key.includes("twitter") ||
    key.includes("x (twitter)") ||
    key.includes("x/twitter")
  )
    return "x";
  if (key.includes("twitch")) return "twitch";
  return null;
}

function postsForSidePanelRow(
  posts: Influencer["posts"],
  row: RowPlatform,
): MockPost[] {
  if (row === "twitch") return [];
  const list = posts ?? [];
  return list
    .filter((p) => normalizePostPlatform(String(p.platform ?? "")) === row);
}

function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return "unknown";
  const now = new Date();
  const posted = new Date(timestamp);
  if (Number.isNaN(posted.getTime())) return "unknown";
  const diffMs = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "a week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "a month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function inferPlatformFromUrl(urlValue: unknown): RowPlatform | null {
  if (typeof urlValue !== "string" || !urlValue.trim()) return null;
  const raw = urlValue.trim().toLowerCase();
  if (raw.includes("instagram.com")) return "instagram";
  if (raw.includes("tiktok.com")) return "tiktok";
  if (raw.includes("youtube.com") || raw.includes("youtu.be")) return "youtube";
  if (raw.includes("twitter.com") || raw.includes("x.com")) return "x";
  if (raw.includes("twitch.tv")) return "twitch";
  return null;
}

function inferPlatformFromIdValue(value: unknown): RowPlatform | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim().toLowerCase();
  if (raw.includes("insta") || raw.startsWith("ig")) return "instagram";
  if (raw.includes("tiktok") || raw.includes("tt")) return "tiktok";
  if (raw.includes("youtube") || raw.includes("yt")) return "youtube";
  if (raw.includes("twitter") || raw.includes("tweet") || raw.includes("x_"))
    return "x";
  if (raw.includes("twitch")) return "twitch";
  return null;
}

function inferPlatformFromPlatformId(value: unknown): RowPlatform | null {
  const id = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(id)) return null;
  // Default schema ids in this project migrations.
  if (id === 1) return "instagram";
  if (id === 2) return "tiktok";
  if (id === 3) return "youtube";
  if (id === 4) return "x";
  if (id === 5) return "twitch";
  return null;
}

function normalizeDbPostToMockPost(
  post: any,
  influencerId: string,
  platformNameFromId?: string | null,
  platformDisplayNameFromId?: string | null,
): MockPost {
  const rowPlatform =
    normalizePostPlatform(
      String(platformNameFromId ?? platformDisplayNameFromId ?? post?.platform ?? ""),
    ) ??
    inferPlatformFromPlatformId(post?.platform_id) ??
    inferPlatformFromUrl(post?.post_url) ??
    inferPlatformFromIdValue(post?.post_platform_id);
  const platform = rowPlatform ?? "instagram";
  return {
    id:
      typeof post?.id === "string" && post.id
        ? post.id
        : `${influencerId}-${platform}-${String(post?.post_platform_id ?? "post")}`,
    platform,
    thumbnailUrl: typeof post?.thumbnail_url === "string" ? post.thumbnail_url : "",
    caption: typeof post?.caption === "string" ? post.caption : "",
    likes: asNumber(post?.likes, 0),
    comments: asNumber(post?.comments, 0),
    views: asNullableNumber(post?.views),
    shares: asNullableNumber(post?.shares),
    estimatedImpressions: asNullableNumber(post?.estimated_impressions),
    estimatedReach: asNullableNumber(post?.estimated_reach),
    engagementRate: asNumber(post?.engagement_rate, 0),
    cpe: asNullableNumber(post?.cpe),
    postedAt: formatRelativeTime(String(post?.posted_at ?? "")),
  };
}

export interface InfluencerSidePanelProps {
  /** The full influencer data object, or null if nothing is selected */
  influencer: Influencer | null;
  /** Whether the side panel is currently sliding out / open */
  isOpen: boolean;
  /** Callback fired when the background overlay or close button is clicked */
  onClose: () => void;
  campaignContext?: {
    campaignName?: string | null;
    campaignInfluencer?: any;
    campaign?: any;
    onApproveDraft?: () => Promise<void> | void;
    onRejectDraft?: () => Promise<void> | void;
  };
}

export function InfluencerSidePanel({
  influencer,
  isOpen,
  onClose,
  campaignContext,
}: InfluencerSidePanelProps) {
  const { userId } = useSupabaseUser();
  const [dbPosts, setDbPosts] = useState<MockPost[] | null>(null);
  const [expanded, setExpanded] = useState<Record<RowPlatform, boolean>>({
    instagram: true,
    tiktok: true,
    youtube: true,
    twitch: true,
    x: true,
  });
  const [activeTab, setActiveTab] = useState<string>(
    campaignContext ? "campaign" : "channels",
  );

  const countryName = useMemo(
    () => (influencer ? getCountryName(influencer.location.countryCode || "") : ""),
    [influencer],
  );

  useEffect(() => {
    let cancelled = false;
    if (!influencer?.id) {
      setDbPosts(null);
      return;
    }

    (async () => {
      if (process.env.NODE_ENV !== "production") {
        console.info("[SidePanelFetch] start", {
          influencerId: influencer.id,
          influencerUsername: influencer.username,
          panelOpen: isOpen,
        });
      }

      const data = await getInfluencerPostsAdmin(influencer.id);

      if (cancelled) return;
      if (!data) {
        console.error("[SidePanel] failed to load influencer_posts", {
          influencerId: influencer.id,
        });
        setDbPosts(null);
        return;
      }

      const normalized = (data ?? []).map((post: any) => {
          const joinedPlatform = Array.isArray(post.platforms)
            ? post.platforms[0]
            : post.platforms;
          const platformName = joinedPlatform?.name ?? null;
          const platformDisplayName = joinedPlatform?.display_name ?? null;
          return normalizeDbPostToMockPost(
            post,
            influencer.id,
            platformName,
            platformDisplayName,
          );
        });
      setDbPosts(normalized);

      if (process.env.NODE_ENV !== "production") {
        const counts = normalized.reduce<Record<string, number>>((acc, p) => {
          acc[p.platform] = (acc[p.platform] ?? 0) + 1;
          return acc;
        }, {});
        console.info("[SidePanelFetch] success", {
          influencerId: influencer.id,
          rawRows: (data ?? []).length,
          normalizedRows: normalized.length,
          countsByPlatform: counts,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [influencer?.id, influencer?.username, isOpen]);

  const effectivePosts = dbPosts ?? influencer?.posts ?? [];

  const postsByPlatform = useMemo(() => {
    const acc: Record<string, number> = {};
    effectivePosts.forEach((p) => {
      acc[p.platform] = (acc[p.platform] ?? 0) + 1;
    });
    return acc;
  }, [effectivePosts]);
  const [isReviewingDraft, setIsReviewingDraft] = useState(false);

  const ciForDrafts = campaignContext?.campaignInfluencer;
  const draftsNewestFirst = useMemo(() => {
    const raw = ciForDrafts?.draft_submissions;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return [...raw].sort((a: any, b: any) => {
      const ta = new Date(a?.created_at ?? 0).getTime();
      const tb = new Date(b?.created_at ?? 0).getTime();
      return tb - ta;
    });
  }, [ciForDrafts?.draft_submissions]);

  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [heroMediaIndex, setHeroMediaIndex] = useState(0);
  const [mediaLightbox, setMediaLightbox] = useState<string | null>(null);
  /** Deferred PDF avoids browser auto-download triggered by embedding object/iframe immediately. */
  const [contractPdfInlineOpen, setContractPdfInlineOpen] = useState(false);

  useEffect(() => {
    setSelectedDraftIndex(0);
    setHeroMediaIndex(0);
  }, [ciForDrafts?.id]);

  useEffect(() => {
    setHeroMediaIndex(0);
  }, [selectedDraftIndex]);

  useEffect(() => {
    setContractPdfInlineOpen(false);
  }, [
    isOpen,
    influencer?.id,
    (ciForDrafts as { signed_contract_url?: string } | null)?.signed_contract_url,
    (ciForDrafts as { signedContractUrl?: string } | null)?.signedContractUrl,
  ]);

  if (process.env.NODE_ENV !== "production" && influencer) {
    console.info("[SidePanel] influencer posts summary", {
      influencerId: influencer.id,
      totalPosts: effectivePosts.length,
      postsByPlatform,
      metricPlatforms: (influencer.metrics ?? []).map((m) => m.platform),
      source: dbPosts ? "db" : "prefetched",
    });
  }

  if (!influencer) return null;

  const panelTabs = campaignContext
    ? (["campaign", "channels", "outreach", "profile"] as const)
    : (["channels", "outreach", "profile"] as const);

  const ci = campaignContext?.campaignInfluencer ?? null;
  const selectedProductIds: string[] = Array.isArray(ci?.selected_product_ids)
    ? ci.selected_product_ids
    : [];
  const selectedProducts = (campaignContext?.campaign?.campaign_products ?? []).filter((p: any) =>
    selectedProductIds.includes(p.id),
  );
  const shippingParts = String(ci?.shipping_address ?? "").split(", ").filter(Boolean);
  const shippingName = shippingParts[0] ?? "";
  const shippingPhone = shippingParts[1] ?? "";
  const shippingAddressLine1 = shippingParts[2] ?? "";
  const shippingAddressLine2 = shippingParts.length > 5 ? shippingParts[3] : "";
  const cityStateZipRaw = shippingParts[shippingParts.length - 2] ?? "";
  const countryRaw = shippingParts[shippingParts.length - 1] ?? "";
  const cityStateZipParts = cityStateZipRaw.split(" ").filter(Boolean);
  const shippingZip = cityStateZipParts.length > 0 ? cityStateZipParts[cityStateZipParts.length - 1] : "";
  const shippingCity = cityStateZipParts.length > 1 ? cityStateZipParts.slice(0, cityStateZipParts.length - 1).join(" ") : "";
  const signedContractUrl =
    (typeof ci?.signed_contract_url === "string" && ci.signed_contract_url) ||
    (typeof ci?.signedContractUrl === "string" && ci.signedContractUrl) ||
    "";
  /** Draft review actions only while influencer is in "drafted" — once approved, status is published/paid. */
  const showDraftReviewActions = ci?.status === "drafted";
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="[&>button]:hidden p-0 gap-0 w-full sm:max-w-none sm:w-[72vw] min-w-[1100px] overflow-y-auto"
      >
        <SheetTitle className="sr-only">{influencer.name}</SheetTitle>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="gap-0"
        >
          <InfluencerSidePanelTabBar tabs={panelTabs} />
          {!(campaignContext && activeTab === "campaign") && (
            <InfluencerSidePanelHeader
              influencer={influencer}
              countryName={countryName}
            />
          )}

          {/* Save to List action */}
          {!(campaignContext && activeTab === "campaign") && (
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-end">
              <SaveToListButton influencerId={influencer.id} />
            </div>
          )}

          {campaignContext && (
            <TabsContent value="campaign" className="px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8 space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900">Campaign overview</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {campaignContext.campaignName ?? "Campaign"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                        <span className="text-gray-400">Application status</span>
                        <p className="font-medium text-gray-800">{ci?.apply_status ?? "pending"}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                        <span className="text-gray-400">Pipeline status</span>
                        <p className="font-medium text-gray-800">{ci?.status ?? "pending"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900">Drafts</h3>
                        {draftsNewestFirst.length > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800 tabular-nums">
                            <Layers size={12} className="shrink-0 opacity-80" />
                            {draftsNewestFirst.length} submission{draftsNewestFirst.length !== 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </div>
                      {showDraftReviewActions ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={isReviewingDraft}
                            onClick={async () => {
                              if (!campaignContext?.onApproveDraft) return;
                              setIsReviewingDraft(true);
                              try {
                                await campaignContext.onApproveDraft();
                              } finally {
                                setIsReviewingDraft(false);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#2020d6] text-white text-xs font-semibold hover:bg-[#1717b3] disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={isReviewingDraft}
                            onClick={async () => {
                              if (!campaignContext?.onRejectDraft) return;
                              setIsReviewingDraft(true);
                              try {
                                await campaignContext.onRejectDraft();
                              } finally {
                                setIsReviewingDraft(false);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 disabled:opacity-50"
                          >
                            Refuse
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {draftsNewestFirst.length > 0 ? (
                      (() => {
                        const dIdx = Math.min(
                          selectedDraftIndex,
                          Math.max(0, draftsNewestFirst.length - 1),
                        );
                        const draft = draftsNewestFirst[dIdx];
                        const { label: typeLabel, Icon: TypeIcon } = draftTypeLabel(draft?.type);
                        const urls: string[] = Array.isArray(draft?.media_urls) ? draft.media_urls : [];
                        const heroUrl = urls[heroMediaIndex] ?? urls[0];
                        const versionNum = draftsNewestFirst.length - dIdx;

                        return (
                          <div className="space-y-3">
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin -mx-0.5 px-0.5">
                              {draftsNewestFirst.map((_: any, i: number) => {
                                const active = i === dIdx;
                                const when = formatDraftWhen(draftsNewestFirst[i]?.created_at);
                                return (
                                  <button
                                    key={draftsNewestFirst[i]?.id ?? i}
                                    type="button"
                                    onClick={() => setSelectedDraftIndex(i)}
                                    className={cn(
                                      "shrink-0 rounded-xl border px-3 py-2 text-left transition-all min-w-[140px]",
                                      active
                                        ? "border-indigo-300 bg-gradient-to-br from-indigo-50 to-white shadow-md shadow-indigo-100/80 ring-2 ring-indigo-200/60"
                                        : "border-gray-200 bg-gray-50/80 hover:border-gray-300 hover:bg-white",
                                    )}
                                  >
                                    <p className="text-[11px] font-bold text-gray-900">
                                      {i === 0 ? "Latest" : `Earlier`}
                                      <span className="ml-1.5 tabular-nums text-indigo-600">v{draftsNewestFirst.length - i}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{when}</p>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="rounded-2xl border border-indigo-100/60 bg-gradient-to-b from-slate-50/90 to-white p-4 ring-1 ring-slate-200/60">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-800 shadow-sm">
                                  <TypeIcon size={12} className="text-indigo-600" />
                                  {typeLabel}
                                </span>
                                <span className="text-[11px] font-medium text-gray-500">
                                  Version {versionNum} of {draftsNewestFirst.length}
                                </span>
                                <span className="text-[11px] text-gray-400 ml-auto tabular-nums">
                                  {formatDraftWhen(draft?.created_at)}
                                </span>
                              </div>

                              {urls.length > 0 ? (
                                <div className="space-y-3">
                                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black shadow-inner group">
                                    {heroUrl &&
                                      (isVideoUrl(heroUrl) ? (
                                        <video
                                          src={heroUrl}
                                          controls
                                          className="max-h-[min(72vh,640px)] w-full object-contain bg-black"
                                        />
                                      ) : isImageUrl(heroUrl) ? (
                                        <button
                                          type="button"
                                          onClick={() => setMediaLightbox(heroUrl)}
                                          className="relative block w-full"
                                        >
                                          <img
                                            src={heroUrl}
                                            alt="Draft"
                                            className="max-h-[min(72vh,640px)] w-full object-contain bg-neutral-950"
                                          />
                                          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Maximize2 size={12} />
                                            Expand
                                          </span>
                                        </button>
                                      ) : (
                                        <a
                                          href={heroUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex h-40 items-center justify-center text-sm text-indigo-300 hover:underline"
                                        >
                                          Open media
                                        </a>
                                      ))}
                                    {urls.length > 1 ? (
                                      <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 overflow-x-auto bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                                        {urls.map((url: string, mi: number) => (
                                          <button
                                            key={url}
                                            type="button"
                                            onClick={() => setHeroMediaIndex(mi)}
                                            className={cn(
                                              "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                                              mi === heroMediaIndex
                                                ? "border-white ring-2 ring-indigo-400 scale-[1.02]"
                                                : "border-white/30 opacity-80 hover:opacity-100",
                                            )}
                                          >
                                            {isVideoUrl(url) ? (
                                              <video src={url} className="h-full w-full object-cover" muted />
                                            ) : (
                                              <img src={url} alt="" className="h-full w-full object-cover" />
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              ) : null}

                              {draft?.youtube_url ? (
                                <div className="rounded-xl border border-gray-200 bg-white p-3 mt-2">
                                  <p className="text-[11px] font-semibold text-gray-500 mb-1">YouTube</p>
                                  <a
                                    href={draft.youtube_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-indigo-600 hover:underline break-all"
                                  >
                                    {draft.youtube_url}
                                  </a>
                                </div>
                              ) : null}
                              {draft?.blog_url ? (
                                <div className="rounded-xl border border-gray-200 bg-white p-3 mt-2">
                                  <p className="text-[11px] font-semibold text-gray-500 mb-1">Blog post</p>
                                  <a
                                    href={draft.blog_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-indigo-600 hover:underline break-all"
                                  >
                                    {draft.blog_url}
                                  </a>
                                </div>
                              ) : null}
                              {draft?.note ? (
                                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2.5">
                                  <p className="text-[11px] font-semibold text-amber-900/80 mb-1">Note from creator</p>
                                  <p className="text-sm text-amber-950/90 whitespace-pre-wrap">{draft.note}</p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-sm text-gray-400">No draft submitted yet.</p>
                    )}
                  </div>

                  {mediaLightbox && typeof document !== "undefined"
                    ? createPortal(
                        <div
                          role="dialog"
                          aria-modal
                          aria-label="Draft media preview"
                          className="fixed inset-0 z-300 flex items-center justify-center bg-black/92 p-4"
                          onClick={() => setMediaLightbox(null)}
                        >
                          <button
                            type="button"
                            className="absolute top-4 right-4 rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white"
                            onClick={() => setMediaLightbox(null)}
                            aria-label="Close preview"
                          >
                            <X size={28} />
                          </button>
                          <div className="flex max-h-[90vh] max-w-[95vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            {isVideoUrl(mediaLightbox) ? (
                              <video src={mediaLightbox} controls className="max-h-[90vh] max-w-[95vw] object-contain" />
                            ) : (
                              <img src={mediaLightbox} alt="" className="max-h-[90vh] max-w-[95vw] object-contain" />
                            )}
                          </div>
                        </div>,
                        document.body,
                      )
                    : null}

                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-slate-200/40">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Contract</h3>
                    <div className="text-sm">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                        <span className="text-xs font-medium text-gray-500">Signed contract</span>
                        {signedContractUrl ? (
                          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-neutral-100 shadow-inner">
                            {isPdfUrl(signedContractUrl) ? (
                              <>
                                {!contractPdfInlineOpen ? (
                                  <div className="flex flex-col items-center justify-center gap-3 bg-neutral-900 min-h-[200px] px-4 py-8">
                                    <p className="text-xs text-neutral-400 text-center max-w-sm">
                                      Inline preview stays off until you load it — that avoids unwanted downloads when opening the panel.
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => setContractPdfInlineOpen(true)}
                                      className="rounded-xl bg-white text-neutral-900 text-sm font-semibold px-4 py-2 hover:bg-neutral-100"
                                    >
                                      Show PDF preview here
                                    </button>
                                  </div>
                                ) : (
                                  <iframe
                                    title="Signed contract preview"
                                    src={pdfPreviewEmbedSrc(signedContractUrl)}
                                    className="w-full min-h-[min(70vh,780px)] h-[70vh] border-0 bg-neutral-800"
                                  />
                                )}
                                <p className="border-t border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-500">
                                  Prefer not to preview in-page? Use the link below to open in a new tab only when you choose.
                                </p>
                              </>
                            ) : isImageUrl(signedContractUrl) ? (
                              <img
                                src={signedContractUrl}
                                alt="Signed contract"
                                className="w-full h-auto max-h-[min(80vh,900px)] object-contain bg-neutral-50"
                              />
                            ) : (
                              <div className="bg-white px-3 py-4">
                                <a
                                  href={signedContractUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-indigo-600 hover:underline font-medium"
                                >
                                  Open contract in new tab
                                </a>
                              </div>
                            )}
                            <a
                              href={signedContractUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center border-t border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50/50"
                            >
                              Open original file
                            </a>
                          </div>
                        ) : (
                          <p className="mt-2 font-medium text-gray-800">Not submitted</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900">Gifting history</h3>
                      <span className="text-sm text-gray-400">{selectedProducts.length} item(s)</span>
                    </div>
                    {selectedProducts.length === 0 ? (
                      <p className="text-sm text-gray-400">No gifted products selected.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedProducts.map((p: any) => (
                          <div key={p.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{p.name}</span>
                            <span className="text-sm text-gray-800 font-semibold">
                              {typeof p.value === "number" ? `$${(p.value / 100).toFixed(2)}` : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Shipping address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { label: "Full name", value: shippingName },
                        { label: "Phone", value: shippingPhone },
                        { label: "Address line 1", value: shippingAddressLine1 },
                        { label: "Address line 2", value: shippingAddressLine2 },
                        { label: "City", value: shippingCity },
                        { label: "ZIP code", value: shippingZip },
                        { label: "Country", value: countryRaw },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="text-xs font-medium text-gray-400">{field.label}</label>
                          <input
                            value={field.value || "—"}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 sticky top-24">
                    <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100 mx-auto">
                      {influencer.avatar ? (
                        <img src={influencer.avatar} alt={influencer.name} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-700 leading-relaxed">
                      {influencer.bio || "No bio available."}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="channels" className="px-0 pb-6 space-y-1">
            {PLATFORM_ORDER.map((platform) => (
              <InfluencerSidePanelPlatformRow
                key={platform}
                platform={platform}
                influencer={influencer}
                posts={postsForSidePanelRow(effectivePosts, platform)}
                isExpanded={expanded[platform]}
                onToggle={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [platform]: !prev[platform],
                  }))
                }
              />
            ))}
          </TabsContent>

          <TabsContent value="profile" className="px-6 pb-6">
            <InfluencerCommercialReadOnly
              languages={influencer.languages}
              phoneWhatsapp={influencer.phoneWhatsapp}
              baseCurrency={influencer.baseCurrency}
              minRate={influencer.minRate}
              maxRate={influencer.maxRate}
              acceptsProductGifting={influencer.acceptsProductGifting}
              shippingRegions={influencer.shippingRegions}
              responseRate={influencer.responseRate}
              acceptanceRate={influencer.acceptanceRate}
            />
          </TabsContent>
          <TabsContent value="outreach" className="px-6 pb-6">
            <OutreachTab
              influencer={{
                name: influencer.name,
                email: influencer.email,
                username: influencer.username,
              }}
              authUserId={userId ?? ""}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
