import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar'
import { sendWhatsAppMessage, formatBookingConfirmationMessage } from '@/lib/whatsapp'
import { z } from 'zod'

const bookingSchema = z.object({
  date: z.string(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  packageId: z.string(),
})

// GET - Lista prenotazioni utente
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
        status: { not: 'CANCELLED' },
      },
      include: {
        package: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Errore recupero prenotazioni:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero delle prenotazioni' },
      { status: 500 }
    )
  }
}

// POST - Crea nuova prenotazione
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { date, time, packageId } = bookingSchema.parse(body)

    // Verifica che il pacchetto appartenga all'utente
    const packageData = await prisma.package.findFirst({
      where: {
        id: packageId,
        userId: session.user.id,
        isActive: true,
      },
    })

    if (!packageData) {
      return NextResponse.json(
        { error: 'Pacchetto non trovato o non attivo' },
        { status: 404 }
      )
    }

    // Verifica sessioni residue
    const remainingSessions = packageData.totalSessions - packageData.usedSessions
    if (remainingSessions <= 0) {
      return NextResponse.json(
        { error: 'Nessuna sessione disponibile' },
        { status: 400 }
      )
    }

    // Crea date per l'evento
    const bookingDate = new Date(date)
    const [hours, minutes] = time.split(':').map(Number)
    bookingDate.setHours(hours, minutes, 0, 0)

    const endDate = new Date(bookingDate)
    endDate.setHours(endDate.getHours() + 1) // Sessione di 1 ora

    // Crea evento su Google Calendar
    let googleEventId: string | null = null
    try {
      googleEventId = await createCalendarEvent(
        `Sessione ${session.user.name}`,
        `Prenotazione Hugemass - Pacchetto: ${packageData.name}`,
        bookingDate,
        endDate
      )
    } catch (error) {
      console.error('Errore creazione evento Google Calendar:', error)
      // Continua comunque senza Google Calendar
    }

    // Crea prenotazione
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        packageId,
        date: bookingDate,
        time,
        googleEventId,
        status: 'CONFIRMED',
      },
    })

    // Scala una sessione
    await prisma.package.update({
      where: { id: packageId },
      data: {
        usedSessions: {
          increment: 1,
        },
      },
    })

    // Invia WhatsApp di conferma
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.phone) {
      try {
        console.log('Tentativo invio WhatsApp a:', user.phone)
        await sendWhatsAppMessage(
          user.phone,
          formatBookingConfirmationMessage(user.name, bookingDate, time)
        )
        console.log('✅ WhatsApp inviato con successo')
      } catch (error) {
        console.error('❌ Errore invio WhatsApp:', error)
        // Non bloccare la prenotazione se WhatsApp fallisce
      }
    } else {
      console.log('⚠️ Utente senza numero di telefono, WhatsApp non inviato')
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Errore creazione prenotazione:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione della prenotazione' },
      { status: 500 }
    )
  }
}
