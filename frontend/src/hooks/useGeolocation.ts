import { useState, useEffect, useCallback } from 'react'
import type { Coordenada } from '@/types'

type GeolocationState = {
  coordenada: Coordenada | null
  erro: string | null
  carregando: boolean
  obterLocalizacao: () => void
}

export function useGeolocation(): GeolocationState {
  const [coordenada, setCoordenada] = useState<Coordenada | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const obterLocalizacao = useCallback(() => {
    if (!navigator.geolocation) {
      setErro('Geolocalização não suportada neste navegador.')
      return
    }

    setCarregando(true)
    setErro(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordenada({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setCarregando(false)
      },
      (err) => {
        setErro(
          err.code === err.PERMISSION_DENIED
            ? 'Permissão de localização negada.'
            : 'Não foi possível obter sua localização.',
        )
        setCarregando(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  useEffect(() => {
    obterLocalizacao()
  }, [obterLocalizacao])

  return { coordenada, erro, carregando, obterLocalizacao }
}
