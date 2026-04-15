> 🔴 Iron Man | 15/04/2026 | v1.0

# PRD — Bethel Blog

## 1. Visão

### Problema
Bethel quer um blog pessoal com experiência de leitura premium estilo Substack, sem depender de plataforma terceira (lock-in, branding, custos). Soluções existentes ou são caras (Substack Pro), ou pesadas (WordPress), ou limitam customização.

### Solução
SaaS single-user proprietário: admin protegido para o autor + leitura pública anônima com UX inspirada no Substack (header limpo, post em destaque, sidebar de populares, lista cronológica, página de artigo com tipografia editorial).

### Personas

| Persona | Descrição | Necessidade |
|---------|-----------|-------------|
| **Bethel (Autor)** | Empreendedor digital, escreve regularmente | Publicar rápido, organizar por categorias, ver métricas |
| **Leitor Anônimo** | Visita via link compartilhado | Ler sem fricção, curtir, compartilhar |

### KPIs
- Tempo médio de leitura por post > 2min
- Taxa de like por view > 5%
- Taxa de share por view > 2%
- Tempo de publicação (rascunho → publicado) < 5min
- Lighthouse Performance ≥ 90, SEO ≥ 95

## 2. Features

### F01 — Autenticação Admin [P0]
**Descrição**: Login único para o autor via Supabase Auth (email/senha). Sem cadastro público.

**User Stories**
- Como Bethel, quero logar com email/senha para acessar o admin
- Como Bethel, quero permanecer logado entre sessões
- Como Bethel, quero recuperar senha por email se esquecer

**Critérios de Aceitação**
- [ ] Tela `/login` com email + senha + botão "Entrar"
- [ ] Redireciona pra `/admin` após login bem-sucedido
- [ ] Bloqueia acesso a `/admin/*` sem sessão válida (middleware)
- [ ] Cadastro de novos usuários **desabilitado** no Supabase
- [ ] Logout limpa sessão e redireciona pra `/`
- [ ] Reset de senha via link por email funcional

**Regras**
- Apenas 1 usuário registrado manualmente no Supabase Dashboard
- Sessão JWT com refresh automático
- Middleware protege todas as rotas `/admin/*` e `/api/admin/*`

---

### F02 — Editor de Posts (Estilo Notion) [P0]
**Descrição**: Editor WYSIWYG baseado em blocos (Tiptap) com toolbar simples e slash commands.

**User Stories**
- Como Bethel, quero escrever artigos com blocos (parágrafo, H2, H3, lista, citação, imagem) para estruturar conteúdo
- Como Bethel, quero formatar texto inline (negrito, itálico, link) sem sair do teclado
- Como Bethel, quero arrastar imagens direto pro editor

**Critérios de Aceitação**
- [ ] Editor renderiza blocos: parágrafo, H2, H3, lista (ordered/unordered), citação, imagem, separador
- [ ] Toolbar flutuante com bold, italic, link ao selecionar texto
- [ ] Slash command `/` abre menu de blocos
- [ ] Drag & drop de imagem upa pro Storage e insere bloco automaticamente
- [ ] Atalhos: `Cmd+B` bold, `Cmd+I` italic, `Cmd+K` link, `##` H2
- [ ] Auto-save de rascunho a cada 10s (status visual: "Salvando..." / "Salvo")
- [ ] Preview do post em nova aba antes de publicar

**Regras**
- Conteúdo armazenado como JSON Tiptap em `posts.content`
- Render público converte JSON → HTML via Tiptap server-side (SSR)

---

### F03 — Gestão de Posts [P0]
**Descrição**: CRUD de posts com status (rascunho, agendado, publicado, arquivado).

**User Stories**
- Como Bethel, quero listar todos os posts com filtro por status
- Como Bethel, quero criar, editar, duplicar, deletar posts
- Como Bethel, quero agendar publicação para data/hora futura

**Critérios de Aceitação**
- [ ] `/admin/posts` lista com colunas: capa thumb, título, status, categorias, views, likes, data
- [ ] Filtro por status (tabs: Todos / Rascunhos / Agendados / Publicados / Arquivados)
- [ ] Busca por título
- [ ] Botão "Novo Post" → `/admin/posts/new`
- [ ] Edição em `/admin/posts/[id]/edit`
- [ ] Campos do post: título, slug (auto, editável), capa (upload), categorias (multi-select), conteúdo, status, scheduled_at, excerpt (auto dos primeiros 160 chars, editável)
- [ ] Validação: título obrigatório, capa obrigatória pra publicar
- [ ] Slug único (gera `-2`, `-3` se duplicado)
- [ ] Cron job (Vercel Cron + endpoint) publica agendados a cada 5min
- [ ] Soft delete (campo `deleted_at`), arquivar = `status='archived'`

