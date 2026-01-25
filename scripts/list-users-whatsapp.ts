import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()

/**
 * Script per listare tutti gli utenti e verificare i numeri WhatsApp
 */

async function main() {
  console.log('📋 Lista utenti e numeri WhatsApp\n')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  console.log(`Trovati ${users.length} utenti:\n`)

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`)
    if (user.phone) {
      console.log(`   📱 Telefono: ${user.phone}`)
      
      // Verifica formato
      const normalized = user.phone.replace(/\s+/g, '').replace(/[-\/]/g, '')
      let formatted = normalized
      
      if (normalized.startsWith('0')) {
        formatted = '+39' + normalized.substring(1)
      } else if (normalized.startsWith('39')) {
        formatted = '+' + normalized
      } else if (!normalized.startsWith('+')) {
        formatted = '+39' + normalized
      }
      
      const isValid = /^\+\d{10,15}$/.test(formatted)
      console.log(`   ${isValid ? '✅' : '❌'} Formato normalizzato: ${formatted} ${isValid ? '(valido)' : '(NON VALIDO!)'}`)
    } else {
      console.log(`   ❌ Nessun numero di telefono configurato`)
    }
    console.log()
  })

  // Riepilogo
  const withPhone = users.filter(u => u.phone).length
  const withoutPhone = users.filter(u => !u.phone).length
  
  console.log('📊 Riepilogo:')
  console.log(`   ✅ Con telefono: ${withPhone}`)
  console.log(`   ❌ Senza telefono: ${withoutPhone}`)
}

main()
  .catch((e) => {
    console.error('❌ Errore:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
