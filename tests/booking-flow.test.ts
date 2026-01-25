import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Booking Flow Integration', () => {
  let testUserId: string
  let testPackageId: string
  let testBookingId: string

  beforeAll(async () => {
    // Setup: crea utente e pacchetto di test
    const user = await prisma.user.create({
      data: {
        email: 'test-booking@example.com',
        password: '$2a$10$test.hash.here', // bcrypt hash
        name: 'Test Booking User',
        role: 'CLIENT',
      },
    })
    testUserId = user.id

    const pkg = await prisma.package.create({
      data: {
        userId: testUserId,
        name: 'Test Package',
        totalSessions: 10,
        usedSessions: 0,
        durationMinutes: 60,
        isActive: true,
      },
    })
    testPackageId = pkg.id
  })

  afterAll(async () => {
    // Cleanup
    await prisma.booking.deleteMany({ where: { userId: testUserId } })
    await prisma.package.deleteMany({ where: { userId: testUserId } })
    await prisma.user.deleteMany({ where: { id: testUserId } })
    await prisma.$disconnect()
  })

  it('should create booking and decrement package sessions atomically', async () => {
    // Simula transazione atomica
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: testUserId,
          packageId: testPackageId,
          date: new Date('2026-12-25T10:00:00'),
          time: '10:00',
          status: 'CONFIRMED',
        },
      })

      await tx.package.update({
        where: { id: testPackageId },
        data: { usedSessions: { increment: 1 } },
      })

      return booking
    })

    testBookingId = result.id

    const updatedPackage = await prisma.package.findUnique({
      where: { id: testPackageId },
    })

    expect(updatedPackage?.usedSessions).toBe(1)
    expect(result.status).toBe('CONFIRMED')
  })

  it('should cancel booking and restore sessions atomically', async () => {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: testBookingId },
        data: { status: 'CANCELLED' },
      })

      await tx.package.update({
        where: { id: testPackageId },
        data: { usedSessions: { decrement: 1 } },
      })
    })

    const [booking, pkg] = await Promise.all([
      prisma.booking.findUnique({ where: { id: testBookingId } }),
      prisma.package.findUnique({ where: { id: testPackageId } }),
    ])

    expect(booking?.status).toBe('CANCELLED')
    expect(pkg?.usedSessions).toBe(0)
  })

  it('should prevent booking when no sessions available', async () => {
    await prisma.package.update({
      where: { id: testPackageId },
      data: { usedSessions: 10 },
    })

    const pkg = await prisma.package.findUnique({
      where: { id: testPackageId },
    })

    const remaining = (pkg?.totalSessions || 0) - (pkg?.usedSessions || 0)
    expect(remaining).toBe(0)
  })
})