**Regras**
- Rascunhos não aparecem no público
- Agendado vira publicado automaticamente quando `scheduled_at <= NOW()`
- Slug é parte da URL pública: `/p/[slug]`

---

### F04 — Gestão de Categorias [P0]
**Descrição**: CRUD de categorias para classificar posts.

**User Stories**
- Como Bethel, quero criar categorias com nome e cor para organizar posts
- Como Bethel, quero atribuir múltiplas categorias por post

**Critérios de Aceitação**
- [ ] `/admin/categories` lista categorias com: nome, slug, cor, contagem de posts
- [ ] CRUD inline (modal de criar/editar)
- [ ] Campos: nome (obrigatório), slug (auto), cor (color picker, default da paleta)
- [ ] Não permite deletar categoria com posts vinculados (alertar)
- [ ] Slug único

---

### F05 — Upload e Otimização de Imagens [P0]
**Descrição**: Upload pro Supabase Storage com pipeline de otimização preservando qualidade.

**User Stories**
- Como Bethel, quero subir imagem e ela ser otimizada automaticamente sem perder qualidade visível
- Como leitor, quero imagens carregando rápido em qualquer dispositivo

**Critérios de Aceitação**
- [ ] Endpoint `POST /api/admin/upload` recebe imagem, processa via Sharp, retorna URLs
- [ ] Gera 3 variantes: `thumb` (480w), `medium` (1024w), `large` (1920w) — todas em WebP, qualidade 85
- [ ] Mantém arquivo original também (fallback)
- [ ] Tamanho máx upload: 10MB
- [ ] Formatos aceitos: jpg, png, webp, heic, avif
- [ ] Componente `<BlogImage>` usa `<Image>` Next.js com `srcset` automático
- [ ] Capa do post usa `large`, thumbs de listagem usam `thumb`

**Regras**
- Storage bucket `blog-images` (público)
- Path: `{year}/{month}/{uuid}-{slug}.webp`
- Limpeza periódica de imagens órfãs (cron mensal)

---

### F06 — Home Pública [P0]
**Descrição**: Página inicial pública estilo Substack.

**User Stories**
- Como leitor, quero ver o post mais recente em destaque ao chegar
- Como leitor, quero ver os posts mais populares na lateral
- Como leitor, quero buscar e filtrar posts por categoria

**Critérios de Aceitação**
- [ ] Header sticky com: logo/foto autor (esquerda), título do blog (centro), busca + ícones (direita)
- [ ] Navegação: Início, Notes (futuro, hidden v1), Arquivo, Sobre — apenas Início v1
- [ ] Hero: post destaque (mais recente) ocupando coluna principal grande
- [ ] Sidebar direita "Mais Popular": top 5 posts por views (90 dias) com thumbs
- [ ] Coluna esquerda: 2 posts recentes (após o destaque) com cards menores
- [ ] Abaixo: lista cronológica completa com tabs "Mais recentes / Principais / Discussões" (só "Mais recentes" funcional v1)
- [ ] Barra de filtros por categoria (chips)
- [ ] Busca em tempo real (debounced 300ms) por título/excerpt
- [ ] Footer: nome do blog, links Sobre/Arquivo/Mapa do Site (placeholders)
- [ ] ISR com revalidate 60s

---

### F07 — Página de Post Pública [P0]
**Descrição**: Página individual do artigo com layout editorial.

**User Stories**
- Como leitor, quero ler o artigo com tipografia confortável
- Como leitor, quero curtir e compartilhar facilmente

**Critérios de Aceitação**
- [ ] Rota `/p/[slug]`
- [ ] Header simples (mesmo da home)
- [ ] Título grande + subtítulo (excerpt) + autor (foto + nome + data)
- [ ] Barra de ações: contador de likes + botão coração + botão compartilhar + botão copiar link
- [ ] Conteúdo renderizado com largura máxima de leitura (~720px)
- [ ] Imagens inline com legenda opcional
- [ ] Ao final: link "Compartilhar" + "Mais posts" (3 sugestões da mesma categoria)
- [ ] Incrementa view count no carregamento (1 por sessão via cookie)
- [ ] OG tags + Twitter Card automáticos
- [ ] JSON-LD Article schema

---

### F08 — Sistema de Likes [P0]
**Descrição**: Curtidas anônimas com prevenção de duplicatas.

**User Stories**
- Como leitor, quero curtir um post sem precisar fazer login
- Como Bethel, quero contagem de likes confiável (não inflada)

