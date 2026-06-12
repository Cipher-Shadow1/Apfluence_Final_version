// Simple in-memory cache for brand lists
// Avoids re-fetching the same lists data within a short window

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number  // milliseconds
}

class SimpleCache {
  private store = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttlMs = 30_000): void {
    this.store.set(key, { data, timestamp: Date.now(), ttl: ttlMs })
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key)
    }
  }
}

export const listsCache = new SimpleCache()
