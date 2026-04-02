import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { autenticar } from '../middlewares/auth.middleware'

const router = Router()

// ─── GET /pontos ─────────────────────────────────────────────

router.get('/', async (req, res) => {
  const { cidade, estado, verificado, page = '1', limit = '20' } = req.query

  const where: Record<string, unknown> = { ativo: true }
  if (cidade) where.cidade = cidade
  if (estado) where.estado = estado
  if (verificado === 'true') where.verificado = true

  const skip = (Number(page) - 1) * Number(limit)

  const [total, data] = await prisma.$transaction([
    prisma.pontoColeta.count({ where }),
    prisma.pontoColeta.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        horarios: true,
        tiposResiduos: { include: { residuo: true } },
        parceiro: { select: { razaoSocial: true, telefone: true } },
      },
      orderBy: { criadoEm: 'desc' },
    }),
  ])

  res.json({
    data,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  })
})

// ─── GET /pontos/proximos ─────────────────────────────────────

router.get('/proximos', async (req, res) => {
  const schema = z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    raio: z.coerce.number().default(5000),
    residuo: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
  })

  const parsed = schema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: 'Parâmetros inválidos', details: parsed.error.flatten() })
    return
  }

  const { lat, lng, raio, page, limit } = parsed.data

  // Busca geoespacial por fórmula de Haversine (sem PostGIS por compatibilidade de migração)
  // Em produção com PostGIS ativado, usar ST_DWithin para melhor performance
  const latDiff = raio / 111320
  const lngDiff = raio / (111320 * Math.cos((lat * Math.PI) / 180))

  const pontos = await prisma.pontoColeta.findMany({
    where: {
      ativo: true,
      latitude: { gte: lat - latDiff, lte: lat + latDiff },
      longitude: { gte: lng - lngDiff, lte: lng + lngDiff },
    },
    include: {
      horarios: true,
      tiposResiduos: { include: { residuo: true } },
      parceiro: { select: { razaoSocial: true, telefone: true } },
    },
    skip: (page - 1) * limit,
    take: limit,
  })

  // Ordena por distância real (Haversine)
  const pontosComDistancia = pontos
    .map((p) => ({
      ...p,
      distancia: haversine(lat, lng, p.latitude, p.longitude),
    }))
    .filter((p) => p.distancia <= raio)
    .sort((a, b) => a.distancia - b.distancia)

  res.json(pontosComDistancia)
})

// ─── GET /pontos/:id ─────────────────────────────────────────

router.get('/:id', async (req, res) => {
  const ponto = await prisma.pontoColeta.findUnique({
    where: { id: req.params.id },
    include: {
      horarios: true,
      tiposResiduos: { include: { residuo: true } },
      parceiro: { select: { razaoSocial: true, telefone: true } },
    },
  })

  if (!ponto || !ponto.ativo) {
    res.status(404).json({ error: 'Ponto não encontrado' })
    return
  }

  res.json(ponto)
})

// ─── POST /pontos/:id/visualizacao ───────────────────────────

router.post('/:id/visualizacao', async (req, res) => {
  await prisma.pontoColeta.update({
    where: { id: req.params.id },
    data: { visualizacoes: { increment: 1 } },
  })
  res.status(204).send()
})

// ─── POST /pontos/:id/reporte ────────────────────────────────

router.post('/:id/reporte', autenticar, async (req, res) => {
  const schema = z.object({
    motivo: z.enum(['PONTO_FECHADO', 'ENDERECO_ERRADO', 'NAO_ACEITA_RESIDUO', 'OUTRO']),
    descricao: z.string().max(500).optional(),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  await prisma.reporte.create({
    data: {
      pontoId: req.params.id,
      usuarioId: req.usuario!.sub,
      ...parsed.data,
    },
  })

  res.status(201).json({ message: 'Reporte registrado com sucesso' })
})

// ─── POST /pontos/:id/favorito ────────────────────────────────

router.post('/:id/favorito', autenticar, async (req, res) => {
  const usuarioId = req.usuario!.sub
  const pontoId = req.params.id

  const existente = await prisma.favorito.findUnique({
    where: { usuarioId_pontoId: { usuarioId, pontoId } },
  })

  if (existente) {
    await prisma.favorito.delete({ where: { usuarioId_pontoId: { usuarioId, pontoId } } })
    res.json({ favoritado: false })
  } else {
    await prisma.favorito.create({ data: { usuarioId, pontoId } })
    res.json({ favoritado: true })
  }
})

// ─── Haversine ───────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // raio da Terra em metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default router
