'use client'

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Campaign         = Database['public']['Tables']['campaigns']['Row']
type CampaignProduct  = Database['public']['Tables']['campaign_products']['Row']

export type CampaignWithStats = Campaign & {
  creators_count: number
  engaged_count:  number
  emails_sent:    number
  response_rate:  number
  products:       CampaignProduct[]
}

// ─── Get all campaigns with stats + products ──────────────────────────
export async function getBrandCampaigns(): Promise<CampaignWithStats[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_influencers ( id, status, apply_status ),
      campaign_products    ( * )
    `)
    .order('created_at', { ascending: false })

  if (error) { console.error('getBrandCampaigns:', error); return [] }

  return (data ?? []).map((c: any) => {
    const influencers = c.campaign_influencers ?? []
    const products    = c.campaign_products    ?? []

    const emailsSent  = influencers.filter((i: any) =>
      ['email_sent','viewed','accepted','declined'].includes(i.status)
    ).length

    const engaged = influencers.filter((i: any) =>
      ['viewed','accepted','declined'].includes(i.status)
    ).length

    const responded = influencers.filter((i: any) =>
      ['accepted','declined'].includes(i.apply_status ?? '')
    ).length

    return {
      ...c,
      creators_count: influencers.length,
      engaged_count:  engaged,
      emails_sent:    emailsSent,
      response_rate:  emailsSent > 0
        ? Math.round((responded / emailsSent) * 100)
        : 0,
      products,
    }
  })
}

// ─── Dashboard stats ──────────────────────────────────────────────────
export async function getCampaignDashboardStats(): Promise<{
  engagedInfluencers: number
  emailsSent:         number
  responseRate:       number
}> {
  const campaigns = await getBrandCampaigns()

  const totalEmailsSent = campaigns.reduce((s, c) => s + c.emails_sent, 0)
  const totalEngaged    = campaigns.reduce((s, c) => s + c.engaged_count, 0)
  const totalResponded  = campaigns.reduce((s, c) =>
    s + Math.round((c.response_rate / 100) * c.emails_sent), 0
  )

  return {
    engagedInfluencers: totalEngaged,
    emailsSent:         totalEmailsSent,
    responseRate:       totalEmailsSent > 0
      ? Math.round((totalResponded / totalEmailsSent) * 100)
      : 0,
  }
}

// ─── Activity feed ────────────────────────────────────────────────────
export async function getCampaignActivity(
  limit = 20
): Promise<any[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaign_activity')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) { console.error('getCampaignActivity:', error); return [] }
  const items = (data ?? [])
    .sort((a: any, b: any) => {
      const ta = new Date(a?.created_at ?? 0).getTime()
      const tb = new Date(b?.created_at ?? 0).getTime()
      return tb - ta
    })
  return items.slice(0, limit)
}

// ─── Resolve auth user ID → brand UUID ────────────────────────────────
async function getBrandId(authUserId: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('brands')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single()
  return data?.id ?? null
}

// ─── Create campaign (with products) ─────────────────────────────────
export async function createCampaign(payload: {
  brandId:           string   // Supabase auth user ID — resolved to brand UUID
  name:              string
  description?:      string
  logoUrl?:          string
  type:              'paid' | 'paid_with_product'
  contentTags:       Array<{ type: 'hashtag' | 'mention'; value: string }>
  flatAmount?:       number | null        // in cents
  showProductPrice?: boolean
  maxProductCount?:  number | null
  maxProductValue?:  number | null        // in cents
  briefPdfUrl?:      string | null
  contractPdfUrl?:   string | null
  requiresContract?: boolean
  targetListId?:     string | null
  coverColor?:       string
  coverEmoji?:       string
  emailSubject?:     string
  emailTemplate?:    string
  campaignGoal?: string | null
  primaryKpi?: string | null
  targetKpiValue?: number | null
  campaignLanguage?: string | null
  campaignCurrency?: string | null
  targetCountries?: string[]
  targetCities?: string[]
  targetNiches?: string[]
  minFollowers?: number | null
  maxFollowers?: number | null
  minEngagementRate?: number | null
  authenticityMinScore?: number | null
  startAt?: string | null
  contentDueAt?: string | null
  publishWindowStart?: string | null
  publishWindowEnd?: string | null
  products?:         Array<{
    name:      string
    imageUrl?: string
    value:     number          // in cents
    description?: string
  }>
}): Promise<Campaign | null> {
  const supabase = createClient()

  // Resolve auth user ID to actual brand UUID
  const brandUUID = await getBrandId(payload.brandId)
  if (!brandUUID) { console.error('createCampaign: brand not found for auth user ID', payload.brandId); return null }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      brand_id:           brandUUID,
      name:               payload.name,
      description:        payload.description ?? null,
      logo_url:           payload.logoUrl ?? null,
      type:               payload.type,
      content_tags:       payload.contentTags,
      flat_amount:        payload.flatAmount ?? null,
      show_product_price: payload.showProductPrice ?? true,
      max_product_count:  payload.maxProductCount ?? null,
      max_product_value:  payload.maxProductValue ?? null,
      brief_pdf_url:      payload.briefPdfUrl ?? null,
      contract_pdf_url:   payload.contractPdfUrl ?? null,
      requires_contract:  payload.requiresContract ?? false,
      target_list_id:     payload.targetListId ?? null,
      cover_color:        payload.coverColor ?? '#6366F1',
      cover_emoji:        payload.coverEmoji ?? '🎯',
      email_subject:      payload.emailSubject ?? null,
      email_template:     payload.emailTemplate ?? null,
      campaign_goal: payload.campaignGoal ?? null,
      primary_kpi: payload.primaryKpi ?? null,
      target_kpi_value: payload.targetKpiValue ?? null,
      campaign_language: payload.campaignLanguage ?? null,
      campaign_currency: payload.campaignCurrency ?? null,
      start_at: payload.startAt ?? null,
      content_due_at: payload.contentDueAt ?? null,
      publish_window_start: payload.publishWindowStart ?? null,
      publish_window_end: payload.publishWindowEnd ?? null,
      status:             'draft',
    })
    .select()
    .single()

  if (error) { console.error('createCampaign:', error); return null }

  // Insert products if type is paid_with_product
  if (payload.type === 'paid_with_product' && payload.products?.length) {
    const productRows = payload.products.map((p, i) => ({
      campaign_id: campaign.id,
      name:        p.name,
      image_url:   p.imageUrl ?? null,
      value:       p.value,
      description: p.description ?? null,
      sort_order:  i,
    }))
    const { error: prodError } = await supabase
      .from('campaign_products')
      .insert(productRows)
    if (prodError) console.error('createCampaign products:', prodError)
  }

  // Log activity
  const entry = {
    brand_id: brandUUID,
    campaign_id: campaign.id,
    type: 'campaign_created',
    title: 'Campaign created',
    description: `Created campaign "${payload.name}"`,
  }
  await supabase.from('campaign_activity').insert(entry)

  return campaign
}

// ─── Delete campaign ──────────────────────────────────────────────────
export async function deleteCampaign(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('campaigns').delete().eq('id', id)
  if (error) { console.error('deleteCampaign:', error); return false }
  return true
}

// ─── Get a single campaign with full details ──────────────────────────
export async function getCampaignById(campaignId: string): Promise<any | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_products ( * ),
      campaign_influencers (
        *,
        campaign_payouts ( id, status, amount, created_at ),
        influencers (
          id,
          name,
          first_name,
          last_name,
          username,
          avatar_url,
          country_code,
          flag,
          niches,
          languages,
          authenticity_score,
          email,
          phone,
          gender,
          billing_address_line1,
          billing_address_line2,
          billing_country,
          billing_state_province,
          billing_city,
          billing_postal_code,
          bio,
          influencer_platform_metrics (
            *,
            platforms ( name, display_name )
          )
        )
      )
    `)
    .eq('id', campaignId)
    .single()

  if (error) { console.error('getCampaignById:', error); return null }
  return data
}

