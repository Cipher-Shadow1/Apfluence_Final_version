"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import type {
  NormalizedInfluencer as Influencer,
  NormalizedPost as MockPost,
  RowPlatform,
} from "@/components/brand/sidepanel/influencer-side-panel.types";
import { InfluencerSidePanelHeader } from "@/components/brand/sidepanel/InfluencerSidePanelHeader";
import { InfluencerSidePanelPlatformRow } from "@/components/brand/sidepanel/InfluencerSidePanelPlatformRow";
import {
  PLATFORM_ORDER,
  getCountryName,
} from "@/components/brand/sidepanel/influencer-side-panel.utils";
import { InfluencerCommercialReadOnly } from "@/components/influencer/InfluencerCommercialReadOnly";
import Link from "next/link";

function postsForRow(
  posts: Influencer["posts"],
  row: RowPlatform,
): MockPost[] {
  if (row === "twitch") return [];
  const list = posts ?? [];
  const normalizePostPlatform = (value: string): RowPlatform | null => {
    const key = value.trim().toLowerCase();
    if (key === "instagram" || key === "insta") return "instagram";
    if (key === "tiktok" || key === "tik tok") return "tiktok";
    if (key === "youtube" || key === "you tube") return "youtube";
    if (key === "x" || key === "twitter" || key === "x (twitter)") return "x";
    if (key === "twitch") return "twitch";
    return null;
  };
  return list
    .filter((p) => normalizePostPlatform(String(p.platform ?? "")) === row)
    .slice(0, 4);
}

export function InfluencerPublicProfileView({
  influencer,
}: {
  influencer: Influencer;
}) {
  const countryName = useMemo(
    () => getCountryName(influencer.location.countryCode || ""),
    [influencer.location.countryCode],
  );

  const [expanded, setExpanded] = useState<Record<RowPlatform, boolean>>({
    instagram: true,
    tiktok: true,
    youtube: true,
    twitch: true,
    x: true,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-900">
        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
        <div>
          <p className="font-semibold text-indigo-950">Brand preview</p>
          <p className="mt-0.5 text-indigo-800/90">
            This is how brands see your public profile in discovery. Edit commercial
            fields in{" "}
            <Link
              href="/influencer/settings"
              className="font-medium underline underline-offset-2 hover:text-indigo-950"
            >
              Settings
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <InfluencerSidePanelHeader
          influencer={influencer}
          countryName={countryName}
          readOnly
        />

        {influencer.bio?.trim() ? (
          <div className="border-t border-zinc-100 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Bio
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {influencer.bio}
            </p>
          </div>
        ) : null}

        <div className="border-t border-zinc-100 px-4 py-4">
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
        </div>

        <div className="border-t border-zinc-100 px-4 pb-6 pt-2">
          <p className="px-1 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Channels
          </p>
          <div className="space-y-1">
            {PLATFORM_ORDER.map((platform) => (
              <InfluencerSidePanelPlatformRow
                key={platform}
                platform={platform}
                influencer={influencer}
                posts={postsForRow(influencer.posts, platform)}
                isExpanded={expanded[platform]}
                onToggle={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [platform]: !prev[platform],
                  }))
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
