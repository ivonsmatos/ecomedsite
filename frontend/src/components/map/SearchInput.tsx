import { useState } from 'react'
import { Search } from 'lucide-react'
import type { Coordenada } from '@/types'

interface SearchInputProps {
  onSelect: (coord: Coordenada) => void
}

export default function SearchInput({ onSelect }: SearchInputProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Remove formatação do CEP para a API
      const cepLimpo = query.replace(/\D/g, '')

      // Tenta ViaCEP se parecer CEP (8 dígitos)
      if (/^\d{8}$/.test(cepLimpo)) {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        const data = await res.json()
        if (data.erro) throw new Error('CEP não encontrado')

        // Geocodifica o endereço via Nominatim (OpenStreetMap)
        const enderecoQuery = encodeURIComponent(
          `${data.logradouro}, ${data.localidade}, ${data.uf}, Brazil`,
        )
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${enderecoQuery}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'pt-BR' } },
        )
        const geoData = await geoRes.json()
        if (!geoData.length) throw new Error('Não foi possível localizar o CEP')

        onSelect({ lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) })
      } else {
        // Busca livre por endereço via Nominatim
        const enderecoQuery = encodeURIComponent(`${query}, Brazil`)
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${enderecoQuery}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'pt-BR' } },
        )
        const geoData = await geoRes.json()
        if (!geoData.length) throw new Error('Endereço não encontrado')

        onSelect({ lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na busca')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleBuscar} className="flex-1 flex flex-col gap-1">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por CEP ou endereço..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  )
}
