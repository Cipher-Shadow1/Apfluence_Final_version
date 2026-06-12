"use client";

import { NormalizedInfluencer as Influencer } from "./sidepanel/influencer-side-panel.types";
import { formatFollowers } from "@/lib/adapters/normalizeInfluencer";
import { formatEngagementPercent } from "@/components/brand/sidepanel/influencer-side-panel.utils";
import Image from "next/image";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import SaveToListButton from "./sidepanel/SaveToListButton";
import {
  X as XIcon,
  ShieldCheck,
  TrendingUp,
  Instagram,
  Youtube,
  Monitor,
  Dumbbell,
  Utensils,
  Plane,
  Gamepad2,
  Sparkles,
  Brush,
  Hammer,
  Shirt,
  HeartPulse,
  Smile,
  Baby,
  Dog,
  Camera,
  Code,
  Home,
  Music,
  Tag,
} from "lucide-react";

// Helper to convert ISO 3166-1 alpha-2 code to an emoji flag
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Maps category strings to Lucide generic icons matching the aesthetic
const CategoryIcon = ({ category }: { category: string }) => {
  switch (category.toLowerCase()) {
    case "technology":
    case "gadgets":
      return <Monitor size={12} />;
    case "fitness":
    case "health":
      return <Dumbbell size={12} />;
    case "food":
    case "cooking":
      return <Utensils size={12} />;
    case "travel":
    case "adventure":
      return <Plane size={12} />;
    case "gaming":
    case "esports":
      return <Gamepad2 size={12} />;
    case "beauty":
    case "makeup":
      return <Sparkles size={12} />;
    case "finance":
    case "business":
      return <TrendingUp size={12} />;
    case "art":
    case "design":
      return <Brush size={12} />;
    case "diy":
      return <Hammer size={12} />;
    case "fashion":
    case "streetwear":
    case "culture":
      return <Shirt size={12} />;
    case "wellness":
    case "science":
      return <HeartPulse size={12} />;
    case "comedy":
    case "humor":
      return <Smile size={12} />;
    case "family":
    case "parenting":
      return <Baby size={12} />;
    case "pets":
    case "animals":
      return <Dog size={12} />;
    case "photography":
      return <Camera size={12} />;
    case "coding":
    case "education":
      return <Code size={12} />;
    case "real estate":
    case "home":
      return <Home size={12} />;
    case "music":
    case "entertainment":
      return <Music size={12} />;
    default:
      return <Tag size={12} />;
  }
};

// NextJS and Lucide don't natively include TikTok commonly, so we provide an inline SVG
const TikTokIcon = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
  </svg>
);

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "instagram":
      return <Instagram size={14} className="text-pink-600" />;
    case "youtube":
      return <Youtube size={14} className="text-red-600" />;
    case "tiktok":
      return <TikTokIcon size={14} className="text-black" />;
    case "x":
      return <XIcon size={14} className="text-black" />;
    default:
      return <Tag size={14} />;
  }
};

