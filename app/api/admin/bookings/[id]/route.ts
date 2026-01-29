import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteCalendarEvent } from '@/lib/google-calendar'

// Forza rendering dinamico (usa headers per autenticazione)
export const dynamic = 'force-dynamic'

// DELETE - Disdici prenotazione (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // STEP 1: Prendi booking info PRIMA della transazione
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        status: 'CONFIRMED',
      },
      include: {
        package: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Prenotazione non trovata o già cancellata' },
        { status: 404 }
      )
    }

    // STEP 2: Cancella Google Calendar event PRIMA della transazione
    if (booking.googleEventId) {
      try {
        await deleteCalendarEvent(booking.googleEventId)
      } catch (error) {
        console.error('⚠️ Errore cancellazione evento Google Calendar:', error)
        // Continua comunque - meglio cancellare la prenotazione
      }
    }

    // STEP 3: Transazione atomica per DB
    await prisma.$transaction(async (tx) => {
      // Aggiorna prenotazione
      await tx.booking.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      })

      // Restituisci sessione
      await tx.package.update({
        where: { id: booking.packageId },
        data: {
          usedSessions: {
            decrement: 1,
          },
        },
      })
    })

    console.log('✅ Prenotazione disdetta con successo:', params.id)
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Errore disdetta prenotazione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
