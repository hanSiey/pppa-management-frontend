'use client'

import { motion } from 'framer-motion'
import { CalendarIcon, MapPinIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface Event {
  id: number
  title: string
  slug: string
  description: string
  location: string
  start_datetime: string
  end_datetime: string
  capacity: number
  ticket_types: TicketType[]
}

interface TicketType {
  id: number
  name: string
  price: string
  reservation_fee: string
  quantity_available: number
}

interface EventCardProps {
  event: Event
  index?: number
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLowestPrice = () => {
    if (!event.ticket_types || event.ticket_types.length === 0) return '0'
    return Math.min(...event.ticket_types.map(ticket => parseFloat(ticket.price)))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="card overflow-hidden group cursor-pointer"
      onClick={() => window.location.href = `/events/${event.slug}`}
    >
      <div className="md:flex">
        {/* Event Image/Placeholder */}
        <div className="md:w-2/5 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center p-8 group-hover:from-primary-600 group-hover:to-primary-700 transition-all duration-300">
          <div className="text-white text-center">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <p className="text-lg font-semibold">Culinary Experience</p>
            <div className="mt-4 bg-white/20 rounded-full px-4 py-2">
              <span className="text-sm font-medium">From R {getLowestPrice().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="md:w-3/5 p-6">
          <h3 className="text-xl font-serif font-bold text-charcoal-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
            {event.title}
          </h3>
          
          <p className="text-charcoal-600 mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Event Metadata */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-charcoal-600">
              <CalendarIcon className="w-4 h-4 mr-3 text-primary-500 flex-shrink-0" />
              <span className="text-sm">{formatDate(event.start_datetime)}</span>
            </div>
            <div className="flex items-center text-charcoal-600">
              <ClockIcon className="w-4 h-4 mr-3 text-primary-500 flex-shrink-0" />
              <span className="text-sm">
                {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
              </span>
            </div>
            <div className="flex items-center text-charcoal-600">
              <MapPinIcon className="w-4 h-4 mr-3 text-primary-500 flex-shrink-0" />
              <span className="text-sm">{event.location}</span>
            </div>
            <div className="flex items-center text-charcoal-600">
              <UserGroupIcon className="w-4 h-4 mr-3 text-primary-500 flex-shrink-0" />
              <span className="text-sm">{event.capacity} seats</span>
            </div>
          </div>

          {/* Ticket Types Preview */}
          {event.ticket_types && event.ticket_types.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {event.ticket_types.slice(0, 3).map((ticket) => (
                  <span
                    key={ticket.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {ticket.name}
                  </span>
                ))}
                {event.ticket_types.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-600">
                    +{event.ticket_types.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary-600">
              From R {getLowestPrice().toLocaleString()}
            </span>
            <button className="btn-primary text-sm px-4 py-2">
              View Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Skeleton loader for EventCard
export function EventCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="md:flex">
        <div className="md:w-2/5 bg-charcoal-200 h-48"></div>
        <div className="md:w-3/5 p-6">
          <div className="h-6 bg-charcoal-200 rounded mb-3 w-3/4"></div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-charcoal-200 rounded"></div>
            <div className="h-4 bg-charcoal-200 rounded w-5/6"></div>
          </div>
          <div className="space-y-3 mb-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center">
                <div className="w-4 h-4 bg-charcoal-200 rounded mr-3"></div>
                <div className="h-3 bg-charcoal-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-charcoal-200 rounded w-20"></div>
            <div className="h-8 bg-charcoal-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  )
}