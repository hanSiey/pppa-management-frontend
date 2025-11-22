// app/admin/analytics/page.tsx (Live Data)

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BellIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import api from '@/lib/api'

// --- INTERFACES ---
interface AnalyticsEvent {
    id: number;
    event_type: string;
    user_email: string; 
    timestamp: string;
}

interface NotificationLog {
    id: number;
    type: string;
    channel: string;
    user_email: string; 
    sent_at: string;
}

// --- API ENDPOINTS ---
const API_URLS = {
    ANALYTICS_EVENTS: 'analytics/events/',
    NOTIFICATION_LOGS: 'analytics/notifications/',
    NOTIFICATION_STATS: 'analytics/notifications/notification-stats/',
}

// --- MAIN COMPONENT ---
export default function AdminAnalytics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [notificationStats, setNotificationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'events' | 'notifications'>('events');

  // --- API FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
        // Fetch Events
        const eventsResponse = await api.get(API_URLS.ANALYTICS_EVENTS);
        setEvents(eventsResponse.data.results || eventsResponse.data);

        // Fetch Logs
        const logsResponse = await api.get(API_URLS.NOTIFICATION_LOGS);
        setLogs(logsResponse.data.results || logsResponse.data);
        
        // Fetch Notification Stats
        const statsResponse = await api.get(API_URLS.NOTIFICATION_STATS);
        setNotificationStats(statsResponse.data);

    } catch (error) {
        console.error('Error fetching analytics data:', error);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [])


  return (
    <div className="py-8"> 
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-serif font-bold text-charcoal-900 mb-2">
              Detailed Analytics & Logging
            </h1>
            <p className="text-charcoal-600">
              Inspect raw event data and notification history.
            </p>
          </motion.div>

          <div className="mb-4 border-b border-charcoal-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['events', 'notifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`
                    ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-300'}
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  `}
                >
                  {tab === 'events' ? `Analytics Events (${events.length})` : `Notification Logs (${logs.length})`}
                </button>
              ))}
            </nav>
          </div>

          {loading && <p className='text-center text-charcoal-500'>Loading data...</p>}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            
            {/* --- EVENTS LOG --- */}
            {activeTab === 'events' && !loading && (
                <>
                    <h2 className="text-xl font-bold text-charcoal-900 mb-4">Raw Analytics Event Log</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-charcoal-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Event Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">User Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-charcoal-200">
                                {events.map((event) => (
                                    <tr key={event.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-900">{event.event_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{event.user_email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{new Date(event.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            
            {/* --- NOTIFICATIONS LOGS & STATS --- */}
            {activeTab === 'notifications' && !loading && (
                <div>
                    <h2 className="text-xl font-bold text-charcoal-900 mb-4">Notification Statistics</h2>
                    
                    <div className='grid md:grid-cols-3 gap-4 mb-6'>
                        <div className='bg-primary-50 p-4 rounded-lg'>
                            <p className='text-sm text-primary-700'>Total Sent</p>
                            <p className='text-2xl font-bold text-primary-900'>{notificationStats?.total_sent || 0}</p>
                        </div>
                        <div className='bg-green-50 p-4 rounded-lg'>
                            <p className='text-sm text-green-700'>Sent Today</p>
                            <p className='text-2xl font-bold text-green-900'>{notificationStats?.sent_today || 0}</p>
                        </div>
                        <div className='bg-indigo-50 p-4 rounded-lg'>
                            <p className='text-sm text-indigo-700'>Sent This Week</p>
                            <p className='text-2xl font-bold text-indigo-900'>{notificationStats?.sent_this_week || 0}</p>
                        </div>
                    </div>
                    
                    <h3 className='text-lg font-semibold text-charcoal-900 mb-2'>Breakdown by Type</h3>
                    <ul className='mb-6 space-y-1'>
                        {notificationStats?.by_type?.map((item: any) => (
                             <li key={item.type} className='flex justify-between text-sm text-charcoal-600 border-b border-charcoal-100 py-1'>
                                 <span>{item.type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}:</span>
                                 <span className='font-bold'>{item.count}</span>
                             </li>
                        ))}
                    </ul>

                    <h3 className='text-lg font-semibold text-charcoal-900 mb-2'>Raw Notification Log</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-charcoal-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Channel</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Recipient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Sent At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-charcoal-200">
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-900">{log.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{log.channel}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{log.user_email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{new Date(log.sent_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
          </motion.div>
        </div>
    </div>
  )
}