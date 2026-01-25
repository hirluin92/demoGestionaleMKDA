import { PrismaClient } from '@prisma/client'
import { env } from '../lib/env'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = env.ADMIN_EMAIL || 'admin@hugemass.com'
  
  console.log('📋 Configurazione Admin:')
  console.log(`   Email configurata: ${adminEmail}`)
  console.log(`   (da ADMIN_EMAIL nel .env o default: admin@hugemass.com)`)
  console.log('')
  
  // Cerca tutti gli utenti admin
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      email: true,
      name: true,
      role: true,
    },
  })
  
  if (admins.length === 0) {
    console.log('❌ Nessun admin trovato nel database!')
    console.log('   Esegui: npm run seed:admin')
  } else {
    console.log(`✅ Trovati ${admins.length} admin:`)
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin.name})`)
    })
    console.log('')
    console.log('💡 Per accedere, usa:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: changeme (o quella in ADMIN_PASSWORD nel .env)`)
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
