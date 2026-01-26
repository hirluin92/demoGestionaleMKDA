/**
 * Standardized API error response handler
 * 
 * @module lib/api-response
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { isPrismaError, isTwilioError } from './errors'

/**
 * Handles API errors and returns appropriate NextResponse
 * 
 * Automatically detects error type (Zod, Prisma, Twilio) and
 * returns user-friendly error messages with correct status codes.
 * 
 * @param error - The error to handle
 * @returns NextResponse with formatted error
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   try {
 *     // ... API logic
 *   } catch (error) {
 *     return handleApiError(error)
 *   }
 * }
 * ```
 */
export function handleApiError(error: unknown) {
  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Dati non validi',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    )
  }

  // Prisma errors
  if (isPrismaError(error)) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Questo elemento esiste già' },
        { status: 409 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Elemento non trovato' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Errore database' },
      { status: 500 }
    )
  }

  // Twilio errors
  if (isTwilioError(error)) {
    console.error('Twilio error:', error.code, error.message)
    // Non esporre errori Twilio all'utente
    return NextResponse.json(
      { error: 'Errore invio notifica' },
      { status: 500 }
    )
  }

  // Generic errors
  if (error instanceof Error) {
    console.error('API error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  // Unknown errors
  console.error('Unknown error:', error)
  return NextResponse.json(
    { error: 'Errore sconosciuto' },
    { status: 500 }
  )
}
