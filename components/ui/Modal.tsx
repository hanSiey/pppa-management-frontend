import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`bg-white rounded-xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden`}
            >
              {/* Header - Only show if title or onClose is provided */}
              {(title !== undefined || onClose !== undefined) && (
                <div className="flex items-center justify-between p-6 border-b border-charcoal-100">
                  {title && (
                    <h2 className="text-xl font-serif font-bold text-charcoal-900">
                      {title}
                    </h2>
                  )}
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-charcoal-600" />
                    </button>
                  )}
                </div>
              )}
              
              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}