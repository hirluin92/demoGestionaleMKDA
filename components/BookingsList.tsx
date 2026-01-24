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

  useEffect(() => {
    fetchBookings()
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

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchBookings()
        if (onCancel) {
          onCancel()
        }
      } else {
        alert('Errore nella cancellazione della prenotazione')
      }
    } catch (error) {
      console.error('Errore cancellazione:', error)
      alert('Errore nella cancellazione della prenotazione')
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
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancella prenotazione"
                    >
                      <X className="w-5 h-5" />
                    </button>
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
