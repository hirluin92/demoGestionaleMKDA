import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

function normalizePhoneNumber(phone: string): string {
  // Rimuovi spazi e caratteri speciali
  let normalized = phone.replace(/\s+/g, '').replace(/[-\/]/g, '')
  
  // Se inizia con 0, sostituisci con +39
  if (normalized.startsWith('0')) {
    normalized = '+39' + normalized.substring(1)
  }
  // Se inizia con 39, aggiungi +
  else if (normalized.startsWith('39')) {
    normalized = '+' + normalized
  }
  // Se inizia con +, lascia così
  else if (!normalized.startsWith('+')) {
    // Se non ha prefisso, assume Italia (+39)
    normalized = '+39' + normalized
  }
  
  return normalized
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
) {
  try {
    const normalizedPhone = normalizePhoneNumber(to)
    console.log(`Invio WhatsApp a: ${normalizedPhone} (originale: ${to})`)
    
    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${normalizedPhone}`,
      body: message,
    })
    return result
  } catch (error) {
    console.error('Errore invio WhatsApp:', error)
    throw error
  }
}

export function formatBookingConfirmationMessage(
  clientName: string,
  date: Date,
  time: string
) {
  const formattedDate = date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `✅ Prenotazione confermata!\n\nCiao ${clientName},\n\nLa tua sessione è stata prenotata per:\n📅 ${formattedDate}\n🕐 ${time}\n\nTi aspettiamo allo studio Hugemass! 💪`
}

export function formatBookingReminderMessage(
  clientName: string,
  date: Date,
  time: string
) {
  const formattedDate = date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `⏰ Promemoria sessione\n\nCiao ${clientName},\n\nTi ricordiamo che hai una sessione tra 1 ora:\n📅 ${formattedDate}\n🕐 ${time}\n\nTi aspettiamo! 💪`
}
