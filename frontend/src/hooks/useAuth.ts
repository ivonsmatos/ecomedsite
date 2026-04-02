import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import type { LoginInput, RegisterInput } from '@/types'

export function useAuth() {
  const { usuario, isAuthenticated, accessToken, setAuth, logout: logoutStore } = useAuthStore()

  async function login(input: LoginInput) {
    const response = await authService.login(input)
    setAuth(response.usuario, response.accessToken)
    return response
  }

  async function register(input: RegisterInput) {
    const response = await authService.register(input)
    setAuth(response.usuario, response.accessToken)
    return response
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      logoutStore()
    }
  }

  return {
    usuario,
    isAuthenticated,
    accessToken,
    login,
    register,
    logout,
    loginWithGoogle: authService.loginWithGoogle,
  }
}
