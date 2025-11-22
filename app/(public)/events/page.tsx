'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  MagnifyingGlassIcon,
  ArrowRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import api from '@/lib/api'

interface Event {
  id: number
  title: string
  slug: string
  description: string | null
  location: string
  address: string
  start_datetime: string
  end_datetime: string
  capacity: number
  published: boolean
  ticket_types: TicketType[]
}

interface TicketType {
  id: number
  name: string
  price: string
  reservation_fee: string
  quantity_available: number
}

// Helper to safe truncate
const safeTruncate = (text: string | null, limit: number): string => {
    const safeText = text || '';
    if (safeText.length > limit) {
        return `${safeText.substring(0, limit)}...`;
    }
    return safeText;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    start_date: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [filters.location, filters.start_date]) // Auto-fetch on filter change (excluding text search for debounce behavior if desired, but here we keep it simple)

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.location) params.append('location', filters.location)
      if (filters.start_date) params.append('start_date', filters.start_date)
      // Note: We can add a 'search' param if the backend supports ?search=...
      
      const response = await api.get(`events/events/?${params.toString()}`)
      setEvents(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter client-side for text search if backend doesn't support it, 
  // or just to refine the displayed list.
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(filters.search.toLowerCase()))
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
        month: date.toLocaleString('default', { month: 'short' }),
        day: date.getDate(),
        time: date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (loading) return <EventListSkeleton />

  return (
    <div className="min-h-screen bg-charcoal-50 font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-charcoal-900 text-white pb-32 pt-20 overflow-hidden">
         {/* Background Elements */}
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-500 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-600 blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
         </div>

         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-serif font-bold mb-6"
            >
                Curated Culinary Events
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-charcoal-300 max-w-2xl mx-auto leading-relaxed"
            >
                Discover extraordinary dining experiences merging South African heritage with world-class gastronomy.
            </motion.p>
         </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 z-20 mb-16">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-2xl shadow-xl shadow-charcoal-900/5 border border-charcoal-100 flex flex-col md:flex-row gap-4 items-center"
         >
            <div className="flex-1 w-full relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                    type="text" 
                    placeholder="Search events..." 
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 bg-charcoal-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-charcoal-900 placeholder-charcoal-400"
                />
            </div>
            <div className="w-full md:w-auto flex gap-4">
                <div className="relative flex-1 md:w-48">
                    <MapPinIcon className="w-5 h-5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Location" 
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
                        className="w-full pl-10 pr-4 py-3 bg-charcoal-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-charcoal-900 placeholder-charcoal-400"
                    />
                </div>
                <div className="relative flex-1 md:w-48">
                    <CalendarIcon className="w-5 h-5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="date" 
                        value={filters.start_date}
                        onChange={(e) => setFilters(prev => ({...prev, start_date: e.target.value}))}
                        className="w-full pl-10 pr-4 py-3 bg-charcoal-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-charcoal-900 placeholder-charcoal-400"
                    />
                </div>
            </div>
         </motion.div>
      </div>

      {/* --- EVENTS GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
         {filteredEvents.length > 0 ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event, index) => {
                    const date = formatDate(event.start_datetime);
                    const minPrice = event.ticket_types?.length > 0 
                        ? Math.min(...event.ticket_types.map(t => parseFloat(t.price))) 
                        : 0;

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-2xl overflow-hidden border border-charcoal-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            {/* Image Placeholder / Gradient */}
                            <div className="h-48 bg-gradient-to-br from-charcoal-800 to-charcoal-900 relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors"></div>
                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                                    {event.capacity} Spots
                                </div>
                                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary-500/20 rounded-full blur-xl group-hover:bg-primary-500/30 transition-all"></div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col relative">
                                {/* Date Badge */}
                                <div className="absolute -top-8 left-6 bg-white rounded-xl shadow-lg p-3 text-center border border-charcoal-50 w-16">
                                    <span className="block text-xs uppercase font-bold text-primary-600">{date.month}</span>
                                    <span className="block text-xl font-serif font-bold text-charcoal-900">{date.day}</span>
                                </div>

                                <div className="mt-4 mb-4">
                                    <h3 className="text-xl font-serif font-bold text-charcoal-900 mb-2 group-hover:text-primary-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center text-charcoal-500 text-sm mb-3">
                                        <MapPinIcon className="w-4 h-4 mr-1" />
                                        {event.location}
                                    </div>
                                    <p className="text-charcoal-600 text-sm line-clamp-3 mb-4">
                                        {safeTruncate(event.description, 120)}
                                    </p>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-charcoal-50 flex items-center justify-between">
                                    <div>
                                        <span className="block text-xs text-charcoal-400">From</span>
                                        <span className="font-bold text-primary-600">
                                            {minPrice > 0 ? `R ${minPrice.toLocaleString()}` : 'Free'}
                                        </span>
                                    </div>
                                    <a 
                                        href={`/events/${event.slug}`}
                                        className="w-10 h-10 rounded-full bg-charcoal-50 flex items-center justify-center text-charcoal-900 group-hover:bg-charcoal-900 group-hover:text-white transition-all"
                                    >
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
             </div>
         ) : (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
             >
                <div className="w-20 h-20 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FunnelIcon className="w-8 h-8 text-charcoal-400" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-2">No Events Found</h3>
                <p className="text-charcoal-500 max-w-md mx-auto">
                    We couldn't find any events matching your filters. Try adjusting your search terms or check back later.
                </p>
                <button 
                    onClick={() => setFilters({ search: '', location: '', start_date: '' })}
                    className="mt-6 text-primary-600 font-medium hover:text-primary-700"
                >
                    Clear all filters
                </button>
             </motion.div>
         )}
      </div>
    </div>
  )
}

function EventListSkeleton() {
  return (
    <div className="min-h-screen bg-charcoal-50">
        <div className="bg-charcoal-900 h-[400px] w-full animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-10">
            <div className="bg-white h-20 rounded-2xl shadow-lg animate-pulse mb-16"></div>
            <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl h-[400px] shadow-sm animate-pulse border border-charcoal-100">
                        <div className="h-48 bg-charcoal-100"></div>
                        <div className="p-6 space-y-4">
                            <div className="h-6 bg-charcoal-100 rounded w-3/4"></div>
                            <div className="h-4 bg-charcoal-100 rounded w-1/2"></div>
                            <div className="h-4 bg-charcoal-100 rounded w-full"></div>
                            <div className="h-4 bg-charcoal-100 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}