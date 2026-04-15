> 🐜 Homem-Formiga | 15/04/2026 | v1.0

# TASKS — Bethel Blog

Execução task-by-task pelo Claude Code. 1 task = 1 sessão. Sempre `npm run build` ao final.

---

## Bloco A — Setup

### A1 ⬜ 🟢 ⚙️ MANUAL — Criar projeto no Supabase
**CRIAR**: nada (manual)
**EDITAR**: nada
**LER**: `docs/schema.md`
**NÃO TOCAR**: —
**Steps**:
1. Criar projeto em supabase.com
2. Copiar URL e Anon Key
3. No SQL Editor: rodar `supabase/migrations/0001_initial.sql` completo
4. Em Authentication > Providers: habilitar Email, **desabilitar** "Enable signups"
5. Em Authentication > Users: criar usuário Bethel manualmente (email + senha)
6. Copiar UUID do usuário criado
7. No SQL Editor: rodar INSERT em `profile` com o UUID copiado (ver final do schema.md)
**Critério**: tabelas criadas, usuário existe, profile populado

### A2 ⬜ 🟡 — Inicializar Next.js + dependências base
**CRIAR**: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.gitignore`, `.env.local.example`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
**EDITAR**: —
**LER**: `docs/tech-stack.md`, `docs/architecture.md`
**NÃO TOCAR**: —
**Steps**:
1. `npx create-next-app@latest bethel-blog --typescript --tailwind --app --src-dir=false --import-alias "@/*"`
2. Instalar deps base: `@supabase/ssr @supabase/supabase-js @tanstack/react-query zustand react-hook-form @hookform/resolvers zod lucide-react sonner next-themes date-fns slugify nanoid clsx tailwind-merge`
3. Instalar dev: `@types/node sharp`
4. Configurar `tsconfig.json` strict + `noUncheckedIndexedAccess`
5. `next.config.js`: imagens (domínios Supabase), security headers
6. `.env.local.example` com placeholders do `security.md`
7. `npm run build`
**Critério**: ✅ Sucesso — build passa, app placeholder roda em localhost:3000

### A3 ⬜ 🟢 — Setup shadcn/ui + design system base
**CRIAR**: `components/ui/` (button, input, label, dialog, dropdown-menu, toast, tabs, badge, avatar, skeleton, alert-dialog, select, popover, sheet)
**EDITAR**: `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx`
**LER**: `docs/tech-stack.md`, design system fornecido pelo usuário (HTML/MD/CSS)
**NÃO TOCAR**: nada fora do escopo
**Steps**:
1. `npx shadcn@latest init` (escolher: New York, Slate, CSS variables)
2. Adicionar componentes listados via `npx shadcn@latest add [componente]`
3. Importar tokens do design system do usuário pra `globals.css` (`:root` + `.dark`)
4. Configurar Plus Jakarta Sans + Inter via `next/font/google`
5. Wrap `<body>` com font classes + `<Toaster>` (sonner)
6. `npm run build`
**Critério**: ✅ shadcn funcional, fontes carregando, dark mode togglável

### A4 ⬜ 🟢 — Clientes Supabase + Middleware
**CRIAR**: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `types/database.ts` (gerado)
**EDITAR**: `.env.local.example`
**LER**: `docs/architecture.md` (§5), `docs/security.md` (§1, §2)
**NÃO TOCAR**: —
**Steps**:
1. Criar 3 clients (browser, server, admin) seguindo `architecture.md`
2. Criar `middleware.ts` que protege `/admin/*` e `/api/admin/*`
3. Gerar types: `npx supabase gen types typescript --project-id $ID > types/database.ts`
4. `npm run build`
**Critério**: middleware redireciona `/admin` pra `/login` sem sessão

---

## Bloco B — Auth

### B1 ⬜ 🟢 — Página de Login
**CRIAR**: `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/login/LoginForm.tsx`, `lib/schemas/auth.ts`, `app/api/auth/signout/route.ts`
**EDITAR**: —
**LER**: `docs/ux-flows.md` (F01), `docs/architecture.md` (§4)
**NÃO TOCAR**: middleware
**Steps**:
1. Schema Zod (email, senha min 6)
2. LoginForm client component (RHF + Zod) → `supabase.auth.signInWithPassword`
3. Erro inline em vermelho, loading no botão
4. Sucesso → `router.push('/admin')`
5. API signout limpa sessão + redirect `/`
6. `npm run build`
**Critério**: login funcional, erro mostrado, redirect ok

---

## Bloco C — Layout

### C1 ⬜ 🟡 — Layout Público + Header + Footer
**CRIAR**: `app/(public)/layout.tsx`, `components/layout/PublicHeader.tsx`, `components/layout/PublicFooter.tsx`, `components/shared/SearchBar.tsx`, `components/shared/ThemeToggle.tsx`
**EDITAR**: —
**LER**: `docs/ux-flows.md` (§2), prints fornecidos pelo usuário (estilo Substack)
**NÃO TOCAR**: shadcn ui base
**Steps**:
1. Header sticky: avatar (esquerda) + título centralizado + ícones (busca, theme, menu)
2. Mobile: drawer com nav
3. Buscar `profile` no server (avatar + blog_title)
4. Footer simples (nome do blog, links Sobre/Arquivo placeholders)
5. ThemeToggle via `next-themes`
6. `npm run build`
**Critério**: layout público responsivo + dark mode funcional

### C2 ⬜ 🟡 — Layout Admin + Sidebar
**CRIAR**: `app/(admin)/layout.tsx`, `components/layout/AdminSidebar.tsx`, `components/layout/AdminHeader.tsx`, `stores/adminUIStore.ts`
**EDITAR**: —
**LER**: `docs/ux-flows.md` (§2)
**NÃO TOCAR**: layout público
**Steps**:
1. Sidebar fixa desktop / drawer mobile (Zustand pra state)
2. Itens: Dashboard, Posts, Categorias, Configurações
3. Footer sidebar: avatar + dropdown (Ver site / Logout)
4. Header com breadcrumb + ações sticky
5. `npm run build`
**Critério**: admin protegido, navegação funciona

---

## Bloco D — Features Core

### D1 — Posts (CRUD)

#### D1.1 ⬜ 🟡 — Schemas + API admin posts
**CRIAR**: `lib/schemas/post.ts`, `lib/utils/slug.ts`, `lib/utils/reading-time.ts`, `app/api/admin/posts/route.ts`, `app/api/admin/posts/[id]/route.ts`, `app/api/admin/posts/[id]/publish/route.ts`
**EDITAR**: —
**LER**: `docs/PRD.md` (F02, F03), `docs/architecture.md` (§4), `docs/security.md` (§3)
**NÃO TOCAR**: rotas públicas
**Steps**:
1. Zod schema (CreatePostSchema, UpdatePostSchema)
2. Util `slug.ts` (slugify + verifica unicidade)
3. Util `reading-time.ts` (200 wpm)
4. POST: cria draft com slug único
5. PATCH: atualiza, recalcula slug se title mudou
6. DELETE: soft delete
7. POST publish: valida cover, set `status=published`, `published_at=NOW()`, `revalidatePath`
8. `npm run build`
**Critério**: APIs respondem 401/400/200 corretos

#### D1.2 ⬜ 🔴 — Editor Tiptap + ImageUploader
**CRIAR**: `components/editor/BlockEditor.tsx`, `components/editor/EditorToolbar.tsx`, `components/editor/SlashMenu.tsx`, `components/editor/extensions.ts`, `components/admin/ImageUploader.tsx`, `lib/utils/tiptap-renderer.ts`, `app/api/admin/upload/route.ts`, `lib/image/optimize.ts`, `lib/image/variants.ts`, `hooks/useAutoSave.ts`
**EDITAR**: —
**LER**: `docs/PRD.md` (F02, F05), `docs/security.md` (§7)
**NÃO TOCAR**: schemas
**Steps**:
1. Instalar `@tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder`
2. BlockEditor com extensions configuradas (parágrafo, H2, H3, lista, citação, image, link, separador)
3. Toolbar flutuante (BubbleMenu Tiptap) com bold, italic, link
4. SlashMenu (FloatingMenu) com opções de blocos
5. Drag & drop image → POST upload → insere bloco
6. Upload route: validar MIME via magic bytes, Sharp pipeline (3 variants WebP qualidade 85), retorna URLs
7. tiptap-renderer: serverside JSON → HTML
8. useAutoSave hook (debounced 10s, status visual)
9. `npm run build`
**Critério**: editor funcional, imagens otimizadas, auto-save ok

#### D1.3 ⬜ 🟡 — Lista admin de posts
**CRIAR**: `app/(admin)/admin/posts/page.tsx`, `components/admin/PostsTable.tsx`, `components/admin/PostsFilterTabs.tsx`, `hooks/useDebounce.ts`
**EDITAR**: —
**LER**: `docs/ux-flows.md` (F03)
**NÃO TOCAR**: editor
**Steps**:
1. Server component lista posts (todos status)
2. Tabs por status (Todos/Rascunhos/Agendados/Publicados/Arquivados)
3. Tabela: capa | título | status | categorias | views | likes | data | actions
4. Mobile: cards
5. Busca debounced (URL state)
6. Row actions: Editar, Duplicar, Arquivar (PATCH), Deletar (DELETE com confirm)
7. `npm run build`
**Critério**: listagem filtra/busca/ordena, ações funcionam

#### D1.4 ⬜ 🔴 — Página editor de post (new/edit)
**CRIAR**: `app/(admin)/admin/posts/new/page.tsx`, `app/(admin)/admin/posts/[id]/edit/page.tsx`, `components/admin/PostForm.tsx`, `components/admin/CoverUploader.tsx`, `components/admin/CategorySelector.tsx`, `components/admin/PublishControls.tsx`
**EDITAR**: —
**LER**: `docs/ux-flows.md` (F02), `docs/PRD.md` (F02)
**NÃO TOCAR**: editor base
**Steps**:
1. `/new` POST cria draft → redirect `/[id]/edit`
2. PostForm: cover, título, excerpt, categorias, BlockEditor
3. Auto-save 10s
4. PublishControls sticky footer: Visualizar, Salvar, Agendar (datetime), Publicar
5. Validações: título obrigatório, cover obrigatório pra publicar
6. Toast feedback
7. `npm run build`
**Critério**: criar/editar/publicar/agendar todos funcionam

### D2 — Categorias

#### D2.1 ⬜ 🟢 — API + UI categorias
**CRIAR**: `lib/schemas/category.ts`, `app/api/admin/categories/route.ts`, `app/api/admin/categories/[id]/route.ts`, `app/api/categories/route.ts`, `app/(admin)/admin/categories/page.tsx`, `components/admin/CategoryModal.tsx`
**EDITAR**: —
**LER**: `docs/PRD.md` (F04), `docs/ux-flows.md` (F04)
**NÃO TOCAR**: posts
**Steps**:
1. CRUD com Zod
2. Slug auto único
3. UI tabela com modal de criar/editar
4. Color picker
5. Delete: 422 se tem posts vinculados
6. `npm run build`
**Critério**: CRUD completo

### D3 — Home Pública

#### D3.1 ⬜ 🟡 — API pública de posts + categorias
**CRIAR**: `app/api/posts/route.ts`, `app/api/posts/[slug]/route.ts`
**EDITAR**: `app/api/categories/route.ts` (público GET)
**LER**: `docs/PRD.md` (F06, F07), `docs/security.md`
**NÃO TOCAR**: admin
**Steps**:
1. GET /api/posts: paginação, filtro categoria, busca opcional
2. GET /api/posts/[slug]: detalhe + categorias + views/likes count
3. Apenas `status=published AND deleted_at IS NULL`
4. `npm run build`
**Critério**: APIs públicas respondem corretamente, RLS funciona

#### D3.2 ⬜ 🔴 — Home page (Substack-like)
**CRIAR**: `app/(public)/page.tsx`, `components/post/FeaturedPost.tsx`, `components/post/PostCard.tsx`, `components/post/PostGrid.tsx`, `components/post/PopularSidebar.tsx`, `components/shared/CategoryChip.tsx`, `components/shared/CategoryFilters.tsx`
**EDITAR**: —
**LER**: prints fornecidos, `docs/ux-flows.md` (F06), `docs/PRD.md` (F06)
**NÃO TOCAR**: header/footer
**Steps**:
1. RSC fetcha: posts publicados + view `v_popular_posts` + categorias (parallel via `Promise.all`)
2. Layout 3 colunas desktop (lg+): col esquerda (2 cards menores) | col centro (FeaturedPost grande) | col direita (PopularSidebar)
3. Mobile: single column, sidebar vai pro fim
4. Filtros chip por categoria → URL state
5. Lista cronológica abaixo, infinite scroll/paginação
6. ISR `revalidate: 60`
7. `npm run build`
**Critério**: home renderiza igual aos prints, responsiva, ISR funciona

### D4 — Página do Post

#### D4.1 ⬜ 🔴 — Página do post + actions
**CRIAR**: `app/(public)/p/[slug]/page.tsx`, `app/(public)/p/[slug]/not-found.tsx`, `app/(public)/p/[slug]/opengraph-image.tsx`, `components/post/PostHero.tsx`, `components/post/PostContent.tsx`, `components/post/PostActions.tsx`, `components/post/LikeButton.tsx`, `components/post/ShareButton.tsx`, `components/post/CopyLinkButton.tsx`, `components/post/ReadingProgress.tsx`, `components/shared/BlogImage.tsx`, `lib/seo/metadata.ts`, `lib/seo/jsonld.ts`
**EDITAR**: —
**LER**: `docs/PRD.md` (F07, F12), `docs/ux-flows.md` (F07), prints
**NÃO TOCAR**: home
**Steps**:
1. RSC fetcha post por slug, 404 se não existe ou não publicado
2. Layout: cover full-width, título grande, meta, conteúdo max-w-720
3. PostContent renderiza Tiptap JSON
4. PostActions sticky: like, share, copy
5. ReadingProgress bar topo
6. generateMetadata: title, description, OG, Twitter card
7. opengraph-image: usa cover do post (1200x630)
8. JSON-LD Article schema
9. ISR `revalidate: 60`
10. `npm run build`
**Critério**: posts renderizam, SEO ok, OG image funciona

### D5 — Likes + Views

#### D5.1 ⬜ 🟡 — API likes + views + hooks
**CRIAR**: `app/api/posts/[id]/like/route.ts`, `app/api/posts/[id]/view/route.ts`, `lib/utils/hash.ts`, `hooks/useLikedPosts.ts`, `hooks/useViewTracker.ts`, `hooks/useShare.ts`
**EDITAR**: `components/post/LikeButton.tsx`, `components/post/ShareButton.tsx`, `app/(public)/p/[slug]/page.tsx` (montar view tracker)
**LER**: `docs/PRD.md` (F08, F09), `docs/security.md` (§3, §6)
**NÃO TOCAR**: outras APIs
**Steps**:
1. hash util: SHA-256(client_uuid + IP + LIKE_HASH_SALT)
2. Like route: idempotente (POST toggle), valida Zod, rate limit, upsert/delete `post_likes`
3. View route: 1x por sessão (cookie httpOnly `_session_id`), insert `post_views`
4. useLikedPosts: localStorage map de likes
5. useViewTracker: dispara POST view ao montar (1x)
6. useShare: detecta `navigator.share`, fallback copy
7. Optimistic UI no like
8. `npm run build`
**Critério**: like/unlike funciona, view conta 1x por sessão

### D6 — Busca + Categoria

#### D6.1 ⬜ 🟢 — Busca e página de categoria
**CRIAR**: `app/(public)/search/page.tsx`, `app/(public)/category/[slug]/page.tsx`, `app/api/search/route.ts`
**EDITAR**: `components/shared/SearchBar.tsx`
**LER**: `docs/PRD.md` (F10), `docs/ux-flows.md` (F10, F11)
**NÃO TOCAR**: home
**Steps**:
1. API search: ILIKE + pg_trgm em title/excerpt
2. /search page mostra resultados (cards) + filtro por categoria
3. /category/[slug]: posts da categoria com header colorido
4. Empty states amigáveis
5. SearchBar dispara navegação `/search?q=`
6. `npm run build`
**Critério**: busca encontra, filtro funciona

### D7 — SEO + Sitemap

#### D7.1 ⬜ 🟢 — Sitemap, robots, OG defaults
**CRIAR**: `app/sitemap.ts`, `app/robots.ts`, `app/icon.tsx`, `public/og-default.png`
**EDITAR**: `app/layout.tsx` (metadataBase, defaults)
**LER**: `docs/PRD.md` (F12)
**NÃO TOCAR**: pages
**Steps**:
1. sitemap.ts dinâmico (home + todos posts publicados + categorias)
2. robots.ts (allow all + sitemap link)
3. metadataBase em layout root
4. OG default fallback
5. `npm run build`
**Critério**: `/sitemap.xml` e `/robots.txt` respondem corretamente

---

## Bloco E — Features P1

### E1 ⬜ 🟢 — Dashboard admin
**CRIAR**: `app/(admin)/admin/page.tsx`, `components/admin/StatsCards.tsx`, `components/admin/TopPostsList.tsx`, `app/api/admin/stats/route.ts`
**EDITAR**: —
**LER**: `docs/PRD.md` (F11)
**NÃO TOCAR**: outras admin pages
**Steps**:
1. Stats: views 30d, likes 30d, total publicados, drafts (via view `v_admin_stats`)
2. Top 5 posts por views 30d
3. Cards visuais
4. `npm run build`
**Critério**: dashboard mostra métricas corretas

### E2 ⬜ 🟢 — Configurações (perfil + blog)
**CRIAR**: `app/(admin)/admin/settings/page.tsx`, `components/admin/ProfileForm.tsx`, `lib/schemas/profile.ts`, `app/api/admin/profile/route.ts`
**EDITAR**: —
**LER**: `docs/PRD.md` (Modelo profile)
**NÃO TOCAR**: posts/categorias
**Steps**:
1. Form: nome, avatar (upload), bio, blog_title, blog_description
2. PATCH endpoint
3. revalidatePath('/') ao salvar
4. `npm run build`
**Critério**: perfil edita e propaga no header público

---

## Bloco F — Polish

### F1 ⬜ 🟢 — Cron jobs
**CRIAR**: `app/api/cron/publish-scheduled/route.ts`, `app/api/cron/cleanup-images/route.ts`, `vercel.json`
**EDITAR**: `.env.local.example`
**LER**: `docs/security.md` (§4 cron), `docs/PRD.md` (F03 agendamento)
**NÃO TOCAR**: outras APIs
**Steps**:
1. publish-scheduled: valida CRON_SECRET, chama `publish_scheduled_posts()` SQL function, revalida
2. cleanup-images: lista files no bucket, compara com URLs em uso, deleta órfãs
3. vercel.json com schedules (5min e mensal)
4. `npm run build`
**Critério**: endpoints respondem 200 com Bearer correto, 401 sem

### F2 ⬜ 🟡 — Rate limiting (Upstash)
**CRIAR**: `lib/rate-limit.ts`
**EDITAR**: rotas críticas (`/api/posts/[id]/like`, `/api/admin/upload`, `/api/auth/*`, `/api/search`)
**LER**: `docs/security.md` (§4)
**NÃO TOCAR**: lógica de negócio
**Steps**:
1. Instalar `@upstash/ratelimit @upstash/redis`
2. Helper `lib/rate-limit.ts`
3. Aplicar nos endpoints conforme tabela security.md
4. Resposta 429 padronizada
5. `npm run build`
**Critério**: limits ativos (testar com loop)

### F3 ⬜ 🟢 — Error handling + boundaries
**CRIAR**: `app/error.tsx`, `app/not-found.tsx`, `app/(admin)/admin/error.tsx`, `components/shared/EmptyState.tsx`
**EDITAR**: —
**LER**: `docs/ux-flows.md` (§7, §8)
**NÃO TOCAR**: pages funcionais
**Steps**:
1. Boundaries com botão "Tentar novamente"
2. 404 customizada
3. EmptyState reutilizável
4. `npm run build`
**Critério**: erros não quebram UX

### F4 ⬜ 🟡 — Responsividade + acessibilidade
**CRIAR**: —
**EDITAR**: PublicHeader, AdminSidebar, PostsTable, FeaturedPost, PostActions, PostContent
**LER**: `docs/ux-flows.md` (§5, §6)
**NÃO TOCAR**: lógica
**Steps**:
1. Testar em 375, 768, 1024, 1440px
2. Sidebar admin → drawer mobile
3. PostsTable → cards mobile
4. PostActions sticky bottom mobile
5. ARIA labels em ícones
6. Focus visible
7. `prefers-reduced-motion`
8. `npm run build`
**Critério**: navegável teclado, layouts ok em todas as larguras

### F5 ⬜ 🟢 ⚙️ MANUAL — Deploy Vercel
**CRIAR**: nada
**EDITAR**: nada
**LER**: `docs/security.md` (checklist)
**NÃO TOCAR**: —
**Steps**:
1. Push pro GitHub (repo privado)
2. Conectar repo na Vercel
3. Configurar env vars (NEXT_PUBLIC_* + SUPABASE_SERVICE_ROLE_KEY + CRON_SECRET + LIKE_HASH_SALT + UPSTASH_*)
4. Deploy preview, testar tudo
5. Promover pra prod
6. Configurar domínio (futuro)
7. Validar checklist pre-deploy completo
**Critério**: site no ar, login funciona, posts renderizam, OG funciona

---

## Resumo

| Bloco | Tasks | Complexidade | Depende de |
|-------|-------|--------------|------------|
| A — Setup | 4 | 🟢🟡🟢🟢 | — |
| B — Auth | 1 | 🟢 | A |
| C — Layout | 2 | 🟡🟡 | A, B |
| D — Features Core | 11 | mix 🟡🔴 | A-C |
| E — P1 | 2 | 🟢🟢 | D |
| F — Polish | 5 | 🟢🟡🟢🟡🟢 | todos |

**Total**: 25 tasks. Estimativa: 4 semanas (1 dev focado).

**Ordem de execução**: A1→A2→A3→A4 → B1 → C1→C2 → D1.1→D1.2→D1.3→D1.4 → D2.1 → D3.1→D3.2 → D4.1 → D5.1 → D6.1 → D7.1 → E1→E2 → F1→F2→F3→F4 → F5
