import { NormalizedPost as MockPost } from "./influencer-side-panel.types";
import { formatEngagementPercent } from "./influencer-side-panel.utils";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PlatformPostCardProps {
  post: MockPost;
  platform: "instagram" | "tiktok" | "youtube" | "x";
  authorUsername: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Compact number formatter: 1200 -> "1.2k", 204839 -> "205k", 999 -> "999" */
function fmtCompact(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return Math.round(n).toString();
}

/** Estimate CPV using available post-level fields for TikTok/YouTube only. */
function estimateCpv(
  post: MockPost,
  platform: PlatformPostCardProps["platform"],
): number | null {
  if (platform !== "tiktok" && platform !== "youtube") return null;
  if (post.views == null || post.views <= 0) return null;
  if (post.cpe == null || post.cpe <= 0) return null;

  const interactions =
    post.likes + post.comments + (post.shares && post.shares > 0 ? post.shares : 0);
  if (interactions <= 0) return null;

  // Spend estimate: CPE * interactions, then divide by views.
  return (post.cpe * interactions) / post.views;
}

/**
 * Routes external CDN images through our server-side proxy to bypass
 * Instagram/TikTok hotlink protection (fbcdn.net, tiktokcdn.com, etc.).
 */
function proxyUrl(url: string): string {
  if (!url) return "";
  return `/api/img-proxy?url=${encodeURIComponent(url)}`;
}

const HASHTAG_COLORS: Record<PlatformPostCardProps["platform"], string> = {
  instagram: "text-pink-500",
  tiktok: "text-blue-400",
  youtube: "text-red-500",
  x: "text-blue-500",
};

const ENGAGEMENT_COLORS: Record<PlatformPostCardProps["platform"], string> = {
  instagram: "text-pink-500",
  tiktok: "text-gray-900",
  youtube: "text-red-500",
  x: "text-gray-900",
};

/** Platform accent text color for hashtags */
function hashtagColor(platform: PlatformPostCardProps["platform"]) {
  return HASHTAG_COLORS[platform] || "text-blue-500";
}

/** Platform accent text color for the engagement rate badge */
function engagementTextColor(platform: PlatformPostCardProps["platform"]) {
  return ENGAGEMENT_COLORS[platform] || "text-gray-900";
}

/** Platform SVG icon (inline, 14px) */
function PlatformIcon({
  platform,
}: {
  platform: PlatformPostCardProps["platform"];
}) {
  const size = 14;
  switch (platform) {
    case "instagram":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5"
            stroke="#E1306C"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="5" stroke="#E1306C" strokeWidth="2" />
          <circle cx="18" cy="6" r="1.5" fill="#E1306C" />
        </svg>
      );
    case "tiktok":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11V9a6.27 6.27 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.18 5.01c1.65-1.28 2.71-3.27 2.71-5.5V9.43a8.16 8.16 0 004.74 1.52V7.51a4.85 4.85 0 01-1.19-.82z" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="#FF0000"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M23.5 6.19a3 3 0 00-2.11-2.12C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.39.57A3 3 0 00.5 6.19 31.25 31.25 0 000 12a31.25 31.25 0 00.5 5.81 3 3 0 002.11 2.12c1.84.57 9.39.57 9.39.57s7.55 0 9.39-.57a3 3 0 002.11-2.12A31.25 31.25 0 0024 12a31.25 31.25 0 00-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
        </svg>
      );
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
  }
}

