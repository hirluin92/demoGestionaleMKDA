# 🚀 Setup Twilio WhatsApp Business API per Produzione

## ⚠️ Problema con Twilio Sandbox

**Twilio Sandbox** (`+14155238886`) è solo per **test e sviluppo**:
- ❌ Ogni numero deve essere autorizzato manualmente
- ❌ Non scalabile per clienti reali
- ❌ Limitato a 24 ore di validità per numero
- ✅ Gratuito ma solo per test

## ✅ Soluzione: Twilio WhatsApp Business API

Per produzione, serve **Twilio WhatsApp Business API**:
- ✅ Nessuna autorizzazione manuale necessaria
- ✅ Scalabile per migliaia di clienti
- ✅ Numeri verificati da Meta/WhatsApp
- ✅ Costo: ~€0,005-0,01 per messaggio

---

## 📋 Step 1: Richiedi Approvazione WhatsApp Business API

### 1.1 Vai su Twilio Console

1. Accedi a https://console.twilio.com/
2. Vai su **Messaging** → **Senders** → **WhatsApp**
3. Clicca su **"Request WhatsApp Sender"** o **"Get Started"**

### 1.2 Compila il Form di Richiesta

Ti verrà chiesto di fornire:

**Informazioni Business:**
- Nome azienda/studio
- Tipo di business (es: "Personal Training Studio")
- Sito web
- Descrizione del servizio

**Caso d'uso:**
- Tipo: **"Notifications"** o **"Customer Care"**
- Descrizione: "Invio conferme prenotazioni e promemoria per appuntamenti di personal training"

**Volume stimato:**
- Messaggi al mese (es: 100-500 per iniziare)

**Esempio di descrizione caso d'uso:**
```
Sistema di prenotazione per studio di personal training. 
Invio automatico di:
- Conferme prenotazione quando un cliente prenota una sessione
- Promemoria 1 ora prima dell'appuntamento
- Notifiche di cancellazione

I clienti si registrano autonomamente e ricevono messaggi 
basati sulle loro prenotazioni.
```

### 1.3 Verifica Business (se richiesto)

Twilio potrebbe richiedere:
- Verifica del dominio del sito web
- Documenti aziendali (se business registrato)
- Politica sulla privacy

### 1.4 Attendi Approvazione

- ⏱️ Tempo medio: **1-3 settimane**
- 📧 Riceverai email quando approvato
- ✅ Una volta approvato, avrai un numero WhatsApp verificato

---

## 📱 Step 2: Configura il Numero WhatsApp Business

### 2.1 Ottieni il Numero WhatsApp

Dopo l'approvazione:

1. Vai su **Messaging** → **Senders** → **WhatsApp**
2. Trova il tuo numero WhatsApp Business (es: `whatsapp:+393XXXXXXXXX`)
3. Copia il numero completo

### 2.2 Aggiorna il File .env

Sostituisci il numero Sandbox con il nuovo numero:

```env
# PRIMA (Sandbox - solo test)
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

# DOPO (Business API - produzione)
TWILIO_WHATSAPP_FROM="whatsapp:+393XXXXXXXXX"  # Il tuo numero WhatsApp Business
```

### 2.3 Riavvia l'Applicazione

```bash
npm run dev
```

---

## 💰 Costi Twilio WhatsApp Business API

### Pricing (2024):

- **Messaggi in uscita**: ~€0,005-0,01 per messaggio
- **Messaggi in entrata**: Gratis (per 24h dopo messaggio inviato)
- **Conversazioni**: Gratis

### Esempio Costi Mensili:

- **50 clienti attivi**
- **2 prenotazioni/mese per cliente** = 100 prenotazioni
- **2 messaggi per prenotazione** (conferma + promemoria) = 200 messaggi
- **Costo**: 200 × €0,005 = **€1,00/mese**

- **200 clienti attivi**
- **4 prenotazioni/mese per cliente** = 800 prenotazioni
- **2 messaggi per prenotazione** = 1.600 messaggi
- **Costo**: 1.600 × €0,005 = **€8,00/mese**

### 💡 Suggerimento:

Twilio offre spesso **crediti gratuiti** per nuovi account:
- $15-50 di crediti gratuiti
- Sufficienti per testare per mesi

---

## 🔄 Migrazione da Sandbox a Business API

### Durante la Transizione:

1. **Mantieni Sandbox attivo** per test
2. **Usa Business API** per clienti reali
3. **Aggiorna `.env`** quando pronto

### Codice Pronto per Entrambi:

Il codice attuale funziona con entrambi:
- Sandbox: `whatsapp:+14155238886`
- Business API: `whatsapp:+393XXXXXXXXX`

Basta cambiare `TWILIO_WHATSAPP_FROM` nel `.env`!

---

## 🧪 Test dopo Migrazione

### 1. Test Invio Messaggio

Crea una prenotazione di test e verifica:
- ✅ Messaggio arriva senza errori
- ✅ Numero mittente è il tuo numero Business
- ✅ Nessun errore `21608` (numero non autorizzato)

### 2. Verifica Log

Controlla i log del server:
```bash
# Dovresti vedere:
✅ WhatsApp inviato con successo a [Nome] (+39XXXXXXXXX)
```

Se vedi errori, controlla:
- Numero corretto in `.env`
- Credenziali Twilio valide
- Account Twilio attivo

---

## 📚 Risorse Utili

- **Twilio WhatsApp Docs**: https://www.twilio.com/docs/whatsapp
- **Pricing**: https://www.twilio.com/whatsapp/pricing
- **Console Twilio**: https://console.twilio.com/
- **Supporto Twilio**: support@twilio.com

---

## ⚠️ Note Importanti

1. **Non usare Sandbox in produzione** - I clienti non possono autorizzare manualmente
2. **Richiedi Business API in anticipo** - L'approvazione richiede tempo
3. **Monitora i costi** - Imposta alert su Twilio Console
4. **Backup plan** - Considera SMS come alternativa se WhatsApp non approvato

---

## 🔄 Alternative (se WhatsApp non approvato)

### Opzione 1: SMS con Twilio
- ✅ Più facile da approvare
- ✅ Costo simile (~€0,01-0,02 per SMS)
- ⚠️ Meno user-friendly

### Opzione 2: Email
- ✅ Gratis
- ✅ Nessuna approvazione
- ⚠️ Meno immediato

### Opzione 3: Notifiche In-App
- ✅ Gratis
- ✅ Nessuna approvazione
- ⚠️ Richiede che l'utente apra l'app

---

## ✅ Checklist Migrazione

- [ ] Richiesta WhatsApp Business API inviata
- [ ] Business verificato (se richiesto)
- [ ] Numero WhatsApp Business ricevuto
- [ ] `.env` aggiornato con nuovo numero
- [ ] Test invio messaggio riuscito
- [ ] Log verificati (nessun errore)
- [ ] Costi monitorati su Twilio Console

---

**Domande?** Controlla la documentazione Twilio o contatta il supporto!
