"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { LoaderOne as LoaderIcon } from "@/components/ui/Loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const ADMIN_HOME = "/admin";

export function AdminSignInForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
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
        if (error.message.toLowerCase().includes("invalid login credentials")) {
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

      const adminRes = await fetch("/api/auth/admin-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const adminJson = (await adminRes.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!adminRes.ok) {
        await supabase.auth.signOut();
        throw new Error(adminJson?.error || "Admin access is not allowed.");
      }

      router.push(ADMIN_HOME);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-start text-start">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
        Admin access
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Sign in with your admin account credentials.
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
            placeholder="admin@company.com"
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
              className="text-xs text-blue-600 transition-colors hover:text-blue-800 hover:underline"
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

        <div className="w-full pt-2">
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="relative h-10 w-full overflow-hidden rounded-lg text-sm font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{
              background:
                "linear-gradient(135deg, #1a1aff 0%, #0052ff 40%, #0099ff 100%)",
              backgroundSize: "200% auto",
              animation: "button-gradient-shift 3s ease infinite",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : "Log in"}
            </span>
          </button>
        </div>
      </form>

      <p className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Passwords are managed by Supabase Auth, not stored in `admins` table.
      </p>
    </div>
  );
}

export default AdminSignInForm;
