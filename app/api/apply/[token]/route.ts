import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function normalizeCampaignShape(rawCampaign: any, root: any) {
  const campaign = Array.isArray(rawCampaign) ? (rawCampaign[0] ?? null) : rawCampaign
  if (!campaign || typeof campaign !== 'object') return campaign

  return {
    ...campaign,
    brief_pdf_url:
      campaign.brief_pdf_url ??
      campaign.briefUrl ??
      root?.brief_pdf_url ??
      null,
    contract_pdf_url:
      campaign.contract_pdf_url ??
      campaign.contractUrl ??
      root?.contract_pdf_url ??
      null,
  }
}

// ─── GET /api/apply/[token] ──────────────────────────────────────────
// Public — fetches campaign details for the application form.
// Marks the campaign_influencer as "viewed" on first visit.
// ─────────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // Fetch campaign influencer record by token with all nested data
  const { data: ci, error: ciError } = await supabaseAdmin
    .from('campaign_influencers')
    .select(`
      id,
      token,
      status,
      apply_status,
      custom_flat_amount,
      influencer_id,
      campaign_id,
      campaigns (
        id,
        name,
        description,
        type,
        flat_amount,
        max_product_count,
        max_product_value,
        requires_contract,
        contract_pdf_url,
        brief_pdf_url,
        email_subject,
        cover_color,
        cover_emoji,
        campaign_products (
          id,
          name,
          image_url,
          value,
          description,
          sort_order
        ),
        brands (
          id,
          company_name,
          logo_url
        )
      ),
      influencers (
        id,
        name,
        first_name,
        last_name,
        username,
        avatar_url,
        email
      )
    `)
    .eq('token', token)
    .single()

  if (ciError || !ci) {
    return NextResponse.json(
      { error: 'Invalid or expired application link' },
      { status: 404 }
    )
  }

  const normalizedCampaign = normalizeCampaignShape(ci.campaigns, ci)
  const ciPayload = {
    ...ci,
    campaigns: normalizedCampaign,
  }

  // Check if already responded
  if (ciPayload.apply_status && ciPayload.apply_status !== 'pending_review') {
    return NextResponse.json({
      ...ciPayload,
      already_responded: true,
    })
  }

  // Mark as viewed if first time opening
  if (ci.status === 'email_sent') {
    await supabaseAdmin
      .from('campaign_influencers')
      .update({
        status: 'viewed',
        viewed_at: new Date().toISOString(),
      })
      .eq('token', token)

    // Log the view event
    const brandId = (ciPayload.campaigns as any)?.brands?.id
    if (brandId) {
      await supabaseAdmin.from('campaign_activity').insert({
        brand_id: brandId,
        campaign_id: ciPayload.campaign_id,
        type: 'email_viewed',
        title: 'Application link opened',
        description: `${(ciPayload.influencers as any)?.name ?? 'An influencer'} opened the application form`,
        meta: {
          influencer_id: ciPayload.influencer_id,
          token,
        },
      })
    }
  }

  return NextResponse.json({ ...ciPayload, already_responded: false })
}

