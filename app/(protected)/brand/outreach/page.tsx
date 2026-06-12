"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Send, ChevronDown, CheckCircle2, XCircle, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getGmailSmtpSettings, sendOutreachEmail } from "@/lib/queries/smtp";
import EmailBodyEditor from "@/components/brand/outreach/EmailBodyEditor";
import MergeFieldsPanel from "@/components/brand/outreach/MergeFieldsPanel";
import GmailAppPasswordModal from "@/components/brand/shared/GmailAppPasswordModal";
import { buildDefaultSignatureHtml } from "@/lib/email/signature";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

const DEFAULT_SUBJECT =
  "Your audience will love this product {{influencer_name}}";

const DEFAULT_BODY = `<p>Hi <span style="color:#6366F1;font-weight:600">{{first_name}}</span>,</p>
<p></p>
<p>We've been following your content closely, and we're truly impressed with what you do. We believe your unique style would be a perfect fit for our upcoming campaign, and we'd love to work with you.</p>
<p></p>
<p>You'll be able to select some of our products, which we'll send you for free.</p>
<p></p>
<p>Want to know more? You can access and apply to our partnership <a href="{{application_link}}" style="color:#6366F1">HERE</a>. No sign-up is required, and you can select the products you'd like to feature.</p>
<p></p>
<p>We're excited about the potential collaboration and are looking forward to hearing from you.</p>
<p></p>
<p>Best,</p>
${buildDefaultSignatureHtml()}`;

