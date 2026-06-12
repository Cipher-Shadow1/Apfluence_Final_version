"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getGmailSmtpSettings } from "@/lib/queries/smtp";
import GmailAppPasswordModal from "@/components/brand/shared/GmailAppPasswordModal";
import { getBrandProfile, updateBrandDefaults } from "@/app/actions/brand";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

type BrandDefaultsForm = {
  country_code: string;
  region: string;
  city: string;
  timezone: string;
  preferred_language: string;
  secondary_language: string;
  currency: string;
  phone_whatsapp: string;
  billing_legal_name: string;
  tax_id: string;
  invoice_email: string;
  finance_contact_name: string;
  shipping_from_country: string;
  shipping_from_city: string;
  shipping_notes_default: string;
  brand_voice_default: string;
  mandatory_terms_default: string;
  forbidden_terms_default: string;
};

export default function BrandSettingsPage() {
  const { userId, isLoaded } = useSupabaseUser();

  // ─── Gmail SMTP state ───────────────────────────────────────────────
  const [gmailUser, setGmailUser] = useState<string | null>(null);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<BrandDefaultsForm>({
    country_code: "",
    region: "",
    city: "",
    timezone: "Africa/Algiers",
    preferred_language: "fr",
    secondary_language: "",
    currency: "DZD",
    phone_whatsapp: "",
    billing_legal_name: "",
    tax_id: "",
    invoice_email: "",
    finance_contact_name: "",
    shipping_from_country: "",
    shipping_from_city: "",
    shipping_notes_default: "",
    brand_voice_default: "",
    mandatory_terms_default: "",
    forbidden_terms_default: "",
  });

  // ─── Load existing SMTP settings on mount ───────────────────────────
  useEffect(() => {
    if (!isLoaded || !userId) return;

    (async () => {
      try {
        const settings = await getGmailSmtpSettings(userId);
        if (settings.gmailUser) setGmailUser(settings.gmailUser);
        setHasExistingPassword(settings.hasPassword);
      } catch (err) {
        console.error("Failed to load SMTP settings:", err);
      } finally {
        setIsLoadingSmtp(false);
      }
    })();

    (async () => {
      try {
        const profile = await getBrandProfile(userId);
        if (profile) {
          setDefaults({
            country_code: profile.country_code ?? "",
            region: profile.region ?? "",
            city: profile.city ?? "",
            timezone: profile.timezone ?? "Africa/Algiers",
            preferred_language: profile.preferred_language ?? "fr",
            secondary_language: profile.secondary_language ?? "",
            currency: profile.currency ?? "DZD",
            phone_whatsapp: profile.phone_whatsapp ?? "",
            billing_legal_name: profile.billing_legal_name ?? "",
            tax_id: profile.tax_id ?? "",
            invoice_email: profile.invoice_email ?? "",
            finance_contact_name: profile.finance_contact_name ?? "",
            shipping_from_country: profile.shipping_from_country ?? "",
            shipping_from_city: profile.shipping_from_city ?? "",
            shipping_notes_default: profile.shipping_notes_default ?? "",
            brand_voice_default: profile.brand_voice_default ?? "",
            mandatory_terms_default: profile.mandatory_terms_default ?? "",
            forbidden_terms_default: profile.forbidden_terms_default ?? "",
          });
        }
      } catch (err) {
        console.error("Failed to load brand defaults:", err);
      } finally {
        setIsLoadingDefaults(false);
      }
    })();
  }, [isLoaded, userId]);

  // ─── Derived status ─────────────────────────────────────────────────
  const isConfigured = hasExistingPassword;

  const handleDefaultsChange = (
    key: keyof BrandDefaultsForm,
    value: string,
  ) => {
    setDefaults((prev) => ({ ...prev, [key]: value }));
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleSaveDefaults = async () => {
    if (!userId) return;
    setIsSavingDefaults(true);
    setSaveMessage(null);
    setSaveError(null);
    try {
      await updateBrandDefaults(userId, {
        country_code: defaults.country_code || null,
        region: defaults.region || null,
        city: defaults.city || null,
        timezone: defaults.timezone || null,
        preferred_language: defaults.preferred_language || null,
        secondary_language: defaults.secondary_language || null,
        currency: defaults.currency || null,
        phone_whatsapp: defaults.phone_whatsapp || null,
        billing_legal_name: defaults.billing_legal_name || null,
        tax_id: defaults.tax_id || null,
        invoice_email: defaults.invoice_email || null,
        finance_contact_name: defaults.finance_contact_name || null,
        shipping_from_country: defaults.shipping_from_country || null,
        shipping_from_city: defaults.shipping_from_city || null,
        shipping_notes_default: defaults.shipping_notes_default || null,
        brand_voice_default: defaults.brand_voice_default || null,
        mandatory_terms_default: defaults.mandatory_terms_default || null,
        forbidden_terms_default: defaults.forbidden_terms_default || null,
      });
      setSaveMessage("Brand defaults saved successfully.");
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save brand defaults.");
    } finally {
      setIsSavingDefaults(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── General settings card ─────────────────────────────────── */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900">Settings</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Manage your brand account, team preferences, and billing settings.
        </p>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Brand Defaults</h2>
          <p className="mt-1 text-sm text-zinc-500">
            These defaults prefill campaign setup and recommendation logic.
          </p>
        </div>

        {isLoadingDefaults ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={defaults.country_code}
                onChange={(e) => handleDefaultsChange("country_code", e.target.value)}
                placeholder="Country code (e.g. DZ)"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.region}
                onChange={(e) => handleDefaultsChange("region", e.target.value)}
                placeholder="Region / Wilaya"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.city}
                onChange={(e) => handleDefaultsChange("city", e.target.value)}
                placeholder="City"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.timezone}
                onChange={(e) => handleDefaultsChange("timezone", e.target.value)}
                placeholder="Timezone"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.preferred_language}
                onChange={(e) =>
                  handleDefaultsChange("preferred_language", e.target.value)
                }
                placeholder="Preferred language (fr/ar/en)"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.secondary_language}
                onChange={(e) =>
                  handleDefaultsChange("secondary_language", e.target.value)
                }
                placeholder="Secondary language"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.currency}
                onChange={(e) => handleDefaultsChange("currency", e.target.value)}
                placeholder="Currency (DZD/EUR/USD)"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.phone_whatsapp}
                onChange={(e) =>
                  handleDefaultsChange("phone_whatsapp", e.target.value)
                }
                placeholder="WhatsApp phone"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.billing_legal_name}
                onChange={(e) =>
                  handleDefaultsChange("billing_legal_name", e.target.value)
                }
                placeholder="Billing legal name"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.tax_id}
                onChange={(e) => handleDefaultsChange("tax_id", e.target.value)}
                placeholder="Tax ID / NIF"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.invoice_email}
                onChange={(e) =>
                  handleDefaultsChange("invoice_email", e.target.value)
                }
                placeholder="Invoice email"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.finance_contact_name}
                onChange={(e) =>
                  handleDefaultsChange("finance_contact_name", e.target.value)
                }
                placeholder="Finance contact name"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.shipping_from_country}
                onChange={(e) =>
                  handleDefaultsChange("shipping_from_country", e.target.value)
                }
                placeholder="Shipping from country"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <input
                value={defaults.shipping_from_city}
                onChange={(e) =>
                  handleDefaultsChange("shipping_from_city", e.target.value)
                }
                placeholder="Shipping from city"
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <textarea
                value={defaults.shipping_notes_default}
                onChange={(e) =>
                  handleDefaultsChange("shipping_notes_default", e.target.value)
                }
                placeholder="Shipping notes default"
                rows={2}
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <textarea
                value={defaults.brand_voice_default}
                onChange={(e) =>
                  handleDefaultsChange("brand_voice_default", e.target.value)
                }
                placeholder="Brand voice default"
                rows={2}
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <textarea
                value={defaults.mandatory_terms_default}
                onChange={(e) =>
                  handleDefaultsChange("mandatory_terms_default", e.target.value)
                }
                placeholder="Mandatory terms default"
                rows={2}
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
              <textarea
                value={defaults.forbidden_terms_default}
                onChange={(e) =>
                  handleDefaultsChange("forbidden_terms_default", e.target.value)
                }
                placeholder="Forbidden terms default"
                rows={2}
                className="px-3 py-2.5 rounded-lg border border-zinc-200 text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                {saveMessage && <p className="text-emerald-600">{saveMessage}</p>}
                {saveError && <p className="text-red-600">{saveError}</p>}
              </div>
              <button
                onClick={handleSaveDefaults}
                disabled={isSavingDefaults}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {isSavingDefaults ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Save defaults
              </button>
            </div>
          </>
        )}
      </section>

      {/* ── Gmail SMTP / Email Outreach card ──────────────────────── */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        {/* Card header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Email Outreach
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Connect your Gmail account to send outreach emails directly to
                influencers.
              </p>
            </div>
          </div>

          {/* Status badge */}
          {!isLoadingSmtp && (
            <div className="shrink-0">
              {isConfigured ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected — {gmailUser}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Not configured
                </span>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-zinc-100" />

        {/* Form fields */}
        {!isLoadingSmtp && !isConfigured && (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-zinc-600">
              You haven't connected a Gmail account yet. Connecting your account
              allows you to securely send bulk and individual outreach emails
              right from the Apfluence dashboard.
            </p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 transition-colors"
            >
              Connect Gmail
            </button>
          </div>
        )}

        {/* Success / re-connect */}
        {!isLoadingSmtp && isConfigured && (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-zinc-600">
              Your Gmail account is successfully connected! You can now send
              emails from the campaigns dashboard.
            </p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm
                         hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500/40 focus:ring-offset-2 transition-colors"
            >
              Update App Password
            </button>
          </div>
        )}
      </section>

      {/* Gmail App Password Modal */}
      {userId && (
        <GmailAppPasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          authUserId={userId}
          onSaveSuccess={() => {
            setHasExistingPassword(true);
            setShowPasswordModal(false);
          }}
        />
      )}
    </div>
  );
}
