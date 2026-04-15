> 🟣 Doutor Estranho | 15/04/2026 | v1.0

# Architecture — Bethel Blog

## 1. Estrutura de Diretórios

```
bethel-blog/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx              # Header público + footer
│   │   ├── page.tsx                # Home (post destaque + sidebar + lista)
│   │   ├── p/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        # Post individual
│   │   │       └── opengraph-image.tsx  # OG image dinâmica
│   │   ├── search/
│   │   │   └── page.tsx            # Resultados busca
│   │   └── category/
│   │       └── [slug]/
│   │           └── page.tsx        # Posts por categoria
│   │
│   ├── (admin)/
│   │   ├── layout.tsx              # Sidebar admin + header
│   │   ├── admin/
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx        # Lista
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   └── settings/page.tsx   # Perfil + blog config
│   │
│   ├── (auth)/
│   │   ├── layout.tsx              # Layout limpo
│   │   └── login/page.tsx
│   │
│   ├── api/
│   │   ├── posts/
│   │   │   ├── route.ts            # GET lista
│   │   │   └── [id]/
│   │   │       ├── like/route.ts
│   │   │       └── view/route.ts
│   │   ├── categories/route.ts
│   │   ├── search/route.ts
│   │   ├── admin/
│   │   │   ├── posts/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── publish/route.ts
│   │   │   ├── categories/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── upload/route.ts
│   │   │   ├── stats/route.ts
│   │   │   └── profile/route.ts
│   │   └── cron/
│   │       ├── publish-scheduled/route.ts
│   │       └── cleanup-images/route.ts
│   │
│   ├── layout.tsx                  # Root layout (fonts, providers)
│   ├── globals.css                 # Tailwind + design tokens
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── ui/                         # shadcn components
│   ├── layout/
│   │   ├── PublicHeader.tsx
│   │   ├── PublicFooter.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── AdminHeader.tsx
│   ├── post/
│   │   ├── PostCard.tsx
│   │   ├── FeaturedPost.tsx
│   │   ├── PostGrid.tsx
│   │   ├── PostHero.tsx
│   │   ├── PostContent.tsx         # Render Tiptap JSON
│   │   ├── PostActions.tsx         # Like + share + copy
│   │   ├── LikeButton.tsx
│   │   ├── ShareButton.tsx
│   │   ├── CopyLinkButton.tsx
│   │   └── ReadingProgress.tsx
│   ├── editor/
│   │   ├── BlockEditor.tsx         # Wrapper Tiptap
│   │   ├── EditorToolbar.tsx
│   │   ├── SlashMenu.tsx
│   │   ├── ImageBlock.tsx
│   │   └── extensions.ts
│   ├── admin/
│   │   ├── PostsTable.tsx
│   │   ├── PostForm.tsx
│   │   ├── CategoryModal.tsx
│   │   ├── StatsCards.tsx
│   │   └── ImageUploader.tsx
│   └── shared/
│       ├── BlogImage.tsx           # next/image wrapper
│       ├── CategoryChip.tsx
│       ├── SearchBar.tsx
│       └── ThemeToggle.tsx
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useLikedPosts.ts            # localStorage de likes do leitor
│   ├── useViewTracker.ts
│   ├── useAutoSave.ts
│   └── useShare.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client (cookies)
│   │   ├── admin.ts                # Service role (server-only)
│   │   └── middleware.ts
│   ├── schemas/
│   │   ├── post.ts
│   │   ├── category.ts
│   │   └── profile.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── slug.ts
│   │   ├── reading-time.ts
│   │   ├── tiptap-renderer.ts
│   │   └── hash.ts                 # SHA-256 helper
│   ├── image/
│   │   ├── optimize.ts             # Sharp pipeline
│   │   └── variants.ts
│   ├── seo/
│   │   ├── metadata.ts
│   │   └── jsonld.ts
│   └── constants.ts
│
├── stores/
│   ├── editorStore.ts              # Zustand: estado UI editor
│   └── adminUIStore.ts             # Sidebar mobile, modais
│
├── types/
│   ├── database.ts                 # Supabase generated types
│   ├── post.ts
│   └── editor.ts
│
├── supabase/
│   └── migrations/
│       └── 0001_initial.sql
│
├── public/
│   ├── favicon.ico
│   └── og-default.png
│
├── middleware.ts                   # Auth admin routes
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
├── package.json
└── .env.local.example
```

