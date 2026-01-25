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

import { APP_CONFIG } from './config'

// Rate limiter per API bookings
export const bookingRateLimiter = new InMemoryRateLimiter({
  windowMs: APP_CONFIG.rateLimit.bookings.windowMs,
  maxRequests: APP_CONFIG.rateLimit.bookings.maxRequests
})

// Rate limiter per login
export const loginRateLimiter = new InMemoryRateLimiter({
  windowMs: APP_CONFIG.rateLimit.login.windowMs,
  maxRequests: APP_CONFIG.rateLimit.login.maxRequests
})
