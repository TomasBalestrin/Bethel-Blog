> 🕷️ Viúva Negra | 15/04/2026 | v1.0

# UX Flows — Bethel Blog

## 1. Mapa de Rotas

```
PÚBLICAS
/                              Home (post destaque + sidebar + lista)
/p/[slug]                      Post individual
/category/[slug]               Posts filtrados por categoria
/search?q=                     Resultados de busca

AUTH
/login                         Login admin (Supabase)

ADMIN (protegidas)
/admin                         Dashboard (stats)
/admin/posts                   Listagem (todos status)
/admin/posts/new               Editor novo post
/admin/posts/[id]/edit         Editor edição
/admin/categories              Gestão categorias
/admin/settings                Perfil + config blog

API
/api/posts (GET)
/api/posts/[id]/like (POST)
/api/posts/[id]/view (POST)
/api/categories (GET)
/api/search (GET)
/api/admin/* (auth required)
/api/cron/* (CRON_SECRET)
```

## 2. Navegação

### Header Público (sticky, todos os layouts públicos)
- **Esquerda**: avatar autor (40px, link `/`)
- **Centro**: título do blog (link `/`) + nav (Início, Arquivo, Sobre — só "Início" v1)
- **Direita**: ícone busca, ícone notificação (decorativo v1), menu mobile, theme toggle

### Sidebar Admin (desktop fixa esquerda, mobile drawer)
- Logo "Bethel Blog Admin"
- **Navegação**:
  - 📊 Dashboard (`/admin`)
  - 📝 Posts (`/admin/posts`)
  - 🏷️ Categorias (`/admin/categories`)
  - ⚙️ Configurações (`/admin/settings`)
- **Footer sidebar**: avatar + nome + dropdown (Ver site / Logout)

### Header Admin
- Hamburguer (mobile) → abre drawer
- Breadcrumb (Posts › Editar)
- Ações contextuais (Salvar / Publicar) — flutua sticky no editor

## 3. Fluxos por Feature

### F01 — Login
**Persona**: Bethel
**Trigger**: tenta acessar `/admin` sem sessão

```
[/admin] → middleware redirect → [/login]
[/login] → submit email+senha → Supabase Auth
   ├── ✅ → cookie set → redirect [/admin]
   └── ❌ → erro inline ("Credenciais inválidas")
```

**Tela `/login`**:
- Logo + título "Bethel Blog"
- Form: email, senha, botão "Entrar"
- Link "Esqueci minha senha" → modal de reset
- Validação Zod: email válido, senha ≥ 6 chars
- Loading state no botão durante submit
- Toast erro se falhar

### F02 — Criar/Editar Post
**Persona**: Bethel
**Trigger**: clica "Novo Post" ou edita existente

```
[/admin/posts] → "Novo" → [/admin/posts/new]
   ↓ (POST cria draft vazio com UUID)
[/admin/posts/[id]/edit]
   ├── Capa (upload obrigatório pra publicar)
   ├── Título (auto-gera slug)
   ├── Subtítulo/excerpt opcional
   ├── Categorias (multi-select)
   ├── Editor blocos (Tiptap)
   │   ├── Toolbar flutuante (selecionar texto)
   │   ├── Slash menu (/)
   │   └── Drag & drop imagem → upload → bloco
   ├── Auto-save 10s (status: "Salvando..." / "Salvo às HH:mm")
   └── Sticky footer:
       ├── "Visualizar" (nova aba, /preview/[id])
       ├── "Salvar rascunho"
       ├── "Agendar..." (datetime picker)
       └── "Publicar agora" (confirma se sem capa)
```

**Estados**:
- Loading: skeleton do editor
- Erro upload: toast "Falha ao enviar imagem. Tentar novamente?"
- Conflict (slug duplicado): sugere `-2`, `-3`
- Draft sem título: bloqueia publicar

### F03 — Listagem Admin
```
[/admin/posts]
   ├── Tabs: Todos | Rascunhos | Agendados | Publicados | Arquivados
   ├── Busca (debounce 300ms)
   ├── Tabela (desktop) / Cards (mobile)
   │   colunas: capa, título, status, categorias, views, likes, data
   │   row actions: editar, duplicar, arquivar, deletar
   └── Paginação (20/página)
```

### F04 — Categorias
```
[/admin/categories]
   ├── Botão "Nova categoria" → modal
   │   campos: nome, cor (color picker)
   │   slug auto, único
   ├── Lista: nome | slug | cor | nº posts | actions
   └── Delete: alerta se tem posts vinculados ("Remova de 5 posts antes")
```

### F05 — Upload Imagem
```
Editor → drag/drop ou clique "Adicionar imagem"
   ↓
Validação client (MIME, tamanho ≤10MB)
   ↓ (se ok)
POST /api/admin/upload (multipart)
   ↓
Sharp pipeline (3 variants WebP)
   ↓
Retorna { url, alt }
   ↓
Insere bloco no editor com placeholder durante upload
```

**Estados**: progress bar inline, erro "Arquivo muito grande", retry.

### F06 — Home Pública (caminho feliz)
```
[/] (RSC + ISR 60s)
   ├── Header sticky
   ├── Hero (post mais recente, full-width na coluna principal)
   ├── 2 cards de posts recentes (coluna esquerda menor)
   ├── Sidebar "Mais Popular" (top 5 últimos 90d)
   ├── Filtros chips (categorias)
   ├── Tabs (Mais recentes / Principais / Discussões — só primeira v1)
   ├── Lista cronológica completa (paginada por scroll)
   └── Footer
```

