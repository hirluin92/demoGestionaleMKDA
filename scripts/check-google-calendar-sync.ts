import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { checkEventExists, createCalendarEvent } from '../lib/google-calendar'

config()

const prisma = new PrismaClient()

/**
 * Script per verificare la sincronizzazione tra database e Google Calendar
 * 
 * Controlla tutte le prenotazioni confermate e verifica se:
 * 1. Hanno un googleEventId ma l'evento non esiste più su Google Calendar
 * 2. Non hanno un googleEventId ma dovrebbero averlo
 * 
 * Opzionalmente, può ricreare eventi mancanti.
 */

async function main() {
  console.log('🔍 Verifica sincronizzazione Google Calendar...\n')

  // Trova tutte le prenotazioni confermate
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
    },
    include: {
      user: true,
      package: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  console.log(`📊 Trovate ${bookings.length} prenotazioni confermate\n`)

  const issues: Array<{
    bookingId: string
    date: Date
    time: string
    userName: string
    issue: string
    googleEventId?: string | null
  }> = []

  // Verifica ogni prenotazione
  for (const booking of bookings) {
    if (booking.googleEventId) {
      // Verifica se l'evento esiste ancora su Google Calendar
      const exists = await checkEventExists(booking.googleEventId)
      if (!exists) {
        issues.push({
          bookingId: booking.id,
          date: booking.date,
          time: booking.time,
          userName: booking.user.name,
          issue: 'Evento Google Calendar mancante',
          googleEventId: booking.googleEventId,
        })
      }
    } else {
      // Prenotazione senza googleEventId (potrebbe essere stata creata quando Google Calendar era down)
      issues.push({
        bookingId: booking.id,
        date: booking.date,
        time: booking.time,
        userName: booking.user.name,
        issue: 'Manca googleEventId',
        googleEventId: null,
      })
    }
  }

  // Mostra risultati
  if (issues.length === 0) {
    console.log('✅ Tutte le prenotazioni sono sincronizzate con Google Calendar!\n')
  } else {
    console.log(`⚠️ Trovati ${issues.length} problemi:\n`)
    
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.userName} - ${issue.date.toLocaleDateString('it-IT')} ${issue.time}`)
      console.log(`   Problema: ${issue.issue}`)
      if (issue.googleEventId) {
        console.log(`   googleEventId: ${issue.googleEventId}`)
      }
      console.log(`   bookingId: ${issue.bookingId}\n`)
    })

    // Chiedi se vuoi ricreare gli eventi mancanti
    const args = process.argv.slice(2)
    const shouldFix = args.includes('--fix') || args.includes('-f')

    if (shouldFix) {
      console.log('🔧 Ricreazione eventi mancanti...\n')
      
      let fixed = 0
      let errors = 0

      for (const issue of issues) {
        try {
          const booking = await prisma.booking.findUnique({
            where: { id: issue.bookingId },
            include: { user: true, package: true },
          })

          if (!booking) {
            console.error(`❌ Prenotazione ${issue.bookingId} non trovata`)
            errors++
            continue
          }

          // Prepara date per l'evento
          const bookingDate = new Date(booking.date)
          const [hours, minutes] = booking.time.split(':').map(Number)
          bookingDate.setHours(hours, minutes, 0, 0)
          const endDate = new Date(bookingDate)
          endDate.setHours(endDate.getHours() + 1)

          // Crea evento su Google Calendar
          const googleEventId = await createCalendarEvent(
            `Sessione ${booking.user.name}`,
            `Prenotazione Hugemass - Pacchetto: ${booking.package.name}`,
            bookingDate,
            endDate
          )

          // Aggiorna prenotazione con nuovo googleEventId
          await prisma.booking.update({
            where: { id: issue.bookingId },
            data: { googleEventId },
          })

          console.log(`✅ Evento ricreato per ${booking.user.name} - ${bookingDate.toLocaleDateString('it-IT')} ${booking.time}`)
          fixed++
        } catch (error) {
          console.error(`❌ Errore ricreazione evento per ${issue.bookingId}:`, error)
          errors++
        }
      }

      console.log(`\n📊 Risultati:`)
      console.log(`   ✅ Ricreati: ${fixed}`)
      console.log(`   ❌ Errori: ${errors}`)
    } else {
      console.log('\n💡 Per ricreare automaticamente gli eventi mancanti, esegui:')
      console.log('   npm run check:calendar -- --fix')
      console.log('   oppure')
      console.log('   tsx scripts/check-google-calendar-sync.ts --fix\n')
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Errore:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
