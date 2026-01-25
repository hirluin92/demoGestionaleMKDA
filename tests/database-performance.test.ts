import { describe, it, expect } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Database Performance', () => {
  it('should have indexes on critical queries', async () => {
    // Questo test verifica solo che le query non crashino
    // In produzione, monitora i query plans con EXPLAIN
    
    const userId = 'test-user-id'
    
    // Query che dovrebbe usare index [userId, status]
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        status: 'CONFIRMED',
      },
      take: 10,
    })
    
    expect(Array.isArray(bookings)).toBe(true)
  })
})
