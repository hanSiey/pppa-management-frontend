'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import { useAuth } from './AuthProvider'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-charcoal-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <a href="/" className="text-2xl font-serif font-bold text-charcoal-900">
             PPPA
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-charcoal-700 hover:text-primary-500 font-medium transition-colors"
              >
                {item.name}
              </a>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <a
                  href="/profile/reservations"
                  className="flex items-center text-charcoal-700 hover:text-primary-500 font-medium"
                >
                  <UserIcon className="w-5 h-5 mr-2" />
                  My Reservations
                </a>
                {user.role === 'admin' && (
                  <a
                    href="/admin/dashboard"
                    className="text-charcoal-700 hover:text-primary-500 font-medium"
                  >
                    Admin
                  </a>
                )}
                <button
                  onClick={handleLogout}
                  className="text-charcoal-700 hover:text-primary-500 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a href="/login" className="text-charcoal-700 hover:text-primary-500 font-medium">
                  Sign In
                </a>
                <a href="/register" className="btn-primary">
                  Sign Up
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-charcoal-700"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-charcoal-100"
          >
            <div className="px-4 py-4 space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-charcoal-700 hover:text-primary-500 font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              
              {user ? (
                <>
                  <a
                    href="/profile/reservations"
                    className="block text-charcoal-700 hover:text-primary-500 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    My Reservations
                  </a>
                  {user.role === 'admin' && (
                    <a
                      href="/admin/dashboard"
                      className="block text-charcoal-700 hover:text-primary-500 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-charcoal-700 hover:text-primary-500 font-medium py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="block text-charcoal-700 hover:text-primary-500 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    className="block btn-primary w-full text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}