"use client";

import { useState } from "react";
import { ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateBrandCompany } from "@/app/actions/brand";
import { StatusBanner } from "./StatusBanner";
import type { BrandData } from "../types";

const INDUSTRIES = [
  "E-commerce",
  "Technology",
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Food & Beverage",
  "Health & Wellness",
  "Travel",
  "Entertainment",
  "Gaming",
  "Finance",
  "Education",
  "Automotive",
  "Other",
];

interface CompanyTabProps {
  authUserId: string;
  initialData: BrandData;
  onUpdate: (data: Partial<BrandData>) => void;
}

export function CompanyTab({ authUserId, initialData, onUpdate }: CompanyTabProps) {
  const [industry, setIndustry] = useState(initialData.industry ?? "");
  const [website, setWebsite] = useState(initialData.website ?? "");
  const [city, setCity] = useState(initialData.city ?? "");
  const [preferredLanguage, setPreferredLanguage] = useState(
    initialData.preferred_language ?? "",
  );
  const [currency, setCurrency] = useState(initialData.currency ?? "");
  const [phoneWhatsapp, setPhoneWhatsapp] = useState(
    initialData.phone_whatsapp ?? "",
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSave = async () => {
    if (!authUserId) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      await updateBrandCompany(authUserId, {
        industry: industry || null,
        website: website.trim() || null,
        city: city.trim() || null,
        preferred_language: preferredLanguage.trim() || null,
        currency: currency.trim() || null,
        phone_whatsapp: phoneWhatsapp.trim() || null,
      });
      setSaveStatus("success");
      onUpdate({
        industry: industry || null,
        website: website.trim() || null,
        city: city.trim() || null,
        preferred_language: preferredLanguage.trim() || null,
        currency: currency.trim() || null,
        phone_whatsapp: phoneWhatsapp.trim() || null,
      });
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const isDirty =
    industry !== (initialData.industry || "") ||
    website.trim() !== (initialData.website || "") ||
    city.trim() !== (initialData.city || "") ||
    preferredLanguage.trim() !== (initialData.preferred_language || "") ||
    currency.trim() !== (initialData.currency || "") ||
    phoneWhatsapp.trim() !== (initialData.phone_whatsapp || "");

  return (
    <div className="space-y-6">
      <div className="py-4 border-b border-gray-100">
        <StatusBanner status={saveStatus} />

        {/* Industry */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-600 w-36 shrink-0">
            Industry
          </label>
          <div className="relative flex-1">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none appearance-none transition-all focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10 bg-white"
            >
              <option value="">Select your industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Website */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-600 w-36 shrink-0">
            Company Website
          </label>
          <div className="flex-1">
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all placeholder:text-gray-300 focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <label className="text-sm font-medium text-gray-600 w-36 shrink-0">
            City
          </label>
          <div className="flex-1">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Algiers"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all placeholder:text-gray-300 focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <label className="text-sm font-medium text-gray-600 w-36 shrink-0">
            Language
          </label>
          <div className="flex-1">
            <input
              type="text"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              placeholder="fr / ar / en"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all placeholder:text-gray-300 focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <label className="text-sm font-medium text-gray-600 w-36 shrink-0">
            Currency
          </label>
          <div className="flex-1">
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="DZD"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all placeholder:text-gray-300 focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <label className="text-sm font-medium text-gray-600 w-36 shrink-0">
            WhatsApp
          </label>
          <div className="flex-1">
            <input
              type="text"
              value={phoneWhatsapp}
              onChange={(e) => setPhoneWhatsapp(e.target.value)}
              placeholder="+213..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all placeholder:text-gray-300 focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5",
            "rounded-xl text-sm font-semibold text-white",
            "transition-all duration-200",
            isSaving || !isDirty
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#2b2ef8] hover:bg-[#1a1ce8] shadow-sm",
          )}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <CheckCircle2 size={14} />
          )}
          Save changes
        </button>
      </div>
    </div>
  );
}
