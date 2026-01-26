'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { Users, Package, LogOut, Plus, Menu, X, Settings } from 'lucide-react'
import HugemassLogo from '@/components/HugemassLogo'
import AdminUsersList from '@/components/AdminUsersList'
import AdminPackagesList from '@/components/AdminPackagesList'
import CreateUserModal from '@/components/CreateUserModal'
import CreatePackageModal from '@/components/CreatePackageModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'users' | 'packages'>('users')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showCreatePackage, setShowCreatePackage] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-dark-200 border-t-gold-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <HugemassLogo variant="icon" size="sm" className="animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-dark-600 font-semibold tracking-wide text-sm md:text-base">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-dark-950 relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/sfondo.jpg')" }}>
        
        {/* Header Premium */}
        <nav className="bg-dark-50/80 backdrop-blur-xl border-b border-gold-400/20 sticky top-0 z-50 shadow-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* Logo */}
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="hidden sm:block">
                  <HugemassLogo variant="icon" size="sm" />
                </div>
                <div className="sm:hidden">
                  <HugemassLogo variant="icon" size="sm" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-display font-bold">
                    <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
                      HUGE MASS
                    </span>
                    <span className="text-white ml-2 text-sm md:text-base">Admin</span>
                  </h1>
                  <p className="text-xs text-dark-600 tracking-widest uppercase hidden sm:block">Control Panel</p>
                </div>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">Ciao, {session.user.name}</p>
                  <Badge variant="gold" size="sm" className="mt-1">
                    ADMIN
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-dark-600 hover:text-gold-400 group"
                  aria-label="Disconnetti"
                >
                  <LogOut className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Esci
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-dark-100/50 transition-colors"
                aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gold-400" />
                ) : (
                  <Menu className="w-6 h-6 text-gold-400" />
                )}
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-dark-200/30 animate-slide-down">
                <div className="space-y-3">
                  <div className="px-4 py-2 bg-dark-100/50 rounded-lg">
                    <p className="text-sm font-semibold text-white">Ciao, {session.user.name}</p>
                    <Badge variant="gold" size="sm" className="mt-1">
                      ADMIN
                    </Badge>
                  </div>
                  <Button
                    variant="outline-gold"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/login' })
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Esci
                  </Button>
                </div>
              </div>
            )}
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
          {/* Hero Section */}
          <div className="mb-8 md:mb-12 animate-fade-in">
            <div className="flex items-center space-x-2 mb-2 md:mb-3">
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-gold-400 animate-pulse" aria-hidden="true" />
              <span className="text-gold-400 text-xs md:text-sm font-semibold tracking-wide uppercase">Admin Panel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-2 md:mb-3">
              Pannello di Controllo
            </h2>
            <p className="text-dark-600 text-sm md:text-lg">
              Gestisci clienti e pacchetti
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 md:mb-8">
            <div className="border-b border-dark-200/30">
              <nav className="-mb-px flex space-x-4 md:space-x-8" role="tablist" aria-label="Sezioni amministrazione">
                <button
                  onClick={() => setActiveTab('users')}
                  role="tab"
                  aria-selected={activeTab === 'users'}
                  aria-controls="users-panel"
                  id="users-tab"
                  className={`
                    whitespace-nowrap py-3 md:py-4 px-1 border-b-2 font-semibold text-sm md:text-base transition-colors
                    flex items-center space-x-2
                    ${activeTab === 'users'
                      ? 'border-gold-400 text-gold-400'
                      : 'border-transparent text-dark-600 hover:text-dark-500 hover:border-dark-300/50'
                    }
                  `}
                >
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Clienti</span>
                </button>
                <button
                  onClick={() => setActiveTab('packages')}
                  role="tab"
                  aria-selected={activeTab === 'packages'}
                  aria-controls="packages-panel"
                  id="packages-tab"
                  className={`
                    whitespace-nowrap py-3 md:py-4 px-1 border-b-2 font-semibold text-sm md:text-base transition-colors
                    flex items-center space-x-2
                    ${activeTab === 'packages'
                      ? 'border-gold-400 text-gold-400'
                      : 'border-transparent text-dark-600 hover:text-dark-500 hover:border-dark-300/50'
                    }
                  `}
                >
                  <Package className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Pacchetti</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <Card>
            {activeTab === 'users' && (
              <div role="tabpanel" id="users-panel" aria-labelledby="users-tab">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center text-lg md:text-2xl">
                        <Users className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-gold-400" />
                        Gestione Clienti
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm">Aggiungi e gestisci i clienti del sistema</CardDescription>
                    </div>
                    <Button
                      variant="gold"
                      size="md"
                      onClick={() => setShowCreateUser(true)}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuovo Cliente
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AdminUsersList />
                </CardContent>
              </div>
            )}

            {activeTab === 'packages' && (
              <div role="tabpanel" id="packages-panel" aria-labelledby="packages-tab">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center text-lg md:text-2xl">
                        <Package className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-gold-400" />
                        Gestione Pacchetti
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm">Crea e gestisci i pacchetti per i clienti</CardDescription>
                    </div>
                    <Button
                      variant="gold"
                      size="md"
                      onClick={() => setShowCreatePackage(true)}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuovo Pacchetto
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AdminPackagesList />
                </CardContent>
              </div>
            )}
          </Card>
        </main>

        {/* Modals */}
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
    </ErrorBoundary>
  )
}
