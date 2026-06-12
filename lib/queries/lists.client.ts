/**
 * Client-safe list query functions with in-memory caching.
 *
 * We do NOT use the browser Supabase client here because RLS policies
 * rely on current_setting('app.clerk_id') which is never set in the
 * browser context. Instead, we wrap the server actions from lists.ts.
 */

import { listsCache } from '@/lib/cache/listsCache'
import {
  getBrandLists as getBrandListsServer,
  getBrandListsWithFirstInfluencers as getBrandListsWithFirstInfluencersServer,
  createBrandList as createBrandListServer,
  deleteBrandList as deleteBrandListServer,
  addInfluencerToList as addInfluencerToListServer,
  removeInfluencerFromList as removeInfluencerFromListServer,
} from './lists'

// Re-export unaltered getters
export { getListsContainingInfluencer, getInfluencersInList } from './lists'
export type { Database } from '@/types/supabase'

// ─── CACHED FETCHERS ──────────────────────────────────────────────────

export async function getBrandLists(clerkId: string) {
  const cacheKey = `lists:${clerkId}`
  const cached = listsCache.get<any[]>(cacheKey)

  if (cached) {
    if (process.env.NODE_ENV === 'development') console.log('[listsCache] HIT for', cacheKey)
    return cached
  }

  if (process.env.NODE_ENV === 'development') console.log('[listsCache] MISS for', cacheKey)
  // Call the server action instead of browser client!
  const result = await getBrandListsServer(clerkId)

  listsCache.set(cacheKey, result, 30_000) // 30 second TTL
  return result
}

export async function getBrandListsWithFirstInfluencers(clerkId: string) {
  const cacheKey = `lists_with_first:${clerkId}`
  const cached = listsCache.get<any>(cacheKey)

  if (cached) {
    if (process.env.NODE_ENV === 'development') console.log('[listsCache] HIT for', cacheKey)
    return cached
  }

  if (process.env.NODE_ENV === 'development') console.log('[listsCache] MISS for', cacheKey)
  const result = await getBrandListsWithFirstInfluencersServer(clerkId)

  // Cache both the combined result AND the plain lists result!
  listsCache.set(cacheKey, result, 30_000)
  listsCache.set(`lists:${clerkId}`, result.lists, 30_000)
  
  return result
}

// ─── CACHE-BUSTING MUTATORS ────────────────────────────────────────────

export async function createBrandList(...args: Parameters<typeof createBrandListServer>) {
  const result = await createBrandListServer(...args)
  listsCache.invalidatePrefix('lists')
  return result
}

export async function deleteBrandList(...args: Parameters<typeof deleteBrandListServer>) {
  const result = await deleteBrandListServer(...args)
  listsCache.invalidatePrefix('lists')
  return result
}

export async function addInfluencerToList(...args: Parameters<typeof addInfluencerToListServer>) {
  const result = await addInfluencerToListServer(...args)
  listsCache.invalidatePrefix('lists')
  return result
}

export async function removeInfluencerFromList(...args: Parameters<typeof removeInfluencerFromListServer>) {
  const result = await removeInfluencerFromListServer(...args)
  listsCache.invalidatePrefix('lists')
  return result
}
