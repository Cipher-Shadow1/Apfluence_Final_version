"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { getAllInfluencers } from "@/lib/queries/influencers";
import { NormalizedInfluencer } from "@/components/brand/sidepanel/influencer-side-panel.types";
import { InfluencerResultCard } from "@/components/brand/InfluencerResultCard";
import { InfluencerSidePanel } from "@/components/brand/InfluencerSidePanel";

export default function BrandDiscoveryPage() {
  const [allInfluencers, setAllInfluencers] = useState<NormalizedInfluencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [currency, setCurrency] = useState("");
  const [minRate, setMinRate] = useState<number | "">("");
  const [maxRate, setMaxRate] = useState<number | "">("");
  const [acceptsGiftingOnly, setAcceptsGiftingOnly] = useState(false);
  const [shippingInput, setShippingInput] = useState("");
  const [minResponseRate, setMinResponseRate] = useState<number | "">("");
  const [minAcceptanceRate, setMinAcceptanceRate] = useState<number | "">("");
  const [activeWithinDays, setActiveWithinDays] = useState<number | "">(30);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<NormalizedInfluencer | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getAllInfluencers();
      setAllInfluencers(data);
      setIsLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const wantedLangs = languagesInput
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
    const wantedRegions = shippingInput
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
    return allInfluencers.filter((inf) => {
      const q = query.trim().toLowerCase();
      if (
        q &&
        !(
          inf.name.toLowerCase().includes(q) ||
          inf.username.toLowerCase().includes(q) ||
          (inf.bio || "").toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      if (wantedLangs.length) {
        const langs = (inf.languages ?? []).map((l) => l.toLowerCase());
        if (!wantedLangs.some((l) => langs.includes(l))) return false;
      }
      if (currency && (inf.baseCurrency || "").toLowerCase() !== currency.toLowerCase()) {
        return false;
      }
      if (typeof minRate === "number" && (inf.maxRate ?? -1) < minRate) return false;
      if (typeof maxRate === "number" && (inf.minRate ?? Number.MAX_SAFE_INTEGER) > maxRate) {
        return false;
      }
      if (acceptsGiftingOnly && inf.acceptsProductGifting !== true) return false;
      if (wantedRegions.length) {
        const regions = (inf.shippingRegions ?? []).map((r) => r.toLowerCase());
        if (!wantedRegions.some((r) => regions.includes(r))) return false;
      }
      if (
        typeof minResponseRate === "number" &&
        (inf.responseRate == null || inf.responseRate < minResponseRate)
      ) {
        return false;
      }
      if (
        typeof minAcceptanceRate === "number" &&
        (inf.acceptanceRate == null || inf.acceptanceRate < minAcceptanceRate)
      ) {
        return false;
      }
      if (typeof activeWithinDays === "number" && inf.lastActiveAt) {
        const diffDays =
          (Date.now() - new Date(inf.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > activeWithinDays) return false;
      }
      return true;
    });
  }, [
    allInfluencers,
    query,
    languagesInput,
    currency,
    minRate,
    maxRate,
    acceptsGiftingOnly,
    shippingInput,
    minResponseRate,
    minAcceptanceRate,
    activeWithinDays,
  ]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="relative xl:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators..."
            className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <input
          value={languagesInput}
          onChange={(e) => setLanguagesInput(e.target.value)}
          placeholder="Languages (ar, fr, en)"
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <input
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          placeholder="Currency (DZD)"
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <input
          value={shippingInput}
          onChange={(e) => setShippingInput(e.target.value)}
          placeholder="Shipping regions"
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <input
          type="number"
          min={0}
          value={minRate}
          onChange={(e) => setMinRate(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Min rate"
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <input
          type="number"
          min={0}
          value={maxRate}
          onChange={(e) => setMaxRate(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Max rate"
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <input
          type="number"
          min={0}
          max={100}
          value={minResponseRate}
          onChange={(e) =>
            setMinResponseRate(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder="Min response rate %"
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <input
          type="number"
          min={0}
          max={100}
          value={minAcceptanceRate}
          onChange={(e) =>
            setMinAcceptanceRate(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder="Min acceptance rate %"
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <input
          type="number"
          min={1}
          value={activeWithinDays}
          onChange={(e) =>
            setActiveWithinDays(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder="Active within days"
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 px-1">
          <input
            type="checkbox"
            checked={acceptsGiftingOnly}
            onChange={(e) => setAcceptsGiftingOnly(e.target.checked)}
          />
          Accepts product gifting only
        </label>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((influencer) => (
            <InfluencerResultCard
              key={influencer.id}
              influencer={influencer}
              onClick={setSelectedInfluencer}
            />
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              No creators match the current filters.
            </div>
          )}
        </div>
      )}

      <InfluencerSidePanel
        influencer={selectedInfluencer}
        isOpen={Boolean(selectedInfluencer)}
        onClose={() => setSelectedInfluencer(null)}
      />
    </div>
  );
}
