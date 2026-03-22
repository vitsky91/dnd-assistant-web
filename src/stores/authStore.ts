import { create } from 'zustand'
import type { User } from '../types'
import { authApi } from '../api/authApi'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  hydrateFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  hydrateFromStorage: () => {
    const token = localStorage.getItem('jwt_token')
    const userRaw = localStorage.getItem('user')
    if (token && userRaw) {
      try {
        set({ token, user: JSON.parse(userRaw) })
      } catch {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('user')
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { user, token } = await authApi.login(email, password)
      localStorage.setItem('jwt_token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, token, isLoading: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      set({ error: msg, isLoading: false })
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true, error: null })
    try {
      const { user, token } = await authApi.register(email, username, password)
      localStorage.setItem('jwt_token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, token, isLoading: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      set({ error: msg, isLoading: false })
    }
  },

  logout: async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))
