import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import passport from 'passport'

import authRoutes from './routes/auth.routes'
import pontosRoutes from './routes/pontos.routes'
import parceiroRoutes from './routes/parceiro.routes'
import adminRoutes from './routes/admin.routes'
import pushRoutes from './routes/push.routes'

const app = express()

// ─── Segurança ───────────────────────────────────────────────
app.use(helmet())

// CORS — permite apenas origens whitelisted
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',')
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite chamadas sem origin (ex.: ferramentas de teste) em dev
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: origem não permitida — ${origin}`))
      }
    },
    credentials: true, // Necessário para cookies de refresh token
  }),
)

// ─── Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 1 minuto.' },
})
app.use('/api', limiter)

// ─── Parsers ─────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ─── Passport (OAuth) ────────────────────────────────────────
app.use(passport.initialize())

// ─── Rotas ───────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/pontos', pontosRoutes)
app.use('/api/v1/parceiro', parceiroRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/push', pushRoutes)

// ─── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// ─── Tratamento de erros global ──────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

export default app
