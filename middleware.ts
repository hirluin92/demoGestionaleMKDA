import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    
    // Se non c'è token, il middleware con withAuth dovrebbe già reindirizzare
    // ma aggiungiamo un controllo esplicito per sicurezza
    if (!token || !token.id) {
      // Token non valido o scaduto - reindirizza al login
      return NextResponse.redirect(new URL('/login?error=SessionExpired', req.url))
    }

    // Verifica scadenza token (8 ore)
    const now = Math.floor(Date.now() / 1000)
    const tokenIat = (token as any).iat || 0
    const tokenAge = now - tokenIat
    const maxAge = 8 * 60 * 60 // 8 ore in secondi
    
    if (tokenAge > maxAge) {
      // Token scaduto - reindirizza al login
      return NextResponse.redirect(new URL('/login?error=SessionExpired', req.url))
    }

    const isAdmin = token.role === 'ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    // Se l'utente non è admin e cerca di accedere a route admin
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Se l'utente è admin e cerca di accedere a dashboard cliente
    if (req.nextUrl.pathname === '/dashboard' && isAdmin) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Verifica che il token esista, sia valido e non scaduto
        if (!token || !token.id) {
          return false
        }
        
        // Verifica scadenza
        const now = Math.floor(Date.now() / 1000)
        const tokenIat = (token as any).iat || 0
        const tokenAge = now - tokenIat
        const maxAge = 8 * 60 * 60 // 8 ore
        
        return tokenAge <= maxAge
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/bookings/:path*', '/api/packages/:path*', '/api/admin/:path*'],
}
