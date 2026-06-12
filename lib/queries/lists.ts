'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'
import { Database } from '@/types/supabase'

type BrandList = Database['public']['Tables']['brand_lists']['Row']
type BrandListWithCount = BrandList & { influencer_count: number }

// ─── Get brand_id from auth_user_id ───────────────────────────────────
async function getBrandId(authUserId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('brands')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single()
  return data?.id ?? null
}

// ─── Get all lists for the current brand ────────────────────────────
export async function getBrandLists(
  authUserId: string
): Promise<BrandListWithCount[]> {
  const brandId = await getBrandId(authUserId)
  if (!brandId) return []

  const { data, error } = await supabaseAdmin
    .from('brand_lists')
    .select(`
      *,
      brand_list_influencers ( count )
    `)
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getBrandLists error:', error)
    return []
  }

  return (data ?? []).map((list: any) => ({
    ...list,
    influencer_count: list.brand_list_influencers?.[0]?.count ?? 0,
  }))
}

// ─── Create a new list ───────────────────────────────────────────────
export async function createBrandList(
  authUserId: string,
  name: string,
  color?: string,
  description?: string
): Promise<BrandList | null> {
  const brandId = await getBrandId(authUserId)
  if (!brandId) return null

  const { data, error } = await supabaseAdmin
    .from('brand_lists')
    .insert({ brand_id: brandId, name, color, description })
    .select()
    .single()

  if (error) {
    console.error('createBrandList error:', error)
    return null
  }
  return data
}

// ─── Delete a list ───────────────────────────────────────────────────
export async function deleteBrandList(
  authUserId: string,
  listId: string
): Promise<boolean> {
  // Verify list belongs to this brand before deleting
  const brandId = await getBrandId(authUserId)
  if (!brandId) return false

  const { error } = await supabaseAdmin
    .from('brand_lists')
    .delete()
    .eq('id', listId)
    .eq('brand_id', brandId)

  if (error) { console.error('deleteBrandList error:', error); return false }
  return true
}

// ─── Add influencer to a list ────────────────────────────────────────
export async function addInfluencerToList(
  authUserId: string,
  listId: string,
  influencerId: string,
  notes?: string
): Promise<boolean> {
  // Verify list belongs to this brand
  const brandId = await getBrandId(authUserId)
  if (!brandId) return false

  const { data: list } = await supabaseAdmin
    .from('brand_lists')
    .select('id')
    .eq('id', listId)
    .eq('brand_id', brandId)
    .single()

  if (!list) return false

  const { error } = await supabaseAdmin
    .from('brand_list_influencers')
    .insert({ list_id: listId, influencer_id: influencerId, notes })

  if (error) {
    // Ignore duplicate (influencer already in list)
    if (error.code === '23505') return true
    console.error('addInfluencerToList error:', error)
    return false
  }
  return true
}

// ─── Remove influencer from a list ──────────────────────────────────
export async function removeInfluencerFromList(
  authUserId: string,
  listId: string,
  influencerId: string
): Promise<boolean> {
  // Verify list belongs to this brand
  const brandId = await getBrandId(authUserId)
  if (!brandId) return false

  const { data: list } = await supabaseAdmin
    .from('brand_lists')
    .select('id')
    .eq('id', listId)
    .eq('brand_id', brandId)
    .single()

  if (!list) return false

  const { error } = await supabaseAdmin
    .from('brand_list_influencers')
    .delete()
    .eq('list_id', listId)
    .eq('influencer_id', influencerId)

  if (error) { console.error('removeInfluencerFromList error:', error); return false }
  return true
}

// ─── Get which lists contain a specific influencer ───────────────────
export async function getListsContainingInfluencer(
  authUserId: string,
  influencerId: string
): Promise<string[]> {
  const brandId = await getBrandId(authUserId)
  if (!brandId) return []

  const { data, error } = await supabaseAdmin
    .from('brand_list_influencers')
    .select('list_id, brand_lists!inner(brand_id)')
    .eq('influencer_id', influencerId)
    .eq('brand_lists.brand_id', brandId)

  if (error) { console.error('getListsContainingInfluencer:', error); return [] }
  return (data ?? []).map((row: any) => row.list_id)
}

// ─── Get all influencers in a specific list ──────────────────────────
// Returns raw rows compatible with InfluencerWithDetails for normalization.
export async function getInfluencersInList(
  authUserId: string,
  listId: string
): Promise<any[]> {
  // Verify list belongs to this brand
  const brandId = await getBrandId(authUserId)
  if (!brandId) return []

  const { data: list } = await supabaseAdmin
    .from('brand_lists')
    .select('id')
    .eq('id', listId)
    .eq('brand_id', brandId)
    .single()

  if (!list) return []

  const { data, error } = await supabaseAdmin
    .from('brand_list_influencers')
    .select(`
      influencer_id,
      added_at,
      notes,
      influencers (
        *,
        influencer_platform_metrics (
          *,
          platforms ( name, display_name )
        ),
        influencer_posts (
          *,
          platforms ( name, display_name )
        )
      )
    `)
    .eq('list_id', listId)
    .order('added_at', { ascending: false })

  if (error) { console.error('getInfluencersInList:', error); return [] }
  return (data ?? []).map((row: any) => row.influencers).filter(Boolean)
}

// ─── Fetch lists AND first list's influencers in PARALLEL ─────────────
export async function getBrandListsWithFirstInfluencers(
  authUserId: string
): Promise<{
  lists: BrandListWithCount[]
  firstListInfluencers: any[]
  firstListId: string | null
}> {
  // Step 1: Get all lists
  const lists = await getBrandLists(authUserId)

  if (!lists.length) {
    return { lists: [], firstListInfluencers: [], firstListId: null }
  }

  const firstListId = lists[0].id

  // Step 2: Fetch first list's influencers
  // Since we already awaited getBrandLists, we just get the influencers now.
  // We can't TRULY parallelize them from scratch without knowing the firstListId,
  // BUT we CAN combine them into a single server action round-trip from the client!
  const firstListInfluencers = await getInfluencersInList(authUserId, firstListId)

  return { lists, firstListInfluencers, firstListId }
}
