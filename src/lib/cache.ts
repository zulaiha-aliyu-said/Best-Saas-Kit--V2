// Simple in-memory cache for API responses
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map()

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    const isExpired = Date.now() - item.timestamp > item.ttl
    
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Export singleton instance
export const cache = new SimpleCache()

// Cleanup expired items every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}

// Cache wrapper function for API calls
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60000
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // If not in cache, fetch and store
  const data = await fetcher()
  cache.set(key, data, ttl)
  return data
}

// React Query-style cache invalidation
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }

  // If pattern provided, delete matching keys
  // For now, we'll just clear all - can be enhanced with regex matching
  cache.clear()
}




