import { createBrowserClient } from "@supabase/ssr";

type BrowserClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserClient | undefined;

/**
 * Single Supabase browser client per tab.
 * Creating many clients (each hook/component calling createBrowserClient()) makes
 * GoTrue fight over the same storage lock → AbortError / "steal" in dev (Strict Mode).
 */
export function createClient(): BrowserClient {
  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
    }
    return browserClient;
  }
  // Client Components can execute once during SSR; no shared storage lock here.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
