# 🔐 Configurazione Google OAuth - Risoluzione Errori

## ❌ Errore: "access_denied" o "L'app è in fase di test"

Se ricevi l'errore:
```
Hugemass Calendar non ha completato la procedura di verifica di Google.
L'app è attualmente in fase di test ed è accessibile solo ai tester approvati.
Errore 403: access_denied
```

### 🔧 Soluzione: Aggiungi Utenti di Test

1. **Vai su Google Cloud Console**
   - https://console.cloud.google.com/
   - Seleziona il tuo progetto

2. **Vai alle Credenziali OAuth**
   - Menu laterale: "APIs & Services" → "OAuth consent screen"
   - Oppure: "APIs & Services" → "Credentials" → Clicca sul tuo OAuth 2.0 Client ID

3. **Aggiungi Utenti di Test**
   - Nella sezione "OAuth consent screen", vai alla tab "Test users"
   - Clicca "+ ADD USERS"
   - Aggiungi l'email del tuo account Google (quello che userai per autorizzare)
   - Clicca "ADD"

4. **Verifica Modalità App**
   - Assicurati che "Publishing status" sia "Testing"
   - Se è "In production", potrebbe richiedere la verifica di Google (processo più lungo)

5. **Riprova l'Autorizzazione**
   - Esegui di nuovo: `node scripts/get-google-tokens.js`
   - Ora dovresti poter autorizzare senza errori

### 📋 Configurazione Consigliata per Sviluppo

**OAuth Consent Screen:**
- User type: "External" (per sviluppo/test)
- App name: "Hugemass Calendar"
- User support email: La tua email
- Developer contact: La tua email
- Scopes: `https://www.googleapis.com/auth/calendar`

**Test Users:**
- Aggiungi tutti gli account Google che useranno l'app durante lo sviluppo
- Puoi aggiungere fino a 100 utenti di test

### 🚀 Per Produzione

Quando sei pronto per la produzione:

1. **Verifica l'App con Google**
   - Vai su "OAuth consent screen"
   - Clicca "PUBLISH APP"
   - Compila il form di verifica di Google
   - Google potrebbe richiedere:
     - Privacy Policy URL
     - Terms of Service URL
     - Video dimostrativo dell'app
     - Scopo dell'uso dei dati

2. **Oppure: Mantieni in Testing (per uso interno)**
   - Se l'app è solo per uso interno (tuo team/cliente)
   - Puoi mantenerla in "Testing" e aggiungere tutti gli utenti necessari
   - Limite: 100 utenti di test

### ⚠️ Note Importanti

- **Refresh Token**: Assicurati di usare `access_type: 'offline'` per ottenere un refresh token permanente
- **Prompt Consent**: Usa `prompt: 'consent'` per forzare sempre il refresh token
- **Scopes**: Usa solo gli scope necessari (`calendar` per Google Calendar)

### 🔍 Verifica Configurazione

Dopo aver aggiunto gli utenti di test, verifica:

1. Esegui: `node scripts/get-google-tokens.js`
2. Se funziona, vedrai l'URL di autorizzazione
3. Clicca e autorizza con il tuo account Google (quello aggiunto come tester)
4. Dovresti ricevere i token senza errori

### 📚 Risorse

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
