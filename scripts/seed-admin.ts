import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { env } from '../lib/env'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = env.ADMIN_EMAIL || 'admin@hugemass.com'
  const adminPassword = env.ADMIN_PASSWORD || 'changeme'

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Cerca se l'admin esiste già
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    // Aggiorna password e ruolo se esiste già
    const admin = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Admin',
      },
    })
    console.log('Admin aggiornato:', admin.email)
    console.log('Password resettata alla password dal .env o default "changeme"')
  } else {
    // Crea nuovo admin
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
      },
    })
    console.log('Admin creato:', admin.email)
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
