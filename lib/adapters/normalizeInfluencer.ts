import {
  NormalizedInfluencer,
  NormalizedMetric,
  NormalizedPost,
  PlatformName
} from '@/components/brand/sidepanel/influencer-side-panel.types'
import { InfluencerWithDetails } from '@/lib/queries/influencers'

const PLATFORM_DISPLAY: Record<PlatformName, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X (Twitter)',
  twitch: 'Twitch',
}

const PLATFORM_ID_TO_NAME: Record<number, PlatformName | 'facebook'> = {
  1: 'instagram',
  2: 'tiktok',
  3: 'youtube',
  4: 'x',
  5: 'twitch',
  6: 'facebook',
}

function normalizePlatformLabel(value: unknown): PlatformName | null {
  if (typeof value !== 'string') return null
  const key = value.trim().toLowerCase()
  if (!key) return null
  const aliases: Record<string, PlatformName> = {
    instagram: 'instagram',
    insta: 'instagram',
    tiktok: 'tiktok',
    'tik tok': 'tiktok',
    youtube: 'youtube',
    'you tube': 'youtube',
    x: 'x',
    twitter: 'x',
    'x (twitter)': 'x',
    twitch: 'twitch',
  }
  return aliases[key] ?? null
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  return fallback
}

function resolvePlatformName(input: any): PlatformName {
  const joined = Array.isArray(input?.platforms) ? input.platforms[0] : input?.platforms
  const fromJoinedName = normalizePlatformLabel(joined?.name)
  if (fromJoinedName) return fromJoinedName
  const fromJoinedDisplayName = normalizePlatformLabel(joined?.display_name)
  if (fromJoinedDisplayName) return fromJoinedDisplayName

  const fromPlatformField = normalizePlatformLabel(input?.platform)
  if (fromPlatformField) return fromPlatformField

  const platformId =
    typeof input?.platform_id === 'string' ? Number(input.platform_id) : input?.platform_id
  const mapped = PLATFORM_ID_TO_NAME[platformId as number]
  if (mapped && mapped in PLATFORM_DISPLAY) return mapped as PlatformName
  // Default to instagram when unknown (legacy-safe)
  return 'instagram'
}

// ─── Relative time formatter ──────────────────────────────────────────
// Converts DB timestamptz → "2 days ago", "a week ago", etc.
function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return 'unknown'
  const now = new Date()
  const posted = new Date(timestamp)
  if (Number.isNaN(posted.getTime())) return 'unknown'
  const diffMs = now.getTime() - posted.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return 'a week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return 'a month ago'
  return `${Math.floor(diffDays / 30)} months ago`
}

// ─── Followers formatter ───────────────────────────────────────────────
// Converts 42000 → "42K", 1500000 → "1.5M" for display
export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