**Mobile**: colapsa pra single column, sidebar move pro fim, filtros viram bottom sheet.

### F07 — Página de Post (caminho feliz)
```
[/p/[slug]] (RSC + ISR 60s)
   ├── Header sticky
   ├── Cover (full-width, max 1920w)
   ├── Título grande
   ├── Meta: avatar autor + nome + data + tempo de leitura
   ├── Barra ações sticky (likes count, ❤️ like, share, copy)
   ├── Conteúdo (max-width 720px, tipografia editorial)
   ├── Reading progress bar (top sticky)
   ├── Final: ações repetidas + "Veja mais"
   └── Footer
```

**Side effects ao montar**:
- POST `/api/posts/[id]/view` (1x por sessão via cookie `_session_id`)
- Check localStorage pra estado inicial do like

### F08 — Like
```
Click ❤️
   ↓
Optimistic update (+1, coração preenchido)
   ↓
POST /api/posts/[id]/like
   body: { client_uuid }   ← gerado no primeiro acesso, persistido localStorage
   ↓
Server: hash(client_uuid + IP + SALT) → upsert post_likes
   ├── ✅ → confirma estado
   └── ❌ → reverte UI + toast "Erro ao curtir"

Click novamente (já curtiu)
   ↓
DELETE post_likes WHERE post_id=X AND identifier_hash=Y
   ↓
Decrementa
```

### F09 — Compartilhar
```
Click "Compartilhar"
   ↓
if (navigator.share && isMobile)
   → menu nativo (WhatsApp, X, etc)
else
   → copia link + toast "Link copiado"

Click "Copiar link" (sempre visível)
   → navigator.clipboard.writeText
   → toast "Link copiado"
```

### F10 — Busca
```
Header → ícone busca → expand input
   ↓ digita (debounce 300ms)
GET /api/search?q=termo
   ↓
[/search?q=termo]
   ├── Resultados (cards)
   ├── Vazio: "Nenhum post encontrado para 'termo'"
   └── Filtro adicional por categoria
```

### F11 — Filtro por Categoria
```
Click chip categoria → [/category/[slug]]
   ├── Header com nome + cor da categoria
   ├── Lista posts da categoria (cronológica)
   └── Vazio: "Sem posts nesta categoria ainda"
```

## 4. Padrões de Interação

### Forms
- Label acima do input
- Validação onBlur + onChange (após primeira interação)
- Submit disabled até válido
- Loading spinner no botão durante submit
- Erros inline em vermelho + ícone

### Tabelas
- Busca debounce 300ms
- Sort por colunas (data, views, likes)
- Paginação 20/página (ou infinite scroll no admin)
- Row hover destaca + mostra actions
- Mobile: collapsa pra cards verticais

### Modais vs Drawers
- **Modal** (≤5 campos): nova categoria, reset senha, confirmação delete
- **Drawer/fullscreen**: editor de post (já é página)
- **Bottom sheet** (mobile): filtros

### Feedback
- **Toast success** (Sonner, 3s, verde): "Post publicado"
- **Toast error** (persistente até clicar): "Falha ao publicar"
- **AlertDialog** antes de destrutivo: "Tem certeza? Esta ação não pode ser desfeita"
- **Skeleton** durante loading inicial
- **Spinner** durante mutation
- **Empty state** com ilustração + CTA: "Sem posts ainda. Crie o primeiro"

## 5. Responsividade

| Breakpoint | Mudanças |
|------------|----------|
| `< sm` (mobile) | Sidebar admin → drawer; home colapsa 1 col; tabs viram select; modais fullscreen; filtros bottom sheet; barra ações post sticky bottom |
| `sm-md` | Tablets, layout intermediário |
| `lg+` | Layout completo: sidebar fixa admin, home 3 colunas, modais centralizados |

## 6. Acessibilidade

- **Keyboard nav**: Tab através de toda navegação, Enter ativa, Esc fecha modal
- **ARIA labels** em todos os botões só com ícone
- **Focus visible** outline custom (cor de destaque do design system)
- **Skip to content** no início do `body`
- **Contraste**: ≥ 4.5:1 (texto normal), ≥ 3:1 (texto grande/UI)
- **Alt text** obrigatório em imagens (campo no upload)
- **prefers-reduced-motion** respeitado nas animações Framer
- **Heading hierarchy** correta (1 H1 por página)

## 7. Empty States

| Tela | Estado vazio |
|------|--------------|
| Home (sem posts) | "Em breve, novos posts aqui ✨" |
| Admin Posts | "Sem posts ainda. [Criar primeiro post]" |
| Admin Categorias | "Sem categorias. [Criar nova]" |
| Busca | "Nenhum post para 'termo'. Tente outra palavra." |
| Categoria vazia | "Sem posts nesta categoria ainda." |
| Dashboard | Cards com 0s + dica "Publique o primeiro post" |

## 8. Loading States

| Contexto | Padrão |
|----------|--------|
| Página inteira (RSC) | Skeleton com shape do conteúdo |
| Lista | 5 skeleton cards |
| Botão (mutation) | Spinner inline + texto "Salvando..." |
| Imagem | Blur placeholder (next/image) |
| Editor | Skeleton com toolbar + 3 linhas placeholder |
| Auto-save | "Salvando..." / "Salvo às HH:mm" no canto |
