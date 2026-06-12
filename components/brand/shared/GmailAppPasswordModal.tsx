"use client";

import { useState } from "react";
import { X, Lock, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { saveGmailAppPasswordOnly } from "@/lib/queries/smtp";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface GmailAppPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUserId: string;
  onSaveSuccess: () => void;
}

export default function GmailAppPasswordModal({
  isOpen,
  onClose,
  authUserId,
  onSaveSuccess,
}: GmailAppPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (password.replace(/\s/g, "").length !== 16) {
      toast.error("App password must be exactly 16 characters.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveGmailAppPasswordOnly(
        authUserId,
        password.replace(/\s/g, ""),
      );
      if (res.success) {
        toast.success("Gmail connected successfully!");
        setPassword("");
        onSaveSuccess();
      } else {
        toast.error(res.error || "Failed to connect Gmail");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="p-0 gap-0 border-none bg-transparent shadow-none sm:max-w-lg overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Connect Gmail</DialogTitle>
        <div className="rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden border border-zinc-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    Connect Gmail
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Secure your email outreach
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-5 space-y-3">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <Lock size={16} className="text-blue-600" />
                  How to generate your App Password
                </h3>
                <ol className="list-decimal pl-5 text-sm text-blue-800 space-y-2 leading-relaxed">
                  <li>
                    Go to your{" "}
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-900 hover:text-blue-700 underline underline-offset-2"
                    >
                      Google Account Security <ExternalLink size={12} />
                    </a>
                    .
                  </li>
                  <li>
                    Ensure <strong>2-Step Verification</strong> is turned on.
                  </li>
                  <li>
                    Search for{" "}
                    <strong>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-blue-900 hover:text-blue-700 underline underline-offset-2"
                      >
                        "App passwords"{" "}
                      </a>
                    </strong>{" "}
                    in the settings search bar.
                  </li>
                  <li>
                    Create a new app password named <strong>"Apfluence"</strong>{" "}
                    and paste the 16-character code below.
                  </li>
                </ol>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="app-password"
                  className="block text-sm font-bold text-zinc-700"
                >
                  Google App Password
                </label>
                <input
                  id="app-password"
                  type="text"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 
                             placeholder:text-zinc-400 font-mono tracking-widest
                             focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10
                             transition-all"
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4 bg-zinc-50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || password.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm
                           hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20
                           disabled:cursor-not-allowed disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Connecting..." : "Save & Connect"}
              </button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
