> 🏹 Gavião Arqueiro | 15/04/2026 | v1.0

# Security — Bethel Blog

## 1. Auth

**Provider**: Supabase Auth (email + senha).

**Fluxo**:
```
1. Bethel acessa /login
2. POST email+senha → Supabase Auth
3. Retorna JWT + refresh_token em cookie HTTP-only (via @supabase/ssr)
4. Middleware (Edge) valida cookie em toda /admin/* e /api/admin/*
5. Refresh automático no expire (handled by @supabase/ssr)
6. Logout → supabase.auth.signOut() → limpa cookie → redirect /
```

**Regras**:
- Cookies HTTP-only, Secure, SameSite=Lax
- **Nunca** localStorage pra tokens
- Cadastro público **desabilitado** no Supabase Auth Dashboard
- Reset de senha via email padrão Supabase
- 1 único usuário (Bethel) — criado manualmente no Dashboard

## 2. Autorização — 3 Camadas

### Camada 1: Middleware (rota)
```ts
// middleware.ts
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const { response, user } = await updateSession(req)

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin') ||
                       req.nextUrl.pathname.startsWith('/api/admin')

  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
```

### Camada 2: RLS (banco)
Definido em `schema.md` §8. Resumo:
- `posts`: público lê apenas `status='published' AND deleted_at IS NULL`; autenticado faz tudo
- `categories`: público lê; autenticado escreve
- `post_likes`/`post_views`: público insert; público lê like count; admin lê views
- `profile`: público lê; só dono atualiza
- Storage `blog-images`: público lê; autenticado escreve

### Camada 3: Route Handler (API)
Toda rota `/api/admin/*` valida `auth.getUser()` antes de processar.

### Tabela Roles × Recursos

| Recurso | Anônimo | Admin (Bethel) |
|---------|---------|---------------|
| Ler post publicado | ✅ | ✅ |
| Ler rascunho | ❌ | ✅ |
| Criar/editar/deletar post | ❌ | ✅ |
| Ler categorias | ✅ | ✅ |
| Criar/editar/deletar categoria | ❌ | ✅ |
| Curtir post | ✅ (rate-limited) | ✅ |
| Ver stats/analytics | ❌ | ✅ |
| Upload imagem | ❌ | ✅ |
| Editar perfil | ❌ | ✅ |

## 3. Validação

**Zod** em **toda** entrada de dados, client e server.

```ts
// lib/schemas/post.ts
import { z } from 'zod'

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  cover_url: z.string().url().optional(),
  cover_alt: z.string().max(200).optional(),
  content: z.record(z.any()),  // JSON Tiptap
  status: z.enum(['draft', 'scheduled', 'published', 'archived']),
  scheduled_at: z.string().datetime().optional().nullable(),
  category_ids: z.array(z.string().uuid()).max(5),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
})

export const LikeSchema = z.object({
  client_uuid: z.string().uuid(),
})

export const UploadSchema = z.object({
  file: z.instanceof(File)
    .refine(f => f.size <= 10 * 1024 * 1024, 'Max 10MB')
    .refine(f => ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif']
      .includes(f.type), 'Formato não suportado'),
})
```

**Sanitização HTML**: Tiptap render server-side — usar allowlist de nodes/marks, **nunca** `dangerouslySetInnerHTML` com input não-sanitizado.

## 4. API Security

### CORS
```ts
// next.config.js
async headers() {
  return [{
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_SITE_URL },
      { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, DELETE' },
      { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
    ],
  }]
}
```

### Rate Limiting
Implementação via Upstash Redis (free tier) ou Vercel KV. Limites:

| Endpoint | Limite |
|----------|--------|
| `/api/auth/*` (login) | 5/min por IP |
| `/api/posts/[id]/like` | 10/min por IP |
| `/api/posts/[id]/view` | 60/min por IP |
| `/api/admin/upload` | 10/min |
| `/api/admin/*` (geral) | 60/min |
| `/api/search` | 30/min por IP |

Resposta 429:
```json
{ "error": "Too many requests", "retryAfter": 60 }
```

### Security Headers (`next.config.js`)
```ts
{
  source: '/(.*)',
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com;" },
  ]
}
```

### Cron Endpoints
```ts
// app/api/cron/publish-scheduled/route.ts
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

## 5. Variáveis de Ambiente

```bash
# .env.local — NUNCA commitar
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Server-only (sem NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...     # NUNCA exposto ao client
CRON_SECRET=random-32-char-string
LIKE_HASH_SALT=random-32-char-string

# Opcional
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

**Regras**:
- `.env.local` no `.gitignore` ✅
- `.env.local.example` commitado com placeholders
- `NEXT_PUBLIC_*` somente pra valores realmente públicos
- `service_role` **nunca** importado em código com `'use client'`
- Vercel Dashboard → Environment Variables (separar prod/preview/dev)

## 6. Dados

| Categoria | Tratamento |
|-----------|-----------|
| Senhas | Supabase Auth (bcrypt-equivalente) — nunca tocar |
| IP do leitor | SHA-256 com `LIKE_HASH_SALT` antes de armazenar |
| User-Agent | Não armazenar (privacy) |
| PII (nome, email autor) | Apenas `profile` — admin only |
| Cartão | Nunca (sem pagamento) |
| Soft delete | `posts.deleted_at` (resto cascata) |
| LGPD | Endpoints `/api/admin/profile/export` e `/api/admin/profile/delete-all-data` [futuro] |

## 7. Upload Security

```ts
// app/api/admin/upload/route.ts
const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif']

// 1. Validar autenticação (já no middleware)
// 2. Validar MIME via magic bytes (não confiar em extensão)
// 3. Validar tamanho
// 4. Re-encode via Sharp (descarta metadados maliciosos)
// 5. Renomear pra UUID + slug seguro
// 6. Upload pro bucket
```

## 8. Checklist Pre-Deploy

- [ ] RLS habilitado em todas as tabelas
- [ ] `service_role` nunca no client (grep `'use client'` × `service_role`)
- [ ] Zod em **toda** rota POST/PATCH
- [ ] Env vars configuradas no Vercel (prod, preview, dev separadas)
- [ ] CORS restrito a domínio prod
- [ ] Security headers ativos
- [ ] Rate limiting configurado (Upstash)
- [ ] Middleware protegendo `/admin/*` e `/api/admin/*`
- [ ] Uploads validados (MIME + tamanho + re-encode)
- [ ] Errors retornam mensagens genéricas (sem stack trace)
- [ ] Sem `console.log` em código de produção
- [ ] `.gitignore` cobre `.env*`, `.next/`, `node_modules/`
- [ ] Cron endpoints validam `CRON_SECRET`
- [ ] CSP testado (sem `unsafe-eval` se possível)
- [ ] Cadastro público desabilitado no Supabase
- [ ] Backup automático Supabase ativo
