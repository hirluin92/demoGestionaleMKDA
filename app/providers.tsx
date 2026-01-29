'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Controlla la sessione ogni 5 minuti
      refetchOnWindowFocus={true} // Controlla quando la finestra torna in focus
    >
      {children}
    </SessionProvider>
  )
}
