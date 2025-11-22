'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  TicketIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'
import api from '@/lib/api' 

// --- Interface Definitions ---
interface PendingProof {
  id: number
  uploaded_at: string
  reservation__reference_code: string
  reservation__total_amount: number
  amount: number
}

interface UpcomingEvent {
    id: number
    title: string
    start_datetime: string
    capacity: number
    location: string
    slug: string
}

interface RevenuePoint {
  date: string
  total: number
}

interface StatusPoint {
    status: string
    count: number
}

interface DashboardStats {
  total_events: number
  total_reservations: number
  total_revenue: number
  total_users: number
  pending_approvals_count: number
  upcoming_events_count: number
  upcoming_events_list: UpcomingEvent[]
  
  revenue_trend: RevenuePoint[]
  reservation_status_breakdown: StatusPoint[]
  pending_proofs_list: PendingProof[]
}

// --- Chart Components ---

const RevenueChart = ({ data }: { data: RevenuePoint[] }) => {
    // Parse total to number to handle Decimal/string types from API
    const safeData = data.map(d => ({ ...d, total: Number(d.total) }));
    
    // Calculate max value for bar height scaling
    const maxVal = safeData.length > 0 
        ? Math.max(...safeData.map(d => d.total)) 
        : 100;
    
    // Show last 14 active days for clarity
    const displayData = safeData.slice(-14); 

    return (
        <div className="card p-6 h-96 flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal-900 flex items-center">
                        <CurrencyDollarIcon className="w-6 h-6 mr-2 text-primary-600"/>
                        Revenue Trend
                    </h2>
                    <p className="text-xs text-charcoal-500">Daily income (Recorded)</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" /> Live
                </span>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-2 min-h-0">
                {displayData.length > 0 ? displayData.map((point, index) => {
                    // Protect against division by zero if maxVal is 0
                    const safeMax = maxVal === 0 ? 1 : maxVal;
                    const heightPercent = (point.total / safeMax) * 100;
                    const dateLabel = new Date(point.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                    
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 pointer-events-none">
                                R {point.total.toLocaleString()}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-charcoal-900"></div>
                            </div>
                            
                            {/* Bar */}
                            <div 
                                className="w-full bg-primary-100 hover:bg-primary-500 transition-all duration-300 rounded-t-md relative overflow-hidden"
                                style={{ height: `${Math.max(heightPercent, 5)}%` }}
                            >
                                <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-primary-200 to-transparent opacity-50"></div>
                            </div>
                            
                            {/* Label */}
                            <span className="text-[10px] text-charcoal-400 mt-2 rotate-0 sm:rotate-0 overflow-hidden text-ellipsis w-full text-center">
                                {dateLabel}
                            </span>
                        </div>
                    )
                }) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal-400 italic">
                        No revenue data recorded.
                    </div>
                )}
            </div>
        </div>
    )
}

