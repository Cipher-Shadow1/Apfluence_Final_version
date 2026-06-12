"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Fetch all posts for a given influencer (bypasses RLS via service role).
 * Returns raw DB rows — the caller normalizes them.
 */
export async function getInfluencerPostsAdmin(influencerId: string) {
  const { data, error } = await supabaseAdmin
    .from("influencer_posts")
    .select(
      `
      id,
      post_platform_id,
      post_url,
      platform_id,
      thumbnail_url,
      caption,
      likes,
      comments,
      views,
      shares,
      estimated_impressions,
      estimated_reach,
      engagement_rate,
      cpe,
      posted_at,
      platforms (
        id,
        name,
        display_name
      )
      `,
    )
    .eq("influencer_id", influencerId)
    .order("posted_at", { ascending: false });

  if (error) {
    console.error("[getInfluencerPostsAdmin] error", {
      influencerId,
      error,
    });
    return null;
  }

  return data;
}