// ─── Price formatter ───────────────────────────────────────────────────
// Converts cents to display string: 45000, 70000 → "$450 - $700"
export function formatPriceRange(
  min: number | null,
  max: number | null
): string | null {
  if (min == null || max == null) return null
  const fmt = (cents: number) => {
    const dollars = cents / 100
    if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1).replace(/\.0$/, '')}k`
    return `$${dollars}`
  }
  return `${fmt(min)} - ${fmt(max)}`
}

// ─── Main normalizer ───────────────────────────────────────────────────
const normalizeCache = new WeakMap<InfluencerWithDetails, NormalizedInfluencer>()

export function normalizeInfluencer(
  raw: InfluencerWithDetails
): NormalizedInfluencer {
  if (normalizeCache.has(raw)) return normalizeCache.get(raw)!

  const result = _normalizeInfluencer(raw)
  normalizeCache.set(raw, result)
  return result
}

function _normalizeInfluencer(
  raw: InfluencerWithDetails
): NormalizedInfluencer {

  // Normalize metrics
  const metrics: NormalizedMetric[] = (
    raw.influencer_platform_metrics ?? []
  ).map((m: any) => {
    const platformName = resolvePlatformName(m)
    const pricingList = Array.isArray((raw as any)?.influencer_platform_pricing)
      ? (raw as any).influencer_platform_pricing
      : []
    const pricing = pricingList.find((p: any) => p?.platform_id === m?.platform_id) ?? null

    const estPriceMin = pricing?.est_price_min ?? m?.est_price_min ?? null
    const estPriceMax = pricing?.est_price_max ?? m?.est_price_max ?? null
    const cpe = pricing?.cpe ?? m?.cpe ?? null
    const cpv = pricing?.cpv ?? m?.cpv ?? null

    return ({
    platform: platformName,
    platform_display_name: PLATFORM_DISPLAY[platformName] ?? '',
    handle: m.handle,
    followers: m.followers,
    engagement: asNumber(m.engagement_rate, 0),
    avgLikes: m.avg_likes,
    avgComments: m.avg_comments,
    avgShares: m.avg_shares,
    avgViews: m.avg_views,
    estimatedPriceMin: estPriceMin,
    estimatedPriceMax: estPriceMax,
    cpe: cpe != null ? Number(cpe) : null,
    cpv: cpv != null ? Number(cpv) : null,
    estimatedPriceRange: formatPriceRange(estPriceMin, estPriceMax),
  })})

  // Normalize posts
  const posts: NormalizedPost[] = (
    raw.influencer_posts ?? []
  ).map((p: any, index: number) => {
    const platform = resolvePlatformName(p)
    return ({
    id: asString(
      p.id,
      `${raw.id}-${platform}-${asString(p.post_platform_id, 'post')}-${index}`,
    ),
    platform,
    thumbnailUrl: asString(p.thumbnail_url, ''),
    caption: asString(p.caption, ''),
    likes: asNumber(p.likes, 0),
    comments: asNumber(p.comments, 0),
    views: asNullableNumber(p.views),
    shares: asNullableNumber(p.shares),
    estimatedImpressions: asNullableNumber(p.estimated_impressions),
    estimatedReach: asNullableNumber(p.estimated_reach),
    engagementRate: asNumber(p.engagement_rate, 0),
    cpe: asNullableNumber(p.cpe),
    postedAt: formatRelativeTime(asString(p.posted_at, '')),
  })})

  return {
    id: raw.id,
    userId: (raw as any).auth_user_id ?? null,
    name: raw.name,
    firstName: raw.first_name,
    lastName: raw.last_name,
    username: raw.username,
    email: raw.email,
    avatar: raw.avatar_url,
    bio: raw.bio,
    authenticityScore: raw.authenticity_score,
    location: {
      city: raw.city ?? (raw as any).billing_city ?? null,
      countryCode: raw.country_code ?? (raw as any).billing_country ?? null,
      flag: raw.flag,
    },
    niches: raw.niches ?? [],
    // Since categories was collapsed into niches in the schema, map it directly to prevent UI crashes
    categories: raw.niches ?? [],
    languages: raw.languages ?? [],
    phoneWhatsapp:
      (raw as any).influencer_activity?.phone_whatsapp ??
      (raw as any).phone_whatsapp ??
      (typeof (raw as any).phone === 'string' ? (raw as any).phone : null) ??
      null,
    baseCurrency: (raw as any).influencer_rates?.base_currency ?? (raw as any).base_currency ?? null,
    minRate: (raw as any).influencer_rates?.min_rate ?? (raw as any).min_rate ?? null,
    maxRate: (raw as any).influencer_rates?.max_rate ?? (raw as any).max_rate ?? null,
    acceptsProductGifting: (raw as any).influencer_rates?.accepts_product_gifting ?? (raw as any).accepts_product_gifting ?? null,
    shippingRegions: (raw as any).influencer_rates?.shipping_regions ?? (raw as any).shipping_regions ?? [],
    responseRate: (raw as any).influencer_activity?.response_rate != null
      ? Number((raw as any).influencer_activity.response_rate)
      : ((raw as any).response_rate != null ? Number((raw as any).response_rate) : null),
    acceptanceRate: (raw as any).influencer_activity?.acceptance_rate != null
      ? Number((raw as any).influencer_activity.acceptance_rate)
      : ((raw as any).acceptance_rate != null ? Number((raw as any).acceptance_rate) : null),
    lastActiveAt: (raw as any).influencer_activity?.last_active_at ?? (raw as any).last_active_at ?? null,
    gallery: (raw.gallery ?? []).slice(0, 4),
    metrics,
    posts,
  }
}

// ─── Batch normalizer ──────────────────────────────────────────────────
export function normalizeInfluencers(
  raws: InfluencerWithDetails[]
): NormalizedInfluencer[] {
  return raws.map(normalizeInfluencer)
}
