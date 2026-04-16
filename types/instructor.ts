/**
 * Instructor entity (tabela `instructors`).
 *
 * Após aplicar supabase/migrations/0002_instructors.sql, regenerar
 * types/database.ts:
 *   npx supabase gen types typescript --project-id $PROJECT_ID > types/database.ts
 *
 * Esta interface é uma fonte-de-verdade TS independente de
 * types/database.ts — úteis em props de componentes e validações
 * isoladas. Mantém paridade com a migration.
 */
export interface Instructor {
  id: string
  name: string
  slug: string
  avatar_url: string
  bio: string | null
  created_at: string
  updated_at: string
}
