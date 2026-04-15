import slugify from 'slugify'

import type { createClient as createServerClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createServerClient>>

export function generateSlug(input: string): string {
  return slugify(input, {
    lower: true,
    strict: true,
    locale: 'pt',
    trim: true,
  })
}

/**
 * Garante slug único na tabela `posts`. Em caso de conflito,
 * adiciona sufixo -2, -3, -4... até encontrar um livre.
 */
export async function ensureUniqueSlug(
  supabase: SupabaseServerClient,
  base: string,
  ignoreId?: string
): Promise<string> {
  let candidate = base
  let attempt = 1

  while (true) {
    let query = supabase.from('posts').select('id').eq('slug', candidate).limit(1)
    if (ignoreId) query = query.neq('id', ignoreId)

    const { data, error } = await query
    if (error) throw error
    if (!data || data.length === 0) return candidate

    attempt += 1
    candidate = `${base}-${attempt}`
  }
}

/**
 * Mesma lógica para categorias.
 */
export async function ensureUniqueCategorySlug(
  supabase: SupabaseServerClient,
  base: string,
  ignoreId?: string
): Promise<string> {
  let candidate = base
  let attempt = 1

  while (true) {
    let query = supabase
      .from('categories')
      .select('id')
      .eq('slug', candidate)
      .limit(1)
    if (ignoreId) query = query.neq('id', ignoreId)

    const { data, error } = await query
    if (error) throw error
    if (!data || data.length === 0) return candidate

    attempt += 1
    candidate = `${base}-${attempt}`
  }
}
