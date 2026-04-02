import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { autenticar } from '../middlewares/auth.middleware'

const router = Router()

// ─── Schemas de validação ────────────────────────────────────

const registerSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
})

// ─── Utilitários de JWT ──────────────────────────────────────

function gerarAccessToken(usuario: { id: string; email: string; perfil: string }) {
  return jwt.sign(
    { sub: usuario.id, email: usuario.email, perfil: usuario.perfil },
    process.env.JWT_SECRET!,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' } as any,
  )
}

function gerarRefreshToken() {
  return crypto.randomBytes(64).toString('hex')
}

function setRefreshTokenCookie(res: import('express').Response, token: string) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    path: '/api/v1/auth',
  })
}

// ─── POST /auth/register ─────────────────────────────────────

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const { nome, email, senha } = parsed.data

  const existente = await prisma.usuario.findUnique({ where: { email } })
  if (existente) {
    res.status(409).json({ error: 'E-mail já cadastrado' })
    return
  }

  const senhaHash = await bcrypt.hash(senha, 12)
  const usuario = await prisma.usuario.create({
    data: { nome, email, senhaHash },
    select: { id: true, nome: true, email: true, perfil: true, provider: true, criadoEm: true },
  })

  const accessToken = gerarAccessToken({ id: usuario.id, email: usuario.email, perfil: usuario.perfil })
  const refreshToken = gerarRefreshToken()

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      usuarioId: usuario.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  setRefreshTokenCookie(res, refreshToken)
  res.status(201).json({ usuario, accessToken })
})

// ─── POST /auth/login ────────────────────────────────────────

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' })
    return
  }

  const { email, senha } = parsed.data

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario || !usuario.senhaHash) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash)
  if (!senhaValida) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  if (!usuario.ativo) {
    res.status(403).json({ error: 'Conta desativada' })
    return
  }

  const accessToken = gerarAccessToken({ id: usuario.id, email: usuario.email, perfil: usuario.perfil })
  const refreshToken = gerarRefreshToken()

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      usuarioId: usuario.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  setRefreshTokenCookie(res, refreshToken)
  res.json({
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      provider: usuario.provider,
      criadoEm: usuario.criadoEm,
    },
    accessToken,
  })
})

// ─── POST /auth/refresh ──────────────────────────────────────

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token
  if (!token) {
    res.status(401).json({ error: 'Refresh token ausente' })
    return
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { usuario: true },
  })

  if (!stored || stored.expiresAt < new Date()) {
    res.clearCookie('refresh_token')
    res.status(401).json({ error: 'Refresh token inválido ou expirado' })
    return
  }

  // Rotação de refresh token (uma vez usado, cria novo)
  const novoRefresh = gerarRefreshToken()

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { token } }),
    prisma.refreshToken.create({
      data: {
        token: novoRefresh,
        usuarioId: stored.usuarioId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  const accessToken = gerarAccessToken({
    id: stored.usuario.id,
    email: stored.usuario.email,
    perfil: stored.usuario.perfil,
  })

  setRefreshTokenCookie(res, novoRefresh)
  res.json({ accessToken })
})

// ─── POST /auth/logout ───────────────────────────────────────

router.post('/logout', autenticar, async (req, res) => {
  const token = req.cookies?.refresh_token
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } })
  }
  res.clearCookie('refresh_token')
  res.json({ message: 'Logout realizado com sucesso' })
})

export default router