// ─── POST /api/apply/[token] ─────────────────────────────────────────
// Public — handles the influencer's application submission.
// Actions: accept, decline, counter
// ─────────────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  let body: {
    action: 'accept' | 'decline' | 'counter'
    selected_product_ids?: string[]
    application_note?: string
    counter_offer_amount?: number
    signed_contract_url?: string
    shipping_address_structured?: {
      first_name?: string
      last_name?: string
      phone?: string
      address_line1?: string
      address_line2?: string
      city?: string
      state_province?: string
      postal_code?: string
      country?: string
    }
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    action,
    selected_product_ids,
    application_note,
    counter_offer_amount,
    signed_contract_url,
    shipping_address_structured,
  } = body

  if (!['accept', 'decline', 'counter'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Get the campaign influencer record
  const { data: ci, error } = await supabaseAdmin
    .from('campaign_influencers')
    .select(`
      id,
      campaign_id,
      influencer_id,
      apply_status,
      campaigns (
        brand_id,
        name,
        type,
        max_product_count,
        max_product_value,
        campaign_products (
          id,
          value
        )
      ),
      influencers ( name )
    `)
    .eq('token', token)
    .single()

  if (error || !ci) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  }

  // Prevent double submission
  if (ci.apply_status !== null) {
    return NextResponse.json(
      { error: 'You have already responded to this offer' },
      { status: 409 }
    )
  }

  // Server-side guardrails for product limits on paid_with_product campaigns.
  const campaign = ci.campaigns as any
  const selectedIds = selected_product_ids ?? []
  if (action === 'accept' && campaign?.type === 'paid_with_product') {
    const maxCount = campaign?.max_product_count ?? null
    const maxValue = campaign?.max_product_value ?? null

    if (maxCount != null && selectedIds.length > maxCount) {
      return NextResponse.json(
        { error: `You can select up to ${maxCount} product${maxCount === 1 ? '' : 's'}.` },
        { status: 400 }
      )
    }

    if (maxValue != null && Array.isArray(campaign?.campaign_products)) {
      const valueById = new Map<string, number>(
        campaign.campaign_products.map((p: any) => [p.id, p.value ?? 0])
      )

      const totalSelectedValue = selectedIds.reduce((sum, id) => {
        return sum + (valueById.get(id) ?? 0)
      }, 0)

      if (totalSelectedValue > maxValue) {
        return NextResponse.json(
          { error: `Selected products exceed the maximum allowed value for this campaign.` },
          { status: 400 }
        )
      }
    }
  }

  // Map action → apply_status
  const applyStatusMap: Record<string, string> = {
    accept:  'accepted',
    decline: 'declined',
    counter: 'countered',
  }

  // Map action → top-level status
  const statusMap: Record<string, string> = {
    accept:  'accepted',
    decline: 'declined',
    counter: 'viewed',      // stays "viewed" until brand responds to counter
  }

  // Update campaign_influencers
  const { error: updateError } = await supabaseAdmin
    .from('campaign_influencers')
    .update({
      apply_status: applyStatusMap[action],
      status: statusMap[action],
      selected_product_ids: selected_product_ids ?? [],
      application_note: application_note ?? null,
      counter_offer_amount: counter_offer_amount ?? null,
      signed_contract_url: signed_contract_url ?? null,
      responded_at: new Date().toISOString(),
    })
    .eq('token', token)

  if (updateError) {
    console.error('Apply submission error:', updateError)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }

  // ── Save structured billing/shipping data to influencers table ──────
  if (shipping_address_structured && ci.influencer_id) {
    const s = shipping_address_structured
    const influencerUpdates: Record<string, any> = {}
    if (s.first_name)    influencerUpdates.first_name            = s.first_name
    if (s.last_name)     influencerUpdates.last_name             = s.last_name
    if (s.phone)         influencerUpdates.phone                 = s.phone
    if (s.address_line1) influencerUpdates.billing_address_line1 = s.address_line1
    if (s.address_line2) influencerUpdates.billing_address_line2 = s.address_line2
    if (s.city)          influencerUpdates.billing_city          = s.city
    if (s.state_province)influencerUpdates.billing_state_province = s.state_province
    if (s.postal_code)   influencerUpdates.billing_postal_code   = s.postal_code
    if (s.country)       influencerUpdates.billing_country       = s.country

    if (Object.keys(influencerUpdates).length > 0) {
      const { error: infUpdateError } = await supabaseAdmin
        .from('influencers')
        .update(influencerUpdates)
        .eq('id', ci.influencer_id)

      if (infUpdateError) {
        // Non-fatal: log but don't fail the whole submission
        console.error('Failed to save billing data to influencers:', infUpdateError)
      }
    }
  }

  // Log to campaign_activity
  const activityType: Record<string, string> = {
    accept:  'influencer_accepted',
    decline: 'influencer_declined',
    counter: 'influencer_countered',
  }

  const activityTitle: Record<string, string> = {
    accept:  'Influencer accepted the offer',
    decline: 'Influencer declined the offer',
    counter: 'Influencer sent a counter-offer',
  }

  const influencerName = (ci.influencers as any)?.name ?? 'An influencer'
  const campaignName = (ci.campaigns as any)?.name ?? 'a campaign'
  const brandId = (ci.campaigns as any)?.brand_id

  if (brandId) {
    await supabaseAdmin.from('campaign_activity').insert({
      brand_id: brandId,
      campaign_id: ci.campaign_id,
      type: activityType[action],
      title: activityTitle[action],
      description:
        action === 'counter'
          ? `${influencerName} counter-offered on "${campaignName}"${counter_offer_amount ? ` — $${(counter_offer_amount / 100).toFixed(2)}` : ''}`
          : `${influencerName} ${action}ed the offer for "${campaignName}"`,
      meta: {
        influencer_id: ci.influencer_id,
        action,
        selected_product_ids: selected_product_ids ?? [],
        counter_offer_amount: counter_offer_amount ?? null,
        application_note: application_note ?? null,
      },
    })
  }

  return NextResponse.json({ success: true, action })
}
