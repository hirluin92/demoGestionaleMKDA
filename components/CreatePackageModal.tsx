'use client'

import { useState, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface User {
  id: string
  name: string
  email: string
}

interface CreatePackageModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreatePackageModal({ onClose, onSuccess }: CreatePackageModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    totalSessions: 10,
    durationMinutes: 60, // Default 60 minuti (1 ora)
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Errore recupero utenti:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalSessions: Number(formData.totalSessions),
          durationMinutes: Number(formData.durationMinutes),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessages: Record<number, string> = {
          400: data.details 
            ? `Dati non validi: ${data.details.map((d: any) => d.message).join(', ')}`
            : data.error || 'Verifica i dati inseriti',
          404: 'Cliente non trovato',
          500: 'Errore del server. Riprova tra qualche minuto.',
        }
        setError(errorMessages[response.status] || data.error || 'Errore nella creazione del pacchetto')
        return
      }

      onSuccess()
    } catch (error) {
      setError('Impossibile connettersi al server. Verifica la connessione.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-dark-50/95 backdrop-blur-xl border border-gold-400/30 rounded-2xl shadow-dark-lg w-full max-w-md p-6 md:p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 id="modal-title" className="text-xl md:text-2xl font-display font-bold text-white">
            Nuovo Pacchetto
          </h3>
          <button
            onClick={onClose}
            className="text-dark-600 hover:text-gold-400 transition-colors p-1 rounded-lg hover:bg-dark-100/50"
            aria-label="Chiudi modale"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {error && (
            <div 
              className="bg-accent-danger/10 border-2 border-accent-danger/30 rounded-xl p-4 backdrop-blur-sm"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-accent-danger mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-semibold text-accent-danger">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label 
              htmlFor="userId"
              className="block text-sm font-bold text-dark-700 mb-2"
            >
              Cliente
            </label>
            <div className="relative">
              <select
                id="userId"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
                aria-required="true"
                className="w-full px-4 py-3 bg-dark-100/50 backdrop-blur-sm border-2 border-dark-200/30 rounded-xl text-white text-sm md:text-base focus-visible:border-gold-400 focus-visible:ring-2 focus-visible:ring-gold-400/20 transition-all appearance-none cursor-pointer hover:border-dark-300/50"
              >
                <option value="" className="bg-dark-100 text-dark-600">-- Seleziona un cliente --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id} className="bg-dark-100">
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          <Input
            id="name"
            type="text"
            label="Nome Pacchetto"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Es: Pacchetto Base 10 Sessioni"
            aria-required="true"
          />

          <Input
            id="totalSessions"
            type="number"
            label="Numero Sessioni"
            value={formData.totalSessions.toString()}
            onChange={(e) => setFormData({ ...formData, totalSessions: parseInt(e.target.value) || 0 })}
            required
            min="1"
            aria-required="true"
          />

          <div>
            <Input
              id="durationMinutes"
              type="number"
              label="Durata Sessione (minuti)"
              value={formData.durationMinutes.toString()}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
              required
              min="15"
              step="15"
              placeholder="60"
              aria-required="true"
              helperText="Durata di ogni sessione in minuti (es: 60 = 1 ora, 90 = 1.5 ore, 120 = 2 ore)"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline-gold"
              fullWidth
              onClick={onClose}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="gold"
              fullWidth
              loading={loading}
            >
              {loading ? 'Creazione...' : 'Crea Pacchetto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
