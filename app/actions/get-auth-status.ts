"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAuthStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user?.email) {
    return { error: "User not found" as const };
  }

  const role = user.user_metadata?.role as "brand" | "influencer" | undefined;

  return { success: true as const, role };
}
