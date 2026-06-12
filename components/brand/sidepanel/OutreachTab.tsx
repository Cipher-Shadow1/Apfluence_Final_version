"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Send,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getGmailSmtpSettings, sendOutreachEmail } from "@/lib/queries/smtp";
import GmailAppPasswordModal from "@/components/brand/shared/GmailAppPasswordModal";
import EmailBodyEditor from "@/components/brand/outreach/EmailBodyEditor";
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────
export interface OutreachTabProps {
  influencer: {
    name: string;
    email?: string | null;
    username?: string;
  };
  authUserId: string;
}

// ─── Default template builder ─────────────────────────────────────────
function buildDefaultSubject(name: string) {
  return `Hi ${name} — Let's Collaborate!`;
}

function buildDefaultBody(name: string) {
  return `Hi ${name},

I hope you're having a great week!

My name is [Brand Name] and we're reaching out because we love your content and think you'd be a perfect fit for our upcoming campaign.

We'd love to offer you:
• A collaboration opportunity tailored to your audience
• Competitive compensation for your creative work

Would you be open to a quick chat or learning more details?

Looking forward to hearing from you!

Best regards,
[Brand Name] Team`;
}

// ─── Component ────────────────────────────────────────────────────────
export function OutreachTab({ influencer, authUserId }: OutreachTabProps) {
  // SMTP state
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form state
  const [manualEmail, setManualEmail] = useState("");
  const [subject, setSubject] = useState(() =>
    buildDefaultSubject(influencer.name),
  );
  const [body, setBody] = useState(() => buildDefaultBody(influencer.name));

  // Validation errors
  const [errors, setErrors] = useState<{
    email?: string;
    subject?: string;
    body?: string;
  }>({});

  // Status
  const [isSending, setIsSending] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ─── Resolve the target email ─────────────────────────────────────
  const targetEmail = influencer.email || manualEmail.trim();
  const targetName = influencer.name;

  // ─── Load SMTP status on mount ────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const settings = await getGmailSmtpSettings(authUserId);
        setSmtpConfigured(settings.hasPassword && !!settings.gmailUser);
      } catch {
        setSmtpConfigured(false);
      }
    })();
  }, [authUserId]);

  // ─── Auto-dismiss success banner ──────────────────────────────────
  useEffect(() => {
    if (banner?.type !== "success") return;
    const timer = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(timer);
  }, [banner]);

  // ─── Reset form to defaults ───────────────────────────────────────
  const resetForm = useCallback(() => {
    setSubject(buildDefaultSubject(influencer.name));
    setBody(buildDefaultBody(influencer.name));
    setManualEmail("");
    setErrors({});
  }, [influencer.name]);

  // ─── Validation ───────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!targetEmail) {
      newErrors.email = "An email address is required to send.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject line cannot be empty.";
    }

    if (!body.trim()) {
      newErrors.body = "Message body cannot be empty.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ─── Send handler ─────────────────────────────────────────────────
  async function handleSend() {
    if (smtpConfigured === false) {
      setShowPasswordModal(true);
      return;
    }

    if (!validate()) return;

    setIsSending(true);
    setBanner(null);

    try {
      const result = await sendOutreachEmail({
        authUserId,
        toEmail: targetEmail,
        toName: targetName,
        subject: subject.trim(),
        body: body.trim(),
      });

      if (result.success) {
        setBanner({
          type: "success",
          message: `✓ Email sent to ${targetName}!`,
        });
        resetForm();
      } else {
        if (result.authFailed) {
          setSmtpConfigured(false);
          setShowPasswordModal(true);
          return;
        }
        setBanner({
          type: "error",
          message: `Failed to send: ${result.error}`,
        });
      }
    } catch (err: any) {
      setBanner({
        type: "error",
        message: `Failed to send: ${err.message ?? "Unknown error"}`,
      });
    } finally {
      setIsSending(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Status banners ───────────────────────────────────────── */}
      {banner && (
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
            banner.type === "success"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-red-50 text-red-700 ring-1 ring-red-200"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {banner.message}
        </div>
      )}

      {/* ── SMTP not configured banner ───────────────────────────── */}
      {smtpConfigured === false && (
        <div className="flex items-start gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 ring-1 ring-blue-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Connect your Gmail to send emails.</p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors"
            >
              Connect Gmail →
            </button>
          </div>
        </div>
      )}

      {/* ── Section 1: Recipient bar ─────────────────────────────── */}
      <div className="flex flex-col border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="flex items-center gap-4 h-12 px-4 border-b border-zinc-100">
          <span className="text-sm font-semibold text-zinc-400 flex-shrink-0 w-12">
            To
          </span>
          {influencer.email ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-800">
                {influencer.name}
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-sm text-zinc-500">{influencer.email}</span>
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <span className="text-sm font-medium text-zinc-800">
                {influencer.name}
              </span>
              <span className="text-zinc-300">·</span>
              <input
                type="email"
                placeholder="Enter email to send..."
                value={manualEmail}
                onChange={(e) => {
                  setManualEmail(e.target.value);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
                }}
                className={cn(
                  "flex-1 text-sm text-zinc-800 outline-none bg-transparent border-0 focus:ring-0 placeholder:text-zinc-400",
                  errors.email && "placeholder:text-red-400",
                )}
              />
            </div>
          )}
        </div>

        {/* ── Section 2: Subject line ──────────────────────────────── */}
        <div className="flex items-center gap-4 h-12 px-4 border-b border-zinc-100">
          <span className="text-sm font-semibold text-zinc-400 flex-shrink-0 w-12">
            Subject
          </span>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject)
                setErrors((p) => ({ ...p, subject: undefined }));
            }}
            placeholder="Your collaboration opportunity..."
            className="flex-1 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 bg-transparent border-0 focus:ring-0"
          />
        </div>

        {/* ── Section 3: Email body ────────────────────────────────── */}
        <div className="flex flex-col border-none">
          <EmailBodyEditor
            value={body}
            onChange={(html) => {
              setBody(html);
              if (errors.body) setErrors((p) => ({ ...p, body: undefined }));
            }}
          />
        </div>
      </div>

      {/* Validation Errors Below Editor */}
      {(errors.email || errors.subject || errors.body) && (
        <div className="flex flex-col gap-1 px-1">
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
          {errors.subject && (
            <p className="text-xs text-red-500">{errors.subject}</p>
          )}
          {errors.body && <p className="text-xs text-red-500">{errors.body}</p>}
        </div>
      )}

      {/* ── Section 5: Action bar ────────────────────────────────── */}
      <div className="flex items-center justify-end pt-2">
        <button
          onClick={handleSend}
          disabled={isSending || smtpConfigured === false}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm
                     hover:bg-blue-700
                     focus:outline-none focus:ring-4 focus:ring-blue-500/20
                     disabled:cursor-not-allowed disabled:opacity-50
                     transition-all active:scale-[0.98]"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Email
            </>
          )}
        </button>
      </div>

      {/* Gmail App Password Modal */}
      <GmailAppPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        authUserId={authUserId}
        onSaveSuccess={() => {
          setSmtpConfigured(true);
          setShowPasswordModal(false);
          // Wait briefly for modal to close before sending
          setTimeout(() => handleSend(), 150);
        }}
      />
    </div>
  );
}
