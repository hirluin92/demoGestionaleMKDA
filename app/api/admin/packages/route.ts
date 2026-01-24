import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPackageSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  totalSessions: z.number().int().positive(),
})

// GET - Lista tutti i pacchetti (solo admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const packages = await prisma.package.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Errore recupero pacchetti:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dei pacchetti' },
      { status: 500 }
    )
  }
}

// POST - Crea nuovo pacchetto (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, name, totalSessions } = createPackageSchema.parse(body)

    // Verifica che l'utente esista
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    const packageData = await prisma.package.create({
      data: {
        userId,
        name,
        totalSessions,
        usedSessions: 0,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(packageData, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Errore creazione pacchetto:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione del pacchetto' },
      { status: 500 }
    )
  }
}
