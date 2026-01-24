'use client'

import { useState, useEffect } from 'react'
import { Package, User } from 'lucide-react'

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
    return <p className="text-gray-500">Caricamento pacchetti...</p>
  }

  if (packages.length === 0) {
    return <p className="text-gray-500">Nessun pacchetto creato</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pacchetto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sessioni
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stato
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data Creazione
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {packages.map((pkg) => {
            const remaining = pkg.totalSessions - pkg.usedSessions
            const percentage = (pkg.usedSessions / pkg.totalSessions) * 100

            return (
              <tr key={pkg.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-primary-600 mr-2" />
                    <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pkg.user.name}</div>
                      <div className="text-sm text-gray-500">{pkg.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{pkg.usedSessions} / {pkg.totalSessions}</span>
                      <span className="text-gray-400">({remaining} rimaste)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1 max-w-xs">
                      <div
                        className={`h-2 rounded-full ${
                          remaining > 0 ? 'bg-primary-600' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pkg.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {pkg.isActive ? 'Attivo' : 'Inattivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(pkg.createdAt).toLocaleDateString('it-IT')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
