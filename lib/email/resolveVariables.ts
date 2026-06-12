// ─── Available template variables ────────────────────────────────────
export const EMAIL_VARIABLES = [
  { key: 'influencer_name',  label: 'Influencer Name',  description: 'Full name of the influencer' },
  { key: 'first_name',       label: 'First Name',        description: 'Influencer first name' },
  { key: 'brand_name',       label: 'Brand Name',        description: 'Your brand name' },
  { key: 'influencer_email', label: 'Email',             description: 'Influencer email address' },
  { key: 'username',         label: 'Username',          description: 'Social media handle' },
  { key: 'campaign_name',    label: 'Campaign Name',     description: 'Name of this campaign' },
  { key: 'campaign_logo_url',label: 'Campaign Logo URL', description: 'Campaign logo image URL' },
  { key: 'city',             label: 'City',              description: 'Influencer city' },
  { key: 'platform',         label: 'Platform',          description: 'Primary platform name' },
  { key: 'followers',        label: 'Followers',         description: 'Follower count' },
  { key: 'application_link', label: 'Application Link',  description: 'Unique apply link for this influencer' },
  { key: 'draft_link',       label: 'Draft upload link',   description: 'Personal link to submit campaign draft (no login)' },
] as const

export type VariableKey = typeof EMAIL_VARIABLES[number]['key']

export interface VariableContext {
  influencer_name:   string
  first_name:        string
  brand_name:        string
  influencer_email:  string
  username:          string
  campaign_name:     string
  campaign_logo_url: string
  city:              string
  platform:          string
  followers:         string
  application_link:  string
  draft_link:        string
}

// ─── Build context from a campaign_influencer row ─────────────────────
export function buildVariableContext(
  ci: any,
  campaign: any,
  brandName: string
): VariableContext {
  const inf = ci.influencers
  const primaryMetric = inf?.influencer_platform_metrics?.[0]
  const platform = primaryMetric?.platform ?? ''

  return {
    influencer_name:  (inf?.name ?? `${inf?.first_name ?? ''} ${inf?.last_name ?? ''}`.trim()) || 'Influencer',
    first_name:       inf?.first_name ?? inf?.name?.split(' ')[0] ?? 'Influencer',
    brand_name:       brandName,
    influencer_email: inf?.email ?? '',
    username:         inf?.username ?? '',
    campaign_name:    campaign?.name ?? '',
    campaign_logo_url: campaign?.logo_url ?? '',
    city:             inf?.city ?? '',
    platform:         platform
                      ? ({
                          instagram: 'Instagram',
                          tiktok: 'TikTok',
                          youtube: 'YouTube',
                          x: 'X (Twitter)',
                          twitch: 'Twitch',
                        } as any)[platform] ?? String(platform)
                      : '',
    followers:        primaryMetric?.followers
                        ? Number(primaryMetric.followers).toLocaleString()
                        : '',
    // Resolved server-side in the API route using the campaign_influencer token.
    // Kept as {{application_link}} placeholder so the API can inject the real URL.
    application_link: '{{application_link}}',
    draft_link: '{{draft_link}}',
  }
}

// ─── Replace all {{variable}} tokens in a string ─────────────────────
export function resolveTemplate(template: string, ctx: VariableContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return (ctx as any)[key] ?? `{{${key}}}`
  })
}

// ─── Insert variable at cursor position in a textarea or input ─────────
export function insertVariableAtCursor(
  element: HTMLTextAreaElement | HTMLInputElement,
  variable: string,
  currentValue: string,
  setValue: (v: string) => void
): void {
  const start = element.selectionStart ?? 0
  const end   = element.selectionEnd ?? 0
  const token = `{{${variable}}}`
  const next  = currentValue.slice(0, start) + token + currentValue.slice(end)
  setValue(next)
  // Restore cursor after inserted token
  requestAnimationFrame(() => {
    element.selectionStart = start + token.length
    element.selectionEnd   = start + token.length
    element.focus()
  })
}
