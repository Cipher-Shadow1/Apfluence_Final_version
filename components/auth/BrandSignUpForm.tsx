"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Check, Eye, EyeOff, Globe, ImagePlus, LoaderIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

const BRAND_HOME = "/brand";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

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

export function BrandSignUpForm() {
  const router = useRouter();
  const supabase = createClient();

  const [companyName, setCompanyName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  // Website validation: must start with http:// or https:// if provided
  const isWebsiteValid =
    website.trim() === "" ||
    /^https?:\/\/.+/.test(website.trim());

  const canSubmit =
    Boolean(companyName.trim() && email.trim() && password && confirmPassword) &&
    passwordsMatch &&
    hasUppercase &&
    hasNumber &&
    hasMinLength &&
    isWebsiteValid;

  // ── Logo file handling ─────────────────────────────────────────────
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please upload a PNG, JPEG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2 MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // ── Upload logo to Cloudinary ──────────────────────────────────────
  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error("Missing Cloudinary env vars");
      toast.error("Logo upload not configured. Continuing without it.");
      return null;
    }

    const formData = new FormData();
    formData.append("file", logoFile);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "brand-logos");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        throw new Error(`Cloudinary upload failed: ${res.status}`);
      }

      const data = await res.json();
      return data.secure_url as string;
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error("Failed to upload logo. Continuing without it.");
      return null;
    }
  };

  // ── Sign-up handler ────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName || !email || !password) {
      toast.error("Company name, email and password are required!");
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

    if (!isWebsiteValid) {
      toast.error("Website must start with http:// or https://");
      return;
    }

    setIsUpdating(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: companyName.trim(),
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          toast.error("This email is already registered. Please sign in.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      let logoUrl: string | null = null;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      if (data.session?.access_token) {
        const onboardRes = await fetch("/api/auth/brand-onboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({
            company_name: companyName.trim(),
            website: website.trim() || null,
            logo_url: logoUrl,
          }),
        });
        const onboardJson = (await onboardRes.json().catch(() => null)) as
          | { error?: string }
          | null;
        if (!onboardRes.ok) {
          throw new Error(onboardJson?.error || "Could not create brand profile.");
        }
        router.push(BRAND_HOME);
      } else {
        // Persist onboarding details so /sign-up/brand/verify can finish onboarding after verifyOtp()
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            `pending_brand_onboard:${cleanEmail}`,
            JSON.stringify({
              company_name: companyName.trim(),
              website: website.trim() || null,
              logo_url: logoUrl,
            }),
          );
        }
        // Send user to the dedicated OTP verify page
        toast.success("Account created. Enter the verification code from your email.");
        router.push(`/sign-up/brand/verify?email=${encodeURIComponent(cleanEmail)}`);
        return;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again later.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-start text-start">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
        Create a Brand account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Sign up to apfluence and start discovering creators that match your
        brand.
      </p>

      <form onSubmit={handleSignUp} className="mt-8 w-full space-y-4 px-12">
        {/* Company Name */}
        <div className="w-full">
          <Label htmlFor="companyName" className="mb-1 block text-xs font-medium text-zinc-500">
            Company Name
          </Label>
          <Input
            id="companyName"
            type="text"
            name="companyName"
            autoComplete="organization"
            value={companyName}
            disabled={isUpdating}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your brand or company name"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Email */}
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
            placeholder="you@brand.com"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Website */}
        <div className="w-full">
          <Label htmlFor="website" className="mb-1 block text-xs font-medium text-zinc-500">
            Website <span className="text-zinc-300 font-normal">(optional)</span>
          </Label>
          <div className="relative w-full">
            <Globe
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none"
              aria-hidden
            />
            <Input
              id="website"
              type="url"
              name="website"
              autoComplete="url"
              value={website}
              disabled={isUpdating}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourbrand.com"
              className={cn(
                "h-10 w-full rounded-lg border bg-white pl-9 pr-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40",
                website.trim() && !isWebsiteValid
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/40"
                  : "border-zinc-200 focus:border-blue-500"
              )}
            />
          </div>
          {website.trim() && !isWebsiteValid && (
            <p className="mt-1 text-xs text-red-500">
              Must start with https:// or http://
            </p>
          )}
        </div>

        {/* Logo Upload */}
        <div className="w-full">
          <Label htmlFor="logo" className="mb-1 block text-xs font-medium text-zinc-500">
            Logo <span className="text-zinc-300 font-normal">(optional)</span>
          </Label>
          <input
            ref={logoInputRef}
            id="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleLogoSelect}
            disabled={isUpdating}
          />
          {logoPreview ? (
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-600 truncate max-w-[180px]">
                  {logoFile?.name}
                </span>
                <button
                  type="button"
                  onClick={clearLogo}
                  className="mt-0.5 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={isUpdating}
              className="flex items-center gap-2 h-10 px-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImagePlus className="h-4 w-4" />
              Upload logo
            </button>
          )}
        </div>

        {/* Password */}
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

        {/* Confirm Password */}
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

        {/* Submit */}
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
        Already have a brand account?{" "}
        <Link
          href="/sign-in/brand"
          className="font-medium text-primary hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export default BrandSignUpForm;
