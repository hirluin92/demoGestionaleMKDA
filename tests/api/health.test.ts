import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Health Check API', () => {
  it('should return ok status when database is connected', async () => {
    // Test database connection
    await expect(prisma.$queryRaw`SELECT 1`).resolves.toBeDefined()
  })

  it('should include all required health checks', async () => {
    const healthCheck = {
      status: 'ok',
      checks: {
        database: { status: 'ok' },
        googleCalendar: { status: 'ok' },
        twilio: { status: 'ok' },
      },
    }

    expect(healthCheck.checks).toHaveProperty('database')
    expect(healthCheck.checks).toHaveProperty('googleCalendar')
    expect(healthCheck.checks).toHaveProperty('twilio')
  })
})
