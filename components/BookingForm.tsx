'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Package {
  id: string
  name: string
  totalSessions: number
  usedSessions: number
}

interface BookingFormProps {
  packages: Package[]
  onSuccess: () => void
}

export default function BookingForm({ packages, onSuccess }: BookingFormProps) {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedDate])

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`/api/available-slots?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.slots)
      }
    } catch (error) {
      console.error('Errore recupero slot:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage,
          date: selectedDate,
          time: selectedTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Errore nella prenotazione')
        return
      }

      setSuccess(true)
      setSelectedDate('')
      setSelectedTime('')
      setSelectedPackage('')
      setAvailableSlots([]) // Reset slot disponibili
      
      // Aggiorna pacchetti
      if (onSuccess) {
        onSuccess()
      }
      
      // Refresh della pagina per aggiornare lista prenotazioni e pacchetti
      router.refresh()

      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError('Errore nella prenotazione')
    } finally {
      setLoading(false)
    }
  }

  const availablePackages = packages.filter(
    pkg => pkg.totalSessions - pkg.usedSessions > 0
  )

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm font-medium">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          ✅ Prenotazione creata con successo! Riceverai una conferma via WhatsApp.
        </div>
      )}

      <div>
        <label htmlFor="package" className="block text-sm font-medium text-gray-700 mb-2">
          Seleziona Pacchetto
        </label>
        <select
          id="package"
          value={selectedPackage}
          onChange={(e) => setSelectedPackage(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">-- Seleziona un pacchetto --</option>
          {availablePackages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} ({pkg.totalSessions - pkg.usedSessions} sessioni rimaste)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Data
        </label>
        <input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={minDate}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {selectedDate && (
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
            Orario
          </label>
          {availableSlots.length === 0 ? (
            <p className="text-gray-500 text-sm">Nessuno slot disponibile per questa data</p>
          ) : (
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">-- Seleziona un orario --</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedPackage || !selectedDate || !selectedTime}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-primary-600 hover:bg-primary-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none" 
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
              />
            </svg>
            Creazione in corso...
          </span>
        ) : (
          'Prenota Sessione'
        )}
      </button>
    </form>
  )
}
