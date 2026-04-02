import { prisma } from '../lib/prisma'

export type EcocoinTipo =
  | 'CADASTRO_BONUS'
  | 'DESCARTE_REGISTRADO'
  | 'REPORTE_APROVADO'
  | 'INDICACAO_AMIGO'
  | 'CHAT_INTERACAO'
  | 'COMPARTILHAMENTO'
  | 'PERFIL_COMPLETO'
  | 'AVALIACAO_PONTO'
  | 'RESGATE_DESCONTO'
  | 'RESGATE_CERTIFICADO'
  | 'RESGATE_DOACAO'
  | 'EXPIRACAO'
  | 'AJUSTE_ADMIN'
  | 'ESTORNO'

export interface ResultadoEcoCoin {
  sucesso: boolean
  saldo_atual: number
  mensagem: string
}

export interface OpcoesCreditarEcoCoin {
  descricao?: string
  referenciaId?: string
  metadata?: Record<string, unknown>
}

/**
 * Credita ou debita EcoCoins de forma atômica via função PL/pgSQL.
 * A função já verifica limites diários/totais e garante saldo não negativo.
 */
export async function creditarEcoCoin(
  usuarioId: string,
  tipo: EcocoinTipo,
  valor: number,
  opcoes: OpcoesCreditarEcoCoin = {},
): Promise<ResultadoEcoCoin> {
  const { descricao = null, referenciaId = null, metadata = {} } = opcoes

  const resultado = await prisma.$queryRaw<ResultadoEcoCoin[]>`
    SELECT * FROM creditar_ecocoin(
      ${usuarioId}::text,
      ${tipo}::text,
      ${valor}::integer,
      ${descricao},
      ${referenciaId},
      ${JSON.stringify(metadata)}::jsonb
    )
  `

  return resultado[0]
}

/**
 * Retorna o saldo atual do usuário (cria registro zerado se não existir).
 */
export async function obterSaldo(usuarioId: string) {
  const saldo = await prisma.ecocoinSaldo.findUnique({
    where: { usuarioId },
  })

  return {
    saldo: saldo?.saldo ?? 0,
    totalGanho: saldo?.totalGanho ?? 0,
    totalUsado: saldo?.totalUsado ?? 0,
    atualizadoEm: saldo?.atualizadoEm ?? null,
  }
}

/**
 * Retorna o extrato paginado de transações do usuário.
 */
export async function obterExtrato(usuarioId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit

  const [total, transacoes] = await Promise.all([
    prisma.ecocoinTransacao.count({ where: { usuarioId } }),
    prisma.ecocoinTransacao.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        tipo: true,
        valor: true,
        saldoApos: true,
        descricao: true,
        criadoEm: true,
      },
    }),
  ])

  return {
    data: transacoes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
