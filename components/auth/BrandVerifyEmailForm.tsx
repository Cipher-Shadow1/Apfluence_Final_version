"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";

export function BrandVerifyEmailForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Missing email. Please go back to sign up.");
      return;
    }

    const token = code.replace(/\s/g, "");
    if (!token) {
      setError("Verification code is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: "signup",
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        // Some providers won't return a session immediately.
        toast.success("Email verified. Please sign in.");
        window.location.href = "/sign-in/brand";
        return;
      }

      // Finish onboarding (create/claim brand profile + set role metadata)
      const pendingRaw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(`pending_brand_onboard:${email.trim().toLowerCase()}`)
          : null;
      const pending = pendingRaw ? (JSON.parse(pendingRaw) as Record<string, unknown>) : null;

      const onboardRes = await fetch("/api/auth/brand-onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          company_name: (pending?.company_name as string | undefined) ?? undefined,
          website: (pending?.website as string | null | undefined) ?? undefined,
          logo_url: (pending?.logo_url as string | null | undefined) ?? undefined,
        }),
      });
      const onboardJson = (await onboardRes.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!onboardRes.ok) {
        throw new Error(onboardJson?.error || "Could not finish onboarding.");
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(`pending_brand_onboard:${email.trim().toLowerCase()}`);
      }

      toast.success("Email verified. Welcome!");
      window.location.href = "/brand";
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unable to verify code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Missing email. Please go back to sign up.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      toast.success("Verification code resent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="w-full max-w-md space-y-4"
      onSubmit={handleVerify}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          We sent a verification code to{" "}
          <span className="font-medium text-zinc-700">{email || "your email"}</span>.
          Enter it below to verify your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="w-full space-y-2">
          <p className="text-xs font-medium text-zinc-500">Verification code</p>
          <InputOTP
            id="brand-verification-code"
            name="code"
            maxLength={8}
            value={code}
            onChange={setCode}
            disabled={isSubmitting}
            className="pt-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
              <InputOTPSlot index={6} />
              <InputOTPSlot index={7} />

            </InputOTPGroup>
          </InputOTP>
          <p className="text-xs text-zinc-400">
            Enter the full code from your email.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !email.trim() || !code.replace(/\s/g, "")}
        className="relative mt-5 w-full h-10 rounded-lg text-sm font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        style={{
          background: "linear-gradient(135deg, #1a1aff 0%, #0052ff 40%, #0099ff 100%)",
          backgroundSize: "200% auto",
          animation: "button-gradient-shift 3s ease infinite",
        }}
      >
        <span
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #0052ff 0%, #0099ff 40%, #1a1aff 100%)",
          }}
          aria-hidden="true"
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isSubmitting ? <LoaderIcon className="h-5 w-5 animate-spin" /> : null}
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </span>
      </button>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={isSubmitting}
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          Resend code
        </button>
        <Link
          href="/sign-up/brand"
          className="text-zinc-500 hover:text-zinc-700 hover:underline transition-colors"
        >
          ← Back to sign up
        </Link>
      </div>
    </form>
  );
}
