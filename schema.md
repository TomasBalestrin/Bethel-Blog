> 💚 Hulk | 15/04/2026 | v1.0

# Schema — Bethel Blog

## 1. Diagrama de Relacionamentos

```
auth.users (Supabase)
    1
    │
    └──1──→ profile (1 row, o autor)
              │
              1──N──→ posts
                       │
                       │──N──N──→ post_categories ←──N──N── categories
                       │
                       │──1──N──→ post_likes
                       │
                       └──1──N──→ post_views
```

## 2. Migration — `supabase/migrations/0001_initial.sql`

```sql
-- ═══════════════════════════════════════════════════════════
-- BETHEL BLOG — Initial Schema
-- ═══════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- 1. EXTENSIONS
-- ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- busca textual
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- busca sem acento

-- ──────────────────────────────────────────────
-- 2. ENUMS
-- ──────────────────────────────────────────────
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'archived');

-- ──────────────────────────────────────────────
-- 3. FUNCTIONS
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET views_count = views_count + 1 WHERE id = NEW.post_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE posts
  SET status = 'published', published_at = NOW()
  WHERE status = 'scheduled' AND scheduled_at <= NOW();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────
-- 4. TABLES (sem FK primeiro)
-- ──────────────────────────────────────────────

-- profile (1 row)
CREATE TABLE profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  bio TEXT,
  blog_title TEXT NOT NULL DEFAULT 'Bethel Blog',
  blog_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#1A5CE6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 5. TABLES (com FK)
-- ──────────────────────────────────────────────

-- posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  cover_url TEXT,
  cover_alt TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_html TEXT,
  status post_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  reading_time INTEGER,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT scheduled_requires_date CHECK (
    status != 'scheduled' OR scheduled_at IS NOT NULL
  ),
  CONSTRAINT published_requires_cover CHECK (
    status != 'published' OR cover_url IS NOT NULL
  )
);

-- post_categories (N-N)
CREATE TABLE post_categories (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, category_id)
);

-- post_likes
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  identifier_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, identifier_hash)
);

-- post_views
CREATE TABLE post_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  session_hash TEXT NOT NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, session_hash)
);

-- ──────────────────────────────────────────────
-- 6. INDEXES
-- ──────────────────────────────────────────────
CREATE INDEX idx_posts_status_published_at ON posts(status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_slug ON posts(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_posts_views ON posts(views_count DESC) WHERE status = 'published';
CREATE INDEX idx_posts_title_trgm ON posts USING gin (title gin_trgm_ops);
CREATE INDEX idx_posts_excerpt_trgm ON posts USING gin (excerpt gin_trgm_ops);

CREATE INDEX idx_post_categories_category ON post_categories(category_id);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_views_post_created ON post_views(post_id, created_at DESC);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ──────────────────────────────────────────────
-- 7. TRIGGERS
-- ──────────────────────────────────────────────
CREATE TRIGGER trg_profile_updated_at BEFORE UPDATE ON profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE TRIGGER trg_views_count
  AFTER INSERT ON post_views
  FOR EACH ROW EXECUTE FUNCTION update_views_count();

-- ──────────────────────────────────────────────
-- 8. RLS — Row Level Security
-- ──────────────────────────────────────────────
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- profile
CREATE POLICY "profile_public_read" ON profile FOR SELECT USING (true);
CREATE POLICY "profile_owner_update" ON profile FOR UPDATE USING (auth.uid() = id);

-- categories
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_all" ON categories FOR ALL USING (auth.uid() IS NOT NULL);

-- posts: público vê apenas published não-deleted
CREATE POLICY "posts_public_read_published" ON posts FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "posts_admin_read_all" ON posts FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "posts_admin_insert" ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "posts_admin_update" ON posts FOR UPDATE
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "posts_admin_delete" ON posts FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- post_categories: leitura pública (necessária pra render), escrita só admin
CREATE POLICY "post_categories_public_read" ON post_categories FOR SELECT USING (true);
CREATE POLICY "post_categories_admin_all" ON post_categories FOR ALL
  USING (auth.uid() IS NOT NULL);

-- post_likes: insert público, leitura pública (count), delete via service_role
CREATE POLICY "post_likes_public_read" ON post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_public_insert" ON post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "post_likes_public_delete" ON post_likes FOR DELETE USING (true);

-- post_views: insert público, leitura só admin
CREATE POLICY "post_views_admin_read" ON post_views FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "post_views_public_insert" ON post_views FOR INSERT WITH CHECK (true);

-- ──────────────────────────────────────────────
-- 9. VIEWS
-- ──────────────────────────────────────────────

-- Posts mais populares (90 dias) — pra sidebar "Mais Popular"
CREATE VIEW v_popular_posts AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.cover_url,
  p.published_at,
  COUNT(pv.id) AS recent_views
FROM posts p
LEFT JOIN post_views pv ON pv.post_id = p.id AND pv.created_at >= NOW() - INTERVAL '90 days'
WHERE p.status = 'published' AND p.deleted_at IS NULL
GROUP BY p.id
ORDER BY recent_views DESC, p.published_at DESC
LIMIT 10;

-- Stats admin (30 dias)
CREATE VIEW v_admin_stats AS
SELECT
  (SELECT COUNT(*) FROM posts WHERE status = 'published' AND deleted_at IS NULL) AS total_published,
  (SELECT COUNT(*) FROM posts WHERE status = 'draft' AND deleted_at IS NULL) AS total_drafts,
  (SELECT COUNT(*) FROM post_views WHERE created_at >= NOW() - INTERVAL '30 days') AS views_30d,
  (SELECT COUNT(*) FROM post_likes WHERE created_at >= NOW() - INTERVAL '30 days') AS likes_30d;

-- ──────────────────────────────────────────────
-- 10. STORAGE BUCKET
-- ──────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies do bucket
CREATE POLICY "blog_images_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');
CREATE POLICY "blog_images_admin_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "blog_images_admin_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "blog_images_admin_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

-- ──────────────────────────────────────────────
-- 11. SEED (executar manualmente após criar usuário no Auth)
-- ──────────────────────────────────────────────

-- Após criar o usuário Bethel no Supabase Auth Dashboard, rodar:
-- INSERT INTO profile (id, name, avatar_url, bio, blog_title, blog_description)
-- VALUES (
--   'UUID_DO_USUARIO_AQUI',
--   'Bethel',
--   'https://...avatar.png',
--   'Empreendedor digital. Escrevo sobre construção de produtos.',
--   'Bethel Blog',
--   'Insights sobre produto, sistemas e empreendedorismo.'
-- );

-- Categorias iniciais
INSERT INTO categories (name, slug, color) VALUES
  ('Produto', 'produto', '#1A5CE6'),
  ('Empreendedorismo', 'empreendedorismo', '#F2762E'),
  ('Sistemas', 'sistemas', '#10B981'),
  ('Estratégia', 'estrategia', '#8B5CF6'),
  ('Marketing', 'marketing', '#EC4899')
ON CONFLICT (slug) DO NOTHING;
```

## 3. Order de Execução
extensions → enums → functions → tables sem FK (`profile`, `categories`) → tables com FK (`posts`, `post_categories`, `post_likes`, `post_views`) → indexes → triggers → RLS → views → storage → seed.

## 4. Geração de Types
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT > types/database.ts
```
