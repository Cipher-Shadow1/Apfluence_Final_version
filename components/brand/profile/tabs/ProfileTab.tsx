"use client";

import { useState, useRef } from "react";
import { Upload, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateBrandProfile } from "@/app/actions/brand";
import { StatusBanner } from "./StatusBanner";
import type { BrandData } from "../types";

interface ProfileTabProps {
  authUserId: string;
  initialData: BrandData;
  onUpdate: (data: Partial<BrandData>) => void;
}

export function ProfileTab({ authUserId, initialData, onUpdate }: ProfileTabProps) {
  const [companyName, setCompanyName] = useState(initialData.company_name ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logo_url ?? null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const brandEmail = initialData.email ?? "";

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!uploadPreset || !cloudName) {
      throw new Error("Cloudinary environment variables are missing");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const json = await res.json();
    if (!res.ok || !json?.secure_url) {
      throw new Error(json?.error?.message || "Upload failed");
    }
    return json.secure_url as string;
  };

  const handleSave = async () => {
    if (!authUserId || !companyName.trim()) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      let finalLogoUrl = initialData.logo_url;

      if (logoFile) {
        finalLogoUrl = await uploadToCloudinary(logoFile);
        setLogoFile(null); // Reset file after successful upload
      }

      await updateBrandProfile(authUserId, {
        company_name: companyName.trim(),
        logo_url: finalLogoUrl || null,
      });

      setSaveStatus("success");
      onUpdate({
        company_name: companyName.trim(),
        logo_url: finalLogoUrl || null,
      });
    } catch (err) {
      console.error("Failed to save profile:", err);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const isDirty = companyName.trim() !== (initialData.company_name || "") || logoFile !== null;

  return (
    <div className="space-y-6">
      <div className="py-4 border-b border-gray-100">
        <StatusBanner status={saveStatus} />

        {/* Brand logo upload */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-600 w-36 flex-shrink-0">
            Brand Logo
          </span>
          <div className="flex items-center gap-4 flex-1">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setLogoFile(f);
                  const reader = new FileReader();
                  reader.onload = (ev) =>
                    setLogoPreview(ev.target?.result as string);
                  reader.readAsDataURL(f);
                }
              }}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="relative group"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#2b2ef8] transition-colors">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Brand Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2b2ef8]/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#2b2ef8]">
                      {companyName?.slice(0, 2).toUpperCase() || "BR"}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload size={16} className="text-white" />
              </div>
            </button>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {logoPreview ? "Change logo" : "Upload logo"}
              </p>
              <p className="text-xs text-gray-400">
                Click the avatar to upload. JPG, PNG, or SVG.
              </p>
            </div>
          </div>
        </div>

        {/* Company name */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-600 w-36 flex-shrink-0">
            Company Name
          </label>
          <div className="flex-1">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your brand name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all placeholder:text-gray-300 focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              This name appears on campaigns and outreach.
            </p>
          </div>
        </div>

        {/* Account Email */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-600 w-36 flex-shrink-0">
            Account Email
          </label>
          <div className="flex-1">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-sm text-gray-600">
                {brandEmail || "—"}
              </span>
              <Lock size={12} className="text-gray-300 ml-auto" />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Your account email. This cannot be changed.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !companyName.trim() || !isDirty}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5",
            "rounded-xl text-sm font-semibold text-white",
            "transition-all duration-200",
            isSaving || !companyName.trim() || !isDirty
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#2b2ef8] hover:bg-[#1a1ce8] shadow-sm",
          )}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <CheckCircle2 size={14} />
          )}
          Save profile
        </button>
      </div>
    </div>
  );
}
