import { Router } from 'express'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { ollama, CHAT_MODEL, ollamaDisponivel } from '../lib/ollama'
import { buscarContexto } from '../services/rag.service'
import { creditarEcoCoin } from '../services/ecocoin.service'
import type { JwtPayload } from '../middlewares/auth.middleware'

const router = Router()

// Rate limit exclusivo para o chat: 15 req/min por IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas mensagens. Aguarde 1 minuto.' },
})

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
})

// ─── System prompt do Assistente EcoMed ──────────────────────
function buildSystemPrompt(contexto: string): string {
  const base =
    process.env.ECOMED_SYSTEM_PROMPT ??
    `Você é o Assistente EcoMed, especialista em descarte correto de medicamentos e resíduos de saúde no Brasil.
Siga sempre estas diretrizes:
- Responda em português brasileiro, de forma clara e acessível
- Baseie suas respostas APENAS nos dados fornecidos no contexto abaixo
- Se não souber a resposta, diga: "Não tenho essa informação. Consulte um ponto de coleta próximo pelo mapa EcoMed."
- Nunca invente informações sobre medicamentos ou procedimentos de saúde
- Seja direto e objetivo — o usuário precisa de instruções práticas
- Lembre sempre: descarte incorreto de medicamentos causa danos ao meio ambiente e à saúde pública`

  if (!contexto) return base

  return `${base}

--- CONTEXTO DA BASE DE CONHECIMENTO ---
${contexto}
--- FIM DO CONTEXTO ---

Use o contexto acima para embasar sua resposta.`
}

// ─── POST /chat ───────────────────────────────────────────────

router.post('/', chatLimiter, async (req, res) => {
  const parsed = chatSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const { messages } = parsed.data
  const pergunta = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

  // ─── Headers SSE ─────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Nginx: desabilitar buffering

  const enviarEvento = (dados: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(dados)}\n\n`)
  }

  try {
    // 1. Verificar disponibilidade do Ollama
    const disponivel = await ollamaDisponivel()
    if (!disponivel) {
      enviarEvento({
        token:
          '⚠️ O assistente de IA está temporariamente indisponível. Enquanto isso, use o mapa para encontrar pontos de coleta próximos a você.',
      })
      enviarEvento({ fim: true })
      res.end()
      return
    }

    // 2. Buscar contexto RAG (não bloqueia se falhar)
    const contexto = await buscarContexto(pergunta).catch(() => '')

    // 3. Montar mensagens com system prompt + contexto + histórico (últimas 6)
    const messagesComRAG = [
      { role: 'system' as const, content: buildSystemPrompt(contexto) },
      ...messages.slice(-6),
    ]

    // 4. Stream do LLM
    const stream = await ollama.chat.completions.create({
      model: CHAT_MODEL,
      messages: messagesComRAG,
      stream: true,
      temperature: 0.3,
      max_tokens: 600,
    })

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? ''
      if (token) enviarEvento({ token })
    }

    // 5. Creditar 1 EcoCoin pela interação diária (se usuário logado)
    const usuario = (req as unknown as { usuario?: JwtPayload }).usuario
    if (usuario?.sub) {
      await creditarEcoCoin(usuario.sub, 'CHAT_INTERACAO', 1, {
        descricao: 'Interação com o Assistente EcoMed',
      }).catch(() => {
        // Silencioso — não quebrar a resposta por falha no EcoCoin
      })
    }

    enviarEvento({ fim: true })
    res.end()
  } catch (err) {
    console.error('[Chat] Erro no stream:', err)
    enviarEvento({ erro: 'Erro ao processar sua mensagem. Tente novamente.' })
    res.end()
  }
})

// ─── GET /chat/status ─────────────────────────────────────────
router.get('/status', async (_req, res) => {
  const disponivel = await ollamaDisponivel()
  res.json({
    disponivel,
    modelo: CHAT_MODEL,
    mensagem: disponivel
      ? 'Assistente IA operacional'
      : 'Assistente IA temporariamente indisponível',
  })
})

export default router
