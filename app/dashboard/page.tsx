'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { Calendar, Package, Clock, LogOut } from 'lucide-react'
import BookingForm from '@/components/BookingForm'
import BookingsList from '@/components/BookingsList'

interface Package {
  id: string
  name: string
  totalSessions: number
  usedSessions: number
  isActive: boolean
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchPackages()
    }
  }, [session])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      if (response.ok) {
        const data = await response.json()
        setPackages(data)
      }
    } catch (error) {
      console.error('Errore recupero pacchetti:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const activePackages = packages.filter(pkg => pkg.isActive)
  const totalRemainingSessions = activePackages.reduce(
    (sum, pkg) => sum + (pkg.totalSessions - pkg.usedSessions),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700">Hugemass</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Ciao, {session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Esci</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Gestisci le tue prenotazioni e i tuoi pacchetti</p>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacchetti Attivi</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {activePackages.length}
                </p>
              </div>
              <Package className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sessioni Residue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalRemainingSessions}
                </p>
              </div>
              <Clock className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prenotazioni</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  <BookingsList showCountOnly />
                </p>
              </div>
              <Calendar className="w-12 h-12 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Pacchetti */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">I Tuoi Pacchetti</h3>
          {activePackages.length === 0 ? (
            <p className="text-gray-500">Nessun pacchetto attivo</p>
          ) : (
            <div className="space-y-4">
              {activePackages.map((pkg) => {
                const remaining = pkg.totalSessions - pkg.usedSessions
                const percentage = (pkg.usedSessions / pkg.totalSessions) * 100

                return (
                  <div key={pkg.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        remaining > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {remaining} sessioni rimaste
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {pkg.usedSessions} / {pkg.totalSessions} sessioni utilizzate
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Form Prenotazione */}
        {totalRemainingSessions > 0 ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Nuova Prenotazione</h3>
            <BookingForm onSuccess={fetchPackages} packages={activePackages} />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-yellow-800">
              ⚠️ Non hai sessioni disponibili. Contatta l'amministratore per acquistare un nuovo pacchetto.
            </p>
          </div>
        )}

        {/* Lista Prenotazioni */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Le Tue Prenotazioni</h3>
          <BookingsList onCancel={fetchPackages} />
        </div>
      </main>
    </div>
  )
}
