import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// Lazy loading das páginas para melhor performance
const Landing = lazy(() => import('@/pages/Landing/Landing'))
const Mapa = lazy(() => import('@/pages/Mapa/Mapa'))
const PontoDetalhe = lazy(() => import('@/pages/Mapa/PontoDetalhe'))
const Login = lazy(() => import('@/pages/Auth/Login'))
const Cadastro = lazy(() => import('@/pages/Auth/Cadastro'))
const RecuperarSenha = lazy(() => import('@/pages/Auth/RecuperarSenha'))
const Perfil = lazy(() => import('@/pages/App/Perfil'))
const Favoritos = lazy(() => import('@/pages/App/Favoritos'))
const Notificacoes = lazy(() => import('@/pages/App/Notificacoes'))
const ParceiroDashboard = lazy(() => import('@/pages/Parceiro/Dashboard'))
const MeuPonto = lazy(() => import('@/pages/Parceiro/MeuPonto'))
const CadastroPonto = lazy(() => import('@/pages/Parceiro/CadastroPonto'))
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'))
const AdminPontos = lazy(() => import('@/pages/Admin/Pontos'))
const AdminUsuarios = lazy(() => import('@/pages/Admin/Usuarios'))
const Blog = lazy(() => import('@/pages/Blog/Blog'))
const BlogArtigo = lazy(() => import('@/pages/Blog/Artigo'))
const Chat = lazy(() => import('@/pages/Chat/Chat'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Público */}
          <Route path="/" element={<Landing />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/mapa/ponto/:id" element={<PontoDetalhe />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArtigo />} />

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/cadastro" element={<Cadastro />} />
          <Route path="/auth/recuperar-senha" element={<RecuperarSenha />} />

          {/* Chat IA */}
          <Route
            path="/app/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* Cidadão autenticado */}
          <Route
            path="/app/perfil"
            element={
              <ProtectedRoute role="CIDADAO">
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/favoritos"
            element={
              <ProtectedRoute role="CIDADAO">
                <Favoritos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/notificacoes"
            element={
              <ProtectedRoute role="CIDADAO">
                <Notificacoes />
              </ProtectedRoute>
            }
          />

          {/* Parceiro */}
          <Route
            path="/parceiro/dashboard"
            element={
              <ProtectedRoute role="PARCEIRO">
                <ParceiroDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parceiro/meu-ponto"
            element={
              <ProtectedRoute role="PARCEIRO">
                <MeuPonto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parceiro/cadastro-ponto"
            element={
              <ProtectedRoute role="PARCEIRO">
                <CadastroPonto />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pontos"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminPontos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminUsuarios />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
