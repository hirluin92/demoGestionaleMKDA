import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifica utenti admin nel database...\n')

  // Trova tutti gli utenti admin
  const adminUsers = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })

  if (adminUsers.length === 0) {
    console.log('❌ Nessun utente admin trovato nel database!')
    console.log('\n💡 Esegui: npm run seed:admin')
  } else {
    console.log(`✅ Trovati ${adminUsers.length} utente/i admin:\n`)
    adminUsers.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`)
      console.log(`   Nome: ${admin.name}`)
      console.log(`   ID: ${admin.id}`)
      console.log(`   Creato: ${admin.createdAt.toLocaleString('it-IT')}`)
      console.log('')
    })
  }

  // Mostra anche tutti gli utenti
  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
    },
  })

  console.log(`\n📊 Totale utenti nel database: ${allUsers.length}`)
  if (allUsers.length > 0) {
    console.log('\nTutti gli utenti:')
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.name}`)
    })
  }
}

main()
  .catch((e) => {
    console.error('Errore:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
