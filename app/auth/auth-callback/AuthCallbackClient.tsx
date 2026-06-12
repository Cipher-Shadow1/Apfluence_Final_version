"use client";

import { getAuthStatus } from "@/app/actions/get-auth-status";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const DEFAULT_NEXT = "/brand";

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || DEFAULT_NEXT;
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      for (let i = 0; i < 30; i++) {
        if (cancelled) return;
        try {
          const data = await getAuthStatus();
          if (data && "success" in data && data.success) {
            const normalizedNext = next.startsWith("/") ? next : `/${next}`;

            if (normalizedNext.startsWith("/influencer")) {
              if (data.role === "influencer") {
                router.replace(normalizedNext);
                return;
              }
              if (data.role === "brand") {
                router.replace("/brand");
                return;
              }
            }

            if (normalizedNext.startsWith("/brand")) {
              if (data.role === "brand") {
                router.replace(normalizedNext);
                return;
              }
              if (data.role === "influencer") {
                router.replace("/influencer");
                return;
              }
            }

            router.replace(normalizedNext);
            return;
          }
        } catch {
          // Session may not be visible yet; retry.
        }
        await new Promise((r) => setTimeout(r, 500));
      }
      if (!cancelled) {
        setMessage("Could not verify session. Try signing in again.");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [next, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-800 border-b-neutral-200" />
      <p className="text-center text-lg font-medium">{message}</p>
    </div>
  );
}
