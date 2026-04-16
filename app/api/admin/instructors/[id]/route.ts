import { NextResponse, type NextRequest } from 'next/server'

import { UpdateInstructorSchema } from '@/lib/schemas/instructor'
import { createClient } from '@/lib/supabase/server'
import { ensureUniqueInstructorSlug, generateSlug } from '@/lib/utils/slug'
import type { Database } from '@/types/database'

type InstructorUpdate = Database['public']['Tables']['instructors']['Update']

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
    const parsed = UpdateInstructorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data: existing, error: fetchError } = await supabase
      .from('instructors')
      .select('id, name, slug')
      .eq('id', id)
      .maybeSingle()
    if (fetchError) throw fetchError
    if (!existing) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    const patch: InstructorUpdate = {}
    if (parsed.data.name !== undefined) patch.name = parsed.data.name
    if (parsed.data.avatar_url !== undefined) patch.avatar_url = parsed.data.avatar_url
    if (parsed.data.bio !== undefined) patch.bio = parsed.data.bio ?? null

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
      patch.slug = await ensureUniqueInstructorSlug(supabase, base, id)
    }

    const { data, error } = await supabase
      .from('instructors')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[PATCH /api/admin/instructors/[id]]', error)
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

    // Verifica vínculos com posts (não-deletados)
    const { count, error: countError } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('instructor_id', id)
      .is('deleted_at', null)
    if (countError) throw countError

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error: `Remova o vínculo de ${count} ${count === 1 ? 'post' : 'posts'} antes de deletar o instrutor.`,
          code: 'instructor_in_use',
          details: { postsCount: count },
        },
        { status: 422 }
      )
    }

    const { data, error } = await supabase
      .from('instructors')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    return NextResponse.json({ data: { id: data.id } })
  } catch (error) {
    console.error('[DELETE /api/admin/instructors/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
