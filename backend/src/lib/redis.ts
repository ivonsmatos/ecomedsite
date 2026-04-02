import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL

// Singleton Redis — null se REDIS_URL não configurado (dev sem Redis)
let redis: Redis | null = null

export function getRedis(): Redis | null {
  if (!REDIS_URL) return null

  if (!redis) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })

    redis.on('error', (err) => {
      console.error('[Redis] Erro de conexão:', err.message)
    })
  }
  return redis
}

export { redis }
