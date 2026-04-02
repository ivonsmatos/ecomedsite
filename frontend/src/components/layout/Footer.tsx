import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Marca */}
        <div>
          <div className="flex items-center gap-2 font-bold text-xl font-display mb-2">
            <MapPin className="w-5 h-5" />
            <span>EcoMed</span>
          </div>
          <p className="text-green-200 text-sm">
            Conectando cidadãos a pontos de descarte correto de medicamentos no Brasil.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold mb-3">Links</h3>
          <ul className="space-y-2 text-sm text-green-200">
            <li><Link to="/mapa" className="hover:text-white transition-colors">Mapa de Pontos</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link to="/parceiro/cadastro-ponto" className="hover:text-white transition-colors">Seja Parceiro</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold mb-3">Legal</h3>
          <ul className="space-y-2 text-sm text-green-200">
            <li><Link to="/politica-privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
            <li><Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
          </ul>
          <p className="text-xs text-green-300 mt-4">
            Em conformidade com a LGPD (Lei 13.709/2018) e RDC 222/2018 (ANVISA)
          </p>
        </div>
      </div>
      <div className="border-t border-green-700 text-center py-4 text-xs text-green-400">
        © {new Date().getFullYear()} EcoMed. Todos os direitos reservados.
      </div>
    </footer>
  )
}
