import { useMapStore } from '@/store/mapStore'
import { SlidersHorizontal } from 'lucide-react'

const TIPOS_RESIDUO = [
  { valor: '', label: 'Todos' },
  { valor: 'medicamentos-vencidos', label: 'Medicamentos vencidos' },
  { valor: 'antibioticos', label: 'Antibióticos' },
  { valor: 'quimioterapicos', label: 'Quimioterápicos' },
  { valor: 'homeopaticos', label: 'Homeopáticos' },
]

const RAIOS = [
  { valor: 1000, label: '1 km' },
  { valor: 3000, label: '3 km' },
  { valor: 5000, label: '5 km' },
  { valor: 10000, label: '10 km' },
]

export default function FilterBar() {
  const { filtros, setFiltros } = useMapStore()

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <SlidersHorizontal className="w-4 h-4 text-text-muted flex-shrink-0" />

      <select
        value={filtros.residuo ?? ''}
        onChange={(e) => setFiltros({ residuo: e.target.value || undefined })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {TIPOS_RESIDUO.map((t) => (
          <option key={t.valor} value={t.valor}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        value={filtros.raio}
        onChange={(e) => setFiltros({ raio: Number(e.target.value) })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {RAIOS.map((r) => (
          <option key={r.valor} value={r.valor}>
            {r.label}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
        <input
          type="checkbox"
          checked={filtros.apenasVerificados}
          onChange={(e) => setFiltros({ apenasVerificados: e.target.checked })}
          className="accent-primary"
        />
        Apenas verificados
      </label>
    </div>
  )
}
