import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados EcoMed...')

  // ─── Tipos de Resíduo ─────────────────────────────────────────
  const tipos = await Promise.all([
    prisma.tipoResiduo.upsert({
      where: { nome: 'Medicamentos vencidos' },
      create: { nome: 'Medicamentos vencidos', icone: '💊' },
      update: {},
    }),
    prisma.tipoResiduo.upsert({
      where: { nome: 'Antibióticos' },
      create: { nome: 'Antibióticos', icone: '🧪' },
      update: {},
    }),
    prisma.tipoResiduo.upsert({
      where: { nome: 'Quimioterápicos' },
      create: { nome: 'Quimioterápicos', icone: '⚗️' },
      update: {},
    }),
    prisma.tipoResiduo.upsert({
      where: { nome: 'Homeopáticos' },
      create: { nome: 'Homeopáticos', icone: '🌿' },
      update: {},
    }),
    prisma.tipoResiduo.upsert({
      where: { nome: 'Insulinas' },
      create: { nome: 'Insulinas', icone: '💉' },
      update: {},
    }),
  ])

  console.log(`✅ ${tipos.length} tipos de resíduo criados`)

  // ─── Usuário Admin ────────────────────────────────────────────
  const senhaHashAdmin = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@ecomed.com.br' },
    create: {
      nome: 'Admin EcoMed',
      email: 'admin@ecomed.com.br',
      senhaHash: senhaHashAdmin,
      perfil: 'ADMIN',
    },
    update: {},
  })

  // ─── Usuário Parceiro de Teste ────────────────────────────────
  const senhaHashParceiro = await bcrypt.hash('Parceiro@123', 12)
  const usuarioParceiro = await prisma.usuario.upsert({
    where: { email: 'farmacia@exemplo.com.br' },
    create: {
      nome: 'Farmácia Exemplo',
      email: 'farmacia@exemplo.com.br',
      senhaHash: senhaHashParceiro,
      perfil: 'PARCEIRO',
    },
    update: {},
  })

  // ─── Parceiro ─────────────────────────────────────────────────
  const parceiro = await prisma.parceiro.upsert({
    where: { usuarioId: usuarioParceiro.id },
    create: {
      usuarioId: usuarioParceiro.id,
      razaoSocial: 'Farmácia Exemplo LTDA',
      cnpj: '12345678000195',
      telefone: '(11) 99999-0000',
      status: 'APROVADO',
    },
    update: {},
  })

  // ─── Pontos de Coleta (dados fictícios para dev) ──────────────
  const pontosData = [
    {
      nome: 'Farmácia Central SP',
      cidade: 'São Paulo', estado: 'SP',
      bairro: 'Centro', logradouro: 'Av. Paulista', numero: '100',
      cep: '01310100', latitude: -23.5613, longitude: -46.6562,
      verificado: true,
    },
    {
      nome: 'Drogaria Saúde RJ',
      cidade: 'Rio de Janeiro', estado: 'RJ',
      bairro: 'Copacabana', logradouro: 'Av. Atlântica', numero: '500',
      cep: '22010001', latitude: -22.9699, longitude: -43.1864,
      verificado: true,
    },
    {
      nome: 'UBS Jardim Europa - BH',
      cidade: 'Belo Horizonte', estado: 'MG',
      bairro: 'Jardim Europa', logradouro: 'Rua das Flores', numero: '200',
      cep: '30180000', latitude: -19.9191, longitude: -43.9386,
      verificado: false,
    },
    {
      nome: 'Ecoponto Curitiba Centro',
      cidade: 'Curitiba', estado: 'PR',
      bairro: 'Centro', logradouro: 'Rua XV de Novembro', numero: '350',
      cep: '80020310', latitude: -25.4284, longitude: -49.2732,
      verificado: true,
    },
    {
      nome: 'Farmácia Popular Fortaleza',
      cidade: 'Fortaleza', estado: 'CE',
      bairro: 'Meireles', logradouro: 'Av. Beira Mar', numero: '800',
      cep: '60165120', latitude: -3.7327, longitude: -38.5022,
      verificado: false,
    },
  ]

  for (const ponto of pontosData) {
    const p = await prisma.pontoColeta.upsert({
      where: { id: `seed-${ponto.nome.toLowerCase().replace(/\s/g, '-')}` },
      create: {
        id: `seed-${ponto.nome.toLowerCase().replace(/\s/g, '-')}`,
        parceiroId: parceiro.id,
        ...ponto,
        horarios: {
          create: [
            { diaSemana: 'SEGUNDA', abreAs: '08:00', fechaAs: '18:00' },
            { diaSemana: 'TERCA', abreAs: '08:00', fechaAs: '18:00' },
            { diaSemana: 'QUARTA', abreAs: '08:00', fechaAs: '18:00' },
            { diaSemana: 'QUINTA', abreAs: '08:00', fechaAs: '18:00' },
            { diaSemana: 'SEXTA', abreAs: '08:00', fechaAs: '17:00' },
            { diaSemana: 'SABADO', abreAs: '09:00', fechaAs: '13:00' },
          ],
        },
        tiposResiduos: {
          create: tipos.slice(0, 2).map((t) => ({ residuoId: t.id })),
        },
      },
      update: {},
    })
    console.log(`📍 Ponto criado: ${p.nome}`)
  }

  console.log('\n✅ Seed concluído com sucesso!')
  console.log('Credenciais de acesso:')
  console.log(`  Admin:    admin@ecomed.com.br / Admin@123`)
  console.log(`  Parceiro: farmacia@exemplo.com.br / Parceiro@123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
