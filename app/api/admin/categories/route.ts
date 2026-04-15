import { NextResponse, type NextRequest } from 'next/server'

import { CreateCategorySchema } from '@/lib/schemas/category'
import { createClient } from '@/lib/supabase/server'
import { ensureUniqueCategorySlug, generateSlug } from '@/lib/utils/slug'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, color, created_at, updated_at, post_categories(count)')
      .order('name')
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[GET /api/admin/categories]', error)
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
    const parsed = CreateCategorySchema.safeParse(body)
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
    const slug = await ensureUniqueCategorySlug(supabase, base)

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: parsed.data.name, slug, color: parsed.data.color })
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/categories]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

