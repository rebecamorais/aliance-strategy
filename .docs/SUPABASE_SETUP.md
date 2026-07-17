# Supabase local (somente desenvolvimento)

Este projeto usa **apenas Supabase local** via CLI + Docker. Não é necessário criar projeto na nuvem.

## Pré-requisitos

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine) em execução.
2. **Supabase CLI** — já vem no projeto (`devDependency`). Após `npm install`, os scripts `npm run db:*` usam o binário local. Instalação global é opcional.

## Primeira vez

```bash
# 0. Dependências (inclui CLI do Supabase)
npm install

# 1. Variáveis de ambiente (chaves fixas do stack local)
cp .env.example .env.local

# 2. Subir Postgres, Auth, API e Studio
npm run db:start

# 3. Aplicar migrations (tabelas notices + profiles)
npm run db:reset

# 4. App Next.js
npm run dev
```

| Serviço | URL |
|---------|-----|
| API (app usa esta) | http://127.0.0.1:54321 |
| Studio (admin UI) | http://127.0.0.1:54323 |
| Inbucket (e-mails de teste) | http://127.0.0.1:54324 |
| Next.js | http://localhost:3000 |

- **Criar conta:** http://localhost:3000/auth/register  
- **Entrar:** http://localhost:3000/auth/login  

Confirmação de e-mail está **desligada** em `supabase/config.toml` — após cadastro você já pode entrar.

### Conta de teste (seed)

Após `npm run db:reset`, existe um usuário pronto:

| Campo | Valor |
|-------|-------|
| E-mail | `dev@local.test` |
| Senha | `devpassword` |

## Comandos úteis

| Script | Descrição |
|--------|-----------|
| `npm run db:start` | Inicia containers locais |
| `npm run db:stop` | Para containers |
| `npm run db:reset` | Recria o banco e roda migrations + seed |
| `npm run db:status` | Mostra URLs e chaves atuais |
| `npm run dev:local` | `db:start` + `next dev` |

Se as chaves mudarem após atualizar o CLI, rode `npm run db:status` e atualize `.env.local`.

## O que as migrations criam

Arquivo: `supabase/migrations/20250601000000_init_auth_and_notices.sql`

- `notices` — mural (leitura pública, escrita autenticada)
- `profiles` — perfil criado automaticamente no registro (`auth.users` → trigger)

## Arquitetura no código

| Camada | Responsabilidade |
|--------|------------------|
| `src/backend/core/entities/auth.schema.ts` | Validação Zod |
| `src/backend/core/use-cases/*` | Cadastro, login, sessão |
| `src/backend/infra/repositories/supabase-auth.repository.ts` | Supabase Auth API |
| `src/app/actions/auth.actions.ts` | Server Actions |
| `src/middleware.ts` | Refresh de sessão (cookies SSR) |

Nunca use `service_role` no client. Toda autenticação passa por `@backend/infra/supabase/server`.
