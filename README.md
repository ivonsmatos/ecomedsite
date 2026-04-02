# EcoMed — Descarte Responsável de Medicamentos

[![CI](https://github.com/seu-usuario/ecomed/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/ecomed/actions)

PWA para facilitar o descarte correto de medicamentos vencidos ou sem uso no Brasil, conectando cidadãos a pontos de coleta cadastrados (farmácias, unidades de saúde, ecopontos).

---

## Stack

| Camada   | Tecnologia                                        |
| -------- | ------------------------------------------------- |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + PWA |
| Mapa     | Leaflet + OpenStreetMap                           |
| Estado   | Zustand + TanStack Query                          |
| Backend  | Node.js 20 + Express + Prisma ORM                 |
| Banco    | PostgreSQL 16 + PostGIS                           |
| Cache    | Redis (Upstash)                                   |
| Deploy   | Vercel (front) + Railway (back) + Supabase (DB)   |

---

## Pré-requisitos

- Node.js ≥ 20
- npm ≥ 10
- PostgreSQL 16 (local ou Supabase)
- Redis (local ou Upstash)

---

## Início Rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/seu-usuario/ecomed.git
cd ecomed
npm install # instala concurrently no workspace raiz
cd frontend && npm install --legacy-peer-deps
cd ../backend && npm install --legacy-peer-deps
```

### 2. Configurar variáveis de ambiente

```bash
# Backend
cp backend/.env.example backend/.env
# Edite backend/.env com suas credenciais

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Banco de dados

```bash
cd backend

# Gerar Prisma Client
npm run db:generate

# Criar tabelas (desenvolvimento)
npm run db:migrate

# Popular com dados de teste
npm run db:seed
```

### 4. Rodar em desenvolvimento

```bash
# Na raiz do projeto — roda frontend + backend simultaneamente
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
# API docs: http://localhost:3000/health
```

---

## Estrutura do Projeto

```
ecomed/
├── frontend/          # React PWA (Vite)
│   └── src/
│       ├── components/    # Componentes reutilizáveis
│       ├── pages/         # Telas (Landing, Mapa, Auth, etc.)
│       ├── hooks/         # Custom hooks
│       ├── store/         # Zustand stores
│       ├── services/      # Chamadas à API
│       ├── lib/           # Utilitários
│       └── types/         # Tipos TypeScript
│
├── backend/           # API REST (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma  # Modelos de banco
│   │   └── seeds/         # Dados de teste
│   └── src/
│       ├── routes/        # Endpoints da API
│       ├── middlewares/   # Auth, RBAC, rate limit
│       └── lib/           # Prisma, Redis singletons
│
└── .github/workflows/ # CI/CD GitHub Actions
```

---

## API

**Base URL (dev):** `http://localhost:3000/api/v1`

| Método | Endpoint              | Auth     | Descrição                   |
| ------ | --------------------- | -------- | --------------------------- |
| POST   | `/auth/register`      | ❌       | Cadastro cidadão            |
| POST   | `/auth/login`         | ❌       | Login e-mail/senha          |
| POST   | `/auth/refresh`       | ❌       | Renovar access token        |
| GET    | `/pontos`             | ❌       | Listar pontos com filtros   |
| GET    | `/pontos/proximos`    | ❌       | Busca geoespacial           |
| GET    | `/pontos/:id`         | ❌       | Detalhe do ponto            |
| POST   | `/parceiro/solicitar` | PARCEIRO | Solicitar cadastro de ponto |
| GET    | `/admin/dashboard`    | ADMIN    | Métricas globais            |

---

## Credenciais de Teste (após seed)

| Perfil   | E-mail                  | Senha        |
| -------- | ----------------------- | ------------ |
| Admin    | admin@ecomed.com.br     | Admin@123    |
| Parceiro | farmacia@exemplo.com.br | Parceiro@123 |

---

## Roadmap

- [x] Sprint 0 — Setup e infraestrutura base
- [ ] Sprint 1 — MVP Mapa com busca geoespacial
- [ ] Sprint 2 — Autenticação completa (JWT + OAuth Google)
- [ ] Sprint 3 — Painel do parceiro e fluxo de aprovação
- [ ] Sprint 4 — Favoritos, reportes e Web Push
- [ ] Sprint 5 — PWA completo (offline, Lighthouse ≥ 90)
- [ ] Sprint 6 — Landing page institucional
- [ ] Sprint 7 — Documentação final e apresentação

---

## Legislação

Este projeto auxilia o cumprimento da **RDC 222/2018 da ANVISA** — Regulamento técnico para gerenciamento de resíduos de serviços de saúde — e está em conformidade com a **LGPD (Lei 13.709/2018)**.

---

_EcoMed — Projeto Integrador · Coordenação Técnica · Abril de 2026_
