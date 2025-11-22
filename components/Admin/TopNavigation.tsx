'use client'

import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/components/AuthProvider'

export function TopNavigation() {
  const { logout } = useAuth()

  return (
    <header className="bg-white shadow-sm z-10 h-16 flex items-center justify-between px-6 lg:px-8">
      {/* Search Bar */}
      <div className="flex-1 max-w-lg lg:max-w-xs">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-charcoal-400" aria-hidden="true" />
          </div>
          <input
            name="search"
            className="block w-full pl-10 pr-3 py-2 border border-charcoal-200 rounded-lg leading-5 bg-charcoal-50 placeholder-charcoal-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Global search..."
            type="search"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="ml-4 flex items-center space-x-4">
        <button className="p-2 text-charcoal-400 hover:text-charcoal-600 transition-colors relative">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        
        <div className="h-6 w-px bg-charcoal-200" />
        
        <button 
          onClick={logout}
          className="text-sm font-medium text-charcoal-600 hover:text-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}