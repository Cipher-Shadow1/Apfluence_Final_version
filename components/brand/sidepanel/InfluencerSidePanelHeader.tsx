import { NormalizedInfluencer as Influencer } from "./influencer-side-panel.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Languages } from "lucide-react";

export function InfluencerSidePanelHeader({
  influencer,
  countryName,
  readOnly = false,
}: {
  influencer: Influencer;
  countryName: string;
  /** When true, niche chips are non-interactive (e.g. influencer preview page). */
  readOnly?: boolean;
}) {
  const readableEmail = influencer.email?.includes("•")
    ? `${influencer.username.replace("@", "").toLowerCase()}@email.com`
    : influencer.email;

  return (
    <div className="p-4 bg-(--color-bg-surface)">
      <div className="flex items-start gap-4">
        <Avatar className="h-[110px] w-[90px] rounded-lg">
          <AvatarImage
            src={influencer.avatar?.trim() ? influencer.avatar.trim() : undefined}
            alt={influencer.name}
          />
          <AvatarFallback className="rounded-lg">
            {(influencer.firstName[0] ?? "?").toUpperCase()}
            {(influencer.lastName[0] ?? "").toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="grid flex-1 grid-cols-[1fr_auto_auto] items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-zinc-900">{influencer.name}</h2>
            <div className="mt-2 flex items-center">
              <span className="font-medium text-gray-800">{influencer.firstName}</span>
              <span className="text-gray-400 ml-2">
                {influencer.lastName || "Last Name"}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-5 text-sm text-zinc-700">
              <span className="inline-flex items-center gap-1.5">
                {readableEmail}
              </span>
            </div>
          </div>

        

          <div className="flex flex-col items-end gap-2">
            
            <span className="inline-flex items-center gap-1.5 text-sm text-zinc-700">
              {influencer.location.flag} {countryName}
              <Languages className="h-4 w-4 text-zinc-500" />
            </span>
            <div className="flex max-w-[320px] flex-wrap justify-end gap-2">
              {(influencer.niches.length > 0
                ? influencer.niches
                : influencer.categories
              ).map((niche) =>
                readOnly ? (
                  <span
                    key={niche}
                    className="inline-flex items-center rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm"
                  >
                    {niche}
                  </span>
                ) : (
                  <button
                    key={niche}
                    type="button"
                    className="inline-flex items-center rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-white"
                  >
                    {niche}
                  </button>
                ),
              )}
            </div>
            <div className="flex max-w-[360px] flex-wrap justify-end gap-1.5">
              {influencer.baseCurrency && (
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                  {influencer.baseCurrency}
                  {influencer.minRate != null || influencer.maxRate != null
                    ? ` ${influencer.minRate ?? "?"}-${influencer.maxRate ?? "?"}`
                    : ""}
                </span>
              )}
              {influencer.acceptsProductGifting != null && (
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                  {influencer.acceptsProductGifting ? "Accepts gifting" : "No gifting"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
