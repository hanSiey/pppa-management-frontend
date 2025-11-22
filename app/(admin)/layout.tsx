'use client'

import '../globals.css'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Inter, Playfair_Display } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { AuthProvider } from '@/components/AuthProvider'
import { SideNavigation } from '@/components/Admin/SideNavigation'
import { TopNavigation } from '@/components/Admin/TopNavigation'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar automatically when route changes (user clicks a link)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-charcoal-50 text-charcoal-900 antialiased">
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            
            {/* --- Mobile Sidebar Drawer (Slide-over) --- */}
            <AnimatePresence>
              {isSidebarOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm z-40 md:hidden"
                  />
                  
                  {/* Drawer Content */}
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                    className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl md:hidden flex flex-col"
                  >
                    <div className="flex items-center justify-end p-4 border-b border-charcoal-100">
                      <button 
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-md text-charcoal-500 hover:bg-charcoal-100"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>
                    
                    {/* Render the Navigation Links here for Mobile */}
                    <div className="flex-1 overflow-y-auto">
                        <SideNavigation />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* --- Desktop Sidebar --- */}
            {/* We hide this container on mobile (hidden) and show on medium screens (md:flex) */}
            <div className="hidden md:flex md:flex-shrink-0">
               <SideNavigation />
            </div>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              
              {/* --- Mobile Header (Hamburger Menu) --- */}
              {/* Only visible on mobile (md:hidden) */}
              <div className="md:hidden bg-white border-b border-charcoal-200 p-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="-ml-2 p-2 rounded-md text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-900 focus:outline-none"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <span className="ml-3 text-lg font-serif font-bold text-charcoal-900">Admin Portal</span>
                </div>
              </div>

              {/* Dedicated Admin Header (TopNavigation) */}
              {/* You can choose to hide this on mobile if it duplicates info, or keep it */}
              <TopNavigation />

              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                {children}
              </main>
              
              {/* Dedicated Admin Footer */}
              <footer className="bg-white border-t border-charcoal-200 py-4 px-8 text-xs text-charcoal-500 text-center hidden md:block">
                <p>PPPA Admin Portal • System Version 2.1.0 • Authorized Personnel Only</p>
              </footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}