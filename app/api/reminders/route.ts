import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage, formatBookingReminderMessage } from '@/lib/whatsapp'

// API route per inviare promemoria (da chiamare con cron job)
export async function GET(request: NextRequest) {
  try {
    // Verifica autorizzazione
    // Per Vercel: il cron job è automaticamente autorizzato
    // Per servizi esterni: usa CRON_SECRET nell'header Authorization
    const authHeader = request.headers.get('authorization')
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    
    // Se non è Vercel Cron, verifica CRON_SECRET
    if (!isVercelCron) {
      if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
      }
    }

    // Trova prenotazioni tra 55 e 65 minuti da ora
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const fiveMinutesBefore = new Date(now.getTime() + 55 * 60 * 1000)
    const fiveMinutesAfter = new Date(now.getTime() + 65 * 60 * 1000)

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        reminderSent: false,
        date: {
          gte: fiveMinutesBefore,
          lte: fiveMinutesAfter,
        },
      },
      include: {
        user: true,
      },
    })

    const results = []

    for (const booking of bookings) {
      if (!booking.user.phone) {
        continue
      }

      try {
        await sendWhatsAppMessage(
          booking.user.phone,
          formatBookingReminderMessage(
            booking.user.name,
            booking.date,
            booking.time
          )
        )

        // Segna come inviato
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        })

        results.push({ bookingId: booking.id, status: 'sent' })
      } catch (error) {
        console.error(`Errore invio promemoria per prenotazione ${booking.id}:`, error)
        results.push({ bookingId: booking.id, status: 'error', error: String(error) })
      }
    }

    return NextResponse.json({
      processed: bookings.length,
      results,
    })
  } catch (error) {
    console.error('Errore processo promemoria:', error)
    return NextResponse.json(
      { error: 'Errore nel processo promemoria' },
      { status: 500 }
    )
  }
}
