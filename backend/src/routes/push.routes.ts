import { Router } from 'express'
import { z } from 'zod'
import webpush from 'web-push'
import { prisma } from '../lib/prisma'

const router = Router()

// Configura VAPID ao iniciar
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.EMAIL_FROM ?? 'noreply@ecomed.com.br'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  usuarioId: z.string().uuid().optional(),
})

// ─── POST /push/subscribe ─────────────────────────────────────

router.post('/subscribe', async (req, res) => {
  const parsed = subscribeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados de subscription inválidos' })
    return
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    update: { keys: parsed.data.keys, usuarioId: parsed.data.usuarioId },
    create: parsed.data,
  })

  res.status(201).json({ message: 'Subscription registrada' })
})

// ─── DELETE /push/unsubscribe ─────────────────────────────────

router.delete('/unsubscribe', async (req, res) => {
  const { endpoint } = req.body
  if (!endpoint) {
    res.status(400).json({ error: 'Endpoint obrigatório' })
    return
  }

  await prisma.pushSubscription.deleteMany({ where: { endpoint } })
  res.json({ message: 'Subscription removida' })
})

export default router
