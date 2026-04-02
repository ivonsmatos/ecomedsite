import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/types'

interface AuthState {
  usuario: Usuario | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (usuario: Usuario, accessToken: string) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (usuario, accessToken) =>
        set({ usuario, accessToken, isAuthenticated: true }),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      logout: () =>
        set({ usuario: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'ecomed-auth',
      // Não persistir o accessToken no localStorage — ele é de curta duração
      // O refresh token fica em cookie HTTP-only no servidor
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
