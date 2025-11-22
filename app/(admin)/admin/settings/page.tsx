'use client'

import { motion } from 'framer-motion'
import {
  Cog6ToothIcon,
  ArrowPathIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

// --- MAIN COMPONENT ---
export default function AdminSettings() {
  
    // Placeholder API actions
    const handleClearCache = () => { alert('API call to clear cache initiated (mocked).'); };
    const handleUpdateSystem = () => { alert('API call to update system initiated (mocked).'); };

  return (
    <div className="py-8"> 
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold text-charcoal-900 mb-2">
            System Settings
          </h1>
          <p className="text-charcoal-600">
            Configure application-wide parameters.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
            <h2 className="text-xl font-bold text-charcoal-900 mb-4 flex items-center">
                <ShieldCheckIcon className='w-5 h-5 mr-2'/>
                System Maintenance
            </h2>
            <div className='grid md:grid-cols-2 gap-6'>
                <div className='border p-4 rounded-lg bg-red-50 flex justify-between items-center'>
                    <div>
                        <p className='font-semibold text-charcoal-900'>Clear Cache/Temporary Files</p>
                        <p className='text-sm text-charcoal-600'>Forcing a refresh of cached assets.</p>
                    </div>
                    <button onClick={handleClearCache} className='btn-danger flex items-center'>
                        <ArrowPathIcon className='w-5 h-5 mr-2'/> Clear
                    </button>
                </div>
                <div className='border p-4 rounded-lg bg-blue-50 flex justify-between items-center'>
                    <div>
                        <p className='font-semibold text-charcoal-900'>Check for Updates</p>
                        <p className='text-sm text-charcoal-600'>Verify backend and dependency versions.</p>
                    </div>
                    <button onClick={handleUpdateSystem} className='btn-primary flex items-center'>
                        <Cog6ToothIcon className='w-5 h-5 mr-2'/> Check
                    </button>
                </div>
            </div>
            
            <h2 className="text-xl font-bold text-charcoal-900 mb-4 mt-8 flex items-center">
                <Cog6ToothIcon className='w-5 h-5 mr-2'/>
                Application Configuration
            </h2>
            <p className='text-sm text-charcoal-500'>
                This area is reserved for managing `django.conf.settings` values exposed via a dedicated backend endpoint (e.g., changing `MAX_UPLOAD_SIZE` or `ALLOWED_FILE_TYPES` on the fly).
            </p>

        </motion.div>
      </div>
    </div>
  )
}