'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface CreateUserModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessages: Record<number, string> = {
          400: data.details 
            ? `Dati non validi: ${data.details.map((d: any) => d.message).join(', ')}`
            : data.error || 'Verifica i dati inseriti',
          409: 'Un cliente con questa email esiste già',
          500: 'Errore del server. Riprova tra qualche minuto.',
        }
        setError(errorMessages[response.status] || data.error || 'Errore nella creazione del cliente')
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
            Nuovo Cliente
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

          <Input
            id="name"
            type="text"
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            aria-required="true"
          />

          <Input
            id="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            aria-required="true"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
            aria-required="true"
            helperText="Minimo 6 caratteri"
          />

          <Input
            id="phone"
            type="tel"
            label="Telefono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            helperText="Opzionale"
          />

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
              {loading ? 'Creazione...' : 'Crea Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
