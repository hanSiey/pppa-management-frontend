import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CURRENCY, DATE_FORMATS } from './constants'
import { format, formatDistanceToNow, parseISO, isValid, isToday, isTomorrow, isThisWeek } from 'date-fns'

// CSS classname utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export const dateUtils = {
  format: (date: string | Date, formatStr: string = DATE_FORMATS.DISPLAY): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      if (!isValid(dateObj)) return 'Invalid date'
      return format(dateObj, formatStr)
    } catch {
      return 'Invalid date'
    }
  },

  formatRelative: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      if (!isValid(dateObj)) return 'Invalid date'
      
      if (isToday(dateObj)) return 'Today'
      if (isTomorrow(dateObj)) return 'Tomorrow'
      if (isThisWeek(dateObj)) return format(dateObj, 'EEEE')
      
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch {
      return 'Invalid date'
    }
  },

  isPast: (date: string | Date): boolean => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return isValid(dateObj) && dateObj < new Date()
    } catch {
      return false
    }
  },

  isFuture: (date: string | Date): boolean => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return isValid(dateObj) && dateObj > new Date()
    } catch {
      return false
    }
  },

  getTimeRemaining: (endDate: string | Date) => {
    try {
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
      const now = new Date()
      
      if (!isValid(end) || end <= now) {
        return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      const diff = end.getTime() - now.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      return {
        expired: false,
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: Math.floor(diff / 1000)
      }
    } catch {
      return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
    }
  },

  formatDuration: (startDate: string | Date, endDate: string | Date): string => {
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
      
      if (!isValid(start) || !isValid(end)) return 'Invalid duration'
      
      const diffMs = end.getTime() - start.getTime()
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim()
      }
      return `${minutes}m`
    } catch {
      return 'Invalid duration'
    }
  }
}

// Currency utilities
export const currencyUtils = {
  format: (amount: number | string, decimals: number = CURRENCY.DECIMALS): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return `${CURRENCY.SYMBOL} 0.00`
    
    return `${CURRENCY.SYMBOL} ${numAmount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  },

  parse: (amountString: string): number => {
    const cleaned = amountString.replace(CURRENCY.SYMBOL, '').replace(/,/g, '').trim()
    return parseFloat(cleaned) || 0
  },

  calculateTotal: (price: number, quantity: number, fee: number = 0): number => {
    return (price * quantity) + fee
  },

  calculateReservationFee: (price: number, quantity: number, feePercentage: number = 0.1): number => {
    return price * quantity * feePercentage
  }
}

// String utilities
export const stringUtils = {
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  titleCase: (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
  },

  truncate: (str: string, length: number, suffix: string = '...'): string => {
    if (str.length <= length) return str
    return str.substring(0, length - suffix.length) + suffix
  },

  generateSlug: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  generateReference: (prefix: string = 'PP'): string => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `${prefix}${timestamp}${random}`
  },

  maskEmail: (email: string): string => {
    const [local, domain] = email.split('@')
    if (local.length <= 2) return email
    
    const maskedLocal = local.substring(0, 2) + '*'.repeat(local.length - 2)
    return `${maskedLocal}@${domain}`
  },

  maskPhone: (phone: string): string => {
    if (phone.length <= 4) return phone
    return '*'.repeat(phone.length - 4) + phone.slice(-4)
  }
}

// Validation utilities
export const validationUtils = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  phone: (phone: string): boolean => {
    // Basic international phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  url: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  fileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type)
  },

  fileSize: (file: File, maxSize: number): boolean => {
    return file.size <= maxSize
  }
}

// Number utilities
export const numberUtils = {
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max)
  },

  random: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  percentage: (value: number, total: number): number => {
    if (total === 0) return 0
    return (value / total) * 100
  },

  formatLargeNumber: (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }
}

// Array utilities
export const arrayUtils = {
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  },

unique: <T>(array: T[]): T[] => {
  return Array.from(new Set(array))
},

  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },

  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

// Object utilities
export const objectUtils = {
  omit: <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj }
    keys.forEach(key => delete result[key])
    return result
  },

  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key]
      }
    })
    return result
  },

  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj))
  },

  isEmpty: (obj: object): boolean => {
    return Object.keys(obj).length === 0
  }
}

// Browser utilities
export const browserUtils = {
  isClient: (): boolean => {
    return typeof window !== 'undefined'
  },

  getWindowSize: () => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 }
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  },

  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  },

  isTablet: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 768 && window.innerWidth < 1024
  },

  isDesktop: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 1024
  },

  scrollToTop: (behavior: ScrollBehavior = 'smooth') => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior })
    }
  },

  scrollToElement: (elementId: string, behavior: ScrollBehavior = 'smooth') => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior, block: 'start' })
      }
    }
  }
}

// Local storage utilities
export const storageUtils = {
  get: <T>(key: string, defaultValue: T | null = null): T | null => {
    if (typeof window === 'undefined') return defaultValue
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}

// Error handling utilities
export const errorUtils = {
  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.response?.data?.detail) return error.response.data.detail
    if (error?.response?.data?.message) return error.response.data.message
    if (error?.response?.data) {
      return typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data)
    }
    return 'An unexpected error occurred'
  },

  logError: (error: any, context?: string) => {
    console.error(context ? `[${context}]` : '[Error]', error)
    
    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { contexts: { custom: context } })
    }
  }
}

export const urlUtils = {
  getMediaUrl: (path: string | null | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Get base URL from env or default to localhost, stripping '/api' if it exists
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${cleanPath}`;
  }
}

export default {
  cn,
  dateUtils,
  currencyUtils,
  stringUtils,
  validationUtils,
  numberUtils,
  arrayUtils,
  objectUtils,
  browserUtils,
  storageUtils,
  errorUtils,
  urlUtils,
}