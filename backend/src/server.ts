import 'dotenv/config'
import app from './app'
import { prisma } from './lib/prisma'

const PORT = Number(process.env.PORT ?? 3000)

async function bootstrap() {
  try {
    await prisma.$connect()
    console.log('[DB] Conectado ao PostgreSQL via Prisma')

    app.listen(PORT, () => {
      console.log(`[Server] EcoMed API rodando em http://localhost:${PORT}`)
      console.log(`[Server] Ambiente: ${process.env.NODE_ENV ?? 'development'}`)
    })
  } catch (err) {
    console.error('[Server] Falha ao iniciar:', err)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  console.log('[Server] Encerrado graciosamente')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

bootstrap()
