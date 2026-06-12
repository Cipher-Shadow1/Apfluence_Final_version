"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSupabaseUser() {
  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!mounted) return;
        setUserId(user?.id ?? null);
        const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
        setFirstName(fullName ? fullName.split(/\s+/)[0] : null);
      } catch (error) {
        // In dev, parallel auth checks can contend for Supabase's browser lock.
        // We intentionally swallow lock-contention errors and rely on auth state events.
        const message =
          error instanceof Error ? error.message : typeof error === "string" ? error : "";
        const isLockContention =
          message.includes("was released because another request stole it") ||
          message.includes("Lock broken by another request with the 'steal' option");
        if (!isLockContention) {
          console.warn("useSupabaseUser.getUser failed", error);
        }
        if (!mounted) return;
        setUserId(null);
        setFirstName(null);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const user = session?.user ?? null;
      setUserId(user?.id ?? null);
      const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
      setFirstName(fullName ? fullName.split(/\s+/)[0] : null);
      setIsLoaded(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { userId, firstName, isLoaded };
}
