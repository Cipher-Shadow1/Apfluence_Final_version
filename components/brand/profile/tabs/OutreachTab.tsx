"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateBrandOutreach } from "@/app/actions/brand";
import { StatusBanner } from "./StatusBanner";
import type { BrandData } from "../types";

interface OutreachTabProps {
  authUserId: string;
  initialData: BrandData;
  onUpdate: (data: Partial<BrandData>) => void;
}

export function OutreachTab({ authUserId, initialData, onUpdate }: OutreachTabProps) {
  const [gmailPassword, setGmailPassword] = useState("");
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [passwordIsConfigured, setPasswordIsConfigured] = useState(!!initialData.gmail_smtp_app_password);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const brandEmail = initialData.email ?? "";

  const handleSave = async () => {
    if (!authUserId || !gmailPassword.trim()) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      await updateBrandOutreach(authUserId, gmailPassword.trim());
      setSaveStatus("success");
      setGmailPassword("");
      setPasswordIsConfigured(true);
      onUpdate({ gmail_smtp_app_password: "configured" });
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleRemove = async () => {
    if (!authUserId) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      await updateBrandOutreach(authUserId, "");
      setSaveStatus("success");
      setGmailPassword("");
      setPasswordIsConfigured(false);
      onUpdate({ gmail_smtp_app_password: null });
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const isDirty = gmailPassword.trim().length > 0;

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        Email Outreach Settings
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Configure Gmail to send outreach emails directly
        from Apfluence using your own email address.
      </p>

      <StatusBanner status={saveStatus} />

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 mb-6">
        <AlertCircle size={15} className="text-[#2b2ef8] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          You need a Gmail App Password — not your regular password. Go to{" "}
          <a
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            Google App Passwords
          </a>{" "}
          to generate one.
        </p>
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-2 mb-5">
        {brandEmail && passwordIsConfigured ? (
          <>
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-600">
              Connected — {brandEmail}
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-xs font-medium text-gray-400">
              Not configured
            </span>
          </>
        )}
      </div>

      <div className="space-y-4">
        {/* Gmail address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Gmail Address
          </label>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
            <span className="text-sm text-gray-600">
              {brandEmail || "—"}
            </span>
            <Lock size={12} className="text-gray-300 ml-auto" />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            The Gmail account you will send outreach from (matches your account email).
          </p>
        </div>

        {/* App password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Gmail App Password
          </label>
          <div className="relative">
            <input
              type={showSmtpPassword ? "text" : "password"}
              value={gmailPassword}
              onChange={(e) => setGmailPassword(e.target.value)}
              autoComplete="off"
              placeholder={
                passwordIsConfigured
                  ? "●●●●●●●●●●●●●●●● (configured)"
                  : "Enter 16-character app password"
              }
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm outline-none transition-all placeholder:text-gray-300 focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowSmtpPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showSmtpPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            16-character token from Google. Not your Gmail password.
            {passwordIsConfigured && !gmailPassword && (
              <span className="ml-1 text-green-600 font-medium">
                ✓ Configured — leave blank to keep existing
              </span>
            )}
          </p>
        </div>

        {/* How to get app password link */}
        <a
          href="https://support.google.com/accounts/answer/185833"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2b2ef8] hover:underline"
        >
          <ExternalLink size={12} />
          How to get a Gmail App Password
        </a>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2">
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
            Save outreach settings
          </button>

          {(brandEmail || passwordIsConfigured) && (
            <button
              onClick={handleRemove}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
            >
              Remove config
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
