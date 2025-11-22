// Application constants and configuration

export const APP_CONFIG = {
  NAME: 'The Parliament of Plating & Pouring Affairs',
  DESCRIPTION: 'Extraordinary culinary experiences merging South African heritage with world-class gastronomy',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@parliamentplating.com',
  PHONE: '+27 21 123 4567',
  ADDRESS: 'Cape Town, South Africa',
  SOCIAL: {
    INSTAGRAM: 'https://instagram.com/parliamentplating',
    FACEBOOK: 'https://facebook.com/parliamentplating',
    TWITTER: 'https://twitter.com/parliamentplating'
  }
} as const

export const EVENT_CATEGORIES = {
  WINE_TASTING: 'Wine Tasting',
  FINE_DINING: 'Fine Dining',
  COOKING_CLASS: 'Cooking Class',
  FOOD_FESTIVAL: 'Food Festival',
  POPUP_DINNER: 'Pop-up Dinner',
  CORPORATE_EVENT: 'Corporate Event',
  PRIVATE_CHEF: 'Private Chef Experience'
} as const

export const TICKET_TYPES = {
  STANDARD: 'Standard',
  VIP: 'VIP',
  EARLY_BIRD: 'Early Bird',
  GROUP: 'Group',
  STUDENT: 'Student'
} as const

export const RESERVATION_STATUS = {
  RESERVED: 'reserved',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  ATTENDED: 'attended',
  EXPIRED: 'expired'
} as const

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export const USER_ROLES = {
  ATTENDEE: 'attendee',
  ORGANIZER: 'organizer',
  FINANCE: 'finance',
  ADMIN: 'admin'
} as const

export const FILE_CONFIG = {
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf'
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf']
} as const

export const DATE_FORMATS = {
  DISPLAY: 'dd MMMM yyyy',
  DISPLAY_SHORT: 'dd MMM yyyy',
  TIME: 'HH:mm',
  DATETIME: 'dd MMMM yyyy, HH:mm',
  DATETIME_SHORT: 'dd MMM yyyy, HH:mm',
  CALENDAR: 'yyyy-MM-dd',
  API: "yyyy-MM-dd'T'HH:mm:ss'Z'"
} as const

export const CURRENCY = {
  SYMBOL: 'R',
  CODE: 'ZAR',
  NAME: 'South African Rand',
  DECIMALS: 2
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZES: [12, 24, 48, 96],
  MAX_PAGE_SIZE: 100
} as const

export const NOTIFICATION_TYPES = {
  RESERVATION_CONFIRMATION: 'reservation_confirmation',
  PAYMENT_REMINDER: 'payment_reminder',
  PAYMENT_RECEIVED: 'payment_received',
  EVENT_REMINDER: 'event_reminder',
  EVENT_UPDATE: 'event_update',
  EVENT_CANCELLED: 'event_cancelled'
} as const

export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  RESERVATION_ATTEMPT: 'reservation_attempt',
  PAYMENT_UPLOAD: 'payment_upload',
  USER_REGISTRATION: 'user_registration',
  EVENT_VIEW: 'event_view',
  CALENDAR_ADD: 'calendar_add'
} as const

// Color constants for consistent theming
export const COLORS = {
  PRIMARY: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12'
  },
  CHARCOAL: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  CREAM: '#fef7ed',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6'
} as const

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  CART_ITEMS: 'cart_items',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE: 'language'
} as const

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_STRIPE_PAYMENTS: false,
  ENABLE_GOOGLE_CALENDAR_OAUTH: false,
  ENABLE_SMS_NOTIFICATIONS: false,
  ENABLE_WAITLIST: true,
  ENABLE_REFERRAL_PROGRAM: false
} as const

export default {
  APP_CONFIG,
  EVENT_CATEGORIES,
  RESERVATION_STATUS,
  USER_ROLES,
  FILE_CONFIG,
  DATE_FORMATS,
  CURRENCY,
  PAGINATION,
  COLORS,
  STORAGE_KEYS
}