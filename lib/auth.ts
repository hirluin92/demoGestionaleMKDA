import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { env } from './env'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.iat = Math.floor(Date.now() / 1000) // Issued at time
      }
      
      // Verifica scadenza token (8 ore)
      const now = Math.floor(Date.now() / 1000)
      const tokenAge = now - (token.iat as number || 0)
      const maxAge = 8 * 60 * 60 // 8 ore in secondi
      
      if (tokenAge > maxAge) {
        // Token scaduto
        return null as any
      }
      
      return token
    },
    async session({ session, token }) {
      if (!token || !token.id) {
        // Token non valido o scaduto
        return null as any
      }
      
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Se l'URL è relativo, usa baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Se l'URL è sulla stessa origine, permetti
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 ore (scadenza automatica)
    updateAge: 60 * 60, // Aggiorna la sessione ogni ora se attiva
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 ore (scadenza automatica)
  },
  secret: env.NEXTAUTH_SECRET,
}
