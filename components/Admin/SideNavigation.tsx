'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider' // Import Auth Hook
import {
  Squares2X2Icon,
  CalendarDaysIcon,
  TicketIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Squares2X2Icon },
  { name: 'Scheduler', href: '/admin/scheduler', icon: CalendarDaysIcon },
  { name: 'Events', href: '/admin/events', icon: CalendarIcon },
  { name: 'Reservations', href: '/admin/reservations', icon: TicketIcon },
  { name: 'Payments', href: '/admin/payments', icon: BanknotesIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
]

export function SideNavigation() {
  const pathname = usePathname()
  const { user } = useAuth() // Get current authenticated user

  return (
    // FIX: Changed 'flex md:flex-col' to 'flex flex-col' so it is vertical on ALL screens.
    // Added 'h-full' and 'w-full' to ensure it fills the parent container (mobile drawer or desktop sidebar).
    <div className="flex flex-col h-full w-full md:w-64 bg-charcoal-900 border-r border-charcoal-800">
      <div className="flex items-center justify-center h-16 px-4 bg-charcoal-950 shadow-sm flex-shrink-0">
        <h1 className="text-white font-serif font-bold text-lg tracking-wider">
          PPPA <span className="text-primary-500">ADMIN</span>
        </h1>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-charcoal-800 hover:text-white' 
                  }
                `}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} 
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="flex-shrink-0 flex border-t border-charcoal-800 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold font-serif">
              {/* Dynamic Initial */}
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              {/* Dynamic User Name */}
              <p className="text-sm font-medium text-white truncate">
                {user?.full_name || 'Guest User'}
              </p>
              {/* Dynamic Email */}
              <p className="text-xs font-medium text-gray-400 truncate">
                {user?.email || 'Not signed in'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}