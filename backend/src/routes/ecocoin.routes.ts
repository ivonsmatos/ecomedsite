import { Router } from 'express'
import { z } from 'zod'
import { autenticar } from '../middlewares/auth.middleware'
import { creditarEcoCoin, obterSaldo, obterExtrato } from '../services/ecocoin.service'
import { prisma } from '../lib/prisma'

const router = Router()

// ─── GET /ecocoin/saldo ──────────────────────────────────────

router.get('/saldo', autenticar, async (req, res) => {
  const saldo = await obterSaldo(req.usuario!.sub)
  res.json(saldo)
})

// ─── GET /ecocoin/extrato?page=1&limit=20 ────────────────────

router.get('/extrato', autenticar, async (req, res) => {
  const page  = Math.max(1, Number(req.query.page)  || 1)
  const limit = Math.min(50, Number(req.query.limit) || 20)
  const extrato = await obterExtrato(req.usuario!.sub, page, limit)
  res.json(extrato)
})

// ─── POST /ecocoin/registrar-descarte ────────────────────────

router.post('/registrar-descarte', autenticar, async (req, res) => {
  const schema = z.object({ pontoId: z.string().uuid() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'pontoId inválido' })
    return
  }

  const ponto = await prisma.pontoColeta.findUnique({
    where: { id: parsed.data.pontoId },
    select: { id: true, nome: true, cidade: true },
  })
  if (!ponto) {
    res.status(404).json({ error: 'Ponto de coleta não encontrado' })
    return
  }

  const resultado = await creditarEcoCoin(req.usuario!.sub, 'DESCARTE_REGISTRADO', 10, {
    descricao: `Descarte registrado em ${ponto.nome}`,
    referenciaId: ponto.id,
    metadata: { ponto_nome: ponto.nome, cidade: ponto.cidade },
  })

  res.json(resultado)
})

// ─── POST /ecocoin/compartilhar ───────────────────────────────

router.post('/compartilhar', autenticar, async (req, res) => {
  const resultado = await creditarEcoCoin(req.usuario!.sub, 'COMPARTILHAMENTO', 5, {
    descricao: 'Compartilhamento de ponto de coleta',
  })
  res.json(resultado)
})

// ─── POST /ecocoin/resgatar ───────────────────────────────────

router.post('/resgatar', autenticar, async (req, res) => {
  const schema = z.object({
    tipo: z.enum(['DESCONTO', 'CERTIFICADO', 'DOACAO']),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Tipo de resgate inválido' })
    return
  }

  const custoMap = { DESCONTO: 100, CERTIFICADO: 50, DOACAO: 200 }
  const tipoEcoCoinMap = {
    DESCONTO:    'RESGATE_DESCONTO',
    CERTIFICADO: 'RESGATE_CERTIFICADO',
    DOACAO:      'RESGATE_DOACAO',
  } as const

  const custo = custoMap[parsed.data.tipo]
  const tipo  = tipoEcoCoinMap[parsed.data.tipo]

  const resultado = await creditarEcoCoin(req.usuario!.sub, tipo, -custo, {
    descricao: `Resgate: ${parsed.data.tipo}`,
  })

  if (!resultado.sucesso) {
    res.status(400).json({ error: resultado.mensagem })
    return
  }

  res.json(resultado)
})

export default router
