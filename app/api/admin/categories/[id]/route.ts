import { NextResponse, type NextRequest } from 'next/server'

import { UpdateCategorySchema } from '@/lib/schemas/category'
import { createClient } from '@/lib/supabase/server'
import { ensureUniqueCategorySlug, generateSlug } from '@/lib/utils/slug'
import type { Database } from '@/types/database'

type CategoryUpdate = Database['public']['Tables']['categories']['Update']

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
    const parsed = UpdateCategorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data: existing, error: fetchError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('id', id)
      .maybeSingle()
    if (fetchError) throw fetchError
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const patch: CategoryUpdate = {}
    if (parsed.data.name !== undefined) patch.name = parsed.data.name
    if (parsed.data.color !== undefined) patch.color = parsed.data.color

    const nameChanged =
      parsed.data.name !== undefined && parsed.data.name !== existing.name
    if (parsed.data.slug !== undefined || nameChanged) {
      const base = generateSlug(parsed.data.slug ?? parsed.data.name ?? existing.name)
      if (!base) {
        return NextResponse.json(
          { error: 'Unable to derive slug' },
          { status: 422 }
        )
      }
      patch.slug = await ensureUniqueCategorySlug(supabase, base, id)
    }

    const { data, error } = await supabase
      .from('categories')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[PATCH /api/admin/categories/[id]]', error)
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

    // Verifica vínculos com posts
    const { count, error: countError } = await supabase
      .from('post_categories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
    if (countError) throw countError

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error: `Remova de ${count} ${count === 1 ? 'post' : 'posts'} antes de deletar a categoria.`,
          code: 'category_in_use',
          details: { postsCount: count },
        },
        { status: 422 }
      )
    }

    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ data: { id: data.id } })
  } catch (error) {
    console.error('[DELETE /api/admin/categories/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