**Critérios de Aceitação**
- [ ] Botão coração no post toggle like/unlike
- [ ] Estado visual persistente (coração preenchido se já curtido)
- [ ] Identificação: localStorage UUID + IP hash (SHA-256) — 1 like por par (post, identifier)
- [ ] Endpoint `POST /api/posts/[id]/like` (idempotente)
- [ ] Rate limit: 10 likes/min por IP
- [ ] Contador atualiza otimisticamente no client

**Regras**
- IP nunca armazenado em texto puro, apenas hash
- Tabela `post_likes` com `(post_id, identifier_hash)` UNIQUE

---

### F09 — Compartilhamento [P0]
**Descrição**: Copiar link + Web Share API nativo.

**User Stories**
- Como leitor mobile, quero compartilhar via menu nativo do sistema
- Como leitor desktop, quero copiar link rapidamente

**Critérios de Aceitação**
- [ ] Botão "Compartilhar" detecta `navigator.share` → menu nativo (mobile)
- [ ] Fallback: copia link + toast "Link copiado"
- [ ] Botão dedicado "Copiar link" sempre visível
- [ ] URL compartilhada inclui `?ref=share` (analytics)

---

### F10 — Busca e Filtros [P1]
**Descrição**: Busca textual e filtro por categoria na home.

**Critérios de Aceitação**
- [ ] Busca: ILIKE em title + excerpt (Postgres full-text search v2)
- [ ] Filtro: query param `?cat=slug` filtra lista
- [ ] Estado vazio amigável ("Nenhum post encontrado")
- [ ] URL reflete filtros (compartilhável)

---

### F11 — Dashboard Admin [P1]
**Descrição**: Visão geral de métricas no `/admin`.

**Critérios de Aceitação**
- [ ] Cards: total posts publicados, total views (30d), total likes (30d), posts em rascunho
- [ ] Top 5 posts por views (30d)
- [ ] Atividade recente (últimas 10 ações: post criado/publicado/curtido)

---

### F12 — SEO e Open Graph [P0]
**Descrição**: Meta tags otimizadas pra compartilhamento e busca.

**Critérios de Aceitação**
- [ ] Cada post tem `<title>`, `<meta description>`, OG title/description/image, Twitter Card
- [ ] OG image = capa do post (1200x630, gerada via Sharp se necessário)
- [ ] `sitemap.xml` dinâmico
- [ ] `robots.txt`
- [ ] Canonical URLs

## 3. Modelo de Dados

### `users` (auth.users — Supabase nativo)
Apenas 1 row (Bethel).

### `profile`
| Campo | Tipo | Required | Notas |
|-------|------|----------|-------|
| id | uuid (FK auth.users) | ✅ | PK |
| name | text | ✅ | Nome de exibição |
| avatar_url | text | ✅ | Foto do header |
| bio | text | — | Sobre o autor |
| blog_title | text | ✅ | "Bethel Blog" |
| blog_description | text | — | Tagline |
| created_at | timestamptz | ✅ | |

### `posts`
| Campo | Tipo | Required | Notas |
|-------|------|----------|-------|
| id | uuid | ✅ | PK |
| author_id | uuid (FK profile) | ✅ | |
| title | text | ✅ | |
| slug | text | ✅ | UNIQUE |
| excerpt | text | — | Auto-gerado, editável |
| cover_url | text | — | URL Storage |
| cover_alt | text | — | Alt text |
| content | jsonb | ✅ | JSON Tiptap |
| content_html | text | — | Cache HTML renderizado |
| status | enum | ✅ | draft / scheduled / published / archived |
| scheduled_at | timestamptz | — | |
| published_at | timestamptz | — | Set ao publicar |
| views_count | int | ✅ | Default 0 |
| likes_count | int | ✅ | Default 0 (cache, atualizado via trigger) |
| reading_time | int | — | Em minutos, calculado |
| meta_title | text | — | Override SEO |
| meta_description | text | — | Override SEO |
| created_at | timestamptz | ✅ | |
| updated_at | timestamptz | ✅ | |
| deleted_at | timestamptz | — | Soft delete |

### `categories`
| Campo | Tipo | Required | Notas |
|-------|------|----------|-------|
| id | uuid | ✅ | PK |
| name | text | ✅ | |
| slug | text | ✅ | UNIQUE |
| color | text | ✅ | Hex |
| created_at | timestamptz | ✅ | |

### `post_categories`
| Campo | Tipo | Required | Notas |
|-------|------|----------|-------|
| post_id | uuid (FK posts) | ✅ | PK composta |
| category_id | uuid (FK categories) | ✅ | PK composta |

