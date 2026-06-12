"use client";

import { useRef, useState } from "react";
import {
  Upload,
  X,
  Check,
  Shapes,
  Image as ImageIcon,
  FileText,
  Crosshair,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useWizard,
  CAMPAIGN_EMOJIS,
  CAMPAIGN_COLORS,
} from "@/components/brand/campaigns/wizard/CampaignWizardContext";

export default function Step2Page() {
  const {
    logoType,
    setLogoType,
    logoPreview,
    setLogoFile,
    setLogoPreview,
    name,
    setName,
    description,
    setDescription,
    coverEmoji,
    setCoverEmoji,
    coverColor,
    setCoverColor,
    tags,
    setTags,
    campaignGoal,
    setCampaignGoal,
    primaryKpi,
    setPrimaryKpi,
    targetKpiValue,
    setTargetKpiValue,
    error,
    setError,
  } = useWizard();

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"icon" | "image">(
    logoType || "icon",
  );
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState("");

  const handleFilePreview = (file: File, setPreview: (s: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addTagFromInput = () => {
    const raw = tagInput.trim();
    if (!raw) return;

    let type: "hashtag" | "mention" = "hashtag";
    let value = raw;

    if (raw.startsWith("@")) {
      type = "mention";
      value = raw.slice(1);
    } else if (raw.startsWith("#")) {
      type = "hashtag";
      value = raw.slice(1);
    }

    value = value.trim();
    if (!value) return;
    if (tags.find((t) => t.type === type && t.value === value)) return;

    setTags((prev) => [...prev, { type, value }]);
    setTagInput("");
  };

  const removeTag = (i: number) =>
    setTags((prev) => prev.filter((_, idx) => idx !== i));

  const handleSaveLogo = () => {
    setLogoType(modalTab);
    if (modalTab === "icon") {
      setLogoFile(null);
      setLogoPreview(null);
    }
    setIsLogoModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-6">
      {/* ═════════ SECTION 1: CAMPAIGN DETAILS ═════════ */}
      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1350px] mx-auto items-start">
        {/* ── LEFT: TITLE & DESCRIPTION ──────────────────────── */}
        <div className="lg:w-[300px] shrink-0 w-full">
          <div className="sticky top-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
              Campaign details
            </h2>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Set up your campaign&apos;s basic info and branding. These values
              will appear on the campaign card and outreach emails.
            </p>
          </div>
        </div>

        {/* ── RIGHT: FORM ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="bg-white  border border-gray-200/80 shadow-sm overflow-hidden">
            {/* Row: Campaign Name */}
            <div className="px-6 py-5 border-b border-gray-100">
              <label className="block text-[13px] font-semibold text-gray-800 mb-2">
                Campaign name
              </label>
              <input
                type="text"
                value={name}
                autoFocus
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Summer Fashion Week 2025"
                maxLength={255}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all",
                  "placeholder:text-gray-300",
                  error
                    ? "border-red-300 ring-2 ring-red-100"
                    : "border-gray-200 focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10",
                )}
              />
              {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            </div>

            {/* Row: Campaign Logo */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="w-12 h-12 rounded-xl border border-gray-200 hover:border-[#1a1aff] hover:ring-2 hover:ring-[#1a1aff]/10 flex items-center justify-center transition-all shadow-sm overflow-hidden bg-gray-50 group shrink-0"
              >
                {logoType === "image" && logoPreview ? (
                  <img
                    src={logoPreview}
                    className="w-full h-full object-cover"
                    alt="Logo preview"
                  />
                ) : logoType === "icon" ? (
                  <div
                    className="w-full h-full flex items-center justify-center text-xl relative"
                    style={{ backgroundColor: coverColor }}
                  >
                    {coverEmoji}
                  </div>
                ) : (
                  <Shapes size={18} className="text-gray-300" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-800">
                  Campaign logo
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Choose an icon + color or upload an image
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="text-xs font-semibold text-[#1a1aff] hover:text-[#1a1aff]/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF]"
              >
                Edit
              </button>
            </div>

            {/* Row: Description */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={14} className="text-[#1a1aff]" />
                </div>
                <label className="block text-[13px] font-semibold text-gray-800">
                  Description{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (optional)
                  </span>
                </label>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this campaign..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none
                           transition-all resize-none placeholder:text-gray-300
                           focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10"
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 max-w-[1350px] mx-auto" />

      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1350px] mx-auto items-start">
        <div className="lg:w-[300px] shrink-0 w-full">
          <div className="sticky top-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
              Strategy basics
            </h2>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Define the campaign objective and KPI target so recommendations and
              reporting stay aligned from day one.
            </p>
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="bg-white border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0">
                  <TrendingUp size={14} className="text-[#1a1aff]" />
                </div>
                <label className="block text-[13px] font-semibold text-gray-800">
                  Campaign goal
                </label>
              </div>
              <input
                type="text"
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value)}
                placeholder="e.g. Awareness, Sales, UGC, App installs"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none
                           transition-all placeholder:text-gray-300
                           focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10"
              />
            </div>

            <div className="px-6 py-5 border-b border-gray-100">
              <label className="block text-[13px] font-semibold text-gray-800 mb-2">
                Primary KPI
              </label>
              <input
                type="text"
                value={primaryKpi}
                onChange={(e) => setPrimaryKpi(e.target.value)}
                placeholder="e.g. Reach, CTR, Conversions, CPA"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none
                           transition-all placeholder:text-gray-300
                           focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10"
              />
            </div>

            <div className="px-6 py-5">
              <label className="block text-[13px] font-semibold text-gray-800 mb-2">
                Target KPI value
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={targetKpiValue}
                onChange={(e) =>
                  setTargetKpiValue(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                placeholder="e.g. 150000"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none
                           transition-all placeholder:text-gray-300
                           focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10"
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 max-w-[1350px] mx-auto" />

      {/* ═════════ SECTION 2: CONTENT TRACKING ═════════ */}
      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1350px] mx-auto items-start">
        {/* ── LEFT: TITLE & DESCRIPTION ──────────────────────── */}
        <div className="lg:w-[300px] shrink-0 w-full">
          <div className="sticky top-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
              Content tracking
            </h2>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Add the keywords, hashtags or mentions you want to track for your
              campaign. This will allow you to collect these publications easily
              and automatically add these values into your briefing and
              publication instructions.
            </p>
          </div>
        </div>

        {/* ── RIGHT: FORM ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="space-y-4">
            {/* Card: Track campaign posts */}
            <div className="bg-white  border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 mt-0.5">
                  <Crosshair size={16} className="text-[#1a1aff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800">
                    Track your campaign posts
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                    Measure the performance and success of your creator&apos;s
                    final publications by tracking the campaign keywords,
                    @mentions or #hashtags.
                  </p>
                </div>
              </div>
            </div>

            {/* Tags input — separate from card */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">
                Campaign keywords, @mentions and #hashtags
              </p>
              <div
                className="flex flex-wrap items-center gap-1.5 min-h-[44px] px-3 py-2  border border-gray-200 bg-white
                           focus-within:border-[#1a1aff] focus-within:ring-2 focus-within:ring-[#1a1aff]/10 transition-all"
              >
                {/* Rendered tags */}
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium",
                      t.type === "hashtag"
                        ? "bg-[#EEF2FF] text-[#1a1aff]"
                        : "bg-blue-50 text-blue-600",
                    )}
                  >
                    {t.type === "hashtag" ? "#" : "@"}
                    {t.value}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      className="hover:opacity-60 ml-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {/* Inline input */}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTagFromInput();
                    }
                    if (
                      e.key === "Backspace" &&
                      tagInput === "" &&
                      tags.length > 0
                    ) {
                      removeTag(tags.length - 1);
                    }
                  }}
                  placeholder={
                    tags.length === 0
                      ? "Type #hashtag or @mention and press Enter"
                      : ""
                  }
                  className="flex-1 min-w-[140px] py-1 text-sm rounded-none outline-none placeholder:text-gray-300 bg-transparent"
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                We will automatically discover content from the keywords,
                @mentions and #hashtags. You can edit these values at any time
                in the content settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── LOGO MODAL ────────────────────────────────────────────── */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white  w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Campaign Logo</h3>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 pt-4 border-b border-gray-100">
              <button
                type="button"
                className={cn(
                  "pb-3 text-sm font-semibold transition-all border-b-2",
                  modalTab === "icon"
                    ? "border-[#1a1aff] text-[#1a1aff]"
                    : "border-transparent text-gray-400 hover:text-gray-600",
                )}
                onClick={() => setModalTab("icon")}
              >
                Icon & Color
              </button>
              <button
                type="button"
                className={cn(
                  "pb-3 text-sm font-semibold transition-all border-b-2",
                  modalTab === "image"
                    ? "border-[#1a1aff] text-[#1a1aff]"
                    : "border-transparent text-gray-400 hover:text-gray-600",
                )}
                onClick={() => setModalTab("image")}
              >
                Custom Image
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {modalTab === "icon" ? (
                <div className="space-y-6">
                  {/* Emoji Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Select Icon
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CAMPAIGN_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setCoverEmoji(emoji)}
                          className={cn(
                            "w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all",
                            coverEmoji === emoji
                              ? "bg-gray-100 ring-2 ring-[#1a1aff]/20 shadow-sm"
                              : "hover:bg-gray-50 text-gray-500 hover:text-gray-900",
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Select Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {CAMPAIGN_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCoverColor(color)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            coverColor === color
                              ? "ring-2 ring-offset-2 ring-[#1a1aff] scale-110"
                              : "hover:scale-110 ring-1 ring-black/5",
                          )}
                          style={{ backgroundColor: color }}
                        >
                          {coverColor === color && (
                            <Check size={14} className="text-white/90" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoType("image");
                        setModalTab("image");
                        setLogoFile(file);
                        handleFilePreview(file, setLogoPreview);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className={cn(
                      "w-32 h-32  border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden group",
                      logoPreview
                        ? "border-[#1a1aff]/40 bg-[#EEF2FF]"
                        : "border-gray-200 hover:border-[#1a1aff]/40 hover:bg-[#EEF2FF] bg-gray-50",
                    )}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform text-[#1a1aff]">
                          <Upload size={18} />
                        </div>
                        <div className="text-[13px] font-semibold text-gray-700">
                          Upload image
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          PNG, JPG up to 5MB
                        </div>
                      </>
                    )}
                  </button>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="mt-4 text-xs font-semibold text-[#1a1aff] hover:underline"
                    >
                      Change image
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLogo}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#1a1aff] text-white hover:bg-[#1a1aff]/90 transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
