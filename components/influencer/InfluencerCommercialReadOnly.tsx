import type { NormalizedInfluencer } from "@/components/brand/sidepanel/influencer-side-panel.types";

export type InfluencerCommercialReadOnlyProps = Pick<
  NormalizedInfluencer,
  | "languages"
  | "phoneWhatsapp"
  | "baseCurrency"
  | "minRate"
  | "maxRate"
  | "acceptsProductGifting"
  | "shippingRegions"
  | "responseRate"
  | "acceptanceRate"
>;

/**
 * Read-only commercial / matching fields — same grid as the brand side panel
 * “Profile” tab, reusable on the influencer dashboard preview.
 */
export function InfluencerCommercialReadOnly(
  props: InfluencerCommercialReadOnlyProps,
) {
  const {
    languages,
    phoneWhatsapp,
    baseCurrency,
    minRate,
    maxRate,
    acceptsProductGifting,
    shippingRegions,
    responseRate,
    acceptanceRate,
  } = props;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Commercial & matching
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-xs text-zinc-500">Languages</p>
          <p className="font-medium">
            {languages.length ? languages.join(", ") : "—"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs text-zinc-500">WhatsApp</p>
          <p className="font-medium">{phoneWhatsapp || "—"}</p>
        </div>
        <div>
          <p className="mb-1 text-xs text-zinc-500">Base currency</p>
          <p className="font-medium">{baseCurrency || "—"}</p>
        </div>
        <div>
          <p className="mb-1 text-xs text-zinc-500">Rate range</p>
          <p className="font-medium">
            {minRate != null || maxRate != null
              ? `${minRate ?? "?"} - ${maxRate ?? "?"}`
              : "—"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs text-zinc-500">Product gifting</p>
          <p className="font-medium">
            {acceptsProductGifting == null
              ? "—"
              : acceptsProductGifting
                ? "Accepted"
                : "Not accepted"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs text-zinc-500">Shipping regions</p>
          <p className="font-medium">
            {shippingRegions.length ? shippingRegions.join(", ") : "—"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs text-zinc-500">Response rate</p>
          <p className="font-medium">
            {responseRate != null ? `${responseRate}%` : "—"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs text-zinc-500">Acceptance rate</p>
          <p className="font-medium">
            {acceptanceRate != null ? `${acceptanceRate}%` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
