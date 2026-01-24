import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Data richiesta' },
        { status: 400 }
      )
    }

    const selectedDate = new Date(date)
    const slots = await getAvailableSlots(selectedDate)

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Errore recupero slot disponibili:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero degli slot disponibili' },
      { status: 500 }
    )
  }
}
