import { NextResponse, type NextRequest } from 'next/server'

import { UpdatePostSchema } from '@/lib/schemas/post'
import { createClient } from '@/lib/supabase/server'
import { calculateReadingTime } from '@/lib/utils/reading-time'
import { ensureUniqueSlug, generateSlug } from '@/lib/utils/slug'
import type { Database, Json } from '@/types/database'

type PostUpdate = Database['public']['Tables']['posts']['Update']

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = UpdatePostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data: existing, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, slug')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle<{ id: string; title: string; slug: string }>()
    if (fetchError) throw fetchError
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const { category_ids, slug: providedSlug, content, title, ...rest } = parsed.data

    const patch: PostUpdate = { ...rest }
    if (title !== undefined) patch.title = title
    if (content !== undefined) {
      patch.content = content as Json
      patch.reading_time = calculateReadingTime(content)
    }

    // Regenera slug se title mudou OU se slug foi enviado explicitamente.
    const titleChanged = title !== undefined && title !== existing.title
    if (providedSlug !== undefined || titleChanged) {
      const base = generateSlug(providedSlug ?? title ?? existing.title)
      if (!base) {
        return NextResponse.json(
          { error: 'Unable to derive slug' },
          { status: 422 }
        )
      }
      patch.slug = await ensureUniqueSlug(supabase, base, id)
    }

    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError

    if (category_ids !== undefined) {
      const { error: delError } = await supabase
        .from('post_categories')
        .delete()
        .eq('post_id', id)
      if (delError) throw delError

      if (category_ids.length > 0) {
        const { error: insError } = await supabase
          .from('post_categories')
          .insert(
            category_ids.map((cid) => ({ post_id: id, category_id: cid }))
          )
        if (insError) throw insError
      }
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[PATCH /api/admin/posts/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle<{ id: string }>()
    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ data: { id: data.id } })
  } catch (error) {
    console.error('[DELETE /api/admin/posts/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
