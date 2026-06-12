"use client";

import { useState } from "react";
import { Check, Info, Users, Upload } from "lucide-react";
import { useWizard } from "@/components/brand/campaigns/wizard/CampaignWizardContext";
import { TargetListSelector } from "@/components/brand/campaigns/wizard/TargetListSelector";
import AddCreatorsModal from "@/components/brand/campaigns/AddCreatorsModal";

export default function Step6Page() {
  const {
    campaignType,
    name,
    selectedListId,
    setSelectedListId,
    lists,
    campaignGoal,
    primaryKpi,
    targetKpiValue,
    campaignLanguage,
    campaignCurrency,
    targetCountries,
    targetCities,
    targetNiches,
    minFollowers,
    maxFollowers,
    minEngagementRate,
    authenticityMinScore,
    startAt,
    contentDueAt,
    publishWindowStart,
    publishWindowEnd,
  } = useWizard();
  const [isPickListOpen, setIsPickListOpen] = useState(false);

  return (
    <div className="space-y-12 pb-12">
      {/* ═════════ SECTION 1: TARGET OUTREACH ═════════ */}
      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1000px] mx-auto items-start">
        {/* ── LEFT: TITLE & DESCRIPTION ──────────────────────── */}
        <div className="lg:w-[300px] shrink-0 w-full">
          <div className="sticky top-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
              Target List
            </h2>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Select who you want to invite to your campaign initially. You can
              always add more influencers later.
            </p>
          </div>
        </div>

        {/* ── RIGHT: FORM ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start from scratch */}
            <button
              type="button"
              onClick={() => setSelectedListId(null)}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                selectedListId === null
                  ? "border-[#1a1aff] bg-[#EEF2FF]"
                  : "border-gray-200 hover:border-[#1a1aff]/40 bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  selectedListId === null
                    ? "bg-[#1a1aff] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Users size={18} />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Start from scratch
              </p>
              <p className="text-xs text-gray-500">
                Create the campaign now and select influencers manually from the
                discover page later.
              </p>
            </button>

            {/* Import List */}
            <button
              type="button"
              onClick={() => {
                // If they click "Import" and have lists, pick first list by default
                if (lists?.length && selectedListId === null) {
                  setSelectedListId(lists[0].id);
                }
              }}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                selectedListId !== null
                  ? "border-[#1a1aff] bg-[#EEF2FF]"
                  : "border-gray-200 hover:border-[#1a1aff]/40 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedListId !== null
                      ? "bg-[#1a1aff] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Upload size={18} />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Import from List
              </p>
              <p className="text-xs text-gray-500">
                Bulk invite influencers from an existing saved list.
              </p>
            </button>
          </div>

          {/* List picker (only when choosing import) */}
          {selectedListId !== null && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 mb-1">
                    Choose a list
                  </p>
                  <p className="text-xs text-gray-400">
                    We’ll attach this list to the campaign draft. You can still add
                    or remove influencers later.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPickListOpen(true)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
                >
                  Pick from lists
                </button>
              </div>

              {lists?.length ? (
                <TargetListSelector
                  lists={lists}
                  selectedListId={selectedListId}
                  onSelect={setSelectedListId}
                />
              ) : (
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                  You don’t have any saved lists yet. Create one from Discovery,
                  then come back here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-100 max-w-[1000px] mx-auto" />

      {/* ═════════ SECTION 2: FINALIZE ═════════ */}
      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1000px] mx-auto items-start">
        {/* ── LEFT: TITLE & DESCRIPTION ──────────────────────── */}
        <div className="lg:w-[300px] shrink-0 w-full">
          <div className="sticky top-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
              Finalize
            </h2>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Double check your campaign details. You can still edit everything
              later from the campaign dashboard.
            </p>
          </div>
        </div>

        {/* ── RIGHT: FORM ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-7 space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <Check size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {name || "Untitled Campaign"}
                </h3>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Type:{" "}
                  <span className="font-semibold text-gray-800 capitalize">
                    {campaignType?.replace(/_/g, " ")}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Strategy & targeting
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                  <p>
                    Goal:{" "}
                    <span className="font-semibold text-gray-800">
                      {campaignGoal || "—"}
                    </span>
                  </p>
                  <p>
                    KPI:{" "}
                    <span className="font-semibold text-gray-800">
                      {primaryKpi || "—"}
                    </span>
                  </p>
                  <p>
                    KPI target:{" "}
                    <span className="font-semibold text-gray-800">
                      {targetKpiValue === "" ? "—" : targetKpiValue}
                    </span>
                  </p>
                  <p>
                    Language / Currency:{" "}
                    <span className="font-semibold text-gray-800">
                      {(campaignLanguage || "—") + " / " + (campaignCurrency || "—")}
                    </span>
                  </p>
                  <p>
                    Countries:{" "}
                    <span className="font-semibold text-gray-800">
                      {targetCountries.length ? targetCountries.join(", ") : "—"}
                    </span>
                  </p>
                  <p>
                    Cities:{" "}
                    <span className="font-semibold text-gray-800">
                      {targetCities.length ? targetCities.join(", ") : "—"}
                    </span>
                  </p>
                  <p>
                    Niches:{" "}
                    <span className="font-semibold text-gray-800">
                      {targetNiches.length ? targetNiches.join(", ") : "—"}
                    </span>
                  </p>
                  <p>
                    Followers range:{" "}
                    <span className="font-semibold text-gray-800">
                      {(minFollowers === "" ? "—" : minFollowers) +
                        " - " +
                        (maxFollowers === "" ? "—" : maxFollowers)}
                    </span>
                  </p>
                  <p>
                    Min engagement:{" "}
                    <span className="font-semibold text-gray-800">
                      {minEngagementRate === "" ? "—" : `${minEngagementRate}%`}
                    </span>
                  </p>
                  <p>
                    Min authenticity:{" "}
                    <span className="font-semibold text-gray-800">
                      {authenticityMinScore === ""
                        ? "—"
                        : `${authenticityMinScore}/100`}
                    </span>
                  </p>
                  <p>
                    Start at:{" "}
                    <span className="font-semibold text-gray-800">
                      {startAt || "—"}
                    </span>
                  </p>
                  <p>
                    Content due:{" "}
                    <span className="font-semibold text-gray-800">
                      {contentDueAt || "—"}
                    </span>
                  </p>
                  <p>
                    Publish start:{" "}
                    <span className="font-semibold text-gray-800">
                      {publishWindowStart || "—"}
                    </span>
                  </p>
                  <p>
                    Publish end:{" "}
                    <span className="font-semibold text-gray-800">
                      {publishWindowEnd || "—"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3 text-[13px]">
                <Info size={16} className="text-[#1a1aff] shrink-0 mt-0.5" />
                <p className="text-gray-600">
                  When you click Create Campaign, we’ll save the campaign as a
                  draft. Influencers will only be notified when you send invites
                  from the campaign dashboard.
                </p>
              </div>
            </div>
            {/* The Create button is in the wizard footer on this final step */}
          </div>
        </div>
      </div>

      {/* Wizard-mode list picker modal (reuses existing UI) */}
      <AddCreatorsModal
        isOpen={isPickListOpen}
        onClose={() => setIsPickListOpen(false)}
        mode="wizard"
        onPickListId={(listId) => {
          setSelectedListId(listId);
          setIsPickListOpen(false);
        }}
      />
    </div>
  );
}

