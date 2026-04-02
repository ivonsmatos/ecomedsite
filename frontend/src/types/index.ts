// ─── Auth ────────────────────────────────────────────────────────────────────

export type Perfil = 'CIDADAO' | 'PARCEIRO' | 'ADMIN'
export type Provider = 'EMAIL' | 'GOOGLE'
export type StatusParceiro = 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'SUSPENSO'
export type DiaSemana = 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO' | 'DOMINGO'
export type MotivoReporte = 'PONTO_FECHADO' | 'ENDERECO_ERRADO' | 'NAO_ACEITA_RESIDUO' | 'OUTRO'
export type StatusReporte = 'ABERTO' | 'EM_ANALISE' | 'RESOLVIDO' | 'DESCARTADO'

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
  provider: Provider
  ativo: boolean
  criadoEm: string
}

export interface LoginInput {
  email: string
  senha: string
}

export interface RegisterInput {
  nome: string
  email: string
  senha: string
}

export interface AuthResponse {
  usuario: Usuario
  accessToken: string
}

// ─── Pontos de Coleta ────────────────────────────────────────────────────────

export interface Horario {
  id: string
  diaSemana: DiaSemana
  abreAs: string
  fechaAs: string
}

export interface TipoResiduo {
  id: string
  nome: string
  icone?: string
}

export interface PontoColeta {
  id: string
  nome: string
  descricao?: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  latitude: number
  longitude: number
  fotoUrl?: string
  ativo: boolean
  verificado: boolean
  visualizacoes: number
  horarios: Horario[]
  tiposResiduos: { residuo: TipoResiduo }[]
  parceiro: {
    razaoSocial: string
    telefone?: string
  }
  criadoEm: string
}

export interface PontoProximoParams {
  lat: number
  lng: number
  raio?: number // metros
  residuo?: string
  page?: number
  limit?: number
}

// ─── Paginação ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Mapa ────────────────────────────────────────────────────────────────────

export interface Coordenada {
  lat: number
  lng: number
}

// ─── Formulários ─────────────────────────────────────────────────────────────

export interface CadastroParceiroInput {
  razaoSocial: string
  cnpj: string
  telefone?: string
  nomePonto: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  latitude: number
  longitude: number
  horarios: Omit<Horario, 'id'>[]
  tiposResiduos: string[]
}
