import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Perfil } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: Perfil
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, usuario } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  // Admin tem acesso a tudo que requer autenticação
  if (role && usuario?.perfil !== role && usuario?.perfil !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
