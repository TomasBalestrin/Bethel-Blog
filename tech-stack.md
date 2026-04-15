> 👁️ Visão | 15/04/2026 | v1.0

# Tech Stack — Bethel Blog

## 1. Visão Geral

```
[Leitor anônimo / Admin]
         ↓
[Next.js 14 App Router (Vercel Edge + Node)]
   ├── (public) → ISR + RSC
   └── (admin)  → SSR + Client Components
         ↓
[Supabase]
   ├── PostgreSQL (RLS)
   ├── Auth (JWT cookie)
   └── Storage (blog-images bucket)
         ↓
[Sharp pipeline + WebP variants]
```

## 2. Core Stack

| Tech | Versão | Justificativa | Config-chave |
|------|--------|---------------|--------------|
| **Next.js** | 14.2+ | App Router, ISR, RSC, Server Actions, deploy nativo Vercel | `app/` dir, `output: 'standalone'` |
| **TypeScript** | 5.4+ | Type safety end-to-end | `strict: true`, `noUncheckedIndexedAccess: true` |
| **Tailwind CSS** | 3.4+ | Único sistema de estilo (zero CSS Modules) | Tokens do design system via CSS vars |
| **shadcn/ui** | latest | Componentes acessíveis + estilizáveis | Instalar via CLI sob demanda |
| **Supabase JS** | 2.43+ | Cliente unificado (DB + Auth + Storage) | `@supabase/ssr` pra cookies SSR |
| **PostgreSQL** | 15 (Supabase) | Relacional + JSONB pra Tiptap content | RLS habilitado em todas tabelas |
| **Vercel** | — | Deploy Next.js, Edge Functions, Cron, ISR | Cron jobs em `vercel.json` |

## 3. Frontend

### Estilização
- **Tailwind only** — design system via CSS variables em `globals.css`
- Tokens do usuário (HTML/MD/CSS) viram `:root { --color-primary: ... }` etc
- shadcn/ui customizado pra usar tokens

### State Management
- **Server state** → TanStack Query 5 (cache, refetch, optimistic updates)
- **UI state** → Zustand (modais, toasts, sidebar admin)
- **Form state** → React Hook Form + Zod resolver

### Validação
- **Zod schemas** compartilhados client + server (`lib/schemas/`)
- Validação dupla: client (UX) + API route (segurança)

### Renderização
- **Public routes** → RSC + ISR (`revalidate: 60`)
- **Admin routes** → SSR + Client Components onde necessário
- **Editor** → 100% client (`'use client'`)

## 4. Pacotes Extras

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `@tiptap/react` | 2.4+ | Editor de blocos |
| `@tiptap/starter-kit` | 2.4+ | Extensions básicas |
| `@tiptap/extension-image` | 2.4+ | Bloco imagem |
| `@tiptap/extension-link` | 2.4+ | Links inline |
| `@tiptap/extension-placeholder` | 2.4+ | Placeholders |
| `sharp` | 0.33+ | Otimização de imagens server-side |
| `slugify` | 1.6+ | Geração de slugs |
| `date-fns` | 3.6+ | Datas + i18n pt-BR |
| `framer-motion` | 11+ | Animações sutis (cards, transições) |
| `lucide-react` | 0.400+ | Ícones |
| `sonner` | 1.5+ | Toasts |
| `next-themes` | 0.3+ | Dark mode toggle |
| `@vercel/og` | 0.6+ | Geração OG images dinâmicas |
| `nanoid` | 5+ | UUIDs leves |

**Não usar**: Axios, Redux, Lodash completo, Moment, jQuery, Pages Router, CSS Modules, Firebase.

## 5. Infraestrutura

### Environments
| Env | URL | Branch |
|-----|-----|--------|
| **dev** | `localhost:3000` | feature/* |
| **preview** | `*.vercel.app` | PRs |
| **prod** | `blog.bethel.com.br` (futuro) | `main` |

### Variáveis de ambiente

```
# Public
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=

# Server-only
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
LIKE_HASH_SALT=
```

### CI/CD
- **Vercel Git Integration** (auto-deploy)
- Preview por PR
- Prod deploy ao merge em `main`
- Build command: `next build`
- Sem testes automatizados na v1 [INFERIDO — adicionar Vitest na fase 2]

### Cron Jobs (`vercel.json`)
```json
{
  "crons": [
    { "path": "/api/cron/publish-scheduled", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/cleanup-images", "schedule": "0 3 1 * *" }
  ]
}
```

### Monitoramento
- Vercel Analytics (Web Vitals)
- Vercel Logs
- Supabase Dashboard (queries, storage)

## 6. Responsividade

| Breakpoint | Width | Uso |
|------------|-------|-----|
| `sm` | 640px | Phones landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Layout desktop completo (3 colunas home) |
| `xl` | 1280px | Containers maiores |

**Mobile-first** — abaixo de `lg` a home colapsa pra single column, sidebar "Mais Popular" vai pro fim.

## 7. ADRs

### ADR-001: Tiptap em vez de Lexical/Plate/Slate
- **Contexto**: Precisa de editor estilo Notion, performante, customizável
- **Alternativas**: Lexical (Meta — verboso), Plate (alta curva), Slate (baixo nível demais)
- **Decisão**: Tiptap — API limpa, ecossistema, output JSON serializável
- **Consequência**: Lock-in razoável, mas migração possível via JSON parsing

### ADR-002: Likes anônimos via hash(localStorage UUID + IP)
- **Contexto**: Sem login público, mas evitar inflação de likes
- **Alternativas**: Só localStorage (incognito burla), só IP (NAT compartilha), captcha (fricção)
- **Decisão**: Hash combinado (SHA-256 com salt) — equilíbrio fricção × confiabilidade
- **Consequência**: Não é à prova de bots determinados; aceitável pro escopo. Cloudflare Turnstile na fase 2 se necessário.

### ADR-003: Conteúdo Tiptap como JSONB no Postgres
- **Contexto**: Editor produz JSON; precisa renderizar HTML pro público
- **Alternativas**: Salvar HTML direto (perde estrutura), salvar markdown (Tiptap não usa nativo)
- **Decisão**: JSONB + cache `content_html` gerado no save (Tiptap server-side render)
- **Consequência**: Render rápido no público, edição preserva estrutura completa

### ADR-004: ISR em vez de SSG puro
- **Contexto**: Posts publicados raramente mudam, mas likes/views são dinâmicos
- **Alternativas**: SSG (rebuild pra cada like — inviável), SSR puro (custo desnecessário)
- **Decisão**: ISR `revalidate: 60` + likes/views via client fetch
- **Consequência**: Páginas estáticas pra crawlers, dados dinâmicos hidratam

### ADR-005: Single bucket público no Storage
- **Contexto**: Imagens são públicas (vão em posts públicos)
- **Decisão**: Bucket `blog-images` com policy de leitura pública, escrita só admin
- **Consequência**: URLs estáveis, CDN Supabase serve direto
