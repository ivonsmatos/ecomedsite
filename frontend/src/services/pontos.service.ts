import api from './api'
import type { PontoColeta, PontoProximoParams, PaginatedResponse } from '@/types'

export const pontosService = {
  async listar(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<PontoColeta>> {
    const { data } = await api.get<PaginatedResponse<PontoColeta>>('/pontos', { params })
    return data
  },

  async proximos(params: PontoProximoParams): Promise<PontoColeta[]> {
    const { data } = await api.get<PontoColeta[]>('/pontos/proximos', { params })
    return data
  },

  async obterPorId(id: string): Promise<PontoColeta> {
    const { data } = await api.get<PontoColeta>(`/pontos/${id}`)
    return data
  },

  async registrarVisualizacao(id: string): Promise<void> {
    await api.post(`/pontos/${id}/visualizacao`)
  },

  async reportar(id: string, motivo: string, descricao?: string): Promise<void> {
    await api.post(`/pontos/${id}/reporte`, { motivo, descricao })
  },

  async alternarFavorito(id: string): Promise<{ favoritado: boolean }> {
    const { data } = await api.post<{ favoritado: boolean }>(`/pontos/${id}/favorito`)
    return data
  },
}
