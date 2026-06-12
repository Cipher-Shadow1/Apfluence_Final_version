"use client";

import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Check, Eye, EyeOff } from "lucide-react";
import { LoaderOne as LoaderIcon } from "@/components/ui/Loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const INFLUENCER_HOME = "/influencer";

function StrengthItem({ met, label }: { met: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium transition-colors",
        met ? "text-emerald-500" : "text-zinc-300",
      )}
    >
      <Check
        className={cn(
          "size-[10px] shrink-0",
          met ? "text-emerald-500" : "text-zinc-300",
        )}
        strokeWidth={3}
        aria-hidden
      />
      {label}
    </span>
  );
}

export function InfluencerSignUpForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false); // keep same design shell
  const [sentEmail, setSentEmail] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");

  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const canSubmit =
    Boolean(email.trim() && password && confirmPassword) &&
    passwordsMatch &&
    hasUppercase &&
    hasNumber &&
    hasMinLength;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!hasUppercase || !hasNumber || !hasMinLength) {
      toast.error("Please meet all password requirements.");
      return;
    }

    setIsUpdating(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          toast.error("This email is already registered. Please sign in.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.session?.access_token) {
        const onboardRes = await fetch("/api/auth/influencer-onboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({}),
        });
        const onboardJson = (await onboardRes.json().catch(() => null)) as
          | { error?: string }
          | null;
        if (!onboardRes.ok) {
          throw new Error(
            onboardJson?.error || "Could not complete influencer onboarding.",
          );
        }
        router.push(INFLUENCER_HOME);
      } else {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            `pending_influencer_onboard:${cleanEmail}`,
            JSON.stringify({}),
          );
        }
        setSentEmail(cleanEmail);
        setVerificationCode("");
        setIsVerifying(true);
        toast.success("Account created. Check your email to verify and sign in.");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again later.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const verifyEmail = (sentEmail || email).trim().toLowerCase();
    const token = verificationCode.replace(/\s/g, "");

    if (!verifyEmail) {
      toast.error("Missing email.");
      return;
    }
    if (!token) {
      toast.error("Verification code is required.");
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: verifyEmail,
        token,
        type: "signup",
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        toast.success("Email verified. Please sign in.");
        router.push("/sign-in/influencer");
        return;
      }

      const pendingRaw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(`pending_influencer_onboard:${verifyEmail}`)
          : null;
      const pending = pendingRaw ? (JSON.parse(pendingRaw) as Record<string, unknown>) : null;

      const onboardRes = await fetch("/api/auth/influencer-onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });
      const onboardJson = (await onboardRes.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!onboardRes.ok) {
        throw new Error(
          onboardJson?.error || "Could not complete influencer onboarding.",
        );
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(`pending_influencer_onboard:${verifyEmail}`);
      }

      toast.success("Email verified. Welcome!");
      router.push(INFLUENCER_HOME);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to verify code. Please try again.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return isVerifying ? (
    <form
      onSubmit={handleVerifyCode}
      className="flex w-full flex-col items-start gap-y-5 text-start"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          We sent a verification code to{" "}
          <span className="font-medium text-zinc-700">{sentEmail || email}</span>.
          Enter it below to verify your email.
        </p>
      </div>

      <div className="w-full space-y-5">
        <div className="w-full space-y-2">
          <InputOTP
            id="code"
            name="code"
            maxLength={8}
            value={verificationCode}
            onChange={setVerificationCode}
            disabled={isUpdating}
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
        </div>

        <button
          type="submit"
          disabled={isUpdating || !verificationCode.replace(/\s+/g, "")}
          className="relative inline-flex w-full h-10 items-center justify-center rounded-lg text-sm font-semibold text-white overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
            {isUpdating ? <LoaderIcon className="h-5 w-5 animate-spin" /> : null}
            {isUpdating ? "Verifying..." : "Verify Email"}
          </span>
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              const resendEmail = sentEmail || email;
              if (!resendEmail) {
                toast.error("Missing email.");
                return;
              }
              await supabase.auth.resend({
                type: "signup",
                email: resendEmail,
              });
              toast.success("Verification email resent.");
            }}
            disabled={isUpdating}
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm"
          >
            Resend code
          </button>
          <Link
            href="/sign-up/influencer"
            className="text-zinc-500 hover:text-zinc-700 hover:underline transition-colors text-sm"
          >
            ← Back to sign up
          </Link>
        </div>
      </div>
    </form>
  ) : (
    <div className="flex w-full flex-col items-start text-start">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
        Create a Creator account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Sign up to apfluence and start collaborating with brands.
      </p>

      <form onSubmit={handleSignUp} className="mt-8 w-full space-y-4 px-12">

        <div className="w-full">
          <Label htmlFor="email" className="mb-1 block text-xs font-medium text-zinc-500">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            disabled={isUpdating}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@creator.com"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div className="w-full">
          <Label htmlFor="password" className="mb-1 block text-xs font-medium text-zinc-500">
            Password
          </Label>
          <div className="relative w-full">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              value={password}
              disabled={isUpdating}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-10 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <StrengthItem met={hasUppercase} label="Uppercase" />
            <StrengthItem met={hasNumber} label="Number" />
            <StrengthItem met={hasMinLength} label="Min. 8 char." />
          </div>
        </div>
        <div className="w-full">
          <Label htmlFor="confirmPassword" className="mb-1 block text-xs font-medium text-zinc-500">
            Confirm password
          </Label>
          <div className="relative w-full">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              disabled={isUpdating}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-10 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="pt-2 w-full">
          <button
            type="submit"
            disabled={!canSubmit || isUpdating}
            className="
              relative w-full h-10 rounded-lg text-sm font-semibold text-white
              overflow-hidden transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            "
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
              {isUpdating ? <LoaderIcon className="h-5 w-5 animate-spin" /> : "Sign up"}
            </span>
          </button>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-zinc-500">
          By connecting, you agree to our{" "}
          <Link href="#" className="text-primary font-medium hover:underline">
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-primary font-medium hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="mt-8 text-sm text-zinc-600">
        Already have a creator account?{" "}
        <Link
          href="/sign-in/influencer"
          className="font-medium text-primary hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export default InfluencerSignUpForm;
