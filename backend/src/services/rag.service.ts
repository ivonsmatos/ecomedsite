import { prisma } from '../lib/prisma'
import { ollama, EMBED_MODEL } from '../lib/ollama'
import pgvector from 'pgvector'

const DEFAULT_TOP_K    = 5
const DEFAULT_THRESHOLD = 0.68

export interface ChunkResult {
  content: string
  metadata: Record<string, unknown>
  similaridade: number
}

/**
 * Gera embedding para um texto via Ollama (nomic-embed-text).
 * O prefixo "search_document:" é obrigatório para o nomic durante ingestão.
 * O prefixo "search_query:" é obrigatório para queries em runtime.
 */
export async function gerarEmbedding(texto: string, modo: 'documento' | 'query' = 'query'): Promise<number[]> {
  const prefixo = modo === 'documento' ? 'search_document: ' : 'search_query: '
  const resp = await ollama.embeddings.create({
    model: EMBED_MODEL,
    input: prefixo + texto,
  })
  return resp.data[0].embedding
}

/**
 * Busca os chunks mais similares à pergunta usando cosine similarity via pgvector.
 * Retorna o contexto já concatenado como string pronto para injetar no prompt.
 */
export async function buscarContexto(
  pergunta: string,
  opcoes?: { topK?: number; threshold?: number },
): Promise<string> {
  const { topK = DEFAULT_TOP_K, threshold = DEFAULT_THRESHOLD } = opcoes ?? {}

  let embedding: number[]
  try {
    embedding = await gerarEmbedding(pergunta, 'query')
  } catch {
    // Ollama indisponível → retorna contexto vazio (chat funciona sem RAG)
    return ''
  }

  const vec = pgvector.toSql(embedding)

  const chunks = await prisma.$queryRaw<ChunkResult[]>`
    SELECT
      content,
      metadata,
      CAST(1 - (embedding <=> ${vec}::vector) AS FLOAT) AS similaridade
    FROM knowledge_chunks
    WHERE 1 - (embedding <=> ${vec}::vector) > ${threshold}
    ORDER BY embedding <=> ${vec}::vector
    LIMIT ${topK}
  `

  if (chunks.length === 0) return ''

  return chunks.map((c) => c.content).join('\n\n---\n\n')
}

/**
 * Ingere um chunk de texto na base de conhecimento (usado pelo script de ingestão).
 */
export async function ingerirChunk(
  content: string,
  metadata: Record<string, unknown> = {},
  fonte = 'actahub-v1',
): Promise<void> {
  const embedding = await gerarEmbedding(content, 'documento')
  const vec = pgvector.toSql(embedding)

  await prisma.$executeRaw`
    INSERT INTO knowledge_chunks (id, content, embedding, metadata, fonte)
    VALUES (gen_random_uuid(), ${content}, ${vec}::vector, ${metadata}::jsonb, ${fonte})
  `
}
