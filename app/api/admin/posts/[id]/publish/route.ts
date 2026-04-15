import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, slug, cover_url, status')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle<{
        id: string
        slug: string
        cover_url: string | null
        status: 'draft' | 'scheduled' | 'published' | 'archived'
      }>()
    if (fetchError) throw fetchError
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (!post.cover_url) {
      return NextResponse.json(
        { error: 'Capa (cover_url) é obrigatória pra publicar' },
        { status: 422 }
      )
    }

    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError

    revalidatePath('/')
    revalidatePath(`/p/${post.slug}`)

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[POST /api/admin/posts/[id]/publish]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
