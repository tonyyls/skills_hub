import crypto from 'node:crypto'

type CacheEntry = { data: any, expiresAt: number }
const memoryCache = new Map<string, CacheEntry>()

export function getCached<T = any>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCached(key: string, data: any, ttlMs = 600_000): void {
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function flushCache(key?: string): void {
  if (!key) memoryCache.clear()
  else memoryCache.delete(key)
}

export function etagOf(obj: unknown): string {
  const s = JSON.stringify(obj ?? {})
  return crypto.createHash('sha1').update(s).digest('hex')
}