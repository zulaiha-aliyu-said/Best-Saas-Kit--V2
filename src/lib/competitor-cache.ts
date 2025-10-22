/**
 * Simple in-memory cache for competitor data
 * Helps reduce API calls to RapidAPI and respect rate limits
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CompetitorCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 7 * 24 * 60 * 60 * 1000) {
    // Default: 7 days
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(platform: string, identifier: string): string {
    return `${platform}:${identifier}`.toLowerCase();
  }

  /**
   * Set cache entry
   */
  set<T>(platform: string, identifier: string, data: T, ttl?: number): void {
    const key = this.getCacheKey(platform, identifier);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(platform: string, identifier: string): T | null {
    const key = this.getCacheKey(platform, identifier);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if cache has valid entry
   */
  has(platform: string, identifier: string): boolean {
    return this.get(platform, identifier) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(platform: string, identifier: string): boolean {
    const key = this.getCacheKey(platform, identifier);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Export singleton instance
export const competitorCache = new CompetitorCache();

// Run cleanup every hour
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(() => {
    competitorCache.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}


