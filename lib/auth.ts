import { api } from './api'

export interface User {
  id: number
  email: string
  full_name: string
  phone_number?: string
  role: string
  is_verified: boolean
}

export interface AuthResponse {
  user: User
  access: string
  refresh: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  full_name: string
  phone_number?: string
  password: string
}

// Auth API methods
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login/', credentials)
    return response.data
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/', userData)
    return response.data
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken })
      } catch (error) {
        console.error('Logout API error:', error)
      }
    }
    // Clear local storage regardless of API call success
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  refreshToken: async (): Promise<{ access: string }> => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken
    })
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/me/')
    return response.data
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.patch('/auth/me/', userData)
    return response.data
  }
}

// Token management
export const tokenManager = {
  setTokens: (access: string, refresh: string): void => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token')
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token')
  },

  clearTokens: (): void => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }
}

// Auth state helpers
export const authUtils = {
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    
    const token = tokenManager.getAccessToken()
    if (!token) return false
    
    return !tokenManager.isTokenExpired(token)
  },

  getUserRole: (): string | null => {
    if (typeof window === 'undefined') return null
    
    const token = tokenManager.getAccessToken()
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.role || null
    } catch {
      return null
    }
  },

  isAdmin: (): boolean => {
    const role = authUtils.getUserRole()
    return role === 'admin' || role === 'organizer'
  },

  requireAuth: (): boolean => {
    const isAuth = authUtils.isAuthenticated()
    if (!isAuth && typeof window !== 'undefined') {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return false
    }
    return true
  },

  requireAdmin: (): boolean => {
    if (!authUtils.requireAuth()) return false
    
    const isAdmin = authUtils.isAdmin()
    if (!isAdmin && typeof window !== 'undefined') {
      window.location.href = '/unauthorized'
      return false
    }
    return true
  }
}

// Password validation
export const passwordUtils = {
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  generateStrongPassword: (): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '@$!%*?&'
    
    const getRandomChar = (chars: string) => chars[Math.floor(Math.random() * chars.length)]
    
    let password = ''
    password += getRandomChar(lowercase)
    password += getRandomChar(uppercase)
    password += getRandomChar(numbers)
    password += getRandomChar(symbols)
    
    // Fill remaining characters
    const allChars = lowercase + uppercase + numbers + symbols
    for (let i = password.length; i < 12; i++) {
      password += getRandomChar(allChars)
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}