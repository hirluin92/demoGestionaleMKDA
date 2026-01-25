import { describe, it, expect } from 'vitest'

describe('Environment Variables', () => {
  it('should have required variables in test environment', () => {
    expect(process.env.DATABASE_URL).toBeDefined()
    expect(process.env.NEXTAUTH_URL).toBeDefined()
    expect(process.env.NEXTAUTH_SECRET).toBeDefined()
  })
  
  it('NEXTAUTH_SECRET should be at least 32 characters', () => {
    const secret = process.env.NEXTAUTH_SECRET
    if (secret) {
      expect(secret.length).toBeGreaterThanOrEqual(32)
    }
  })
})
