import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useMapStore } from '@/store/mapStore'
import { pontosService } from '@/services/pontos.service'
import { useQuery } from '@tanstack/react-query'
import PointCard from '@/components/map/PointCard'
import FilterBar from '@/components/map/FilterBar'
import SearchInput from '@/components/map/SearchInput'
import Header from '@/components/layout/Header'
import type { PontoColeta } from '@/types'

// Ícone customizado verde para Leaflet
const iconePonto = new Icon({
  iconUrl: '/icons/marker-green.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  // Fallback para o ícone padrão do Leaflet se o SVG não existir
})

/** Componente interno para alterar o centro do mapa reativamente */
function MapCentroControl({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], zoom)
  }, [map, lat, lng, zoom])
  return null
}

export default function Mapa() {
  const [pontoSelecionado, setPontoSelecionado] = useState<PontoColeta | null>(null)
  const { coordenada } = useGeolocation()
  const { center, zoom, filtros, setCenter, setZoom } = useMapStore()

  // Quando obtém geolocalização, centraliza o mapa
  useEffect(() => {
    if (coordenada) {
      setCenter(coordenada)
      setZoom(13)
    }
  }, [coordenada, setCenter, setZoom])

  const { data, isLoading } = useQuery({
    queryKey: ['pontos-proximos', center, filtros],
    queryFn: () =>
      pontosService.proximos({
        lat: center.lat,
        lng: center.lng,
        raio: filtros.raio,
        residuo: filtros.residuo,
      }),
    enabled: true,
  })

  const pontos = data ?? []

  return (
    <div className="flex flex-col h-screen">
      <Header />

      {/* Barra de busca e filtros */}
      <div className="bg-surface border-b border-gray-200 px-4 py-3 flex flex-col sm:flex-row gap-3 z-10">
        <SearchInput onSelect={(coord) => { setCenter(coord); setZoom(14) }} />
        <FilterBar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mapa */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            className="w-full h-full"
            zoomControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCentroControl lat={center.lat} lng={center.lng} zoom={zoom} />

            {/* Marcador da localização do usuário */}
            {coordenada && (
              <Marker position={[coordenada.lat, coordenada.lng]}>
                <Popup>Você está aqui</Popup>
              </Marker>
            )}

            {/* Pontos de coleta */}
            {pontos.map((ponto) => (
              <Marker
                key={ponto.id}
                position={[ponto.latitude, ponto.longitude]}
                icon={iconePonto}
                eventHandlers={{ click: () => setPontoSelecionado(ponto) }}
              >
                <Popup>
                  <strong>{ponto.nome}</strong>
                  <br />
                  {ponto.logradouro}, {ponto.numero}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Drawer lateral com detalhe do ponto (desktop) */}
        {pontoSelecionado && (
          <div className="hidden md:block w-80 lg:w-96 border-l border-gray-200 overflow-y-auto bg-surface">
            <PointCard ponto={pontoSelecionado} onClose={() => setPontoSelecionado(null)} />
          </div>
        )}
      </div>

      {/* Drawer mobile */}
      {pontoSelecionado && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-30 bg-surface rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto">
          <PointCard ponto={pontoSelecionado} onClose={() => setPontoSelecionado(null)} />
        </div>
      )}
    </div>
  )
}
