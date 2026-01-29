/**
 * Script per setup iniziale database Neon su Vercel
 * 
 * Questo script:
 * 1. Esegue le migration del database
 * 2. Crea l'utente admin iniziale
 * 
 * Uso:
 * DATABASE_URL="postgresql://..." npm run setup:neon
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { env } from '../lib/env'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setup database Neon...')
  
  // Verifica connessione
  try {
    await prisma.$connect()
    console.log('✅ Connesso al database Neon')
  } catch (error) {
    console.error('❌ Errore connessione database:', error)
    process.exit(1)
  }

  // Crea utente admin se non esiste
  const adminEmail = env.ADMIN_EMAIL || 'admin@hugemass.com'
  const adminPassword = env.ADMIN_PASSWORD || 'admin123'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log(`⚠️  Utente admin con email ${adminEmail} già esistente`)
    
    // Aggiorna password e ruolo se necessario
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
    console.log(`✅ Password e ruolo admin aggiornati per ${adminEmail}`)
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
    console.log(`✅ Utente admin creato: ${adminEmail}`)
  }

  console.log('\n📋 Credenziali di accesso:')
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log('\n⚠️  IMPORTANTE: Cambia la password dopo il primo accesso!')
}

main()
  .catch((e) => {
    console.error('❌ Errore durante setup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
