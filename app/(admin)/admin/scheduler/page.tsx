'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon,
  ClockIcon,
  MapPinIcon 
} from '@heroicons/react/24/outline'
import api from '@/lib/api'

// --- Types ---
interface Event {
  id: number
  title: string
  start_datetime: string
  end_datetime: string
  capacity: number
  location: string
}

export default function AdminScheduler() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Fetch real data from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        // Connecting to your existing events endpoint
        const response = await api.get('events/events/')
        setEvents(response.data.results || response.data)
      } catch (error) {
        console.error('Failed to fetch schedule:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [currentDate]) // In a real app, you might filter by month here

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    
    const days = []
    // Add empty placeholders for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const days = getDaysInMonth(currentDate)

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime)
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-charcoal-900">Event Scheduler</h1>
          <p className="text-charcoal-600">Manage timelines and check availability.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-white rounded-lg border border-charcoal-200 shadow-sm p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-charcoal-50 rounded-md transition-colors">
              <ChevronLeftIcon className="w-5 h-5 text-charcoal-600" />
            </button>
            <button onClick={goToToday} className="px-4 py-2 text-sm font-medium text-charcoal-900 hover:bg-charcoal-50 rounded-md">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-charcoal-50 rounded-md transition-colors">
              <ChevronRightIcon className="w-5 h-5 text-charcoal-600" />
            </button>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-charcoal-200 flex flex-col overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-charcoal-200 bg-charcoal-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-charcoal-600 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-charcoal-200 gap-px">
          {days.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="bg-charcoal-50/50" />
            
            const dayEvents = getEventsForDate(date)
            const isToday = new Date().toDateString() === date.toDateString()
            const isSelected = selectedDate?.toDateString() === date.toDateString()

            return (
              <div 
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`bg-white p-2 min-h-[120px] relative hover:bg-blue-50/30 transition-colors cursor-pointer ${isSelected ? 'ring-2 ring-inset ring-primary-500' : ''}`}
              >
                {/* Date Number */}
                <div className="flex justify-between items-start mb-2">
                  <span className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                    ${isToday ? 'bg-primary-600 text-white' : 'text-charcoal-700'}
                  `}>
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-1.5 rounded">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Events List */}
                <div className="space-y-1 overflow-y-auto max-h-[100px]">
                  {loading ? (
                    <div className="h-4 bg-charcoal-100 rounded animate-pulse w-3/4"></div>
                  ) : (
                    dayEvents.map(event => (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={event.id}
                        className="text-xs p-1.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-900 truncate group hover:bg-indigo-100"
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-[10px] text-indigo-600 flex items-center mt-0.5">
                          <ClockIcon className="w-3 h-3 mr-1 inline" />
                          {new Date(event.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Selected Date Preview Footer */}
      <div className="mt-4 bg-white p-4 rounded-xl border border-charcoal-200 shadow-sm h-16 flex items-center justify-between">
         <span className="font-medium text-charcoal-900">
            {selectedDate 
                ? selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) 
                : "Select a date to view details"}
         </span>
         {selectedDate && (
             <span className="text-sm text-charcoal-500">
                {getEventsForDate(selectedDate).length} events scheduled
             </span>
         )}
      </div>
    </div>
  )
}