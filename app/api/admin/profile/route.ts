import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

import { UpdateProfileSchema } from '@/lib/schemas/profile'
import { createClient } from '@/lib/supabase/server'

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
      .from('profile')
      .select('id, name, avatar_url, bio, blog_title, blog_description')
      .eq('id', user.id)
      .maybeSingle()
    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[GET /api/admin/profile]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = UpdateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('profile')
      .update({
        name: parsed.data.name,
        avatar_url: parsed.data.avatar_url,
        bio: parsed.data.bio ?? null,
        blog_title: parsed.data.blog_title,
        blog_description: parsed.data.blog_description ?? null,
      })
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error

    // Header público e outras páginas leem profile — invalida cache.
    revalidatePath('/')

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[PATCH /api/admin/profile]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
