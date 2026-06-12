import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase/server'

// ─── GET /api/influencer/settings ─────────────────────────────────────
// Returns the current influencer's profile + billing data
// ──────────────────────────────────────────────────────────────────────
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: influencer, error } = await supabaseAdmin
    .from('influencers')
    .select(`
      id,
      name,
      first_name,
      last_name,
      username,
      email,
      phone,
      gender,
      country_code,
      avatar_url,
      billing_type,
      billing_name,
      billing_address_line1,
      billing_address_line2,
      billing_country,
      billing_state_province,
      billing_city,
      billing_postal_code
    `)
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('GET /api/influencer/settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }

  if (!influencer) {
    return NextResponse.json({ error: 'Influencer profile not found' }, { status: 404 })
  }

  return NextResponse.json({ influencer })
}

// ─── POST /api/influencer/settings ────────────────────────────────────
// Updates the current influencer's profile or billing data
// ──────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, any>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Only allow updating known fields
  const allowedFields = [
    'name', 'first_name', 'last_name', 'phone', 'gender', 'country_code',
    'billing_type', 'billing_name',
    'billing_address_line1', 'billing_address_line2',
    'billing_country', 'billing_state_province',
    'billing_city', 'billing_postal_code',
  ]

  const updates: Record<string, any> = {}
  for (const key of allowedFields) {
    if (key in body) {
      updates[key] = body[key] ?? null
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  updates.updated_at = new Date().toISOString()

  const { error } = await supabaseAdmin
    .from('influencers')
    .update(updates)
    .eq('auth_user_id', user.id)

  if (error) {
    console.error('POST /api/influencer/settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
