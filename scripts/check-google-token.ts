import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { google } from 'googleapis'

config()

const prisma = new PrismaClient()

/**
 * Script per verificare lo stato del token Google Calendar
 * 
 * Controlla:
 * 1. Se il token esiste nel database
 * 2. Se il token è scaduto
 * 3. Se il token è valido (test chiamata API)
 * 4. Se il refresh token funziona
 */

async function main() {
  console.log('🔍 Verifica token Google Calendar...\n')

  // STEP 1: Verifica configurazione nel database
  const calendarConfig = await prisma.googleCalendar.findFirst()
  
  if (!calendarConfig) {
    console.error('❌ Google Calendar non configurato nel database')
    console.log('\n💡 Esegui: npm run setup:calendar')
    process.exit(1)
  }

  console.log('✅ Configurazione trovata nel database')
  console.log(`   Calendar ID: ${calendarConfig.calendarId}`)
  console.log(`   Creato: ${calendarConfig.createdAt.toLocaleString('it-IT')}`)
  console.log(`   Aggiornato: ${calendarConfig.updatedAt.toLocaleString('it-IT')}\n`)

  // STEP 2: Verifica variabili d'ambiente
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  if (!clientId || !clientSecret) {
    console.error('❌ GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET mancanti nel .env')
    process.exit(1)
  }

  console.log('✅ Variabili d\'ambiente configurate')
  console.log(`   Client ID: ${clientId.substring(0, 20)}...`)
  console.log(`   Calendar ID: ${calendarId || 'primary'}\n`)

  // STEP 3: Verifica scadenza token
  const now = new Date()
  const expiresAt = calendarConfig.expiresAt
  const isExpired = now >= expiresAt
  const minutesUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / 1000 / 60)

  console.log('📅 Stato token:')
  console.log(`   Scade: ${expiresAt.toLocaleString('it-IT')}`)
  
  if (isExpired) {
    console.log(`   ⚠️  Token SCADUTO (${Math.abs(minutesUntilExpiry)} minuti fa)`)
  } else {
    console.log(`   ✅ Token valido (scade tra ${minutesUntilExpiry} minuti)`)
  }
  console.log()

  // STEP 4: Test chiamata API con token corrente
  console.log('🧪 Test chiamata API Google Calendar...')
  
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret
  )

  oauth2Client.setCredentials({
    access_token: calendarConfig.accessToken,
    refresh_token: calendarConfig.refreshToken,
    expiry_date: expiresAt.getTime(),
  })

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    // Prova a recuperare il calendario (chiamata semplice)
    const calendarResponse = await calendar.calendars.get({
      calendarId: calendarId || 'primary',
    })

    console.log('✅ Token valido! Chiamata API riuscita')
    console.log(`   Nome calendario: ${calendarResponse.data.summary || 'N/A'}`)
    console.log(`   Timezone: ${calendarResponse.data.timeZone || 'N/A'}\n`)

    // Prova a recuperare eventi recenti
    const eventsResponse = await calendar.events.list({
      calendarId: calendarId || 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    })

    console.log(`📅 Eventi futuri trovati: ${eventsResponse.data.items?.length || 0}\n`)

  } catch (error: any) {
    console.error('❌ Errore chiamata API:', error.message)
    
    if (error.code === 401) {
      console.error('   🔴 Token non autorizzato (scaduto o revocato)')
    } else if (error.code === 403) {
      console.error('   🔴 Accesso negato (permessi insufficienti)')
    } else if (error.code === 404) {
      console.error('   🔴 Calendario non trovato')
    }

    console.log()

    // STEP 5: Prova refresh token
    if (calendarConfig.refreshToken) {
      console.log('🔄 Tentativo refresh token...')
      
      try {
        const { credentials } = await oauth2Client.refreshAccessToken()
        
        if (credentials.access_token) {
          console.log('✅ Refresh token riuscito!')
          console.log(`   Nuovo access token: ${credentials.access_token.substring(0, 20)}...`)
          
          const newExpiryDate = credentials.expiry_date 
            ? new Date(credentials.expiry_date)
            : new Date(Date.now() + 3600 * 1000)
          
          console.log(`   Nuova scadenza: ${newExpiryDate.toLocaleString('it-IT')}`)
          
          // Aggiorna nel database
          await prisma.googleCalendar.update({
            where: { id: calendarConfig.id },
            data: {
              accessToken: credentials.access_token,
              refreshToken: credentials.refresh_token || calendarConfig.refreshToken,
              expiresAt: newExpiryDate,
            },
          })
          
          console.log('✅ Token aggiornato nel database\n')
        }
      } catch (refreshError: any) {
        console.error('❌ Errore refresh token:', refreshError.message)
        
        if (refreshError?.response?.data?.error === 'invalid_grant') {
          console.error('\n🔴 REFRESH TOKEN SCADUTO O REVOCATO!')
          console.error('   Devi riconfigurare Google Calendar:')
          console.error('   1. Ottieni nuovi token OAuth')
          console.error('   2. Esegui: npm run setup:calendar')
        }
      }
    } else {
      console.error('❌ Refresh token non disponibile')
    }
  }

  console.log('\n📊 Riepilogo:')
  console.log('   - Configurazione database: ✅')
  console.log('   - Variabili d\'ambiente: ✅')
  console.log('   - Token access: ' + (isExpired ? '⚠️  Scaduto' : '✅ Valido'))
  console.log('   - Refresh token: ' + (calendarConfig.refreshToken ? '✅ Presente' : '❌ Mancante'))
}

main()
  .catch((e) => {
    console.error('❌ Errore:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
