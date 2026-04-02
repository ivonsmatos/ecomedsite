# EcoMed — Documentação Técnica Completa

> Plataforma de Descarte Consciente de Resíduos de Saúde com IA, RAG e Gamificação

---

## Sumário

- [Arquitetura](#arquitetura)
- [Stack Tecnológico](#stack-tecnológico)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Setup de Desenvolvimento](#setup-de-desenvolvimento)
- [Banco de Dados](#banco-de-dados)
- [API — Endpoints](#api--endpoints)
- [Chat IA + RAG](#chat-ia--rag)
- [Sistema EcoCoin](#sistema-ecocoin)
- [Frontend](#frontend)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Sprints](#sprints)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (PWA)                      │
│     Vite 6 + React 18 + TypeScript + Tailwind CSS v4     │
│     Leaflet (mapa) │ Zustand 5 │ TanStack Query v5       │
└─────────────────────────────┬───────────────────────────┘
                              │ HTTPS / SSE
┌─────────────────────────────▼───────────────────────────┐
│                    BACKEND (Express 5)                    │
│              TypeScript 5 + Prisma 6 + Zod 3             │
│   JWT Auth │ Rate Limiter │ CORS │ Helmet │ Morgan        │
└──────┬────────────────┬──────────────────────────────────┘
       │                │
┌──────▼──────┐  ┌──────▼─────────────────────────────────┐
│ PostgreSQL  │  │            Ollama (local/server)         │
│ 16+pgvector │  │  qwen3:8b (chat) │ nomic-embed-text      │
│ porta 5555  │  │  http://localhost:11434/v1               │
└─────────────┘  └─────────────────────────────────────────┘
```

### Fluxo RAG (Retrieval-Augmented Generation)

```
Usuário envia mensagem
    ↓
gerarEmbedding() — nomic-embed-text, 768 dims, prefixo "search_query:"
    ↓
buscarContexto() — pgvector cosine search (<=>), HNSW index
    top-5 chunks, threshold 0.68
    ↓
buildSystemPrompt() — contexto RAG + regras EcoMed
    ↓
qwen3:8b via Ollama — OpenAI SDK streaming
    ↓
SSE token a token → frontend (EventSource reader)
    ↓
creditarEcoCoin() — CHAT_INTERACAO (+1 EC)
```

---

## Stack Tecnológico

### Frontend

| Tecnologia              | Versão | Uso                   |
| ----------------------- | ------ | --------------------- |
| React                   | 18     | UI                    |
| TypeScript              | 5      | Tipagem               |
| Vite                    | 6      | Build / HMR           |
| Tailwind CSS            | v4     | Estilos               |
| Zustand                 | 5      | Estado global         |
| TanStack Query          | v5     | Cache / data fetching |
| React Router DOM        | 6      | Roteamento SPA        |
| Leaflet + React-Leaflet | 1.9    | Mapa interativo       |
| vite-plugin-pwa         | latest | PWA / Service Worker  |
| Lucide React            | latest | Ícones                |
| Axios                   | latest | HTTP client           |

### Backend

| Tecnologia         | Versão | Uso                              |
| ------------------ | ------ | -------------------------------- |
| Node.js            | 22     | Runtime                          |
| Express            | 5      | HTTP framework                   |
| TypeScript         | 5      | Tipagem                          |
| Prisma             | 6      | ORM                              |
| PostgreSQL         | 16     | Banco principal                  |
| pgvector           | —      | Busca vetorial                   |
| Zod                | 3      | Validação de schema              |
| jsonwebtoken       | —      | Auth JWT                         |
| bcryptjs           | —      | Hash de senhas                   |
| openai SDK         | —      | Client Ollama (compatível)       |
| pgvector npm       | —      | `toSql()` para cast de embedding |
| express-rate-limit | —      | Rate limiting                    |
| helmet             | —      | Segurança HTTP headers           |
| morgan             | —      | Logging                          |

### Infraestrutura

| Serviço               | Imagem                        | Porta |
| --------------------- | ----------------------------- | ----- |
| PostgreSQL + pgvector | `pgvector/pgvector:pg16`      | 5555  |
| Ollama (LLM local)    | `ollama/ollama` ou app nativa | 11434 |

---

## Estrutura do Projeto

```
EcoMedS/                           ← raiz do monorepo
├── package.json                   ← npm workspaces root
├── package-lock.json
├── README.md
├── docs/
│   └── TECHNICAL.md               ← este arquivo
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                ← Roteamento SPA (React Router)
│       ├── components/
│       │   ├── common/
│       │   │   ├── LoadingSpinner.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   ├── ecocoin/
│       │   │   └── EcoCoinWidget.tsx  ← Saldo EC no header (pill verde)
│       │   └── layout/
│       │       ├── Header.tsx         ← Nav com EcoCoinWidget + chat
│       │       └── Footer.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useEcoMedChat.ts       ← SSE streaming hook
│       ├── pages/
│       │   ├── Landing/
│       │   │   └── Landing.tsx
│       │   ├── Mapa/
│       │   │   ├── Mapa.tsx
│       │   │   └── PontoDetalhe.tsx
│       │   ├── Auth/
│       │   │   ├── Login.tsx
│       │   │   ├── Cadastro.tsx
│       │   │   └── RecuperarSenha.tsx
│       │   ├── App/
│       │   │   ├── Perfil.tsx
│       │   │   ├── Favoritos.tsx
│       │   │   └── Notificacoes.tsx
│       │   ├── Chat/
│       │   │   └── Chat.tsx           ← Interface do assistente IA
│       │   ├── Parceiro/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── MeuPonto.tsx
│       │   │   └── CadastroPonto.tsx
│       │   ├── Admin/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Pontos.tsx
│       │   │   └── Usuarios.tsx
│       │   └── Blog/
│       │       ├── Blog.tsx
│       │       └── Artigo.tsx
│       ├── services/
│       │   └── api.ts                 ← Axios com interceptors JWT
│       ├── store/
│       │   └── authStore.ts           ← Zustand auth state
│       ├── lib/
│       │   └── utils.ts               ← cn(), formatters
│       └── types/
│           └── index.ts
│
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env                       ← NÃO comitado
    ├── .env.example               ← Template público
    ├── prisma/
    │   ├── schema.prisma          ← 14+ modelos Prisma
    │   ├── seed.ts                ← 5 pontos coleta seed
    │   ├── tsconfig.seed.json     ← tsconfig p/ ts-node rodar seed
    │   └── migrations/
    │       ├── 20260402022612_initial_schema/
    │       │   └── migration.sql  ← Schema inicial completo
    │       ├── 20260402024447_add_rag_ecocoin/
    │       │   └── migration.sql  ← pgvector + EcoCoin + PL/pgSQL
    │       └── 20260402024654/
    │           └── migration.sql  ← (vazia, safe to ignore)
    └── src/
        ├── app.ts                 ← Express setup, rotas, middlewares
        ├── server.ts              ← Entrypoint (listen)
        ├── lib/
        │   ├── prisma.ts          ← Prisma singleton
        │   ├── redis.ts           ← Redis opcional
        │   └── ollama.ts          ← OpenAI SDK → Ollama
        ├── routes/
        │   ├── auth.routes.ts
        │   ├── pontos.routes.ts
        │   ├── chat.routes.ts     ← POST /chat (SSE) + GET /chat/status
        │   └── ecocoin.routes.ts  ← 5 endpoints EcoCoin
        ├── services/
        │   ├── rag.service.ts     ← gerarEmbedding, buscarContexto, ingerirChunk
        │   └── ecocoin.service.ts ← creditarEcoCoin, obterSaldo, obterExtrato
        └── middleware/
            └── auth.middleware.ts
```

---

## Setup de Desenvolvimento

### Pré-requisitos

- Node.js ≥ 22
- npm ≥ 10
- Docker Desktop

### 1. Clonar

```bash
git clone https://github.com/ivonsmatos/ecomedsite.git
cd ecomedsite
```

### 2. Instalar dependências (monorepo)

```bash
npm install
```

> O npm workspaces instala `frontend/` e `backend/` automaticamente a partir da raiz.

### 3. Variáveis de ambiente

```bash
cp backend/.env.example backend/.env
# Editar backend/.env conforme necessário
```

### 4. PostgreSQL com pgvector (Docker)

```bash
docker run -d \
  --name ecomed-postgres \
  -e POSTGRES_USER=ecomed \
  -e POSTGRES_PASSWORD=ecomed123 \
  -e POSTGRES_DB=ecomed \
  -p 5555:5432 \
  pgvector/pgvector:pg16
```

> **Porta 5555** — evita conflito com PostgreSQL local (5432/5433).

### 5. Migrations + seed

```bash
cd backend
npx prisma migrate deploy
npx ts-node --project prisma/tsconfig.seed.json prisma/seed.ts
```

### 6. Ollama (opcional — chat tem fallback)

```bash
# Windows
winget install Ollama.Ollama

# Baixar modelos
ollama pull qwen3:8b
ollama pull nomic-embed-text
```

> Sem Ollama, o endpoint `GET /api/v1/chat/status` retorna `{"disponivel": false}` e o chat exibe mensagem amigável.

### 7. Iniciar servidores

```bash
# Na raiz — frontend + backend em paralelo
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:3333
```

---

## Banco de Dados

### Modelos Prisma

| Modelo             | Tabela                 | Descrição                          |
| ------------------ | ---------------------- | ---------------------------------- |
| `Usuario`          | `usuarios`             | Cidadão / Parceiro / Admin         |
| `PontoColeta`      | `pontos_coleta`        | Locais de descarte com lat/lng     |
| `TipoResiduoPonto` | `tipos_residuos_ponto` | Tipos aceitos por ponto            |
| `Avaliacao`        | `avaliacoes`           | Notas (1-5) + comentários          |
| `Favorito`         | `favoritos`            | Pontos salvos pelo usuário         |
| `Notificacao`      | `notificacoes`         | Alertas in-app                     |
| `BlogPost`         | `blog_posts`           | Artigos educativos                 |
| `EcocoinSaldo`     | `ecocoin_saldos`       | Saldo atual de EC por usuário      |
| `EcocoinTransacao` | `ecocoin_transacoes`   | Ledger auditável (débito/crédito)  |
| `EcocoinRegra`     | `ecocoin_regras`       | Regras de crédito (14 tipos)       |
| `EcocoinResgate`   | `ecocoin_resgates`     | Resgates realizados                |
| `KnowledgeChunk`   | `knowledge_chunks`     | Chunks com embedding pgvector 768d |

### pgvector — HNSW Index

```sql
-- Habilitado na migration 20260402024447
CREATE EXTENSION IF NOT EXISTS vector;

-- Índice HNSW para busca aproximada de vizinhos
CREATE INDEX "knowledge_hnsw_idx" ON "knowledge_chunks"
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

### Função PL/pgSQL `creditar_ecocoin()`

Função atômica que garante consistência sem race conditions:

1. Bloqueia o saldo do usuário (`SELECT ... FOR UPDATE` implícito no upsert)
2. Verifica limite diário (soma das transações do dia)
3. Verifica limite total configurado em `ecocoin_regras`
4. Faz `INSERT ... ON CONFLICT DO UPDATE` no saldo
5. Insere no ledger `ecocoin_transacoes`

```sql
SELECT * FROM creditar_ecocoin(
  p_usuario_id  := '...',    -- UUID do usuário
  p_tipo        := 'DESCARTE_MEDICAMENTO',
  p_valor       := 10,       -- EC a creditar
  p_descricao   := 'Descarte no Ponto X',
  p_ref_id      := '...'     -- UUID do ponto (opcional)
);
-- Retorna: usuario_id, novo_saldo, transacao_id, limitado (boolean)
```

### Seed inicial

5 pontos de coleta em capitais brasileiras:

- São Paulo (SP)
- Rio de Janeiro (RJ)
- Belo Horizonte (MG)
- Curitiba (PR)
- Fortaleza (CE)

---

## API — Endpoints

**Base URL:** `http://localhost:3333/api/v1`

### Health Check

```
GET /health
→ { "status": "ok", "postgres": true, "ollama": true, "pgvector": true }
```

### Autenticação

| Método | Rota             | Body                            | Descrição               |
| ------ | ---------------- | ------------------------------- | ----------------------- |
| `POST` | `/auth/cadastro` | `{nome, email, senha, perfil?}` | Criar conta             |
| `POST` | `/auth/login`    | `{email, senha}`                | Login → JWT             |
| `GET`  | `/auth/me`       | —                               | Dados do usuário logado |

**JWT:** Bearer token no header `Authorization: Bearer <token>`. Validade: 7 dias.

### Pontos de Coleta

| Método   | Rota                               | Auth           | Descrição                      |
| -------- | ---------------------------------- | -------------- | ------------------------------ |
| `GET`    | `/pontos`                          | —              | Listar todos                   |
| `GET`    | `/pontos/proximos?lat=&lng=&raio=` | —              | Busca geoespacial (raio em km) |
| `GET`    | `/pontos/:id`                      | —              | Detalhe                        |
| `POST`   | `/pontos`                          | PARCEIRO/ADMIN | Criar                          |
| `PUT`    | `/pontos/:id`                      | PARCEIRO/ADMIN | Atualizar                      |
| `DELETE` | `/pontos/:id`                      | ADMIN          | Remover                        |

### Chat IA

| Método | Rota           | Auth     | Descrição                |
| ------ | -------------- | -------- | ------------------------ |
| `POST` | `/chat`        | Opcional | Mensagem → SSE streaming |
| `GET`  | `/chat/status` | —        | Ollama disponível?       |

**Rate limit:** 15 req/min por IP no endpoint `/chat`.

**Body POST `/chat`:**

```json
{
  "messages": [
    { "role": "user", "content": "Como descartar agulhas corretamente?" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "E em casa?" }
  ]
}
```

- Máx. 20 mensagens por request
- Máx. 2000 caracteres por mensagem
- Apenas as últimas 6 mensagens são enviadas ao LLM (contexto)

**Formato SSE (response):**

```
Content-Type: text/event-stream

data: {"token":"Des"}
data: {"token":"carte"}
data: {"token":" em farmácias..."}
data: {"fim":true}
```

Em caso de erro:

```
data: {"erro":"Serviço de IA temporariamente indisponível"}
```

### EcoCoin

| Método | Rota                            | Auth | Body        | Descrição                       |
| ------ | ------------------------------- | ---- | ----------- | ------------------------------- |
| `GET`  | `/ecocoin/saldo`                | ✅   | —           | Saldo + totalGanho + totalUsado |
| `GET`  | `/ecocoin/extrato?page=&limit=` | ✅   | —           | Histórico paginado              |
| `POST` | `/ecocoin/registrar-descarte`   | ✅   | `{pontoId}` | +10 EC                          |
| `POST` | `/ecocoin/compartilhar`         | ✅   | —           | +5 EC                           |
| `POST` | `/ecocoin/resgatar`             | ✅   | `{tipo}`    | Débito EC                       |

**Tipos de resgate:**

```json
{ "tipo": "DESCONTO" }     → -100 EC
{ "tipo": "CERTIFICADO" }  → -50 EC
{ "tipo": "DOACAO" }       → -200 EC
```

---

## Chat IA + RAG

### Modelo

- **Chat:** `qwen3:8b` via Ollama
- **Embeddings:** `nomic-embed-text` (768 dimensões)
- **Busca:** distância cosseno (`<=>`) no pgvector, HNSW index

### Configurações de busca

```typescript
buscarContexto(pergunta, {
  topK: 5, // top-5 chunks similares
  threshold: 0.68, // similaridade mínima (0-1)
});
```

### Prefixos de embedding (nomic-embed-text)

O modelo `nomic-embed-text` requer prefixos específicos para melhor qualidade:

```
"search_document: " + texto    → ao ingerir chunks
"search_query: " + pergunta    → ao buscar contexto
```

### Ingestão de conhecimento

Use `ingerirChunk()` para adicionar conteúdo ao banco de conhecimento:

```typescript
import { ingerirChunk } from "@/services/rag.service";

await ingerirChunk(
  "Medicamentos vencidos não devem ser descartados no lixo comum. " +
    "Devem ser entregues em farmácias credenciadas pela ANVISA...",
  {
    categoria: "descarte",
    fonte_tipo: "regulamentacao",
    dificuldade: "basico",
  },
  "ANVISA — Resolução RDC 222/2018",
);
```

### Ollama — Timeout

Configurado para **60 segundos** (CPU pode ser lento). Ajustar para GPU:

```typescript
// backend/src/lib/ollama.ts
timeout: 60_000; // → reduzir para 30_000 com GPU
```

---

## Sistema EcoCoin

### 14 Tipos de Crédito

| Tipo                   | EC  | Limite Diário | Limite Total |
| ---------------------- | --- | ------------- | ------------ |
| `DESCARTE_MEDICAMENTO` | 10  | 30            | 300          |
| `DESCARTE_AGULHA`      | 15  | 45            | 450          |
| `DESCARTE_MASCARA`     | 5   | 15            | 150          |
| `DESCARTE_OUTRO`       | 8   | 24            | 240          |
| `CADASTRO_USUARIO`     | 50  | 50            | 50           |
| `AVALIACAO_PONTO`      | 5   | 10            | 100          |
| `COMPARTILHAR_PONTO`   | 5   | 15            | 100          |
| `CHAT_INTERACAO`       | 1   | 10            | 200          |
| `INDICACAO_USUARIO`    | 20  | 40            | 200          |
| `FOTO_DESCARTE`        | 8   | 16            | 160          |
| `COMPLETAR_PERFIL`     | 30  | 30            | 30           |
| `PRIMEIRO_DESCARTE`    | 25  | 25            | 25           |
| `DESCARTE_STREAK_7`    | 50  | 50            | 100          |
| `CONTEUDO_BLOG`        | 20  | 20            | 200          |

### Anti-fraude

- Limites diários e totais verificados **antes** de creditar
- Função atômica via PL/pgSQL (sem race conditions)
- Ledger auditável com `saldo_apos` em cada transação
- Constraints: `saldo >= 0`, `valor != 0`, `saldo_apos >= 0`

### Débito (Resgates)

O serviço EcoCoin suporta débito passando valor negativo e tipo `RESGATE_*`:

```typescript
await creditarEcoCoin(usuarioId, "RESGATE_DESCONTO", -100, {
  descricao: "Resgate: cupom desconto farmácia",
});
```

---

## Frontend

### Roteamento

| Rota                       | Componente       | Acesso      |
| -------------------------- | ---------------- | ----------- |
| `/`                        | Landing          | Público     |
| `/mapa`                    | Mapa Leaflet     | Público     |
| `/mapa/ponto/:id`          | Detalhe do ponto | Público     |
| `/blog`                    | Blog             | Público     |
| `/blog/:slug`              | Artigo           | Público     |
| `/auth/login`              | Login            | Público     |
| `/auth/cadastro`           | Cadastro         | Público     |
| `/auth/recuperar-senha`    | Recuperar senha  | Público     |
| `/app/chat`                | **Chat IA**      | 🔒 Logado   |
| `/app/perfil`              | Perfil           | 🔒 Cidadão  |
| `/app/favoritos`           | Favoritos        | 🔒 Cidadão  |
| `/app/notificacoes`        | Notificações     | 🔒 Cidadão  |
| `/parceiro/dashboard`      | Dashboard        | 🔒 Parceiro |
| `/parceiro/meu-ponto`      | Gerir ponto      | 🔒 Parceiro |
| `/parceiro/cadastro-ponto` | Novo ponto       | 🔒 Parceiro |
| `/admin/dashboard`         | Admin geral      | 🔒 Admin    |
| `/admin/pontos`            | Gerir pontos     | 🔒 Admin    |
| `/admin/usuarios`          | Gerir usuários   | 🔒 Admin    |

### Hook `useEcoMedChat`

```typescript
import { useEcoMedChat } from '@/hooks/useEcoMedChat'

function MeuComponente() {
  const { mensagens, carregando, erro, enviar, limpar } = useEcoMedChat()

  return (
    <button onClick={() => enviar('Como descartar agulhas?')}>
      Perguntar
    </button>
  )
}
```

**Internamente:**

- `enviar()` faz `fetch POST /api/v1/chat`
- Lê o `ReadableStream` linha por linha
- Parseia `data: {...}` tokens SSE
- Acumula o texto na última mensagem do assistente em tempo real

### EcoCoinWidget

Exibido no header para usuários autenticados:

- Busca `GET /api/v1/ecocoin/saldo` ao montar
- Exibe: `🌿 45 EC` (pill verde)
- Clique navega para `/app/ecocoin`
- Não renderiza se usuário não logado (retorna `null`)

---

## Variáveis de Ambiente

### `backend/.env`

```env
# Banco de dados
DATABASE_URL="postgresql://ecomed:ecomed123@localhost:5555/ecomed"

# JWT
JWT_SECRET="segredo_longo_e_aleatorio_minimo_64_caracteres"
JWT_EXPIRES_IN="7d"

# CORS (origens permitidas, vírgula separado)
CORS_ORIGINS="http://localhost:5173"

# Servidor
PORT=3333
NODE_ENV=development

# Ollama
OLLAMA_BASE_URL="http://localhost:11434/v1"
OLLAMA_CHAT_MODEL="qwen3:8b"
OLLAMA_EMBED_MODEL="nomic-embed-text"

# System prompt do assistente IA (opcional — tem default no código)
ECOMED_SYSTEM_PROMPT=""

# Redis (deixar vazio para desabilitar em desenvolvimento)
REDIS_URL=""
```

### `frontend/.env`

```env
VITE_API_URL="http://localhost:3333/api/v1"
```

---

## Sprints

### Sprint 0 — Setup Completo ✅

**Commit:** `ef40490` — 68 arquivos, 21.812 linhas

- Monorepo npm workspaces (`frontend/` + `backend/`)
- Vite + React 18 + TypeScript + Tailwind v4 + PWA + Leaflet
- Express 5 + Prisma + schema PostgreSQL (14 modelos)
- ESLint, tsconfig strict, path aliases `@/`
- Zustand stores, TanStack Query, React Router 6

### Sprint 1 — Backend Operacional ✅

**Commit:** `a516a22`

- Docker PostgreSQL 16 + pgvector (`pgvector/pgvector:pg16`, porta 5555)
- Migration inicial — todos os 14 modelos
- Seed com 5 pontos de coleta em capitais
- Auth JWT completo (cadastro, login, `/auth/me`)
- Busca geoespacial de pontos próximos (lat/lng/raio)
- TypeScript: 0 erros (`npx tsc --noEmit`)

### Sprint 2 — RAG + Chat IA (SSE) + EcoCoin ✅

**Commit:** Sprint 2

**Backend:**

- pgvector extension habilitada + HNSW index (768 dims)
- 14 regras EcoCoin inseridas no banco
- Função PL/pgSQL `creditar_ecocoin()` atômica com anti-fraude
- `src/lib/ollama.ts` — OpenAI SDK client → Ollama
- `src/services/rag.service.ts` — `gerarEmbedding`, `buscarContexto`, `ingerirChunk`
- `src/services/ecocoin.service.ts` — ledger auditável
- `src/routes/chat.routes.ts` — SSE streaming, rate limit 15/min
- `src/routes/ecocoin.routes.ts` — saldo, extrato, descarte, compartilhar, resgatar
- `src/app.ts` — 2 novas rotas + health check expandido

**Frontend:**

- `src/hooks/useEcoMedChat.ts` — SSE streaming hook
- `src/pages/Chat/Chat.tsx` — Interface chat completa com sugestões e auto-resize
- `src/components/ecocoin/EcoCoinWidget.tsx` — Pill saldo no header
- `src/App.tsx` — Rota `/app/chat` adicionada
- `src/components/layout/Header.tsx` — EcoCoinWidget + ícone chat integrados

### Sprint 3 — Planejado

- Dashboard EcoCoin visual (histórico com gráficos)
- Script de ingestão de conhecimento (ANVISA, regulamentações)
- Notificações push via PWA (Service Worker)
- Dashboard admin com métricas de uso
- Testes E2E com Playwright
- CI/CD GitHub Actions

---

## Quirks e Notas Técnicas

### npm workspaces + Prisma (Windows)

O npm workspaces hoist o `@prisma/client` para `node_modules/` da raiz. O Prisma CLI rodando de `backend/` não encontra o client sem uma junction point (symlink no Windows):

```powershell
# Criar junction se deletado acidentalmente
$root = "c:\Users\ivonm\OneDrive...\Github\EcoMedS"
New-Item -ItemType Junction `
  -Path "$root\backend\node_modules\@prisma\client" `
  -Target "$root\node_modules\@prisma\client" `
  -Force
```

### Redis opcional em desenvolvimento

Com `REDIS_URL=""` no `.env`, o Redis é desabilitado graciosamente — sem erro na inicialização.

### TypeScript — Express 5 params

O Express 5 tipou `req.params.id` como `string | string[]`. Converter com `String(req.params.id)`.

### JWT `expiresIn`

O tipo `StringValue` do `@types/jsonwebtoken` pode conflitar. Solução: `{ expiresIn: '7d' } as any`.

### Seed fora do rootDir

O `prisma/seed.ts` está fora do `rootDir` do `tsconfig.json`. O arquivo `prisma/tsconfig.seed.json` configura `ts-node` separadamente para resolver isso.

---

## Contribuição

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Commit semântico: `git commit -m "feat: descrição clara"`
4. Push: `git push origin feat/minha-feature`
5. Abra um Pull Request

### Convenção de commits

```
feat:     nova funcionalidade
fix:      correção de bug
docs:     documentação apenas
refactor: refatoração sem mudança funcional
test:     adição de testes
chore:    manutenção (deps, config)
```

---

## Licença

MIT © 2026 EcoMed — Ivons Matos