export const InfluencerResultCard = memo(
  ({
    influencer,
    onClick,
  }: {
    influencer: Influencer;
    onClick: (influencer: Influencer) => void;
  }) => {
    const [avatarFailed, setAvatarFailed] = useState(false);
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        onClick={() => onClick(influencer)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick(influencer);
          }
        }}
        className="flex flex-col md:flex-row items-center gap-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 w-full cursor-pointer"
      >
        {/* Left Section: Avatar with Accept/Reject Actions */}
        <div className="relative h-28 w-28 shrink-0">
          {avatarFailed || !influencer.avatar?.trim() ? (
            <div
              className="flex size-full items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-lg font-bold text-gray-500"
              aria-hidden
            >
              {influencer.name.slice(0, 2).toUpperCase()}
            </div>
          ) : (
            <Image
              src={influencer.avatar.trim()}
              fill
              className="object-cover rounded-2xl"
              alt={influencer.name}
              sizes="112px"
              onError={() => setAvatarFailed(true)}
              unoptimized
            />
          )}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white p-1 rounded-full shadow-sm border border-gray-100"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <SaveToListButton variant="icon" influencerId={influencer.id} />
            <button
              type="button"
              title="Not now"
              aria-label="Dismiss (does not block saving from profile)"
              onClick={(e) => e.stopPropagation()}
              className="bg-red-50 text-red-600 rounded-full p-1.5 hover:bg-red-100 transition-colors"
            >
              <XIcon size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Info Section: Name, Location, Bio */}
        <div className="flex-1 min-w-[200px] flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900 leading-none">
              {influencer.name}
            </h3>
            <span className="text-[12px] bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              {getFlagEmoji(influencer.location.countryCode || "")}{" "}
              {influencer.location.city}
            </span>
          </div>
          <p className="text-blue-600 text-sm font-medium mb-1.5">
            {influencer.username}
          </p>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {influencer.bio}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {influencer.baseCurrency && (
              <span className="text-[11px] bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                {influencer.baseCurrency}
                {influencer.minRate != null || influencer.maxRate != null
                  ? ` ${influencer.minRate ?? "?"}-${influencer.maxRate ?? "?"}`
                  : ""}
              </span>
            )}
            {influencer.acceptsProductGifting != null && (
              <span className="text-[11px] bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                {influencer.acceptsProductGifting
                  ? "Accepts gifting"
                  : "No gifting"}
              </span>
            )}
            {!!influencer.languages?.length && (
              <span className="text-[11px] bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                {influencer.languages.slice(0, 2).join(", ")}
                {influencer.languages.length > 2 ? " +" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Gallery Section: 4 Thumbnails */}
        <div className="hidden lg:flex gap-2.5 shrink-0 ml-auto">
          {influencer.gallery
            .filter((img) => typeof img === "string" && img.trim().length > 0)
            .slice(0, 4)
            .map((img, i) => (
            <div
              key={`${img}-${i}`}
              className="relative h-[84px] w-[84px] rounded-xl overflow-hidden shadow-sm border border-gray-100 group"
            >
              <Image
                src={img.trim()}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                alt={`${influencer.name} content thumbnail ${i + 1}`}
                sizes="84px"
              />
              <div className="absolute top-1.5 right-1.5 bg-black/30 backdrop-blur-md rounded-md p-1">
                <Instagram size={10} className="text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section: Authenticity & Performance */}
        <div className="flex flex-col shrink-0 gap-2.5 w-48 md:border-l md:border-r border-gray-100 md:px-5 py-1">
          <div className="bg-green-50/70 border border-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 w-max">
            <ShieldCheck size={14} className="text-green-600" />{" "}
            {influencer.authenticityScore}% Real
          </div>
          <div className="flex flex-col gap-1.5">
            {influencer.metrics.map((m) => (
              <div
                key={m.platform}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5 text-gray-700">
                  <PlatformIcon platform={m.platform} />
                  <span className="font-semibold text-gray-900">
                    {formatFollowers(m.followers)}
                  </span>
                </div>
                <div className="flex items-center text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-sm">
                  <TrendingUp size={10} className="mr-1" strokeWidth={3} />{" "}
                  {formatEngagementPercent(m.engagement)}%
                </div>
              </div>
            ))}
          </div>
          <div className="pt-1 text-[11px] text-gray-500">
            <p>
              Resp:{" "}
              {influencer.responseRate != null
                ? `${influencer.responseRate}%`
                : "—"}
            </p>
            <p>
              Accept:{" "}
              {influencer.acceptanceRate != null
                ? `${influencer.acceptanceRate}%`
                : "—"}
            </p>
          </div>
        </div>

        {/* Tags / Niches Section */}
        <div className="hidden xl:flex flex-col gap-2 shrink-0 w-40 py-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
            Niches
          </p>
          <div className="flex flex-wrap gap-1.5">
            {influencer.categories.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md border border-gray-200 transition-colors cursor-default"
              >
                <CategoryIcon category={cat} /> {cat}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  },
);
