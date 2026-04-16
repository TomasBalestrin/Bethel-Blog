import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select(
        'id, title, slug, excerpt, cover_url, cover_alt, content, content_html, published_at, reading_time, views_count, likes_count, meta_title, meta_description, instructor:instructors(id, name, slug, avatar_url), post_categories(categories(id, name, slug, color))'
      )
      // RLS já restringe ao público, mas reforço:
      .eq('status', 'published')
      .is('deleted_at', null)
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[GET /api/posts/[slug]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
