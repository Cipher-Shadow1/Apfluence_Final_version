import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import {
  normalizeInfluencers,
  normalizeInfluencer,
} from "@/lib/adapters/normalizeInfluencer";
import { NormalizedInfluencer } from "@/components/brand/sidepanel/influencer-side-panel.types";
import { SearchMode, SearchToken } from "@/components/brand/TokenSearchBar";

// ─── Types ───────────────────────────────────────────────────────────

type InfluencerRow = Database["public"]["Tables"]["influencers"]["Row"];
type MetricRow =
  Database["public"]["Tables"]["influencer_platform_metrics"]["Row"];
type PostRow = Database["public"]["Tables"]["influencer_posts"]["Row"];

export type InfluencerWithDetails = InfluencerRow & {
  influencer_platform_metrics: (MetricRow & {
    platforms?: { name?: string; display_name?: string } | null;
  })[];
  influencer_posts: (PostRow & {
    platforms?: { name?: string; display_name?: string } | null;
  })[];
  influencer_rates?: {
    base_currency?: string | null;
    min_rate?: number | null;
    max_rate?: number | null;
    accepts_product_gifting?: boolean | null;
    shipping_regions?: string[] | null;
  } | null;
  influencer_activity?: {
    phone_whatsapp?: string | null;
    response_rate?: number | null;
    acceptance_rate?: number | null;
    last_active_at?: string | null;
  } | null;
};

export type InfluencerCommercialProfile = Pick<
  InfluencerRow,
  "id" | "auth_user_id" | "languages"
> & {
  phone_whatsapp: string | null;
  base_currency: string | null;
  min_rate: number | null;
  max_rate: number | null;
  accepts_product_gifting: boolean | null;
  shipping_regions: string[];
  response_rate: number | null;
  acceptance_rate: number | null;
  last_active_at: string | null;
};

const INFLUENCER_DETAILS_SELECT = `
      *,
      influencer_platform_metrics (
        *,
        platforms ( name, display_name )
      ),
      influencer_posts (
        *,
        platforms ( name, display_name )
      )
    `;

// ─── Queries ─────────────────────────────────────────────────────────

// Get all influencers with full details (replaces INFLUENCERS array from data.ts)
export async function getAllInfluencers(): Promise<NormalizedInfluencer[]> {
  const { data, error } = await supabase
    .from("influencers")
    .select(INFLUENCER_DETAILS_SELECT)
    .order("authenticity_score", { ascending: false });

  if (error) {
    console.error("getAllInfluencers error:", error);
    return [];
  }

  return normalizeInfluencers(
    (data ?? []) as unknown as InfluencerWithDetails[],
  );
}

// Get a single influencer by username
export async function getInfluencerByUsername(
  username: string,
): Promise<NormalizedInfluencer | null> {
  const { data, error } = await supabase
    .from("influencers")
    .select(INFLUENCER_DETAILS_SELECT)
    .eq("username", username)
    .single();

  if (error) {
    console.error("getInfluencerByUsername error:", error);
    return null;
  }

  return normalizeInfluencer(data as unknown as InfluencerWithDetails);
}

