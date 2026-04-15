> ⚡ Thor | 15/04/2026 | v1.0

# CLAUDE.md — Bethel Blog

## Sobre
Gerenciador de blog pessoal single-user com leitura pública estilo Substack. Stack: Next.js 14 App Router + TypeScript + Supabase + Vercel + Tailwind + shadcn/ui.

## Comandos

```bash
npm run dev              # localhost:3000
npm run build            # build prod
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npx supabase gen types typescript --project-id $PROJECT_ID > types/database.ts
```

## Estrutura

```
app/
  (public)/        → home, /p/[slug], /category/[slug], /search
  (admin)/admin/   → dashboard, posts, categories, settings
  (auth)/login/
  api/             → posts, categories, search, admin/*, cron/*
components/
  ui/              → shadcn
  layout/          → PublicHeader, AdminSidebar
  post/            → PostCard, PostContent, LikeButton, ShareButton
  editor/          → BlockEditor (Tiptap), Toolbar, SlashMenu
  admin/           → PostsTable, PostForm, ImageUploader
  shared/          → BlogImage, CategoryChip, SearchBar
hooks/             → useDebounce, useLikedPosts, useAutoSave, useShare
lib/
  supabase/        → client, server, admin (service_role server-only)
  schemas/         → Zod (post, category, profile)
  utils/           → slug, reading-time, tiptap-renderer, hash
  image/           → optimize (Sharp pipeline), variants
  seo/             → metadata, jsonld
stores/            → editorStore, adminUIStore (Zustand)
types/             → database (gerado), post, editor
supabase/migrations/0001_initial.sql
middleware.ts
```

## Protocolo de Execução

### §1 — Pesquisar antes de codar
- Ler **pelo menos 1 arquivo similar** já existente
- Copiar padrões (imports, exports, naming)
- **Não inventar** convenção nova
- Se primeiro arquivo do tipo: seguir exemplos em CLAUDE.md

### §2 — Escopo fechado
- Listar **CRIAR / EDITAR / LER / NÃO TOCAR** antes de começar
- **Não tocar** em arquivo fora da lista
- Se precisar mexer fora: pedir confirmação

### §3 — Isolamento
- 1 componente = 1 arquivo, **≤ 200 linhas**
- Lógica complexa em `lib/` ou `hooks/`, não no componente
- 1 responsabilidade por arquivo

### §4 — Thin client, fat server
- Frontend captura intenção (clique, form)
- Lógica/validação/queries no server (RSC, Route Handler, Server Action)
- Cliente nunca monta query Supabase complexa

### §5 — Não quebrar
- Sempre `npm run build` ao final da task
- Ao editar `types/` ou `interface`: verificar **todos consumidores**
- Retornar status: ✅ Sucesso | ⚠️ Parcial: [o que ficou] | ❌ Erro: [stack]

## Regras por Camada

### TypeScript
- `strict: true`, `noUncheckedIndexedAccess: true`
- Path alias `@/*`
- **Sem `any`** — usar `unknown` + narrow
- Generated types Supabase em `types/database.ts`

### React
- App Router only (sem Pages)
- **Server Component por default** — `'use client'` só com motivo
- `function` declaration, **named export** (exceto `page.tsx`/`layout.tsx`)
- Props com `interface` no mesmo arquivo

### Supabase
- `lib/supabase/client.ts` → browser (RSC client components)
- `lib/supabase/server.ts` → server components, route handlers
- `lib/supabase/admin.ts` → service_role, **server-only**, jamais importar em arquivo `'use client'`
- **RLS sempre ativo** — não desabilitar pra "facilitar"
- Usar `@supabase/ssr` (não `@supabase/auth-helpers`)

### API Routes
```
1. Auth (getUser)
2. Zod validate (safeParse)
3. Business logic
4. Response { data } | { error }
```
- `try/catch` em toda rota
- `console.error('[ROTA]', error)` no catch
- Status codes: 400 zod, 401 auth, 403 RLS, 404 not found, 422 business, 429 rate, 500 unexpected

### Estilo
- **Tailwind only** — zero CSS Modules, zero `style=`
- Tokens do design system via CSS vars em `globals.css`
- shadcn/ui customizado pra usar tokens
- Dark mode via `next-themes` (`class` strategy)

### State
- **Server state** → TanStack Query 5
- **UI state** → Zustand
- **Form state** → React Hook Form + Zod resolver
- **Nunca** `useEffect` pra fetch

## NÃO fazer

- ❌ `any` (use `unknown` + narrow ou tipo concreto)
- ❌ `useEffect` pra data fetching
- ❌ Arquivo > 200 linhas (extrair pra hook/utility)
- ❌ Commitar `.env.local`
- ❌ `dangerouslySetInnerHTML` sem sanitização
- ❌ Imports circulares
- ❌ `console.log` em código de produção (use `console.error` só em catch)
- ❌ Editar arquivo fora do escopo da task
- ❌ Refatorar código não relacionado sem pedir
- ❌ Inventar padrão novo (copiar do existente)
- ❌ Lógica de negócio no client
- ❌ Query Supabase complexa em client component
- ❌ Mudar tipo/interface sem atualizar **todos** os consumidores
- ❌ `service_role` em arquivo `'use client'`
- ❌ Desabilitar RLS
- ❌ Pages Router, CSS Modules, Redux, Axios, Firebase, Moment

## Padrões de Arquivo

| Tipo | Local |
|------|-------|
| Componente | `components/[domínio]/PascalCase.tsx` |
| Página | `app/(group)/[rota]/page.tsx` |
| Layout | `app/(group)/[rota]/layout.tsx` |
| API route | `app/api/[domínio]/route.ts` |
| Hook | `hooks/use*.ts` |
| Store | `stores/*Store.ts` |
| Schema Zod | `lib/schemas/*.ts` |
| Util | `lib/utils/*.ts` |
| Migration | `supabase/migrations/NNNN_descricao.sql` |

## Docs Disponíveis

- `docs/briefing.md` — visão geral
- `docs/PRD.md` — features, modelo dados, APIs, riscos
- `docs/tech-stack.md` — stack completa, ADRs
- `docs/architecture.md` — estrutura, padrões, nomenclatura
- `docs/schema.md` — SQL completo (migrations, RLS, indexes)
- `docs/security.md` — auth, RLS, rate limiting, checklist
- `docs/ux-flows.md` — fluxos, navegação, padrões UI
- `docs/TASKS.md` — execução task-by-task
- `docs/progress.html` — dashboard de progresso

**Antes de qualquer task: ler TASKS.md + os docs referenciados na task.**
