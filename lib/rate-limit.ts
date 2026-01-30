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
 * Rate limiter persistente (attualmente usa in-memory)
 * @vercel/kv è deprecato, in futuro si può migrare a @upstash/redis se necessario
 */
class PersistentRateLimiter {
  private fallback: InMemoryRateLimiter
  
  constructor(private config: RateLimitConfig) {
    this.fallback = new InMemoryRateLimiter(config)
  }

  async check(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: Date
  }> {
    // Usa il fallback in-memory (funziona correttamente per il deployment)
    // In futuro, se necessario, si può migrare a @upstash/redis
    return this.fallback.check(identifier)
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