// Search influencers by name, username, or bio
export async function searchInfluencers(
  query: string,
): Promise<NormalizedInfluencer[]> {
  const { data, error } = await supabase
    .from("influencers")
    .select(INFLUENCER_DETAILS_SELECT)
    .or(`name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)
    .order("authenticity_score", { ascending: false });

  if (error) {
    console.error("searchInfluencers error:", error);
    return [];
  }

  return normalizeInfluencers(
    (data ?? []) as unknown as InfluencerWithDetails[],
  );
}

// Filter influencers by niche
export async function getInfluencersByNiche(
  niches: string,
): Promise<NormalizedInfluencer[]> {
  const { data, error } = await supabase
    .from("influencers")
    .select(INFLUENCER_DETAILS_SELECT)
    .contains("niches", [niches])
    .order("authenticity_score", { ascending: false });

  if (error) {
    console.error("getInfluencersByNiche error:", error);
    return [];
  }

  return normalizeInfluencers(
    (data ?? []) as unknown as InfluencerWithDetails[],
  );
}

/** Baseline slug list (see `niches` / seed data); influencer `niches` arrays often use these lower-case values */
const NICHE_SLUG_CANONICAL = [
  "fitness", "beauty", "fashion", "technology", "gaming", "food", "travel", "music",
  "entertainment", "education", "business", "sports", "photography", "lifestyle",
] as const;

function escapeIlikeFragment(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, " ")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .trim()
    .slice(0, 200);
}

/** Tags we OR into `.overlaps("niches", …)` covering common DB spellings */
function nicheTagsMatchingQuery(searchQuery: string): string[] {
  const q = searchQuery.toLowerCase().replace(/^#/, "").trim();
  if (!q) return [];

  const out = new Set<string>();
  for (const slug of NICHE_SLUG_CANONICAL) {
    const hit =
      slug === q ||
      slug.startsWith(q) ||
      (q.length >= 3 && slug.includes(q));
    if (!hit) continue;
    out.add(slug);
    const titled = slug.charAt(0).toUpperCase() + slug.slice(1);
    out.add(titled);
  }

  if (out.size === 0) {
    const titled = q.charAt(0).toUpperCase() + q.slice(1);
    out.add(q);
    out.add(titled);
  }
  return [...out].slice(0, 48);
}

// Search influencers by array of tokens (**AND** between tokens — each token narrows further)
export async function searchByTokens(
  tokens: SearchToken[],
): Promise<NormalizedInfluencer[]> {
  if (!tokens || tokens.length === 0) {
    return getAllInfluencers();
  }

  const validTokens = tokens.filter((t) => t.query.trim().length > 0);
  if (validTokens.length === 0) {
    return getAllInfluencers();
  }

  let qb = supabase.from("influencers").select(INFLUENCER_DETAILS_SELECT);

  for (const token of validTokens) {
    const raw = escapeIlikeFragment(token.query);
    switch (token.mode) {
      case "username":
        qb = qb.ilike("username", `%${raw}%`);
        break;
      case "niche": {
        const tags = nicheTagsMatchingQuery(token.query);
        if (tags.length > 0) {
          qb = qb.overlaps("niches", tags);
        }
        break;
      }
      case "default": {
        const s = raw || token.query.trim();
        if (s) {
          qb = qb.or(
            `name.ilike.%${s}%,bio.ilike.%${s}%,username.ilike.%${s}%`,
          );
        }
        break;
      }
    }
  }

  const { data, error } = await qb.order("authenticity_score", { ascending: false });

  if (error) {
    console.error("searchByTokens error:", error);
    return [];
  }

  return normalizeInfluencers(
    (data ?? []) as unknown as InfluencerWithDetails[],
  );
}

/** Full influencer graph for the signed-in creator (same shape as brand discovery). */
export async function getInfluencerWithDetailsByUserId(
  userId: string,
): Promise<NormalizedInfluencer | null> {
  const { data, error } = await supabase
    .from("influencers")
    .select(INFLUENCER_DETAILS_SELECT)
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getInfluencerWithDetailsByUserId error:", error);
    return null;
  }
  if (!data) return null;

  return normalizeInfluencer(data as unknown as InfluencerWithDetails);
}

export async function getInfluencerCommercialProfileByUserId(
  userId: string,
): Promise<InfluencerCommercialProfile | null> {
  const { data, error } = await supabase
    .from("influencers")
    .select(
      `
      id,
      auth_user_id,
      languages,
      phone,
      last_active_at
      `,
    )
    .eq("auth_user_id", userId)
    .single();

  if (error) {
    console.error("getInfluencerCommercialProfileByUserId error:", error);
    return null;
  }

  const row = data as any;
  return {
    id: row.id,
    auth_user_id: row.auth_user_id,
    languages: row.languages ?? [],
    phone_whatsapp: row.phone ?? null,
    base_currency: null,
    min_rate: null,
    max_rate: null,
    accepts_product_gifting: null,
    shipping_regions: [],
    response_rate: null,
    acceptance_rate: null,
    last_active_at: row.last_active_at ?? null,
  };
}

export async function updateInfluencerCommercialProfileByUserId(
  userId: string,
  patch: {
    languages?: string[];
    phone_whatsapp?: string | null;
    base_currency?: string | null;
    min_rate?: number | null;
    max_rate?: number | null;
    accepts_product_gifting?: boolean | null;
    shipping_regions?: string[];
  },
): Promise<boolean> {
  const { data: influencer, error: influencerError } = await supabase
    .from("influencers")
    .select("id")
    .eq("auth_user_id", userId)
    .single();

  if (influencerError || !influencer) {
    console.error("updateInfluencerCommercialProfileByUserId influencer lookup error:", influencerError);
    return false;
  }

  // Schema has no influencer_rates / influencer_activity tables — persist what exists on influencers.
  const updateRow: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.languages !== undefined) updateRow.languages = patch.languages;
  if (patch.phone_whatsapp !== undefined) updateRow.phone = patch.phone_whatsapp;

  const { error } = await supabase
    .from("influencers")
    .update(updateRow)
    .eq("id", influencer.id);

  if (error) {
    console.error("updateInfluencerCommercialProfileByUserId error:", error);
    return false;
  }
  return true;
}
