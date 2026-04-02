import { X, MapPin, Clock, Phone, Navigation, Heart, Flag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { pontosService } from '@/services/pontos.service'
import { nomeDiaSemana } from '@/lib/utils'
import type { PontoColeta } from '@/types'

interface PointCardProps {
  ponto: PontoColeta
  onClose: () => void
}

export default function PointCard({ ponto, onClose }: PointCardProps) {
  const { isAuthenticated } = useAuth()

  const enderecoCompleto = [
    `${ponto.logradouro}, ${ponto.numero}`,
    ponto.complemento,
    ponto.bairro,
    `${ponto.cidade} - ${ponto.estado}`,
    `CEP ${ponto.cep}`,
  ]
    .filter(Boolean)
    .join(', ')

  const urlGoogleMaps = `https://www.google.com/maps/dir/?api=1&destination=${ponto.latitude},${ponto.longitude}`

  async function handleFavoritar() {
    if (!isAuthenticated) {
      window.location.href = '/auth/login'
      return
    }
    await pontosService.alternarFavorito(ponto.id)
  }

  return (
    <div className="p-5">
      {/* Header do card */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold font-display text-text">{ponto.nome}</h2>
          {ponto.verificado && (
            <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">
              ✓ Verificado
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text p-1" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Foto */}
      {ponto.fotoUrl && (
        <img
          src={ponto.fotoUrl}
          alt={`Foto de ${ponto.nome}`}
          className="w-full h-40 object-cover rounded-xl mb-4"
        />
      )}

      {/* Endereço */}
      <div className="flex gap-2 mb-4">
        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-text-muted">{enderecoCompleto}</p>
      </div>

      {/* Telefone */}
      {ponto.parceiro.telefone && (
        <div className="flex gap-2 mb-4">
          <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <a href={`tel:${ponto.parceiro.telefone}`} className="text-sm text-secondary hover:underline">
            {ponto.parceiro.telefone}
          </a>
        </div>
      )}

      {/* Horários */}
      {ponto.horarios.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-text">Horários</span>
          </div>
          <ul className="space-y-1 pl-6">
            {ponto.horarios.map((h) => (
              <li key={h.id} className="text-xs text-text-muted flex justify-between">
                <span>{nomeDiaSemana(h.diaSemana)}</span>
                <span>
                  {h.abreAs} – {h.fechaAs}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tipos de resíduo */}
      {ponto.tiposResiduos.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-medium text-text mb-2">Aceita</p>
          <div className="flex flex-wrap gap-2">
            {ponto.tiposResiduos.map(({ residuo }) => (
              <span
                key={residuo.id}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                {residuo.icone} {residuo.nome}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col gap-2">
        <a
          href={urlGoogleMaps}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Como chegar
        </a>
        <div className="flex gap-2">
          <button
            onClick={handleFavoritar}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-text-muted py-2.5 rounded-xl text-sm hover:border-primary hover:text-primary transition-colors"
          >
            <Heart className="w-4 h-4" />
            Favoritar
          </button>
          <button
            onClick={() => window.location.href = `/mapa/ponto/${ponto.id}?reporte=1`}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-text-muted py-2.5 rounded-xl text-sm hover:border-danger hover:text-danger transition-colors"
          >
            <Flag className="w-4 h-4" />
            Reportar
          </button>
        </div>
      </div>
    </div>
  )
}
