"use client";

import { useMemo } from "react";
import { useWizard } from "@/components/brand/campaigns/wizard/CampaignWizardContext";
import EmailBodyEditor from "@/components/brand/outreach/EmailBodyEditor";
import { upsertDefaultSignatureHtml } from "@/lib/email/signature";

export default function Step5Page() {
  const {
    emailSubject,
    setEmailSubject,
    emailTemplate,
    setEmailTemplate,
    logoPreview,
  } = useWizard();

  const replaceSignatureInTemplate = (html: string) =>
    upsertDefaultSignatureHtml(html);

  // For display only: swap the token src with the real preview URL.
  // We only touch the src attribute — the signature's own styles (width, etc.) stay intact.
  const editorValue = useMemo(() => {
    const base = replaceSignatureInTemplate(emailTemplate || "");
    if (!logoPreview) return base;
    return base.replace(
      /src="\{\{campaign_logo_url\}\}"/g,
      `src="${logoPreview}"`,
    );
  }, [emailTemplate, logoPreview]);

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1350px] mx-auto items-start">
        {/* ── LEFT: TITLE & DESCRIPTION ──────────────────────── */}
        <div className="lg:w-[300px] shrink-0 w-full">
          <div className="sticky top-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
              Email settings
            </h2>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Customize your outreach email. The signature is appended
              automatically (logo comes from Step 2).
            </p>
          </div>
        </div>

        {/* ── RIGHT: FORM ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-7 space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Email subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Collaboration opportunity with {{brand_name}}"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all placeholder:text-gray-300 focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Email body (signature is appended automatically)
              </label>
              <EmailBodyEditor
                value={editorValue}
                onChange={(html) => {
                  // Revert the preview src back to the token before saving.
                  const normalized = logoPreview
                    ? html.replace(
                      new RegExp(
                        `src="${logoPreview.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`,
                        "g",
                      ),
                      `src="{{campaign_logo_url}}"`,
                    )
                    : html;
                  setEmailTemplate(replaceSignatureInTemplate(normalized));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}