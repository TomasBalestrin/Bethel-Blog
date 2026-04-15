import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

const MAX_LIMIT = 20
const DEFAULT_LIMIT = 10

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
    const rawLimit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT) || DEFAULT_LIMIT
    const limit = Math.max(1, Math.min(MAX_LIMIT, rawLimit))
    const categorySlug = searchParams.get('category')?.trim() || null
    const q = searchParams.get('q')?.trim() || null

    const from = (page - 1) * limit
    const to = from + limit - 1

    // Se filtro por categoria, resolve slug → id primeiro.
    let categoryId: string | null = null
    if (categorySlug) {
      const { data: cat, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle()
      if (catError) throw catError
      if (!cat) {
        return NextResponse.json(
          { data: [], pagination: { page, limit, total: 0, totalPages: 0 } },
          { status: 200 }
        )
      }
      categoryId = cat.id
    }

    let query = supabase
      .from('posts')
      .select(
        'id, title, slug, excerpt, cover_url, cover_alt, published_at, reading_time, views_count, likes_count, post_categories!inner(category_id, categories(id, name, slug, color))',
        { count: 'exact' }
      )
      // RLS já filtra published + not-deleted; reforço explícito pra safety:
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .range(from, to)

    if (categoryId) {
      query = query.eq('post_categories.category_id', categoryId)
    }
    if (q) {
      query = query.ilike('title', `%${q}%`)
    }

    const { data, count, error } = await query
    if (error) throw error

    const total = count ?? 0
    const totalPages = Math.max(0, Math.ceil(total / limit))

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('[GET /api/posts]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
