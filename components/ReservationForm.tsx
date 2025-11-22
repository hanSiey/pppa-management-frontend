'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'

interface TicketType {
  id: number
  name: string
  price: string
  reservation_fee: string
  quantity_available: number
}

interface Event {
  id: number
  title: string
  start_datetime: string
}

interface ReservationFormProps {
  event: Event
  ticketType: TicketType
  onReservationComplete: (reservationData: any) => void
  onCancel: () => void
}

interface FormData {
  full_name: string
  email: string
  phone_number: string
  quantity: number
  special_requests: string
}

export default function ReservationForm({
  event,
  ticketType,
  onReservationComplete,
  onCancel
}: ReservationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone_number: '',
    quantity: 1,
    special_requests: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const calculateTotal = () => {
    return parseFloat(ticketType.price) * formData.quantity
  }

  const calculateReservationFee = () => {
    return parseFloat(ticketType.reservation_fee) * formData.quantity
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Here you would make the API call to create the reservation
      const reservationData = {
        event: event.id,
        ticket_type: ticketType.id,
        quantity: formData.quantity,
        guest_email: formData.email,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        special_requests: formData.special_requests,
        total_amount: calculateTotal(),
        reservation_fee: calculateReservationFee()
      }

      // Simulate API call
      // const response = await api.post('/reservations/reservations/', reservationData)
      
      // For now, we'll simulate success
      setTimeout(() => {
        onReservationComplete({
          ...reservationData,
          reference_code: 'PP' + Date.now(),
          reserved_at: new Date().toISOString()
        })
      }, 1000)

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create reservation')
    } finally {
      setLoading(false)
    }
  }

  const quantityOptions = Array.from(
    { length: Math.min(10, ticketType.quantity_available) },
    (_, i) => i + 1
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-charcoal-100">
          <h2 className="text-2xl font-serif font-bold text-charcoal-900">
            Complete Your Reservation
          </h2>
          <p className="text-charcoal-600 mt-1">{event.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Ticket Summary */}
            <div className="md:col-span-2 bg-charcoal-50 rounded-lg p-4">
              <h3 className="font-semibold text-charcoal-900 mb-2">Reservation Summary</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-charcoal-900 font-medium">{ticketType.name}</p>
                  <p className="text-sm text-charcoal-600">
                    {formData.quantity} {formData.quantity === 1 ? 'ticket' : 'tickets'} × R {parseFloat(ticketType.price).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    R {calculateTotal().toLocaleString()}
                  </p>
                  <p className="text-sm text-charcoal-600">
                    Due now: R {calculateReservationFee().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="md:col-span-2">
              <label htmlFor="quantity" className="block text-sm font-medium text-charcoal-700 mb-2">
                Number of Tickets
              </label>
              <select
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field"
              >
                {quantityOptions.map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'ticket' : 'tickets'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-charcoal-500 mt-1">
                {ticketType.quantity_available} tickets available
              </p>
            </div>

            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Personal Information</h3>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-charcoal-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-5 h-5 text-charcoal-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 text-charcoal-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-charcoal-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="w-5 h-5 text-charcoal-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div className="md:col-span-2">
              <label htmlFor="special_requests" className="block text-sm font-medium text-charcoal-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                id="special_requests"
                name="special_requests"
                rows={3}
                value={formData.special_requests}
                onChange={handleChange}
                className="input-field resize-none"
                placeholder="Any dietary requirements or special requests..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-charcoal-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-charcoal-300 text-charcoal-700 rounded-lg hover:bg-charcoal-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}