import OpenAI from 'openai'

// Cliente Ollama — API 100% compatível com OpenAI SDK
// Em dev: http://localhost:11434/v1
// Em prod: variável OLLAMA_BASE_URL

export const ollama = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
  apiKey: 'ollama', // ignorado pelo Ollama, mas obrigatório pelo SDK
  timeout: 60_000,  // 60s timeout para modelos CPU
  maxRetries: 1,
})

export const CHAT_MODEL  = process.env.OLLAMA_CHAT_MODEL  ?? 'qwen3:8b'
export const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text'

/** Verifica se o Ollama está respondendo */
export async function ollamaDisponivel(): Promise<boolean> {
  try {
    const base = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
    const url = base.replace('/v1', '') + '/api/tags'
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) })
    return r.ok
  } catch {
    return false
  }
}
