import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client — SERVER-ONLY
 *
 * Uses the service role key to bypass Row Level Security.
 * Used for trusted server-side operations like inserting a
 * new brand row during sign-up (where no Supabase session exists yet).
 *
 * ⚠️  NEVER import this file from client-side code.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
