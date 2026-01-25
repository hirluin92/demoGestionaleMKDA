import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { sendWhatsAppMessage } from '../lib/whatsapp'

config()

const prisma = new PrismaClient()

/**
 * Script per verificare e testare l'invio WhatsApp a un utente specifico
 * 
 * Uso: tsx scripts/check-whatsapp-user.ts <email-utente>
 */

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Uso: tsx scripts/check-whatsapp-user.ts <email-utente>')
    console.log('\nEsempio:')
    console.log('  tsx scripts/check-whatsapp-user.ts user@example.com')
    process.exit(1)
  }

  console.log(`🔍 Verifica utente: ${email}\n`)

  // Trova utente
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  })

  if (!user) {
    console.error(`❌ Utente con email ${email} non trovato`)
    process.exit(1)
  }

  console.log('✅ Utente trovato:')
  console.log(`   Nome: ${user.name}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Telefono: ${user.phone || '❌ NON IMPOSTATO'}\n`)

  if (!user.phone) {
    console.error('❌ L\'utente non ha un numero di telefono configurato!')
    console.log('\n💡 Soluzione:')
    console.log('   1. Vai nell\'area admin')
    console.log('   2. Modifica l\'utente e aggiungi il numero di telefono')
    console.log('   3. Usa il formato: +39XXXXXXXXXX (es: +393339406945)')
    process.exit(1)
  }

  // Verifica formato numero
  console.log('📱 Verifica formato numero:')
  console.log(`   Originale: ${user.phone}`)
  
  // Test normalizzazione (simula quella in lib/whatsapp.ts)
  function normalizePhoneNumber(phone: string): string {
    let normalized = phone.replace(/\s+/g, '').replace(/[-\/]/g, '')
    
    if (normalized.startsWith('0')) {
      normalized = '+39' + normalized.substring(1)
    } else if (normalized.startsWith('39')) {
      normalized = '+' + normalized
    } else if (!normalized.startsWith('+')) {
      normalized = '+39' + normalized
    }
    
    return normalized
  }

  const normalized = normalizePhoneNumber(user.phone)
  console.log(`   Normalizzato: ${normalized}`)

  // Verifica formato Twilio
  if (!normalized.match(/^\+\d{10,15}$/)) {
    console.error(`\n❌ Formato numero non valido per Twilio!`)
    console.log('   Il numero deve essere in formato internazionale: +[prefisso][numero]')
    console.log('   Esempio valido: +393339406945')
    process.exit(1)
  }

  console.log('   ✅ Formato valido\n')

  // Test invio (opzionale)
  const args = process.argv.slice(3)
  const shouldTest = args.includes('--test') || args.includes('-t')

  if (shouldTest) {
    console.log('🧪 Test invio WhatsApp...\n')
    
    try {
      const testMessage = `🧪 Test WhatsApp Hugemass\n\nCiao ${user.name},\n\nQuesto è un messaggio di test per verificare che il tuo numero funzioni correttamente.\n\nSe ricevi questo messaggio, tutto è configurato correttamente! ✅`
      
      await sendWhatsAppMessage(user.phone, testMessage)
      
      console.log('✅ Messaggio di test inviato con successo!')
      console.log(`   Verifica il telefono ${normalized} su WhatsApp\n`)
    } catch (error: any) {
      console.error('❌ Errore invio messaggio di test:', error.message)
      
      if (error.code === 21211) {
        console.error('\n🔴 ERRORE: Numero non valido per Twilio')
        console.error('   Possibili cause:')
        console.error('   - Il numero non è registrato su WhatsApp')
        console.error('   - Il numero non è nel formato corretto')
        console.error('   - Il numero non è autorizzato per Twilio Sandbox')
      } else if (error.code === 21608) {
        console.error('\n🔴 ERRORE: Numero non autorizzato per Twilio Sandbox')
        console.error('   Soluzione:')
        console.error('   1. Vai su Twilio Console')
        console.error('   2. Vai su Messaging > Try it out > Send a WhatsApp message')
        console.error('   3. Invia il codice al numero WhatsApp di Twilio')
        console.error('   4. Aggiungi questo numero alla lista dei numeri autorizzati')
      } else {
        console.error('\n🔴 ERRORE:', error)
      }
      
      process.exit(1)
    }
  } else {
    console.log('💡 Per testare l\'invio, esegui:')
    console.log(`   tsx scripts/check-whatsapp-user.ts ${email} --test\n`)
  }

  // Mostra prenotazioni recenti
  const recentBookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: 'CONFIRMED',
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
    select: {
      id: true,
      date: true,
      time: true,
      createdAt: true,
    },
  })

  if (recentBookings.length > 0) {
    console.log('📅 Ultime prenotazioni:')
    recentBookings.forEach((booking, index) => {
      const date = new Date(booking.date)
      console.log(`   ${index + 1}. ${date.toLocaleDateString('it-IT')} ${booking.time}`)
    })
    console.log()
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
