import { create } from 'zustand'
import type { Coordenada, PontoColeta } from '@/types'

interface MapState {
  center: Coordenada
  zoom: number
  pontoSelecionado: PontoColeta | null
  filtros: {
    residuo?: string
    raio: number
    apenasVerificados: boolean
  }
  setCenter: (center: Coordenada) => void
  setZoom: (zoom: number) => void
  selecionarPonto: (ponto: PontoColeta | null) => void
  setFiltros: (filtros: Partial<MapState['filtros']>) => void
}

const CENTRO_BRASIL: Coordenada = { lat: -15.7801, lng: -47.9292 }

export const useMapStore = create<MapState>((set) => ({
  center: CENTRO_BRASIL,
  zoom: 5,
  pontoSelecionado: null,
  filtros: {
    raio: 5000,
    apenasVerificados: false,
  },

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  selecionarPonto: (pontoSelecionado) => set({ pontoSelecionado }),
  setFiltros: (filtros) =>
    set((state) => ({ filtros: { ...state.filtros, ...filtros } })),
}))
