import { api } from './client'
import type { User } from '../types'

interface AuthResponse {
  user: User
  token: string
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  register: (email: string, username: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { email, username, password }),

  logout: () => api.delete<void>('/auth/logout'),
}