const ReservationHealthChart = ({ data }: { data: StatusPoint[] }) => {
    const total = data.reduce((acc, curr) => acc + curr.count, 0);
    
    const getColor = (status: string) => {
        switch(status) {
            case 'completed': return 'bg-green-500';
            case 'confirmed': return 'bg-blue-500';
            case 'paid': return 'bg-green-600';
            case 'pending': return 'bg-orange-500';
            case 'reserved': return 'bg-yellow-400';
            case 'cancelled': return 'bg-red-400';
            default: return 'bg-gray-300';
        }
    };

    const getLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <div className="card p-6 h-96 flex flex-col">
            <div className="mb-6">
                <h2 className="text-xl font-serif font-bold text-charcoal-900 flex items-center">
                    <ChartPieIcon className="w-6 h-6 mr-2 text-indigo-600"/>
                    Reservation Health
                </h2>
                <p className="text-xs text-charcoal-500">Distribution by current status</p>
            </div>

            <div className="flex-1 flex flex-col justify-center overflow-y-auto pr-2">
                {data.length > 0 ? (
                    <div className="space-y-4">
                        {data.map((item) => (
                            <div key={item.status}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-charcoal-700 capitalize">{getLabel(item.status)}</span>
                                    <span className="text-charcoal-500">{item.count} ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)</span>
                                </div>
                                <div className="w-full bg-charcoal-100 rounded-full h-2.5 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-2.5 rounded-full ${getColor(item.status)}`}
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-charcoal-400 italic">No reservations yet.</div>
                )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-charcoal-100 flex justify-between text-xs text-charcoal-500">
                <span>Total Volume</span>
                <span className="font-bold text-charcoal-900">{total} Reservations</span>
            </div>
        </div>
    )
}

function DashboardSkeleton() {
    return (
    <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
            <div className="animate-pulse">
                <div className="h-8 bg-charcoal-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-charcoal-200 rounded w-96 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="card p-6 h-32 bg-charcoal-50"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}

// --- Main Dashboard Component ---

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('analytics/dashboard/')
      setStats(response.data)
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error)
      if (error.response && error.response.status === 403) {
        setPermissionDenied(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Events',
      value: stats?.total_events || 0,
      icon: CalendarIcon,
      color: 'blue',
      link: '/admin/events'
    },
    {
      title: 'Total Reservations',
      value: stats?.total_reservations || 0,
      icon: TicketIcon,
      color: 'green',
      link: '/admin/reservations'
    },
    {
      title: 'Total Revenue (R)',
      value: `R ${stats?.total_revenue?.toLocaleString() || '0'}`,
      icon: CurrencyDollarIcon,
      color: 'yellow',
      link: '/admin/payments'
    },
    {
      title: 'Registered Users',
      value: stats?.total_users || 0,
      icon: UserGroupIcon,
      color: 'indigo',
      link: '/admin/users'
    },
    {
      title: 'Pending Approvals',
      value: stats?.pending_approvals_count || 0,
      icon: DocumentCheckIcon,
      color: 'orange',
      link: '/admin/reservations'
    },
    {
      title: 'Upcoming Events',
      value: stats?.upcoming_events_count || 0,
      icon: CalendarIcon,
      color: 'purple',
      link: '/admin/events'
    },
  ]

  if (loading) return <DashboardSkeleton />
  
  if (permissionDenied) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center card p-10">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-charcoal-900 mb-2">Permission Denied (403)</h1>
          <p className="text-charcoal-600">
            You do not have the required staff privileges to access this dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8"> 
        <div className="max-w-7xl mx-auto px-4">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <h1 className="text-3xl font-serif font-bold text-charcoal-900 mb-2">
            Management Dashboard
            </h1>
            <p className="text-charcoal-600">
            Overview of system performance and activities.
            </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => (
            <motion.a
                key={stat.title}
                href={stat.link}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 transition-all hover:shadow-lg hover:border-primary-300 flex items-center justify-between group"
            >
                <div>
                    <p className="text-sm font-medium text-charcoal-600 mb-1">
                    {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-charcoal-900">
                    {stat.value}
                    </p>
                </div>
                <div className='flex items-center space-x-3'>
                    <div className={`p-3 rounded-lg bg-${stat.color}-100 group-hover:bg-${stat.color}-200 transition-colors`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} /> 
                    </div>
                </div>
            </motion.a>
            ))}
        </div>
        
        {/* Analytics / Charts Row - REDESIGNED */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-8 mb-8"
        >
            <RevenueChart data={stats?.revenue_trend || []} />
            <ReservationHealthChart data={stats?.reservation_status_breakdown || []} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-2 gap-8"
        >
            {/* Pending Approvals */}
            <div className="card p-6 flex flex-col">
                <h2 className="text-xl font-serif font-bold text-charcoal-900 mb-4 flex items-center justify-between">
                    <span>Pending Approvals</span>
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{stats?.pending_approvals_count}</span>
                </h2>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-80">
                    {stats?.pending_proofs_list && stats.pending_proofs_list.length > 0 ? (
                    stats.pending_proofs_list.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div>
                            <p className="font-bold text-charcoal-900 text-sm">Ref: {item.reservation__reference_code}</p>
                            <p className="text-xs text-charcoal-600 mt-1">
                                Paid: R {Number(item.amount).toLocaleString()} 
                                <span className="mx-1">•</span> 
                                Total: R {item.reservation__total_amount.toLocaleString()}
                            </p>
                        </div>
                        <a href="/admin/reservations" className="text-orange-600 hover:text-orange-800 text-xs font-bold uppercase">
                            Review
                        </a>
                        </div>
                    ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-charcoal-400">
                            <DocumentCheckIcon className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm">No pending approvals.</p>
                        </div>
                    )}
                </div>
                {stats?.pending_proofs_list && stats.pending_proofs_list.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-charcoal-100 text-center">
                        <a href="/admin/reservations" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center">
                            View All Requests <ArrowRightIcon className="w-4 h-4 ml-1"/>
                        </a>
                    </div>
                )}
            </div>

            {/* Upcoming Events - Dynamic Data */}
            <div className="card p-6 flex flex-col">
                <h2 className="text-xl font-serif font-bold text-charcoal-900 mb-4 flex items-center justify-between">
                    <span>Upcoming Events</span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">{stats?.upcoming_events_count}</span>
                </h2>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-80">
                    {stats?.upcoming_events_list && stats.upcoming_events_list.length > 0 ? (
                        stats.upcoming_events_list.map((event) => (
                            <div key={event.id} className="p-3 bg-white border border-charcoal-200 rounded-lg hover:border-purple-300 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-charcoal-900 line-clamp-1">{event.title}</p>
                                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded whitespace-nowrap ml-2">
                                        {new Date(event.start_datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-xs text-charcoal-500 mt-1 flex items-center">
                                    <span className="truncate">{event.location}</span>
                                </p>
                                <div className="w-full bg-charcoal-100 rounded-full h-1.5 mt-3">
                                    <div 
                                        className="bg-purple-500 h-1.5 rounded-full" 
                                        style={{ width: `${Math.min(100, (event.capacity / event.capacity) * 100)}%` }} 
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-charcoal-400">
                                    <span>Capacity: {event.capacity}</span>
                                    <a href={`/admin/events`} className="text-purple-600 hover:text-purple-800 hidden group-hover:inline">Manage</a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-charcoal-400">
                            <CalendarIcon className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm">No upcoming events scheduled.</p>
                        </div>
                    )}
                </div>
                {stats?.upcoming_events_list && stats.upcoming_events_list.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-charcoal-100 text-center">
                        <a href="/admin/events" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center">
                            Manage Events <ArrowRightIcon className="w-4 h-4 ml-1"/>
                        </a>
                    </div>
                )}
            </div>
        </motion.div>

        </div>
    </div>
  )
}