import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Carica variabili d'ambiente dal file .env
config()

const prisma = new PrismaClient()

/**
 * Script per configurare Google Calendar nel database
 * 
 * Dopo aver ottenuto i token OAuth da Google, esegui questo script
 * per salvarli nel database.
 * 
 * Per ottenere i token:
 * 1. Vai su https://console.cloud.google.com/
 * 2. Crea un progetto o seleziona uno esistente
 * 3. Abilita Google Calendar API
 * 4. Crea credenziali OAuth 2.0
 * 5. Usa il flow OAuth per ottenere access_token e refresh_token
 */

async function main() {
  const accessToken = process.env.GOOGLE_ACCESS_TOKEN
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

  if (!accessToken || !refreshToken) {
    console.error('❌ GOOGLE_ACCESS_TOKEN e GOOGLE_REFRESH_TOKEN sono richiesti')
    console.log('\nPer ottenere i token:')
    console.log('1. Vai su https://console.cloud.google.com/')
    console.log('2. Crea un progetto e abilita Google Calendar API')
    console.log('3. Crea credenziali OAuth 2.0')
    console.log('4. Usa il flow OAuth per ottenere i token')
    process.exit(1)
  }

  // Calcola expiry date (i token OAuth durano tipicamente 1 ora)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1)

  const calendar = await prisma.googleCalendar.upsert({
    where: { calendarId },
    update: {
      accessToken,
      refreshToken,
      expiresAt,
    },
    create: {
      calendarId,
      accessToken,
      refreshToken,
      expiresAt,
    },
  })

  console.log('✅ Google Calendar configurato con successo!')
  console.log(`Calendar ID: ${calendar.calendarId}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
