import { createClient, RedisClientType } from 'redis'

type CacheEntry = { value: any; expiresAt: number }

class MemoryCache {
  store: Map<string, CacheEntry>
  ttl: number
  constructor(ttlSeconds: number) {
    this.store = new Map()
    this.ttl = ttlSeconds
  }
  async get(key: string) {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }
  async set(key: string, value: any) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttl * 1000 })
  }
}

export class Cache {
  redis: RedisClientType | null
  memory: MemoryCache
  ttl: number
  constructor() {
    this.ttl = Number(process.env.CACHE_TTL_SECONDS || 300)
    this.memory = new MemoryCache(this.ttl)
    const url = process.env.REDIS_URL
    this.redis = url ? createClient({ url }) : null
  }
  async connect() {
    if (this.redis) await this.redis.connect()
  }
  async disconnect() {
    if (this.redis) await this.redis.disconnect()
  }
  async get(key: string) {
    if (this.redis) {
      const raw = await this.redis.get(key)
      return raw ? JSON.parse(raw) : null
    }
    return this.memory.get(key)
  }
  async set(key: string, value: any) {
    if (this.redis) {
      await this.redis.set(key, JSON.stringify(value), { EX: this.ttl })
      return
    }
    await this.memory.set(key, value)
  }
  async status() {
    if (!this.redis) return { redis: false }
    try {
      await this.redis.ping()
      return { redis: true }
    } catch {
      return { redis: false }
    }
  }
}