### `post_likes`
| Campo | Tipo | Required | Notas |
|-------|------|----------|-------|
| id | uuid | ✅ | PK |
| post_id | uuid (FK posts) | ✅ | |
| identifier_hash | text | ✅ | SHA-256(localStorageUUID + IP) |
| created_at | timestamptz | ✅ | |

UNIQUE (post_id, identifier_hash)

### `post_views`
| Campo | Tipo | Required | Notas |
|-------|------|----------|-------|
| id | uuid | ✅ | PK |
| post_id | uuid (FK posts) | ✅ | |
| session_hash | text | ✅ | Cookie session |
| referrer | text | — | |
| created_at | timestamptz | ✅ | |

UNIQUE (post_id, session_hash) — agregado pra view count

## 4. API Routes

### Públicas
| Method | Path | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/posts` | Lista publicados (paginated, filterable) | — |
| GET | `/api/posts/[slug]` | Detalhe do post | — |
| POST | `/api/posts/[id]/like` | Toggle like (idempotente) | — |
| POST | `/api/posts/[id]/view` | Registra view (1x por sessão) | — |
| GET | `/api/categories` | Lista categorias | — |
| GET | `/api/search?q=` | Busca | — |

### Admin (auth required)
| Method | Path | Descrição |
|--------|------|-----------|
| GET | `/api/admin/posts` | Lista todos (incl. drafts) |
| POST | `/api/admin/posts` | Cria post |
| PATCH | `/api/admin/posts/[id]` | Atualiza |
| DELETE | `/api/admin/posts/[id]` | Soft delete |
| POST | `/api/admin/posts/[id]/publish` | Publica imediato |
| POST | `/api/admin/upload` | Upload imagem |
| GET/POST/PATCH/DELETE | `/api/admin/categories` | CRUD |
| GET | `/api/admin/stats` | Dashboard metrics |
| GET | `/api/admin/profile` | Perfil do autor |
| PATCH | `/api/admin/profile` | Atualiza perfil |

### Cron (Vercel Cron, secret token)
| Method | Path | Descrição |
|--------|------|-----------|
| POST | `/api/cron/publish-scheduled` | Publica agendados (a cada 5min) |
| POST | `/api/cron/cleanup-images` | Remove imagens órfãs (mensal) |

### Errors padrão
- `400` validação (Zod)
- `401` sem sessão
- `403` sem permissão
- `404` recurso não existe
- `429` rate limit
- `500` server error
- Body: `{ error: string, code: string, details?: object }`

## 5. Integrações
**MVP**: Nenhuma externa além de Supabase + Vercel.

**Futuro [INFERIDO]**: Vercel Analytics, Plausible (analytics privacy-friendly).

## 6. Auth & Roles

**Método**: Supabase Auth (email/senha), JWT em cookie httpOnly.

**Roles**:
| Role | Permissões |
|------|------------|
| `admin` (Bethel) | Tudo |
| `anonymous` | Ler posts publicados, like, view |

**Onboarding**: Usuário criado manualmente no Supabase Dashboard. Reset de senha via email padrão Supabase.

**Middleware**: `middleware.ts` valida sessão pra `/admin/*` e `/api/admin/*`.

## 7. Não-funcionais

| Categoria | Target |
|-----------|--------|
| **Performance** | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| **SEO** | Lighthouse SEO ≥ 95, OG tags, sitemap, JSON-LD |
| **Acessibilidade** | WCAG AA, contraste ≥ 4.5:1, navegação teclado |
| **Escalabilidade** | Suporta 100k views/mês no plano Vercel Hobby + Supabase Free |
| **Segurança** | RLS habilitado, rate limit, CSP headers, IP nunca em plain text |
| **Disponibilidade** | 99.9% (herdado Vercel/Supabase) |
| **Dark mode** | Suporte completo (toggle no header) [INFERIDO] |

## 8. Roadmap

### Fase 1 — MVP (4 semanas)
F01, F02, F03, F04, F05, F06, F07, F08, F09, F12

### Fase 2 — Refino (1 semana)
F10 (busca FTS), F11 (dashboard completo)

### Fase 3 — Crescimento [futuro]
RSS feed, Notes (microblog estilo Substack), newsletter opt-in, analytics próprio

## 9. Riscos

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| Editor Tiptap complexo demais | Média | Alto | Começar com presets mínimos, expandir aos poucos |
| Spam de likes via bots | Média | Baixo | Rate limit + IP hash + Cloudflare turnstile (futuro) |
| Imagens pesadas estourando Storage Free | Baixa | Médio | Otimização agressiva + monitoramento de quota |
| SEO ruim por SSR mal feito | Baixa | Alto | ISR + testes Lighthouse no CI |
| Perda de rascunho por bug no auto-save | Baixa | Alto | Backup local (IndexedDB) + versionamento simples |
