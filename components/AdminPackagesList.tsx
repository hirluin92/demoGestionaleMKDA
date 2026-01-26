'use client'

import { useState, useEffect } from 'react'
import { Package, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface PackageData {
  id: string
  name: string
  totalSessions: number
  usedSessions: number
  isActive: boolean
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function AdminPackagesList() {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages')
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-dark-200 border-t-gold-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-dark-600">Caricamento pacchetti...</p>
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-dark-500 mx-auto mb-4" />
        <p className="text-dark-600 font-semibold">Nessun pacchetto creato</p>
        <p className="text-sm text-dark-500 mt-2">Crea il primo pacchetto utilizzando il pulsante sopra</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* Mobile: Card Layout */}
        <div className="md:hidden space-y-4">
          {packages.map((pkg) => {
            const remaining = pkg.totalSessions - pkg.usedSessions
            const percentage = (pkg.usedSessions / pkg.totalSessions) * 100

            return (
              <div
                key={pkg.id}
                className="bg-dark-100/50 backdrop-blur-sm border border-dark-200/30 rounded-xl p-4 hover:border-gold-400/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-gold">
                      <Package className="w-6 h-6 text-dark-950" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{pkg.name}</h4>
                      <p className="text-sm text-dark-600 mt-1">{pkg.user.name}</p>
                    </div>
                  </div>
                  <Badge variant={pkg.isActive ? 'success' : 'warning'} size="sm">
                    {pkg.isActive ? 'Attivo' : 'Inattivo'}
                  </Badge>
                </div>
                <div className="space-y-2 pt-3 border-t border-dark-200/30">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-600">Sessioni</span>
                    <span className="font-bold text-white">
                      {pkg.usedSessions} / {pkg.totalSessions}
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-dark-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        remaining > 0 ? 'bg-gradient-to-r from-gold-400 to-gold-500' : 'bg-accent-danger'
                      }`}
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-valuenow={percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <p className="text-xs text-dark-500">
                    Creato il {new Date(pkg.createdAt).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop: Table Layout */}
        <div className="hidden md:block">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-dark-200/30">
                <th className="px-6 py-4 text-left text-xs font-bold text-dark-600 uppercase tracking-wider">
                  Pacchetto
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-dark-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-dark-600 uppercase tracking-wider">
                  Sessioni
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-dark-600 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-dark-600 uppercase tracking-wider">
                  Data Creazione
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200/30">
              {packages.map((pkg) => {
                const remaining = pkg.totalSessions - pkg.usedSessions
                const percentage = (pkg.usedSessions / pkg.totalSessions) * 100

                return (
                  <tr key={pkg.id} className="hover:bg-dark-100/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gold-400 mr-2" />
                        <div className="text-sm font-bold text-white">{pkg.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gold-400 mr-2" />
                        <div>
                          <div className="text-sm font-semibold text-white">{pkg.user.name}</div>
                          <div className="text-sm text-dark-600">{pkg.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-bold">{pkg.usedSessions} / {pkg.totalSessions}</span>
                          <Badge variant={remaining > 0 ? 'gold' : 'danger'} size="sm">
                            {remaining} rimaste
                          </Badge>
                        </div>
                        <div className="w-full bg-dark-200 rounded-full h-2 max-w-xs">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              remaining > 0 ? 'bg-gradient-to-r from-gold-400 to-gold-500' : 'bg-accent-danger'
                            }`}
                            style={{ width: `${percentage}%` }}
                            role="progressbar"
                            aria-valuenow={percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={pkg.isActive ? 'success' : 'warning'} size="sm">
                        {pkg.isActive ? 'Attivo' : 'Inattivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">
                      {new Date(pkg.createdAt).toLocaleDateString('it-IT')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
