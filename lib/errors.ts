import { z } from 'zod'

// Twilio Error
export interface TwilioError extends Error {
  code: number
  status?: number
  moreInfo?: string
}

export function isTwilioError(error: unknown): error is TwilioError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'number'
  )
}

// Google Calendar Error
export interface GoogleCalendarError extends Error {
  code?: number
  response?: {
    data?: {
      error?: string
    }
  }
}

export function isGoogleCalendarError(error: unknown): error is GoogleCalendarError {
  return (
    error instanceof Error &&
    ('code' in error || 'response' in error)
  )
}

// Prisma Error
export interface PrismaError extends Error {
  code: string
  meta?: {
    target?: string[]
    cause?: string
  }
}

export function isPrismaError(error: unknown): error is PrismaError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string' &&
    (error as any).code.startsWith('P')
  )
}

// Zod Error helper
export function getZodErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
  }
  return 'Errore di validazione'
}
