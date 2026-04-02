import { Router } from 'express'
import { z } from 'zod'
import { autenticar } from '../middlewares/auth.middleware'
import { exigirPerfil } from '../middlewares/role.middleware'
import { prisma } from '../lib/prisma'

const router = Router()

// Todas as rotas exigem PARCEIRO ou ADMIN
router.use(autenticar, exigirPerfil('PARCEIRO'))

// ─── POST /parceiro/solicitar ─────────────────────────────────

const solicitarSchema = z.object({
  razaoSocial: z.string().min(3),
  cnpj: z.string().length(14),
  telefone: z.string().optional(),
  nomePonto: z.string().min(3),
  cep: z.string().length(8),
  logradouro: z.string().min(3),
  numero: z.string().min(1),
  complemento: z.string().optional(),
  bairro: z.string().min(2),
  cidade: z.string().min(2),
  estado: z.string().length(2),
  latitude: z.number(),
  longitude: z.number(),
  horarios: z.array(
    z.object({
      diaSemana: z.enum(['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO']),
      abreAs: z.string(),
      fechaAs: z.string(),
    }),
  ),
  tiposResiduos: z.array(z.string()).min(1),
})

router.post('/solicitar', async (req, res) => {
  const parsed = solicitarSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const { razaoSocial, cnpj, telefone, nomePonto, horarios, tiposResiduos, ...endereco } =
    parsed.data
  const usuarioId = req.usuario!.sub

  // Verifica se já tem parceiro
  const parceiroExistente = await prisma.parceiro.findUnique({ where: { usuarioId } })

  const parceiro =
    parceiroExistente ??
    (await prisma.parceiro.create({
      data: { usuarioId, razaoSocial, cnpj, telefone },
    }))

  const ponto = await prisma.pontoColeta.create({
    data: {
      parceiroId: parceiro.id,
      nome: nomePonto,
      ...endereco,
      horarios: { create: horarios },
      tiposResiduos: {
        create: tiposResiduos.map((residuoId) => ({ residuoId })),
      },
    },
  })

  res.status(201).json({ ponto, parceiro })
})

// ─── GET /parceiro/meu-ponto ──────────────────────────────────

router.get('/meu-ponto', async (req, res) => {
  const parceiro = await prisma.parceiro.findUnique({
    where: { usuarioId: req.usuario!.sub },
    include: {
      pontos: {
        include: {
          horarios: true,
          tiposResiduos: { include: { residuo: true } },
        },
      },
    },
  })

  if (!parceiro) {
    res.status(404).json({ error: 'Nenhum ponto cadastrado' })
    return
  }

  res.json(parceiro)
})

// ─── GET /parceiro/estatisticas ───────────────────────────────

router.get('/estatisticas', async (req, res) => {
  const parceiro = await prisma.parceiro.findUnique({
    where: { usuarioId: req.usuario!.sub },
    include: {
      pontos: {
        select: {
          id: true,
          nome: true,
          visualizacoes: true,
          _count: { select: { reportes: true, favoritos: true } },
        },
      },
    },
  })

  if (!parceiro) {
    res.status(404).json({ error: 'Parceiro não encontrado' })
    return
  }

  res.json(parceiro.pontos)
})

export default router
