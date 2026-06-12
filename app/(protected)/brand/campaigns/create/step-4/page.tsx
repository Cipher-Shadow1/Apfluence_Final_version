"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  FileCheck2,
  Package,
  DollarSign,
  Target,
  CalendarDays,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useWizard } from "@/components/brand/campaigns/wizard/CampaignWizardContext";

export default function Step4Page() {
  const {
    campaignType,
    briefFile,
    setBriefFile,
    contractFile,
    setContractFile,
    requiresContract,
    setRequiresContract,
    maxProductCount,
    setMaxProductCount,
    maxProductValueUSD,
    setMaxProductValueUSD,
    targetCountries,
    setTargetCountries,
    targetCities,
    setTargetCities,
    targetNiches,
    setTargetNiches,
    minFollowers,
    setMinFollowers,
    maxFollowers,
    setMaxFollowers,
    minEngagementRate,
    setMinEngagementRate,
    authenticityMinScore,
    setAuthenticityMinScore,
    startAt,
    setStartAt,
    contentDueAt,
    setContentDueAt,
    publishWindowStart,
    setPublishWindowStart,
    publishWindowEnd,
    setPublishWindowEnd,
    campaignLanguage,
    setCampaignLanguage,
  } = useWizard();

  const briefInputRef = useRef<HTMLInputElement>(null);
  const contractInputRef = useRef<HTMLInputElement>(null);

  const [limitMaxSelection, setLimitMaxSelection] = useState(
    maxProductCount !== "",
  );
  const [limitMaxTotalValue, setLimitMaxTotalValue] = useState(
    maxProductValueUSD !== "",
  );
  const [countriesInput, setCountriesInput] = useState(targetCountries.join(", "));
  const [citiesInput, setCitiesInput] = useState(targetCities.join(", "));
  const [nichesInput, setNichesInput] = useState(targetNiches.join(", "));

  const parseCsv = (raw: string) =>
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  useEffect(() => {
    setCountriesInput(targetCountries.join(", "));
  }, [targetCountries]);
  useEffect(() => {
    setCitiesInput(targetCities.join(", "));
  }, [targetCities]);
  useEffect(() => {
    setNichesInput(targetNiches.join(", "));
  }, [targetNiches]);

  return (
    <div className="space-y-12 pb-12">
      {/* ═════════ SECTION 1: DOCUMENTS ═════════ */}
      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1350px] mx-auto items-start">
        {/* ── LEFT: TITLE & DESCRIPTION ──────────────────────── */}
        <div className="lg:w-[300px] shrink-0 w-full">
          <div className="sticky top-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
              Documents
            </h2>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Upload any supporting documents for your campaign, such as creative briefs or legal contracts.
            </p>
          </div>
        </div>

        {/* ── RIGHT: FORM ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-7 space-y-6">

            {/* Brief PDF */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-[#1a1aff]" />
                </div>
                <label className="block text-[13px] font-semibold text-gray-800">
                  Campaign Brief
                </label>
              </div>
              <p className="text-xs text-gray-400 mb-3">PDF, optional</p>
              <input
                ref={briefInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setBriefFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => briefInputRef.current?.click()}
                className={cn(
                  "w-full py-5 rounded-2xl border-2 border-dashed",
                  "flex items-center justify-center gap-2.5 transition-all",
                  briefFile
                    ? "border-green-200 bg-green-50/80"
                    : "border-gray-200 hover:border-[#1a1aff]/40 hover:bg-gray-50",
                )}
              >
                <FileText
                  size={18}
                  className={briefFile ? "text-green-500" : "text-gray-300"}
                />
                <span
                  className={cn(
                    "text-sm",
                    briefFile ? "text-green-600 font-medium" : "text-gray-400",
                  )}
                >
                  {briefFile
                    ? `${briefFile.name} (${(briefFile.size / 1024).toFixed(0)} KB)`
                    : "Click to upload PDF brief"}
                </span>
              </button>
              <p className="mt-2 text-xs text-gray-400">
                Influencers can download this on their application form
              </p>
            </div>

            {/* Contract PDF */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                  <FileCheck2 size={14} className="text-[#1a1aff]" />
                </div>
                <label className="block text-[13px] font-semibold text-gray-800">
                  Contract
                </label>
              </div>
              <p className="text-xs text-gray-400 mb-3">PDF, optional</p>
              <input
                ref={contractInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setContractFile(f);
                  if (!f) setRequiresContract(false);
                }}
              />
              <button
                type="button"
                onClick={() => contractInputRef.current?.click()}
                className={cn(
                  "w-full py-5 rounded-2xl border-2 border-dashed",
                  "flex items-center justify-center gap-2.5 transition-all",
                  contractFile
                    ? "border-green-200 bg-green-50/80"
                    : "border-gray-200 hover:border-[#1a1aff]/40 hover:bg-gray-50",
                )}
              >
                <FileText
                  size={18}
                  className={contractFile ? "text-green-500" : "text-gray-300"}
                />
                <span
                  className={cn(
                    "text-sm",
                    contractFile ? "text-green-600 font-medium" : "text-gray-400",
                  )}
                >
                  {contractFile
                    ? `${contractFile.name} (${(contractFile.size / 1024).toFixed(0)} KB)`
                    : "Click to upload contract PDF"}
                </span>
              </button>

              {/* Require signature toggle */}
              {contractFile && (
                <div className="flex items-center justify-between mt-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-700">
                      Require signed reupload
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Influencer must upload the signed contract before acceptance
                    </p>
                  </div>
                  <Switch
                    checked={requiresContract}
                    onCheckedChange={(v) => setRequiresContract(v)}
                    className="data-[state=checked]:bg-[#1a1aff]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 max-w-[1350px] mx-auto" />

      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1350px] mx-auto items-start">
        <div className="lg:w-[300px] shrink-0 w-full">
          <div className="sticky top-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
              Targeting filters
            </h2>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Define creator profile filters and campaign timing windows for
              cleaner matching in discovery.
            </p>
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-7 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                <Target size={14} className="text-[#1a1aff]" />
              </div>
              <p className="text-[13px] font-semibold text-gray-800">Audience filters</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                value={campaignLanguage}
                onChange={(e) => setCampaignLanguage(e.target.value)}
                placeholder="Campaign language (fr/ar/en)"
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
              <input
                value={countriesInput}
                onChange={(e) => {
                  const next = e.target.value;
                  setCountriesInput(next);
                  setTargetCountries(parseCsv(next));
                }}
                placeholder="Target countries (comma-separated)"
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
              <input
                value={citiesInput}
                onChange={(e) => {
                  const next = e.target.value;
                  setCitiesInput(next);
                  setTargetCities(parseCsv(next));
                }}
                placeholder="Target cities (comma-separated)"
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
              <input
                value={nichesInput}
                onChange={(e) => {
                  const next = e.target.value;
                  setNichesInput(next);
                  setTargetNiches(parseCsv(next));
                }}
                placeholder="Target niches (comma-separated)"
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
              <input
                type="number"
                min={0}
                value={minFollowers}
                onChange={(e) =>
                  setMinFollowers(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Min followers"
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
              <input
                type="number"
                min={0}
                value={maxFollowers}
                onChange={(e) =>
                  setMaxFollowers(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Max followers"
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
              <input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={minEngagementRate}
                onChange={(e) =>
                  setMinEngagementRate(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                placeholder="Min engagement rate (%)"
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={authenticityMinScore}
                onChange={(e) =>
                  setAuthenticityMinScore(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                placeholder="Authenticity min score (0-100)"
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-7 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                <CalendarDays size={14} className="text-[#1a1aff]" />
              </div>
              <p className="text-[13px] font-semibold text-gray-800">Timeline</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Start at</label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Content due</label>
                <input
                  type="datetime-local"
                  value={contentDueAt}
                  onChange={(e) => setContentDueAt(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Publish window start
                </label>
                <input
                  type="datetime-local"
                  value={publishWindowStart}
                  onChange={(e) => setPublishWindowStart(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Publish window end
                </label>
                <input
                  type="datetime-local"
                  value={publishWindowEnd}
                  onChange={(e) => setPublishWindowEnd(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════ SECTION 2: APPLICATION FORM RULES (PRODUCT ONLY) ═════════ */}
      {campaignType === "paid_with_product" && (
        <>
          <hr className="border-gray-100 max-w-[1350px] mx-auto" />

          <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1350px] mx-auto items-start">
            {/* ── LEFT: TITLE & DESCRIPTION ──────────────────────── */}
            <div className="lg:w-[300px] shrink-0 w-full">
              <div className="sticky top-6">
                <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
                  Application form rules
                </h2>
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  Control how many products an influencer can select and the
                  maximum total value they can claim.
                </p>
              </div>
            </div>

            {/* ── RIGHT: FORM ────────────────────────────────────── */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              <div className="space-y-4">
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide px-1">
                  Product selection limits
                </p>

                {/* Max Selection */}
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                      <Package size={18} className="text-[#1a1aff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-bold text-gray-900">
                        Limit the total number
                      </p>
                      <p className="text-[13px] text-gray-500 mt-0.5">
                        Specify the maximum number of products a creator can
                        select.
                      </p>
                    </div>
                    <Switch
                      checked={limitMaxSelection}
                      onCheckedChange={(v) => {
                        setLimitMaxSelection(v);
                        if (v && maxProductCount === "") setMaxProductCount(1);
                        if (!v) setMaxProductCount("");
                      }}
                      className="data-[state=checked]:bg-[#1a1aff]"
                    />
                  </div>

                  {limitMaxSelection && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 flex flex-wrap items-center gap-3">
                      <p className="text-[14px] text-gray-600">
                        Each creator can select up to
                      </p>
                      <div className="inline-flex items-center rounded-lg border border-gray-300 overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => {
                            const curr =
                              typeof maxProductCount === "number" &&
                              !Number.isNaN(maxProductCount)
                                ? maxProductCount
                                : 1;
                            setMaxProductCount(Math.max(1, curr - 1));
                          }}
                          className="w-10 h-10 text-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          -
                        </button>
                        <div className="w-14 h-10 border-x border-gray-300 flex items-center justify-center text-[15px] font-semibold text-gray-800">
                          {typeof maxProductCount === "number"
                            ? maxProductCount
                            : 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const curr =
                              typeof maxProductCount === "number" &&
                              !Number.isNaN(maxProductCount)
                                ? maxProductCount
                                : 1;
                            setMaxProductCount(Math.min(20, curr + 1));
                          }}
                          className="w-10 h-10 text-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[14px] text-gray-600">products</p>
                    </div>
                  )}
                </div>

                {/* Max Total Value */}
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                      <DollarSign size={18} className="text-[#1a1aff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-bold text-gray-900">
                        Limit the total value
                      </p>
                      <p className="text-[13px] text-gray-500 mt-0.5">
                        Restrict the total value of selected products to a
                        specific amount per creator.
                      </p>
                    </div>
                    <Switch
                      checked={limitMaxTotalValue}
                      onCheckedChange={(v) => {
                        setLimitMaxTotalValue(v);
                        if (!v) setMaxProductValueUSD("");
                      }}
                      className="data-[state=checked]:bg-[#1a1aff]"
                    />
                  </div>

                  {limitMaxTotalValue && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                      <div className="relative max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={maxProductValueUSD}
                          onChange={(e) =>
                            setMaxProductValueUSD(
                              e.target.value === ""
                                ? ""
                                : parseFloat(e.target.value),
                            )
                          }
                          placeholder="e.g. 150.00"
                          className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10 transition-all placeholder:text-gray-300 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
