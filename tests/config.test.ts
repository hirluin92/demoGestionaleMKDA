import { describe, it, expect } from 'vitest'
import { APP_CONFIG } from '@/lib/config'

describe('Application Configuration', () => {
  it('should have valid timezone', () => {
    expect(APP_CONFIG.timezone).toBe('Europe/Rome')
  })

  it('should have valid booking hours', () => {
    expect(APP_CONFIG.booking.minHour).toBe(8)
    expect(APP_CONFIG.booking.maxHour).toBe(20)
    expect(APP_CONFIG.booking.minHour).toBeLessThan(APP_CONFIG.booking.maxHour)
  })

  it('should have valid slot duration', () => {
    expect(APP_CONFIG.booking.slotDurationMinutes).toBe(30)
    expect(APP_CONFIG.booking.slotDurationMinutes).toBeGreaterThan(0)
  })

  it('should have valid reminder settings', () => {
    expect(APP_CONFIG.reminders.minutesBefore).toBe(60)
    expect(APP_CONFIG.reminders.cronWindowMinutes).toBe(10)
  })

  it('should have valid rate limit settings', () => {
    expect(APP_CONFIG.rateLimit.bookings.maxRequests).toBeGreaterThan(0)
    expect(APP_CONFIG.rateLimit.bookings.windowMs).toBeGreaterThan(0)
    expect(APP_CONFIG.rateLimit.login.maxRequests).toBeGreaterThan(0)
    expect(APP_CONFIG.rateLimit.login.windowMs).toBeGreaterThan(0)
  })
})
