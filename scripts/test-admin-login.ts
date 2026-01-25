import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { env } from '../lib/env'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = env.ADMIN_EMAIL || 'admin@hugemass.com'
  const testPassword = 'changeme'

  console.log('🔍 Verifica accesso admin...')
  console.log(`Email: ${adminEmail}`)
  console.log(`Password test: ${testPassword}`)

  // Cerca l'admin
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!admin) {
    console.error('❌ Admin non trovato nel database!')
    console.log('Esegui: npm run seed:admin')
    process.exit(1)
  }

  console.log(`✅ Admin trovato: ${admin.email}`)
  console.log(`   Role: ${admin.role}`)
  console.log(`   Name: ${admin.name}`)

  // Verifica password
  const isPasswordValid = await bcrypt.compare(testPassword, admin.password)

  if (isPasswordValid) {
    console.log('✅ Password "changeme" è CORRETTA!')
    console.log('\n💡 Se non riesci ad accedere:')
    console.log('   1. Verifica di usare l\'email corretta:', adminEmail)
    console.log('   2. Verifica di non avere spazi nella password')
    console.log('   3. Prova a cancellare i cookie del browser')
    console.log('   4. Riavvia il server Next.js (npm run dev)')
  } else {
    console.log('❌ Password "changeme" NON corrisponde!')
    console.log('\n💡 Soluzione:')
    console.log('   Esegui: npm run seed:admin')
    console.log('   Oppure usa lo script fix-user-password.ts per resettare la password')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
