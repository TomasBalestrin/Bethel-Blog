import { NextResponse, type NextRequest } from 'next/server'

import { CreateInstructorSchema } from '@/lib/schemas/instructor'
import { createClient } from '@/lib/supabase/server'
import { ensureUniqueInstructorSlug, generateSlug } from '@/lib/utils/slug'

const MAX_Q_LENGTH = 100

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawQ = request.nextUrl.searchParams.get('q')?.trim() ?? ''
    const q = rawQ.slice(0, MAX_Q_LENGTH)

    let query = supabase
      .from('instructors')
      .select('id, name, slug, avatar_url, bio, created_at, updated_at')
      .order('name', { ascending: true })

    if (q) {
      query = query.ilike('name', `%${q}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[GET /api/admin/instructors]', error)
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
    const parsed = CreateInstructorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const base = generateSlug(parsed.data.slug ?? parsed.data.name)
    if (!base) {
      return NextResponse.json(
        { error: 'Unable to derive slug' },
        { status: 422 }
      )
    }
    const slug = await ensureUniqueInstructorSlug(supabase, base)

    const { data, error } = await supabase
      .from('instructors')
      .insert({
        name: parsed.data.name,
        slug,
        avatar_url: parsed.data.avatar_url,
        bio: parsed.data.bio ?? null,
      })
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/instructors]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
