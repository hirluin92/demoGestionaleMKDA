'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, X } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale/it'

interface Booking {
  id: string
  date: string
  time: string
  status: string
  package: {
    name: string
  }
}

interface BookingsListProps {
  onCancel?: () => void
  showCountOnly?: boolean
}

export default function BookingsList({ onCancel, showCountOnly }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  // Ascolta eventi di refresh (da BookingForm o cancellazioni)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleRefresh = () => {
        fetchBookings()
      }
      window.addEventListener('booking-created', handleRefresh)
      window.addEventListener('booking-cancelled', handleRefresh)
      return () => {
        window.removeEventListener('booking-created', handleRefresh)
        window.removeEventListener('booking-cancelled', handleRefresh)
      }
    }
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Errore recupero prenotazioni:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelClick = (bookingId: string) => {
    setConfirmingDelete(bookingId)
  }

  const handleConfirmDelete = async (bookingId: string) => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Errore nella cancellazione')
      }

      fetchBookings()
      if (onCancel) {
        onCancel()
      }
      
      // Trigger evento per aggiornare altri componenti
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('booking-cancelled'))
      }
      
      setConfirmingDelete(null)
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Errore nella cancellazione della prenotazione')
    } finally {
      setIsDeleting(false)
    }
  }

  if (showCountOnly) {
    return <>{bookings.length}</>
  }

  if (loading) {
    return <p className="text-gray-500">Caricamento prenotazioni...</p>
  }

  if (bookings.length === 0) {
    return <p className="text-gray-500">Nessuna prenotazione</p>
  }

  const upcomingBookings = bookings
    .filter(b => new Date(b.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const pastBookings = bookings
    .filter(b => new Date(b.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      {upcomingBookings.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Prossime Prenotazioni</h4>
          <div className="space-y-3">
            {upcomingBookings.map((booking) => {
              const bookingDate = new Date(booking.date)
              const isPast = bookingDate < new Date()

              return (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(bookingDate, "EEEE d MMMM yyyy", { locale: it })}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{booking.time}</span>
                        <span className="mx-2">•</span>
                        <span>{booking.package.name}</span>
                      </div>
                    </div>
                  </div>
                  {!isPast && (
                    <div>
                      {confirmingDelete === booking.id ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-yellow-800 mb-2">
                            ⚠️ Confermi la cancellazione?
                          </p>
                          <p className="text-xs text-yellow-700 mb-3">
                            La sessione verrà restituita al tuo pacchetto.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfirmDelete(booking.id)}
                              disabled={isDeleting}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {isDeleting ? 'Cancellazione...' : 'Sì, cancella'}
                            </button>
                            <button
                              onClick={() => setConfirmingDelete(null)}
                              disabled={isDeleting}
                              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
                            >
                              Annulla
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCancelClick(booking.id)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancella prenotazione"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {pastBookings.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Prenotazioni Passate</h4>
          <div className="space-y-3">
            {pastBookings.map((booking) => {
              const bookingDate = new Date(booking.date)

              return (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 flex items-center justify-between opacity-60"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(bookingDate, "EEEE d MMMM yyyy", { locale: it })}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{booking.time}</span>
                        <span className="mx-2">•</span>
                        <span>{booking.package.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
