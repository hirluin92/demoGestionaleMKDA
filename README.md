# Hugemass - Sistema di Prenotazioni

Sistema di gestione prenotazioni per studio di personal training.

## Funzionalità

- ✅ Login clienti
- ✅ Dashboard con pacchetti e sessioni residue
- ✅ Prenotazioni integrate con Google Calendar
- ✅ Scalamento automatico sessioni (1 prenotazione = 1 sessione)
- ✅ Notifiche WhatsApp (conferma e promemoria)
- ✅ Area admin per gestione clienti e pacchetti
- ✅ Blocco prenotazioni se sessioni terminate
- ✅ Protezione route e validazioni

## Setup Completo

### 1. Installazione Dipendenze

```bash
npm install
```

### 2. Configurazione Database

Crea un database PostgreSQL e configura la variabile `DATABASE_URL` nel file `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/hugemass?schema=public"
```

Poi esegui:

```bash
npm run db:generate
npm run db:push
```

### 3. Configurazione Autenticazione

Genera un secret per NextAuth:

```bash
openssl rand -base64 32
```

Aggiungi al file `.env`:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="il-secret-generato"
```

### 4. Creazione Account Admin

```bash
npm run seed:admin
```

Oppure imposta manualmente nel file `.env`:

```env
ADMIN_EMAIL="admin@hugemass.com"
ADMIN_PASSWORD="tua-password-sicura"
```

### 5. Configurazione Google Calendar

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita **Google Calendar API**
4. Crea credenziali **OAuth 2.0 Client ID**
5. Configura redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Ottieni `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
7. Usa il flow OAuth per ottenere `access_token` e `refresh_token`
8. Aggiungi al file `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALENDAR_ID="primary"  # o l'ID del tuo calendario
```

9. Esegui lo script di setup:

```bash
GOOGLE_ACCESS_TOKEN="your-access-token" GOOGLE_REFRESH_TOKEN="your-refresh-token" npm run setup:calendar
```

### 6. Configurazione Twilio (WhatsApp)

1. Crea un account su [Twilio](https://www.twilio.com/)
2. Ottieni `TWILIO_ACCOUNT_SID` e `TWILIO_AUTH_TOKEN`
3. Configura un numero WhatsApp (Twilio Sandbox o numero verificato)
4. Aggiungi al file `.env`:

```env
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"  # Il tuo numero Twilio
```

### 7. Configurazione Cron Job per Promemoria

Per inviare automaticamente i promemoria 1 ora prima delle prenotazioni, configura un cron job che chiami:

```
GET https://tuo-dominio.com/api/reminders
Authorization: Bearer YOUR_CRON_SECRET
```

Aggiungi al file `.env`:

```env
CRON_SECRET="un-secret-sicuro-per-il-cron"
```

Esempio cron job (ogni 5 minuti):

```bash
*/5 * * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://tuo-dominio.com/api/reminders
```

Oppure usa servizi come:
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [EasyCron](https://www.easycron.com/)
- [Cron-job.org](https://cron-job.org/)

### 8. Avvio Applicazione

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## Struttura Progetto

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/            # Area admin
│   ├── dashboard/        # Dashboard cliente
│   └── login/           # Pagina login
├── components/           # Componenti React
├── lib/                  # Utilities e configurazioni
├── prisma/               # Schema database
└── scripts/              # Script di setup
```

## Tecnologie

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Type safety
- **Prisma** - ORM per database
- **PostgreSQL** - Database relazionale
- **NextAuth.js** - Autenticazione
- **Google Calendar API** - Integrazione calendario
- **Twilio** - Notifiche WhatsApp
- **Tailwind CSS** - Styling

## Testing

Il progetto include una suite di test per garantire la qualità del codice.

### Eseguire i Test
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Coverage

Il progetto include test per:

- ✅ **Environment variables validation** - Verifica configurazione corretta
- ✅ **Error type guards** - Assicura error handling robusto
- ✅ **Booking flow integration** - Testa il flusso critico di prenotazione
- ✅ **Database queries** - Verifica performance con indici
- ✅ **Configuration** - Valida configurazione applicazione
- ✅ **Logger** - Testa logging in diversi ambienti
- ✅ **Error Boundary** - Verifica gestione errori UI
- ✅ **Health check API** - Verifica stato servizi

### Test Files
```
tests/
├── env.test.ts                      # Environment validation
├── errors.test.ts                   # Type guards
├── booking-flow.test.ts             # Integration test critico
├── database-performance.test.ts     # Query performance
├── config.test.ts                   # Configuration
├── logger.test.ts                   # Logging
├── api/
│   └── health.test.ts              # Health check endpoint
└── components/
    └── ErrorBoundary.test.tsx      # Error boundary component
```

## Funzionalità Dettagliate

### Per i Clienti

- Login sicuro con email e password
- Visualizzazione pacchetti attivi e sessioni residue
- Prenotazione sessioni con selezione data e orario
- Visualizzazione prenotazioni future e passate
- Cancellazione prenotazioni (con restituzione sessione)
- Blocco automatico se sessioni terminate

### Per l'Admin

- Gestione clienti (creazione, visualizzazione)
- Gestione pacchetti (creazione, assegnazione)
- Visualizzazione statistiche e prenotazioni

### Automazioni

- **Scalamento sessioni**: Ogni prenotazione scala automaticamente 1 sessione
- **Conferma WhatsApp**: Invio automatico alla creazione prenotazione
- **Promemoria WhatsApp**: Invio automatico 1 ora prima (via cron job)
- **Google Calendar**: Sincronizzazione automatica eventi

## Deployment

### Vercel (Consigliato)

1. Push del codice su GitHub
2. Importa il progetto su Vercel
3. Configura le variabili d'ambiente
4. Configura il database (usa Vercel Postgres o esterno)
5. Configura cron job per promemoria

### Altri Provider

Il progetto può essere deployato su qualsiasi provider che supporta Next.js:
- Railway
- Render
- AWS
- DigitalOcean

## Note Importanti

- Assicurati che il database sia sempre accessibile
- Configura correttamente le variabili d'ambiente in produzione
- Testa le integrazioni Google Calendar e Twilio prima del deploy
- Configura il cron job per i promemoria
- Cambia le password di default in produzione
