import { env } from './env'

export const APP_CONFIG = {
  timezone: 'Europe/Rome',
  
  booking: {
    minHour: 8,
    maxHour: 20,
    slotDurationMinutes: 30,
  },
  
  reminders: {
    minutesBefore: 60,
    cronWindowMinutes: 10,
  },
  
  rateLimit: {
    bookings: {
      maxRequests: 10,
      windowMs: 60 * 1000,
    },
    login: {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    },
  },
} as const

export type AppConfig = typeof APP_CONFIG
