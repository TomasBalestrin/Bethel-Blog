-- ═══════════════════════════════════════════════════════════
-- BETHEL BLOG — Instructors
-- ═══════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- 1. TABLE
-- ──────────────────────────────────────────────
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  avatar_url TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 2. ALTER posts — FK para instrutor
-- ──────────────────────────────────────────────
ALTER TABLE posts
  ADD COLUMN instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL;

-- ──────────────────────────────────────────────
-- 3. INDEXES
-- ──────────────────────────────────────────────
CREATE INDEX idx_instructors_slug ON instructors(slug);
CREATE INDEX idx_instructors_name ON instructors(name);
CREATE INDEX idx_posts_instructor ON posts(instructor_id) WHERE deleted_at IS NULL;

-- ──────────────────────────────────────────────
-- 4. RLS
-- ──────────────────────────────────────────────
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instructors_public_read" ON instructors
  FOR SELECT USING (true);

CREATE POLICY "instructors_admin_all" ON instructors
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ──────────────────────────────────────────────
-- 5. TRIGGER
-- ──────────────────────────────────────────────
CREATE TRIGGER trg_instructors_updated_at BEFORE UPDATE ON instructors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