/** Parse caption and wrap #hashtag tokens in a colored span */
function renderCaption(
  caption: string,
  authorUsername: string,
  platform: PlatformPostCardProps["platform"],
) {
  const htColor = hashtagColor(platform);
  const tokens = caption.split(/(\s+)/);

  return (
    <>
      <span className="font-semibold text-gray-800">{authorUsername} </span>
      {tokens.map((token, i) =>
        token.startsWith("#") ? (
          <span key={i} className={`font-semibold ${htColor}`}>
            {token}
          </span>
        ) : (
          <span key={i}>{token}</span>
        ),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PlatformPostCard({
  post,
  platform,
  authorUsername,
}: PlatformPostCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImpressions = Boolean(post.estimatedImpressions);
  const hasReach = Boolean(post.estimatedReach);
  const cpv = estimateCpv(post, platform);

  if (platform === "tiktok") {
    return (
      <article className="w-[360px] aspect-[9/16] relative overflow-hidden rounded-2xl bg-gray-900 shadow-md group cursor-pointer font-sans">
        {/* Background Video/Image */}
        <div className="absolute inset-0 bg-black">
          {imageFailed || !post.thumbnailUrl ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
              <PlatformIcon platform="tiktok" />
              <p className="mt-2 text-xs font-medium text-gray-500 text-center line-clamp-3">
                {post.caption || "No caption"}
              </p>
            </div>
          ) : (
            <img
              src={proxyUrl(post.thumbnailUrl)}
              alt={post.caption}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
              onError={() => setImageFailed(true)}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Top Gradient for header */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        {/* Business Metrics Header (Top) */}
        <div className="absolute top-4 inset-x-4 flex justify-between items-start">
          <div className="flex gap-2 flex-wrap w-[75%]">
             {Number.isFinite(post.engagementRate) && (
               <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                 {formatEngagementPercent(post.engagementRate)}% ER
               </span>
             )}
             {cpv != null && (
               <span className="bg-emerald-500/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                 ${cpv.toFixed(4)} CPV
               </span>
             )}
             {hasReach && (
               <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                 {fmtCompact(post.estimatedReach)} reach
               </span>
             )}
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-full p-2 border border-white/10 text-white shadow-sm">
            <PlatformIcon platform="tiktok" />
          </div>
        </div>

        {/* Bottom Gradient for content */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Right Sidebar (Actions) */}
        <div className="absolute bottom-6 right-3 flex flex-col items-center gap-4">
          {/* Mock Avatar */}
          <div className="relative mb-2">
            <div className="w-11 h-11 rounded-full border-[1.5px] border-white bg-gray-800 flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-lg">
               {authorUsername.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#fe2c55] rounded-full flex items-center justify-center border-[1.5px] border-black shadow-sm">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z"/></svg>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="w-10 h-10 flex items-center justify-center text-white hover:text-gray-200 transition-colors drop-shadow-md">
              <Heart fill="currentColor" className="size-8" />
            </div>
            <span className="text-white text-xs font-semibold drop-shadow-md">{fmtCompact(post.likes)}</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="w-10 h-10 flex items-center justify-center text-white hover:text-gray-200 transition-colors drop-shadow-md">
              <MessageCircle fill="currentColor" className="size-8" />
            </div>
            <span className="text-white text-xs font-semibold drop-shadow-md">{fmtCompact(post.comments)}</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="w-10 h-10 flex items-center justify-center text-white hover:text-gray-200 transition-colors drop-shadow-md">
              <svg className="size-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 8.828V5.5a1.5 1.5 0 012.63-.984l5.657 6.499a1.5 1.5 0 010 1.968l-5.657 6.499A1.5 1.5 0 0114 18.5v-3.328C9.5 15.172 5.5 16 3 20c0-6.5 3.5-10.5 11-11.172z" />
              </svg>
            </div>
            <span className="text-white text-xs font-semibold drop-shadow-md">{fmtCompact(post.shares || Math.floor(post.likes * 0.08))}</span>
          </div>
          
          <div className="w-10 h-10 rounded-full border-[8px] border-gray-800 bg-gray-900 mt-2 animate-[spin_4s_linear_infinite] shadow-[0_0_0_1px_rgba(255,255,255,0.2)]">
            <svg className="w-full h-full text-white/50 p-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
        </div>

        {/* Bottom Content Area */}
        <div className="absolute bottom-6 left-3 right-16 flex flex-col gap-2">
          <div className="flex flex-col">
            <span className="text-white font-bold text-[15px] drop-shadow-md hover:underline cursor-pointer">
              @{authorUsername}
            </span>
            <p className="text-white text-[13px] mt-1.5 line-clamp-3 drop-shadow-md leading-relaxed">
              {post.caption ? post.caption.split(/(\s+)/).map((token, i) => 
                token.startsWith("#") ? (
                  <strong key={i} className="font-semibold text-white hover:underline cursor-pointer"> {token} </strong>
                ) : (
                  <span key={i} className="text-white/95"> {token} </span>
                )
              ) : "No caption"}
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <svg className="w-4 h-4 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <span className="text-white text-[13px] font-medium drop-shadow-md hover:underline cursor-pointer">
              original sound - {authorUsername}
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (platform === "youtube") {
    return (
      <article className="w-[360px] flex flex-col gap-3 group cursor-pointer">
        {/* ── Thumbnail - 16:9 ── */}
        <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-gray-100 shadow-sm transition-transform duration-200 group-hover:scale-[1.02]">
          {imageFailed || !post.thumbnailUrl ? (
            <div className="w-full h-full bg-gradient-to-br from-red-50 via-red-100 to-orange-50 flex flex-col items-center justify-center p-4">
              <PlatformIcon platform="youtube" />
              <p className="mt-2 text-xs font-medium text-red-800 text-center line-clamp-3">
                {post.caption || "No title"}
              </p>
            </div>
          ) : (
            <img
              src={proxyUrl(post.thumbnailUrl)}
              alt={post.caption}
              className="w-full h-full object-cover"
              onError={() => setImageFailed(true)}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
            ▶ YouTube
          </div>
        </div>

        {/* ── Video Details ── */}
        <div className="flex gap-3 px-1">
          {/* Channel Avatar Mock */}
          <div className="w-9 h-9 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center text-red-600 font-bold text-sm">
            {authorUsername.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
              {post.caption || "Untitled Video"}
            </h3>

            {/* Channel Name */}
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>{authorUsername}</span>
              <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>

            {/* Views & Time */}
            <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
              <span>{fmtCompact(post.views || post.likes * 10)} views</span>
              <span>•</span>
              <span>{post.postedAt || "Recently"}</span>
            </div>

            {/* Extra Metrics (Requested by user) */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2 py-1.5 rounded-lg w-fit">
               <span className="flex items-center gap-1">
                 <Heart className="size-3" /> {fmtCompact(post.likes)}
               </span>
               <span className="flex items-center gap-1">
                 <MessageCircle className="size-3" /> {fmtCompact(post.comments)}
               </span>
               {Number.isFinite(post.engagementRate) && (
                 <span className="text-red-600 bg-red-50 px-1 rounded border border-red-100">
                   {formatEngagementPercent(post.engagementRate)}% ER
                 </span>
               )}
            </div>
            
            {/* CPV / Reach (if available) */}
            {(hasReach || cpv != null) && (
              <div className="mt-1.5 flex items-center gap-3 text-[10px] text-gray-500">
                {cpv != null && (
                  <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium border border-green-100">
                    ${cpv.toFixed(4)} CPV
                  </span>
                )}
                {hasReach && (
                  <span>{fmtCompact(post.estimatedReach)} reach</span>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="w-[360px] overflow-hidden rounded-2xl bg-white shadow-md">
      {/* ── Engagement Badge Bar (above image) ── */}
      <div className="flex w-full items-center px-3 py-1">
        <div className="flex items-center gap-1.5">
          <PlatformIcon platform={platform} />
          <span
            className={`text-xs font-semibold ${engagementTextColor(platform)}`}
          >
            {Number.isFinite(post.engagementRate)
              ? `${formatEngagementPercent(post.engagementRate)}%`
              : "—"}{" "}
            engagement
          </span>
        </div>
      </div>

      {/* ── Thumbnail ── */}
      <div className="w-full aspect-[4/5] overflow-hidden relative">
        {imageFailed || !post.thumbnailUrl ? (
          /* ── CDN-blocked fallback: gradient card with caption + link ── */
          <div
            className={`w-full h-full flex flex-col justify-between p-3 ${
              platform === "instagram"
                ? "bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"
                : "bg-gradient-to-br from-gray-50 via-slate-100 to-gray-50"
            }`}
          >
            <div className="flex justify-end">
              <PlatformIcon platform={platform} />
            </div>
            <p className="text-xs leading-relaxed line-clamp-6 font-medium text-gray-600">
              {post.caption || "No caption"}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
                <span className="inline-flex items-center gap-0.5">
                  <Heart className="size-3" />
                  {fmtCompact(post.likes)}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <MessageCircle className="size-3" />
                  {fmtCompact(post.comments)}
                </span>
              </div>
              <a
                href={
                  platform === "instagram"
                    ? `https://www.instagram.com/p/${post.id}/`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-semibold underline underline-offset-2 text-indigo-500 hover:text-indigo-700"
              >
                View post ↗
              </a>
            </div>
          </div>
        ) : (
          <img
            src={proxyUrl(post.thumbnailUrl)}
            alt={post.caption}
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}
        {/* avatar overlay bottom-left */}
      </div>

      {/* ── Content Section ── */}
      <div className="px-3 pb-3 pt-2">
        {/* Row 1 — Likes & Comments */}
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
          <span className="inline-flex items-center gap-1">
            <Heart className="size-3.5 text-gray-800" aria-hidden />
            {fmtCompact(post.likes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3.5 text-gray-800" aria-hidden />
            {fmtCompact(post.comments)}
          </span>
        </div>

        {/* Row 2 — Impressions & Reach */}
        {(hasImpressions || hasReach || cpv != null) && (
          <div className="mt-1 flex items-center gap-4 text-xs">
            {hasImpressions && (
              <span>
                <span className="font-semibold text-gray-900">
                  {fmtCompact(post.estimatedImpressions)}
                </span>{" "}
                <span className="text-gray-400">est. Impressions</span>
              </span>
            )}
            {hasReach && (
              <span>
                <span className="font-semibold text-gray-900">
                  {fmtCompact(post.estimatedReach)}
                </span>{" "}
                <span className="text-gray-400">est. Reach</span>
              </span>
            )}
            {cpv != null && (
              <span>
                <span className="font-semibold text-gray-900">
                  ${cpv.toFixed(4)}
                </span>{" "}
                <span className="text-gray-400">CPV</span>
              </span>
            )}
          </div>
        )}

        {/* Row 3 — Caption with username + hashtag coloring */}
        <p className="mt-2 line-clamp-3 text-xs text-gray-500">
          {renderCaption(post.caption, authorUsername, platform)}
        </p>

        {/* Row 4 — Posted at */}
        <p className="mt-2 text-xs text-gray-400">{post.postedAt}</p>
      </div>
    </article>
  );
}
