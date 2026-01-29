'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

/**
 * Hook per gestire la sicurezza della sessione
 * - Verifica periodicamente la validità della sessione
 * - Controlla se il browser è stato chiuso e riaperto
 * - Invalida la sessione se scaduta
 */
export function useSessionSecurity() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Se non autenticato, pulisci sessionStorage
    if (status === 'unauthenticated') {
      sessionStorage.removeItem('sessionActive')
      sessionStorage.removeItem('sessionTimestamp')
      return
    }

    // Se autenticato, marca come attiva
    if (session) {
      sessionStorage.setItem('sessionActive', 'true')
      sessionStorage.setItem('sessionTimestamp', Date.now().toString())

      // Controlla periodicamente se la sessione è ancora valida (ogni 5 minuti)
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/auth/session')
          const data = await response.json()
          
          if (!data || !data.user) {
            // Sessione non valida - logout
            sessionStorage.removeItem('sessionActive')
            sessionStorage.removeItem('sessionTimestamp')
            await signOut({ callbackUrl: '/login?error=SessionExpired' })
          } else {
            // Sessione valida - aggiorna timestamp
            sessionStorage.setItem('sessionActive', 'true')
            sessionStorage.setItem('sessionTimestamp', Date.now().toString())
          }
        } catch (error) {
          console.error('Errore verifica sessione:', error)
        }
      }, 5 * 60 * 1000) // Ogni 5 minuti

      return () => clearInterval(interval)
    }
  }, [session, status])

  // Controlla se il browser è stato chiuso e riaperto
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkSessionOnLoad = async () => {
      const wasActive = sessionStorage.getItem('sessionActive')
      const sessionTimestamp = sessionStorage.getItem('sessionTimestamp')
      
      // Se non c'era una sessione attiva, verifica la sessione corrente
      if (!wasActive || !sessionTimestamp) {
        try {
          const response = await fetch('/api/auth/session')
          const data = await response.json()
          
          if (!data || !data.user) {
            // Sessione non valida - reindirizza al login
            sessionStorage.removeItem('sessionActive')
            sessionStorage.removeItem('sessionTimestamp')
            router.push('/login?error=SessionExpired')
          } else {
            // Sessione valida - marca come attiva
            sessionStorage.setItem('sessionActive', 'true')
            sessionStorage.setItem('sessionTimestamp', Date.now().toString())
          }
        } catch (error) {
          console.error('Errore verifica sessione al caricamento:', error)
        }
      } else {
        // Verifica che non sia passato troppo tempo (8 ore)
        const timestamp = parseInt(sessionTimestamp, 10)
        const now = Date.now()
        const maxAge = 8 * 60 * 60 * 1000 // 8 ore in millisecondi
        
        if (now - timestamp > maxAge) {
          // Sessione troppo vecchia
          sessionStorage.removeItem('sessionActive')
          sessionStorage.removeItem('sessionTimestamp')
          
          // Verifica se c'è ancora una sessione valida
          try {
            const response = await fetch('/api/auth/session')
            const data = await response.json()
            
            if (!data || !data.user) {
              router.push('/login?error=SessionExpired')
            } else {
              // Sessione ancora valida - aggiorna timestamp
              sessionStorage.setItem('sessionActive', 'true')
              sessionStorage.setItem('sessionTimestamp', Date.now().toString())
            }
          } catch (error) {
            console.error('Errore verifica sessione:', error)
          }
        }
      }
    }

    // Esegui il controllo al caricamento della pagina
    checkSessionOnLoad()
  }, [router])
}
