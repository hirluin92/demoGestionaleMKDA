'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { Users, Package, LogOut, Plus } from 'lucide-react'
import AdminUsersList from '@/components/AdminUsersList'
import AdminPackagesList from '@/components/AdminPackagesList'
import CreateUserModal from '@/components/CreateUserModal'
import CreatePackageModal from '@/components/CreatePackageModal'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'users' | 'packages'>('users')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showCreatePackage, setShowCreatePackage] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700">Hugemass Admin</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Pannello di Controllo</h2>
          <p className="text-gray-600">Gestisci clienti e pacchetti</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <Users className="w-5 h-5" />
              <span>Clienti</span>
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`${
                activeTab === 'packages'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <Package className="w-5 h-5" />
              <span>Pacchetti</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Gestione Clienti</h3>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Cliente</span>
                </button>
              </div>
              <AdminUsersList />
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Gestione Pacchetti</h3>
                <button
                  onClick={() => setShowCreatePackage(true)}
                  className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Pacchetto</span>
                </button>
              </div>
              <AdminPackagesList />
            </div>
          )}
        </div>
      </main>

      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onSuccess={() => {
            setShowCreateUser(false)
            window.location.reload()
          }}
        />
      )}

      {showCreatePackage && (
        <CreatePackageModal
          onClose={() => setShowCreatePackage(false)}
          onSuccess={() => {
            setShowCreatePackage(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
