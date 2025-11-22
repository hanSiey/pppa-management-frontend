import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Only run in client-side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        })
        
        const { access } = response.data
        localStorage.setItem('access_token', access)
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response)
    }

    return Promise.reject(error)
  }
)

// API methods with better error handling
export const apiClient = {
  get: (url: string, config = {}) => api.get(url, config),
  post: (url: string, data = {}, config = {}) => api.post(url, data, config),
  put: (url: string, data = {}, config = {}) => api.put(url, data, config),
  patch: (url: string, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url: string, config = {}) => api.delete(url, config),
}

// File upload helper
export const uploadFile = async (url: string, file: File, data: any = {}) => {
  const formData = new FormData()
  formData.append('file', file)
  
  // Append additional data
  Object.keys(data).forEach(key => {
    formData.append(key, data[key])
  })

  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // 30 seconds for file uploads
  })
}

export default api