// ─── Add influencers from a list to a campaign ────────────────────────
export async function addListInfluencersToCampaign(
  campaignId: string,
  listId: string
): Promise<{ added: number; skipped: number }> {
  const supabase = createClient()

  const { data: listInfluencers, error: listError } = await supabase
    .from('brand_list_influencers')
    .select('influencer_id')
    .eq('list_id', listId)

  if (listError || !listInfluencers?.length) {
    return { added: 0, skipped: 0 }
  }

  let added = 0
  let skipped = 0

  for (const row of listInfluencers) {
    const { error } = await supabase
      .from('campaign_influencers')
      .insert({
        campaign_id: campaignId,
        influencer_id: row.influencer_id,
        status: 'pending',
      })

    if (error) {
      if (error.code === '23505') {
        skipped++ // already in campaign
      } else {
        console.error('addListInfluencersToCampaign insert error:', error)
      }
    } else {
      added++
    }
  }

  return { added, skipped }
}

// ─── Remove influencer from campaign ─────────────────────────────────
export async function removeInfluencerFromCampaign(
  campaignId: string,
  influencerId: string
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('campaign_influencers')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('influencer_id', influencerId)

  if (error) { console.error('removeInfluencerFromCampaign:', error); return false }
  return true
}

// ─── Update campaign influencer status ───────────────────────────────
export async function updateCampaignInfluencerStatus(
  campaignInfluencerId: string,
  status: string
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('campaign_influencers')
    .update({ status })
    .eq('id', campaignInfluencerId)

  if (error) { console.error('updateCampaignInfluencerStatus:', error); return false }
  return true
}
