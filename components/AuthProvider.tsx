'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface User {
  id: number
  email: string
  full_name: string
  phone_number?: string
  role: string
  is_verified: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        const response = await api.get('/auth/me/')
        setUser(response.data)
      }
    } catch (error) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login/', { email, password })
    const { access, refresh, user: userData } = response.data
    
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    setUser(userData)
    
    router.push('/profile/reservations')
  }

  const register = async (userData: any) => {
    const response = await api.post('/auth/register/', userData)
    const { access, refresh, user: newUser } = response.data
    
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    setUser(newUser)
    
    router.push('/profile/reservations')
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}