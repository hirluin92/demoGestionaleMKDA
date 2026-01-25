# Guida Setup Completa - Hugemass

Questa guida ti accompagna passo passo nella configurazione completa del sistema.

## 📋 Checklist Pre-Setup

- [ ] Node.js 18+ installato
- [ ] PostgreSQL installato e in esecuzione
- [ ] Account Google Cloud Platform
- [ ] Account Twilio (per WhatsApp)

## 🗄️ 1. Database PostgreSQL

### Opzione A: Database Locale

```bash
# Installa PostgreSQL (se non già installato)
# Windows: scarica da postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Crea database
createdb hugemass

# Oppure via psql
psql -U postgres
CREATE DATABASE hugemass;
\q
```

### Opzione B: Database Cloud (Consigliato per produzione)

- **Supabase**: https://supabase.com (gratuito fino a 500MB)
- **Railway**: https://railway.app
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres

Ottieni la connection string e aggiungila al `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/hugemass?schema=public"
```

## 🔐 2. Autenticazione NextAuth

Genera un secret sicuro:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Aggiungi al `.env`:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="il-secret-generato"
```

## 👤 3. Account Admin

Crea il file `.env` con:

```env
ADMIN_EMAIL="admin@hugemass.com"
ADMIN_PASSWORD="tua-password-sicura"
```

Poi esegui:

```bash
npm run seed:admin
```

## 📅 4. Google Calendar API

### Step 1: Crea Progetto Google Cloud

1. Vai su https://console.cloud.google.com/
2. Clicca su "Seleziona un progetto" → "Nuovo progetto"
3. Nome: "Hugemass Calendar"
4. Clicca "Crea"

### Step 2: Abilita Google Calendar API

1. Nel menu laterale: "API e servizi" → "Libreria"
2. Cerca "Google Calendar API"
3. Clicca "Abilita"

### Step 3: Crea Credenziali OAuth 2.0

1. Vai su "API e servizi" → "Credenziali"
2. Clicca "Crea credenziali" → "ID client OAuth 2.0"
3. Tipo applicazione: "Applicazione web"
4. Nome: "Hugemass Web Client"
5. URI di reindirizzamento autorizzati:
   - `urn:ietf:wg:oauth:2.0:oob` (per ottenere token senza server - USA QUESTO)
   - `http://localhost:3000/api/auth/callback/google` (solo se usi NextAuth con Google)
   - `https://tuo-dominio.com/api/auth/callback/google` (produzione)
6. Clicca "Crea"
7. Copia **ID client** e **Secret client**

**⚠️ IMPORTANTE**: Aggiungi `urn:ietf:wg:oauth:2.0:oob` come redirect URI se vuoi usare lo script `get-google-tokens.js` senza avviare il server!

### Step 4: Ottieni Token OAuth

**⚠️ IMPORTANTE: Per ottenere un refresh token PERMANENTE, devi usare `access_type: 'offline'`!**

**Metodo 1: Script Node.js (CONSIGLIATO - Garantisce refresh token permanente)**

1. Assicurati di avere `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` nel file `.env`
2. Esegui lo script:
   ```bash
   node scripts/get-google-tokens.js
   ```
3. Segui le istruzioni: copia l'URL, autorizza, incolla il codice
4. Lo script ti darà i token da aggiungere al `.env`

**Metodo 2: Google OAuth Playground (Alternativa)**

1. Vai su https://developers.google.com/oauthplayground/
2. In alto a destra, clicca l'icona ⚙️
3. Spunta "Use your own OAuth credentials"
4. Inserisci il tuo Client ID e Client Secret
5. **IMPORTANTE**: Spunta anche "Force approval prompt" (per ottenere sempre il refresh token)
6. Nella lista a sinistra, cerca "Calendar API v3"
7. Seleziona: `https://www.googleapis.com/auth/calendar`
8. Clicca "Authorize APIs"
9. Accedi con il tuo account Google
10. Clicca "Exchange authorization code for tokens"
11. Copia `access_token` e `refresh_token`

**Metodo 2: Script Node.js**

Crea un file `get-google-tokens.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  'TUO_CLIENT_ID',
  'TUO_CLIENT_SECRET',
  'http://localhost:3000/api/auth/callback/google'
);

const scopes = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Vai a questo URL:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Incolla il codice qui: ', (code) => {
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Errore:', err);
    console.log('Access Token:', token.access_token);
    console.log('Refresh Token:', token.refresh_token);
    rl.close();
  });
});
```

### Step 5: Configura nel Database

