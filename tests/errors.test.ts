import { describe, it, expect } from 'vitest'
import { isTwilioError, isPrismaError, isGoogleCalendarError } from '@/lib/errors'

describe('Error Type Guards', () => {
  it('should identify Twilio errors', () => {
    const twilioError = { code: 21608, message: 'Not authorized' }
    expect(isTwilioError(twilioError)).toBe(true)
    expect(isTwilioError(new Error('generic'))).toBe(false)
  })
  
  it('should identify Prisma errors', () => {
    const prismaError = { code: 'P2002', message: 'Unique constraint' }
    expect(isPrismaError(prismaError)).toBe(true)
    expect(isPrismaError({ code: 'NOT_PRISMA' })).toBe(false)
  })
  
  it('should identify Google Calendar errors', () => {
    const googleError = new Error('Calendar error')
    ;(googleError as any).code = 404
    expect(isGoogleCalendarError(googleError)).toBe(true)
    expect(isGoogleCalendarError({ message: 'not an error' })).toBe(false)
  })
})
