import { Router } from 'express'
import { autenticar } from '../middlewares/auth.middleware'
import { exigirPerfil } from '../middlewares/role.middleware'
import { prisma } from '../lib/prisma'

const router = Router()

// Todas as rotas exigem ADMIN
router.use(autenticar, exigirPerfil('ADMIN'))

// ─── GET /admin/dashboard ─────────────────────────────────────

router.get('/dashboard', async (_req, res) => {
  const [totalPontos, totalUsuarios, totalParceiros, pontosAguardando, totalReportes] =
    await prisma.$transaction([
      prisma.pontoColeta.count({ where: { ativo: true } }),
      prisma.usuario.count(),
      prisma.parceiro.count(),
      prisma.parceiro.count({ where: { status: 'PENDENTE' } }),
      prisma.reporte.count({ where: { status: 'ABERTO' } }),
    ])

  res.json({
    totalPontos,
    totalUsuarios,
    totalParceiros,
    pontosAguardando,
    totalReportes,
  })
})

// ─── GET /admin/parceiros ─────────────────────────────────────

router.get('/parceiros', async (req, res) => {
  const { status } = req.query
  const parceiros = await prisma.parceiro.findMany({
    where: status ? { status: status as never } : undefined,
    include: { usuario: { select: { nome: true, email: true } }, pontos: true },
    orderBy: { criadoEm: 'desc' },
  })
  res.json(parceiros)
})

// ─── PUT /admin/parceiros/:id/aprovar ─────────────────────────

router.put('/parceiros/:id/aprovar', async (req, res) => {
  const parceiro = await prisma.parceiro.update({
    where: { id: req.params.id },
    data: { status: 'APROVADO' },
  })
  res.json(parceiro)
})

// ─── PUT /admin/parceiros/:id/rejeitar ────────────────────────

router.put('/parceiros/:id/rejeitar', async (req, res) => {
  const parceiro = await prisma.parceiro.update({
    where: { id: req.params.id },
    data: { status: 'REJEITADO' },
  })
  res.json(parceiro)
})

// ─── GET /admin/reportes ─────────────────────────────────────

router.get('/reportes', async (_req, res) => {
  const reportes = await prisma.reporte.findMany({
    include: {
      ponto: { select: { nome: true, cidade: true } },
      usuario: { select: { nome: true, email: true } },
    },
    orderBy: { criadoEm: 'desc' },
  })
  res.json(reportes)
})

// ─── PUT /admin/reportes/:id ─────────────────────────────────

router.put('/reportes/:id', async (req, res) => {
  const { status } = req.body
  const reporte = await prisma.reporte.update({
    where: { id: req.params.id },
    data: { status },
  })
  res.json(reporte)
})

export default router
