"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Send,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { LoaderOne as Loader2 } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import {
  EMAIL_VARIABLES,
  buildVariableContext,
  resolveTemplate,
  insertVariableAtCursor,
} from "@/lib/email/resolveVariables";
import MergeFieldsPanel from "@/components/brand/outreach/MergeFieldsPanel";
import EmailBodyEditor from "@/components/brand/outreach/EmailBodyEditor";
import GmailAppPasswordModal from "@/components/brand/shared/GmailAppPasswordModal";
import { getGmailSmtpSettings } from "@/lib/queries/smtp";
import {
  buildDefaultSignatureHtml,
  upsertDefaultSignatureHtml,
} from "@/lib/email/signature";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

interface BulkEmailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInfluencers: any[]; // array of campaign_influencer rows with .influencers joined
  campaign: any;
  brandName: string;
  onSent: (successCount: number) => void;
  initialSubject?: string;
  initialBody?: string;
  panelTitle?: string;
  panelSubtitle?: string;
}

type SendState = "idle" | "sending" | "done" | "error";
type DefaultState = "idle" | "saving" | "saved" | "error";

export default function BulkEmailPanel({
  isOpen,
  onClose,
  selectedInfluencers,
  campaign,
  brandName,
  onSent,
  initialSubject,
  initialBody,
  panelTitle,
  panelSubtitle,
}: BulkEmailPanelProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendResult, setSendResult] = useState<{
    successCount: number;
    failCount: number;
  } | null>(null);
  const [defaultState, setDefaultState] = useState<DefaultState>("idle");

  const { userId } = useSupabaseUser();
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const defaultSubject = `Collaboration opportunity with {{brand_name}}`
  const signatureConfig = useMemo(
    () => ({ logoUrl: campaign?.logo_url ?? undefined }),
    [campaign?.logo_url],
  );
  const defaultBody = [
    `<p>Hi <span style="color:#6366F1;font-weight:600">{{first_name}}</span>,</p>`,
    `<p></p>`,
    `<p>We came across your profile and think you'd be a perfect fit for our <b>{{campaign_name}}</b> campaign.</p>`,
    `<p></p>`,
    `<p>You can view the details and apply here: <a href="{{application_link}}" style="color:#6366F1">Apply</a></p>`,
    `<p></p>`,
    `<p>Best,</p>`,
    buildDefaultSignatureHtml(signatureConfig),
  ].join("");

  const ensureSignature = useCallback((html: string) => {
    if (!html) return defaultBody;
    return upsertDefaultSignatureHtml(html, signatureConfig);
  }, [defaultBody, signatureConfig]);

  // Initialize from campaign template (persisted per-campaign)
  useEffect(() => {
    if (!isOpen) return;
    setSubject(
      initialSubject || (campaign?.email_subject as string) || defaultSubject,
    );
    setBody(
      ensureSignature(
        initialBody || (campaign?.email_template as string) || defaultBody,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, campaign?.id, campaign?.logo_url, ensureSignature, initialSubject, initialBody]);

  // ── Fetch SMTP status ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && userId) {
      getGmailSmtpSettings(userId).then((settings) => {
        setSmtpConfigured(settings.hasPassword && !!settings.gmailUser);
      });
    }
  }, [isOpen, userId]);

  // ── Fresh email lookup — re-fetch from DB every time panel opens ───
  // The page-level campaign state may be stale (user updated an email
  // after the campaign page loaded). We fetch the live email for every
  // selected influencer so warnings and sends are always accurate.
  const [freshEmailMap, setFreshEmailMap] = useState<Record<string, string | null>>({});
  const [emailsLoading, setEmailsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || selectedInfluencers.length === 0) return;

    const influencerIds = selectedInfluencers.map((ci: any) => ci.influencer_id).filter(Boolean);
    if (influencerIds.length === 0) return;

    setEmailsLoading(true);
    // Dynamic import to keep this client-only
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      supabase
        .from('influencers')
        .select('id, email')
        .in('id', influencerIds)
        .then(({ data }: { data: Array<{ id: string; email: string | null }> | null }) => {
          const map: Record<string, string | null> = {};
          (data ?? []).forEach((row: any) => {
            map[row.id] = row.email ?? null;
          });
          setFreshEmailMap(map);
          setEmailsLoading(false);
        });
    });
  }, [isOpen, selectedInfluencers]);

  const subjectRef = useRef<HTMLInputElement>(null);
  const [activeField, setActiveField] = useState<"subject" | "body">("body");

  // ── Editor token insert ref ──────────────────────────────────────────
  const insertTokenFnRef = useRef<((token: string) => void) | null>(null);

  const handleEditorInsertReady = useCallback(
    (insertFn: (token: string) => void) => {
      insertTokenFnRef.current = insertFn;
    },
    [],
  );

  // ── Variable insertion ─────────────────────────────────────────────
  const insertVariable = useCallback(
    (variableKey: string) => {
      if (activeField === "subject" && subjectRef.current) {
        insertVariableAtCursor(
          subjectRef.current,
          variableKey,
          subject,
          setSubject,
        );
      } else if (activeField === "body" && insertTokenFnRef.current) {
        insertTokenFnRef.current(`{{${variableKey}}}`);
      }
    },
    [activeField, subject, body],
  );

  // ── Preview resolution for current preview influencer ─────────────
  const previewInfluencer = selectedInfluencers[previewIdx];
  const previewCtx = useMemo(() => {
    if (!previewInfluencer) return null;
    return buildVariableContext(previewInfluencer, campaign, brandName);
  }, [previewInfluencer, campaign, brandName]);

  const previewSubject = previewCtx
    ? resolveTemplate(subject, previewCtx)
    : subject;
  const previewBody = previewCtx ? resolveTemplate(body, previewCtx) : body;

  // ── Missing emails check (uses live DB values) ────────────────────
  const missingEmails = useMemo(
    () => selectedInfluencers.filter((ci: any) => {
      const liveEmail = freshEmailMap[ci.influencer_id];
      // While loading, fall back to cached value to avoid false positives
      if (emailsLoading) return !ci.influencers?.email;
      return !liveEmail;
    }),
    [selectedInfluencers, freshEmailMap, emailsLoading],
  );

  // ── Send handler ──────────────────────────────────────────────────
  const handleSend = async () => {
    if (smtpConfigured === false) {
      setShowPasswordModal(true);
      return;
    }

    if (!subject.trim() || !body.trim()) return;
    setSendState("sending");
    setSendResult(null);

    try {
      // Build one resolved email per influencer, using fresh DB email
      const emails = selectedInfluencers.map((ci: any) => {
        const ctx = buildVariableContext(ci, campaign, brandName);
        // Use live-fetched email; fall back to cached as last resort
        const toEmail = freshEmailMap[ci.influencer_id] ?? ci.influencers?.email ?? '';
        return {
          to: toEmail,
          subject: resolveTemplate(subject, ctx),
          body: resolveTemplate(body, ctx),
          influencerId: ci.influencer_id,
          campaignInfluencerId: ci.id,
        };
      });

      const res = await fetch("/api/email/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, campaignId: campaign.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.authFailed) {
          setSmtpConfigured(false);
          setShowPasswordModal(true);
          setSendState("idle");
          return;
        }
        throw new Error(data.error ?? "Send failed");
      }

      setSendResult({
        successCount: data.successCount,
        failCount: data.failCount,
      });
      setSendState("done");
      onSent(data.successCount);

      // Auto-close after 2.5s on full success
      if (data.failCount === 0) {
        setTimeout(() => {
          onClose();
          setSendState("idle");
          setSendResult(null);
          setSubject("");
          setBody("");
        }, 2500);
      }
    } catch (err: any) {
      console.error("BulkEmailPanel send error:", err);
      setSendState("error");
    }
  };

  const canSend =
    subject.trim().length > 0 && body.trim().length > 0 && sendState === "idle";

  const resetToCampaignDefault = () => {
    setSubject((campaign?.email_subject as string) || defaultSubject);
    setBody(ensureSignature((campaign?.email_template as string) || defaultBody));
    setDefaultState("idle");
  };

  const saveAsCampaignDefault = async () => {
    if (!userId || !campaign?.id) return;
    setDefaultState("saving");
    try {
      const { updateCampaignEmailDefaults } = await import("@/lib/queries/campaigns");
      const ok = await updateCampaignEmailDefaults(
        userId,
        campaign.id,
        subject,
        body,
      );
      setDefaultState(ok ? "saved" : "error");
      if (ok) {
        setTimeout(() => setDefaultState("idle"), 1800);
      }
    } catch {
      setDefaultState("error");
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* ── Blurred backdrop (top portion) ──────────────────── */}
            <m.div
              className="fixed inset-0 z-[100]"
              style={{
                background: "rgba(0,0,0,0.25)",
                backdropFilter: "blur(2px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* ── Slide-up panel ──────────────────────────────────── */}
            <m.div
              className="fixed bottom-0 left-0 right-0 z-[110]
                         bg-white rounded-t-2xl shadow-2xl
                         flex flex-col overflow-hidden h-[96vh]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Drag handle ───────────────────────────────────── */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* ── Panel header ──────────────────────────────────── */}
              <div
                className="px-6 py-3 border-b border-gray-100
                              flex items-center gap-4 flex-shrink-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl bg-indigo-50
                                  flex items-center justify-center flex-shrink-0"
                  >
                    <Mail size={15} className="text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-gray-900">
                      {panelTitle || "Send Email"}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {panelSubtitle ||
                        `${selectedInfluencers.length} influencer${selectedInfluencers.length !== 1 ? "s" : ""} selected — each receives a personalized email`}
                    </p>
                  </div>
                </div>

                {/* Preview toggle */}
                <button
                  onClick={() => setPreviewMode((p) => !p)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                    "text-xs font-semibold border transition-colors",
                    previewMode
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {previewMode ? <EyeOff size={13} /> : <Eye size={13} />}
                  {previewMode ? "Edit" : "Preview"}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100
                             text-gray-400 transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* ── Recipient chips ───────────────────────────────── */}
              <div
                className="px-6 py-2.5 border-b border-gray-100
                              flex items-center gap-2 flex-shrink-0
                              overflow-x-auto scrollbar-none"
              >
                <span className="text-xs text-gray-400 flex-shrink-0 font-medium">
                  To:
                </span>
                {selectedInfluencers.map((ci) => {
                  const inf = ci.influencers;
                  const hasEmail = !!inf?.email;
                  return (
                    <div
                      key={ci.id}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                        "text-xs font-medium flex-shrink-0 border",
                        hasEmail
                          ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                          : "bg-red-50 border-red-100 text-red-600",
                      )}
                      title={hasEmail ? inf.email : "No email address"}
                    >
                      {/* Mini avatar */}
                      <div
                        className="w-4 h-4 rounded-full overflow-hidden
                                      bg-indigo-200 flex-shrink-0"
                      >
                        {inf?.avatar_url ? (
                          <img
                            src={inf.avatar_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className="text-[8px] font-bold text-indigo-700
                                           flex items-center justify-center h-full"
                          >
                            {inf?.name?.slice(0, 1) ?? "?"}
                          </span>
                        )}
                      </div>
                      {inf?.name ?? inf?.username ?? "Unknown"}
                      {!hasEmail && (
                        <AlertCircle size={11} className="text-red-400" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Missing email warning ─────────────────────────── */}
              <AnimatePresence>
                {missingEmails.length > 0 && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 py-2 bg-amber-50 border-b border-amber-100
                               flex items-center gap-2 flex-shrink-0"
                  >
                    <AlertCircle
                      size={13}
                      className="text-amber-500 flex-shrink-0"
                    />
                    <p className="text-xs text-amber-700 font-medium">
                      {missingEmails.length} influencer
                      {missingEmails.length !== 1 ? "s have" : " has"} no email
                      address and will be skipped
                    </p>
                  </m.div>
                )}
              </AnimatePresence>

              {/* ── Main editor / preview area ────────────────────── */}
              <div className="flex flex-1 min-h-0 gap-0 mt-2 px-6 pb-4">
                <div className="flex-1 min-w-0 mr-4 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <AnimatePresence mode="wait">
                    {/* ── EDIT MODE ─────────────────────────────────── */}
                    {!previewMode && (
                      <m.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col h-full"
                      >
                        {/* Subject line */}
                        <div className="px-6 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3 h-8">
                            <span
                              className="text-xs font-bold text-gray-400
                                             uppercase tracking-wide flex-shrink-0
                                             w-14"
                            >
                              Subject
                            </span>
                            <input
                              ref={subjectRef}
                              type="text"
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              onFocus={() => setActiveField("subject")}
                              placeholder="e.g. Collaboration opportunity with {{brand_name}} 🎯"
                              className="flex-1 text-sm text-gray-800 outline-none
                                         placeholder:text-gray-300 bg-transparent"
                            />
                          </div>
                        </div>

                        {/* Body textarea */}
                        <div
                          className="flex-1 flex flex-col min-h-0"
                          onFocusCapture={() => setActiveField("body")}
                        >
                          <EmailBodyEditor
                            value={body}
                            onChange={setBody}
                            onInsertToken={handleEditorInsertReady}
                            brandId={userId ?? undefined}
                            subject={subject}
                            onSubjectChange={setSubject}
                          />
                        </div>
                      </m.div>
                    )}

                    {/* ── PREVIEW MODE ──────────────────────────────── */}
                    {previewMode && (
                      <m.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="px-6 py-4 h-full flex flex-col"
                      >
                        {/* Influencer navigator */}
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Preview as:
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                setPreviewIdx((i) => Math.max(0, i - 1))
                              }
                              disabled={previewIdx === 0}
                              className="p-1 rounded-lg hover:bg-gray-100
                                         disabled:opacity-30 transition-colors"
                            >
                              <ChevronLeft size={14} />
                            </button>

                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-100">
                                {previewInfluencer?.influencers?.avatar_url ? (
                                  <img
                                    src={
                                      previewInfluencer.influencers.avatar_url
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span
                                    className="text-[10px] font-bold text-indigo-600
                                                   flex items-center justify-center h-full"
                                  >
                                    {previewInfluencer?.influencers?.name?.slice(
                                      0,
                                      1,
                                    ) ?? "?"}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-semibold text-gray-700">
                                {previewInfluencer?.influencers?.name ??
                                  "Unknown"}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({previewIdx + 1} / {selectedInfluencers.length}
                                )
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                setPreviewIdx((i) =>
                                  Math.min(
                                    selectedInfluencers.length - 1,
                                    i + 1,
                                  ),
                                )
                              }
                              disabled={
                                previewIdx === selectedInfluencers.length - 1
                              }
                              className="p-1 rounded-lg hover:bg-gray-100
                                         disabled:opacity-30 transition-colors"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Rendered email preview */}
                        <div
                          className="rounded-xl border border-gray-100
                                        bg-gray-50 p-4 flex-1 overflow-y-auto"
                        >
                          <p className="text-xs text-gray-400 mb-1 font-medium">
                            Subject
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mb-4">
                            {previewSubject || (
                              <span className="text-gray-300 font-normal">
                                No subject yet
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mb-1 font-medium">
                            Body
                          </p>
                          {previewBody ? (
                            <div
                              className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                              dangerouslySetInnerHTML={{ __html: previewBody }}
                            />
                          ) : (
                            <span className="text-gray-300">No body yet</span>
                          )}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Merge Fields Sidebar ────────────────────────── */}
                <div className="flex-shrink-0 w-72 border border-gray-200 rounded-xl overflow-hidden h-full">
                  <MergeFieldsPanel
                    onInsert={(token) => {
                      // MergeFieldsPanel provides "{{token}}". We extract the inner string for insertVariable
                      const cleanToken = token.replace(/[{}]/g, "");
                      insertVariable(cleanToken);
                    }}
                  />
                </div>
              </div>

              {/* ── Footer: send result or send button ───────────── */}
              <div
                className="flex-shrink-0 border-t border-gray-100
                              px-6 py-3 bg-white flex items-center gap-4"
              >
                {/* Send result feedback */}
                <AnimatePresence>
                  {sendState === "done" && sendResult && (
                    <m.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-green-600"
                    >
                      <CheckCircle2 size={16} />
                      <span className="text-sm font-semibold">
                        {sendResult.successCount} email
                        {sendResult.successCount !== 1 ? "s" : ""} sent!
                        {sendResult.failCount > 0 &&
                          ` (${sendResult.failCount} failed)`}
                      </span>
                    </m.div>
                  )}
                  {sendState === "error" && (
                    <m.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-red-500"
                    >
                      <AlertCircle size={16} />
                      <span className="text-sm font-medium">
                        Something went wrong. Try again.
                      </span>
                    </m.div>
                  )}
                </AnimatePresence>

                <div className="ml-auto flex items-center gap-3">
                  {/* Character count */}
                  <span className="text-xs text-gray-400">
                    {body.length} chars
                  </span>

                  <button
                    onClick={resetToCampaignDefault}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Reset to default
                  </button>

                  <button
                    onClick={saveAsCampaignDefault}
                    disabled={defaultState === "saving"}
                    className="px-3 py-2 rounded-xl border border-indigo-200 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  >
                    {defaultState === "saving"
                      ? "Saving..."
                      : defaultState === "saved"
                        ? "Saved"
                        : defaultState === "error"
                          ? "Retry save"
                          : "Save as default"}
                  </button>

                  {/* Cancel */}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-gray-200
                               text-sm font-medium text-gray-600
                               hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>

                  {/* Send button */}
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2 rounded-xl",
                      "text-sm font-bold transition-all shadow-sm",
                      canSend
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed",
                    )}
                  >
                    {sendState === "sending" ? (
                      <>
                        <Loader2 size={14}  />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Send to {selectedInfluencers.length}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
      {userId && (
        <GmailAppPasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          authUserId={userId}
          onSaveSuccess={() => {
            setSmtpConfigured(true);
            setShowPasswordModal(false);
            // Wait briefly for modal to close before sending
            setTimeout(() => handleSend(), 150);
          }}
        />
      )}
    </LazyMotion>
  );
}
