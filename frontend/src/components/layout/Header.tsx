import { Link, useNavigate } from 'react-router-dom'
import { MapPin, User, LogOut, Menu, X, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import EcoCoinWidget from '@/components/ecocoin/EcoCoinWidget'

export default function Header() {
  const { isAuthenticated, usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-primary text-xl font-display">
          <MapPin className="w-6 h-6" />
          <span>EcoMed</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/mapa" className="text-text hover:text-primary transition-colors">
            Mapa
          </Link>
          <Link to="/blog" className="text-text hover:text-primary transition-colors">
            Blog
          </Link>
          {!isAuthenticated ? (
            <>
              <Link
                to="/auth/login"
                className="text-text hover:text-primary transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/parceiro/cadastro-ponto"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Seja Parceiro
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <EcoCoinWidget />
              <Link
                to="/app/chat"
                className="flex items-center gap-1 text-text hover:text-primary transition-colors"
                title="Assistente IA EcoMed"
              >
                <MessageCircle className="w-4 h-4" />
              </Link>
              <span className="text-text-muted">Olá, {usuario?.nome.split(' ')[0]}</span>
              <Link
                to={usuario?.perfil === 'ADMIN' ? '/admin/dashboard' : usuario?.perfil === 'PARCEIRO' ? '/parceiro/dashboard' : '/app/perfil'}
                className="flex items-center gap-1 text-text hover:text-primary transition-colors"
              >
                <User className="w-4 h-4" />
                Painel
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-text-muted hover:text-danger transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </nav>

        {/* Botão menu mobile */}
        <button
          className="md:hidden p-2 text-text"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label="Abrir menu"
        >
          {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menu mobile */}
      <div
        className={cn(
          'md:hidden bg-surface border-t border-gray-200 overflow-hidden transition-all duration-200',
          menuAberto ? 'max-h-80' : 'max-h-0',
        )}
      >
        <nav className="flex flex-col p-4 gap-4 text-sm font-medium">
          <Link to="/mapa" onClick={() => setMenuAberto(false)} className="text-text">
            Mapa
          </Link>
          <Link to="/blog" onClick={() => setMenuAberto(false)} className="text-text">
            Blog
          </Link>
          {!isAuthenticated ? (
            <>
              <Link to="/auth/login" onClick={() => setMenuAberto(false)} className="text-text">
                Entrar
              </Link>
              <Link
                to="/parceiro/cadastro-ponto"
                onClick={() => setMenuAberto(false)}
                className="bg-primary text-white px-4 py-2 rounded-lg text-center"
              >
                Seja Parceiro
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="text-danger text-left">
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
