'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  MapPinIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import api from '@/lib/api'

interface Reservation {
  id: number
  reference_code: string
  status: string
  quantity: number
  total_amount: string
  amount_paid: string
  reserved_at: string
  expires_at: string
  event_title: string
  event_location: string
  event_start_datetime: string
  ticket_type_name: string
}

export default function UserReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations/reservations/')
      setReservations(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'reserved':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      case 'pending':
        return <DocumentMagnifyingGlassIcon className="w-5 h-5 text-orange-500" />
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
      if (status === 'pending') return 'Pending Verification';
      return status.charAt(0).toUpperCase() + status.slice(1);
  }

  if (loading) return <ReservationsSkeleton />

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-charcoal-900 mb-2">
            My Reservations
          </h1>
          <p className="text-charcoal-600">
            Manage your upcoming culinary experiences
          </p>
        </motion.div>

        <div className="space-y-6">
          {reservations.map((reservation, index) => (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  {getStatusIcon(reservation.status)}
                  <div>
                    <h3 className="text-xl font-serif font-bold text-charcoal-900">
                      {reservation.event_title}
                    </h3>
                    <p className="text-charcoal-600">
                      {reservation.quantity} {reservation.quantity === 1 ? 'ticket' : 'tickets'} • {reservation.ticket_type_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                    {getStatusText(reservation.status)}
                  </span>
                  <a
                    href={`/reservations/${reservation.reference_code}`}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    View Details
                  </a>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-charcoal-600">
                  <CalendarIcon className="w-4 h-4 mr-2 text-primary-500" />
                  <span>
                    {reservation.event_start_datetime ? new Date(reservation.event_start_datetime).toLocaleDateString() : 'TBA'}
                  </span>
                </div>
                <div className="flex items-center text-charcoal-600">
                  <MapPinIcon className="w-4 h-4 mr-2 text-primary-500" />
                  <span>
                    {reservation.event_location || 'Location TBA'}
                  </span>
                </div>
                <div className="flex items-center text-charcoal-600">
                  <CreditCardIcon className="w-4 h-4 mr-2 text-primary-500" />
                  <span>
                    R {parseFloat(reservation.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>

              {reservation.status === 'reserved' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Action required:</strong> Please complete your payment to secure your reservation.
                    Reservation expires {new Date(reservation.expires_at).toLocaleString()}
                  </p>
                </div>
              )}
              
              {reservation.status === 'pending' && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 text-sm">
                    <strong>Status Update:</strong> Your payment proof is under review. We will notify you once confirmed.
                  </p>
                </div>
              )}
            </motion.div>
          ))}

          {reservations.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <CalendarIcon className="w-24 h-24 text-charcoal-300 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-charcoal-600 mb-2">
                No Reservations Yet
              </h3>
              <p className="text-charcoal-500 mb-6">
                Start your culinary journey by exploring our upcoming events.
              </p>
              <a href="/events" className="btn-primary">
                Browse Events
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReservationsSkeleton() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="animate-pulse mb-8">
          <div className="h-10 bg-charcoal-200 rounded w-64 mb-2"></div>
          <div className="h-6 bg-charcoal-200 rounded w-96"></div>
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="card p-6 animate-pulse">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="w-5 h-5 bg-charcoal-200 rounded"></div>
                  <div>
                    <div className="h-6 bg-charcoal-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-charcoal-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-6 bg-charcoal-200 rounded w-20"></div>
                  <div className="h-8 bg-charcoal-200 rounded w-24"></div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map((icon) => (
                  <div key={icon} className="flex items-center">
                    <div className="w-4 h-4 bg-charcoal-200 rounded mr-2"></div>
                    <div className="h-4 bg-charcoal-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}