## 2. Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase.tsx | `PostCard.tsx` |
| Utils | camelCase.ts | `slug.ts` |
| Hooks | use*.ts | `useDebounce.ts` |
| Stores | *Store.ts | `editorStore.ts` |
| Pastas | kebab-case | `post-actions/` |
| Variáveis | camelCase | `postId` |
| Types/Interfaces | PascalCase | `interface PostCardProps` |
| Constantes | UPPER_SNAKE | `MAX_UPLOAD_SIZE` |
| Env vars | NEXT_PUBLIC_* | `NEXT_PUBLIC_SITE_URL` |
| Tabelas DB | snake_case plural | `post_likes` |
| Colunas DB | snake_case | `created_at` |

## 3. Componentes

```tsx
// ✅ Padrão
interface PostCardProps {
  post: Post
  variant?: 'featured' | 'default' | 'compact'
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  return <article>...</article>
}
```

**Regras**:
- `function declaration` (não arrow) pra componentes
- `named export` (exceto `page.tsx`/`layout.tsx` que são `default`)
- `'use client'` **só** quando necessário (hooks de estado, eventos, browser APIs)
- Server Component por default
- Props tipadas com `interface` no mesmo arquivo
- Sem prop drilling > 2 níveis → Zustand ou contexto

## 4. API Pattern

```ts
// app/api/admin/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreatePostSchema } from '@/lib/schemas/post'

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Validate
    const body = await req.json()
    const parsed = CreatePostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // 3. Business logic
    const { data, error } = await supabase
      .from('posts')
      .insert({ ...parsed.data, author_id: user.id })
      .select()
      .single()

    if (error) throw error

    // 4. Response
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/posts]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Response shape**:
- Sucesso: `{ data: T }` ou `{ data: T[], pagination?: {...} }`
- Erro: `{ error: string, code?: string, details?: object }`

## 5. Supabase

### `lib/supabase/client.ts` (Browser)
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `lib/supabase/server.ts` (RSC + Route Handlers)
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
      },
    }
  )
}
```

### `lib/supabase/admin.ts` (Server-only — operações privilegiadas)
```ts
import { createClient } from '@supabase/supabase-js'

// SOMENTE usar em rotas admin já autenticadas ou cron
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
```

**Regra absoluta**: `service_role` **nunca** no client. RLS sempre ativo.

## 6. Data Fetching

| Contexto | Estratégia |
|----------|-----------|
| Server Component | Direto Supabase (`createClient()` server) |
| Client Component | TanStack Query |
| Mutations admin | TanStack `useMutation` + invalidate |
| Form submit | Server Action OU API route + RHF |

**Proibido**: `useEffect` pra fetch.

```tsx
// ✅ RSC
export default async function HomePage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10)
  return <PostGrid posts={posts ?? []} />
}

// ✅ Client
'use client'
export function LikeButton({ postId, initialLikes }) {
  const { data, mutate } = useMutation({
    mutationFn: () => fetch(`/api/posts/${postId}/like`, { method: 'POST' }),
  })
  // ...
}
```

## 7. Error Handling

| Status | Cenário |
|--------|---------|
| 400 | Zod validation fail |
| 401 | Sem sessão |
| 403 | RLS denied |
| 404 | Recurso inexistente |
| 422 | Regra de negócio (ex: deletar categoria com posts) |
| 429 | Rate limit |
| 500 | Erro inesperado |

**Boundaries**:
- `app/error.tsx` — global
- `app/(admin)/admin/error.tsx` — admin
- `app/(public)/p/[slug]/error.tsx` — post não encontrado vira `not-found.tsx`

## 8. Performance

- `next/image` em **toda** imagem (com `sizes` correto)
- `next/font` (Plus Jakarta Sans + Inter, `display: swap`)
- `next/dynamic` pro editor Tiptap (`ssr: false`)
- `<Suspense>` em seções carregadas independentemente (sidebar Mais Popular)
- Parallel data fetching com `Promise.all` em RSC
- ISR `revalidate: 60` em rotas públicas
- `revalidatePath('/')` ao publicar/atualizar post
