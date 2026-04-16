import { NextResponse, type NextRequest } from 'next/server'

import {
  getIdentifier,
  rateLimit,
  tooManyRequestsResponse,
} from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

const MAX_LIMIT = 20

export async function GET(request: NextRequest) {
  try {
    const rl = await rateLimit('search', getIdentifier(request))
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfter)

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(searchParams.get('limit') ?? '20') || 20)
    )

    if (!q) {
      return NextResponse.json({ data: [], query: '' })
    }

    const supabase = await createClient()
    const pattern = `%${q}%`

    // ILIKE em title OR excerpt; RLS garante apenas published não-deleted.
    const { data, error } = await supabase
      .from('posts')
      .select(
        'id, title, slug, excerpt, cover_url, cover_alt, published_at, reading_time, views_count, likes_count, instructor:instructors(id, name, slug, avatar_url), post_categories(categories(id, name, slug, color))'
      )
      .eq('status', 'published')
      .is('deleted_at', null)
      .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`)
      .order('published_at', { ascending: false })
      .limit(limit)
    if (error) throw error

    return NextResponse.json({ data, query: q })
  } catch (error) {
    console.error('[GET /api/search]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
