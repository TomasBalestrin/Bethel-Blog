> 🛡️ Capitão América | 15/04/2026 | v1.0

# Briefing — Bethel Blog

## Visão
Gerenciador de blog pessoal single-user com leitura pública estilo Substack. Apenas o autor publica; leitores acessam sem cadastro.

## Stack
Next.js 14 App Router + TypeScript + Supabase (Postgres + Auth + Storage) + Vercel + Tailwind + shadcn/ui.

## Usuários
- **Admin** (autor único): login via Supabase Auth (email/senha)
- **Leitor público**: anônimo, sem cadastro

## Features

### Admin
- Editor de artigos estilo Notion/blocos (texto, H2, negrito, itálico, imagem inline, lista)
- Capa obrigatória, título, slug auto, categorias múltiplas
- Salvar rascunho, publicar, agendar publicação
- Gestão de posts (CRUD + mudar status)
- Gestão de categorias (CRUD)
- Dashboard com views e likes por post

### Público
- **Home**: cabeçalho (foto autor + busca + filtros por categoria) + post destaque + sidebar "Mais Popular" + lista cronológica
- **Post**: cover, título, conteúdo renderizado, botão curtir, botão copiar link
- **Curtidas anônimas** via localStorage + IP hash (1 like por leitor por post)
- **Compartilhar**: copiar link + Web Share API nativo
- **Busca** por título/conteúdo
- **Filtros** por categoria

### Sistema
- Upload de imagens pro Supabase Storage com otimização (Sharp, webp, múltiplas resoluções, mantendo qualidade)
- SEO + Open Graph automáticos por post (título, descrição, capa)
- Analytics: contador de views por post

## Não terá (MVP)
Comentários, anúncios, newsletter, pagamento, multi-user, multi-tenancy.

## Design System
Fornecido pelo usuário (HTML + MD + CSS).
