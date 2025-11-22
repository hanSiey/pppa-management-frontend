'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface EventData {
  title: string
  description: string
  start_datetime: string
  end_datetime: string
  location: string
  address: string
}

interface CalendarIntegrationProps {
  event: EventData
  reservationReference?: string
}

export default function CalendarIntegration({ event, reservationReference }: CalendarIntegrationProps) {
  const [showOptions, setShowOptions] = useState(false)

  const generateICSFile = () => {
    const startTime = new Date(event.start_datetime).toISOString().replace(/-|:|\.\d+/g, '')
    const endTime = new Date(event.end_datetime).toISOString().replace(/-|:|\.\d+/g, '')
    const now = new Date().toISOString().replace(/-|:|\.\d+/g, '')

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Parliament of Plating//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${reservationReference || 'event'}@parliamentplating.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}\\nReservation: ${reservationReference || 'N/A'}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reservation-${reservationReference || 'event'}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getGoogleCalendarUrl = () => {
    const startTime = new Date(event.start_datetime).toISOString().replace(/-|:|\.\d+/g, '')
    const endTime = new Date(event.end_datetime).toISOString().replace(/-|:|\.\d+/g, '')

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startTime}/${endTime}`,
      details: `${event.description}\n\nReservation: ${reservationReference || 'N/A'}`,
      location: event.address || event.location,
      ctz: 'Africa/Johannesburg'
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  const getOutlookCalendarUrl = () => {
    const startTime = encodeURIComponent(new Date(event.start_datetime).toISOString())
    const endTime = encodeURIComponent(new Date(event.end_datetime).toISOString())

    const params = new URLSearchParams({
      path: '/calendar/0/deeplink/compose',
      rru: 'addevent',
      startdt: startTime,
      enddt: endTime,
      subject: encodeURIComponent(event.title),
      body: encodeURIComponent(`${event.description}\n\nReservation: ${reservationReference || 'N/A'}`),
      location: encodeURIComponent(event.address || event.location)
    })

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
  }

  const calendarOptions = [
    {
      name: 'Google Calendar',
      description: 'Add directly to your Google Calendar',
      icon: ComputerDesktopIcon,
      action: () => window.open(getGoogleCalendarUrl(), '_blank'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Outlook Calendar',
      description: 'Add to Outlook or Microsoft 365',
      icon: ComputerDesktopIcon,
      action: () => window.open(getOutlookCalendarUrl(), '_blank'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Apple Calendar',
      description: 'Download .ics file for Apple devices',
      icon: DevicePhoneMobileIcon,
      action: generateICSFile,
      color: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Download .ICS',
      description: 'Universal calendar file for any application',
      icon: ArrowDownTrayIcon,
      action: generateICSFile,
      color: 'from-green-500 to-green-600'
    }
  ]

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="btn-secondary w-full flex items-center justify-center space-x-2"
      >
        <CalendarIcon className="w-5 h-5" />
        <span>Add to Calendar</span>
      </button>

      {/* Dropdown Options */}
      {showOptions && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-charcoal-100 z-10 overflow-hidden"
        >
          <div className="p-2">
            {calendarOptions.map((option, index) => (
              <motion.button
                key={option.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  option.action()
                  setShowOptions(false)
                }}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-charcoal-50 rounded-lg transition-colors group"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${option.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <option.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-900 group-hover:text-primary-600 transition-colors">
                    {option.name}
                  </p>
                  <p className="text-sm text-charcoal-600 truncate">
                    {option.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Close when clicking outside */}
      {showOptions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  )
}

// Simplified version for inline use
export function CalendarButton({ event, reservationReference }: CalendarIntegrationProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleQuickAdd = () => {
    // Simple ICS download as default action
    const startTime = new Date(event.start_datetime).toISOString().replace(/-|:|\.\d+/g, '')
    const endTime = new Date(event.end_datetime).toISOString().replace(/-|:|\.\d+/g, '')
    const now = new Date().toISOString().replace(/-|:|\.\d+/g, '')

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Parliament of Plating//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${reservationReference || 'event'}@parliamentplating.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `event-${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setShowTooltip(true)
    setTimeout(() => setShowTooltip(false), 2000)
  }

  return (
    <div className="relative">
      <button
        onClick={handleQuickAdd}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center space-x-2 text-charcoal-600 hover:text-primary-600 transition-colors group"
      >
        <CalendarIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Add to Calendar</span>
      </button>

      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 bg-charcoal-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10"
        >
          .ICS file downloaded
          <div className="absolute bottom-full left-4 w-2 h-2 bg-charcoal-900 transform rotate-45"></div>
        </motion.div>
      )}
    </div>
  )
}