// ─── Platform names (matches platforms table) ────────────────────────
export type PlatformName = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'twitch'
export type RowPlatform = PlatformName

// ─── Normalized metric (what components expect) ──────────────────────
export interface NormalizedMetric {
  platform: PlatformName
  platform_display_name: string
  handle: string
  followers: number           // INTEGER from DB — no more "42k" strings
  engagement: number          // NUMERIC from DB — e.g. 10.80
  avgLikes: number | null
  avgComments: number | null
  avgShares: number | null     // null for non-TikTok
  avgViews: number | null      // null for Instagram/X
  estimatedPriceMin: number | null  // in cents
  estimatedPriceMax: number | null  // in cents
  cpe: number | null
  cpv: number | null
  estimatedPriceRange?: string | null // For UI rendering ("$1.2k - $2.8k")
}

// ─── Normalized post (what components expect) ────────────────────────
export interface NormalizedPost {
  id: string
  platform: PlatformName
  thumbnailUrl: string
  caption: string
  likes: number
  comments: number
  views: number | null
  shares: number | null
  estimatedImpressions: number | null
  estimatedReach: number | null
  engagementRate: number
  cpe: number | null
  postedAt: string            // formatted relative string: "2 days ago"
}

// ─── Normalized gallery image ─────────────────────────────────────────
export interface NormalizedGalleryImage {
  url: string
  displayOrder: number
}

// ─── Normalized influencer (what ALL components expect) ───────────────
export interface NormalizedInfluencer {
  id: string
  userId: string | null
  name: string
  firstName: string
  lastName: string
  username: string
  email: string | null
  avatar: string | null       // maps from avatar_url
  bio: string | null
  authenticityScore: number | null
  location: {
    city: string | null
    countryCode: string | null
    flag: string | null
  }
  niches: string[]
  categories: string[]
  languages: string[]
  phoneWhatsapp: string | null
  baseCurrency: string | null
  minRate: number | null
  maxRate: number | null
  acceptsProductGifting: boolean | null
  shippingRegions: string[]
  responseRate: number | null
  acceptanceRate: number | null
  lastActiveAt: string | null
  gallery: string[]            // the schema just uses string[]
  metrics: NormalizedMetric[]  // maps from influencer_platform_metrics
  posts: NormalizedPost[]      // maps from influencer_posts
}
