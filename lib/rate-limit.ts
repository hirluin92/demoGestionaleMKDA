interface RateLimitConfig {
  windowMs: number  // Finestra temporale in millisecondi
  maxRequests: number  // Max richieste per finestra
}

class InMemoryRateLimiter {
  private requests = new Map<string, number[]>()
  
  constructor(private config: RateLimitConfig) {}

  async check(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: Date
  }> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    // Prendi richieste dell'utente
    const userRequests = this.requests.get(identifier) || []
    
    // Filtra solo quelle nella finestra corrente
    const recentRequests = userRequests.filter(time => time > windowStart)
    
    // Check limite
    if (recentRequests.length >= this.config.maxRequests) {
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        reset: new Date(windowStart + this.config.windowMs)
      }
    }
    
    // Aggiungi nuova richiesta
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    
    // Cleanup vecchie entries (ogni 100 richieste)
    if (this.requests.size > 100) {
      this.cleanup()
    }
    
    return {
      success: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - recentRequests.length,
      reset: new Date(windowStart + this.config.windowMs)
    }
  }
  
  private cleanup() {
    const now = Date.now()
    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > (now - this.config.windowMs))
      if (recentRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, recentRequests)
      }
    }
  }
}

/**
 * Rate limiter persistente usando Vercel KV
 * Fallback a in-memory se KV non è configurato
 */
class PersistentRateLimiter {
  private kv: any = null
  private kvInitialized = false
  private fallback: InMemoryRateLimiter
  
  constructor(private config: RateLimitConfig) {
    this.fallback = new InMemoryRateLimiter(config)
  }

  private async initializeKV() {
    if (this.kvInitialized) return
    
    // Solo server-side
    if (typeof window !== 'undefined') {
      this.kvInitialized = true
      return
    }

    try {
      const { kv } = await import('@vercel/kv')
      const { env } = await import('./env')
      
      if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
        this.kv = kv({
          url: env.KV_REST_API_URL,
          token: env.KV_REST_API_TOKEN,
        })
      }
    } catch (error) {
      // KV non disponibile, usa fallback
      // Non loggare in produzione per evitare spam
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Vercel KV non disponibile, usando rate limiter in-memory')
      }
    } finally {
      this.kvInitialized = true
    }
  }

  async check(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: Date
  }> {
    // Inizializza KV al primo check (lazy initialization)
    await this.initializeKV()
    
    // Se KV non è disponibile, usa fallback
    if (!this.kv) {
      return this.fallback.check(identifier)
    }

    try {
      const now = Date.now()
      const windowStart = now - this.config.windowMs
      const key = `rate_limit:${identifier}`
      
      // Recupera richieste esistenti
      const existingRequests: number[] = await this.kv.get(key) || []
      
      // Filtra solo quelle nella finestra corrente
      const recentRequests = existingRequests.filter((time: number) => time > windowStart)
      
      // Check limite
      if (recentRequests.length >= this.config.maxRequests) {
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          reset: new Date(windowStart + this.config.windowMs)
        }
      }
      
      // Aggiungi nuova richiesta
      recentRequests.push(now)
      
      // Salva in KV con TTL basato sulla finestra temporale
      const ttlSeconds = Math.ceil(this.config.windowMs / 1000)
      await this.kv.set(key, recentRequests, { ex: ttlSeconds })
      
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - recentRequests.length,
        reset: new Date(windowStart + this.config.windowMs)
      }
    } catch (error) {
      // In caso di errore KV, fallback a in-memory
      // Non loggare in produzione per evitare spam
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Errore KV rate limiter, usando fallback in-memory:', error)
      }
      return this.fallback.check(identifier)
    }
  }
}

import { APP_CONFIG } from './config'

// Rate limiter per API bookings (usa KV se disponibile, altrimenti in-memory)
export const bookingRateLimiter = new PersistentRateLimiter({
  windowMs: APP_CONFIG.rateLimit.bookings.windowMs,
  maxRequests: APP_CONFIG.rateLimit.bookings.maxRequests
})

// Rate limiter per login (usa KV se disponibile, altrimenti in-memory)
export const loginRateLimiter = new PersistentRateLimiter({
  windowMs: APP_CONFIG.rateLimit.login.windowMs,
  maxRequests: APP_CONFIG.rateLimit.login.maxRequests
})
