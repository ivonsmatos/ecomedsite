# EcoMed — Documento de Arquitetura & Engenharia
**Versão:** 1.0  
**Data:** Abril de 2026  
**Classificação:** Interno — Projeto Integrador  
**Responsável:** Coordenação Técnica EcoMed

---

## Sumário

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Perfis de Usuário (Multi-Perfil)](#2-perfis-de-usuário-multi-perfil)
3. [Requisitos Funcionais e Não-Funcionais](#3-requisitos-funcionais-e-não-funcionais)
4. [Mapa de Telas (Sitemap)](#4-mapa-de-telas-sitemap)
5. [Fluxos de Usuário (UX Flows)](#5-fluxos-de-usuário-ux-flows)
6. [Arquitetura Geral do Sistema](#6-arquitetura-geral-do-sistema)
7. [Stack Tecnológica](#7-stack-tecnológica)
8. [Estrutura de Diretórios do Projeto](#8-estrutura-de-diretórios-do-projeto)
9. [Modelagem do Banco de Dados](#9-modelagem-do-banco-de-dados)
10. [API REST — Contrato de Endpoints](#10-api-rest--contrato-de-endpoints)
11. [Arquitetura PWA](#11-arquitetura-pwa)
12. [Estratégia de Deploy e Infraestrutura Cloud](#12-estratégia-de-deploy-e-infraestrutura-cloud)
13. [Segurança](#13-segurança)
14. [Design System & Identidade Visual](#14-design-system--identidade-visual)
15. [Roadmap de Entrega](#15-roadmap-de-entrega)

---

## 1. Visão Geral do Produto

**EcoMed** é uma Progressive Web App (PWA) desenvolvida para facilitar o descarte correto de medicamentos vencidos ou sem uso no Brasil, conectando cidadãos a pontos de coleta cadastrados (farmácias, unidades de saúde, ecopontos).

### Missão
Reduzir o impacto ambiental do descarte inadequado de medicamentos, promovendo saúde pública e consciência ambiental por meio da tecnologia.

### Proposta de Valor por Perfil

| Perfil | Dor | Proposta EcoMed |
|--------|-----|-----------------|
| **Cidadão** | Não sabe onde descartar medicamentos | Localiza o ponto de coleta mais próximo em segundos |
| **Farmácia/Parceiro** | Quer visibilidade e cumprir legislação (RDC 222/2018) | Cadastro no mapa, painel de controle do ponto |
| **Investidor/Institucional** | Precisa entender o negócio e impacto | Landing page institucional com métricas e pitch |

---

## 2. Perfis de Usuário (Multi-Perfil)

### 2.1 Cidadão (Usuário Final)
- Acessa sem cadastro (modo anônimo para busca básica)
- Pode criar conta para salvar locais favoritos e histórico
- Mobile-first (principal dispositivo de acesso)

### 2.2 Parceiro (Farmácia / Ponto de Coleta)
- Cadastro obrigatório com CNPJ
- Gerencia informações do ponto (horário, capacidade, tipo de resíduo aceito)
- Acessa painel de estatísticas do ponto

### 2.3 Administrador (Equipe EcoMed)
- Aprova/rejeita cadastros de parceiros
- Visualiza dashboard global de uso e impacto
- Gerencia conteúdo (blog, FAQs, notificações)

### 2.4 Investidor / Visitante Institucional
- Acessa página pública de apresentação do projeto
- Sem necessidade de cadastro
- Foco em credibilidade, impacto ambiental e modelo de negócio

---

## 3. Requisitos Funcionais e Não-Funcionais

### 3.1 Requisitos Funcionais (RF)

#### Módulo Busca e Mapa
- **RF01** — O sistema deve exibir um mapa interativo com pontos de coleta
- **RF02** — O sistema deve filtrar pontos por tipo de resíduo, distância e horário
- **RF03** — O sistema deve geolocalizar o usuário automaticamente (com permissão)
- **RF04** — O sistema deve exibir detalhes do ponto (endereço, horário, contato, foto)
- **RF05** — O sistema deve permitir busca por CEP ou endereço

#### Módulo Usuário Cidadão
- **RF06** — O usuário pode criar conta com e-mail/senha ou OAuth (Google)
- **RF07** — O usuário pode salvar pontos favoritos
- **RF08** — O usuário pode reportar problemas em um ponto (fechado, errado)
- **RF09** — O usuário pode receber notificações push sobre pontos próximos

#### Módulo Parceiro
- **RF10** — O parceiro pode solicitar cadastro do ponto via formulário
- **RF11** — O parceiro pode editar informações do seu ponto
- **RF12** — O parceiro pode visualizar quantidade de visualizações do ponto
- **RF13** — O parceiro recebe notificações de reportes feitos pelos cidadãos

#### Módulo Administrativo
- **RF14** — O admin aprova ou rejeita solicitações de parceiros
- **RF15** — O admin visualiza dashboard com métricas: total de pontos, acessos, regiões
- **RF16** — O admin pode publicar conteúdo no blog/FAQ

#### Módulo Institucional
- **RF17** — A landing page institucional deve apresentar missão, impacto e equipe
- **RF18** — Deve existir formulário de contato para parcerias e investidores

### 3.2 Requisitos Não-Funcionais (RNF)

| Código | Categoria | Requisito |
|--------|-----------|-----------|
| RNF01 | Performance | Lighthouse Score ≥ 90 em todas as categorias |
| RNF02 | Performance | First Contentful Paint < 1.5s em 3G |
| RNF03 | Disponibilidade | Uptime ≥ 99.5% mensal |
| RNF04 | Responsividade | Layout responsivo: mobile (360px), tablet (768px), desktop (1280px+) |
| RNF05 | Acessibilidade | WCAG 2.1 nível AA |
| RNF06 | Segurança | HTTPS obrigatório, JWT com refresh token, rate limiting |
| RNF07 | Offline | Funcionalidades básicas disponíveis sem conexão (Service Worker) |
| RNF08 | Escalabilidade | Suportar até 10.000 usuários simultâneos na fase de escala |
| RNF09 | Compatibilidade | Suporte a Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| RNF10 | LGPD | Coleta mínima de dados, consentimento explícito, política de privacidade |

---

## 4. Mapa de Telas (Sitemap)

```
ecomed.com.br/
│
├── / ................................. Landing Page Institucional
│   ├── #hero ........................ Hero Section (CTA principal)
│   ├── #como-funciona ............... Como funciona (3 passos)
│   ├── #impacto ..................... Métricas de impacto ambiental
│   ├── #parceiros ................... Logos de parceiros
│   ├── #equipe ...................... Quem somos
│   └── #contato ..................... Formulário de contato/parceria
│
├── /mapa ............................ Mapa de Pontos de Coleta (público)
│   ├── ?q= .......................... Busca por endereço/CEP
│   └── /ponto/:id ................... Página de detalhe do ponto
│
├── /auth
│   ├── /login ....................... Login (cidadão e parceiro)
│   ├── /cadastro .................... Cadastro cidadão
│   └── /recuperar-senha ............. Recuperação de senha
│
├── /app ............................. Área autenticada — Cidadão
│   ├── /perfil ...................... Perfil do usuário
│   ├── /favoritos ................... Pontos favoritos salvos
│   └── /notificacoes ................ Central de notificações
│
├── /parceiro ........................ Área autenticada — Parceiro
│   ├── /dashboard ................... Painel do ponto
│   ├── /meu-ponto ................... Editar informações do ponto
│   ├── /estatisticas ................ Visualizações e reportes
│   └── /cadastro-ponto .............. Solicitar novo ponto
│
├── /admin ........................... Área autenticada — Admin
│   ├── /dashboard ................... Métricas globais
│   ├── /pontos ...................... Gerenciar pontos (aprovar/rejeitar)
│   ├── /usuarios .................... Gerenciar usuários
│   └── /conteudo .................... Blog e FAQs
│
├── /blog ............................ Blog / Educação ambiental
│   └── /:slug ....................... Artigo individual
│
├── /faq ............................. Perguntas frequentes
├── /politica-privacidade ............ Política de privacidade (LGPD)
└── /termos .......................... Termos de uso
```

---

## 5. Fluxos de Usuário (UX Flows)

### 5.1 Fluxo Principal — Cidadão localiza ponto de coleta

```
[Acessa ecomed.com.br/mapa]
        │
        ▼
[Permissão de geolocalização?]
    Sim ──────────────────────► [Mapa centraliza na localização atual]
    Não ──► [Campo de busca por CEP/endereço] ► [Mapa atualiza]
        │
        ▼
[Visualiza pins no mapa]
        │
        ▼
[Clica em um ponto]
        │
        ▼
[Drawer/Card lateral com detalhes]
  ├── Nome, endereço, horário
  ├── Tipos de resíduo aceitos
  ├── Botão "Como chegar" (abre Google Maps)
  ├── Botão "Favoritar" (requer login)
  └── Botão "Reportar problema"
        │
        ▼
[Fim do fluxo — missão cumprida]
```

### 5.2 Fluxo — Parceiro solicita cadastro de ponto

```
[Acessa /parceiro/cadastro-ponto]
        │
        ▼
[Formulário: dados da empresa]
  CNPJ → validação automática (ReceitaWS)
  Nome fantasia, telefone, e-mail responsável
        │
        ▼
[Dados do ponto de coleta]
  Endereço (autocomplete via ViaCEP + Google Places)
  Horário de funcionamento
  Tipos de resíduo aceitos (checkboxes)
  Foto do ponto (upload)
        │
        ▼
[Envio do formulário]
        │
        ▼
[Status: "Em análise" → e-mail de confirmação enviado]
        │
        ▼
[Admin recebe notificação no painel]
        │
   Aprovado ────► [Ponto aparece no mapa] ► [E-mail de aprovação ao parceiro]
   Rejeitado ───► [E-mail com motivo da rejeição]
```

### 5.3 Fluxo — Investidor / Institucional

```
[Acessa ecomed.com.br]
        │
        ▼
[Landing Page]
  Hero: CTA "Encontrar ponto" e "Seja parceiro"
        │
        ▼
[Scroll: Como funciona]
        │
        ▼
[Scroll: Impacto ambiental — counters animados]
        │
        ▼
[Scroll: Parceiros]
        │
        ▼
[Scroll: Equipe]
        │
        ▼
[Formulário de contato]
  Nome, e-mail, tipo de interesse (parceria / investimento / imprensa)
  Mensagem → Enviado via API → Notificação interna
```

---

## 6. Arquitetura Geral do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser/App)                 │
│                                                             │
│   React SPA/PWA                                             │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│   │  Landing    │  │  Mapa/Busca  │  │  Painéis Auth    │  │
│   │  Page       │  │  (Leaflet)   │  │  Cidadão/Parceiro│  │
│   └─────────────┘  └──────────────┘  └──────────────────┘  │
│                          │                                  │
│              Service Worker (Cache / Offline)               │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS / REST / JSON
┌──────────────────────────▼──────────────────────────────────┐
│                      API GATEWAY / CDN                       │
│              (Cloudflare / Vercel Edge)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     BACKEND — Node.js                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Auth        │  │  Pontos /    │  │  Admin /         │  │
│  │  Service     │  │  Busca API   │  │  Parceiros API   │  │
│  │  (JWT/OAuth) │  │  (Geosearch) │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                          │                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Notificações│  │  Upload      │  │  E-mail          │  │
│  │  (Web Push)  │  │  (Imagens)   │  │  (SendGrid)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼──────┐  ┌───────▼──────┐
│  PostgreSQL  │  │  Redis        │  │  S3 / R2     │
│  (Principal) │  │  (Cache/      │  │  (Imagens /  │
│  + PostGIS   │  │   Sessions)   │  │   Uploads)   │
└──────────────┘  └───────────────┘  └──────────────┘
```

---

## 7. Stack Tecnológica

### 7.1 Frontend

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | **React 18** | Decidido pela equipe, ecossistema maduro |
| Build Tool | **Vite** | Extremamente rápido, suporte nativo a PWA |
| Roteamento | **React Router v6** | Padrão de mercado para SPAs React |
| Estado Global | **Zustand** | Simples, leve, sem boilerplate excessivo |
| Requisições | **TanStack Query (React Query)** | Cache automático, loading/error states |
| UI Components | **shadcn/ui + Tailwind CSS** | Acessível, personalizável, sem bundle pesado |
| Mapas | **Leaflet + React-Leaflet** | Open source, tiles via OpenStreetMap (gratuito) |
| Formulários | **React Hook Form + Zod** | Performance e validação tipada |
| Notificações | **Web Push API** | Nativo do navegador, sem SDK proprietário |
| PWA | **Vite PWA Plugin (Workbox)** | Service Worker automático |
| Testes | **Vitest + Testing Library** | Integrado ao Vite |

### 7.2 Backend

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Runtime | **Node.js 20 LTS** | Mesma linguagem do front, equipe unificada |
| Framework | **Express.js** | Simples, amplamente conhecido pelos estudantes |
| ORM | **Prisma** | Type-safe, migrations automáticas, fácil de aprender |
| Autenticação | **JWT + Refresh Token** | Stateless, compatível com PWA |
| OAuth | **Passport.js (Google OAuth2)** | Login social |
| Validação | **Zod** | Schema compartilhável com o frontend |
| Upload | **Multer + Cloudflare R2** | Armazenamento de objetos S3-compatível e barato |
| E-mail | **Nodemailer + SendGrid** | Confiável para transacional |
| Push | **web-push (VAPID)** | Web Push nativo |
| Testes | **Jest + Supertest** | Padrão para APIs Node.js |

### 7.3 Banco de Dados

| Componente | Tecnologia |
|------------|-----------|
| Principal | **PostgreSQL 16** com extensão **PostGIS** (busca geoespacial) |
| Cache | **Redis 7** (sessions, rate limiting, dados frequentes) |
| Arquivos | **Cloudflare R2** (fotos dos pontos de coleta) |

### 7.4 DevOps / Infra

| Componente | Tecnologia |
|------------|-----------|
| Frontend Deploy | **Vercel** (CI/CD automático, Edge Network global) |
| Backend Deploy | **Railway** ou **Render** (Docker, fácil para estudantes) |
| Banco de Dados | **Supabase** (PostgreSQL gerenciado + PostGIS nativo) |
| Redis | **Upstash** (Redis serverless, free tier generoso) |
| DNS / CDN | **Cloudflare** |
| CI/CD | **GitHub Actions** |
| Monitoramento | **Sentry** (erros) + **Vercel Analytics** |

---

## 8. Estrutura de Diretórios do Projeto

### 8.1 Frontend (`/frontend`)

```
frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker (gerado pelo Vite PWA)
│   └── icons/                 # Ícones PWA (192x192, 512x512, etc.)
│
├── src/
│   ├── main.jsx               # Entry point
│   ├── App.jsx                # Roteamento principal
│   │
│   ├── assets/                # Imagens, fontes estáticas
│   │
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   ├── layout/            # Header, Footer, Sidebar
│   │   ├── map/               # MapView, MarkerCluster, PointDrawer
│   │   └── common/            # Button, Input, Modal, Toast...
│   │
│   ├── pages/                 # Telas (1 arquivo por rota)
│   │   ├── Landing/
│   │   ├── Mapa/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Cadastro.jsx
│   │   │   └── RecuperarSenha.jsx
│   │   ├── App/               # Área cidadão autenticado
│   │   ├── Parceiro/          # Área parceiro
│   │   ├── Admin/             # Área admin
│   │   └── Blog/
│   │
│   ├── hooks/                 # Custom hooks (useGeolocation, useAuth...)
│   ├── store/                 # Zustand stores (authStore, mapStore)
│   ├── services/              # Funções de chamada à API
│   │   ├── api.js             # Axios instance configurada
│   │   ├── auth.service.js
│   │   ├── pontos.service.js
│   │   └── parceiro.service.js
│   │
│   ├── lib/                   # Utilitários (formatters, validators)
│   ├── styles/                # Tailwind config, global CSS
│   └── types/                 # Tipos compartilhados (JSDoc ou TS)
│
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### 8.2 Backend (`/backend`)

```
backend/
├── prisma/
│   ├── schema.prisma          # Modelos do banco
│   └── migrations/            # Histórico de migrations
│
├── src/
│   ├── server.js              # Entry point (Express)
│   ├── app.js                 # Setup Express, middlewares globais
│   │
│   ├── routes/                # Definição de rotas
│   │   ├── auth.routes.js
│   │   ├── pontos.routes.js
│   │   ├── parceiro.routes.js
│   │   ├── admin.routes.js
│   │   └── push.routes.js
│   │
│   ├── controllers/           # Lógica de cada endpoint
│   │   ├── auth.controller.js
│   │   ├── pontos.controller.js
│   │   └── ...
│   │
│   ├── services/              # Regras de negócio
│   │   ├── auth.service.js
│   │   ├── pontos.service.js
│   │   ├── email.service.js
│   │   └── push.service.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js  # Verificação JWT
│   │   ├── role.middleware.js  # Controle de perfil
│   │   └── rateLimit.middleware.js
│   │
│   ├── lib/
│   │   ├── prisma.js           # Singleton Prisma Client
│   │   ├── redis.js            # Singleton Redis Client
│   │   └── upload.js           # Config Multer + R2
│   │
│   └── utils/                  # Helpers gerais
│
├── .env.example
├── Dockerfile
└── package.json
```

---

## 9. Modelagem do Banco de Dados

### Schema Prisma (PostgreSQL + PostGIS)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USUÁRIOS ────────────────────────────────────────────────

model Usuario {
  id           String    @id @default(uuid())
  nome         String
  email        String    @unique
  senhaHash    String?   // null se login via OAuth
  provider     Provider  @default(EMAIL)
  providerId   String?   // Google user ID
  perfil       Perfil    @default(CIDADAO)
  ativo        Boolean   @default(true)
  criadoEm     DateTime  @default(now())
  atualizadoEm DateTime  @updatedAt

  favoritos    Favorito[]
  reportes     Reporte[]
  parceiro     Parceiro?
  tokens       RefreshToken[]

  @@map("usuarios")
}

enum Provider {
  EMAIL
  GOOGLE
}

enum Perfil {
  CIDADAO
  PARCEIRO
  ADMIN
}

// ─── REFRESH TOKENS ──────────────────────────────────────────

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  usuarioId String
  usuario   Usuario  @relation(fields: [usuarioId], references: [id])
  expiresAt DateTime
  criadoEm  DateTime @default(now())

  @@map("refresh_tokens")
}

// ─── PARCEIROS ───────────────────────────────────────────────

model Parceiro {
  id           String          @id @default(uuid())
  usuarioId    String          @unique
  usuario      Usuario         @relation(fields: [usuarioId], references: [id])
  razaoSocial  String
  cnpj         String          @unique
  telefone     String?
  status       StatusParceiro  @default(PENDENTE)
  criadoEm     DateTime        @default(now())
  atualizadoEm DateTime        @updatedAt

  pontos       PontoColeta[]

  @@map("parceiros")
}

enum StatusParceiro {
  PENDENTE
  APROVADO
  REJEITADO
  SUSPENSO
}

// ─── PONTOS DE COLETA ────────────────────────────────────────

model PontoColeta {
  id             String        @id @default(uuid())
  parceiroId     String
  parceiro       Parceiro      @relation(fields: [parceiroId], references: [id])
  nome           String
  descricao      String?
  cep            String
  logradouro     String
  numero         String
  complemento    String?
  bairro         String
  cidade         String
  estado         String        @db.Char(2)
  latitude       Float
  longitude      Float
  fotoUrl        String?
  ativo          Boolean       @default(true)
  verificado     Boolean       @default(false)
  visualizacoes  Int           @default(0)
  criadoEm       DateTime      @default(now())
  atualizadoEm   DateTime      @updatedAt

  horarios       Horario[]
  tiposResiduos  PontoResiduos[]
  favoritos      Favorito[]
  reportes       Reporte[]

  @@map("pontos_coleta")
}

// ─── HORÁRIOS ────────────────────────────────────────────────

model Horario {
  id          String      @id @default(uuid())
  pontoId     String
  ponto       PontoColeta @relation(fields: [pontoId], references: [id])
  diaSemana   DiaSemana
  abreAs      String      // "08:00"
  fechaAs     String      // "18:00"

  @@map("horarios")
}

enum DiaSemana {
  SEGUNDA
  TERCA
  QUARTA
  QUINTA
  SEXTA
  SABADO
  DOMINGO
}

// ─── TIPOS DE RESÍDUO ────────────────────────────────────────

model TipoResiduo {
  id     String @id @default(uuid())
  nome   String @unique  // "Medicamentos vencidos", "Antibióticos", etc.
  icone  String?

  pontos PontoResiduos[]

  @@map("tipos_residuos")
}

model PontoResiduos {
  pontoId    String
  residuoId  String
  ponto      PontoColeta @relation(fields: [pontoId], references: [id])
  residuo    TipoResiduo @relation(fields: [residuoId], references: [id])

  @@id([pontoId, residuoId])
  @@map("ponto_residuos")
}

// ─── FAVORITOS ───────────────────────────────────────────────

model Favorito {
  usuarioId String
  pontoId   String
  usuario   Usuario     @relation(fields: [usuarioId], references: [id])
  ponto     PontoColeta @relation(fields: [pontoId], references: [id])
  criadoEm  DateTime    @default(now())

  @@id([usuarioId, pontoId])
  @@map("favoritos")
}

// ─── REPORTES ────────────────────────────────────────────────

model Reporte {
  id        String        @id @default(uuid())
  pontoId   String
  usuarioId String?
  ponto     PontoColeta   @relation(fields: [pontoId], references: [id])
  usuario   Usuario?      @relation(fields: [usuarioId], references: [id])
  motivo    MotivoReporte
  descricao String?
  status    StatusReporte @default(ABERTO)
  criadoEm  DateTime      @default(now())

  @@map("reportes")
}

enum MotivoReporte {
  PONTO_FECHADO
  ENDERECO_ERRADO
  NAO_ACEITA_RESIDUO
  OUTRO
}

enum StatusReporte {
  ABERTO
  EM_ANALISE
  RESOLVIDO
  DESCARTADO
}

// ─── PUSH SUBSCRIPTIONS ──────────────────────────────────────

model PushSubscription {
  id        String   @id @default(uuid())
  usuarioId String?
  endpoint  String   @unique
  keys      Json     // { p256dh, auth }
  criadoEm  DateTime @default(now())

  @@map("push_subscriptions")
}

// ─── BLOG ────────────────────────────────────────────────────

model Artigo {
  id           String   @id @default(uuid())
  slug         String   @unique
  titulo       String
  resumo       String
  conteudo     String   @db.Text
  imagemUrl    String?
  publicado    Boolean  @default(false)
  publicadoEm  DateTime?
  criadoEm     DateTime @default(now())
  atualizadoEm DateTime @updatedAt

  @@map("artigos")
}
```

### Índices Importantes

```sql
-- Busca geoespacial (PostGIS)
CREATE INDEX idx_pontos_geom 
ON pontos_coleta USING GIST (ST_MakePoint(longitude, latitude));

-- Busca por cidade/estado
CREATE INDEX idx_pontos_cidade ON pontos_coleta(cidade, estado);

-- Pontos ativos
CREATE INDEX idx_pontos_ativo ON pontos_coleta(ativo, verificado);
```

---

## 10. API REST — Contrato de Endpoints

**Base URL:** `https://api.ecomed.com.br/v1`  
**Autenticação:** `Authorization: Bearer <jwt_token>`

### 10.1 Auth

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/auth/register` | ❌ | Cadastro cidadão |
| POST | `/auth/login` | ❌ | Login e-mail/senha |
| POST | `/auth/refresh` | ❌ | Renovar access token |
| POST | `/auth/logout` | ✅ | Invalidar refresh token |
| GET | `/auth/google` | ❌ | Iniciar OAuth Google |
| GET | `/auth/google/callback` | ❌ | Callback OAuth |

### 10.2 Pontos de Coleta

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/pontos` | ❌ | Listar pontos (com filtros) |
| GET | `/pontos/proximos` | ❌ | Busca geoespacial por lat/lng/raio |
| GET | `/pontos/:id` | ❌ | Detalhe de um ponto |
| POST | `/pontos/:id/visualizacao` | ❌ | Registrar visualização |
| POST | `/pontos/:id/reporte` | ✅ | Reportar problema |
| POST | `/pontos/:id/favorito` | ✅ | Adicionar/remover favorito |

**Query params para GET /pontos:**
```
?lat=-23.5&lng=-46.6&raio=5000   # raio em metros
&residuo=antibioticos             # tipo de resíduo
&cidade=São Paulo
&estado=SP
&verificado=true
&page=1&limit=20
```

### 10.3 Parceiro

| Método | Endpoint | Auth | Perfil | Descrição |
|--------|----------|------|--------|-----------|
| POST | `/parceiro/solicitar` | ✅ | PARCEIRO | Solicitar cadastro |
| GET | `/parceiro/meu-ponto` | ✅ | PARCEIRO | Dados do seu ponto |
| PUT | `/parceiro/meu-ponto` | ✅ | PARCEIRO | Atualizar ponto |
| GET | `/parceiro/estatisticas` | ✅ | PARCEIRO | Views e reportes |
| POST | `/parceiro/meu-ponto/foto` | ✅ | PARCEIRO | Upload de foto |

### 10.4 Admin

| Método | Endpoint | Auth | Perfil | Descrição |
|--------|----------|------|--------|-----------|
| GET | `/admin/dashboard` | ✅ | ADMIN | Métricas globais |
| GET | `/admin/parceiros` | ✅ | ADMIN | Listar solicitações |
| PUT | `/admin/parceiros/:id/aprovar` | ✅ | ADMIN | Aprovar parceiro |
| PUT | `/admin/parceiros/:id/rejeitar` | ✅ | ADMIN | Rejeitar parceiro |
| GET | `/admin/reportes` | ✅ | ADMIN | Listar reportes |
| PUT | `/admin/reportes/:id` | ✅ | ADMIN | Atualizar status |

### 10.5 Push / Notificações

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/push/subscribe` | ❌ | Registrar subscription |
| DELETE | `/push/unsubscribe` | ❌ | Cancelar subscription |

---

## 11. Arquitetura PWA

### 11.1 Web App Manifest (`manifest.json`)

```json
{
  "name": "EcoMed — Descarte Consciente",
  "short_name": "EcoMed",
  "description": "Encontre o ponto de descarte correto para seus medicamentos",
  "start_url": "/mapa",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#2D7D46",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/mapa.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" }
  ],
  "categories": ["health", "utilities"],
  "lang": "pt-BR"
}
```

### 11.2 Estratégia de Cache (Service Worker via Workbox)

| Tipo de recurso | Estratégia | TTL |
|----------------|-----------|-----|
| Shell (HTML, JS, CSS) | Cache First | Indefinido (versioned) |
| Imagens estáticas | Cache First | 30 dias |
| API de pontos | Stale While Revalidate | 5 minutos |
| Tiles do mapa (OSM) | Cache First | 7 dias |
| Fotos dos pontos (R2) | Cache First | 1 dia |
| Auth endpoints | Network Only | — |

### 11.3 Funcionalidades Offline

- ✅ Visualizar pontos salvos no cache (último estado)
- ✅ Favoritos consultáveis offline
- ✅ Formulário de reporte salvo localmente → sincronizado ao reconectar
- ❌ Busca de novos pontos (requer conexão)
- ❌ Login/cadastro (requer conexão)

---

## 12. Estratégia de Deploy e Infraestrutura Cloud

### 12.1 Ambientes

| Ambiente | URL | Branch | Deploy |
|----------|-----|--------|--------|
| Desenvolvimento | localhost:5173 (front) / :3000 (back) | `dev` | Manual |
| Staging | staging.ecomed.com.br | `staging` | Automático via PR |
| Produção | ecomed.com.br | `main` | Manual (aprovação) |

### 12.2 Diagrama de Infraestrutura (Produção)

```
Usuário
   │
   ▼
Cloudflare DNS + CDN
   │
   ├──► Vercel Edge Network
   │         └──► React PWA (estático)
   │
   └──► Railway / Render
             └──► Node.js API (Docker)
                      │
                      ├──► Supabase (PostgreSQL + PostGIS)
                      ├──► Upstash Redis
                      └──► Cloudflare R2 (imagens)
```

### 12.3 Variáveis de Ambiente

**Frontend (`.env`):**
```env
VITE_API_URL=https://api.ecomed.com.br/v1
VITE_VAPID_PUBLIC_KEY=<chave_publica_vapid>
VITE_GOOGLE_MAPS_KEY=<opcional>
```

**Backend (`.env`):**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...
JWT_SECRET=<string_aleatoria_longa>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@ecomed.com.br
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=ecomed-uploads
```

### 12.4 Pipeline CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd frontend && npm ci && npm run test && npm run build

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm ci && npm test

  deploy-staging:
    needs: [test-frontend, test-backend]
    if: github.ref == 'refs/heads/staging'
    # Deploy automático para Vercel + Railway

  deploy-prod:
    needs: [test-frontend, test-backend]
    if: github.ref == 'refs/heads/main'
    # Deploy manual (environment protection no GitHub)
```

---

## 13. Segurança

### 13.1 Checklist de Segurança

- ✅ **HTTPS everywhere** — Cloudflare força TLS 1.2+
- ✅ **JWT de curta duração** — Access token: 15 min, Refresh: 30 dias
- ✅ **Rate limiting** — 100 req/min por IP na API pública
- ✅ **CORS restrito** — Apenas origens whitelisted
- ✅ **Helmet.js** — Headers HTTP de segurança
- ✅ **Validação de entrada** — Zod em todos os endpoints
- ✅ **SQL Injection** — Prevenido pelo Prisma (prepared statements)
- ✅ **XSS** — React escapa por padrão; CSP via headers
- ✅ **CSRF** — SameSite=Strict nos cookies de refresh token
- ✅ **Upload seguro** — Validação de tipo MIME + tamanho (max 5MB)
- ✅ **CNPJ validation** — Verificação via algoritmo + ReceitaWS
- ✅ **Dados sensíveis** — Senhas com bcrypt (salt rounds: 12)

### 13.2 LGPD

- Coleta mínima de dados pessoais (apenas nome e e-mail obrigatórios)
- Consentimento explícito no cadastro
- Usuário pode solicitar exclusão de conta (/app/perfil → "Excluir conta")
- Política de privacidade acessível em `/politica-privacidade`
- Dados de localização usados apenas em tempo real, não armazenados

---

## 14. Design System & Identidade Visual

### 14.1 Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#2D7D46` | Verde EcoMed — CTAs, links ativos |
| `--color-primary-light` | `#4CAF73` | Hover states |
| `--color-primary-dark` | `#1B5C32` | Texto sobre fundo claro |
| `--color-secondary` | `#4A90D9` | Azul informativo — ícones de mapa |
| `--color-accent` | `#F5A623` | Laranja — alertas, badges |
| `--color-danger` | `#D94A4A` | Vermelho — erros, reportes |
| `--color-bg` | `#F7F9F8` | Background principal |
| `--color-surface` | `#FFFFFF` | Cards, modais |
| `--color-text` | `#1A1A1A` | Texto principal |
| `--color-text-muted` | `#6B7280` | Texto secundário |

### 14.2 Tipografia

| Uso | Fonte | Peso | Tamanho |
|-----|-------|------|---------|
| Títulos | **Plus Jakarta Sans** | 700 | 2xl–4xl |
| Corpo | **Inter** | 400/500 | base (16px) |
| Código | **JetBrains Mono** | 400 | sm |
| UI Labels | **Inter** | 500 | sm |

### 14.3 Breakpoints

```css
sm:  640px   /* Smartphone grande */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop pequeno */
xl:  1280px  /* Desktop padrão */
2xl: 1536px  /* Desktop grande */
```

### 14.4 Componentes Chave

| Componente | Descrição |
|------------|-----------|
| `<MapView>` | Mapa Leaflet com clusters de pins verdes |
| `<PointCard>` | Card de ponto (drawer lateral no mobile, sidebar no desktop) |
| `<FilterBar>` | Barra de filtros: resíduo, distância, horário |
| `<StatusBadge>` | Badge colorido de status do ponto (ativo/fechado/pendente) |
| `<SearchInput>` | Campo de busca com autocomplete de endereço |
| `<PartnerForm>` | Formulário multi-step de cadastro de parceiro |

---

## 15. Roadmap de Entrega

### Sprint 0 — Setup (Semana 1)
- [ ] Repositório GitHub (monorepo ou dois repos separados)
- [ ] Setup frontend: Vite + React + Tailwind + shadcn/ui
- [ ] Setup backend: Express + Prisma + PostgreSQL (Supabase)
- [ ] Deploy inicial em Vercel e Railway
- [ ] Variáveis de ambiente configuradas
- [ ] GitHub Actions: lint + build

### Sprint 1 — MVP Mapa (Semanas 2–3)
- [ ] Integração Leaflet/OpenStreetMap
- [ ] Seed de dados (pontos fictícios para dev)
- [ ] API GET /pontos/proximos (busca geoespacial)
- [ ] Tela /mapa funcional com geolocalização
- [ ] Card de detalhe do ponto

### Sprint 2 — Autenticação (Semana 4)
- [ ] API auth (register, login, refresh, logout)
- [ ] OAuth Google
- [ ] Telas de login/cadastro
- [ ] Proteção de rotas no frontend
- [ ] Middleware de autenticação e perfis

### Sprint 3 — Parceiros (Semanas 5–6)
- [ ] Formulário de solicitação de ponto
- [ ] Painel do parceiro
- [ ] Fluxo de aprovação pelo admin
- [ ] Upload de foto do ponto

### Sprint 4 — Funcionalidades Extras (Semana 7)
- [ ] Favoritos
- [ ] Reporte de problemas
- [ ] Blog (CRUD admin + listagem pública)
- [ ] Notificações push (Web Push)

### Sprint 5 — PWA & Qualidade (Semana 8)
- [ ] Service Worker + cache strategy
- [ ] Manifest PWA completo
- [ ] Testes E2E principais
- [ ] Lighthouse audit ≥ 90
- [ ] LGPD: tela de política, consentimento

### Sprint 6 — Landing & Polimento (Semana 9)
- [ ] Landing page institucional completa
- [ ] Animações e micro-interações
- [ ] Revisão de acessibilidade (WCAG)
- [ ] Deploy produção com domínio próprio

### Sprint 7 — Apresentação Final (Semana 10)
- [ ] Documentação final (README, API docs)
- [ ] Demo gravada
- [ ] Métricas de impacto (relatório)
- [ ] Apresentação para banca

---

*Documento gerado em abril de 2026 — EcoMed Project · Coordenação Técnica*  
*Para dúvidas ou atualizações, abrir issue no repositório do projeto.*
