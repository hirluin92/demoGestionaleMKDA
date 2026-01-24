# Setup Database con Supabase - Guida Rapida

## Step 1: Crea Account e Progetto Supabase

1. Vai su **https://supabase.com**
2. Clicca su **"Start your project"** o **"Sign Up"**
3. Crea account (puoi usare GitHub, Google, o email)
4. Una volta dentro, clicca su **"New Project"**
5. Compila il form:
   - **Name**: `hugemass` (o quello che preferisci)
   - **Database Password**: Scegli una password sicura (⚠️ **SALVALA**, ti servirà!)
   - **Region**: Scegli la più vicina (es. "West Europe" per l'Italia)
   - **Pricing Plan**: Seleziona **"Free"**
6. Clicca **"Create new project"**
7. ⏳ Aspetta 1-2 minuti che Supabase crei il database

## Step 2: Ottieni la Connection String

1. Nel dashboard Supabase, vai su **Settings** (icona ingranaggio in basso a sinistra)
2. Clicca su **"Database"** nel menu laterale
3. Scorri fino a **"Connection string"**
4. Seleziona **"URI"** nel dropdown
5. Copia la stringa che inizia con `postgresql://postgres:[YOUR-PASSWORD]@...`
6. **Sostituisci `[YOUR-PASSWORD]`** con la password che hai scelto al punto 5 dello step precedente

Esempio di connection string:
```
postgresql://postgres.xxxxxxxxxxxxx:LA_TUA_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

## Step 3: Crea il File .env

1. Nella root del progetto, crea un file chiamato `.env` (senza estensione)
2. Incolla questo contenuto e sostituisci i valori:

```env
# Database Supabase
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:LA_TUA_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# NextAuth - Genera un secret sicuro
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-qui"

# Google Calendar (configureremo dopo)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALENDAR_ID="primary"

# Twilio (configureremo dopo)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

# Admin
ADMIN_EMAIL="admin@hugemass.com"
ADMIN_PASSWORD="changeme"

# Cron
CRON_SECRET="genera-un-secret-qui"
```

## Step 4: Genera NEXTAUTH_SECRET

Apri il terminale e esegui:

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

Copia il risultato e incollalo come valore di `NEXTAUTH_SECRET` nel file `.env`.

Fai lo stesso per `CRON_SECRET` (genera un altro secret diverso).

## Step 5: Inizializza il Database

Ora esegui questi comandi nel terminale (dalla root del progetto):

```bash
# Genera il client Prisma
npm run db:generate

# Crea le tabelle nel database Supabase
npm run db:push
```

Se tutto va bene, vedrai un messaggio tipo:
```
✔ Generated Prisma Client
✔ Pushed database schema
```

## Step 6: Verifica nel Dashboard Supabase

1. Torna su Supabase dashboard
2. Vai su **"Table Editor"** nel menu laterale
3. Dovresti vedere le tabelle create:
   - `users`
   - `packages`
   - `bookings`
   - `google_calendars`

✅ **Database configurato!**

## Step 7: Crea Account Admin

Esegui:

```bash
npm run seed:admin
```

Dovresti vedere:
```
Admin creato: admin@hugemass.com
```

## ✅ Fatto!

Ora puoi:
- Avviare il server: `npm run dev`
- Accedere come admin con:
  - Email: `admin@hugemass.com`
  - Password: `changeme` (cambiala dopo!)

## 🐛 Problemi Comuni

### Errore: "Can't reach database server"
- Verifica che la connection string sia corretta
- Controlla che la password sia inserita (sostituisci `[YOUR-PASSWORD]`)
- Assicurati che il progetto Supabase sia completamente creato (aspetta qualche minuto)

### Errore: "Invalid connection string"
- La connection string deve iniziare con `postgresql://`
- Verifica di aver sostituito `[YOUR-PASSWORD]` con la password reale
- Controlla che non ci siano spazi extra

### Errore: "relation already exists"
- Le tabelle esistono già, va bene
- Puoi continuare o resettare il database da Supabase dashboard
