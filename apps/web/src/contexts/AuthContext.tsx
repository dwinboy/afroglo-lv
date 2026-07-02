'use client'

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export type UserRole = 'ADMIN' | 'BARBER' | 'CUSTOMER'

export interface User {
  id:            string
  email:         string
  fullName:      string
  role:          UserRole
  avatarUrl?:    string
  phone?:        string
  isVerified:    boolean
  isActive:      boolean
  createdAt:     string
}

interface AuthState {
  user:          User | null
  token:         string | null
  isLoading:     boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login:         (email: string, password: string) => Promise<User>
  register:      (data: RegisterData) => Promise<void>
  logout:        () => void
  refreshUser:   () => Promise<void>
  updateUser:    (data: Partial<User>) => void
}

interface RegisterData {
  email:    string
  password: string
  fullName: string
  role?:    UserRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api'

// Axios instance with auth interceptors
const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('afroglow_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('afroglow_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(err)
  },
)

export { api }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:            null,
    token:           null,
    isLoading:       true,
    isAuthenticated: false,
  })

  // Restore session
  useEffect(() => {
    const token = localStorage.getItem('afroglow_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchCurrentUser(token)
    } else {
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  const fetchCurrentUser = async (token: string) => {
    try {
      const { data } = await api.get<User>('/auth/me')
      setState({ user: data, token, isLoading: false, isAuthenticated: true })
    } catch {
      localStorage.removeItem('afroglow_token')
      setState({ user: null, token: null, isLoading: false, isAuthenticated: false })
    }
  }

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { data } = await api.post<{ access_token: string; user: User }>('/auth/login', {
      email, password,
    })
    localStorage.setItem('afroglow_token', data.access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
    setState({ user: data.user, token: data.access_token, isLoading: false, isAuthenticated: true })
    toast.success(`Welcome back, ${data.user.fullName}!`)
    return data.user
  }, [])

  const register = useCallback(async (regData: RegisterData) => {
    const { data } = await api.post<{ access_token: string; user: User }>('/auth/register', regData)
    localStorage.setItem('afroglow_token', data.access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
    setState({ user: data.user, token: data.access_token, isLoading: false, isAuthenticated: true })
    toast.success('Account created! Welcome to Afroglow.')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('afroglow_token')
    delete api.defaults.headers.common['Authorization']
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false })
    toast.success('Signed out successfully.')
  }, [])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('afroglow_token')
    if (token) await fetchCurrentUser(token)
  }, [])

  const updateUser = useCallback((data: Partial<User>) => {
    setState(s => ({ ...s, user: s.user ? { ...s.user, ...data } : null }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
