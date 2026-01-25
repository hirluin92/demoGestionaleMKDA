# 🔐 Ottieni Token Google Calendar - Metodo Semplice

## ✅ Metodo Consigliato: Google OAuth Playground

Questo metodo è il più semplice! Devi solo aggiungere un redirect URI.

### ⚠️ PRIMA DI TUTTO: Configura Redirect URI

1. Vai su Google Cloud Console: https://console.cloud.google.com/
2. Seleziona il tuo progetto
3. Vai su "APIs & Services" → "Credentials"
4. Clicca sul tuo **OAuth 2.0 Client ID**
5. In "Authorized redirect URIs", clicca "+ ADD URI"
6. Aggiungi questo URI:
   ```
   https://developers.google.com/oauthplayground
   ```
7. Clicca **"SAVE"**

### Passo 1: Vai su OAuth Playground

1. Apri: https://developers.google.com/oauthplayground/
2. In alto a destra, clicca l'icona ⚙️ (Settings)
3. Spunta **"Use your own OAuth credentials"**
4. Inserisci:
   - **OAuth Client ID**: Il tuo `GOOGLE_CLIENT_ID` dal file `.env`
   - **OAuth Client secret**: Il tuo `GOOGLE_CLIENT_SECRET` dal file `.env`
5. Clicca **"Close"**

### Passo 2: Seleziona Scope

1. Nella lista a sinistra, cerca **"Calendar API v3"**
2. Espandi e seleziona: **`https://www.googleapis.com/auth/calendar`**
3. Clicca **"Authorize APIs"**

### Passo 3: Autorizza

1. Accedi con il tuo account Google (quello che hai aggiunto come tester)
2. Clicca **"Consenti"** (Allow)
3. Se vedi un avviso sulla verifica dell'app, clicca **"Avanti"** (Next)

### Passo 4: Ottieni i Token

1. Dopo l'autorizzazione, vedrai un codice di autorizzazione
2. Clicca **"Exchange authorization code for tokens"** (in alto)
3. Vedrai i token:
   - **access_token**: Token di accesso (scade dopo 1 ora)
   - **refresh_token**: Token di refresh (permanente!) ⭐

### Passo 5: Salva i Token

1. Copia il **refresh_token** (quello più lungo)
2. Copia anche l'**access_token** (opzionale, verrà rinnovato automaticamente)

Aggiungi al file `.env`:

```env
GOOGLE_ACCESS_TOKEN="il-tuo-access-token"
GOOGLE_REFRESH_TOKEN="il-tuo-refresh-token"
```

### Passo 6: Salva nel Database

Esegui:

```bash
npm run setup:calendar
```

### ✅ Fatto!

Ora i token sono salvati nel database e il sistema li rinnoverà automaticamente!

---

## 🔍 Verifica

Esegui per verificare che tutto funzioni:

```bash
npm run check:token
```

Dovresti vedere:
- ✅ Token valido
- ✅ Chiamata API riuscita
- ✅ Refresh token funzionante

---

## ⚠️ Note Importanti

- **Refresh Token**: Con OAuth Playground, ottieni sempre un refresh token permanente
- **Access Token**: Scade dopo 1 ora, ma viene rinnovato automaticamente dal sistema
- **Non serve server**: OAuth Playground gestisce tutto per te
- **Non serve redirect URI**: OAuth Playground usa il suo proprio redirect URI