Aggiungi al `.env`:

```env
GOOGLE_CLIENT_ID="il-tuo-client-id"
GOOGLE_CLIENT_SECRET="il-tuo-client-secret"
GOOGLE_CALENDAR_ID="primary"  # o l'ID del calendario specifico
```

Esegui lo script:

```bash
GOOGLE_ACCESS_TOKEN="access-token-ottenuto" GOOGLE_REFRESH_TOKEN="refresh-token-ottenuto" npm run setup:calendar
```

## 💬 5. Twilio WhatsApp

### Step 1: Crea Account Twilio

1. Vai su https://www.twilio.com/
2. Crea un account gratuito
3. Verifica il tuo numero di telefono

### Step 2: Configura WhatsApp Sandbox

1. Nel dashboard Twilio, vai su "Messaging" → "Try it out" → "Send a WhatsApp message"
2. Segui le istruzioni per configurare il Sandbox
3. Invia il codice al numero WhatsApp di Twilio per attivare

### Step 3: Ottieni Credenziali

Nel dashboard Twilio:

1. Vai su "Account" → "Account Info"
2. Copia **Account SID** e **Auth Token**

### Step 4: Configura nel Progetto

Aggiungi al `.env`:

```env
TWILIO_ACCOUNT_SID="il-tuo-account-sid"
TWILIO_AUTH_TOKEN="il-tuo-auth-token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"  # Numero Twilio Sandbox
```

**⚠️ IMPORTANTE**: Twilio Sandbox è solo per **test**. Per produzione, devi richiedere **Twilio WhatsApp Business API**. 

Vedi `SETUP_TWILIO_PRODUCTION.md` per la guida completa alla migrazione.

## ⏰ 6. Cron Job per Promemoria

### Opzione A: Vercel Cron Jobs (Se deployi su Vercel)

Crea `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Aggiungi al `.env`:

```env
CRON_SECRET="un-secret-sicuro"
```

### Opzione B: Servizio Esterno

Usa un servizio come:
- **EasyCron**: https://www.easycron.com/
- **Cron-job.org**: https://cron-job.org/
- **Uptime Robot**: https://uptimerobot.com/

Configura una richiesta HTTP GET ogni 5 minuti:

```
URL: https://tuo-dominio.com/api/reminders
Method: GET
Headers: Authorization: Bearer YOUR_CRON_SECRET
```

### Opzione C: Server Proprio

Su Linux/Mac, aggiungi a crontab:

```bash
*/5 * * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://tuo-dominio.com/api/reminders
```

## 🚀 7. Avvio e Test

```bash
# Installa dipendenze
npm install

# Genera Prisma Client
npm run db:generate

# Push schema database
npm run db:push

# Crea admin
npm run seed:admin

# Avvia sviluppo
npm run dev
```

Apri http://localhost:3000 e testa:

1. Login come admin (creato con seed:admin)
2. Crea un cliente dall'area admin
3. Crea un pacchetto per il cliente
4. Login come cliente
5. Crea una prenotazione
6. Verifica che:
   - L'evento sia su Google Calendar
   - Arrivi il messaggio WhatsApp di conferma
   - La sessione sia scalata

## 🐛 Troubleshooting

### Errore: "Google Calendar non configurato"
- Verifica che i token siano salvati nel database
- Esegui di nuovo `npm run setup:calendar`

### Errore: "Non autorizzato" su API
- Verifica che `NEXTAUTH_SECRET` sia configurato
- Controlla che l'utente sia loggato

### WhatsApp non funziona
- Verifica che il numero sia nel formato corretto: `+39XXXXXXXXXX`
- Controlla che Twilio Sandbox sia attivo
- Verifica le credenziali Twilio

### Database connection error
- Verifica che PostgreSQL sia in esecuzione
- Controlla la connection string nel `.env`
- Verifica permessi utente database

## 📝 File .env Completo

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hugemass?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"

# Google Calendar
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALENDAR_ID="primary"

# Twilio
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

# Admin
ADMIN_EMAIL="admin@hugemass.com"
ADMIN_PASSWORD="changeme"

# Cron
CRON_SECRET="genera-un-secret-sicuro"
```

## ✅ Verifica Finale

- [ ] Database connesso e schema creato
- [ ] Admin creato e login funzionante
- [ ] Google Calendar configurato e testato
- [ ] Twilio configurato e messaggi inviati
- [ ] Prenotazioni funzionanti
- [ ] Scalamento sessioni corretto
- [ ] Cron job configurato (per produzione)
