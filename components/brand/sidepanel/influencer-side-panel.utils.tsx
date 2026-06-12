import { NormalizedInfluencer as Influencer } from "./influencer-side-panel.types";
import { Gamepad2, Instagram, Youtube } from "lucide-react";
import { type RowPlatform } from "./influencer-side-panel.types";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
  </svg>
);

export const PLATFORM_ORDER: RowPlatform[] = [
  "instagram",
  "tiktok",
  "youtube",
  "twitch",
  "x",
];

export const platformConfig = {
  instagram: {
    label: "Instagram",
    icon: Instagram,
    leftClass: "bg-[var(--color-platform-instagram)]",
  },
  tiktok: {
    label: "TikTok",
    icon: TikTokIcon,
    leftClass: "bg-[var(--color-platform-tiktok)]",
  },
  youtube: {
    label: "YouTube",
    icon: Youtube,
    leftClass: "bg-[var(--color-platform-youtube)]",
  },
  twitch: {
    label: "Twitch",
    icon: Gamepad2,
    leftClass: "bg-[var(--color-platform-twitch)]",
  },
  x: {
    label: "X (Twitter)",
    icon: function XIcon({ className }: { className?: string }) { return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    leftClass: "bg-black",
  },
} as const;

export const getCountryName = (countryCode: string) => {
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
};

export const getMetric = (influencer: Influencer, platform: RowPlatform) => {
  if (platform === "twitch") return null;
  return influencer.metrics.find((m) => m.platform === platform) ?? null;
};

const trimTrailingZeros = (value: string) =>
  value.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");

const formatCompactMetricNumber = (value: number): string => {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const decimals = abs >= 10_000_000 ? 0 : 1;
    return `${sign}${trimTrailingZeros((abs / 1_000_000).toFixed(decimals))}m`;
  }
  if (abs >= 1_000) {
    const decimals = abs >= 10_000 ? 0 : 1;
    return `${sign}${trimTrailingZeros((abs / 1_000).toFixed(decimals))}k`;
  }
  if (abs < 1) return `${sign}${trimTrailingZeros(abs.toFixed(4))}`;
  if (Number.isInteger(value)) return `${value}`;
  return trimTrailingZeros(value.toFixed(2));
};

/** Engagement % from DB — always two digits after the decimal separator (comma for display). */
export function formatEngagementPercent(value: unknown): string {
  if (value === null || value === undefined) return "—";
  const n =
    typeof value === "number"
      ? value
      : Number(String(value).trim().replace(",", "."));
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2).replace(".", ",");
}

export const formatStatValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number" && !Number.isFinite(value)) return "—";
  if (typeof value === "number") return formatCompactMetricNumber(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "0") return "—";
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return formatCompactMetricNumber(parsed);
    return trimmed;
  }
  return String(value);
};
