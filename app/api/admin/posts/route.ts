import { NextResponse, type NextRequest } from 'next/server'

import { CreatePostSchema } from '@/lib/schemas/post'
import { createClient } from '@/lib/supabase/server'
import { calculateReadingTime } from '@/lib/utils/reading-time'
import { ensureUniqueSlug, generateSlug } from '@/lib/utils/slug'
import type { Json } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const q = searchParams.get('q')?.trim()

    let query = supabase
      .from('posts')
      .select('*, post_categories(category_id, categories(id, name, slug, color))', {
        count: 'exact',
      })
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    if (status) {
      query = query.eq(
        'status',
        status as 'draft' | 'scheduled' | 'published' | 'archived'
      )
    }
    if (q) {
      query = query.ilike('title', `%${q}%`)
    }

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ data, count })
  } catch (error) {
    console.error('[GET /api/admin/posts]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = CreatePostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      category_ids,
      slug: providedSlug,
      content,
      ...rest
    } = parsed.data

    const baseSlug = generateSlug(providedSlug ?? rest.title)
    if (!baseSlug) {
      return NextResponse.json(
        { error: 'Unable to derive slug from title' },
        { status: 422 }
      )
    }
    const slug = await ensureUniqueSlug(supabase, baseSlug)

    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert({
        ...rest,
        slug,
        content: content as Json,
        author_id: user.id,
        reading_time: calculateReadingTime(content),
      })
      .select()
      .single()
    if (insertError) throw insertError

    if (category_ids.length > 0) {
      const { error: linkError } = await supabase
        .from('post_categories')
        .insert(category_ids.map((cid) => ({ post_id: post.id, category_id: cid })))
      if (linkError) throw linkError
    }

    return NextResponse.json({ data: post }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/posts]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
