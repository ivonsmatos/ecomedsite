import { useState, useCallback } from 'react'

export interface Mensagem {
  role: 'user' | 'assistant'
  content: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

const MENSAGEM_INICIAL: Mensagem = {
  role: 'assistant',
  content:
    'Olá! Sou o Assistente EcoMed. Posso te ajudar a descobrir como descartar medicamentos e resíduos de saúde corretamente. Qual dúvida posso resolver?',
}

export function useEcoMedChat() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([MENSAGEM_INICIAL])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const enviar = useCallback(
    async (texto: string) => {
      if (!texto.trim() || carregando) return

      setErro(null)

      const novasMensagens: Mensagem[] = [
        ...mensagens,
        { role: 'user', content: texto.trim() },
      ]

      // Adiciona mensagem vazia do assistant que será preenchida via stream
      setMensagens([...novasMensagens, { role: 'assistant', content: '' }])
      setCarregando(true)

      try {
        const token = localStorage.getItem('ecomed-auth-token')
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const resp = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ messages: novasMensagens }),
        })

        if (!resp.ok || !resp.body) {
          throw new Error(`HTTP ${resp.status}`)
        }

        const reader = resp.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const texto = decoder.decode(value, { stream: true })

          for (const linha of texto.split('\n')) {
            if (!linha.startsWith('data: ')) continue

            try {
              const payload = JSON.parse(linha.slice(6)) as {
                token?: string
                fim?: boolean
                erro?: string
              }

              if (payload.token) {
                setMensagens((prev) => {
                  const copia = [...prev]
                  copia[copia.length - 1] = {
                    ...copia[copia.length - 1],
                    content: copia[copia.length - 1].content + payload.token,
                  }
                  return copia
                })
              }

              if (payload.fim) {
                setCarregando(false)
              }

              if (payload.erro) {
                setMensagens((prev) => {
                  const copia = [...prev]
                  copia[copia.length - 1] = {
                    ...copia[copia.length - 1],
                    content: payload.erro!,
                  }
                  return copia
                })
                setCarregando(false)
              }
            } catch {
              // Linha SSE malformada — ignorar silenciosamente
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        setMensagens((prev) => {
          const copia = [...prev]
          copia[copia.length - 1] = {
            ...copia[copia.length - 1],
            content: 'Não consegui me conectar ao assistente. Verifique sua conexão e tente novamente.',
          }
          return copia
        })
        setErro(msg)
        setCarregando(false)
      }
    },
    [mensagens, carregando],
  )

  const limpar = useCallback(() => {
    setMensagens([MENSAGEM_INICIAL])
    setErro(null)
  }, [])

  return { mensagens, enviar, carregando, erro, limpar }
}
