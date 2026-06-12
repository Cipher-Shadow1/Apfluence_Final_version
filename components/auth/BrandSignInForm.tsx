"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, LoaderIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const BRAND_HOME = "/brand";

export function BrandSignInForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setIsLoading(false);
      toast.error("Email and password are required!");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const lowerMessage = error.message.toLowerCase();
        if (lowerMessage.includes("email not confirmed")) {
          const cleanEmail = email.trim().toLowerCase();
          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email: cleanEmail,
          });
          if (resendError) {
            toast.error(
              `Email not verified yet. Also failed to resend code: ${resendError.message}`,
            );
          } else {
            toast.success("Email not verified. We sent you a new verification code.");
          }
          router.push(
            `/sign-up/brand/verify?email=${encodeURIComponent(cleanEmail)}`,
          );
          return;
        }
        if (lowerMessage.includes("invalid login credentials")) {
          toast.error("Incorrect email or password.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        toast.error("No session found after sign in.");
        return;
      }

      const onboardRes = await fetch("/api/auth/brand-onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const onboardJson = (await onboardRes.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!onboardRes.ok) {
        if (onboardRes.status === 404) {
          router.push("/sign-up/brand");
          return;
        }
        throw new Error(onboardJson?.error || "Could not load brand account.");
      }

      router.push(BRAND_HOME);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred. Please try again";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-start text-start">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
        Welcome back
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Sign in to your brand account to continue discovering creators.
      </p>

      <form onSubmit={handleSignIn} className="mt-8 w-full space-y-4 px-12">
        <div className="w-full">
          <Label
            htmlFor="email"
            className="mb-1 block text-xs font-medium text-zinc-500"
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            disabled={isLoading}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@brand.com"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="w-full">
          <div className="mb-1 flex items-center justify-between">
            <Label
              htmlFor="password"
              className="block text-xs font-medium text-zinc-500"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative w-full">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
        </div>

        <div className="pt-2 w-full">
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="relative w-full h-10 rounded-lg text-sm font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{
              background:
                "linear-gradient(135deg, #1a1aff 0%, #0052ff 40%, #0099ff 100%)",
              backgroundSize: "200% auto",
              animation: "button-gradient-shift 3s ease infinite",
            }}
          >
            <span
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, #0052ff 0%, #0099ff 40%, #1a1aff 100%)",
              }}
              aria-hidden="true"
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </span>
          </button>
        </div>
      </form>

      <p className="mt-8 text-sm text-zinc-600">
        Don&apos;t have a brand account?{" "}
        <Link
          href="/sign-up/brand"
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default BrandSignInForm;
