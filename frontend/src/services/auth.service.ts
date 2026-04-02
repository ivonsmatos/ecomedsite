import api from './api'
import type { LoginInput, RegisterInput, AuthResponse } from '@/types'

export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', input)
    return data
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', input)
    return data
  },

  async refresh(): Promise<{ accessToken: string }> {
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh', {}, { withCredentials: true })
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout', {}, { withCredentials: true })
  },

  loginWithGoogle() {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  },
}
