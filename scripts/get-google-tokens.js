const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

// Usa 'urn:ietf:wg:oauth:2.0:oob' per non richiedere un server locale
// Google mostrerà il codice direttamente nella pagina invece di fare redirect
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'  // Non richiede server locale
);

const scopes = ['https://www.googleapis.com/auth/calendar'];

// ⚠️ IMPORTANTE: access_type: 'offline' è CRUCIALE per ottenere un refresh token permanente
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',  // Questo è ESSENZIALE per refresh token permanente
  prompt: 'consent',       // Forza il consenso per ottenere sempre il refresh token
  scope: scopes,
});

console.log('\n🔐 Ottieni Token Google Calendar\n');
console.log('⚠️  IMPORTANTE: Assicurati di usare access_type: "offline" per ottenere un refresh token permanente!\n');
console.log('📋 Vai a questo URL e autorizza:\n');
console.log(authUrl);
console.log('\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('📝 Incolla il codice di autorizzazione qui: ', (code) => {
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('❌ Errore:', err.message);
      rl.close();
      process.exit(1);
    }
    
    console.log('\n✅ Token ottenuti con successo!\n');
    console.log('📋 Aggiungi questi valori al file .env:\n');
    console.log(`GOOGLE_ACCESS_TOKEN="${token.access_token}"`);
    
    if (token.refresh_token) {
      console.log(`GOOGLE_REFRESH_TOKEN="${token.refresh_token}"`);
      console.log('\n✅ Refresh token presente - sarà permanente!');
    } else {
      console.log('\n⚠️  ATTENZIONE: Refresh token NON presente!');
      console.log('   Questo significa che il token scadrà dopo 1 ora.');
      console.log('   Soluzione: Riapri l\'URL di autorizzazione e assicurati di:');
      console.log('   1. Usare access_type: "offline"');
      console.log('   2. Dare il consenso completo');
    }
    
    console.log('\n💾 Poi esegui: npm run setup:calendar\n');
    rl.close();
  });
});