export default function OutreachPage() {
  const { userId } = useSupabaseUser();
  const authUserId = userId ?? "";

  // ── SMTP state ───────────────────────────────────────────────────────
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);
  const [gmailUser, setGmailUser] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // ── Form state ───────────────────────────────────────────────────────
  const [toEmail, setToEmail] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [hasApplicationLink, setHasApplicationLink] = useState(true);

  // ── Send state ───────────────────────────────────────────────────────
  const [isSending, setIsSending] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ── Validation ───────────────────────────────────────────────────────
  const [errors, setErrors] = useState<{ toEmail?: string; subject?: string; body?: string }>({});

  // ── Editor token insert ref ──────────────────────────────────────────
  const insertTokenFnRef = useRef<((token: string) => void) | null>(null);

  const handleInsertToken = useCallback((token: string) => {
    insertTokenFnRef.current?.(token);
  }, []);

  const handleEditorInsertReady = useCallback(
    (insertFn: (token: string) => void) => {
      insertTokenFnRef.current = insertFn;
    },
    [],
  );

  const handleMergeFieldInsert = useCallback(
    (token: string) => {
      handleInsertToken(token);
    },
    [handleInsertToken],
  );

  // ── Load SMTP settings ───────────────────────────────────────────────
  useEffect(() => {
    if (!authUserId) return;
    (async () => {
      try {
        const settings = await getGmailSmtpSettings(authUserId);
        setGmailUser(settings.gmailUser);
        setSmtpConfigured(settings.hasPassword && !!settings.gmailUser);
      } catch {
        setSmtpConfigured(false);
      }
    })();
  }, [authUserId]);

  // ── Auto-dismiss success banner ──────────────────────────────────────
  useEffect(() => {
    if (banner?.type !== "success") return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  // ── Validation ───────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!toEmail.trim()) {
      newErrors.toEmail = "Recipient email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail.trim())) {
      newErrors.toEmail = "Please enter a valid email address.";
    }
    if (!subject.trim()) newErrors.subject = "Subject cannot be empty.";
    if (!body.trim() || body === "<p></p>") newErrors.body = "Message body cannot be empty.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Send handler ─────────────────────────────────────────────────────
  const handleSend = async () => {
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
        toEmail: toEmail.trim(),
        toName: toName.trim() || toEmail.trim(),
        subject: subject.trim(),
        body,                // HTML from Tiptap — bold/italic/colors preserved
      });
      if (result.success) {
        setBanner({ type: "success", message: `✓ Email sent to ${toEmail.trim()}!` });
        setToEmail("");
        setToName("");
      } else {
        if (result.authFailed) {
          setSmtpConfigured(false);
          setShowPasswordModal(true);
          return;
        }
        setBanner({ type: "error", message: result.error ?? "Failed to send." });
      }
    } catch (err: any) {
      setBanner({ type: "error", message: err.message ?? "Unknown error." });
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    setSubject(DEFAULT_SUBJECT);
    setBody(DEFAULT_BODY);
    setToEmail("");
    setToName("");
    setErrors({});
    setBanner(null);
  };

  const bodyHasAppLink = body.includes("{{application_link}}");

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col h-screen bg-white overflow-hidden">

        {/* ── PAGE HEADER ────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-gray-900">Outreach</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Send a test email using your connected Gmail account
            </p>
          </div>

          {/* SMTP status pill */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
            smtpConfigured === null
              ? "bg-gray-50 text-gray-400 border-gray-200"
              : smtpConfigured
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              smtpConfigured === null ? "bg-gray-300 animate-pulse"
              : smtpConfigured ? "bg-green-500"
              : "bg-red-400"
            )} />
            {smtpConfigured === null ? "Checking SMTP…"
              : smtpConfigured ? `Connected: ${gmailUser}`
              : "SMTP not configured"}
          </div>
        </div>

        {/* ── SMTP NOT CONFIGURED BANNER ──────────────────────────── */}
        {smtpConfigured === false && (
          <div className="flex-shrink-0 mx-6 mt-4">
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 px-5 py-4 text-sm text-blue-700 border border-blue-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Connect your Gmail to send emails.</p>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors"
                >
                  Connect Gmail →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SEND STATUS BANNER ──────────────────────────────────── */}
        {banner && (
          <m.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 mx-6 mt-4"
          >
            <div className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium border",
              banner.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            )}>
              {banner.type === "success"
                ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                : <XCircle className="h-4 w-4 shrink-0" />
              }
              {banner.message}
            </div>
          </m.div>
        )}

        {/* ── FROM ROW ────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-gray-100 px-6 py-0">
          <div className="flex items-center gap-4 h-12">
            <span className="text-sm font-semibold text-gray-400 flex-shrink-0 w-16">From</span>
            <span className="text-sm text-gray-600">
              {gmailUser ?? (
                <span className="text-gray-300 italic">
                  {smtpConfigured === null ? "Loading…" : "Not connected"}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* ── TO ROW ──────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-gray-100 px-6 py-0">
          <div className="flex items-center gap-4 h-12">
            <span className="text-sm font-semibold text-gray-400 flex-shrink-0 w-16">To</span>
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <input
                type="email"
                value={toEmail}
                onChange={(e) => {
                  setToEmail(e.target.value);
                  if (errors.toEmail) setErrors((p) => ({ ...p, toEmail: undefined }));
                }}
                placeholder="recipient@email.com"
                className={cn(
                  "w-56 text-sm text-gray-800 outline-none bg-transparent border-0 focus:ring-0 placeholder:text-gray-300",
                  errors.toEmail && "placeholder:text-red-300"
                )}
              />
              {errors.toEmail && (
                <span className="text-xs text-red-500 flex-shrink-0">{errors.toEmail}</span>
              )}
              <span className="text-gray-200 flex-shrink-0">·</span>
              <input
                type="text"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="Recipient name (optional)"
                className="flex-1 text-sm text-gray-600 outline-none bg-transparent border-0 focus:ring-0 placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* ── SUBJECT LINE ────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-gray-100 px-6 py-0">
          <div className="flex items-center gap-4 h-12">
            <span className="text-sm font-semibold text-gray-400 flex-shrink-0 w-16">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) setErrors((p) => ({ ...p, subject: undefined }));
              }}
              placeholder="Email subject line..."
              className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-300 bg-transparent border-0 focus:ring-0"
            />
            {errors.subject && (
              <span className="text-xs text-red-500 flex-shrink-0">{errors.subject}</span>
            )}
          </div>
        </div>

        {/* ── MAGIC LINK BANNER ───────────────────────────────────── */}
        <div className="flex-shrink-0 mx-6 mt-4 mb-0">
          <div className={cn(
            "flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-300",
            bodyHasAppLink ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-200"
          )}>
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
              bodyHasAppLink ? "bg-green-500" : "bg-gray-300"
            )}>
              <svg viewBox="0 0 12 12" className="w-3 h-3">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Magic link{" "}
              <span className={cn(
                "font-bold font-mono text-xs transition-colors",
                bodyHasAppLink ? "text-indigo-600" : "text-gray-400"
              )}>
                {"{{application_link}}"}
              </span>
              {bodyHasAppLink
                ? " is included — product shipping & sales tracking unlocked."
                : " not found in body — add it to unlock product shipping & tracking."}
            </p>
          </div>
        </div>

        {/* ── MAIN CONTENT: EDITOR + MERGE FIELDS ─────────────────── */}
        <div className="flex flex-1 min-h-0 gap-0 mt-4 px-6 pb-0">
          {/* LEFT — Rich text editor */}
          <div className="flex-1 min-w-0 mr-4 flex flex-col">
            <EmailBodyEditor
              value={body}
              onChange={setBody}
              onInsertToken={handleEditorInsertReady}
            />
            {errors.body && (
              <p className="text-xs text-red-500 mt-1.5">{errors.body}</p>
            )}
          </div>

          {/* RIGHT — Merge fields panel */}
          <div className="flex-shrink-0 w-72 border border-gray-200 rounded-xl overflow-hidden">
            <MergeFieldsPanel onInsert={handleMergeFieldInsert} />
          </div>
        </div>

        {/* ── FOOTER BAR ──────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-between mt-4">

          {/* Left — Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHasApplicationLink((v) => !v)}
              className={cn(
                "relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0",
                hasApplicationLink ? "bg-indigo-600" : "bg-gray-200",
              )}
            >
              <span className={cn(
                "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                hasApplicationLink ? "translate-x-5" : "translate-x-0",
              )} />
            </button>
            <span className="text-xs text-gray-500">Include application link</span>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>

            {/* Send button with dropdown arrow */}
            <div className="flex items-center rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || smtpConfigured === false}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5",
                  "text-sm font-semibold text-white transition-all",
                  isSending || smtpConfigured === false
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700",
                )}
              >
                {isSending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {isSending ? "Sending…" : "Send Email"}
              </button>
              <div className="w-px h-full bg-blue-500/30" />
              <button
                type="button"
                disabled={isSending || smtpConfigured === false}
                className={cn(
                  "px-2.5 py-2.5 text-white transition-colors",
                  isSending || smtpConfigured === false
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Gmail App Password Modal */}
      <GmailAppPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        authUserId={authUserId}
        onSaveSuccess={() => {
          setSmtpConfigured(true);
          setShowPasswordModal(false);
          // Wait briefly for modal to close before checking if we should resend
        }}
      />
    </LazyMotion>
  );
}
